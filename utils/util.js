/**
 * 通用工具函数
 */

/**
 * 生成唯一 ID
 * @returns {String} 唯一ID
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 深拷贝
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * 判断是否为空值
 * @param {*} value - 要判断的值
 * @returns {Boolean}
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

/**
 * 选择图片
 * @param {Object} options - 配置选项
 * @returns {Promise} 选中的图片信息
 */
const chooseImage = (options = {}) => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count: options.count || 1,
      sizeType: options.sizeType || ['compressed'],
      sourceType: options.sourceType || ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * 预览图片
 * @param {String|Array} urls - 图片URL或URL数组
 * @param {Number} current - 当前显示第几张（从0开始）
 */
const previewImage = (urls, current = 0) => {
  const urlList = Array.isArray(urls) ? urls : [urls];
  wx.previewImage({
    urls: urlList,
    current: urlList[current] || urlList[0]
  });
};

/**
 * 上传图片到云存储
 * @param {String} filePath - 本地文件路径
 * @param {String} cloudPath - 云存储路径
 * @returns {Promise} 上传后的文件ID
 */
const uploadImage = (filePath, cloudPath) => {
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: (res) => {
        resolve(res.fileID);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * 获取位置信息
 * @returns {Promise} 位置信息
 */
const getLocation = () => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * 计算两点之间的距离（米）
 * @param {Number} lat1 - 纬度1
 * @param {Number} lng1 - 经度1
 * @param {Number} lat2 - 纬度2
 * @param {Number} lng2 - 经度2
 * @returns {Number} 距离（米）
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * 页面跳转封装
 * @param {String} url - 跳转路径
 * @param {Object} params - 参数对象
 */
const navigateTo = (url, params = {}) => {
  const query = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  const finalUrl = query ? `${url}?${query}` : url;
  wx.navigateTo({
    url: finalUrl
  });
};

module.exports = {
  generateId,
  deepClone,
  isEmpty,
  chooseImage,
  previewImage,
  uploadImage,
  getLocation,
  calculateDistance,
  navigateTo
};

