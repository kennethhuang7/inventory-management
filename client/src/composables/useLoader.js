import { ref, computed } from 'vue'
import { formatApiError } from '../api'

/**
 * Loading and error state for a view's data fetch.
 *
 * Fixes the problems the old per-view loaders had:
 * - `error` is cleared whenever a load succeeds (it used to stick until a page reload)
 * - a slow response that arrives after a newer request cannot overwrite the newer data
 * - after the first load, refreshes (such as changing a filter) keep the old data on screen
 *   instead of replacing the whole page with "Loading..."
 *
 * Usage:
 *   const { loading, refreshing, error, errorMessage, hasLoaded, run } = useLoader(async (isCurrent) => {
 *     const data = await api.getThing(filters)
 *     if (!isCurrent()) return   // a newer load has started; drop this result
 *     things.value = data
 *   })
 *
 * Template: show the loading state while `loading`; show content when `hasLoaded`; show an
 * <ErrorState> when `error` (above the content when stale data is still available).
 */
export function useLoader(load) {
  const loading = ref(true) // true until the first load finishes
  const refreshing = ref(false) // later loads
  const hasLoaded = ref(false)
  const error = ref(null)
  let latest = 0

  const errorMessage = computed(() => (error.value ? formatApiError(error.value).message : ''))

  const run = async () => {
    const mine = ++latest
    const isCurrent = () => mine === latest
    if (hasLoaded.value) refreshing.value = true
    else loading.value = true

    try {
      await load(isCurrent)
      if (isCurrent()) {
        error.value = null
        hasLoaded.value = true
      }
    } catch (err) {
      // An error from a superseded request is irrelevant
      if (isCurrent()) error.value = err
    } finally {
      // Only the newest request may end the loading state, otherwise an old request's
      // `finally` would hide the spinner while a newer request is still in flight
      if (isCurrent()) {
        loading.value = false
        refreshing.value = false
      }
    }
  }

  return { loading, refreshing, hasLoaded, error, errorMessage, run }
}
