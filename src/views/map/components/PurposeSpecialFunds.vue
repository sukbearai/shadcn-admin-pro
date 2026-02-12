<template>
  <div class="right-card">
    <m-card title="安全能力投入">
      <v-chart ref="vChart" :option="option" :autoresize="true" />
    </m-card>
  </div>
</template>
<script setup>
import { ref } from "vue"
import * as echarts from "echarts"
import mCard from "@/components/mCard/index.vue"
import VChart from "vue-echarts"
import { securityCapabilityInvestmentData } from "./mock/securityDashboardMock"

const securityCapabilityData = securityCapabilityInvestmentData

const option = ref({
  grid: {
    left: "5%",
    top: "10%",
    width: "90%",
    height: "86%",
  },
  legend: {
    show: false,
    top: "8%",
    icon: "circle",
    itemWidth: 8,
    itemHeight: 8,
    textStyle: {
      color: "#90979c",
      fontSize: 12,
      lineHeight: 20,
    },
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
      shadowStyle: { opacity: 0.2 },
    },
    backgroundColor: "rgba(0,0,0,1)",
    borderWidth: 1,
    borderColor: "#999999",
    textStyle: {
      color: "#ffffff",
      fontSize: 10,
      lineHeight: 156,
    },
    formatter: (params) => {
      const item = params?.[0]
      return `${item.name}<br/>投入：${item.value.toLocaleString("zh-CN")} 万`
    },
  },
  xAxis: [
    {
      type: "value",
      interval: 0,
      axisLine: {
        show: false,
        lineStyle: {
          color: "#407A80",
        },
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      axisLabel: {
        color: "#CFDAE6",
        fontSize: 10,
        interval: 0,
      },
    },
  ],
  yAxis: [
    {
      type: "category",
      inverse: true,
      axisLabel: {
        color: "#CFDAE6",
        fontSize: 10,
        interval: 0,
        show: false,
        verticalAlign: "top",
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      data: securityCapabilityData.map((item) => item.name),
    },
    {
      inverse: true,
      axisLine: {
        show: false,
        lineStyle: {
          color: "rgba(0,0,0,0)",
        },
      },
      data: [],
    },
  ],
  color: ["rgba(115,208,255,1)", "rgba(77, 255, 181, 1)", "rgba(230, 230, 230, 1)", "rgba(255, 200, 89, 1)"],
  series: [
    {
      data: [
        {
          value: securityCapabilityData[0].value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
              { offset: 0, color: "rgba(3,65,128,1)" },
              { offset: 1, color: "rgba(115,208,255,1)" },
            ]),
          },
        },
        {
          value: securityCapabilityData[1].value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
              { offset: 0, color: "rgba(11, 77, 44, 1)" },
              { offset: 1, color: "rgba(77, 255, 181, 1)" },
            ]),
          },
        },
        {
          value: securityCapabilityData[2].value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
              { offset: 0, color: "rgba(117, 117, 117, 1)" },
              { offset: 1, color: "rgba(230, 230, 230, 1)" },
            ]),
          },
        },
        {
          value: securityCapabilityData[3].value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
              { offset: 0, color: "rgba(153, 105, 38, 1)" },
              { offset: 1, color: "rgba(255, 200, 89, 1)" },
            ]),
          },
        },
      ],
      type: "bar",
      barWidth: 7,
      yAxisIndex: 0,
      showBackground: false,
      z: 2,
      label: {
        show: true,
        position: "middle",
        padding: [-18, 0, 0, 0],
        color: "#16C1A6",
        fontSize: 12,
        formatter: "{title|{b}}                                                                              {value|{c}}  {unit|万}",
        rich: {
          title: {
            color: "#FFFFFF",
            fontSize: 10,
          },
          value: {
            fontSize: 10,
          },
          unit: {
            color: "#717477",
            fontSize: 10,
          },
        },
      },
      itemStyle: {
        borderRadius: 0,
        borderWidth: 2,
        borderColor: "rgba(26, 57, 77,1)",
      },
    },
    {
      name: "",
      type: "bar",
      yAxisIndex: 1,
      barGap: "-100%",
      data: [120, 120, 120, 120],
      barWidth: 10,
      z: 0,
      itemStyle: {
        color: "none",
        borderColor: "rgba(172,191,188,0.4)",
        borderWidth: 1,
        borderRadius: 0,
      },
    },
  ],
})
</script>

<style lang="scss"></style>
