<template>
  <!-- Attachment (view mode) -->
  <div v-if="viewMode && existingAttachmentUrl" class="mb-4">
    <label class="mb-1.5 block text-xs font-medium text-gray-700"> Supporting Document </label>

    <AttachmentCard
      :url="existingAttachmentUrl"
      :name="existingAttachmentName"
      :size="existingAttachmentSize"
    />
  </div>

  <!-- Attachment (create/edit mode) -->
  <div v-if="!viewMode" class="mb-4">
    <label class="mb-1.5 block text-xs font-medium text-gray-700">
      Supporting Document
      <span v-if="required" class="text-red-600">*</span>
      <span v-else class="text-gray-400">(optional)</span>
    </label>

    <!-- Existing file on an edit, shown until replaced/removed -->
    <AttachmentCard
      v-if="hasExistingAttachment && !removeExistingAttachment && !modelValue"
      class="mb-2"
      :url="existingAttachmentUrl"
      :name="existingAttachmentName"
      :size="existingAttachmentSize"
      removable
      :show-view-label="false"
      :disabled="disabled"
      @remove="emit('remove-existing')"
    />
    <p v-else-if="removeExistingAttachment" class="mb-2 text-xs text-gray-500">
      Existing file will be removed on save.
      <button type="button" class="text-cyan-700 hover:underline" @click="emit('undo-remove')">Undo</button>
    </p>

    <FileUpload
      :model-value="modelValue ? [modelValue] : []"
      :multiple="false"
      :max-size-m-b="5"
      :accept="['pdf', 'docx', 'png', 'jpg']"
      :disabled="disabled"
      :mock-upload="false"
      @update:model-value="emit('update:modelValue', $event[0] ?? null)"
    />
    <p v-if="required" class="mt-1.5 text-xs text-gray-500">
      This leave type requires a supporting document before it can be submitted.
    </p>
  </div>
</template>

<script setup lang="ts">
import AttachmentCard from '@/components/shared/AttachmentCard.vue';
import FileUpload from '@/components/ui/FileUpload.vue';

defineProps<{
  viewMode: boolean;
  hasExistingAttachment: boolean;
  removeExistingAttachment: boolean;
  existingAttachmentUrl: string | null;
  existingAttachmentName: string | null;
  existingAttachmentSize: number | null;
  required: boolean;
  disabled: boolean;
  modelValue: File | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: File | null): void;
  (e: 'remove-existing'): void;
  (e: 'undo-remove'): void;
}>();
</script>
