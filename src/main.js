import { createApp } from "vue"
import router from "./router"
import store from "./store"
import directive from "./directive"
import App from "./App.vue"
import "normalize.css"
import "./style.css"

const app = createApp(App)

app.use(store)
app.use(router)
app.use(directive)

app.mount("#app")
