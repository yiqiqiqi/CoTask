<template>
	<view class="my-projects">
		<!-- 统计卡片区域 -->
		<view class="stats-section">
			<view class="stats-cards">
				<view class="stat-card">
					<text class="stat-value">{{ stats.total }}</text>
					<text class="stat-label">参与项目</text>
				</view>
				<view class="stat-card">
					<text class="stat-value">{{ stats.myTasks }}</text>
					<text class="stat-label">我的任务</text>
				</view>
				<view class="stat-card">
					<text class="stat-value">{{ stats.completed }}%</text>
					<text class="stat-label">完成率</text>
				</view>
			</view>
		</view>

		<!-- Tab 切换 -->
		<view class="tabs-section">
			<view class="tabs">
				<view
					v-for="(tab, index) in tabs"
					:key="index"
					:class="['tab', { active: activeTab === index }]"
					@tap="switchTab(index)"
				>
					{{ tab }}
				</view>
			</view>
		</view>

		<!-- 项目列表 -->
		<scroll-view
			class="projects-list"
			scroll-y
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<view v-for="project in filteredProjects" :key="project._id" class="project-item">
				<!-- 项目头部 -->
				<view class="project-header" @tap="toggleExpand(project._id)">
					<view class="left">
						<text class="project-name">{{ project.name }}</text>
						<view :class="['role-badge', myRole(project)]">
							{{ myRole(project) === 'owner' ? '管理员' : '成员' }}
						</view>
					</view>
					<view class="right">
						<text class="task-count">{{ project.my_tasks?.length || 0 }} 个任务</text>
						<text class="expand-icon">{{ expandedIds.includes(project._id) ? '▼' : '▶' }}</text>
					</view>
				</view>

				<!-- 项目进度 -->
				<view class="project-progress">
					<view class="progress-bar">
						<view class="progress-fill" :style="{ width: project.progress + '%' }"></view>
					</view>
					<text class="progress-text">{{ project.progress }}%</text>
				</view>

				<!-- 我的任务列表（展开时显示） -->
				<view v-if="expandedIds.includes(project._id)" class="tasks-list">
					<view
						v-for="task in project.my_tasks"
						:key="task._id"
						class="task-item"
						@tap.stop="viewTask(task._id)"
					>
						<view class="task-header">
							<view :class="['status-dot', `status-${task.status}`]"></view>
							<text class="task-name">{{ task.name }}</text>
						</view>

						<view class="task-meta">
							<view class="meta-item">
								<text class="meta-label">进度:</text>
								<text :class="['meta-value', task.progress === 100 ? 'completed' : '']">
									{{ task.progress }}%
								</text>
							</view>
							<view class="meta-item">
								<text class="meta-label">截止:</text>
								<text :class="['meta-value', isDue(task.due_time) ? 'due' : '']">
									{{ formatDate(task.due_time) }}
								</text>
							</view>
						</view>

						<!-- 快速操作 -->
						<view class="task-actions">
							<button
								class="btn-update"
								size="mini"
								@tap.stop="updateProgress(task)"
							>
								更新进度
							</button>
							<button
								class="btn-detail"
								size="mini"
								type="default"
								@tap.stop="viewTask(task._id)"
							>
								查看详情
							</button>
						</view>
					</view>

					<!-- 空状态 -->
					<view v-if="!project.my_tasks || project.my_tasks.length === 0" class="no-tasks">
						<text class="no-tasks-text">暂无任务</text>
						<button
							v-if="myRole(project) === 'owner'"
							class="btn-assign"
							size="mini"
							@tap.stop="assignTask(project._id)"
						>
							分配任务
						</button>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="!loading && filteredProjects.length === 0" class="empty-state">
				<text class="empty-icon">📝</text>
				<text class="empty-text">
					{{ activeTab === 0 ? '暂无进行中的项目' : activeTab === 1 ? '暂无已完成的项目' : '暂无参与的项目' }}
				</text>
				<button class="btn-goto" @tap="gotoProjectHall">去项目大厅看看</button>
			</view>

			<!-- 加载中 -->
			<view v-if="loading" class="loading">
				<text>加载中...</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: {},
			projects: [],
			activeTab: 0,
			tabs: ['进行中', '已完成', '全部'],
			expandedIds: [],
			stats: {
				total: 0,
				myTasks: 0,
				completed: 0
			},
			loading: false,
			refreshing: false
		}
	},

	computed: {
		filteredProjects() {
			if (this.activeTab === 0) {
				return this.projects.filter(p => p.status === 1)
			} else if (this.activeTab === 1) {
				return this.projects.filter(p => p.status === 2)
			}
			return this.projects
		}
	},

	onLoad() {
		this.userInfo = uni.getStorageSync('userInfo')
		if (!this.userInfo || !this.userInfo.id) {
			uni.reLaunch({ url: '/pages/login/index' })
			return
		}
		this.loadMyProjects()
	},

	onShow() {
		// 从其他页面返回时刷新
		if (this.projects.length > 0) {
			this.loadMyProjects()
		}
	},

	methods: {
		async loadMyProjects() {
			this.loading = true

			try {
				const res = await uniCloud.callFunction({
					name: 'get_my_projects',
					data: {
						user_id: this.userInfo.id
					}
				})

				if (res.result.code === 200) {
					this.projects = res.result.data || []
					this.calculateStats()
				} else {
					uni.showToast({
						title: res.result.message || '加载失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('加载我的项目失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			} finally {
				this.loading = false
				this.refreshing = false
			}
		},

		calculateStats() {
			this.stats.total = this.projects.length

			// 统计我的任务数
			this.stats.myTasks = this.projects.reduce((sum, p) => {
				return sum + (p.my_tasks?.length || 0)
			}, 0)

			// 统计完成率
			if (this.stats.myTasks > 0) {
				const completedTasks = this.projects.reduce((sum, p) => {
					return sum + (p.my_tasks?.filter(t => t.status === 2).length || 0)
				}, 0)
				this.stats.completed = Math.round((completedTasks / this.stats.myTasks) * 100)
			} else {
				this.stats.completed = 0
			}
		},

		switchTab(index) {
			this.activeTab = index
		},

		toggleExpand(projectId) {
			const index = this.expandedIds.indexOf(projectId)
			if (index > -1) {
				this.expandedIds.splice(index, 1)
			} else {
				this.expandedIds.push(projectId)
			}
		},

		myRole(project) {
			if (!project.members) return 'member'
			const member = project.members.find(m => m.user_id === this.userInfo.id)
			return member ? member.role : 'member'
		},

		viewTask(taskId) {
			uni.navigateTo({
				url: `/pages/task/detail?id=${taskId}`
			})
		},

		updateProgress(task) {
			uni.navigateTo({
				url: `/pages/progress/update?taskId=${task._id}&taskName=${task.name}`
			})
		},

		assignTask(projectId) {
			uni.navigateTo({
				url: `/pages/task/form?projectId=${projectId}`
			})
		},

		gotoProjectHall() {
			uni.switchTab({
				url: '/pages/public/projects'
			})
		},

		onRefresh() {
			this.refreshing = true
			this.loadMyProjects()
		},

		formatDate(date) {
			if (!date) return '未设置'
			const d = new Date(date)
			const today = new Date()
			const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24))

			if (diff < 0) {
				return '已逾期'
			} else if (diff === 0) {
				return '今天'
			} else if (diff === 1) {
				return '明天'
			} else if (diff <= 7) {
				return `${diff}天后`
			} else {
				return `${d.getMonth() + 1}/${d.getDate()}`
			}
		},

		isDue(date) {
			if (!date) return false
			const d = new Date(date)
			const today = new Date()
			const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
			return diff <= 3 && diff >= 0
		}
	}
}
</script>

<style lang="scss" scoped>
.my-projects {
	min-height: 100vh;
	background: #F5F5F5;
	padding-bottom: calc(env(safe-area-inset-bottom) + 100rpx);
}

.stats-section {
	background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
	padding: 40rpx 30rpx;

	.stats-cards {
		display: flex;
		gap: 20rpx;

		.stat-card {
			flex: 1;
			background: rgba(255, 255, 255, 0.2);
			border-radius: 16rpx;
			padding: 30rpx 20rpx;
			text-align: center;
			backdrop-filter: blur(10rpx);

			.stat-value {
				display: block;
				font-size: 48rpx;
				font-weight: bold;
				color: #FFFFFF;
				margin-bottom: 8rpx;
			}

			.stat-label {
				font-size: 24rpx;
				color: rgba(255, 255, 255, 0.9);
			}
		}
	}
}

.tabs-section {
	background: #FFFFFF;
	padding: 0 30rpx;

	.tabs {
		display: flex;
		border-bottom: 2rpx solid #F0F0F0;

		.tab {
			flex: 1;
			text-align: center;
			padding: 30rpx 0;
			font-size: 30rpx;
			color: #666666;
			position: relative;
			transition: all 0.3s;

			&.active {
				color: #1890FF;
				font-weight: bold;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 60rpx;
					height: 4rpx;
					background: #1890FF;
					border-radius: 2rpx;
				}
			}
		}
	}
}

.projects-list {
	height: calc(100vh - 380rpx);
	padding: 20rpx 30rpx;
}

.project-item {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.project-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;

	.left {
		flex: 1;
		display: flex;
		align-items: center;

		.project-name {
			font-size: 32rpx;
			font-weight: bold;
			color: #333333;
			margin-right: 12rpx;
		}

		.role-badge {
			padding: 4rpx 12rpx;
			border-radius: 8rpx;
			font-size: 22rpx;

			&.owner {
				background: #FFF7E6;
				color: #FA8C16;
			}

			&.member {
				background: #E6F7FF;
				color: #1890FF;
			}
		}
	}

	.right {
		display: flex;
		align-items: center;

		.task-count {
			font-size: 24rpx;
			color: #999999;
			margin-right: 12rpx;
		}

		.expand-icon {
			font-size: 24rpx;
			color: #999999;
		}
	}
}

.project-progress {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;

	.progress-bar {
		flex: 1;
		height: 12rpx;
		background: #F0F0F0;
		border-radius: 6rpx;
		overflow: hidden;
		margin-right: 16rpx;

		.progress-fill {
			height: 100%;
			background: linear-gradient(90deg, #667EEA 0%, #764BA2 100%);
			border-radius: 6rpx;
			transition: width 0.3s;
		}
	}

	.progress-text {
		font-size: 24rpx;
		color: #667EEA;
		font-weight: bold;
		min-width: 80rpx;
		text-align: right;
	}
}

.tasks-list {
	border-top: 2rpx solid #F0F0F0;
	padding-top: 20rpx;
}

.task-item {
	background: #F9FAFB;
	border-radius: 12rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;

	&:last-child {
		margin-bottom: 0;
	}

	.task-header {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;

		.status-dot {
			width: 16rpx;
			height: 16rpx;
			border-radius: 50%;
			margin-right: 12rpx;

			&.status-0 { background: #D9D9D9; }
			&.status-1 { background: #1890FF; }
			&.status-2 { background: #52C41A; }
			&.status-3 { background: #FF4D4F; }
		}

		.task-name {
			flex: 1;
			font-size: 28rpx;
			color: #333333;
			font-weight: 500;
		}
	}

	.task-meta {
		display: flex;
		margin-bottom: 16rpx;

		.meta-item {
			flex: 1;
			font-size: 24rpx;

			.meta-label {
				color: #999999;
				margin-right: 8rpx;
			}

			.meta-value {
				color: #666666;

				&.completed {
					color: #52C41A;
					font-weight: bold;
				}

				&.due {
					color: #FF4D4F;
				}
			}
		}
	}

	.task-actions {
		display: flex;
		gap: 16rpx;

		button {
			flex: 1;
			font-size: 24rpx;
		}

		.btn-update {
			background: #1890FF;
			color: #FFFFFF;
			border: none;
		}

		.btn-detail {
			background: #FFFFFF;
			color: #666666;
			border: 1rpx solid #D9D9D9;
		}
	}
}

.no-tasks {
	text-align: center;
	padding: 60rpx 0;

	.no-tasks-text {
		display: block;
		font-size: 26rpx;
		color: #999999;
		margin-bottom: 20rpx;
	}

	.btn-assign {
		background: #1890FF;
		color: #FFFFFF;
		border: none;
	}
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 60rpx;

	.empty-icon {
		font-size: 120rpx;
		margin-bottom: 20rpx;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999999;
		margin-bottom: 40rpx;
	}

	.btn-goto {
		background: #1890FF;
		color: #FFFFFF;
		border: none;
		border-radius: 30rpx;
		padding: 20rpx 60rpx;
		font-size: 28rpx;
	}
}

.loading {
	text-align: center;
	padding: 30rpx;
	font-size: 26rpx;
	color: #999999;
}
</style>
