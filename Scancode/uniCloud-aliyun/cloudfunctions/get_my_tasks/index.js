'use strict';

/**
 * 获取我的所有任务
 * 跨项目查询用户的所有任务，支持状态筛选和分页
 */

exports.main = async (event, context) => {
  const { user_id, status, page = 1, pageSize = 20 } = event
  const db = uniCloud.database()

  // 参数验证
  if (!user_id) {
    return {
      code: 400,
      message: '用户ID不能为空'
    }
  }

  try {
    // 构建查询条件
    let where = {
      owner_id: user_id
    }

    // 如果指定了状态，添加状态筛选
    if (status !== undefined && status !== null) {
      where.status = parseInt(status)
    }

    // 计算跳过的记录数
    const skip = (page - 1) * pageSize

    // 查询任务
    const tasksRes = await db.collection('tasks')
      .where(where)
      .orderBy('due_time', 'asc')  // 按截止时间升序，未设置的排在最后
      .orderBy('create_time', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    const tasks = tasksRes.data || []

    // 为每个任务关联项目信息
    for (let task of tasks) {
      try {
        const projectRes = await db.collection('projects')
          .doc(task.project_id)
          .field({ name: true, status: true })
          .get()

        if (projectRes.data && projectRes.data.length > 0) {
          task.project_name = projectRes.data[0].name
          task.project_status = projectRes.data[0].status
        } else {
          task.project_name = '未知项目'
          task.project_status = 0
        }
      } catch (error) {
        console.error(`获取项目信息失败 (${task.project_id}):`, error)
        task.project_name = '未知项目'
        task.project_status = 0
      }
    }

    // 统计信息（查询所有状态的任务数量）
    const statsRes = await db.collection('tasks')
      .where({ owner_id: user_id })
      .get()

    const allTasks = statsRes.data || []
    const stats = {
      total: allTasks.length,
      pending: allTasks.filter(t => t.status === 0).length,
      inProgress: allTasks.filter(t => t.status === 1).length,
      completed: allTasks.filter(t => t.status === 2).length,
      overdue: allTasks.filter(t => t.status === 3).length
    }

    return {
      code: 200,
      message: '获取成功',
      data: tasks,
      stats: stats,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: allTasks.length,
        hasMore: tasks.length >= pageSize
      }
    }

  } catch (error) {
    console.error('获取我的任务失败:', error)
    return {
      code: 500,
      message: '获取失败: ' + error.message
    }
  }
}
