<!-- 扫码登录 -->
<template>
  <div class="scan-login-page">
    <div>{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

// 定义路由和路由实例
const route = useRoute();

// 响应式数据
const loading = ref(true);
const message = ref("");

// 辅助函数：安全获取 query 参数（处理 string | string[] 类型）
const getQueryParam = (param: string | string[] | undefined): any => {
  if (!param) return "";
  if (Array.isArray(param)) return param[0] || "";
  return param;
};

const handleRouteParams = async () => {
  const query = route.query;
  console.log("query", query);
  const errorParam = getQueryParam(query.error);
  if (errorParam == 0) {
    message.value = "扫码登录成功!";
  } else {
    message.value = errorParam || "扫码登录失败!";
  }
};

onMounted(() => {
  handleRouteParams();
});

onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.scan-login-page {
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  box-sizing: border-box;

  > div {
    font-size: clamp(18px, 5vw, 28px);
    font-weight: 600;
    color: #636262;
    text-align: center;
    max-width: 90%;
    word-wrap: break-word;
    line-height: 1.4;
    padding: 20px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.2);

    /* 根据不同的状态显示不同颜色 */
    &[style*="成功"] {
      color: #2e7d32;
      border-left: 4px solid #4caf50;
    }

    &[style*="失败"] {
      color: #c62828;
      border-left: 4px solid #f44336;
    }

    /* 移动端适配 */
    @media (max-width: 768px) {
      font-size: clamp(16px, 4vw, 22px);
      padding: 16px;
      border-radius: 10px;
      max-width: 95%;
    }

    @media (max-width: 480px) {
      font-size: clamp(14px, 3.5vw, 18px);
      padding: 14px;
      border-radius: 8px;
      max-width: 100%;
    }
  }

  /* 横屏适配 */
  @media (max-height: 500px) and (orientation: landscape) {
    > div {
      font-size: clamp(14px, 3vw, 18px);
      padding: 12px;
    }
  }

  /* 深色模式适配 */
  @media (prefers-color-scheme: dark) {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

    > div {
      background: rgba(30, 30, 46, 0.9);
      color: #e0e0e0;
      border-color: rgba(255, 255, 255, 0.1);
    }
  }

  /* 大屏适配 */
  @media (min-width: 1200px) {
    > div {
      max-width: 70%;
      padding: 30px;
    }
  }
}
</style>
