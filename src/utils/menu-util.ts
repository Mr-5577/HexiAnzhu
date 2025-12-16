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
  const topModules = originalData.filter(
    (node: { menuType: number }) => node.menuType === 0
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

            // 添加component、keepAlive、isVisible、isMultiOpen
            if (child.component) {
              (childNode as any).component = child.component;
            }
            if (child.isKeepAlive) {
              (childNode.meta as any).keepAlive = true;
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

/**
 * 模拟获取菜单数据的函数
 */
export async function fetchMenuData(): Promise<BackendMenuItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 0,
          type: "module",
          name: "dashboard",
          sort: 0,
          parentId: 0,
          pid: 0,
          meta: {
            title: "工作台",
            icon: "DataBoard",
          },
          children: [
            {
              id: 1,
              type: "menu",
              name: "home",
              path: "home",
              component: "home/index",
              sort: 1,
              parentId: 0,
              pid: 0,
              meta: {
                title: "首页",
                icon: "HomeFilled",
                keepAlive: true,
              },
            },
          ],
        },
        {
          id: 2,
          type: "module",
          name: "dashboard-analysis",
          sort: 1,
          parentId: 0,
          pid: 0,
          meta: {
            title: "大屏分析",
            icon: "Monitor",
          },
          children: [
            {
              id: 3,
              type: "menu",
              name: "sales-analysis",
              path: "sales-analysis",
              sort: 1,
              parentId: 0,
              pid: 0,
              meta: {
                title: "销售分析",
                icon: "Monitor",
              },
              children: [
                {
                  id: 4,
                  type: "menu",
                  name: "large-screen",
                  path: "sales-analysis/large-screen",
                  component: "sales-analysis/large-screen",
                  sort: 1,
                  parentId: 3,
                  pid: 3,
                  meta: {
                    title: "销售战略大屏",
                    icon: "Monitor",
                    keepAlive: true,
                  },
                },
              ],
            },
          ],
        },
        {
          id: 5,
          type: "module",
          name: "sales",
          sort: 2,
          parentId: 0,
          pid: 0,
          meta: {
            title: "销售管理",
            icon: "Monitor",
          },
          children: [
            {
              id: 6,
              type: "menu",
              name: "task-management",
              path: "task-management",
              sort: 1,
              parentId: 0,
              pid: 0,
              meta: {
                title: "业绩任务",
                icon: "Monitor",
              },
              children: [
                {
                  id: 7,
                  type: "menu",
                  name: "annual-task",
                  path: "task-management/annual-task",
                  component: "task-management/annual-task",
                  sort: 1,
                  parentId: 6,
                  pid: 6,
                  meta: {
                    title: "年度任务",
                    icon: "Calendar",
                    keepAlive: true,
                  },
                },
                {
                  id: 71,
                  type: "menu",
                  name: "annual-task-detail",
                  path: "task-management/annual-task-detail",
                  component: "task-management/detail",
                  sort: 1,
                  parentId: 6,
                  pid: 6,
                  meta: {
                    title: "年度任务详情",
                    icon: "Calendar",
                    keepAlive: true, // 是否页面缓存
                    isVisible: true, // 是否隐藏
                    isMultiOpen: true, // 是否多开
                  },
                },
                {
                  id: 8,
                  type: "menu",
                  name: "month-task",
                  path: "task-management/month-task",
                  component: "task-management/month-task",
                  sort: 2,
                  parentId: 6,
                  pid: 6,
                  meta: {
                    title: "月度任务",
                    icon: "Date",
                    keepAlive: true,
                  },
                },
              ],
            },
          ],
        },
        // {
        //   id: 9,
        //   type: "module",
        //   name: "finance",
        //   sort: 3,
        //   parentId: 0,
        //   pid: 0,
        //   meta: {
        //     title: "财务管理",
        //     icon: "Money",
        //   },
        //   children: [
        //     {
        //       id: 10,
        //       type: "menu",
        //       name: "report",
        //       path: "finance/report",
        //       component: "finance-management/report",
        //       sort: 1,
        //       parentId: 0,
        //       pid: 0,
        //       meta: {
        //         title: "财务报表",
        //         icon: "Document",
        //         keepAlive: true,
        //       },
        //     },
        //   ],
        // },
        {
          id: 11,
          type: "module",
          name: "system",
          sort: 3,
          parentId: 0,
          pid: 0,
          meta: {
            title: "系统管理",
            icon: "Setting",
          },
          children: [
            {
              id: 10,
              type: "menu",
              name: "role",
              path: "system/role",
              component: "system/role/index",
              sort: 1,
              parentId: 0,
              pid: 0,
              meta: {
                title: "角色管理",
                icon: "Document",
                keepAlive: true,
              },
            },
            {
              id: 101,
              type: "menu",
              name: "user",
              path: "system/user",
              component: "system/user/index",
              sort: 1,
              parentId: 0,
              pid: 0,
              meta: {
                title: "个人中心",
                icon: "Document",
              },
            },
          ],
        },
      ]);
    }, 100);
  });
}
