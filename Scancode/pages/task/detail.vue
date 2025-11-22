<template>
	<view class="task-detail-container">
		<!-- 任务头部信息 -->
		<view class="task-header">
			<view class="header-top">
				<text class="task-name">{{ task.name }}</text>
				<view class="status-badge" :class="'status-' + task.status">
					{{ getStatusText(task.status) }}
				</view>
			</view>

			<text class="task-desc" v-if="task.description">{{ task.description }}</text>

			<view class="task-meta">
				<view class="meta-item">
					<text class="meta-label">负责人:</text>
					<text class="meta-value">{{ task.owner || '未指定' }}</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">优先级:</text>
					<text class="meta-value" :class="'priority-' + task.priority">
						{{ getPriorityText(task.priority) }}
					</text>
				</view>
			</view>

			<view class="task-meta">
				<view class="meta-item">
					<text class="meta-label">开始时间:</text>
					<text class="meta-value">{{ formatDate(task.start_time) || '未设置' }}</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">截止时间:</text>
					<text class="meta-value">{{ formatDate(task.due_time) || '未设置' }}</text>
				</view>
			</view>

			<!-- 进度条 -->
			<view class="progress-section">
				<view class="progress-header">
					<text class="progress-label">完成进度</text>
					<text class="progress-value">{{ task.progress || 0 }}%</text>
				</view>
				<view class="progress-bar">
					<view
						class="progress-fill"
						:style="{ width: (task.progress || 0) + '%' }"
					></view>
				</view>
			</view>

			<!-- 操作按钮 -->
			<view class="action-buttons">
				<button class="action-btn" @click="editTask">编辑任务</button>
				<button class="action-btn primary" @click="updateProgress">更新进度</button>
			</view>
		</view>

		<!-- 进度历史 -->
		<view class="progress-history">
			<view class="section-header">
				<text class="section-title">进度历史</text>
			</view>

			<view class="empty-state" v-if="progressRecords.length === 0">
				<text class="empty-text">暂无进度记录</text>
			</view>

			<view class="timeline" v-else>
				<view
					class="timeline-item"
					v-for="record in progressRecords"
					:key="record._id"
				>
					<view class="timeline-dot"></view>
					<view class="timeline-content">
						<view class="record-header">
							<text class="record-progress">{{ record.progress }}%</text>
							<text class="record-time">{{ formatDateTime(record.create_time) }}</text>
						</view>
						<text class="record-content" v-if="record.content">{{ record.content }}</text>
						<text class="record-updater">更新人: {{ record.updater }}</text>
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
			taskId: '',
			task: {},
			progressRecords: []
		}
	},
	onLoad(options) {
		this.taskId = options.id
		this.loadTaskDetail()
	},
	methods: {
		async loadTaskDetail() {
			// 这里简化处理，实际应该创建 get_task_detail 云函数
			// 目前从本地或通过项目详情获取
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			})
		},
		editTask() {
			uni.navigateTo({
				url: '/pages/task/form?id=' + this.taskId
			})
		},
		updateProgress() {
			uni.navigateTo({
				url: '/pages/progress/update?task_id=' + this.taskId
			})
		},
		formatDate(date) {
			if (!date) return ''
			const d = new Date(date)
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
		},
		formatDateTime(date) {
			if (!date) return ''
			const d = new Date(date)
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
		},
		getStatusText(status) {
			const map = {
				0: '待开始',
				1: '进行中',
				2: '已完成',
				3: '延期'
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
		}
	}
}
</script>

<style lang="scss" scoped>
.task-detail-container {
	min-height: 100vh;
	background: #F5F5F5;
	padding-bottom: 20px;
}

.task-header {
	background: #FFFFFF;
	padding: 20px;
	margin-bottom: 12px;

	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12px;

		.task-name {
			flex: 1;
			font-size: 20px;
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
				background: #FFF1F0;
				color: #f5222d;
			}
		}
	}

	.task-desc {
		display: block;
		font-size: 14px;
		color: #666666;
		line-height: 1.6;
		margin-bottom: 16px;
	}

	.task-meta {
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
				background: #1890FF;
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
}

.progress-history {
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
			font-size: 14px;
			color: #999999;
		}
	}

	.timeline {
		.timeline-item {
			position: relative;
			padding-left: 32px;
			padding-bottom: 24px;

			&:last-child {
				padding-bottom: 0;

				.timeline-dot::after {
					display: none;
				}
			}

			.timeline-dot {
				position: absolute;
				left: 0;
				top: 4px;
				width: 12px;
				height: 12px;
				border-radius: 50%;
				background: #1890FF;
				border: 2px solid #FFFFFF;
				box-shadow: 0 0 0 2px #1890FF;

				&::after {
					content: '';
					position: absolute;
					left: 5px;
					top: 12px;
					width: 2px;
					height: calc(100% + 12px);
					background: #E8E8E8;
				}
			}

			.timeline-content {
				background: #F5F5F5;
				padding: 12px;
				border-radius: 8px;

				.record-header {
					display: flex;
					justify-content: space-between;
					margin-bottom: 8px;

					.record-progress {
						font-size: 16px;
						font-weight: bold;
						color: #1890FF;
					}

					.record-time {
						font-size: 12px;
						color: #999999;
					}
				}

				.record-content {
					display: block;
					font-size: 14px;
					color: #666666;
					line-height: 1.5;
					margin-bottom: 8px;
				}

				.record-updater {
					display: block;
					font-size: 12px;
					color: #999999;
				}
			}
		}
	}
}
</style>
