import { ref } from 'vue';
import { commentService } from '@/services/commentService';
import type { Comment } from '@/types/comment';

export function useLeaveComments(getLeaveRequestId: () => number | null | undefined) {
  // ── State ────────────────────────────────────────────
  const comments = ref<Comment[]>([]);
  const commentsLoading = ref(false);

  function reset() {
    comments.value = [];
    commentsLoading.value = false;
  }

  // ── Loading ──────────────────────────────────────────
  async function loadComments() {
    const leaveRequestId = getLeaveRequestId();
    if (!leaveRequestId || !Number.isFinite(leaveRequestId)) return;

    commentsLoading.value = true;
    try {
      comments.value = await commentService.getComments(leaveRequestId);
    } catch {
      // Comments are supplementary — a failed load shouldn't block viewing the request.
      comments.value = [];
    } finally {
      commentsLoading.value = false;
    }
  }

  // ── Add / Reply / Edit / Delete ──────────────────────
  async function handleAddComment(body: string) {
    const leaveRequestId = getLeaveRequestId();
    if (!leaveRequestId || !Number.isFinite(leaveRequestId)) return;

    try {
      const created = await commentService.addComment({ leave_request_id: leaveRequestId, body });
      comments.value = [created, ...comments.value];
    } catch {
      // Silently ignore — the composer keeps the typed text so the user can retry.
    }
  }

  async function handleReplyComment(parentId: number, body: string) {
    const leaveRequestId = getLeaveRequestId();
    if (!leaveRequestId || !Number.isFinite(leaveRequestId)) return;

    try {
      const created = await commentService.addComment({
        leave_request_id: leaveRequestId,
        body,
        parent_id: parentId,
      });
      comments.value = comments.value.map((comment) =>
        comment.id === parentId
          ? { ...comment, replies: [...comment.replies, created] }
          : comment,
      );
    } catch {
      // No-op — user can retry the reply.
    }
  }

  async function handleEditComment(id: number, body: string) {
    try {
      const updated = await commentService.updateComment(id, body);
      comments.value = comments.value.map((comment) => {
        if (comment.id === id) return updated;
        if (comment.replies.some((reply) => reply.id === id)) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => (reply.id === id ? updated : reply)),
          };
        }
        return comment;
      });
    } catch {
      // No-op — user can retry the edit.
    }
  }

  async function handleDeleteComment(id: number) {
    try {
      await commentService.deleteComment(id);
      comments.value = comments.value
        .filter((comment) => comment.id !== id)
        .map((comment) => ({
          ...comment,
          replies: comment.replies.filter((reply) => reply.id !== id),
        }));
    } catch {
      // No-op — the comment stays visible so the user can retry.
    }
  }

  return {
    comments,
    commentsLoading,
    reset,
    loadComments,
    handleAddComment,
    handleReplyComment,
    handleEditComment,
    handleDeleteComment,
  };
}
