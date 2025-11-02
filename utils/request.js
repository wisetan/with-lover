/**
 * 网络请求封装
 * 统一处理请求、响应、错误等
 */

const BASE_URL = 'https://api.example.com'; // 替换为实际API地址

/**
 * Promise 化微信 API
 */
const promisify = (fn) => {
  return (options = {}) => {
    return new Promise((resolve, reject) => {
      fn({
        ...options,
        success: resolve,
        fail: reject
      });
    });
  };
};

/**
 * 网络请求
 * @param {Object} options 请求配置
 * @returns {Promise}
 */
const request = async (options) => {
  const app = getApp();
  
  try {
    // 显示 loading
    if (options.showLoading !== false) {
      wx.showLoading({
        title: options.loadingText || '加载中...',
        mask: true
      });
    }

    // 获取 token
    const token = wx.getStorageSync('token') || '';
    
    // 构建请求参数
    const requestOptions = {
      url: options.url.startsWith('http') ? options.url : `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'content-type': 'application/json',
        'token': token,
        ...options.header
      },
      timeout: options.timeout || 10000
    };

    // 发起请求
    const res = await promisify(wx.request)(requestOptions);

    // 隐藏 loading
    if (options.showLoading !== false) {
      wx.hideLoading();
    }

    // 处理响应
    if (res.statusCode === 200) {
      const { code, data, message } = res.data;
      
      if (code === 200 || code === 0) {
        return data;
      } else {
        // 业务错误
        const errorMsg = message || '请求失败';
        
        // 特殊错误码处理
        if (code === 401) {
          // token 过期，跳转登录
          wx.removeStorageSync('token');
          wx.navigateTo({
            url: '/pages/login/login'
          });
          throw new Error('登录已过期，请重新登录');
        }
        
        // 显示错误提示
        if (options.showError !== false) {
          app.showError(errorMsg);
        }
        
        throw new Error(errorMsg);
      }
    } else {
      // HTTP 错误
      throw new Error(`网络错误: ${res.statusCode}`);
    }
  } catch (error) {
    // 隐藏 loading
    if (options.showLoading !== false) {
      wx.hideLoading();
    }

    console.error('请求失败:', error);
    
    // 显示错误提示
    if (options.showError !== false) {
      app.showError(error.message || '网络请求失败');
    }
    
    throw error;
  }
};

/**
 * GET 请求
 */
const get = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
};

/**
 * POST 请求
 */
const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
};

/**
 * PUT 请求
 */
const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
};

/**
 * DELETE 请求
 */
const del = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
};

module.exports = {
  request,
  get,
  post,
  put,
  delete: del,
  promisify
};

