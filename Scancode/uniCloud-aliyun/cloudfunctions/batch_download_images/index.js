'use strict';
const crypto = require('crypto');
const stream = require('stream');
const zlib = require('zlib');
const archiver = require('archiver');
const { PassThrough } = require('stream');

console.log('Archiver available:', !!require('archiver'));

exports.main = async (event, context) => {
  // 设置超时时间为300秒（需在uniCloud控制台同步调整）
  context.callbackWaitsForEmptyEventLoop = false;
  context.timeout = 300000;
  
  const db = uniCloud.database()
  const collection = db.collection('image-index')
  
  try {
    // 生成唯一下载标识（防止重复请求）
    const downloadId = crypto.randomBytes(16).toString('hex')
    
    // 查询条件（支持设备ID或工序名称）
    const query = {}
    if(event.deviceId) query.deviceId = event.deviceId
    if(event.processName) query.processName = event.processName
    
    // 获取总记录数
    const countRes = await collection.where(query).count();
    const total = countRes.total;
    const BATCH_SIZE = 50; // 减少单次查询量
    let records = [];
    
    // 分页获取所有数据
    for (let page = 0; page * BATCH_SIZE < total; page++) {
      const res = await collection.where(query)
        .field({ fileID: true })
        .orderBy('create_time', 'desc')
        .skip(page * BATCH_SIZE)
        .limit(BATCH_SIZE)
        .get();
      
      if (res.data && res.data.length > 0) {
        records = records.concat(res.data);
      } else {
        break;
      }
    }
    
    // 获取临时下载链接
    const fileList = records.map(item => item.fileID)
    const tempUrls = await uniCloud.getTempFileURL({ fileList })
    
    // 分阶段处理文件（每次处理10个）
    const BATCH_SIZE_FILES = 10;
    let files = [];

    const archive = archiver('zip', {
      zlib: { level: 9 } // 最高压缩级别
    });

    // 创建可写流
    const passThrough = new PassThrough();
    let fileCount = 0;

    // 流式处理文件
    for (let i = 0; i < records.length; i++) {
      const fileStream = await uniCloud.downloadFile({
        fileID: records[i].fileID,
        stream: true // 启用流模式
      });
      
      passThrough.write(fileStream);
      archive.append(passThrough, { name: `image_${i}.jpg` });
      fileCount++;
      
      // 每处理10个文件报告进度
      if (i % 10 === 0) {
        console.log(`已处理 ${i+1}/${records.length}`);
      }
    }

    await new Promise((resolve, reject) => {
      archive.on('error', reject);
      archive.on('end', resolve);
      archive.finalize();
    });

    console.log('开始压缩，文件数量:', files.length);
    const zipResult = await uniCloud.uploadFile({
      cloudPath: `downloads/${event.deviceId}_images_${Date.now()}.zip`,
      fileContent: archive
    });
    console.log('压缩包上传成功:', zipResult.fileID);

    console.log('Archiver version:', require('archiver').VERSION);

    return {
      code: 0,
      data: {
        downloadId,
        fileList: tempUrls.fileList,
        zipUrl: zipResult.fileID
      }
    }
    
  } catch(e) {
    console.error("批量下载失败：", e)
    return { code: -1, msg: '服务异常' }
  }
} 