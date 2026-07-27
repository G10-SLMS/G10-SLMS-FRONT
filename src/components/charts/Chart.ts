

export type ChartType = 'bar' | 'line' | 'donut'

export interface ChartDataset {
  label: string
  data: number[]
  /** CSS color for this dataset. Falls back to the default palette. */
  color?: string
}

export interface ChartConfig {
  type: ChartType
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartHoverInfo {
  datasetIndex: number
  index: number
  label: string
  value: number
  color: string
  /** Pixel position of the hovered point, relative to the canvas. */
  x: number
  y: number
}

const DEFAULT_PALETTE = ['#2563eb', '#f59e0b', '#16a34a', '#dc2626', '#06b6d4', '#8b5cf6']

const FONT = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

// Canvas pixels aren't reachable by CSS, so grid/axis/text colors are picked
// here based on the current theme rather than left hardcoded to light mode.
const THEME_COLORS = {
  light: { grid: '#f1f5f9', axisText: '#9ca3af', emptyText: '#9ca3af', donutTotal: '#374151' },
  dark: { grid: '#334155', axisText: '#64748b', emptyText: '#64748b', donutTotal: '#f1f5f9' },
}

export class ChartRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private config: ChartConfig
  private resizeObserver: ResizeObserver
  private onHover?: (info: ChartHoverInfo | null) => void
  private points: Array<{ x: number; y: number; info: ChartHoverInfo }> = []
  private raf: number | null = null
  private themeObserver: MutationObserver

  constructor(
    canvas: HTMLCanvasElement,
    config: ChartConfig,
    onHover?: (info: ChartHoverInfo | null) => void,
  ) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Chart.ts: canvas 2D context is not available')

    this.canvas = canvas
    this.ctx = ctx
    this.config = config
    this.onHover = onHover

    this.canvas.addEventListener('mousemove', this.handlePointerMove)
    this.canvas.addEventListener('mouseleave', this.handlePointerLeave)

    this.resizeObserver = new ResizeObserver(() => this.scheduleDraw())
    this.resizeObserver.observe(this.canvas)

    // Re-paint whenever the `dark` class toggles on <html>, since the canvas
    // grid/axis colors are baked into pixels and can't respond to CSS alone.
    this.themeObserver = new MutationObserver(() => this.scheduleDraw())
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    this.scheduleDraw()
  }

  private themeColors() {
    return document.documentElement.classList.contains('dark')
      ? THEME_COLORS.dark
      : THEME_COLORS.light
  }

  update(config: ChartConfig) {
    this.config = config
    this.scheduleDraw()
  }

  destroy() {
    this.resizeObserver.disconnect()
    this.themeObserver.disconnect()
    this.canvas.removeEventListener('mousemove', this.handlePointerMove)
    this.canvas.removeEventListener('mouseleave', this.handlePointerLeave)
    if (this.raf !== null) cancelAnimationFrame(this.raf)
  }

  private scheduleDraw() {
    // Coalesce rapid resize/update events into a single draw per frame.
    if (this.raf !== null) cancelAnimationFrame(this.raf)
    this.raf = requestAnimationFrame(() => this.draw())
  }

  private resizeForDPI(): { width: number; height: number } {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const width = Math.max(rect.width, 1)
    const height = Math.max(rect.height, 1)

    this.canvas.width = Math.round(width * dpr)
    this.canvas.height = Math.round(height * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    return { width, height }
  }

  private draw() {
    const { width, height } = this.resizeForDPI()
    const ctx = this.ctx
    ctx.clearRect(0, 0, width, height)
    this.points = []

    const { type, labels, datasets } = this.config
    if (!labels.length || !datasets.length) {
      this.drawEmpty(width, height)
      return
    }

    if (type === 'donut') {
      this.drawDonut(width, height)
    } else if (type === 'line') {
      this.drawCartesian(width, height, true)
    } else {
      this.drawCartesian(width, height, false)
    }
  }

  private drawEmpty(width: number, height: number) {
    const ctx = this.ctx
    ctx.fillStyle = this.themeColors().emptyText
    ctx.font = FONT
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('No data available', width / 2, height / 2)
  }

  private colorFor(datasetIndex: number, dataset: ChartDataset) {
    return dataset.color || DEFAULT_PALETTE[datasetIndex % DEFAULT_PALETTE.length]
  }

  private drawCartesian(width: number, height: number, isLine: boolean) {
    const ctx = this.ctx
    const { labels, datasets } = this.config

    const paddingLeft = 34
    const paddingBottom = 20
    const paddingTop = 10
    const paddingRight = 10

    const chartWidth = Math.max(width - paddingLeft - paddingRight, 1)
    const chartHeight = Math.max(height - paddingTop - paddingBottom, 1)

    const maxValue = Math.max(1, ...datasets.flatMap((d) => d.data))
    const steps = 4
    const stepValue = maxValue / steps

    // Gridlines + y-axis labels
    const theme = this.themeColors()
    ctx.strokeStyle = theme.grid
    ctx.fillStyle = theme.axisText
    ctx.font = FONT
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = 1

    for (let i = 0; i <= steps; i++) {
      const y = paddingTop + chartHeight - (chartHeight * i) / steps
      ctx.beginPath()
      ctx.moveTo(paddingLeft, y)
      ctx.lineTo(width - paddingRight, y)
      ctx.stroke()
      ctx.fillText(String(Math.round(stepValue * i)), paddingLeft - 8, y)
    }

    // X-axis labels
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const slotWidth = chartWidth / labels.length
    labels.forEach((label, i) => {
      const x = paddingLeft + slotWidth * i + slotWidth / 2
      ctx.fillText(this.truncateLabel(label), x, paddingTop + chartHeight + 6)
    })

    if (isLine) {
      datasets.forEach((dataset, datasetIndex) => {
        const color = this.colorFor(datasetIndex, dataset)
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()

        dataset.data.forEach((value, i) => {
          const x = paddingLeft + slotWidth * i + slotWidth / 2
          const y = paddingTop + chartHeight - (value / maxValue) * chartHeight
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()

        dataset.data.forEach((value, i) => {
          const x = paddingLeft + slotWidth * i + slotWidth / 2
          const y = paddingTop + chartHeight - (value / maxValue) * chartHeight
          ctx.beginPath()
          ctx.fillStyle = color
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.fill()

          this.points.push({
            x,
            y,
            info: { datasetIndex, index: i, label: labels[i], value, color, x, y },
          })
        })
      })
    } else {
      const groupCount = datasets.length
      const groupPadding = slotWidth * 0.2
      const barGap = 4
      const barWidth = Math.max(
        (slotWidth - groupPadding * 2 - barGap * (groupCount - 1)) / groupCount,
        2,
      )

      datasets.forEach((dataset, datasetIndex) => {
        const color = this.colorFor(datasetIndex, dataset)
        ctx.fillStyle = color

        dataset.data.forEach((value, i) => {
          const groupStart = paddingLeft + slotWidth * i + groupPadding
          const x = groupStart + datasetIndex * (barWidth + barGap)
          const barHeight = (value / maxValue) * chartHeight
          const y = paddingTop + chartHeight - barHeight

          this.roundedRect(x, y, barWidth, barHeight, 3)
          ctx.fill()

          const px = x + barWidth / 2
          this.points.push({
            x: px,
            y,
            info: { datasetIndex, index: i, label: labels[i], value, color, x: px, y },
          })
        })
      })
    }
  }

  private drawDonut(width: number, height: number) {
    const ctx = this.ctx
    const { labels, datasets } = this.config
    const dataset = datasets[0]
    const total = dataset.data.reduce((sum, v) => sum + v, 0)

    const cx = width / 2
    const cy = height / 2
    const radius = Math.min(width, height) / 2 - 8
    const innerRadius = radius * 0.6

    if (total <= 0) {
      this.drawEmpty(width, height)
      return
    }

    let startAngle = -Math.PI / 2

    dataset.data.forEach((value, i) => {
      const color = DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]
      const sliceAngle = (value / total) * Math.PI * 2
      const endAngle = startAngle + sliceAngle
      const midAngle = (startAngle + endAngle) / 2

      ctx.beginPath()
      ctx.fillStyle = color
      ctx.moveTo(cx + Math.cos(startAngle) * innerRadius, cy + Math.sin(startAngle) * innerRadius)
      ctx.arc(cx, cy, radius, startAngle, endAngle)
      ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fill()

      const labelRadius = (radius + innerRadius) / 2
      const px = cx + Math.cos(midAngle) * labelRadius
      const py = cy + Math.sin(midAngle) * labelRadius
      this.points.push({
        x: px,
        y: py,
        info: { datasetIndex: 0, index: i, label: labels[i], value, color, x: px, y: py },
      })

      startAngle = endAngle
    })

    const theme = this.themeColors()
    ctx.fillStyle = theme.donutTotal
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(total), cx, cy - 6)
    ctx.font = FONT
    ctx.fillStyle = theme.axisText
    ctx.fillText('total', cx, cy + 10)
  }

  private roundedRect(x: number, y: number, w: number, h: number, radius: number) {
    const ctx = this.ctx
    const r = Math.min(radius, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x, y + h)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }

  private truncateLabel(label: string, max = 8) {
    return label.length > max ? `${label.slice(0, max - 1)}…` : label
  }

  private handlePointerMove = (event: MouseEvent) => {
    if (!this.onHover || !this.points.length) return

    const rect = this.canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    let closest = this.points[0]
    let closestDist = Infinity

    for (const point of this.points) {
      const dist = Math.hypot(point.x - x, point.y - y)
      if (dist < closestDist) {
        closestDist = dist
        closest = point
      }
    }

    const threshold = this.config.type === 'donut' ? Infinity : 24
    this.onHover(closestDist <= threshold ? closest.info : null)
  }

  private handlePointerLeave = () => {
    this.onHover?.(null)
  }
}
