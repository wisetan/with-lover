// components/info-card/info-card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 卡片标题
    title: {
      type: String,
      value: ''
    },
    // 副标题
    subtitle: {
      type: String,
      value: ''
    },
    // 头像URL
    avatar: {
      type: String,
      value: ''
    },
    // 状态标签
    status: {
      type: String,
      value: ''
    },
    // 状态标签颜色
    statusColor: {
      type: String,
      value: ''
    },
    // 是否显示箭头
    arrow: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleTap() {
      this.triggerEvent('tap');
    }
  }
});

