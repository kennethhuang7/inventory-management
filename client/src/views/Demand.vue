<template>
  <div class="demand">
    <div class="page-header">
      <h2>{{ t('demand.title') }}</h2>
      <p>{{ t('demand.description') }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <ErrorState v-if="error" :message="errorMessage" :stale="hasLoaded" @retry="loadAll" />
    <div v-if="hasLoaded" :aria-busy="refreshing" :class="{ refreshing }">
      <div class="demand-trend-cards">
        <div class="trend-card increasing-card">
          <div class="trend-header">
            <div class="trend-icon">↑</div>
            <div>
              <div class="trend-label">{{ t('demand.increasingDemand') }}</div>
              <div class="trend-count">{{ t('demand.itemsCount', { count: getForecastsByTrend('increasing').length }) }}</div>
            </div>
          </div>
          <div class="trend-items">
            <div v-for="item in getForecastsByTrend('increasing').slice(0, 5)" :key="item.id" class="trend-item">
              <span class="item-name">{{ translateProductName(item.item_name) }}</span>
              <span class="item-change">+{{ getChangePercent(item) }}%</span>
            </div>
            <div v-if="getForecastsByTrend('increasing').length > 5" class="more-items">
              +{{ getForecastsByTrend('increasing').length - 5 }} {{ t('demand.more') }}
            </div>
          </div>
        </div>

        <div class="trend-card stable-card">
          <div class="trend-header">
            <div class="trend-icon">→</div>
            <div>
              <div class="trend-label">{{ t('demand.stableDemand') }}</div>
              <div class="trend-count">{{ t('demand.itemsCount', { count: getForecastsByTrend('stable').length }) }}</div>
            </div>
          </div>
          <div class="trend-items">
            <div v-for="item in getForecastsByTrend('stable').slice(0, 5)" :key="item.id" class="trend-item">
              <span class="item-name">{{ translateProductName(item.item_name) }}</span>
              <span class="item-change neutral">{{ getChangePercent(item) }}%</span>
            </div>
            <div v-if="getForecastsByTrend('stable').length > 5" class="more-items">
              +{{ getForecastsByTrend('stable').length - 5 }} {{ t('demand.more') }}
            </div>
          </div>
        </div>

        <div class="trend-card decreasing-card">
          <div class="trend-header">
            <div class="trend-icon">↓</div>
            <div>
              <div class="trend-label">{{ t('demand.decreasingDemand') }}</div>
              <div class="trend-count">{{ t('demand.itemsCount', { count: getForecastsByTrend('decreasing').length }) }}</div>
            </div>
          </div>
          <div class="trend-items">
            <div v-for="item in getForecastsByTrend('decreasing').slice(0, 5)" :key="item.id" class="trend-item">
              <span class="item-name">{{ translateProductName(item.item_name) }}</span>
              <span class="item-change">{{ getChangePercent(item) }}%</span>
            </div>
            <div v-if="getForecastsByTrend('decreasing').length > 5" class="more-items">
              +{{ getForecastsByTrend('decreasing').length - 5 }} {{ t('demand.more') }}
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('demand.demandForecasts') }}</h3>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ t('demand.table.sku') }}</th>
                <th>{{ t('demand.table.itemName') }}</th>
                <th>{{ t('demand.table.currentDemand') }}</th>
                <th>{{ t('demand.table.forecastedDemand') }}</th>
                <th>{{ t('demand.table.change') }}</th>
                <th>{{ t('demand.table.trend') }}</th>
                <th>{{ t('demand.table.period') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="forecast in forecasts" :key="forecast.id">
                <td><strong>{{ forecast.item_sku }}</strong></td>
                <td>{{ translateProductName(forecast.item_name) }}</td>
                <td>{{ forecast.current_demand }}</td>
                <td><strong>{{ forecast.forecasted_demand }}</strong></td>
                <td>
                  <span :style="{ color: getChangeColor(forecast) }">
                    {{ getChangePercent(forecast) }}%
                  </span>
                </td>
                <td>
                  <span :class="['badge', forecast.trend]">
                    {{ t(`trends.${forecast.trend}`) }}
                  </span>
                </td>
                <td>{{ translatePeriod(forecast.period) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'
import ErrorState from '../components/ErrorState.vue'
import { useLoader } from '../composables/useLoader'

export default {
  name: 'Demand',
  components: { ErrorState },
  setup() {
    const { t, currentLocale, translateProductName } = useI18n()
    const allForecasts = ref([])
    const inventoryItems = ref([])

    // Use shared filters
    const { selectedLocation, selectedCategory, getCurrentFilters } = useFilters()

    // Filter forecasts based on inventory filters
    const forecasts = computed(() => {
      if (selectedLocation.value === 'all' && selectedCategory.value === 'all') {
        return allForecasts.value
      }

      // Get SKUs of items that match the filters
      const validSkus = new Set(inventoryItems.value.map(item => item.sku))
      return allForecasts.value.filter(f => validSkus.has(f.item_sku))
    })

    // /api/demand ignores filters, so it is fetched once (and again only on Retry after a failure);
    // only the inventory lookup that drives the SKU filter is refetched on filter changes.
    const forecastsLoaded = ref(false)
    const { loading, refreshing, hasLoaded, error, errorMessage, run: loadAll } = useLoader(async (isCurrent) => {
      const filters = getCurrentFilters()
      const [forecastsData, inventoryData] = await Promise.all([
        forecastsLoaded.value ? null : api.getDemandForecasts(),
        api.getInventory({
          warehouse: filters.warehouse,
          category: filters.category
        })
      ])
      if (!isCurrent()) return
      if (forecastsData) {
        allForecasts.value = forecastsData
        forecastsLoaded.value = true
      }
      inventoryItems.value = inventoryData
    })

    // Watch for filter changes and reload data
    watch([selectedLocation, selectedCategory], () => {
      loadAll()
    })

    const getForecastsByTrend = (trend) => {
      return forecasts.value.filter(f => f.trend === trend)
    }

    const getChangePercent = (forecast) => {
      const change = ((forecast.forecasted_demand - forecast.current_demand) / forecast.current_demand * 100).toFixed(1)
      return change > 0 ? `+${change}` : change
    }

    const getChangeColor = (forecast) => {
      const change = forecast.forecasted_demand - forecast.current_demand
      const changePercent = Math.abs((change / forecast.current_demand) * 100)

      // If change is within ±2%, consider it stable and show blue
      if (changePercent <= 2) {
        // CSS vars so the text color follows the theme
        return 'var(--color-accent-text)' // Blue for stable
      }

      if (change > 0) return 'var(--color-positive)' // Green for increasing
      if (change < 0) return 'var(--color-negative)' // Red for decreasing
      return 'var(--color-accent-text)' // Blue for no change
    }

    const translatePeriod = (period) => {
      // Period values like "Next 3 months", "Q1 2025", "30 days", etc.
      if (currentLocale.value === 'ja') {
        return period
          .replace(/Next\s+/i, '次の')
          .replace(/\s+months/i, 'か月')
          .replace(/\s+month/i, 'か月')
          .replace(/\s+days/i, '日間')
          .replace(/\s+day/i, '日')
          .replace('Q1', '第1四半期')
          .replace('Q2', '第2四半期')
          .replace('Q3', '第3四半期')
          .replace('Q4', '第4四半期')
      }
      return period
    }

    onMounted(loadAll)

    return {
      t,
      loading,
      refreshing,
      hasLoaded,
      error,
      errorMessage,
      loadAll,
      translateProductName,
      forecasts,
      getForecastsByTrend,
      getChangePercent,
      getChangeColor,
      translatePeriod
    }
  }
}
</script>

<style scoped>
.refreshing {
  opacity: 0.6;
  transition: opacity 0.15s;
}

.demand-trend-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.trend-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.trend-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.increasing-card {
  border-left: 4px solid #10b981;
}

.stable-card {
  border-left: 4px solid var(--color-accent);
}

.decreasing-card {
  border-left: 4px solid #ef4444;
}

.trend-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.trend-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 1.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.increasing-card .trend-icon {
  background: var(--color-success-bg);
  color: var(--color-positive);
}

.stable-card .trend-icon {
  background: var(--color-info-bg);
  color: var(--color-accent-text);
}

.decreasing-card .trend-icon {
  background: var(--color-danger-bg);
  color: var(--color-negative);
}

.trend-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trend-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-top: 0.25rem;
}

.trend-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--color-surface-subtle);
  border-radius: 6px;
  transition: background 0.2s;
}

.trend-item:hover {
  background: var(--color-surface-muted);
}

.item-name {
  font-size: 0.875rem;
  color: var(--color-text);
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 1rem;
}

.item-change {
  font-size: 0.813rem;
  font-weight: 700;
  flex-shrink: 0;
}

.increasing-card .item-change {
  color: var(--color-positive);
}

.stable-card .item-change {
  color: var(--color-accent-text);
}

.decreasing-card .item-change {
  color: var(--color-negative);
}

.item-change.neutral {
  color: var(--color-text-muted);
}

.more-items {
  font-size: 0.813rem;
  color: var(--color-text-muted);
  font-style: italic;
  text-align: center;
  padding: 0.5rem;
}
</style>
