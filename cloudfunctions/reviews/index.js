// cloudfunctions/reviews/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 评价相关云函数
 * 支持：创建评价、获取评价列表、评价统计
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;
  const { action, ...params } = event;

  try {
    switch (action) {
      case 'create':
        return await createReview(openId, params);
      case 'list':
        return await getReviewList(params);
      case 'stats':
        return await getReviewStats(params.companionId);
      default:
        throw new Error('未知的操作类型');
    }
  } catch (error) {
    console.error('评价操作失败:', error);
    return {
      code: 500,
      message: error.message || '操作失败'
    };
  }
};

/**
 * 创建评价
 */
async function createReview(openId, params) {
  const { orderId, companionId, rating, comment, tags } = params;
  
  if (!orderId || !companionId || !rating) {
    throw new Error('缺少必要参数');
  }

  // 验证评分范围
  if (rating < 1 || rating > 5) {
    throw new Error('评分必须在1-5之间');
  }

  // 检查订单是否存在
  const order = await db.collection('orders').doc(orderId).get();
  if (!order.data) {
    throw new Error('订单不存在');
  }

  // 验证订单归属
  if (order.data.patientId !== openId) {
    throw new Error('无权限评价此订单');
  }

  // 检查是否已经评价过
  const existingReview = await db.collection('reviews')
    .where({
      orderId: orderId
    })
    .get();

  if (existingReview.data.length > 0) {
    throw new Error('该订单已经评价过');
  }

  // 创建评价
  const reviewData = {
    orderId,
    companionId,
    patientId: openId,
    rating,
    comment: comment || '',
    tags: tags || [],
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };

  const result = await db.collection('reviews').add({
    data: reviewData
  });

  // 更新陪诊师的评分统计
  await updateCompanionRating(companionId);

  return {
    code: 200,
    data: {
      reviewId: result._id,
      ...reviewData
    },
    message: '评价成功'
  };
}

/**
 * 获取评价列表
 */
async function getReviewList(params) {
  const { companionId, page = 1, pageSize = 10 } = params;
  
  if (!companionId) {
    throw new Error('缺少陪诊师ID');
  }

  const result = await db.collection('reviews')
    .where({
      companionId: companionId
    })
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
 * 获取评价统计
 */
async function getReviewStats(companionId) {
  if (!companionId) {
    throw new Error('缺少陪诊师ID');
  }

  const reviews = await db.collection('reviews')
    .where({
      companionId: companionId
    })
    .get();

  const reviewList = reviews.data || [];
  const total = reviewList.length;

  if (total === 0) {
    return {
      code: 200,
      data: {
        rating: 0,
        reviewCount: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      },
      message: '获取成功'
    };
  }

  // 计算平均评分
  const totalRating = reviewList.reduce((sum, review) => sum + (review.rating || 0), 0);
  const averageRating = (totalRating / total).toFixed(1);

  // 评分分布
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviewList.forEach(review => {
    const rating = review.rating || 0;
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
  });

  return {
    code: 200,
    data: {
      rating: parseFloat(averageRating),
      reviewCount: total,
      ratingDistribution: distribution
    },
    message: '获取成功'
  };
}

/**
 * 更新陪诊师评分
 */
async function updateCompanionRating(companionId) {
  const statsResult = await getReviewStats(companionId);
  
  if (statsResult.code === 200) {
    const { rating, reviewCount } = statsResult.data;
    
    await db.collection('companions').doc(companionId).update({
      data: {
        rating: rating,
        reviewCount: reviewCount,
        updatedAt: db.serverDate()
      }
    });
  }
}


