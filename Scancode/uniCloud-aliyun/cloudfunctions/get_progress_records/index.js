'use strict';

exports.main = async (event, context) => {
	const db = uniCloud.database();
	const { target_type, target_id, page = 1, pageSize = 50 } = event;

	// 参数验证
	if (!target_type || !target_id) {
		return {
			code: 400,
			message: '目标类型和目标ID不能为空'
		};
	}

	if (!['task', 'project'].includes(target_type)) {
		return {
			code: 400,
			message: '目标类型必须是 task 或 project'
		};
	}

	try {
		// 查询进度记录
		const result = await db.collection('progress_records')
			.where({
				target_type,
				target_id
			})
			.orderBy('create_time', 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.get();

		// 获取总数
		const countResult = await db.collection('progress_records')
			.where({
				target_type,
				target_id
			})
			.count();

		return {
			code: 200,
			message: '获取成功',
			data: {
				list: result.data,
				total: countResult.total,
				page,
				pageSize
			}
		};
	} catch (error) {
		console.error('获取进度记录失败:', error);
		return {
			code: 500,
			message: '获取进度记录失败: ' + error.message
		};
	}
};
