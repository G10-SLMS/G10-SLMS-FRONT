<template>
  <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
    <h2 class="mb-4 flex items-center gap-2">
      <UserCheck :size="18" :stroke-width="1.8" />
      On Leave Today
    </h2>

    <ActivityListSkeleton v-if="loading" :rows="3" />
    <p v-else-if="error" class="text-red-500">{{ error }}</p>
    <p v-else-if="items.length === 0" class="text-gray-400">No one is on approved leave today.</p>

    <ul v-else class="flex flex-col divide-y divide-gray-100">
      <TodayLeaveListItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        verb="—"
        :show-status="false"
        clickable
        @select="goToRequest"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserCheck } from 'lucide-vue-next'
import { leaveService } from '@/services/leaveService'
import { todayKey } from '@/utils/date'
import ActivityListSkeleton from '@/components/shared/ActivityListSkeleton.vue'
import TodayLeaveListItem from '@/components/dashboard/TodayLeaveListItem.vue'
import type { LeaveRequestListItem } from '@/types/leave'

const router = useRouter()

const items = ref<LeaveRequestListItem[]>([])
const loading = ref(true)
const error = ref('')

function goToRequest(id: number) {
  router.push({ name: 'LeaveRequests', query: { request: String(id) } })
}

async function load() {
  loading.value = true
  error.value = ''
  const today = todayKey()

  try {
    const result = await leaveService.getLeaveRequests({ status: 'approved', per_page: 100 })
    items.value = result.data.filter(
      (item) => item.start_date <= today && today <= item.end_date,
    )
  } catch {
    error.value = 'Failed to load today\'s leave.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
