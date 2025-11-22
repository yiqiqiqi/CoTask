<template>
	<view class="stats-container">
		<!-- 部门信息 -->
		<view class="department-header" :style="{ background: themeColor }">
			<text class="department-name">{{ currentDepartment.name }}</text>
			<text class="department-subtitle">数据统计与分析</text>
		</view>

		<!-- 项目概览 -->
		<view class="section">
			<view class="section-title">项目概览</view>
			<view class="overview-section">
				<view class="overview-card">
					<text class="card-label">总项目数</text>
					<text class="card-value">{{ projectStats.total }}</text>
				</view>
				<view class="overview-card">
					<text class="card-label">进行中</text>
					<text class="card-value" style="color: #1890FF;">{{ projectStats.inProgress }}</text>
				</view>
				<view class="overview-card">
					<text class="card-label">已完成</text>
					<text class="card-value" style="color: #52c41a;">{{ projectStats.completed }}</text>
				</view>
				<view class="overview-card">
					<text class="card-label">未开始</text>
					<text class="card-value" style="color: #999999;">{{ projectStats.notStarted }}</text>
				</view>
			</view>
		</view>

		<!-- 任务统计 -->
		<view class="section">
			<view class="section-title">任务统计</view>
			<view class="overview-section">
				<view class="overview-card">
					<text class="card-label">总任务数</text>
					<text class="card-value">{{ taskStats.total }}</text>
				</view>
				<view class="overview-card">
					<text class="card-label">进行中</text>
					<text class="card-value" style="color: #1890FF;">{{ taskStats.inProgress }}</text>
				</view>
				<view class="overview-card">
					<text class="card-label">已完成</text>
					<text class="card-value" style="color: #52c41a;">{{ taskStats.completed }}</text>
				</view>
				<view class="overview-card">
					<text class="card-label">延期</text>
					<text class="card-value" style="color: #f5222d;">{{ taskStats.delayed }}</text>
				</view>
			</view>
		</view>

		<!-- 优先级分布 -->
		<view class="section">
			<view class="section-title">项目优先级分布</view>
			<view class="priority-stats">
				<view class="priority-item">
					<view class="priority-header">
						<text class="priority-label">高优先级</text>
						<text class="priority-count" style="color: #f5222d;">{{ priorityStats.high }}</text>
					</view>
					<view class="priority-bar">
						<view
							class="priority-fill"
							:style="{ width: getPriorityPercent('high') + '%', background: '#f5222d' }"
						></view>
					</view>
				</view>
				<view class="priority-item">
					<view class="priority-header">
						<text class="priority-label">中优先级</text>
						<text class="priority-count" style="color: #1890FF;">{{ priorityStats.medium }}</text>
					</view>
					<view class="priority-bar">
						<view
							class="priority-fill"
							:style="{ width: getPriorityPercent('medium') + '%', background: '#1890FF' }"
						></view>
					</view>
				</view>
				<view class="priority-item">
					<view class="priority-header">
						<text class="priority-label">低优先级</text>
						<text class="priority-count" style="color: #52c41a;">{{ priorityStats.low }}</text>
					</view>
					<view class="priority-bar">
						<view
							class="priority-fill"
							:style="{ width: getPriorityPercent('low') + '%', background: '#52c41a' }"
						></view>
					</view>
				</view>
			</view>
		</view>

		<!-- 平均进度 -->
		<view class="section">
			<view class="section-title">整体平均进度</view>
			<view class="progress-card">
				<text class="progress-value">{{ avgProgress }}%</text>
				<view class="progress-bar-large">
					<view
						class="progress-fill-large"
						:style="{ width: avgProgress + '%' }"
					></view>
				</view>
			</view>
		</view>

		<!-- 即将到期 -->
		<view class="section" v-if="upcomingProjects.length > 0">
			<view class="section-title">即将到期项目（7天内）</view>
			<view class="project-list">
				<view
					class="project-item"
					v-for="project in upcomingProjects"
					:key="project._id"
					@click="goToProject(project._id)"
				>
					<view class="project-info">
						<text class="project-name">{{ project.name }}</text>
						<text class="project-days">还剩 {{ project.daysLeft }} 天</text>
					</view>
					<view class="project-progress-info">
						<text class="progress-text">{{ project.progress }}%</text>
						<view class="mini-progress-bar">
							<view
								class="mini-progress-fill"
								:style="{ width: project.progress + '%' }"
							></view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 最近更新 -->
		<view class="section" v-if="recentProjects.length > 0">
			<view class="section-title">最近更新项目</view>
			<view class="project-list">
				<view
					class="project-item"
					v-for="project in recentProjects"
					:key="project._id"
					@click="goToProject(project._id)"
				>
					<view class="project-info">
						<text class="project-name">{{ project.name }}</text>
						<text class="project-time">{{ formatTime(project.update_time) }}</text>
					</view>
					<view class="project-progress-info">
						<text class="progress-text">{{ project.progress }}%</text>
						<view
							class="status-badge"
							:class="'status-' + project.status"
						>
							{{ getStatusText(project.status) }}
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 导出功能 -->
		<view class="export-section">
			<button class="export-btn" @click="exportData">
				<text>导出统计报表</text>
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			currentDepartment: {},
			themeColor: '#1890FF',
			projectStats: {
				total: 0,
				notStarted: 0,
				inProgress: 0,
				completed: 0,
				paused: 0
			},
			taskStats: {
				total: 0,
				notStarted: 0,
				inProgress: 0,
				completed: 0,
				delayed: 0
			},
			priorityStats: {
				low: 0,
				medium: 0,
				high: 0
			},
			avgProgress: 0,
			recentProjects: [],
			upcomingProjects: [],
			loading: false
		}
	},
	onLoad() {
		this.loadDepartment()
		this.loadStatistics()
	},
	onShow() {
		this.loadStatistics()
	},
	onPullDownRefresh() {
		this.loadStatistics().then(() => {
			uni.stopPullDownRefresh()
		})
	},
	methods: {
		loadDepartment() {
			const dept = uni.getStorageSync('currentDepartment')
			if (dept) {
				this.currentDepartment = dept
				this.themeColor = dept.theme_color || '#1890FF'
			}
		},
		async loadStatistics() {
			if (!this.currentDepartment.id) {
				return
			}

			this.loading = true

			try {
				const res = await uniCloud.callFunction({
					name: 'get_department_stats',
					data: {
						department_id: this.currentDepartment.id
					}
				})

				if (res.result.code === 200) {
					const data = res.result.data
					this.projectStats = data.projectStats
					this.taskStats = data.taskStats
					this.priorityStats = data.priorityStats
					this.avgProgress = data.avgProgress
					this.recentProjects = data.recentProjects
					this.upcomingProjects = data.upcomingProjects
				} else {
					uni.showToast({
						title: res.result.message || '加载失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('加载统计数据失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			} finally {
				this.loading = false
			}
		},
		getPriorityPercent(type) {
			const total = this.priorityStats.low + this.priorityStats.medium + this.priorityStats.high
			if (total === 0) return 0
			return Math.round((this.priorityStats[type] / total) * 100)
		},
		goToProject(projectId) {
			uni.navigateTo({
				url: '/pages/project/detail?id=' + projectId
			})
		},
		formatTime(time) {
			if (!time) return ''
			const now = new Date()
			const updateTime = new Date(time)
			const diff = now - updateTime

			const minutes = Math.floor(diff / 60000)
			const hours = Math.floor(diff / 3600000)
			const days = Math.floor(diff / 86400000)

			if (minutes < 60) {
				return minutes <= 1 ? '刚刚' : `${minutes}分钟前`
			} else if (hours < 24) {
				return `${hours}小时前`
			} else if (days < 7) {
				return `${days}天前`
			} else {
				const d = new Date(time)
				return `${d.getMonth() + 1}-${d.getDate()}`
			}
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
		exportData() {
			uni.showModal({
				title: '导出报表',
				content: `确定导出${this.currentDepartment.name}的统计数据吗？`,
				success: (res) => {
					if (res.confirm) {
						// TODO: 实现Excel导出功能
						uni.showToast({
							title: 'Excel导出功能开发中',
							icon: 'none'
						})
					}
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.stats-container {
	min-height: 100vh;
	background: #F5F5F5;
	padding-bottom: 20px;
}

.department-header {
	padding: 30px 20px;
	color: #FFFFFF;
	margin-bottom: 20px;

	.department-name {
		display: block;
		font-size: 24px;
		font-weight: bold;
		margin-bottom: 8px;
	}

	.department-subtitle {
		display: block;
		font-size: 14px;
		opacity: 0.9;
	}
}

.section {
	background: #FFFFFF;
	padding: 20px;
	margin-bottom: 12px;

	.section-title {
		font-size: 16px;
		font-weight: bold;
		color: #333333;
		margin-bottom: 16px;
	}
}

.overview-section {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12px;

	.overview-card {
		background: #F5F5F5;
		border-radius: 12px;
		padding: 20px;
		text-align: center;

		.card-label {
			display: block;
			font-size: 14px;
			color: #999999;
			margin-bottom: 12px;
		}

		.card-value {
			display: block;
			font-size: 32px;
			font-weight: bold;
			color: #333333;
		}
	}
}

.priority-stats {
	.priority-item {
		margin-bottom: 16px;

		&:last-child {
			margin-bottom: 0;
		}

		.priority-header {
			display: flex;
			justify-content: space-between;
			margin-bottom: 8px;

			.priority-label {
				font-size: 14px;
				color: #666666;
			}

			.priority-count {
				font-size: 16px;
				font-weight: bold;
			}
		}

		.priority-bar {
			height: 8px;
			background: #F0F0F0;
			border-radius: 4px;
			overflow: hidden;

			.priority-fill {
				height: 100%;
				border-radius: 4px;
				transition: width 0.3s;
			}
		}
	}
}

.progress-card {
	text-align: center;

	.progress-value {
		display: block;
		font-size: 48px;
		font-weight: bold;
		color: #1890FF;
		margin-bottom: 20px;
	}

	.progress-bar-large {
		height: 12px;
		background: #F0F0F0;
		border-radius: 6px;
		overflow: hidden;

		.progress-fill-large {
			height: 100%;
			background: linear-gradient(90deg, #1890FF, #52c41a);
			border-radius: 6px;
			transition: width 0.3s;
		}
	}
}

.project-list {
	.project-item {
		background: #F5F5F5;
		border-radius: 12px;
		padding: 16px;
		margin-bottom: 12px;
		display: flex;
		justify-content: space-between;
		align-items: center;

		&:last-child {
			margin-bottom: 0;
		}

		.project-info {
			flex: 1;
			margin-right: 16px;

			.project-name {
				display: block;
				font-size: 16px;
				font-weight: bold;
				color: #333333;
				margin-bottom: 4px;
			}

			.project-days {
				display: block;
				font-size: 12px;
				color: #f5222d;
			}

			.project-time {
				display: block;
				font-size: 12px;
				color: #999999;
			}
		}

		.project-progress-info {
			text-align: right;

			.progress-text {
				display: block;
				font-size: 14px;
				font-weight: bold;
				color: #1890FF;
				margin-bottom: 4px;
			}

			.mini-progress-bar {
				width: 80px;
				height: 4px;
				background: #E8E8E8;
				border-radius: 2px;
				overflow: hidden;

				.mini-progress-fill {
					height: 100%;
					background: #1890FF;
					transition: width 0.3s;
				}
			}

			.status-badge {
				display: inline-block;
				padding: 2px 8px;
				border-radius: 4px;
				font-size: 12px;

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
	}
}

.export-section {
	padding: 20px;

	.export-btn {
		width: 100%;
		height: 50px;
		background: #1890FF;
		color: #FFFFFF;
		border-radius: 8px;
		font-size: 16px;
		font-weight: bold;
	}
}
</style>
