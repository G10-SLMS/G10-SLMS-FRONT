<template>
  <div class="sidebar-root">
    <Transition name="backdrop-fade">
      <div v-if="isOpen" class="sidebar-backdrop" aria-hidden="true" @click="close" />
    </Transition>

    <aside class="sidebar" :class="{ open: isOpen, collapsed: collapsed }">
      <div class="sidebar-brand">
        <img :src="logoUrl" alt="SLMS logo" class="sidebar-logo" />

        <button v-if="isOpen" class="close-btn" aria-label="Close menu" @click="close">
          <X :size="20" :stroke-width="1.8" />
        </button>
      </div>

      <nav>
        <div v-for="group in visibleNavGroups" :key="group.label" class="nav-group">
          <span v-if="group.label && !collapsed" class="nav-group-label">{{ group.label }}</span>
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            @click="close"
            @mouseenter="showTooltip($event, item.label)"
            @mouseleave="hideTooltip"
          >
            <component :is="item.icon" class="nav-icon" :size="18" />
            <span class="nav-label">{{ item.label }}</span>
          </RouterLink>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button
          class="collapse-btn nav-item"
          :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="collapsed = !collapsed"
          @mouseenter="showTooltip($event, collapsed ? 'Expand' : 'Collapse')"
          @mouseleave="hideTooltip"
        >
          <PanelLeftClose class="nav-icon collapse-icon" :size="18" :stroke-width="1.8" />
          <span class="nav-label">Collapse</span>
        </button>
      </div>
    </aside>

    <Teleport to="body">
      <div
        v-if="collapsed && hoveredLabel"
        class="nav-floating-tooltip"
        :style="{ top: tooltipStyle.top, left: tooltipStyle.left }"
      >
        {{ hoveredLabel }}
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/image/logo.png'
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar,
  Settings,
  Users,
  ClipboardList,
  BarChart3,
  X,
  PanelLeftClose,
} from 'lucide-vue-next'

const props = defineProps<{
  isOpen?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const auth = useAuthStore()
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
      { to: '/users', label: 'User Management', icon: Users, show: isAdmin.value },
      { to: '/leave-types', label: 'Leave Management', icon: ClipboardList, show: isAdmin.value },
      { to: '/reports', label: 'Reports', icon: BarChart3, show: isAdmin.value },
      { to: '/settings', label: 'Settings', icon: Settings, show: isAdmin.value },
    ],
  },
])

const visibleNavGroups = computed(() =>
  navGroups.value
    .map((group) => ({ ...group, items: group.items.filter((item) => item.show) }))
    .filter((group) => group.items.length > 0),
)
const collapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')

watch(collapsed, (value) => {
  localStorage.setItem('sidebar-collapsed', String(value))
  if (!value) hideTooltip()
})

function close() {
  emit('close')
}

const hoveredLabel = ref<string | null>(null)
const tooltipStyle = ref({ top: '0px', left: '0px' })

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
watch(
  () => props.isOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
)

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.sidebar-backdrop {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 49;
}

.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

@media (min-width: 769px) {
  .sidebar-backdrop {
    display: none;
  }
}

.sidebar {
  width: 220px;
  height: 100vh;
  position: sticky;
  top: 0;
  align-self: flex-start;
  background: #ffffff;
  color: #334155;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  border-right: 1px solid #e2e8f0;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.04);
  overflow-y: auto;
  transition: width 0.25s ease;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 20px 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar-logo {
  height: 32px;
  width: auto;
  display: block;
  flex-shrink: 0;
  transition: height 0.25s ease;
}

.sidebar-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.close-btn:active {
  background: #e2e8f0;
}

.close-btn:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-group + .nav-group {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.nav-group-label {
  padding: 4px 20px 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  margin: 0 8px;
  border-radius: 6px;
  color: #64748b;
  text-decoration: none;
  background: none;
  border: none;
  width: calc(100% - 16px);
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition: background 0.15s, color 0.15s;
}

.nav-icon {
  flex-shrink: 0;
  stroke-width: 2;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.nav-item.router-link-active {
  background: #eff6ff;
  color: #2563eb;
}

.nav-item.router-link-active .nav-icon {
  color: #2563eb;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}

.collapse-icon {
  transition: transform 0.25s ease;
}

.sidebar.collapsed .collapse-icon {
  transform: rotate(180deg);
}

.sidebar.collapsed {
  width: 72px;
}
.sidebar.collapsed .sidebar-brand {
  justify-content: center;
  padding: 0 0 16px;
}
.sidebar.collapsed .sidebar-logo {
  width: 32px;
  height: 32px;
  object-fit: cover;
  object-position: left center;
  border-radius: 6px;
}
.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
  margin: 0 8px;
  width: calc(100% - 16px);
}
.sidebar.collapsed .nav-label {
  display: none;
}

.nav-floating-tooltip {
  position: fixed;
  transform: translateY(-50%);
  background: #0f172a;
  color: #ffffff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  z-index: 200;
  pointer-events: none;
  animation: tooltip-fade-in 0.12s ease;
}

@keyframes tooltip-fade-in {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .sidebar {
    width: 72px;
  }
  .sidebar-brand {
    justify-content: center;
    padding: 0 0 16px;
  }
  .sidebar-logo {
    height: 28px;
  }
  .sidebar-name {
    display: none;
  }
  .nav-item {
    justify-content: center;
    padding: 12px;
    margin: 0 8px;
  }
  .nav-label {
    display: none;
  }

  .sidebar-footer {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    height: calc(100vh - 60px);
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    z-index: 50;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-footer {
    display: none;
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  .sidebar.collapsed {
    width: 220px;
  }
  .sidebar.collapsed .sidebar-logo {
    width: auto;
    height: 32px;
    object-fit: initial;
    border-radius: 0;
  }
  .sidebar.collapsed .sidebar-brand {
    justify-content: space-between;
    padding: 0 20px 16px;
  }
  .sidebar.collapsed .nav-item {
    justify-content: flex-start;
    padding: 10px 20px;
  }
  .sidebar.collapsed .nav-label {
    display: inline;
  }
}
</style>
