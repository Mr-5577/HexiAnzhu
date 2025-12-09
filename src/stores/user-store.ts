import { defineStore } from "pinia";
import { ref } from "vue";

interface UserInfo {
  id: number;
  name: string;
  email: string;
}

export const useUserStore = defineStore(
  "user-store",
  () => {
    const userInfo = ref<UserInfo | null>(null);
    const token = ref<string>("");

    const setUserInfo = (info: UserInfo) => {
      userInfo.value = info;
    };

    const setToken = (newToken: string) => {
      token.value = newToken;
    };

    const clearUserInfo = () => {
      userInfo.value = null;
      token.value = "";
    };

    return {
      userInfo,
      token,
      setUserInfo,
      setToken,
      clearUserInfo,
    };
  },
  {
    persist: true, // 添加持久化配置
  }
);
