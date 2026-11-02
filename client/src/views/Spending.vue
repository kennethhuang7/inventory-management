<template>
  <div class="spending">
    <div class="page-header">
      <h2>{{ t('finance.title') }}</h2>
      <p>{{ t('finance.description') }}</p>
    </div>

    <p v-if="showFiltersNote" class="filter-note">{{ t('spending.filtersNote') }}</p>

    <ErrorState v-if="error" :message="errorMessage" :stale="hasLoaded" @retry="loadData" />

    <div v-if="loading" class="loading" role="status">{{ t('common.loading') }}</div>
    <div v-else-if="hasLoaded" :class="{ refreshing }" :aria-busy="refreshing">
      <!-- Revenue & Financial KPIs -->
      <div class="stats-grid-finance">
        <div class="stat-card revenue-card">
          <div class="stat-label">{{ t('finance.totalRevenue') }}</div>
          <div class="stat-value">{{ money(revenueMetrics.totalRevenue) }}</div>
          <div class="stat-change positive">
            <span class="change-icon">↑</span>
            {{ t('finance.fromOrders', { count: revenueMetrics.orderCount }) }}
          </div>
        </div>
        <div class="stat-card cost-card">
          <div class="stat-label">{{ t('finance.totalCosts') }}</div>
          <div class="stat-value">{{ money(totalCosts) }}</div>
          <div class="stat-meta">{{ t('finance.costBreakdown') }}</div>
        </div>
        <div class="stat-card profit-card">
          <div class="stat-label">{{ t('finance.netProfit') }}</div>
          <div class="stat-value">{{ money(netProfit) }}</div>
          <div class="stat-meta">{{ profitMargin }}% {{ t('finance.margin') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('finance.avgOrderValue') }}</div>
          <div class="stat-value">{{ money(revenueMetrics.avgOrderValue) }}</div>
          <div class="stat-meta">{{ t('finance.perOrderRevenue') }}</div>
        </div>
      </div>

      <!-- Monthly Revenue vs Cost Chart -->
      <div class="card chart-card">
        <div class="card-header">
          <h3 class="card-title">{{ t('finance.revenueVsCosts.title') }}</h3>
          <div class="chart-legend">
            <span class="legend-item"><span class="legend-dot revenue-color"></span>{{ t('finance.revenueVsCosts.revenue') }}</span>
            <span class="legend-item"><span class="legend-dot cost-color"></span>{{ t('finance.revenueVsCosts.costs') }}</span>
          </div>
        </div>
        <div class="chart-container">
          <div class="bar-chart">
            <div class="y-axis">
              <span v-for="tick in revenueAxisTicks" :key="tick">{{ money(tick, true) }}</span>
            </div>
            <div class="chart-area">
              <div v-for="month in monthlyRevenue" :key="month.month" class="bar-group-revenue">
                <div class="revenue-bars">
                  <div
                    class="revenue-bar"
                    role="img"
                    :style="{ height: getRevenueBarHeight(month.revenue) + '%' }"
                    :title="`${t('finance.revenueVsCosts.revenue')}: ${money(month.revenue)}`"
                    :aria-label="t('spending.revenueBarLabel', { month: translateMonth(month.month), amount: money(month.revenue) })"
                  ></div>
                  <div
                    class="cost-bar"
                    role="img"
                    :style="{ height: getRevenueBarHeight(month.costs) + '%' }"
                    :title="`${t('finance.revenueVsCosts.costs')}: ${money(month.costs)}`"
                    :aria-label="t('spending.costBarLabel', { month: translateMonth(month.month), amount: money(month.costs) })"
                  ></div>
                </div>
                <span class="bar-label">{{ translateMonth(month.month) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Cost Flow Chart -->
      <div class="card chart-card">
        <div class="card-header">
          <h3 class="card-title">{{ t('finance.monthlyCostFlow.title') }}</h3>
          <div class="chart-legend">
            <span class="legend-item"><span class="legend-dot procurement"></span>{{ t('finance.monthlyCostFlow.procurement') }}</span>
            <span class="legend-item"><span class="legend-dot operational"></span>{{ t('finance.monthlyCostFlow.operational') }}</span>
            <span class="legend-item"><span class="legend-dot labor"></span>{{ t('finance.monthlyCostFlow.labor') }}</span>
            <span class="legend-item"><span class="legend-dot overhead"></span>{{ t('finance.monthlyCostFlow.overhead') }}</span>
          </div>
        </div>
        <div class="chart-container">
          <div class="bar-chart">
            <div class="y-axis">
              <span v-for="tick in costAxisTicks" :key="tick">{{ money(tick, true) }}</span>
            </div>
            <div class="chart-area">
              <div v-for="month in monthlySpending" :key="month.month" class="bar-group">
                <button
                  type="button"
                  class="stacked-bar"
                  :aria-label="t('spending.costFlowBarLabel', { month: translateMonth(month.month), amount: money(monthTotal(month)) })"
                  @click="showCostDetail(month)"
                >
                  <!-- spans, not divs: block content inside a button must be phrasing content -->
                  <span class="bar-segment procurement" :style="{ height: getBarHeight(month.procurement) + '%' }" :title="`${t('finance.monthlyCostFlow.procurement')}: ${money(month.procurement)}`"></span>
                  <span class="bar-segment operational" :style="{ height: getBarHeight(month.operational) + '%' }" :title="`${t('finance.monthlyCostFlow.operational')}: ${money(month.operational)}`"></span>
                  <span class="bar-segment labor" :style="{ height: getBarHeight(month.labor) + '%' }" :title="`${t('finance.monthlyCostFlow.labor')}: ${money(month.labor)}`"></span>
                  <span class="bar-segment overhead" :style="{ height: getBarHeight(month.overhead) + '%' }" :title="`${t('finance.monthlyCostFlow.overhead')}: ${money(month.overhead)}`"></span>
                </button>
                <span class="bar-label">{{ translateMonth(month.month) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="two-column-grid">
        <!-- Category Spending Breakdown -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">{{ t('finance.categorySpending.title') }}</h3>
          </div>
          <div class="category-list">
            <div v-for="category in categorySpending" :key="category.category" class="category-item">
              <div class="category-info">
                <div class="category-name">{{ translateCategory(category.category) }}</div>
                <div class="category-amount">{{ money(category.amount) }}</div>
              </div>
              <div class="category-bar-container">
                <div class="category-bar" :style="{ width: category.percentage + '%' }"></div>
              </div>
              <div class="category-meta">
                <span class="percentage">{{ category.percentage }}% {{ t('finance.categorySpending.ofTotal') }}</span>
                <span class="change" :class="{ positive: category.change > 0, negative: category.change < 0 }">
                  {{ category.change > 0 ? '+' : '' }}{{ category.change }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="card transactions-card">
          <div class="card-header">
            <h3 class="card-title">{{ t('finance.transactions.title') }}</h3>
          </div>
          <div class="transactions-table-container">
            <table class="transactions-table">
              <thead>
                <tr>
                  <th>{{ t('finance.transactions.id') }}</th>
                  <th>{{ t('finance.transactions.description') }}</th>
                  <th>{{ t('finance.transactions.vendor') }}</th>
                  <th>{{ t('finance.transactions.date') }}</th>
                  <th class="text-right">{{ t('finance.transactions.amount') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="transaction in recentTransactions"
                  :key="transaction.id"
                  class="clickable-row"
                  @click="handleTransactionClick(transaction)"
                >
                  <td class="transaction-id">
                    <button type="button" class="row-link" @click.stop="handleTransactionClick(transaction)">
                      {{ transaction.id.toString().padStart(3, '0') }}
                    </button>
                  </td>
                  <td class="transaction-description">{{ transaction.description }}</td>
                  <td class="transaction-vendor">{{ transaction.vendor }}</td>
                  <td class="transaction-date">{{ formatDateShort(transaction.date) }}</td>
                  <td class="transaction-amount text-right">{{ money(transaction.amount, false, 2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="selectedTransaction" class="modal-overlay" @click="closeTransaction">
        <div
          ref="txDialog"
          class="modal-container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="spending-tx-title"
          tabindex="-1"
          @click.stop
        >
          <div class="modal-header">
            <h3 id="spending-tx-title" class="modal-title">{{ t('spending.transactionDetails') }}</h3>
            <button type="button" class="close-button" :aria-label="t('common.close')" @click="closeTransaction">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <dl class="modal-body">
            <div class="info-item">
              <dt class="info-label">{{ t('finance.transactions.id') }}</dt>
              <dd class="info-value">{{ selectedTransaction.id.toString().padStart(3, '0') }}</dd>
            </div>
            <div class="info-item">
              <dt class="info-label">{{ t('finance.transactions.description') }}</dt>
              <dd class="info-value">{{ selectedTransaction.description }}</dd>
            </div>
            <div class="info-item">
              <dt class="info-label">{{ t('finance.transactions.vendor') }}</dt>
              <dd class="info-value">{{ selectedTransaction.vendor }}</dd>
            </div>
            <div class="info-item">
              <dt class="info-label">{{ t('finance.transactions.date') }}</dt>
              <dd class="info-value">{{ formatDateLong(selectedTransaction.date) }}</dd>
            </div>
            <div class="info-item">
              <dt class="info-label">{{ t('finance.transactions.amount') }}</dt>
              <dd class="info-value">{{ money(selectedTransaction.amount, false, 2) }}</dd>
            </div>
          </dl>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeTransaction">{{ t('common.close') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <CostDetailModal
      :is-open="showCostModal"
      :cost-data="selectedCostData"
      @close="showCostModal = false"
    />
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'
import { useLoader } from '../composables/useLoader'
import { useModalA11y } from '../composables/useModalA11y'
import { formatMoney, formatDate, monthKey } from '../utils/format'
import CostDetailModal from '../components/CostDetailModal.vue'
import ErrorState from '../components/ErrorState.vue'

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default {
  name: 'Spending',
  components: {
    CostDetailModal,
    ErrorState
  },
  setup() {
    const { t, currentLocale, currentCurrency } = useI18n()
    const allMonthlySpending = ref([])
    const allCategorySpending = ref([])
    const allTransactions = ref([])
    const summaryData = ref({})
    const allOrders = ref([])

    // Modal state
    const showCostModal = ref(false)
    const selectedCostData = ref(null)
    const selectedTransaction = ref(null)
    const txDialog = ref(null)

    const closeTransaction = () => {
      selectedTransaction.value = null
    }
    useModalA11y(() => selectedTransaction.value !== null, txDialog, closeTransaction)

    // Use shared filters
    const { selectedPeriod, selectedLocation, selectedCategory, selectedStatus, getCurrentFilters } =
      useFilters()

    // Budget, category and transaction data are pre-aggregated with no warehouse/category/status
    // dimension, so only order revenue responds to those filters; tell the user.
    const showFiltersNote = computed(
      () =>
        selectedLocation.value !== 'all' ||
        selectedCategory.value !== 'all' ||
        selectedStatus.value !== 'all'
    )

    const { loading, refreshing, hasLoaded, error, errorMessage, run: loadData } = useLoader(
      async (isCurrent) => {
        // month is deliberately dropped: the revenue chart needs every month, and the period
        // filter is applied client-side to the order list instead.
        const { warehouse, category, status } = getCurrentFilters()
        const [summaryRes, monthlyRes, categoryRes, transactionsRes, ordersRes] = await Promise.all([
          api.getSpendingSummary(),
          api.getMonthlySpending(),
          api.getCategorySpending(),
          api.getTransactions(),
          api.getOrders({ warehouse, category, status })
        ])
        if (!isCurrent()) return

        summaryData.value = summaryRes
        allMonthlySpending.value = monthlyRes
        allCategorySpending.value = categoryRes
        allTransactions.value = transactionsRes
        allOrders.value = ordersRes
      }
    )

    // Monthly spending chart always shows all months (not filtered)
    const monthlySpending = computed(() => {
      return allMonthlySpending.value
    })

    // Filtered monthly spending for summary calculations only
    const filteredMonthlySpending = computed(() => {
      if (selectedPeriod.value === 'all') {
        return allMonthlySpending.value
      }

      // Extract month name from YYYY-MM format
      const selectedMonth = MONTH_ABBR[Number(selectedPeriod.value.split('-')[1]) - 1]
      return allMonthlySpending.value.filter(m => m.month === selectedMonth)
    })

    const categorySpending = computed(() => {
      return allCategorySpending.value
    })

    // Every month comparison below uses monthKey() (a string slice) instead of
    // new Date(x).toISOString().slice(0, 7). toISOString converts to UTC, so an order at
    // 2025-02-01T03:00:00 landed in January for users east of UTC (Japan) while the revenue
    // chart (local getMonth) put it in February. Slicing keeps one month per order everywhere.
    const recentTransactions = computed(() => {
      if (selectedPeriod.value === 'all') {
        return allTransactions.value
      }
      return allTransactions.value.filter(tx => monthKey(tx.date) === selectedPeriod.value)
    })

    const summary = computed(() => {
      // Recalculate summary based on filteredMonthlySpending (not the chart data)
      if (filteredMonthlySpending.value.length === 0) {
        return summaryData.value
      }

      const totals = filteredMonthlySpending.value.reduce((acc, month) => ({
        procurement: acc.procurement + month.procurement,
        operational: acc.operational + month.operational,
        labor: acc.labor + month.labor,
        overhead: acc.overhead + month.overhead
      }), { procurement: 0, operational: 0, labor: 0, overhead: 0 })

      return {
        total_procurement_cost: totals.procurement,
        total_operational_cost: totals.operational,
        total_labor_cost: totals.labor,
        total_overhead: totals.overhead,
        procurement_change: summaryData.value.procurement_change || 0,
        operational_change: summaryData.value.operational_change || 0,
        labor_change: summaryData.value.labor_change || 0,
        overhead_change: summaryData.value.overhead_change || 0
      }
    })

    // Filtered orders based on selected period
    const filteredOrders = computed(() => {
      if (selectedPeriod.value === 'all') {
        return allOrders.value
      }
      return allOrders.value.filter(order => monthKey(order.order_date) === selectedPeriod.value)
    })

    // Revenue metrics from filtered orders
    const revenueMetrics = computed(() => {
      const totalRevenue = filteredOrders.value.reduce((sum, order) => sum + (order.total_value || 0), 0)
      const orderCount = filteredOrders.value.length
      const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0

      return {
        totalRevenue,
        orderCount,
        avgOrderValue,
        revenueGrowth: 15.3 // Placeholder - could calculate from historical data
      }
    })

    // Total costs from summary
    const totalCosts = computed(() => {
      return (summary.value.total_procurement_cost || 0) +
             (summary.value.total_operational_cost || 0) +
             (summary.value.total_labor_cost || 0) +
             (summary.value.total_overhead || 0)
    })

    // Net profit
    const netProfit = computed(() => {
      return revenueMetrics.value.totalRevenue - totalCosts.value
    })

    // Profit margin percentage
    const profitMargin = computed(() => {
      if (revenueMetrics.value.totalRevenue === 0) return 0
      return ((netProfit.value / revenueMetrics.value.totalRevenue) * 100).toFixed(1)
    })

    // Monthly revenue data for chart
    const monthlyRevenue = computed(() => {
      // Initialize all months
      const revenueByMonth = MONTH_ABBR.map(month => ({
        month,
        revenue: 0,
        costs: 0
      }))

      // Bucket by the month number in the key (see monthKey note above), not by Date#getMonth
      allOrders.value.forEach(order => {
        const key = monthKey(order.order_date)
        const monthIndex = key ? Number(key.slice(5, 7)) - 1 : -1
        if (monthIndex >= 0 && monthIndex < 12) {
          revenueByMonth[monthIndex].revenue += order.total_value || 0
        }
      })

      // Add costs from spending data
      allMonthlySpending.value.forEach(spending => {
        const monthIndex = MONTH_ABBR.indexOf(spending.month)
        if (monthIndex >= 0) {
          revenueByMonth[monthIndex].costs = spending.procurement + spending.operational + spending.labor + spending.overhead
        }
      })

      return revenueByMonth
    })

    // Max value for chart scaling
    const maxRevenueValue = computed(() => {
      const maxRevenue = Math.max(...monthlyRevenue.value.map(m => m.revenue))
      const maxCost = Math.max(...monthlyRevenue.value.map(m => m.costs))
      const max = Math.max(maxRevenue, maxCost)
      return Math.ceil(max / 1000) // Return in K
    })

    // Axis ticks are USD amounts; money() converts them to the active currency
    const revenueAxisTicks = computed(() =>
      [1, 0.75, 0.5, 0.25, 0].map(f => Math.round(maxRevenueValue.value * f) * 1000)
    )
    const costAxisTicks = [25000, 20000, 15000, 10000, 5000, 0]

    // Re-fetch orders when a server-side filter changes (period is applied client-side)
    watch([selectedLocation, selectedCategory, selectedStatus], loadData)

    // money(amountUsd, compact?, decimals?)
    const money = (value, compact = false, decimals = 0) =>
      formatMoney(value, currentCurrency.value, { compact, decimals })

    const monthTotal = (m) => m.procurement + m.operational + m.labor + m.overhead

    const getBarHeight = (value) => {
      const maxValue = 25000
      return (value / maxValue) * 100
    }

    const getRevenueBarHeight = (value) => {
      const maxValue = maxRevenueValue.value * 1000
      return maxValue > 0 ? (value / maxValue) * 100 : 0
    }

    const formatDateShort = (dateString) =>
      formatDate(dateString, currentLocale.value, { year: '2-digit', month: '2-digit', day: '2-digit' })

    const formatDateLong = (dateString) => formatDate(dateString, currentLocale.value)

    const translateMonth = (month) => {
      const monthMap = {
        'Jan': t('months.jan'),
        'Feb': t('months.feb'),
        'Mar': t('months.mar'),
        'Apr': t('months.apr'),
        'May': t('months.may'),
        'Jun': t('months.jun'),
        'Jul': t('months.jul'),
        'Aug': t('months.aug'),
        'Sep': t('months.sep'),
        'Oct': t('months.oct'),
        'Nov': t('months.nov'),
        'Dec': t('months.dec')
      }
      return monthMap[month] || month
    }

    const translateCategory = (category) => {
      // First try spending categories
      const spendingCategoryMap = {
        'Raw Materials': t('spendingCategories.rawMaterials'),
        'Components': t('spendingCategories.components'),
        'Equipment': t('spendingCategories.equipment'),
        'Consumables': t('spendingCategories.consumables')
      }

      // Then try product categories
      const productCategoryMap = {
        'Circuit Boards': t('categories.circuitBoards'),
        'Sensors': t('categories.sensors'),
        'Actuators': t('categories.actuators'),
        'Controllers': t('categories.controllers'),
        'Power Supplies': t('categories.powerSupplies')
      }

      return spendingCategoryMap[category] || productCategoryMap[category] || category
    }

    const handleTransactionClick = (transaction) => {
      selectedTransaction.value = transaction
    }

    const showCostDetail = (monthData) => {
      selectedCostData.value = monthData
      showCostModal.value = true
    }

    onMounted(loadData)

    return {
      t,
      loading,
      refreshing,
      hasLoaded,
      error,
      errorMessage,
      loadData,
      showFiltersNote,
      summary,
      monthlySpending,
      categorySpending,
      recentTransactions,
      revenueMetrics,
      totalCosts,
      netProfit,
      profitMargin,
      monthlyRevenue,
      maxRevenueValue,
      revenueAxisTicks,
      costAxisTicks,
      money,
      monthTotal,
      getBarHeight,
      getRevenueBarHeight,
      formatDateShort,
      formatDateLong,
      translateMonth,
      translateCategory,
      handleTransactionClick,
      selectedTransaction,
      closeTransaction,
      txDialog,
      showCostModal,
      selectedCostData,
      showCostDetail
    }
  }
}
</script>

<style scoped>
.stat-change {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-change.positive {
  color: #059669;
}

.stat-change.negative {
  color: #dc2626;
}

.change-icon {
  font-weight: 700;
  font-size: 1rem;
}

.chart-card {
  margin-bottom: 1.75rem;
}

.chart-legend {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-dot.procurement { background: #3b82f6; }
.legend-dot.operational { background: #8b5cf6; }
.legend-dot.labor { background: #10b981; }
.legend-dot.overhead { background: #f59e0b; }
.legend-dot.revenue-color { background: #0f172a; }
.legend-dot.cost-color { background: #ef4444; }

.stats-grid-finance {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.revenue-card {
  border-left: 4px solid #0f172a;
}

.cost-card {
  border-left: 4px solid #ef4444;
}

.profit-card {
  border-left: 4px solid #3b82f6;
}

.stat-meta {
  margin-top: 0.5rem;
  font-size: 0.813rem;
  color: #64748b;
}

.bar-group-revenue {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
}

.revenue-bars {
  width: 100%;
  max-width: 80px;
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: flex-end;
  height: 100%;
  padding-bottom: 2rem;
}

.revenue-bar, .cost-bar {
  width: 50%;
  max-width: 30px;
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 4px;
}

.revenue-bar {
  background: #0f172a;
}

.cost-bar {
  background: #ef4444;
}

.revenue-bar:hover, .cost-bar:hover {
  opacity: 0.8;
  transform: scaleY(1.05);
}

.chart-container {
  padding: 1.5rem 0;
}

.bar-chart {
  display: flex;
  gap: 1.5rem;
  height: 350px;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 1rem;
  font-size: 0.75rem;
  color: #94a3b8;
  border-right: 1px solid #e2e8f0;
}

.chart-area {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 0.5rem;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
}

.stacked-bar {
  /* now a real <button>: reset native chrome */
  background: none;
  border: none;
  font: inherit;
  color: inherit;
  padding-left: 0;
  padding-right: 0;
  padding-top: 0;
  width: 100%;
  max-width: 60px;
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  height: 100%;
  padding-bottom: 2rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.stacked-bar:hover {
  opacity: 0.85;
}

.stacked-bar:focus-visible,
.row-link:focus-visible,
.close-button:focus-visible,
.btn-secondary:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.row-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-weight: 700;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.row-link:hover {
  color: #2563eb;
}

.filter-note {
  margin: 0 0 1rem;
  padding: 0.625rem 0.875rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.875rem;
}

.refreshing {
  opacity: 0.6;
  transition: opacity 0.15s ease;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-container:focus {
  outline: none;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.close-button:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  margin: 0;
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
  overflow-y: auto;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.info-value {
  margin: 0;
  color: #0f172a;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f8fafc;
}

.bar-segment {
  width: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
  display: block;
}

.bar-segment:first-child {
  border-radius: 0 0 6px 6px;
}

.bar-segment:last-child {
  border-radius: 6px 6px 0 0;
}

.bar-segment.procurement { background: #3b82f6; }
.bar-segment.operational { background: #8b5cf6; }
.bar-segment.labor { background: #10b981; }
.bar-segment.overhead { background: #f59e0b; }

.bar-segment:hover {
  opacity: 0.8;
}

.bar-label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.two-column-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 1.75rem;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-name {
  font-weight: 600;
  color: #0f172a;
}

.category-amount {
  font-weight: 700;
  color: #2563eb;
  font-size: 1.125rem;
}

.category-bar-container {
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.category-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.category-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.813rem;
}

.percentage {
  color: #64748b;
}

.change {
  font-weight: 600;
}

.change.positive {
  color: #059669;
}

.change.negative {
  color: #dc2626;
}

.transactions-card {
  display: flex;
  flex-direction: column;
}

.transactions-table-container {
  overflow-y: auto;
  max-height: 400px;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
}

.transactions-table thead {
  position: sticky;
  top: 0;
  background: #f8fafc;
  z-index: 1;
}

.transactions-table th {
  text-align: left;
  padding: 0.625rem 0.75rem;
  font-weight: 600;
  color: #475569;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.transactions-table th.text-right {
  text-align: right;
}

.transactions-table td {
  padding: 0.75rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
}

.transactions-table tbody tr {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.transactions-table tbody tr:hover {
  background: #f8fafc;
}

.transactions-table tbody tr.clickable-row:hover {
  background: #eff6ff;
}

.transaction-id {
  color: #64748b;
  font-weight: 500;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.813rem;
}

.transaction-description {
  color: #0f172a;
  font-weight: 500;
}

.transaction-vendor {
  color: #64748b;
}

.transaction-date {
  color: #64748b;
  font-size: 0.813rem;
}

.transaction-amount {
  font-weight: 700;
  color: #0f172a;
}

.text-right {
  text-align: right;
}
</style>
