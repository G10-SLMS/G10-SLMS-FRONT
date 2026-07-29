<template>
  <div class="rounded-xl bg-white shadow-sm border border-slate-100">
    <div class="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
      <h3 class="text-base font-semibold text-slate-900">Comments</h3>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-10">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
    </div>

    <div v-else-if="comments.length === 0" class="px-4 py-10 text-center sm:px-6">
      <MessageCircle :size="32" :stroke-width="1.5" class="mx-auto mb-2 text-slate-300" />
      <p class="text-sm text-slate-400">No comments yet. Be the first to comment.</p>
    </div>

    <div v-else class="divide-y divide-slate-100">
      <div v-for="comment in sortedComments" :key="comment.id" class="px-4 py-3 sm:px-6 sm:py-4">
        <CommentRow
          :comment="comment"
          :current-user-id="currentUserId"
          :editing-id="editingId"
          :edit-text="editText"
          @start-edit="startEdit"
          @cancel-edit="cancelEdit"
          @update:edit-text="editText = $event"
          @submit-edit="submitEdit"
          @confirm-delete="confirmDelete"
          @start-reply="startReply"
        />

        <!-- Replies (one level — matches what the backend eager-loads) -->
        <div v-if="comment.replies?.length" class="mt-3 space-y-3 border-l-2 border-slate-100 pl-3 sm:pl-4">
          <CommentRow
            v-for="reply in sortedReplies(comment.replies)"
            :key="reply.id"
            :comment="reply"
            :current-user-id="currentUserId"
            :editing-id="editingId"
            :edit-text="editText"
            :show-reply="false"
            @start-edit="startEdit"
            @cancel-edit="cancelEdit"
            @update:edit-text="editText = $event"
            @submit-edit="submitEdit"
            @confirm-delete="confirmDelete"
          />
        </div>

        <!-- Reply composer -->
        <div v-if="replyingToId === comment.id" class="mt-3 pl-3 sm:pl-4">
          <textarea
            v-model="replyText"
            rows="2"
            placeholder="Write a reply…"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keydown.ctrl.enter.prevent="submitReply"
            @keydown.meta.enter.prevent="submitReply"
          />
          <div class="mt-1.5 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
              @click="cancelReply"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!replyText.trim()"
              @click="submitReply"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading" class="border-t border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
      <form @submit.prevent="submitNew">
        <textarea
          v-model="newText"
          :placeholder="placeholder"
          rows="2"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @keydown.ctrl.enter.prevent="submitNew"
          @keydown.meta.enter.prevent="submitNew"
        />
        <div class="mt-2 flex items-center justify-between">
          <span class="text-xs text-slate-400">Ctrl+Enter to post</span>
          <button
            type="submit"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!newText.trim()"
          >
            Post Comment
          </button>
        </div>
      </form>
    </div>

    <ConfirmDialog
      v-if="deleteTargetId !== null"
      open
      title="Delete comment?"
      message="This comment will be permanently removed. This action cannot be undone."
      confirm-label="Delete"
      @confirm="handleDeleteConfirm"
      @cancel="deleteTargetId = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { MessageCircle } from 'lucide-vue-next'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import CommentRow from './CommentRow.vue'
import type { Comment } from '@/types/comment'

const props = withDefaults(defineProps<{
  comments: Comment[]
  loading?: boolean
  currentUserId: number
  placeholder?: string
}>(), {
  comments: () => [] as Comment[],
  loading: false,
  placeholder: 'Write a comment…',
})

const emit = defineEmits<{
  (e: 'add-comment', body: string): void
  (e: 'reply-comment', parentId: number, body: string): void
  (e: 'edit-comment', id: number, body: string): void
  (e: 'delete-comment', id: number): void
}>()

const newText = ref('')
const editingId = ref<number | null>(null)
const editText = ref('')
const deleteTargetId = ref<number | null>(null)
const replyingToId = ref<number | null>(null)
const replyText = ref('')

const sortedComments = computed(() =>
  [...props.comments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  ),
)

function sortedReplies(replies: Comment[]) {
  return [...replies].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
}

function submitNew() {
  if (!newText.value.trim()) return
  emit('add-comment', newText.value.trim())
  newText.value = ''
}

function startEdit(comment: Comment) {
  editingId.value = comment.id
  editText.value = comment.body
}

function cancelEdit() {
  editingId.value = null
  editText.value = ''
}

function submitEdit() {
  if (editingId.value === null || !editText.value.trim()) return
  emit('edit-comment', editingId.value, editText.value.trim())
  editingId.value = null
  editText.value = ''
}

function confirmDelete(id: number) {
  deleteTargetId.value = id
}

function handleDeleteConfirm() {
  if (deleteTargetId.value !== null) {
    emit('delete-comment', deleteTargetId.value)
    deleteTargetId.value = null
  }
}

function startReply(commentId: number) {
  replyingToId.value = commentId
  replyText.value = ''
}

function cancelReply() {
  replyingToId.value = null
  replyText.value = ''
}

function submitReply() {
  if (replyingToId.value === null || !replyText.value.trim()) return
  emit('reply-comment', replyingToId.value, replyText.value.trim())
  replyingToId.value = null
  replyText.value = ''
}
</script>
