import { ref } from "vue";
import { defineStore } from "pinia";
import { BackendMenuItem } from "@/types/menu-type";

export const useMenuStore = defineStore("menu-store", () => {
  const menuData = ref<BackendMenuItem[]>([]);
  const permissionList = ref<string[]>([]);

  const setMenuData = (data: BackendMenuItem[]) => {
    menuData.value = data;
  };
  const clearMenuData = () => {
    menuData.value = [];
  };
  const setpermissionData = (data: string[]) => {
    permissionList.value = data;
  };

  return {
    // 状态
    menuData,
    permissionList,

    // Actions
    setMenuData,
    clearMenuData,
    setpermissionData,
  };
});
