'use strict';

exports.main = async (event, context) => {
	const db = uniCloud.database();
	const { department_id } = event;

	// 参数验证
	if (!department_id) {
		return {
			code: 400,
			message: '部门ID不能为空'
		};
	}

	try {
		// 获取项目统计
		const projectsResult = await db.collection('projects')
			.where({ department_id })
			.get();

		const projects = projectsResult.data;

		// 项目状态统计
		const projectStats = {
			total: projects.length,
			notStarted: projects.filter(p => p.status === 0).length,
			inProgress: projects.filter(p => p.status === 1).length,
			completed: projects.filter(p => p.status === 2).length,
			paused: projects.filter(p => p.status === 3).length
		};

		// 项目优先级统计
		const priorityStats = {
			low: projects.filter(p => p.priority === 1).length,
			medium: projects.filter(p => p.priority === 2).length,
			high: projects.filter(p => p.priority === 3).length
		};

		// 计算平均进度
		const totalProgress = projects.reduce((sum, p) => sum + (p.progress || 0), 0);
		const avgProgress = projects.length > 0 ? Math.round(totalProgress / projects.length) : 0;

		// 获取所有项目的任务
		const projectIds = projects.map(p => p._id);
		let tasks = [];

		if (projectIds.length > 0) {
			const tasksResult = await db.collection('tasks')
				.where({
					project_id: db.command.in(projectIds)
				})
				.get();
			tasks = tasksResult.data;
		}

		// 任务状态统计
		const taskStats = {
			total: tasks.length,
			notStarted: tasks.filter(t => t.status === 0).length,
			inProgress: tasks.filter(t => t.status === 1).length,
			completed: tasks.filter(t => t.status === 2).length,
			delayed: tasks.filter(t => t.status === 3).length
		};

		// 获取进度记录统计
		const progressRecordsResult = await db.collection('progress_records')
			.where({
				target_type: db.command.in(['task', 'project']),
				target_id: db.command.in([...projectIds, ...tasks.map(t => t._id)])
			})
			.orderBy('create_time', 'desc')
			.limit(10)
			.get();

		// 最近更新的项目（按更新时间排序）
		const recentProjects = projects
			.sort((a, b) => new Date(b.update_time) - new Date(a.update_time))
			.slice(0, 5)
			.map(p => ({
				_id: p._id,
				name: p.name,
				progress: p.progress,
				status: p.status,
				update_time: p.update_time
			}));

		// 即将到期的项目
		const now = new Date();
		const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

		const upcomingProjects = projects
			.filter(p => {
				if (!p.end_time || p.status === 2) return false;
				const endTime = new Date(p.end_time);
				return endTime >= now && endTime <= sevenDaysLater;
			})
			.sort((a, b) => new Date(a.end_time) - new Date(b.end_time))
			.slice(0, 5)
			.map(p => ({
				_id: p._id,
				name: p.name,
				progress: p.progress,
				end_time: p.end_time,
				daysLeft: Math.ceil((new Date(p.end_time) - now) / (24 * 60 * 60 * 1000))
			}));

		return {
			code: 200,
			message: '获取成功',
			data: {
				projectStats,
				priorityStats,
				taskStats,
				avgProgress,
				recentUpdates: progressRecordsResult.data,
				recentProjects,
				upcomingProjects
			}
		};
	} catch (error) {
		console.error('获取部门统计失败:', error);
		return {
			code: 500,
			message: '获取部门统计失败: ' + error.message
		};
	}
};
