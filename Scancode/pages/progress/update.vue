<template>
	<view class="progress-update-container">
		<view class="placeholder">
			<text class="placeholder-text">进度更新页</text>
			<text class="placeholder-hint">功能开发中...</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			taskId: ''
		}
	},
	onLoad(options) {
		this.taskId = options.task_id || ''
	}
}
</script>

<style lang="scss" scoped>
.progress-update-container {
	min-height: 100vh;
	background: #F5F5F5;
	display: flex;
	align-items: center;
	justify-content: center;
}

.placeholder {
	text-align: center;

	.placeholder-text {
		display: block;
		font-size: 18px;
		color: #666666;
		margin-bottom: 12px;
	}

	.placeholder-hint {
		display: block;
		font-size: 14px;
		color: #999999;
	}
}
</style>
