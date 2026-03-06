export interface BackendMenuItem {
  id: number;
  type: string; // 'module' | 'menu' | 'button'
  name: string;
  title: string;
  icon: string;
  menuType: number;
  path?: string;
  component?: string;
  isKeepAlive: boolean;
  isMultiOpen: boolean;
  isControl: boolean;
  isVisible: boolean;
  pid?: number;
  sort: number;
  isDel:boolean;
  parentId: number;
  createId: number;
  meta: {
    title: string;
    icon: string;
    isKeepAlive?: boolean;
    isMultiOpen?: boolean;
    isControl?: boolean;
    isVisible?: boolean;
    isDel:boolean;
    createId: number;
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
  pid: number; // 上级菜单ID
  name: string; // 菜单名称(英文且唯一)
  title: string; // 菜单标题(中文)
  icon?: string; // 图标
  menuType: 0 | 1 | 2; // 菜单类型:0-模块;1-菜单;2-按钮
  component?: string; // 组件位置
  path: string; // 菜单路由
  sort: number; // 排序
  isInner?: boolean; // 是否内置
  isKeepAlive?: boolean; // 是否缓存
  isMultiOpen?: boolean; // 是否多开
  isControl?: boolean; // 是否受控
  isVisible?: boolean; // 是否可见
  isDel?: boolean; // 是否删除
  createId?: number; // 创建人
  createDate?: any; // 创建时间
  operId?: number; // 操作人
  operDate?: any; // 操作时间
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
  isMultiOpen: boolean;
  isControl: boolean;
  isVisible: boolean;
  sort: number;
}

