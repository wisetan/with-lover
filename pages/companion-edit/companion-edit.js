// pages/companion-edit/companion-edit.js
const { chooseImage } = require('../../utils/util');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    companionInfo: null,
    name: '',
    phone: '',
    avatar: '',
    hospitals: [],
    departments: [],
    availableTime: [],
    loading: false,
    formErrors: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadCompanionInfo();
  },

  /**
   * 加载陪诊师信息
   */
  async loadCompanionInfo() {
    try {
      const app = getApp();
      const openId = app.globalData.openId || (await wx.cloud.callFunction({ name: 'getOpenId' })).result.openid;

      const result = await wx.cloud.callFunction({
        name: 'companions',
        data: {
          action: 'detail',
          openId: openId // 使用openId获取自己的信息
        }
      });

      if (result.result.code === 200) {
        const info = result.result.data;
        this.setData({
          companionInfo: info,
          name: info.name || '',
          phone: info.phone || '',
          avatar: info.avatar || '',
          hospitals: info.serviceScope?.hospitals || [],
          departments: info.serviceScope?.departments || [],
          availableTime: info.availableTime || this.initAvailableTime()
        });
      }
    } catch (error) {
      console.error('加载信息失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 初始化可预约时间
   */
  initAvailableTime() {
    const weekDays = [0, 1, 2, 3, 4, 5, 6];
    return weekDays.map(day => ({
      dayOfWeek: day,
      timeSlots: [],
      selected: false
    }));
  },

  /**
   * 输入姓名
   */
  onNameInput(e) {
    this.setData({
      name: e.detail.value.trim(),
      formErrors: { ...this.data.formErrors, name: '' }
    });
  },

  /**
   * 输入手机号
   */
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value.trim(),
      formErrors: { ...this.data.formErrors, phone: '' }
    });
  },

  /**
   * 选择头像
   */
  async selectAvatar() {
    try {
      const imagePaths = await chooseImage({ count: 1 });
      if (imagePaths.length > 0) {
        wx.showLoading({ title: '上传中...' });
        try {
          const cloudPath = `avatars/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
          const uploadResult = await wx.cloud.uploadFile({
            cloudPath,
            filePath: imagePaths[0]
          });
          
          this.setData({
            avatar: uploadResult.fileID
          });
          wx.hideLoading();
        } catch (error) {
          wx.hideLoading();
          throw error;
        }
      }
    } catch (error) {
      console.error('选择头像失败:', error);
      wx.showToast({
        title: '选择头像失败',
        icon: 'none'
      });
    }
  },

  /**
   * 选择服务医院
   */
  selectHospitals() {
    wx.navigateTo({
      url: '/pages/hospital-list/hospital-list?selectMode=true&multiple=true'
    });
  },

  /**
   * 选择科室
   */
  selectDepartments() {
    const departments = ['内科', '外科', '儿科', '妇科', '骨科', '眼科', '耳鼻喉科', '皮肤科', '神经科', '心内科', '肿瘤科', '内分泌科'];
    
    wx.showActionSheet({
      itemList: departments,
      success: (res) => {
        const selected = departments[res.tapIndex];
        if (!this.data.departments.includes(selected)) {
          this.setData({
            departments: [...this.data.departments, selected]
          });
        }
      }
    });
  },

  /**
   * 删除科室
   */
  removeDepartment(e) {
    const index = e.currentTarget.dataset.index;
    const departments = [...this.data.departments];
    departments.splice(index, 1);
    this.setData({ departments });
  },

  /**
   * 切换可预约时间
   */
  toggleTimeSlot(e) {
    const index = e.currentTarget.dataset.index;
    const slot = e.currentTarget.dataset.slot;
    const availableTime = [...this.data.availableTime];
    const dayTime = availableTime[index];
    
    if (slot === 'full_day') {
      dayTime.timeSlots = dayTime.timeSlots.includes('full_day') ? [] : ['full_day'];
    } else {
      const slotIndex = dayTime.timeSlots.indexOf(slot);
      if (slotIndex > -1) {
        dayTime.timeSlots.splice(slotIndex, 1);
        const fullDayIndex = dayTime.timeSlots.indexOf('full_day');
        if (fullDayIndex > -1) {
          dayTime.timeSlots.splice(fullDayIndex, 1);
        }
      } else {
        dayTime.timeSlots.push(slot);
      }
    }
    
    dayTime.selected = dayTime.timeSlots.length > 0;
    availableTime[index] = dayTime;
    
    this.setData({ availableTime });
  },

  /**
   * 提交编辑
   */
  async submitEdit() {
    if (!this.data.name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const result = await wx.cloud.callFunction({
        name: 'companions',
        data: {
          action: 'update',
          data: {
            name: this.data.name,
            phone: this.data.phone,
            avatar: this.data.avatar,
            serviceScope: {
              hospitals: this.data.hospitals,
              departments: this.data.departments
            },
            availableTime: this.data.availableTime.filter(day => day.timeSlots.length > 0)
          }
        }
      });

      if (result.result.code === 200) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });

        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 页面显示时检查是否有选择的医院
   */
  onShow() {
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.data && prevPage.data.selectedHospitals) {
      this.setData({
        hospitals: prevPage.data.selectedHospitals
      });
      prevPage.setData({ selectedHospitals: null });
    }
  }
});

