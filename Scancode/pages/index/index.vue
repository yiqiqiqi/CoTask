<template>
	<view class="home-page">
		<!-- 导航栏 -->
		<view class="navbar">
			<view class="nav-container">
				<view class="nav-logo">
					<text class="logo-text">EEnous</text>
					<text class="logo-subtitle">Technology</text>
				</view>
				<view class="nav-menu">
					<text class="nav-item" @tap="navigateTo('/pages/index/index')">首页</text>
					<text class="nav-item" @tap="navigateTo('/pages/about/index')">关于我们</text>
					<text class="nav-item" @tap="navigateTo('/pages/business/index')">核心业务</text>
					<text class="nav-item" @tap="navigateTo('/pages/contact/index')">联系我们</text>
				</view>
			</view>
		</view>

		<!-- 主内容区域 -->
		<scroll-view class="main-content" scroll-y>
			<!-- 英雄区域 -->
			<view class="hero-section">
				<view class="hero-bg"></view>
				<view class="container">
					<view class="hero-content">
						<view class="hero-badge">
							<text class="badge-icon">⚡</text>
							<text class="badge-text">Technology Innovation</text>
						</view>
						<view class="hero-title">
							<text class="title-line">南京玻丝焊芯</text>
							<text class="title-highlight">科技有限公司</text>
						</view>
						<view class="hero-divider"></view>
						<view class="hero-description">
							我们专注于<span class="text-highlight">光纤通信</span>与<span class="text-highlight">工业物联网</span>领域的技术创新，
							致力于为客户提供高品质的国产化解决方案
						</view>
						<view class="hero-actions">
							<button class="primary-btn" @tap="navigateTo('/pages/business/index')">
								<text class="btn-text">了解业务</text>
							</button>
							<button class="secondary-btn" @tap="navigateTo('/pages/contact/index')">
								<text class="btn-text">联系我们</text>
							</button>
						</view>
					</view>
					<view class="hero-visual">
						<view class="tech-animation">
							<view class="animation-circle circle-1"></view>
							<view class="animation-circle circle-2"></view>
							<view class="animation-circle circle-3"></view>
							<view class="tech-icon">🔗</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 业务概览 -->
			<view class="business-overview">
				<view class="container">
					<view class="section-header">
						<view class="section-line"></view>
						<text class="section-title">核心业务</text>
						<view class="section-line"></view>
					</view>
					<view class="business-grid">
						<view class="business-card" v-for="(item, index) in businessItems" :key="index"
							@tap="navigateTo('/pages/business/index')">
							<view class="card-icon">
								<text>{{ item.icon }}</text>
							</view>
							<text class="card-title">{{ item.title }}</text>
							<text class="card-desc">{{ item.description }}</text>
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
					<view class="advantages-content">
						<view class="advantage-item" v-for="(item, index) in advantages" :key="index">
							<view class="advantage-number">
								<text>{{ index + 1 }}</text>
							</view>
							<view class="advantage-text">
								<text class="advantage-title">{{ item.title }}</text>
								<text class="advantage-desc">{{ item.description }}</text>
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
						</view>
					</view>
				</view>
			</view>

			<!-- 底部CTA -->
			<view class="cta-section">
				<view class="container">
					<view class="cta-content">
						<text class="cta-title">准备好与我们合作了吗？</text>
						<text class="cta-desc">联系我们，共同推动光纤通信与工业物联网技术的发展</text>
						<button class="cta-btn" @tap="navigateTo('/pages/contact/index')">
							<text class="btn-text">立即联系</text>
						</button>
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
				// 登录相关数据
				isLoggedIn: false,
				loginAccount: '', // 输入的账号
				loginPassword: '', // 输入的密码
				allowedAccount: 'admin', // 指定账号
				allowedPassword: '123456', // 指定密码

				deviceId: '', // 设备ID（最终会拼接为 "批号-设备编号"）
				currentProcessIndex: null, // 当前选中的工序索引
				processNames: [
					"（康鼎）穿光纤及模组",
					"（康鼎）固定环处理",
					"（康鼎）过程检",
					"（康鼎）成品检",
					"来料检",
					"清洗",
					"固定头焊接",
					"插接头焊接",
					"接地线焊接",
					"电路板封胶",
					"上壳锁轮安装",
					"散热片安装",
					"导管安装",
					"转轮安装",
					"上壳组件安装",
					"手柄手轮安装",
					"过程检",
					"完工检",
					"内包检",
					"外包检",
					"最终检",
					"出厂检"
				],
				processList: Array(22).fill().map(() => ({
					inspector: '', // 检测人员
					inspectTime: '', // 检测时间
					image: '',      // 检测图片
					inspectResult: '' // 检验结果
				})),
				inspectResultOptions: [
					"合格",
					"不合格",
					"遮光3%可遮",
					"软头漏光",
					"前端光纤断",
					"通体漏光",
					"软头漏光长度超5mm"
				],
				exportRequestActive: false,  // 导出请求状态标志
				showDownloadTip: false  // 新增：下载提示标志
			}
		},
		computed: {
			currentProcess() {
				return this.currentProcessIndex !== null ? this.processList[this.currentProcessIndex] : null
			}
		},
		onLoad() {
			// 从本地存储获取扫描历史
			const history = uni.getStorageSync('scanHistory')
			if (history) {
				this.scanHistory = JSON.parse(history)
			}
		},
		methods: {
			// 检查登录账号和密码是否正确
			checkLogin() {
				if (
					this.loginAccount.trim() === this.allowedAccount &&
					this.loginPassword === this.allowedPassword
				) {
					this.isLoggedIn = true
				} else {
					uni.showToast({
						title: '账号或密码错误',
						icon: 'none'
					})
				}
			},
			// 扫码功能
			scanCode() {
				uni.scanCode({
					success: (res) => {
						// 直接将扫描结果作为设备编号
						this.deviceId = res.result;
					},
					fail: (err) => {
						uni.showToast({
							title: '扫码失败',
							icon: 'none'
						});
					}
				});
			},
			
			// 处理工序选择
			handleProcessChange(e) {
				this.currentProcessIndex = Number(e.detail.value)
			},
			
			// 处理日期选择
			handleDateChange(e) {
				this.processList[this.currentProcessIndex].inspectTime = e.detail.value
			},

			// 处理图片上传
			handleUploadImage() {
				uni.chooseImage({
					count: 1,
					success: (res) => {
						const tempFilePath = res.tempFilePaths[0];
						// 捕获当前工序索引
						const processIndex = this.currentProcessIndex;
						// 提取文件扩展名，若没有则默认使用 .jpg
						const dotIndex = tempFilePath.lastIndexOf('.');
						const ext = dotIndex !== -1 ? tempFilePath.substring(dotIndex) : '.jpg';
						uni.showLoading({ title: '上传中...' });
						// 对设备编号进行 URL 编码，确保安全
						const validDeviceId = encodeURIComponent(this.deviceId);
						// 这里直接用编号作为工序标识（可根据需要修改为实际工序名称并编码）
						const validProcessName = 'P' + (processIndex + 1);
						// 对检测人员和检测时间做 URL 编码
						const validInspector = encodeURIComponent(this.currentProcess.inspector);
						const validInspectTime = encodeURIComponent(this.currentProcess.inspectTime);
						// 新增：将检验结果转换为英文代码，避免中文出现在文件名中
						const inspectResultMapping = {
							"合格": "R1",
							"不合格": "R2",
							"遮光3%可遮": "R3",
							"软头漏光": "R4",
							"前端光纤断": "R5",
							"通体漏光": "R6",
							"软头漏光长度超5mm": "R7"
						};
						const validInspectResult = inspectResultMapping[this.currentProcess.inspectResult] || "UNK";
						// 定义云端存储路径，形如：upload/设备编号_P1_测试人员_检测时间_检验结果_时间戳.ext
						const cloudPath = `upload/${validDeviceId}_${validProcessName}_${validInspector}_${validInspectTime}_${validInspectResult}_${Date.now()}${ext}`;
						uniCloud.uploadFile({
							filePath: tempFilePath,
							cloudPath: cloudPath
						}).then(async uploadRes => {
							if (uploadRes && uploadRes.fileID) {
								// 新增图片索引记录
								await uniCloud.callFunction({
									name: 'submit_process',
									data: {
										type: 'IMAGE_INDEX',
										data: {
											deviceId: this.deviceId,
											processName: this.processNames[processIndex],
											fileID: uploadRes.fileID
										}
									}
								})
								
								uniCloud.getTempFileURL({
									fileList: [uploadRes.fileID]
								}).then(tempUrlRes => {
									let tempUrl = tempUrlRes.fileList[0].tempFileURL;
									// 添加时间戳参数防止缓存问题
									tempUrl = tempUrl + '?t=' + Date.now();
									// 以响应式方式更新当前工序图片
									this.$set(this.processList, processIndex, {
										...this.processList[processIndex],
										image: tempUrl
									});
									uni.hideLoading();
									uni.showToast({ title: '上传成功', icon: 'success' });
								}).catch(err => {
									uni.hideLoading();
									uni.showToast({ title: '获取预览图失败', icon: 'none' });
									console.error(err);
								});
							} else {
								uni.hideLoading();
								uni.showToast({ title: '图片上传失败', icon: 'none' });
							}
						}).catch(err => {
							uni.hideLoading();
							uni.showToast({ title: '图片上传失败', icon: 'none' });
							console.error(err);
						});
					},
					fail: () => {
						uni.showToast({ title: '图片选择失败', icon: 'none' });
					}
				});
			},

			// 提交表单
			async handleSubmit() {
				if (!this.deviceId) {
					uni.showToast({
						title: '请先输入或扫码获取设备编号',
						icon: 'none'
					})
					return
				}
				
				// 表单验证
				if (!this.validateForm()) {
					return
				}

				try {
					uni.showLoading({
						title: '提交中...'
					})
					
					const result = await uniCloud.callFunction({
						name: 'submit_process',
						data: {
							deviceId: this.deviceId,
							processName: this.processNames[this.currentProcessIndex],
							processData: {
								inspector: this.currentProcess.inspector,
								inspectTime: this.currentProcess.inspectTime,
								inspectResult: this.currentProcess.inspectResult,
								image: this.currentProcess.image
							}
						}
					})
					
					if(result.result.code === 0) {
						uni.showToast({
							title: '提交成功',
							icon: 'success'
						})
						// 重置当前工序数据
						this.processList[this.currentProcessIndex] = {
							inspector: '',
							inspectTime: '',
							image: '',  // 此处保留 image 字段用于后续操作（如重新上传），但不会提交
							inspectResult: ''
						}
					} else {
						throw new Error(result.result.msg)
					}
					
				} catch (error) {
					uni.showToast({
						title: error.message || '提交失败',
						icon: 'none'
					})
					console.error('提交失败：', error)
				} finally {
					uni.hideLoading()
				}
			},

			// 新增：导出全部数据方法（调用云函数 export_all_excel）
			async handleExport() {
				this.exportRequestActive = true;  // 标记开始导出
				try {
					uni.showLoading({ title: '导出中...' });
					const res = await uniCloud.callFunction({ name: 'export_all_excel' });
					uni.hideLoading();
					// 如果在等待过程中用户点击了终止
					if (!this.exportRequestActive) {
						uni.showToast({ title: '导出已终止', icon: 'none' });
						return;
					}
					if (res.result && res.result.code === 0) {
						uni.showToast({ title: '导出成功', icon: 'success' });
						console.log("Excel 文件链接：", res.result.data.excelFile);
					} else {
						uni.showToast({ title: '导出失败', icon: 'none' });
					}
				} catch (error) {
					uni.hideLoading();
					if (this.exportRequestActive) {
						uni.showToast({ title: '导出失败', icon: 'none' });
					}
					console.error(error);
				}
				this.exportRequestActive = false; // 请求结束
			},

			// 新增：终止导出操作（仅控制前端状态）
			handleCancelExport() {
				if (this.exportRequestActive) {
					this.exportRequestActive = false;
					uni.hideLoading();
					uni.showToast({ title: '已终止导出', icon: 'none' });
					console.log('导出操作已终止');
				}
			},
			
			// 表单验证
			validateForm() {
				const process = this.currentProcess;
				if (!process.inspector || !process.inspectTime) {
					uni.showToast({
						title: '请完善当前工序信息',
						icon: 'none'
					});
					return false;
				}
				return true;
			},

			// 处理检验结果选择
			handleInspectResultChange(e) {
				const index = Number(e.detail.value);
				this.processList[this.currentProcessIndex].inspectResult = this.inspectResultOptions[index];
			},

			// 新增：批量下载功能
			async handleBatchDownload() {
				if (!this.deviceId) {
					uni.showToast({ title: '请先输入设备编号', icon: 'none' });
					return;
				}
				try {
					uni.showLoading({ 
						title: '正在生成压缩包...',
						mask: true
					});

					// 设置超时监控（5分钟）
					const timeout = setTimeout(() => {
						uni.showModal({
							title: '提示',
							content: '处理时间较长，请勿关闭页面',
							showCancel: false
						});
					}, 120000);

					const res = await uniCloud.callFunction({
						name: 'batch_download_images',
						data: { deviceId: this.deviceId }
					});

					if (!res.result.data?.zipUrl) {
						throw new Error('压缩包生成失败');
					}

					const tempUrlRes = await uniCloud.getTempFileURL({
						fileList: [res.result.data.zipUrl]
					});
					
					uni.downloadFile({
						url: tempUrlRes.fileList[0].tempFileURL,
						success: (downloadRes) => {
							if (downloadRes.statusCode !== 200) {
								throw new Error(`下载失败：${downloadRes.statusCode}`);
							}
							uni.saveFileToDisk({
								filePath: downloadRes.tempFilePath,
								success: () => {
									uni.showModal({
										title: '下载完成',
										content: '压缩包已保存至手机下载目录',
										showCancel: false
									});
								},
								fail: (e) => {
									console.error('保存失败:', e);
									uni.showToast({ title: '保存失败，请检查存储权限', icon: 'none' });
								}
							});
						},
						fail: (err) => {
							throw new Error(`下载失败：${err.errMsg}`);
						}
					});
				} catch(e) {
					console.error('导出错误:', e);
					uni.showToast({ 
						title: `操作失败：${e.message || e.errMsg}`,
						icon: 'none',
						duration: 3000
					});
				} finally {
					clearTimeout(timeout);
					uni.hideLoading();
				}
			},

			openSettingGuide() {
				uni.showModal({
					title: '权限申请',
					content: '请在系统设置中允许应用访问相册权限',
					confirmText: '去设置',
					success: (res) => {
						if (res.confirm) {
							uni.openSetting();
						}
					}
				});
			},

			// 新增：跳转后台
			goToAdmin() {
				uni.navigateTo({
					url: '/pages/admin/admin'
				})
			},
		}
	}
</script>

<style lang="scss">
	/* 美化后的登录界面样式 */
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		/* 使用更柔和的渐变背景 */
		background: linear-gradient(135deg, #ffffff, #f0f1f5);
		padding: 20px;
	}
	.login-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #fff;
		padding: 40px 30px;
		border-radius: 16px;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
		width: 90%;
		max-width: 350px;
	}
	.login-title {
		font-size: 28px;
		margin-bottom: 25px;
		font-weight: 700;
		color: #333;
	}
	.login-input {
		width: 85%;
		padding: 14px;
		border: 1px solid #e0e0e0;
		border-radius: 10px;
		margin-bottom: 22px;
		font-size: 16px;
		text-align: center;
		transition: border-color 0.3s ease, box-shadow 0.3s ease;
	}
	.login-input:focus {
		border-color: #3a8bcd;
		box-shadow: 0 0 8px rgba(58, 139, 205, 0.3);
		outline: none;
	}
	.login-button {
		width: 85%;
		padding: 14px;
		background-color: #3a8bcd;
		color: #fff;
		border: none;
		border-radius: 10px;
		font-size: 18px;
		font-weight: 700;
		transition: background-color 0.3s ease, transform 0.3s ease;
	}
	.login-button:hover {
		background-color: #3270a8;
		transform: translateY(-2px);
	}

	/* 美化后的主页面样式 */
	.container {
		padding: 40rpx;
		background-color: #ffffff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}
	.container .header {
		margin-bottom: 50rpx;
		text-align: center;
		.title {
			font-size: 42rpx;
			font-weight: 700;
			color: #333;
		}
	}
	
	.container .device-section {
		margin-bottom: 40rpx;
		.device-input-group {
			display: flex;
			align-items: center;
			gap: 20rpx;
			.device-input {
				flex: 1;
				height: 90rpx;
				padding: 0 25rpx;
				background-color: #f9f9f9;
				border: 1rpx solid #e0e0e0;
				border-radius: 10rpx;
				font-size: 30rpx;
				transition: border-color 0.3s ease, background-color 0.3s ease;
				&:focus {
					border-color: #3a8bcd;
				}
			}
			.scan-btn {
				width: 200rpx;
				height: 90rpx;
				line-height: 90rpx;
				font-size: 30rpx;
				background-color: #3a8bcd;
				color: #fff;
				border: none;
				border-radius: 10rpx;
				transition: background-color 0.3s ease, transform 0.3s ease;
				&:hover {
					background-color: #3270a8;
					transform: translateY(-2px);
				}
			}
		}
	}

	.container .process-section {
		margin-bottom: 40rpx;
		.label {
			display: block;
			margin-bottom: 12rpx;
			color: #333;
			font-size: 32rpx;
		}
		.picker-text {
			width: 100%;
			height: 80rpx;
			line-height: 80rpx;
			padding: 0 25rpx;
			background-color: #f9f9f9;
			border: 1rpx solid #e0e0e0;
			border-radius: 10rpx;
			font-size: 30rpx;
			transition: border-color 0.3s ease;
			&:hover {
				border-color: #3a8bcd;
			}
		}
	}

	.container .form-section {
		.form-item {
			margin-bottom: 30rpx;
			.label {
				display: block;
				margin-bottom: 12rpx;
				color: #333;
				font-size: 32rpx;
			}
			.picker-text {
				width: 100%;
				height: 80rpx;
				line-height: 80rpx;
				padding: 0 25rpx;
				background-color: #f9f9f9;
				border: 1rpx solid #e0e0e0;
				border-radius: 10rpx;
				font-size: 30rpx;
				transition: border-color 0.3s ease;
				&:hover {
					border-color: #3a8bcd;
				}
			}
		}
		.image-upload {
			.preview-image {
				width: 240rpx;
				height: 240rpx;
				margin-bottom: 22rpx;
				border-radius: 12rpx;
				object-fit: cover;
			}
			.upload-btn {
				width: 240rpx;
				font-size: 30rpx;
				background-color: #3a8bcd;
				color: #fff;
				border: none;
				border-radius: 12rpx;
				padding: 12rpx;
				transition: background-color 0.3s ease, transform 0.3s ease;
				&:hover {
					background-color: #3270a8;
					transform: translateY(-2px);
				}
			}
		}
		.submit-btn {
			margin-top: 40rpx;
			width: 100%;
			padding: 18rpx;
			background-color: #28a745;
			color: #fff;
			border: none;
			border-radius: 12rpx;
			font-size: 32rpx;
			font-weight: 700;
			transition: background-color 0.3s ease, transform 0.3s ease;
			&:disabled {
				opacity: 0.6;
				background-color: #94d3a2;
			}
			&:hover:not(:disabled) {
				background-color: #239b45;
				transform: translateY(-2px);
			}
		}
	}

	.container .export-section {
		margin-top: 40rpx;
		text-align: center;
		button {
			width: 100%;
			height: 90rpx;
			line-height: 90rpx;
			font-size: 30rpx;
			margin-bottom: 20rpx;
			border: none;
			border-radius: 12rpx;
			transition: background-color 0.3s ease, transform 0.3s ease;
		}
		.export-btn {
			background-color: #3a8bcd;
			color: #fff;
			&:hover {
				background-color: #3270a8;
				transform: translateY(-2px);
			}
		}
		.cancel-export-btn {
			background-color: #e53e3e;
			color: #fff;
			&:hover {
				background-color: #c53030;
				transform: translateY(-2px);
			}
		}
		.admin-btn {
			background-color: #6c5ce7;
			color: #fff;
			&:hover {
				background-color: #5b4bc4;
			}
		}
	}

	.download-tip {
		padding: 20rpx;
		background-color: #fff3cd;
		border-radius: 8rpx;
		margin: 20rpx 0;
		color: #856404;
		font-size: 24rpx;
	}
</style>
