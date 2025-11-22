'use strict';

exports.main = async (event, context) => {
	const db = uniCloud.database();
	const { department_id, status, keyword, page = 1, pageSize = 20 } = event;

	// 参数验证
	if (!department_id) {
		return {
			code: 400,
			message: '部门ID不能为空'
		};
	}

	try {
		// 构建查询条件
		const where = { department_id };

		// 状态筛选
		if (status !== undefined && status !== null && status !== '') {
			where.status = parseInt(status);
		}

		// 关键词搜索（项目名称或负责人）
		if (keyword) {
			const dbCmd = db.command;
			where.$or = [
				{ name: new RegExp(keyword, 'i') },
				{ owner: new RegExp(keyword, 'i') }
			];
		}

		// 查询项目列表
		const collection = db.collection('projects');

		// 获取总数
		const countResult = await collection.where(where).count();
		const total = countResult.total;

		// 分页查询
		const skip = (page - 1) * pageSize;
		const result = await collection
			.where(where)
			.orderBy('update_time', 'desc')
			.skip(skip)
			.limit(pageSize)
			.get();

		return {
			code: 200,
			message: '获取成功',
			data: {
				list: result.data,
				total,
				page,
				pageSize,
				totalPages: Math.ceil(total / pageSize)
			}
		};
	} catch (error) {
		console.error('获取项目列表失败:', error);
		return {
			code: 500,
			message: '获取项目列表失败: ' + error.message
		};
	}
};
