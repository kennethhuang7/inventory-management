export default {
  // Navigation
  nav: {
    overview: 'Overview',
    inventory: 'Inventory',
    orders: 'Orders',
    finance: 'Finance',
    demandForecast: 'Demand Forecast',
    companyName: 'Catalyst Components',
    subtitle: 'Inventory Management System',
    reports: 'Reports',
    collapseSidebar: 'Collapse sidebar',
    expandSidebar: 'Expand sidebar',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    tasks: 'Tasks',
    primaryNav: 'Primary'
  },

  // Dashboard
  dashboard: {
    title: 'Overview',
    kpi: {
      title: 'Key Performance Indicators',
      inventoryTurnover: 'Inventory Turnover Rate',
      ordersFulfilled: 'Orders Fulfilled',
      orderFillRate: 'Order Fill Rate',
      revenue: 'Revenue (Orders)',
      revenueYTD: 'Revenue (Orders) YTD',
      revenueMTD: 'Revenue (Orders) MTD',
      avgProcessingTime: 'Avg Processing Time (Days)',
      goal: 'Goal'
    },
    summary: {
      title: 'Summary'
    },
    orderHealth: {
      title: 'Order Health',
      totalOrders: 'Total Orders',
      revenue: 'Revenue',
      avgOrderValue: 'Avg Order Value',
      onTimeRate: 'On-Time Rate',
      avgFulfillmentDays: 'Avg Fulfillment (Days)',
      total: 'Total'
    },
    ordersByMonth: {
      title: 'Orders by Month'
    },
    inventoryValue: {
      title: 'Inventory Value by Category'
    },
    inventoryShortages: {
      title: 'Inventory Shortages',
      noShortages: 'No inventory shortages - all orders can be fulfilled!',
      noData: 'No inventory data for selected filters',
      orderId: 'Order ID',
      sku: 'SKU',
      itemName: 'Item Name',
      quantityNeeded: 'Quantity Needed',
      quantityAvailable: 'Quantity Available',
      shortage: 'Shortage',
      daysDelayed: 'Days Delayed',
      priority: 'Priority',
      unitsShort: 'units short',
      days: 'days',
      createPO: 'Create PO',
      viewPO: 'View PO'
    },
    topProducts: {
      title: 'Top Products by Revenue',
      sku: 'SKU',
      product: 'Product',
      category: 'Category',
      warehouse: 'Warehouse',
      stockStatus: 'Stock Status',
      revenue: 'Revenue',
      unitsOrdered: 'Units Ordered',
      firstOrder: 'First Order',
      inStock: 'In Stock',
      lowStock: 'Low Stock'
    }
  },

  // Inventory
  inventory: {
    title: 'Inventory',
    description: 'Track and manage all inventory items',
    stockLevels: 'Stock Levels',
    skus: 'SKUs',
    searchPlaceholder: 'Search by item name...',
    clearSearch: 'Clear search',
    exportCsv: 'Export CSV',
    exportCsvTitle: 'Download the items currently shown as a CSV file',
    totalItems: 'Total Items',
    totalValue: 'Total Value',
    lowStockItems: 'Low Stock Items',
    warehouses: 'Warehouses',
    table: {
      sku: 'SKU',
      itemName: 'Item Name',
      name: 'Name',
      category: 'Category',
      warehouse: 'Warehouse',
      quantity: 'Quantity',
      quantityOnHand: 'Quantity on Hand',
      reorderPoint: 'Reorder Point',
      unitCost: 'Unit Cost',
      unitPrice: 'Unit Price',
      totalValue: 'Total Value',
      location: 'Location',
      status: 'Status'
    }
  },

  // Orders
  orders: {
    title: 'Orders',
    description: 'View and manage customer orders',
    allOrders: 'All Orders',
    totalOrders: 'Total Orders',
    totalRevenue: 'Total Revenue',
    avgOrderValue: 'Avg Order Value',
    onTimeDelivery: 'On-Time Delivery',
    itemsCount: '{count} items',
    quantity: 'Qty',
    table: {
      orderNumber: 'Order Number',
      orderId: 'Order ID',
      orderDate: 'Order Date',
      date: 'Date',
      customer: 'Customer',
      category: 'Category',
      warehouse: 'Warehouse',
      items: 'Items',
      value: 'Value',
      totalValue: 'Total Value',
      status: 'Status',
      expectedDelivery: 'Expected Delivery',
      actualDelivery: 'Actual Delivery'
    }
  },

  // Reports page
  reports: {
    title: 'Performance Reports',
    description: 'View quarterly performance metrics and monthly trends',
    periodNotApplied: 'These reports always show every period; the time period filter does not apply.',
    loading: 'Loading reports...',
    quarterlyTitle: 'Quarterly Performance',
    quarter: 'Quarter',
    totalOrders: 'Total Orders',
    totalRevenue: 'Total Revenue',
    avgOrderValue: 'Avg Order Value',
    fulfillmentRate: 'Fulfillment Rate',
    trendTitle: 'Monthly Revenue Trend',
    momTitle: 'Month-over-Month Analysis',
    month: 'Month',
    orders: 'Orders',
    revenue: 'Revenue',
    change: 'Change',
    growthRate: 'Growth Rate',
    notAvailable: 'N/A',
    ytdRevenue: 'Total Revenue (YTD)',
    avgMonthlyRevenue: 'Avg Monthly Revenue',
    ytdOrders: 'Total Orders (YTD)',
    bestQuarter: 'Best Performing Quarter'
  },

  // Spending page additions
  spending: {
    filtersNote:
      'Budget, category spending and transaction figures are not affected by the warehouse, category or status filters. Only order revenue is.',
    transactionDetails: 'Transaction Details',
    revenueBarLabel: 'Revenue for {month}: {amount}',
    costBarLabel: 'Costs for {month}: {amount}',
    costFlowBarLabel: '{month}: total costs {amount}. Open cost details.'
  },

  // Finance/Spending
  finance: {
    title: 'Finance Dashboard',
    description: 'Track revenue, costs, and financial performance',
    totalRevenue: 'Total Revenue',
    totalCosts: 'Total Costs',
    netProfit: 'Net Profit',
    avgOrderValue: 'Avg Order Value',
    fromOrders: 'From {count} orders',
    costBreakdown: 'Procurement + Operational + Labor + Overhead',
    margin: 'margin',
    perOrderRevenue: 'Per order revenue',
    revenueVsCosts: {
      title: 'Monthly Revenue vs Costs',
      revenue: 'Revenue',
      costs: 'Total Costs'
    },
    monthlyCostFlow: {
      title: 'Monthly Cost Flow',
      procurement: 'Procurement',
      operational: 'Operational',
      labor: 'Labor',
      overhead: 'Overhead'
    },
    categorySpending: {
      title: 'Spending by Category',
      ofTotal: 'of total'
    },
    transactions: {
      title: 'Recent Transactions',
      id: 'ID',
      description: 'Description',
      vendor: 'Vendor',
      date: 'Date',
      amount: 'Amount'
    }
  },

  // Demand Forecast
  demand: {
    title: 'Demand Forecast',
    description: 'Analyze demand trends and forecasts',
    increasingDemand: 'Increasing Demand',
    stableDemand: 'Stable Demand',
    decreasingDemand: 'Decreasing Demand',
    itemsCount: '{count} items',
    more: 'more...',
    demandForecasts: 'Demand Forecasts',
    table: {
      sku: 'SKU',
      itemName: 'Item Name',
      currentDemand: 'Current Demand',
      forecastedDemand: 'Forecasted Demand',
      change: 'Change',
      trend: 'Trend',
      period: 'Period'
    }
  },

  // Filters
  filters: {
    timePeriod: 'Time Period',
    location: 'Location',
    category: 'Category',
    orderStatus: 'Order Status',
    all: 'All',
    allMonths: 'All Months',
    reset: 'Reset filters'
  },

  // Statuses
  status: {
    delivered: 'Delivered',
    shipped: 'Shipped',
    processing: 'Processing',
    backordered: 'Backordered',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    adequate: 'Adequate'
  },

  // Trends
  trends: {
    increasing: 'increasing',
    stable: 'stable',
    decreasing: 'decreasing'
  },

  // Priority
  priority: {
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  },

  // Categories
  categories: {
    circuitBoards: 'Circuit Boards',
    sensors: 'Sensors',
    actuators: 'Actuators',
    controllers: 'Controllers',
    powerSupplies: 'Power Supplies'
  },

  // Spending Categories
  spendingCategories: {
    rawMaterials: 'Raw Materials',
    components: 'Components',
    equipment: 'Equipment',
    consumables: 'Consumables'
  },

  // Warehouses
  warehouses: {
    sanFrancisco: 'San Francisco',
    london: 'London',
    tokyo: 'Tokyo'
  },

  // Months
  months: {
    jan: 'Jan',
    feb: 'Feb',
    mar: 'Mar',
    apr: 'Apr',
    may: 'May',
    jun: 'Jun',
    jul: 'Jul',
    aug: 'Aug',
    sep: 'Sep',
    oct: 'Oct',
    nov: 'Nov',
    dec: 'Dec',
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December'
  },

  // Profile Menu
  profile: {
    profileDetails: 'Profile Details',
    myTasks: 'My Tasks',
    logout: 'Logout',
    menu: 'Account menu'
  },

  // Profile Details Modal
  profileDetails: {
    title: 'Profile Details',
    email: 'Email',
    department: 'Department',
    location: 'Location',
    phone: 'Phone',
    joinDate: 'Join Date',
    employeeId: 'Employee ID',
    close: 'Close'
  },

  // Tasks Modal
  tasks: {
    title: 'My Tasks',
    taskTitle: 'Task Title',
    taskTitlePlaceholder: 'Enter task title...',
    priority: 'Priority',
    dueDate: 'Due Date',
    addTask: 'Add Task',
    noTasks: 'No tasks yet. Add your first task above!',
    deleteTask: 'Delete task',
    deleteTaskNamed: 'Delete task: {title}',
    toggleTaskNamed: 'Mark complete: {title}',
    errors: {
      load: 'Could not load your tasks.',
      add: 'Could not add the task. Please try again.',
      delete: 'Could not delete the task. Please try again.',
      toggle: 'Could not update the task. Please try again.'
    }
  },

  // Detail modals
  modals: {
    notAvailable: 'N/A',
    units: '{count} units',
    sku: 'SKU: {sku}',
    inventory: {
      title: 'Inventory Item Details',
      quantityOnHand: 'Quantity on Hand',
      stockLevel: 'Stock Level',
      vsReorder: 'vs. reorder point',
      category: 'Category',
      location: 'Location',
      reorderPoint: 'Reorder Point',
      unitsRemaining: 'Units Remaining',
      unitCost: 'Unit Cost',
      totalValue: 'Total Value',
      warehouse: 'Warehouse',
      status: 'Status',
      lowStock: 'Low Stock',
      adequate: 'Adequate',
      inStock: 'In Stock'
    },
    backlog: {
      title: 'Inventory Shortage Details',
      priorityBadge: '{priority} Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      shortageAmount: 'Shortage Amount',
      daysDelayed: 'Days Delayed',
      daysValue: '{count} days',
      orderId: 'Order ID',
      itemSku: 'Item SKU',
      quantityNeeded: 'Quantity Needed',
      quantityAvailable: 'Quantity Available',
      expectedDate: 'Expected Date',
      status: 'Status',
      backordered: 'Backordered'
    },
    cost: {
      title: '{month} Cost Breakdown',
      totalCosts: 'Total Costs',
      procurement: 'Procurement',
      operational: 'Operational',
      labor: 'Labor',
      overhead: 'Overhead',
      percentOfTotal: '{percent}% of total'
    },
    product: {
      title: 'Product Details',
      category: 'Category',
      warehouse: 'Warehouse',
      unitsOrdered: 'Units Ordered',
      totalRevenue: 'Total Revenue',
      currentStock: 'Current Stock',
      reorderPoint: 'Reorder Point',
      firstOrderDate: 'First Order Date',
      stockStatus: 'Stock Status',
      inStock: 'In Stock',
      lowStock: 'Low Stock',
      outOfStock: 'Out of Stock'
    }
  },

  // Theme
  theme: {
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode'
  },

  // Language
  language: {
    english: 'English',
    japanese: 'Japanese',
    selectLanguage: 'Select Language'
  },

  // Purchase orders
  purchaseOrder: {
    createTitle: 'Create Purchase Order',
    viewTitle: 'Purchase Order',
    item: 'Item',
    supplier: 'Supplier name',
    quantity: 'Quantity',
    unitCost: 'Unit cost (USD)',
    unitCostHint: 'Enter the cost in US dollars, whatever display currency is selected.',
    expectedDelivery: 'Expected delivery date',
    notes: 'Notes (optional)',
    notesLabel: 'Notes',
    submit: 'Create purchase order',
    submitting: 'Creating...',
    poId: 'PO ID',
    total: 'Total',
    status: 'Status',
    createdDate: 'Created',
    unitCostDisplay: 'Unit cost',
    noNotes: 'None',
    loadFailed: 'Could not load the purchase order.',
    errors: {
      supplierRequired: 'Supplier name is required.',
      supplierTooLong: 'Supplier name must be 120 characters or fewer.',
      quantityInvalid: 'Quantity must be a whole number from 1 to 1,000,000.',
      unitCostInvalid: 'Unit cost must be greater than 0.',
      dateRequired: 'Choose an expected delivery date.',
      dateInPast: 'Expected delivery date cannot be in the past.',
      notesTooLong: 'Notes must be 500 characters or fewer.'
    }
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    noData: 'No data available',
    viewDetails: 'View Details',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    items: 'items',
    retry: 'Retry',
    loadFailed: 'Could not load this data.',
    loadFailedStale: 'Could not refresh. Showing the last data that loaded.',
    actions: 'Actions'
  }
}
