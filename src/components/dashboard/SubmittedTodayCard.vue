<template>
  <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
    <h2 class="mb-4 flex items-center gap-2">
      <CalendarClock :size="18" :stroke-width="1.8" />
      Submitted Today
    </h2>

    <ActivityListSkeleton v-if="loading" :rows="3" />
    <p v-else-if="error" class="text-red-500">{{ error }}</p>
    <p v-else-if="items.length === 0" class="text-gray-400">No requests submitted today.</p>

    <ul v-else class="flex flex-col divide-y divide-gray-100">
      <TodayLeaveListItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        verb="requested"
        :clickable="canReview"
        @select="goToApproval"
      />
    </ul>
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

const router = useRouter()
const auth = useAuthStore()

const canReview = computed(() => auth.isTrainer || auth.isAdmin)

const items = ref<LeaveRequestListItem[]>([])
const loading = ref(true)
const error = ref('')

function goToApproval(id: number) {
  router.push({ name: 'Approvals', query: { request: String(id) } })
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
