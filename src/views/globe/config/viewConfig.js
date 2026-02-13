import BulkCommoditySalesChart from "../components/BulkCommoditySalesChart.vue"
import YearlyEconomyTrend from "../components/YearlyEconomyTrend.vue"
import EconomicTrendChart from "../components/EconomicTrendChart.vue"
import DistrictEconomicIncome from "../components/DistrictEconomicIncome.vue"
import PurposeSpecialFunds from "../components/PurposeSpecialFunds.vue"
import ProportionPopulationConsumption from "../components/ProportionPopulationConsumption.vue"
import ElectricityUsage from "../components/ElectricityUsage.vue"
import QuarterlyGrowthSituation from "../components/QuarterlyGrowthSituation.vue"

const globeViewConfig = {
  header: {
    title: "恶意代码预警通报管理平台",
    subText: "Malicious Code Warning Bulletin Management Platform",
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
    switchViewLabel: "切换地图",
    returnLabel: "返回上级",
    cloudOnLabel: "开启云层",
    cloudOffLabel: "关闭云层",
  },
}

export default globeViewConfig
