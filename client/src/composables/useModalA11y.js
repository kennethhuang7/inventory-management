import { watch, nextTick, onBeforeUnmount } from 'vue'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Keyboard and screen-reader behavior every modal dialog needs:
 * - Escape closes it
 * - Tab and Shift+Tab stay inside it (focus trap)
 * - focus moves into the dialog when it opens and returns to the element that opened it
 *
 * Pair it with role="dialog" aria-modal="true" aria-labelledby="..." and tabindex="-1" on the
 * dialog element (the template ref passed as `dialogRef`).
 *
 * @param isOpen    ref<boolean> or getter returning whether the modal is open
 * @param dialogRef template ref to the dialog element
 * @param close     function that closes the modal
 */
export function useModalA11y(isOpen, dialogRef, close) {
  let opener = null

  const visibleFocusable = (root) =>
    [...root.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    )

  const onKeydown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      close()
      return
    }
    if (event.key !== 'Tab') return

    const root = dialogRef.value
    if (!root) return
    const items = visibleFocusable(root)
    if (items.length === 0) {
      event.preventDefault()
      root.focus()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === root)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  watch(
    () => (typeof isOpen === 'function' ? isOpen() : isOpen.value),
    async (open) => {
      if (open) {
        opener = document.activeElement
        document.addEventListener('keydown', onKeydown)
        // Wait for the dialog to render before moving focus into it
        await nextTick()
        const root = dialogRef.value
        if (root) (root.querySelector('[autofocus]') || visibleFocusable(root)[0] || root).focus()
      } else {
        document.removeEventListener('keydown', onKeydown)
        if (opener && document.contains(opener)) opener.focus()
        opener = null
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
}
