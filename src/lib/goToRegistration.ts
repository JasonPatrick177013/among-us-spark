/** Scrolls to the registration section and moves keyboard focus to its first field. Respects reduced-motion. */
export function goToRegistration() {
  const section = document.getElementById('register')
  if (!section) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', '#register')
  window.setTimeout(
    () => document.getElementById('field-name')?.focus({ preventScroll: true }),
    reduce ? 0 : 700,
  )
}
