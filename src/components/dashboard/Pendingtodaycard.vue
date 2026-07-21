<template>
  <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
    <h2 class="mb-4 flex items-center gap-2 text-amber-600">
      <CalendarClock :size="18" :stroke-width="1.8" />
      Pending Today
    </h2>

    <ActivityListSkeleton v-if="loading" :rows="3" />
    <p v-else-if="error" class="text-red-500">{{ error }}</p>
    <p v-else-if="visibleItems.length === 0" class="text-gray-400">No pending requests submitted today.</p>

    <template v-else>
      <ul class="flex flex-col divide-y divide-gray-100">
        <TodayLeaveListItem
          v-for="item in visibleItems"
          :key="item.id"
          :item="item"
          verb="requested"
          :clickable="canReview"
          @select="goToApproval"
        />
      </ul>

      <button
        v-if="hasMore"
        type="button"
        class="mt-3 w-full rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        @click="seeMore"
      >
        See more
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarClock } from 'lucide-vue-next'
import { leaveService } from '@/services/leaveService'
import { todayKey } from '@/utils/date'
import { useAuthStore } from '@/stores/auth'
import ActivityListSkeleton from '@/components/shared/ActivityListSkeleton.vue'
import TodayLeaveListItem from '@/components/dashboard/TodayLeaveListItem.vue'
import type { LeaveRequestListItem } from '@/types/leave'

const MAX_VISIBLE = 3

const router = useRouter()
const auth = useAuthStore()

const canReview = computed(() => auth.isTrainer || auth.isAdmin)

const items = ref<LeaveRequestListItem[]>([])
const loading = ref(true)
const error = ref('')

const pendingItems = computed(() => items.value.filter((item) => item.status === 'pending'))
const visibleItems = computed(() => pendingItems.value.slice(0, MAX_VISIBLE))
const hasMore = computed(() => pendingItems.value.length > MAX_VISIBLE)

function goToApproval(id: number) {
  router.push({ name: 'Approvals', query: { request: String(id) } })
}

function seeMore() {
  router.push({
    name: canReview.value ? 'Approvals' : 'LeaveRequests',
    query: { status: 'pending' },
  })
}

async function load() {
  loading.value = true
  error.value = ''
  const today = todayKey()

  try {
    const result = await leaveService.getLeaveRequests({ per_page: 50 })
    items.value = result.data.filter((item) => item.created_at.slice(0, 10) === today)
  } catch {
    error.value = 'Failed to load today\'s submissions.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
