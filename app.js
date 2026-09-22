/* 律行：个人工作台 UI + 本地可用功能层
 * 本轮先做 local-first：数据保存在浏览器本地，并通过 BroadcastChannel / storage 事件同步同源设备标签页。
 * 跨设备云端同步需要下一阶段接入后端账户与数据库。
 */
const APP_VERSION = '2026-09-22-round-19';
const STORAGE_KEY = 'luxing-workbench-state-v2';
const DAY_NAMES = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const today = new Date();
const isoToday = dateKey(today);
const dateLabel = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(today);

function dateKey(date) {
  const target = date instanceof Date ? date : new Date(date);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function monthKey(date = today) {
  const target = date instanceof Date ? date : new Date(date);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [year, month] = String(key || '').split('-').map(Number);
  return year && month ? `${year}年${month}月` : '';
}

function dateOffset(days) {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function defaultState() {
  return {
    page: 'today',
    learnTab: 'learning',
    planFilter: 'all',
    planDateFilter: 'all',
    inboxSelecting: false,
    selectedInboxIds: [],
    inboxSearch: '',
    globalSearch: '',
    modalType: 'task',
    timelineReminderMinutes: 15,
    learningPlanFormOpen: true,
    learningTempFormOpen: false,
    fitnessPlanFormOpen: false,
    fitnessActionFormOpen: false,
    fitnessEditingPlanId: '',
    fitnessRecordMonth: monthKey(),
    fitnessRecordMonthManual: false,
    fitnessHistoryMonthsOpen: false,
    learningPlanDaysDraft: [],
    fitnessPlanDaysDraft: [],
    workDaysDraft: [],
    workoutCategories: ['力量', '有氧', '拉伸', '恢复', '自定义'],
    fitnessActionCategoryFilter: '全部',
    fitnessPlanActionCategoryFilter: '全部',
    lifeReminderTimesDraft: [],
    lifeReminderModeDraft: 'once',
    lifeReminderDaysDraft: [],
    inboxEditingId: '',
    quotes: [
      { id: 'quote-1', text: '时间就像海绵里的水，只要愿挤，总还是有的。', author: '鲁迅', category: '中外名人' },
      { id: 'quote-2', text: 'Do or do not. There is no try.', author: '尤达', category: '电影语录' },
      { id: 'quote-3', text: 'Stay hungry. Stay foolish.', author: '史蒂夫·乔布斯', category: '中外名人' },
    ],
    quoteMode: 'random',
    fixedQuoteId: 'quote-1',
    todayQuoteDate: '',
    todayQuoteId: '',
    tasks: [
      { id: 'task-1', title: '完成律行首页 UI', meta: '独立站制作 · 约 90 分钟', priority: 'high', done: false, date: isoToday, time: '09:00' },
      { id: 'task-2', title: '整理本周新闻素材', meta: '内容研究 · 约 30 分钟', priority: 'medium', done: false, date: isoToday, time: '20:00' },
      { id: 'task-3', title: '回复待处理的合作邮件', meta: '沟通 · 约 20 分钟', priority: 'medium', done: true, date: isoToday, time: '15:00' },
      { id: 'task-4', title: '更新作品集项目说明', meta: '个人品牌 · 约 45 分钟', priority: 'low', done: false, date: dateOffset(1), time: '10:30' },
    ],
    inbox: [
      { id: 'inbox-1', text: '研究一下离线同步方案，最好手机没网时也能快速记录', time: '2 分钟前', tag: '未分类', status: 'pending', createdAt: new Date().toISOString() },
      { id: 'inbox-2', text: '以后想做一个每周复盘模板', time: '今天 09:20', tag: '想法', status: 'pending', createdAt: new Date().toISOString() },
      { id: 'inbox-3', text: '收藏：几个值得参考的独立开发者网站', time: '昨天 21:10', tag: '参考资料', status: 'pending', createdAt: new Date().toISOString() },
    ],
    reminders: [
      { id: 'reminder-1', title: '喝水并起身活动', date: isoToday, scheduleMode: 'once', scheduleDays: [], time: '15:00', times: ['15:00'], priority: 'low', done: false, repeat: '单日提醒' },
      { id: 'reminder-2', title: '记录今天的日记', date: isoToday, scheduleMode: 'once', scheduleDays: [], time: '22:30', times: ['22:30'], priority: 'medium', done: false, repeat: '单日提醒' },
    ],
    workItems: [
      { id: 'work-1', title: '缴纳公司办公室租金', detail: '办公室固定支出', type: 'reminder', schedule: 'monthly', dayOfMonth: 18, time: '10:00', priority: 'high', doneDates: [] },
      { id: 'work-2', title: '整理本月工作发票', detail: '归档并发送给财务', type: 'plan', schedule: 'once', date: isoToday, time: '16:30', priority: 'medium', done: false, doneDates: [] },
    ],
    learningItems: [
      { id: 'learning-1', title: '阅读文章：AI 产品趋势', content: '阅读一篇行业文章，记下 3 个关键观点。', requirement: '完成后写一条自己的理解', detail: '预计 20 分钟 · 来自今日新闻', category: '文章', minutes: 20, scheduleMode: 'daily', scheduleDays: [], scheduleDates: [], doneDates: [] },
      { id: 'learning-2', title: '记录 3 个新表达', content: '学习并复习三个英语表达。', requirement: '各写一个例句', detail: '预计 10 分钟 · 英语', category: '练习', minutes: 10, scheduleMode: 'daily', scheduleDays: [], scheduleDates: [], doneDates: [] },
    ],
    learningNotes: {},
    learningCompleteDates: [],
    workouts: [
      { id: 'workout-1', title: '俯卧撑', detail: '3 组 · 每组 12 次', category: '力量' },
      { id: 'workout-2', title: '哑铃推举', detail: '3 组 · 每组 10 次', category: '力量' },
      { id: 'workout-3', title: '拉伸', detail: '5 分钟 · 放松', category: '恢复' },
    ],
    fitnessLogs: [
      { id: 'session-2026-09-14', type: 'session', date: `${today.getFullYear()}-09-14`, duration: 45 },
      { id: 'session-2026-09-16', type: 'session', date: `${today.getFullYear()}-09-16`, duration: 45 },
      { id: 'session-2026-09-17', type: 'session', date: `${today.getFullYear()}-09-17`, duration: 45 },
    ],
    fitnessPlans: [
      { id: 'fitness-plan-1', title: '上肢训练', requirement: '每个动作完成 3 组，保持动作标准。', actionIds: ['workout-1', 'workout-2'], scheduleMode: 'daily', scheduleDays: [], scheduleDates: [], doneDates: [], time: '16:00', createdAt: isoToday },
    ],
    fitnessFeeling: '',
    journals: {},
    journalDraft: '',
    journalViewingDate: isoToday,
    news: [
      { id: 'news-1', source: '36氪', title: 'AI 应用正在从“能用”进入“好用”阶段', summary: '产品体验与工作流正在成为新的竞争点。', category: '科技', age: '1 小时前', saved: false, captured: false },
      { id: 'news-2', source: '少数派', title: '如何为个人系统设计一个轻量的收集箱', summary: '先记录，再整理；降低输入的阻力。', category: '效率', age: '2 小时前', saved: false, captured: false },
      { id: 'news-3', source: 'The Verge', title: 'Apple 设备上的个人生产力趋势', summary: '从跨设备同步到更自然的提醒体验。', category: 'Apple', age: '3 小时前', saved: false, captured: false },
      { id: 'news-4', source: '即刻精选', title: '把每周计划变成可持续的生活节奏', summary: '不追求塞满日程，而是给重要的事留出位置。', category: '生活', age: '昨天', saved: false, captured: false },
    ],
    settings: { dailyStart: '09:00', journalTime: '22:30', notifications: true },
    // 账户信息：目前只有本机一份身份，未来接入后端后用于区分多个用户。
    account: { nickname: '林', phone: '', avatar: '' },
    firstUseDate: isoToday,
    // 同步元数据：为跨设备同步做准备。
    // clock 记录「集合:id」或字段名最后一次被修改的时间；tombstones 记录删除动作，
    // 有了删除墓碑，别的设备才不会把已经删掉的记录又同步回来。
    // code 是「同步码」：两端填同一串码就同步同一份数据，不需要登录。
    sync: { device: '', rev: 0, updatedAt: '', clock: {}, tombstones: {}, code: '', lastSyncedAt: '', lastError: '' },
    lastSavedAt: null,
  };
}

function mergeState(saved) {
  const base = defaultState();
  if (!saved || typeof saved !== 'object') return base;
  const merged = { ...base, ...saved };
  const arrayKeys = ['tasks', 'inbox', 'reminders', 'workItems', 'learningItems', 'learningCompleteDates', 'workouts', 'fitnessLogs', 'news', 'quotes'];
  arrayKeys.forEach(key => { if (!Array.isArray(merged[key])) merged[key] = base[key]; });
  merged.learningNotes = saved.learningNotes && typeof saved.learningNotes === 'object' ? saved.learningNotes : {};
  merged.workoutCategories = Array.isArray(saved.workoutCategories) && saved.workoutCategories.length ? [...new Set(saved.workoutCategories.map(String).filter(Boolean))] : base.workoutCategories;
  merged.fitnessActionCategoryFilter = typeof saved.fitnessActionCategoryFilter === 'string' && (saved.fitnessActionCategoryFilter === '全部' || merged.workoutCategories.includes(saved.fitnessActionCategoryFilter)) ? saved.fitnessActionCategoryFilter : '全部';
  merged.fitnessPlanActionCategoryFilter = '全部';
  // 月记录页面默认跟随当前月份；只有用户主动点选历史月份时才固定查看历史月。
  merged.fitnessRecordMonth = monthKey();
  merged.fitnessRecordMonthManual = false;
  merged.fitnessHistoryMonthsOpen = false;
  merged.learningTempFormOpen = false;
  merged.learningPlanFormOpen = true;
  merged.learningHistoryOpen = false;
  merged.fitnessEditingPlanId = '';
  merged.learningPlans = undefined;
  if (!Array.isArray(merged.fitnessPlans)) merged.fitnessPlans = base.fitnessPlans;
  merged.journals = saved.journals && typeof saved.journals === 'object' ? saved.journals : {};
  merged.settings = { ...base.settings, ...(saved.settings || {}) };
  // 账户字段逐项兜底：昵称一定有值，头像为空表示用昵称首字占位。
  merged.account = { ...base.account, ...(saved.account && typeof saved.account === 'object' ? saved.account : {}) };
  merged.account.nickname = String(merged.account.nickname || '').trim() || base.account.nickname;
  merged.account.phone = String(merged.account.phone || '').replace(/\D/g, '').slice(0, 11);
  merged.account.avatar = typeof merged.account.avatar === 'string' ? merged.account.avatar : '';
  // 使用天数从首次使用当天开始算。旧数据没有这个字段，就从已有记录里取最早的一天作为起点，
  // 避免老用户升级后看到「使用 1 天」。
  if (/^\d{4}-\d{2}-\d{2}$/.test(saved.firstUseDate || '')) {
    merged.firstUseDate = saved.firstUseDate;
  } else {
    const knownDates = [
      ...merged.fitnessLogs.map(log => log.date),
      ...Object.keys(merged.journals || {}),
      ...merged.tasks.map(task => task.date),
      ...(Array.isArray(merged.learningCompleteDates) ? merged.learningCompleteDates : []),
    ].filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date || ''));
    merged.firstUseDate = knownDates.length ? knownDates.sort()[0] : isoToday;
  }
  // 同步元数据兜底：旧数据没有 sync 字段，这里补一个空的。
  const savedSync = saved.sync && typeof saved.sync === 'object' ? saved.sync : {};
  merged.sync = {
    device: typeof savedSync.device === 'string' && savedSync.device ? savedSync.device : makeId('device'),
    rev: Number(savedSync.rev) || 0,
    updatedAt: typeof savedSync.updatedAt === 'string' ? savedSync.updatedAt : '',
    clock: savedSync.clock && typeof savedSync.clock === 'object' ? { ...savedSync.clock } : {},
    tombstones: savedSync.tombstones && typeof savedSync.tombstones === 'object' ? { ...savedSync.tombstones } : {},
    code: typeof savedSync.code === 'string' ? savedSync.code : '',
    lastSyncedAt: typeof savedSync.lastSyncedAt === 'string' ? savedSync.lastSyncedAt : '',
    lastError: typeof savedSync.lastError === 'string' ? savedSync.lastError : '',
  };
  merged.quotes = merged.quotes.map(quote => ({ ...quote, id: quote.id ?? makeId('quote'), text: quote.text || '', author: quote.author || '佚名', category: quote.category === '电影语录' ? '电影语录' : '中外名人' })).filter(quote => quote.text);
  if (!merged.quotes.length) merged.quotes = base.quotes;
  merged.quoteMode = merged.quoteMode === 'fixed' ? 'fixed' : 'random';
  merged.fixedQuoteId = merged.fixedQuoteId || merged.quotes[0]?.id || null;
  merged.timelineReminderMinutes = [0, 5, 15, 30].includes(Number(merged.timelineReminderMinutes)) ? Number(merged.timelineReminderMinutes) : 15;
  merged.selectedInboxIds = [];
  merged.inboxSelecting = false;
  merged.inboxEditingId = '';
  merged.lifeReminderModeDraft = 'once';
  merged.lifeReminderDaysDraft = [];
  merged.learningPlanDaysDraft = Array.isArray(saved.learningPlanDaysDraft) ? saved.learningPlanDaysDraft.map(Number).filter(day => day >= 1 && day <= 31) : [];
  merged.fitnessPlanDaysDraft = Array.isArray(saved.fitnessPlanDaysDraft) ? saved.fitnessPlanDaysDraft.map(Number).filter(day => day >= 1 && day <= 31) : [];
  // 表单草稿只存在当前页面会话中，不从旧的持久化数据恢复，避免新增工作计划时 1 号被意外选中。
  merged.workDaysDraft = [];
  // 兼容第一版原型中的“今天 / 明天 / 未安排”日期字段。
  merged.inbox = merged.inbox.map(item => ({ ...item, id: item.id ?? makeId('inbox'), priority: item.priority || 'medium', status: item.status || 'pending', text: item.text || '' }));
  merged.tasks = merged.tasks.map(task => ({
    ...task,
    id: task.id ?? makeId('task'),
    date: task.date === '今天' ? isoToday : task.date === '明天' ? dateOffset(1) : task.date === '未安排' ? '' : task.date,
    done: Boolean(task.done),
    completedAt: task.completedAt || (task.done ? task.date : ''),
    priority: task.priority || 'medium',
  }));
  merged.learningItems = merged.learningItems.map(item => ({
    ...item,
    id: item.id ?? makeId('learning'),
    title: item.title || '未命名学习计划',
    content: item.content || item.detail || '',
    requirement: item.requirement || '',
    detail: item.detail || item.content || '',
    category: item.category || '学习',
    minutes: Number(item.minutes) || 30,
    scheduleMode: ['monthly', 'dates', 'daily'].includes(item.scheduleMode) ? item.scheduleMode : 'daily',
    scheduleDays: Array.isArray(item.scheduleDays) ? item.scheduleDays.map(Number).filter(day => day >= 1 && day <= 31) : [],
    scheduleDates: Array.isArray(item.scheduleDates) ? item.scheduleDates : [],
    doneDates: Array.isArray(item.doneDates) ? item.doneDates : [],
  }));
  merged.fitnessPlans = merged.fitnessPlans.map(plan => ({
    ...plan,
    id: plan.id ?? makeId('fitness-plan'),
    title: plan.title || '未命名训练计划',
    requirement: plan.requirement || '',
    time: /^\d{2}:\d{2}$/.test(plan.time || '') ? plan.time : '16:00',
    actionIds: Array.isArray(plan.actionIds) ? plan.actionIds : [],
    scheduleMode: ['monthly', 'dates', 'daily'].includes(plan.scheduleMode) ? plan.scheduleMode : 'daily',
    scheduleDays: Array.isArray(plan.scheduleDays) ? plan.scheduleDays.map(Number).filter(day => day >= 1 && day <= 31) : [],
    scheduleDates: Array.isArray(plan.scheduleDates) ? plan.scheduleDates : [],
    doneDates: Array.isArray(plan.doneDates) ? plan.doneDates.filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date)) : [],
    // 旧版本没有创建日期，升级时从今天开始计算，避免凭空生成历史逾期实例。
    createdAt: /^\d{4}-\d{2}-\d{2}$/.test(plan.createdAt || '') ? plan.createdAt : isoToday,
  }));
  // 2026-09：首次升级时修正月记录，保持 9 月 14、16、17 日有记录，15 日无记录。
  // 使用迁移标记，避免用户日后自行修改这些日期时被每次刷新覆盖。
  if (!saved.fitnessSeptemberCorrectionApplied) {
    const confirmedSeptemberDays = ['14', '16', '17'];
    const septemberPrefix = `${today.getFullYear()}-09-`;
    merged.fitnessLogs = merged.fitnessLogs.filter(log => !(log.type === 'session' && ['14', '15', '16', '17'].includes(String(log.date || '').slice(-2)) && String(log.date || '').startsWith(septemberPrefix)));
    confirmedSeptemberDays.forEach(day => merged.fitnessLogs.push({ id: `session-${today.getFullYear()}-09-${day}`, type: 'session', date: `${septemberPrefix}${day}`, duration: 45 }));
    merged.fitnessSeptemberCorrectionApplied = true;
  } else {
    merged.fitnessSeptemberCorrectionApplied = true;
  }
  merged.reminders = merged.reminders.map(item => {
    const times = [...new Set((Array.isArray(item.times) ? item.times : [item.time]).filter(value => /^\d{2}:\d{2}$/.test(value || '')).sort())];
    const scheduleMode = item.scheduleMode === 'monthly' || item.repeat === '固定提醒' ? 'monthly' : 'once';
    const scheduleDays = Array.isArray(item.scheduleDays) ? item.scheduleDays.map(normalizeMonthDay).filter(Boolean) : [];
    const doneDates = Array.isArray(item.doneDates) ? item.doneDates.filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date)) : [];
    return {
      ...item,
      id: item.id ?? makeId('reminder'),
      title: item.title || '未命名生活提醒',
      date: item.date || isoToday,
      scheduleMode,
      scheduleDays: [...new Set(scheduleDays)],
      time: times[0] || item.time || '',
      times,
      priority: item.priority || 'medium',
      completedAt: item.completedAt || (item.done ? item.date : ''),
      doneDates,
      done: Boolean(item.done),
      repeat: scheduleMode === 'monthly' ? '固定提醒' : (item.repeat || '单日提醒'),
    };
  });
  merged.workItems = merged.workItems.map(item => {
    const scheduleDays = Array.isArray(item.scheduleDays)
      ? item.scheduleDays.map(normalizeMonthDay).filter(Boolean)
      : [];
    const fallbackDay = normalizeMonthDay(item.dayOfMonth);
    return {
      ...item,
      id: item.id ?? makeId('work'),
      title: item.title || '未命名工作事项',
      detail: item.detail || '',
      type: item.type === 'reminder' ? 'reminder' : 'plan',
      schedule: item.schedule === 'monthly' ? 'monthly' : 'once',
      date: item.date || '',
      dayOfMonth: fallbackDay,
      scheduleDays: [...new Set(scheduleDays.length ? scheduleDays : (fallbackDay ? [fallbackDay] : []))],
      time: item.time || '',
      priority: item.priority || 'medium',
      done: Boolean(item.done),
      doneDates: Array.isArray(item.doneDates) ? item.doneDates : [],
    };
  });
  return merged;
}

// 变更追踪的比对基线。必须在这里声明：下面紧接着就会用到它，
// 若声明放在后面会因为 let 的暂时性死区（TDZ）直接报错、整个应用起不来。
let lastTrackedSnapshot = null;

let state;
try {
  state = mergeState(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
} catch (error) {
  state = defaultState();
}
// 变更追踪的比对基线：以「刚加载完成的状态」为起点，
// 这样第一次 persist 不会把全部历史数据都盖上新时间戳。
lastTrackedSnapshot = trackableSnapshot();

const pageContainer = document.querySelector('#page-container');
const breadcrumbTitle = document.querySelector('#breadcrumb-title');
const toast = document.querySelector('#toast');
const modal = document.querySelector('#quick-add-modal');
const confirmModal = document.querySelector('#confirm-modal');
const quoteModal = document.querySelector('#quote-modal');
const lifeReminderModal = document.querySelector('#life-reminder-modal');
const lifeReminderForm = document.querySelector('#life-reminder-form');
const quoteForm = document.querySelector('#quote-form');
const quoteText = document.querySelector('#quote-text');
const quoteAuthor = document.querySelector('#quote-author');
const quoteCategory = document.querySelector('#quote-category');
const quickInput = document.querySelector('#quick-add-input');
const quickDate = document.querySelector('#quick-add-date');
const quickTime = document.querySelector('#quick-add-time');
const quickDuration = document.querySelector('#quick-add-duration');
const quickPriority = document.querySelector('#quick-add-priority');
const quickTimeField = document.querySelector('#quick-add-time-field');
const quickDurationField = document.querySelector('#quick-add-duration-field');
const quickAddTitle = document.querySelector('#quick-add-title');
const confirmTitle = document.querySelector('#confirm-title');
const confirmMessage = document.querySelector('#confirm-message');
const confirmAction = document.querySelector('#confirm-action');
const globalSearch = document.querySelector('#global-search');
let toastTimer;
let pendingConfirmation = null;
let modalContext = { mode: 'create', id: null };
let channel;
try { channel = new BroadcastChannel('luxing-workbench'); } catch (error) { channel = null; }

function dataSnapshot() {
  const snapshot = { ...state };
  delete snapshot.page;
  delete snapshot.learnTab;
  delete snapshot.planFilter;
  delete snapshot.planDateFilter;
  delete snapshot.inboxSelecting;
  delete snapshot.selectedInboxIds;
  delete snapshot.inboxSearch;
  delete snapshot.globalSearch;
  delete snapshot.modalType;
  delete snapshot.learningPlanFormOpen;
  delete snapshot.learningTempFormOpen;
  delete snapshot.learningHistoryOpen;
  delete snapshot.fitnessPlanFormOpen;
  delete snapshot.fitnessActionFormOpen;
  delete snapshot.fitnessPlanActionCategoryFilter;
  delete snapshot.fitnessEditingPlanId;
  delete snapshot.fitnessRecordMonth;
  delete snapshot.fitnessRecordMonthManual;
  delete snapshot.fitnessHistoryMonthsOpen;
  delete snapshot.learningPlanDaysDraft;
  delete snapshot.fitnessPlanDaysDraft;
  delete snapshot.workDaysDraft;
  delete snapshot.lifeReminderTimesDraft;
  delete snapshot.lifeReminderModeDraft;
  delete snapshot.lifeReminderDaysDraft;
  delete snapshot.inboxEditingId;
  return snapshot;
}

/* ---------- 变更追踪：跨设备同步的前置条件 ----------
 * 设计要点：不去改几十个业务函数，只在 persist() 这一处集中做差异比对。
 * 所有会改数据的操作最后都会调用 persist()，所以不会漏。
 * 每次 persist 时把当前快照和上一次的快照逐条比对，给变化过的记录/字段盖上时间戳，
 * 记录消失就写一个删除墓碑。同步时按「同一 key 谁的时间戳新谁生效」合并。
 */
const SYNC_RECORD_COLLECTIONS = ['tasks', 'inbox', 'reminders', 'workItems', 'learningItems', 'workouts', 'fitnessLogs', 'fitnessPlans', 'quotes', 'news'];
const SYNC_MAP_FIELDS = ['journals', 'learningNotes'];
// 标量/整块字段：变了就整块按时间戳比较（settings、account、习惯设置这类小对象）
const SYNC_SCALAR_FIELDS = ['settings', 'account', 'firstUseDate', 'workoutCategories', 'learningCompleteDates', 'quoteMode', 'fixedQuoteId', 'todayQuoteDate', 'todayQuoteId', 'fitnessFeeling', 'fitnessSeptemberCorrectionApplied'];
const SYNC_TOMBSTONE_KEEP_DAYS = 90;
// 注意：lastTrackedSnapshot 必须在「加载状态」之前声明，否则会在 TDZ 里报错。

function cloneJson(value) { return JSON.parse(JSON.stringify(value === undefined ? null : value)); }

// 用于比对的快照：去掉 UI 状态与同步元数据本身，避免自我循环
function trackableSnapshot() {
  const snapshot = dataSnapshot();
  delete snapshot.sync;
  delete snapshot.lastSavedAt;
  return cloneJson(snapshot);
}

function trackChanges() {
  const meta = state.sync;
  if (!meta) return;
  if (!meta.device) meta.device = makeId('device');
  if (!meta.clock || typeof meta.clock !== 'object') meta.clock = {};
  if (!meta.tombstones || typeof meta.tombstones !== 'object') meta.tombstones = {};
  const now = new Date().toISOString();
  const next = trackableSnapshot();
  const prev = lastTrackedSnapshot;

  if (prev) {
    // ① 记录型集合：逐条比对，新增或改动盖时间戳，消失写墓碑
    SYNC_RECORD_COLLECTIONS.forEach(key => {
      const prevMap = new Map((prev[key] || []).map(record => [record.id, record]));
      const nextMap = new Map((next[key] || []).map(record => [record.id, record]));
      nextMap.forEach((record, id) => {
        const before = prevMap.get(id);
        if (!before || JSON.stringify(before) !== JSON.stringify(record)) meta.clock[`${key}:${id}`] = now;
      });
      prevMap.forEach((_, id) => {
        if (!nextMap.has(id)) {
          meta.tombstones[`${key}:${id}`] = now;
          delete meta.clock[`${key}:${id}`];
        }
      });
    });
    // ② 键值映射：journals 按日期、learningNotes 按条目 id
    SYNC_MAP_FIELDS.forEach(key => {
      const before = prev[key] || {};
      const after = next[key] || {};
      new Set([...Object.keys(before), ...Object.keys(after)]).forEach(k => {
        if (JSON.stringify(before[k] ?? null) !== JSON.stringify(after[k] ?? null)) meta.clock[`${key}:${k}`] = now;
      });
    });
    // ③ 标量与整块字段
    SYNC_SCALAR_FIELDS.forEach(key => {
      if (JSON.stringify(prev[key] ?? null) !== JSON.stringify(next[key] ?? null)) meta.clock[key] = now;
    });

    // 墓碑只保留 90 天，避免无限增长
    const cutoff = Date.now() - SYNC_TOMBSTONE_KEEP_DAYS * 86400000;
    Object.keys(meta.tombstones).forEach(key => {
      if (new Date(meta.tombstones[key]).getTime() < cutoff) delete meta.tombstones[key];
    });
  }

  meta.rev = (Number(meta.rev) || 0) + 1;
  meta.updatedAt = now;
  lastTrackedSnapshot = next;
}

function persist(broadcast = true) {
  state.lastSavedAt = new Date().toISOString();
  trackChanges();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dataSnapshot())); } catch (error) { /* 无痕模式下静默降级 */ }
  if (broadcast && channel) channel.postMessage({ type: 'state', state: dataSnapshot() });
  updateSyncStatus();
  scheduleSync();
}

/* ---------- 跨设备同步（Supabase）----------
 * 设计：不用账号登录，用「同步码」。一端生成一串随机码，另一端填同一串码，
 * 两端就读写云端同一行数据；合并规则用 round-18 建好的 clock / tombstones，
 * 逐 key 比时间戳，谁新谁生效，删除墓碑优先，避免两端互相覆盖丢数据。
 *
 * 密钥说明：这里用的是 Supabase 的 publishable key，它本来就是设计成可以公开的
 * （客户端代码里必然会带着它）。真正的门槛是同步码本身：
 * 数据表开了行级安全且没有任何策略，拿着这个公开密钥也读不到整张表，
 * 只能通过带同步码的 luxing_pull / luxing_push 两个函数访问。
 */
const SYNC_BACKEND = {
  url: 'https://hkijeeijvcuaqrzgohhp.supabase.co',
  key: 'sb_publishable_2DTma1LWCn_GXwVVdig6ow_02aSRxcx',
};
let syncInFlight = false;
let syncDebounceTimer = null;
let syncPaused = false;      // 同步自身写盘时置位，避免自己触发自己
let syncState = 'idle';      // idle | syncing | ok | error | offline | off

function syncReady() { return Boolean(state.sync && state.sync.code); }

function makeSyncCode() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function syncRpc(fn, body) {
  const response = await fetch(`${SYNC_BACKEND.url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: SYNC_BACKEND.key,
      Authorization: `Bearer ${SYNC_BACKEND.key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}${detail ? ' · ' + detail.slice(0, 140) : ''}`);
  }
  return response.json();
}

function maxStamp(a, b) {
  if (!a) return b || '';
  if (!b) return a;
  return a > b ? a : b;
}

function splitSyncKey(key) {
  const index = key.indexOf(':');
  return index < 0 ? { field: key, id: null } : { field: key.slice(0, index), id: key.slice(index + 1) };
}

function writeState() {
  state.lastSavedAt = new Date().toISOString();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dataSnapshot())); } catch (error) { /* 忽略 */ }
  updateSyncStatus();
}

// 按 sync key（`集合:id` / `字段:键` / `字段`）读写合并目标
function writeByKey(target, key, value) {
  const { field, id } = splitSyncKey(key);
  if (id === null) { target[field] = cloneJson(value); return; }
  if (SYNC_RECORD_COLLECTIONS.includes(field)) {
    if (!Array.isArray(target[field])) target[field] = [];
    const index = target[field].findIndex(record => record.id === id);
    if (index >= 0) target[field][index] = cloneJson(value);
    else target[field].push(cloneJson(value));
    return;
  }
  if (!target[field] || typeof target[field] !== 'object') target[field] = {};
  target[field][id] = cloneJson(value);
}

function deleteByKey(target, key) {
  const { field, id } = splitSyncKey(key);
  if (id === null) return;
  if (SYNC_RECORD_COLLECTIONS.includes(field)) {
    target[field] = (target[field] || []).filter(record => record.id !== id);
    return;
  }
  if (target[field] && typeof target[field] === 'object') delete target[field][id];
}

// 把远端状态合并进本地。返回「远端胜出的 key 数」，0 表示本地已是最新。
function mergeRemoteState(remoteState) {
  const remote = remoteState && typeof remoteState === 'object' ? remoteState : {};
  const meta = state.sync;
  const localClock = meta.clock || {};
  const localTomb = meta.tombstones || {};
  const remoteClock = (remote.sync && remote.sync.clock) || {};
  const remoteTomb = (remote.sync && remote.sync.tombstones) || {};
  let remoteWins = 0;

  // ① 逐个 key 比时间戳：远端更新就用远端（含「远端删了」的情况）
  const allKeys = new Set([...Object.keys(localClock), ...Object.keys(remoteClock), ...Object.keys(localTomb), ...Object.keys(remoteTomb)]);
  allKeys.forEach(key => {
    const localStamp = maxStamp(localClock[key], localTomb[key]);
    const remoteStamp = maxStamp(remoteClock[key], remoteTomb[key]);
    if (!remoteStamp || remoteStamp <= localStamp) return;
    remoteWins += 1;
    const remoteDeleted = Boolean(remoteTomb[key]) && (!remoteClock[key] || remoteTomb[key] > remoteClock[key]);
    if (remoteDeleted) {
      deleteByKey(state, key);
      localTomb[key] = remoteTomb[key];
      delete localClock[key];
      return;
    }
    const { field, id } = splitSyncKey(key);
    const value = id === null
      ? remote[field]
      : SYNC_RECORD_COLLECTIONS.includes(field)
        ? (remote[field] || []).find(record => record.id === id)
        : (remote[field] || {})[id];
    if (value === undefined) return;
    writeByKey(state, key, value);
    localClock[key] = remoteClock[key] || remoteStamp;
    delete localTomb[key];
  });

  // ② 补齐本地没有的记录（远端有、本地没删过）
  SYNC_RECORD_COLLECTIONS.forEach(collection => {
    const localIds = new Set((state[collection] || []).map(record => record.id));
    (remote[collection] || []).forEach(record => {
      if (localIds.has(record.id)) return;
      const key = `${collection}:${record.id}`;
      if (localTomb[key] && (!remoteClock[key] || localTomb[key] > remoteClock[key])) return;
      if (!Array.isArray(state[collection])) state[collection] = [];
      state[collection].push(cloneJson(record));
      localClock[key] = remoteClock[key] || localClock[key] || new Date().toISOString();
      remoteWins += 1;
    });
  });

  // ③ 补齐键值映射（日记 / 学习笔记）
  SYNC_MAP_FIELDS.forEach(field => {
    const remoteMap = (remote[field] && typeof remote[field] === 'object') ? remote[field] : {};
    if (!state[field] || typeof state[field] !== 'object') state[field] = {};
    Object.keys(remoteMap).forEach(id => {
      const key = `${field}:${id}`;
      if (JSON.stringify(state[field][id] ?? null) === JSON.stringify(remoteMap[id] ?? null)) return;
      if (localTomb[key] && (!remoteClock[key] || localTomb[key] > remoteClock[key])) return;
      if (!remoteClock[key] || remoteClock[key] <= maxStamp(localClock[key], localTomb[key])) return;
      state[field][id] = cloneJson(remoteMap[id]);
      localClock[key] = remoteClock[key];
      remoteWins += 1;
    });
  });

  // ④ 同步元数据取并集，保证下次合并两端判断一致
  Object.keys(remoteClock).forEach(key => { localClock[key] = maxStamp(localClock[key], remoteClock[key]); });
  Object.keys(remoteTomb).forEach(key => { localTomb[key] = maxStamp(localTomb[key], remoteTomb[key]); });

  return remoteWins;
}

function formatSyncTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const time = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  if (date.toDateString() === new Date().toDateString()) return time;
  return `${date.getMonth() + 1}月${date.getDate()}日 ${time}`;
}

function syncStatusLabel() {
  if (!syncReady()) return '未开启';
  if (syncState === 'syncing') return '正在同步…';
  if (syncState === 'offline') return '离线，联网后自动同步';
  if (syncState === 'error') return `同步出错：${(state.sync && state.sync.lastError) || '未知原因'}`;
  const at = state.sync && state.sync.lastSyncedAt;
  if (!at) return '尚未同步';
  return `已同步 · ${formatSyncTime(at)}`;
}

function setSyncState(next) {
  syncState = next;
  document.querySelectorAll('[data-sync-status]').forEach(node => { node.textContent = syncStatusLabel(); });
  document.querySelectorAll('.account-sync-status').forEach(node => { node.dataset.syncMode = next; });
}

function scheduleSync(delay = 2500) {
  if (syncPaused || !syncReady()) return;
  clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => runSync(), delay);
}

async function runSync() {
  if (!syncReady() || syncInFlight) return;
  if (!navigator.onLine) { setSyncState('offline'); return; }
  syncInFlight = true;
  setSyncState('syncing');
  try {
    const rows = await syncRpc('luxing_pull', { p_code: state.sync.code });
    const remoteRow = Array.isArray(rows) ? rows[0] : rows;
    syncPaused = true;
    if (remoteRow && remoteRow.data) {
      const changed = mergeRemoteState(remoteRow.data);
      const remotePlain = cloneJson(remoteRow.data);
      delete remotePlain.sync;
      delete remotePlain.lastSavedAt;
      const needsPush = changed > 0 || JSON.stringify(trackableSnapshot()) !== JSON.stringify(remotePlain);
      if (needsPush) await syncRpc('luxing_push', { p_code: state.sync.code, p_data: dataSnapshot() });
    } else {
      // 云端还没有这个同步码的数据：把本地整份推上去
      await syncRpc('luxing_push', { p_code: state.sync.code, p_data: dataSnapshot() });
    }
    state.sync.lastSyncedAt = new Date().toISOString();
    state.sync.lastError = '';
    lastTrackedSnapshot = trackableSnapshot();
    writeState();
    setSyncState('ok');
    // 合并可能带来了新数据。正在输入时不重绘，避免打断输入。
    const active = document.activeElement;
    const typing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
    if (!typing) render();
  } catch (error) {
    state.sync.lastError = String((error && error.message) || error);
    writeState();
    setSyncState('error');
  } finally {
    syncPaused = false;
    syncInFlight = false;
  }
}

function applyRemoteState(remote) {
  state = { ...state, ...mergeState(remote), page: state.page, learnTab: state.learnTab, planFilter: state.planFilter, planDateFilter: state.planDateFilter };
  // 远端状态已经写进本地，重置比对基线，避免下次 persist 把远端带来的整批数据误判成「本地改动」。
  lastTrackedSnapshot = trackableSnapshot();
  render();
  showToast('已同步最新数据');
}

if (channel) channel.addEventListener('message', event => { if (event.data?.type === 'state') applyRemoteState(event.data.state); });
window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY && event.newValue) {
    try { applyRemoteState(JSON.parse(event.newValue)); } catch (error) { /* ignore malformed external data */ }
  }
});

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

function priorityLabel(priority) { return priority === 'high' ? '高' : priority === 'low' ? '低' : '中'; }
function monthDayGrid(selectedDays = [], attribute = 'data-month-day') {
  const selected = new Set((selectedDays || []).map(Number));
  return `<div class="month-day-grid">${Array.from({ length: 31 }, (_, index) => { const day = index + 1; return `<button type="button" class="month-day ${selected.has(day) ? 'selected' : ''}" ${attribute}="${day}" aria-pressed="${selected.has(day)}">${day}</button>`; }).join('')}</div>`;
}
function fitnessPlanDayGrid(selectedDays = [], attribute = 'data-fitness-day') {
  const selected = new Set((selectedDays || []).map(Number));
  return `<div class="month-day-grid fitness-plan-day-grid">${Array.from({ length: 30 }, (_, index) => { const day = index + 1; return `<button type="button" class="month-day ${selected.has(day) ? 'selected' : ''}" ${attribute}="${day}" aria-pressed="${selected.has(day)}">${day}</button>`; }).join('')}</div>`;
}
function formatDatePickerValue(dates = []) { return dates.filter(Boolean).sort().join(','); }
function datePickerTags(id, dates = []) {
  return dates.map(date => `<span class="date-picker-tag">${formatCalendarDate(date)}<button type="button" aria-label="移除 ${formatCalendarDate(date)}" data-date-picker-remove="${id}" data-date="${date}">×</button></span>`).join('');
}
function datePickerTemplate(id, dates = []) {
  const selected = [...new Set((dates || []).filter(Boolean))].sort();
  return `<div class="date-picker" data-date-picker="${id}"><div class="date-picker-entry"><input id="${id}-input" class="text-input" type="date" aria-label="添加日期"><button type="button" class="button ghost date-picker-add" data-date-picker-add="${id}">添加日期</button></div><input type="hidden" id="${id}-values" value="${escapeHtml(formatDatePickerValue(selected))}"><div class="date-picker-tags">${datePickerTags(id, selected)}</div></div>`;
}
function priorityClass(priority) { return priority || 'medium'; }
function reminderTimes(reminder) {
  const values = Array.isArray(reminder.times) ? reminder.times : [reminder.time];
  return [...new Set(values.filter(value => /^\d{2}:\d{2}$/.test(value || '')).sort())];
}
function reminderTimeLabel(reminder) {
  const times = reminderTimes(reminder);
  return times.length ? times.join('、') : '待定';
}
function reminderIsMonthly(item) { return item?.scheduleMode === 'monthly' && Array.isArray(item.scheduleDays) && item.scheduleDays.length > 0; }
function reminderDoneToday(item) { return reminderIsMonthly(item) ? (item.doneDates || []).includes(isoToday) : Boolean(item.done); }
function previousMonthlyDate(days = []) {
  const candidates = (days || []).map(Number).filter(day => day >= 1 && day < today.getDate()).sort((a, b) => b - a);
  if (!candidates.length) return '';
  const day = candidates[0];
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function nextMonthlyDate(days = []) {
  const candidates = (days || []).map(Number).filter(day => day >= 1 && day <= 31).sort((a, b) => a - b);
  if (!candidates.length) return '';
  const currentDay = today.getDate();
  const currentMonthCandidate = candidates.find(day => day >= currentDay && day <= new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate());
  if (currentMonthCandidate) return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(currentMonthCandidate).padStart(2, '0')}`;
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const maxDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
  const nextDay = candidates.find(day => day <= maxDay) || Math.min(candidates[0], maxDay);
  return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
}
function lifeItemDate(item) { return item.kind === 'reminder' && reminderIsMonthly(item) ? nextMonthlyDate(item.scheduleDays) : item.date; }
function lifeItemFirstTime(item) { return item.kind === 'reminder' ? timeValue(reminderTimes(item)[0] || '') : timeValue(item.time || ''); }
function compareLifeItems(a, b) {
  const dateA = lifeItemDate(a) || '9999-99-99';
  const dateB = lifeItemDate(b) || '9999-99-99';
  return dateA.localeCompare(dateB) || lifeItemFirstTime(a) - lifeItemFirstTime(b) || String(a.title).localeCompare(String(b.title), 'zh-CN');
}
function isLifeItemDueToday(item) { return item.kind === 'reminder' && reminderIsMonthly(item) ? item.scheduleDays.includes(today.getDate()) : item.date === isoToday; }
function isLifeItemOverdue(item) { if (item.kind === 'reminder' && reminderIsMonthly(item)) { const past = previousMonthlyDate(item.scheduleDays); return Boolean(past && !(item.doneDates || []).includes(past)); } return Boolean(lifeItemDate(item) && lifeItemDate(item) < isoToday && !item.done); }
function lifeItemIsDone(item) { return item.kind === 'reminder' ? reminderDoneToday(item) : Boolean(item.done); }
function lifeItemLabel(item) { return item.kind === 'reminder' ? `${reminderTimeLabel(item)}${reminderIsMonthly(item) ? ' · 固定提醒' : ''}` : (item.time || '待定'); }
function lifePriorityDot(priority) { return `<span class="priority-dot ${priorityClass(priority)}" title="${priorityLabel(priority)}优先级" aria-label="${priorityLabel(priority)}优先级"></span>`; }
function isToday(date) { return date === isoToday; }
function isDoneToday(list, id) { return list.some(item => item.id === id && Array.isArray(item.doneDates) && item.doneDates.includes(isoToday)); }
function formatCalendarDate(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : `${parsed.getMonth() + 1}月${parsed.getDate()}日`;
}
function formatFullDate(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : `${parsed.getMonth() + 1}月${parsed.getDate()}日 ${DAY_NAMES[parsed.getDay()]}`;
}
function formatPlanDate(date) {
  if (!date) return '未安排';
  if (date === isoToday) return '今天';
  if (date === dateOffset(1)) return '明天';
  if (date === dateOffset(-1)) return '昨天';
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : `${parsed.getMonth() + 1}月${parsed.getDate()}日`;
}
function formatSavedAt() {
  if (!state.lastSavedAt) return '本地空间';
  const saved = new Date(state.lastSavedAt);
  return `已保存 ${saved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
}
function updateSyncStatus() {
  document.querySelectorAll('.sync-time').forEach(node => { node.textContent = formatSavedAt(); });
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function todayLifePendingCount() {
  const pendingTasks = state.tasks.filter(task => isToday(task.date) && !task.done).length;
  const pendingReminders = state.reminders.filter(reminder => isLifeItemDueToday(reminder) && !reminderDoneToday(reminder)).length;
  return pendingTasks + pendingReminders;
}

function render() {
  const pages = { today: renderToday, plan: renderPlan, work: renderWork, inbox: renderInbox, learn: renderLearn, fitness: renderFitness, journal: renderJournal, settings: renderSettings, account: renderAccount, search: renderSearch };
  (pages[state.page] || renderToday)();
  const titles = { today: '当下', plan: '生活', work: '工作', inbox: '收集', learn: '学习', fitness: '健身', journal: '日记', settings: '设置', account: '账户', search: '搜索' };
  if (breadcrumbTitle) breadcrumbTitle.textContent = titles[state.page] || '当下';
  const floatingAdd = document.querySelector('#floating-add');
  if (floatingAdd) floatingAdd.hidden = state.page !== 'today';
  document.querySelectorAll('[data-page]').forEach(item => item.classList.toggle('active', item.dataset.page === state.page));
  const todayCount = document.querySelector('.today-count');
  const lifeCount = document.querySelector('.life-count');
  const inboxCount = document.querySelector('.inbox-count');
  const workCount = document.querySelector('.work-count');
  const lifePendingCount = todayLifePendingCount();
  const workPendingCount = state.workItems.filter(item => isWorkDueToday(item) && !isWorkDoneOnDate(item)).length;
  const learningPendingCount = learningDueItems().filter(item => !item.doneDates.includes(isoToday)).length;
  const fitnessPendingCount = fitnessDuePlans().filter(plan => !isFitnessPlanDoneToday(plan)).length;
  if (todayCount) todayCount.textContent = lifePendingCount + workPendingCount + learningPendingCount + fitnessPendingCount;
  if (lifeCount) lifeCount.textContent = lifePendingCount;
  if (inboxCount) inboxCount.textContent = state.inbox.filter(item => item.status === 'pending').length;
  if (workCount) workCount.textContent = workPendingCount;
  if (globalSearch && globalSearch.value !== state.globalSearch) globalSearch.value = state.globalSearch;
  syncAccountChrome();
  updateSyncStatus();
}

/* ---------- 账户：本机身份，未来接入后端后用于区分多个用户 ---------- */
function accountNickname() { return (state.account && state.account.nickname) || '林'; }

function accountUsageDays() {
  const start = /^\d{4}-\d{2}-\d{2}$/.test(state.firstUseDate || '') ? new Date(`${state.firstUseDate}T00:00:00`) : new Date();
  const now = new Date(`${isoToday}T00:00:00`);
  const days = Math.round((now.getTime() - start.getTime()) / 86400000);
  return Math.max(1, days + 1);
}

// 侧栏头像和账户页头像共用同一套渲染逻辑，避免两处状态不一致。
function syncAccountChrome() {
  const account = state.account || {};
  const nickname = accountNickname();
  const initial = nickname.slice(0, 1) || '林';
  document.querySelectorAll('[data-avatar-slot]').forEach(slot => {
    if (account.avatar) {
      slot.style.backgroundImage = `url("${account.avatar}")`;
      slot.classList.add('has-image');
      slot.textContent = '';
    } else {
      slot.style.backgroundImage = '';
      slot.classList.remove('has-image');
      slot.textContent = initial;
    }
  });
  document.querySelectorAll('[data-nickname-slot]').forEach(node => { node.textContent = nickname; });
}

function pickAvatar() { document.querySelector('#account-avatar-input')?.click(); }

// 头像统一裁剪成正方形并压缩，避免原图直接进 localStorage 把配额撑爆。
function handleAvatarFile(file) {
  if (!file) return;
  if (!/^image\//.test(file.type || '')) { showToast('请选择图片文件'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const size = 240;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      const scale = Math.max(size / image.width, size / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
      try {
        state.account.avatar = canvas.toDataURL('image/jpeg', 0.86);
      } catch (error) {
        showToast('图片处理失败，请换一张试试');
        return;
      }
      persist();
      render();
      showToast('头像已更新');
    };
    image.onerror = () => showToast('图片读取失败，请换一张试试');
    image.src = reader.result;
  };
  reader.onerror = () => showToast('图片读取失败，请换一张试试');
  reader.readAsDataURL(file);
}

function syncCardTemplate() {
  if (!syncReady()) {
    return `
      <p>在手机和电脑上填同一串「同步码」，两端的数据就会自动合并同步。同步码只存在你自己的设备里。</p>
      <div class="settings-actions">
        <button class="button primary full-button" data-action="sync-generate">生成同步码（用这台设备）</button>
      </div>
      <label class="account-field account-sync-join"><span>或者：填入另一台设备的同步码</span><input id="sync-code-input" class="text-input" type="text" autocomplete="off" spellcheck="false" placeholder="粘贴另一台设备生成的同步码" /></label>
      <div class="settings-actions">
        <button class="button ghost full-button" data-action="sync-join">使用这个同步码</button>
      </div>
      <div class="account-note">云端保存的是加密传输的数据副本，只有拿着这串同步码的设备才能读写它。</div>`;
  }
  return `
    <div class="account-sync-status" data-sync-mode="${syncState}"><span class="status-dot"></span><span data-sync-status>${escapeHtml(syncStatusLabel())}</span></div>
    <label class="account-field"><span>同步码（两台设备填一样的）</span>
      <div class="account-sync-code">
        <input id="sync-code-value" class="text-input" type="text" readonly value="${escapeHtml(state.sync.code)}" />
        <button type="button" class="button ghost" data-action="sync-copy">复制</button>
      </div>
    </label>
    <div class="settings-actions">
      <button class="button primary full-button" data-action="sync-now">立即同步</button>
    </div>
    <div class="account-danger-zone">
      <button class="button ghost full-button danger-outline" data-action="sync-disable">关闭同步</button>
    </div>
    <div class="account-note">关闭同步只是停止同步，不会删除本机或云端已经有的数据。</div>`;
}

function renderAccount() {
  const account = state.account || {};
  const nickname = accountNickname();
  const phone = account.phone || '';
  pageContainer.innerHTML = `
    <div class="page-heading">
      <div><div class="eyebrow">ACCOUNT</div><h1>账户</h1><p>这是你在这台设备上的身份，之后会用来区分不同使用者。</p></div>
    </div>
    <div class="account-layout">
      <section class="card account-identity-card">
        <div class="account-identity-top">
          <button type="button" class="account-avatar-button" data-action="pick-avatar" aria-label="更换头像">
            <span class="avatar" data-avatar-slot>${escapeHtml(nickname.slice(0, 1) || '林')}</span>
            <span class="account-avatar-badge">＋</span>
          </button>
          <div class="account-identity-meta">
            <strong>${escapeHtml(nickname)}</strong>
            <span>${phone ? escapeHtml(phone) : '还没有填写手机号'}</span>
            <div class="account-avatar-hint">点头像可以上传图片，会自动裁成圆形并压缩后保存在本机。</div>
          </div>
        </div>
        <div class="account-fields">
          <label class="account-field"><span>昵称</span><input id="account-nickname" class="text-input" type="text" maxlength="12" autocomplete="nickname" value="${escapeHtml(nickname)}" placeholder="你希望被怎么称呼" /></label>
          <label class="account-field"><span>手机号</span><input id="account-phone" class="text-input" type="tel" inputmode="numeric" maxlength="11" autocomplete="tel" value="${escapeHtml(phone)}" placeholder="用于以后的登录和跨设备同步" /></label>
        </div>
        <input id="account-avatar-input" type="file" accept="image/*" hidden />
      </section>
      <aside class="account-side">
        <section class="card account-usage-card">
          <div class="card-title">使用天数</div>
          <div class="account-usage-value"><strong>${accountUsageDays()}</strong><span>天</span></div>
          <div class="card-subtitle">从 ${escapeHtml(formatCalendarDate(state.firstUseDate))} 开始记录</div>
        </section>
        <section class="card side-card account-side-card">
          <h3>跨设备同步</h3>
          ${syncCardTemplate()}
        </section>
        <section class="card side-card account-side-card">
          <h3>数据与账户</h3>
          <p>数据也可以手动导出成 JSON 文件备份或搬到别的设备。</p>
          <div class="settings-actions">
            <button class="button primary full-button" data-action="export">导出我的数据</button>
            <button class="button ghost full-button" data-action="import">导入数据</button>
          </div>
          <div class="account-danger-zone">
            <button class="button ghost full-button danger-outline" data-action="sign-out">退出登录</button>
          </div>
          <div class="account-note">当前还没有接入账号后端，所以「退出登录」暂时只做二次确认，不会清除本机数据。</div>
        </section>
      </aside>
    </div>
    <input id="import-file" type="file" accept="application/json" hidden />`;
}

function renderToday() {
  const todayTasks = state.tasks.filter(task => isToday(task.date));
  const completedTasks = todayTasks.filter(task => task.done);
  const pendingTasks = todayTasks.filter(task => !task.done);
  const mustTasks = pendingTasks.filter(task => task.priority === 'high');
  const pendingInbox = state.inbox.filter(item => item.status === 'pending');
  const dueLearningItems = learningDueItems();
  const learningDone = dueLearningItems.filter(item => item.doneDates.includes(isoToday)).length;
  const learningTotalMinutes = dueLearningItems.reduce((sum, item) => sum + Number(item.minutes || 0), 0);
  const learningDoneMinutes = dueLearningItems.filter(item => item.doneDates.includes(isoToday)).reduce((sum, item) => sum + Number(item.minutes || 0), 0);
  const dueFitnessPlans = fitnessDuePlans();
  const fitnessDone = fitnessDoneToday();
  const quote = getTodayQuote();
  // 今日名言只在首次确定时写入状态；渲染本身不再定时切换，避免闪烁。
  if (quote.changed) window.setTimeout(() => persist(false), 0);
  const todayEventCount = todayTasks.length + state.reminders.filter(isLifeItemDueToday).length + state.workItems.filter(isWorkDueToday).length + dueFitnessPlans.length;
  pageContainer.innerHTML = `
    <div class="page-heading today-heading">
      <div><div class="eyebrow">PERSONAL OS</div><h1>${greeting()}，${escapeHtml(accountNickname())}。</h1><p>${dateLabel}</p></div>
      <button type="button" class="button ghost mobile-journal-button" data-action="journal">日记</button>
    </div>
    <section class="quote-banner"><div class="quote-mark">“</div><div class="quote-copy"><span class="quote-label">今日名言 · ${escapeHtml(quote.category)}</span><blockquote>${escapeHtml(quote.text)}</blockquote><cite>—— ${escapeHtml(quote.author)}</cite></div><button class="quote-add-button" data-action="quote-library">添加</button></section>
    <div class="today-dashboard-layout">
      <section class="card timeline-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">今日时间线</span><span class="card-subtitle">${todayEventCount} 个安排</span></div><div class="timeline-actions"><button class="card-link timeline-reminder-button" data-action="cycle-timeline-reminder">${timelineReminderLabel()}</button><button class="card-link" data-action="plan">查看生活</button></div></div><div class="timeline">${timelineTemplate()}</div></section>
      <aside class="today-side-stack">
        <article class="card today-summary-card coral-card"><div class="today-summary-main"><div class="card-title">待办事项</div><div class="summary-value">${pendingTasks.length}</div><div class="card-subtitle">${mustTasks.length ? `${mustTasks.length} 项需要优先完成` : '今天没有高优先级任务'}</div></div><div class="today-summary-preview"><div class="sub-card-header"><span>今日必须完成</span><span class="sub-card-count coral-count">${mustTasks.length}</span></div>${mustTasks.slice(0, 3).map(task => compactTask(task, false, true)).join('') || compactEmpty('暂时没有必须完成的事')}<div class="sub-section-label secondary">其他待办</div>${pendingTasks.filter(task => task.priority !== 'high').slice(0, 3).map(task => compactTask(task)).join('') || compactEmpty('暂无其他待办')}</div></article>
        <article class="card today-summary-card amber-card"><div class="today-summary-main"><div class="card-title">收集箱</div><div class="summary-value">${pendingInbox.length}</div><div class="card-subtitle">等待稍后整理</div><button type="button" class="card-link mobile-inbox-link" data-action="inbox">查看</button></div><div class="today-summary-preview"><div class="sub-card-header"><span>待整理内容</span><span class="sub-card-count amber-count">${pendingInbox.length}</span></div>${pendingInbox.slice(0, 3).map(inboxPreviewTemplate).join('') || compactEmpty('收集箱很清爽')}</div></article>
        <section class="card equal-activity-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">今日学习</span><span class="section-badge">${learningDone}/${dueLearningItems.length}</span></div><button class="card-link" data-action="learn">查看</button></div><div class="activity-body"><span class="activity-pill violet">▤ ${learningTotalMinutes} 分钟目标</span><div class="activity-name">${dueLearningItems[0]?.title || '今天没有安排学习'}</div><div class="activity-desc">${learningDoneMinutes} / ${learningTotalMinutes} 分钟已完成</div><div class="activity-footer"><span class="activity-stat"><strong>${learningDoneMinutes}</strong> / ${learningTotalMinutes} 分钟</span><button class="button primary" data-action="start-learning">${learningDone === dueLearningItems.length && dueLearningItems.length ? '已完成' : '开始'}</button></div></div></section>
        <section class="card equal-activity-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">今日健身</span><span class="section-badge">${fitnessDone ? '已完成' : '待打卡'}</span></div><button class="card-link" data-action="fitness">查看</button></div><div class="activity-body"><span class="activity-pill green">⌁ ${dueFitnessPlans.length ? `${dueFitnessPlans.length} 个计划` : '今日无计划'}</span><div class="activity-name">${dueFitnessPlans[0]?.title || '添加今天的训练内容'}</div><div class="activity-desc">${dueFitnessPlans.map(plan => plan.title).join(' · ') || '添加今天的训练内容'}</div><div class="activity-footer"><span class="activity-stat"><strong>${fitnessDone ? '已' : '待'}</strong> 打卡</span><button class="button primary" data-action="check-fitness">${fitnessDone ? '已完成' : '打卡'}</button></div></div></section>
        <section class="card equal-activity-card news-preview-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">今日新闻</span><span class="section-badge">${state.news.length}</span></div><button class="card-link" data-action="learn">查看</button></div><div class="news-preview-list">${newsPreviewTemplate()}</div></section>
      </aside>
      <div class="today-bottom-actions">
        <button type="button" class="today-bottom-action" data-action="account"><span class="today-bottom-icon">☺</span>账户</button>
        <button type="button" class="today-bottom-action" data-action="settings"><span class="today-bottom-icon">⚙</span>设置</button>
      </div>
    </div>`;
}
function stableQuoteIndex(date, length) {
  if (!length) return 0;
  // 用日期生成稳定索引。每日随机仍然会每天变化，但同一天、不同标签页/设备的结果一致，
  // 不再依赖 Math.random()，避免多个页面同时打开时互相覆盖造成名言频闪。
  const seed = String(date).split('').reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  return seed % length;
}

function getTodayQuote() {
  const quotes = Array.isArray(state.quotes) && state.quotes.length ? state.quotes : defaultState().quotes;
  if (!Array.isArray(state.quotes) || !state.quotes.length) state.quotes = quotes;
  const validFixedId = state.fixedQuoteId && quotes.some(quote => quote.id === state.fixedQuoteId) ? state.fixedQuoteId : quotes[0].id;
  const stableRandomId = quotes[stableQuoteIndex(isoToday, quotes.length)].id;
  const id = state.quoteMode === 'fixed' ? validFixedId : stableRandomId;
  let changed = false;

  if (state.quoteMode === 'fixed' && state.fixedQuoteId !== validFixedId) {
    state.fixedQuoteId = validFixedId;
    changed = true;
  }
  if (state.todayQuoteDate !== isoToday || state.todayQuoteId !== id) {
    state.todayQuoteDate = isoToday;
    state.todayQuoteId = id;
    changed = true;
  }

  const quote = quotes.find(item => item.id === id) || quotes[0];
  return { ...quote, changed };
}
function renderQuoteLibrary() {
  if (!quoteModal) return;
  const mode = quoteModal.querySelector('[data-quote-mode][value="' + state.quoteMode + '"]');
  quoteModal.querySelectorAll('[data-quote-mode]').forEach(input => { input.checked = input.value === state.quoteMode; });
  const select = quoteModal.querySelector('[data-fixed-quote]');
  if (select) { select.innerHTML = state.quotes.map(quote => `<option value="${escapeHtml(quote.id)}" ${quote.id === state.fixedQuoteId ? 'selected' : ''}>${escapeHtml(quote.author)} · ${escapeHtml(quote.text)}</option>`).join(''); select.disabled = state.quoteMode !== 'fixed'; }
  const list = quoteModal.querySelector('#quote-library-list');
  if (list) list.innerHTML = ['中外名人', '电影语录'].map(category => { const quotes = state.quotes.filter(quote => quote.category === category); return quotes.length ? `<section class="quote-category"><div class="quote-category-title"><strong>${category}</strong><span>${quotes.length}</span></div>${quotes.map(quote => `<div class="quote-library-item"><div><strong>${escapeHtml(quote.text)}</strong><p>—— ${escapeHtml(quote.author)}</p></div><span class="quote-item-tag">${escapeHtml(quote.category)}</span><button class="row-action danger-text" data-delete-quote="${escapeHtml(quote.id)}">删除</button></div>`).join('')}</section>` : ''; }).join('') || compactEmpty('还没有语录，先添加一条吧。');
}
function openQuoteLibrary() { renderQuoteLibrary(); quoteModal?.classList.add('open'); quoteModal?.setAttribute('aria-hidden', 'false'); setTimeout(() => quoteText?.focus(), 80); }
function closeQuoteLibrary() { quoteModal?.classList.remove('open'); quoteModal?.setAttribute('aria-hidden', 'true'); }
function timelineReminderLabel() { return state.timelineReminderMinutes ? `提前 ${state.timelineReminderMinutes} 分钟提醒` : '不提醒'; }
function cycleTimelineReminder() { const options = [0, 5, 15, 30]; const index = options.indexOf(Number(state.timelineReminderMinutes)); state.timelineReminderMinutes = options[(index + 1) % options.length]; persist(); showToast(state.timelineReminderMinutes ? `时间线将提前 ${state.timelineReminderMinutes} 分钟提醒` : '已关闭时间线提醒'); render(); }

function greeting() {

  const hour = today.getHours();
  return hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
}

function compactTask(task, done = false, must = false) {
  return `<div class="compact-record ${done ? 'record-done' : ''}"><span class="compact-todo ${must ? 'must' : ''}">${done ? '✓' : must ? '!' : '○'}</span><span>${escapeHtml(task.title)}</span></div>`;
}
function compactEmpty(text) { return `<div class="compact-empty">${escapeHtml(text)}</div>`; }
function inboxPreviewTemplate(item) { return `<div class="compact-record"><span class="compact-inbox">⌁</span><span>${escapeHtml(item.text)}</span></div>`; }

function timelineTemplate() {
  const events = [];
  state.tasks.filter(task => isToday(task.date)).forEach(task => events.push({ id: task.id, time: task.time || '待定', title: task.title, detail: `${task.meta || '计划任务'} · ${task.done ? '已完成' : '待完成'}`, tag: '计划', color: task.done ? 'green' : '', done: task.done, duration: Number(task.duration || 30), type: 'task' }));
  state.reminders.filter(isLifeItemDueToday).forEach(reminder => { const times = reminderTimes(reminder); const done = reminderDoneToday(reminder); (times.length ? times : ['待定']).forEach((time, index) => events.push({ id: `${reminder.id}-${index}`, time, title: reminder.title, detail: `${reminder.repeat || '单日提醒'} · ${done ? '已完成' : '待处理'}`, tag: '提醒', color: 'coral', done, duration: 30, reminderId: reminder.id, type: 'reminder' })); });
  state.workItems.filter(isWorkDueToday).forEach(item => { const done = isWorkDoneOnDate(item); events.push({ id: item.id, time: item.time || '待定', title: item.title, detail: `${workTypeLabel(item)} · ${done ? '已完成' : '待处理'}`, tag: '工作', color: 'amber', done, duration: 30, workId: item.id, type: 'work' }); });
  fitnessDuePlans().forEach(plan => { const done = isFitnessPlanDoneToday(plan); events.push({ id: plan.id, time: plan.time || '16:00', title: plan.title, detail: `训练计划 · ${done ? '已完成' : '待打卡'}`, tag: '健身', color: 'green', done, duration: 60, fitnessId: plan.id, type: 'fitness' }); });
  if (!events.length) return compactEmpty('今天还没有安排。');
  const sorted = events.sort((a, b) => timeValue(a.time) - timeValue(b.time));
  return sorted.map(item => { const status = getTimelineStatus(item); const statusLabel = timelineStatusLabel(status); return `<div class="timeline-item is-${status}"><div class="timeline-time">${escapeHtml(item.time)}</div><div class="timeline-dot ${item.color || ''}"></div><div class="timeline-content"><div class="timeline-title-row"><strong>${escapeHtml(item.title)}</strong><small class="timeline-status">${statusLabel}</small></div><span>${escapeHtml(item.detail)}</span>${item.tag ? `<small class="timeline-tag">${item.tag}</small>` : ''}${item.reminderId && !item.done ? `<button class="row-action timeline-action" data-reminder-toggle="${item.reminderId}">完成提醒</button>` : ''}${item.workId && !item.done ? `<button class="row-action timeline-action" data-work-toggle="${item.workId}">完成工作</button>` : ''}${item.fitnessId && !item.done ? `<button class="row-action timeline-action" data-fitness-plan-toggle="${item.fitnessId}">完成训练</button>` : ''}</div></div>`; }).join('');
}
function getTimelineStatus(item) {
  if (item.done) return 'done';
  if (!/^\d{2}:\d{2}$/.test(item.time || '')) return 'pending';
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const start = timeValue(item.time);
  const diff = start - current;
  if (diff > Number(state.timelineReminderMinutes || 0)) return 'pending';
  if (diff >= 0) return 'upcoming';
  if (diff >= -Number(item.duration || 30)) return 'active';
  return 'overdue';
}
function timelineStatusLabel(status) { return ({ pending: '待开始', upcoming: '即将开始', active: '进行中', done: '已完成', overdue: '已过期' })[status] || '待开始'; }
function timeValue(time) { if (!/^\d{2}:\d{2}$/.test(time || '')) return 9999; return Number(time.replace(':', '')); }
function newsPreviewTemplate() { return state.news.slice(0, 3).map((item, index) => `<div class="news-preview-item"><span class="news-preview-index">0${index + 1}</span><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.source)} · ${escapeHtml(item.age)}</small></div></div>`).join('') || compactEmpty('暂无新闻'); }

function renderPlan() {
  const lifeTasks = state.tasks.map(task => ({ ...task, kind: 'task' }));
  const lifeReminders = state.reminders.map(reminder => ({ ...reminder, kind: 'reminder' }));
  const allLifeItems = [...lifeTasks, ...lifeReminders];
  const activeItems = allLifeItems.filter(item => !lifeItemIsDone(item) && !isLifeItemOverdue(item)).sort(compareLifeItems);
  const overdueItems = allLifeItems.filter(isLifeItemOverdue).sort(compareLifeItems);
  const completedToday = allLifeItems.filter(item => lifeItemIsDone(item) && (isLifeItemDueToday(item) || item.completedAt === isoToday)).sort(compareLifeItems);
  const completedHistory = allLifeItems.filter(item => lifeItemIsDone(item) && !completedToday.includes(item)).sort((a, b) => String(b.completedAt || lifeItemDate(b) || '').localeCompare(String(a.completedAt || lifeItemDate(a) || '')));
  const lifeMain = `<section class="card list-card life-list-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">生活事项</span><span class="section-badge">${activeItems.length}</span></div><span class="card-subtitle">按待完成时间排列</span></div>${activeItems.length ? activeItems.map(lifeItemTemplate).join('') : compactEmpty('今天没有待完成的生活事项')}</section><section class="card list-card life-overdue-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">逾期未完成</span><span class="section-badge coral-badge">${overdueItems.length}</span></div><span class="card-subtitle">需要重新安排的事项</span></div>${overdueItems.length ? overdueItems.map(item => lifeItemTemplate(item, true)).join('') : compactEmpty('暂无逾期事项')}</section>`;
  pageContainer.innerHTML = `<div class="page-heading life-page-heading"><div><div class="eyebrow">MAKE ROOM FOR LIFE</div><h1>生活</h1></div></div><div class="life-layout"><div class="life-main-column">${lifeMain}</div><aside class="life-side-column"><section class="card life-add-card"><button class="life-add-copy" data-action="open-life-reminder" aria-label="增加生活提醒"><span class="life-add-icon">＋</span><strong>增加提醒</strong></button></section><section class="card life-completed-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">已完成</span><span class="section-badge green-badge">${completedToday.length}</span></div><span class="card-subtitle">今日已完成</span></div>${completedToday.length ? completedToday.map(item => lifeCompletedTemplate(item, true)).join('') : compactEmpty('今天还没有完成事项')}</section><section class="card life-history-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">历史完成</span><span class="section-badge">${completedHistory.length}</span></div><span class="card-subtitle">过往完成记录</span></div>${completedHistory.length ? completedHistory.map(item => lifeCompletedTemplate(item, true)).join('') : compactEmpty('完成后的生活事项会保留在这里')}</section></aside></div>`;
}

function lifeItemTemplate(item, overdue = false) {
  const isReminder = item.kind === 'reminder';
  const dateText = lifeItemDate(item) ? formatCalendarDate(lifeItemDate(item)) : '未安排';
  const timeText = lifeItemLabel(item);
  const edit = isReminder ? `<button class="row-action" data-edit-reminder="${item.id}">编辑</button>` : `<button class="row-action" data-edit-task="${item.id}">编辑</button>`;
  const snooze = isReminder ? `<button class="row-action" data-reminder-snooze="${item.id}">明天</button>` : `<button class="row-action" data-task-snooze="${item.id}">明天</button>`;
  const toggle = isReminder ? `<button class="row-action primary" data-reminder-toggle="${item.id}">${lifeItemIsDone(item) ? '撤销' : '完成'}</button>` : `<button class="row-action primary" data-task-toggle="${item.id}">${item.done ? '撤销' : '完成'}</button>`;
  const remove = isReminder ? `<button class="row-action danger-text" data-delete-reminder="${item.id}">删除</button>` : `<button class="row-action danger-text" data-delete-task="${item.id}">删除</button>`;
  return `<div class="list-row life-item ${overdue ? 'is-overdue' : ''}"><button class="task-check ${lifeItemIsDone(item) ? 'done' : ''}" ${isReminder ? `data-reminder-toggle="${item.id}"` : `data-task-toggle="${item.id}"`} aria-label="${lifeItemIsDone(item) ? '撤销完成' : '标记完成'}">${lifeItemIsDone(item) ? '✓' : ''}</button>${lifePriorityDot(item.priority)}<div class="list-row-copy life-item-copy"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.meta || (isReminder ? '生活提醒' : '生活事项'))}</p></div><div class="life-item-datetime"><span>${escapeHtml(dateText)}</span><span>${escapeHtml(timeText)}</span></div><div class="row-actions">${edit}${snooze}${toggle}${remove}</div></div>`;
}
function lifeCompletedTemplate(item, allowDelete = false) { return `<div class="life-completed-item"><span class="completed-check">✓</span>${lifePriorityDot(item.priority)}<div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(lifeItemDate(item) ? formatCalendarDate(lifeItemDate(item)) : '未安排')} · ${escapeHtml(lifeItemLabel(item))}</small></div>${allowDelete ? `<button class="row-action danger-text life-history-delete" data-delete-life-history="${item.kind}:${item.id}" aria-label="删除完成记录">删除</button>` : ''}</div>`; }

function workScheduleLabel(item) {
  if (item.schedule === 'monthly') return `每月 ${workScheduleDays(item).join('、')} 日${item.time ? ` · ${item.time}` : ''}`;
  return `${formatCalendarDate(item.date)}${item.time ? ` · ${item.time}` : ''}`;
}
function normalizeMonthDay(value) {
  const day = Number(value);
  return Number.isInteger(day) && day >= 1 && day <= 31 ? day : null;
}
function workScheduleDays(item) {
  const explicitDays = Array.isArray(item.scheduleDays) ? item.scheduleDays.map(normalizeMonthDay).filter(Boolean) : [];
  const fallbackDay = normalizeMonthDay(item.dayOfMonth);
  return [...new Set(explicitDays.length ? explicitDays : (fallbackDay ? [fallbackDay] : []))].sort((a, b) => a - b);
}

function isWorkDueOnDate(item, date) {
  if (item.schedule === 'monthly') return workScheduleDays(item).includes(Number(String(date).slice(-2)));
  return item.date === date;
}

function isWorkDueToday(item) { return isWorkDueOnDate(item, isoToday); }
function isWorkDoneOnDate(item, date = isoToday) {
  return item.schedule === 'monthly' ? (Array.isArray(item.doneDates) && item.doneDates.includes(date)) : Boolean(item.done);
}

function workTypeLabel(item) { return item.schedule === 'monthly' || item.type === 'reminder' ? '工作计划' : '工作安排'; }
function workPastOccurrence(item) {
  if (item.schedule !== 'monthly') return item.date && item.date < isoToday ? item.date : '';
  const days = workScheduleDays(item).filter(day => day < today.getDate());
  if (!days.length) return '';
  const day = Math.max(...days);
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function isWorkOverdue(item) { const date = workPastOccurrence(item); return Boolean(date && !isWorkDoneOnDate(item, date)); }
function workCompletedRecords() {
  return state.workItems.flatMap(item => {
    if (item.schedule === 'monthly') return (item.doneDates || []).map(date => ({ item, date })).filter(record => record.date <= isoToday);
    return item.done ? [{ item, date: item.date || isoToday }] : [];
  }).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}
function workHistoryTemplate(record, overdue = false) {
  const actions = overdue ? `<div class="row-actions work-history-actions"><button class="row-action" data-edit-work="${escapeHtml(record.item.id)}">编辑</button><button class="row-action primary" data-work-history-toggle="${escapeHtml(record.item.id)}" data-work-history-date="${escapeHtml(record.date || '')}">完成</button><button class="row-action danger-text" data-delete-work="${escapeHtml(record.item.id)}">删除</button></div>` : '';
  return `<div class="work-history-row ${overdue ? 'is-overdue' : ''}"><span class="priority-dot ${priorityClass(record.item.priority)}" title="${priorityLabel(record.item.priority)}优先级"></span><div class="list-row-copy"><strong>${escapeHtml(record.item.title)}</strong><small>${escapeHtml(record.date ? formatCalendarDate(record.date) : '未设置日期')} · ${escapeHtml(workTypeLabel(record.item))}</small></div><span class="activity-pill ${overdue ? 'coral' : 'green'}">${overdue ? '逾期' : '已完成'}</span>${actions}</div>`;
}
function workItemTemplate(item) {
  const done = isWorkDoneOnDate(item);
  const isPlan = item.schedule === 'monthly';
  const dateText = isPlan ? (workScheduleDays(item).length ? `每月 ${workScheduleDays(item).join('、')} 日` : '未设置日期') : (item.date ? formatCalendarDate(item.date) : '未设置日期');
  const check = isPlan ? '' : `<button class="task-check ${done ? 'done' : ''}" data-work-toggle="${item.id}" aria-label="${done ? '撤销完成' : '标记完成'}">${done ? '✓' : ''}</button>`;
  const actionButtons = `<button class="row-action" data-edit-work="${item.id}">编辑</button><button class="row-action primary" data-work-toggle="${item.id}">${done ? '撤销' : '完成'}</button><button class="row-action danger-text" data-delete-work="${item.id}">删除</button>`;
  return `<div class="list-row work-row ${isPlan ? 'work-plan-row' : 'work-arrangement-row'} ${done ? 'is-done' : ''}">${check}<span class="priority-dot ${priorityClass(item.priority)}" title="${priorityLabel(item.priority)}优先级" aria-label="${priorityLabel(item.priority)}优先级"></span><div class="list-row-copy"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail || workTypeLabel(item))}</p></div><div class="work-date">${escapeHtml(dateText)}</div><div class="work-time">${escapeHtml(item.time || '未设置')}</div><div class="row-actions">${actionButtons}</div></div>`;
}
function renderWork() {
  const arrangements = state.workItems.filter(item => item.schedule !== 'monthly' || isWorkDueToday(item));
  const plans = state.workItems.filter(item => item.schedule === 'monthly');
  const dueToday = state.workItems.filter(isWorkDueToday);
  const pendingToday = dueToday.filter(item => !isWorkDoneOnDate(item));
  const overdue = state.workItems.filter(isWorkOverdue).map(item => ({ item, date: workPastOccurrence(item) })).sort((a, b) => b.date.localeCompare(a.date));
  const completed = workCompletedRecords();
  const draftDays = state.workDaysDraft;
  const arrangementSection = arrangements.length ? arrangements.map(workItemTemplate).join('') : compactEmpty('还没有工作安排');
  const planSection = plans.length ? plans.map(workItemTemplate).join('') : compactEmpty('还没有固定工作计划');
  const overdueSection = overdue.length ? overdue.map(record => workHistoryTemplate(record, true)).join('') : compactEmpty('暂无逾期未完成工作');
  const completedSection = completed.length ? completed.map(record => workHistoryTemplate(record)).join('') : compactEmpty('完成后的工作会保留在这里');
  pageContainer.innerHTML = `<div class="page-heading"><div><div class="eyebrow">WORK SYSTEM</div><h1>工作</h1></div></div><div class="work-layout"><div class="work-lists"><section class="card list-card work-board-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">工作安排</span><span class="section-badge">${arrangements.length}</span></div><span class="card-subtitle">今日待完成 ${pendingToday.length} 项</span></div><div class="work-board-section">${arrangementSection}</div></section><section class="card list-card work-board-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">工作计划</span><span class="section-badge violet-badge">${plans.length}</span></div><span class="card-subtitle">固定工作安排</span></div><div class="work-board-section">${planSection}</div></section><section class="card list-card work-secondary-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">逾期未完成工作</span><span class="section-badge coral-badge">${overdue.length}</span></div></div><div class="work-history-list">${overdueSection}</div></section><section class="card list-card work-secondary-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">已完成工作</span><span class="section-badge green-badge">${completed.length}</span></div></div><div class="work-history-list work-completed-list">${completedSection}</div></section></div><aside class="card work-form-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title" id="work-form-heading">新增+</span></div></div><form id="work-form"><input type="hidden" id="work-edit-id" value=""><input type="hidden" id="work-kind" value="arrangement"><label class="field-label" for="work-title">工作项目内容</label><input id="work-title" class="text-input" required placeholder="输入工作内容"><label class="field-label">工作类型</label><div class="segmented-choice work-kind-choice" role="radiogroup" aria-label="工作类型"><button type="button" class="segmented-choice-item active" data-work-kind="arrangement">工作安排</button><button type="button" class="segmented-choice-item" data-work-kind="plan">工作计划</button></div><div class="work-form-grid"><label class="mini-field" id="work-date-field"><span>安排日期</span><input id="work-date" type="date" value="${isoToday}"></label><label class="mini-field" id="work-day-field" hidden><span>每月日期（可多选）</span>${monthDayGrid(draftDays, 'data-work-day')}</label><label class="mini-field"><span>时间</span><input id="work-time" type="time" value="09:00"></label><label class="mini-field"><span>优先级</span><div class="priority-choice-group" role="radiogroup" aria-label="优先级"><label class="priority-choice priority-low"><input type="radio" name="work-priority" value="low"><span>低</span></label><label class="priority-choice priority-medium"><input type="radio" name="work-priority" value="medium" checked><span>中</span></label><label class="priority-choice priority-high"><input type="radio" name="work-priority" value="high"><span>高</span></label></div></label></div><label class="field-label" for="work-detail">补充说明（可选）</label><input id="work-detail" class="text-input" placeholder="补充说明"><div class="work-form-actions"><button type="button" class="button ghost" id="work-cancel-edit" hidden>取消编辑</button><button type="submit" class="button primary full-button">保存</button></div></form></aside></div>`;
  syncWorkFormFields();
}
function reminderTemplate(reminder) { return `<div class="reminder-item ${reminder.done ? 'done' : ''}"><div><strong>${escapeHtml(reminder.title)}</strong><span>${escapeHtml(reminderTimeLabel(reminder))} · ${formatPlanDate(reminder.date)}</span></div><button class="row-action ${reminder.done ? '' : 'primary'}" data-reminder-toggle="${reminder.id}">${reminder.done ? '撤销' : '完成'}</button></div>`; }

function renderInbox() {
  const pending = state.inbox.filter(item => item.status === 'pending');
  const visibleItems = pending.filter(item => !state.inboxSearch || `${item.text} ${item.tag}`.toLowerCase().includes(state.inboxSearch.toLowerCase()));
  const selectedCount = state.selectedInboxIds.length;
  pageContainer.innerHTML = `<div class="page-heading"><div><div class="eyebrow">CAPTURE FIRST</div><h1>收集</h1></div></div><div class="inbox-layout"><section class="card list-card inbox-list-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">待整理内容</span><span class="section-badge">${pending.length}</span></div><div class="inbox-header-actions">${state.inboxSelecting ? `<span class="selection-count">已选择 ${selectedCount} 条</span><button class="button ghost" data-action="cancel-select">取消</button>` : `<button class="button ghost" data-action="select-inbox">批量选择</button>`}</div></div><div class="inbox-search-wrap"><span class="search-symbol">⌕</span><input id="inbox-search" class="text-input" value="${escapeHtml(state.inboxSearch)}" placeholder="搜索收集内容……" autocomplete="off" /></div>${state.inboxSelecting && selectedCount ? `<div class="batch-toolbar"><span>已选择 ${selectedCount} 条</span><button class="row-action danger-text" data-batch-action="delete">批量删除</button></div>` : ''}${visibleItems.length ? visibleItems.map(item => inboxRowTemplate(item)).join('') : compactEmpty(state.inboxSearch ? '没有找到匹配内容' : '收集是空的')}</section><section class="card inbox-add-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">${state.inboxEditingId ? '编辑想法' : '新增想法'}</span></div></div><form id="inbox-add-form"><input type="hidden" id="inbox-edit-id" value="${escapeHtml(state.inboxEditingId || '')}"><label class="field-label" for="inbox-add-text">想法内容</label><textarea id="inbox-add-text" class="text-input plan-textarea" required placeholder="把刚刚想到的事先记下来……"></textarea><label class="field-label">优先级</label><div class="priority-choice-group" role="radiogroup" aria-label="优先级"><label class="priority-choice priority-low"><input type="radio" name="inbox-priority" value="low"><span>低</span></label><label class="priority-choice priority-medium"><input type="radio" name="inbox-priority" value="medium" checked><span>中</span></label><label class="priority-choice priority-high"><input type="radio" name="inbox-priority" value="high"><span>高</span></label></div><div class="inbox-form-actions"><button type="button" class="button ghost" data-cancel-inbox-edit ${state.inboxEditingId ? '' : 'hidden'}>取消编辑</button><button type="submit" class="button primary full-button">${state.inboxEditingId ? '保存修改' : '保存想法'}</button></div></form></section></div>`;
  if (state.inboxEditingId) { const item = state.inbox.find(entry => entry.id === state.inboxEditingId); const text = document.querySelector('#inbox-add-text'); if (item && text) text.value = item.text; document.querySelector(`input[name="inbox-priority"][value="${item?.priority || 'medium'}"]`)?.click(); }
}
function inboxRowTemplate(item) {
  const selected = state.selectedInboxIds.includes(item.id);
  return `<div class="list-row inbox-row" data-inbox-row data-search="${escapeHtml(`${item.text} ${item.tag}`)}">${state.inboxSelecting ? `<button class="select-check ${selected ? 'selected' : ''}" data-inbox-select="${item.id}" aria-label="选择此项">${selected ? '✓' : ''}</button>` : `<span class="reminder-icon amber">⌁</span>`}${lifePriorityDot(item.priority)}<div class="list-row-copy"><strong>${escapeHtml(item.text)}</strong><p>${escapeHtml(item.time || '刚刚')} · ${escapeHtml(item.tag || '未分类')}</p></div><div class="row-actions inbox-row-actions"><button class="row-action" data-edit-inbox="${item.id}">编辑</button><button class="row-action primary" data-complete-inbox="${item.id}">完成</button><button class="row-action danger-text" data-delete-inbox="${item.id}">删除</button></div></div>`;
}
function editInboxIdea(id) { const item = state.inbox.find(entry => entry.id === id); if (!item) return; state.inboxEditingId = id; renderInbox(); document.querySelector('#inbox-add-text')?.focus(); }
function saveInboxIdea(event) {
  event.preventDefault();
  const text = document.querySelector('#inbox-add-text')?.value.trim();
  if (!text) { showToast('请先写下一条想法'); return; }
  const priority = document.querySelector('input[name="inbox-priority"]:checked')?.value || 'medium';
  const id = document.querySelector('#inbox-edit-id')?.value;
  if (id) { const item = state.inbox.find(entry => entry.id === id); if (item) Object.assign(item, { text, priority }); state.inboxEditingId = ''; persist(); showToast('想法已更新'); render(); return; }
  state.inbox.unshift({ id: makeId('inbox'), text, time: '刚刚', tag: '未分类', priority, status: 'pending', createdAt: new Date().toISOString() });
  persist(); showToast('想法已收集'); render();
}

function scheduleLabel(item) {
  if (item.scheduleMode === 'monthly') return `每月 ${item.scheduleDays.join('、')} 日`;
  if (item.scheduleMode === 'dates') return `${item.scheduleDates.length} 个指定日期`;
  return '每天';
}
function isLearningDueToday(item) { return item.scheduleMode === 'monthly' ? item.scheduleDays.includes(today.getDate()) : item.scheduleMode === 'dates' ? item.scheduleDates.includes(isoToday) : true; }
function learningDueItems() { return state.learningItems.filter(isLearningDueToday); }
function weekDateKeys() { const mondayOffset = (today.getDay() + 6) % 7; const monday = new Date(today); monday.setDate(today.getDate() - mondayOffset); return Array.from({ length: 7 }, (_, index) => { const d = new Date(monday); d.setDate(monday.getDate() + index); return dateKey(d); }); }
function weekLearningCalendar() { return weekDateKeys().map((date, index) => `<div class="week-day ${state.learningCompleteDates.includes(date) ? 'is-done' : ''} ${date === isoToday ? 'is-today' : ''}"><span>${['一','二','三','四','五','六','日'][index]}</span><strong>${Number(date.slice(-2))}</strong><small>${state.learningCompleteDates.includes(date) ? '已打卡' : '—'}</small></div>`).join(''); }
function learningScheduleLabel(item, todayView = false) {
  if (todayView) return formatCalendarDate(isoToday);
  return scheduleLabel(item);
}
function learningHistoryItems() {
  return state.learningItems.flatMap(item => (item.doneDates || []).map(date => ({ item, date })))
    .sort((a, b) => b.date.localeCompare(a.date) || a.item.title.localeCompare(b.item.title, 'zh-CN'));
}
function learningHistoryTemplate(record) {
  return `<div class="learning-history-row"><span class="completed-check">✓</span><div class="list-row-copy"><strong>${escapeHtml(record.item.title)}</strong><small>${escapeHtml(formatCalendarDate(record.date))}${record.item.minutes ? ` · ${record.item.minutes} 分钟` : ''}</small></div><span class="activity-pill violet">已完成</span></div>`;
}
function renderLearn() {
  const dueItems = learningDueItems();
  const doneItems = dueItems.filter(item => (item.doneDates || []).includes(isoToday));
  const totalMinutes = dueItems.reduce((sum, item) => sum + Number(item.minutes || 0), 0);
  const doneMinutes = doneItems.reduce((sum, item) => sum + Number(item.minutes || 0), 0);
  const draftDays = state.learningPlanDaysDraft;
  const weeklyDone = state.learningCompleteDates.filter(date => weekDateKeys().includes(date)).length;
  const historyItems = learningHistoryItems();
  const planForm = state.learningPlanFormOpen ? `<form id="learning-plan-form" class="learning-plan-inline-form"><label class="field-label">学习项目名称</label><input id="learning-plan-title" class="text-input large" required placeholder="例如：英语听力训练"><label class="field-label">目的</label><textarea id="learning-plan-purpose" class="text-input plan-textarea" placeholder="为什么要学习它？"></textarea><label class="field-label">目标</label><textarea id="learning-plan-goal" class="text-input plan-textarea" placeholder="希望达到什么结果？"></textarea><div class="field-label">学习时间（每月可多选）</div><div class="calendar-field">${monthDayGrid(draftDays, 'data-learning-day')}</div><label class="field-label">学习时长（分钟）</label><input id="learning-plan-minutes" class="text-input" type="number" min="1" value="30"><div class="modal-footer"><button type="button" class="button ghost" data-close-inline-modal>取消</button><button class="button primary" type="submit">保存学习计划</button></div></form>` : '';
  pageContainer.innerHTML = `<div class="page-heading"><div><div class="eyebrow">GROW A LITTLE EVERY DAY</div><h1>学习</h1></div></div><div class="learning-layout"><div class="learning-left-column"><section class="card learning-section learning-today-card"><div class="section-heading"><div><h2>今日学习</h2><p>今日有 ${dueItems.length} 个学习计划 · ${doneMinutes}/${totalMinutes} 分钟</p></div><div class="section-heading-actions"><span class="section-badge">${doneItems.length}</span><button class="card-link" data-toggle-learning-temp>今日学习</button></div></div>${dueItems.length ? dueItems.map(item => learningItemTemplate(item, { todayView: true, showTodayStatus: true })).join('') : compactEmpty('今天没有安排学习计划')}</section><section class="card learning-section learning-plans-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">学习计划</span><span class="section-badge violet-badge">${state.learningItems.length}</span></div><span class="card-subtitle">周期性学习安排</span></div>${state.learningItems.length ? state.learningItems.map(item => learningItemTemplate(item, { todayView: false, showTodayStatus: false })).join('') : compactEmpty('还没有学习计划')}</section><section class="card learning-section learning-history-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">历史完成</span><span class="section-badge green-badge">${historyItems.length}</span></div><span class="card-subtitle">已经完成的学习内容</span></div><div class="learning-history-list">${historyItems.length ? historyItems.map(learningHistoryTemplate).join('') : compactEmpty('完成学习后，会在这里保留记录')}</div></section><section class="card news-card learning-section"><div class="card-header"><div class="card-title-wrap"><span class="card-title">每日新闻</span><span class="section-badge">${state.news.length}</span></div></div><div class="news-list">${state.news.map(newsItemTemplate).join('')}</div></section></div><aside class="learning-week-column"><section class="card learning-section"><div class="section-heading"><div><h2>周打卡</h2><p>本周已打卡 ${weeklyDone} 次</p></div><span class="section-badge">${doneItems.length}/${dueItems.length || 0}</span></div><div class="week-calendar">${weekLearningCalendar()}</div><div class="learning-card-footer"><button class="card-link" data-action="learning-history">${state.learningHistoryOpen ? '收起历史' : '历史记录'}</button></div>${state.learningHistoryOpen ? `<div class="learning-week-history">${historyItems.length ? historyItems.map(learningHistoryTemplate).join('') : compactEmpty('还没有历史学习记录')}</div>` : ''}</section><section class="card learning-section learning-plan-add-card ${state.learningPlanFormOpen ? 'is-open' : ''}"><div class="section-heading"><div><h2>新增学习计划</h2><p>安排每月可重复的学习内容。</p></div><button class="card-link" data-toggle-learning-form>${state.learningPlanFormOpen ? '收起' : '新增计划'}</button></div>${planForm}</section></aside></div>${state.learningTempFormOpen ? `<div class="modal-backdrop open inline-modal" data-inline-modal="learning-temp"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="learning-temp-modal-heading"><div class="modal-header"><div><div class="eyebrow">TODAY LEARNING</div><h2 id="learning-temp-modal-heading">今日学习</h2></div><button class="icon-button" data-close-inline-modal>×</button></div><form id="learning-temp-form"><label class="field-label">学习内容名称</label><input id="learning-temp-title" class="text-input large" required placeholder="例如：看完一节课程并做笔记"><div class="form-row"><label class="mini-field"><span>完成日期</span><input id="learning-temp-date" type="date" value="${isoToday}" required></label><label class="mini-field"><span>学习时长（可不填）</span><input id="learning-temp-minutes" type="number" min="1" placeholder="分钟"></label></div><div class="modal-footer"><button type="button" class="button ghost" data-close-inline-modal>取消</button><button type="submit" class="button primary">保存</button></div></form></div></div>` : ''}`;
}

function learningItemTemplate(item, { todayView = false, showTodayStatus = todayView } = {}) {
  const done = showTodayStatus && (item.doneDates || []).includes(isoToday);
  const status = showTodayStatus ? `<button class="task-check ${done ? 'done' : ''}" data-learning-toggle="${item.id}" aria-label="${done ? '撤销完成' : '完成学习'}">${done ? '✓' : ''}</button>` : '<span class="static-plan-mark" aria-hidden="true">○</span>';
  return `<div class="list-row learning-plan-row ${done ? 'is-done' : ''}">${status}<div class="list-row-copy"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.content || item.detail || item.goal || '')}${item.requirement ? ` · ${escapeHtml(item.requirement)}` : ''}</p><small class="schedule-meta">${escapeHtml(learningScheduleLabel(item, todayView))} · ${item.minutes ? `预计 ${item.minutes} 分钟` : '时长未设定'}</small></div><span class="activity-pill violet">${escapeHtml(item.category || '学习')}</span><button class="row-action danger-text" data-delete-learning="${item.id}">删除</button></div>`;
}
function saveLearningTemp(event) {
  event.preventDefault();
  const title = document.querySelector('#learning-temp-title')?.value.trim();
  const date = document.querySelector('#learning-temp-date')?.value || isoToday;
  if (!title || !date) { showToast('请填写学习内容和完成日期'); return; }
  state.learningItems.unshift({ id: makeId('learning'), title, content: '临时学习项目', requirement: '', detail: '临时学习项目', category: '临时', minutes: Number(document.querySelector('#learning-temp-minutes')?.value) || 0, scheduleMode: 'dates', scheduleDays: [], scheduleDates: [date], doneDates: [] });
  state.learningTempFormOpen = false; persist(); showToast('今日学习已添加'); render();
}

function renderNewsInsideLearning() {
  pageContainer.innerHTML = `<div class="page-heading"><div><div class="eyebrow">LEARN THROUGH THE WORLD</div><h1>学习</h1></div><div class="heading-actions"><button class="button ghost" data-learn-tab="learning">回到今日学习</button><button class="button primary" data-action="refresh-news">↻ 刷新新闻</button></div></div><div class="learning-tabs"><button class="learning-tab" data-learn-tab="learning">今日学习</button><button class="learning-tab active" data-learn-tab="news">新闻浏览</button></div><section class="card news-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">今日精选</span><span class="section-badge">${state.news.length}</span></div><span class="card-subtitle">${state.news.filter(item => item.saved).length} 条已收藏</span></div><div class="filter-row"><button class="filter-chip active">全部</button><button class="filter-chip">科技</button><button class="filter-chip">效率</button><button class="filter-chip">Apple</button></div><div class="news-list">${state.news.map(newsItemTemplate).join('')}</div></section>`;
}
function newsItemTemplate(item, index) { return `<article class="news-item"><div class="news-source"><span class="source-dot" style="background:${index === 1 ? 'var(--amber)' : index === 2 ? 'var(--coral)' : 'var(--primary)'}"></span>${escapeHtml(item.source)} · ${escapeHtml(item.age)}</div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p><div class="news-actions"><button data-news-toggle="save" data-id="${item.id}">${item.saved ? '已收藏' : '收藏'}</button><button data-news-toggle="capture" data-id="${item.id}">${item.captured ? '已收集' : '收集'}</button></div></article>`; }

function isFitnessPlanDueToday(plan) { return plan.scheduleMode === 'monthly' ? plan.scheduleDays.includes(today.getDate()) : plan.scheduleMode === 'dates' ? plan.scheduleDates.includes(isoToday) : true; }
function isFitnessPlanDoneToday(plan) { return (plan.doneDates || []).includes(isoToday); }
function fitnessDuePlans() { return state.fitnessPlans.filter(isFitnessPlanDueToday); }
function fitnessRecordMonthKey() {
  const current = monthKey();
  if (!state.fitnessRecordMonthManual) return current;
  return /^\d{4}-\d{2}$/.test(state.fitnessRecordMonth || '') ? state.fitnessRecordMonth : current;
}
function fitnessMonthCalendar(selectedMonth = fitnessRecordMonthKey()) {
  const [year, monthNumber] = selectedMonth.split('-').map(Number);
  const days = new Date(year, monthNumber, 0).getDate();
  return Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const date = `${year}-${String(monthNumber).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const done = state.fitnessLogs.some(log => log.type === 'session' && log.date === date);
    return `<div class="month-calendar-day ${done ? 'is-done' : ''} ${date === isoToday ? 'is-today' : ''}"><strong>${day}</strong><small>${done ? '✓' : ''}</small></div>`;
  }).join('');
}
function fitnessMonthOptions() {
  const year = today.getFullYear();
  return Array.from({ length: 12 }, (_, index) => {
    const key = `${year}-${String(index + 1).padStart(2, '0')}`;
    const count = state.fitnessLogs.filter(log => log.type === 'session' && log.date.startsWith(`${key}-`)).length;
    return `<button class="button ghost ${fitnessRecordMonthKey() === key ? 'active' : ''}" data-fitness-record-month="${key}">${index + 1}月${count ? ` · ${count}` : ''}</button>`;
  }).join('');
}
function fitnessDoneToday() { const due = fitnessDuePlans(); return due.length > 0 && due.every(isFitnessPlanDoneToday); }
function fitnessPlanActions(plan) { return (plan.actionIds || []).map(id => state.workouts.find(action => action.id === id)).filter(Boolean); }
function fitnessPlanDateInstances(plan, startDate, endDate) {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
  const instances = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = dateKey(cursor);
    const due = plan.scheduleMode === 'monthly'
      ? (plan.scheduleDays || []).includes(cursor.getDate())
      : plan.scheduleMode === 'dates'
        ? (plan.scheduleDates || []).includes(date)
        : true;
    if (due && (!plan.createdAt || date >= plan.createdAt)) instances.push({ plan, date, done: (plan.doneDates || []).includes(date) });
  }
  return instances;
}
function fitnessHistoryItems() {
  return state.fitnessPlans.flatMap(plan => (plan.doneDates || [])
    // 只展示计划创建之后的历史记录，避免旧版本遗留日期污染新计划的历史。
    .filter(date => date < isoToday && (!plan.createdAt || date >= plan.createdAt))
    .map(date => ({ plan, date, actions: fitnessPlanActions(plan) })))
    .sort((a, b) => b.date.localeCompare(a.date) || a.plan.title.localeCompare(b.plan.title, 'zh-CN'));
}
function fitnessOverdueItems() {
  const startDate = dateOffset(-60);
  return state.fitnessPlans.flatMap(plan => fitnessPlanDateInstances(plan, startDate, dateOffset(-1))
    .filter(instance => !instance.done)
    .map(instance => ({ ...instance, actions: fitnessPlanActions(plan) })))
    .sort((a, b) => b.date.localeCompare(a.date) || a.plan.title.localeCompare(b.plan.title, 'zh-CN'));
}
function fitnessHistoryTemplate(item, overdue = false) {
  const label = overdue ? '未完成' : '已打卡';
  const tone = overdue ? 'coral' : 'green';
  return `<div class="fitness-history-row ${overdue ? 'is-overdue' : ''}"><div class="fitness-history-copy"><strong>${escapeHtml(item.plan.title)}</strong><small>${escapeHtml(formatCalendarDate(item.date))} · ${item.actions.length} 个动作</small></div><span class="activity-pill ${tone}">${label}</span></div>`;
}
function fitnessPlanTemplate(plan, allPlans = false, todayView = false) {
  const done = todayView && isFitnessPlanDoneToday(plan);
  const actions = fitnessPlanActions(plan).map(action => action.title);
  const dateLine = todayView ? formatCalendarDate(isoToday) : scheduleLabel(plan);
  return `<div class="list-row fitness-plan-row ${done ? 'is-done' : ''}">${allPlans ? '<span class="plan-mark">◎</span>' : `<button class="task-check ${done ? 'done' : ''}" data-fitness-plan-toggle="${plan.id}" aria-label="${done ? '取消打卡' : '完成训练'}">${done ? '✓' : ''}</button>`}<div class="list-row-copy"><strong>${escapeHtml(plan.title)}</strong><small class="schedule-meta fitness-schedule-line">${escapeHtml(dateLine)}${todayView ? '' : ` · ${escapeHtml(plan.time || '16:00')}`}</small>${actions.length ? `<p class="fitness-actions-line">${escapeHtml(actions.join('、'))}</p>` : ''}${plan.requirement ? `<p class="fitness-requirement">${escapeHtml(plan.requirement)}</p>` : ''}</div><span class="activity-pill green">${actions.length} 个动作</span>${allPlans ? `<button class="row-action" data-edit-fitness-plan="${plan.id}">修改</button>` : ''}<button class="row-action danger-text" data-delete-fitness-plan="${plan.id}">删除</button></div>`;
}
function renderFitness() {
  const duePlans = fitnessDuePlans();
  const selectedMonth = fitnessRecordMonthKey();
  const monthCount = state.fitnessLogs.filter(log => log.type === 'session' && log.date.startsWith(`${selectedMonth}-`)).length;
  const draftDays = state.fitnessPlanDaysDraft;
  const editingPlan = state.fitnessPlans.find(item => item.id === state.fitnessEditingPlanId);
  const actionCategoryFilter = state.fitnessActionCategoryFilter === '全部' || state.workoutCategories.includes(state.fitnessActionCategoryFilter) ? state.fitnessActionCategoryFilter : '全部';
  const visibleWorkouts = actionCategoryFilter === '全部' ? state.workouts : state.workouts.filter(action => (action.category || '未分类') === actionCategoryFilter);
  const actionCategoryOptions = ['全部', ...state.workoutCategories];
  const actionCategorySelect = actionCategoryOptions.map(category => `<button type="button" class="fitness-action-category-chip ${category === actionCategoryFilter ? 'active' : ''}" data-fitness-action-category-filter="${escapeHtml(category)}" aria-pressed="${category === actionCategoryFilter}">${category === '全部' ? '全部动作' : escapeHtml(category)}</button>`).join('');
  const actionPreview = visibleWorkouts.map(action => `<div class="fitness-action-preview-row"><div><strong>${escapeHtml(action.title)}</strong><small>${escapeHtml(action.category || '未分类')} · ${escapeHtml(action.detail || '未设置要求')}</small></div><button class="row-action danger-text" data-delete-workout="${action.id}">删除</button></div>`).join('') || compactEmpty(actionCategoryFilter === '全部' ? '还没有动作' : '这个分类下还没有动作');
  const planActionCategoryFilter = state.fitnessPlanActionCategoryFilter === '全部' || state.workoutCategories.includes(state.fitnessPlanActionCategoryFilter) ? state.fitnessPlanActionCategoryFilter : '全部';
  const planActionCategoryOptions = ['全部', ...state.workoutCategories].map(category => `<button type="button" class="fitness-plan-category-chip ${category === planActionCategoryFilter ? 'active' : ''}" data-fitness-plan-action-category-filter="${escapeHtml(category)}" aria-pressed="${category === planActionCategoryFilter}">${category === '全部' ? '全部动作' : escapeHtml(category)}</button>`).join('');
  const planActionPicker = state.workouts.map(action => { const category = action.category || '未分类'; const hidden = planActionCategoryFilter !== '全部' && category !== planActionCategoryFilter ? ' hidden' : ''; return `<label data-fitness-plan-action-category="${escapeHtml(category)}"${hidden}><input type="checkbox" name="fitness-action" value="${action.id}" ${editingPlan?.actionIds?.includes(action.id) ? 'checked' : ''}><span><strong>${escapeHtml(action.title)}</strong><small>${escapeHtml(category)} · ${escapeHtml(action.detail || '未设置动作要求')}</small></span></label>`; }).join('') || compactEmpty('请先添加锻炼动作');
  const historyItems = fitnessHistoryItems();
  const overdueItems = fitnessOverdueItems();
  pageContainer.innerHTML = `<div class="page-heading"><div><div class="eyebrow">MOVE WITH EASE</div><h1>健身</h1></div></div><div class="fitness-layout"><div class="fitness-left-column"><section class="card list-card fitness-today-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">今日计划</span><span class="section-badge">${duePlans.length}</span></div><span class="card-subtitle">${duePlans.filter(isFitnessPlanDoneToday).length}/${duePlans.length} 个计划已打卡</span></div>${duePlans.length ? duePlans.map(plan => fitnessPlanTemplate(plan, false, true)).join('') : compactEmpty('今天没有安排训练计划')}</section><section class="card list-card fitness-existing-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">训练计划</span><span class="section-badge green-badge">${state.fitnessPlans.length}</span></div><button class="card-link" data-toggle-fitness-plan-form>新增计划</button></div>${state.fitnessPlans.length ? state.fitnessPlans.map(plan => fitnessPlanTemplate(plan, true)).join('') : compactEmpty('还没有健身计划')}</section><section class="card list-card fitness-history-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">历史训练</span><span class="section-badge green-badge">${historyItems.length}</span></div><span class="card-subtitle">已打卡完成的训练</span></div><div class="fitness-history-list">${historyItems.length ? historyItems.map(item => fitnessHistoryTemplate(item)).join('') : compactEmpty('完成训练计划后，会在这里保留记录')}</div></section><section class="card list-card fitness-overdue-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">逾期训练</span><span class="section-badge coral-badge">${overdueItems.length}</span></div><span class="card-subtitle">过期但尚未打卡的训练</span></div><div class="fitness-history-list">${overdueItems.length ? overdueItems.map(item => fitnessHistoryTemplate(item, true)).join('') : compactEmpty('目前没有逾期训练')}</div></section></div><aside class="fitness-right-column"><section class="card fitness-calendar-card"><div class="section-heading"><div><h2>月记录</h2><p>${monthLabel(selectedMonth)}</p></div><div class="fitness-calendar-actions"><div class="month-record-count"><span>本月已健身</span><strong><b>${monthCount}</b><em>次</em></strong></div></div></div><div class="month-calendar">${fitnessMonthCalendar(selectedMonth)}</div><div class="fitness-calendar-footer"><button class="card-link" data-fitness-history-toggle>历史记录</button></div>${state.fitnessHistoryMonthsOpen ? `<div class="fitness-history-months" aria-label="选择历史月份">${fitnessMonthOptions()}</div>` : ''}</section><section class="card fitness-action-card"><div class="card-header"><div class="card-title-wrap"><span class="card-title">锻炼动作</span><span class="section-badge">${state.workouts.length}</span></div><button class="card-link" data-toggle-fitness-action-form>添加动作</button></div><div class="fitness-action-toolbar"><span class="field-hint">动作分类</span><div class="fitness-action-category-scroll" role="tablist" aria-label="按动作分类查看">${actionCategorySelect}</div></div><div class="fitness-actions-preview">${actionPreview}</div></section></aside></div>${state.fitnessPlanFormOpen ? `<div class="modal-backdrop open inline-modal" data-inline-modal="fitness-plan"><div class="modal fitness-modal" role="dialog" aria-modal="true" aria-labelledby="fitness-plan-modal-title"><div class="modal-header"><div><div class="eyebrow">FITNESS PLAN</div><h2 id="fitness-plan-modal-title">${editingPlan ? '修改健身计划' : '添加健身计划'}</h2></div><button class="icon-button" data-close-inline-modal>×</button></div><form id="fitness-plan-form"><label class="field-label">项目标题</label><input id="fitness-plan-title" class="text-input large" required value="${editingPlan ? escapeHtml(editingPlan.title) : ''}" placeholder="例如：臀腿锻炼"><label class="field-label">选择锻炼动作</label><div class="fitness-plan-action-toolbar"><span class="field-hint">按动作分类</span><div class="fitness-plan-category-scroll" role="tablist" aria-label="按动作分类筛选">${planActionCategoryOptions}</div></div><div class="action-picker">${planActionPicker}</div><label class="field-label">计划要求</label><textarea id="fitness-plan-requirement" class="text-input plan-textarea" placeholder="例如：每个动作 3 组">${editingPlan ? escapeHtml(editingPlan.requirement || '') : ''}</textarea><label class="field-label">日期方式</label><input type="hidden" id="fitness-schedule-mode" value="${editingPlan?.scheduleMode || 'monthly'}"><div class="segmented-choice fitness-schedule-choice" role="radiogroup" aria-label="日期方式"><button type="button" class="segmented-choice-item ${(!editingPlan || editingPlan?.scheduleMode === 'monthly') ? 'active' : ''}" data-fitness-schedule-mode="monthly" aria-pressed="${(!editingPlan || editingPlan?.scheduleMode === 'monthly')}">每月固定日期</button><button type="button" class="segmented-choice-item ${editingPlan?.scheduleMode === 'daily' ? 'active' : ''}" data-fitness-schedule-mode="daily" aria-pressed="${editingPlan?.scheduleMode === 'daily'}">每天</button><button type="button" class="segmented-choice-item ${editingPlan?.scheduleMode === 'dates' ? 'active' : ''}" data-fitness-schedule-mode="dates" aria-pressed="${editingPlan?.scheduleMode === 'dates'}">指定日期</button></div><div id="fitness-days-field" class="calendar-field" ${!editingPlan || editingPlan?.scheduleMode === 'monthly' ? '' : 'hidden'}><span class="field-label">选择日期（可多选）</span>${fitnessPlanDayGrid(draftDays.length ? draftDays : (editingPlan?.scheduleDays || []), 'data-fitness-day')}</div><div class="form-row" id="fitness-specific-dates-field" ${editingPlan?.scheduleMode === 'dates' ? '' : 'hidden'}><label class="mini-field"><span>指定日期（可多选）</span>${datePickerTemplate('fitness-plan-dates', editingPlan?.scheduleDates || [])}</label></div><div class="modal-footer"><button type="button" class="button ghost" data-close-inline-modal>取消</button><button class="button primary" type="submit">保存健身计划</button></div></form></div></div>` : ''}${state.fitnessActionFormOpen ? `<div class="modal-backdrop open inline-modal" data-inline-modal="fitness-action"><div class="modal fitness-modal" role="dialog" aria-modal="true" aria-labelledby="fitness-action-modal-title"><div class="modal-header"><div><div class="eyebrow">FITNESS ACTION</div><h2 id="fitness-action-modal-title">添加锻炼动作</h2></div><button class="icon-button" data-close-inline-modal>×</button></div><form id="fitness-action-form"><label class="field-label">动作名称</label><input id="fitness-action-title" class="text-input large" required placeholder="例如：深蹲"><label class="field-label">动作分类</label><div class="category-manager"><select id="fitness-action-category" class="compact-select">${state.workoutCategories.map(category => `<option>${escapeHtml(category)}</option>`).join('')}</select><input id="fitness-new-category" class="text-input" placeholder="新分类"><button type="button" class="button ghost" data-add-fitness-category>添加分类</button><button type="button" class="button ghost danger-outline" data-delete-fitness-category>删除当前分类</button></div><label class="field-label">动作要求</label><input id="fitness-action-detail" class="text-input" placeholder="例如：3 组 · 每组 12 次"><div class="modal-footer"><button type="button" class="button ghost" data-close-inline-modal>取消</button><button class="button primary" type="submit">保存锻炼动作</button></div></form></div></div>` : ''}`;
}

function renderJournal() {
  const viewingDate = state.journalViewingDate || isoToday;
  const isHistoryView = viewingDate !== isoToday;
  const entry = state.journals[viewingDate];
  const text = isHistoryView ? (entry?.text || '') : (state.journalDraft || entry?.text || '');
  const history = Object.entries(state.journals).filter(([, value]) => value?.text).sort(([a], [b]) => b.localeCompare(a));
  pageContainer.innerHTML = `<div class="page-heading"><div><div class="eyebrow">A FEW LINES FOR YOURSELF</div><h1>日记</h1><p>吾日三省吾身</p></div></div><div class="subpage-layout journal-layout"><section class="card journal-editor"><div class="card-header"><div class="journal-header-left">${isHistoryView ? `<button class="button ghost journal-back-button" data-action="journal-back">← 返回今天</button>` : ''}<div class="journal-date">${formatFullDate(viewingDate)}</div></div></div><textarea id="journal-textarea" class="journal-textarea" placeholder="今天发生了什么？此刻的感受是什么？接下来想把什么事情做好？">${escapeHtml(text)}</textarea><div class="journal-footer"><span>今日记录字数：<strong id="journal-word-count">${text.length}</strong></span><div class="journal-footer-actions"><span class="journal-entry-count footer-entry-count">已记录 ${Object.keys(state.journals).length} 篇</span><button class="button ghost" data-action="clear-journal">清空当前内容</button><button class="button primary" data-action="save-journal">保存日记</button></div></div></section><aside class="card side-card"><h3>历史记录</h3><div class="journal-history">${history.length ? history.map(([date, value]) => `<button class="history-item ${date === viewingDate ? 'active' : ''}" data-journal-history="${date}"><span>${formatCalendarDate(date)}</span><small>${escapeHtml(value.text.slice(0, 42))}${value.text.length > 42 ? '…' : ''}</small></button>`).join('') : compactEmpty('保存第一篇日记后，会出现在这里')}</div></aside></div>`;
}

function completedTasksToday() { return state.tasks.filter(task => task.date === isoToday && task.done).length; }

function renderSettings() {
  pageContainer.innerHTML = `<div class="page-heading"><div><div class="eyebrow">MAKE IT YOURS</div><h1>设置</h1><p>把工作台调整成适合你的样子。</p></div></div><div class="subpage-layout"><section class="card list-card settings-card"><div class="card-header"><div><div class="card-title">偏好设置</div><div class="card-subtitle" style="margin-top:5px">修改后会立即保存在当前浏览器。</div></div></div><label class="setting-row"><div><strong>每日开始时间</strong><p>用于安排每天的第一个提醒。</p></div><input class="compact-input" type="time" value="${state.settings.dailyStart}" data-setting="dailyStart" /></label><label class="setting-row"><div><strong>日记提醒时间</strong><p>提醒自己记录日记和安排明天。</p></div><input class="compact-input" type="time" value="${state.settings.journalTime}" data-setting="journalTime" /></label><label class="setting-row"><div><strong>浏览器提醒</strong><p>当前先控制工作台内的提醒显示，系统推送将在接入后端后开启。</p></div><input class="toggle-input" type="checkbox" ${state.settings.notifications ? 'checked' : ''} data-setting="notifications" /></label></section><aside class="card side-card"><h3>数据与同步</h3><p>当前版本采用本地优先保存，并支持同一浏览器多个标签页之间实时同步。换设备使用前，可以先导出数据。</p><div class="settings-actions"><button class="button primary full-button" data-action="export">导出我的数据</button><button class="button ghost full-button" data-action="import">导入数据</button><button class="button ghost full-button danger-outline" data-action="reset-data">恢复示例数据</button></div><input id="import-file" type="file" accept="application/json" hidden /></aside></div>`;
}
function renderSearch() {
  const query = state.globalSearch.trim().toLowerCase();
  const results = [];
  if (query) {
    state.tasks.filter(item => `${item.title} ${item.meta}`.toLowerCase().includes(query)).forEach(item => results.push({ type: '任务', title: item.title, detail: `${formatPlanDate(item.date)} · ${item.done ? '已完成' : '待完成'}`, action: 'plan' }));
    state.inbox.filter(item => item.status === 'pending' && `${item.text} ${item.tag}`.toLowerCase().includes(query)).forEach(item => results.push({ type: '收集箱', title: item.text, detail: item.tag || '未分类', action: 'inbox' }));
    state.learningItems.filter(item => `${item.title} ${item.detail}`.toLowerCase().includes(query)).forEach(item => results.push({ type: '学习', title: item.title, detail: item.detail, action: 'learn' }));
    state.workItems.filter(item => `${item.title} ${item.detail}`.toLowerCase().includes(query)).forEach(item => results.push({ type: '工作', title: item.title, detail: `${workTypeLabel(item)} · ${workScheduleLabel(item)}`, action: 'work' }));
    Object.entries(state.journals).filter(([, item]) => item?.text?.toLowerCase().includes(query)).forEach(([date, item]) => results.push({ type: '日记', title: `${formatPlanDate(date)} 的日记`, detail: item.text.slice(0, 80), action: 'journal' }));
  }
  pageContainer.innerHTML = `<div class="page-heading"><div><div class="eyebrow">SEARCH YOUR SPACE</div><h1>搜索</h1><p>${query ? `正在搜索“${escapeHtml(state.globalSearch)}”` : '搜索任务、想法、学习内容和日记。'}</p></div></div><section class="card list-card search-results-card">${query ? (results.length ? results.map(result => `<button class="search-result" data-action="${result.action}"><span class="activity-pill violet">${result.type}</span><span><strong>${escapeHtml(result.title)}</strong><small>${escapeHtml(result.detail)}</small></span><span class="search-arrow">→</span></button>`).join('') : compactEmpty('没有找到匹配内容')) : compactEmpty('在顶部搜索框输入关键词并按回车')}</section>`;
}

function recordStreak() {
  let streak = 0;
  for (let offset = 0; offset < 365; offset += 1) { if (!hasRecord(dateOffset(-offset))) break; streak += 1; }
  return streak;
}
function hasRecord(date) { return Boolean(state.journals[date]?.text) || state.tasks.some(task => task.date === date && task.done) || state.learningCompleteDates.includes(date) || state.fitnessLogs.some(log => log.type === 'session' && log.date === date); }
function recordedDaysInWeek() { return lastSevenDays().filter(day => day.recorded).length; }
function lastSevenDays() { return Array.from({ length: 7 }, (_, index) => { const date = dateOffset(index - 6); const parsed = new Date(`${date}T12:00:00`); return { date, recorded: hasRecord(date), short: `${parsed.getMonth() + 1}/${parsed.getDate()}`, label: formatPlanDate(date) }; }); }
function learningDaysThisWeek() { return Array.from({ length: 7 }, (_, index) => dateOffset(-index)).filter(date => state.learningCompleteDates.includes(date)).length; }

function renderLifeReminderTimes() {
  const tags = document.querySelector('#life-reminder-time-tags');
  if (!tags) return;
  const times = [...new Set((state.lifeReminderTimesDraft || []).filter(value => /^\d{2}:\d{2}$/.test(value)).sort())];
  tags.innerHTML = times.length ? times.map(time => `<span class="time-picker-tag">${time}<button type="button" data-life-time-remove="${time}" aria-label="移除 ${time}">×</button></span>`).join('') : `<span class="time-picker-empty">至少添加一个提醒时间</span>`;
}
function syncLifeReminderFormFields() {
  const mode = document.querySelector('#life-reminder-mode')?.value || state.lifeReminderModeDraft || 'once';
  const dateField = document.querySelector('#life-reminder-date-field');
  const daysField = document.querySelector('#life-reminder-days-field');
  const dateInput = document.querySelector('#life-reminder-date');
  if (dateField) dateField.hidden = mode !== 'once';
  if (daysField) daysField.hidden = mode !== 'monthly';
  if (dateInput) dateInput.required = mode === 'once';
  document.querySelectorAll('[data-life-reminder-mode]').forEach(button => button.classList.toggle('active', button.dataset.lifeReminderMode === mode));
  const grid = document.querySelector('#life-reminder-day-grid');
  if (grid && mode === 'monthly') grid.innerHTML = monthDayGrid(state.lifeReminderDaysDraft || [], 'data-life-reminder-day');
}
function openLifeReminderModal(id = null) {
  const reminder = id ? state.reminders.find(item => item.id === id) : null;
  if (id && !reminder) return;
  state.lifeReminderTimesDraft = reminder ? reminderTimes(reminder) : [];
  state.lifeReminderModeDraft = reminder?.scheduleMode === 'monthly' ? 'monthly' : 'once';
  state.lifeReminderDaysDraft = reminder?.scheduleDays || [];
  lifeReminderModal?.classList.add('open');
  lifeReminderModal?.setAttribute('aria-hidden', 'false');
  const editId = document.querySelector('#life-reminder-edit-id');
  const title = document.querySelector('#life-reminder-title');
  const date = document.querySelector('#life-reminder-date');
  const mode = document.querySelector('#life-reminder-mode');
  const heading = document.querySelector('#life-reminder-modal-title');
  if (editId) editId.value = id || '';
  if (title) title.value = reminder?.title || '';
  if (date) date.value = reminder?.date || isoToday;
  if (mode) mode.value = state.lifeReminderModeDraft;
  document.querySelector(`input[name="life-reminder-priority"][value="${reminder?.priority || 'medium'}"]`)?.click();
  if (heading) heading.textContent = id ? '编辑生活提醒' : '新增生活提醒';
  const timeInput = document.querySelector('#life-reminder-time-input');
  if (timeInput) timeInput.value = '';
  syncLifeReminderFormFields();
  renderLifeReminderTimes();
  setTimeout(() => title?.focus(), 80);
}
function closeLifeReminderModal() {
  lifeReminderModal?.classList.remove('open');
  lifeReminderModal?.setAttribute('aria-hidden', 'true');
  state.lifeReminderTimesDraft = [];
  state.lifeReminderDaysDraft = [];
  state.lifeReminderModeDraft = 'once';
}
function saveLifeReminderForm(event) {
  event.preventDefault();
  const title = document.querySelector('#life-reminder-title')?.value.trim();
  const mode = document.querySelector('#life-reminder-mode')?.value === 'monthly' ? 'monthly' : 'once';
  const date = document.querySelector('#life-reminder-date')?.value || '';
  const days = [...new Set((state.lifeReminderDaysDraft || []).map(Number).filter(day => day >= 1 && day <= 31))].sort((a, b) => a - b);
  const priority = document.querySelector('input[name="life-reminder-priority"]:checked')?.value || 'medium';
  const times = [...new Set((state.lifeReminderTimesDraft || []).filter(value => /^\d{2}:\d{2}$/.test(value)).sort())];
  const id = document.querySelector('#life-reminder-edit-id')?.value;
  if (!title) { showToast('请填写生活事项'); return; }
  if (mode === 'once' && !date) { showToast('请选择待完成日期'); return; }
  if (mode === 'monthly' && !days.length) { showToast('请至少选择一个每月固定日期'); return; }
  if (!times.length) { showToast('请至少添加一个提醒时间'); return; }
  const existing = id ? state.reminders.find(item => item.id === id) : null;
  const item = { id: id || makeId('reminder'), title, date: mode === 'once' ? date : '', scheduleMode: mode, scheduleDays: mode === 'monthly' ? days : [], time: times[0], times, priority, done: mode === 'monthly' ? false : (existing?.done || false), doneDates: mode === 'monthly' ? (existing?.doneDates || []) : [], completedAt: existing?.completedAt || '', repeat: mode === 'monthly' ? '固定提醒' : '单日提醒' };
  if (existing) Object.assign(existing, item); else state.reminders.unshift(item);
  state.page = 'plan';
  persist(); closeLifeReminderModal(); showToast(existing ? '生活提醒已更新' : '生活提醒已创建'); render();
}
function snoozeReminder(id) {
  const reminder = state.reminders.find(item => item.id === id);
  if (!reminder) return;
  reminder.scheduleMode = 'once';
  reminder.scheduleDays = [];
  reminder.repeat = '单日提醒';
  reminder.date = dateOffset(1);
  reminder.done = false;
  persist(); showToast('已安排到明天'); render();
}

function openModal(type = 'task', id = null) {
  modalContext = { mode: id ? `edit-${type}` : 'create', id };
  state.modalType = type;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.querySelectorAll('.quick-type').forEach(button => { button.classList.toggle('selected', button.dataset.type === type); button.hidden = type === 'inbox' && button.dataset.type !== 'inbox'; });
  const source = type === 'task' && id ? state.tasks.find(item => item.id === id) : type === 'workout' && id ? state.workouts.find(item => item.id === id) : null;
  quickInput.value = source?.title || '';
  quickDate.value = source?.date || isoToday;
  quickTime.value = source?.time || '';
  quickDuration.value = source?.minutes || source?.duration || '';
  quickPriority.value = source?.priority || 'medium';
  quickAddTitle.textContent = id ? (type === 'workout' ? '编辑训练动作' : '编辑任务') : type === 'inbox' ? '新增想法' : type === 'reminder' ? '设置提醒' : type === 'learning' ? '添加学习内容' : type === 'workout' ? '添加训练动作' : type === 'inbox' ? '新增想法' : '快速新增';
  syncQuickFields();
  setTimeout(() => quickInput.focus(), 80);
}
function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); modalContext = { mode: 'create', id: null }; }
function syncQuickFields() {
  const type = document.querySelector('.quick-type.selected')?.dataset.type || state.modalType || 'task';
  state.modalType = type;
  if (quickTimeField) quickTimeField.hidden = !['task', 'reminder'].includes(type);
  if (quickDurationField) quickDurationField.hidden = !['learning', 'workout'].includes(type);
  const labels = { task: '安排日期', inbox: '记录日期', reminder: '提醒日期', learning: '记录日期', workout: '训练日期' };
  const dateLabelNode = document.querySelector('#quick-add-date-label');
  if (dateLabelNode) dateLabelNode.textContent = labels[type] || '安排日期';
  quickInput.placeholder = type === 'inbox' ? '例如：突然想到一个可以尝试的方向' : type === 'reminder' ? '例如：晚上给家人打电话' : type === 'learning' ? '例如：学习 CSS Grid' : type === 'workout' ? '例如：深蹲' : '例如：整理首页参考网站';
}
function showConfirm(title, message, callback, danger = false) { pendingConfirmation = callback; confirmTitle.textContent = title; confirmMessage.textContent = message; confirmAction.textContent = danger ? '确认删除' : '确认'; confirmAction.classList.toggle('danger-button', danger); confirmModal.classList.add('open'); confirmModal.setAttribute('aria-hidden', 'false'); }
function closeConfirm() { pendingConfirmation = null; confirmModal.classList.remove('open'); confirmModal.setAttribute('aria-hidden', 'true'); }

function saveModalForm(event) {
  event.preventDefault();
  const type = document.querySelector('.quick-type.selected')?.dataset.type || state.modalType || 'task';
  const text = quickInput.value.trim();
  if (!text) { showToast('请先填写内容'); quickInput.focus(); return; }
  const id = modalContext.id;
  if (modalContext.mode === 'edit-task' && id) {
    const task = state.tasks.find(item => item.id === id);
    if (task) Object.assign(task, { title: text, date: quickDate.value, time: quickTime.value, priority: quickPriority.value });
    showToast('任务已更新');
  } else if (type === 'inbox') {
    state.inbox.unshift({ id: makeId('inbox'), text, time: '刚刚', tag: '未分类', status: 'pending', createdAt: new Date().toISOString() });
    state.page = 'inbox'; showToast('已放入收集箱');
  } else if (type === 'reminder') {
    const reminderTime = quickTime.value || '09:00'; state.reminders.unshift({ id: makeId('reminder'), title: text, date: quickDate.value || isoToday, time: reminderTime, times: [reminderTime], priority: quickPriority.value || 'medium', done: false, repeat: '一次性' });
    state.page = 'plan'; showToast('提醒已创建');
  } else if (type === 'learning') {
    state.learningItems.unshift({ id: makeId('learning'), title: text, detail: `预计 ${Number(quickDuration.value) || 30} 分钟 · 自定义`, category: '自定义', minutes: Number(quickDuration.value) || 30, doneDates: [] });
    state.page = 'learn'; state.learnTab = 'learning'; showToast('学习内容已添加');
  } else if (type === 'workout') {
    state.workouts.unshift({ id: makeId('workout'), title: text, detail: `${Number(quickDuration.value) || 10} 分钟 · 自定义`, category: '自定义' });
    state.page = 'fitness'; showToast('训练动作已添加');
  } else {
    state.tasks.unshift({ id: makeId('task'), title: text, meta: '新建任务', priority: quickPriority.value, done: false, date: quickDate.value || isoToday, time: quickTime.value || '' });
    state.page = quickDate.value === isoToday || !quickDate.value ? 'today' : 'plan'; showToast('任务已添加');
  }
  persist(); closeModal(); render();
}

function syncWorkFormFields() {
  const kind = document.querySelector('#work-kind')?.value || 'arrangement';
  const dateField = document.querySelector('#work-date-field');
  const dayField = document.querySelector('#work-day-field');
  if (dateField) dateField.hidden = kind !== 'arrangement';
  if (dayField) dayField.hidden = kind !== 'plan';
  document.querySelectorAll('[data-work-kind]').forEach(button => button.classList.toggle('active', button.dataset.workKind === kind));
}
function resetWorkForm() {
  const form = document.querySelector('#work-form');
  if (!form) return;
  form.reset();
  document.querySelector('#work-edit-id').value = '';
  document.querySelector('#work-kind').value = 'arrangement';
  document.querySelector('#work-date').value = isoToday;
  document.querySelector('#work-time').value = '09:00';
  state.workDaysDraft = [];
  document.querySelector('#work-form-heading').textContent = '新增+';
  document.querySelector('#work-cancel-edit').hidden = true;
  renderWork();
}

function editWorkItem(id) {
  const item = state.workItems.find(entry => entry.id === id);
  if (!item) return;
  state.workDaysDraft = workScheduleDays(item);
  renderWork();
  document.querySelector('#work-edit-id').value = id;
  document.querySelector('#work-kind').value = item.schedule === 'monthly' ? 'plan' : 'arrangement';
  document.querySelector('#work-title').value = item.title;
  document.querySelector('#work-date').value = item.date || isoToday;
  document.querySelector('#work-time').value = item.time || '09:00';
  document.querySelector(`input[name="work-priority"][value="${item.priority || 'medium'}"]`)?.click();
  document.querySelector('#work-detail').value = item.detail || '';
  document.querySelector('#work-form-heading').textContent = '编辑工作安排';
  document.querySelector('#work-cancel-edit').hidden = false;
  syncWorkFormFields();
  document.querySelector('#work-title')?.focus();
  document.querySelector('.work-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function saveWorkForm(event) {
  event.preventDefault();
  const title = document.querySelector('#work-title')?.value.trim();
  if (!title) { showToast('请先填写工作项目内容'); return; }
  const id = document.querySelector('#work-edit-id')?.value;
  const type = document.querySelector('#work-kind').value === 'plan' ? 'plan' : 'arrangement';
  if (type === 'arrangement' && !document.querySelector('#work-date')?.value) { showToast('请选择工作安排日期'); return; }
  const existing = id ? state.workItems.find(item => item.id === id) : null;
  const scheduleDays = [...new Set(state.workDaysDraft.map(Number))].sort((a, b) => a - b);
  if (type === 'plan' && !scheduleDays.length) { showToast('请至少选择一个工作计划日期'); return; }
  const item = { id: id || makeId('work'), title, detail: document.querySelector('#work-detail').value.trim(), type, schedule: type === 'plan' ? 'monthly' : 'once', date: type === 'arrangement' ? document.querySelector('#work-date').value : '', scheduleDays, dayOfMonth: scheduleDays[0] || null, time: document.querySelector('#work-time').value, priority: document.querySelector('input[name="work-priority"]:checked')?.value || 'medium', done: existing?.done || false, doneDates: existing?.doneDates || [] };
  if (existing) Object.assign(existing, item); else state.workItems.unshift(item);
  state.workDaysDraft = [];
  persist(); showToast(existing ? '工作安排已更新' : '工作安排已创建'); render();
}

function toggleWorkHistory(id, date) {
  const item = state.workItems.find(entry => entry.id === id);
  if (!item || !date) return;
  if (item.schedule === 'monthly') {
    const doneDates = Array.isArray(item.doneDates) ? item.doneDates : [];
    item.doneDates = doneDates.includes(date) ? doneDates.filter(entry => entry !== date) : [...doneDates, date];
  } else {
    item.done = !item.done;
    item.completedAt = item.done ? date : '';
  }
  persist();
  showToast(item.done || item.doneDates?.includes(date) ? '逾期工作已完成' : '已撤销完成');
  render();
}
function toggleWorkItem(id) {
  const item = state.workItems.find(entry => entry.id === id);
  if (!item) return;
  if (item.schedule === 'monthly') {
    item.doneDates = Array.isArray(item.doneDates) ? item.doneDates : [];
    item.doneDates = item.doneDates.includes(isoToday) ? item.doneDates.filter(date => date !== isoToday) : [...item.doneDates, isoToday];
  } else item.done = !item.done;
  persist(); showToast(isWorkDoneOnDate(item) ? '工作事项已完成' : '已恢复工作事项'); render();
}

function toggleTask(id) { const task = state.tasks.find(item => item.id === id); if (!task) return; task.done = !task.done; task.completedAt = task.done ? isoToday : ''; persist(); showToast(task.done ? '任务已完成' : '已撤销完成'); render(); }
function snoozeTask(id) { const task = state.tasks.find(item => item.id === id); if (!task) return; task.date = dateOffset(1); task.done = false; persist(); showToast('已安排到明天'); render(); }
function toggleReminder(id) { const reminder = state.reminders.find(item => item.id === id); if (!reminder) return; if (reminderIsMonthly(reminder)) { reminder.doneDates = Array.isArray(reminder.doneDates) ? reminder.doneDates : []; reminder.doneDates = reminder.doneDates.includes(isoToday) ? reminder.doneDates.filter(date => date !== isoToday) : [...reminder.doneDates, isoToday]; } else { reminder.done = !reminder.done; reminder.completedAt = reminder.done ? isoToday : ''; } persist(); showToast(reminderDoneToday(reminder) ? '提醒已完成' : '已恢复提醒'); render(); }
function toggleLearning(id) {
  const item = state.learningItems.find(entry => entry.id === id);
  if (!item || !isLearningDueToday(item)) return;
  item.doneDates = Array.isArray(item.doneDates) ? item.doneDates : [];
  item.doneDates = item.doneDates.includes(isoToday) ? item.doneDates.filter(date => date !== isoToday) : [...item.doneDates, isoToday];
  updateLearningCompleteDate(); persist(); render();
}

function updateLearningCompleteDate() {
  const due = learningDueItems();
  const complete = due.length > 0 && due.every(item => item.doneDates.includes(isoToday));
  state.learningCompleteDates = complete ? Array.from(new Set([...state.learningCompleteDates, isoToday])) : state.learningCompleteDates.filter(date => date !== isoToday);
}

function completeLearningToday() {
  const due = learningDueItems();
  const complete = due.length > 0 && due.every(item => item.doneDates.includes(isoToday));
  due.forEach(item => { item.doneDates = complete ? item.doneDates.filter(date => date !== isoToday) : Array.from(new Set([...item.doneDates, isoToday])); });
  updateLearningCompleteDate(); persist(); showToast(complete ? '已撤销今日学习' : '今日学习已完成'); render();
}

function checkFitness() {
  const due = fitnessDuePlans();
  if (!due.length) { showToast('今天没有安排训练计划'); return; }
  const complete = due.every(isFitnessPlanDoneToday);
  due.forEach(plan => { plan.doneDates = complete ? plan.doneDates.filter(date => date !== isoToday) : Array.from(new Set([...plan.doneDates, isoToday])); });
  const existing = state.fitnessLogs.find(log => log.type === 'session' && log.date === isoToday);
  if (complete && existing) state.fitnessLogs = state.fitnessLogs.filter(log => log !== existing);
  if (!complete && !existing) state.fitnessLogs.push({ id: makeId('session'), type: 'session', date: isoToday, duration: 45 });
  persist(); showToast(complete ? '已撤销今日健身打卡' : '训练已打卡'); render();
}

function toggleFitnessPlan(id) {
  const plan = state.fitnessPlans.find(item => item.id === id);
  if (!plan || !isFitnessPlanDueToday(plan)) return;
  const done = isFitnessPlanDoneToday(plan);
  plan.doneDates = done ? plan.doneDates.filter(date => date !== isoToday) : Array.from(new Set([...plan.doneDates, isoToday]));
  const due = fitnessDuePlans();
  const complete = due.length > 0 && due.every(isFitnessPlanDoneToday);
  const existing = state.fitnessLogs.find(log => log.type === 'session' && log.date === isoToday);
  if (complete && !existing) state.fitnessLogs.push({ id: makeId('session'), type: 'session', date: isoToday, duration: 45 });
  if (!complete && existing) state.fitnessLogs = state.fitnessLogs.filter(log => log !== existing);
  persist(); showToast(done ? '已撤销训练计划打卡' : '训练计划已打卡'); render();
}
function toggleWorkout(id) { const existing = state.fitnessLogs.find(log => log.type === 'workout' && log.workoutId === id && log.date === isoToday); if (existing) state.fitnessLogs = state.fitnessLogs.filter(log => log !== existing); else state.fitnessLogs.push({ id: makeId('workout-log'), type: 'workout', workoutId: id, date: isoToday }); persist(); render(); }

function setFitnessFeeling(feeling) { state.fitnessFeeling = feeling; const session = state.fitnessLogs.find(log => log.type === 'session' && log.date === isoToday); if (session) session.feeling = feeling; persist(); showToast(`已记录：${feeling}`); render(); }
function saveLearningPlan(event) {
  event.preventDefault();
  const title = document.querySelector('#learning-plan-title')?.value.trim();
  if (!title) { showToast('请填写学习项目名称'); return; }
  const scheduleDays = [...new Set(state.learningPlanDaysDraft.map(Number))].sort((a, b) => a - b);
  if (!scheduleDays.length) { showToast('请至少选择一个每月学习日期'); return; }
  const purpose = document.querySelector('#learning-plan-purpose')?.value.trim() || '';
  const goal = document.querySelector('#learning-plan-goal')?.value.trim() || '';
  state.learningItems.unshift({ id: makeId('learning'), title, purpose, goal, content: goal, requirement: purpose, detail: goal || purpose, category: '计划', minutes: Number(document.querySelector('#learning-plan-minutes')?.value) || 30, scheduleMode: 'monthly', scheduleDays, scheduleDates: [], doneDates: [] });
  state.learningPlanDaysDraft = []; state.learningPlanFormOpen = false; persist(); showToast('学习计划已保存'); render();
}
function saveFitnessAction(event) {
  event.preventDefault();
  const title = document.querySelector('#fitness-action-title')?.value.trim();
  if (!title) { showToast('请填写动作名称'); return; }
  const category = document.querySelector('#fitness-action-category')?.value || '自定义';
  state.workouts.unshift({ id: makeId('workout'), title, category, detail: document.querySelector('#fitness-action-detail')?.value.trim() || '' });
  state.fitnessActionFormOpen = false; persist(); showToast('锻炼动作已添加'); render();
}
function saveFitnessPlan(event) {
  event.preventDefault();
  const title = document.querySelector('#fitness-plan-title')?.value.trim();
  if (!title) { showToast('请填写健身计划标题'); return; }
  const mode = document.querySelector('#fitness-schedule-mode')?.value || 'monthly';
  const actionIds = [...document.querySelectorAll('input[name="fitness-action"]:checked')].map(input => input.value);
  if (!actionIds.length) { showToast('请至少选择一个锻炼动作'); return; }
  const dates = (document.querySelector('#fitness-plan-dates-values')?.value || '').split(',').filter(Boolean);
  const scheduleDays = mode === 'monthly' ? [...new Set(state.fitnessPlanDaysDraft.map(Number))].sort((a, b) => a - b) : [];
  if (mode === 'monthly' && !scheduleDays.length) { showToast('请至少选择一个每月健身日期'); return; }
  if (mode === 'dates' && !dates.length) { showToast('请选择至少一个健身日期'); return; }
  const existing = state.fitnessEditingPlanId ? state.fitnessPlans.find(item => item.id === state.fitnessEditingPlanId) : null;
  const item = { id: existing?.id || makeId('fitness-plan'), title, requirement: document.querySelector('#fitness-plan-requirement')?.value.trim() || '', actionIds, scheduleMode: mode, scheduleDays, scheduleDates: mode === 'dates' ? dates : [], doneDates: existing?.doneDates || [], time: existing?.time || '16:00', createdAt: existing?.createdAt || isoToday };
  if (existing) Object.assign(existing, item); else state.fitnessPlans.unshift(item);
  state.fitnessPlanDaysDraft = []; state.fitnessPlanFormOpen = false; state.fitnessEditingPlanId = ''; persist(); showToast(existing ? '健身计划已更新' : '健身计划已保存'); render();
}
function editFitnessPlan(id) {
  const plan = state.fitnessPlans.find(item => item.id === id);
  if (!plan) return;
  state.fitnessEditingPlanId = id;
  state.fitnessPlanDaysDraft = [...(plan.scheduleDays || [])];
  state.fitnessPlanFormOpen = true;
  state.fitnessPlanActionCategoryFilter = '全部';
  state.fitnessActionFormOpen = false;
  renderFitness();
}

function saveNote() { const note = document.querySelector('#learning-note')?.value || ''; state.learningNotes[isoToday] = note; persist(); showToast('学习笔记已保存'); }
function saveJournal() { const textarea = document.querySelector('#journal-textarea'); const text = textarea?.value.trim() || ''; const journalDate = state.journalViewingDate || isoToday; if (journalDate === isoToday) state.journalDraft = text; if (text) state.journals[journalDate] = { text, updatedAt: new Date().toISOString() }; else delete state.journals[journalDate]; persist(); showToast(text ? `${formatCalendarDate(journalDate)}日记已保存` : `${formatCalendarDate(journalDate)}日记已清空`); render(); }
function clearJournal() { showConfirm('清空当前日记？', '这会删除当前编辑中的内容，确认后不可恢复。', () => { const journalDate = state.journalViewingDate || isoToday; if (journalDate === isoToday) state.journalDraft = ''; delete state.journals[journalDate]; persist(); render(); }, true); }
function checkDueReminders() {
  if (!state.settings.notifications) return;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const reminderWindow = Number(state.timelineReminderMinutes || 0);
  const events = [
    ...state.tasks.filter(task => isToday(task.date)).map(task => ({ id: task.id, title: task.title, time: task.time, done: task.done, type: 'task' })),
    ...state.reminders.filter(isLifeItemDueToday).flatMap(reminder => { const times = reminderTimes(reminder); return (times.length ? times : ['']).map((time, index) => ({ id: `${reminder.id}-${index}`, title: reminder.title, time, done: reminderDoneToday(reminder), type: 'reminder' })); }),
  ];
  const due = events.find(item => {
    if (item.done || !/^\d{2}:\d{2}$/.test(item.time || '')) return false;
    const start = timeValue(item.time);
    const diff = start - currentMinutes;
    return (reminderWindow > 0 && diff >= 0 && diff <= reminderWindow) || diff === 0;
  });
  if (!due) return;
  const reminderKey = `luxing-timeline-reminder-${isoToday}-${due.type}-${due.id}-${due.time}-${reminderWindow}`;
  if (sessionStorage.getItem(reminderKey)) return;
  sessionStorage.setItem(reminderKey, '1');
  showToast(`${due.type === 'task' ? '任务' : '提醒'}：${due.title}${reminderWindow && timeValue(due.time) > currentMinutes ? ` · ${reminderWindow} 分钟后` : ''}`);
}

function toggleNews(action, id) { const item = state.news.find(entry => entry.id === id); if (!item) return; if (action === 'save') { item.saved = !item.saved; showToast(item.saved ? '新闻已收藏' : '已取消收藏'); } if (action === 'capture') { if (!item.captured) { state.inbox.unshift({ id: makeId('inbox'), text: `${item.title}（${item.source}）`, time: '刚刚', tag: '新闻', status: 'pending', createdAt: new Date().toISOString() }); item.captured = true; showToast('新闻已放入收集箱'); } else showToast('这条新闻已经在收集箱'); } persist(); render(); }

function toggleInboxSelection(id) { state.selectedInboxIds = state.selectedInboxIds.includes(id) ? state.selectedInboxIds.filter(item => item !== id) : [...state.selectedInboxIds, id]; renderInbox(); updateSyncStatus(); }
function runBatchAction(type) { const ids = [...state.selectedInboxIds]; if (!ids.length) { showToast('请先选择至少一条内容'); return; } const actionText = '删除'; showConfirm(`确认${actionText}？`, `将对选中的 ${ids.length} 条内容执行“${actionText}”。`, () => { if (type === 'delete') state.inbox = state.inbox.filter(item => !ids.includes(item.id)); state.selectedInboxIds = []; state.inboxSelecting = false; persist(); showToast(`已${actionText}`); render(); }, type === 'delete'); }
function archiveInbox(id) { const item = state.inbox.find(entry => entry.id === id); if (!item) return; showConfirm('归档这条内容？', '归档后它会从待整理列表中隐藏，但不会被删除。', () => { item.status = 'archived'; persist(); showToast('已归档'); render(); }); }
function convertInbox(id) { const item = state.inbox.find(entry => entry.id === id); if (!item) return; showConfirm('转为今日待办？', '这条想法会变成今天的一个待办事项。', () => { state.tasks.unshift({ id: makeId('task'), title: item.text, meta: '来自收集箱 · 新建任务', priority: 'medium', done: false, date: isoToday, time: '' }); item.status = 'converted'; persist(); showToast('已转为今日待办'); render(); }); }

function exportData() { const blob = new Blob([JSON.stringify({ app: '律行', version: APP_VERSION, exportedAt: new Date().toISOString(), data: dataSnapshot() }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `律行-数据-${isoToday}.json`; link.click(); URL.revokeObjectURL(url); showToast('数据已导出'); }
function importData() { document.querySelector('#import-file')?.click(); }
function resetData() { showConfirm('恢复示例数据？', '当前浏览器里的任务、日记、学习和健身记录会被替换。建议先导出数据。', () => { state = defaultState(); lastTrackedSnapshot = trackableSnapshot(); persist(false); showToast('已恢复示例数据'); render(); }, true); }

function handleClick(event) {
  const pageButton = event.target.closest('[data-page]');
  if (pageButton) { state.page = pageButton.dataset.page; if (state.page === 'learn') state.learnTab = 'learning'; if (state.page === 'fitness') { state.fitnessRecordMonth = monthKey(); state.fitnessRecordMonthManual = false; state.fitnessHistoryMonthsOpen = false; } render(); return; }
  const learnTab = event.target.closest('[data-learn-tab]');
  if (learnTab) { state.page = 'learn'; state.learnTab = learnTab.dataset.learnTab; render(); return; }
  const planFilter = event.target.closest('[data-plan-filter]');
  if (planFilter) { state.planFilter = planFilter.dataset.planFilter; render(); return; }
  const inboxSelect = event.target.closest('[data-inbox-select]');
  if (inboxSelect) { toggleInboxSelection(inboxSelect.dataset.inboxSelect); return; }
  const batch = event.target.closest('[data-batch-action]');
  if (batch) { runBatchAction(batch.dataset.batchAction); return; }
  const closeInline = event.target.closest('[data-close-inline-modal]');
  if (closeInline) { state.learningPlanFormOpen = false; state.learningTempFormOpen = false; state.fitnessPlanFormOpen = false; state.fitnessActionFormOpen = false; state.fitnessEditingPlanId = ''; state.learningPlanDaysDraft = []; state.fitnessPlanDaysDraft = []; render(); return; }
  const learningTempToggle = event.target.closest('[data-toggle-learning-temp]');
  if (learningTempToggle) { state.learningTempFormOpen = true; state.learningPlanFormOpen = false; renderLearn(); return; }
  const addCategory = event.target.closest('[data-add-fitness-category]');
  if (addCategory) { const input = document.querySelector('#fitness-new-category'); const category = input?.value.trim(); if (!category) { showToast('请输入分类名称'); return; } if (!state.workoutCategories.includes(category)) state.workoutCategories.push(category); if (input) input.value = ''; persist(); renderFitness(); showToast('分类已添加'); return; }
  const deleteCategory = event.target.closest('[data-delete-fitness-category]');
  if (deleteCategory) { const select = document.querySelector('#fitness-action-category'); const category = select?.value; if (!category || state.workoutCategories.length <= 1) { showToast('至少保留一个动作分类'); return; } state.workoutCategories = state.workoutCategories.filter(item => item !== category); const fallbackCategory = state.workoutCategories[0] || '自定义'; state.workouts.forEach(action => { if (action.category === category) action.category = fallbackCategory; }); if (state.fitnessActionCategoryFilter === category) state.fitnessActionCategoryFilter = '全部'; persist(); renderFitness(); showToast('分类已删除'); return; }
  const lifeTimeAdd = event.target.closest('[data-life-time-add]');
  if (lifeTimeAdd) {
    const input = document.querySelector('#life-reminder-time-input');
    if (!input?.value) { showToast('请选择一个时间后再添加'); return; }
    state.lifeReminderTimesDraft = [...new Set([...(state.lifeReminderTimesDraft || []), input.value])].sort();
    input.value = '';
    renderLifeReminderTimes();
    return;
  }
  const lifeTimeRemove = event.target.closest('[data-life-time-remove]');
  if (lifeTimeRemove) { state.lifeReminderTimesDraft = (state.lifeReminderTimesDraft || []).filter(time => time !== lifeTimeRemove.dataset.lifeTimeRemove); renderLifeReminderTimes(); return; }
  const lifeMode = event.target.closest('[data-life-reminder-mode]');
  if (lifeMode) { state.lifeReminderModeDraft = lifeMode.dataset.lifeReminderMode === 'monthly' ? 'monthly' : 'once'; const mode = document.querySelector('#life-reminder-mode'); if (mode) mode.value = state.lifeReminderModeDraft; syncLifeReminderFormFields(); return; }
  const lifeDay = event.target.closest('[data-life-reminder-day]');
  if (lifeDay) { const day = Number(lifeDay.dataset.lifeReminderDay); state.lifeReminderDaysDraft = state.lifeReminderDaysDraft.includes(day) ? state.lifeReminderDaysDraft.filter(item => item !== day) : [...state.lifeReminderDaysDraft, day].sort((a, b) => a - b); lifeDay.classList.toggle('selected', state.lifeReminderDaysDraft.includes(day)); lifeDay.setAttribute('aria-pressed', String(state.lifeReminderDaysDraft.includes(day))); return; }
  const deleteLifeHistory = event.target.closest('[data-delete-life-history]');
  if (deleteLifeHistory) { const [kind, id] = deleteLifeHistory.dataset.deleteLifeHistory.split(':'); showConfirm('删除这条历史完成记录？', '删除后该事项本身也会从生活列表中移除。', () => { if (kind === 'task') state.tasks = state.tasks.filter(item => item.id !== id); else state.reminders = state.reminders.filter(item => item.id !== id); persist(); render(); }, true); return; }
  const datePickerAdd = event.target.closest('[data-date-picker-add]');
  if (datePickerAdd) {
    const id = datePickerAdd.dataset.datePickerAdd;
    const input = document.querySelector(`#${id}-input`);
    const hidden = document.querySelector(`#${id}-values`);
    if (!input || !hidden || !input.value) { showToast('请选择一个日期后再添加'); return; }
    const dates = hidden.value.split(',').filter(Boolean);
    if (!dates.includes(input.value)) dates.push(input.value);
    dates.sort(); hidden.value = dates.join(','); input.value = '';
    const tags = document.querySelector(`[data-date-picker="${id}"] .date-picker-tags`);
    if (tags) tags.innerHTML = datePickerTags(id, dates);
    return;
  }
  const datePickerRemove = event.target.closest('[data-date-picker-remove]');
  if (datePickerRemove) {
    const id = datePickerRemove.dataset.datePickerRemove;
    const hidden = document.querySelector(`#${id}-values`);
    if (!hidden) return;
    const dates = hidden.value.split(',').filter(date => date && date !== datePickerRemove.dataset.date);
    hidden.value = dates.join(',');
    const tags = document.querySelector(`[data-date-picker="${id}"] .date-picker-tags`);
    if (tags) tags.innerHTML = datePickerTags(id, dates);
    return;
  }
  const learningDay = event.target.closest('[data-learning-day]');
  if (learningDay) { const day = Number(learningDay.dataset.learningDay); state.learningPlanDaysDraft = state.learningPlanDaysDraft.includes(day) ? state.learningPlanDaysDraft.filter(item => item !== day) : [...state.learningPlanDaysDraft, day].sort((a, b) => a - b); learningDay.classList.toggle('selected', state.learningPlanDaysDraft.includes(day)); learningDay.setAttribute('aria-pressed', String(state.learningPlanDaysDraft.includes(day))); return; }
  const fitnessDay = event.target.closest('[data-fitness-day]');
  if (fitnessDay) { const day = Number(fitnessDay.dataset.fitnessDay); state.fitnessPlanDaysDraft = state.fitnessPlanDaysDraft.includes(day) ? state.fitnessPlanDaysDraft.filter(item => item !== day) : [...state.fitnessPlanDaysDraft, day].sort((a, b) => a - b); fitnessDay.classList.toggle('selected', state.fitnessPlanDaysDraft.includes(day)); fitnessDay.setAttribute('aria-pressed', String(state.fitnessPlanDaysDraft.includes(day))); return; }
  const workDay = event.target.closest('[data-work-day]');
  if (workDay) { const day = Number(workDay.dataset.workDay); state.workDaysDraft = state.workDaysDraft.includes(day) ? state.workDaysDraft.filter(item => item !== day) : [...state.workDaysDraft, day].sort((a, b) => a - b); workDay.classList.toggle('selected', state.workDaysDraft.includes(day)); workDay.setAttribute('aria-pressed', String(state.workDaysDraft.includes(day))); return; }
  const workKindButton = event.target.closest('[data-work-kind]');
  if (workKindButton) {
    const kind = workKindButton.dataset.workKind === 'plan' ? 'plan' : 'arrangement';
    const input = document.querySelector('#work-kind');
    if (input) input.value = kind;
    // 新增工作计划从空白日历开始；编辑已有计划时保留已选日期。
    if (kind === 'plan' && !document.querySelector('#work-edit-id')?.value) state.workDaysDraft = [];
    syncWorkFormFields();
    if (kind === 'plan') document.querySelectorAll('[data-work-day]').forEach(day => { day.classList.remove('selected'); day.setAttribute('aria-pressed', 'false'); });
    return;
  }
  const fitnessActionCategoryFilter = event.target.closest('[data-fitness-action-category-filter]');
  if (fitnessActionCategoryFilter) {
    state.fitnessActionCategoryFilter = fitnessActionCategoryFilter.dataset.fitnessActionCategoryFilter || '全部';
    persist();
    renderFitness();
    return;
  }
  const fitnessPlanCategoryFilter = event.target.closest('[data-fitness-plan-action-category-filter]');
  if (fitnessPlanCategoryFilter) {
    state.fitnessPlanActionCategoryFilter = fitnessPlanCategoryFilter.dataset.fitnessPlanActionCategoryFilter || '全部';
    document.querySelectorAll('[data-fitness-plan-action-category-filter]').forEach(button => { const active = button.dataset.fitnessPlanActionCategoryFilter === state.fitnessPlanActionCategoryFilter; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    document.querySelectorAll('[data-fitness-plan-action-category]').forEach(row => { row.hidden = state.fitnessPlanActionCategoryFilter !== '全部' && row.dataset.fitnessPlanActionCategory !== state.fitnessPlanActionCategoryFilter; });
    return;
  }
  const fitnessScheduleModeButton = event.target.closest('[data-fitness-schedule-mode]');
  if (fitnessScheduleModeButton) {
    const mode = ['daily', 'monthly', 'dates'].includes(fitnessScheduleModeButton.dataset.fitnessScheduleMode) ? fitnessScheduleModeButton.dataset.fitnessScheduleMode : 'monthly';
    const input = document.querySelector('#fitness-schedule-mode');
    if (input) input.value = mode;
    document.querySelectorAll('[data-fitness-schedule-mode]').forEach(button => { const active = button.dataset.fitnessScheduleMode === mode; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    const field = document.querySelector('#fitness-days-field');
    const datesField = document.querySelector('#fitness-specific-dates-field');
    if (field) field.hidden = mode !== 'monthly';
    if (datesField) datesField.hidden = mode !== 'dates';
    return;
  }
  const learningPlanToggle = event.target.closest('[data-toggle-learning-form]');
  if (learningPlanToggle) { state.learningPlanFormOpen = !state.learningPlanFormOpen; state.learningTempFormOpen = false; renderLearn(); return; }
  const fitnessHistoryToggle = event.target.closest('[data-fitness-history-toggle]');
  if (fitnessHistoryToggle) { state.fitnessHistoryMonthsOpen = !state.fitnessHistoryMonthsOpen; renderFitness(); return; }
  const fitnessRecordMonth = event.target.closest('[data-fitness-record-month]');
  if (fitnessRecordMonth) { state.fitnessRecordMonth = fitnessRecordMonth.dataset.fitnessRecordMonth; state.fitnessRecordMonthManual = true; state.fitnessHistoryMonthsOpen = false; renderFitness(); return; }
  const fitnessPlanToggle = event.target.closest('[data-toggle-fitness-plan-form]');
  if (fitnessPlanToggle) { state.fitnessPlanFormOpen = !state.fitnessPlanFormOpen; state.fitnessEditingPlanId = ''; state.fitnessPlanDaysDraft = []; state.fitnessPlanActionCategoryFilter = '全部'; state.fitnessActionFormOpen = false; renderFitness(); return; }
  const fitnessActionToggle = event.target.closest('[data-toggle-fitness-action-form]');
  if (fitnessActionToggle) { state.fitnessActionFormOpen = !state.fitnessActionFormOpen; state.fitnessPlanFormOpen = false; state.fitnessEditingPlanId = ''; renderFitness(); return; }
  const editFitnessPlanButton = event.target.closest('[data-edit-fitness-plan]');
  if (editFitnessPlanButton) { editFitnessPlan(editFitnessPlanButton.dataset.editFitnessPlan); return; }
  const fitnessPlanCheck = event.target.closest('[data-fitness-plan-toggle]');
  if (fitnessPlanCheck) { toggleFitnessPlan(fitnessPlanCheck.dataset.fitnessPlanToggle); return; }
  const deleteFitnessPlan = event.target.closest('[data-delete-fitness-plan]');
  if (deleteFitnessPlan) { showConfirm('删除这个健身计划？', '删除后该计划的打卡记录也会一并移除。', () => { state.fitnessPlans = state.fitnessPlans.filter(item => item.id !== deleteFitnessPlan.dataset.deleteFitnessPlan); persist(); render(); }, true); return; }
  const taskToggle = event.target.closest('[data-task-toggle]');
  if (taskToggle) { toggleTask(taskToggle.dataset.taskToggle); return; }
  const taskSnooze = event.target.closest('[data-task-snooze]');
  if (taskSnooze) { snoozeTask(taskSnooze.dataset.taskSnooze); return; }
  const taskEdit = event.target.closest('[data-edit-task]');
  if (taskEdit) { openModal('task', taskEdit.dataset.editTask); return; }
  const taskDelete = event.target.closest('[data-delete-task]');
  if (taskDelete) { showConfirm('删除这个任务？', '删除后无法从列表恢复。', () => { state.tasks = state.tasks.filter(task => task.id !== taskDelete.dataset.deleteTask); persist(); render(); }, true); return; }
  const workHistoryToggle = event.target.closest('[data-work-history-toggle]');
  if (workHistoryToggle) { toggleWorkHistory(workHistoryToggle.dataset.workHistoryToggle, workHistoryToggle.dataset.workHistoryDate); return; }
  const workToggle = event.target.closest('[data-work-toggle]');
  if (workToggle) { toggleWorkItem(workToggle.dataset.workToggle); return; }
  const workEdit = event.target.closest('[data-edit-work]');
  if (workEdit) { editWorkItem(workEdit.dataset.editWork); return; }
  const workDelete = event.target.closest('[data-delete-work]');
  if (workDelete) { showConfirm('删除这个工作安排？', '删除后周期规则和完成记录都会一起删除。', () => { state.workItems = state.workItems.filter(item => item.id !== workDelete.dataset.deleteWork); persist(); render(); }, true); return; }
  const reminderSnooze = event.target.closest('[data-reminder-snooze]');
  if (reminderSnooze) { snoozeReminder(reminderSnooze.dataset.reminderSnooze); return; }
  const reminderEdit = event.target.closest('[data-edit-reminder]');
  if (reminderEdit) { openLifeReminderModal(reminderEdit.dataset.editReminder); return; }
  const reminderDelete = event.target.closest('[data-delete-reminder]');
  if (reminderDelete) { showConfirm('删除这个生活提醒？', '删除后提醒时间和完成记录都会一起移除。', () => { state.reminders = state.reminders.filter(item => item.id !== reminderDelete.dataset.deleteReminder); persist(); render(); }, true); return; }
  const reminderToggle = event.target.closest('[data-reminder-toggle]');
  if (reminderToggle) { toggleReminder(reminderToggle.dataset.reminderToggle); return; }
  const learningToggle = event.target.closest('[data-learning-toggle]');
  if (learningToggle) { toggleLearning(learningToggle.dataset.learningToggle); return; }
  const deleteLearning = event.target.closest('[data-delete-learning]');
  if (deleteLearning) { showConfirm('删除这项学习内容？', '历史完成记录也会一起删除。', () => { state.learningItems = state.learningItems.filter(item => item.id !== deleteLearning.dataset.deleteLearning); updateLearningCompleteDate(); persist(); render(); }, true); return; }
  const workoutToggle = event.target.closest('[data-workout-toggle]');
  if (workoutToggle) { toggleWorkout(workoutToggle.dataset.workoutToggle); return; }
  const deleteWorkout = event.target.closest('[data-delete-workout]');
  if (deleteWorkout) { showConfirm('删除这个训练动作？', '删除后不会影响已经完成的训练记录，但会从尚未完成的健身计划中移除。', () => { const workoutId = deleteWorkout.dataset.deleteWorkout; state.workouts = state.workouts.filter(item => item.id !== workoutId); state.fitnessPlans.forEach(plan => { plan.actionIds = (plan.actionIds || []).filter(id => id !== workoutId); }); persist(); render(); }, true); return; }
  const editInbox = event.target.closest('[data-edit-inbox]');
  if (editInbox) { editInboxIdea(editInbox.dataset.editInbox); return; }
  const completeInbox = event.target.closest('[data-complete-inbox]');
  if (completeInbox) { const item = state.inbox.find(entry => entry.id === completeInbox.dataset.completeInbox); if (item) { item.status = item.status === 'done' ? 'pending' : 'done'; persist(); showToast(item.status === 'done' ? '想法已完成' : '已恢复到待整理'); render(); } return; }
  const deleteInbox = event.target.closest('[data-delete-inbox]');
  if (deleteInbox) { showConfirm('删除这条想法？', '删除后无法从收集列表恢复。', () => { state.inbox = state.inbox.filter(item => item.id !== deleteInbox.dataset.deleteInbox); if (state.inboxEditingId === deleteInbox.dataset.deleteInbox) state.inboxEditingId = ''; persist(); render(); }, true); return; }
  const cancelInboxEdit = event.target.closest('[data-cancel-inbox-edit]');
  if (cancelInboxEdit) { state.inboxEditingId = ''; renderInbox(); return; }
  const inboxAction = event.target.closest('[data-inbox-action]');
  if (inboxAction) { if (inboxAction.dataset.inboxAction === 'archive') archiveInbox(inboxAction.dataset.id); else convertInbox(inboxAction.dataset.id); return; }
  const newsAction = event.target.closest('[data-news-toggle]');
  if (newsAction) { toggleNews(newsAction.dataset.newsToggle, newsAction.dataset.id); return; }
  const deleteQuote = event.target.closest('[data-delete-quote]');
  if (deleteQuote) { const quote = state.quotes.find(item => item.id === deleteQuote.dataset.deleteQuote); if (!quote) return; showConfirm('删除这条语录？', '删除后它不会再出现在今日名言和语录库中。', () => { state.quotes = state.quotes.filter(item => item.id !== quote.id); if (state.fixedQuoteId === quote.id) state.fixedQuoteId = state.quotes[0]?.id || null; if (state.todayQuoteId === quote.id) state.todayQuoteId = ''; persist(); renderQuoteLibrary(); render(); showToast('语录已删除'); }, true); return; }
  const history = event.target.closest('[data-journal-history]');
  if (history) { state.journalViewingDate = history.dataset.journalHistory; state.journalDraft = state.journals[isoToday]?.text || ''; render(); return; }
  const journalBack = event.target.closest('[data-action="journal-back"]');
  if (journalBack) { state.journalViewingDate = isoToday; render(); return; }
  const feeling = event.target.closest('[data-feeling]');
  if (feeling) { setFitnessFeeling(feeling.dataset.feeling); return; }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'journal') { state.page = 'journal'; state.journalViewingDate = isoToday; render(); return; }
  if (action === 'news') { state.page = 'learn'; state.learnTab = 'news'; render(); return; }
  if (action === 'learn') { state.page = 'learn'; state.learnTab = 'learning'; render(); return; }
  if (action === 'fitness') { state.page = 'fitness'; render(); return; }
  if (action === 'work') { state.page = 'work'; render(); return; }
  if (action === 'plan') { state.page = 'plan'; render(); return; }
  if (action === 'inbox') { state.page = 'inbox'; render(); return; }
  if (action === 'settings') { state.page = 'settings'; render(); return; }
  if (action === 'account') { state.page = 'account'; render(); return; }
  if (action === 'sync-generate') {
    state.sync.code = makeSyncCode();
    persist(false);
    showToast('同步码已生成，正在把本机数据推送到云端…');
    render();
    runSync();
    return;
  }
  if (action === 'sync-join') {
    const input = document.querySelector('#sync-code-input');
    const value = (input ? input.value : '').trim();
    if (value.length < 24) { showToast('同步码看起来不对，请确认复制完整'); return; }
    state.sync.code = value;
    persist(false);
    showToast('已连接，正在合并两端数据…');
    render();
    runSync();
    return;
  }
  if (action === 'sync-copy') {
    const value = state.sync.code || '';
    const done = () => showToast('同步码已复制，去另一台设备粘贴');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(() => {
        const input = document.querySelector('#sync-code-value');
        if (input) { input.select(); document.execCommand && document.execCommand('copy'); }
        showToast('已选中同步码，请手动复制');
      });
    } else {
      const input = document.querySelector('#sync-code-value');
      if (input) input.select();
      showToast('已选中同步码，请手动复制');
    }
    return;
  }
  if (action === 'sync-now') { showToast('正在同步…'); runSync(); return; }
  if (action === 'sync-disable') {
    showConfirm('关闭同步？', '只是停止同步，本机和云端已有的数据都不会被删除。再次填入同一串同步码就能恢复。', () => {
      state.sync.code = '';
      state.sync.lastSyncedAt = '';
      state.sync.lastError = '';
      syncState = 'idle';
      persist(false);
      render();
      showToast('已关闭同步');
    }, true);
    return;
  }
  if (action === 'pick-avatar') { pickAvatar(); return; }
  if (action === 'sign-out') { showConfirm('退出登录？', '当前还没有接入账号后端，所以这里不会清除本机数据。接入后点击会回到登录页。', () => { showToast('账号系统接入后即可正式退出登录'); }, false); return; }
  if (action === 'select-inbox') { state.inboxSelecting = true; state.selectedInboxIds = []; render(); return; }
  if (action === 'cancel-select') { state.inboxSelecting = false; state.selectedInboxIds = []; render(); return; }
  if (action === 'start-learning') { completeLearningToday(); return; }
  if (action === 'check-fitness') { checkFitness(); return; }
  if (action === 'fitness-feeling') { setFitnessFeeling(feeling?.dataset.feeling || '正常'); return; }
  if (action === 'save-note') { saveNote(); return; }
  if (action === 'save-journal') { saveJournal(); return; }
  if (action === 'clear-journal') { clearJournal(); return; }
  if (action === 'open-life-reminder') { openLifeReminderModal(); return; }
  if (action === 'open-reminder') { openModal('reminder'); return; }
  if (action === 'export') { exportData(); return; }
  if (action === 'import') { importData(); return; }
  if (action === 'reset-data') { resetData(); return; }
  if (action === 'refresh-news') { showToast('新闻列表已刷新（当前为示例数据）'); return; }
  if (action === 'learning-history') { state.learningHistoryOpen = !state.learningHistoryOpen; renderLearn(); return; }
  if (action === 'inbox-help') { showToast('选择后可以批量放进计划、归档或删除'); return; }
  if (action === 'quote-library') { openQuoteLibrary(); return; }
  if (action === 'cycle-timeline-reminder') { cycleTimelineReminder(); return; }
  if (action === 'focus-work-form') { document.querySelector('#work-title')?.focus(); return; }
  if (event.target.closest('[data-open-modal]')) { openModal(event.target.closest('[data-open-modal]').dataset.openModal || 'task'); return; }
  if (event.target.closest('[data-close-modal]')) { closeModal(); return; }
  if (event.target.closest('[data-close-life-reminder]')) { closeLifeReminderModal(); return; }
  if (event.target.closest('[data-close-confirm]')) { closeConfirm(); }
}

document.addEventListener('click', handleClick);
document.addEventListener('change', event => {
  if (event.target.matches('[data-plan-date]')) { state.planDateFilter = event.target.value; render(); return; }
  if (event.target.matches('[data-quote-mode]')) { state.quoteMode = event.target.value; if (state.quoteMode === 'fixed' && !state.quotes.some(quote => quote.id === state.fixedQuoteId)) state.fixedQuoteId = state.quotes[0]?.id || null; state.todayQuoteDate = ''; persist(); renderQuoteLibrary(); render(); return; }
  if (event.target.matches('[data-fixed-quote]')) { state.fixedQuoteId = event.target.value; state.quoteMode = 'fixed'; state.todayQuoteDate = ''; persist(); renderQuoteLibrary(); render(); return; }
  if (event.target.matches('#learning-schedule-mode')) { const field = document.querySelector('#learning-days-field'); const datesField = document.querySelector('#learning-specific-dates-field'); if (field) field.hidden = event.target.value !== 'monthly'; if (datesField) datesField.hidden = event.target.value !== 'dates'; return; }
  if (event.target.matches('#fitness-schedule-mode')) { const field = document.querySelector('#fitness-days-field'); const datesField = document.querySelector('#fitness-specific-dates-field'); if (field) field.hidden = event.target.value !== 'monthly'; if (datesField) datesField.hidden = event.target.value !== 'dates'; return; }
  if (event.target.matches('#fitness-plan-action-filter')) {
    state.fitnessPlanActionCategoryFilter = event.target.value;
    document.querySelectorAll('[data-fitness-plan-action-category]').forEach(row => { row.hidden = state.fitnessPlanActionCategoryFilter !== '全部' && row.dataset.fitnessPlanActionCategory !== state.fitnessPlanActionCategoryFilter; });
    return;
  }
  if (event.target.matches('#fitness-action-filter')) { state.fitnessActionCategoryFilter = event.target.value; persist(); renderFitness(); return; }
  if (event.target.matches('[data-setting]')) { const key = event.target.dataset.setting; state.settings[key] = event.target.type === 'checkbox' ? event.target.checked : event.target.value; persist(); showToast('设置已保存'); return; }
  if (event.target.matches('#account-nickname')) {
    const value = event.target.value.trim().slice(0, 12) || '林';
    state.account.nickname = value;
    event.target.value = value;
    persist();
    syncAccountChrome();
    showToast('昵称已保存');
    return;
  }
  if (event.target.matches('#account-phone')) {
    const value = event.target.value.replace(/\D/g, '').slice(0, 11);
    state.account.phone = value;
    event.target.value = value;
    persist();
    showToast(value ? '手机号已保存' : '已清空手机号');
    return;
  }
  if (event.target.matches('#account-avatar-input')) {
    const file = event.target.files?.[0];
    event.target.value = '';
    handleAvatarFile(file);
    return;
  }
  if (event.target.matches('#import-file')) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const parsed = JSON.parse(reader.result); state = mergeState(parsed.data || parsed); lastTrackedSnapshot = trackableSnapshot(); persist(false); showToast('数据已导入'); render(); } catch (error) { showToast('导入失败，请选择律行 JSON 文件'); } }; reader.readAsText(file); }
});
document.addEventListener('input', event => {
  if (event.target.matches('#inbox-search')) { state.inboxSearch = event.target.value; document.querySelectorAll('[data-inbox-row]').forEach(row => { row.hidden = !row.dataset.search.toLowerCase().includes(state.inboxSearch.toLowerCase()); }); return; }
  if (event.target.matches('#journal-textarea')) { state.journalDraft = event.target.value; persist(false); const counter = document.querySelector('#journal-word-count'); if (counter) counter.textContent = event.target.value.length; return; }
  if (event.target.matches('#global-search')) { state.globalSearch = event.target.value; return; }
});
document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); globalSearch?.focus(); } if (event.key === 'Enter' && event.target.matches('#global-search')) { state.page = 'search'; render(); } if (event.key === 'Escape') { closeModal(); closeLifeReminderModal(); closeConfirm(); closeQuoteLibrary(); } });
document.querySelector('#floating-add')?.addEventListener('click', () => openModal('task'));
document.querySelector('#quick-add-form')?.addEventListener('submit', saveModalForm);
document.addEventListener('submit', event => { if (event.target.matches('#life-reminder-form')) saveLifeReminderForm(event); if (event.target.matches('#work-form')) saveWorkForm(event); if (event.target.matches('#learning-plan-form')) saveLearningPlan(event); if (event.target.matches('#fitness-plan-form')) saveFitnessPlan(event); if (event.target.matches('#fitness-action-form')) saveFitnessAction(event); if (event.target.matches('#inbox-add-form')) saveInboxIdea(event); if (event.target.matches('#learning-temp-form')) saveLearningTemp(event); });
document.addEventListener('click', event => { if (event.target.matches('#work-cancel-edit')) { resetWorkForm(); } if (event.target.matches('.inline-modal')) { state.learningPlanFormOpen = false; state.learningTempFormOpen = false; state.fitnessPlanFormOpen = false; state.fitnessActionFormOpen = false; state.fitnessEditingPlanId = ''; render(); } });
document.querySelector('#confirm-action')?.addEventListener('click', () => { const callback = pendingConfirmation; closeConfirm(); if (callback) callback(); });
quoteForm?.addEventListener('submit', event => { event.preventDefault(); const text = quoteText.value.trim(); const author = quoteAuthor.value.trim(); if (!text || !author) return; state.quotes.unshift({ id: makeId('quote'), text, author, category: quoteCategory.value }); state.todayQuoteDate = ''; persist(); quoteForm.reset(); renderQuoteLibrary(); render(); openQuoteLibrary(); showToast('语录已加入库中'); });
quoteModal?.addEventListener('click', event => { if (event.target === quoteModal || event.target.closest('[data-close-quote]')) closeQuoteLibrary(); });
document.querySelectorAll('.quick-type').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.quick-type').forEach(item => item.classList.remove('selected')); button.classList.add('selected'); syncQuickFields(); }));
document.querySelector('#quick-add-modal')?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
lifeReminderModal?.addEventListener('click', event => { if (event.target === lifeReminderModal) closeLifeReminderModal(); });
document.querySelector('#confirm-modal')?.addEventListener('click', event => { if (event.target === confirmModal) closeConfirm(); });
document.querySelector('.notification-button')?.addEventListener('click', () => showToast(state.settings.notifications ? `${state.reminders.filter(item => isLifeItemDueToday(item) && !reminderDoneToday(item)).length} 个提醒待处理` : '浏览器提醒已关闭'));

render();
checkDueReminders();
window.setInterval(checkDueReminders, 30000);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?build=20260922-round-19').catch(() => {}));

/* ---------- 同步触发时机 ----------
 * 1) 启动后延迟同步一次（不阻塞首屏渲染）
 * 2) 回到前台 / 标签页重新可见时同步（手机从后台切回来最常见的场景）
 * 3) 网络恢复时同步
 * 4) 每次数据变更后由 persist() 防抖触发（见 scheduleSync）
 */
if (syncReady()) {
  window.setTimeout(() => runSync(), 1500);
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') runSync(); });
window.addEventListener('focus', () => runSync());
window.addEventListener('online', () => runSync());
window.addEventListener('offline', () => setSyncState('offline'));
