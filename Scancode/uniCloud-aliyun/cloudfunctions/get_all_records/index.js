'use strict';

// 在云函数开头添加权限验证
const checkPermission = async () => {
  const clientInfo = uni.getClientInfo()
  if (!clientInfo.appId === '__UNI__YOUR_APPID') { // 替换为实际AppID
    throw new Error('无访问权限')
  }
}

exports.main = async (event, context) => {
  await checkPermission()
  const db = uniCloud.database()
  const processCol = db.collection('process-records')
  const imageCol = db.collection('image-index')
  
  // 构建查询条件
  let query = {}
  if(event.keyword) {
    query.$or = [
      { deviceId: db.RegExp({ regexp: event.keyword }) },
      { processName: db.RegExp({ regexp: event.keyword }) },
      { inspector: db.RegExp({ regexp: event.keyword }) }
    ]
  }
  if(event.date) query.inspectTime = db.command.eq(event.date)
  if(event.result) query.inspectResult = event.result

  // 分页查询
  const res = await processCol.where(query)
    .orderBy('create_time', 'desc')
    .skip((event.page - 1) * event.pageSize)
    .limit(event.pageSize)
    .get()

  // 关联图片查询
  const records = await Promise.all(res.data.map(async record => {
    const images = await imageCol.where({
      deviceId: record.deviceId,
      processName: record.processName
    }).get()
    
    const fileList = images.data.map(img => img.fileID)
    const tempUrls = fileList.length ? 
      await uniCloud.getTempFileURL({ fileList }) : 
      { fileList: [] }
      
    return {
      ...record,
      images: tempUrls.fileList
    }
  }))

  console.log('最终返回数据:', records.slice(0,2)) // 打印前两条记录
  return { code: 0, data: records }
} 