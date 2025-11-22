"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = common_vendor.defineComponent({
  data() {
    return {
      businessList: [
        new UTSJSONObject({
          icon: "🔗",
          title: "光纤通信设备",
          description: "提供高性能光纤熔接机、光功率计等专业设备",
          features: ["高精度熔接", "智能检测", "远程监控"]
        }),
        new UTSJSONObject({
          icon: "🌐",
          title: "工业物联网平台",
          description: "构建智能化的工业设备监控与管理系统",
          features: ["实时数据", "预测维护", "智能分析"]
        }),
        new UTSJSONObject({
          icon: "📡",
          title: "智能传感技术",
          description: "研发高精度传感器及数据采集解决方案",
          features: ["高灵敏度", "低功耗", "无线传输"]
        }),
        new UTSJSONObject({
          icon: "📏",
          title: "测量与检测系统",
          description: "提供工业级精密测量和质量检测设备",
          features: ["微米级精度", "自动化检测", "数据追溯"]
        })
      ],
      advantages: [
        new UTSJSONObject({
          icon: "⚡",
          title: "技术创新",
          description: "拥有50+项专利技术，持续推动行业技术革新"
        }),
        new UTSJSONObject({
          icon: "🔧",
          title: "定制化服务",
          description: "根据客户需求提供个性化解决方案"
        }),
        new UTSJSONObject({
          icon: "🛡️",
          title: "质量保证",
          description: "严格的质量控制体系，确保产品可靠性"
        }),
        new UTSJSONObject({
          icon: "🚀",
          title: "快速响应",
          description: "专业团队提供7×24小时技术支持服务"
        })
      ],
      successCases: [
        new UTSJSONObject({
          industry: "通信运营商",
          year: "2022",
          title: "5G基站光纤网络建设",
          description: "为某大型通信运营商提供光纤熔接设备和技术支持",
          results: ["熔接效率提升30%", "故障率降低50%", "运维成本节约20%"]
        }),
        new UTSJSONObject({
          industry: "智能制造",
          year: "2021",
          title: "智能工厂物联网改造",
          description: "为某制造企业构建工业物联网监控平台",
          results: ["设备利用率提升25%", "维护成本降低40%", "生产效率提高15%"]
        }),
        new UTSJSONObject({
          industry: "能源电力",
          year: "2023",
          title: "变电站智能监测系统",
          description: "为电力公司提供变电站设备状态监测解决方案",
          results: ["实时监控覆盖100%", "预警准确率95%", "运维效率提升35%"]
        })
      ]
    };
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    navigateToDetail(item = null) {
      common_vendor.index.showToast({
        title: `查看${item.title}详情`,
        icon: "none"
      });
    }
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  "raw js";
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.f($data.businessList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.icon),
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.description),
        d: common_vendor.f(item.features, (feature, fIndex, i1) => {
          return {
            a: common_vendor.t(feature),
            b: fIndex
          };
        }),
        e: index,
        f: common_vendor.o(($event) => $options.navigateToDetail(item), index)
      };
    }),
    c: common_vendor.f($data.advantages, (advantage, index, i0) => {
      return {
        a: common_vendor.t(advantage.icon),
        b: common_vendor.t(advantage.title),
        c: common_vendor.t(advantage.description),
        d: index
      };
    }),
    d: common_vendor.f($data.successCases, (caseItem, index, i0) => {
      return {
        a: common_vendor.t(caseItem.industry),
        b: common_vendor.t(caseItem.year),
        c: common_vendor.t(caseItem.title),
        d: common_vendor.t(caseItem.description),
        e: common_vendor.f(caseItem.results, (result, rIndex, i1) => {
          return {
            a: common_vendor.t(result),
            b: rIndex
          };
        }),
        f: index
      };
    }),
    e: common_vendor.sei(common_vendor.gei(_ctx, ""), "view")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/business/index.js.map
