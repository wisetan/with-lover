// pages/review/review.js
const { REVIEW_TAGS } = require('../../utils/constants');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderId: null,
    companionId: null,
    order: null,
    rating: 5,
    comment: '',
    selectedTags: [],
    tags: REVIEW_TAGS,
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
    this.loadOrderInfo();
  },

  /**
   * 加载订单信息
   */
  async loadOrderInfo() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'orders',
        data: {
          action: 'detail',
          orderId: this.data.orderId
        }
      });

      if (result.result.code === 200) {
        this.setData({
          order: result.result.data,
          companionId: result.result.data.companionId
        });
      }
    } catch (error) {
      console.error('加载订单信息失败:', error);
    }
  },

  /**
   * 选择评分
   */
  onRatingChange(e) {
    const rating = e.currentTarget.dataset.rating;
    this.setData({ rating });
  },

  /**
   * 输入评价内容
   */
  onCommentInput(e) {
    this.setData({
      comment: e.detail.value
    });
  },

  /**
   * 切换标签
   */
  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const selectedTags = [...this.data.selectedTags];
    const index = selectedTags.indexOf(tag);
    
    if (index > -1) {
      selectedTags.splice(index, 1);
    } else {
      if (selectedTags.length < 3) {
        selectedTags.push(tag);
      } else {
        wx.showToast({
          title: '最多选择3个标签',
          icon: 'none'
        });
        return;
      }
    }
    
    this.setData({ selectedTags });
  },

  /**
   * 提交评价
   */
  async submitReview() {
    if (this.data.rating < 1 || this.data.rating > 5) {
      wx.showToast({
        title: '请选择评分',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const result = await wx.cloud.callFunction({
        name: 'reviews',
        data: {
          action: 'create',
          orderId: this.data.orderId,
          companionId: this.data.companionId,
          rating: this.data.rating,
          comment: this.data.comment.trim(),
          tags: this.data.selectedTags
        }
      });

      if (result.result.code === 200) {
        wx.showToast({
          title: '评价成功',
          icon: 'success'
        });

        // 更新订单状态为已完成
        await wx.cloud.callFunction({
          name: 'orders',
          data: {
            action: 'update',
            orderId: this.data.orderId,
            data: {
              status: 'completed'
            }
          }
        });

        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.result.message || '评价失败');
      }
    } catch (error) {
      console.error('提交评价失败:', error);
      wx.showToast({
        title: error.message || '评价失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});


