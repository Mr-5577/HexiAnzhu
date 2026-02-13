<!-- 外部登录页面逻辑处理 -->
<template>
  <div class="auto-login-page">
    <div v-if="loading" class="loading-container">
      <span>正在处理登录...</span>
    </div>
    <div v-else-if="errorMessage" class="error-container">
      <span class="error-message">{{ errorMessage }}</span>
      <!-- 失败信息 -->
      <!-- <el-popover placement="top" width="800" trigger="click">
        <template #default>
          <div class="error-info">
            <div>token信息：{{ tokenInfo }}</div>
            <div>state信息：{{ stateInfo }}</div>
            <div>error信息：{{ errorInfo }}</div>
            <div>storedState信息：{{ userStore.stateTag }}</div>
            <div>routeQuery信息：{{ routeInfo }}</div>
            <div>URL信息：{{ urlInfo }}</div>
            <div>currentTokenInfo信息：{{ currentTokenInfo }}</div>
          </div>
        </template>
        <template #reference>
          <el-button>查看失败信息</el-button>
        </template>
      </el-popover> -->
      <!-- <button class="retry-btn" @click="handleRetry">重试</button> -->
    </div>
    <!-- 测试显示信息 -->
    <div v-show="stateInfo === 'print'">
      <div>token：{{ tokenInfo }}</div>
      <div>state：{{ stateInfo }}</div>
      <div>error：{{ errorInfo }}</div>
      <div>storedState{{ userStore.stateTag }}</div>
      <div>routeQuery：{{ routeInfo }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userApi } from "@/api/user-api";
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { useUserStore } from "@/stores/user-store";
import { ElMessage } from "element-plus";

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const errorMessage = ref("");

// 用于展示查看错误信息
const routeInfo = ref<any>("");
const tokenInfo = ref("");
const stateInfo = ref("");
const errorInfo = ref("");
const urlInfo = ref("");
const currentTokenInfo = ref("");

// 防止重复处理标志
let isProcessing = false;
// 组件是否已卸载
let isUnmounted = false;

// 安全获取查询参数
const getQueryParam = (param: string | string[] | undefined): string => {
  if (!param) return "";
  return Array.isArray(param) ? param[0] || "" : param;
};

// 检查组件是否已卸载
const checkIfUnmounted = () => {
  if (isUnmounted) {
    throw new Error("COMPONENT_UNMOUNTED");
  }
};

// 处理重定向到认证页面
const redirectToAuth = async () => {
  console.log("进入重定向到认证页面逻辑");
  checkIfUnmounted();
  try {
    // 缓存stateTag
    const validState = uuidv4();
    // const validState = "07504c6c-2303-4cac-be57-3bd96e309d4c";
    userStore.setStateTag(validState);
    console.log("生成新的stateTag:", validState);
    // 获取认证地址回调
    const res = await userApi.getAuthRedirectUrl({ state: validState });
    checkIfUnmounted();

    if (res.code === 200 && res.data) {
      console.log("获取到认证地址，开始重定向:", res.data);

      // 显示跳转提示
      ElMessage.info("正在跳转到认证页面...");
      // ElMessage.info({
      //   message: `正在跳转到认证页面...<br/>${res.data}`,
      //   dangerouslyUseHTMLString: true,
      //   duration: 100,
      // });

      // 短暂延迟让用户看到提示
      await new Promise((resolve) => setTimeout(resolve, 1000));

      checkIfUnmounted();

      // 标记即将跳转
      isUnmounted = true;

      // 跳转到认证页面
      window.location.href = res.data;
      // window.location.href = 'http://localhost:3000/autoLogin?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEzLCJ1c2VybmFtZSI6IjAwMDAxMyIsImlhdCI6MTc2NzA4NzcyNCwiZXhwIjoxNzY3MTc0MTI0fQ.GZKqFTu7eSW7D9S4Hssf7awb6Auz8yrVFTCFl0tRD6g&state=07504c6c-2303-4cac-be57-3bd96e309d4c';
      return;
    } else {
      ElMessage.error("获取认证地址失败！");
      throw new Error("获取认证地址失败");
    }
  } catch (err) {
    // 如果是组件卸载的错误，直接返回
    if (err.message === "COMPONENT_UNMOUNTED") {
      return;
    }
    // 重置处理标志
    isProcessing = false;
    // 显示错误消息
    if (!isUnmounted) {
      ElMessage.error("无法连接到认证服务！");
      console.error("重定向到认证页面失败:", err);
    }
    throw new Error("无法连接到认证服务");
  }
};
// 判断当前终端是PC还是移动端
const detectDeviceType = () => {
  const userAgent = navigator.userAgent;
  const screenWidth = window.screen.width;
  const touchPoints = navigator.maxTouchPoints || 0;

  // 判断条件优先级
  const isMobileUA =
    /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(userAgent);
  const isTabletUA = /Tablet|iPad/i.test(userAgent);
  const hasTouch = touchPoints > 0 || "ontouchstart" in window;

  if (isMobileUA && !isTabletUA) {
    return "mobile";
  } else if (
    isTabletUA ||
    (hasTouch && screenWidth >= 768 && screenWidth <= 1024)
  ) {
    return "tablet";
  } else {
    return "desktop";
  }
};

// 处理token验证和登录
const handleTokenLogin = async (token: string, stateParam: string) => {
  checkIfUnmounted();

  console.log("开始验证token和state", {
    token,
    stateParam,
    storedState: userStore.stateTag,
  });
  // 当 state 为 hxaz 时，直接跳转到首页
  if (stateParam === "hxaz") {
    // 存储token
    localStorage.setItem("token", token);
    // 清理state标记
    userStore.setStateTag("");
    // 显示成功提示
    ElMessage.success("登录成功，正在跳转...");
    // 短暂延迟让用户看到提示
    await new Promise((resolve) => setTimeout(resolve, 800));
    checkIfUnmounted();
    // 跳转到首页
    await router.replace("/home");
    return;
  }

  // 验证state参数，不匹配
  if (stateParam !== userStore.stateTag) {
    console.error("state验证失败:", {
      received: stateParam,
      expected: userStore.stateTag,
    });
    ElMessage.error("登录验证失败，请重新登录！");
    // 清除可能已存储的token
    localStorage.removeItem("token");
    // 清理state标记
    userStore.setStateTag("");
    throw new Error("登录验证失败，请重新登录");
  }

  // 存储token
  localStorage.setItem("token", token);
  // 清理state标记
  userStore.setStateTag("");
  console.log("token验证成功，存储token，清理state");
  // 显示成功提示
  ElMessage.success("登录成功，正在跳转...");
  // 短暂延迟让用户看到提示
  await new Promise((resolve) => setTimeout(resolve, 800));
  checkIfUnmounted();
  // 跳转到PC端首页
  await router.replace("/home");
  /**
   * 移动端和PC端共用一套自动登录逻辑
   * 这里需要判断终端设备是PC还是移动端
   */
  // const deviceType = detectDeviceType();
  // if (deviceType === "tablet" || deviceType === "mobile") {
  //   // 这里应该跳转到H5首页
  //   await router.replace("/home");
  // } else {
  //   // 跳转到PC端首页
  //   await router.replace("/home");
  // }
  // 这里的代码不会执行，因为页面已经跳转了
};

// 主处理逻辑
const handleRouteParams = async () => {
  // 防止重复处理
  if (isProcessing) return;
  isProcessing = true;

  try {
    checkIfUnmounted();

    loading.value = true;
    errorMessage.value = "";

    const query = route.query;
    const tokenParam = getQueryParam(query.token);
    const stateParam = getQueryParam(query.state);
    const errorParam = getQueryParam(query.error);

    console.log("路由参数:", {
      tokenParam,
      stateParam,
      errorParam,
      storedState: userStore.stateTag,
    });

    // 用于展示信息
    routeInfo.value = query;
    tokenInfo.value = tokenParam;
    stateInfo.value = stateParam;
    errorInfo.value = errorParam;

    // 情况1：如果有错误参数，直接显示
    if (errorParam) {
      errorMessage.value = `认证服务错误: ${errorParam}`;
      ElMessage.error(`认证错误: ${errorParam}`);
      return;
    }

    // 情况2：有token和state，进行登录验证
    if (tokenParam && stateParam) {
      console.log("有token和state，开始验证登录");
      await handleTokenLogin(tokenParam, stateParam);
      return;
    }

    // 情况3：首次访问，没有token但有state标记（可能是刷新页面）
    if (!tokenParam && userStore.stateTag) {
      console.log("等待token返回，已有stateTag:", userStore.stateTag);
      userStore.setStateTag("");
      // ElMessage.warning('state异常');
    }

    // 情况4：首次访问，没有token也没有state标记
    if (!tokenParam && !userStore.stateTag) {
      console.log("首次访问，开始重定向到认证页面");
      // 重定向到认证页面
      await redirectToAuth();
      return;
    }

    // 其他情况
    errorMessage.value = "无效的登录参数";
    ElMessage.error("无效的登录参数");
  } catch (err) {
    // 如果是"组件已卸载"错误，不处理
    if (err.message === "COMPONENT_UNMOUNTED") {
      return;
    }

    console.error("登录处理失败:", err);
    if (!isUnmounted) {
      errorMessage.value = err instanceof Error ? err.message : "登录处理失败";
    }
  } finally {
    if (!isUnmounted) {
      loading.value = false;
      isProcessing = false;
    }
  }
};

// 重试函数
const handleRetry = () => {
  console.log("用户点击重试");

  // 清理状态并重新处理
  errorMessage.value = "";
  userStore.setStateTag("");
  isProcessing = false;

  handleRouteParams();
};

const handleCancel = () => {};
onMounted(() => {
  console.log("终端类型", detectDeviceType());
  console.log("自动登录页面挂载");
  urlInfo.value = window.location.href;
  handleRouteParams();
});

onUnmounted(() => {
  console.log("自动登录页面卸载");
  // 标记组件已卸载
  isUnmounted = true;

  // 清理状态
  errorMessage.value = "";
  userStore.setStateTag("");
  isProcessing = false;
});
</script>

<style lang="scss" scoped>
.auto-login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  .loading-container,
  .error-container {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    text-align: center;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .loading-container {
    span {
      font-size: 16px;
      color: #333;
      margin-bottom: 1rem;
    }

    &::after {
      content: "";
      display: block;
      width: 24px;
      height: 24px;
      border: 3px solid #e0e0e0;
      border-top-color: #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  .error-container {
    .error-message {
      color: #e74c3c;
      font-size: 16px;
      margin-bottom: 1rem;
      max-width: 250px;
      word-break: break-word;
    }

    .retry-btn {
      padding: 0.6rem 1.8rem;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;

      &:hover {
        background: #2980b9;
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
