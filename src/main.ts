import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./assets/styles/index.scss";
import './assets/styles/button-theme.scss'
import zhCn from "element-plus/es/locale/lang/zh-cn";

import App from "./App.vue";
// 路由
import router from "./router";
// 引入状态管理
import pinia from "./stores";

import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const app = createApp(App);

// 全局注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(pinia);
app.use(router);
app.use(ElementPlus, {
  locale: zhCn,
});

app.mount("#app");
