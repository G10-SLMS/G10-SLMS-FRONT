<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-white/45 p-4"
      @click.self="$emit('cancel')"
    >
      <div
        class="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
      >
        <h2 class="mb-4 text-lg">{{ isEditing ? 'Edit Leave Type' : 'Add Leave Type' }}</h2>

        <label class="mb-3.5 flex flex-col gap-1.5 text-[13px] text-gray-700">
          <span>Name</span>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. Sick Leave"
            class="rounded-md border border-gray-200 px-2.5 py-[9px] text-sm text-gray-900"
          />
        </label>

        <label class="mb-3.5 flex flex-col gap-1.5 text-[13px] text-gray-700">
          <span>Default Days / Year</span>
          <input
            v-model.number="form.defaultDays"
            type="number"
            min="0"
            class="rounded-md border border-gray-200 px-2.5 py-[9px] text-sm text-gray-900"
          />
        </label>

        <label class="mb-3.5 flex flex-row items-center gap-2 text-[13px] text-gray-700">
          <input v-model="form.requiresApproval" type="checkbox" class="h-4 w-4" />
          <span>Requires approval</span>
        </label>

        <label class="mb-3.5 flex flex-row items-center gap-2 text-[13px] text-gray-700">
          <input v-model="form.active" type="checkbox" class="h-4 w-4" />
          <span>Active</span>
        </label>

        <div class="mt-5 flex justify-end gap-2.5">
          <button
            class="rounded-md border-none bg-gray-100 px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-200"
            @click="$emit('cancel')"
          >
            Cancel
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-md border-none bg-cyan-500 px-4 py-2.5 text-sm text-white cursor-pointer hover:bg-cyan-600"
            @click="$emit('save')"
          >
            {{ isEditing ? 'Save Changes' : 'Add Leave Type' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean;
  isEditing: boolean;
  form: {
    name: string;
    defaultDays: number;
    requiresApproval: boolean;
    active: boolean;
  };
}>();

defineEmits<{
  cancel: [];
  save: [];
}>();
</script>
