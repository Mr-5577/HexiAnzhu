import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./assets/styles/index.scss";
import "./assets/styles/button-theme.scss";
import zhCn from "element-plus/es/locale/lang/zh-cn";

import App from "./App.vue";
import BaseTable from "@/components/base/base-table.vue";
// 路由
import router from "./router";
// 引入状态管理
import pinia from "./stores";
// 引入ElementPlus图标
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
// 权限指令
import { setupPermission } from "./directives/permission";

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
setupPermission(app);
// 全局注册 BaseTable 组件
app.component("BaseTable", BaseTable);
app.mount("#app");
