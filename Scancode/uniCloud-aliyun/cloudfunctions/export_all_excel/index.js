'use strict';
const XLSX = require('xlsx'); // 引入 xlsx 库

exports.main = async (event, context) => {
  const db = uniCloud.database();
  const collection = db.collection('process-records');
  
  try {
    // 分页查询所有记录，避免一次性查询导致内存压力或超时
    let records = [];
    const limit = 1000;
    let skip = 0;
    while (true) {
      let res = await collection.skip(skip).limit(limit).get();
      if (res.data && res.data.length > 0) {
        records = records.concat(res.data);
        if (res.data.length < limit) break;
        skip += limit;
      } else {
        break;
      }
    }
    if (!records || records.length === 0) {
      return {
        code: -1,
        msg: '暂无数据导出'
      };
    }
    
    // 过滤掉不需要导出的字段（例如图片URL和Excel文件ID）
    records = records.map(record => ({
       deviceId: record.deviceId,
       processName: record.processName,
       inspector: record.inspector,
       inspectTime: record.inspectTime,
       inspectResult: record.inspectResult,
       create_time: record.create_time
    }));

    // 生成 Excel 文件，确保导出的数据不包含图片和 Excel 相关字段
    const ws = XLSX.utils.json_to_sheet(records);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "整合记录");
    // 生成 Buffer 数据作为 Excel 文件内容
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    
    // 上传 Excel 文件到云存储，直接传入 Buffer 格式数据
    const uploadResult = await uniCloud.uploadFile({
      cloudPath: `excel_files/all_records_${Date.now()}.xlsx`,
      fileContent: wbout
    });
    
    return {
      code: 0,
      msg: '导出成功',
      data: {
        excelFile: uploadResult.fileID
      }
    };
    
  } catch (e) {
    console.error('导出 Excel 失败：', e);
    return {
      code: -1,
      msg: '导出失败',
      error: e.message
    };
  }
}; 