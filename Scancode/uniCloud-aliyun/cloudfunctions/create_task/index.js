'use strict';

exports.main = async (event, context) => {
	const db = uniCloud.database();
	const { project_id, name, description, owner, owner_id, priority, start_time, due_time } = event;

	// 参数验证
	if (!project_id || !name) {
		return {
			code: 400,
			message: '项目ID和任务名称不能为空'
		};
	}

	try {
		// 验证项目是否存在
		const projectResult = await db.collection('projects')
			.doc(project_id)
			.get();

		if (!projectResult.data || projectResult.data.length === 0) {
			return {
				code: 404,
				message: '项目不存在'
			};
		}

		// 创建任务
		const taskData = {
			project_id,
			name,
			description: description || '',
			owner: owner || '',
			owner_id: owner_id || '',
			status: 0, // 0=待开始
			progress: 0,
			priority: priority || 2, // 默认中优先级
			start_time: start_time ? new Date(start_time) : null,
			due_time: due_time ? new Date(due_time) : null,
			complete_time: null,
			create_time: new Date(),
			update_time: new Date()
		};

		const result = await db.collection('tasks').add(taskData);

		// 更新项目的更新时间
		await db.collection('projects')
			.doc(project_id)
			.update({
				update_time: new Date()
			});

		return {
			code: 200,
			message: '任务创建成功',
			data: {
				id: result.id,
				...taskData
			}
		};
	} catch (error) {
		console.error('创建任务失败:', error);
		return {
			code: 500,
			message: '创建任务失败: ' + error.message
		};
	}
};
