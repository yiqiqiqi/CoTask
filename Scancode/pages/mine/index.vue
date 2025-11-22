<template>
	<view class="mine-container">
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="avatar">
				<text class="avatar-text">{{ userName.substring(0, 1) }}</text>
			</view>
			<view class="user-info">
				<text class="user-name">{{ userName }}</text>
				<text class="user-dept">{{ currentDepartment.name }}</text>
			</view>
		</view>

		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="menu-item" @click="changeDepartment">
				<text class="menu-icon">🔄</text>
				<text class="menu-label">切换部门</text>
				<text class="menu-arrow">→</text>
			</view>
			<view class="menu-item" @click="manageMembers" v-if="isAdmin">
				<text class="menu-icon">👥</text>
				<text class="menu-label">成员管理</text>
				<text class="menu-arrow">→</text>
			</view>
		</view>

		<!-- 系统信息 -->
		<view class="info-section">
			<view class="info-item">
				<text class="info-label">系统版本</text>
				<text class="info-value">v1.0.0</text>
			</view>
			<view class="info-item">
				<text class="info-label">当前部门</text>
				<text class="info-value">{{ currentDepartment.name }}</text>
			</view>
		</view>

		<!-- 退出登录 -->
		<view class="logout-section">
			<button class="logout-btn" @click="handleLogout">退出登录</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userName: '',
			currentDepartment: {},
			isAdmin: false
		}
	},
	onLoad() {
		this.loadUserInfo()
	},
	onShow() {
		this.loadUserInfo()
	},
	methods: {
		loadUserInfo() {
			const userInfo = uni.getStorageSync('userInfo')
			const dept = uni.getStorageSync('currentDepartment')

			if (userInfo) {
				this.userName = userInfo.name || userInfo.username || '用户'
				this.isAdmin = userInfo.role === 'admin'
			}

			if (dept) {
				this.currentDepartment = dept
			}
		},
		changeDepartment() {
			uni.navigateTo({
				url: '/pages/department/select'
			})
		},
		manageMembers() {
			uni.navigateTo({
				url: '/pages/admin/members'
			})
		},
		handleLogout() {
			uni.showModal({
				title: '提示',
				content: '确定要退出登录吗?',
				success: (res) => {
					if (res.confirm) {
						uni.clearStorageSync()
						uni.reLaunch({
							url: '/pages/login/index'
						})
					}
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.mine-container {
	min-height: 100vh;
	background: #F5F5F5;
}

.user-card {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40px 20px;
	display: flex;
	align-items: center;

	.avatar {
		width: 80px;
		height: 80px;
		border-radius: 40px;
		background: rgba(255, 255, 255, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20px;

		.avatar-text {
			font-size: 32px;
			color: #FFFFFF;
			font-weight: bold;
		}
	}

	.user-info {
		flex: 1;

		.user-name {
			display: block;
			font-size: 24px;
			font-weight: bold;
			color: #FFFFFF;
			margin-bottom: 8px;
		}

		.user-dept {
			display: block;
			font-size: 14px;
			color: rgba(255, 255, 255, 0.8);
		}
	}
}

.menu-section {
	margin: 20px;
	background: #FFFFFF;
	border-radius: 12px;
	overflow: hidden;

	.menu-item {
		display: flex;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid #F0F0F0;

		&:last-child {
			border-bottom: none;
		}

		.menu-icon {
			font-size: 24px;
			margin-right: 16px;
		}

		.menu-label {
			flex: 1;
			font-size: 16px;
			color: #333333;
		}

		.menu-arrow {
			font-size: 18px;
			color: #CCCCCC;
		}
	}
}

.info-section {
	margin: 20px;
	background: #FFFFFF;
	border-radius: 12px;
	overflow: hidden;

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid #F0F0F0;

		&:last-child {
			border-bottom: none;
		}

		.info-label {
			font-size: 14px;
			color: #999999;
		}

		.info-value {
			font-size: 14px;
			color: #333333;
		}
	}
}

.logout-section {
	margin: 20px;

	.logout-btn {
		width: 100%;
		height: 50px;
		background: #FFFFFF;
		color: #f5222d;
		border-radius: 8px;
		font-size: 16px;
		border: 1px solid #f5222d;
	}
}
</style>
