<template>
  <div class="left-card">
    <m-card title="威胁类型TOP8">
      <v-chart ref="vChart" :option="option" :autoresize="true" />
    </m-card>
  </div>
</template>
<script setup>
import { ref } from "vue"
import * as echarts from "echarts"
import mCard from "@/components/mCard/index.vue"
import VChart from "vue-echarts"
import { threatTypeTop8Data } from "./mock/securityDashboardMock"

const mockThreatTypeData = threatTypeTop8Data

const categories = mockThreatTypeData.map((item) => item.type)
const values = mockThreatTypeData.map((item) => item.count)
const axisMax = Math.ceil(Math.max(...values) / 50) * 50

const option = ref({
  title: {
    text: "次",
    left: "5%",
    top: "8%",
    textStyle: {
      color: "#D3F8F2",
      fontSize: 8,
    },
  },
  grid: {
    left: "10%",
    top: "25%",
    width: "84%",
    height: "55%",
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
      shadowStyle: { opacity: 0 },
    },
    backgroundColor: "rgba(0,0,0,1)",
    borderWidth: 1,
    borderColor: "#ffffff",
    textStyle: {
      color: "#ffffff",
      fontSize: 10,
    },
    formatter: (params) => {
      const item = params[0]
      return `${item.name}<br/>${item.value.toLocaleString("zh-CN")} 次`
    },
  },
  xAxis: [
    {
      type: "category",
      interval: 0,
      axisLine: {
        show: false,
        lineStyle: {
          color: "#435459",
        },
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      axisLabel: {
        color: "#ffffff",
        fontSize: 9,
        interval: 0,
      },
      data: categories,
    },
    {
      axisLine: {
        show: false,
        lineStyle: {
          color: "rgba(0,0,0,0)",
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
      data: categories,
    },
  ],
  yAxis: {
    type: "value",
    max: axisMax,
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      show: true,
      lineStyle: {
        type: [2, 2],
        dashOffset: 5,
        color: ["rgba(255, 255, 255, 1)"],
        opacity: 1,
        width: 0.3,
      },
    },
    axisLabel: {
      color: "#8B9EA4",
      fontSize: 9,
    },
  },
  series: [
    {
      name: "威胁数量",
      data: values,
      type: "bar",
      barWidth: 4,
      stack: "b",
      z: 3,
      yAxisIndex: 0,
      showBackground: false,
      label: {
        show: true,
        position: "top",
        distance: 10,
        color: "#ffffff",
        fontSize: 10,
        formatter: ({ value }) => value.toLocaleString("zh-CN"),
      },
      itemStyle: {
        borderRadius: 2,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "#19FFC6" },
          { offset: 1, color: "#33AAFF" },
        ]),
      },
    },
    {
      type: "custom",
      renderItem: (params, api) => {
        const categoryIndex = api.value(0)
        const categoryData = api.value(1)
        const basicsCoord = api.coord([categoryIndex, categoryData])
        const topBasicsYAxis = basicsCoord[1]
        const basicsXAxis = basicsCoord[0]

        return {
          type: "image",
          style: {
            x: basicsXAxis - 4.5,
            y: topBasicsYAxis - 9,
            width: 10,
            height: 10,
            image:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAL1JREFUOE9j/P///38GMgAjSKOMdxRJWp9sXcYA18giJMLw99MHhv9//mA1hJGZhYGZX4Dhz7s3DCgaGVlYGDjVtBi+37rO8P/PbxTNjCysDJyqWgzfb18Dy6FoBKmEKfh17wZcM0iMTUkDrgmkDkMjSJCFnZ3hwbr5KDYqBCUy/Pn5Ey6GVSMzMxPDw01LUDTK+8Uw/P37j0YayXIqWYGDHuTInsQbHeAE8PEDw/+/JCYAUtIcPDpI0QRTCwDhurXXJ/EmUwAAAABJRU5ErkJggg==",
          },
        }
      },
      xAxisIndex: 1,
      data: values,
    },
    {
      type: "bar",
      barWidth: 18,
      xAxisIndex: 1,
      barGap: "-220%",
      data: values.map(() => axisMax),
      emphasis: {
        focus: "none",
        itemStyle: { color: "rgba(255,255,255,0.8)" },
      },
      itemStyle: {
        color: "rgba(122,140,153,0.6)",
        opacity: 0.1,
      },
      z: 0,
    },
  ],
})
</script>
<style lang="scss"></style>
