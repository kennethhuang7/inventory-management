<template>
  <div class="app-shell" :class="{ collapsed, 'drawer-open': drawerOpen }">
    <aside id="app-sidebar" class="sidebar" :aria-label="t('nav.primaryNav')">
      <div class="sidebar-brand">
        <div class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
            <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-name">{{ t('nav.companyName') }}</span>
          <span class="brand-subtitle">{{ t('nav.subtitle') }}</span>
        </div>
        <button
          type="button"
          class="icon-button collapse-toggle"
          :aria-expanded="String(!collapsed)"
          :aria-label="collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')"
          :title="collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')"
          @click="collapsed = !collapsed"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M9 4v16" />
            <path v-if="collapsed" d="M14 10l2 2-2 2" />
            <path v-else d="M16 10l-2 2 2 2" />
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :active-class="item.exact ? '' : 'active'"
          exact-active-class="active"
          :title="t(item.labelKey)"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path v-for="d in item.icon" :key="d" :d="d" />
          </svg>
          <span class="nav-label">{{ t(item.labelKey) }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button
          type="button"
          class="nav-link footer-tasks"
          :title="t('nav.tasks')"
          @click="showTasks = true"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 11l3 3 8-8" />
            <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9" />
          </svg>
          <span class="nav-label">{{ t('nav.tasks') }}</span>
          <span v-if="pendingTaskCount > 0" class="footer-task-count">{{ pendingTaskCount }}</span>
        </button>
        <LanguageSwitcher />
        <ProfileMenu
          @show-profile-details="showProfileDetails = true"
          @show-tasks="showTasks = true"
        />
      </div>
    </aside>

    <div
      v-if="drawerOpen"
      class="drawer-backdrop"
      aria-hidden="true"
      @click="drawerOpen = false"
    ></div>

    <div class="main-column">
      <header class="mobile-topbar">
        <button
          type="button"
          class="icon-button"
          aria-controls="app-sidebar"
          :aria-expanded="String(drawerOpen)"
          :aria-label="drawerOpen ? t('nav.closeMenu') : t('nav.openMenu')"
          @click="drawerOpen = !drawerOpen"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="topbar-title">{{ t('nav.companyName') }}</span>
      </header>
      <FilterBar />
      <main class="main-content">
        <router-view />
      </main>
    </div>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

export default {
  name: 'App',
  components: {
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])
    const route = useRoute()

    // Order matches the router; icon is a list of 24x24 stroke path data
    const navItems = [
      { path: '/', labelKey: 'nav.overview', exact: true, icon: ['M4 13h6V4H4z', 'M14 20h6V4h-6z', 'M4 20h6v-3H4z'] },
      { path: '/inventory', labelKey: 'nav.inventory', exact: false, icon: ['M21 8l-9-5-9 5 9 5 9-5z', 'M3 8v8l9 5 9-5V8', 'M12 13v8'] },
      { path: '/orders', labelKey: 'nav.orders', exact: false, icon: ['M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1z', 'M8 5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2', 'M8 12h8M8 16h5'] },
      { path: '/spending', labelKey: 'nav.finance', exact: false, icon: ['M12 2v20', 'M17 6.5C17 4.6 14.8 4 12 4S7 5 7 7.5 9.5 11 12 11.5s5 1 5 4S14.8 20 12 20s-5-.8-5-2.8'] },
      { path: '/demand', labelKey: 'nav.demandForecast', exact: false, icon: ['M3 17l6-6 4 4 8-8', 'M15 7h6v6'] },
      { path: '/reports', labelKey: 'nav.reports', exact: false, icon: ['M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z', 'M14 3v5h5', 'M9 13h6M9 17h6'] }
    ]

    // Collapsed state is desktop-only and persisted; storage can throw (private windows)
    const collapsed = ref(false)
    try {
      collapsed.value = localStorage.getItem('sidebar-collapsed') === '1'
    } catch (e) { /* storage unavailable */ }
    watch(collapsed, (v) => {
      try {
        localStorage.setItem('sidebar-collapsed', v ? '1' : '0')
      } catch (e) { /* ignore */ }
    })

    // Mobile drawer: closes on navigation and Escape
    const drawerOpen = ref(false)
    watch(() => route.path, () => { drawerOpen.value = false })
    const onKeydown = (e) => {
      if (e.key === 'Escape') drawerOpen.value = false
    }
    window.addEventListener('keydown', onKeydown)
    onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

    const pendingTaskCount = computed(() => tasks.value.filter(task => task.status === 'pending').length)

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        // Add new task to the beginning of the array
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)

        if (isMockTask) {
          // Remove from mock tasks
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          // Remove from API tasks
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)

        if (mockTask) {
          // Toggle mock task status
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          // Toggle API task
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(loadTasks)

    return {
      t,
      showProfileDetails,
      showTasks,
      tasks,
      navItems,
      collapsed,
      drawerOpen,
      pendingTaskCount,
      addTask,
      deleteTask,
      toggleTask
    }
  }
}
</script>

<style>
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
  --sidebar-width: 256px;
  --sidebar-width-collapsed: 64px;
  --topbar-height: 56px; /* mobile top bar only */

  /* Layering: sticky bars < sidebar < drawer < dropdowns < modals */
  --z-sticky: 40;
  --z-sidebar: 50;
  --z-drawer-backdrop: 60;
  --z-drawer: 70;
  --z-dropdown: 1000;
  --z-modal: 2000;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--color-bg);
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ---------- App shell ---------- */
.app-shell {
  display: grid;
  /* minmax(0, 1fr) stops wide tables from stretching the grid past the viewport */
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100vh;
  transition: grid-template-columns 0.2s ease;
}

.app-shell.collapsed {
  grid-template-columns: var(--sidebar-width-collapsed) minmax(0, 1fr);
}

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

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-3);
  min-height: 64px;
  border-bottom: 1px solid var(--color-border);
}

.brand-mark {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #ffffff;
}

.brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.brand-name,
.brand-subtitle {
  /* Single line each so the two-line block stays the same height as the 32px logo mark */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.brand-name {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.015em;
}

.brand-subtitle {
  font-size: 0.625rem;
  color: var(--color-text-muted);
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.icon-button:hover {
  background: #f1f5f9;
  color: var(--color-text);
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  overflow-y: auto;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  min-height: 40px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-family: inherit;
  font-size: 0.938rem;
  font-weight: 500;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-link:hover {
  background: #f1f5f9;
  color: var(--color-text);
}

.nav-link.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

/* 3px accent bar on the active item (replaces the old top-nav underline) */
.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--color-accent);
}

.nav-icon {
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-button:focus-visible,
.nav-link:focus-visible,
.sidebar .profile-button:focus-visible,
.sidebar .language-button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.sidebar-footer {
  /* overflow stays visible so footer dropdowns are not clipped */
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.footer-task-count {
  background: var(--color-accent);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0 var(--space-2);
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

/* Collapsed rail (desktop only): icons centered, labels hidden */
.app-shell.collapsed .sidebar-brand {
  flex-direction: column;
  padding: var(--space-3) 0;
  gap: var(--space-2);
}

.app-shell.collapsed .brand-text,
.app-shell.collapsed .nav-label,
.app-shell.collapsed .footer-task-count {
  display: none;
}

.app-shell.collapsed .nav-link {
  justify-content: center;
  padding: var(--space-2);
}

.main-column {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.mobile-topbar,
.drawer-backdrop {
  display: none;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1600px;
  padding: var(--space-6) var(--space-8);
}

@media (max-width: 767px) {
  .app-shell,
  .app-shell.collapsed {
    grid-template-columns: minmax(0, 1fr);
  }

  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: var(--sidebar-width);
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    z-index: var(--z-drawer);
    box-shadow: none;
  }

  .app-shell.drawer-open .sidebar {
    transform: translateX(0);
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
  }

  /* Drawer ignores the collapsed state: always show labels */
  .app-shell.collapsed .sidebar-brand {
    flex-direction: row;
    padding: var(--space-4);
    gap: var(--space-3);
  }

  .app-shell.collapsed .brand-text,
  .app-shell.collapsed .nav-label {
    display: block;
  }

  .app-shell.collapsed .footer-task-count {
    display: inline-block;
  }

  .app-shell.collapsed .nav-link {
    justify-content: flex-start;
    padding: var(--space-2) var(--space-3);
  }

  /* Collapse is a desktop affordance */
  .collapse-toggle {
    display: none;
  }

  .drawer-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    z-index: var(--z-drawer-backdrop);
  }

  .mobile-topbar {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    height: var(--topbar-height);
    padding: 0 var(--space-4);
    position: sticky;
    top: 0;
    z-index: var(--z-sticky);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  .topbar-title {
    font-size: 0.938rem;
    font-weight: 700;
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .main-content {
    padding: var(--space-4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-shell,
  .sidebar,
  .nav-link,
  .icon-button {
    transition: none;
  }
}

/* ---------- Shared page styles ---------- */
.page-header {
  margin-bottom: var(--space-6);
}

.page-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-2);
  letter-spacing: -0.025em;
}

.page-header p {
  color: var(--color-text-muted);
  font-size: 0.938rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.stat-card {
  background: var(--color-surface);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.stat-label {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-2);
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.025em;
}

.stat-card.warning .stat-value {
  color: #ea580c;
}

.stat-card.success .stat-value {
  color: #059669;
}

.stat-card.danger .stat-value {
  color: #dc2626;
}

.stat-card.info .stat-value {
  color: #2563eb;
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-4);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.025em;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

th {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  font-weight: 600;
  color: #475569;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.875rem;
}

tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background: var(--color-bg);
}

.badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.success {
  background: #d1fae5;
  color: #065f46;
}

.badge.warning {
  background: #fed7aa;
  color: #92400e;
}

.badge.danger {
  background: #fecaca;
  color: #991b1b;
}

.badge.info {
  background: #dbeafe;
  color: #1e40af;
}

.badge.increasing {
  background: #d1fae5;
  color: #065f46;
}

.badge.decreasing {
  background: #fecaca;
  color: #991b1b;
}

.badge.stable {
  background: #e0e7ff;
  color: #3730a3;
}

.badge.high {
  background: #fecaca;
  color: #991b1b;
}

.badge.medium {
  background: #fed7aa;
  color: #92400e;
}

.badge.low {
  background: #dbeafe;
  color: #1e40af;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
  font-size: 0.938rem;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.938rem;
}
</style>
