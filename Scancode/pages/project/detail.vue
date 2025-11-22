<template>
	<view class="project-detail-container">
		<!-- 项目头部信息 -->
		<view class="project-header">
			<view class="header-top">
				<text class="project-name">{{ project.name }}</text>
				<view class="status-badge" :class="'status-' + project.status">
					{{ getStatusText(project.status) }}
				</view>
			</view>

			<text class="project-desc" v-if="project.description">{{ project.description }}</text>

			<view class="project-meta">
				<view class="meta-item">
					<text class="meta-label">负责人:</text>
					<text class="meta-value">{{ project.owner || '未指定' }}</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">优先级:</text>
					<text class="meta-value" :class="'priority-' + project.priority">
						{{ getPriorityText(project.priority) }}
					</text>
				</view>
			</view>

			<view class="project-meta">
				<view class="meta-item">
					<text class="meta-label">开始时间:</text>
					<text class="meta-value">{{ formatDate(project.start_time) || '未设置' }}</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">预计完成:</text>
					<text class="meta-value">{{ formatDate(project.end_time) || '未设置' }}</text>
				</view>
			</view>

			<!-- 进度条 -->
			<view class="progress-section">
				<view class="progress-header">
					<text class="progress-label">整体进度</text>
					<text class="progress-value">{{ project.progress || 0 }}%</text>
				</view>
				<view class="progress-bar">
					<view
						class="progress-fill"
						:style="{ width: (project.progress || 0) + '%' }"
					></view>
				</view>
			</view>

			<!-- 操作按钮 -->
			<view class="action-buttons">
				<button class="action-btn" @click="editProject">编辑项目</button>
				<button class="action-btn primary" @click="addTask">+ 添加任务</button>
			</view>

			<!-- 更多操作 -->
			<view class="more-actions">
				<button class="delete-btn" @click="deleteProject">删除项目</button>
			</view>
		</view>

		<!-- 任务统计 -->
		<view class="task-stats">
			<view class="stat-item">
				<text class="stat-number">{{ taskStats.total }}</text>
				<text class="stat-label">总任务</text>
			</view>
			<view class="stat-item">
				<text class="stat-number" style="color: #1890FF;">{{ taskStats.inProgress }}</text>
				<text class="stat-label">进行中</text>
			</view>
			<view class="stat-item">
				<text class="stat-number" style="color: #52c41a;">{{ taskStats.completed }}</text>
				<text class="stat-label">已完成</text>
			</view>
			<view class="stat-item">
				<text class="stat-number" style="color: #f5222d;">{{ taskStats.delayed }}</text>
				<text class="stat-label">延期</text>
			</view>
		</view>

		<!-- 任务列表 -->
		<view class="tasks-section">
			<view class="section-header">
				<text class="section-title">任务列表</text>
			</view>

			<view class="empty-state" v-if="tasks.length === 0">
				<text class="empty-text">暂无任务</text>
				<text class="empty-hint">点击"添加任务"开始创建</text>
			</view>

			<view class="task-list" v-else>
				<view
					class="task-card"
					v-for="task in tasks"
					:key="task._id"
					@click="goToTask(task)"
				>
					<view class="task-header">
						<text class="task-name">{{ task.name }}</text>
						<view class="task-status" :class="'status-' + task.status">
							{{ getTaskStatusText(task.status) }}
						</view>
					</view>

					<text class="task-desc" v-if="task.description">{{ task.description }}</text>

					<view class="task-footer">
						<text class="task-owner">{{ task.owner || '未指派' }}</text>
						<text class="task-progress">{{ task.progress || 0 }}%</text>
					</view>

					<view class="task-progress-bar">
						<view
							class="progress-fill"
							:style="{ width: (task.progress || 0) + '%' }"
						></view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			projectId: '',
			project: {},
			tasks: [],
			taskStats: {
				total: 0,
				notStarted: 0,
				inProgress: 0,
				completed: 0,
				delayed: 0
			}
		}
	},
	onLoad(options) {
		this.projectId = options.id
		this.loadProjectDetail()
	},
	onShow() {
		// 从其他页面返回时重新加载数据
		if (this.projectId) {
			this.loadProjectDetail()
		}
	},
	onPullDownRefresh() {
		this.loadProjectDetail().then(() => {
			uni.stopPullDownRefresh()
		})
	},
	methods: {
		async loadProjectDetail() {
			uni.showLoading({ title: '加载中...' })

			try {
				const res = await uniCloud.callFunction({
					name: 'get_project_detail',
					data: {
						project_id: this.projectId
					}
				})

				if (res.result.code === 200) {
					this.project = res.result.data.project
					this.tasks = res.result.data.tasks
					this.taskStats = res.result.data.taskStats
				} else {
					uni.showToast({
						title: res.result.message,
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('加载项目详情失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		},
		editProject() {
			uni.navigateTo({
				url: '/pages/project/form?id=' + this.projectId
			})
		},
		addTask() {
			uni.navigateTo({
				url: '/pages/task/form?project_id=' + this.projectId
			})
		},
		goToTask(task) {
			uni.navigateTo({
				url: '/pages/task/detail?id=' + task._id
			})
		},
		formatDate(date) {
			if (!date) return ''
			const d = new Date(date)
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
		},
		getStatusText(status) {
			const map = {
				0: '未开始',
				1: '进行中',
				2: '已完成',
				3: '已暂停'
			}
			return map[status] || '未知'
		},
		getPriorityText(priority) {
			const map = {
				1: '低',
				2: '中',
				3: '高'
			}
			return map[priority] || '中'
		},
		getTaskStatusText(status) {
			const map = {
				0: '待开始',
				1: '进行中',
				2: '已完成',
				3: '延期'
			}
			return map[status] || '未知'
		},
		deleteProject() {
			uni.showModal({
				title: '确认删除',
				content: `确定要删除项目"${this.project.name}"吗？\n\n此操作将同时删除所有子任务和进度记录，且不可恢复！`,
				confirmText: '确认删除',
				confirmColor: '#f5222d',
				success: async (res) => {
					if (res.confirm) {
						await this.performDelete()
					}
				}
			})
		},
		async performDelete() {
			uni.showLoading({ title: '删除中...' })

			try {
				const res = await uniCloud.callFunction({
					name: 'delete_project',
					data: {
						project_id: this.projectId
					}
				})

				if (res.result.code === 200) {
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})

					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				} else {
					uni.showToast({
						title: res.result.message || '删除失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('删除项目失败:', error)
				uni.showToast({
					title: '删除失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.project-detail-container {
	min-height: 100vh;
	background: #F5F5F5;
	padding-bottom: 20px;
}

.project-header {
	background: #FFFFFF;
	padding: 20px;
	margin-bottom: 12px;

	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12px;

		.project-name {
			flex: 1;
			font-size: 22px;
			font-weight: bold;
			color: #333333;
			margin-right: 12px;
		}

		.status-badge {
			padding: 4px 12px;
			border-radius: 12px;
			font-size: 12px;
			white-space: nowrap;

			&.status-0 {
				background: #F0F0F0;
				color: #999999;
			}

			&.status-1 {
				background: #E6F7FF;
				color: #1890FF;
			}

			&.status-2 {
				background: #F6FFED;
				color: #52c41a;
			}

			&.status-3 {
				background: #FFF7E6;
				color: #faad14;
			}
		}
	}

	.project-desc {
		display: block;
		font-size: 14px;
		color: #666666;
		line-height: 1.6;
		margin-bottom: 16px;
	}

	.project-meta {
		display: flex;
		gap: 24px;
		margin-bottom: 12px;

		.meta-item {
			font-size: 14px;

			.meta-label {
				color: #999999;
				margin-right: 8px;
			}

			.meta-value {
				color: #333333;

				&.priority-1 {
					color: #52c41a;
				}

				&.priority-2 {
					color: #1890FF;
				}

				&.priority-3 {
					color: #f5222d;
				}
			}
		}
	}

	.progress-section {
		margin: 20px 0;

		.progress-header {
			display: flex;
			justify-content: space-between;
			margin-bottom: 8px;

			.progress-label {
				font-size: 14px;
				color: #666666;
			}

			.progress-value {
				font-size: 16px;
				font-weight: bold;
				color: #1890FF;
			}
		}

		.progress-bar {
			height: 8px;
			background: #F0F0F0;
			border-radius: 4px;
			overflow: hidden;

			.progress-fill {
				height: 100%;
				background: linear-gradient(90deg, #1890FF, #52c41a);
				transition: width 0.3s;
			}
		}
	}

	.action-buttons {
		display: flex;
		gap: 12px;
		margin-top: 20px;

		.action-btn {
			flex: 1;
			height: 44px;
			background: #F5F5F5;
			color: #666666;
			border-radius: 8px;
			font-size: 15px;

			&.primary {
				background: #1890FF;
				color: #FFFFFF;
			}
		}
	}

	.more-actions {
		margin-top: 12px;

		.delete-btn {
			width: 100%;
			height: 40px;
			background: #FFFFFF;
			color: #f5222d;
			border: 1px solid #f5222d;
			border-radius: 8px;
			font-size: 14px;
		}
	}
}

.task-stats {
	background: #FFFFFF;
	padding: 16px 20px;
	display: flex;
	justify-content: space-around;
	margin-bottom: 12px;

	.stat-item {
		text-align: center;

		.stat-number {
			display: block;
			font-size: 24px;
			font-weight: bold;
			color: #333333;
			margin-bottom: 4px;
		}

		.stat-label {
			display: block;
			font-size: 12px;
			color: #999999;
		}
	}
}

.tasks-section {
	background: #FFFFFF;
	padding: 20px;

	.section-header {
		margin-bottom: 16px;

		.section-title {
			font-size: 16px;
			font-weight: bold;
			color: #333333;
		}
	}

	.empty-state {
		text-align: center;
		padding: 40px 20px;

		.empty-text {
			display: block;
			font-size: 16px;
			color: #999999;
			margin-bottom: 8px;
		}

		.empty-hint {
			display: block;
			font-size: 14px;
			color: #CCCCCC;
		}
	}

	.task-list {
		.task-card {
			background: #F5F5F5;
			border-radius: 12px;
			padding: 16px;
			margin-bottom: 12px;

			.task-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 8px;

				.task-name {
					flex: 1;
					font-size: 16px;
					font-weight: bold;
					color: #333333;
					margin-right: 12px;
				}

				.task-status {
					padding: 2px 8px;
					border-radius: 4px;
					font-size: 12px;

					&.status-0 {
						background: #FFFFFF;
						color: #999999;
					}

					&.status-1 {
						background: #E6F7FF;
						color: #1890FF;
					}

					&.status-2 {
						background: #F6FFED;
						color: #52c41a;
					}

					&.status-3 {
						background: #FFF1F0;
						color: #f5222d;
					}
				}
			}

			.task-desc {
				display: block;
				font-size: 14px;
				color: #666666;
				margin-bottom: 12px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.task-footer {
				display: flex;
				justify-content: space-between;
				font-size: 12px;
				color: #999999;
				margin-bottom: 8px;
			}

			.task-progress-bar {
				height: 4px;
				background: #E8E8E8;
				border-radius: 2px;
				overflow: hidden;

				.progress-fill {
					height: 100%;
					background: #1890FF;
					transition: width 0.3s;
				}
			}
		}
	}
}
</style>
