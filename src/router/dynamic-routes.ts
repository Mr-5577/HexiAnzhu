import { RouteRecordRaw } from "vue-router";
import AdminLayout from "@/layouts/index.vue";
import type { BackendMenuItem } from "@/types/menu-type";
import { extractAllMenus } from "@/utils/menu-util";

// 使用 glob 动态导入所有 Vue 组件
const modules = import.meta.glob("@/views/**/*.vue");

/**
 * 根据组件路径获取对应的组件
 */
function getComponent(componentPath?: string) {
  if (!componentPath) return undefined;

  // 构建搜索路径
  const searchPath = componentPath.replace(/\//g, "/");

  // 查找匹配的组件
  for (const [path, component] of Object.entries(modules)) {
    if (path.includes(searchPath)) {
      // console.log("找到组件:", path);
      return component;
    }
  }

  console.warn(`未找到组件: ${componentPath}`);
  return undefined;
}

/**
 * 将后端菜单数据转换为Vue路由配置
 */
export function transformMenuToRoutes(
  menuData: BackendMenuItem[]
): RouteRecordRaw[] {
  const allMenus = extractAllMenus(menuData);
  const routes: RouteRecordRaw[] = [];

  // console.log("allMenus", allMenus);

  // 找到所有顶级菜单
  const topLevelMenus = allMenus.filter((item) => item.pid === 0);
  // console.log("topLevelMenus", topLevelMenus);

  topLevelMenus.forEach((menu) => {
    // 使用完整路径作为路由路径
    const routePath = menu.path?.startsWith("/") ? menu.path : `/${menu.path}`;

    // 找到该菜单的所有子菜单
    const childMenus = allMenus.filter((item) => item.parentId === menu.id);

    // 如果菜单有子菜单，创建嵌套路由结构
    if (childMenus.length > 0) {
      const route: RouteRecordRaw = {
        path: routePath,
        name: menu.name,
        component: AdminLayout,
        meta: {
          title: menu.meta.title,
          icon: menu.meta.icon,
          requiresAuth: true,
          keepAlive: menu.meta.keepAlive || false,
          isVisible: menu.meta.isVisible || false,
          isMultiOpen: menu.meta.isMultiOpen || false,
        },
        children: [],
      };

      // 为每个子菜单创建路由
      childMenus.forEach((child) => {
        const childComponent = getComponent(child.component);

        if (childComponent) {
          // 计算子路由路径（相对于父路径）
          const childPath = child.path?.startsWith("/")
            ? child.path
            : `/${child.path}`;

          // 移除父路径前缀，得到相对路径
          const relativePath = childPath.replace(
            new RegExp(`^${routePath}/?`),
            ""
          );

          route.children!.push({
            path: relativePath || "", // 如果是空字符串表示index路由
            name: child.name,
            component: childComponent,
            meta: {
              title: child.meta.title,
              icon: child.meta.icon,
              requiresAuth: true,
              keepAlive: child.meta.keepAlive || false,
              isVisible: child.meta.isVisible || false,
              isMultiOpen: child.meta.isMultiOpen || false,
            },
          });
        }
      });

      // 设置重定向到第一个子路由
      if (route.children && route.children.length > 0) {
        const firstChild = route.children[0];
        route.redirect = { name: firstChild.name };
      }

      routes.push(route);
    } else {
      // 没有子菜单，创建单一路由
      const menuComponent = getComponent(menu.component);

      if (menuComponent) {
        const route: RouteRecordRaw = {
          path: routePath,
          name: menu.name,
          component: AdminLayout,
          meta: {
            title: menu.meta.title,
            icon: menu.meta.icon,
            requiresAuth: true,
            keepAlive: menu.meta.keepAlive || false,
            isVisible: menu.meta.isVisible || false,
            isMultiOpen: menu.meta.isMultiOpen || false,
          },
          children: [
            {
              path: "",
              name: `${menu.name}-page`,
              component: menuComponent,
              meta: {
                title: menu.meta.title,
                requiresAuth: true,
                keepAlive: menu.meta.keepAlive || false,
                isVisible: menu.meta.isVisible || false,
                isMultiOpen: menu.meta.isMultiOpen || false,
              },
            },
          ],
        };

        routes.push(route);
      }
    }
  });

  console.log("生成的路由配置:", routes);
  return routes;
}

/**
 * 添加动态路由到路由器
 */
export function addDynamicRoutes(router: any, menuData: BackendMenuItem[]) {
  const dynamicRoutes = transformMenuToRoutes(menuData);

  dynamicRoutes.forEach((route) => {
    router.addRoute(route);
  });

  // 添加404路由
  const notFoundRoute = {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/404.vue"),
    meta: { title: "页面未找到", requiresAuth: false, hide: true },
  };

  router.addRoute(notFoundRoute);

  return dynamicRoutes;
}
