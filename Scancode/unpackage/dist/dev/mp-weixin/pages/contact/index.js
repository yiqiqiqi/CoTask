"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = common_vendor.defineComponent({
  data() {
    return {
      contactInfo: [
        new UTSJSONObject({
          icon: "📞",
          title: "联系电话",
          value: "025-8888-9999",
          description: "工作日 9:00-18:00",
          action: "拨打电话",
          type: "phone"
        }),
        new UTSJSONObject({
          icon: "✉️",
          title: "电子邮箱",
          value: "contact@bosihanxin.com",
          description: "24小时内回复",
          action: "发送邮件",
          type: "email"
        }),
        new UTSJSONObject({
          icon: "💬",
          title: "在线客服",
          value: "微信客服",
          description: "扫码添加微信",
          action: "联系客服",
          type: "wechat"
        }),
        new UTSJSONObject({
          icon: "🌐",
          title: "官方网站",
          value: "www.bosihanxin.com",
          description: "了解更多信息",
          action: "访问网站",
          type: "website"
        })
      ],
      formData: new UTSJSONObject({
        name: "",
        phone: "",
        email: "",
        company: "",
        message: ""
      })
    };
  },
  computed: {
    isFormValid() {
      return this.formData.name && this.formData.phone && this.formData.message;
    }
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    handleContactAction(item = null) {
      switch (item.type) {
        case "phone":
          common_vendor.index.makePhoneCall({
            phoneNumber: item.value
          });
          break;
        case "email":
          common_vendor.index.showModal(new UTSJSONObject({
            title: "发送邮件",
            content: `是否要发送邮件到 ${item.value}？`,
            success: (res) => {
              if (res.confirm) {
                common_vendor.index.showToast({
                  title: "邮件功能开发中",
                  icon: "none"
                });
              }
            }
          }));
          break;
        case "wechat":
          common_vendor.index.showModal(new UTSJSONObject({
            title: "微信客服",
            content: "请扫描二维码添加微信客服",
            showCancel: false
          }));
          break;
        case "website":
          common_vendor.index.navigateTo({
            url: "/pages/webview/webview?url=" + encodeURIComponent("https://www.bosihanxin.com")
          });
          break;
      }
    },
    handleSubmit() {
      if (!this.isFormValid) {
        common_vendor.index.showToast({
          title: "请填写完整信息",
          icon: "none"
        });
        return null;
      }
      common_vendor.index.showLoading({
        title: "提交中..."
      });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "留言提交成功",
          icon: "success"
        });
        this.formData = {
          name: "",
          phone: "",
          email: "",
          company: "",
          message: ""
        };
      }, 2e3);
    },
    openWechat() {
      common_vendor.index.showModal(new UTSJSONObject({
        title: "微信公众号",
        content: '请搜索"玻丝焊芯科技"关注我们的公众号',
        showCancel: false
      }));
    },
    openWeibo() {
      common_vendor.index.navigateTo({
        url: "/pages/webview/webview?url=" + encodeURIComponent("https://weibo.com/bosihanxin")
      });
    },
    openLinkedIn() {
      common_vendor.index.navigateTo({
        url: "/pages/webview/webview?url=" + encodeURIComponent("https://linkedin.com/company/bosihanxin")
      });
    }
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  "raw js";
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.f($data.contactInfo, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.icon),
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.value),
        d: item.description
      }, item.description ? {
        e: common_vendor.t(item.description)
      } : {}, {
        f: common_vendor.t(item.action),
        g: index,
        h: common_vendor.o(($event) => $options.handleContactAction(item), index)
      });
    }),
    c: $data.formData.name,
    d: common_vendor.o(($event) => $data.formData.name = $event.detail.value),
    e: $data.formData.phone,
    f: common_vendor.o(($event) => $data.formData.phone = $event.detail.value),
    g: $data.formData.email,
    h: common_vendor.o(($event) => $data.formData.email = $event.detail.value),
    i: $data.formData.company,
    j: common_vendor.o(($event) => $data.formData.company = $event.detail.value),
    k: $data.formData.message,
    l: common_vendor.o(($event) => $data.formData.message = $event.detail.value),
    m: common_vendor.t($data.formData.message.length),
    n: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args)),
    o: !$options.isFormValid,
    p: common_vendor.o((...args) => $options.openWechat && $options.openWechat(...args)),
    q: common_vendor.o((...args) => $options.openWeibo && $options.openWeibo(...args)),
    r: common_vendor.o((...args) => $options.openLinkedIn && $options.openLinkedIn(...args)),
    s: common_vendor.sei(common_vendor.gei(_ctx, ""), "view")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/contact/index.js.map
