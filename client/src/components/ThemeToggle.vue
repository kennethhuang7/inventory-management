<template>
  <button
    type="button"
    class="theme-button"
    :aria-label="isDark ? t('theme.switchToLight') : t('theme.switchToDark')"
    :aria-pressed="isDark"
    :title="isDark ? t('theme.switchToLight') : t('theme.switchToDark')"
    @click="toggleTheme"
  >
    <!-- Icon shows the theme the click will switch to -->
    <svg v-if="isDark" class="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
    <svg v-else class="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
    <span class="theme-label">{{ isDark ? t('theme.lightMode') : t('theme.darkMode') }}</span>
  </button>
</template>

<script>
import { useTheme } from '../composables/useTheme'
import { useI18n } from '../composables/useI18n'

export default {
  name: 'ThemeToggle',
  setup() {
    const { isDark, toggleTheme } = useTheme()
    const { t } = useI18n()
    return { isDark, toggleTheme, t }
  }
}
</script>

<style scoped>
.theme-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.theme-button:hover {
  background: var(--color-surface-subtle);
  border-color: var(--color-border-strong);
}

.theme-button:focus-visible {
  outline: 2px solid var(--color-accent-text);
  outline-offset: 2px;
}

.theme-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.theme-label {
  flex: 1;
  text-align: left;
}

/* NOTE: the whole selector must sit inside :global(); see the same note in LanguageSwitcher.vue. */
/* Collapsed rail: icon only, centered */
:global(.app-shell.collapsed .theme-label) {
  display: none;
}

:global(.app-shell.collapsed .theme-button) {
  justify-content: center;
  padding: 0.5rem;
}

/* The drawer on mobile always shows labels, regardless of collapsed state */
@media (max-width: 767px) {
  :global(.app-shell.collapsed .theme-label) {
    display: block;
  }

  :global(.app-shell.collapsed .theme-button) {
    justify-content: flex-start;
    padding: 0.5rem 0.875rem;
  }
}
</style>
