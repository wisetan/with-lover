// cloudfunctions/orders/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 订单相关云函数
 * 支持：创建订单、获取订单列表、获取订单详情、更新订单状态
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;
  const { action, ...params } = event;

  try {
    switch (action) {
      case 'create':
        return await createOrder(openId, params);
      case 'list':
        return await getOrderList(openId, params);
      case 'detail':
        return await getOrderDetail(params.orderId, openId);
      case 'update':
        return await updateOrder(params.orderId, params.data, openId);
      default:
        throw new Error('未知的操作类型');
    }
  } catch (error) {
    console.error('订单操作失败:', error);
    return {
      code: 500,
      message: error.message || '操作失败'
    };
  }
};

/**
 * 创建订单
 */
async function createOrder(openId, params) {
  const { companionId, hospital, department, serviceTime, patientInfo } = params;
  
  if (!companionId || !hospital || !department || !serviceTime) {
    throw new Error('缺少必要参数');
  }

  const orderData = {
    patientId: openId,
    companionId,
    hospital,
    department,
    serviceTime: new Date(serviceTime),
    status: 'pending_payment',
    depositStatus: 'unpaid',
    patientInfo: patientInfo || {},
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };

  const result = await db.collection('orders').add({
    data: orderData
  });

  return {
    code: 200,
    data: {
      orderId: result._id,
      ...orderData
    },
    message: '订单创建成功'
  };
}

/**
 * 获取订单列表
 */
async function getOrderList(openId, params) {
  const { type = 'all', page = 1, pageSize = 10 } = params;
  
  let whereCondition = {};
  
  // 根据用户类型筛选
  if (type === 'patient') {
    whereCondition.patientId = openId;
  } else if (type === 'companion') {
    whereCondition.companionId = openId;
  } else {
    // 查询所有相关订单
    whereCondition = _.or([
      { patientId: openId },
      { companionId: openId }
    ]);
  }

  const result = await db.collection('orders')
    .where(whereCondition)
    .orderBy('createdAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();

  return {
    code: 200,
    data: {
      list: result.data,
      total: result.data.length,
      page,
      pageSize
    },
    message: '获取成功'
  };
}

/**
 * 获取订单详情
 */
async function getOrderDetail(orderId, openId) {
  const order = await db.collection('orders').doc(orderId).get();
  
  if (!order.data) {
    throw new Error('订单不存在');
  }

  // 检查权限
  if (order.data.patientId !== openId && order.data.companionId !== openId) {
    throw new Error('无权限访问此订单');
  }

  // 获取陪诊师信息
  const companion = await db.collection('companions')
    .doc(order.data.companionId)
    .get();

  return {
    code: 200,
    data: {
      ...order.data,
      companion: companion.data || null
    },
    message: '获取成功'
  };
}

/**
 * 更新订单状态
 */
async function updateOrder(orderId, updateData, openId) {
  const order = await db.collection('orders').doc(orderId).get();
  
  if (!order.data) {
    throw new Error('订单不存在');
  }

  // 检查权限：只有陪诊师可以更新订单状态
  if (order.data.companionId !== openId) {
    throw new Error('无权限更新此订单');
  }

  const updateParams = {
    ...updateData,
    updatedAt: db.serverDate()
  };

  await db.collection('orders').doc(orderId).update({
    data: updateParams
  });

  // 如果是状态更新，记录服务日志
  if (updateData.status) {
    await db.collection('service_logs').add({
      data: {
        orderId,
        stepType: updateData.status,
        description: updateData.description || '',
        evidenceImage: updateData.evidenceImage || '',
        createdAt: db.serverDate()
      }
    });
  }

  return {
    code: 200,
    message: '更新成功'
  };
}

