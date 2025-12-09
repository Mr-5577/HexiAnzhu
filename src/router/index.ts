import { useMenuStore } from "@/stores/menu-store";
import { fetchMenuData, transformMenuDataExact } from "@/utils/menu-util";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
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
  history: createWebHistory(import.meta.env.BASE_URL),
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
  console.log("路由切换:", from.path, "->", to.path);

  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  // 登录页直接放行
  if (to.path === "/login") {
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
        customClass: 'clean-loading',
      });
      // const exactData = await fetchMenuData();
      const menuData = await userApi.getUserMenuPowerList();
      // console.log("获取到菜单数据:", menuData);
      const exactData = transformMenuDataExact(menuData || []);
      // console.log("转换后的数据：", exactData);
      // 先清理动态路由
      cleanupDynamicRoutes();
      // 存储到store
      menuStore.setMenuData(exactData);
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
