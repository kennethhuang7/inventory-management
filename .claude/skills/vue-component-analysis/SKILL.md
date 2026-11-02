---
name: vue-component-analysis
description: Analyze Vue 3 component structure and produce a prioritized report of performance optimizations and code-reuse opportunities (duplicated helpers, extractable components and composables, oversized components, render-cost problems). Use this skill when asked to review, audit, or optimize Vue components, find duplicated code, or suggest refactors for performance or reuse.
---

# Vue Component Analysis

Analyze a Vue 3 codebase and report concrete, ranked suggestions for performance and code reuse. The skill is generic: discover how the app is built first, then apply the checks below. Do not assume file names or API style.

**Default mode is report only.** Do not edit files unless the user asks for the changes to be applied. When they do, follow section 9.

## 1. Discover and Inventory

Measure before judging. Collect, and report briefly:

- Component files and line counts (largest first): `find src -name '*.vue' -exec wc -l {} + | sort -rn | head -20` (`find` recurses in any shell; a `src/**/*.vue` glob does not in bash and would skip `src/App.vue`)
- Script style per file: `<script setup>`, `setup()` in `export default`, or Options API (`data()`/`methods`). Note mixed styles.
- Shared logic locations: `composables/`, `utils/`, any API client module.
- Where state lives: module-level singleton refs vs per-component refs.
- Router, build tool, and whether a frontend test suite or linter exists (it decides how changes can be verified).
- Project rules: read `CLAUDE.md` and any `client/CLAUDE.md` for conventions that constrain suggestions (palette, i18n, key rules, which agent must edit `.vue` files).

## 2. Structure Checks

For each component, flag:

- **Size**: template over about 100 lines or script over about 150 lines is a candidate to split. Over 500 lines is almost always doing several jobs.
- **Multiple responsibilities**: one file that fetches, transforms, formats, and renders several unrelated panels.
- **API style drift**: Options API or `var` in a codebase that is otherwise Composition API.
- **Prop and event surface**: prop drilling through 2+ levels (suggest provide/inject or a composable), props that are mutated, missing `emits` declarations.
- **Template depth**: more than about 4 levels of nesting inside one `v-for` block.
- **Dead code**: components never imported, routes that point nowhere, imports never used, components referenced in a template but missing on disk.

## 3. Performance Checks

Only report a performance issue when you can name the mechanism. State the cost in plain terms (re-runs on every render, extra network call, DOM thrash) and give a rough severity.

### Rendering

- **Methods called from the template for derived data**: a method used in `{{ }}` or `v-for` runs on every re-render. Suggest `computed` (cached) when the result depends only on reactive state, or pre-compute once per item.
- **Expensive work in `computed` that is called with arguments**: computed cannot take arguments, so people write methods instead. Suggest a computed returning a map or lookup keyed by id.
- **`v-for` keys**: index keys, missing keys, or non-unique keys.
- **`v-if` with `v-for` on the same element**: filter in a computed instead.
- **`v-if` vs `v-show`**: `v-if` on content toggled often (tabs, tooltips) rebuilds the subtree each time.
- **Large unvirtualized lists**: hundreds of rows rendered at once, especially with per-row computed or listeners. Suggest pagination or windowing.
- **Inline object, array, or function literals in template props**: these create a new value each render and defeat child memoization. Matters mostly for large child lists.
- **SVG or chart math in the template**: coordinate and path calculations inside the template instead of a computed.
- **Debug logging in render paths**: `console.log` inside a function the template calls fires on every render.

### Reactivity

- **Deep reactivity on large read-only data**: big API payloads stored in `ref`/`reactive` that are never mutated can use `shallowRef` or `markRaw`.
- **Deep watchers**: `watch(..., { deep: true })` on large objects, or watchers that trigger a fetch without debouncing.
- **Watcher chains**: a watcher that sets state which another watcher reacts to. Often replaceable by one computed.
- **`reactive` destructuring**: destructured props or reactive objects that lose reactivity (correctness bug, report as such).

### Loading and network

- **Duplicate fetches**: several components requesting the same endpoint, or a fetch triggered by both `onMounted` and a filter watcher.
- **Fetch on every filter keystroke or change** with no debounce or cancellation.
- **Sequential awaits that could be parallel**: independent requests awaited one after another; suggest `Promise.all`.
- **Eagerly loaded heavy components**: modals and rarely visited routes that could use `defineAsyncComponent` or a dynamic `import()` route.
- **Third-party imports**: whole-library imports where a sub-path import exists.

### Lifecycle

- Event listeners, timers, or observers added without removal in `onBeforeUnmount`.
- Work done in `setup()` that belongs in `onMounted` (DOM access) or in a composable.

## 4. Code Reuse Checks

### Duplicate helpers

Find the same function defined in several files and move it to one shared module (`utils/` or a composable).

```bash
# Same helper defined more than once (method, function, or const arrow function).
# Uses POSIX classes only: BSD sed on macOS does not support \b or \s.
grep -rhoE "^[[:space:]]*(const |function |async )?(format|get|calc|to)[A-Z][A-Za-z]*[[:space:]]*(=|\()" src --include='*.vue' \
  | sed -E 's/^[[:space:]]*(const |function |async )?//; s/[[:space:]]*(=|\()$//' | sort | uniq -c | sort -rn | head -20
```

Counts above 1 are the leads. Adjust the name prefixes to the project's naming style.

Typical candidates: number, currency, date, and percentage formatters; status-to-color mappers; sorting helpers. If two copies differ, say how (rounding, locale, null handling) because merging may change output.

### Repeated template blocks

- The same markup (cards, stat tiles, badges, table headers, empty states) copied across views: suggest a small presentational component with props and slots.
- Near-identical modals: suggest one base modal component (overlay, close button, Escape handling, focus) with a content slot.
- Repeated table markup differing only in columns: suggest a data-driven table component.

### Repeated logic

- The `loading`/`error`/`data` plus `try/catch/finally` fetch pattern repeated in many components: suggest a `useAsyncData`-style composable.
- Repeated filter-to-query-params mapping.
- Repeated open/close/selected-item state for modals: suggest a `useModal` composable.

### Repeated styles and constants

- Copied CSS blocks (cards, badges, buttons, tables) across scoped styles: suggest shared global styles or design tokens, noting when the project keeps global styles in one place.
- Hardcoded colors, spacing, URLs, and magic numbers repeated across files.
- API base URLs hardcoded outside the API client.

## 5. Detection Recipes

Use these to back each finding with evidence, not impressions.

```bash
# Largest components (find, not a glob: bash does not recurse with **)
find src -name '*.vue' -exec wc -l {} + | sort -rn | head -15

# Debug logging
grep -rn "console\.log" src --include='*.vue'

# Index used as v-for key (single-line tags only; check multi-line tags by eye)
grep -rnE 'v-for=.*\(.*, *(index|i|idx)\).*:key="(index|i|idx)"' src --include='*.vue'

# v-if and v-for on the same element (single-line tags only; check multi-line tags by eye)
grep -rnE '<[a-z-]+[^>]*v-for=[^>]*v-if=|<[a-z-]+[^>]*v-if=[^>]*v-for=' src --include='*.vue'

# Mixed API styles: `export default` matches both Options API and setup(), so look for Options-only markers
echo '-- script setup:'; grep -rl "<script setup" src --include='*.vue'
echo '-- Options API (data/methods/computed blocks):'; grep -rlE "^[[:space:]]*(data|methods)[[:space:]]*(\(\)|:)" src --include='*.vue'

# Deep watchers and timers without cleanup
grep -rnE "deep: *true" src --include='*.vue'
grep -rnE "setInterval|addEventListener" src --include='*.vue'

# Components referenced but missing on disk
grep -rhoE "<[A-Z][A-Za-z]+" src --include='*.vue' | sort -u
ls src/components
```

Open the flagged code and confirm each hit before reporting it. A grep match is a lead, not a finding.

## 6. Prioritize

Score each finding on impact and effort, then order by impact over effort.

| Level | Impact | Effort |
|---|---|---|
| High | Visible slowness, wrong behavior, or code duplicated in 3+ places | A few hours or touches many files |
| Medium | Measurable waste or duplicated in 2 places | Under an hour, one or two files |
| Low | Style or tidiness with no user-visible effect | A few lines |

Put correctness bugs first regardless of score. Do not recommend memoizing or restructuring code that is cheap and rarely rendered. State when something is not worth changing.

## 7. Report Format

Deliver one report. Keep it scannable.

1. **Summary**: 3 to 5 lines covering what was analyzed, the stack, and the top three recommendations.
2. **Inventory table**: file, lines, script style, notes.
3. **Findings**, grouped as Performance and Reuse, each with:
   - Title and priority (High, Medium, Low)
   - Location as `path/to/File.vue:line`, listing every duplicate for reuse findings
   - What is wrong and the mechanism, in one or two sentences
   - Suggested change, with a short before/after snippet when it clarifies
   - Risk: what could break or change in behavior, and how to check it
4. **Not worth changing**: things that looked suspicious but are fine, with the reason.
5. **Suggested order of work**: a short numbered list, with groups that can ship as separate pull requests.

Do not pad the report. Fewer well-evidenced findings beat a long list of guesses. Say so when something could not be verified, such as a performance claim you did not measure.

## 8. Verify Claims

- Confirm a component is really large or duplicated by reading it, not by line count alone.
- For a performance claim, name what re-runs and when. If a quick measurement is possible (Vue DevTools profiler, `performance.now()`, the Network tab), recommend it before a risky refactor.
- Check that a suggested shared helper really matches every copy. List the differences.
- Check that a suggested component or composable does not already exist.

## 9. When Asked to Apply Changes

- Follow the project's rules first. If the repo's `CLAUDE.md` requires a specialist agent for `.vue` edits (this repo requires `vue-expert`), delegate to it with the exact findings to apply.
- Apply one finding or one tightly related group at a time, and keep behavior identical. Refactors and behavior changes do not share a commit.
- Add a short comment where the reason for a change is not obvious, such as why a `shallowRef` is safe or why two formatters were merged.
- Keep the project's conventions: no emojis in UI, unique `v-for` keys, i18n strings in every locale file, no secrets or private URLs in public repos.
- Run the production build after each group (`npm run build`). If the app can be started, load the affected pages and check the console.
- Re-run the detection recipes to confirm the finding is gone.

## Key Reminders

1. Report first. Edit only when asked.
2. Measure and cite `file:line` for every finding. No finding without evidence.
3. Name the mechanism behind every performance claim.
4. Rank by impact over effort, and say what is not worth changing.
5. Check that duplicates really match before proposing to merge them.
6. Respect project rules, including which agent edits `.vue` files.
7. Keep behavior identical in refactors, and build after each group.
