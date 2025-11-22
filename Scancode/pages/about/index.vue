<template>
	<view class="about-page">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="nav-back" @tap="goBack">
				<text class="back-icon">←</text>
				<text>返回</text>
			</view>
			<text class="nav-title">关于我们</text>
			<view class="nav-placeholder"></view>
		</view>

		<!-- 页面内容 -->
		<scroll-view class="content-scroll" scroll-y>
			<!-- 公司简介区域 -->
			<view class="company-intro">
				<view class="intro-bg"></view>
				<view class="container">
					<view class="intro-content">
						<view class="company-badge">
							<text class="badge-icon">⚡</text>
							<text class="badge-text">Technology Innovation</text>
						</view>
						<view class="company-title">
							<text class="title-line">南京玻丝焊芯</text>
							<text class="title-highlight">科技有限公司</text>
						</view>
						<view class="title-divider"></view>
						<view class="company-description">
							我们专注于<span class="text-highlight">光纤通信</span>与<span class="text-highlight">工业物联网</span>领域的技术创新，
							致力于为客户提供高品质的国产化解决方案。
						</view>
						
						<!-- 技术特色网格 -->
						<view class="tech-grid">
							<view class="tech-item">
								<view class="tech-icon">🔗</view>
								<text class="tech-name">光纤通信</text>
							</view>
							<view class="tech-item">
								<view class="tech-icon">🌐</view>
								<text class="tech-name">工业物联网</text>
							</view>
							<view class="tech-item">
								<view class="tech-icon">📡</view>
								<text class="tech-name">智能传感</text>
							</view>
							<view class="tech-item">
								<view class="tech-icon">📏</view>
								<text class="tech-name">高精度测量</text>
							</view>
						</view>
					</view>
					
					<!-- 公司形象 -->
					<view class="company-visual">
						<view class="visual-frame">
							<view class="frame-decoration top-left"></view>
							<view class="frame-decoration top-right"></view>
							<view class="frame-decoration bottom-left"></view>
							<view class="frame-decoration bottom-right"></view>
							<view class="image-container">
								<image src="/static/logo.png" class="company-image" mode="aspectFit"></image>
								<view class="image-effects">
									<view class="scan-line"></view>
								</view>
							</view>
							<view class="frame-info">
								<view class="info-panel">
									<text class="panel-title">Tech Profile</text>
									<view class="panel-data">
										<view class="data-row">
											<text class="data-label">Established</text>
											<text class="data-value">2019</text>
										</view>
										<view class="data-row">
											<text class="data-label">Innovation</text>
											<text class="data-value">50+</text>
										</view>
										<view class="data-row">
											<text class="data-label">Solutions</text>
											<text class="data-value">∞</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 发展历程 -->
			<view class="timeline-section">
				<view class="container">
					<view class="section-header">
						<view class="section-line"></view>
						<text class="section-title">发展历程</text>
						<view class="section-line"></view>
					</view>
					<view class="timeline">
						<view class="timeline-item">
							<view class="timeline-dot"></view>
							<view class="timeline-content">
								<text class="timeline-year">2019</text>
								<text class="timeline-title">公司成立</text>
								<text class="timeline-desc">专注于光纤通信技术研发</text>
							</view>
						</view>
						<view class="timeline-item">
							<view class="timeline-dot"></view>
							<view class="timeline-content">
								<text class="timeline-year">2020</text>
								<text class="timeline-title">技术突破</text>
								<text class="timeline-desc">成功研发高精度光纤熔接技术</text>
							</view>
						</view>
						<view class="timeline-item">
							<view class="timeline-dot"></view>
							<view class="timeline-content">
								<text class="timeline-year">2021</text>
								<text class="timeline-title">市场拓展</text>
								<text class="timeline-desc">进入工业物联网领域</text>
							</view>
						</view>
						<view class="timeline-item">
							<view class="timeline-dot"></view>
							<view class="timeline-content">
								<text class="timeline-year">2022</text>
								<text class="timeline-title">产品成熟</text>
								<text class="timeline-desc">推出智能物联网运维平台</text>
							</view>
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
				// 页面数据
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss">
	.about-page {
		width: 100vw;
		height: 100vh;
		background: linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%);
		position: relative;
		
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
			
			.company-intro {
				position: relative;
				min-height: 100vh;
				display: flex;
				align-items: center;
				
				.intro-bg {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
								radial-gradient(circle at 75% 75%, rgba(147, 197, 253, 0.06) 0%, transparent 50%);
					z-index: 1;
				}
				
				.intro-content {
					position: relative;
					z-index: 2;
					text-align: center;
					
					.company-badge {
						display: inline-flex;
						align-items: center;
						background: rgba(59, 130, 246, 0.1);
						border: 1px solid rgba(59, 130, 246, 0.3);
						border-radius: 20rpx;
						padding: 10rpx 20rpx;
						margin-bottom: 40rpx;
						
						.badge-icon {
							font-size: 24rpx;
							margin-right: 10rpx;
						}
						
						.badge-text {
							color: #3a8bcd;
							font-size: 24rpx;
							font-weight: 500;
						}
					}
					
					.company-title {
						display: flex;
						flex-direction: column;
						align-items: center;
						margin-bottom: 30rpx;
						
						.title-line {
							font-size: 48rpx;
							color: #ffffff;
							font-weight: 600;
							margin-bottom: 10rpx;
						}
						
						.title-highlight {
							font-size: 36rpx;
							background: linear-gradient(135deg, #3a8bcd 0%, #93c5fd 50%, #3a8bcd 100%);
							background-clip: text;
							-webkit-background-clip: text;
							-webkit-text-fill-color: transparent;
							font-weight: 700;
						}
					}
					
					.title-divider {
						width: 60rpx;
						height: 3rpx;
						background: linear-gradient(90deg, #3a8bcd 0%, #93c5fd 50%, #3a8bcd 100%);
						margin: 20rpx auto 30rpx;
						border-radius: 2rpx;
					}
					
					.company-description {
						color: rgba(255, 255, 255, 0.8);
						font-size: 28rpx;
						line-height: 1.6;
						max-width: 800rpx;
						margin: 0 auto 50rpx;
						
						.text-highlight {
							background: linear-gradient(135deg, #3a8bcd 0%, #93c5fd 50%, #3a8bcd 100%);
							background-clip: text;
							-webkit-background-clip: text;
							-webkit-text-fill-color: transparent;
							font-weight: 600;
						}
					}
					
					.tech-grid {
						display: grid;
						grid-template-columns: repeat(2, 1fr);
						gap: 30rpx;
						max-width: 600rpx;
						margin: 0 auto;
						
						.tech-item {
							display: flex;
							align-items: center;
							background: rgba(255, 255, 255, 0.05);
							border: 1px solid rgba(255, 255, 255, 0.1);
							border-radius: 12rpx;
							padding: 20rpx;
							
							.tech-icon {
								font-size: 36rpx;
								margin-right: 20rpx;
							}
							
							.tech-name {
								color: #ffffff;
								font-size: 26rpx;
								font-weight: 500;
							}
						}
					}
				}
				
				.company-visual {
					position: relative;
					z-index: 2;
					margin-top: 80rpx;
					
					.visual-frame {
						position: relative;
						background: rgba(255, 255, 255, 0.02);
						border: 1px solid rgba(255, 255, 255, 0.1);
						border-radius: 20rpx;
						padding: 40rpx;
						
						.frame-decoration {
							position: absolute;
							width: 40rpx;
							height: 40rpx;
							border: 2px solid #3a8bcd;
							
							&.top-left {
								top: -2px;
								left: -2px;
								border-right: none;
								border-bottom: none;
								border-radius: 10rpx 0 0 0;
							}
							
							&.top-right {
								top: -2px;
								right: -2px;
								border-left: none;
								border-bottom: none;
								border-radius: 0 10rpx 0 0;
							}
							
							&.bottom-left {
								bottom: -2px;
								left: -2px;
								border-right: none;
								border-top: none;
								border-radius: 0 0 0 10rpx;
							}
							
							&.bottom-right {
								bottom: -2px;
								right: -2px;
								border-left: none;
								border-top: none;
								border-radius: 0 0 10rpx 0;
							}
						}
						
						.image-container {
							position: relative;
							
							.company-image {
								width: 300rpx;
								height: 300rpx;
								border-radius: 15rpx;
							}
							
							.image-effects {
								position: absolute;
								top: 0;
								left: 0;
								width: 100%;
								height: 100%;
								
								.scan-line {
									position: absolute;
									top: 0;
									left: 0;
									width: 100%;
									height: 2rpx;
									background: linear-gradient(90deg, transparent, #3a8bcd, transparent);
									animation: scan 3s linear infinite;
								}
								
								@keyframes scan {
									0% { top: 0; }
									100% { top: 100%; }
								}
							}
						}
						
						.frame-info {
							margin-top: 40rpx;
							
							.info-panel {
								background: rgba(255, 255, 255, 0.05);
								border-radius: 12rpx;
								padding: 30rpx;
								
								.panel-title {
									color: #3a8bcd;
									font-size: 28rpx;
									font-weight: 600;
									margin-bottom: 20rpx;
								}
								
								.panel-data {
									.data-row {
										display: flex;
										justify-content: space-between;
										align-items: center;
										margin-bottom: 15rpx;
										
										.data-label {
											color: rgba(255, 255, 255, 0.7);
											font-size: 24rpx;
										}
										
										.data-value {
											color: #ffffff;
											font-size: 26rpx;
											font-weight: 600;
										}
									}
								}
							}
						}
					}
				}
			}
			
			.timeline-section {
				padding: 100rpx 0;
				background: rgba(255, 255, 255, 0.02);
				
				.section-header {
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 80rpx;
					
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
				
				.timeline {
					position: relative;
					max-width: 800rpx;
					margin: 0 auto;
					
					.timeline-item {
						display: flex;
						align-items: flex-start;
						margin-bottom: 60rpx;
						
						.timeline-dot {
							width: 20rpx;
							height: 20rpx;
							background: #3a8bcd;
							border-radius: 50%;
							margin-right: 40rpx;
							position: relative;
							
							&::after {
								content: '';
								position: absolute;
								top: 50%;
								left: 50%;
								transform: translate(-50%, -50%);
								width: 30rpx;
								height: 30rpx;
								border: 2rpx solid #3a8bcd;
								border-radius: 50%;
								animation: pulse 2s infinite;
							}
							
							@keyframes pulse {
								0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
								50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.2); }
								100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
							}
						}
						
						.timeline-content {
							flex: 1;
							
							.timeline-year {
								color: #3a8bcd;
								font-size: 32rpx;
								font-weight: 600;
								display: block;
								margin-bottom: 10rpx;
							}
							
							.timeline-title {
								color: #ffffff;
								font-size: 28rpx;
								font-weight: 600;
								display: block;
								margin-bottom: 10rpx;
							}
							
							.timeline-desc {
								color: rgba(255, 255, 255, 0.7);
								font-size: 24rpx;
								line-height: 1.5;
							}
						}
					}
				}
			}
		}
	}
</style>