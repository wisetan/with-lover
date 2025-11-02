// pages/companion-center/companion-center.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    companionInfo: null,
    orderStats: {
      today: 0,
      week: 0,
      month: 0,
      total: 0
    },
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadCompanionInfo();
    this.loadOrderStats();
  },

  /**
   * 加载陪诊师信息
   */
  async loadCompanionInfo() {
    this.setData({ loading: true });
    try {
      const app = getApp();
      const openId = app.globalData.openId;
      
      if (!openId) {
        const openIdResult = await wx.cloud.callFunction({
          name: 'getOpenId'
        });
        app.globalData.openId = openIdResult.result.openid;
      }

      const result = await wx.cloud.callFunction({
        name: 'companions',
        data: {
          action: 'detail',
          openId: openId // 使用openId获取自己的信息
        }
      });

      if (result.result.code === 200) {
        this.setData({
          companionInfo: result.result.data,
          loading: false
        });
      } else {
        // 如果没有陪诊师信息，提示创建
        this.setData({ loading: false });
        wx.showModal({
          title: '提示',
          content: '您还不是陪诊师，是否创建陪诊师资料？',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/companion-register/companion-register'
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('加载陪诊师信息失败:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 加载订单统计
   */
  async loadOrderStats() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'orders',
        data: {
          action: 'list',
          type: 'companion',
          page: 1,
          pageSize: 100
        }
      });

      if (result.result.code === 200) {
        const orders = result.result.data.list || [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const stats = {
          today: 0,
          week: 0,
          month: 0,
          total: orders.length
        };

        orders.forEach(order => {
          const orderDate = new Date(order.createdAt);
          if (orderDate >= today) stats.today++;
          if (orderDate >= weekAgo) stats.week++;
          if (orderDate >= monthAgo) stats.month++;
        });

        this.setData({
          orderStats: stats
        });
      }
    } catch (error) {
      console.error('加载订单统计失败:', error);
    }
  },

  /**
   * 编辑资料
   */
  async editProfile() {
    // 检查是否已注册
    if (!this.data.companionInfo) {
      wx.navigateTo({
        url: '/pages/companion-register/companion-register'
      });
    } else {
      wx.navigateTo({
        url: '/pages/companion-edit/companion-edit'
      });
    }
  },

  /**
   * 查看订单
   */
  viewOrders() {
    wx.switchTab({
      url: '/pages/order-list/order-list?tab=in_service'
    });
  },

  /**
   * 管理服务时间
   */
  manageSchedule() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  }
});

