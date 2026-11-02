<script setup>
import { useI18n } from '../composables/useI18n'

defineProps({
  message: { type: String, default: '' },
  // stale: previous data is still shown, so the headline says the refresh failed
  stale: { type: Boolean, default: false }
})
defineEmits(['retry'])

const { t } = useI18n()
</script>

<template>
  <div class="error-state" role="alert">
    <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <div class="text">
      <strong class="headline">{{ stale ? t('common.loadFailedStale') : t('common.loadFailed') }}</strong>
      <p v-if="message" class="detail">{{ message }}</p>
    </div>
    <button type="button" class="retry" @click="$emit('retry')">{{ t('common.retry') }}</button>
  </div>
</template>

<style scoped>
.error-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-danger-soft);
  border: 1px solid #b91c1c;
  border-radius: 8px;
  color: var(--color-negative);
}
.icon { flex-shrink: 0; }
.text { flex: 1; min-width: 0; }
.headline { font-size: 14px; font-weight: 600; }
.detail { margin: 2px 0 0; font-size: 13px; color: var(--color-text-muted); }
.retry {
  flex-shrink: 0;
  padding: 6px 14px;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.retry:hover { background: var(--color-surface-muted); }
.retry:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
@media (max-width: 480px) {
  .error-state { flex-direction: column; align-items: flex-start; }
}
</style>
