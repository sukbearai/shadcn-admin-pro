import BulkCommoditySalesChart from "./components/BulkCommoditySalesChart.vue"
import YearlyEconomyTrend from "./components/YearlyEconomyTrend.vue"
import EconomicTrendChart from "./components/EconomicTrendChart.vue"
import DistrictEconomicIncome from "./components/DistrictEconomicIncome.vue"
import PurposeSpecialFunds from "./components/PurposeSpecialFunds.vue"
import ProportionPopulationConsumption from "./components/ProportionPopulationConsumption.vue"
import ElectricityUsage from "./components/ElectricityUsage.vue"
import QuarterlyGrowthSituation from "./components/QuarterlyGrowthSituation.vue"

export const mapViewConfig = {
  header: {
    title: "网络边界威胁感知",
    subText: "Network Boundary Threat Perception",
  },
  loading: {
    text: "LOADING",
  },
  autofit: {
    dh: 1080,
    dw: 1920,
    el: "#large-screen",
    resize: true,
  },
  menu: {
    defaultActiveIndex: "1",
    items: [],
  },
  totalView: [
    {
      icon: "xiaoshoujine",
      zh: "2025年生产总值",
      en: "Gross Domestic Product in 2025",
      value: 61500,
      unit: "亿元",
    },
    {
      icon: "zongxiaoliang",
      zh: "2025年常驻人数",
      en: "resident population in 2025",
      value: 15600,
      unit: "万人",
    },
  ],
  panels: {
    left: [
      { id: "bulkCommoditySalesChart", component: BulkCommoditySalesChart },
      { id: "yearlyEconomyTrend", component: YearlyEconomyTrend },
      { id: "economicTrendChart", component: EconomicTrendChart },
      { id: "districtEconomicIncome", component: DistrictEconomicIncome },
    ],
    right: [
      { id: "purposeSpecialFunds", component: PurposeSpecialFunds },
      { id: "proportionPopulationConsumption", component: ProportionPopulationConsumption },
      { id: "electricityUsage", component: ElectricityUsage },
      { id: "quarterlyGrowthSituation", component: QuarterlyGrowthSituation },
    ],
  },
  bottomTray: {
    returnLabel: "返回上级",
  },
  mapScene: {
    skin: {
      // 仅覆盖需要替换的皮肤字段，完整结构见 src/views/map/skin/index.js
      assets: {
        mapFiles: {
          china: "assets/json/中华人民共和国.json",
          mapJson: "assets/json/中华人民共和国.json",
          mapStroke: "assets/json/中华人民共和国.json",
        },
      },
      world: {},
    },
    worldOptions: {
      rootName: "中国",
      showOtherProvinceLabels: true,
      showMainRegionLabels: false,
      showProvinceBars: true,
      showChinaBaseMap: true,
      showChinaBlurLine: true,
      childMapScaleMultiplier: 1,
      mapFocusLabelInfo: {
        name: "全国分布中心",
        enName: "NATIONAL DISTRIBUTION CENTER",
        center: [106, 20],
      },
    },
  },
}
