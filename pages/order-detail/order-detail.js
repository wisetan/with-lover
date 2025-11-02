// pages/order-detail/order-detail.js
const { formatOrderStatus, getOrderStatusColor, formatDate, formatAmount } = require('../../utils/format');
const { ORDER_STATUS, DEPOSIT_AMOUNT } = require('../../utils/constants');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderId: null,
    order: null,
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
      const result = await wx.cloud.callFunction({
        name: 'orders',
        data: {
          action: 'detail',
          orderId: this.data.orderId
        }
      });

      if (result.result.code === 200) {
        const order = result.result.data;
        this.setData({
          order: {
            ...order,
            statusText: formatOrderStatus(order.status),
            statusColor: getOrderStatusColor(order.status),
            serviceTimeText: formatDate(order.serviceTime, 'YYYY-MM-DD HH:mm'),
            depositText: formatAmount(DEPOSIT_AMOUNT * 100)
          },
          loading: false
        });
      } else {
        throw new Error(result.result.message || '获取失败');
      }
    } catch (error) {
      console.error('加载订单详情失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 查看服务跟踪
   */
  viewTracking() {
    wx.navigateTo({
      url: `/pages/order-tracking/order-tracking?orderId=${this.data.orderId}`
    });
  },

  /**
   * 支付保证金
   */
  async payDeposit() {
    const { DEPOSIT_AMOUNT } = require('../../utils/constants');
    const { formatAmount } = require('../../utils/format');
    
    wx.showModal({
      title: '支付保证金',
      content: `需支付保证金 ${formatAmount(DEPOSIT_AMOUNT * 100)}，确认支付？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            // 调用支付云函数
            const paymentResult = await wx.cloud.callFunction({
              name: 'payment',
              data: {
                action: 'create',
                orderId: this.data.orderId,
                amount: DEPOSIT_AMOUNT * 100, // 转换为分
                description: '陪诊服务保证金'
              }
            });

            if (paymentResult.result.code === 200) {
              const payment = paymentResult.result.data;
              
              // 调用微信支付
              wx.requestPayment({
                timeStamp: payment.timeStamp,
                nonceStr: payment.nonceStr,
                package: payment.payment.package,
                signType: payment.signType,
                paySign: payment.paySign,
                success: () => {
                  wx.showToast({
                    title: '支付成功',
                    icon: 'success'
                  });
                  // 刷新订单详情
                  setTimeout(() => {
                    this.loadOrderDetail();
                  }, 1500);
                },
                fail: (err) => {
                  console.error('支付失败:', err);
                  if (err.errMsg !== 'requestPayment:fail cancel') {
                    wx.showToast({
                      title: '支付失败',
                      icon: 'none'
                    });
                  }
                }
              });
            } else {
              throw new Error(paymentResult.result.message || '创建支付订单失败');
            }
          } catch (error) {
            console.error('支付失败:', error);
            wx.showToast({
              title: error.message || '支付失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 取消订单
   */
  cancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确认取消此订单？取消后保证金可能无法退回',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await wx.cloud.callFunction({
              name: 'orders',
              data: {
                action: 'update',
                orderId: this.data.orderId,
                data: {
                  status: ORDER_STATUS.CANCELLED
                }
              }
            });

            if (result.result.code === 200) {
              wx.showToast({
                title: '订单已取消',
                icon: 'success'
              });
              this.loadOrderDetail();
            } else {
              throw new Error(result.result.message);
            }
          } catch (error) {
            wx.showToast({
              title: error.message || '取消失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 联系陪诊师
   */
  contactCompanion() {
    if (!this.data.order.companion) {
      wx.showToast({
        title: '暂未分配陪诊师',
        icon: 'none'
      });
      return;
    }
    // TODO: 跳转到聊天页面
    wx.showModal({
      title: '联系陪诊师',
      content: `联系电话：${this.data.order.companion.phone || '功能开发中'}`,
      showCancel: false
    });
  },

  /**
   * 去评价
   */
  goToReview() {
    wx.navigateTo({
      url: `/pages/review/review?orderId=${this.data.orderId}`
    });
  }
});

