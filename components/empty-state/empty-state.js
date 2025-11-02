// components/empty-state/empty-state.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 图标（emoji 或 图标名）
    icon: {
      type: String,
      value: '📋'
    },
    // 标题
    title: {
      type: String,
      value: '暂无数据'
    },
    // 描述
    description: {
      type: String,
      value: ''
    },
    // 按钮文字
    buttonText: {
      type: String,
      value: ''
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
    handleButtonTap() {
      this.triggerEvent('buttonTap');
    }
  }
});

