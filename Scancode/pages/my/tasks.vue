<template>
	<view class="my-tasks">
		<!-- 顶部统计 -->
		<view class="stats-header">
			<view class="stat-item">
				<text class="stat-value">{{ stats.total }}</text>
				<text class="stat-label">全部</text>
			</view>
			<view class="stat-item highlight">
				<text class="stat-value">{{ stats.inProgress }}</text>
				<text class="stat-label">进行中</text>
			</view>
			<view class="stat-item">
				<text class="stat-value">{{ stats.completed }}</text>
				<text class="stat-label">已完成</text>
			</view>
			<view class="stat-item warning">
				<text class="stat-value">{{ stats.overdue }}</text>
				<text class="stat-label">延期</text>
			</view>
		</view>

		<!-- 筛选器 -->
		<view class="filter-section">
			<scroll-view class="filter-tabs" scroll-x>
				<view
					v-for="(filter, index) in filters"
					:key="index"
					:class="['filter-item', { active: activeFilter === index }]"
					@tap="switchFilter(index)"
				>
					{{ filter.name }}
				</view>
			</scroll-view>
		</view>

		<!-- 任务列表 -->
		<scroll-view
			class="tasks-list"
			scroll-y
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			@scrolltolower="loadMore"
		>
			<!-- 按日期分组（今日/本周/更早） -->
			<view v-for="group in groupedTasks" :key="group.title" class="task-group">
				<view class="group-header">
					<text class="group-title">{{ group.title }}</text>
					<text class="group-count">{{ group.tasks.length }}</text>
				</view>

				<view
					v-for="task in group.tasks"
					:key="task._id"
					class="task-card"
					@tap="viewTask(task._id)"
				>
					<!-- 任务头部 -->
					<view class="task-header">
						<view class="left">
							<view :class="['status-dot', `status-${task.status}`]"></view>
							<text class="task-name">{{ task.name }}</text>
						</view>
						<view :class="['priority-tag', `priority-${task.priority}`]">
							{{ priorityMap[task.priority] }}
						</view>
					</view>

					<!-- 任务描述 -->
					<text class="task-desc" v-if="task.description">
						{{ task.description }}
					</text>

					<!-- 项目标签 -->
					<view class="task-project">
						<text class="project-icon">📁</text>
						<text class="project-name">{{ task.project_name || '未知项目' }}</text>
					</view>

					<!-- 任务元信息 -->
					<view class="task-meta">
						<view class="meta-row">
							<view class="meta-item">
								<text class="meta-label">进度:</text>
								<text :class="['meta-value', task.progress === 100 ? 'completed' : '']">
									{{ task.progress }}%
								</text>
							</view>
							<view class="meta-item">
								<text class="meta-label">截止:</text>
								<text :class="['meta-value', getDateStyle(task.due_time)]">
									{{ formatDate(task.due_time) }}
								</text>
							</view>
						</view>

						<!-- 进度条 -->
						<view class="progress-bar">
							<view class="progress-fill" :style="{ width: task.progress + '%' }"></view>
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
							class="btn-complete"
							size="mini"
							v-if="task.status !== 2"
							@tap.stop="markComplete(task)"
						>
							标记完成
						</button>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="!loading && tasks.length === 0" class="empty-state">
				<text class="empty-icon">✅</text>
				<text class="empty-text">暂无任务</text>
				<text class="empty-hint">去项目中创建任务吧</text>
			</view>

			<!-- 加载更多 -->
			<view v-if="hasMore && tasks.length > 0" class="load-more">
				<text v-if="loading">加载中...</text>
				<text v-else>上拉加载更多</text>
			</view>

			<!-- 到底了 -->
			<view v-if="!hasMore && tasks.length > 0" class="no-more">
				<text>没有更多了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: {},
			tasks: [],
			activeFilter: 0,
			filters: [
				{ name: '全部', status: undefined },
				{ name: '待开始', status: 0 },
				{ name: '进行中', status: 1 },
				{ name: '已完成', status: 2 },
				{ name: '已延期', status: 3 }
			],
			stats: {
				total: 0,
				pending: 0,
				inProgress: 0,
				completed: 0,
				overdue: 0
			},
			loading: false,
			refreshing: false,
			page: 1,
			pageSize: 20,
			hasMore: true,
			priorityMap: { 1: '低', 2: '中', 3: '高' }
		}
	},

	computed: {
		groupedTasks() {
			const today = new Date()
			today.setHours(0, 0, 0, 0)

			const tomorrow = new Date(today)
			tomorrow.setDate(tomorrow.getDate() + 1)

			const nextWeek = new Date(today)
			nextWeek.setDate(nextWeek.getDate() + 7)

			const groups = {
				today: { title: '今日待办', tasks: [] },
				week: { title: '本周任务', tasks: [] },
				later: { title: '更多任务', tasks: [] },
				completed: { title: '已完成', tasks: [] }
			}

			this.tasks.forEach(task => {
				// 已完成的单独分组
				if (task.status === 2) {
					groups.completed.tasks.push(task)
					return
				}

				const dueTime = task.due_time ? new Date(task.due_time) : null

				if (dueTime) {
					if (dueTime < tomorrow && dueTime >= today) {
						groups.today.tasks.push(task)
					} else if (dueTime < nextWeek) {
						groups.week.tasks.push(task)
					} else {
						groups.later.tasks.push(task)
					}
				} else {
					groups.later.tasks.push(task)
				}
			})

			// 只返回有任务的分组
			return Object.values(groups).filter(g => g.tasks.length > 0)
		}
	},

	onLoad() {
		this.userInfo = uni.getStorageSync('userInfo')
		if (!this.userInfo || !this.userInfo.id) {
			uni.reLaunch({ url: '/pages/login/index' })
			return
		}
		this.loadMyTasks()
	},

	onShow() {
		// 从其他页面返回时刷新
		if (this.tasks.length > 0) {
			this.refreshTasks()
		}
	},

	methods: {
		async loadMyTasks(append = false) {
			if (this.loading) return

			this.loading = true

			try {
				const filter = this.filters[this.activeFilter]

				const res = await uniCloud.callFunction({
					name: 'get_my_tasks',
					data: {
						user_id: this.userInfo.id,
						status: filter.status,
						page: this.page,
						pageSize: this.pageSize
					}
				})

				if (res.result.code === 200) {
					const newTasks = res.result.data || []

					if (append) {
						this.tasks = [...this.tasks, ...newTasks]
					} else {
						this.tasks = newTasks
					}

					// 更新统计
					if (res.result.stats) {
						this.stats = res.result.stats
					}

					// 判断是否还有更多
					this.hasMore = newTasks.length >= this.pageSize
				} else {
					uni.showToast({
						title: res.result.message || '加载失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('加载我的任务失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			} finally {
				this.loading = false
				this.refreshing = false
			}
		},

		async refreshTasks() {
			this.page = 1
			this.hasMore = true
			await this.loadMyTasks(false)
		},

		switchFilter(index) {
			if (this.activeFilter === index) return

			this.activeFilter = index
			this.page = 1
			this.hasMore = true
			this.tasks = []
			this.loadMyTasks()
		},

		loadMore() {
			if (!this.hasMore || this.loading) return

			this.page++
			this.loadMyTasks(true)
		},

		onRefresh() {
			this.refreshing = true
			this.refreshTasks()
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

		async markComplete(task) {
			uni.showModal({
				title: '确认完成',
				content: `确定要将任务"${task.name}"标记为已完成吗？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							const result = await uniCloud.callFunction({
								name: 'update_task',
								data: {
									task_id: task._id,
									current_user_id: this.userInfo.id,
									status: 2,
									progress: 100
								}
							})

							if (result.result.code === 200) {
								uni.showToast({
									title: '已标记完成',
									icon: 'success'
								})
								this.refreshTasks()
							} else {
								uni.showToast({
									title: result.result.message || '操作失败',
									icon: 'none'
								})
							}
						} catch (error) {
							uni.showToast({
								title: '操作失败',
								icon: 'none'
							})
						}
					}
				}
			})
		},

		formatDate(date) {
			if (!date) return '未设置'
			const d = new Date(date)
			const today = new Date()
			const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24))

			if (diff < 0) {
				return `逾期${Math.abs(diff)}天`
			} else if (diff === 0) {
				return '今天'
			} else if (diff === 1) {
				return '明天'
			} else if (diff <= 7) {
				return `${diff}天后`
			} else {
				return `${d.getMonth() + 1}月${d.getDate()}日`
			}
		},

		getDateStyle(date) {
			if (!date) return ''
			const d = new Date(date)
			const today = new Date()
			const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24))

			if (diff < 0) return 'overdue'
			if (diff <= 3) return 'due'
			return ''
		}
	}
}
</script>

<style lang="scss" scoped>
.my-tasks {
	min-height: 100vh;
	background: #F5F5F5;
	padding-bottom: calc(env(safe-area-inset-bottom) + 100rpx);
}

.stats-header {
	background: #FFFFFF;
	display: flex;
	padding: 30rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

	.stat-item {
		flex: 1;
		text-align: center;
		padding: 20rpx 0;

		.stat-value {
			display: block;
			font-size: 48rpx;
			font-weight: bold;
			color: #333333;
			margin-bottom: 8rpx;
		}

		.stat-label {
			font-size: 24rpx;
			color: #999999;
		}

		&.highlight {
			.stat-value {
				color: #1890FF;
			}
		}

		&.warning {
			.stat-value {
				color: #FF4D4F;
			}
		}
	}
}

.filter-section {
	background: #FFFFFF;
	padding: 20rpx 30rpx;
	margin-top: 20rpx;

	.filter-tabs {
		white-space: nowrap;

		.filter-item {
			display: inline-block;
			padding: 12rpx 32rpx;
			margin-right: 20rpx;
			border-radius: 30rpx;
			font-size: 28rpx;
			color: #666666;
			background: #F5F5F5;
			transition: all 0.3s;

			&.active {
				color: #FFFFFF;
				background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
			}
		}
	}
}

.tasks-list {
	height: calc(100vh - 360rpx);
	padding: 20rpx 30rpx;
}

.task-group {
	margin-bottom: 30rpx;

	.group-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.group-title {
			font-size: 28rpx;
			font-weight: bold;
			color: #333333;
		}

		.group-count {
			margin-left: 12rpx;
			padding: 4rpx 12rpx;
			background: #F0F0F0;
			border-radius: 12rpx;
			font-size: 22rpx;
			color: #666666;
		}
	}
}

.task-card {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s;

	&:active {
		transform: scale(0.98);
	}

	.task-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;

		.left {
			flex: 1;
			display: flex;
			align-items: center;

			.status-dot {
				width: 16rpx;
				height: 16rpx;
				border-radius: 50%;
				margin-right: 12rpx;
				flex-shrink: 0;

				&.status-0 { background: #D9D9D9; }
				&.status-1 { background: #1890FF; }
				&.status-2 { background: #52C41A; }
				&.status-3 { background: #FF4D4F; }
			}

			.task-name {
				flex: 1;
				font-size: 30rpx;
				font-weight: bold;
				color: #333333;
			}
		}

		.priority-tag {
			padding: 4rpx 12rpx;
			border-radius: 8rpx;
			font-size: 22rpx;
			margin-left: 12rpx;

			&.priority-1 {
				background: #E8F4FF;
				color: #1890FF;
			}

			&.priority-2 {
				background: #FFF7E6;
				color: #FA8C16;
			}

			&.priority-3 {
				background: #FFF1F0;
				color: #F5222D;
			}
		}
	}

	.task-desc {
		font-size: 26rpx;
		color: #666666;
		line-height: 1.6;
		margin-bottom: 16rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.task-project {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
		padding: 12rpx 16rpx;
		background: #F9FAFB;
		border-radius: 8rpx;

		.project-icon {
			font-size: 28rpx;
			margin-right: 8rpx;
		}

		.project-name {
			font-size: 24rpx;
			color: #666666;
		}
	}

	.task-meta {
		margin-bottom: 16rpx;

		.meta-row {
			display: flex;
			margin-bottom: 12rpx;

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
						color: #FA8C16;
					}

					&.overdue {
						color: #FF4D4F;
					}
				}
			}
		}

		.progress-bar {
			height: 8rpx;
			background: #F0F0F0;
			border-radius: 4rpx;
			overflow: hidden;

			.progress-fill {
				height: 100%;
				background: linear-gradient(90deg, #667EEA 0%, #764BA2 100%);
				border-radius: 4rpx;
				transition: width 0.3s;
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

		.btn-complete {
			background: #52C41A;
			color: #FFFFFF;
			border: none;
		}
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
		font-size: 32rpx;
		color: #333333;
		margin-bottom: 12rpx;
	}

	.empty-hint {
		font-size: 26rpx;
		color: #999999;
	}
}

.load-more, .no-more {
	text-align: center;
	padding: 30rpx;
	font-size: 26rpx;
	color: #999999;
}
</style>
