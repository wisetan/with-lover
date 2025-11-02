# 数据库模型设计文档

## 集合结构说明

### 1. users - 用户表

存储用户基本信息

```javascript
{
  _id: "用户ID",
  openId: "微信openId",
  userType: "patient" | "companion",  // 用户类型
  profileInfo: {
    name: "姓名",
    avatar: "头像URL",
    phone: "手机号",
    gender: "male" | "female",
    age: 30
  },
  creditScore: 100,  // 信用分
  createdAt: Date,
  updatedAt: Date
}
```

**索引：**
- openId (唯一索引)

---

### 2. orders - 订单表

存储订单信息

```javascript
{
  _id: "订单ID",
  patientId: "患者openId",
  companionId: "陪诊师openId",
  hospital: "医院名称",
  department: "科室名称",
  serviceTime: Date,  // 服务时间
  status: "browsing" | "consulting" | "pending_payment" | "confirmed" | "in_service" | "completed" | "cancelled",
  depositStatus: "unpaid" | "paid" | "refunded",  // 保证金状态
  depositAmount: 30,  // 保证金金额（分）
  patientInfo: {
    name: "患者姓名",
    age: 65,
    condition: "病情描述"
  },
  createdAt: Date,
  updatedAt: Date
}
```

**索引：**
- patientId
- companionId
- status
- createdAt (降序)

---

### 3. service_logs - 服务跟踪表

记录订单服务过程中的关键节点

```javascript
{
  _id: "日志ID",
  orderId: "订单ID",
  stepType: "accepted" | "arrived" | "registered" | "consulting" | "completed",
  description: "步骤描述",
  evidenceImage: "凭证图片URL",
  createdAt: Date
}
```

**索引：**
- orderId
- createdAt (降序)

---

### 4. reviews - 评价表

存储用户对服务的评价

```javascript
{
  _id: "评价ID",
  orderId: "订单ID",
  companionId: "陪诊师ID",
  patientId: "患者openId",
  rating: 5,  // 评分 1-5
  comment: "评价内容",
  tags: ["非常耐心", "流程熟悉"],  // 评价标签
  createdAt: Date
}
```

**索引：**
- orderId
- companionId
- createdAt (降序)

---

### 5. companions - 陪诊师表

存储陪诊师详细信息

```javascript
{
  _id: "陪诊师ID",
  openId: "微信openId",
  name: "姓名",
  avatar: "头像URL",
  phone: "手机号",
  idCard: "身份证号",
  certification: {
    certified: true,  // 是否认证
    certificateImage: "证书图片URL"
  },
  rating: 4.8,  // 综合评分
  reviewCount: 128,  // 评价数量
  orderCount: 156,  // 接单数
  serviceScope: {
    hospitals: ["医院ID1", "医院ID2"],  // 服务医院
    departments: ["内科", "外科"],  // 服务科室
    doctorLevel: "all"  // 医生级别：all | expert | chief
  },
  availableTime: [
    {
      dayOfWeek: 1,  // 周几 0-6
      timeSlots: ["morning", "afternoon"]  // 时间段
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

**索引：**
- openId (唯一索引)
- rating (降序)

---

### 6. hospitals - 医院表

存储医院信息（静态数据，可手动维护）

```javascript
{
  _id: "医院ID",
  name: "医院名称",
  address: "医院地址",
  location: {
    latitude: 39.9042,
    longitude: 116.4074
  },
  departments: ["内科", "外科", "儿科"],  // 科室列表
  departmentCount: 15,
  distance: 1200,  // 距离（米）
  createdAt: Date,
  updatedAt: Date
}
```

**索引：**
- name
- location (地理位置索引)

---

## 数据关系图

```
users (用户)
  ├── orders (订单) - patientId
  │   ├── service_logs (服务跟踪) - orderId
  │   └── reviews (评价) - orderId
  │
  └── companions (陪诊师) - openId
      ├── orders (订单) - companionId
      └── reviews (评价) - companionId
```

---

## 初始化数据脚本

建议创建以下初始化数据：

1. **医院数据**：手动导入常用医院信息
2. **测试用户**：创建测试用的患者和陪诊师账号
3. **示例订单**：用于开发和测试

---

## 数据库权限设置

### 安全规则建议

1. **users 集合**
   - 用户只能读取和更新自己的数据
   - 通过 openId 匹配

2. **orders 集合**
   - 患者和陪诊师只能查看与自己相关的订单
   - 创建订单：仅患者可创建
   - 更新订单状态：仅陪诊师可更新

3. **service_logs 集合**
   - 仅订单相关用户可查看

4. **reviews 集合**
   - 公开读取
   - 仅订单患者可创建评价

5. **companions 集合**
   - 公开读取
   - 仅陪诊师本人可更新自己的信息

---

## 数据库索引优化建议

1. **复合索引**
   - orders: { patientId: 1, status: 1, createdAt: -1 }
   - orders: { companionId: 1, status: 1, createdAt: -1 }
   - service_logs: { orderId: 1, createdAt: -1 }
   - reviews: { companionId: 1, createdAt: -1 }

2. **地理位置索引**
   - hospitals: location (2dsphere)

---

## 数据备份建议

- 定期备份重要数据
- 使用云开发的数据导出功能
- 重要业务数据建议双重备份

