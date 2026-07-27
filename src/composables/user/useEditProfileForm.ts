import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useDefaultAvatars } from '@/composables/user/useDefaultAvatars';
import { useChangePassword } from '@/composables/user/useChangePassword';
import { getInitials } from '@/utils/initials';
import { extractErrorMessage } from '@/utils/errors';
import type { Gender } from '@/types/user';

// ── Static Form Data ──────────────────────────────────────
export const CAMBODIA_PROVINCES = [
  'Banteay Meanchey',
  'Battambang',
  'Kampong Cham',
  'Kampong Chhnang',
  'Kampong Speu',
  'Kampong Thom',
  'Kampot',
  'Kandal',
  'Kep',
  'Koh Kong',
  'Kratié',
  'Mondulkiri',
  'Oddar Meanchey',
  'Pailin',
  'Phnom Penh',
  'Preah Sihanouk',
  'Preah Vihear',
  'Prey Veng',
  'Pursat',
  'Ratanakiri',
  'Siem Reap',
  'Stung Treng',
  'Svay Rieng',
  'Takéo',
  'Tboung Khmum',
];

const CLASS_PREFIXES = ['WEB', 'SNA'];

interface EditProfileFormState {
  name: string;
  email: string;
  phone: string;
  gender: Gender | '';
  student_id: string;
  class_name: string;
  generation: string;
  province: string;
  avatar_id: number | null;
}

// ── Internal Helpers ─────────────────────────────────────
function padStudentId(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  return String(value).padStart(3, '0');
}

function splitClass(value: string): { prefix: string; suffix: string } {
  const match = CLASS_PREFIXES.find((prefix) => value.toUpperCase().startsWith(prefix));
  if (match) {
    const rest = value.slice(match.length).replace(/^\s*-?\s*/, '');
    return { prefix: match, suffix: rest };
  }
  return { prefix: CLASS_PREFIXES[0], suffix: value };
}

export function useEditProfileForm() {
  // ── Current User / Derived Info ──────────────────────
  const auth = useAuthStore();
  const router = useRouter();

  const user = computed(() => auth.user);
  const isStudent = computed(() => user.value?.role === 'student');
  const initials = computed(() => getInitials(user.value?.name ?? ''));

  const { avatars: defaultAvatars, loading: loadingAvatars, urlFor } = useDefaultAvatars();

  // ── Profile Form State ────────────────────────────────
  const form = reactive<EditProfileFormState>({
    name: user.value?.name ?? '',
    email: user.value?.email ?? '',
    phone: user.value?.phone ?? '',
    gender: user.value?.gender ?? '',
    student_id: padStudentId(user.value?.student_id),
    class_name: user.value?.class_name ?? '',
    generation: user.value?.generation ?? '',
    province: user.value?.province ?? '',
    avatar_id: user.value?.avatar_id ?? null,
  });

  const selectedAvatarUrl = computed(() => urlFor(form.avatar_id));

  const savingProfile = ref(false);
  const profileError = ref('');
  const profileSuccess = ref(false);
  const initialClassParts = splitClass(form.class_name);
  const classPrefix = ref(initialClassParts.prefix);
  const classSuffix = ref(initialClassParts.suffix);

  watch([classPrefix, classSuffix], ([prefix, suffix]) => {
    form.class_name = `${prefix} - ${suffix.trim()}`;
  });

  // ── Submit Profile ───────────────────────────────────
  async function submitProfile() {
    savingProfile.value = true;
    profileError.value = '';
    profileSuccess.value = false;
    try {
      await auth.updateProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        avatar_id: form.avatar_id,
        ...(isStudent.value
          ? {
              gender: form.gender || undefined,
              student_id: form.student_id,
              class_name: form.class_name,
              generation: form.generation,
              province: form.province,
            }
          : {}),
      });
      profileSuccess.value = true;
      setTimeout(() => {
        router.push('/profile');
      }, 900);
    } catch (err) {
      profileError.value = extractErrorMessage(err, 'Could not update profile.');
    } finally {
      savingProfile.value = false;
    }
  }

  // ── Change Password (embedded sub-composable) ────────
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

  // Auto-opens the change-password modal when arriving via a #security link.
  onMounted(() => {
    if (window.location.hash === '#security') {
      openPasswordModal();
    }
  });

  return {
    isStudent,
    initials,
    defaultAvatars,
    loadingAvatars,
    selectedAvatarUrl,
    form,
    savingProfile,
    profileError,
    profileSuccess,
    classPrefix,
    classSuffix,
    submitProfile,
    passwordForm,
    savingPassword,
    passwordError,
    passwordSuccess,
    submitPassword,
    showPasswordModal,
    openPasswordModal,
    closePasswordModal,
  };
}
