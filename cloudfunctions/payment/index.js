// cloudfunctions/payment/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 支付相关云函数
 * 支持：创建支付订单、处理支付回调、退款
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;
  const { action, ...params } = event;

  try {
    switch (action) {
      case 'create':
        return await createPayment(openId, params);
      case 'callback':
        return await handlePaymentCallback(params);
      case 'refund':
        return await refundPayment(openId, params);
      default:
        throw new Error('未知的操作类型');
    }
  } catch (error) {
    console.error('支付操作失败:', error);
    return {
      code: 500,
      message: error.message || '操作失败'
    };
  }
};

/**
 * 创建支付订单
 */
async function createPayment(openId, params) {
  const { orderId, amount, description } = params;
  
  if (!orderId || !amount) {
    throw new Error('缺少必要参数');
  }

  // 查询订单信息
  const order = await db.collection('orders').doc(orderId).get();
  if (!order.data) {
    throw new Error('订单不存在');
  }

  // 验证订单归属
  if (order.data.patientId !== openId) {
    throw new Error('无权限支付此订单');
  }

  // 检查订单状态
  if (order.data.status !== 'pending_payment') {
    throw new Error('订单状态不正确，无法支付');
  }

  // 调用微信支付统一下单
  // 注意：实际生产环境需要配置商户号和密钥
  // 微信云开发支付需要使用支付API，这里使用模拟返回数据
  // 实际部署时需要配置真实的支付参数
  const outTradeNo = `ORDER_${orderId}_${Date.now()}`;
  
  // 模拟支付返回数据（实际应调用云开发支付API）
  const paymentResult = {
    payment: {
      paymentId: `pay_${Date.now()}`,
      outTradeNo: outTradeNo,
      package: `prepay_id=${outTradeNo}`
    },
    timeStamp: Math.floor(Date.now() / 1000).toString(),
    nonceStr: Math.random().toString(36).substr(2, 15),
    signType: 'RSA',
    paySign: 'mock_sign_' + Date.now()
  };
  
  // TODO: 实际生产环境应调用以下API
  // const paymentResult = await cloud.cloudPay.unifiedOrder({...});

  // 更新订单支付信息
  await db.collection('orders').doc(orderId).update({
    data: {
      paymentId: paymentResult.payment.paymentId,
      paymentNo: paymentResult.payment.outTradeNo,
      updatedAt: db.serverDate()
    }
  });

  return {
    code: 200,
    data: {
      payment: paymentResult.payment,
      timeStamp: paymentResult.timeStamp,
      nonceStr: paymentResult.nonceStr,
      signType: paymentResult.signType,
      paySign: paymentResult.paySign
    },
    message: '支付订单创建成功'
  };
}

/**
 * 处理支付回调
 */
async function handlePaymentCallback(params) {
  const { payment } = params;
  const attach = JSON.parse(payment.attach || '{}');
  const { orderId, type } = attach;

  if (!orderId) {
    throw new Error('订单ID不存在');
  }

  // 验证支付结果
  if (payment.resultCode === 'SUCCESS') {
    // 更新订单状态
    const updateData = {
      depositStatus: 'paid',
      paymentTime: db.serverDate(),
      updatedAt: db.serverDate()
    };

    // 如果支付的是保证金，更新订单状态为已确认
    if (type === 'deposit') {
      updateData.status = 'confirmed';
    }

    await db.collection('orders').doc(orderId).update({
      data: updateData
    });

    // 创建服务日志
    await db.collection('service_logs').add({
      data: {
        orderId,
        stepType: 'confirmed',
        description: '订单已确认，保证金已支付',
        createdAt: db.serverDate()
      }
    });
  }

  return {
    code: 200,
    message: '处理成功'
  };
}

/**
 * 退款处理
 */
async function refundPayment(openId, params) {
  const { orderId, amount, reason } = params;
  
  if (!orderId || !amount) {
    throw new Error('缺少必要参数');
  }

  // 查询订单
  const order = await db.collection('orders').doc(orderId).get();
  if (!order.data) {
    throw new Error('订单不存在');
  }

  // 验证权限（仅患者或管理员可退款）
  if (order.data.patientId !== openId) {
    throw new Error('无权限退款');
  }

  // 检查订单状态
  if (order.data.depositStatus !== 'paid') {
    throw new Error('订单未支付，无法退款');
  }

  // 调用微信退款接口
  // 注意：实际生产环境需要配置
  const refundResult = await cloud.cloudPay.refund({
    outRefundNo: `REFUND_${orderId}_${Date.now()}`,
    outTradeNo: order.data.paymentNo,
    totalFee: order.data.depositAmount || 3000, // 原支付金额
    refundFee: amount, // 退款金额
    refundDesc: reason || '服务完成，退还保证金'
  });

  // 更新订单状态
  await db.collection('orders').doc(orderId).update({
    data: {
      depositStatus: 'refunded',
      refundTime: db.serverDate(),
      refundReason: reason,
      updatedAt: db.serverDate()
    }
  });

  return {
    code: 200,
    data: refundResult,
    message: '退款成功'
  };
}

