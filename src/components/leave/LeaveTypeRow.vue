<template>
  <tr class="border-b border-gray-100 last:border-none">
    <td class="px-2 py-3 text-left">
      <div class="flex items-center gap-2 font-medium text-gray-900">
        <FileText :size="15" :stroke-width="1.8" />
        {{ leaveType.name }}
      </div>
    </td>
    <td class="px-2 py-3 text-left">{{ leaveType.defaultDays }} days</td>
    <td class="px-2 py-3 text-left">{{ leaveType.requiresApproval ? 'Yes' : 'No' }}</td>
    <td class="px-2 py-3 text-left">
      <span
        class="rounded-full px-2.5 py-1 text-xs font-medium"
        :class="leaveType.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        {{ leaveType.active ? 'Active' : 'Inactive' }}
      </span>
    </td>
    <td class="px-2 py-3 text-left">
      <div class="flex gap-1.5">
        <button
          class="inline-flex h-[30px] w-[30px] items-center justify-center rounded-md border-none bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200"
          aria-label="Edit leave type"
          @click="$emit('edit')"
        >
          <Pencil :size="15" :stroke-width="1.8" />
        </button>
        <button
          class="inline-flex h-[30px] w-[30px] items-center justify-center rounded-md border-none bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200"
          aria-label="Toggle status"
          @click="$emit('toggle')"
        >
          <Power :size="15" :stroke-width="1.8" />
        </button>
        <button
          class="inline-flex h-[30px] w-[30px] items-center justify-center rounded-md border-none bg-gray-100 text-gray-700 cursor-pointer hover:bg-red-100 hover:text-red-700"
          aria-label="Remove leave type"
          @click="$emit('remove')"
        >
          <Trash2 :size="15" :stroke-width="1.8" />
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { FileText, Pencil, Power, Trash2 } from 'lucide-vue-next'

defineProps<{
  leaveType: {
    id: number
    name: string
    defaultDays: number
    requiresApproval: boolean
    active: boolean
  }
}>()

defineEmits<{
  edit: []
  toggle: []
  remove: []
}>()
</script>
