<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen && inventoryItem" class="modal-overlay" @click="close">
        <div ref="dialogRef" class="modal-container" role="dialog" aria-modal="true" aria-labelledby="inventory-modal-title" tabindex="-1" @click.stop>
          <div class="modal-header">
            <h3 id="inventory-modal-title" class="modal-title">{{ t('modals.inventory.title') }}</h3>
            <button type="button" class="close-button" :aria-label="t('common.close')" @click="close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="item-header">
              <div class="item-icon" :class="getStockIconClass()">
                <svg aria-hidden="true" width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="12" width="32" height="28" rx="2" stroke="currentColor" stroke-width="2.5"/>
                  <path d="M16 8V16M32 8V16M8 20H40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                  <path d="M16 28H32M16 34H24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="item-title-section">
                <h4 class="item-name">{{ translateProductName(inventoryItem.name) }}</h4>
                <div class="item-sku">{{ t('modals.sku', { sku: inventoryItem.sku }) }}</div>
              </div>
              <span class="stock-badge" :class="getStockStatusClass()">
                {{ getStockStatusLabel() }}
              </span>
            </div>

            <div class="stock-summary">
              <div class="summary-card primary">
                <div class="summary-label">{{ t('modals.inventory.quantityOnHand') }}</div>
                <div class="summary-value">{{ t('modals.units', { count: inventoryItem.quantity_on_hand }) }}</div>
              </div>
              <div class="summary-card" :class="getSummaryCardClass()">
                <div class="summary-label">{{ t('modals.inventory.stockLevel') }}</div>
                <div class="summary-value">{{ stockPercentage }}%</div>
                <div class="summary-subtitle">{{ t('modals.inventory.vsReorder') }}</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">{{ t('modals.inventory.category') }}</div>
                <div class="info-value">{{ inventoryItem.category }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">{{ t('modals.inventory.location') }}</div>
                <div class="info-value">{{ inventoryItem.location }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">{{ t('modals.inventory.reorderPoint') }}</div>
                <div class="info-value">{{ t('modals.units', { count: inventoryItem.reorder_point }) }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">{{ t('modals.inventory.unitsRemaining') }}</div>
                <div class="info-value">
                  <span :style="{ color: inventoryItem.quantity_on_hand <= inventoryItem.reorder_point ? 'var(--color-negative)' : 'var(--color-positive)' }">
                    {{ t('modals.units', { count: inventoryItem.quantity_on_hand - inventoryItem.reorder_point }) }}
                  </span>
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">{{ t('modals.inventory.unitCost') }}</div>
                <div class="info-value">{{ formatMoney(inventoryItem.unit_cost, currentCurrency, { decimals: 2 }) }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">{{ t('modals.inventory.totalValue') }}</div>
                <div class="info-value total-value">
                  {{ formatMoney(totalValue, currentCurrency, { decimals: 2 }) }}
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">{{ t('modals.inventory.warehouse') }}</div>
                <div class="info-value">{{ translateWarehouse(inventoryItem.location) }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">{{ t('modals.inventory.status') }}</div>
                <div class="info-value">
                  <span :class="['badge', getStockStatusClass()]">
                    {{ getStockStatusLabel() }}
                  </span>
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
import { formatMoney } from '../utils/format'

const { t, currentCurrency, translateProductName, translateWarehouse } = useI18n()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  inventoryItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const totalValue = computed(() => {
  if (!props.inventoryItem) return 0
  return props.inventoryItem.quantity_on_hand * props.inventoryItem.unit_cost
})

const stockPercentage = computed(() => {
  if (!props.inventoryItem || props.inventoryItem.reorder_point === 0) return 0
  return Math.round((props.inventoryItem.quantity_on_hand / props.inventoryItem.reorder_point) * 100)
})

const dialogRef = ref(null)
const close = () => {
  emit('close')
}
useModalA11y(() => props.isOpen, dialogRef, close)

const getStockStatus = () => {
  if (!props.inventoryItem) return 'Unknown'
  if (props.inventoryItem.quantity_on_hand <= props.inventoryItem.reorder_point) {
    return 'Low Stock'
  } else if (props.inventoryItem.quantity_on_hand <= props.inventoryItem.reorder_point * 1.5) {
    return 'Adequate'
  } else {
    return 'In Stock'
  }
}

// getStockStatus() returns stable English keys used for class mapping; only the label is translated.
const getStockStatusLabel = () => {
  const status = getStockStatus()
  if (status === 'Low Stock') return t('modals.inventory.lowStock')
  if (status === 'Adequate') return t('modals.inventory.adequate')
  return t('modals.inventory.inStock')
}

const getStockStatusClass = () => {
  const status = getStockStatus()
  if (status === 'Low Stock') return 'danger'
  if (status === 'Adequate') return 'warning'
  return 'success'
}

const getStockIconClass = () => {
  const status = getStockStatus()
  if (status === 'Low Stock') return 'danger-icon'
  if (status === 'Adequate') return 'warning-icon'
  return 'success-icon'
}

const getSummaryCardClass = () => {
  const status = getStockStatus()
  if (status === 'Low Stock') return 'danger-card'
  if (status === 'Adequate') return 'warning-card'
  return 'success-card'
}
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

.item-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.item-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.item-icon.success-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.item-icon.warning-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.item-icon.danger-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.item-title-section {
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

.stock-badge {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  flex-shrink: 0;
}

.stock-badge.success {
  background: var(--color-success-bg);
  color: var(--color-success-text);
}

.stock-badge.warning {
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.stock-badge.danger {
  background: var(--color-danger-bg);
  color: var(--color-danger-text);
}

.stock-summary {
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

.summary-card.primary {
  border-color: #bfdbfe;
  background: var(--color-accent-soft);
}

.summary-card.success-card {
  border-color: #a7f3d0;
  background: var(--color-success-bg);
}

.summary-card.warning-card {
  border-color: var(--color-warning-bg);
  background: var(--color-warning-soft);
}

.summary-card.danger-card {
  border-color: var(--color-danger-bg);
  background: var(--color-danger-soft);
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

.summary-subtitle {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
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

.info-value.total-value {
  font-size: 1.125rem;
  color: var(--color-accent-text);
  font-weight: 700;
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
