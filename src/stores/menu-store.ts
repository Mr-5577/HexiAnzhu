import { ref } from "vue";
import { defineStore } from "pinia";
import { BackendMenuItem } from "@/types/menu-type";

export const useMenuStore = defineStore("menu-store", () => {
  const menuData = ref<BackendMenuItem[]>([]);

  const setMenuData = (data: BackendMenuItem[]) => {
    menuData.value = data;
  };
  const clearMenuData = () => {
    menuData.value = [];
  };

  return {
    // 状态
    menuData,

    // Actions
    setMenuData,
    clearMenuData,
  };
});
