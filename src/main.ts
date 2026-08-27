import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./assets/styles/variables.scss";  // CSS变量定义（必须最先导入）
import "./assets/styles/element-override.scss"; // Element Plus样式覆盖
import "./assets/styles/global.css"; 
import zhCn from "element-plus/es/locale/lang/zh-cn";

// ===== 引入 vxe-table 和 vxe-pc-ui =====
import VxeTable from 'vxe-table'
import VxePcUI from 'vxe-pc-ui'
import 'vxe-table/lib/style.css'
import 'vxe-pc-ui/lib/style.css'

import App from "./App.vue";
// 基础表格组件
import BaseTable from "@/components/base/base-table.vue";
// 项目树组件
import ProjectTreeSelector from "@/components/business/project-tree-selector.vue";
import SelectWithAll from "@/components/base/base-select-with-all.vue"; //下拉多选框
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
app.use(VxeTable)  // 注册 vxe-
app.use(VxePcUI) // 注册 vxe-pc-ui
setupPermission(app);
// 全局注册 BaseTable 组件
app.component("BaseTable", BaseTable);
app.component("ProjectTreeSelector", ProjectTreeSelector);
app.component("SelectWithAll", SelectWithAll);
app.mount("#app");
