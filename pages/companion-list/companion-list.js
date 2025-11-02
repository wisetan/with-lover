// pages/companion-list/companion-list.js
const { PAGE_SIZE } = require('../../utils/constants');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    keyword: '',           // 搜索关键词
    hospitalId: '',        // 医院ID筛选
    companionList: [],     // 陪诊师列表
    loading: false,        // 加载状态
    hasMore: true,         // 是否还有更多数据
    page: 1,               // 当前页码
    total: 0               // 总数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取页面参数
    const keyword = options.keyword || '';
    const hospitalId = options.hospitalId || '';
    const hospitalName = options.hospitalName || '';

    this.setData({
      keyword,
      hospitalId,
      hospitalName
    });

    // 设置页面标题
    if (hospitalName) {
      wx.setNavigationBarTitle({
        title: `${hospitalName} - 陪诊师`
      });
    }

    // 加载数据
    this.loadCompanionList(true);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 加载陪诊师列表
   * @param {Boolean} reset - 是否重置列表
   */
  async loadCompanionList(reset = false) {
    if (this.data.loading) return;

    let currentPage = this.data.page;
    
    if (reset) {
      currentPage = 1;
      this.setData({
        page: 1,
        hasMore: true,
        companionList: []
      });
    }

    if (!this.data.hasMore && !reset) {
      return;
    }

    this.setData({ loading: true });

    try {
      // 调用云函数获取陪诊师列表
      const result = await wx.cloud.callFunction({
        name: 'companions',
        data: {
          action: 'list',
          keyword: this.data.keyword,
          hospitalId: this.data.hospitalId,
          page: currentPage,
          pageSize: PAGE_SIZE
        }
      });

      if (result.result.code === 200) {
        const { list, total } = result.result.data;
        
        // 处理数据，添加格式化后的信息
        const processedList = (list || []).map(item => {
          return {
            ...item,
            ratingText: item.rating ? item.rating.toFixed(1) : '0.0',
            serviceScopeText: this.formatServiceScope(item.serviceScope)
          };
        });

        const newList = reset ? processedList : [...this.data.companionList, ...processedList];
        const hasMore = newList.length < total;

        this.setData({
          companionList: newList,
          total,
          hasMore,
          page: currentPage + 1,
          loading: false
        });
      } else {
        throw new Error(result.result.message || '获取失败');
      }
    } catch (error) {
      console.error('加载陪诊师列表失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 格式化服务范围
   */
  formatServiceScope(serviceScope) {
    if (!serviceScope) return '暂无';
    
    const { hospitals = [], departments = [] } = serviceScope;
    const hospitalNames = hospitals.length > 0 ? hospitals.slice(0, 2).join('、') : '';
    const departmentNames = departments.length > 0 ? departments.slice(0, 2).join('、') : '';
    
    if (hospitalNames && departmentNames) {
      return `${hospitalNames} · ${departmentNames}`;
    } else if (hospitalNames) {
      return hospitalNames;
    } else if (departmentNames) {
      return departmentNames;
    }
    return '暂无';
  },

  /**
   * 搜索输入（使用防抖）
   */
  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    this.setData({ keyword });
    // 使用防抖函数
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.loadCompanionList(true);
    }, 500);
  },

  /**
   * 搜索提交
   */
  onSearchSubmit(e) {
    const keyword = e.detail.value.trim();
    this.setData({ keyword });
    this.loadCompanionList(true);
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
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadCompanionList(true).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadCompanionList();
    }
  },

  /**
   * 点击筛选（可以扩展筛选功能）
   */
  onFilterTap() {
    wx.showActionSheet({
      itemList: ['按评分排序', '按接单数排序', '按距离排序'],
      success: (res) => {
        const sortTypes = ['rating', 'orderCount', 'distance'];
        const sortType = sortTypes[res.tapIndex];
        this.sortList(sortType);
      }
    });
  },

  /**
   * 清除医院筛选
   */
  clearHospitalFilter() {
    this.setData({
      hospitalId: '',
      hospitalName: ''
    });
    wx.setNavigationBarTitle({
      title: '陪诊师列表'
    });
    this.loadCompanionList(true);
  },

  /**
   * 排序列表
   */
  sortList(sortType) {
    let sortedList = [...this.data.companionList];
    
    switch (sortType) {
      case 'rating':
        sortedList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'orderCount':
        sortedList.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
        break;
      case 'distance':
        sortedList.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        break;
    }

    this.setData({
      companionList: sortedList
    });
  }
});

