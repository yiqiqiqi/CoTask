<template>
	<view class="public-projects">
		<!-- 部门头部 -->
		<view class="header" :style="{ background: themeGradient }">
			<view class="dept-info">
				<text class="dept-name">{{ currentDepartment.name }}</text>
				<text class="subtitle">项目大厅 · 正在进行</text>
			</view>
			<view class="create-btn" @tap="createProject">
				<text class="icon">+</text>
			</view>
		</view>

		<!-- 筛选标签 -->
		<view class="filter-section">
			<scroll-view class="filter-tabs" scroll-x>
				<view
					v-for="(tab, index) in tabs"
					:key="index"
					:class="['tab-item', { active: activeTab === index }]"
					@tap="switchTab(index)"
				>
					{{ tab.name }}
				</view>
			</scroll-view>

			<!-- 搜索框 -->
			<view class="search-box">
				<input
					v-model="keyword"
					placeholder="搜索项目名称或负责人"
					confirm-type="search"
					@confirm="searchProjects"
				/>
				<text class="search-icon">🔍</text>
			</view>
		</view>

		<!-- 项目列表 -->
		<scroll-view
			class="projects-list"
			scroll-y
			@scrolltolower="loadMore"
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<view
				v-for="project in projects"
				:key="project._id"
				class="project-card"
				@tap="viewProject(project._id)"
			>
				<!-- 卡片头部 -->
				<view class="card-header">
					<view class="left">
						<text class="project-name">{{ project.name }}</text>
						<view :class="['priority-tag', `priority-${project.priority}`]">
							{{ priorityMap[project.priority] }}
						</view>
					</view>
					<view :class="['status-tag', `status-${project.status}`]">
						{{ statusMap[project.status] }}
					</view>
				</view>

				<!-- 项目描述 -->
				<text class="project-desc" v-if="project.description">
					{{ project.description }}
				</text>

				<!-- 进度条 -->
				<view class="progress-section">
					<view class="progress-bar">
						<view
							class="progress-fill"
							:style="{ width: project.progress + '%' }"
						></view>
					</view>
					<text class="progress-text">{{ project.progress }}%</text>
				</view>

				<!-- 项目元信息 -->
				<view class="project-meta">
					<view class="meta-item">
						<text class="meta-icon">👥</text>
						<text>{{ project.members?.length || 0 }} 人</text>
					</view>
					<view class="meta-item">
						<text class="meta-icon">📋</text>
						<text>{{ project.task_count || 0 }} 任务</text>
					</view>
					<view class="meta-item">
						<text class="meta-icon">⏰</text>
						<text>{{ formatDate(project.end_time) }}</text>
					</view>
				</view>

				<!-- 成员头像预览 -->
				<view class="members-preview" v-if="project.members && project.members.length > 0">
					<view
						v-for="(member, idx) in project.members.slice(0, 5)"
						:key="idx"
						class="member-avatar"
						:style="{ zIndex: 10 - idx }"
					>
						<text>{{ member.user_name.charAt(0) }}</text>
					</view>
					<text v-if="project.members.length > 5" class="more-count">
						+{{ project.members.length - 5 }}
					</text>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="!loading && projects.length === 0" class="empty-state">
				<text class="empty-icon">📦</text>
				<text class="empty-text">暂无进行中的项目</text>
				<button class="btn-create" @tap="createProject">创建第一个项目</button>
			</view>

			<!-- 加载更多 -->
			<view v-if="hasMore && projects.length > 0" class="load-more">
				<text v-if="loading">加载中...</text>
				<text v-else>上拉加载更多</text>
			</view>

			<!-- 到底了 -->
			<view v-if="!hasMore && projects.length > 0" class="no-more">
				<text>没有更多了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			currentDepartment: {},
			projects: [],
			activeTab: 0,
			tabs: [
				{ name: '全部', filter: {} },
				{ name: '高优先级', filter: { priority: 3 } },
				{ name: '即将到期', filter: { dueSoon: true } }
			],
			keyword: '',
			loading: false,
			refreshing: false,
			page: 1,
			pageSize: 20,
			hasMore: true,
			priorityMap: { 1: '低', 2: '中', 3: '高' },
			statusMap: {
				0: '未开始',
				1: '进行中',
				2: '已完成',
				3: '已暂停'
			}
		}
	},

	computed: {
		themeGradient() {
			const color = this.currentDepartment.theme_color || '#1890FF'
			return `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
		}
	},

	onLoad() {
		this.currentDepartment = uni.getStorageSync('currentDepartment')
		if (!this.currentDepartment || !this.currentDepartment.id) {
			uni.reLaunch({ url: '/pages/department/select' })
			return
		}
		this.loadProjects()
	},

	onShow() {
		// 从其他页面返回时刷新
		if (this.projects.length > 0) {
			this.refreshProjects()
		}
	},

	methods: {
		async loadProjects(append = false) {
			if (this.loading) return

			this.loading = true

			try {
				const res = await uniCloud.callFunction({
					name: 'get_projects',
					data: {
						department_id: this.currentDepartment.id,
						status: 1, // 只显示进行中的项目
						keyword: this.keyword,
						priority: this.tabs[this.activeTab].filter.priority,
						page: this.page,
						pageSize: this.pageSize
					}
				})

				if (res.result.code === 200) {
					const newProjects = res.result.data.list || []

					if (append) {
						this.projects = [...this.projects, ...newProjects]
					} else {
						this.projects = newProjects
					}

					// 判断是否还有更多
					this.hasMore = newProjects.length >= this.pageSize
				} else {
					uni.showToast({
						title: res.result.message || '加载失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('加载项目失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			} finally {
				this.loading = false
				this.refreshing = false
			}
		},

		async refreshProjects() {
			this.page = 1
			this.hasMore = true
			await this.loadProjects(false)
		},

		switchTab(index) {
			if (this.activeTab === index) return

			this.activeTab = index
			this.page = 1
			this.hasMore = true
			this.projects = []
			this.loadProjects()
		},

		searchProjects() {
			this.page = 1
			this.hasMore = true
			this.projects = []
			this.loadProjects()
		},

		loadMore() {
			if (!this.hasMore || this.loading) return

			this.page++
			this.loadProjects(true)
		},

		onRefresh() {
			this.refreshing = true
			this.refreshProjects()
		},

		viewProject(projectId) {
			uni.navigateTo({
				url: `/pages/project/detail?id=${projectId}`
			})
		},

		createProject() {
			uni.navigateTo({
				url: '/pages/project/form'
			})
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
		}
	}
}
</script>

<style lang="scss" scoped>
.public-projects {
	min-height: 100vh;
	background: #F5F5F5;
	padding-bottom: calc(env(safe-area-inset-bottom) + 100rpx);
}

.header {
	padding: 40rpx 30rpx 30rpx;
	color: #FFFFFF;
	display: flex;
	justify-content: space-between;
	align-items: center;

	.dept-info {
		flex: 1;

		.dept-name {
			display: block;
			font-size: 36rpx;
			font-weight: bold;
			margin-bottom: 8rpx;
		}

		.subtitle {
			font-size: 24rpx;
			opacity: 0.9;
		}
	}

	.create-btn {
		width: 60rpx;
		height: 60rpx;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;

		.icon {
			font-size: 40rpx;
			color: #FFFFFF;
		}
	}
}

.filter-section {
	background: #FFFFFF;
	padding: 20rpx 30rpx;

	.filter-tabs {
		white-space: nowrap;
		margin-bottom: 20rpx;

		.tab-item {
			display: inline-block;
			padding: 12rpx 24rpx;
			margin-right: 20rpx;
			border-radius: 30rpx;
			font-size: 28rpx;
			color: #666666;
			background: #F5F5F5;
			transition: all 0.3s;

			&.active {
				color: #FFFFFF;
				background: #1890FF;
			}
		}
	}

	.search-box {
		position: relative;

		input {
			width: 100%;
			height: 70rpx;
			padding: 0 80rpx 0 30rpx;
			background: #F5F5F5;
			border-radius: 35rpx;
			font-size: 28rpx;
		}

		.search-icon {
			position: absolute;
			right: 30rpx;
			top: 50%;
			transform: translateY(-50%);
			font-size: 32rpx;
		}
	}
}

.projects-list {
	height: calc(100vh - 380rpx);
	padding: 20rpx 30rpx;
}

.project-card {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s;

	&:active {
		transform: scale(0.98);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 16rpx;

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

			.priority-tag {
				padding: 4rpx 12rpx;
				border-radius: 8rpx;
				font-size: 22rpx;

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

		.status-tag {
			padding: 6rpx 16rpx;
			border-radius: 20rpx;
			font-size: 24rpx;
			white-space: nowrap;

			&.status-0 {
				background: #F5F5F5;
				color: #999999;
			}

			&.status-1 {
				background: #E6F7FF;
				color: #1890FF;
			}

			&.status-2 {
				background: #F6FFED;
				color: #52C41A;
			}

			&.status-3 {
				background: #FFF7E6;
				color: #FA8C16;
			}
		}
	}

	.project-desc {
		font-size: 26rpx;
		color: #666666;
		line-height: 1.6;
		margin-bottom: 20rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.progress-section {
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
				background: linear-gradient(90deg, #1890FF 0%, #52C41A 100%);
				border-radius: 6rpx;
				transition: width 0.3s;
			}
		}

		.progress-text {
			font-size: 24rpx;
			color: #1890FF;
			font-weight: bold;
			min-width: 80rpx;
			text-align: right;
		}
	}

	.project-meta {
		display: flex;
		margin-bottom: 20rpx;

		.meta-item {
			flex: 1;
			display: flex;
			align-items: center;
			font-size: 24rpx;
			color: #999999;

			.meta-icon {
				margin-right: 8rpx;
				font-size: 28rpx;
			}
		}
	}

	.members-preview {
		display: flex;
		align-items: center;
		padding-top: 20rpx;
		border-top: 1rpx solid #F0F0F0;

		.member-avatar {
			width: 56rpx;
			height: 56rpx;
			border-radius: 50%;
			background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
			display: flex;
			align-items: center;
			justify-content: center;
			color: #FFFFFF;
			font-size: 24rpx;
			font-weight: bold;
			border: 3rpx solid #FFFFFF;
			margin-left: -12rpx;

			&:first-child {
				margin-left: 0;
			}
		}

		.more-count {
			margin-left: 12rpx;
			font-size: 24rpx;
			color: #999999;
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
		font-size: 28rpx;
		color: #999999;
		margin-bottom: 40rpx;
	}

	.btn-create {
		background: #1890FF;
		color: #FFFFFF;
		border: none;
		border-radius: 30rpx;
		padding: 20rpx 60rpx;
		font-size: 28rpx;
	}
}

.load-more, .no-more {
	text-align: center;
	padding: 30rpx;
	font-size: 26rpx;
	color: #999999;
}
</style>
