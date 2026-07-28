<template>
  <div>
    <!-- Desktop / tablet: table -->
    <div class="hidden md:block">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th class="w-10 border-b border-gray-200 px-2 py-3 text-left">
              <input
                type="checkbox"
                class="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                :checked="allSelected"
                :aria-label="allSelected ? 'Deselect all users' : 'Select all users'"
                @change="emit('toggle-select-all')"
              />
            </th>
            <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">User</th>
            <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Email</th>
            <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Role</th>
            <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Status</th>
            <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Joined</th>
            <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500"></th>
          </tr>
        </thead>
        <tbody>
          <TableRowSkeleton v-if="loading" :rows="5" :columns="7" />
          <template v-else>
            <tr v-for="u in users" :key="u.id" class="border-b border-gray-100 last:border-none">
              <td class="px-2 py-3 text-left">
                <input
                  v-if="u.id !== currentUserId"
                  type="checkbox"
                  class="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="isSelected(u.id)"
                  :aria-label="`Select ${u.name}`"
                  @change="emit('toggle-select', u.id)"
                />
              </td>
              <td class="px-2 py-3 text-left">
                <div class="flex items-center gap-2.5">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cyan-400 text-xs font-semibold text-white">
                    <img
                      v-if="avatarSrc(u)"
                      :src="avatarSrc(u)!"
                      alt=""
                      class="h-full w-full object-cover"
                    />
                    <template v-else>{{ initials(u.name) }}</template>
                  </span>
                  <p class="m-0 font-medium">{{ u.name }}</p>
                </div>
              </td>
              <td class="px-2 py-3 text-left">{{ u.email }}</td>
              <td class="px-2 py-3 text-left">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                  :class="{
                    'bg-blue-600/20 text-[#0a1628]': u.role === 'admin',
                    'bg-green-100 text-green-700': u.role === 'educator',
                    'bg-amber-100 text-amber-700': u.role === 'student',
                  }"
                >{{ roleLabel(u.role) }}</span>
              </td>
              <td class="px-2 py-3 text-left">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="u.is_active ? 'bg-green-500' : 'bg-gray-400'"
                  />
                  {{ u.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-2 py-3 text-left">{{ u.joined }}</td>
              <td class="px-2 py-3 text-left">
                <div class="flex gap-1.5">
                  <button
                    class="inline-flex h-[30px] w-[30px] items-center justify-center rounded-md border-none bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200"
                    aria-label="Edit user"
                    @click="emit('edit', u)"
                  >
                    <Pencil :size="15" :stroke-width="1.8" />
                  </button>
                  <button
                    v-if="canToggleStatus && u.id !== currentUserId"
                    class="inline-flex h-[30px] w-[30px] items-center justify-center rounded-md border-none bg-gray-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    :class="u.is_active ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'"
                    :aria-label="u.is_active ? 'Disable user' : 'Enable user'"
                    :disabled="togglingId === u.id"
                    @click="emit('toggle-status', u)"
                  >
                    <CircleCheck v-if="u.is_active" :size="15" :stroke-width="1.8" />
                    <Ban v-else :size="15" :stroke-width="1.8" />
                  </button>
                  <button
                    v-if="canDelete"
                    class="inline-flex h-[30px] w-[30px] items-center justify-center rounded-md border-none bg-gray-100 text-red-600 cursor-pointer hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Remove user"
                    :disabled="deletingId === u.id"
                    @click="emit('remove', u)"
                  >
                    <Trash2 :size="15" :stroke-width="1.8" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="7" class="px-2 py-6 text-center text-gray-400">No users match your search.</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Mobile: stacked cards -->
    <div class="divide-y divide-gray-100 md:hidden">
      <template v-if="loading">
        <div v-for="n in 3" :key="n" class="animate-pulse space-y-3 px-4 py-4" aria-hidden="true">
          <div class="h-4 w-2/3 rounded bg-gray-200"></div>
          <div class="h-3 w-1/3 rounded bg-gray-200"></div>
        </div>
      </template>
      <template v-else>
        <UserCard
          v-for="u in users"
          :key="u.id"
          :user="u"
          :avatar-src="avatarSrc(u)"
          :deleting="deletingId === u.id"
          :toggling="togglingId === u.id"
          :can-delete="canDelete"
          :can-toggle-status="canToggleStatus && u.id !== currentUserId"
          :can-select="u.id !== currentUserId"
          :selected="isSelected(u.id)"
          @edit="emit('edit', u)"
          @remove="emit('remove', u)"
          @toggle-status="emit('toggle-status', u)"
          @toggle-select="emit('toggle-select', u.id)"
        />
        <p v-if="users.length === 0" class="px-4 py-6 text-center text-gray-400">No users match your search.</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pencil, Trash2, Ban, CircleCheck } from 'lucide-vue-next'
import type { ManagedUser, UserRole } from '@/types/user'
import UserCard from '@/components/user/management/Usercard.vue'
import TableRowSkeleton from '@/components/shared/TableRowSkeleton.vue'
import { useDefaultAvatars } from '@/composables/user/useDefaultAvatars'

withDefaults(
  defineProps<{
    users: ManagedUser[]
    loading: boolean
    deletingId: number | null
    togglingId?: number | null
    canDelete?: boolean
    canToggleStatus?: boolean
    currentUserId?: number | null
    isSelected: (id: number) => boolean
    allSelected?: boolean
  }>(),
  { canDelete: false, canToggleStatus: false, togglingId: null, currentUserId: null, allSelected: false },
)

const emit = defineEmits<{
  (e: 'edit', user: ManagedUser): void
  (e: 'remove', user: ManagedUser): void
  (e: 'toggle-status', user: ManagedUser): void
  (e: 'toggle-select', id: number): void
  (e: 'toggle-select-all'): void
}>()

const { urlFor } = useDefaultAvatars()

function avatarSrc(u: ManagedUser): string | null {
  return u.avatar_url || urlFor(u.avatar_id)
}

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

function roleLabel(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}
</script>
