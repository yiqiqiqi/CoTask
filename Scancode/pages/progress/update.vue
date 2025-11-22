<template>
	<view class="progress-update-container">
		<view class="form-content">
			<!-- 当前进度 -->
			<view class="form-item">
				<view class="form-label">
					<text>当前进度</text>
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
					block-size="24"
					show-value
				/>
				<view class="progress-tips">
					<text class="tip-item">0% - 未开始</text>
					<text class="tip-item">1-99% - 进行中</text>
					<text class="tip-item">100% - 已完成</text>
				</view>
			</view>

			<!-- 进度说明 -->
			<view class="form-item">
				<view class="form-label">进度说明</view>
				<textarea
					v-model="formData.content"
					class="form-textarea"
					placeholder="请描述本次进度更新的内容..."
					placeholder-class="placeholder"
					:maxlength="500"
				/>
				<text class="char-count">{{ formData.content.length }}/500</text>
			</view>

			<!-- 附件上传 -->
			<view class="form-item">
				<view class="form-label">上传附件（可选）</view>
				<view class="image-upload">
					<view
						class="image-item"
						v-for="(image, index) in images"
						:key="index"
					>
						<image :src="image" mode="aspectFill" class="image"></image>
						<view class="image-delete" @click="deleteImage(index)">×</view>
					</view>
					<view class="upload-btn" @click="chooseImage" v-if="images.length < 9">
						<text class="upload-icon">+</text>
						<text class="upload-text">上传图片</text>
					</view>
				</view>
				<text class="upload-hint">最多上传9张图片</text>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view class="bottom-actions">
			<button class="cancel-btn" @click="handleCancel">取消</button>
			<button class="submit-btn" @click="handleSubmit" :loading="submitting">
				提交更新
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
			targetType: 'task', // task 或 project
			targetName: '',
			formData: {
				progress: 0,
				content: ''
			},
			images: [],
			imageFileIds: [],
			submitting: false
		}
	},
	onLoad(options) {
		this.taskId = options.task_id || ''
		this.projectId = options.project_id || ''
		this.targetType = this.taskId ? 'task' : 'project'

		// 加载当前进度
		this.loadCurrentProgress()
	},
	methods: {
		async loadCurrentProgress() {
			const targetId = this.taskId || this.projectId
			if (!targetId) return

			try {
				const functionName = this.targetType === 'task' ? 'get_task_detail' : 'get_project_detail'
				const paramName = this.targetType === 'task' ? 'task_id' : 'project_id'

				const res = await uniCloud.callFunction({
					name: functionName,
					data: {
						[paramName]: targetId
					}
				})

				if (res.result.code === 200) {
					const target = this.targetType === 'task'
						? res.result.data.task
						: res.result.data.project

					this.formData.progress = target.progress || 0
					this.targetName = target.name || ''

					// 设置页面标题
					uni.setNavigationBarTitle({
						title: `更新进度 - ${this.targetName}`
					})
				}
			} catch (error) {
				console.error('加载当前进度失败:', error)
			}
		},
		onProgressChange(e) {
			this.formData.progress = e.detail.value
		},
		chooseImage() {
			uni.chooseImage({
				count: 9 - this.images.length,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const tempFilePaths = res.tempFilePaths
					this.uploadImages(tempFilePaths)
				}
			})
		},
		async uploadImages(filePaths) {
			uni.showLoading({ title: '上传中...' })

			try {
				for (let filePath of filePaths) {
					const result = await uniCloud.uploadFile({
						filePath,
						cloudPath: `progress/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
					})

					this.images.push(filePath)
					this.imageFileIds.push(result.fileID)
				}
			} catch (error) {
				console.error('上传失败:', error)
				uni.showToast({
					title: '上传失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		},
		deleteImage(index) {
			uni.showModal({
				title: '提示',
				content: '确定删除这张图片吗?',
				success: (res) => {
					if (res.confirm) {
						this.images.splice(index, 1)
						this.imageFileIds.splice(index, 1)
					}
				}
			})
		},
		async handleSubmit() {
			// 验证
			if (!this.formData.content.trim()) {
				uni.showToast({
					title: '请填写进度说明',
					icon: 'none'
				})
				return
			}

			const targetId = this.taskId || this.projectId
			if (!targetId) {
				uni.showToast({
					title: '缺少目标ID',
					icon: 'none'
				})
				return
			}

			this.submitting = true

			try {
				const userInfo = uni.getStorageSync('userInfo')

				const res = await uniCloud.callFunction({
					name: 'add_progress_record',
					data: {
						target_type: this.targetType,
						target_id: targetId,
						progress: this.formData.progress,
						content: this.formData.content,
						updater: userInfo?.name || userInfo?.username || '',
						updater_id: userInfo?.id || '',
						images: this.imageFileIds
					}
				})

				if (res.result.code === 200) {
					uni.showToast({
						title: '更新成功',
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
					title: '提交失败',
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
.progress-update-container {
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

		.progress-value {
			font-size: 20px;
			font-weight: bold;
			color: #1890FF;
		}
	}

	.progress-tips {
		display: flex;
		justify-content: space-between;
		margin-top: 12px;
		padding: 0 8px;

		.tip-item {
			font-size: 12px;
			color: #999999;
		}
	}

	.form-textarea {
		width: 100%;
		min-height: 120px;
		background: #F5F5F5;
		border-radius: 8px;
		padding: 12px 16px;
		font-size: 16px;
		line-height: 1.6;
	}

	.char-count {
		display: block;
		text-align: right;
		font-size: 12px;
		color: #999999;
		margin-top: 8px;
	}

	.placeholder {
		color: #CCCCCC;
	}

	.image-upload {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;

		.image-item {
			position: relative;
			width: 100px;
			height: 100px;

			.image {
				width: 100%;
				height: 100%;
				border-radius: 8px;
			}

			.image-delete {
				position: absolute;
				top: -8px;
				right: -8px;
				width: 24px;
				height: 24px;
				background: #f5222d;
				color: #FFFFFF;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 20px;
				line-height: 1;
			}
		}

		.upload-btn {
			width: 100px;
			height: 100px;
			background: #F5F5F5;
			border: 2px dashed #CCCCCC;
			border-radius: 8px;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			.upload-icon {
				font-size: 32px;
				color: #999999;
				margin-bottom: 4px;
			}

			.upload-text {
				font-size: 12px;
				color: #999999;
			}
		}
	}

	.upload-hint {
		display: block;
		font-size: 12px;
		color: #999999;
		margin-top: 8px;
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
