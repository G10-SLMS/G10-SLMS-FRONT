<template>
  <div>
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
      class="sticky top-0 z-50 flex h-screen flex-col overflow-y-auto border-r border-slate-200 bg-white py-4 text-slate-700 shadow-[1px_0_3px_rgba(0,0,0,0.04)] transition-[width] duration-[250ms] [@media(min-width:769px)_and_(max-width:1024px)]:!w-[72px] max-md:fixed max-md:left-0 max-md:top-[60px] max-md:z-50 max-md:h-[calc(100vh-60px)] max-md:-translate-x-full max-md:shadow-[2px_0_8px_rgba(0,0,0,0.05)] max-md:transition-transform max-md:duration-[250ms]"
      :class="[
        collapsed ? 'w-[72px] max-md:!w-[220px]' : 'w-[220px]',
        isOpen ? 'max-md:translate-x-0' : '',
      ]"
    >
      <div
        class="mb-2 flex items-center justify-between gap-2.5 border-b border-slate-200 px-5 pb-4 [@media(min-width:769px)_and_(max-width:1024px)]:!justify-center [@media(min-width:769px)_and_(max-width:1024px)]:!px-0"
        :class="collapsed ? 'justify-center px-0 max-md:!justify-between max-md:!px-5' : ''"
      >
        <img
          :src="logoUrl"
          alt="SLMS logo"
          class="block h-8 w-auto shrink-0 transition-[height] duration-[250ms]"
          :class="collapsed ? 'h-8 w-8 rounded-md object-cover object-left max-md:!h-8 max-md:!w-auto max-md:!rounded-none max-md:!object-fill' : ''"
        />

        <button
          v-if="isOpen"
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-none bg-transparent text-slate-400 cursor-pointer hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 max-md:absolute max-md:right-2.5 max-md:top-2.5"
          aria-label="Close menu"
          @click="close"
        >
          <X :size="20" :stroke-width="1.8" />
        </button>
      </div>

      <nav class="flex flex-1 flex-col gap-1">
        <div
          v-for="(group, gi) in visibleNavGroups"
          :key="group.label"
          class="flex flex-col gap-0.5"
          :class="gi > 0 ? 'mt-2.5 border-t border-slate-100 pt-2.5' : ''"
        >
          <span
            v-if="group.label && !collapsed"
            class="px-5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 [@media(min-width:769px)_and_(max-width:1024px)]:!hidden"
          >{{ group.label }}</span>
          <SidebarNavLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            :label="item.label"
            :icon="item.icon"
            :collapsed="collapsed"
            @click="close"
            @hover="showTooltip"
            @unhover="hideTooltip"
          />
        </div>
      </nav>

      <div
        class="mt-auto border-t border-slate-200 pt-2 [@media(min-width:769px)_and_(max-width:1024px)]:!hidden max-md:!hidden"
      >
        <RouterLink
          to="/profile"
          class="mx-2 mb-1 flex items-center gap-2.5 rounded-md px-5 py-2.5 text-inherit no-underline transition-colors hover:bg-slate-100"
          :class="collapsed ? 'justify-center px-2.5' : ''"
          @click="close"
          @mouseenter="showTooltip($event, userName)"
          @mouseleave="hideTooltip"
        >
          <div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cyan-400 text-xs font-semibold text-white">
            <img v-if="userAvatar" :src="userAvatar" :alt="userName" class="h-full w-full object-cover" />
            <span v-else>{{ userInitials }}</span>
          </div>
          <div class="flex min-w-0 flex-col leading-tight" :class="collapsed ? 'hidden' : ''">
            <span class="overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-semibold text-slate-900">{{ userName }}</span>
            <span class="text-xs text-white">{{ userRole }}</span>
          </div>
        </RouterLink>

        <button
          class="relative mx-2 flex w-[calc(100%-16px)] cursor-pointer items-center gap-2.5 rounded-md border-none bg-transparent px-5 py-2.5 text-left font-inherit text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
          :class="collapsed ? 'justify-center px-3' : ''"
          :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="collapsed = !collapsed"
          @mouseenter="showTooltip($event, collapsed ? 'Expand' : 'Collapse')"
          @mouseleave="hideTooltip"
        >
          <PanelLeftClose
            class="shrink-0 transition-transform duration-[250ms]"
            :class="collapsed ? 'rotate-180' : ''"
            :size="18"
            :stroke-width="1.8"
          />
          <span class="text-sm font-medium whitespace-nowrap" :class="collapsed ? 'hidden' : ''">Collapse</span>
        </button>
      </div>
    </aside>

    <Teleport to="body">
      <div
        v-if="collapsed && hoveredLabel"
        class="fixed z-[200] -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] pointer-events-none animate-[tooltip-fade-in_0.12s_ease]"
        :style="{ top: tooltipStyle.top, left: tooltipStyle.left }"
      >
        {{ hoveredLabel }}
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import logoUrl from '@/assets/image/logo.png';
import SidebarNavLink from '@/components/layout/SidebarNavLink.vue';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar,
  Users,
  ClipboardList,
  BarChart3,
  X,
  PanelLeftClose,
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const auth = useAuthStore();
const canApprove = computed(() => auth.isTrainer || auth.isAdmin);
const isAdmin = computed(() => auth.isAdmin);

const userName = computed(() => auth.user?.name ?? 'Guest');
const userAvatar = computed(() => auth.user?.avatar ?? null);
const userRole = computed(() => {
  if (isAdmin.value) return 'Admin';
  if (auth.isTrainer) return 'Trainer';
  return 'Student';
});
const userInitials = computed(() =>
  userName.value
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase(),
);

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
      { to: '/leave-types', label: 'Leave Management', icon: ClipboardList, show: isAdmin.value },
      { to: '/reports', label: 'Reports', icon: BarChart3, show: isAdmin.value },
      { to: '/users', label: 'User Management', icon: Users, show: isAdmin.value },
    ],
  },
]);

const visibleNavGroups = computed(() =>
  navGroups.value
    .map((group) => ({ ...group, items: group.items.filter((item) => item.show) }))
    .filter((group) => group.items.length > 0),
);
const collapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true');

watch(collapsed, (value) => {
  localStorage.setItem('sidebar-collapsed', String(value));
  if (!value) hideTooltip();
});

function close() {
  emit('close');
}

const hoveredLabel = ref<string | null>(null);
const tooltipStyle = ref({ top: '0px', left: '0px' });

function showTooltip(event: MouseEvent, label: string) {
  if (!collapsed.value) return;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  tooltipStyle.value = {
    top: `${rect.top + rect.height / 2}px`,
    left: `${rect.right + 10}px`,
  };
  hoveredLabel.value = label;
}

function hideTooltip() {
  hoveredLabel.value = null;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.isOpen) close();
}
watch(
  () => props.isOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : '';
  },
);

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>
