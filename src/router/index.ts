import { useMenuStore } from "@/stores/menu-store";
import {
  transformMenuDataExact,
  extractButtonPermissions,
} from "@/utils/menu-util";
import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  RouteRecordRaw,
} from "vue-router";
import { addDynamicRoutes } from "./dynamic-routes";
import { userApi } from "@/api/user-api";
import { ElLoading } from "element-plus";

// 静态路由（登录页等）
const staticRoutes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录",
      requiresAuth: false,
      hide: true,
      keepAlive: false, // 登录页不需要缓存
    },
  },
  {
    path: "/test",
    name: "test",
    component: () => import("@/views/test.vue"),
    meta: {
      title: "测试",
      keepAlive: false,
    },
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/404.vue"),
    meta: {
      title: "页面不存在",
      requiresAuth: false,
      hide: true,
      keepAlive: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // history模式
  // history: createWebHashHistory(import.meta.env.BASE_URL), // hash模式
  routes: staticRoutes,
});

// 在路由守卫开始添加一个全局清理函数
const cleanupDynamicRoutes = () => {
  // 获取所有路由
  const routes = router.getRoutes();

  // 找出动态路由（根据你的路由特征，比如meta中的标记）
  routes.forEach((route: any) => {
    // 只删除有名称且不是静态路由的路由
    if (route.name && route.name !== "login" && route.name !== "404") {
      router.removeRoute(route.name);
    }
  });
};

let menuLoaded = false;
router.beforeEach(async (to, from, next) => {
  // console.log("路由切换:", from.path, "->", to.path);

  // 设置页面标题
  // if (to.meta.title) {
  //   document.title = to.meta.title as string;
  // }

  // 白名单
  const whiteList = ["/login", "/test"];
  if (whiteList.includes(to.path)) {
    next();
    return;
  }
  // 检查token是否存在
  const token = localStorage.getItem("token");
  if (!token) {
    next("/login");
    return;
  }

  const menuStore = useMenuStore();

  // 只需要这个判断：菜单没加载过，就加载一次
  if (!menuLoaded) {
    let loadingInstance = null;
    try {
      // console.log("加载菜单数据...");
      // 创建加载实例 - 全屏加载
      loadingInstance = ElLoading.service({
        lock: true,
        text: "正在加载数据，请稍候...",
        background: "rgba(255, 255, 255, 0.9)",
        spinner: "el-icon-loading",
        customClass: "clean-loading",
      });
      const menuData = await userApi.getUserMenuPowerList();
      // console.log("获取到菜单数据:", menuData);
      // 提取按钮权限
      const buttonPermission = extractButtonPermissions(menuData);
      console.log("权限列表:", buttonPermission);
      // 数据转换
      const exactData = transformMenuDataExact(menuData || []);
      // console.log("转换后的数据：", exactData);
      // 先清理动态路由
      cleanupDynamicRoutes();
      // 存储到store
      menuStore.setMenuData(exactData);
      menuStore.setpermissionData(buttonPermission);

      // 添加动态路由
      await addDynamicRoutes(router, exactData);
      // 标记为已加载
      menuLoaded = true;
      // 重新导航
      next({ ...to, replace: true });
      return;
    } catch (error) {
      console.error("加载菜单失败:", error);
      localStorage.removeItem("token");
      next("/login");
      return;
    } finally {
      // 关闭加载效果
      if (loadingInstance) {
        loadingInstance.close();
      }
    }
  }

  // 菜单已加载，直接放行
  next();
});

export default router;
