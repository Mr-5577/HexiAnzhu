import { RouteRecordRaw } from "vue-router";
import type { Component } from "vue";
import AdminLayout from "@/layouts/index.vue";
import type { BackendMenuItem } from "@/types/system/menu-type";
import { extractRouteItems, getFullRoutePath } from "@/utils/route-util";
import { independentRoutes } from "./independent-routes";

// 使用 glob 动态导入所有 Vue 组件
const modules = import.meta.glob("@/views/**/*.vue");

// 构建组件索引映射
const componentIndex = new Map<string, () => Promise<Component>>();
Object.entries(modules).forEach(([filePath, loader]) => {
  const path = filePath.replace(/^.*\/views\//, "").replace(/\.vue$/, "");
  componentIndex.set(path, loader);
  componentIndex.set(`/${path}`, loader);
});

/**
 * 根据组件路径获取组件加载器
 */
function getComponentByPath(componentPath?: string) {
  if (!componentPath) return undefined;
  const normalized = componentPath.replace(/^\/+/, "");
  const loader =
    componentIndex.get(normalized) || componentIndex.get(componentPath);
  if (!loader) {
    console.warn(`[动态路由] 未找到组件: ${componentPath}`);
    return undefined;
  }
  return loader;
}

/**
 * 将后端菜单数据转换为扁平化的路由配置
 */
export function transformMenuToRoutes(
  menuData: BackendMenuItem[],
): RouteRecordRaw[] {
  // 1. 提取所有路由项
  const routeItems = extractRouteItems(menuData);

  // 2. 去重：相同路径只保留第一个
  const routeMap = new Map<string, BackendMenuItem>();
  routeItems.forEach((item) => {
    if (item.path && !routeMap.has(item.path)) {
      routeMap.set(item.path, item);
    }
  });

  // 3. 生成 Layout 的子路由列表
  const layoutChildren: RouteRecordRaw[] = [];

  routeMap.forEach((item, path) => {
    const componentLoader = getComponentByPath(item.component);
    if (!componentLoader) return;

    // 移除首尾斜杠，使其成为相对路径
    const routePath = path.replace(/^\/|\/$/g, "");

    layoutChildren.push({
      path: routePath,
      name: item.name,
      component: componentLoader,
      meta: {
        title: item.meta?.title || item.title || "未知页面",
        icon: item.meta?.icon || item.icon || "",
        isKeepAlive: item.isKeepAlive ?? item.meta?.isKeepAlive ?? false,
        isVisible: item.isVisible ?? item.meta?.isVisible ?? true,
        isMultiOpen: item.isMultiOpen ?? item.meta?.isMultiOpen ?? false,
      },
    });
  });

  // 4. 构建最终路由
  const routes: RouteRecordRaw[] = [];

  // 如果有页面路由，添加 Layout 作为根路由
  if (layoutChildren.length > 0) {
    // 找到第一个可见的路由作为重定向
    const firstVisibleRoute = layoutChildren.find(
      (child) => child.meta?.isVisible !== false,
    );
    const defaultRedirect = firstVisibleRoute
      ? `/${firstVisibleRoute.path}`
      : "/";

    routes.push({
      path: "/",
      name: "Layout",
      component: AdminLayout,
      redirect: defaultRedirect,
      children: layoutChildren,
    });
  }

  // 5. 添加独立路由（登录页、404 等）
  independentRoutes.forEach((route) => {
    routes.push(route);
  });

  // 6. 添加 404 兜底路由
  routes.push({
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/404.vue"),
    meta: { title: "页面未找到", requiresAuth: false, hide: true },
  });

  return routes;
}

/**
 * 动态添加路由到路由器
 */
export async function addDynamicRoutes(
  router: any,
  menuData: BackendMenuItem[],
) {
  const dynamicRoutes = transformMenuToRoutes(menuData);

  dynamicRoutes.forEach((route) => {
    router.addRoute(route);
  });

  return dynamicRoutes;
}
