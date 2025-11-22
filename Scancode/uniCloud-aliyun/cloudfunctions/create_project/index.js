'use strict';

exports.main = async (event, context) => {
	const db = uniCloud.database();
	const { name, description, department_id, owner, owner_id, start_time, end_time, priority } = event;

	// 参数验证
	if (!name || !department_id) {
		return {
			code: 400,
			message: '项目名称和部门ID不能为空'
		};
	}

	try {
		// 创建项目
		const projectData = {
			name,
			description: description || '',
			department_id,
			owner: owner || '',
			owner_id: owner_id || '',
			status: 0, // 0=未开始
			progress: 0,
			priority: priority || 2, // 默认中优先级
			start_time: start_time ? new Date(start_time) : null,
			end_time: end_time ? new Date(end_time) : null,
			actual_end_time: null,
			create_time: new Date(),
			update_time: new Date()
		};

		const result = await db.collection('projects').add(projectData);

		return {
			code: 200,
			message: '项目创建成功',
			data: {
				id: result.id,
				...projectData
			}
		};
	} catch (error) {
		console.error('创建项目失败:', error);
		return {
			code: 500,
			message: '创建项目失败: ' + error.message
		};
	}
};
