import axios from 'axios'

// Defaults to the local backend; set VITE_API_BASE_URL=/api to go through the Vite proxy instead
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api'

// Build a query string from the global filters. Empty values and 'all' mean "no filter",
// so they are dropped. Pass only the keys an endpoint actually supports.
const buildQuery = (filters = {}, keys) => {
  const params = new URLSearchParams()
  for (const key of keys) {
    const value = filters[key]
    if (value && value !== 'all') params.append(key, value)
  }
  return params.toString()
}

const get = async (path, query = '') => {
  const response = await axios.get(`${API_BASE_URL}${path}${query ? `?${query}` : ''}`)
  return response.data
}

// Ids are encoded so a value containing "/" or "?" can never change which route is called
const id = (value) => encodeURIComponent(value)

export const api = {
  getInventory: (filters) => get('/inventory', buildQuery(filters, ['warehouse', 'category'])),

  getInventoryItem: (itemId) => get(`/inventory/${id(itemId)}`),

  getOrders: (filters) => get('/orders', buildQuery(filters, ['warehouse', 'category', 'status', 'month'])),

  getOrder: (orderId) => get(`/orders/${id(orderId)}`),

  getDemandForecasts: () => get('/demand'),

  getBacklog: () => get('/backlog'),

  getDashboardSummary: (filters) =>
    get('/dashboard/summary', buildQuery(filters, ['warehouse', 'category', 'status', 'month'])),

  getSpendingSummary: () => get('/spending/summary'),

  getMonthlySpending: () => get('/spending/monthly'),

  getCategorySpending: () => get('/spending/categories'),

  getTransactions: () => get('/spending/transactions'),

  // Reports are already per-period breakdowns, so they take every filter except month
  getQuarterlyReports: (filters) =>
    get('/reports/quarterly', buildQuery(filters, ['warehouse', 'category', 'status'])),

  getMonthlyTrends: (filters) =>
    get('/reports/monthly-trends', buildQuery(filters, ['warehouse', 'category', 'status'])),

  getTasks: () => get('/tasks'),

  async createTask(taskData) {
    const response = await axios.post(`${API_BASE_URL}/tasks`, taskData)
    return response.data
  },

  async deleteTask(taskId) {
    const response = await axios.delete(`${API_BASE_URL}/tasks/${id(taskId)}`)
    return response.data
  },

  async toggleTask(taskId) {
    const response = await axios.patch(`${API_BASE_URL}/tasks/${id(taskId)}`)
    return response.data
  },

  async createPurchaseOrder(purchaseOrderData) {
    const response = await axios.post(`${API_BASE_URL}/purchase-orders`, purchaseOrderData)
    return response.data
  },

  getPurchaseOrderByBacklogItem: (backlogItemId) => get(`/purchase-orders/${id(backlogItemId)}`)
}

/**
 * Normalize an axios error into { status, message, isNotFound }.
 * Prefers FastAPI's `detail` over axios's generic "Request failed with status code N".
 */
export function formatApiError(error) {
  const status = error?.response?.status
  // FastAPI sends `detail` as a string for HTTPException but as an array of
  // objects for 422 validation errors, so only use it when it is a string.
  const detail = error?.response?.data?.detail
  const message = (typeof detail === 'string' && detail) || error?.message || 'Unknown error'
  return { status, message, isNotFound: status === 404 }
}
