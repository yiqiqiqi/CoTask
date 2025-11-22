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
		// 检查任务是否存在
		const existResult = await db.collection('tasks')
			.doc(task_id)
			.get();

		if (!existResult.data || existResult.data.length === 0) {
			return {
				code: 404,
				message: '任务不存在'
			};
		}

		const task = existResult.data[0];

		// 删除任务相关的进度记录
		await db.collection('progress_records')
			.where({
				target_type: 'task',
				target_id: task_id
			})
			.remove();

		// 删除任务相关的图片索引
		await db.collection('image_index')
			.where({
				target_type: 'task',
				target_id: task_id
			})
			.remove();

		// 删除任务
		await db.collection('tasks')
			.doc(task_id)
			.remove();

		// 更新所属项目的更新时间
		await db.collection('projects')
			.doc(task.project_id)
			.update({
				update_time: new Date()
			});

		return {
			code: 200,
			message: '删除成功'
		};
	} catch (error) {
		console.error('删除任务失败:', error);
		return {
			code: 500,
			message: '删除任务失败: ' + error.message
		};
	}
};
