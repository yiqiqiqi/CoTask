'use strict';
// XLSX 库已不再使用

exports.main = async (event, context) => {
	const db = uniCloud.database()
	const collection = db.collection('process-records')
	const imageCollection = db.collection('image-index')
	
	try {
		// 处理图片索引记录
		if(event.type === 'IMAGE_INDEX'){
			const recordData = {
				...event.data,
				create_time: new Date()
			};
			await imageCollection.add(recordData);
			return { code: 0, msg: '图片索引记录成功' };
		}
		
		// 获取前端传递的数据
		const { deviceId, processName, processData } = event
		
		// 构造要保存到数据库的记录数据
		const recordData = {
			deviceId,
			processName,
			inspector: processData.inspector,
			inspectTime: processData.inspectTime,
			inspectResult: processData.inspectResult,
			create_time: new Date()
		};
		
		// 保存记录到数据库集合 process-records
		const dbResult = await collection.add(recordData);
		
		return {
			code: 0,
			msg: '提交成功',
			data: {
				recordData: recordData,
				dbResult: dbResult
			}
		}
		
	} catch(e) {
		// 记录详细错误日志，便于调试
		console.error("云函数提交失败：", e)
		return {
			code: -1,
			msg: '提交失败',
			error: e.message
		}
	}
}; 