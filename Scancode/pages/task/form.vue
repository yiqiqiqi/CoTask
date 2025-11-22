<template>
	<view class="task-form-container">
		<view class="form-content">
			<!-- 任务名称 -->
			<view class="form-item">
				<view class="form-label">
					<text class="required">*</text>
					<text>任务名称</text>
				</view>
				<input
					v-model="formData.name"
					class="form-input"
					placeholder="请输入任务名称"
					placeholder-class="placeholder"
				/>
			</view>

			<!-- 任务描述 -->
			<view class="form-item">
				<view class="form-label">任务描述</view>
				<textarea
					v-model="formData.description"
					class="form-textarea"
					placeholder="请输入任务描述"
					placeholder-class="placeholder"
					:maxlength="500"
				/>
				<text class="char-count">{{ formData.description.length }}/500</text>
			</view>

			<!-- 负责人 -->
			<view class="form-item">
				<view class="form-label">负责人</view>
				<input
					v-model="formData.owner"
					class="form-input"
					placeholder="请输入负责人姓名"
					placeholder-class="placeholder"
				/>
			</view>

			<!-- 优先级 -->
			<view class="form-item">
				<view class="form-label">优先级</view>
				<view class="priority-options">
					<view
						v-for="(item, index) in priorityOptions"
						:key="index"
						class="priority-option"
						:class="{ active: formData.priority === item.value }"
						@click="formData.priority = item.value"
					>
						<text>{{ item.label }}</text>
					</view>
				</view>
			</view>

			<!-- 开始时间 -->
			<view class="form-item">
				<view class="form-label">开始时间</view>
				<picker
					mode="date"
					:value="formData.start_time"
					@change="onStartTimeChange"
				>
					<view class="picker-input">
						<text v-if="formData.start_time">{{ formData.start_time }}</text>
						<text v-else class="placeholder">请选择开始时间</text>
					</view>
				</picker>
			</view>

			<!-- 截止时间 -->
			<view class="form-item">
				<view class="form-label">截止时间</view>
				<picker
					mode="date"
					:value="formData.due_time"
					@change="onDueTimeChange"
				>
					<view class="picker-input">
						<text v-if="formData.due_time">{{ formData.due_time }}</text>
						<text v-else class="placeholder">请选择截止时间</text>
					</view>
				</picker>
			</view>

			<!-- 任务状态（编辑时显示） -->
			<view class="form-item" v-if="taskId">
				<view class="form-label">任务状态</view>
				<view class="status-options">
					<view
						v-for="(item, index) in statusOptions"
						:key="index"
						class="status-option"
						:class="{ active: formData.status === item.value }"
						@click="formData.status = item.value"
					>
						<text>{{ item.label }}</text>
					</view>
				</view>
			</view>

			<!-- 进度（编辑时显示） -->
			<view class="form-item" v-if="taskId">
				<view class="form-label">
					<text>完成进度</text>
					<text class="progress-value">{{ formData.progress }}%</text>
				</view>
				<slider
					:value="formData.progress"
					@change="onProgressChange"
					:min="0"
					:max="100"
					:step="5"
					activeColor="#1890FF"
					backgroundColor="#E8E8E8"
					block-size="20"
					show-value
				/>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view class="bottom-actions">
			<button class="cancel-btn" @click="handleCancel">取消</button>
			<button class="submit-btn" @click="handleSubmit" :loading="submitting">
				{{ taskId ? '保存' : '创建' }}
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			taskId: '',
			projectId: '',
			formData: {
				name: '',
				description: '',
				owner: '',
				priority: 2,
				start_time: '',
				due_time: '',
				status: 0,
				progress: 0
			},
			priorityOptions: [
				{ label: '低', value: 1 },
				{ label: '中', value: 2 },
				{ label: '高', value: 3 }
			],
			statusOptions: [
				{ label: '待开始', value: 0 },
				{ label: '进行中', value: 1 },
				{ label: '已完成', value: 2 },
				{ label: '延期', value: 3 }
			],
			submitting: false
		}
	},
	onLoad(options) {
		this.taskId = options.id || ''
		this.projectId = options.project_id || ''

		if (this.taskId) {
			// 编辑模式，加载任务数据
			this.loadTaskData()
		}
	},
	methods: {
		async loadTaskData() {
			uni.showLoading({ title: '加载中...' })

			try {
				const res = await uniCloud.callFunction({
					name: 'get_task_detail',
					data: {
						task_id: this.taskId
					}
				})

				if (res.result.code === 200) {
					const task = res.result.data.task

					// 填充表单数据
					this.formData = {
						name: task.name || '',
						description: task.description || '',
						owner: task.owner || '',
						priority: task.priority || 2,
						start_time: task.start_time ? this.formatDate(task.start_time) : '',
						due_time: task.due_time ? this.formatDate(task.due_time) : '',
						status: task.status || 0,
						progress: task.progress || 0
					}

					// 保存项目ID
					if (task.project_id) {
						this.projectId = task.project_id
					}
				} else {
					uni.showToast({
						title: res.result.message,
						icon: 'none'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				}
			} catch (error) {
				console.error('加载任务数据失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		},
		formatDate(date) {
			if (!date) return ''
			const d = new Date(date)
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
		},
		onStartTimeChange(e) {
			this.formData.start_time = e.detail.value
		},
		onDueTimeChange(e) {
			this.formData.due_time = e.detail.value
		},
		onProgressChange(e) {
			this.formData.progress = e.detail.value
		},
		async handleSubmit() {
			// 表单验证
			if (!this.formData.name.trim()) {
				uni.showToast({
					title: '请输入任务名称',
					icon: 'none'
				})
				return
			}

			if (!this.projectId && !this.taskId) {
				uni.showToast({
					title: '项目ID不能为空',
					icon: 'none'
				})
				return
			}

			// 验证时间
			if (this.formData.start_time && this.formData.due_time) {
				if (new Date(this.formData.start_time) > new Date(this.formData.due_time)) {
					uni.showToast({
						title: '开始时间不能晚于截止时间',
						icon: 'none'
					})
					return
				}
			}

			this.submitting = true

			try {
				const userInfo = uni.getStorageSync('userInfo')
				const functionName = this.taskId ? 'update_task' : 'create_task'
				const data = {
					...this.formData,
					owner_id: userInfo?.id || ''
				}

				if (this.taskId) {
					data.task_id = this.taskId
				} else {
					data.project_id = this.projectId
				}

				const res = await uniCloud.callFunction({
					name: functionName,
					data
				})

				if (res.result.code === 200) {
					uni.showToast({
						title: this.taskId ? '保存成功' : '创建成功',
						icon: 'success'
					})

					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				} else {
					uni.showToast({
						title: res.result.message,
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('提交失败:', error)
				uni.showToast({
					title: '操作失败',
					icon: 'none'
				})
			} finally {
				this.submitting = false
			}
		},
		handleCancel() {
			uni.navigateBack()
		}
	}
}
</script>

<style lang="scss" scoped>
.task-form-container {
	min-height: 100vh;
	background: #F5F5F5;
	padding-bottom: 80px;
}

.form-content {
	padding: 20px;
}

.form-item {
	background: #FFFFFF;
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 12px;

	.form-label {
		font-size: 14px;
		color: #666666;
		margin-bottom: 12px;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.required {
			color: #f5222d;
			margin-right: 4px;
		}

		.progress-value {
			font-size: 16px;
			font-weight: bold;
			color: #1890FF;
		}
	}

	.form-input {
		width: 100%;
		height: 44px;
		background: #F5F5F5;
		border-radius: 8px;
		padding: 0 16px;
		font-size: 16px;
	}

	.form-textarea {
		width: 100%;
		min-height: 100px;
		background: #F5F5F5;
		border-radius: 8px;
		padding: 12px 16px;
		font-size: 16px;
	}

	.char-count {
		display: block;
		text-align: right;
		font-size: 12px;
		color: #999999;
		margin-top: 8px;
	}

	.picker-input {
		height: 44px;
		background: #F5F5F5;
		border-radius: 8px;
		padding: 0 16px;
		display: flex;
		align-items: center;
		font-size: 16px;
	}

	.placeholder {
		color: #CCCCCC;
	}

	.priority-options,
	.status-options {
		display: flex;
		gap: 12px;
	}

	.priority-option,
	.status-option {
		flex: 1;
		height: 40px;
		background: #F5F5F5;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		color: #666666;
		transition: all 0.3s;

		&.active {
			background: #1890FF;
			color: #FFFFFF;
		}
	}
}

.bottom-actions {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #FFFFFF;
	padding: 12px 20px;
	box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
	display: flex;
	gap: 12px;

	button {
		flex: 1;
		height: 48px;
		border-radius: 8px;
		font-size: 16px;
		line-height: 48px;
	}

	.cancel-btn {
		background: #F5F5F5;
		color: #666666;
	}

	.submit-btn {
		background: #1890FF;
		color: #FFFFFF;
	}
}
</style>
