// pages/hospital-list/hospital-list.js
const { formatDistance } = require('../../utils/format');
const { getLocation, calculateDistance } = require('../../utils/util');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    hospitalList: [],
    searchKeyword: '',
    loading: false,
    selectMode: false, // 是否选择模式
    userLocation: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const selectMode = options.selectMode === 'true';
    this.setData({ selectMode });
    
    this.getUserLocation();
    this.loadHospitalList();
  },

  /**
   * 获取用户位置
   */
  async getUserLocation() {
    try {
      const location = await getLocation();
      this.setData({ userLocation: location });
    } catch (error) {
      console.error('获取位置失败:', error);
    }
  },

  /**
   * 加载医院列表
   */
  async loadHospitalList() {
    this.setData({ loading: true });
    try {
      // TODO: 调用云函数获取医院列表
      // 这里先用模拟数据
      const mockHospitals = [
        { _id: '1', name: '市人民医院', address: '市中心区', departments: ['内科', '外科', '儿科'], location: { latitude: 39.9042, longitude: 116.4074 } },
        { _id: '2', name: '第一医院', address: '东城区', departments: ['内科', '外科', '骨科'], location: { latitude: 39.9142, longitude: 116.4174 } },
        { _id: '3', name: '中心医院', address: '西城区', departments: ['内科', '心内科', '神经科'], location: { latitude: 39.8942, longitude: 116.3974 } }
      ];

      // 计算距离
      let hospitals = mockHospitals.map(hospital => {
        let distance = null;
        if (this.data.userLocation && hospital.location) {
          distance = Math.round(calculateDistance(
            this.data.userLocation.latitude,
            this.data.userLocation.longitude,
            hospital.location.latitude,
            hospital.location.longitude
          ));
        }
        return {
          ...hospital,
          distance,
          distanceText: distance ? formatDistance(distance) : '',
          departmentCount: hospital.departments.length
        };
      });

      // 按距离排序
      hospitals.sort((a, b) => {
        if (!a.distance && !b.distance) return 0;
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        return a.distance - b.distance;
      });

      this.setData({
        hospitalList: hospitals,
        loading: false
      });
    } catch (error) {
      console.error('加载医院列表失败:', error);
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
    this.filterHospitals();
  },

  /**
   * 过滤医院
   */
  filterHospitals() {
    // 重新加载时会自动过滤
    this.loadHospitalList();
  },

  /**
   * 点击医院
   */
  onHospitalTap(e) {
    const hospital = e.currentTarget.dataset.hospital;
    
    if (this.data.selectMode) {
      // 选择模式，将选中的医院存储到当前页面数据中，返回时会触发onShow
      this.setData({
        selectedHospital: hospital
      });
      wx.navigateBack();
    } else {
      // 普通模式，跳转到陪诊师列表
      wx.navigateTo({
        url: `/pages/companion-list/companion-list?hospitalId=${hospital._id}&hospitalName=${encodeURIComponent(hospital.name)}`
      });
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.getUserLocation();
    this.loadHospitalList().finally(() => {
      wx.stopPullDownRefresh();
    });
  }
});
