import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'app-theme'

// localStorage can throw (private windows, blocked site data), so every access is guarded
const readSaved = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}

const systemQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
const systemTheme = () => (systemQuery && systemQuery.matches ? 'dark' : 'light')

// Module-level state so every component shares one theme. `saved` is null until the user
// makes an explicit choice; until then the theme follows the operating system setting.
const saved = ref(readSaved())
const theme = ref(saved.value ?? systemTheme())

watch(
  theme,
  (value) => {
    document.documentElement.dataset.theme = value
  },
  { immediate: true }
)

if (systemQuery) {
  systemQuery.addEventListener('change', () => {
    if (saved.value === null) theme.value = systemTheme()
  })
}

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  const setTheme = (value) => {
    saved.value = value
    theme.value = value
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // The choice still applies for this session
    }
  }

  const toggleTheme = () => setTheme(isDark.value ? 'light' : 'dark')

  return { theme, isDark, setTheme, toggleTheme }
}
