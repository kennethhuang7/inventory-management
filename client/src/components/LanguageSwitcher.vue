<template>
  <div ref="rootRef" class="language-switcher" @focusout="onFocusOut" @keydown="onKeydown">
    <button
      ref="triggerRef"
      type="button"
      class="language-button"
      aria-haspopup="menu"
      :aria-expanded="isDropdownOpen"
      :aria-label="t('language.selectLanguage')"
      @click="toggleDropdown"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        class="globe-icon"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.5"/>
        <path d="M3 10H17" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 3C10 3 7.5 5.5 7.5 10C7.5 14.5 10 17 10 17" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 3C10 3 12.5 5.5 12.5 10C12.5 14.5 10 17 10 17" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <span class="language-label">{{ localeName }}</span>
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

    <div v-if="isDropdownOpen" class="dropdown-menu" role="menu" :aria-label="t('language.selectLanguage')">
      <button
        v-for="locale in availableLocales"
        :key="locale"
        type="button"
        role="menuitem"
        class="dropdown-item"
        :class="{ active: currentLocale === locale }"
        :aria-current="currentLocale === locale ? 'true' : undefined"
        @click="selectLanguage(locale)"
      >
        <span class="language-name">{{ getLanguageName(locale) }}</span>
        <svg
          v-if="currentLocale === locale"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          class="check-icon"
          aria-hidden="true"
        >
          <path d="M4 9L7.5 12.5L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useI18n } from '../composables/useI18n'

const { t, currentLocale, setLocale, availableLocales, localeName } = useI18n()

const isDropdownOpen = ref(false)
const rootRef = ref(null)
const triggerRef = ref(null)

const languageNames = {
  en: 'English',
  ja: '日本語'
}

const getLanguageName = (locale) => {
  return languageNames[locale] || locale
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Closing returns focus to the trigger so keyboard users keep their place
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

const selectLanguage = (locale) => {
  setLocale(locale)
  closeMenu()
}
</script>

<style scoped>
/* NOTE: the whole selector must sit inside :global(); see the same note in ProfileMenu.vue. */
/* Collapsed rail: icon only; dropdown opens to the right of the rail */
:global(.app-shell.collapsed .language-label),
:global(.app-shell.collapsed .language-button .chevron) {
  display: none;
}

:global(.app-shell.collapsed .language-button) {
  justify-content: center;
  padding: 0.5rem;
}

:global(.app-shell.collapsed .dropdown-menu) {
  bottom: 0;
  left: calc(100% + 0.5rem);
}

/* The drawer on mobile always shows labels, regardless of collapsed state */
@media (max-width: 767px) {
  :global(.app-shell.collapsed .language-label) {
    display: block;
  }

  :global(.app-shell.collapsed .language-button .chevron) {
    display: block;
  }

  :global(.app-shell.collapsed .language-button) {
    justify-content: flex-start;
    padding: 0.5rem 0.875rem;
  }

  :global(.app-shell.collapsed .dropdown-menu) {
    bottom: calc(100% + 0.5rem);
    left: 0;
  }
}

.language-switcher {
  position: relative;
}

.language-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 0.875rem;
  color: #334155;
}

.language-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.globe-icon {
  color: #64748b;
  flex-shrink: 0;
}

.language-label {
  flex: 1;
  text-align: left;
  font-weight: 500;
}

.chevron {
  color: #64748b;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chevron-open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  /* Footer widget: open upward so the menu is not cut off at the viewport bottom */
  bottom: calc(100% + 0.5rem);
  left: 0;
  min-width: 160px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.dropdown-item:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
}

.language-button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.dropdown-item.active {
  background: #eff6ff;
  color: #2563eb;
}

.language-name {
  flex: 1;
}

.check-icon {
  color: #2563eb;
  flex-shrink: 0;
}
</style>
