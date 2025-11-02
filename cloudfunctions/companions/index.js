// cloudfunctions/companions/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 陪诊师相关云函数
 * 支持：获取陪诊师列表、获取陪诊师详情、更新陪诊师信息
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;
  const { action, ...params } = event;

  try {
    switch (action) {
      case 'list':
        return await getCompanionList(params);
      case 'detail':
        // 支持通过ID或openId查询
        if (params.openId) {
          return await getCompanionByOpenId(openId);
        }
        return await getCompanionDetail(params.id);
      case 'update':
        return await updateCompanion(openId, params.data);
      case 'register':
        return await registerCompanion(openId, params.data);
      default:
        throw new Error('未知的操作类型');
    }
  } catch (error) {
    console.error('陪诊师操作失败:', error);
    return {
      code: 500,
      message: error.message || '操作失败'
    };
  }
};

/**
 * 获取陪诊师列表
 */
async function getCompanionList(params) {
  const { keyword, hospitalId, page = 1, pageSize = 10 } = params;
  
  let whereCondition = {};
  
  // 关键词搜索
  if (keyword) {
    whereCondition = _.or([
      { name: db.RegExp({ regexp: keyword, options: 'i' }) },
      { serviceScope: db.RegExp({ regexp: keyword, options: 'i' }) }
    ]);
  }
  
  // 医院筛选
  if (hospitalId) {
    whereCondition['serviceHospitals'] = _.in([hospitalId]);
  }

  const result = await db.collection('companions')
    .where(whereCondition)
    .orderBy('rating', 'desc')
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
 * 通过openId获取陪诊师信息
 */
async function getCompanionByOpenId(openId) {
  const companion = await db.collection('companions')
    .where({
      openId: openId
    })
    .get();
  
  if (companion.data.length === 0) {
    throw new Error('陪诊师不存在');
  }

  const companionData = companion.data[0];

  // 获取评价列表
  const reviews = await db.collection('reviews')
    .where({
      companionId: companionData._id
    })
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  return {
    code: 200,
    data: {
      ...companionData,
      reviews: reviews.data || []
    },
    message: '获取成功'
  };
}

/**
 * 获取陪诊师详情
 */
async function getCompanionDetail(companionId) {
  const companion = await db.collection('companions').doc(companionId).get();
  
  if (!companion.data) {
    throw new Error('陪诊师不存在');
  }

  // 获取评价列表
  const reviews = await db.collection('reviews')
    .where({
      companionId: companionId
    })
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  return {
    code: 200,
    data: {
      ...companion.data,
      reviews: reviews.data || []
    },
    message: '获取成功'
  };
}

/**
 * 注册陪诊师
 */
async function registerCompanion(openId, companionData) {
  // 检查是否已经注册
  const existing = await db.collection('companions')
    .where({
      openId: openId
    })
    .get();

  if (existing.data.length > 0) {
    throw new Error('您已经注册过陪诊师');
  }

  const registerData = {
    ...companionData,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };

  const result = await db.collection('companions').add({
    data: registerData
  });

  // 更新用户类型
  await db.collection('users').where({
    openId: openId
  }).update({
    data: {
      userType: 'companion',
      updatedAt: db.serverDate()
    }
  });

  return {
    code: 200,
    data: {
      companionId: result._id,
      ...registerData
    },
    message: '注册成功，等待审核'
  };
}

/**
 * 更新陪诊师信息
 */
async function updateCompanion(openId, updateData) {
  const companion = await db.collection('companions')
    .where({
      openId: openId
    })
    .get();

  if (companion.data.length === 0) {
    throw new Error('陪诊师不存在');
  }

  const updateParams = {
    ...updateData,
    updatedAt: db.serverDate()
  };

  await db.collection('companions')
    .doc(companion.data[0]._id)
    .update({
      data: updateParams
    });

  return {
    code: 200,
    message: '更新成功'
  };
}

