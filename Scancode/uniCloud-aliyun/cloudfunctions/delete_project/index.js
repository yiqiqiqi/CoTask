'use strict';

exports.main = async (event, context) => {
	const db = uniCloud.database();
	const { project_id } = event;

	// 参数验证
	if (!project_id) {
		return {
			code: 400,
			message: '项目ID不能为空'
		};
	}

	try {
		// 检查项目是否存在
		const existResult = await db.collection('projects')
			.doc(project_id)
			.get();

		if (!existResult.data || existResult.data.length === 0) {
			return {
				code: 404,
				message: '项目不存在'
			};
		}

		// 获取所有任务ID，用于删除任务相关的进度记录
		const tasksResult = await db.collection('tasks')
			.where({ project_id })
			.field({ _id: true })
			.get();

		const taskIds = tasksResult.data.map(task => task._id);

		// 删除所有任务相关的进度记录
		if (taskIds.length > 0) {
			await db.collection('progress_records')
				.where({
					target_type: 'task',
					target_id: db.command.in(taskIds)
				})
				.remove();

			// 删除所有任务相关的图片索引
			await db.collection('image_index')
				.where({
					target_type: 'task',
					target_id: db.command.in(taskIds)
				})
				.remove();
		}

		// 删除项目相关的所有任务
		await db.collection('tasks')
			.where({ project_id })
			.remove();

		// 删除项目相关的进度记录
		await db.collection('progress_records')
			.where({
				target_type: 'project',
				target_id: project_id
			})
			.remove();

		// 删除项目相关的图片索引
		await db.collection('image_index')
			.where({
				target_type: 'project',
				target_id: project_id
			})
			.remove();

		// 删除项目
		await db.collection('projects')
			.doc(project_id)
			.remove();

		return {
			code: 200,
			message: '删除成功'
		};
	} catch (error) {
		console.error('删除项目失败:', error);
		return {
			code: 500,
			message: '删除项目失败: ' + error.message
		};
	}
};
