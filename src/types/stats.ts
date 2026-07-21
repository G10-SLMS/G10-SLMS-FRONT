import type { Component } from 'vue'

export type StatCardColor = 'blue' | 'amber' | 'green' | 'red'

export interface StatCardProps {
  icon: Component | string
  label: string
  value: string | number
  color?: StatCardColor
}
