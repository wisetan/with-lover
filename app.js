// app.js
App({
  globalData: {
    userInfo: null,
    userType: null, // 'patient' | 'companion'
    openId: null
  },

  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'your-cloud-env-id', // 需要替换为实际的云环境ID
        traceUser: true
      });
    }

    // 获取用户信息
    this.getUserInfo();
  },

  onShow() {
    // 小程序显示时
  },

  onHide() {
    // 小程序隐藏时
  },

  /**
   * 获取用户信息
   */
  async getUserInfo() {
    try {
      const { userInfo } = await this.getUserProfile();
      if (userInfo) {
        this.globalData.userInfo = userInfo;
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }

    // 获取 openId
    try {
      const openId = await this.getOpenId();
      this.globalData.openId = openId;
    } catch (error) {
      console.error('获取 openId 失败:', error);
    }
  },

  /**
   * 获取用户授权信息
   */
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  /**
   * 获取 openId
   */
  getOpenId() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'getOpenId',
        success: (res) => {
          resolve(res.result.openid);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  /**
   * 全局错误处理
   */
  showError(message) {
    wx.showToast({
      title: message || '操作失败',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 全局成功提示
   */
  showSuccess(message) {
    wx.showToast({
      title: message || '操作成功',
      icon: 'success',
      duration: 2000
    });
  }
});

