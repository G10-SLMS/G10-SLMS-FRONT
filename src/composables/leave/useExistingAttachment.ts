import { computed, ref } from 'vue';

export function useExistingAttachment(hasNewAttachment: () => boolean) {
  const existingAttachmentUrl = ref<string | null>(null);
  const existingAttachmentName = ref<string | null>(null);
  const existingAttachmentSize = ref<number | null>(null);
  const hasExistingAttachment = ref(false);
  const removeExistingAttachment = ref(false);

  function reset() {
    existingAttachmentUrl.value = null;
    existingAttachmentName.value = null;
    existingAttachmentSize.value = null;
    hasExistingAttachment.value = false;
    removeExistingAttachment.value = false;
  }

  function setFromLoadedRequest(data: {
    supporting_document: string | null;
    supporting_document_name?: string | null;
    supporting_document_size?: number | null;
  }) {
    existingAttachmentUrl.value = data.supporting_document;
    existingAttachmentName.value = data.supporting_document_name ?? null;
    existingAttachmentSize.value = data.supporting_document_size ?? null;
    hasExistingAttachment.value = Boolean(data.supporting_document);
  }

  function onNewAttachmentPicked() {
    removeExistingAttachment.value = false;
  }

  const hasAttachment = computed(
    () => hasNewAttachment() || (hasExistingAttachment.value && !removeExistingAttachment.value),
  );

  return {
    existingAttachmentUrl,
    existingAttachmentName,
    existingAttachmentSize,
    hasExistingAttachment,
    removeExistingAttachment,
    hasAttachment,
    reset,
    setFromLoadedRequest,
    onNewAttachmentPicked,
  };
}
