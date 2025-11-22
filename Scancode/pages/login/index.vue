<template>
	<view class="login-container">
		<view class="login-box">
			<view class="logo-area">
				<text class="app-name">CoTask</text>
				<text class="app-desc">项目进度管理系统</text>
			</view>

			<view class="form-area">
				<view class="input-item">
					<input
						v-model="username"
						class="input"
						placeholder="请输入用户名"
						placeholder-class="placeholder"
					/>
				</view>
				<view class="input-item">
					<input
						v-model="password"
						class="input"
						type="password"
						placeholder="请输入密码"
						placeholder-class="placeholder"
					/>
				</view>
				<button class="login-btn" @click="handleLogin">登录</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			username: '',
			password: ''
		}
	},
	methods: {
		handleLogin() {
			if (!this.username || !this.password) {
				uni.showToast({
					title: '请输入用户名和密码',
					icon: 'none'
				})
				return
			}

			// TODO: 调用登录云函数
			// 临时跳过登录，直接进入部门选择
			uni.setStorageSync('userInfo', {
				username: this.username,
				name: this.username
			})

			uni.redirectTo({
				url: '/pages/department/select'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.login-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px;
}

.login-box {
	width: 100%;
	max-width: 400px;
}

.logo-area {
	text-align: center;
	margin-bottom: 60px;

	.app-name {
		display: block;
		font-size: 48px;
		font-weight: bold;
		color: #FFFFFF;
		margin-bottom: 16px;
	}

	.app-desc {
		display: block;
		font-size: 16px;
		color: rgba(255, 255, 255, 0.8);
	}
}

.form-area {
	.input-item {
		margin-bottom: 20px;

		.input {
			width: 100%;
			height: 50px;
			background: rgba(255, 255, 255, 0.9);
			border-radius: 8px;
			padding: 0 20px;
			font-size: 16px;
		}

		.placeholder {
			color: #999999;
		}
	}

	.login-btn {
		width: 100%;
		height: 50px;
		background: #FFFFFF;
		color: #667eea;
		border-radius: 8px;
		font-size: 18px;
		font-weight: bold;
		margin-top: 10px;
	}
}
</style>
