<template>
  <view class="device-form">
    <form @submit="handleSubmit">
      <!-- 设备基本信息 -->
      <view class="form-header">
        <text class="form-title">设备检测表单</text>
        <view class="device-info">
          <text>设备编号：{{ deviceId }}</text>
        </view>
      </view>

      <!-- 工序选择 -->
      <view class="process-section">
        <text class="label">选择工序</text>
        <picker
          mode="selector"
          :range="processNames"
          :value="currentProcessIndex"
          @change="handleProcessChange"
          class="process-picker"
        >
          <view class="picker-text">
            {{ processNames[currentProcessIndex] || '请选择工序' }}
          </view>
        </picker>
      </view>

      <!-- 当前工序表单 -->
      <view class="form-section">
        <!-- 检测人员 -->
        <view class="form-item">
          <text class="label">检测人员</text>
          <input 
            type="text"
            v-model="currentProcess.inspector"
            placeholder="请输入检测人员姓名"
          />
        </view>

        <!-- 检测时间 -->
        <view class="form-item">
          <text class="label">检测时间</text>
          <picker
            mode="date"
            :value="currentProcess.inspectTime"
            @change="handleDateChange"
          >
            <view class="picker-text">
              {{ currentProcess.inspectTime || '请选择检测时间' }}
            </view>
          </picker>
        </view>

        <!-- 检测图片 -->
        <view class="form-item">
          <text class="label">检测图片</text>
          <view class="image-upload">
            <image 
              v-if="currentProcess.image" 
              :src="currentProcess.image" 
              mode="aspectFit"
              class="preview-image"
            />
            <button 
              class="upload-btn"
              @tap="handleUploadImage"
            >
              {{ currentProcess.image ? '重新上传' : '上传图片' }}
            </button>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <button 
        form-type="submit"
        type="primary"
        class="submit-btn"
      >
        提交表单
      </button>
    </form>
  </view>
</template>

<script>
export default {
  data() {
    return {
      deviceId: '', // 设备ID
      processNames: [
         '来料检',
         '过程检',
         '插接头焊接',
         '固定头焊接',
         '导管安装',
         '接地线焊接',
         '转轮安装',
         '上壳组件安装',
         '手柄手轮安装',
         '内包',
         '完工检',
         '出厂检'
      ],
      currentProcessIndex: 0,  // 当前选中的工序索引
      processList: Array(12).fill().map(() => ({
        inspector: '', // 检测人员
        inspectTime: '', // 检测时间
        image: '' // 检测图片
      }))
    }
  },

  computed: {
    currentProcess() {
      return this.processList[this.currentProcessIndex];
    }
  },

  onLoad(options) {
    if (options.deviceId) {
      this.deviceId = options.deviceId
    }
  },

  methods: {
    // 处理工序选择
    handleProcessChange(e) {
      this.currentProcessIndex = Number(e.detail.value);
    },

    // 处理日期选择
    handleDateChange(e) {
      this.currentProcess.inspectTime = e.detail.value;
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
          // 使用设备编号和对应工序命名，例如：upload/设备编号_工序名称_时间戳.ext
          const cloudPath = `upload/${this.deviceId}_${this.processNames[processIndex]}_${Date.now()}${ext}`;
          uniCloud.uploadFile({
            filePath: tempFilePath,
            cloudPath: cloudPath
          }).then(uploadRes => {
            if (uploadRes && uploadRes.fileID) {
              uniCloud.getTempFileURL({
                fileList: [uploadRes.fileID]
              }).then(tempUrlRes => {
                const tempUrl = tempUrlRes.fileList[0].tempFileURL;
                // 更新当前工序图片
                this.processList[processIndex].image = tempUrl;
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
    handleSubmit() {
      // 表单验证
      if (!this.validateForm()) {
        return
      }

      // 提交数据到服务器
      console.log('表单数据：', this.currentProcess)
      uni.showToast({
        title: '提交成功',
        icon: 'success'
      })
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
    }
  }
}
</script>

<style lang="scss">
.device-form {
  padding: 20rpx;

  .form-header {
    margin-bottom: 30rpx;
    
    .form-title {
      font-size: 36rpx;
      font-weight: bold;
    }

    .device-info {
      margin-top: 10rpx;
      color: #666;
    }
  }

  .process-section {
    margin-bottom: 40rpx;
    padding: 20rpx;
    background-color: #f8f8f8;
    border-radius: 8rpx;

    .label {
      display: block;
      margin-bottom: 10rpx;
      color: #333;
    }
  }

  .process-picker {
    width: 100%;
    height: 70rpx;
    line-height: 70rpx;
    padding: 0 20rpx;
    background-color: #fff;
    border: 1rpx solid #ddd;
    border-radius: 4rpx;
  }

  .form-section {
    margin-bottom: 40rpx;
    padding: 20rpx;
    background-color: #f8f8f8;
    border-radius: 8rpx;
  }

  .form-item {
    margin-bottom: 20rpx;

    .label {
      display: block;
      margin-bottom: 10rpx;
      color: #333;
    }

    input {
      width: 100%;
      height: 70rpx;
      padding: 0 20rpx;
      background-color: #fff;
      border: 1rpx solid #ddd;
      border-radius: 4rpx;
    }

    .picker-text {
      width: 100%;
      height: 70rpx;
      line-height: 70rpx;
      padding: 0 20rpx;
      background-color: #fff;
      border: 1rpx solid #ddd;
      border-radius: 4rpx;
    }
  }

  .image-upload {
    .preview-image {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 20rpx;
    }

    .upload-btn {
      width: 200rpx;
      font-size: 28rpx;
    }
  }

  .submit-btn {
    margin-top: 40rpx;
    width: 100%;
  }
}
</style> 