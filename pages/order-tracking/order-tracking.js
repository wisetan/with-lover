// pages/order-tracking/order-tracking.js
const { get } = require('../../utils/request');
const { formatDate, getOrderStatusColor } = require('../../utils/format');
const { SERVICE_STEP_TYPE } = require('../../utils/constants');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderId: null,
    order: null,
    serviceLogs: [],
    steps: [],
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const orderId = options.orderId;
    if (!orderId) {
      wx.showToast({
        title: '订单ID不能为空',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }
    
    this.setData({ orderId });
    this.loadOrderDetail();
  },

  /**
   * 加载订单详情
   */
  async loadOrderDetail() {
    this.setData({ loading: true });
    try {
      const order = await get(`/api/orders/${this.data.orderId}`);
      const logs = await get(`/api/service-logs`, { orderId: this.data.orderId });
      
      // 构建步骤数据
      const steps = this.buildSteps(logs, order);
      
      // 计算当前步骤索引和状态颜色
      const currentStep = steps.findIndex(step => step.current !== undefined && step.current);
      const statusColor = getOrderStatusColor(order.status);
      
      this.setData({
        order: {
          ...order,
          statusText: this.formatOrderStatus(order.status),
          statusColor
        },
        serviceLogs: logs || [],
        steps,
        currentStep: currentStep >= 0 ? currentStep : 0,
        loading: false
      });
    } catch (error) {
      console.error('加载订单详情失败:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 构建步骤数据
   */
  buildSteps(logs, order) {
    const stepTypes = [
      { type: SERVICE_STEP_TYPE.ACCEPTED, title: '已接单', desc: '陪诊师已确认接单' },
      { type: SERVICE_STEP_TYPE.ARRIVED, title: '已到医院', desc: '陪诊师已到达医院' },
      { type: SERVICE_STEP_TYPE.REGISTERED, title: '挂号完成', desc: '已完成挂号' },
      { type: SERVICE_STEP_TYPE.CONSULTING, title: '问诊中', desc: '正在进行问诊' },
      { type: SERVICE_STEP_TYPE.COMPLETED, title: '服务完成', desc: '陪诊服务已完成' }
    ];

    const stepMap = {};
    logs.forEach(log => {
      stepMap[log.stepType] = log;
    });

    return stepTypes.map((step, index) => {
      const log = stepMap[step.type];
      return {
        title: step.title,
        desc: step.desc,
        time: log ? formatDate(log.createdAt, 'MM-DD HH:mm') : null,
        evidence: log ? log.evidenceImage : null,
        completed: !!log,
        current: index === 0 && !log ? true : (log && !stepMap[stepTypes[index + 1]?.type])
      };
    });
  },

  /**
   * 格式化订单状态
   */
  formatOrderStatus(status) {
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
  },

  /**
   * 预览凭证
   */
  previewEvidence(e) {
    const index = e.currentTarget.dataset.index;
    const step = this.data.steps[index];
    if (step.evidence) {
      wx.previewImage({
        urls: [step.evidence],
        current: step.evidence
      });
    }
  },

  /**
   * 联系陪诊师
   */
  contactCompanion() {
    // 跳转到聊天页面或拨打电话
    wx.showActionSheet({
      itemList: ['发送消息', '拨打电话'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 跳转到聊天
        } else if (res.tapIndex === 1) {
          wx.makePhoneCall({
            phoneNumber: this.data.order.companion.phone
          });
        }
      }
    });
  }
});

