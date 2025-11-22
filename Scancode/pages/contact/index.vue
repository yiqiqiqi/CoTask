<template>
	<view class="contact-page">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="nav-back" @tap="goBack">
				<text class="back-icon">←</text>
				<text>返回</text>
			</view>
			<text class="nav-title">联系我们</text>
			<view class="nav-placeholder"></view>
		</view>

		<!-- 页面内容 -->
		<scroll-view class="content-scroll" scroll-y>
			<!-- 联系信息概览 -->
			<view class="contact-overview">
				<view class="container">
					<view class="section-header">
						<view class="section-line"></view>
						<text class="section-title">联系我们</text>
						<view class="section-line"></view>
					</view>
					<view class="overview-text">
						期待与您合作，共同推动<span class="text-highlight">光纤通信</span>与<span class="text-highlight">工业物联网</span>技术的发展
					</view>
				</view>
			</view>

			<!-- 联系信息网格 -->
			<view class="contact-grid-section">
				<view class="container">
					<view class="contact-grid">
						<view class="contact-card" v-for="(item, index) in contactInfo" :key="index"
							@tap="handleContactAction(item)">
							<view class="card-icon">
								<text>{{ item.icon }}</text>
							</view>
							<view class="card-content">
								<text class="card-title">{{ item.title }}</text>
								<text class="card-value">{{ item.value }}</text>
								<text class="card-desc" v-if="item.description">{{ item.description }}</text>
							</view>
							<view class="card-action">
								<text class="action-text">{{ item.action }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 地图位置 -->
			<view class="map-section">
				<view class="container">
					<view class="section-header">
						<view class="section-line"></view>
						<text class="section-title">公司位置</text>
						<view class="section-line"></view>
					</view>
					<view class="map-container">
						<view class="map-placeholder">
							<text class="map-icon">📍</text>
							<text class="map-text">南京市鼓楼区中山路99号科技大厦A座18层</text>
						</view>
						<view class="location-info">
							<view class="location-item">
								<text class="item-label">地址</text>
								<text class="item-value">南京市鼓楼区中山路99号科技大厦A座18层</text>
							</view>
							<view class="location-item">
								<text class="item-label">交通</text>
								<text class="item-value">地铁1号线鼓楼站步行5分钟</text>
							</view>
							<view class="location-item">
								<text class="item-label">营业时间</text>
								<text class="item-value">周一至周五 9:00-18:00</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 联系表单 -->
			<view class="contact-form-section">
				<view class="container">
					<view class="section-header">
						<view class="section-line"></view>
						<text class="section-title">在线留言</text>
						<view class="section-line"></view>
					</view>
					<view class="form-container">
						<view class="form-group">
							<text class="form-label">姓名</text>
							<input class="form-input" v-model="formData.name" placeholder="请输入您的姓名" />
						</view>
						<view class="form-group">
							<text class="form-label">电话</text>
							<input class="form-input" v-model="formData.phone" placeholder="请输入您的联系电话" type="number" />
						</view>
						<view class="form-group">
							<text class="form-label">邮箱</text>
							<input class="form-input" v-model="formData.email" placeholder="请输入您的邮箱地址" type="email" />
						</view>
						<view class="form-group">
							<text class="form-label">公司</text>
							<input class="form-input" v-model="formData.company" placeholder="请输入您的公司名称" />
						</view>
						<view class="form-group">
							<text class="form-label">留言内容</text>
							<textarea class="form-textarea" v-model="formData.message" placeholder="请输入您的留言内容" maxlength="500" />
							<text class="textarea-counter">{{ formData.message.length }}/500</text>
						</view>
						<button class="submit-btn" @tap="handleSubmit" :disabled="!isFormValid">
							<text class="btn-text">提交留言</text>
						</button>
					</view>
				</view>
			</view>

			<!-- 底部信息 -->
			<view class="footer-section">
				<view class="container">
					<view class="footer-content">
						<text class="footer-title">南京玻丝焊芯科技有限公司</text>
						<text class="footer-desc">专注于光纤通信与工业物联网技术创新</text>
						<view class="social-links">
							<text class="social-item" @tap="openWechat">微信</text>
							<text class="social-divider">|</text>
							<text class="social-item" @tap="openWeibo">微博</text>
							<text class="social-divider">|</text>
							<text class="social-item" @tap="openLinkedIn">LinkedIn</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				contactInfo: [
					{
						icon: '📞',
						title: '联系电话',
						value: '025-8888-9999',
						description: '工作日 9:00-18:00',
						action: '拨打电话',
						type: 'phone'
					},
					{
						icon: '✉️',
						title: '电子邮箱',
						value: 'contact@bosihanxin.com',
						description: '24小时内回复',
						action: '发送邮件',
						type: 'email'
					},
					{
						icon: '💬',
						title: '在线客服',
						value: '微信客服',
						description: '扫码添加微信',
						action: '联系客服',
						type: 'wechat'
					},
					{
						icon: '🌐',
						title: '官方网站',
						value: 'www.bosihanxin.com',
						description: '了解更多信息',
						action: '访问网站',
						type: 'website'
					}
				],
				formData: {
					name: '',
					phone: '',
					email: '',
					company: '',
					message: ''
				}
			}
		},
		computed: {
			isFormValid() {
				return this.formData.name && this.formData.phone && this.formData.message
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
			},
			handleContactAction(item) {
				switch (item.type) {
					case 'phone':
						uni.makePhoneCall({
							phoneNumber: item.value
						})
						break
					case 'email':
						uni.showModal({
							title: '发送邮件',
							content: `是否要发送邮件到 ${item.value}？`,
							success: (res) => {
								if (res.confirm) {
									// 这里可以调用邮件发送接口
									uni.showToast({
										title: '邮件功能开发中',
										icon: 'none'
									})
								}
							}
						})
						break
					case 'wechat':
						uni.showModal({
							title: '微信客服',
							content: '请扫描二维码添加微信客服',
							showCancel: false
						})
						break
					case 'website':
						uni.navigateTo({
							url: '/pages/webview/webview?url=' + encodeURIComponent('https://www.bosihanxin.com')
						})
						break
				}
			},
			handleSubmit() {
				if (!this.isFormValid) {
					uni.showToast({
						title: '请填写完整信息',
						icon: 'none'
					})
					return
				}
				
				// 模拟提交表单
				uni.showLoading({
					title: '提交中...'
				})
				
				setTimeout(() => {
					uni.hideLoading()
					uni.showToast({
						title: '留言提交成功',
						icon: 'success'
					})
					
					// 清空表单
					this.formData = {
						name: '',
						phone: '',
						email: '',
						company: '',
						message: ''
					}
				}, 2000)
			},
			openWechat() {
				uni.showModal({
					title: '微信公众号',
					content: '请搜索"玻丝焊芯科技"关注我们的公众号',
					showCancel: false
				})
			},
			openWeibo() {
				uni.navigateTo({
					url: '/pages/webview/webview?url=' + encodeURIComponent('https://weibo.com/bosihanxin')
				})
			},
			openLinkedIn() {
				uni.navigateTo({
					url: '/pages/webview/webview?url=' + encodeURIComponent('https://linkedin.com/company/bosihanxin')
				})
			}
		}
	}
</script>

<style lang="scss">
	.contact-page {
		width: 100vw;
		height: 100vh;
		background: linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%);
		
		.custom-navbar {
			height: 88rpx;
			background: rgba(0, 0, 0, 0.8);
			backdrop-filter: blur(20px);
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 30rpx;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			
			.nav-back {
				display: flex;
				align-items: center;
				color: #3a8bcd;
				font-size: 28rpx;
				
				.back-icon {
					margin-right: 10rpx;
					font-size: 32rpx;
				}
			}
			
			.nav-title {
				color: #ffffff;
				font-size: 32rpx;
				font-weight: 600;
			}
			
			.nav-placeholder {
				width: 120rpx;
			}
		}
		
		.content-scroll {
			height: calc(100vh - 88rpx);
			
			.container {
				max-width: 1200rpx;
				margin: 0 auto;
				padding: 0 30rpx;
			}
			
			.contact-overview {
				padding: 80rpx 0 60rpx;
				background: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
				
				.section-header {
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 40rpx;
					
					.section-line {
						width: 80rpx;
						height: 2rpx;
						background: linear-gradient(90deg, transparent, #3a8bcd, transparent);
						margin: 0 30rpx;
					}
					
					.section-title {
						font-size: 36rpx;
						color: #ffffff;
						font-weight: 600;
					}
				}
				
				.overview-text {
					text-align: center;
					color: rgba(255, 255, 255, 0.8);
					font-size: 28rpx;
					line-height: 1.6;
					
					.text-highlight {
						background: linear-gradient(135deg, #3a8bcd 0%, #93c5fd 50%, #3a8bcd 100%);
						background-clip: text;
						-webkit-background-clip: text;
						-webkit-text-fill-color: transparent;
						font-weight: 600;
					}
				}
			}
			
			.contact-grid-section {
				padding: 60rpx 0;
				
				.contact-grid {
					display: grid;
					gap: 30rpx;
					
					.contact-card {
						display: flex;
						align-items: center;
						background: rgba(255, 255, 255, 0.05);
						border: 1px solid rgba(255, 255, 255, 0.1);
						border-radius: 20rpx;
						padding: 30rpx;
						transition: all 0.3s ease;
						
						&:active {
							transform: scale(0.98);
							background: rgba(255, 255, 255, 0.08);
						}
						
						.card-icon {
							width: 80rpx;
							height: 80rpx;
							background: linear-gradient(135deg, #3a8bcd 0%, #93c5fd 100%);
							border-radius: 16rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							margin-right: 30rpx;
							
							text {
								font-size: 36rpx;
							}
						}
						
						.card-content {
							flex: 1;
							
							.card-title {
								color: #ffffff;
								font-size: 28rpx;
								font-weight: 600;
								display: block;
								margin-bottom: 8rpx;
							}
							
							.card-value {
								color: #3a8bcd;
								font-size: 26rpx;
								font-weight: 500;
								display: block;
								margin-bottom: 5rpx;
							}
							
							.card-desc {
								color: rgba(255, 255, 255, 0.6);
								font-size: 22rpx;
								display: block;
							}
						}
						
						.card-action {
							.action-text {
								color: #3a8bcd;
								font-size: 24rpx;
								font-weight: 500;
							}
						}
					}
				}
			}
			
			.map-section {
				padding: 80rpx 0;
				background: rgba(255, 255, 255, 0.02);
				
				.section-header {
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 60rpx;
					
					.section-line {
						width: 80rpx;
						height: 2rpx;
						background: linear-gradient(90deg, transparent, #3a8bcd, transparent);
						margin: 0 30rpx;
					}
					
					.section-title {
						font-size: 36rpx;
						color: #ffffff;
						font-weight: 600;
					}
				}
				
				.map-container {
					.map-placeholder {
						display: flex;
						align-items: center;
						justify-content: center;
						background: rgba(255, 255, 255, 0.05);
						border: 1px solid rgba(255, 255, 255, 0.1);
						border-radius: 16rpx;
						padding: 60rpx 40rpx;
						margin-bottom: 40rpx;
						
						.map-icon {
							font-size: 48rpx;
							margin-right: 20rpx;
						}
						
						.map-text {
							color: rgba(255, 255, 255, 0.8);
							font-size: 26rpx;
						}
					}
					
					.location-info {
						.location-item {
							display: flex;
							align-items: center;
							margin-bottom: 20rpx;
							
							.item-label {
								color: #3a8bcd;
								font-size: 24rpx;
								font-weight: 600;
								width: 120rpx;
							}
							
							.item-value {
								color: rgba(255, 255, 255, 0.8);
								font-size: 24rpx;
								flex: 1;
							}
						}
					}
				}
			}
			
			.contact-form-section {
				padding: 80rpx 0;
				
				.section-header {
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 60rpx;
					
					.section-line {
						width: 80rpx;
						height: 2rpx;
						background: linear-gradient(90deg, transparent, #3a8bcd, transparent);
						margin: 0 30rpx;
					}
					
					.section-title {
						font-size: 36rpx;
						color: #ffffff;
						font-weight: 600;
					}
				}
				
				.form-container {
					.form-group {
						margin-bottom: 40rpx;
						
						.form-label {
							color: #ffffff;
							font-size: 28rpx;
							font-weight: 600;
							display: block;
							margin-bottom: 15rpx;
						}
						
						.form-input {
							background: rgba(255, 255, 255, 0.05);
							border: 1px solid rgba(255, 255, 255, 0.1);
							border-radius: 12rpx;
							padding: 20rpx;
							color: #ffffff;
							font-size: 26rpx;
							
							&::placeholder {
								color: rgba(255, 255, 255, 0.4);
							}
						}
						
						.form-textarea {
							background: rgba(255, 255, 255, 0.05);
							border: 1px solid rgba(255, 255, 255, 0.1);
							border-radius: 12rpx;
							padding: 20rpx;
							color: #ffffff;
							font-size: 26rpx;
							height: 200rpx;
							
							&::placeholder {
								color: rgba(255, 255, 255, 0.4);
							}
						}
						
						.textarea-counter {
							color: rgba(255, 255, 255, 0.5);
							font-size: 22rpx;
							text-align: right;
							display: block;
							margin-top: 10rpx;
						}
					}
					
					.submit-btn {
						background: linear-gradient(135deg, #3a8bcd 0%, #93c5fd 100%);
						border: none;
						border-radius: 12rpx;
						padding: 25rpx 0;
						width: 100%;
						
						&:disabled {
							background: rgba(255, 255, 255, 0.1);
						}
						
						.btn-text {
							color: #ffffff;
							font-size: 28rpx;
							font-weight: 600;
						}
					}
				}
			}
			
			.footer-section {
				padding: 60rpx 0 40rpx;
				background: rgba(255, 255, 255, 0.02);
				
				.footer-content {
					text-align: center;
					
					.footer-title {
						color: #ffffff;
						font-size: 28rpx;
						font-weight: 600;
						display: block;
						margin-bottom: 15rpx;
					}
					
					.footer-desc {
						color: rgba(255, 255, 255, 0.6);
						font-size: 24rpx;
						display: block;
						margin-bottom: 30rpx;
					}
					
					.social-links {
						display: flex;
						align-items: center;
						justify-content: center;
						
						.social-item {
							color: #3a8bcd;
							font-size: 24rpx;
							font-weight: 500;
						}
						
						.social-divider {
							color: rgba(255, 255, 255, 0.3);
							margin: 0 20rpx;
						}
					}
				}
			}
		}
	}
</style>