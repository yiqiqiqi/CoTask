"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = common_vendor.defineComponent({
  data() {
    return {
      // 登录相关数据
      isLoggedIn: false,
      loginAccount: "",
      loginPassword: "",
      allowedAccount: "admin",
      allowedPassword: "123456",
      deviceId: "",
      currentProcessIndex: null,
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
      processList: Array(22).fill().map(() => {
        return new UTSJSONObject({
          inspector: "",
          inspectTime: "",
          image: "",
          inspectResult: ""
          // 检验结果
        });
      }),
      inspectResultOptions: [
        "合格",
        "不合格",
        "遮光3%可遮",
        "软头漏光",
        "前端光纤断",
        "通体漏光",
        "软头漏光长度超5mm"
      ],
      exportRequestActive: false,
      showDownloadTip: false
      // 新增：下载提示标志
    };
  },
  computed: {
    currentProcess() {
      return this.currentProcessIndex !== null ? this.processList[this.currentProcessIndex] : null;
    }
  },
  onLoad() {
    const history = common_vendor.index.getStorageSync("scanHistory");
    if (history) {
      this.scanHistory = UTS.JSON.parse(history);
    }
  },
  methods: {
    // 检查登录账号和密码是否正确
    checkLogin() {
      if (this.loginAccount.trim() === this.allowedAccount && this.loginPassword === this.allowedPassword) {
        this.isLoggedIn = true;
      } else {
        common_vendor.index.showToast({
          title: "账号或密码错误",
          icon: "none"
        });
      }
    },
    // 扫码功能
    scanCode() {
      common_vendor.index.scanCode(new UTSJSONObject({
        success: (res) => {
          this.deviceId = res.result;
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "扫码失败",
            icon: "none"
          });
        }
      }));
    },
    // 处理工序选择
    handleProcessChange(e = null) {
      this.currentProcessIndex = Number(e.detail.value);
    },
    // 处理日期选择
    handleDateChange(e = null) {
      this.processList[this.currentProcessIndex].inspectTime = e.detail.value;
    },
    // 处理图片上传
    handleUploadImage() {
      common_vendor.index.chooseImage(new UTSJSONObject({
        count: 1,
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          const processIndex = this.currentProcessIndex;
          const dotIndex = tempFilePath.lastIndexOf(".");
          const ext = dotIndex !== -1 ? tempFilePath.substring(dotIndex) : ".jpg";
          common_vendor.index.showLoading({ title: "上传中..." });
          const validDeviceId = encodeURIComponent(this.deviceId);
          const validProcessName = "P" + (processIndex + 1);
          const validInspector = encodeURIComponent(this.currentProcess.inspector);
          const validInspectTime = encodeURIComponent(this.currentProcess.inspectTime);
          const inspectResultMapping = new UTSJSONObject({
            "合格": "R1",
            "不合格": "R2",
            "遮光3%可遮": "R3",
            "软头漏光": "R4",
            "前端光纤断": "R5",
            "通体漏光": "R6",
            "软头漏光长度超5mm": "R7"
          });
          const validInspectResult = inspectResultMapping[this.currentProcess.inspectResult] || "UNK";
          const cloudPath = `upload/${validDeviceId}_${validProcessName}_${validInspector}_${validInspectTime}_${validInspectResult}_${Date.now()}${ext}`;
          common_vendor.er.uploadFile({
            filePath: tempFilePath,
            cloudPath
          }).then((uploadRes) => {
            return common_vendor.__awaiter(this, void 0, void 0, function* () {
              if (uploadRes && uploadRes.fileID) {
                yield common_vendor.er.callFunction({
                  name: "submit_process",
                  data: new UTSJSONObject({
                    type: "IMAGE_INDEX",
                    data: new UTSJSONObject({
                      deviceId: this.deviceId,
                      processName: this.processNames[processIndex],
                      fileID: uploadRes.fileID
                    })
                  })
                });
                common_vendor.er.getTempFileURL({
                  fileList: [uploadRes.fileID]
                }).then((tempUrlRes) => {
                  let tempUrl = tempUrlRes.fileList[0].tempFileURL;
                  tempUrl = tempUrl + "?t=" + Date.now();
                  this.$set(this.processList, processIndex, new UTSJSONObject(Object.assign(Object.assign({}, this.processList[processIndex]), { image: tempUrl })));
                  common_vendor.index.hideLoading();
                  common_vendor.index.showToast({ title: "上传成功", icon: "success" });
                }).catch((err = null) => {
                  common_vendor.index.hideLoading();
                  common_vendor.index.showToast({ title: "获取预览图失败", icon: "none" });
                  common_vendor.index.__f__("error", "at pages/index/index.vue:314", err);
                });
              } else {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({ title: "图片上传失败", icon: "none" });
              }
            });
          }).catch((err = null) => {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({ title: "图片上传失败", icon: "none" });
            common_vendor.index.__f__("error", "at pages/index/index.vue:323", err);
          });
        },
        fail: () => {
          common_vendor.index.showToast({ title: "图片选择失败", icon: "none" });
        }
      }));
    },
    // 提交表单
    handleSubmit() {
      return common_vendor.__awaiter(this, void 0, void 0, function* () {
        if (!this.deviceId) {
          common_vendor.index.showToast({
            title: "请先输入或扫码获取设备编号",
            icon: "none"
          });
          return Promise.resolve(null);
        }
        if (!this.validateForm()) {
          return Promise.resolve(null);
        }
        try {
          common_vendor.index.showLoading({
            title: "提交中..."
          });
          const result = yield common_vendor.er.callFunction({
            name: "submit_process",
            data: new UTSJSONObject({
              deviceId: this.deviceId,
              processName: this.processNames[this.currentProcessIndex],
              processData: new UTSJSONObject({
                inspector: this.currentProcess.inspector,
                inspectTime: this.currentProcess.inspectTime,
                inspectResult: this.currentProcess.inspectResult,
                image: this.currentProcess.image
              })
            })
          });
          if (result.result.code === 0) {
            common_vendor.index.showToast({
              title: "提交成功",
              icon: "success"
            });
            this.processList[this.currentProcessIndex] = {
              inspector: "",
              inspectTime: "",
              image: "",
              inspectResult: ""
            };
          } else {
            throw new Error(result.result.msg);
          }
        } catch (error) {
          common_vendor.index.showToast({
            title: error.message || "提交失败",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at pages/index/index.vue:387", "提交失败：", error);
        } finally {
          common_vendor.index.hideLoading();
        }
      });
    },
    // 新增：导出全部数据方法（调用云函数 export_all_excel）
    handleExport() {
      return common_vendor.__awaiter(this, void 0, void 0, function* () {
        this.exportRequestActive = true;
        try {
          common_vendor.index.showLoading({ title: "导出中..." });
          const res = yield common_vendor.er.callFunction({ name: "export_all_excel" });
          common_vendor.index.hideLoading();
          if (!this.exportRequestActive) {
            common_vendor.index.showToast({ title: "导出已终止", icon: "none" });
            return Promise.resolve(null);
          }
          if (res.result && res.result.code === 0) {
            common_vendor.index.showToast({ title: "导出成功", icon: "success" });
            common_vendor.index.__f__("log", "at pages/index/index.vue:407", "Excel 文件链接：", res.result.data.excelFile);
          } else {
            common_vendor.index.showToast({ title: "导出失败", icon: "none" });
          }
        } catch (error) {
          common_vendor.index.hideLoading();
          if (this.exportRequestActive) {
            common_vendor.index.showToast({ title: "导出失败", icon: "none" });
          }
          common_vendor.index.__f__("error", "at pages/index/index.vue:416", error);
        }
        this.exportRequestActive = false;
      });
    },
    // 新增：终止导出操作（仅控制前端状态）
    handleCancelExport() {
      if (this.exportRequestActive) {
        this.exportRequestActive = false;
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "已终止导出", icon: "none" });
        common_vendor.index.__f__("log", "at pages/index/index.vue:427", "导出操作已终止");
      }
    },
    // 表单验证
    validateForm() {
      const process = this.currentProcess;
      if (!process.inspector || !process.inspectTime) {
        common_vendor.index.showToast({
          title: "请完善当前工序信息",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    // 处理检验结果选择
    handleInspectResultChange(e = null) {
      const index = Number(e.detail.value);
      this.processList[this.currentProcessIndex].inspectResult = this.inspectResultOptions[index];
    },
    // 新增：批量下载功能
    handleBatchDownload() {
      var _a;
      return common_vendor.__awaiter(this, void 0, void 0, function* () {
        if (!this.deviceId) {
          common_vendor.index.showToast({ title: "请先输入设备编号", icon: "none" });
          return Promise.resolve(null);
        }
        try {
          common_vendor.index.showLoading({
            title: "正在生成压缩包...",
            mask: true
          });
          const timeout2 = setTimeout(() => {
            common_vendor.index.showModal(new UTSJSONObject({
              title: "提示",
              content: "处理时间较长，请勿关闭页面",
              showCancel: false
            }));
          }, 12e4);
          const res = yield common_vendor.er.callFunction({
            name: "batch_download_images",
            data: new UTSJSONObject({ deviceId: this.deviceId })
          });
          if (!((_a = res.result.data) === null || _a === void 0 ? null : _a.zipUrl)) {
            throw new Error("压缩包生成失败");
          }
          const tempUrlRes = yield common_vendor.er.getTempFileURL({
            fileList: [res.result.data.zipUrl]
          });
          common_vendor.index.downloadFile({
            url: tempUrlRes.fileList[0].tempFileURL,
            success: (downloadRes) => {
              if (downloadRes.statusCode !== 200) {
                throw new Error(`下载失败：${downloadRes.statusCode}`);
              }
              common_vendor.index.saveFileToDisk(new UTSJSONObject({
                filePath: downloadRes.tempFilePath,
                success: () => {
                  common_vendor.index.showModal(new UTSJSONObject({
                    title: "下载完成",
                    content: "压缩包已保存至手机下载目录",
                    showCancel: false
                  }));
                },
                fail: (e = null) => {
                  common_vendor.index.__f__("error", "at pages/index/index.vue:500", "保存失败:", e);
                  common_vendor.index.showToast({ title: "保存失败，请检查存储权限", icon: "none" });
                }
              }));
            },
            fail: (err) => {
              throw new Error(`下载失败：${err.errMsg}`);
            }
          });
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/index/index.vue:510", "导出错误:", e);
          common_vendor.index.showToast({
            title: `操作失败：${e.message || e.errMsg}`,
            icon: "none",
            duration: 3e3
          });
        } finally {
          clearTimeout(timeout);
          common_vendor.index.hideLoading();
        }
      });
    },
    openSettingGuide() {
      common_vendor.index.showModal(new UTSJSONObject({
        title: "权限申请",
        content: "请在系统设置中允许应用访问相册权限",
        confirmText: "去设置",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.openSetting();
          }
        }
      }));
    },
    // 新增：跳转后台
    goToAdmin() {
      common_vendor.index.navigateTo({
        url: "/pages/admin/admin"
      });
    }
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  "raw js";
  return {
    a: common_vendor.o(($event) => _ctx.navigateTo("/pages/index/index")),
    b: common_vendor.o(($event) => _ctx.navigateTo("/pages/about/index")),
    c: common_vendor.o(($event) => _ctx.navigateTo("/pages/business/index")),
    d: common_vendor.o(($event) => _ctx.navigateTo("/pages/contact/index")),
    e: common_vendor.o(($event) => _ctx.navigateTo("/pages/business/index")),
    f: common_vendor.o(($event) => _ctx.navigateTo("/pages/contact/index")),
    g: common_vendor.f(_ctx.businessItems, (item, index, i0) => {
      return {
        a: common_vendor.t(item.icon),
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.description),
        d: index,
        e: common_vendor.o(($event) => _ctx.navigateTo("/pages/business/index"), index)
      };
    }),
    h: common_vendor.f(_ctx.advantages, (item, index, i0) => {
      return {
        a: common_vendor.t(index + 1),
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.description),
        d: index
      };
    }),
    i: common_vendor.f(_ctx.successCases, (caseItem, index, i0) => {
      return {
        a: common_vendor.t(caseItem.industry),
        b: common_vendor.t(caseItem.year),
        c: common_vendor.t(caseItem.title),
        d: common_vendor.t(caseItem.description),
        e: index
      };
    }),
    j: common_vendor.o(($event) => _ctx.navigateTo("/pages/contact/index")),
    k: common_vendor.sei(common_vendor.gei(_ctx, ""), "view")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
