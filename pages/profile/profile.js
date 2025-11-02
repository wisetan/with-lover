// pages/profile/profile.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    userType: null, // 'patient' | 'companion'
    menuList: [
      {
        icon: '📋',
        title: '我的订单',
        path: '/pages/order-list/order-list'
      },
      {
        icon: '👤',
        title: '个人资料',
        path: '/pages/profile-edit/profile-edit'
      },
      {
        icon: '💬',
        title: '客服咨询',
        path: ''
      },
      {
        icon: '⚙️',
        title: '设置',
        path: '/pages/settings/settings'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadUserInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    const userType = app.globalData.userType || wx.getStorageSync('userType') || 'patient';

    this.setData({
      userInfo,
      userType
    });

    // 根据用户类型调整菜单
    if (userType === 'companion') {
      this.setData({
        menuList: [
          {
            icon: '📋',
            title: '我的订单',
            path: '/pages/order-list/order-list'
          },
          {
            icon: '🏥',
            title: '陪诊师中心',
            path: '/pages/companion-center/companion-center'
          },
          {
            icon: '👤',
            title: '个人资料',
            path: '/pages/profile-edit/profile-edit'
          },
          {
            icon: '💬',
            title: '客服咨询',
            path: ''
          },
          {
            icon: '⚙️',
            title: '设置',
            path: '/pages/settings/settings'
          }
        ]
      });
    }
  },

  /**
   * 点击菜单项
   */
  onMenuTap(e) {
    const path = e.currentTarget.dataset.path;
    if (!path) {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
      return;
    }

    if (path.includes('order-list')) {
      wx.switchTab({
        url: path
      });
    } else {
      wx.navigateTo({
        url: path
      });
    }
  },

  /**
   * 切换用户类型（仅用于测试）
   */
  switchUserType() {
    wx.showActionSheet({
      itemList: ['患者模式', '陪诊师模式'],
      success: (res) => {
        const userType = res.tapIndex === 0 ? 'patient' : 'companion';
        wx.setStorageSync('userType', userType);
        const app = getApp();
        app.globalData.userType = userType;
        this.loadUserInfo();
      }
    });
  }
});

