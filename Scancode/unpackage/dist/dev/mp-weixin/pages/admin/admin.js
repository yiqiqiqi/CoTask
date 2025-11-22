"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = common_vendor.defineComponent({
  data() {
    return {
      records: [],
      searchKeyword: "",
      dateFilter: "",
      resultFilter: "",
      page: 1,
      pageSize: 10,
      loading: false,
      resultOptions: ["合格", "不合格", "遮光3%可遮", "软头漏光"],
      totalRecords: 0,
      qualifiedCount: 0,
      filterOptions: new UTSJSONObject({
        workshopList: ["A车间", "B车间", "C车间"],
        deviceModels: ["型号X", "型号Y", "型号Z"],
        batchRange: new UTSJSONObject({
          start: "",
          end: ""
        })
      }),
      qualityChartData: new UTSJSONObject({}),
      efficiencyChartData: new UTSJSONObject({}),
      fileList: [],
      lastUpdate: "",
      fileStatusMap: new UTSJSONObject({
        0: "待处理",
        1: "已归档",
        2: "异常"
      }),
      imageKeyword: "",
      total: 0
    };
  },
  onLoad() {
    this.loadData();
    this.loadFileList();
    this.getStatistics();
  },
  created() {
    common_vendor.index.__f__("log", "at pages/admin/admin.vue:274", "云函数测试:", common_vendor.er.config.provider);
    this.testCloudFunction();
  },
  mounted() {
    this.$nextTick(() => {
      const controls = document.querySelector(".export-controls");
      if (controls)
        controls.style.display = "block";
    });
  },
  methods: {
    // 加载数据
    loadData(reset = true) {
      return common_vendor.__awaiter(this, void 0, void 0, function* () {
        if (this.loading)
          return Promise.resolve(null);
        this.loading = true;
        if (reset)
          this.page = 1;
        try {
          const res = yield common_vendor.er.callFunction({
            name: "get_all_records",
            data: new UTSJSONObject({
              keyword: this.searchKeyword,
              date: this.dateFilter,
              result: this.resultFilter,
              page: this.page,
              pageSize: this.pageSize
            })
          });
          if (res.result.code !== 0) {
            throw new Error(res.result.msg || "数据加载失败");
          }
          if (reset)
            this.records = [];
          this.records = [...this.records, ...res.result.data];
          this.page++;
          this.getStatistics();
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/admin/admin.vue:313", "加载失败:", e);
          common_vendor.index.showToast({
            title: "数据加载失败，请检查网络",
            icon: "none",
            duration: 2e3
          });
        } finally {
          this.loading = false;
        }
      });
    },
    // 搜索处理
    handleSearch() {
      this.loadData();
    },
    // 日期筛选
    handleDateFilter(e = null) {
      this.dateFilter = e.detail.value;
      this.loadData();
    },
    // 结果筛选
    handleResultFilter(e = null) {
      this.resultFilter = this.resultOptions[e.detail.value];
      this.loadData();
    },
    // 加载更多
    loadMore() {
      if (!this.loading)
        this.loadData(false);
    },
    // 图片预览
    previewImage(url = null) {
      common_vendor.index.previewImage({
        urls: this.records.flatMap((r) => {
          return r.images.map((i = null) => {
            return i.tempFileURL;
          });
        }),
        current: url
      });
    },
    // 导出单条记录
    exportRecord(record = null) {
      return common_vendor.__awaiter(this, void 0, void 0, function* () {
        common_vendor.index.showLoading({ title: "生成文件中..." });
        try {
          const res = yield common_vendor.er.callFunction({
            name: "export_single_record",
            data: new UTSJSONObject({ recordId: record._id })
          });
          const urlRes = yield common_vendor.er.getTempFileURL({
            fileList: [res.result.fileId]
          });
          common_vendor.index.downloadFile({
            url: urlRes.fileList[0].tempFileURL,
            success: (res2) => {
              common_vendor.index.openDocument({
                filePath: res2.tempFilePath
              });
            }
          });
        } finally {
          common_vendor.index.hideLoading();
        }
      });
    },
    // 删除记录
    deleteRecord(id = null) {
      return common_vendor.__awaiter(this, void 0, void 0, function* () {
        common_vendor.index.showModal(new UTSJSONObject({
          title: "确认删除",
          content: "该操作将删除记录及关联图片",
          success: (res) => {
            return common_vendor.__awaiter(this, void 0, void 0, function* () {
              if (res.confirm) {
                yield common_vendor.er.callFunction({
                  name: "delete_record",
                  data: new UTSJSONObject({ recordId: id })
                });
                this.loadData();
              }
            });
          }
        }));
      });
    },
    // 获取统计数据
    getStatistics() {
      return common_vendor.__awaiter(this, void 0, void 0, function* () {
        const res = yield common_vendor.er.callFunction({
          name: "get_statistics",
          data: new UTSJSONObject({
            deviceId: this.deviceId
          })
        });
        this.totalRecords = res.result.total;
        this.qualifiedCount = res.result.qualified;
        this.qualityChartData = res.result.qualityChartData;
        this.efficiencyChartData = res.result.efficiencyChartData;
      });
    },
    // 格式化时间为相对时间
    formatRelativeTime(timestamp = null) {
      const diff = Date.now() - timestamp;
      const minute = 60 * 1e3;
      const hour = 60 * minute;
      const day = 24 * hour;
      if (diff < minute)
        return "刚刚";
      if (diff < hour)
        return `${Math.floor(diff / minute)}分钟前`;
      if (diff < day)
        return `${Math.floor(diff / hour)}小时前`;
      return `${Math.floor(diff / day)}天前`;
    },
    // 结果状态样式
    resultClass(result = null) {
      return new UTSJSONObject({
        "status-pass": result === "合格",
        "status-fail": result !== "合格"
      });
    },
    // 批量操作
    batchExport(type = null) {
      [
        new UTSJSONObject({ text: "导出当前筛选结果", value: "filter" }),
        new UTSJSONObject({ text: "导出选中记录", value: "selected" }),
        new UTSJSONObject({ text: "导出全部数据", value: "all" })
      ];
    },
    // 数据修正
    correctData(record = null) {
      return common_vendor.__awaiter(this, void 0, void 0, function* () {
        yield common_vendor.er.callFunction({
          name: "correct_record",
          data: new UTSJSONObject({
            recordId: record._id,
            newData: this.correctionForm
          })
        });
      });
    },
    // 添加检测备注
    addRemark(record = null) {
      return common_vendor.__awaiter(this, void 0, void 0, function* () {
        const value = (yield common_vendor.index.showModal(new UTSJSONObject({
          title: "添加检测备注",
          editable: true,
          inputPlaceholder: "请输入备注信息..."
        }))).value;
        if (value) {
          yield common_vendor.er.callFunction({
            name: "add_remark",
            data: new UTSJSONObject({
              recordId: record._id,
              remark: value
            })
          });
        }
      });
    },
    // 获取文件列表
    loadFileList() {
      return common_vendor.__awaiter(this, void 0, void 0, function* () {
        try {
          const res = yield common_vendor.er.callFunction({
            name: "get_file_list",
            data: new UTSJSONObject({
              page: this.page,
              pageSize: 20
            })
          });
          if (res.result.code === 0) {
            this.fileList = [...this.fileList, ...res.result.data];
            this.total = res.result.total;
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/admin/admin.vue:487", "文件加载失败:", e);
        }
      });
    },
    // 导出全部Excel
    exportAllExcel() {
      return common_vendor.__awaiter(this, void 0, void 0, function* () {
        try {
          common_vendor.index.showLoading({ title: "生成Excel中..." });
          const res = yield common_vendor.er.callFunction({
            name: "export_all_excel"
          });
          const tempUrlRes = yield common_vendor.er.getTempFileURL({
            fileList: [res.result.fileID]
          });
          common_vendor.index.downloadFile({
            url: tempUrlRes.fileList[0].tempFileURL,
            success: (res2) => {
              common_vendor.index.saveFileToDisk(new UTSJSONObject({
                filePath: res2.tempFilePath,
                success: () => {
                  common_vendor.index.showToast({ title: "Excel导出成功" });
                }
              }));
            }
          });
        } catch (e) {
          common_vendor.index.showToast({ title: `导出失败: ${e.message}`, icon: "none" });
        } finally {
          common_vendor.index.hideLoading();
        }
      });
    },
    // 导出匹配图片
    exportImages() {
      return common_vendor.__awaiter(this, void 0, void 0, function* () {
        if (!this.imageKeyword) {
          return common_vendor.index.showToast({ title: "请输入搜索关键词", icon: "none" });
        }
        try {
          common_vendor.index.showLoading({ title: "搜索图片中..." });
          const res = yield common_vendor.er.callFunction({
            name: "batch_download_images",
            data: new UTSJSONObject({ fileName: this.imageKeyword })
          });
          const tempUrls = yield common_vendor.er.getTempFileURL({
            fileList: res.result.fileList.map((f = null) => {
              return f.fileID;
            })
          });
          const downloadTasks = tempUrls.fileList.map((file) => {
            return common_vendor.index.downloadFile({ url: file.tempFileURL });
          });
          Promise.all(downloadTasks).then((results) => {
            results.forEach((res2) => {
              common_vendor.index.saveFileToDisk(new UTSJSONObject({ filePath: res2.tempFilePath }));
            });
            common_vendor.index.showToast({ title: `成功导出${results.length}张图片` });
          });
        } catch (e) {
          common_vendor.index.showToast({ title: `导出失败: ${e.message}`, icon: "none" });
        } finally {
          common_vendor.index.hideLoading();
        }
      });
    },
    testCloudFunction() {
      return common_vendor.__awaiter(this, void 0, void 0, function* () {
        try {
          const res = yield common_vendor.er.callFunction({
            name: "get_file_list"
          });
          common_vendor.index.__f__("log", "at pages/admin/admin.vue:561", "云函数响应:", res);
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/admin/admin.vue:563", "云函数错误:", e);
        }
      });
    }
  }
});
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  const _component_uni_search_bar = common_vendor.resolveComponent("uni-search-bar");
  const _component_uni_load_more = common_vendor.resolveComponent("uni-load-more");
  const _component_qiun_data_charts = common_vendor.resolveComponent("qiun-data-charts");
  (_component_uni_icons + _component_uni_search_bar + _component_uni_load_more + _component_qiun_data_charts)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  "raw js";
  return {
    a: common_vendor.p({
      type: "folder",
      size: "30",
      color: "#fff"
    }),
    b: common_vendor.t($data.totalRecords),
    c: common_vendor.p({
      type: "checkmark",
      size: "30",
      color: "#fff"
    }),
    d: common_vendor.t($data.qualifiedCount),
    e: common_vendor.p({
      type: "search",
      size: "20",
      color: "#666"
    }),
    f: common_vendor.o($options.handleSearch),
    g: common_vendor.o(($event) => $data.searchKeyword = $event),
    h: common_vendor.p({
      placeholder: "输入设备编号/工序名称/检测人员",
      bgColor: "#f5f7fa",
      radius: "20",
      modelValue: $data.searchKeyword
    }),
    i: common_vendor.p({
      type: "calendar",
      size: "18"
    }),
    j: common_vendor.t($data.dateFilter || "选择日期"),
    k: common_vendor.o((...args) => $options.handleDateFilter && $options.handleDateFilter(...args)),
    l: common_vendor.p({
      type: "filters",
      size: "18"
    }),
    m: common_vendor.t($data.resultFilter || "筛选结果"),
    n: $data.resultOptions,
    o: common_vendor.o((...args) => $options.handleResultFilter && $options.handleResultFilter(...args)),
    p: common_vendor.f($data.records, (item, index, i0) => {
      return common_vendor.e({
        a: "4296aad4-6-" + i0,
        b: common_vendor.t(item.deviceId),
        c: common_vendor.t(item.processName),
        d: common_vendor.t(item.inspectResult),
        e: common_vendor.n($options.resultClass(item.inspectResult)),
        f: "4296aad4-7-" + i0,
        g: common_vendor.t(item.batchNumber),
        h: "4296aad4-8-" + i0,
        i: common_vendor.t(item.deviceModel),
        j: common_vendor.t(item.lightBlockage),
        k: common_vendor.t(item.leakageLength),
        l: common_vendor.t(item.fiberLoss),
        m: "4296aad4-9-" + i0,
        n: common_vendor.t(item.productionDate),
        o: "4296aad4-10-" + i0,
        p: common_vendor.t(item.workshop),
        q: item.images.length
      }, item.images.length ? {
        r: common_vendor.f(item.images, (img, imgIndex, i1) => {
          return {
            a: img.tempFileURL,
            b: common_vendor.o(($event) => $options.previewImage(img.tempFileURL), imgIndex),
            c: "4296aad4-11-" + i0 + "-" + i1,
            d: imgIndex
          };
        }),
        s: common_vendor.p({
          type: "eye",
          size: "20",
          color: "#fff"
        })
      } : {}, {
        t: "4296aad4-12-" + i0,
        v: common_vendor.o(($event) => $options.exportRecord(item), index),
        w: "4296aad4-13-" + i0,
        x: common_vendor.o(($event) => $options.deleteRecord(item._id), index),
        y: "4296aad4-14-" + i0,
        z: common_vendor.o(($event) => _ctx.tagDevice(item), index),
        A: "4296aad4-15-" + i0,
        B: common_vendor.o(($event) => $options.addRemark(item), index),
        C: "4296aad4-16-" + i0,
        D: common_vendor.o(($event) => _ctx.viewHistory(item), index),
        E: index,
        F: index % 2 === 0 ? 1 : ""
      });
    }),
    q: common_vendor.p({
      type: "device",
      size: "20"
    }),
    r: common_vendor.p({
      type: "barcode",
      size: "16"
    }),
    s: common_vendor.p({
      type: "settings",
      size: "16"
    }),
    t: common_vendor.p({
      type: "calendar",
      size: "16"
    }),
    v: common_vendor.p({
      type: "location",
      size: "16"
    }),
    w: common_vendor.p({
      type: "download",
      size: "18"
    }),
    x: common_vendor.p({
      type: "trash",
      size: "18"
    }),
    y: common_vendor.p({
      type: "tag",
      size: "18"
    }),
    z: common_vendor.p({
      type: "compose",
      size: "18"
    }),
    A: common_vendor.p({
      type: "paperclip",
      size: "18"
    }),
    B: common_vendor.p({
      status: $data.loading ? "loading" : "noMore",
      contentText: {
        contentdown: "上拉加载更多",
        contentrefresh: "正在加载...",
        contentnomore: "没有更多数据了"
      }
    }),
    C: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    D: common_vendor.p({
      type: "download",
      size: "20"
    }),
    E: common_vendor.o((...args) => $options.exportAllExcel && $options.exportAllExcel(...args)),
    F: common_vendor.o($options.exportImages),
    G: common_vendor.o(($event) => $data.imageKeyword = $event),
    H: common_vendor.p({
      placeholder: "输入文件名关键词",
      radius: "20",
      modelValue: $data.imageKeyword
    }),
    I: common_vendor.p({
      type: "image",
      size: "20"
    }),
    J: common_vendor.o((...args) => $options.exportImages && $options.exportImages(...args)),
    K: common_vendor.p({
      type: "ring",
      chartData: $data.qualityChartData
    }),
    L: common_vendor.p({
      type: "column",
      chartData: $data.efficiencyChartData
    }),
    M: common_vendor.p({
      type: "list",
      size: "24"
    }),
    N: common_vendor.t($data.lastUpdate),
    O: common_vendor.f($data.fileList, (file, index, i0) => {
      return {
        a: common_vendor.t(file.name),
        b: common_vendor.t(_ctx.formatDate(file.createTime)),
        c: common_vendor.t($data.fileStatusMap[file.status]),
        d: common_vendor.n(_ctx.statusClass(file.status)),
        e: index
      };
    }),
    P: common_vendor.sei(common_vendor.gei(_ctx, ""), "view")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/admin.js.map
