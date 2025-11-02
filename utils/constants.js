/**
 * 常量配置
 */

// 订单状态
const ORDER_STATUS = {
  BROWSING: 'browsing',           // 浏览中
  CONSULTING: 'consulting',        // 咨询中
  PENDING_PAYMENT: 'pending_payment', // 待付定金
  CONFIRMED: 'confirmed',          // 已确认
  IN_SERVICE: 'in_service',        // 服务中
  COMPLETED: 'completed',          // 已完成
  CANCELLED: 'cancelled'           // 已取消
};

// 用户类型
const USER_TYPE = {
  PATIENT: 'patient',      // 患者用户
  COMPANION: 'companion'   // 陪诊师
};

// 服务跟踪步骤类型
const SERVICE_STEP_TYPE = {
  ACCEPTED: 'accepted',        // 已接单
  ARRIVED: 'arrived',          // 已到医院
  REGISTERED: 'registered',    // 挂号完成
  CONSULTING: 'consulting',     // 问诊中
  COMPLETED: 'completed'       // 服务完成
};

// 服务时间段
const SERVICE_TIME_SLOT = {
  MORNING: 'morning',    // 上午
  AFTERNOON: 'afternoon', // 下午
  FULL_DAY: 'full_day'   // 全天
};

// 评价标签
const REVIEW_TAGS = [
  '非常耐心',
  '流程熟悉',
  '服务专业',
  '沟通顺畅',
  '响应及时',
  '态度友好'
];

// 费用相关
const DEPOSIT_AMOUNT = 30; // 保证金金额（元）

// 分页配置
const PAGE_SIZE = 10;

// 云开发环境 ID（需要在 app.js 中配置）
const CLOUD_ENV_ID = 'your-cloud-env-id';

// 数据库集合名称
const DB_COLLECTIONS = {
  USERS: 'users',
  ORDERS: 'orders',
  SERVICE_LOGS: 'service_logs',
  REVIEWS: 'reviews',
  COMPANIONS: 'companions',
  HOSPITALS: 'hospitals'
};

// API 路径
const API_PATHS = {
  // 订单相关
  ORDERS: '/api/orders',
  ORDER_DETAIL: (id) => `/api/orders/${id}`,
  UPDATE_ORDER: (id) => `/api/orders/${id}`,
  
  // 陪诊师相关
  COMPANIONS: '/api/companions',
  COMPANION_DETAIL: (id) => `/api/companions/${id}`,
  UPDATE_COMPANION: (id) => `/api/companions/${id}`,
  
  // 医院相关
  HOSPITALS: '/api/hospitals',
  
  // 评价相关
  REVIEWS: '/api/reviews',
  
  // 服务跟踪相关
  SERVICE_LOGS: '/api/service-logs'
};

// 存储键名
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  USER_TYPE: 'userType',
  OPEN_ID: 'openId'
};

module.exports = {
  ORDER_STATUS,
  USER_TYPE,
  SERVICE_STEP_TYPE,
  SERVICE_TIME_SLOT,
  REVIEW_TAGS,
  DEPOSIT_AMOUNT,
  PAGE_SIZE,
  CLOUD_ENV_ID,
  DB_COLLECTIONS,
  API_PATHS,
  STORAGE_KEYS
};

