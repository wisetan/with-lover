# 一站式医院陪诊服务小程序

## 项目简介

连接老年患者与专业陪诊师的本地化服务平台，简化就医流程，提供安心陪伴，建立医患桥梁。

## 技术栈

- **前端框架**：微信小程序原生框架
- **UI组件**：Vant Weapp（可选）
- **后端平台**：微信云开发（云函数 + 云数据库 + 云存储）
- **开发语言**：JavaScript (Node.js)

## 项目结构

```
with-lover/
├── pages/                    # 页面目录
│   ├── home/                # 首页
│   ├── companion-list/      # 陪诊师列表
│   ├── companion-detail/     # 陪诊师详情
│   ├── order-create/         # 创建订单
│   ├── order-list/           # 订单列表
│   ├── order-detail/         # 订单详情
│   ├── order-tracking/       # 订单跟踪
│   ├── profile/              # 个人中心
│   └── companion-center/     # 陪诊师中心
├── components/               # 公共组件
│   ├── base-button/         # 基础按钮
│   ├── info-card/           # 信息卡片
│   ├── step-progress/       # 步骤进度
│   └── empty-state/         # 空状态
├── utils/                    # 工具函数
│   ├── request.js           # 网络请求封装
│   ├── format.js            # 格式化工具
│   ├── constants.js         # 常量配置
│   └── util.js              # 通用工具
├── cloudfunctions/          # 云函数
│   ├── getOpenId/          # 获取openId
│   ├── orders/             # 订单管理
│   └── companions/         # 陪诊师管理
├── database/                # 数据库模型文档
├── assets/                  # 静态资源
├── app.js                   # 小程序入口
├── app.json                 # 小程序配置
└── app.wxss                 # 全局样式
```

## 快速开始

### 1. 环境准备

- 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册微信小程序账号
- 开通云开发服务

### 2. 项目配置

1. 在微信开发者工具中打开项目
2. 修改 `app.js` 中的云环境 ID：
   ```javascript
   wx.cloud.init({
     env: 'your-cloud-env-id', // 替换为实际的云环境ID
     traceUser: true
   });
   ```
3. 修改 `project.config.json` 中的 `appid`

### 3. 初始化数据库

参考 `database/README.md` 文档创建数据库集合和索引。

### 4. 部署云函数

1. 右键点击 `cloudfunctions/getOpenId`，选择"上传并部署：云端安装依赖"
2. 同样操作部署其他云函数

### 5. 运行项目

在微信开发者工具中点击"编译"即可运行。

## 核心功能

### 用户端
- ✅ 医院与陪诊师发现
- ✅ 预约流程
- ✅ 服务跟踪
- ✅ 订单管理
- ✅ 评价系统

### 陪诊师端
- ✅ 个人资料管理
- ✅ 服务范围设置
- ✅ 可预约时间管理
- ✅ 订单管理
- ✅ 服务凭证上传

## 设计规范

详见 `UIUE.md` 文档，包含：
- 色彩体系
- 字体规范
- 组件规范
- 交互设计

## 开发规范

详见 `.cursorrules` 文件，包含：
- 代码规范
- 组件开发规范
- 网络请求规范
- 错误处理规范

## API 文档

### 订单相关

- `GET /api/orders` - 获取订单列表
- `POST /api/orders` - 创建新订单
- `GET /api/orders/:id` - 获取订单详情
- `PUT /api/orders/:id` - 更新订单状态

### 陪诊师相关

- `GET /api/companions` - 获取陪诊师列表
- `GET /api/companions/:id` - 获取陪诊师详情
- `PUT /api/companions/:id` - 更新陪诊师资料

## 数据模型

详见 `database/README.md` 文档，包含：
- 用户表 (users)
- 订单表 (orders)
- 服务跟踪表 (service_logs)
- 评价表 (reviews)
- 陪诊师表 (companions)
- 医院表 (hospitals)

## 开发计划

### MVP 版本（当前）

- [x] 基础架构搭建
- [x] 首页和发现功能
- [x] 订单管理
- [x] 服务跟踪
- [ ] 支付功能
- [ ] 消息通知
- [ ] 评价系统

### 未来版本

- [ ] 客服消息集成
- [ ] 数据分析
- [ ] 运营管理后台
- [ ] 多城市支持

## 注意事项

1. **云环境配置**：需要在微信开发者工具中配置云开发环境
2. **数据库权限**：需要设置合适的数据库权限规则
3. **API 安全**：生产环境需要配置 API 密钥和权限验证
4. **图片存储**：使用云存储存放用户上传的图片

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系开发团队。
