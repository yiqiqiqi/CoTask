<template>
	<view class="stats-container">
		<!-- 数据概览 -->
		<view class="overview-section">
			<view class="overview-card">
				<text class="card-label">总项目数</text>
				<text class="card-value">0</text>
			</view>
			<view class="overview-card">
				<text class="card-label">进行中</text>
				<text class="card-value" style="color: #1890FF;">0</text>
			</view>
			<view class="overview-card">
				<text class="card-label">本月完成</text>
				<text class="card-value" style="color: #52c41a;">0</text>
			</view>
			<view class="overview-card">
				<text class="card-label">延期项目</text>
				<text class="card-value" style="color: #f5222d;">0</text>
			</view>
		</view>

		<!-- 图表区域 -->
		<view class="charts-section">
			<view class="chart-card">
				<text class="chart-title">项目状态分布</text>
				<view class="chart-placeholder">
					<text class="placeholder-text">图表开发中...</text>
					<text class="placeholder-hint">可使用 uCharts 或 echarts</text>
				</view>
			</view>

			<view class="chart-card">
				<text class="chart-title">本月任务完成趋势</text>
				<view class="chart-placeholder">
					<text class="placeholder-text">图表开发中...</text>
					<text class="placeholder-hint">展示每日任务完成数量</text>
				</view>
			</view>
		</view>

		<!-- 导出功能 -->
		<view class="export-section">
			<button class="export-btn" @click="exportData">导出数据报表</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			statistics: {
				totalProjects: 0,
				inProgressProjects: 0,
				completedThisMonth: 0,
				delayedProjects: 0
			}
		}
	},
	onLoad() {
		this.loadStatistics()
	},
	methods: {
		async loadStatistics() {
			// TODO: 调用云函数获取统计数据
		},
		exportData() {
			uni.showToast({
				title: '导出功能开发中',
				icon: 'none'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.stats-container {
	min-height: 100vh;
	background: #F5F5F5;
	padding: 20px;
}

.overview-section {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12px;
	margin-bottom: 20px;

	.overview-card {
		background: #FFFFFF;
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

.charts-section {
	.chart-card {
		background: #FFFFFF;
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 20px;

		.chart-title {
			display: block;
			font-size: 16px;
			font-weight: bold;
			color: #333333;
			margin-bottom: 16px;
		}

		.chart-placeholder {
			height: 200px;
			background: #F5F5F5;
			border-radius: 8px;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			.placeholder-text {
				display: block;
				font-size: 16px;
				color: #999999;
				margin-bottom: 8px;
			}

			.placeholder-hint {
				display: block;
				font-size: 12px;
				color: #CCCCCC;
			}
		}
	}
}

.export-section {
	margin-top: 20px;

	.export-btn {
		width: 100%;
		height: 50px;
		background: #1890FF;
		color: #FFFFFF;
		border-radius: 8px;
		font-size: 16px;
	}
}
</style>
