<template>
	<view class="department-container">
		<view class="header">
			<text class="title">选择部门</text>
			<text class="subtitle">请选择您所在的部门</text>
		</view>

		<view class="department-list">
			<view
				class="department-card"
				v-for="(dept, index) in departments"
				:key="index"
				:style="{borderColor: dept.theme_color}"
				@click="selectDepartment(dept)"
			>
				<view class="dept-icon" :style="{backgroundColor: dept.theme_color}">
					<text class="icon-text">{{ dept.name.substring(0, 2) }}</text>
				</view>
				<view class="dept-info">
					<text class="dept-name">{{ dept.name }}</text>
					<text class="dept-desc">{{ dept.description }}</text>
				</view>
				<view class="arrow">→</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			departments: [
				{
					id: '1',
					name: '玻丝焊芯宠物机器人研发部门',
					description: '专注于宠物机器人的研发与创新',
					theme_color: '#1890FF'
				},
				{
					id: '2',
					name: '喵汪兔宠物用品运营部门',
					description: '宠物用品的运营与推广',
					theme_color: '#FF6B35'
				}
			]
		}
	},
	methods: {
		selectDepartment(dept) {
			// 保存选择的部门
			uni.setStorageSync('currentDepartment', dept)

			// 跳转到项目大厅（新的首页）
			uni.switchTab({
				url: '/pages/public/projects'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.department-container {
	min-height: 100vh;
	background: #F5F5F5;
	padding: 40px 20px;
}

.header {
	text-align: center;
	margin-bottom: 40px;

	.title {
		display: block;
		font-size: 32px;
		font-weight: bold;
		color: #333333;
		margin-bottom: 12px;
	}

	.subtitle {
		display: block;
		font-size: 16px;
		color: #999999;
	}
}

.department-list {
	.department-card {
		background: #FFFFFF;
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 20px;
		display: flex;
		align-items: center;
		border: 2px solid transparent;
		transition: all 0.3s;

		&:active {
			transform: scale(0.98);
		}

		.dept-icon {
			width: 60px;
			height: 60px;
			border-radius: 12px;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 16px;

			.icon-text {
				color: #FFFFFF;
				font-size: 20px;
				font-weight: bold;
			}
		}

		.dept-info {
			flex: 1;

			.dept-name {
				display: block;
				font-size: 18px;
				font-weight: bold;
				color: #333333;
				margin-bottom: 8px;
			}

			.dept-desc {
				display: block;
				font-size: 14px;
				color: #999999;
			}
		}

		.arrow {
			font-size: 24px;
			color: #CCCCCC;
		}
	}
}
</style>
