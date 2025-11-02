// pages/order-list/order-list.js
const { formatOrderStatus, getOrderStatusColor, formatDate } = require('../../utils/format');
const { ORDER_STATUS } = require('../../utils/constants');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
    currentTab: 'all', // all | pending | in_service | completed
    loading: false,
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'pending', label: '待处理' },
      { key: 'in_service', label: '进行中' },
      { key: 'completed', label: '已完成' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const tab = options.tab || 'all';
    this.setData({ currentTab: tab });
    this.loadOrderList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示时刷新列表
    this.loadOrderList();
  },

  /**
   * 加载订单列表
   */
  async loadOrderList() {
    this.setData({ loading: true });
    try {
      const app = getApp();
      const openId = app.globalData.openId;
      
      if (!openId) {
        // 先获取 openId
        const openIdResult = await wx.cloud.callFunction({
          name: 'getOpenId'
        });
        app.globalData.openId = openIdResult.result.openid;
      }

      const result = await wx.cloud.callFunction({
        name: 'orders',
        data: {
          action: 'list',
          type: 'all', // 获取所有相关订单
          page: 1,
          pageSize: 50
        }
      });

      if (result.result.code === 200) {
        const list = (result.result.data.list || []).map(order => {
          return {
            ...order,
            statusText: formatOrderStatus(order.status),
            statusColor: getOrderStatusColor(order.status),
            serviceTimeText: formatDate(order.serviceTime, 'MM-DD HH:mm')
          };
        });

        // 根据当前tab过滤
        const filteredList = this.filterOrdersByTab(list);

        this.setData({
          orderList: filteredList,
          loading: false
        });
      } else {
        throw new Error(result.result.message || '获取失败');
      }
    } catch (error) {
      console.error('加载订单列表失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 根据tab过滤订单
   */
  filterOrdersByTab(list) {
    if (this.data.currentTab === 'all') {
      return list;
    }

    const statusMap = {
      'pending': [ORDER_STATUS.CONSULTING, ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.CONFIRMED],
      'in_service': [ORDER_STATUS.IN_SERVICE],
      'completed': [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED]
    };

    const targetStatuses = statusMap[this.data.currentTab] || [];
    return list.filter(order => targetStatuses.includes(order.status));
  },

  /**
   * 切换tab
   */
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    // 重新加载数据
    this.loadOrderList();
  },

  /**
   * 点击订单
   */
  onOrderTap(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?orderId=${orderId}`
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadOrderList().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 跳转到首页
   */
  navigateToHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  }
});

