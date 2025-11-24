'use strict';
const { canEditTask } = require('../common/permission')

exports.main = async (event, context) => {
	const db = uniCloud.database();
	const { task_id, current_user_id, ...updateData } = event;

	// 参数验证
	if (!task_id) {
		return {
			code: 400,
			message: '任务ID不能为空'
		};
	}

	if (!current_user_id) {
		return {
			code: 400,
			message: '用户ID不能为空'
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

		// 权限验证：项目Owner 或 任务负责人本人
		const canEdit = await canEditTask(db, task_id, current_user_id)
		if (!canEdit) {
			return {
				code: 403,
				message: '无权限修改此任务（只有项目管理员或任务负责人可以修改）'
			}
		}

		// 准备更新数据
		const dataToUpdate = {
			update_time: new Date()
		};

		// 允许更新的字段
		const allowedFields = [
			'name', 'description',
			'status', 'progress', 'priority',
			'start_time', 'due_time'
		];

		allowedFields.forEach(field => {
			if (updateData[field] !== undefined) {
				// 处理日期字段
				if (['start_time', 'due_time'].includes(field)) {
					dataToUpdate[field] = updateData[field] ? new Date(updateData[field]) : null;
				} else {
					dataToUpdate[field] = updateData[field];
				}
			}
		});

		// 如果状态变为已完成，自动设置完成时间和进度
		if (updateData.status === 2 && !task.complete_time) {
			dataToUpdate.complete_time = new Date();
			dataToUpdate.progress = 100;
		}

		// 更新任务
		await db.collection('tasks')
			.doc(task_id)
			.update(dataToUpdate);

		// 更新所属项目的更新时间
		await db.collection('projects')
			.doc(task.project_id)
			.update({
				update_time: new Date()
			});

		return {
			code: 200,
			message: '更新成功',
			data: {
				task_id,
				...dataToUpdate
			}
		};
	} catch (error) {
		console.error('更新任务失败:', error);
		return {
			code: 500,
			message: '更新任务失败: ' + error.message
		};
	}
};
