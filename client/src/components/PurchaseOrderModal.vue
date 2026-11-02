<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen && backlogItem" class="modal-overlay" @click="close">
        <div
          ref="dialogRef"
          class="modal-container"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          @click.stop
        >
          <div class="modal-header">
            <h3 :id="titleId" class="modal-title">
              {{ mode === 'view' ? t('purchaseOrder.viewTitle') : t('purchaseOrder.createTitle') }}
            </h3>
            <button type="button" class="close-button" :aria-label="t('common.close')" @click="close">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="item-banner">
            <span class="item-banner-label">{{ t('purchaseOrder.item') }}</span>
            <strong>{{ translateProductName(backlogItem.item_name) }}</strong>
            <span class="item-sku">{{ backlogItem.item_sku }}</span>
          </div>

          <!-- CREATE -->
          <form v-if="mode !== 'view'" class="modal-form" novalidate @submit.prevent="submit">
            <div class="modal-body">
              <div class="field">
                <label :for="ids.supplier">{{ t('purchaseOrder.supplier') }}</label>
                <input
                  :id="ids.supplier"
                  v-model="form.supplier_name"
                  type="text"
                  maxlength="120"
                  autocomplete="off"
                  :aria-invalid="!!errors.supplier_name"
                  :aria-describedby="errors.supplier_name ? ids.supplier + '-err' : undefined"
                />
                <p v-if="errors.supplier_name" :id="ids.supplier + '-err'" class="field-error">{{ errors.supplier_name }}</p>
              </div>

              <div class="field-row">
                <div class="field">
                  <label :for="ids.quantity">{{ t('purchaseOrder.quantity') }}</label>
                  <input
                    :id="ids.quantity"
                    v-model="form.quantity"
                    type="number"
                    min="1"
                    max="1000000"
                    step="1"
                    inputmode="numeric"
                    :aria-invalid="!!errors.quantity"
                    :aria-describedby="errors.quantity ? ids.quantity + '-err' : undefined"
                  />
                  <p v-if="errors.quantity" :id="ids.quantity + '-err'" class="field-error">{{ errors.quantity }}</p>
                </div>

                <div class="field">
                  <label :for="ids.unitCost">{{ t('purchaseOrder.unitCost') }}</label>
                  <input
                    :id="ids.unitCost"
                    v-model="form.unit_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    inputmode="decimal"
                    :aria-invalid="!!errors.unit_cost"
                    :aria-describedby="ids.unitCost + '-hint' + (errors.unit_cost ? ' ' + ids.unitCost + '-err' : '')"
                  />
                  <p :id="ids.unitCost + '-hint'" class="field-hint">{{ t('purchaseOrder.unitCostHint') }}</p>
                  <p v-if="errors.unit_cost" :id="ids.unitCost + '-err'" class="field-error">{{ errors.unit_cost }}</p>
                </div>
              </div>

              <div class="field">
                <label :for="ids.date">{{ t('purchaseOrder.expectedDelivery') }}</label>
                <input
                  :id="ids.date"
                  v-model="form.expected_delivery_date"
                  type="date"
                  :min="today"
                  :aria-invalid="!!errors.expected_delivery_date"
                  :aria-describedby="errors.expected_delivery_date ? ids.date + '-err' : undefined"
                />
                <p v-if="errors.expected_delivery_date" :id="ids.date + '-err'" class="field-error">{{ errors.expected_delivery_date }}</p>
              </div>

              <div class="field">
                <label :for="ids.notes">{{ t('purchaseOrder.notes') }}</label>
                <textarea
                  :id="ids.notes"
                  v-model="form.notes"
                  rows="3"
                  maxlength="500"
                  :aria-invalid="!!errors.notes"
                  :aria-describedby="errors.notes ? ids.notes + '-err' : undefined"
                ></textarea>
                <p v-if="errors.notes" :id="ids.notes + '-err'" class="field-error">{{ errors.notes }}</p>
              </div>

              <p v-if="submitError" class="form-error" role="alert">{{ submitError }}</p>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="close">{{ t('common.cancel') }}</button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? t('purchaseOrder.submitting') : t('purchaseOrder.submit') }}
              </button>
            </div>
          </form>

          <!-- VIEW -->
          <template v-else>
            <div class="modal-body" :aria-busy="viewLoading">
              <div v-if="viewLoading" class="state-text">{{ t('common.loading') }}</div>
              <div v-else-if="viewError" class="form-error" role="alert">
                <p>{{ t('purchaseOrder.loadFailed') }} {{ viewError }}</p>
                <button type="button" class="btn-secondary" @click="loadPO">{{ t('common.retry') }}</button>
              </div>
              <dl v-else-if="po" class="info-grid">
                <div class="info-item">
                  <dt class="info-label">{{ t('purchaseOrder.poId') }}</dt>
                  <dd class="info-value mono">{{ po.id }}</dd>
                </div>
                <div class="info-item">
                  <dt class="info-label">{{ t('purchaseOrder.supplier') }}</dt>
                  <dd class="info-value">{{ po.supplier_name }}</dd>
                </div>
                <div class="info-item">
                  <dt class="info-label">{{ t('purchaseOrder.quantity') }}</dt>
                  <dd class="info-value">{{ po.quantity }}</dd>
                </div>
                <div class="info-item">
                  <dt class="info-label">{{ t('purchaseOrder.unitCostDisplay') }}</dt>
                  <dd class="info-value">{{ formatMoney(po.unit_cost, currentCurrency, { decimals: 2 }) }}</dd>
                </div>
                <div class="info-item">
                  <dt class="info-label">{{ t('purchaseOrder.total') }}</dt>
                  <dd class="info-value">{{ formatMoney(po.quantity * po.unit_cost, currentCurrency, { decimals: 2 }) }}</dd>
                </div>
                <div class="info-item">
                  <dt class="info-label">{{ t('purchaseOrder.expectedDelivery') }}</dt>
                  <dd class="info-value">{{ formatDate(po.expected_delivery_date, currentLocale) }}</dd>
                </div>
                <div class="info-item">
                  <dt class="info-label">{{ t('purchaseOrder.status') }}</dt>
                  <dd class="info-value">{{ po.status }}</dd>
                </div>
                <div class="info-item">
                  <dt class="info-label">{{ t('purchaseOrder.createdDate') }}</dt>
                  <dd class="info-value">{{ formatDate(po.created_date, currentLocale) }}</dd>
                </div>
                <div class="info-item notes-item">
                  <dt class="info-label">{{ t('purchaseOrder.notesLabel') }}</dt>
                  <dd class="info-value">{{ po.notes || t('purchaseOrder.noNotes') }}</dd>
                </div>
              </dl>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="close">{{ t('common.close') }}</button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { api, formatApiError } from '../api'
import { useI18n } from '../composables/useI18n'
import { useModalA11y } from '../composables/useModalA11y'
import { formatMoney, formatDate } from '../utils/format'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  backlogItem: { type: Object, default: null },
  mode: { type: String, default: 'create' }
})

const emit = defineEmits(['close', 'po-created'])

const { t, currentLocale, currentCurrency, translateProductName } = useI18n()

// Unique per instance so ids stay valid if the modal is ever mounted twice
const uid = Math.random().toString(36).slice(2, 8)
const titleId = `po-title-${uid}`
const ids = {
  supplier: `po-supplier-${uid}`,
  quantity: `po-quantity-${uid}`,
  unitCost: `po-unit-cost-${uid}`,
  date: `po-date-${uid}`,
  notes: `po-notes-${uid}`
}

const dialogRef = ref(null)
const close = () => emit('close')
useModalA11y(() => props.isOpen, dialogRef, close)

// Local-date YYYY-MM-DD; toISOString would shift the day for users ahead of/behind UTC
const toDateInput = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const today = ref(toDateInput(new Date()))

const form = reactive({
  supplier_name: '',
  quantity: 1,
  unit_cost: '',
  expected_delivery_date: '',
  notes: ''
})
const errors = reactive({})
const submitting = ref(false)
const submitError = ref('')

const po = ref(null)
const viewLoading = ref(false)
const viewError = ref('')
let viewRequest = 0

const resetForm = () => {
  const now = new Date()
  const due = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14)
  today.value = toDateInput(now)
  const shortage = props.backlogItem
    ? props.backlogItem.quantity_needed - props.backlogItem.quantity_available
    : 1
  form.supplier_name = ''
  form.quantity = Math.max(1, shortage)
  form.unit_cost = ''
  form.expected_delivery_date = toDateInput(due)
  form.notes = ''
  Object.keys(errors).forEach((k) => delete errors[k])
  submitError.value = ''
  submitting.value = false
}

const loadPO = async () => {
  if (!props.backlogItem) return
  // Token guards against a slow response for a previous item landing after reopening
  const mine = ++viewRequest
  viewLoading.value = true
  viewError.value = ''
  po.value = null
  try {
    const data = await api.getPurchaseOrderByBacklogItem(props.backlogItem.id)
    if (mine !== viewRequest) return
    po.value = data
  } catch (err) {
    if (mine !== viewRequest) return
    viewError.value = formatApiError(err).message
  } finally {
    if (mine === viewRequest) viewLoading.value = false
  }
}

// Reset/load each time the modal opens (or is reopened for another item)
watch(
  () => [props.isOpen, props.backlogItem && props.backlogItem.id, props.mode],
  ([open]) => {
    if (!open || !props.backlogItem) {
      viewRequest++ // invalidate any in-flight view load
      return
    }
    if (props.mode === 'view') loadPO()
    else resetForm()
  },
  { immediate: true }
)

// Same limits as the server; returns true when valid
const validate = () => {
  Object.keys(errors).forEach((k) => delete errors[k])
  const supplier = form.supplier_name.trim()
  if (!supplier) errors.supplier_name = t('purchaseOrder.errors.supplierRequired')
  else if (supplier.length > 120) errors.supplier_name = t('purchaseOrder.errors.supplierTooLong')

  const qty = Number(form.quantity)
  if (form.quantity === '' || !Number.isInteger(qty) || qty < 1 || qty > 1000000) {
    errors.quantity = t('purchaseOrder.errors.quantityInvalid')
  }

  const cost = Number(form.unit_cost)
  if (form.unit_cost === '' || form.unit_cost === null || !Number.isFinite(cost) || cost <= 0) {
    errors.unit_cost = t('purchaseOrder.errors.unitCostInvalid')
  }

  // YYYY-MM-DD strings compare correctly as text
  if (!form.expected_delivery_date) errors.expected_delivery_date = t('purchaseOrder.errors.dateRequired')
  else if (form.expected_delivery_date < today.value) errors.expected_delivery_date = t('purchaseOrder.errors.dateInPast')

  if ((form.notes || '').length > 500) errors.notes = t('purchaseOrder.errors.notesTooLong')
  return Object.keys(errors).length === 0
}

const submit = async () => {
  if (submitting.value || !validate()) return
  submitting.value = true
  submitError.value = ''
  try {
    const created = await api.createPurchaseOrder({
      backlog_item_id: String(props.backlogItem.id),
      supplier_name: form.supplier_name.trim(),
      quantity: Number(form.quantity),
      unit_cost: Number(form.unit_cost),
      expected_delivery_date: form.expected_delivery_date,
      notes: form.notes
    })
    emit('po-created', created)
    emit('close')
  } catch (err) {
    // Keep the form open with the user's input so they can correct and retry
    submitError.value = formatApiError(err).message
  } finally {
    submitting.value = false
  }
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-container:focus {
  outline: none;
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

.close-button:focus-visible,
.btn-secondary:focus-visible,
.btn-primary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.item-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-surface-subtle);
  border-bottom: 1px solid var(--color-border);
  font-size: 0.875rem;
  color: var(--color-text);
}

.item-banner-label {
  color: var(--color-text-muted);
  font-size: 0.813rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.item-sku {
  color: var(--color-text-muted);
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.813rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.field-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.field label {
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.field input,
.field textarea {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-surface);
}

.field input:focus-visible,
.field textarea:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
  border-color: var(--color-accent);
}

.field input[aria-invalid='true'],
.field textarea[aria-invalid='true'] {
  border-color: #ef4444;
}

.field-hint {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.field-error {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-negative);
}

.form-error {
  padding: 0.75rem 1rem;
  background: var(--color-danger-soft);
  border: 1px solid var(--color-danger-bg);
  border-radius: 8px;
  color: var(--color-danger-text);
  font-size: 0.875rem;
}

.form-error p {
  margin: 0 0 0.75rem 0;
}

.state-text {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notes-item {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.813rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.info-value {
  margin: 0;
  font-size: 0.938rem;
  color: var(--color-text);
  font-weight: 500;
  overflow-wrap: anywhere;
}

.info-value.mono {
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

.btn-primary {
  padding: 0.625rem 1.25rem;
  background: var(--color-accent);
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  color: white;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
</style>
