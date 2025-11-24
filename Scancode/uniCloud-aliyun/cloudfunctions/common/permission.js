'use strict';

/**
 * 权限控制工具函数库
 *
 * 项目级权限模型：
 * - 项目 Owner: 项目创建者，拥有项目的完全控制权
 * - 项目成员: 项目参与者，可以管理自己的任务
 *
 * 使用方法：
 * const { isProjectOwner, canEditTask } = require('../common/permission')
 */

/**
 * 获取用户在项目中的角色
 * @param {Object} db - 数据库实例
 * @param {String} projectId - 项目ID
 * @param {String} userId - 用户ID
 * @returns {String|null} 'owner' | 'member' | null
 */
async function getUserRoleInProject(db, projectId, userId) {
  try {
    const project = await db.collection('projects')
      .doc(projectId)
      .field({ members: true })
      .get()

    if (!project.data || project.data.length === 0) {
      return null
    }

    const members = project.data[0].members || []
    const member = members.find(m => m.user_id === userId)

    return member ? member.role : null
  } catch (error) {
    console.error('getUserRoleInProject 错误:', error)
    return null
  }
}

/**
 * 检查用户是否是项目Owner
 * @param {Object} db - 数据库实例
 * @param {String} projectId - 项目ID
 * @param {String} userId - 用户ID
 * @returns {Boolean}
 */
async function isProjectOwner(db, projectId, userId) {
  const role = await getUserRoleInProject(db, projectId, userId)
  return role === 'owner'
}

/**
 * 检查用户是否是项目成员（包括owner）
 * @param {Object} db - 数据库实例
 * @param {String} projectId - 项目ID
 * @param {String} userId - 用户ID
 * @returns {Boolean}
 */
async function isProjectMember(db, projectId, userId) {
  const role = await getUserRoleInProject(db, projectId, userId)
  return role === 'owner' || role === 'member'
}

/**
 * 检查用户是否可以编辑任务
 * 规则：项目Owner 或 任务负责人本人
 *
 * @param {Object} db - 数据库实例
 * @param {String} taskId - 任务ID
 * @param {String} userId - 用户ID
 * @returns {Boolean}
 */
async function canEditTask(db, taskId, userId) {
  try {
    // 获取任务信息
    const task = await db.collection('tasks')
      .doc(taskId)
      .field({ project_id: true, owner_id: true })
      .get()

    if (!task.data || task.data.length === 0) {
      return false
    }

    const taskData = task.data[0]

    // 1. 检查是否是任务负责人
    if (taskData.owner_id === userId) {
      return true
    }

    // 2. 检查是否是项目Owner
    const isOwner = await isProjectOwner(db, taskData.project_id, userId)
    return isOwner

  } catch (error) {
    console.error('canEditTask 错误:', error)
    return false
  }
}

/**
 * 检查用户是否可以删除任务
 * 规则：只有项目Owner可以删除任务
 *
 * @param {Object} db - 数据库实例
 * @param {String} taskId - 任务ID
 * @param {String} userId - 用户ID
 * @returns {Boolean}
 */
async function canDeleteTask(db, taskId, userId) {
  try {
    const task = await db.collection('tasks')
      .doc(taskId)
      .field({ project_id: true })
      .get()

    if (!task.data || task.data.length === 0) {
      return false
    }

    return await isProjectOwner(db, task.data[0].project_id, userId)

  } catch (error) {
    console.error('canDeleteTask 错误:', error)
    return false
  }
}

/**
 * 检查用户是否可以分配任务
 * 规则：只有项目Owner可以分配任务给其他成员
 *
 * @param {Object} db - 数据库实例
 * @param {String} projectId - 项目ID
 * @param {String} userId - 用户ID
 * @param {String} targetUserId - 目标用户ID（任务负责人）
 * @returns {Boolean}
 */
async function canAssignTask(db, projectId, userId, targetUserId) {
  try {
    // 如果是给自己创建任务，只需要是项目成员即可
    if (userId === targetUserId) {
      return await isProjectMember(db, projectId, userId)
    }

    // 如果是给别人分配任务，必须是项目Owner
    return await isProjectOwner(db, projectId, userId)

  } catch (error) {
    console.error('canAssignTask 错误:', error)
    return false
  }
}

/**
 * 检查用户是否可以编辑项目
 * 规则：只有项目Owner可以编辑项目
 *
 * @param {Object} db - 数据库实例
 * @param {String} projectId - 项目ID
 * @param {String} userId - 用户ID
 * @returns {Boolean}
 */
async function canEditProject(db, projectId, userId) {
  return await isProjectOwner(db, projectId, userId)
}

/**
 * 检查用户是否可以删除项目
 * 规则：只有项目Owner可以删除项目
 *
 * @param {Object} db - 数据库实例
 * @param {String} projectId - 项目ID
 * @param {String} userId - 用户ID
 * @returns {Boolean}
 */
async function canDeleteProject(db, projectId, userId) {
  return await isProjectOwner(db, projectId, userId)
}

/**
 * 检查用户是否可以管理项目成员
 * 规则：只有项目Owner可以添加/移除成员
 *
 * @param {Object} db - 数据库实例
 * @param {String} projectId - 项目ID
 * @param {String} userId - 用户ID
 * @returns {Boolean}
 */
async function canManageMembers(db, projectId, userId) {
  return await isProjectOwner(db, projectId, userId)
}

module.exports = {
  getUserRoleInProject,
  isProjectOwner,
  isProjectMember,
  canEditTask,
  canDeleteTask,
  canAssignTask,
  canEditProject,
  canDeleteProject,
  canManageMembers
}
