import BulkCommoditySalesChart from "@/views/visualization/map/components/BulkCommoditySalesChart.vue"
import YearlyEconomyTrend from "@/views/visualization/map/components/YearlyEconomyTrend.vue"
import EconomicTrendChart from "@/views/visualization/map/components/EconomicTrendChart.vue"
import DistrictEconomicIncome from "@/views/visualization/map/components/DistrictEconomicIncome.vue"
import PurposeSpecialFunds from "@/views/visualization/map/components/PurposeSpecialFunds.vue"
import ProportionPopulationConsumption from "@/views/visualization/map/components/ProportionPopulationConsumption.vue"
import ElectricityUsage from "@/views/visualization/map/components/ElectricityUsage.vue"
import QuarterlyGrowthSituation from "@/views/visualization/map/components/QuarterlyGrowthSituation.vue"

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
