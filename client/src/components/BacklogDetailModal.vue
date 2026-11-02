<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen && backlogItem" class="modal-overlay" @click="close">
        <div ref="dialogRef" class="modal-container" role="dialog" aria-modal="true" aria-labelledby="backlog-modal-title" tabindex="-1" @click.stop>
          <div class="modal-header">
            <h3 id="backlog-modal-title" class="modal-title">{{ t('modals.backlog.title') }}</h3>
            <button type="button" class="close-button" :aria-label="t('common.close')" @click="close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="shortage-header">
              <div class="shortage-icon">
                <svg aria-hidden="true" width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 8L24 28M24 34L24 36" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                  <circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="3"/>
                </svg>
              </div>
              <div class="shortage-title-section">
                <h4 class="item-name">{{ translateProductName(backlogItem.item_name) }}</h4>
                <div class="item-sku">{{ t('modals.sku', { sku: backlogItem.item_sku }) }}</div>
              </div>
              <span class="priority-badge" :class="backlogItem.priority">
                {{ t('modals.backlog.priorityBadge', { priority: priorityLabel }) }}
              </span>
            </div>

            <div class="shortage-summary">
              <div class="summary-card danger">
                <div class="summary-label">{{ t('modals.backlog.shortageAmount') }}</div>
                <div class="summary-value">{{ t('modals.units', { count: shortage }) }}</div>
              </div>
              <div class="summary-card warning">
                <div class="summary-label">{{ t('modals.backlog.daysDelayed') }}</div>
                <div class="summary-value">{{ t('modals.backlog.daysValue', { count: backlogItem.days_delayed }) }}</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">{{ t('modals.backlog.orderId') }}</div>
                <div class="info-value order-id">{{ backlogItem.order_id }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">{{ t('modals.backlog.itemSku') }}</div>
                <div class="info-value sku">{{ backlogItem.item_sku }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">{{ t('modals.backlog.quantityNeeded') }}</div>
                <div class="info-value">{{ t('modals.units', { count: backlogItem.quantity_needed }) }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">{{ t('modals.backlog.quantityAvailable') }}</div>
                <div class="info-value">{{ t('modals.units', { count: backlogItem.quantity_available }) }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">{{ t('modals.backlog.expectedDate') }}</div>
                <div class="info-value">{{ formatDate(backlogItem.expected_date, currentLocale, { year: 'numeric', month: 'long', day: 'numeric' }) || t('modals.notAvailable') }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">{{ t('modals.backlog.status') }}</div>
                <div class="info-value">
                  <span class="badge danger">{{ t('modals.backlog.backordered') }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="close">{{ t('common.close') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useModalA11y } from '../composables/useModalA11y'
import { formatDate } from '../utils/format'

const { t, currentLocale, translateProductName } = useI18n()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  backlogItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const shortage = computed(() => {
  if (!props.backlogItem) return 0
  return props.backlogItem.quantity_needed - props.backlogItem.quantity_available
})

const priorityLabel = computed(() => {
  const p = props.backlogItem?.priority
  // Unknown priorities fall back to the raw value rather than a missing-key string
  return ['high', 'medium', 'low'].includes(p) ? t(`modals.backlog.${p}`) : (p || '')
})

const dialogRef = ref(null)
const close = () => {
  emit('close')
}
useModalA11y(() => props.isOpen, dialogRef, close)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-container {
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.025em;
}

.close-button {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.close-button:hover {
  background: var(--color-surface-muted);
  color: var(--color-text);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.shortage-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.shortage-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.shortage-title-section {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
}

.item-sku {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-family: 'Monaco', 'Courier New', monospace;
}

.priority-badge {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  flex-shrink: 0;
}

.priority-badge.high {
  background: var(--color-danger-bg);
  color: var(--color-danger-text);
}

.priority-badge.medium {
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.priority-badge.low {
  background: var(--color-info-bg);
  color: var(--color-info-text);
}

.shortage-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  padding: 1.25rem;
  border-radius: 10px;
  border: 2px solid;
}

.summary-card.danger {
  border-color: var(--color-danger-bg);
  background: var(--color-danger-soft);
}

.summary-card.warning {
  border-color: var(--color-warning-bg);
  background: var(--color-warning-soft);
}

.summary-label {
  font-size: 0.813rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text);
}

.summary-card.danger .summary-value {
  color: var(--color-negative);
}

.summary-card.warning .summary-value {
  color: var(--color-caution);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.813rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.info-value {
  font-size: 0.938rem;
  color: var(--color-text);
  font-weight: 500;
}

.info-value.order-id,
.info-value.sku {
  font-family: 'Monaco', 'Courier New', monospace;
  color: var(--color-accent-text);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.btn-secondary:hover {
  background: var(--color-border);
  border-color: var(--color-border-strong);
}

/* Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

/* Visible keyboard focus for the close button and footer button */
.close-button:focus-visible,
.btn-secondary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
