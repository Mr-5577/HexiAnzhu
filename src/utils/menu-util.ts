import type {
  BackendMenuItem,
  SidebarMenuItem,
  ModuleItem,
} from "@/types/menu-type";

/**
 * 提取模块数据（用于header显示）
 */
export function extractModules(menuData: BackendMenuItem[]): ModuleItem[] {
  return menuData
    .filter((item) => item.type === "module")
    .map((module) => ({
      id: module.id,
      name: module.name,
      title: module.meta.title,
      icon: module.meta.icon,
      sort: module.sort,
    }))
    .sort((a, b) => a.sort - b.sort);
}

/**
 * 提取所有菜单数据（用于生成路由和侧边栏）
 */
export function extractAllMenus(
  menuData: BackendMenuItem[]
): BackendMenuItem[] {
  const allMenus: BackendMenuItem[] = [];

  const extractMenus = (items: BackendMenuItem[]) => {
    items.forEach((item) => {
      if (item.type === "menu") {
        allMenus.push(item);
      }
      if (item.children) {
        extractMenus(item.children);
      }
    });
  };

  menuData.forEach((module) => {
    if (module.children) {
      extractMenus(module.children);
    }
  });

  return allMenus;
}

/**
 * 根据模块ID获取该模块下的侧边栏菜单
 */
export function getSidebarMenuByModule(
  menuData: BackendMenuItem[],
  moduleId: number
): SidebarMenuItem[] {
  // console.log("根据模块ID获取该模块下的侧边栏菜单", menuData, moduleId);
  const module = menuData.find(
    (item) => item.id === moduleId && item.type === "module"
  );
  if (!module || !module.children) return [];

  return transformMenuToSidebar(module.children);
}

/**
 * 将菜单数据转换为侧边栏格式,过滤掉isVisible为false的菜单
 */
function transformMenuToSidebar(
  menuData: BackendMenuItem[]
): SidebarMenuItem[] {
  const buildMenuItems = (items: BackendMenuItem[]): SidebarMenuItem[] => {
    const result: SidebarMenuItem[] = [];
    items.forEach((item) => {
      // 过滤掉不显示的菜单(比如详情页面等等)
      // if (item.meta.isVisible) {
      //   return;
      // }

      const currentPath = item.path
        ? item.path.startsWith("/")
          ? item.path
          : `/${item.path}`
        : undefined;

      const menuItem: SidebarMenuItem = {
        index: currentPath || `menu-${item.id}`,
        title: item.meta.title,
        path: currentPath,
        icon: item.meta.icon,
        isVisible: item.meta.isVisible || false,
      };

      // 如果有子菜单，递归处理
      if (item.children && item.children.length > 0) {
        menuItem.children = buildMenuItems(item.children);
      }

      result.push(menuItem);
    });
    return result;
  };
  // console.log("buildMenuItems(menuData)", buildMenuItems(menuData));
  return buildMenuItems(menuData);
}

/**
 * 获取模块下的第一个可跳转路由路径
 */
export function getFirstRoutePath(
  menuData: BackendMenuItem[],
  moduleId: number
): string | null {
  const module = menuData.find(
    (item) => item.id === moduleId && item.type === "module"
  );
  if (!module || !module.children) return null;

  // 递归查找第一个有path的菜单项
  const findFirstPath = (items: BackendMenuItem[]): string | null => {
    for (const item of items) {
      if (item.path && item.type === "menu") {
        // return `/${item.path}`;
        // 直接返回完整路径
        return item.path.startsWith("/") ? item.path : `/${item.path}`;
      }
      if (item.children && item.children.length > 0) {
        const path = findFirstPath(item.children);
        if (path) return path;
      }
    }
    return null;
  };

  return findFirstPath(module.children);
}

/**
 * @name 把菜单数据转换为需要的格式
 * @param originalData 源数据
 * @returns
 */
export function transformMenuDataExact(originalData: any) {
  if (originalData && originalData.length == 0) return [];
  // 先找到所有顶级模块（menuType === 0）menuType:0模块   1菜单   2按钮
  // const topModules = originalData.filter((node: any) => node.menuType === 0);

  // 过滤出可见的顶级模块
  const topModules = originalData.filter(
    (node: any) => node.menuType === 0 && node.isVisible
  );

  const result: any = [];
  topModules.forEach((module: any) => {
    // 构建模块节点
    const moduleNode = {
      id: module.id,
      pid: module.pid,
      type: "module",
      name: module.name,
      sort: module.sort,
      parentId: 0,
      meta: {
        title: module.title,
        icon: module.icon,
      },
      children: [],
    };

    // 处理模块的子节点
    if (module.children && module.children.length > 0) {
      // 递归处理子节点，但需要调整parentId指向
      function processChildren(children: any, parentId: any, pid?: any) {
        return children
          .filter((child: any) => child.menuType === 1) // 只保留菜单类型
          .map((child: any) => {
            const childNode = {
              id: child.id,
              type: "menu",
              pid: pid,
              name: child.name,
              path: child.path,
              sort: child.sort,
              parentId: parentId,
              meta: {
                title: child.title,
                icon: child.icon,
              },
            };

            // 添加component、isKeepAlive、isVisible、isMultiOpen
            if (child.component) {
              (childNode as any).component = child.component;
            }
            if (child.isKeepAlive) {
              (childNode.meta as any).isKeepAlive = true;
            }
            if (child.isVisible) {
              (childNode.meta as any).isVisible = true;
            }
            if (child.isMultiOpen) {
              (childNode.meta as any).isMultiOpen = true;
            }

            // 递归处理子菜单
            if (child.children && child.children.length > 0) {
              const validGrandChildren = child.children.filter(
                (gc: any) => gc.menuType === 1
              );
              if (validGrandChildren.length > 0) {
                (childNode as any).children = processChildren(
                  validGrandChildren,
                  childNode.id
                );
              }
            }

            return childNode;
          });
      }

      moduleNode.children = processChildren(
        module.children,
        moduleNode.id,
        moduleNode.pid
      );
    }

    result.push(moduleNode);
  });

  return result;
}

// 从路由菜单数据中提取按钮权限
export function extractButtonPermissions(menuData: any[]): string[] {
  const permissions: string[] = [];
  function traverse(menus: any[]) {
    menus.forEach((menu) => {
      if (menu.menuType === 2) {
        // 按钮类型
        permissions.push(menu.name);
      }
      if (menu.children && menu.children.length > 0) {
        traverse(menu.children);
      }
    });
  }
  traverse(menuData);
  return permissions;
}
