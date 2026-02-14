import BulkCommoditySalesChart from "@/views/map/components/BulkCommoditySalesChart.vue"
import YearlyEconomyTrend from "@/views/map/components/YearlyEconomyTrend.vue"
import EconomicTrendChart from "@/views/map/components/EconomicTrendChart.vue"
import DistrictEconomicIncome from "@/views/map/components/DistrictEconomicIncome.vue"
import PurposeSpecialFunds from "@/views/map/components/PurposeSpecialFunds.vue"
import ProportionPopulationConsumption from "@/views/map/components/ProportionPopulationConsumption.vue"
import ElectricityUsage from "@/views/map/components/ElectricityUsage.vue"
import QuarterlyGrowthSituation from "@/views/map/components/QuarterlyGrowthSituation.vue"

const PANEL_COMPONENTS = Object.freeze({
  bulkCommoditySalesChart: BulkCommoditySalesChart,
  yearlyEconomyTrend: YearlyEconomyTrend,
  economicTrendChart: EconomicTrendChart,
  districtEconomicIncome: DistrictEconomicIncome,
  purposeSpecialFunds: PurposeSpecialFunds,
  proportionPopulationConsumption: ProportionPopulationConsumption,
  electricityUsage: ElectricityUsage,
  quarterlyGrowthSituation: QuarterlyGrowthSituation,
})

const LEFT_PANEL_IDS = Object.freeze([
  "bulkCommoditySalesChart",
  "yearlyEconomyTrend",
  "economicTrendChart",
  "districtEconomicIncome",
])

const RIGHT_PANEL_IDS = Object.freeze([
  "purposeSpecialFunds",
  "proportionPopulationConsumption",
  "electricityUsage",
  "quarterlyGrowthSituation",
])

function buildPanel(id) {
  return {
    id,
    component: PANEL_COMPONENTS[id],
  }
}

export function createDashboardPanels() {
  return {
    left: LEFT_PANEL_IDS.map(buildPanel),
    right: RIGHT_PANEL_IDS.map(buildPanel),
  }
}
