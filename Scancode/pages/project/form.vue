<template>
	<view class="project-form-container">
		<view class="form-content">
			<!-- 项目名称 -->
			<view class="form-item">
				<view class="form-label">
					<text class="required">*</text>
					<text>项目名称</text>
				</view>
				<input
					v-model="formData.name"
					class="form-input"
					placeholder="请输入项目名称"
					placeholder-class="placeholder"
				/>
			</view>

			<!-- 项目描述 -->
			<view class="form-item">
				<view class="form-label">项目描述</view>
				<textarea
					v-model="formData.description"
					class="form-textarea"
					placeholder="请输入项目描述"
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

			<!-- 预计完成时间 -->
			<view class="form-item">
				<view class="form-label">预计完成时间</view>
				<picker
					mode="date"
					:value="formData.end_time"
					@change="onEndTimeChange"
				>
					<view class="picker-input">
						<text v-if="formData.end_time">{{ formData.end_time }}</text>
						<text v-else class="placeholder">请选择预计完成时间</text>
					</view>
				</picker>
			</view>

			<!-- 项目状态（编辑时显示） -->
			<view class="form-item" v-if="projectId">
				<view class="form-label">项目状态</view>
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
		</view>

		<!-- 底部操作栏 -->
		<view class="bottom-actions">
			<button class="cancel-btn" @click="handleCancel">取消</button>
			<button class="submit-btn" @click="handleSubmit" :loading="submitting">
				{{ projectId ? '保存' : '创建' }}
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			projectId: '',
			currentDepartment: {},
			formData: {
				name: '',
				description: '',
				owner: '',
				priority: 2,
				start_time: '',
				end_time: '',
				status: 0
			},
			priorityOptions: [
				{ label: '低', value: 1 },
				{ label: '中', value: 2 },
				{ label: '高', value: 3 }
			],
			statusOptions: [
				{ label: '未开始', value: 0 },
				{ label: '进行中', value: 1 },
				{ label: '已完成', value: 2 },
				{ label: '已暂停', value: 3 }
			],
			submitting: false
		}
	},
	onLoad(options) {
		this.projectId = options.id || ''
		this.loadDepartment()

		if (this.projectId) {
			// 编辑模式，加载项目数据
			this.loadProjectData()
		}
	},
	methods: {
		loadDepartment() {
			const dept = uni.getStorageSync('currentDepartment')
			if (dept) {
				this.currentDepartment = dept
			}
		},
		async loadProjectData() {
			uni.showLoading({ title: '加载中...' })

			try {
				const res = await uniCloud.callFunction({
					name: 'get_project_detail',
					data: {
						project_id: this.projectId
					}
				})

				if (res.result.code === 200) {
					const project = res.result.data.project
					this.formData = {
						name: project.name,
						description: project.description || '',
						owner: project.owner || '',
						priority: project.priority,
						start_time: project.start_time ? this.formatDate(project.start_time) : '',
						end_time: project.end_time ? this.formatDate(project.end_time) : '',
						status: project.status
					}
				} else {
					uni.showToast({
						title: res.result.message,
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('加载项目数据失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		},
		onStartTimeChange(e) {
			this.formData.start_time = e.detail.value
		},
		onEndTimeChange(e) {
			this.formData.end_time = e.detail.value
		},
		formatDate(date) {
			if (!date) return ''
			const d = new Date(date)
			const year = d.getFullYear()
			const month = String(d.getMonth() + 1).padStart(2, '0')
			const day = String(d.getDate()).padStart(2, '0')
			return `${year}-${month}-${day}`
		},
		async handleSubmit() {
			// 表单验证
			if (!this.formData.name.trim()) {
				uni.showToast({
					title: '请输入项目名称',
					icon: 'none'
				})
				return
			}

			// 验证时间
			if (this.formData.start_time && this.formData.end_time) {
				if (new Date(this.formData.start_time) > new Date(this.formData.end_time)) {
					uni.showToast({
						title: '开始时间不能晚于结束时间',
						icon: 'none'
					})
					return
				}
			}

			this.submitting = true

			try {
				const userInfo = uni.getStorageSync('userInfo')
				const functionName = this.projectId ? 'update_project' : 'create_project'
				const data = {
					...this.formData,
					department_id: this.currentDepartment.id || '1',
					owner_id: userInfo?.id || ''
				}

				if (this.projectId) {
					data.project_id = this.projectId
				}

				const res = await uniCloud.callFunction({
					name: functionName,
					data
				})

				if (res.result.code === 200) {
					uni.showToast({
						title: this.projectId ? '保存成功' : '创建成功',
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
.project-form-container {
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

		.required {
			color: #f5222d;
			margin-right: 4px;
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
