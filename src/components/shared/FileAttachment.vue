<template>
  <div class="flex flex-col gap-2">
    <!-- Label -->
    <label v-if="label" :for="`${uid}-file-input`" class="text-sm font-semibold text-slate-700">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Drop zone -->
    <div
      class="relative cursor-pointer rounded-xl border-2 border-dashed p-7 text-center transition-all duration-150"
      :class="[
        isDragging
          ? 'border-emerald-400 bg-emerald-50/60 shadow-sm'
          : errorMessage
            ? 'border-red-400 bg-red-50/30'
            : 'border-slate-300 bg-white hover:border-emerald-300 hover:bg-emerald-50/30',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerBrowse"
    >
      <input
        ref="fileInputRef"
        :id="`${uid}-file-input`"
        type="file"
        class="sr-only"
        tabindex="-1"
        :accept="acceptAttr"
        :multiple="multiple"
        @change="handleFileSelect"
      />

      <div class="flex flex-col items-center gap-1.5">
        <div
          class="mb-1 flex h-12 w-12 items-center justify-center rounded-xl"
          :class="isDragging ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'"
        >
          <Upload :size="22" :stroke-width="1.5" />
        </div>
        <p class="text-sm text-slate-600">
          <strong class="font-semibold text-emerald-700">Click to upload</strong>
          &nbsp;or drag and drop
        </p>
        <p class="text-xs text-slate-400">
          {{ acceptedLabel }} — up to {{ maxSizeLabel }}
        </p>
      </div>
    </div>

    <!-- Error message -->
    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <p v-if="errorMessage" class="m-0 flex items-center gap-1.5 text-xs font-medium text-red-600">
        <AlertCircle :size="13" :stroke-width="2" />
        {{ errorMessage }}
      </p>
    </Transition>

    <!-- File list / previews -->
    <TransitionGroup
      v-if="files.length"
      tag="ul"
      class="m-0 flex list-none flex-col gap-2 p-0"
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="translate-y-1 opacity-0"
      leave-to-class="translate-y-1 opacity-0"
    >
      <li
        v-for="item in files"
        :key="item.id"
        class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 shadow-sm transition-shadow hover:shadow-sm"
      >
        <!-- Preview thumbnail -->
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg"
          :class="item.file.type.startsWith('image/') ? '' : 'bg-slate-100'"
        >
          <img
            v-if="item.previewUrl"
            :src="item.previewUrl"
            class="h-full w-full object-cover"
            alt=""
          />
          <component
            v-else
            :is="iconFor(item.file.type)"
            :size="20"
            :stroke-width="1.5"
            class="text-slate-500"
          />
        </div>

        <!-- File info -->
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-slate-900">{{ item.file.name }}</p>
          <p class="text-xs text-slate-400">{{ formatSize(item.file.size) }}</p>

          <!-- Progress bar -->
          <div
            v-if="item.status === 'uploading'"
            class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <div
              class="h-full rounded-full bg-emerald-500 transition-all duration-300 ease-out"
              :style="{ width: item.progress + '%' }"
            />
          </div>

          <!-- Status labels -->
          <Transition
            enter-active-class="transition-opacity duration-150"
            leave-active-class="transition-opacity duration-150"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
          >
            <span v-if="item.status === 'done'" class="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 :size="12" :stroke-width="2" />
              Uploaded
            </span>
            <span v-else-if="item.status === 'error'" class="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600">
              <AlertCircle :size="12" :stroke-width="2" />
              {{ item.errorMessage }}
            </span>
          </Transition>
        </div>

        <!-- Remove button -->
        <button
          type="button"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
          :disabled="item.status === 'uploading'"
          @click.stop="removeFile(item.id)"
          aria-label="Remove file"
        >
          <Trash2 :size="14" :stroke-width="2" />
        </button>
      </li>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useId, type Component } from 'vue'
import { Upload, FileText, FileImage, Trash2, CheckCircle2, AlertCircle } from 'lucide-vue-next'

interface UploadItem {
  id: string
  file: File
  previewUrl: string | null
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress: number
  errorMessage: string | null
}

const props = withDefaults(
  defineProps<{
    label?: string
    required?: boolean
    multiple?: boolean
    maxSizeMb?: number
    accept?: string[]
  }>(),
  {
    multiple: true,
    maxSizeMb: 5,
    accept: () => ['pdf', 'docx', 'png', 'jpg'],
  }
)

const emit = defineEmits<{
  'update:files': [files: File[]]
  uploaded: [file: File]
  error: [message: string]
}>()

const uid = useId()

const MIME_MAP: Record<string, string[]> = {
  pdf: ['application/pdf'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  png: ['image/png'],
  jpg: ['image/jpeg', 'image/jpg'],
}

const ICON_MAP: Record<string, Component> = {
  'application/pdf': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
  'image/png': FileImage,
  'image/jpeg': FileImage,
  'image/jpg': FileImage,
}

const files = ref<UploadItem[]>([])
const isDragging = ref(false)
const errorMessage = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const acceptAttr = computed(() =>
  props.accept.flatMap(ext => MIME_MAP[ext] ?? []).join(',')
)

const acceptedLabel = computed(() =>
  props.accept.map(ext => ext.toUpperCase()).join(', ')
)

const maxSizeLabel = computed(() => `${props.maxSizeMb}MB`)

function triggerBrowse() {
  fileInputRef.value?.click()
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) processFiles(Array.from(input.files))
  input.value = ''
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) processFiles(Array.from(e.dataTransfer.files))
}

function processFiles(selected: File[]) {
  errorMessage.value = ''

  if (!props.multiple) files.value = []

  for (const file of selected) {
    const validation = validateFile(file)
    if (!validation.valid) {
      errorMessage.value = validation.message
      emit('error', validation.message)
      continue
    }

    const item: UploadItem = {
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      status: 'pending',
      progress: 0,
      errorMessage: null,
    }

    files.value.push(item)
    mockUpload(item)
  }

  emitFiles()
}

function validateFile(file: File): { valid: boolean; message: string } {
  const allowedMimes = props.accept.flatMap(ext => MIME_MAP[ext] ?? [])
  if (!allowedMimes.includes(file.type)) {
    return {
      valid: false,
      message: `"${file.name}" is not an accepted file type. Allowed: ${acceptedLabel.value}.`,
    }
  }

  const maxBytes = props.maxSizeMb * 1024 * 1024
  if (file.size > maxBytes) {
    return {
      valid: false,
      message: `"${file.name}" exceeds the ${maxSizeLabel.value} size limit.`,
    }
  }

  return { valid: true, message: '' }
}

function mockUpload(item: UploadItem) {
  item.status = 'uploading'
  const interval = setInterval(() => {
    item.progress += Math.random() * 25
    if (item.progress >= 100) {
      item.progress = 100
      item.status = 'done'
      clearInterval(interval)
      emit('uploaded', item.file)
    }
  }, 200)
}

/*
// Real upload — swap in once backend endpoint exists
async function realUpload(item: UploadItem) {
  item.status = 'uploading'
  const formData = new FormData()
  formData.append('file', item.file)
  try {
    await uploadService.uploadFile(formData, {
      onUploadProgress: (e) => {
        item.progress = Math.round((e.loaded / (e.total ?? 1)) * 100)
      },
    })
    item.status = 'done'
    emit('uploaded', item.file)
  } catch (err) {
    item.status = 'error'
    item.errorMessage = 'Upload failed. Try again.'
  }
}
*/

function removeFile(id: string) {
  const item = files.value.find(f => f.id === id)
  if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
  files.value = files.value.filter(f => f.id !== id)
  emitFiles()
}

function emitFiles() {
  emit('update:files', files.value.map(f => f.file))
}

function iconFor(mime: string) {
  return ICON_MAP[mime] ?? FileText
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<style scoped>
/* No custom CSS needed — all styling via Tailwind utilities */
</style>
