'use strict';

/**
 * 获取我参与的项目
 * 返回用户参与的所有项目，每个项目附带该用户的任务列表和统计
 */

exports.main = async (event, context) => {
  const { user_id, status } = event
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
      'members.user_id': user_id
    }

    // 如果指定了状态，添加状态筛选
    if (status !== undefined && status !== null) {
      where.status = parseInt(status)
    }

    // 查询用户参与的项目
    const projectsRes = await db.collection('projects')
      .where(where)
      .orderBy('update_time', 'desc')
      .get()

    const projects = projectsRes.data || []

    // 为每个项目获取该用户的任务
    for (let project of projects) {
      // 获取该用户在该项目中的任务
      const myTasksRes = await db.collection('tasks')
        .where({
          project_id: project._id,
          owner_id: user_id
        })
        .orderBy('create_time', 'desc')
        .get()

      project.my_tasks = myTasksRes.data || []

      // 计算该用户在该项目的任务统计
      const myTasks = project.my_tasks
      project.my_task_stats = {
        total: myTasks.length,
        completed: myTasks.filter(t => t.status === 2).length,
        in_progress: myTasks.filter(t => t.status === 1).length,
        pending: myTasks.filter(t => t.status === 0).length
      }
    }

    return {
      code: 200,
      message: '获取成功',
      data: projects
    }

  } catch (error) {
    console.error('获取我的项目失败:', error)
    return {
      code: 500,
      message: '获取失败: ' + error.message
    }
  }
}
