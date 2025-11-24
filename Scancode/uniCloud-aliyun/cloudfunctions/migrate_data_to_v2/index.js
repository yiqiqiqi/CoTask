'use strict';

/**
 * 数据迁移脚本 - v1 to v2
 *
 * 主要变更：
 * 1. projects 表添加 members 字段
 * 2. tasks 表添加 created_by, created_by_name, assigned_time 字段
 *
 * 执行前请确保已备份数据！
 */

exports.main = async (event, context) => {
  const db = uniCloud.database()
  const _ = db.command

  console.log('========================================')
  console.log('开始数据迁移 v1 -> v2')
  console.log('时间:', new Date().toLocaleString())
  console.log('========================================')

  const migrationResults = {
    projects: {
      total: 0,
      success: 0,
      failed: 0,
      errors: []
    },
    tasks: {
      total: 0,
      success: 0,
      failed: 0,
      errors: []
    }
  }

  try {
    // ====================================
    // 第一步: 迁移 projects 表
    // ====================================
    console.log('\n[步骤1] 开始迁移 projects 表...')

    const projects = await db.collection('projects').get()
    migrationResults.projects.total = projects.data.length

    console.log(`找到 ${projects.data.length} 个项目需要迁移`)

    for (let i = 0; i < projects.data.length; i++) {
      const project = projects.data[i]

      try {
        console.log(`\n  [${i + 1}/${projects.data.length}] 处理项目: ${project.name}`)

        // 检查是否已经有 members 字段
        if (project.members && Array.isArray(project.members)) {
          console.log('    ⚠️  项目已有 members 字段，跳过')
          migrationResults.projects.success++
          continue
        }

        // 构建成员列表
        const members = []

        // 1. 添加项目负责人作为 owner
        if (project.owner_id) {
          members.push({
            user_id: project.owner_id,
            user_name: project.owner || '未知用户',
            role: 'owner',
            join_time: project.create_time || new Date()
          })
          console.log(`    ✓ 添加项目负责人: ${project.owner}`)
        }

        // 2. 查找项目的所有任务负责人
        const tasks = await db.collection('tasks')
          .where({ project_id: project._id })
          .get()

        console.log(`    找到 ${tasks.data.length} 个任务`)

        // 提取唯一的任务负责人
        const taskOwners = new Map()

        for (let task of tasks.data) {
          if (task.owner_id && !taskOwners.has(task.owner_id)) {
            taskOwners.set(task.owner_id, {
              user_id: task.owner_id,
              user_name: task.owner || '未知用户',
              role: 'member',
              join_time: task.create_time || new Date()
            })
          }
        }

        // 3. 合并成员（去重，不重复添加 owner）
        taskOwners.forEach((memberInfo, userId) => {
          if (!members.find(m => m.user_id === userId)) {
            members.push(memberInfo)
            console.log(`    ✓ 添加任务负责人: ${memberInfo.user_name}`)
          }
        })

        // 4. 更新项目
        await db.collection('projects').doc(project._id).update({
          members: members
        })

        console.log(`    ✅ 项目迁移成功，共 ${members.length} 个成员`)
        migrationResults.projects.success++

      } catch (error) {
        console.error(`    ❌ 项目迁移失败:`, error.message)
        migrationResults.projects.failed++
        migrationResults.projects.errors.push({
          project_id: project._id,
          project_name: project.name,
          error: error.message
        })
      }
    }

    // ====================================
    // 第二步: 迁移 tasks 表
    // ====================================
    console.log('\n[步骤2] 开始迁移 tasks 表...')

    const tasks = await db.collection('tasks').get()
    migrationResults.tasks.total = tasks.data.length

    console.log(`找到 ${tasks.data.length} 个任务需要迁移`)

    for (let i = 0; i < tasks.data.length; i++) {
      const task = tasks.data[i]

      try {
        // 检查是否已经有 created_by 字段
        if (task.created_by) {
          migrationResults.tasks.success++
          continue
        }

        // 添加创建者信息
        // 规则：如果有 owner_id，说明是该负责人自己创建或被分配的，暂时设为owner自己创建
        const updateData = {
          created_by: task.owner_id || '',
          created_by_name: task.owner || '系统',
          assigned_time: task.create_time || new Date()
        }

        await db.collection('tasks').doc(task._id).update(updateData)

        migrationResults.tasks.success++

        if ((i + 1) % 10 === 0) {
          console.log(`  处理进度: ${i + 1}/${tasks.data.length}`)
        }

      } catch (error) {
        console.error(`  ❌ 任务 ${task._id} 迁移失败:`, error.message)
        migrationResults.tasks.failed++
        migrationResults.tasks.errors.push({
          task_id: task._id,
          task_name: task.name,
          error: error.message
        })
      }
    }

    console.log(`  ✅ 任务表迁移完成`)

    // ====================================
    // 迁移完成统计
    // ====================================
    console.log('\n========================================')
    console.log('迁移完成！')
    console.log('========================================')
    console.log('\n项目表 (projects):')
    console.log(`  总数: ${migrationResults.projects.total}`)
    console.log(`  成功: ${migrationResults.projects.success}`)
    console.log(`  失败: ${migrationResults.projects.failed}`)

    console.log('\n任务表 (tasks):')
    console.log(`  总数: ${migrationResults.tasks.total}`)
    console.log(`  成功: ${migrationResults.tasks.success}`)
    console.log(`  失败: ${migrationResults.tasks.failed}`)

    if (migrationResults.projects.failed > 0 || migrationResults.tasks.failed > 0) {
      console.log('\n⚠️  存在失败记录，请检查错误详情')
    }

    return {
      code: 200,
      message: '数据迁移完成',
      data: migrationResults
    }

  } catch (error) {
    console.error('\n❌ 迁移过程中发生错误:', error)
    return {
      code: 500,
      message: '迁移失败: ' + error.message,
      data: migrationResults
    }
  }
}
