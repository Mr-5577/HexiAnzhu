import { defineStore } from "pinia";
import { ref } from "vue";

interface UserInfo {
  isDel: boolean; // 是否删除
  id: number; // 员工ID
  mdUserId: number; // 用户ID
  empName: string; // 员工姓名（包含工号）
  empStatus: number; // 员工状态
  empNo: string; // 员工工号
  deptId: number; // 部门ID
  managerId: number; // 上级ID
  gender: boolean; // 性别（true: 男, false: 女）
  birthday: string; // 生日（字符串格式）
  cardNo: string; // 身份证号
  mobile: string; // 手机号
  email: string; // 邮箱
  sort: number; // 排序号
}

export const useUserStore = defineStore(
  "user-store",
  () => {
    const userInfo = ref<UserInfo | null>(null);
    const token = ref<string>("");
    const isFullScreen = ref<boolean>(false);
    const stateTag = ref<string>("");
    const isQueryFast = ref<boolean>(true); // 请求是否加速,初始值需要和大屏头部的加速字段值保持一致
    const empNo = ref('') // 员工工号

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

    const setFullScreen = (flag: boolean) => {
      isFullScreen.value = flag;
    };

    const setStateTag = (stateVal: string) => {
      stateTag.value = stateVal;
    };
    const setQueryFast = (state: boolean) => {
      isQueryFast.value = state;
    };
    const setEmpNo = (num: string) => {
      empNo.value = num;
    };

    return {
      // 数据
      userInfo,
      token,
      isFullScreen,
      stateTag,
      isQueryFast,
      empNo,

      // 方法
      setUserInfo,
      setToken,
      clearUserInfo,
      setFullScreen,
      setStateTag,
      setQueryFast,
      setEmpNo,
    };
  },
  {
    persist: true, // 添加持久化配置
  }
);
