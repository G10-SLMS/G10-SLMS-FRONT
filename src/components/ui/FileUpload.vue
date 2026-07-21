<template>
  <div class="w-full">
    <!-- Drop zone -->
    <div
      class="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors sm:p-8"
      :class="[
        isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-gray-50',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50',
      ]"
      role="button"
      tabindex="0"
      :aria-disabled="disabled"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragEnter"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="openBrowser"
      @keydown.enter="openBrowser"
      @keydown.space.prevent="openBrowser"
    >
      <input
        ref="inputRef"
        type="file"
        class="hidden"
        :multiple="multiple"
        :accept="acceptAttr"
        :disabled="disabled"
        @change="onInputChange"
        @click.stop
      />

      <div class="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
        <UploadCloud :size="22" />
      </div>

      <p class="text-sm font-medium text-gray-700">
        <span class="text-indigo-600">Click to browse</span>
        <span class="hidden sm:inline"> or drag & drop</span>
      </p>

      <p class="text-xs text-gray-400">
        {{ acceptLabel }} &middot; up to {{ maxSizeMB }}MB{{ multiple ? ` \u00b7 up to ${maxFiles} files` : '' }}
      </p>
    </div>

    <!-- Global validation error (e.g. too many files) -->
    <p v-if="globalError" class="mt-2 flex items-center gap-1.5 text-xs text-red-600">
      <AlertCircle :size="14" class="shrink-0" /> {{ globalError }}
    </p>

    <!-- File preview list -->
    <ul v-if="items.length" class="mt-3 flex flex-col gap-2">
      <li
        v-for="item in items"
        :key="item.id"
        class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
      >
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md" :class="iconBg(item)">
          <component :is="iconFor(item)" :size="18" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <p class="truncate text-sm font-medium text-gray-800">{{ item.file.name }}</p>
            <span class="shrink-0 text-xs text-gray-400">{{ formatFileSize(item.file.size) }}</span>
          </div>

          <p v-if="item.status === 'error'" class="mt-0.5 truncate text-xs text-red-600">
            {{ item.error }}
          </p>
          <div
            v-else-if="item.status === 'uploading'"
            class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
          >
            <div
              class="h-full rounded-full bg-indigo-500 transition-all duration-150 ease-out"
              :style="{ width: item.progress + '%' }"
            />
          </div>
          <p v-else-if="item.status === 'success'" class="mt-0.5 flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 :size="12" /> Uploaded
          </p>
        </div>

        <button
          type="button"
          class="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Remove file"
          @click="removeItem(item.id)"
        >
          <X :size="16" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { UploadCloud, FileText, Image as ImageIcon, X, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { formatFileSize } from '@/utils/formatters'
import type { AcceptedFileExt, UploadItem } from '@/types/attachment'

const props = withDefaults(
  defineProps<{
    /** Currently accepted (successfully "uploaded") files — supports v-model */
    modelValue?: File[]
    /** Allow selecting/dropping more than one file */
    multiple?: boolean
    /** Max number of files allowed at once (ignored when multiple is false) */
    maxFiles?: number
    /** Max size per file, in MB */
    maxSizeMB?: number
    /** Accepted file extensions */
    accept?: AcceptedFileExt[]
    disabled?: boolean
    /** Simulate an upload with a fake progress bar instead of hitting a real endpoint */
    mockUpload?: boolean
  }>(),
  {
    modelValue: () => [],
    multiple: true,
    maxFiles: 5,
    maxSizeMB: 5,
    accept: () => ['pdf', 'docx', 'png', 'jpg'],
    disabled: false,
    mockUpload: true,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', files: File[]): void
  (e: 'uploaded', file: File): void
  (e: 'removed', file: File): void
  (e: 'error', message: string): void
}>()

const MIME_MAP: Record<AcceptedFileExt, string[]> = {
  pdf: ['application/pdf'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  png: ['image/png'],
  jpg: ['image/jpeg'],
}

const items = ref<UploadItem[]>([])
const isDragging = ref(false)
const globalError = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

let dragCounter = 0
let idCounter = 0

const acceptedExts = computed(() => props.accept)
const acceptAttr = computed(() => acceptedExts.value.flatMap((ext) => MIME_MAP[ext] ?? []).join(','))
const acceptLabel = computed(() => acceptedExts.value.map((ext) => ext.toUpperCase()).join(', '))

function extOf(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() ?? ''
}

function isImageExt(ext: string): boolean {
  return ext === 'png' || ext === 'jpg' || ext === 'jpeg'
}

function isAccepted(file: File): boolean {
  const ext = extOf(file) as AcceptedFileExt
  if (!acceptedExts.value.includes(ext)) return false
  const validMimes = MIME_MAP[ext]
  // Some browsers/OSes report an empty mime type for certain files — fall back to extension check.
  return !validMimes?.length || file.type === '' || validMimes.includes(file.type)
}

function openBrowser() {
  if (props.disabled) return
  inputRef.value?.click()
}

function onDragEnter() {
  if (props.disabled) return
  dragCounter++
  isDragging.value = true
}

function onDragLeave() {
  if (props.disabled) return
  dragCounter = Math.max(0, dragCounter - 1)
  if (dragCounter === 0) isDragging.value = false
}

function onDrop(e: DragEvent) {
  if (props.disabled) return
  dragCounter = 0
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files?.length) handleFiles(Array.from(files))
}

function onInputChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.length) handleFiles(Array.from(target.files))
  target.value = '' // allow re-selecting the same file later
}

function handleFiles(incomingFiles: File[]) {
  globalError.value = ''

  let files = incomingFiles
  if (!props.multiple) {
    files = files.slice(0, 1)
    items.value = []
  }

  const remainingSlots = props.maxFiles - items.value.length
  if (remainingSlots <= 0) {
    globalError.value = `You can attach up to ${props.maxFiles} file${props.maxFiles === 1 ? '' : 's'}.`
    emit('error', globalError.value)
    return
  }

  const accepted = files.slice(0, remainingSlots)
  if (files.length > accepted.length) {
    globalError.value = `Only ${remainingSlots} more file${remainingSlots === 1 ? '' : 's'} can be added (max ${props.maxFiles}).`
  }

  for (const file of accepted) {
    const id = `f-${Date.now()}-${idCounter++}`

    if (!isAccepted(file)) {
      items.value.push({
        id,
        file,
        status: 'error',
        progress: 0,
        error: `Unsupported file type. Accepted: ${acceptLabel.value}.`,
      })
      continue
    }

    if (file.size > props.maxSizeMB * 1024 * 1024) {
      items.value.push({
        id,
        file,
        status: 'error',
        progress: 0,
        error: `File exceeds the ${props.maxSizeMB}MB limit.`,
      })
      continue
    }

    const isDuplicate = items.value.some(
      (it) => it.status !== 'error' && it.file.name === file.name && it.file.size === file.size,
    )
    if (isDuplicate) {
      items.value.push({ id, file, status: 'error', progress: 0, error: 'This file has already been added.' })
      continue
    }

    const item: UploadItem = { id, file, status: 'uploading', progress: 0 }
    items.value.push(item)
    startUpload(item)
  }
}

function startUpload(item: UploadItem) {
  if (!props.mockUpload) {
    item.status = 'success'
    item.progress = 100
    syncModelValue()
    emit('uploaded', item.file)
    return
  }

  // Mock upload: simulate network progress until it reaches 100%.
  const timer = window.setInterval(() => {
    item.progress = Math.min(100, item.progress + Math.random() * 25 + 10)
    if (item.progress >= 100) {
      window.clearInterval(timer)
      item.progress = 100
      item.status = 'success'
      syncModelValue()
      emit('uploaded', item.file)
    }
  }, 200)
}

function removeItem(id: string) {
  const item = items.value.find((it) => it.id === id)
  items.value = items.value.filter((it) => it.id !== id)
  if (item?.status === 'success') emit('removed', item.file)
  syncModelValue()
}

function syncModelValue() {
  const successful = items.value.filter((it) => it.status === 'success').map((it) => it.file)
  emit('update:modelValue', successful)
}

function iconFor(item: UploadItem) {
  if (item.status === 'error') return AlertCircle
  return isImageExt(extOf(item.file)) ? ImageIcon : FileText
}

function iconBg(item: UploadItem) {
  if (item.status === 'error') return 'bg-red-50 text-red-500'
  return isImageExt(extOf(item.file)) ? 'bg-purple-50 text-purple-500' : 'bg-indigo-50 text-indigo-500'
}

defineExpose({
  clear: () => {
    items.value = []
    syncModelValue()
  },
})
</script>
