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
        <div class="flex gap-3">
          <div
            v-if="comment.authorAvatarUrl"
            class="h-9 w-9 shrink-0 rounded-full bg-cover bg-center sm:h-10 sm:w-10"
            :style="{ backgroundImage: `url(${comment.authorAvatarUrl})` }"
          />
          <div
            v-else
            :class="[
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white sm:h-10 sm:w-10 sm:text-sm',
              getAvatarColor(comment.authorName),
            ]"
          >
            {{ getInitials(comment.authorName) }}
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-slate-900">{{ comment.authorName }}</span>
              <span class="text-xs text-slate-400">{{ formatRelativeTime(comment.createdAt) }}</span>
            </div>

            <div v-if="editingId === comment.id" class="mt-1.5">
              <textarea
                v-model="editText"
                rows="2"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                @keydown.ctrl.enter.prevent="submitEdit"
                @keydown.meta.enter.prevent="submitEdit"
              />
              <div class="mt-1.5 flex justify-end gap-2">
                <button
                  type="button"
                  class="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
                  @click="cancelEdit"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="!editText.trim()"
                  @click="submitEdit"
                >
                  Save
                </button>
              </div>
            </div>

            <p v-else class="mt-1 whitespace-pre-wrap text-sm text-slate-700">{{ comment.text }}</p>

            <div
              v-if="editingId !== comment.id && comment.authorId === currentUserId"
              class="mt-1.5 flex items-center gap-3"
            >
              <button
                type="button"
                class="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-blue-600"
                @click="startEdit(comment)"
              >
                <Pencil :size="13" :stroke-width="2" />
                Edit
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-red-600"
                @click="confirmDelete(comment.id)"
              >
                <Trash2 :size="13" :stroke-width="2" />
                Delete
              </button>
            </div>
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
import { MessageCircle, Pencil, Trash2 } from 'lucide-vue-next'
import { formatRelativeTime } from '@/utils/date'
import { getInitials, getAvatarColor } from '@/utils/initials'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
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
  (e: 'add-comment', text: string): void
  (e: 'edit-comment', id: number, text: string): void
  (e: 'delete-comment', id: number): void
}>()

const newText = ref('')
const editingId = ref<number | null>(null)
const editText = ref('')
const deleteTargetId = ref<number | null>(null)

const sortedComments = computed(() =>
  [...props.comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
)

function submitNew() {
  if (!newText.value.trim()) return
  emit('add-comment', newText.value.trim())
  newText.value = ''
}

function startEdit(comment: Comment) {
  editingId.value = comment.id
  editText.value = comment.text
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
</script>

<script lang="ts">
import { defineComponent, h } from 'vue'
import CommentSection from './CommentSection.vue'

const mockComments: Comment[] = [
  {
    id: 1,
    authorId: 1,
    authorName: 'Alice Johnson',
    authorAvatarUrl: null,
    text: 'This looks great! Let me review it.',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 2,
    authorId: 2,
    authorName: 'Bob Smith',
    authorAvatarUrl: null,
    text: 'Can we schedule a meeting to discuss this further? I have a few concerns about the timeline.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 3,
    authorId: 3,
    authorName: 'Carol Williams',
    authorAvatarUrl: 'https://i.pravatar.cc/96?img=5',
    text: 'Approved. Moving forward with the next phase.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]

const CommentSectionDemo = defineComponent({
  name: 'CommentSectionDemo',
  setup() {
    if (!import.meta.env.DEV) return () => null
    return () =>
      h('div', { class: 'mx-auto max-w-2xl p-4 sm:p-6' }, [
        h('h2', { class: 'mb-4 text-lg font-bold text-slate-900' }, 'Comment Section — Demo'),
        h('p', { class: 'mb-4 text-xs text-slate-400' }, 'Current user: Alice Johnson (id: 1) — edit/delete shown on own comments'),
        h(
          CommentSection,
          {
            comments: mockComments,
            currentUserId: 1,
          },
        ),
      ])
  },
})

export default CommentSectionDemo
</script>
