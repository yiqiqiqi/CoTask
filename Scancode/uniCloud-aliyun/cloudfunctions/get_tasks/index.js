'use strict';

exports.main = async (event, context) => {
	const db = uniCloud.database();
	const { project_id, status, keyword } = event;

	// 参数验证
	if (!project_id) {
		return {
			code: 400,
			message: '项目ID不能为空'
		};
	}

	try {
		// 构建查询条件
		const where = { project_id };

		// 状态筛选
		if (status !== undefined && status !== null && status !== '') {
			where.status = parseInt(status);
		}

		// 关键词搜索
		if (keyword) {
			const dbCmd = db.command;
			where.$or = [
				{ name: new RegExp(keyword, 'i') },
				{ owner: new RegExp(keyword, 'i') }
			];
		}

		// 查询任务列表
		const result = await db.collection('tasks')
			.where(where)
			.orderBy('create_time', 'desc')
			.get();

		return {
			code: 200,
			message: '获取成功',
			data: {
				list: result.data,
				total: result.data.length
			}
		};
	} catch (error) {
		console.error('获取任务列表失败:', error);
		return {
			code: 500,
			message: '获取任务列表失败: ' + error.message
		};
	}
};
