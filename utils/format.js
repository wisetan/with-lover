/**
 * 格式化工具函数
 */

/**
 * 格式化日期
 * @param {Date|Number|String} date - 日期对象、时间戳或日期字符串
 * @param {String} format - 格式化字符串，如 'YYYY-MM-DD HH:mm:ss'
 * @returns {String} 格式化后的日期字符串
 */
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 格式化相对时间（如：3分钟前、昨天、2天前）
 * @param {Date|Number|String} date - 日期对象、时间戳或日期字符串
 * @returns {String} 相对时间字符串
 */
const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) {
    return formatDate(date, 'YYYY-MM-DD');
  } else if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return '刚刚';
  }
};

/**
 * 格式化金额
 * @param {Number} amount - 金额（分）
 * @param {Boolean} showSymbol - 是否显示符号
 * @returns {String} 格式化后的金额字符串
 */
const formatAmount = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined) return '0.00';
  
  const yuan = (amount / 100).toFixed(2);
  return showSymbol ? `¥${yuan}` : yuan;
};

/**
 * 格式化距离
 * @param {Number} distance - 距离（米）
 * @returns {String} 格式化后的距离字符串
 */
const formatDistance = (distance) => {
  if (!distance || distance < 0) return '';
  
  if (distance < 1000) {
    return `${distance}米`;
  } else {
    return `${(distance / 1000).toFixed(1)}公里`;
  }
};

/**
 * 格式化手机号（隐藏中间4位）
 * @param {String} phone - 手机号
 * @returns {String} 格式化后的手机号
 */
const formatPhone = (phone) => {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

/**
 * 格式化订单状态文本
 * @param {String} status - 订单状态
 * @returns {String} 状态文本
 */
const formatOrderStatus = (status) => {
  const statusMap = {
    'browsing': '浏览中',
    'consulting': '咨询中',
    'pending_payment': '待付定金',
    'confirmed': '已确认',
    'in_service': '服务中',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  
  return statusMap[status] || status;
};

/**
 * 获取订单状态颜色
 * @param {String} status - 订单状态
 * @returns {String} 颜色值
 */
const getOrderStatusColor = (status) => {
  const colorMap = {
    'pending': '#FA8C16',     // 待接单 - 橙色
    'confirmed': '#1890FF',   // 已确认 - 蓝色
    'in_service': '#52C41A',  // 服务中 - 绿色
    'completed': '#8C8C8C',   // 已完成 - 灰色
    'cancelled': '#FF4D4F'    // 已取消 - 红色
  };
  
  return colorMap[status] || '#8C8C8C';
};

/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
const debounce = (fn, delay = 300) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

/**
 * 节流函数
 * @param {Function} fn - 要节流的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
const throttle = (fn, delay = 300) => {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
};

module.exports = {
  formatDate,
  formatRelativeTime,
  formatAmount,
  formatDistance,
  formatPhone,
  formatOrderStatus,
  getOrderStatusColor,
  debounce,
  throttle
};

