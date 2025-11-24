'use strict';
const { isProjectOwner, isProjectMember } = require('../common/permission')

exports.main = async (event, context) => {
	const db = uniCloud.database();
	const {
		project_id,
		name,
		description,
		owner,
		owner_id,
		current_user_id,    // 当前操作用户ID
		current_user_name,  // 当前操作用户姓名
		priority,
		start_time,
		due_time
	} = event;

	// 参数验证
	if (!project_id || !name) {
		return {
			code: 400,
			message: '项目ID和任务名称不能为空'
		};
	}

	if (!owner_id) {
		return {
			code: 400,
			message: '任务负责人不能为空'
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

		// 权限验证
		const operatorId = current_user_id || owner_id

		// 情况1: 自己给自己创建任务（任何项目成员都可以）
		if (owner_id === operatorId) {
			const isMember = await isProjectMember(db, project_id, operatorId)
			if (!isMember) {
				return {
					code: 403,
					message: '您不是该项目成员，无法创建任务'
				}
			}
		}
		// 情况2: 给别人分配任务（只有项目Owner可以）
		else {
			const isOwner = await isProjectOwner(db, project_id, operatorId)
			if (!isOwner) {
				return {
					code: 403,
					message: '只有项目管理员可以分配任务给其他成员'
				}
			}

			// 检查被分配人是否是项目成员
			const targetIsMember = await isProjectMember(db, project_id, owner_id)
			if (!targetIsMember) {
				return {
					code: 400,
					message: '被分配人不是项目成员'
				}
			}
		}

		// 创建任务
		const taskData = {
			project_id,
			name,
			description: description || '',
			owner: owner || '',
			owner_id: owner_id || '',

			// 记录分配者信息
			created_by: operatorId,
			created_by_name: current_user_name || owner,
			assigned_time: new Date(),

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
