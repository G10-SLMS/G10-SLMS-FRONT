<template>
  <div>
    <!-- Backdrop overlay for mobile screen viewports -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-x-0 bottom-0 top-[60px] z-[49] bg-white/45 md:hidden"
        aria-hidden="true"
        @click="close"
      />
    </Transition>

    <aside
      class="sticky top-0 z-50 flex h-screen flex-col overflow-y-auto border-r border-slate-200 bg-white py-4 text-slate-700 shadow-sm transition-[width] duration-250 max-md:fixed max-md:left-0 max-md:top-[60px] max-md:h-[calc(100vh-60px)] max-md:-translate-x-full max-md:shadow-md max-md:transition-transform"
      :class="[
        collapsed ? 'w-[72px] max-md:w-[220px]' : 'w-[220px]',
        isOpen ? 'max-md:translate-x-0' : '',
      ]"
    >
      <!-- Brand Logo Container Header -->
      <div
        class="mb-2 flex items-center justify-between gap-2.5 border-b border-slate-200 px-5 pb-4"
        :class="{ 'justify-center px-0 max-md:justify-between max-md:px-5': collapsed }"
      >
        <img
          :src="logoUrl"
          alt="SLMS logo"
          class="block h-8 w-auto shrink-0 transition-[height] duration-250"
          :class="{ 'h-8 w-8 rounded-md object-cover object-left max-md:h-8 max-md:w-auto max-md:rounded-none max-md:object-fill': collapsed }"
        />

        <button
          v-if="isOpen"
          type="button"
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 max-md:absolute max-md:right-2.5 max-md:top-2.5"
          aria-label="Close menu"
          @click="close"
        >
          <X :size="20" :stroke-width="1.8" />
        </button>
      </div>

      <!-- New Request Action -->
      <div v-if="auth.isStudent" class="px-3 pb-1">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#f5a623] px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#e09510]"
          :class="{ 'px-0': collapsed }"
          @click="leaveModal.openCreate()"
          @mouseenter="showTooltip($event, 'New Request')"
          @mouseleave="hideTooltip"
        >
          <Plus :size="16" />
          <span :class="{ 'hidden': collapsed }">New Request</span>
        </button>
      </div>

      <!-- Main Navigation Menu Groups Links Loop -->
      <nav class="flex flex-1 flex-col gap-1">
        <div
          v-for="(group, gi) in visibleNavGroups"
          :key="group.label"
          class="flex flex-col gap-0.5"
          :class="{ 'mt-2.5 border-t border-slate-100 pt-2.5': gi > 0 }"
        >
          <span
            v-if="group.label && !collapsed"
            class="px-5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400"
          >
            {{ group.label }}
          </span>
          <template v-for="item in group.items" :key="item.to ?? item.label">
            <template v-if="item.type === 'dropdown'">
              <SidebarNavGroup
                v-if="!collapsed"
                :label="item.label"
                :icon="item.icon"
                :children="item.children"
                @click="close"
                @hover="showTooltip"
                @unhover="hideTooltip"
              />
              <SidebarNavLink
                v-for="child in item.children"
                v-else
                :key="child.to"
                :to="child.to"
                :label="child.label"
                :icon="child.icon"
                :collapsed="collapsed"
                @click="close"
                @hover="showTooltip"
                @unhover="hideTooltip"
              />
            </template>
            <SidebarNavLink
              v-else
              :to="item.to"
              :label="item.label"
              :icon="item.icon"
              :collapsed="collapsed"
              @click="close"
              @hover="showTooltip"
              @unhover="hideTooltip"
            />
          </template>
        </div>
      </nav>

      <!-- Account Bottom Actions Footer -->
      <div class="mt-auto border-t border-slate-200 pt-2 max-md:hidden">
        <button
          type="button"
          class="relative mx-2 flex w-[calc(100%-16px)] items-center gap-2.5 rounded-md px-5 py-2.5 text-left text-sm font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
          :class="{ 'justify-center px-3': collapsed }"
          :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="collapsed = !collapsed"
          @mouseenter="showTooltip($event, collapsed ? 'Expand' : 'Collapse')"
          @mouseleave="hideTooltip"
        >
          <PanelLeftClose
            class="shrink-0 transition-transform duration-250"
            :class="{ 'rotate-180': collapsed }"
            :size="18"
            :stroke-width="1.8"
          />
          <span class="whitespace-nowrap" :class="{ 'hidden': collapsed }">Collapse</span>
        </button>
      </div>
    </aside>

    <Teleport to="body">
      <div
        v-if="collapsed && hoveredLabel"
        class="fixed z-[200] -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-md pointer-events-none animate-[tooltip-fade-in_0.12s_ease]"
        :style="tooltipStyle"
      >
        {{ hoveredLabel }}
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLeaveFormModalStore } from '@/stores/leaveFormModal'
import logoUrl from '@/assets/image/logo.png'
import SidebarNavLink from '@/components/layout/SidebarNavLink.vue'
import SidebarNavGroup from '@/components/layout/SidebarNavGroup.vue'
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar,
  Users,
  ClipboardList,
  Settings,
  BarChart3,
  X,
  PanelLeftClose,
  Plus,
} from 'lucide-vue-next'

const props = defineProps<{
  isOpen?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const auth = useAuthStore()
const leaveModal = useLeaveFormModalStore()
const collapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')
const hoveredLabel = ref<string | null>(null)
const tooltipStyle = ref({ top: '0px', left: '0px' })

const canApprove = computed(() => auth.isTrainer || auth.isAdmin)
const isAdmin = computed(() => auth.isAdmin)

const navGroups = computed(() => [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
      { to: '/leave-requests', label: 'Leave Requests', icon: FileText, show: true },
      { to: '/approvals', label: 'Approvals', icon: CheckSquare, show: canApprove.value },
      { to: '/calendar', label: 'Calendar', icon: Calendar, show: true },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        type: 'dropdown',
        label: 'Administration',
        icon: Settings,
        show: isAdmin.value,
        children: [
          { to: '/leave-types', label: 'Leave Management', icon: ClipboardList },
          { to: '/users', label: 'User Management', icon: Users },
        ],
      },
      { to: '/reports', label: 'Reports', icon: BarChart3, show: isAdmin.value },
    ],
  },
])

const visibleNavGroups = computed(() =>
  navGroups.value
    .map((group) => ({ ...group, items: group.items.filter((item) => item.show) }))
    .filter((group) => group.items.length > 0)
)

watch(collapsed, (value) => {
  localStorage.setItem('sidebar-collapsed', String(value))
  if (!value) hideTooltip()
})

watch(
  () => props.isOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  }
)

function close() {
  emit('close')
}

function showTooltip(event: MouseEvent, label: string) {
  if (!collapsed.value) return
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  tooltipStyle.value = {
    top: `${rect.top + rect.height / 2}px`,
    left: `${rect.right + 10}px`,
  }
  hoveredLabel.value = label
}

function hideTooltip() {
  hoveredLabel.value = null
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.isOpen) close()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

</script>
