<template>
	<view class="task-detail-container">
		<view class="placeholder">
			<text class="placeholder-text">任务详情页</text>
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
		this.taskId = options.id || ''
	}
}
</script>

<style lang="scss" scoped>
.task-detail-container {
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
