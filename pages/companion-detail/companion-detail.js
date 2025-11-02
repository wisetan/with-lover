// pages/companion-detail/companion-detail.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    companionId: null,
    companion: null,
    reviews: [],
    availableTime: [],
    showAllReviews: false,
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const id = options.id;
    if (!id) {
      wx.showToast({
        title: '陪诊师ID不能为空',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }
    
    this.setData({ companionId: id });
    this.loadCompanionDetail();
  },

  /**
   * 加载陪诊师详情
   */
  async loadCompanionDetail() {
    this.setData({ loading: true });
    try {
      const result = await wx.cloud.callFunction({
        name: 'companions',
        data: {
          action: 'detail',
          id: this.data.companionId
        }
      });

      if (result.result.code === 200) {
        const companion = result.result.data;
        const reviews = companion.reviews || [];
        
        // 处理可预约时间
        const availableTime = this.formatAvailableTime(companion.availableTime || []);

        this.setData({
          companion,
          reviews: reviews.slice(0, 5), // 默认只显示5条
          availableTime,
          loading: false
        });
      } else {
        throw new Error(result.result.message || '获取失败');
      }
    } catch (error) {
      console.error('加载陪诊师详情失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 格式化可预约时间
   */
  formatAvailableTime(availableTime) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const timeSlots = {
      'morning': '上午',
      'afternoon': '下午',
      'full_day': '全天'
    };

    return availableTime.map(item => {
      const dayName = weekDays[item.dayOfWeek] || `周${item.dayOfWeek}`;
      const slots = item.timeSlots.map(slot => timeSlots[slot] || slot).join('、');
      return {
        ...item,
        dayName,
        slotsText: slots
      };
    });
  },

  /**
   * 切换评价显示
   */
  toggleReviews() {
    this.setData({
      showAllReviews: !this.data.showAllReviews
    });
    
    // 如果展开，加载所有评价
    if (!this.data.showAllReviews) {
      this.loadAllReviews();
    }
  },

  /**
   * 加载所有评价
   */
  async loadAllReviews() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'companions',
        data: {
          action: 'detail',
          id: this.data.companionId
        }
      });

      if (result.result.code === 200) {
        this.setData({
          reviews: result.result.data.reviews || []
        });
      }
    } catch (error) {
      console.error('加载评价失败:', error);
    }
  },

  /**
   * 联系咨询
   */
  contactConsult() {
    // TODO: 跳转到聊天页面或客服
    wx.showModal({
      title: '联系咨询',
      content: '功能开发中，请稍候...',
      showCancel: false
    });
  },

  /**
   * 立即预约
   */
  makeAppointment() {
    wx.navigateTo({
      url: `/pages/order-create/order-create?companionId=${this.data.companionId}`
    });
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: `推荐陪诊师：${this.data.companion?.name || ''}`,
      path: `/pages/companion-detail/companion-detail?id=${this.data.companionId}`
    };
  }
});

