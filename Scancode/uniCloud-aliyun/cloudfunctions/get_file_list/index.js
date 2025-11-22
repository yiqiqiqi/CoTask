'use strict';
exports.main = async () => {
  const db = uniCloud.database()
  const res = await db.collection('file-records')
    .field({ 
      name: true,
      createTime: true,
      status: true
    })
    .orderBy('createTime', 'desc')
    .get()
    
  return { code: 0, data: res.data }
} 