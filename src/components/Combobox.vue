<template>
  <div class="combobox" ref="containerRef">
    <div class="combobox-input-wrap" :class="{ 'is-open': isOpen }">
      <Briefcase v-if="icon" class="combobox-icon" :size="16" :stroke-width="1.8" />
      <input
        ref="inputRef"
        :value="displayText"
        type="text"
        class="combobox-input"
        :class="{ 'has-icon': !!icon }"
        :placeholder="computedPlaceholder"
        :disabled="disabled || isEmpty"
        @input="onInput"
        @focus="onFocus"
        @keydown="onKeydown"
        @blur="onBlur"
      />
      <button
        type="button"
        class="combobox-toggle"
        @click="toggleOpen"
        :disabled="disabled || isEmpty"
        tabindex="-1"
      >
        <ChevronDown class="toggle-icon" :size="16" :class="{ rotated: isOpen }" />
      </button>
    </div>

    <Transition name="dropdown">
      <div v-if="isOpen" class="combobox-dropdown">
        <!-- Loading -->
        <div v-if="isLoading" class="combobox-loading">
          Loading leave types...
        </div>

        <!-- Error -->
        <div v-else-if="fetchError" class="combobox-error-state">
          <span>{{ fetchError }}</span>
          <button type="button" class="combobox-retry" @click="retryFetch">Retry</button>
        </div>

        <!-- Empty state -->
        <div v-else-if="isEmpty" class="combobox-empty">
          No leave types available
        </div>

        <!-- Create new option -->
        <button
          v-else-if="showCreateOption"
          class="combobox-option create-option"
          @click="selectCustom"
          type="button"
        >
          <Plus :size="16" />
          <span>
            Add "<strong>{{ searchQuery }}</strong>" as custom leave type
          </span>
        </button>

        <!-- No matching results -->
        <div v-else-if="filteredOptions.length === 0" class="combobox-empty">
          No matching leave type found
        </div>

        <!-- Filtered options -->
        <button
          v-for="(option, index) in filteredOptions"
          :key="option.id"
          class="combobox-option"
          :class="{ highlighted: highlightedIndex === index, selected: option.id === selectedId }"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = index"
          type="button"
        >
          <Check v-if="option.id === selectedId" class="check-icon" :size="16" />
          <span :class="{ 'ml-6': option.id !== selectedId }">{{ option.name }}</span>
        </button>
      </div>
    </Transition>

    <!-- Validation error -->
    <div v-if="showValidationError" class="combobox-error">
      Please select or enter a leave type.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import api from '@/services/api'
import { Briefcase, ChevronDown, Plus, Check } from 'lucide-vue-next'

export interface ComboboxOption {
  id: number
  name: string
}

const props = withDefaults(defineProps<{
  modelValue: number | string | null
  options?: ComboboxOption[]
  placeholder?: string
  disabled?: boolean
  icon?: boolean
  editable?: boolean
  required?: boolean
  showError?: boolean
  initialValue?: number | string
}>(), {
  disabled: false,
  icon: false,
  editable: false,
  required: false,
  showError: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | string | null]
  'select': [option: ComboboxOption | null]
  'custom-text': [text: string]
}>()

// ─── State ─────────────────────────────────────
const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const customType = ref<string | null>(null)
const touched = ref(false)

// API state
const internalOptions = ref<ComboboxOption[]>([])
const isLoading = ref(false)
const fetchError = ref<string | null>(null)

const options = computed(() => {
  if (props.options !== undefined) return props.options
  return internalOptions.value
})

const selectedId = computed(() => {
  if (typeof props.modelValue === 'number') return props.modelValue
  return null
})

const selectedOption = computed(() => {
  return options.value.find((o) => o.id === selectedId.value) || null
})

const isEmpty = computed(() => !isLoading.value && options.value.length === 0)

const displayText = computed(() => {
  if (customType.value) return customType.value
  if (selectedOption.value) return selectedOption.value.name
  return searchQuery.value
})

const filteredOptions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return options.value
  return options.value.filter((o) => o.name.toLowerCase().includes(query))
})

const showCreateOption = computed(() => {
  if (!props.editable) return false
  const query = searchQuery.value.trim()
  if (!query) return false
  return !filteredOptions.value.some((o) => o.name.toLowerCase() === query.toLowerCase())
})

const computedPlaceholder = computed(() => {
  if (isEmpty.value) return 'No leave types available'
  return props.placeholder || ''
})

const showValidationError = computed(() => {
  const isEmptyValue = !selectedId.value && !customType.value
  if (!isEmptyValue) return false
  return props.showError || (props.required && touched.value)
})

// ─── API ───────────────────────────────────────
async function fetchLeaveTypes() {
  isLoading.value = true
  fetchError.value = null
  try {
    const response = await api.get('/leave-types')
    internalOptions.value = response.data as ComboboxOption[]
  } catch (e: unknown) {
    fetchError.value = 'Failed to load leave types'
  } finally {
    isLoading.value = false
  }
}

function retryFetch() {
  fetchLeaveTypes()
}

// ─── Methods ────────────────────────────────────
function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  searchQuery.value = value
  customType.value = null
  highlightedIndex.value = -1

  const exactMatch = options.value.find((o) => o.name.toLowerCase() === value.toLowerCase())

  if (exactMatch) {
    emit('update:modelValue', exactMatch.id)
    emit('select', exactMatch)
  } else if (!props.editable && value.trim()) {
    searchQuery.value = ''
    customType.value = null
    emit('update:modelValue', selectedId.value)
    emit('select', selectedOption.value)
    emit('custom-text', '')
    if (!isOpen.value) isOpen.value = true
    return
  } else {
    emit('update:modelValue', null)
    emit('select', null)
  }

  emit('custom-text', value)

  if (!isOpen.value) {
    isOpen.value = true
  }
}

function onFocus() {
  if (!isOpen.value) {
    isOpen.value = true
  }
}

function onBlur() {
  touched.value = true
  if (!props.editable && searchQuery.value.trim()) {
    const exactMatch = options.value.find((o) => o.name.toLowerCase() === searchQuery.value.trim().toLowerCase())
    if (!exactMatch) {
      searchQuery.value = ''
      customType.value = null
    }
  }
}

function toggleOpen() {
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

function openDropdown() {
  if (props.disabled || isEmpty.value) return
  isOpen.value = true
  highlightedIndex.value = -1
}

function closeDropdown() {
  isOpen.value = false
  highlightedIndex.value = -1
}

function selectOption(option: ComboboxOption) {
  customType.value = null
  searchQuery.value = ''
  emit('update:modelValue', option.id)
  emit('select', option)
  closeDropdown()
  inputRef.value?.focus()
}

function selectCustom() {
  customType.value = searchQuery.value.trim()
  emit('update:modelValue', null)
  emit('select', null)
  closeDropdown()
  inputRef.value?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (!isOpen.value) {
    if (event.key === 'ArrowDown' || event.key === 'Enter') {
      openDropdown()
      event.preventDefault()
    }
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        filteredOptions.value.length + (showCreateOption.value ? 0 : -1)
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
        selectOption(filteredOptions.value[highlightedIndex.value])
      } else if (showCreateOption.value) {
        selectCustom()
      }
      break
    case 'Escape':
      closeDropdown()
      break
  }
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

function syncSearchWithSelection() {
  if (selectedOption.value) {
    searchQuery.value = ''
    customType.value = null
  }
}

// Initial value support
watch(
  [() => props.initialValue, options],
  ([newInitial, opts]) => {
    if (newInitial == null || props.modelValue !== null) return
    if (typeof newInitial === 'number') {
      const found = opts.find((o) => o.id === newInitial)
      if (found) {
        emit('update:modelValue', found.id)
      }
    } else if (typeof newInitial === 'string') {
      customType.value = newInitial
      searchQuery.value = newInitial
    }
  },
  { immediate: true }
)

// Sync when modelValue changes externally
watch(
  () => props.modelValue,
  () => {
    syncSearchWithSelection()
  }
)

// Expose methods
function validate(): boolean {
  touched.value = true
  const isEmptyValue = !selectedId.value && !customType.value
  return !isEmptyValue
}

function clear() {
  searchQuery.value = ''
  customType.value = null
  touched.value = false
  emit('update:modelValue', null)
  emit('select', null)
}

defineExpose({
  validate,
  clear,
})

onMounted(() => {
  if (props.options === undefined) {
    fetchLeaveTypes()
  }
  document.addEventListener('click', handleClickOutside)
  syncSearchWithSelection()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.combobox {
  position: relative;
  width: 100%;
}

.combobox-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.combobox-input-wrap:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
}

.combobox-input-wrap.is-open {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.combobox-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
  z-index: 1;
  flex-shrink: 0;
}

.combobox-input {
  flex: 1;
  padding: 10px 40px 10px 14px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: #0f172a;
  background: transparent;
  outline: none;
  min-width: 0;
}

.combobox-input.has-icon {
  padding-left: 40px;
}

.combobox-input:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
  border-radius: 10px;
  color: #64748b;
}

.combobox-input::placeholder {
  color: #94a3b8;
}

.combobox-toggle {
  position: absolute;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: background 0.15s ease;
}

.combobox-toggle:hover {
  background: #f1f5f9;
}

.combobox-toggle:disabled {
  cursor: not-allowed;
}

.toggle-icon {
  transition: transform 0.2s ease;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

/* ─── Dropdown ──────────────────────────────── */
.combobox-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.10);
  z-index: 50;
  max-height: 260px;
  overflow-y: auto;
}

.combobox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  text-align: left;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  transition: background 0.1s ease;
}

.combobox-option:hover,
.combobox-option.highlighted {
  background: #f1f5f9;
}

.combobox-option.selected {
  color: #2563eb;
  font-weight: 600;
}

.check-icon {
  color: #2563eb;
  flex-shrink: 0;
}

.ml-6 {
  margin-left: 24px;
}

.create-option {
  color: #2563eb;
  border-bottom: 1px solid #e2e8f0;
}

.create-option strong {
  font-weight: 600;
}

.combobox-empty {
  padding: 16px 14px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

.combobox-loading {
  padding: 16px 14px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

.combobox-error-state {
  padding: 16px 14px;
  text-align: center;
  color: #dc2626;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.combobox-retry {
  padding: 4px 12px;
  border: 1px solid #dc2626;
  border-radius: 6px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
}

.combobox-retry:hover {
  background: #fee2e2;
}

.combobox-error {
  font-size: 12px;
  color: #dc2626;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ─── Scrollbar ──────────────────────────────── */
.combobox-dropdown::-webkit-scrollbar {
  width: 6px;
}

.combobox-dropdown::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.combobox-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

/* ─── Transition ─────────────────────────────── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease-out;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
