// components/step-progress/step-progress.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 步骤列表
    steps: {
      type: Array,
      value: []
    },
    // 当前步骤索引
    current: {
      type: Number,
      value: 0
    },
    // 方向
    direction: {
      type: String,
      value: 'vertical' // horizontal | vertical
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

  }
});

