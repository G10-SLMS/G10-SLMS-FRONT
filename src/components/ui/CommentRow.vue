<template>
  <div class="flex gap-3">
    <div
      v-if="authorAvatarUrl"
      class="h-9 w-9 shrink-0 rounded-full bg-cover bg-center sm:h-10 sm:w-10"
      :style="{ backgroundImage: `url(${authorAvatarUrl})` }"
    />
    <div
      v-else
      :class="[
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white sm:h-10 sm:w-10 sm:text-sm',
        getAvatarColor(authorName),
      ]"
    >
      {{ getInitials(authorName) }}
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-slate-900">{{ authorName }}</span>
        <span class="text-xs text-slate-400">{{ formatRelativeTime(comment.created_at) }}</span>
        <span v-if="comment.edited_at" class="text-xs text-slate-400">(edited)</span>
      </div>

      <div v-if="editingId === comment.id" class="mt-1.5">
        <textarea
          :value="editText"
          rows="2"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="emit('update:editText', ($event.target as HTMLTextAreaElement).value)"
          @keydown.ctrl.enter.prevent="emit('submit-edit')"
          @keydown.meta.enter.prevent="emit('submit-edit')"
        />
        <div class="mt-1.5 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
            @click="emit('cancel-edit')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!editText.trim()"
            @click="emit('submit-edit')"
          >
            Save
          </button>
        </div>
      </div>

      <p v-else class="mt-1 whitespace-pre-wrap text-sm text-slate-700">{{ comment.body }}</p>

      <div v-if="editingId !== comment.id" class="mt-1.5 flex items-center gap-3">
        <button
          v-if="showReply"
          type="button"
          class="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-blue-600"
          @click="emit('start-reply', comment.id)"
        >
          <MessageCircle :size="13" :stroke-width="2" />
          Reply
        </button>
        <template v-if="comment.user_id === currentUserId">
          <button
            type="button"
            class="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-blue-600"
            @click="emit('start-edit', comment)"
          >
            <Pencil :size="13" :stroke-width="2" />
            Edit
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-red-600"
            @click="emit('confirm-delete', comment.id)"
          >
            <Trash2 :size="13" :stroke-width="2" />
            Delete
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MessageCircle, Pencil, Trash2 } from 'lucide-vue-next'
import { formatRelativeTime } from '@/utils/date'
import { getInitials, getAvatarColor } from '@/utils/initials'
import type { Comment } from '@/types/comment'

const props = withDefaults(defineProps<{
  comment: Comment
  currentUserId: number
  editingId: number | null
  editText: string
  /** Replies don't get a Reply action — the backend only threads one level deep. */
  showReply?: boolean
}>(), {
  showReply: true,
})

const emit = defineEmits<{
  (e: 'start-edit', comment: Comment): void
  (e: 'cancel-edit'): void
  (e: 'update:editText', value: string): void
  (e: 'submit-edit'): void
  (e: 'confirm-delete', id: number): void
  (e: 'start-reply', parentId: number): void
}>()

const authorName = computed(() => props.comment.user?.name ?? 'Unknown user')
const authorAvatarUrl = computed(() => props.comment.user?.avatar_url ?? null)
</script>
