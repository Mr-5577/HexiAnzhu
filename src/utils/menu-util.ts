import type {
  BackendMenuItem,
  SidebarMenuItem,
  ModuleItem,
} from "@/types/system/menu-type";

/**
 * 提取模块数据（用于顶部导航）
 */
export function extractModules(menuData: BackendMenuItem[]): ModuleItem[] {
  return menuData
    .filter((item) => item.menuType === 0) // menuType: 0 表示模块
    .map((module) => ({
      id: module.id,
      name: module.name,
      title: module.meta?.title || module.title || "",
      icon: module.meta?.icon || module.icon || "",
      sort: module.sort || 0,
    }))
    .sort((a, b) => a.sort - b.sort);
}

/**
 * 根据模块 ID 获取侧边栏菜单
 */
export function getSidebarMenuByModule(
  menuData: BackendMenuItem[],
  moduleId: number,
): SidebarMenuItem[] {
  const module = menuData.find(
    (item) => item.id === moduleId && item.menuType === 0,
  );
  if (!module || !module.children) return [];

  return transformToSidebarMenu(module.children);
}

/**
 * 递归转换菜单数据为侧边栏格式
 * 只处理 menuType === 1 的菜单项，过滤掉按钮 (menuType === 2)
 * 注意：如果子菜单全部不可见，该菜单项不显示子菜单箭头
 */
function transformToSidebarMenu(items: BackendMenuItem[]): SidebarMenuItem[] {
  const result: SidebarMenuItem[] = [];

  for (const item of items) {
    // 跳过按钮类型
    if (item.menuType === 2) continue;

    const menuItem: SidebarMenuItem = {
      index: item.path
        ? `/${item.path.replace(/^\/+/, "")}`
        : `menu-${item.id}`,
      title: item.meta?.title || item.title || "",
      name: item.name,
      path: item.path ? `/${item.path.replace(/^\/+/, "")}` : undefined,
      icon: item.meta?.icon || item.icon || "",
      isVisible: item.isVisible ?? item.meta?.isVisible ?? true,
    };

    // 递归处理子菜单
    if (item.children && item.children.length > 0) {
      const childMenus = transformToSidebarMenu(item.children);
      // 只保留有可见子菜单的项，或者子菜单本身可见的项
      const visibleChildren = childMenus.filter(
        (child) => child.isVisible !== false,
      );
      if (visibleChildren.length > 0) {
        menuItem.children = visibleChildren;
      } else {
        // 如果没有可见的子菜单，不设置 children，避免显示箭头
        delete menuItem.children;
      }
    }

    result.push(menuItem);
  }

  return result;
}

/**
 * 获取模块下的第一个可跳转路由路径
 * 深度优先遍历，返回第一个有 component 且可见的叶子节点
 */
export function getFirstRoutePath(
  menuData: BackendMenuItem[],
  moduleId: number,
): string | null {
  const module = menuData.find(
    (item) => item.id === moduleId && item.menuType === 0,
  );

  if (!module || !module.children) {
    console.warn(`[getFirstRoutePath] 未找到模块 ID: ${moduleId}`);
    return null;
  }

  // 深度优先遍历
  const dfs = (items: BackendMenuItem[]): BackendMenuItem | null => {
    for (const item of items) {
      // 跳过按钮和不可见的项
      if (item.menuType === 2 || item.isVisible === false) continue;

      // 优先遍历子菜单（深度优先）
      if (item.children && item.children.length > 0) {
        const found = dfs(item.children);
        if (found) return found;
      }

      // 如果当前项有 component 和 path，返回它
      // 注意：这里会在遍历完所有子菜单后执行
      // 意味着：如果子菜单有可见页面，会先返回子菜单的；否则返回当前项
      if (item.component && item.path) {
        return item;
      }
    }
    return null;
  };

  const result = dfs(module.children);

  if (result) {
    const fullPath = result.path.startsWith("/")
      ? result.path
      : `/${result.path}`;
    console.log(`[getFirstRoutePath] 找到路径: ${fullPath} (${result.title})`);
    return fullPath;
  }

  console.warn(`[getFirstRoutePath] 模块 ${module.title} 下没有可访问的页面`);
  return null;
}

/**
 * 转换原始菜单数据为前端格式
 */
export function transformMenuDataExact(originalData: any[]): BackendMenuItem[] {
  if (!originalData || originalData.length === 0) return [];

  // 只处理 menuType === 0 且可见的顶级模块
  const topModules = originalData.filter(
    (node: any) => node.menuType === 0 && node.isVisible !== false,
  );

  const result: BackendMenuItem[] = [];

  topModules.forEach((module: any) => {
    const moduleNode: any = {
      id: module.id,
      menuType: 0,
      name: module.name,
      title: module.title,
      icon: module.icon,
      sort: module.sort || 0,
      pid: module.pid || 0,
      parentId: 0,
      isVisible: module.isVisible !== false,
      isKeepAlive: module.isKeepAlive || false,
      isMultiOpen: module.isMultiOpen || false,
      isControl: module.isControl || false,
      isDel: module.isDel || false,
      createId: module.createId || 0,
      meta: {
        title: module.title,
        icon: module.icon,
        isKeepAlive: module.isKeepAlive || false,
        isMultiOpen: module.isMultiOpen || false,
        isControl: module.isControl || false,
        isVisible: module.isVisible !== false,
        isDel: module.isDel || false,
        createId: module.createId || 0,
      },
      children: [],
    };

    // 处理子菜单
    if (module.children && module.children.length > 0) {
      moduleNode.children = processChildren(module.children, moduleNode.id);
    }

    result.push(moduleNode);
  });

  return result;
}

/**
 * 递归处理子菜单（只处理 menuType === 1 的菜单项）
 */
function processChildren(children: any[], parentId: number): BackendMenuItem[] {
  return children
    .filter((child: any) => child.menuType === 1) // 只保留菜单类型
    .map((child: any) => {
      const childNode: any = {
        id: child.id,
        menuType: 1,
        name: child.name,
        title: child.title,
        icon: child.icon || "",
        path: child.path || "",
        component: child.component || "",
        sort: child.sort || 0,
        pid: child.pid || parentId,
        parentId: parentId,
        isVisible: child.isVisible !== false,
        isKeepAlive: child.isKeepAlive || false,
        isMultiOpen: child.isMultiOpen || false,
        isControl: child.isControl || false,
        isDel: child.isDel || false,
        createId: child.createId || 0,
        meta: {
          title: child.title,
          icon: child.icon || "",
          isKeepAlive: child.isKeepAlive || false,
          isMultiOpen: child.isMultiOpen || false,
          isControl: child.isControl || false,
          isVisible: child.isVisible !== false,
          isDel: child.isDel || false,
          createId: child.createId || 0,
        },
        children: [],
      };

      // 递归处理子菜单
      if (child.children && child.children.length > 0) {
        const grandChildren = child.children.filter(
          (gc: any) => gc.menuType === 1,
        );
        if (grandChildren.length > 0) {
          childNode.children = processChildren(grandChildren, childNode.id);
        }
      }

      return childNode;
    });
}

/**
 * 提取按钮权限列表
 */
export function extractButtonPermissions(menuData: any[]): string[] {
  const permissions: string[] = [];

  function traverse(items: any[]) {
    for (const item of items) {
      if (item.menuType === 2) {
        permissions.push(item.name);
      }
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  }

  traverse(menuData);
  return permissions;
}
