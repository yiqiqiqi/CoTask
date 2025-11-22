<template>
	<view class="business-page">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="nav-back" @tap="goBack">
				<text class="back-icon">←</text>
				<text>返回</text>
			</view>
			<text class="nav-title">核心业务</text>
			<view class="nav-placeholder"></view>
		</view>

		<!-- 页面内容 -->
		<scroll-view class="content-scroll" scroll-y>
			<!-- 业务概览 -->
			<view class="business-overview">
				<view class="container">
					<view class="section-header">
						<view class="section-line"></view>
						<text class="section-title">核心业务</text>
						<view class="section-line"></view>
					</view>
					<view class="overview-text">
						我们专注于<span class="text-highlight">光纤通信</span>与<span class="text-highlight">工业物联网</span>领域，
						提供从硬件设备到软件平台的全栈解决方案
					</view>
				</view>
			</view>

			<!-- 业务网格 -->
			<view class="business-grid-section">
				<view class="container">
					<view class="business-grid">
						<view class="business-card" v-for="(item, index) in businessList" :key="index"
							@tap="navigateToDetail(item)">
							<view class="card-icon">
								<text>{{ item.icon }}</text>
							</view>
							<view class="card-content">
								<text class="card-title">{{ item.title }}</text>
								<text class="card-desc">{{ item.description }}</text>
								<view class="card-features">
									<text class="feature-tag" v-for="(feature, fIndex) in item.features" :key="fIndex">
										{{ feature }}
									</text>
								</view>
							</view>
							<view class="card-arrow">
								<text>→</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 技术优势 -->
			<view class="tech-advantages">
				<view class="container">
					<view class="section-header">
						<view class="section-line"></view>
						<text class="section-title">技术优势</text>
						<view class="section-line"></view>
					</view>
					<view class="advantages-list">
						<view class="advantage-item" v-for="(advantage, index) in advantages" :key="index">
							<view class="advantage-icon">
								<text>{{ advantage.icon }}</text>
							</view>
							<view class="advantage-content">
								<text class="advantage-title">{{ advantage.title }}</text>
								<text class="advantage-desc">{{ advantage.description }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 成功案例 -->
			<view class="success-cases">
				<view class="container">
					<view class="section-header">
						<view class="section-line"></view>
						<text class="section-title">成功案例</text>
						<view class="section-line"></view>
					</view>
					<view class="cases-grid">
						<view class="case-card" v-for="(caseItem, index) in successCases" :key="index">
							<view class="case-header">
								<text class="case-industry">{{ caseItem.industry }}</text>
								<text class="case-year">{{ caseItem.year }}</text>
							</view>
							<text class="case-title">{{ caseItem.title }}</text>
							<text class="case-desc">{{ caseItem.description }}</text>
							<view class="case-results">
								<text class="result-item" v-for="(result, rIndex) in caseItem.results" :key="rIndex">
									{{ result }}
								</text>
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
				businessList: [
					{
						icon: '🔗',
						title: '光纤通信设备',
						description: '提供高性能光纤熔接机、光功率计等专业设备',
						features: ['高精度熔接', '智能检测', '远程监控']
					},
					{
						icon: '🌐',
						title: '工业物联网平台',
						description: '构建智能化的工业设备监控与管理系统',
						features: ['实时数据', '预测维护', '智能分析']
					},
					{
						icon: '📡',
						title: '智能传感技术',
						description: '研发高精度传感器及数据采集解决方案',
						features: ['高灵敏度', '低功耗', '无线传输']
					},
					{
						icon: '📏',
						title: '测量与检测系统',
						description: '提供工业级精密测量和质量检测设备',
						features: ['微米级精度', '自动化检测', '数据追溯']
					}
				],
				advantages: [
					{
						icon: '⚡',
						title: '技术创新',
						description: '拥有50+项专利技术，持续推动行业技术革新'
					},
					{
						icon: '🔧',
						title: '定制化服务',
						description: '根据客户需求提供个性化解决方案'
					},
					{
						icon: '🛡️',
						title: '质量保证',
						description: '严格的质量控制体系，确保产品可靠性'
					},
					{
						icon: '🚀',
						title: '快速响应',
						description: '专业团队提供7×24小时技术支持服务'
					}
				],
				successCases: [
					{
						industry: '通信运营商',
						year: '2022',
						title: '5G基站光纤网络建设',
						description: '为某大型通信运营商提供光纤熔接设备和技术支持',
						results: ['熔接效率提升30%', '故障率降低50%', '运维成本节约20%']
					},
					{
						industry: '智能制造',
						year: '2021',
						title: '智能工厂物联网改造',
						description: '为某制造企业构建工业物联网监控平台',
						results: ['设备利用率提升25%', '维护成本降低40%', '生产效率提高15%']
					},
					{
						industry: '能源电力',
						year: '2023',
						title: '变电站智能监测系统',
						description: '为电力公司提供变电站设备状态监测解决方案',
						results: ['实时监控覆盖100%', '预警准确率95%', '运维效率提升35%']
					}
				]
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
			},
			navigateToDetail(item) {
				uni.showToast({
					title: `查看${item.title}详情`,
					icon: 'none'
				})
			}
		}
	}
</script>

<style lang="scss">
	.business-page {
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
			
			.business-overview {
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
			
			.business-grid-section {
				padding: 60rpx 0;
				
				.business-grid {
					display: grid;
					gap: 40rpx;
					
					.business-card {
						display: flex;
						align-items: center;
						background: rgba(255, 255, 255, 0.05);
						border: 1px solid rgba(255, 255, 255, 0.1);
						border-radius: 20rpx;
						padding: 40rpx;
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
								font-size: 32rpx;
								font-weight: 600;
								display: block;
								margin-bottom: 10rpx;
							}
							
							.card-desc {
								color: rgba(255, 255, 255, 0.7);
								font-size: 26rpx;
								display: block;
								margin-bottom: 20rpx;
								line-height: 1.4;
							}
							
							.card-features {
								display: flex;
								flex-wrap: wrap;
								gap: 10rpx;
								
								.feature-tag {
									background: rgba(59, 130, 246, 0.2);
									color: #3a8bcd;
									font-size: 22rpx;
									padding: 6rpx 12rpx;
									border-radius: 8rpx;
								}
							}
						}
						
						.card-arrow {
							color: #3a8bcd;
							font-size: 28rpx;
							font-weight: 600;
						}
					}
				}
			}
			
			.tech-advantages {
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
				
				.advantages-list {
					display: grid;
					grid-template-columns: repeat(2, 1fr);
					gap: 40rpx;
					
					.advantage-item {
						display: flex;
						align-items: flex-start;
						background: rgba(255, 255, 255, 0.05);
						border: 1px solid rgba(255, 255, 255, 0.1);
						border-radius: 16rpx;
						padding: 30rpx;
						
						.advantage-icon {
							width: 60rpx;
							height: 60rpx;
							background: linear-gradient(135deg, #3a8bcd 0%, #93c5fd 100%);
							border-radius: 12rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							margin-right: 20rpx;
							
							text {
								font-size: 28rpx;
							}
						}
						
						.advantage-content {
							flex: 1;
							
							.advantage-title {
								color: #ffffff;
								font-size: 28rpx;
								font-weight: 600;
								display: block;
								margin-bottom: 10rpx;
							}
							
							.advantage-desc {
								color: rgba(255, 255, 255, 0.7);
								font-size: 24rpx;
								line-height: 1.4;
							}
						}
					}
				}
			}
			
			.success-cases {
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
				
				.cases-grid {
					display: grid;
					gap: 40rpx;
					
					.case-card {
						background: rgba(255, 255, 255, 0.05);
						border: 1px solid rgba(255, 255, 255, 0.1);
						border-radius: 20rpx;
						padding: 40rpx;
						
						.case-header {
							display: flex;
							justify-content: space-between;
							align-items: center;
							margin-bottom: 20rpx;
							
							.case-industry {
								background: linear-gradient(135deg, #3a8bcd 0%, #93c5fd 100%);
								background-clip: text;
								-webkit-background-clip: text;
								-webkit-text-fill-color: transparent;
								font-size: 24rpx;
								font-weight: 600;
							}
							
							.case-year {
								color: rgba(255, 255, 255, 0.6);
								font-size: 22rpx;
							}
						}
						
						.case-title {
							color: #ffffff;
							font-size: 28rpx;
							font-weight: 600;
							display: block;
							margin-bottom: 15rpx;
						}
						
						.case-desc {
							color: rgba(255, 255, 255, 0.7);
							font-size: 24rpx;
							line-height: 1.5;
							display: block;
							margin-bottom: 20rpx;
						}
						
						.case-results {
							display: flex;
							flex-direction: column;
							gap: 8rpx;
							
							.result-item {
								color: rgba(59, 130, 246, 0.8);
								font-size: 22rpx;
								padding-left: 20rpx;
								position: relative;
								
								&::before {
									content: '✓';
									position: absolute;
									left: 0;
									color: #3a8bcd;
								}
							}
						}
					}
				}
			}
		}
	}
</style>