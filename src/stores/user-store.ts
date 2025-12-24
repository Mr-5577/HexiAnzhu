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
    const isFullScreen = ref<boolean>(false);

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

    const setFullScreen = (state: boolean) => {
      isFullScreen.value = state;
    };

    return {
      // 数据
      userInfo,
      token,
      isFullScreen,

      // 方法
      setUserInfo,
      setToken,
      clearUserInfo,
      setFullScreen,
    };
  },
  {
    persist: true, // 添加持久化配置
  }
);
