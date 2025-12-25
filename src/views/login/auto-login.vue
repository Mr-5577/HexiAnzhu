<!-- 外部登录页面逻辑处理 -->
<template>
  <div class="auto-login-page">
    <div v-if="loading" class="loading-container">
      <span>正在处理登录...</span>
    </div>
    <div v-else class="error-container">
      <span>token: {{ token }}</span>
      <span>code: {{ code }}</span>
      <span>state: {{ state }}</span>
      <span>error: {{ error }}</span>
      <!-- <button @click="retry">重试</button> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";

// 定义路由和路由实例
const route = useRoute();
const router = useRouter();

// 响应式数据
const loading = ref(true);
const token = ref<string>("");
const code = ref<string>("");
const state = ref<string>("");
const error = ref<string>("");

// 辅助函数：安全获取 query 参数（处理 string | string[] 类型）
const getQueryParam = (param: string | string[] | undefined): string => {
  if (!param) return "";
  if (Array.isArray(param)) return param[0] || "";
  return param;
};

// 解析和处理路由参数
const handleRouteParams = () => {
  loading.value = true;
  error.value = "";

  try {
    // 获取所有路由参数
    const queryParams = route.query;
    console.log("路由参数 query:", queryParams);

    // 安全获取参数值
    const tokenParam = getQueryParam(queryParams?.token);
    const codeParam = getQueryParam(queryParams?.code);
    const stateParam = getQueryParam(queryParams?.state);
    const errorParam = getQueryParam(queryParams?.error);

    // 重置参数显示
    token.value = "";
    code.value = "";
    state.value = "";
    error.value = "";

    // 检查是否带有特定参数
    // if (!tokenParam && !codeParam && !stateParam) {
    //   error.value = "未找到有效的登录参数";
    //   console.log("没有找到有效参数");
    //   return;
    // }

    // 处理常见的登录参数
    if (tokenParam) {
      token.value = tokenParam;
      // 处理 token 登录
      handleTokenLogin(tokenParam);
    }
    if (codeParam) {
      code.value = codeParam;
      // 处理 OAuth 授权码
      handleOAuthLogin(codeParam);
    }
    if (stateParam) {
      state.value = stateParam;
      // 处理单点登录票据
      handleSSOLogin(stateParam);
    }
    if (errorParam) {
      error.value = errorParam;
    } else {
      error.value = "参数格式不正确";
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "处理参数时发生未知错误";
    console.log("error.value", error.value);
  } finally {
    loading.value = false;
  }
};

// 处理 token 登录
const handleTokenLogin = async (token: string) => {
  console.log("成功获取到token！！！");
  localStorage.setItem("token", token);
  router.replace("/home");
  try {
    // 调用登录 API
    // const response = await loginWithToken(token);
    // 存储登录信息
    // localStorage.setItem('auth_token', token);
    // 跳转到目标页面或首页
    // const redirectUrl = getQueryParam(route.query.redirect) || "/";
    // router.push(redirectUrl);
  } catch (err) {
    throw new Error(`Token登录失败: ${err}`);
  }
};

// 处理 OAuth 登录
const handleOAuthLogin = async (code: string) => {
  try {
    // 使用授权码获取 access_token
    // const response = await exchangeCodeForToken(code);

    // 处理登录成功逻辑
    console.log("OAuth code:", code);
    // 跳转
    // const redirectUrl = getQueryParam(route.query.redirect) || "/";
    // router.push(redirectUrl);
  } catch (err) {
    throw new Error(`OAuth登录失败: ${err}`);
  }
};

// 处理单点登录
const handleSSOLogin = async (ticket: string) => {
  try {
    // 验证 SSO ticket
    // const isValid = await validateSSOTicket(ticket);

    console.log("SSO ticket:", ticket);

    // 跳转
    // const redirectUrl = getQueryParam(route.query.redirect) || "/";
    // router.push(redirectUrl);
  } catch (err) {
    throw new Error(`单点登录失败: ${err}`);
  }
};

// 重试函数
const retry = () => {
  handleRouteParams();
};

// 监听路由变化（如果允许用户在页面刷新）
const unwatch = router.afterEach((to, from) => {
  if (to.name === route.name) {
    handleRouteParams();
  }
});

onMounted(() => {
  // 组件挂载时处理参数
  handleRouteParams();
});

onUnmounted(() => {
  // 清理监听器
  unwatch();
});
</script>

<style lang="scss" scoped>
.auto-login-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
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
    max-width: 400px;
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .loading-container {
    span {
      display: inline-block;
      margin-right: 10px;
    }

    // 简单的加载动画
    &::after {
      content: "";
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid #e0e0e0;
      border-top-color: #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  .error-container {
    button {
      margin-top: 1rem;
      padding: 0.5rem 1.5rem;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background: #2980b9;
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
