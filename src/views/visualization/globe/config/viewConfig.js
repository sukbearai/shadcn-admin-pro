import { createViewConfig } from "@/views/shared/viewConfigFactory"

const globeViewConfig = createViewConfig({
  header: {
    title: "恶意代码预警通报管理平台",
    subText: "Malicious Code Warning Bulletin Management Platform",
  },
  bottomTray: {
    switchViewLabel: "切换地图",
    returnLabel: "返回上级",
    cloudOnLabel: "开启云雾",
    cloudOffLabel: "关闭云雾",
  },
})

export default globeViewConfig
