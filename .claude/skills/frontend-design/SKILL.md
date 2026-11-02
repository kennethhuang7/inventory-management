---
name: frontend-design
description: Redesign a Vue 3 application's UI into a modern SaaS-style interface with a collapsible left sidebar instead of a top nav bar, consistent spacing, and a polished professional look. Use this skill when asked to restyle the app shell, move navigation to a sidebar, or give the UI a modern SaaS look.
---

# SaaS Sidebar Redesign

Turn a Vue 3 app with a top navigation bar into a SaaS-style shell: a left vertical sidebar (collapsible to an icon rail, off-canvas drawer on mobile), a fluid content area, and consistent design tokens. The skill is generic. Discover how the app is built first, then apply the patterns below. Do not assume file names.

## 1. Discover First

Read before editing, then report what you found.

- **Shell**: the root component that renders the header and `<router-view />` (usually `App.vue`).
- **Router**: where routes are registered (usually `main.js` or `router/index.js`). Nav items come from these routes.
- **Global styles**: the unscoped `<style>` block or CSS file. Note existing colors, spacing, card/table/badge classes.
- **Top-nav assumptions** that a sidebar breaks:
  - `position: sticky; top: <header height>` on other bars (filter bars, table headers).
  - `min-height: calc(100vh - <header>)` or fixed header offsets.
  - Centered `max-width` containers sized for a full-width page.
- **Header widgets**: language switcher, profile menu, notifications, task buttons, search, filters.
- **Overlays**: modals (`position: fixed`), dropdowns, tooltips, and their `z-index` values.
- **i18n**: whether nav labels use a translation function and which locale files exist.
- **Project rules**: read `CLAUDE.md` for design-system limits and delegation rules (see section 10).

```bash
grep -rn "position: *\(sticky\|fixed\)\|z-index\|@media\|100vh" client/src
```

## 2. Design Tokens

Add CSS variables to the global style and use them in all shell styles. Keep the project's existing palette if it has one; otherwise use the defaults below.

```css
:root {
  /* Color */
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-border: #e2e8f0;
  --color-text: #0f172a;
  --color-text-muted: #64748b;
  --color-accent: #2563eb;
  --color-accent-soft: #eff6ff;

  /* Spacing scale (4px base) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Shape */
  --radius-sm: 6px;
  --radius-md: 10px;
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06);

  /* Layout */
  --sidebar-width: 240px;
  --sidebar-width-collapsed: 64px;
  --topbar-height: 56px; /* mobile top bar only */

  /* Layering: sidebar must sit below dropdowns and modals */
  --z-sidebar: 50;
  --z-drawer-backdrop: 60;
  --z-drawer: 70;
  --z-dropdown: 1000;
  --z-modal: 2000;
}
```

Rules:
- One spacing scale. Replace ad hoc `1.25rem`, `18px` and similar values in shell and shared card styles.
- One radius and one shadow for cards.
- Do not change status colors (green, blue, yellow, red).

## 3. Layout Structure

Use a two-column grid. The sidebar is full height; the main column scrolls.

```vue
<div class="app-shell" :class="{ collapsed, 'drawer-open': drawerOpen }">
  <aside class="sidebar" aria-label="Primary">
    <div class="sidebar-brand">...</div>
    <nav class="sidebar-nav">...</nav>
    <div class="sidebar-footer">...</div>
  </aside>
  <div class="main-column">
    <header class="mobile-topbar">...</header>
    <!-- Existing sticky bars (e.g. filters) go here -->
    <main class="main-content"><router-view /></main>
  </div>
</div>
```

```css
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100vh;
  transition: grid-template-columns 0.2s ease;
}
.app-shell.collapsed { grid-template-columns: var(--sidebar-width-collapsed) minmax(0, 1fr); }

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  z-index: var(--z-sidebar);
}
.main-content { padding: var(--space-6) var(--space-8); max-width: 1600px; width: 100%; }
```

- `minmax(0, 1fr)` stops wide tables from stretching the grid.
- Remove the old header, its sticky offset, and any `top: <header height>` on other bars. Set those to `top: 0` (or the mobile top bar height under 768px).
- Keep the page-level `max-width` but do not center it with auto margins unless the design needs it.

## 4. Navigation Items

Generate items from the router so they stay in sync.

```js
const navItems = router.getRoutes()
  .filter(r => r.meta?.nav !== false && r.path !== '/:pathMatch(.*)*')
  .map(r => ({ path: r.path, label: r.meta?.label || r.name }))
```

If routes carry no metadata, use an explicit array in the shell component instead, with `path`, `labelKey` (or `label`), and `icon`.

- Use `<router-link>` with `active-class` rather than manual `$route.path ===` checks. Use `exact-active-class` for `/`.
- Active state: tinted pill (`--color-accent-soft` background, `--color-accent` text) with a 3px left accent bar. Remove the top-bar underline (`::after` at `bottom: -1px`).
- Hover: subtle background, 150ms transition.
- Add `:focus-visible` outlines to every interactive element.

## 5. Inline SVG Icons

Do not add an icon dependency. Draw one inline SVG per nav item.

```vue
<svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none"
     stroke="currentColor" stroke-width="1.75" stroke-linecap="round"
     stroke-linejoin="round" aria-hidden="true">
  <path d="M3 12l9-9 9 9M5 10v10h14V10" />
</svg>
```

- 24x24 viewBox, `stroke="currentColor"`, no fills, consistent stroke width.
- Decorative icons get `aria-hidden="true"`; the label supplies the accessible name.
- Keep icon paths in a small map (`icons.js`) or an `Icon` component if more than a handful are needed.
- No emojis anywhere in the UI.

## 6. Collapsible Icon Rail

```js
const collapsed = ref(false)
try { collapsed.value = localStorage.getItem('sidebar-collapsed') === '1' } catch (e) { /* storage unavailable */ }
watch(collapsed, v => {
  try { localStorage.setItem('sidebar-collapsed', v ? '1' : '0') } catch (e) { /* ignore */ }
})
```

- A toggle button in the brand row with `aria-expanded` and an accessible label.
- Collapsed: hide labels (`.nav-label { display: none }`), center icons, show the label via `title` on each link, hide brand subtitle text.
- Always wrap `localStorage` access in try/catch; it can throw in private windows.
- Collapse applies on desktop only. On mobile the sidebar is a drawer (next section).

## 7. Mobile Drawer

Below 768px the sidebar leaves the grid and becomes an off-canvas drawer.

```css
@media (max-width: 767px) {
  .app-shell, .app-shell.collapsed { grid-template-columns: minmax(0, 1fr); }
  .sidebar {
    position: fixed; inset: 0 auto 0 0;
    width: var(--sidebar-width);
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    z-index: var(--z-drawer);
  }
  .app-shell.drawer-open .sidebar { transform: translateX(0); }
  .mobile-topbar { display: flex; height: var(--topbar-height); position: sticky; top: 0; }
}
@media (min-width: 768px) { .mobile-topbar, .drawer-backdrop { display: none; } }
```

- Slim top bar with a hamburger button (`aria-label`, `aria-expanded`) and the brand.
- A backdrop element (`z-index: var(--z-drawer-backdrop)`) closes the drawer on click.
- Close the drawer on route change (`watch(() => route.path, ...)`) and on Escape.
- In the drawer, ignore the collapsed state and always show labels.

## 8. Footer Widgets

Move header widgets (profile menu, language switcher, task/notification buttons) into `.sidebar-footer`.

- Preserve every prop, event and piece of state. Only relocate the components in the template.
- Existing dropdowns usually open downward and right-aligned (`top: calc(100% + 0.5rem); right: 0`). In the footer they must open upward or to the right: use `bottom: calc(100% + 0.5rem); left: 0`, or `left: 100%` in the collapsed rail.
- In the collapsed rail show only the avatar or icon for each widget.
- Keep dropdowns at `z-index: var(--z-dropdown)` so they are not clipped by the sidebar. If the sidebar has `overflow: hidden`, move the dropdown to the sidebar's non-clipping layer or use `overflow: visible` on the footer.

## 9. Layering

Sidebar below dropdowns, dropdowns below or equal to modals, modals above everything.

| Layer | z-index |
|-------|---------|
| Sticky page bars | 40 |
| Sidebar | 50 |
| Drawer backdrop / drawer | 60 / 70 |
| Dropdowns | 1000 |
| Modals | 2000 |

Audit existing values from step 1. If a modal sits at or below the sidebar's z-index, raise the modal. Modals use `position: fixed` with a full-viewport overlay, so they cover the sidebar without other changes.

## 10. Polish Checklist

- Page header pattern: title, muted description, optional right-aligned actions; same margins on every page.
- Cards: shared padding (`--space-4` to `--space-6`), `--radius-md`, 1px border, `--shadow-sm`.
- Tables: consistent cell padding, muted uppercase headers, row hover, horizontal scroll container.
- Buttons and inputs: consistent height, radius, focus ring.
- Transitions: 150-200ms on hover, collapse and drawer; respect `prefers-reduced-motion`.
- Text contrast meets WCAG AA against the surface.
- Test long labels and long translations (for example Japanese or German) so nav text truncates with an ellipsis instead of wrapping.

## 11. Project Rules and Delegation

Check `CLAUDE.md` and `.claude/agents/` before editing.

- **Subagent delegation**: if the project requires a specific agent for `.vue` changes (this repo requires `vue-expert` for any create or significant modification of a `.vue` file), delegate those edits with a precise brief covering sections 2-10. Do not edit `.vue` files directly in that case.
- **Design system**: follow documented palettes and rules (for example slate/gray colors, custom SVG charts, CSS Grid layouts, no emojis).
- **i18n**: add keys for every new string (for example the Reports label if it was hardcoded, "Collapse sidebar", "Open menu") to all locale files.
- **Filters and shared state**: do not change composables, API clients or data flow. Only relocate UI.
- **Comments**: document non-obvious logic changes with a comment explaining why.
- Use unique `v-for` keys (path or id), never the index.

## 12. Verification

1. Build: run the production build (for example `cd client && npm run build`) and fix errors.
2. Start the dev servers and open each route.
3. Desktop (1280px+): sidebar visible, active item highlighted, collapse toggle works and persists after reload.
4. Mobile (about 375px): sidebar hidden, hamburger opens the drawer, backdrop and Escape close it, navigating closes it, no horizontal page scroll.
5. Overlays: open every modal and the footer dropdowns; confirm they appear above the sidebar and are not clipped.
6. Sticky bars (filters, table headers) stick at the right offset and do not overlap the mobile top bar.
7. Existing features still work (filters, language switch, profile, tasks).
8. Check the browser console for new errors. Note pre-existing ones separately so they are not blamed on the redesign.
9. Use browser automation (Playwright MCP, if connected) for screenshots at both widths; otherwise verify manually.

## Key Reminders

- Discover the shell, router, styles, sticky offsets and z-index values before editing.
- Tokens first: one spacing scale, one radius, one shadow, one z-index scale.
- Sidebar: grid column on desktop, collapsible rail with localStorage in try/catch, off-canvas drawer below 768px.
- Nav from routes, `router-link` active classes, inline SVG icons, no emojis.
- Relocate header widgets to the footer without changing their state or events; dropdowns open upward.
- Fix every `top: <header height>` offset left behind by the old top nav.
- Respect project rules: subagent delegation for `.vue`, design system, i18n in all locales.
- Verify with a build and both desktop and mobile widths before calling it done.
