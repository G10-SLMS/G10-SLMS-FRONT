<template>
  <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
    <h2 class="mb-4 flex items-center gap-2 text-green-600">
      <UserCheck :size="18" :stroke-width="1.8" />
      Approved Today
    </h2>

    <ActivityListSkeleton v-if="loading" :rows="3" />
    <p v-else-if="error" class="text-red-500">{{ error }}</p>
    <p v-else-if="visibleItems.length === 0" class="text-gray-400">No requests approved today.</p>

    <template v-else>
      <ul class="flex flex-col divide-y divide-gray-100">
        <TodayLeaveListItem
          v-for="item in visibleItems"
          :key="item.id"
          :item="item"
          verb="—"
          :show-status="true"
          clickable
          @select="goToRequest"
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
import { UserCheck } from 'lucide-vue-next'
import { leaveService } from '@/services/leaveService'
import { todayKey } from '@/utils/date'
import ActivityListSkeleton from '@/components/shared/ActivityListSkeleton.vue'
import TodayLeaveListItem from '@/components/dashboard/TodayLeaveListItem.vue'
import type { LeaveRequestListItem } from '@/types/leave'

const MAX_VISIBLE = 3

const router = useRouter()

const items = ref<LeaveRequestListItem[]>([])
const loading = ref(true)
const error = ref('')

const visibleItems = computed(() => items.value.slice(0, MAX_VISIBLE))
const hasMore = computed(() => items.value.length > MAX_VISIBLE)

function goToRequest(id: number) {
  router.push({ name: 'LeaveRequests', query: { request: String(id) } })
}

function seeMore() {
  router.push({ name: 'LeaveRequests', query: { status: 'approved' } })
}

async function load() {
  loading.value = true
  error.value = ''
  const today = todayKey()

  try {
    const result = await leaveService.getLeaveRequests({ status: 'approved', per_page: 100 })
    items.value = result.data.filter((item) => (item.reviewed_at ?? '').slice(0, 10) === today)
  } catch {
    error.value = 'Failed to load today\'s approvals.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
