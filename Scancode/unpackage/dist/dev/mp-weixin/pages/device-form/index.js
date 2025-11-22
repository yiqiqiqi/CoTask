"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = common_vendor.defineComponent({
  data() {
    return {
      deviceId: "",
      processNames: [
        "来料检",
        "过程检",
        "插接头焊接",
        "固定头焊接",
        "导管安装",
        "接地线焊接",
        "转轮安装",
        "上壳组件安装",
        "手柄手轮安装",
        "内包",
        "完工检",
        "出厂检"
      ],
      currentProcessIndex: 0,
      processList: Array(12).fill().map(() => {
        return new UTSJSONObject({
          inspector: "",
          inspectTime: "",
          image: ""
          // 检测图片
        });
      })
    };
  },
  computed: {
    currentProcess() {
      return this.processList[this.currentProcessIndex];
    }
  },
  onLoad(options) {
    if (options.deviceId) {
      this.deviceId = options.deviceId;
    }
  },
  methods: {
    // 处理工序选择
    handleProcessChange(e = null) {
      this.currentProcessIndex = Number(e.detail.value);
    },
    // 处理日期选择
    handleDateChange(e = null) {
      this.currentProcess.inspectTime = e.detail.value;
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
          const cloudPath = `upload/${this.deviceId}_${this.processNames[processIndex]}_${Date.now()}${ext}`;
          common_vendor.er.uploadFile({
            filePath: tempFilePath,
            cloudPath
          }).then((uploadRes) => {
            if (uploadRes && uploadRes.fileID) {
              common_vendor.er.getTempFileURL({
                fileList: [uploadRes.fileID]
              }).then((tempUrlRes) => {
                const tempUrl = tempUrlRes.fileList[0].tempFileURL;
                this.processList[processIndex].image = tempUrl;
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({ title: "上传成功", icon: "success" });
              }).catch((err = null) => {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({ title: "获取预览图失败", icon: "none" });
                common_vendor.index.__f__("error", "at pages/device-form/index.vue:167", err);
              });
            } else {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({ title: "图片上传失败", icon: "none" });
            }
          }).catch((err = null) => {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({ title: "图片上传失败", icon: "none" });
            common_vendor.index.__f__("error", "at pages/device-form/index.vue:176", err);
          });
        },
        fail: () => {
          common_vendor.index.showToast({ title: "图片选择失败", icon: "none" });
        }
      }));
    },
    // 提交表单
    handleSubmit() {
      if (!this.validateForm()) {
        return null;
      }
      common_vendor.index.__f__("log", "at pages/device-form/index.vue:193", "表单数据：", this.currentProcess);
      common_vendor.index.showToast({
        title: "提交成功",
        icon: "success"
      });
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
    }
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  "raw js";
  return common_vendor.e({
    a: common_vendor.t($data.deviceId),
    b: common_vendor.t($data.processNames[$data.currentProcessIndex] || "请选择工序"),
    c: $data.processNames,
    d: $data.currentProcessIndex,
    e: common_vendor.o((...args) => $options.handleProcessChange && $options.handleProcessChange(...args)),
    f: $options.currentProcess.inspector,
    g: common_vendor.o(($event) => $options.currentProcess.inspector = $event.detail.value),
    h: common_vendor.t($options.currentProcess.inspectTime || "请选择检测时间"),
    i: $options.currentProcess.inspectTime,
    j: common_vendor.o((...args) => $options.handleDateChange && $options.handleDateChange(...args)),
    k: $options.currentProcess.image
  }, $options.currentProcess.image ? {
    l: $options.currentProcess.image
  } : {}, {
    m: common_vendor.t($options.currentProcess.image ? "重新上传" : "上传图片"),
    n: common_vendor.o((...args) => $options.handleUploadImage && $options.handleUploadImage(...args)),
    o: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args)),
    p: common_vendor.sei(common_vendor.gei(_ctx, ""), "view")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/device-form/index.js.map
