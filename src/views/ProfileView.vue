<template>
  <div class="w-full px-6 py-10">
    <header class="mb-8 flex items-center justify-between">
      <div>
        <p class="mb-0.5 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
          Institutional Record
        </p>
        <h1 class="text-[26px] font-bold tracking-tight text-slate-900">My Profile</h1>
      </div>
      <RouterLink
        to="/profile/edit"
        class="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-slate-700"
      >
        <Pencil :size="15" />
        Edit Profile
      </RouterLink>
    </header>

    <ProfileBadgeCard
      class="w-full"
      :avatar-url="avatarUrl"
      :initials="initials"
      :name="user?.name || 'Guest User'"
      :role-label="roleLabel"
      :role-badge-class="roleBadgeClass"
      :member-id="memberId"
      :fields="profileFields"
      :role-bar-class="roleBarClass"
      :bar-heights="barHeights"
    />

    <ProfileSecuritySection @change-password="openPasswordModal" />

    <ChangePasswordModal
      :open="showPasswordModal"
      v-model:next="passwordForm.next"
      v-model:confirm="passwordForm.confirm"
      :error="passwordError"
      :success="passwordSuccess"
      :saving="savingPassword"
      @close="closePasswordModal"
      @submit="submitPassword(() => (showPasswordModal = false))"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useDefaultAvatars } from '@/composables/user/useDefaultAvatars';
import { useChangePassword } from '@/composables/user/useChangePassword';
import { getInitials } from '@/utils/initials';
import { Pencil, Mail, Phone, User, IdCard, GraduationCap, MapPin } from 'lucide-vue-next';
import ProfileBadgeCard from '@/components/user/profile/ProfileBadgeCard.vue';
import ProfileSecuritySection from '@/components/user/profile/ProfileSecuritySection.vue';
import ChangePasswordModal from '@/components/user/profile/ChangePasswordModal.vue';

const auth = useAuthStore();
const user = computed(() => auth.user);

const { urlFor } = useDefaultAvatars();
const avatarUrl = computed(() => urlFor(user.value?.avatar_id));

const {
  form: passwordForm,
  saving: savingPassword,
  error: passwordError,
  success: passwordSuccess,
  submit: submitPassword,
  isOpen: showPasswordModal,
  open: openPasswordModal,
  close: closePasswordModal,
} = useChangePassword({ autoCloseMs: 1200 });

const initials = computed(() => getInitials(user.value?.name ?? ''));

const memberId = computed(() => (user.value ? String(user.value.id).padStart(5, '0') : '—'));

const roleStyles = {
  admin: {
    label: 'Admin',
    badge: 'bg-red-500/15 text-red-300',
    bar: 'bg-red-400',
  },
  educator: {
    label: 'Educator',
    badge: 'bg-amber-500/15 text-amber-300',
    bar: 'bg-amber-400',
  },
  student: {
    label: 'Student',
    badge: 'bg-cyan-400/15 text-cyan-300',
    bar: 'bg-cyan-400',
  },
} as const;

const currentRole = computed(() => (user.value?.role ?? 'student') as keyof typeof roleStyles);

const roleLabel = computed(() => roleStyles[currentRole.value].label);
const roleBadgeClass = computed(() => roleStyles[currentRole.value].badge);
const roleBarClass = computed(() => roleStyles[currentRole.value].bar);

const profileFields = computed(() =>
  [
    {
      key: 'email',
      label: 'Email',
      icon: Mail,
      value: user.value?.email,
    },
    {
      key: 'phone',
      label: 'Phone',
      icon: Phone,
      value: user.value?.phone,
    },
    {
      key: 'gender',
      label: 'Gender',
      icon: User,
      value: user.value?.gender ?? 'Not specified',
      valueClass: 'capitalize',
    },
    ...(currentRole.value === 'student'
      ? [
          {
            key: 'student_id',
            label: 'Student ID',
            icon: IdCard,
            value: user.value?.student_id,
          },
        ]
      : []),
    {
      key: 'class',
      label: 'Class',
      icon: GraduationCap,
      value: user.value?.class_name,
    },
    {
      key: 'generation',
      label: 'Generation',
      icon: GraduationCap,
      value: user.value?.generation,
    },
    {
      key: 'province',
      label: 'Province',
      icon: MapPin,
      value: user.value?.province,
    },
  ].filter((field) => field.value),
);

const barHeights = Array.from({ length: 18 }, (_, i) => ['h-[60%]', 'h-[80%]', 'h-full'][i % 3]);
</script>
