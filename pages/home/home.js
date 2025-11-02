// pages/home/home.js
const { get } = require('../../utils/request');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    searchKeyword: '',
    companionList: [],
    hospitalList: [],
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    
  },

  /**
   * 加载数据
   */
  async loadData() {
    this.setData({ loading: true });
    try {
      // 获取推荐陪诊师
      const companions = await get('/api/companions', { limit: 6 });
      // 获取附近医院
      const hospitals = await get('/api/hospitals', { limit: 10 });
      
      this.setData({
        companionList: companions || [],
        hospitalList: hospitals || [],
        loading: false
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 搜索输入
   */
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  /**
   * 搜索提交
   */
  onSearchSubmit() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) return;
    
    wx.navigateTo({
      url: `/pages/companion-list/companion-list?keyword=${encodeURIComponent(keyword)}`
    });
  },

  /**
   * 跳转到医院列表
   */
  navigateToHospitalList() {
    wx.navigateTo({
      url: '/pages/hospital-list/hospital-list'
    });
  },

  /**
   * 跳转到陪诊师列表
   */
  navigateToCompanionList() {
    wx.navigateTo({
      url: '/pages/companion-list/companion-list'
    });
  },

  /**
   * 跳转到订单列表
   */
  navigateToOrderList() {
    wx.switchTab({
      url: '/pages/order-list/order-list'
    });
  },

  /**
   * 点击陪诊师卡片
   */
  onCompanionTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/companion-detail/companion-detail?id=${id}`
    });
  },

  /**
   * 点击医院卡片
   */
  onHospitalTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/companion-list/companion-list?hospitalId=${id}`
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadData().finally(() => {
      wx.stopPullDownRefresh();
    });
  }
});

