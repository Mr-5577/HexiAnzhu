export interface BackendMenuItem {
  id: number;
  type: string; // 'module' | 'menu' | 'button'
  name: string;
  path?: string;
  component?: string;
  pid?: number;
  sort: number;
  parentId: number;
  meta: {
    title: string;
    icon: string;
    keepAlive?: boolean;
    isVisible?: boolean;
    isMultiOpen?: boolean;
  };
  children?: BackendMenuItem[];
}

export interface SidebarMenuItem {
  index: string;
  title: string;
  path?: string;
  icon: string;
  isVisible?: boolean;
  children?: SidebarMenuItem[];
}

export interface ModuleItem {
  id: number;
  name: string;
  title: string;
  icon: string;
  sort: number;
}

export interface MenuItem {
  id: number;
  pid: number;
  name: string;
  title: string;
  icon: string;
  menuType: 0 | 1 | 2; // 0:菜单 1:按钮 2:权限按钮
  component?: string;
  path: string;
  isKeepAlive: boolean;
  isMuitlOpen: boolean;
  isControl: boolean;
  isVisible: boolean;
  sort: number;
  isDel: boolean;
  createId: number;
  children?: MenuItem[];
}

export interface MenuForm {
  id?: number;
  pid: number;
  name: string;
  title: string;
  icon: string;
  menuType: 0 | 1 | 2;
  component: string;
  path: string;
  isKeepAlive: boolean;
  isMuitlOpen: boolean;
  isControl: boolean;
  isVisible: boolean;
  sort: number;
}

