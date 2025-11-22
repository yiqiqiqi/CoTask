'use strict';

exports.main = async (event, context) => {
	const db = uniCloud.database();
	const { target_type, target_id, progress, content, updater, updater_id, images } = event;

	// 参数验证
	if (!target_type || !target_id || progress === undefined) {
		return {
			code: 400,
			message: '目标类型、目标ID和进度值不能为空'
		};
	}

	if (progress < 0 || progress > 100) {
		return {
			code: 400,
			message: '进度值必须在0-100之间'
		};
	}

	try {
		// 创建进度记录
		const recordData = {
			target_type,
			target_id,
			progress: parseInt(progress),
			content: content || '',
			updater: updater || '',
			updater_id: updater_id || '',
			images: images || [],
			create_time: new Date()
		};

		const result = await db.collection('progress_records').add(recordData);

		// 更新任务或项目的进度
		const collection = target_type === 'task' ? 'tasks' : 'projects';
		await db.collection(collection)
			.doc(target_id)
			.update({
				progress: parseInt(progress),
				update_time: new Date()
			});

		// 如果是任务，还需要更新所属项目的更新时间
		if (target_type === 'task') {
			const taskResult = await db.collection('tasks')
				.doc(target_id)
				.get();

			if (taskResult.data && taskResult.data.length > 0) {
				const task = taskResult.data[0];
				await db.collection('projects')
					.doc(task.project_id)
					.update({
						update_time: new Date()
					});
			}
		}

		return {
			code: 200,
			message: '进度更新成功',
			data: {
				id: result.id,
				...recordData
			}
		};
	} catch (error) {
		console.error('添加进度记录失败:', error);
		return {
			code: 500,
			message: '添加进度记录失败: ' + error.message
		};
	}
};
