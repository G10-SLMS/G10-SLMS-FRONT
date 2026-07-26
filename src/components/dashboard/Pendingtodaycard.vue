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

const canReview = computed(() => auth.isEducator || auth.isAdmin)

const items = ref<LeaveRequestListItem[]>([])
const loading = ref(true)
const error = ref('')

const visibleItems = computed(() => items.value.slice(0, MAX_VISIBLE))
const hasMore = computed(() => items.value.length > MAX_VISIBLE)

function goToApproval(id: number) {
  router.push({ name: 'Approvals', query: { request: String(id) } })
}

function seeMore() {
  router.push({
    name: canReview.value ? 'Approvals' : 'LeaveRequests',
    query: { status: 'pending' },
  })
}

// The API can filter by status server-side, but not by "submitted today" —
// so we page through pending requests (newest first) in small batches and
// stop as soon as we've either collected enough to render + know there's
// more, or crossed into requests older than today. PAGE_SIZE/MAX_PAGES keep
// the worst case (e.g. if the API isn't sorted newest-first) no worse than
// the old single 50-record fetch.
const PAGE_SIZE = 20
const MAX_PAGES = 3

async function load() {
  loading.value = true
  error.value = ''
  const today = todayKey()
  const collected: LeaveRequestListItem[] = []

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const result = await leaveService.getLeaveRequests({ status: 'pending', per_page: PAGE_SIZE, page })
      if (result.data.length === 0) break

      let hitOlderThanToday = false
      for (const item of result.data) {
        const day = item.created_at.slice(0, 10)
        if (day === today) {
          collected.push(item)
        } else if (day < today) {
          hitOlderThanToday = true
        }
      }

      if (collected.length > MAX_VISIBLE || hitOlderThanToday || page >= result.last_page) break
    }

    items.value = collected
  } catch {
    error.value = 'Failed to load today\'s submissions.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
