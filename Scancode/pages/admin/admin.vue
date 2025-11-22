<template>
  <view class="admin-container">
    <!-- 数据概览卡片 -->
    <view class="dashboard-cards">
      <view class="card total-card">
        <uni-icons type="folder" size="30" color="#fff"></uni-icons>
        <text class="card-value">{{ totalRecords }}</text>
        <text class="card-label">总记录数</text>
      </view>
      <view class="card success-card">
        <uni-icons type="checkmark" size="30" color="#fff"></uni-icons>
        <text class="card-value">{{ qualifiedCount }}</text>
        <text class="card-label">合格数量</text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-header">
        <text class="section-title">数据筛选</text>
        <uni-icons type="search" size="20" color="#666"></uni-icons>
      </view>
      <uni-search-bar 
        placeholder="输入设备编号/工序名称/检测人员"
        @confirm="handleSearch"
        v-model="searchKeyword"
        bgColor="#f5f7fa"
        radius="20"
      />
      <view class="filter-section">
        <picker mode="date" @change="handleDateFilter">
          <view class="filter-item">
            <uni-icons type="calendar" size="18"></uni-icons>
            <text>{{ dateFilter || '选择日期' }}</text>
          </view>
        </picker>
        <picker mode="selector" :range="resultOptions" @change="handleResultFilter">
          <view class="filter-item">
            <uni-icons type="filters" size="18"></uni-icons>
            <text>{{ resultFilter || '筛选结果' }}</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 数据列表 -->
    <scroll-view 
      scroll-y 
      class="data-list" 
      @scrolltolower="loadMore"
      :scroll-with-animation="true"
    >
      <view 
        v-for="(item, index) in records" 
        :key="index"
        class="data-item"
        :class="{'data-item-even': index%2 === 0}"
      >
        <view class="item-header">
          <view class="device-info">
            <uni-icons type="device" size="20"></uni-icons>
            <text class="device-id">{{ item.deviceId }}</text>
            <text class="process-name">{{ item.processName }}</text>
          </view>
          <view class="status-badge" :class="resultClass(item.inspectResult)">
            {{ item.inspectResult }}
          </view>
        </view>
        
        <view class="item-details">
          <view class="detail-item">
            <uni-icons type="barcode" size="16"></uni-icons>
            <text>产品批号：{{ item.batchNumber }}</text>
          </view>
          <view class="detail-item">
            <uni-icons type="settings" size="16"></uni-icons>
            <text>设备型号：{{ item.deviceModel }}</text>
          </view>

          <!-- 检测参数详情 -->
          <view class="inspect-params">
            <view class="param-item">
              <text class="param-label">遮光率：</text>
              <text class="param-value">{{ item.lightBlockage }}%</text>
            </view>
            <view class="param-item">
              <text class="param-label">漏光长度：</text>
              <text class="param-value">{{ item.leakageLength }}mm</text>
            </view>
            <view class="param-item">
              <text class="param-label">光纤损耗：</text>
              <text class="param-value">{{ item.fiberLoss }}dB</text>
            </view>
          </view>

          <!-- 生产信息 -->
          <view class="production-info">
            <view class="info-item">
              <uni-icons type="calendar" size="16"></uni-icons>
              <text>生产日期：{{ item.productionDate }}</text>
            </view>
            <view class="info-item">
              <uni-icons type="location" size="16"></uni-icons>
              <text>所属车间：{{ item.workshop }}</text>
            </view>
          </view>
          
          <!-- 图片预览 -->
          <view class="image-preview" v-if="item.images.length">
            <view class="image-grid">
              <view 
                v-for="(img, imgIndex) in item.images" 
                :key="imgIndex"
                class="image-item"
              >
                <image 
                  :src="img.tempFileURL" 
                  mode="aspectFill"
                  @click="previewImage(img.tempFileURL)"
                  class="preview-image"
                />
                <view class="image-hover">
                  <uni-icons type="eye" size="20" color="#fff"></uni-icons>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="item-actions">
          <view class="action-btn export-btn" @click="exportRecord(item)">
            <uni-icons type="download" size="18"></uni-icons>
            <text>导出</text>
          </view>
          <view class="action-btn delete-btn" @click="deleteRecord(item._id)">
            <uni-icons type="trash" size="18"></uni-icons>
            <text>删除</text>
          </view>
        </view>

        <view class="advanced-actions">
          <view class="action-btn tag-btn" @click="tagDevice(item)">
            <uni-icons type="tag" size="18"></uni-icons>
            <text>添加标签</text>
          </view>
          <view class="action-btn remark-btn" @click="addRemark(item)">
            <uni-icons type="compose" size="18"></uni-icons>
            <text>添加备注</text>
          </view>
          <view class="action-btn history-btn" @click="viewHistory(item)">
            <uni-icons type="paperclip" size="18"></uni-icons>
            <text>修改历史</text>
          </view>
        </view>
      </view>

      <view class="loading-tip">
        <uni-load-more 
          :status="loading ? 'loading' : 'noMore'" 
          :contentText="{
            contentdown: '上拉加载更多',
            contentrefresh: '正在加载...',
            contentnomore: '没有更多数据了'
          }"
        />
      </view>
    </scroll-view>

    <view class="export-controls">
      <!-- Excel导出 -->
      <button class="export-btn excel-btn" @click="exportAllExcel">
        <uni-icons type="download" size="20"></uni-icons>
        <text>导出全部Excel</text>
      </button>

      <!-- 图片筛选导出 -->
      <view class="image-export">
        <uni-search-bar 
          placeholder="输入文件名关键词" 
          v-model="imageKeyword"
          @confirm="exportImages"
          radius="20"
        />
        <button class="export-btn image-btn" @click="exportImages">
          <uni-icons type="image" size="20"></uni-icons>
          <text>导出匹配图片</text>
        </button>
      </view>
    </view>

    <view class="stat-panels">
      <view class="panel quality-panel">
        <h3>质量分析</h3>
        <view class="chart-container">
          <qiun-data-charts type="ring" :chartData="qualityChartData"/>
        </view>
      </view>
      
      <view class="panel efficiency-panel">
        <h3>检测效率</h3>
        <view class="chart-container">
          <qiun-data-charts type="column" :chartData="efficiencyChartData"/>
        </view>
      </view>
    </view>

    <!-- 文件列表区 -->
    <view class="file-list-section">
      <view class="section-header">
        <uni-icons type="list" size="24"></uni-icons>
        <text class="section-title">已提交文件列表</text>
        <text class="update-time">最后更新：{{ lastUpdate }}</text>
      </view>
      
      <scroll-view scroll-y class="file-scroll">
        <view 
          v-for="(file, index) in fileList" 
          :key="index"
          class="file-item"
        >
          <text class="file-name">{{ file.name }}</text>
          <text class="file-time">{{ formatDate(file.createTime) }}</text>
          <text class="file-status" :class="statusClass(file.status)">
            {{ fileStatusMap[file.status] }}
          </text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      records: [],       // 数据记录
      searchKeyword: '', // 搜索关键词
      dateFilter: '',     // 日期筛选
      resultFilter: '',  // 结果筛选
      page: 1,           // 当前页码
      pageSize: 10,      // 每页数量
      loading: false,    // 加载状态
      resultOptions: ['合格', '不合格', '遮光3%可遮', '软头漏光'], // 筛选选项
      totalRecords: 0,
      qualifiedCount: 0,
      filterOptions: {
        workshopList: ['A车间', 'B车间', 'C车间'],
        deviceModels: ['型号X', '型号Y', '型号Z'],
        batchRange: {
          start: '',
          end: ''
        }
      },
      qualityChartData: {},
      efficiencyChartData: {},
      fileList: [],      // 文件列表数据
      lastUpdate: '',    // 最后更新时间
      fileStatusMap: {   // 文件状态映射
        0: '待处理',
        1: '已归档',
        2: '异常'
      },
      imageKeyword: '',  // 图片筛选关键词
      total: 0
    }
  },
  onLoad() {
    // 初始化加载
    this.loadData()
    this.loadFileList()  // 新增文件列表加载
    this.getStatistics()  // 新增统计信息加载
  },
  created() {
    console.log('云函数测试:', uniCloud.config.provider) // 查看云服务商
    this.testCloudFunction()
  },
  mounted() {
    // 临时强制显示控件
    this.$nextTick(() => {
      const controls = document.querySelector('.export-controls')
      if(controls) controls.style.display = 'block'
    })
  },
  methods: {
    // 加载数据
    async loadData(reset = true) {
      if (this.loading) return
      
      this.loading = true
      if (reset) this.page = 1
      
      try {
        const res = await uniCloud.callFunction({
          name: 'get_all_records',
          data: {
            keyword: this.searchKeyword,
            date: this.dateFilter,
            result: this.resultFilter,
            page: this.page,
            pageSize: this.pageSize
          }
        })
        
        if (res.result.code !== 0) {
          throw new Error(res.result.msg || '数据加载失败')
        }
        
        if (reset) this.records = []
        this.records = [...this.records, ...res.result.data]
        this.page++
        this.getStatistics()
      } catch(e) {
        console.error('加载失败:', e)
        uni.showToast({
          title: '数据加载失败，请检查网络',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.loading = false
      }
    },

    // 搜索处理
    handleSearch() {
      this.loadData()
    },

    // 日期筛选
    handleDateFilter(e) {
      this.dateFilter = e.detail.value
      this.loadData()
    },

    // 结果筛选
    handleResultFilter(e) {
      this.resultFilter = this.resultOptions[e.detail.value]
      this.loadData()
    },

    // 加载更多
    loadMore() {
      if (!this.loading) this.loadData(false)
    },

    // 图片预览
    previewImage(url) {
      uni.previewImage({
        urls: this.records.flatMap(r => r.images.map(i => i.tempFileURL)),
        current: url
      })
    },

    // 导出单条记录
    async exportRecord(record) {
      uni.showLoading({ title: '生成文件中...' })
      try {
        const res = await uniCloud.callFunction({
          name: 'export_single_record',
          data: { recordId: record._id }
        })
        
        const urlRes = await uniCloud.getTempFileURL({
          fileList: [res.result.fileId]
        })
        
        uni.downloadFile({
          url: urlRes.fileList[0].tempFileURL,
          success: (res) => {
            uni.openDocument({
              filePath: res.tempFilePath
            })
          }
        })
      } finally {
        uni.hideLoading()
      }
    },

    // 删除记录
    async deleteRecord(id) {
      uni.showModal({
        title: '确认删除',
        content: '该操作将删除记录及关联图片',
        success: async (res) => {
          if (res.confirm) {
            await uniCloud.callFunction({
              name: 'delete_record',
              data: { recordId: id }
            })
            this.loadData()
          }
        }
      })
    },

    // 获取统计数据
    async getStatistics() {
      const res = await uniCloud.callFunction({
        name: 'get_statistics',
        data: {
          deviceId: this.deviceId
        }
      })
      this.totalRecords = res.result.total
      this.qualifiedCount = res.result.qualified
      this.qualityChartData = res.result.qualityChartData
      this.efficiencyChartData = res.result.efficiencyChartData
    },

    // 格式化时间为相对时间
    formatRelativeTime(timestamp) {
      const diff = Date.now() - timestamp
      const minute = 60 * 1000
      const hour = 60 * minute
      const day = 24 * hour
      
      if (diff < minute) return '刚刚'
      if (diff < hour) return `${Math.floor(diff/minute)}分钟前`
      if (diff < day) return `${Math.floor(diff/hour)}小时前`
      return `${Math.floor(diff/day)}天前`
    },

    // 结果状态样式
    resultClass(result) {
      return {
        'status-pass': result === '合格',
        'status-fail': result !== '合格'
      }
    },

    // 批量操作
    batchExport(type) {
      const exportTypes = [
        {text: '导出当前筛选结果', value: 'filter'},
        {text: '导出选中记录', value: 'selected'},
        {text: '导出全部数据', value: 'all'}
      ]
    },
    
    // 数据修正
    async correctData(record) {
      const res = await uniCloud.callFunction({
        name: 'correct_record',
        data: {
          recordId: record._id,
          newData: this.correctionForm
        }
      })
    },
    
    // 添加检测备注
    async addRemark(record) {
      const {value} = await uni.showModal({
        title: '添加检测备注',
        editable: true,
        inputPlaceholder: '请输入备注信息...'
      })
      
      if (value) {
        await uniCloud.callFunction({
          name: 'add_remark',
          data: {
            recordId: record._id,
            remark: value
          }
        })
      }
    },

    // 获取文件列表
    async loadFileList() {
      try {
        const res = await uniCloud.callFunction({
          name: 'get_file_list',
          data: {
            page: this.page,
            pageSize: 20
          }
        })
        
        if(res.result.code === 0) {
          this.fileList = [...this.fileList, ...res.result.data]
          this.total = res.result.total
        }
      } catch(e) {
        console.error('文件加载失败:', e)
      }
    },

    // 导出全部Excel
    async exportAllExcel() {
      try {
        uni.showLoading({ title: '生成Excel中...' })
        const res = await uniCloud.callFunction({
          name: 'export_all_excel'
        })
        
        const tempUrlRes = await uniCloud.getTempFileURL({
          fileList: [res.result.fileID]
        })
        
        uni.downloadFile({
          url: tempUrlRes.fileList[0].tempFileURL,
          success: (res) => {
            uni.saveFileToDisk({
              filePath: res.tempFilePath,
              success: () => {
                uni.showToast({ title: 'Excel导出成功' })
              }
            })
          }
        })
      } catch(e) {
        uni.showToast({ title: `导出失败: ${e.message}`, icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },

    // 导出匹配图片
    async exportImages() {
      if(!this.imageKeyword) {
        return uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
      }
      
      try {
        uni.showLoading({ title: '搜索图片中...' })
        const res = await uniCloud.callFunction({
          name: 'batch_download_images',
          data: { fileName: this.imageKeyword }
        })
        
        const tempUrls = await uniCloud.getTempFileURL({
          fileList: res.result.fileList.map(f => f.fileID)
        })
        
        // 批量下载
        const downloadTasks = tempUrls.fileList.map(file => {
          return uni.downloadFile({ url: file.tempFileURL })
        })
        
        Promise.all(downloadTasks).then(results => {
          results.forEach(res => {
            uni.saveFileToDisk({ filePath: res.tempFilePath })
          })
          uni.showToast({ title: `成功导出${results.length}张图片` })
        })
      } catch(e) {
        uni.showToast({ title: `导出失败: ${e.message}`, icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },

    async testCloudFunction() {
      try {
        const res = await uniCloud.callFunction({
          name: 'get_file_list'
        })
        console.log('云函数响应:', res)
      } catch(e) {
        console.error('云函数错误:', e)
      }
    }
  }
}
</script>

<style lang="scss">
.admin-container {
  padding: 30rpx;
  min-height: 100vh;
  box-sizing: border-box;
  background: #f8fafc;
  
  .dashboard-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    margin-bottom: 32rpx;
    
    .card {
      padding: 32rpx;
      border-radius: 16rpx;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      &-value {
        font-size: 48rpx;
        font-weight: 700;
        margin: 16rpx 0;
      }
      
      &-label {
        font-size: 24rpx;
        opacity: 0.9;
      }
      
      &.total-card {
        background: linear-gradient(135deg, #667eea, #764ba2);
      }
      
      &.success-card {
        background: linear-gradient(135deg, #48bb78, #38a169);
      }
    }
  }

  .search-bar {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    
    .search-header {
      display: flex;
      align-items: center;
      margin-bottom: 24rpx;
      
      .section-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #1a365d;
        margin-right: 16rpx;
      }
    }
    
    .filter-section {
      display: flex;
      gap: 24rpx;
      margin-top: 24rpx;
      
      .filter-item {
        flex: 1;
        padding: 20rpx;
        background: #f5f7fa;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #4a5568;
        font-size: 28rpx;
        
        text {
          margin-left: 12rpx;
        }
      }
    }
  }

  .data-list {
    margin-top: 32rpx;
    
    .data-item {
      background: #fff;
      border-radius: 16rpx;
      margin-bottom: 24rpx;
      padding: 24rpx;
      box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
      
      &-even {
        background: #fdfdfe;
      }
      
      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 24rpx;
        border-bottom: 1rpx solid #eee;
        
        .device-info {
          display: flex;
          align-items: center;
          
          .device-id {
            font-weight: 600;
            color: #2d3748;
            margin: 0 16rpx;
          }
          
          .process-name {
            color: #718096;
            font-size: 26rpx;
          }
        }
        
        .status-badge {
          padding: 8rpx 24rpx;
          border-radius: 20rpx;
          font-size: 24rpx;
          font-weight: 500;
          
          &.status-pass {
            background: #c6f6d5;
            color: #22543d;
          }
          
          &.status-fail {
            background: #fed7d7;
            color: #742a2a;
          }
        }
      }
      
      .item-details {
        padding: 24rpx 0;
        
        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 20rpx;
          color: #4a5568;
          font-size: 28rpx;
          
          text {
            margin-left: 12rpx;
          }
        }
        
        .inspect-params {
          margin-bottom: 24rpx;
          
          .param-item {
            display: flex;
            align-items: center;
            margin-bottom: 12rpx;
            
            .param-label {
              font-size: 26rpx;
              font-weight: 600;
              color: #2d3748;
              margin-right: 12rpx;
            }
            
            .param-value {
              font-size: 24rpx;
              color: #718096;
            }
          }
        }
        
        .production-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .info-item {
            display: flex;
            align-items: center;
            color: #718096;
            font-size: 26rpx;
            
            text {
              margin-left: 12rpx;
            }
          }
        }
        
        .image-preview {
          margin-top: 24rpx;
          
          .image-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16rpx;
            
            .image-item {
              position: relative;
              border-radius: 12rpx;
              overflow: hidden;
              aspect-ratio: 1;
              
              .preview-image {
                width: 100%;
                height: 100%;
              }
              
              .image-hover {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s;
              }
              
              &:hover .image-hover {
                opacity: 1;
              }
            }
          }
        }
      }
      
      .item-actions {
        display: flex;
        justify-content: flex-end;
        gap: 24rpx;
        padding-top: 24rpx;
        border-top: 1rpx solid #eee;
        
        .action-btn {
          display: flex;
          align-items: center;
          padding: 12rpx 24rpx;
          border-radius: 8rpx;
          font-size: 26rpx;
          transition: all 0.2s;
          
          text {
            margin-left: 8rpx;
          }
          
          &.export-btn {
            color: #3a8bcd;
            background: #ebf8ff;
            
            &:hover {
              background: #bee3f8;
            }
          }
          
          &.delete-btn {
            color: #e53e3e;
            background: #fff5f5;
            
            &:hover {
              background: #fed7d7;
            }
          }
        }
      }

      .advanced-actions {
        display: flex;
        justify-content: flex-end;
        gap: 24rpx;
        padding-top: 24rpx;
        border-top: 1rpx solid #eee;
        
        .action-btn {
          display: flex;
          align-items: center;
          padding: 12rpx 24rpx;
          border-radius: 8rpx;
          font-size: 26rpx;
          transition: all 0.2s;
          
          text {
            margin-left: 8rpx;
          }
          
          &.tag-btn {
            color: #3a8bcd;
            background: #ebf8ff;
            
            &:hover {
              background: #bee3f8;
            }
          }
          
          &.remark-btn {
            color: #3a8bcd;
            background: #ebf8ff;
            
            &:hover {
              background: #bee3f8;
            }
          }
          
          &.history-btn {
            color: #3a8bcd;
            background: #ebf8ff;
            
            &:hover {
              background: #bee3f8;
            }
          }
        }
      }
    }
    
    .loading-tip {
      padding: 48rpx 0;
    }
  }

  .export-controls {
    margin: 24rpx 0;
    display: grid;
    gap: 24rpx;
    position: relative;
    z-index: 1;
    
    .export-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12rpx;
      padding: 20rpx;
      border-radius: 12rpx;
      font-size: 28rpx;
      
      &.excel-btn {
        background: #38a169;
        color: #fff;
      }
      
      &.image-btn {
        background: #3a8bcd;
        color: #fff;
      }
    }
    
    .image-export {
      display: grid;
      gap: 16rpx;
      grid-template-columns: 1fr auto;
    }
  }

  .stat-panels {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    margin-top: 32rpx;
    
    .panel {
      background: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
      
      h3 {
        font-size: 32rpx;
        font-weight: 600;
        color: #1a365d;
        margin-bottom: 24rpx;
      }
      
      .chart-container {
        height: 300rpx;
      }
    }
  }

  .file-list-section {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-top: 24rpx;
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 24rpx;
      
      .section-title {
        font-size: 32rpx;
        font-weight: 600;
      }
      
      .update-time {
        margin-left: auto;
        font-size: 24rpx;
        color: #666;
      }
    }
    
    .file-scroll {
      max-height: 400rpx;
      
      .file-item {
        display: flex;
        align-items: center;
        padding: 16rpx;
        border-bottom: 1rpx solid #eee;
        
        .file-name {
          flex: 2;
          @include text-ellipsis;
        }
        
        .file-time {
          flex: 1;
          font-size: 24rpx;
          color: #666;
        }
        
        .file-status {
          flex: 0 0 120rpx;
          text-align: center;
          padding: 4rpx 12rpx;
          border-radius: 20rpx;
          font-size: 24rpx;
          
          &[status="0"] { background: #f6e05e; color: #744210; }
          &[status="1"] { background: #c6f6d5; color: #22543d; }
          &[status="2"] { background: #fed7d7; color: #742a2a; }
        }
      }
    }
  }
}

.action-bar {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  background: #fff;
  
  button {
    flex: 1;
    padding: 20rpx;
    border-radius: 10rpx;
    
    &.excel-btn {
      background: #4CAF50;
      color: white;
    }
    
    &.image-btn {
      background: #2196F3;
      color: white;
    }
  }
}

.file-list {
  margin: 30rpx;
  background: #fff;
  border-radius: 10rpx;
  
  .file-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;
    
    .file-name {
      flex: 2;
      @include text-ellipsis;
    }
    
    .file-time {
      flex: 1;
      color: #666;
      font-size: 24rpx;
    }
    
    .file-actions {
      flex: 1;
      display: flex;
      gap: 10rpx;
      
      button {
        padding: 10rpx 20rpx;
        background: #f5f5f5;
        border-radius: 6rpx;
      }
    }
  }
}
</style> 