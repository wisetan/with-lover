// components/base-button/base-button.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 按钮类型
    type: {
      type: String,
      value: 'primary' // primary | secondary | text
    },
    // 按钮大小
    size: {
      type: String,
      value: 'medium' // large | medium | small
    },
    // 按钮状态
    state: {
      type: String,
      value: 'normal' // normal | disabled | loading
    },
    // 是否块级按钮
    block: {
      type: Boolean,
      value: false
    },
    // 按钮文字
    text: {
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
    handleTap(e) {
      if (this.data.state === 'disabled' || this.data.state === 'loading') {
        return;
      }
      this.triggerEvent('tap', e.detail);
    }
  }
});

