// pages/order-create/order-create.js
const { DEPOSIT_AMOUNT } = require('../../utils/constants');
const { formatDate, formatAmount } = require('../../utils/format');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    companionId: null,
    companion: null,
    hospital: '',
    hospitalId: '',
    department: '',
    serviceTime: '',
    serviceTimeText: '',
    selectedDate: '',
    dateStart: '',
    dateEnd: '',
    showDatePicker: false,
    patientName: '',
    patientAge: '',
    patientCondition: '',
    depositAmount: DEPOSIT_AMOUNT,
    loading: false,
    formErrors: {} // 表单错误提示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const companionId = options.companionId;
    if (!companionId) {
      wx.showToast({
        title: '陪诊师ID不能为空',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }
    
    // 初始化日期范围
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const startDate = formatDate(today, 'YYYY-MM-DD');
    const endDate = formatDate(maxDate, 'YYYY-MM-DD');
    
    this.setData({
      companionId,
      dateStart: startDate,
      dateEnd: endDate
    });
    this.loadCompanionInfo();
  },

  /**
   * 加载陪诊师信息
   */
  async loadCompanionInfo() {
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
          companion: result.result.data
        });
      }
    } catch (error) {
      console.error('加载陪诊师信息失败:', error);
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 检查是否有从医院列表返回的数据
    const pages = getCurrentPages();
    // 获取上一个页面（医院列表页）
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.data && prevPage.data.selectedHospital) {
      const hospital = prevPage.data.selectedHospital;
      this.setData({
        hospital: hospital.name,
        hospitalId: hospital._id || hospital.id,
        department: '', // 清空科室选择
        formErrors: { ...this.data.formErrors, hospital: '' }
      });
      // 清除临时数据
      prevPage.setData({ selectedHospital: null });
    }
  },

  /**
   * 选择医院
   */
  selectHospital() {
    wx.navigateTo({
      url: '/pages/hospital-list/hospital-list?selectMode=true'
    });
  },

  /**
   * 选择科室
   */
  selectDepartment() {
    if (!this.data.hospital) {
      wx.showToast({
        title: '请先选择医院',
        icon: 'none'
      });
      return;
    }

    // 根据医院获取科室列表，这里使用通用科室列表
    const departments = ['内科', '外科', '儿科', '妇科', '骨科', '眼科', '耳鼻喉科', '皮肤科', '神经科', '心内科', '肿瘤科', '内分泌科'];
    
    wx.showActionSheet({
      itemList: departments,
      success: (res) => {
        if (res.tapIndex >= 0 && res.tapIndex < departments.length) {
          this.setData({
            department: departments[res.tapIndex],
            formErrors: { ...this.data.formErrors, department: '' }
          });
        }
      }
    });
  },

  /**
   * 选择服务时间 - 使用picker组件
   */
  onDateChange(e) {
    const date = e.detail.value;
    this.setData({
      selectedDate: date
    });
    this.showTimePicker(date);
  },

  /**
   * 显示时间选择器
   */
  showTimePicker(date) {
    // 使用简化的时间选择方式
    wx.showActionSheet({
      itemList: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'],
      success: (res) => {
        const timeStr = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'][res.tapIndex];
        const [hour, minute] = timeStr.split(':').map(Number);
        const [year, month, day] = date.split('-').map(Number);
        const serviceTime = new Date(year, month - 1, day, hour, minute);
        
        // 检查时间是否在过去
        if (serviceTime < new Date()) {
          wx.showToast({
            title: '请选择未来的时间',
            icon: 'none'
          });
          return;
        }

        this.setData({
          serviceTime: serviceTime.toISOString(),
          serviceTimeText: formatDate(serviceTime, 'YYYY-MM-DD HH:mm'),
          formErrors: { ...this.data.formErrors, serviceTime: '' }
        });
      }
    });
  },


  /**
   * 输入患者姓名
   */
  onPatientNameInput(e) {
    const value = e.detail.value.trim();
    this.setData({
      patientName: value,
      formErrors: { ...this.data.formErrors, patientName: '' }
    });
  },

  /**
   * 输入患者年龄
   */
  onPatientAgeInput(e) {
    const value = e.detail.value;
    this.setData({
      patientAge: value,
      formErrors: { ...this.data.formErrors, patientAge: '' }
    });
  },

  /**
   * 输入病情描述
   */
  onConditionInput(e) {
    this.setData({
      patientCondition: e.detail.value
    });
  },

  /**
   * 验证表单
   */
  validateForm() {
    const errors = {};
    let isValid = true;

    if (!this.data.hospital) {
      errors.hospital = '请选择医院';
      isValid = false;
    }
    if (!this.data.department) {
      errors.department = '请选择科室';
      isValid = false;
    }
    if (!this.data.serviceTime) {
      errors.serviceTime = '请选择服务时间';
      isValid = false;
    } else {
      // 检查时间是否为未来时间
      const selectedTime = new Date(this.data.serviceTime);
      if (selectedTime < new Date()) {
        errors.serviceTime = '服务时间不能是过去的时间';
        isValid = false;
      }
    }
    if (!this.data.patientName.trim()) {
      errors.patientName = '请输入患者姓名';
      isValid = false;
    } else if (this.data.patientName.trim().length < 2) {
      errors.patientName = '姓名至少2个字符';
      isValid = false;
    }
    if (!this.data.patientAge) {
      errors.patientAge = '请输入患者年龄';
      isValid = false;
    } else {
      const age = parseInt(this.data.patientAge);
      if (isNaN(age) || age < 0 || age > 150) {
        errors.patientAge = '请输入有效的年龄';
        isValid = false;
      }
    }

    this.setData({ formErrors: errors });

    if (!isValid) {
      // 显示第一个错误
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
   * 提交订单
   */
  async submitOrder() {
    if (!this.validateForm()) {
      return;
    }

    wx.showModal({
      title: '确认订单',
      content: `需支付保证金 ${formatAmount(this.data.depositAmount * 100)}，确认创建订单？`,
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          try {
            const result = await wx.cloud.callFunction({
              name: 'orders',
              data: {
                action: 'create',
                companionId: this.data.companionId,
                hospital: this.data.hospital,
                department: this.data.department,
                serviceTime: this.data.serviceTime,
                patientInfo: {
                  name: this.data.patientName,
                  age: parseInt(this.data.patientAge),
                  condition: this.data.patientCondition
                }
              }
            });

            if (result.result.code === 200) {
              wx.showToast({
                title: '订单创建成功',
                icon: 'success'
              });
              
              // 跳转到订单详情页
              setTimeout(() => {
                wx.redirectTo({
                  url: `/pages/order-detail/order-detail?orderId=${result.result.data.orderId}`
                });
              }, 1500);
            } else {
              throw new Error(result.result.message || '创建失败');
            }
          } catch (error) {
            console.error('创建订单失败:', error);
            wx.showToast({
              title: error.message || '创建失败',
              icon: 'none'
            });
          } finally {
            this.setData({ loading: false });
          }
        }
      }
    });
  }
});

