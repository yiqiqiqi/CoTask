<template>
	<view class="home-container">
		<!-- 部门信息头部 -->
		<view class="dept-header" :style="{backgroundColor: themeColor}">
			<view class="dept-info">
				<text class="dept-name">{{ currentDepartment.name }}</text>
				<text class="dept-desc" @click="changeDepartment">切换部门 ></text>
			</view>
		</view>

		<!-- 快速统计 -->
		<view class="stats-cards">
			<view class="stat-card">
				<text class="stat-value">0</text>
				<text class="stat-label">总项目</text>
			</view>
			<view class="stat-card">
				<text class="stat-value">0</text>
				<text class="stat-label">进行中</text>
			</view>
			<view class="stat-card">
				<text class="stat-value">0</text>
				<text class="stat-label">已完成</text>
			</view>
		</view>

		<!-- 项目列表 -->
		<view class="projects-section">
			<view class="section-header">
				<text class="section-title">我的项目</text>
				<button class="add-btn" @click="createProject">+ 新建项目</button>
			</view>

			<view class="empty-state" v-if="projects.length === 0">
				<text class="empty-text">暂无项目</text>
				<text class="empty-hint">点击"新建项目"开始创建</text>
			</view>

			<view class="project-list" v-else>
				<view
					class="project-card"
					v-for="project in projects"
					:key="project.id"
					@click="goToProject(project)"
				>
					<view class="project-header">
						<text class="project-name">{{ project.name }}</text>
						<view class="status-tag" :class="'status-' + project.status">
							{{ getStatusText(project.status) }}
						</view>
					</view>
					<text class="project-desc">{{ project.description }}</text>
					<view class="project-footer">
						<text class="owner">负责人: {{ project.owner }}</text>
						<text class="progress">{{ project.progress }}%</text>
					</view>
					<view class="progress-bar">
						<view class="progress-fill" :style="{width: project.progress + '%'}"></view>
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
			currentDepartment: {},
			themeColor: '#1890FF',
			projects: []
		}
	},
	onLoad() {
		this.loadDepartment()
		this.loadProjects()
	},
	onShow() {
		this.loadProjects()
	},
	onPullDownRefresh() {
		this.loadProjects().then(() => {
			uni.stopPullDownRefresh()
		})
	},
	methods: {
		loadDepartment() {
			const dept = uni.getStorageSync('currentDepartment')
			if (dept) {
				this.currentDepartment = dept
				this.themeColor = dept.theme_color || '#1890FF'
			} else {
				// 如果没有选择部门,跳转到部门选择页
				uni.redirectTo({
					url: '/pages/department/select'
				})
			}
		},
		async loadProjects() {
			// TODO: 调用云函数获取项目列表
			this.projects = []
		},
		changeDepartment() {
			uni.navigateTo({
				url: '/pages/department/select'
			})
		},
		createProject() {
			uni.showToast({
				title: '创建项目功能开发中',
				icon: 'none'
			})
		},
		goToProject(project) {
			uni.navigateTo({
				url: '/pages/project/detail?id=' + project.id
			})
		},
		getStatusText(status) {
			const map = {
				0: '未开始',
				1: '进行中',
				2: '已完成',
				3: '已暂停'
			}
			return map[status] || '未知'
		}
	}
}
</script>

<style lang="scss" scoped>
.home-container {
	min-height: 100vh;
	background: #F5F5F5;
}

.dept-header {
	padding: 20px;
	color: #FFFFFF;

	.dept-info {
		.dept-name {
			display: block;
			font-size: 20px;
			font-weight: bold;
			margin-bottom: 8px;
		}

		.dept-desc {
			display: block;
			font-size: 14px;
			opacity: 0.9;
		}
	}
}

.stats-cards {
	display: flex;
	padding: 20px;
	gap: 10px;

	.stat-card {
		flex: 1;
		background: #FFFFFF;
		border-radius: 8px;
		padding: 16px;
		text-align: center;

		.stat-value {
			display: block;
			font-size: 28px;
			font-weight: bold;
			color: #1890FF;
			margin-bottom: 8px;
		}

		.stat-label {
			display: block;
			font-size: 14px;
			color: #999999;
		}
	}
}

.projects-section {
	padding: 0 20px 20px;

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;

		.section-title {
			font-size: 18px;
			font-weight: bold;
			color: #333333;
		}

		.add-btn {
			padding: 8px 16px;
			background: #1890FF;
			color: #FFFFFF;
			border-radius: 20px;
			font-size: 14px;
			line-height: 1;
		}
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;

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

	.project-list {
		.project-card {
			background: #FFFFFF;
			border-radius: 12px;
			padding: 16px;
			margin-bottom: 12px;

			.project-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 8px;

				.project-name {
					font-size: 16px;
					font-weight: bold;
					color: #333333;
					flex: 1;
				}

				.status-tag {
					padding: 4px 12px;
					border-radius: 12px;
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

			.project-desc {
				display: block;
				font-size: 14px;
				color: #999999;
				margin-bottom: 12px;
			}

			.project-footer {
				display: flex;
				justify-content: space-between;
				font-size: 12px;
				color: #666666;
				margin-bottom: 8px;
			}

			.progress-bar {
				height: 4px;
				background: #F0F0F0;
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
