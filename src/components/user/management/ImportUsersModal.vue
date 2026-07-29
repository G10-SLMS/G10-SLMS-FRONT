<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-white/45 p-4"
      @click.self="handleBackdropClick"
    >
      <div class="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="m-0 text-lg font-semibold text-gray-900">Import Users from Excel</h2>
          <button
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border-none bg-transparent text-gray-400 cursor-pointer hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
            @click="handleClose"
          >
            <X :size="18" :stroke-width="1.8" />
          </button>
        </div>

        <!-- Step 1/2: pick a file -->
        <template v-if="!result">
          <p class="mb-4 text-[13px] text-gray-500">
            Upload an Excel (.xlsx, .xls) or CSV file with your users. Not sure about the format?
            <button
              type="button"
              class="border-none bg-transparent p-0 font-medium text-blue-600 underline cursor-pointer hover:text-blue-700"
              :disabled="downloadingTemplate"
              @click="downloadTemplate"
            >
              {{ downloadingTemplate ? 'Preparing…' : 'Download the template' }}
            </button>
          </p>

          <div v-if="errorMsg" class="mb-3.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {{ errorMsg }}
          </div>

          <div
            class="relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-7 text-center transition-colors"
            :class="isDragging ? 'border-blue-400 bg-blue-50/60' : 'border-gray-300 bg-gray-50 hover:border-blue-300'"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
          >
            <input
              ref="fileInputRef"
              type="file"
              class="sr-only"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              @change="handleFileSelect"
            />

            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
              <FileSpreadsheet :size="22" :stroke-width="1.5" />
            </div>

            <template v-if="selectedFile">
              <p class="m-0 text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
              <p class="m-0 text-xs text-gray-400">{{ formatSize(selectedFile.size) }}</p>
              <button
                type="button"
                class="mt-1 rounded-md border-none bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-300"
                @click="triggerBrowse"
              >
                Choose a different file
              </button>
            </template>
            <template v-else>
              <p class="m-0 text-sm text-gray-600">
                <button
                  type="button"
                  class="border-none bg-transparent p-0 font-semibold text-blue-600 cursor-pointer hover:text-blue-700"
                  @click="triggerBrowse"
                >Click to upload</button>
                &nbsp;or drag and drop
              </p>
              <p class="m-0 text-xs text-gray-400">XLSX, XLS, or CSV — up to 5MB</p>
            </template>
          </div>

          <div class="mt-5 flex justify-end gap-2.5">
            <button
              class="rounded-md border-none bg-gray-100 px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="uploading"
              @click="handleClose"
            >Cancel</button>
            <button
              class="inline-flex items-center gap-2 rounded-md border-none bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer hover:enabled:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!selectedFile || uploading"
              @click="submitImport"
            >
              <LoaderCircle v-if="uploading" :size="15" :stroke-width="2" class="animate-spin" />
              {{ uploading ? 'Importing…' : 'Import Users' }}
            </button>
          </div>
        </template>

        <!-- Step 3: summary -->
        <template v-else>
          <div class="mb-4 grid grid-cols-3 gap-2.5">
            <div class="rounded-lg bg-green-50 px-3 py-3 text-center">
              <p class="m-0 text-xl font-bold text-green-700">{{ result.summary.successful }}</p>
              <p class="m-0 text-xs text-green-700">Imported</p>
            </div>
            <div class="rounded-lg bg-amber-50 px-3 py-3 text-center">
              <p class="m-0 text-xl font-bold text-amber-700">{{ result.summary.skipped }}</p>
              <p class="m-0 text-xs text-amber-700">Skipped</p>
            </div>
            <div class="rounded-lg bg-red-50 px-3 py-3 text-center">
              <p class="m-0 text-xl font-bold text-red-700">{{ result.summary.failed }}</p>
              <p class="m-0 text-xs text-red-700">Failed</p>
            </div>
          </div>

          <div v-if="result.results.failed.length" class="mb-4">
            <h3 class="mb-2 text-[13px] font-semibold text-gray-700">Failed rows</h3>
            <ul class="m-0 flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-md border border-red-100 bg-red-50/50 p-3 text-[12.5px] text-red-700">
              <li v-for="row in result.results.failed" :key="`failed-${row.row}`">
                Row {{ row.row }}{{ row.email ? ` (${row.email})` : '' }}: {{ row.errors.join(' ') }}
              </li>
            </ul>
          </div>

          <div v-if="result.results.skipped.length" class="mb-4">
            <h3 class="mb-2 text-[13px] font-semibold text-gray-700">Skipped rows</h3>
            <ul class="m-0 flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-md border border-amber-100 bg-amber-50/50 p-3 text-[12.5px] text-amber-700">
              <li v-for="row in result.results.skipped" :key="`skipped-${row.row}`">
                Row {{ row.row }}{{ row.email ? ` (${row.email})` : '' }}: {{ row.reason }}
              </li>
            </ul>
          </div>

          <p v-if="result.summary.successful > 0" class="mb-4 rounded-md bg-blue-50 px-3 py-2 text-[12.5px] text-blue-700">
            New accounts were created with the default password. Share it with each new user so they can log in and change it.
          </p>

          <div class="flex justify-end gap-2.5">
            <button
              class="rounded-md border-none bg-gray-100 px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-200"
              @click="reset"
            >Import Another File</button>
            <button
              class="rounded-md border-none bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-blue-700"
              @click="handleDone"
            >Done</button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X, FileSpreadsheet, LoaderCircle } from 'lucide-vue-next'
import type { ImportUsersResult } from '@/types/user'
import { userService } from '@/services/userService'
import { extractErrorMessage } from '@/utils/errors'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'imported', result: ImportUsersResult): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const downloadingTemplate = ref(false)
const errorMsg = ref('')
const result = ref<ImportUsersResult | null>(null)

function triggerBrowse() {
  fileInputRef.value?.click()
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) selectedFile.value = input.files[0]
  input.value = ''
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) selectedFile.value = file
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function downloadTemplate() {
  downloadingTemplate.value = true
  errorMsg.value = ''
  try {
    await userService.downloadImportTemplate()
  } catch (err) {
    errorMsg.value = extractErrorMessage(err, 'Failed to download the template.')
  } finally {
    downloadingTemplate.value = false
  }
}

async function submitImport() {
  if (!selectedFile.value) return

  uploading.value = true
  errorMsg.value = ''

  try {
    const res = await userService.importUsers(selectedFile.value)
    result.value = res
    emit('imported', res)
  } catch (err) {
    errorMsg.value = extractErrorMessage(err, 'Failed to import users. Please check the file and try again.')
  } finally {
    uploading.value = false
  }
}

function reset() {
  selectedFile.value = null
  result.value = null
  errorMsg.value = ''
}

function handleBackdropClick() {
  if (uploading.value) return
  handleClose()
}

function handleClose() {
  if (uploading.value) return
  reset()
  emit('close')
}

function handleDone() {
  reset()
  emit('close')
}
</script>
