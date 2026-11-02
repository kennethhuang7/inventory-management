<template>
  <div ref="rootRef" class="profile-menu" @focusout="onFocusOut" @keydown="onKeydown">
    <button
      ref="triggerRef"
      type="button"
      class="profile-button"
      aria-haspopup="menu"
      :aria-expanded="isDropdownOpen"
      @click="toggleDropdown"
    >
      <div class="avatar">
        {{ getInitials(currentUser.name) }}
      </div>
      <span class="profile-name">{{ currentUser.name }}</span>
      <svg
        class="chevron"
        :class="{ 'chevron-open': isDropdownOpen }"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <div v-if="isDropdownOpen" class="dropdown-menu" role="menu" :aria-label="t('profile.menu')">
      <div class="dropdown-header">
        <div class="avatar-large">
          {{ getInitials(currentUser.name) }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ currentUser.name }}</div>
          <div class="user-email">{{ currentUser.email }}</div>
        </div>
      </div>

      <div class="dropdown-divider"></div>

      <button
        type="button"
        role="menuitem"
        class="dropdown-item"
        @click="showProfileDetails"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M9 9C10.6569 9 12 7.65685 12 6C12 4.34315 10.6569 3 9 3C7.34315 3 6 4.34315 6 6C6 7.65685 7.34315 9 9 9Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M15 15C15 12.7909 12.3137 11 9 11C5.68629 11 3 12.7909 3 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        {{ t('profile.profileDetails') }}
      </button>

      <button
        type="button"
        role="menuitem"
        class="dropdown-item"
        @click="showTasks"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M15 3H3C2.44772 3 2 3.44772 2 4V14C2 14.5523 2.44772 15 3 15H15C15.5523 15 16 14.5523 16 14V4C16 3.44772 15.5523 3 15 3Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M6 7L8 9L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ t('profile.myTasks') }}
        <span v-if="pendingTaskCount > 0" class="task-badge">{{ pendingTaskCount }}</span>
      </button>

      <div class="dropdown-divider"></div>

      <button
        type="button"
        role="menuitem"
        class="dropdown-item logout"
        @click="handleLogout"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M7 15H4C3.44772 15 3 14.5523 3 14V4C3 3.44772 3.44772 3 4 3H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M11 12L15 9M15 9L11 6M15 9H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ t('profile.logout') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useI18n } from '../composables/useI18n'

const { currentUser, logout, getInitials } = useAuth()
const { t } = useI18n()

const isDropdownOpen = ref(false)
const emit = defineEmits(['show-profile-details', 'show-tasks'])

const rootRef = ref(null)
const triggerRef = ref(null)

const pendingTaskCount = computed(() => {
  return currentUser.value.tasks.filter(task => task.status === 'pending').length
})

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Closing always returns focus to the trigger so keyboard users keep their place
const closeMenu = ({ restoreFocus = true } = {}) => {
  if (!isDropdownOpen.value) return
  isDropdownOpen.value = false
  if (restoreFocus) triggerRef.value?.focus()
}

const getItems = () => [...(rootRef.value?.querySelectorAll('[role="menuitem"]') || [])]

const onKeydown = (event) => {
  if (!isDropdownOpen.value) return
  if (event.key === 'Escape') {
    event.stopPropagation()
    closeMenu()
    return
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  event.preventDefault()
  const items = getItems()
  if (!items.length) return
  const index = items.indexOf(document.activeElement)
  const step = event.key === 'ArrowDown' ? 1 : -1
  // From the trigger (index -1) ArrowDown goes to the first item and ArrowUp to the last
  const next = index === -1 ? (step === 1 ? 0 : items.length - 1) : (index + step + items.length) % items.length
  items[next].focus()
}

// Replaces the old blur + setTimeout, which closed the menu before Tab could reach the items.
// relatedTarget is null when focus leaves the window; keep the menu open then.
const onFocusOut = (event) => {
  const next = event.relatedTarget
  if (next && !rootRef.value?.contains(next)) closeMenu({ restoreFocus: false })
}

const onDocumentClick = (event) => {
  if (!rootRef.value?.contains(event.target)) closeMenu({ restoreFocus: false })
}

// The document listener only exists while the menu is open
watch(isDropdownOpen, (open) => {
  if (open) {
    // Defer so the click that opened the menu is not seen as an outside click
    nextTick(() => document.addEventListener('click', onDocumentClick))
  } else {
    document.removeEventListener('click', onDocumentClick)
  }
})
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))

const showProfileDetails = () => {
  closeMenu()
  emit('show-profile-details')
}

const showTasks = () => {
  closeMenu()
  emit('show-tasks')
}

const handleLogout = () => {
  closeMenu()
  logout()
}
</script>

<style scoped>
/* NOTE: the whole selector must sit inside :global(). Writing `:global(.app-shell.collapsed) .x` makes Vue's scoped
   compiler drop the `.x` part, leaving `.app-shell.collapsed { display: none }`, which blanks the entire app. */
/* Collapsed rail: show only the avatar; dropdown opens to the right of the rail */
:global(.app-shell.collapsed .profile-name),
:global(.app-shell.collapsed .profile-button .chevron) {
  display: none;
}

:global(.app-shell.collapsed .profile-button) {
  justify-content: center;
  padding: 0.375rem;
}

:global(.app-shell.collapsed .dropdown-menu) {
  bottom: 0;
  left: calc(100% + 0.5rem);
}

/* The drawer on mobile always shows labels, regardless of collapsed state */
@media (max-width: 767px) {
  :global(.app-shell.collapsed .profile-name) {
    display: block;
  }

  :global(.app-shell.collapsed .profile-button .chevron) {
    display: block;
  }

  :global(.app-shell.collapsed .profile-button) {
    justify-content: flex-start;
    padding: 0.5rem 0.875rem;
  }

  :global(.app-shell.collapsed .dropdown-menu) {
    bottom: calc(100% + 0.5rem);
    left: 0;
  }
}

.profile-menu {
  position: relative;
}

.profile-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.875rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.profile-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.025em;
}

.profile-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
}

.chevron {
  color: #64748b;
  transition: transform 0.2s ease;
}

.chevron-open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  /* Footer widget: open upward so the menu is not cut off at the viewport bottom */
  bottom: calc(100% + 0.5rem);
  left: 0;
  min-width: 280px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  padding: 1rem;
  display: flex;
  gap: 0.875rem;
  align-items: center;
  background: #f8fafc;
}

.avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.025em;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.938rem;
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.813rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.5rem 0;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.dropdown-item:hover {
  background: #f8fafc;
}

/* Inset ring: the menu has overflow hidden, so an outer outline would be clipped */
.dropdown-item:focus-visible {
  background: #f8fafc;
  outline: 2px solid #2563eb;
  outline-offset: -2px;
}

.profile-button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.dropdown-item svg {
  color: #64748b;
  flex-shrink: 0;
}

.dropdown-item.logout {
  color: #dc2626;
}

.dropdown-item.logout svg {
  color: #dc2626;
}

.dropdown-item.logout:hover {
  background: #fef2f2;
}

.task-badge {
  margin-left: auto;
  background: #2563eb;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}
</style>
