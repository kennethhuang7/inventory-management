export default {
  // Navigation
  nav: {
    overview: '概要',
    inventory: '在庫',
    orders: '注文',
    finance: '財務',
    demandForecast: '需要予測',
    companyName: '触媒コンポーネンツ',
    subtitle: '在庫管理システム',
    reports: 'レポート',
    collapseSidebar: 'サイドバーを折りたたむ',
    expandSidebar: 'サイドバーを展開',
    openMenu: 'メニューを開く',
    closeMenu: 'メニューを閉じる',
    tasks: 'タスク',
    primaryNav: 'メインナビゲーション'
  },

  // Dashboard
  dashboard: {
    title: '概要',
    kpi: {
      title: '主要業績評価指標',
      inventoryTurnover: '在庫回転率',
      ordersFulfilled: '注文履行数',
      orderFillRate: '注文充足率',
      revenue: '収益（注文）',
      revenueYTD: '収益（注文）年初来',
      revenueMTD: '収益（注文）月初来',
      avgProcessingTime: '平均処理時間（日）',
      goal: '目標'
    },
    summary: {
      title: '概要'
    },
    orderHealth: {
      title: '注文状況',
      totalOrders: '総注文数',
      revenue: '収益',
      avgOrderValue: '平均注文額',
      onTimeRate: '定時配達率',
      avgFulfillmentDays: '平均履行日数',
      total: '合計'
    },
    ordersByMonth: {
      title: '月別注文数'
    },
    inventoryValue: {
      title: 'カテゴリ別在庫価値'
    },
    inventoryShortages: {
      title: '在庫不足',
      noShortages: '在庫不足なし - すべての注文を履行できます！',
      noData: '選択したフィルターのデータがありません',
      orderId: '注文ID',
      sku: 'SKU',
      itemName: '品目名',
      quantityNeeded: '必要数量',
      quantityAvailable: '在庫数量',
      shortage: '不足',
      daysDelayed: '遅延日数',
      priority: '優先度',
      unitsShort: '単位不足',
      days: '日',
      createPO: '発注書を作成',
      viewPO: '発注書を表示'
    },
    topProducts: {
      title: '収益別トップ製品',
      sku: 'SKU',
      product: '製品',
      category: 'カテゴリ',
      warehouse: '倉庫',
      stockStatus: '在庫状況',
      revenue: '収益',
      unitsOrdered: '注文数量',
      firstOrder: '初回注文',
      inStock: '在庫あり',
      lowStock: '在庫僅少'
    }
  },

  // Inventory
  inventory: {
    title: '在庫',
    description: 'すべての在庫品目の追跡と管理',
    stockLevels: '在庫レベル',
    skus: 'SKU',
    searchPlaceholder: '品目名で検索...',
    clearSearch: '検索をクリア',
    exportCsv: 'CSVをエクスポート',
    exportCsvTitle: '現在表示中の品目をCSVファイルとしてダウンロード',
    totalItems: '総品目数',
    totalValue: '総価値',
    lowStockItems: '在庫僅少品目',
    warehouses: '倉庫',
    table: {
      sku: 'SKU',
      itemName: '品目名',
      name: '名前',
      category: 'カテゴリ',
      warehouse: '倉庫',
      quantity: '数量',
      quantityOnHand: '手持在庫数',
      reorderPoint: '再注文点',
      unitCost: '単価',
      unitPrice: '単価',
      totalValue: '総価値',
      location: '場所',
      status: 'ステータス'
    }
  },

  // Orders
  orders: {
    title: '注文',
    description: '顧客注文の表示と管理',
    allOrders: 'すべての注文',
    totalOrders: '総注文数',
    totalRevenue: '総収益',
    avgOrderValue: '平均注文額',
    onTimeDelivery: '定時配達',
    itemsCount: '{count}件',
    quantity: '数量',
    table: {
      orderNumber: '注文番号',
      orderId: '注文ID',
      orderDate: '注文日',
      date: '日付',
      customer: '顧客',
      category: 'カテゴリ',
      warehouse: '倉庫',
      items: '品目',
      value: '価格',
      totalValue: '合計金額',
      status: 'ステータス',
      expectedDelivery: '予定配達日',
      actualDelivery: '実際の配達日'
    }
  },

  // Reports page
  reports: {
    title: 'パフォーマンスレポート',
    description: '四半期の業績指標と月次トレンドを表示します',
    periodNotApplied: 'これらのレポートは常に全期間を表示します。期間フィルターは適用されません。',
    loading: 'レポートを読み込み中...',
    quarterlyTitle: '四半期パフォーマンス',
    quarter: '四半期',
    totalOrders: '注文総数',
    totalRevenue: '総売上',
    avgOrderValue: '平均注文額',
    fulfillmentRate: '出荷達成率',
    trendTitle: '月次売上トレンド',
    momTitle: '前月比分析',
    month: '月',
    orders: '注文数',
    revenue: '売上',
    change: '増減',
    growthRate: '成長率',
    notAvailable: 'なし',
    ytdRevenue: '総売上(年初来)',
    avgMonthlyRevenue: '月平均売上',
    ytdOrders: '注文総数(年初来)',
    bestQuarter: '最高業績の四半期'
  },

  // Spending page additions
  spending: {
    filtersNote:
      '予算、カテゴリ別支出、取引の数値は倉庫・カテゴリ・ステータスのフィルターの影響を受けません。注文売上のみが対象です。',
    transactionDetails: '取引の詳細',
    revenueBarLabel: '{month}の売上: {amount}',
    costBarLabel: '{month}のコスト: {amount}',
    costFlowBarLabel: '{month}: コスト合計 {amount}。コスト詳細を開く。'
  },

  // Finance/Spending
  finance: {
    title: '財務ダッシュボード',
    description: '収益、コスト、財務パフォーマンスの追跡',
    totalRevenue: '総収益',
    totalCosts: '総コスト',
    netProfit: '純利益',
    avgOrderValue: '平均注文額',
    fromOrders: '{count}件の注文から',
    costBreakdown: '調達 + 運営 + 人件費 + 間接費',
    margin: 'マージン',
    perOrderRevenue: '注文あたりの収益',
    revenueVsCosts: {
      title: '月別収益対コスト',
      revenue: '収益',
      costs: '総コスト'
    },
    monthlyCostFlow: {
      title: '月別コストフロー',
      procurement: '調達',
      operational: '運営',
      labor: '人件費',
      overhead: '間接費'
    },
    categorySpending: {
      title: 'カテゴリ別支出',
      ofTotal: '全体の'
    },
    transactions: {
      title: '最近の取引',
      id: 'ID',
      description: '説明',
      vendor: 'ベンダー',
      date: '日付',
      amount: '金額'
    }
  },

  // Demand Forecast
  demand: {
    title: '需要予測',
    description: '需要動向の分析と将来のニーズの予測',
    increasingDemand: '需要増加',
    stableDemand: '需要安定',
    decreasingDemand: '需要減少',
    itemsCount: '{count}件',
    more: 'さらに...',
    demandForecasts: '需要予測',
    table: {
      sku: 'SKU',
      itemName: '品目名',
      currentDemand: '現在の需要',
      forecastedDemand: '予測需要',
      change: '変化',
      trend: 'トレンド',
      period: '期間'
    }
  },

  // Filters
  filters: {
    timePeriod: '期間',
    location: '場所',
    category: 'カテゴリ',
    orderStatus: '注文ステータス',
    all: 'すべて',
    allMonths: 'すべての月',
    reset: 'フィルターをリセット'
  },

  // Statuses
  status: {
    delivered: '配達済み',
    shipped: '出荷済み',
    processing: '処理中',
    backordered: 'バックオーダー',
    inStock: '在庫あり',
    lowStock: '在庫僅少',
    adequate: '適量'
  },

  // Trends
  trends: {
    increasing: '増加',
    stable: '安定',
    decreasing: '減少'
  },

  // Priority
  priority: {
    high: '高',
    medium: '中',
    low: '低'
  },

  // Categories
  categories: {
    circuitBoards: '回路基板',
    sensors: 'センサー',
    actuators: 'アクチュエータ',
    controllers: 'コントローラー',
    powerSupplies: '電源'
  },

  // Spending Categories
  spendingCategories: {
    rawMaterials: '原材料',
    components: '部品',
    equipment: '設備',
    consumables: '消耗品'
  },

  // Warehouses
  warehouses: {
    sanFrancisco: 'サンフランシスコ',
    london: 'ロンドン',
    tokyo: '東京'
  },

  // Months
  months: {
    jan: '1月',
    feb: '2月',
    mar: '3月',
    apr: '4月',
    may: '5月',
    jun: '6月',
    jul: '7月',
    aug: '8月',
    sep: '9月',
    oct: '10月',
    nov: '11月',
    dec: '12月',
    january: '1月',
    february: '2月',
    march: '3月',
    april: '4月',
    june: '6月',
    july: '7月',
    august: '8月',
    september: '9月',
    october: '10月',
    november: '11月',
    december: '12月'
  },

  // Profile Menu
  profile: {
    profileDetails: 'プロフィール詳細',
    myTasks: 'マイタスク',
    logout: 'ログアウト',
    menu: 'アカウントメニュー'
  },

  // Profile Details Modal
  profileDetails: {
    title: 'プロフィール詳細',
    email: 'メールアドレス',
    department: '部署',
    location: '勤務地',
    phone: '電話番号',
    joinDate: '入社日',
    employeeId: '社員ID',
    close: '閉じる'
  },

  // Tasks Modal
  tasks: {
    title: 'マイタスク',
    taskTitle: 'タスク名',
    taskTitlePlaceholder: 'タスク名を入力...',
    priority: '優先度',
    dueDate: '期限',
    addTask: 'タスクを追加',
    noTasks: 'タスクがありません。上記からタスクを追加してください！',
    deleteTask: 'タスクを削除',
    deleteTaskNamed: 'タスクを削除: {title}',
    toggleTaskNamed: '完了にする: {title}',
    errors: {
      load: 'タスクを読み込めませんでした。',
      add: 'タスクを追加できませんでした。もう一度お試しください。',
      delete: 'タスクを削除できませんでした。もう一度お試しください。',
      toggle: 'タスクを更新できませんでした。もう一度お試しください。'
    }
  },

  // Detail modals
  modals: {
    notAvailable: 'なし',
    units: '{count}個',
    sku: 'SKU: {sku}',
    inventory: {
      title: '在庫アイテム詳細',
      quantityOnHand: '手持在庫数',
      stockLevel: '在庫レベル',
      vsReorder: '再注文点比',
      category: 'カテゴリ',
      location: '場所',
      reorderPoint: '再注文点',
      unitsRemaining: '残数量',
      unitCost: '単価',
      totalValue: '総価値',
      warehouse: '倉庫',
      status: 'ステータス',
      lowStock: '在庫少',
      adequate: '適正',
      inStock: '在庫あり'
    },
    backlog: {
      title: '在庫不足の詳細',
      priorityBadge: '優先度: {priority}',
      high: '高',
      medium: '中',
      low: '低',
      shortageAmount: '不足数量',
      daysDelayed: '遅延日数',
      daysValue: '{count}日',
      orderId: '注文ID',
      itemSku: '商品SKU',
      quantityNeeded: '必要数量',
      quantityAvailable: '利用可能数量',
      expectedDate: '入荷予定日',
      status: 'ステータス',
      backordered: '入荷待ち'
    },
    cost: {
      title: '{month}のコスト内訳',
      totalCosts: '総コスト',
      procurement: '調達',
      operational: '運営',
      labor: '人件費',
      overhead: '間接費',
      percentOfTotal: '全体の{percent}%'
    },
    product: {
      title: '製品詳細',
      category: 'カテゴリ',
      warehouse: '倉庫',
      unitsOrdered: '注文数量',
      totalRevenue: '総売上',
      currentStock: '現在の在庫',
      reorderPoint: '再注文点',
      firstOrderDate: '初回注文日',
      stockStatus: '在庫状況',
      inStock: '在庫あり',
      lowStock: '在庫少',
      outOfStock: '在庫切れ'
    }
  },

  // Language
  language: {
    english: 'English',
    japanese: '日本語',
    selectLanguage: '言語を選択'
  },

  // Purchase orders
  purchaseOrder: {
    createTitle: '発注書を作成',
    viewTitle: '発注書',
    item: '品目',
    supplier: '仕入先名',
    quantity: '数量',
    unitCost: '単価 (USD)',
    unitCostHint: '表示通貨に関わらず、米ドルで入力してください。',
    expectedDelivery: '納品予定日',
    notes: '備考 (任意)',
    notesLabel: '備考',
    submit: '発注書を作成',
    submitting: '作成中...',
    poId: '発注書ID',
    total: '合計',
    status: 'ステータス',
    createdDate: '作成日',
    unitCostDisplay: '単価',
    noNotes: 'なし',
    loadFailed: '発注書を読み込めませんでした。',
    errors: {
      supplierRequired: '仕入先名は必須です。',
      supplierTooLong: '仕入先名は120文字以内で入力してください。',
      quantityInvalid: '数量は1から1,000,000までの整数で入力してください。',
      unitCostInvalid: '単価は0より大きい値にしてください。',
      dateRequired: '納品予定日を選択してください。',
      dateInPast: '納品予定日に過去の日付は指定できません。',
      notesTooLong: '備考は500文字以内で入力してください。'
    }
  },

  // Common
  common: {
    loading: '読み込み中...',
    error: 'エラー',
    noData: 'データがありません',
    viewDetails: '詳細を見る',
    close: '閉じる',
    save: '保存',
    cancel: 'キャンセル',
    search: '検索',
    filter: 'フィルター',
    export: 'エクスポート',
    items: '件',
    retry: '再試行',
    loadFailed: 'データを読み込めませんでした。',
    loadFailedStale: '更新できませんでした。最後に読み込まれたデータを表示しています。',
    actions: '操作'
  },

  // Product Names
  productNames: {
    'Single Layer PCB Assembly': '単層PCB組立',
    'Dual Layer PCB Assembly': '二層PCB組立',
    'Multi Layer PCB Assembly': '多層PCB組立',
    'Temperature Sensor Module': '温度センサーモジュール',
    'Humidity Sensor Module': '湿度センサーモジュール',
    'Pressure Sensor Module': '圧力センサーモジュール',
    'Proximity Sensor': '近接センサー',
    'Ultrasonic Distance Sensor': '超音波距離センサー',
    'Micro Servo Motor': 'マイクロサーボモータ',
    'Standard Servo Motor': '標準サーボモータ',
    'Stepper Motor NEMA 17': 'ステッピングモータNEMA 17',
    '8-bit Microcontroller': '8ビットマイコン',
    '32-bit ARM Microcontroller': '32ビットARMマイコン',
    'Digital Signal Processor': 'デジタル信号処理装置',
    '3-Axis Accelerometer': '3軸加速度センサー',
    'Gyroscope Module': 'ジャイロスコープモジュール',
    'Light Dependent Resistor': '光依存抵抗器',
    'Coil Spring Heavy Duty': 'コイルばね(重量用)',
    'Compression Spring': '圧縮ばね',
    'PWM Motor Controller': 'PWMモータコントローラ',
    'H-Bridge Motor Driver': 'Hブリッジモータドライバ',
    'Stepper Motor NEMA 23': 'ステッピングモータNEMA 23',
    'Drive Pulley': 'ドライブプーリー',
    'LED Driver IC': 'LEDドライバIC',
    '5V 10A Switching Power Supply': '5V 10Aスイッチング電源',
    '12V 5A Power Supply Module': '12V 5A電源モジュール',
    '24V 3A Industrial Power Supply': '24V 3A産業用電源',
    'Dual Output ±15V Power Supply': 'デュアル出力±15V電源',
    '48V DC Power Supply Unit': '48V DC電源ユニット',
    'USB-C PD 100W Power Supply': 'USB-C PD 100W電源',
    'Battery Backup Power Supply': 'バッテリバックアップ電源',
    'Adjustable Bench Power Supply': '可変ベンチ電源'
  },

  // Customer Names
  customerNames: {
    'MegaCorp Industries': 'メガコープ工業',
    'Elite Systems Corp': 'エリートシステムズ',
    'Horizon Technologies': 'ホライズン技術',
    'FastAssembly Ltd': 'ファストアセンブリー',
    'TechSolutions Group': 'テックソリューションズグループ',
    'Apex Engineering': 'アペックスエンジニアリング',
    'Superior Manufacturing': 'スーペリアマニュファクチャリング',
    'Cascade Manufacturing': 'カスケードマニュファクチャリング',
    'Acme Manufacturing Corp': 'アクメ製造',
    'TechBuild Industries': 'テックビルド工業',
    'Advanced Components Inc': 'アドバンストコンポーネンツ',
    'Premier Industries': 'プレミア工業',
    'Stellar Components Ltd': 'ステラコンポーネンツ',
    'Dynamic Systems Ltd': 'ダイナミックシステムズ'
  }
}
