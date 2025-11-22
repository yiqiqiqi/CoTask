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
		// 查询项目基本信息
		const projectResult = await db.collection('projects')
			.doc(project_id)
			.get();

		if (!projectResult.data || projectResult.data.length === 0) {
			return {
				code: 404,
				message: '项目不存在'
			};
		}

		const project = projectResult.data[0];

		// 查询项目的任务列表
		const tasksResult = await db.collection('tasks')
			.where({ project_id })
			.orderBy('create_time', 'desc')
			.get();

		// 统计任务数据
		const tasks = tasksResult.data;
		const taskStats = {
			total: tasks.length,
			notStarted: tasks.filter(t => t.status === 0).length,
			inProgress: tasks.filter(t => t.status === 1).length,
			completed: tasks.filter(t => t.status === 2).length,
			delayed: tasks.filter(t => t.status === 3).length
		};

		// 计算项目整体进度（基于任务完成度）
		if (tasks.length > 0) {
			const totalProgress = tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
			project.progress = Math.round(totalProgress / tasks.length);
		}

		return {
			code: 200,
			message: '获取成功',
			data: {
				project,
				tasks,
				taskStats
			}
		};
	} catch (error) {
		console.error('获取项目详情失败:', error);
		return {
			code: 500,
			message: '获取项目详情失败: ' + error.message
		};
	}
};
