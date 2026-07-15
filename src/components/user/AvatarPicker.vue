<template>
  <div class="mb-6 border-b border-dotted border-slate-300 pb-6">
    <div class="mb-3 flex items-center gap-4">
      <div
        class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-slate-100 bg-slate-700 text-[22px] font-bold text-white shadow-md"
      >
        <img
          v-if="selectedAvatarUrl"
          :src="selectedAvatarUrl"
          alt="Avatar preview"
          class="h-full w-full object-cover"
        />
        <span v-else>{{ initials }}</span>
      </div>
      <p class="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">
        Choose an avatar below
      </p>
    </div>

    <div v-if="genderTabs.length > 1" class="mb-3 flex gap-1.5">
      <button
        v-for="tab in genderTabs"
        :key="tab.value"
        type="button"
        class="rounded-full px-3 py-1 text-[12px] font-semibold capitalize transition"
        :class="
          activeTab === tab.value
            ? 'bg-slate-900 text-white'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        "
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="text-[13px] text-slate-400">Loading avatars…</div>
    <div v-else-if="visibleAvatars.length === 0" class="text-[13px] text-slate-400">
      No avatars available.
    </div>
    <template v-else>
      <div class="flex flex-wrap gap-2.5">
        <button
          v-for="avatar in shownAvatars"
          :key="avatar.id"
          type="button"
          class="h-12 w-12 overflow-hidden rounded-full border-2 transition"
          :class="
            avatar.id === selectedId
              ? 'border-cyan-500 ring-2 ring-cyan-100'
              : 'border-transparent hover:border-slate-200'
          "
          @click="selectAvatar(avatar.id)"
        >
          <img :src="avatar.url" :alt="avatar.filename" class="h-full w-full object-cover" />
        </button>
      </div>

      <button
        v-if="hasMore"
        type="button"
        class="mt-3 text-[12px] font-semibold text-cyan-600 hover:text-cyan-700 hover:underline"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Show less' : `See more (${visibleAvatars.length - previewCount})` }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { DefaultAvatar, Gender } from '../../types/user';

const props = withDefaults(
  defineProps<{
    avatars: DefaultAvatar[];
    selectedId?: number | null;
    selectedAvatarUrl?: string | null;
    initials: string;
    loading: boolean;
    preferredGender?: Gender | '' | null;
    previewCount?: number;
  }>(),
  {
    selectedId: null,
    selectedAvatarUrl: null,
    preferredGender: null,
    previewCount: 8,
  },
);

const emit = defineEmits<{
  'update:selectedId': [id: number];
}>();

type TabValue = 'all' | Gender;

const genderTabs = computed(() => {
  const genders = new Set(props.avatars.map((a) => a.gender).filter((g): g is Gender => !!g));
  if (genders.size < 2) return [] as { value: TabValue; label: string }[];

  return [
    { value: 'all' as TabValue, label: 'All' },
    ...Array.from(genders).map((g) => ({ value: g as TabValue, label: g })),
  ];
});

const activeTab = ref<TabValue>((props.preferredGender as TabValue) || 'all');
const expanded = ref(false);

// Keep the tab in sync if the parent's gender field changes after mount
// (e.g. the user picks their gender for the first time).
watch(
  () => props.preferredGender,
  (gender) => {
    if (gender) activeTab.value = gender as TabValue;
  },
);

// Collapse back to the preview count whenever the tab changes, so switching
// from "Male" to "All" doesn't leave a huge grid expanded by surprise.
watch(activeTab, () => {
  expanded.value = false;
});

const visibleAvatars = computed(() =>
  activeTab.value === 'all'
    ? props.avatars
    : props.avatars.filter((a) => a.gender === activeTab.value),
);

const hasMore = computed(() => visibleAvatars.value.length > props.previewCount);

const shownAvatars = computed(() =>
  expanded.value ? visibleAvatars.value : visibleAvatars.value.slice(0, props.previewCount),
);

function selectAvatar(id: number) {
  emit('update:selectedId', id);
}
</script>
