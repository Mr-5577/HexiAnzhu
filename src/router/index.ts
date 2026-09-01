import { useMenuStore } from "@/stores/menu-store";
import { transformMenuDataExact, extractButtonPermissions } from "@/utils/menu-util";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { addDynamicRoutes } from "./dynamic-routes";
import { userApi } from "@/api/system/user-api";
import { ElLoading } from "element-plus";
import { useTagsStore } from "@/stores/tags-store";

// 静态路由名称常量
const STATIC_ROUTE_NAMES = new Set([
  "login", "404", "403", "resetPassword", "autoLogin", "scanLogin", "oaLogin"
]);

// 静态路由
const staticRoutes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录", requiresAuth: false, hide: true, isKeepAlive: false },
  },
  {
    path: "/autoLogin",
    name: "autoLogin",
    component: () => import("@/views/login/auto-login.vue"),
    meta: { title: "外部登录" },
  },
  {
    path: "/scanLogin",
    name: "scanLogin",
    component: () => import("@/views/login/scan-login.vue"),
    meta: { title: "扫码登录" },
  },
  {
    path: "/oaLogin",
    name: "oaLogin",
    component: () => import("@/views/login/oa-login.vue"),
    meta: { title: "OA登录" },
  },
  {
    path: "/reset-password",
    name: "resetPassword",
    component: () => import("@/views/login/reset-password.vue"),
    meta: { title: "重置密码" },
  },
  {
    path: "/403",
    name: "403",
    component: () => import("@/views/403.vue"),
    meta: { title: "无访问权限", requiresAuth: false, hide: true },
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/404.vue"),
    meta: { title: "页面不存在", requiresAuth: false, hide: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: staticRoutes,
});

// 清理动态路由
const cleanupDynamicRoutes = () => {
  const routes = router.getRoutes();
  routes.forEach(route => {
    if (route.name && !STATIC_ROUTE_NAMES.has(route.name as string)) {
      router.removeRoute(route.name);
    }
  });
};

let menuLoaded = false;

const isPasswordExpired = () => localStorage.getItem("accountNonExpired") === "false";

const whiteListPaths = ["/login", "/autoLogin", "/scanLogin", "/oaLogin", "/403", "/404", "/reset-password"];

router.beforeEach(async (to, from, next) => {
  // 白名单直接放行
  if (whiteListPaths.includes(to.path.toLowerCase())) {
    next();
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    next("/login");
    return;
  }

  if (isPasswordExpired()) {
    next("/reset-password");
    return;
  }

  const menuStore = useMenuStore();

  // 菜单未加载，加载数据并添加动态路由
  if (!menuLoaded) {
    let loadingInstance = null;
    try {
      loadingInstance = ElLoading.service({
        lock: true,
        text: "正在加载数据，请稍候...",
        background: "rgba(255, 255, 255, 0.9)",
      });

      const res = await userApi.getUserMenuPowerList();
      if (res.code === 200) {
        const menuData = res.data || [];
        
        // 提取按钮权限
        const buttonPermission = extractButtonPermissions(menuData);
        
        // 转换菜单数据（用于展示）
        const exactData = transformMenuDataExact(menuData);
        
        // 存储到 store
        menuStore.setMenuData(exactData);
        menuStore.setPermissionData(buttonPermission);

        // 清理旧动态路由
        cleanupDynamicRoutes();
        
        // 添加新动态路由
        await addDynamicRoutes(router, exactData);
        
        menuLoaded = true;

        // 菜单为空则跳转 403
        if (exactData.length === 0) {
          next("/403");
          return;
        }

        // 重新导航到目标路由
        next({ ...to, replace: true });
        return;
      }
    } catch (error) {
      console.error("加载菜单失败:", error);
      localStorage.removeItem("token");
      next("/login");
    } finally {
      if (loadingInstance) {
        loadingInstance.close();
      }
    }
    return;
  }

  next();
});

router.afterEach((to) => {
  const tagsStore = useTagsStore();
  if (to.fullPath && to.fullPath !== "/") {
    const index = tagsStore.historyStack.indexOf(to.fullPath);
    if (index === -1) {
      tagsStore.addHistory(to.fullPath);
    } else {
      tagsStore.historyStack.splice(index, 1);
      tagsStore.historyStack.push(to.fullPath);
    }
  }
});

export default router;