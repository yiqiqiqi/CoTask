'use strict';

/**
 * 获取项目成员及其任务
 * 返回项目的所有成员列表，每个成员附带其在该项目的任务列表
 */

exports.main = async (event, context) => {
  const { project_id } = event
  const db = uniCloud.database()

  // 参数验证
  if (!project_id) {
    return {
      code: 400,
      message: '项目ID不能为空'
    }
  }

  try {
    // 获取项目信息
    const projectRes = await db.collection('projects')
      .doc(project_id)
      .get()

    if (!projectRes.data || projectRes.data.length === 0) {
      return {
        code: 404,
        message: '项目不存在'
      }
    }

    const project = projectRes.data[0]
    const members = project.members || []

    // 为每个成员获取其在该项目的任务
    for (let member of members) {
      const tasksRes = await db.collection('tasks')
        .where({
          project_id: project_id,
          owner_id: member.user_id
        })
        .orderBy('create_time', 'desc')
        .get()

      member.tasks = tasksRes.data || []

      // 计算该成员的任务统计
      const tasks = member.tasks
      member.task_stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 2).length,
        in_progress: tasks.filter(t => t.status === 1).length,
        pending: tasks.filter(t => t.status === 0).length,
        overdue: tasks.filter(t => t.status === 3).length
      }

      // 计算平均进度
      if (tasks.length > 0) {
        const totalProgress = tasks.reduce((sum, t) => sum + (t.progress || 0), 0)
        member.task_stats.avg_progress = Math.round(totalProgress / tasks.length)
      } else {
        member.task_stats.avg_progress = 0
      }
    }

    // 获取项目的所有任务统计
    const allTasksRes = await db.collection('tasks')
      .where({ project_id: project_id })
      .get()

    const allTasks = allTasksRes.data || []
    const projectStats = {
      total_tasks: allTasks.length,
      total_members: members.length,
      completed_tasks: allTasks.filter(t => t.status === 2).length,
      in_progress_tasks: allTasks.filter(t => t.status === 1).length
    }

    return {
      code: 200,
      message: '获取成功',
      data: {
        project: project,
        members: members,
        project_stats: projectStats
      }
    }

  } catch (error) {
    console.error('获取项目成员任务失败:', error)
    return {
      code: 500,
      message: '获取失败: ' + error.message
    }
  }
}
