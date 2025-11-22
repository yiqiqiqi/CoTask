'use strict';

exports.main = async (event, context) => {
	const db = uniCloud.database();
	const { project_id, ...updateData } = event;

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

		// 准备更新数据
		const dataToUpdate = {
			update_time: new Date()
		};

		// 允许更新的字段
		const allowedFields = [
			'name', 'description', 'owner', 'owner_id',
			'status', 'progress', 'priority',
			'start_time', 'end_time', 'actual_end_time'
		];

		allowedFields.forEach(field => {
			if (updateData[field] !== undefined) {
				// 处理日期字段
				if (['start_time', 'end_time', 'actual_end_time'].includes(field)) {
					dataToUpdate[field] = updateData[field] ? new Date(updateData[field]) : null;
				} else {
					dataToUpdate[field] = updateData[field];
				}
			}
		});

		// 更新项目
		await db.collection('projects')
			.doc(project_id)
			.update(dataToUpdate);

		return {
			code: 200,
			message: '更新成功',
			data: {
				project_id,
				...dataToUpdate
			}
		};
	} catch (error) {
		console.error('更新项目失败:', error);
		return {
			code: 500,
			message: '更新项目失败: ' + error.message
		};
	}
};
