<template>
  <Teleport to="body">
    <Transition name="profile-modal">
      <div
        v-if="student"
        class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-4"
        @click.self="$emit('close')"
      >
        <div
          class="flex max-h-[88vh] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.25)] ring-1 ring-black/5 dark:bg-surface-card dark:ring-white/10"
        >
          <!-- Scrollable content -->
          <div class="flex-1 overflow-y-auto">
            <!-- Header banner -->
            <div class="relative bg-gradient-to-br from-cyan-500 to-blue-600 px-5 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-5">
              <button
                class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 hover:rotate-90 sm:right-4 sm:top-4"
                aria-label="Close"
                @click="$emit('close')"
              >
                <X :size="16" :stroke-width="2" />
              </button>
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white"
              >
                <IdCard :size="12" :stroke-width="2" />
                Student Profile
              </span>
            </div>

            <!-- Avatar (straddles the banner/body seam) -->
            <div class="relative z-10 -mt-10 flex flex-col items-center px-5 sm:-mt-12 sm:px-6">
              <img
                v-if="student.avatar?.url"
                :src="student.avatar.url"
                :alt="student.name"
                class="h-20 w-20 shrink-0 rounded-full bg-white object-cover object-center ring-4 ring-white shadow-lg dark:bg-surface-card dark:ring-surface-card sm:h-24 sm:w-24"
              />
              <span
                v-else
                :class="[
                  'flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white ring-4 ring-white shadow-lg dark:ring-surface-card sm:h-24 sm:w-24 sm:text-2xl',
                  getAvatarColor(student.name),
                ]"
              >
                {{ getInitials(student.name) }}
              </span>

              <p class="m-0 mt-2.5 text-center text-[15px] font-bold text-slate-900 dark:text-white sm:mt-3 sm:text-base">
                {{ student.name }}
              </p>
              <p v-if="student.email" class="m-0 mt-0.5 flex max-w-full items-center gap-1.5 text-[12.5px] text-slate-500 dark:text-slate-400 sm:text-[13px]">
                <Mail :size="13" :stroke-width="1.8" class="shrink-0" />
                <span class="truncate">{{ student.email }}</span>
              </p>
            </div>

            <!-- Details -->
            <div class="mt-5 px-4 pb-2 sm:mt-6 sm:px-5">
              <template v-for="section in sections" :key="section.title">
                <p
                  class="mb-2 mt-3.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 first:mt-0 sm:mt-4 dark:text-slate-500"
                >
                  {{ section.title }}
                </p>
                <div class="grid grid-cols-2 gap-1">
                  <div
                    v-for="field in section.fields"
                    :key="field.label"
                    class="flex items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 sm:gap-3 sm:px-2.5 sm:py-2.5"
                  >
                    <span
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-50 to-blue-50 text-blue-600 dark:from-white/10 dark:to-white/5 dark:text-cyan-300 sm:h-9 sm:w-9"
                    >
                      <component :is="field.icon" :size="14" :stroke-width="1.8" class="sm:hidden" />
                      <component :is="field.icon" :size="15" :stroke-width="1.8" class="hidden sm:block" />
                    </span>
                    <div class="min-w-0 flex-1">
                      <dt class="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500 sm:text-[11px]">
                        {{ field.label }}
                      </dt>
                      <dd class="m-0 truncate text-[12.5px] font-semibold capitalize text-slate-900 dark:text-slate-100 sm:text-[13.5px]">
                        {{ field.value || '—' }}
                      </dd>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex shrink-0 justify-end border-t border-slate-100 px-4 py-3 dark:border-white/10 sm:px-5 sm:py-4">
            <button
              class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15 sm:px-5 sm:py-2.5"
              @click="$emit('close')"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Mail, Phone, VenusAndMars, IdCard, BookOpen, Layers, MapPin, X } from 'lucide-vue-next'
import { getInitials, getAvatarColor } from '@/utils/initials'
import { formatStudentId } from '@/utils/formatters'
import type { LeaveRequestUser } from '@/types/leave'

const props = defineProps<{
  student: LeaveRequestUser | null
}>()

defineEmits<{
  close: []
}>()

const sections = computed(() => {
  const s = props.student
  if (!s) return []
  return [
    {
      title: 'Contact',
      fields: [
        { label: 'Phone', value: s.phone, icon: Phone },
        { label: 'Gender', value: s.gender, icon: VenusAndMars },
      ],
    },
    {
      title: 'Academic',
      fields: [
        { label: 'Student ID', value: formatStudentId(s.student_id), icon: IdCard },
        { label: 'Class', value: s.class_name, icon: BookOpen },
        { label: 'Generation', value: s.generation, icon: Layers },
        { label: 'Province', value: s.province, icon: MapPin },
      ],
    },
  ]
})
</script>

<style scoped>
.profile-modal-enter-active,
.profile-modal-leave-active {
  transition: opacity 0.2s ease;
}
.profile-modal-enter-active > div,
.profile-modal-leave-active > div {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.profile-modal-enter-from,
.profile-modal-leave-to {
  opacity: 0;
}
.profile-modal-enter-from > div,
.profile-modal-leave-to > div {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
</style>
