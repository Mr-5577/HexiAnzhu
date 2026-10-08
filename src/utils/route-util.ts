import type { BackendMenuItem } from "@/types/system/menu-type";

// 使用 glob 动态导入所有 Vue 组件，用于检查组件是否存在
const modules = import.meta.glob("@/views/**/*.vue");

// 构建组件路径索引（用于快速查找）
const componentPathSet = new Set<string>();
Object.keys(modules).forEach((filePath) => {
  // 提取相对路径: /src/views/asset-management/inventory-detail.vue --> asset-management/inventory-detail
  const path = filePath.replace(/^.*\/views\//, "").replace(/\.vue$/, "");
  componentPathSet.add(path);
  componentPathSet.add(`/${path}`);
});

/**
 * 检查组件路径是否存在
 */
export function isComponentExists(componentPath?: string): boolean {
  if (!componentPath) return false;
  const normalized = componentPath.replace(/^\/+/, "");
  return componentPathSet.has(normalized) || componentPathSet.has(componentPath);
}

/**
 * 从菜单数据中提取所有可路由的菜单项（menuType === 1 且有 component）
 * @param menuData 原始菜单数据
 * @returns 扁平化的路由项列表
 */
export function extractRouteItems(menuData: BackendMenuItem[]): BackendMenuItem[] {
  const routeItems: BackendMenuItem[] = [];

  function traverse(items: BackendMenuItem[]) {
    for (const item of items) {
      // 修改：增加 isComponentExists 检查
      if (item.menuType === 1 && item.component && isComponentExists(item.component)) {
        routeItems.push(item);
      }
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  }

  traverse(menuData);
  return routeItems;
}

/**
 * 根据路径获取完整的路由路径（确保以 / 开头）
 */
export function getFullRoutePath(path?: string): string {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
}
