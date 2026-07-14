<template>
  <div class="settings-view">
    <div class="header-row">
      <div>
        <h1>Settings</h1>
        <p class="sub-label">Configure how SLMS behaves system-wide</p>
      </div>
      <button class="save-btn" :disabled="!isDirty" @click="saveAll">
        <Save :size="16" :stroke-width="1.8" />
        {{ isDirty ? 'Save Changes' : 'Saved' }}
      </button>
    </div>

    <div v-if="savedMessage" class="saved-banner">
      <CheckCircle :size="16" :stroke-width="1.8" />
      Settings saved successfully.
    </div>

    <div class="settings-grid">
      <!-- General -->
      <div class="card">
        <div class="card-header">
          <span class="card-icon icon-blue"><Globe :size="17" :stroke-width="1.8" /></span>
          <div>
            <h2>General</h2>
            <p class="card-sub">Basic system information</p>
          </div>
        </div>

        <label class="field">
          <span>System Name</span>
          <input v-model="form.general.systemName" type="text" @input="markDirty" />
        </label>

        <label class="field">
          <span>Time Zone</span>
          <select v-model="form.general.timezone" @change="markDirty">
            <option value="Asia/Phnom_Penh">Asia/Phnom Penh (ICT)</option>
            <option value="Asia/Bangkok">Asia/Bangkok (ICT)</option>
            <option value="UTC">UTC</option>
          </select>
        </label>

        <label class="field">
          <span>Academic Year Start</span>
          <select v-model="form.general.yearStart" @change="markDirty">
            <option value="January">January</option>
            <option value="April">April</option>
            <option value="September">September</option>
          </select>
        </label>
      </div>

      <!-- Leave Policy -->
      <div class="card">
        <div class="card-header">
          <span class="card-icon icon-green"><FileText :size="17" :stroke-width="1.8" /></span>
          <div>
            <h2>Leave Policy</h2>
            <p class="card-sub">Default rules applied to leave requests</p>
          </div>
        </div>

        <label class="field">
          <span>Default Annual Leave Days</span>
          <input v-model.number="form.leavePolicy.defaultAnnualDays" type="number" min="0" @input="markDirty" />
        </label>

        <label class="field">
          <span>Max Consecutive Days per Request</span>
          <input v-model.number="form.leavePolicy.maxConsecutiveDays" type="number" min="1" @input="markDirty" />
        </label>

        <label class="field">
          <span>Auto-approve Requests Under (days)</span>
          <input v-model.number="form.leavePolicy.autoApproveUnder" type="number" min="0" @input="markDirty" />
          <small class="hint">Set to 0 to require approval for every request.</small>
        </label>

        <label class="toggle-field">
          <span>
            Allow Leave Carryover
            <small class="hint">Unused leave days roll over to the next year.</small>
          </span>
          <button
            class="toggle"
            :class="{ on: form.leavePolicy.allowCarryover }"
            role="switch"
            :aria-checked="form.leavePolicy.allowCarryover"
            @click="toggle('leavePolicy', 'allowCarryover')"
          >
            <span class="toggle-knob" />
          </button>
        </label>
      </div>

      <!-- Notifications -->
      <div class="card">
        <div class="card-header">
          <span class="card-icon icon-amber"><Bell :size="17" :stroke-width="1.8" /></span>
          <div>
            <h2>Notifications</h2>
            <p class="card-sub">Control system emails and alerts</p>
          </div>
        </div>

        <label class="toggle-field">
          <span>
            Email Notifications
            <small class="hint">Send emails for request updates and reminders.</small>
          </span>
          <button
            class="toggle"
            :class="{ on: form.notifications.emailEnabled }"
            role="switch"
            :aria-checked="form.notifications.emailEnabled"
            @click="toggle('notifications', 'emailEnabled')"
          >
            <span class="toggle-knob" />
          </button>
        </label>

        <label class="toggle-field">
          <span>
            Notify Admins on New Request
            <small class="hint">Alert all admins whenever a request is submitted.</small>
          </span>
          <button
            class="toggle"
            :class="{ on: form.notifications.notifyAdminsOnRequest }"
            role="switch"
            :aria-checked="form.notifications.notifyAdminsOnRequest"
            @click="toggle('notifications', 'notifyAdminsOnRequest')"
          >
            <span class="toggle-knob" />
          </button>
        </label>

        <label class="field">
          <span>Deadline Reminder (days before)</span>
          <input v-model.number="form.notifications.reminderDaysBefore" type="number" min="0" @input="markDirty" />
        </label>
      </div>

      <!-- Security & Access -->
      <div class="card">
        <div class="card-header">
          <span class="card-icon icon-red"><Shield :size="17" :stroke-width="1.8" /></span>
          <div>
            <h2>Security &amp; Access</h2>
            <p class="card-sub">Session and account control</p>
          </div>
        </div>

        <label class="field">
          <span>Session Timeout (minutes)</span>
          <input v-model.number="form.security.sessionTimeout" type="number" min="5" @input="markDirty" />
        </label>

        <label class="toggle-field">
          <span>
            Require Email Verification
            <small class="hint">New accounts must verify their email before signing in.</small>
          </span>
          <button
            class="toggle"
            :class="{ on: form.security.requireEmailVerification }"
            role="switch"
            :aria-checked="form.security.requireEmailVerification"
            @click="toggle('security', 'requireEmailVerification')"
          >
            <span class="toggle-knob" />
          </button>
        </label>

        <label class="toggle-field danger-row">
          <span>
            Maintenance Mode
            <small class="hint">Temporarily block non-admin sign-ins.</small>
          </span>
          <button
            class="toggle"
            :class="{ on: form.security.maintenanceMode }"
            role="switch"
            :aria-checked="form.security.maintenanceMode"
            @click="toggle('security', 'maintenanceMode')"
          >
            <span class="toggle-knob" />
          </button>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Globe, FileText, Bell, Shield, Save, CheckCircle } from 'lucide-vue-next'

// Placeholder data — will come from GET /api/settings later
const form = reactive({
  general: {
    systemName: 'Student Leave Management System',
    timezone: 'Asia/Phnom_Penh',
    yearStart: 'September',
  },
  leavePolicy: {
    defaultAnnualDays: 15,
    maxConsecutiveDays: 10,
    autoApproveUnder: 0,
    allowCarryover: true,
  },
  notifications: {
    emailEnabled: true,
    notifyAdminsOnRequest: true,
    reminderDaysBefore: 3,
  },
  security: {
    sessionTimeout: 60,
    requireEmailVerification: true,
    maintenanceMode: false,
  },
})

const isDirty = ref(false)
const savedMessage = ref(false)

function markDirty() {
  isDirty.value = true
  savedMessage.value = false
}

function toggle<K extends keyof typeof form>(section: K, key: keyof (typeof form)[K]) {
  const target = form[section] as Record<string, unknown>
  const current = target[key as string]

  if (typeof current === 'boolean') {
    target[key as string] = !current
    markDirty()
  }
}

function saveAll() {
  if (!isDirty.value) return
  // Will call PUT /api/settings later
  isDirty.value = false
  savedMessage.value = true
  setTimeout(() => {
    savedMessage.value = false
  }, 3000)
}
</script>

<style scoped>
.settings-view {
  max-width: 100%;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.sub-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.save-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.save-btn:disabled {
  background: #9ca3af;
  cursor: default;
}

.saved-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #dcfce7;
  color: #15803d;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 16px;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}

.card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  flex-shrink: 0;
}

.icon-blue {
  background: #dbeafe;
  color: #1e3a8a;
}

.icon-green {
  background: #dcfce7;
  color: #15803d;
}

.icon-amber {
  background: #fef3c7;
  color: #b45309;
}

.icon-red {
  background: #fee2e2;
  color: #b91c1c;
}

.card h2 {
  font-size: 15px;
  margin: 0;
}

.card-sub {
  font-size: 12px;
  color: #9ca3af;
  margin: 2px 0 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #374151;
}

.field:last-child {
  margin-bottom: 0;
}

.field input,
.field select {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 9px 10px;
  font-size: 14px;
  color: #111827;
}

.hint {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
}

.toggle-field {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.toggle-field:last-child {
  margin-bottom: 0;
}

.toggle-field span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.danger-row span {
  color: #b91c1c;
}

.toggle {
  position: relative;
  flex-shrink: 0;
  width: 40px;
  height: 22px;
  border-radius: 999px;
  border: none;
  background: #d1d5db;
  cursor: pointer;
  transition: background 0.15s ease;
  padding: 0;
}

.toggle.on {
  background: #2563eb;
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease;
}

.toggle.on .toggle-knob {
  transform: translateX(18px);
}

@media (max-width: 900px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
