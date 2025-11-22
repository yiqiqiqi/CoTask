'use strict';

exports.main = async (event, context) => {
	const db = uniCloud.database();
	const { task_id } = event;

	// 参数验证
	if (!task_id) {
		return {
			code: 400,
			message: '任务ID不能为空'
		};
	}

	try {
		// 获取任务详情
		const taskResult = await db.collection('tasks')
			.doc(task_id)
			.get();

		if (!taskResult.data || taskResult.data.length === 0) {
			return {
				code: 404,
				message: '任务不存在'
			};
		}

		const task = taskResult.data[0];

		// 获取所属项目信息
		let project = null;
		if (task.project_id) {
			const projectResult = await db.collection('projects')
				.doc(task.project_id)
				.field({ name: true, department_id: true })
				.get();

			if (projectResult.data && projectResult.data.length > 0) {
				project = projectResult.data[0];
			}
		}

		return {
			code: 200,
			message: '获取成功',
			data: {
				task,
				project
			}
		};
	} catch (error) {
		console.error('获取任务详情失败:', error);
		return {
			code: 500,
			message: '获取任务详情失败: ' + error.message
		};
	}
};
