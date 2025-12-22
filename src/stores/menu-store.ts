import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { BackendMenuItem } from "@/types/menu-type";

export const useMenuStore = defineStore("menu-store", () => {
  const menuData = ref<BackendMenuItem[]>([]);
  const permissionList = ref<string[]>([]);

  // 将权限数组转换为对象映射，便于快速查找，{ 'menu:del': true }
  const permissions = computed(() => {
    return permissionList.value.reduce((acc, permission) => {
      acc[permission] = true;
      return acc;
    }, {} as Record<string, boolean>);
  });

  // 保存菜单数据
  const setMenuData = (data: BackendMenuItem[]) => {
    menuData.value = data;
  };

  // 清空菜单数据
  const clearMenuData = () => {
    menuData.value = [];
  };
  // 保存按钮权限列表
  const setPermissionData = (data: string[]) => {
    permissionList.value = data;
  };

  /**
   * 通用权限检查方法
   * @param permission - 权限字符串或权限字符串数组
   * @returns 布尔值，表示是否拥有权限
   * @description
   * - 如果传入空值，返回 true（表示不检查权限）
   * - 如果传入字符串，检查是否拥有该权限
   * - 如果传入数组，检查是否拥有数组中任意一个权限（OR 逻辑）
   * @example
   * // 检查单个权限
   * hasPermission('menu:add') // true/false
   * // 检查多个权限（满足任意一个即可）
   * hasPermission(['menu:add', 'menu:edit']) // true/false
   */
  const hasPermission = (permission: string | string[]): boolean => {
    // 空值处理：如果权限参数为空，默认返回 true（表示不限制）
    if (!permission) return true;
    // 数组类型处理：检查是否拥有数组中任意一个权限
    if (Array.isArray(permission)) {
      return permission.some((perm) => permissions.value[perm]);
    }
    // 字符串类型处理：检查是否拥有指定权限
    return !!permissions.value[permission];
  };

  /**
   * 检查是否拥有任意一个指定权限
   * @param permissionsToCheck - 需要检查的权限字符串数组
   * @returns 布尔值，表示是否拥有数组中任意一个权限
   * @description
   * - 检查是否拥有参数数组中任意一个权限（OR 逻辑）
   * - 如果数组为空，返回 false
   * @example
   * hasAnyPermission(['menu:add', 'menu:edit']) // true/false
   */
  const hasAnyPermission = (permissionsToCheck: string[]): boolean => {
    // 使用 some 方法，只要有一个权限存在就返回 true
    return permissionsToCheck.some((perm) => permissions.value[perm]);
  };

  /**
   * 检查是否拥有所有指定权限
   * @param permissionsToCheck - 需要检查的权限字符串数组
   * @returns 布尔值，表示是否拥有数组中的所有权限
   * @description
   * - 检查是否拥有参数数组中的所有权限（AND 逻辑）
   * - 如果数组为空，返回 true（空集合的逻辑与为真）
   * @example
   * hasAllPermissions(['menu:add', 'menu:edit', 'menu:delete']) // true/false
   */
  const hasAllPermissions = (permissionsToCheck: string[]): boolean => {
    // 使用 every 方法，所有权限都存在才返回 true
    return permissionsToCheck.every((perm) => permissions.value[perm]);
  };

  /**
   * 检查是否拥有指定权限（严格模式）
   * @param permission - 权限字符串
   * @returns 布尔值，表示是否拥有该权限
   * @description
   * - 与 hasPermission 的区别：不处理空值，不处理数组
   * - 仅用于检查单个权限，更严格的类型检查
   * @example
   * hasExactPermission('menu:add') // true/false
   */
  const hasExactPermission = (permission: string): boolean => {
    return !!permissions.value[permission];
  };

  return {
    // 状态
    menuData,
    permissionList,
    permissions,

    // Actions
    setMenuData,
    clearMenuData,
    setPermissionData,

    // 权限检查方法
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
});
