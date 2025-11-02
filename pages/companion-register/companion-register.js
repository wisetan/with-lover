// pages/companion-register/companion-register.js
const { chooseImage } = require('../../utils/util');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    phone: '',
    idCard: '',
    avatar: '',
    certificateImage: '',
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
    this.initAvailableTime();
  },

  /**
   * 初始化可预约时间
   */
  initAvailableTime() {
    const weekDays = [0, 1, 2, 3, 4, 5, 6]; // 周日到周六
    const timeSlots = ['morning', 'afternoon', 'full_day'];
    
    const availableTime = weekDays.map(day => ({
      dayOfWeek: day,
      timeSlots: [],
      selected: false
    }));

    this.setData({ availableTime });
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
   * 输入身份证号
   */
  onIdCardInput(e) {
    this.setData({
      idCard: e.detail.value.trim(),
      formErrors: { ...this.data.formErrors, idCard: '' }
    });
  },

  /**
   * 选择头像
   */
  async selectAvatar() {
    try {
      const imagePaths = await chooseImage({ count: 1 });
      if (imagePaths.length > 0) {
        // 上传到云存储
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
   * 选择证书图片
   */
  async selectCertificate() {
    try {
      const imagePaths = await chooseImage({ count: 1 });
      if (imagePaths.length > 0) {
        wx.showLoading({ title: '上传中...' });
        try {
          const cloudPath = `certificates/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
          const uploadResult = await wx.cloud.uploadFile({
            cloudPath,
            filePath: imagePaths[0]
          });
          
          this.setData({
            certificateImage: uploadResult.fileID
          });
          wx.hideLoading();
        } catch (error) {
          wx.hideLoading();
          throw error;
        }
      }
    } catch (error) {
      console.error('选择证书失败:', error);
      wx.showToast({
        title: '选择证书失败',
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
      // 全天选项，切换其他选项
      dayTime.timeSlots = dayTime.timeSlots.includes('full_day') ? [] : ['full_day'];
    } else {
      // 上午/下午选项
      const slotIndex = dayTime.timeSlots.indexOf(slot);
      if (slotIndex > -1) {
        dayTime.timeSlots.splice(slotIndex, 1);
        // 移除全天选项
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
   * 验证表单
   */
  validateForm() {
    const errors = {};
    let isValid = true;

    if (!this.data.name.trim()) {
      errors.name = '请输入姓名';
      isValid = false;
    }
    if (!this.data.phone.trim()) {
      errors.phone = '请输入手机号';
      isValid = false;
    } else if (!/^1[3-9]\d{9}$/.test(this.data.phone)) {
      errors.phone = '请输入正确的手机号';
      isValid = false;
    }
    if (!this.data.idCard.trim()) {
      errors.idCard = '请输入身份证号';
      isValid = false;
    } else if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(this.data.idCard)) {
      errors.idCard = '请输入正确的身份证号';
      isValid = false;
    }
    if (!this.data.avatar) {
      errors.avatar = '请上传头像';
      isValid = false;
    }
    if (!this.data.certificateImage) {
      errors.certificateImage = '请上传认证证书';
      isValid = false;
    }
    if (this.data.hospitals.length === 0) {
      errors.hospitals = '请至少选择一个服务医院';
      isValid = false;
    }
    if (this.data.departments.length === 0) {
      errors.departments = '请至少选择一个服务科室';
      isValid = false;
    }
    if (this.data.availableTime.every(day => day.timeSlots.length === 0)) {
      errors.availableTime = '请至少设置一个可预约时间';
      isValid = false;
    }

    this.setData({ formErrors: errors });

    if (!isValid) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        wx.showToast({
          title: firstError,
          icon: 'none',
          duration: 2000
        });
      }
    }

    return isValid;
  },

  /**
   * 提交注册
   */
  async submitRegister() {
    if (!this.validateForm()) {
      return;
    }

    this.setData({ loading: true });

    try {
      const app = getApp();
      const openId = app.globalData.openId || (await wx.cloud.callFunction({ name: 'getOpenId' })).result.openid;

      const result = await wx.cloud.callFunction({
        name: 'companions',
        data: {
          action: 'register',
          data: {
            openId,
            name: this.data.name,
            phone: this.data.phone,
            idCard: this.data.idCard,
            avatar: this.data.avatar,
            certification: {
              certified: false, // 待审核
              certificateImage: this.data.certificateImage
            },
            serviceScope: {
              hospitals: this.data.hospitals,
              departments: this.data.departments
            },
            availableTime: this.data.availableTime.filter(day => day.timeSlots.length > 0),
            rating: 0,
            reviewCount: 0,
            orderCount: 0
          }
        }
      });

      if (result.result.code === 200) {
        wx.showToast({
          title: '注册成功，等待审核',
          icon: 'success'
        });

        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.result.message || '注册失败');
      }
    } catch (error) {
      console.error('注册失败:', error);
      wx.showToast({
        title: error.message || '注册失败',
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

