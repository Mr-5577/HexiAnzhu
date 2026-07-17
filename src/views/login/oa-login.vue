<!-- OA系统跳转过来 鉴权逻辑处理 -->
<template>
  <div class="auto-login-page">
    <div v-if="loading" class="loading-container">
      <span>正在处理登录...</span>
    </div>
    <div v-else-if="errorMessage" class="error-container">
      <span class="error-message">{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userApi } from "@/api/system/user-api";
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { ElMessage } from "element-plus";

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const errorMessage = ref("");

// 防止重复处理标志
let isProcessing = false;
// 组件是否已卸载
let isUnmounted = false;

// 业务类型与页面路径的映射
const BIZ_CODE_ROUTE_MAP: Record<string, string> = {
  // 成本合同相关
  CST_CON_MAIN: "/cost/contract/approval", // 合同审批
  CST_CON_ADD: "/cost/contract/supplement", // 补充合同审批
  CST_CON_ORD: "/cost/contract/order", // 订单合同
  CST_CON_BILL: "/cost/contract/purchase", // 采购订单
  CST_CON_BG: "/cost/contract/change", // 合同变更
  CST_CON_QZ: "/cost/contract/visa", // 合同签证
  CST_CON_PROD: "/cost/contract/production", // 合同产值
  CST_CON_PRE_SETTLE: "/cost/contract/pre-settle", // 合同预结算
  CST_CON_SETTLE: "/cost/contract/settle", // 合同结算
  CST_NCON: "/cost/contract/non-contract", // 非合同
};

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

// 处理OA鉴权登录
const handleOALogin = async (
  requestId: string,
  oaUserId: string,
  timestamp: string,
  signature: string,
) => {
  checkIfUnmounted();

  try {
    // 调用OA鉴权接口
    const res = await userApi.getOaAuthRedirectUrl({
      requestId,
      oaUserId,
      timestamp,
      signature,
    });

    checkIfUnmounted();

    if (res.code === 200 && res.data) {
      const accountNonExpired = res.data.accountNonExpired || false; // 密码是否过期，true表示未过期，false表示过期
      const token = res.data.token || ""; // 用户token
      const bizItemCode = res.data.bizItemCode || ""; // 业务类型编码
      const billId = res.data.billId || ""; // 单据ID
      const bizId = res.data.bizId || ""; // 业务ID
      // 存储token
      localStorage.setItem("token", token);
      // 密码是否过期标识
      localStorage.setItem("accountNonExpired", accountNonExpired);

      // 显示成功提示
      ElMessage.success("登录成功，正在跳转...");

      // 短暂延迟让用户看到提示
      await new Promise((resolve) => setTimeout(resolve, 1000));

      checkIfUnmounted();

      // 根据 bizItemCode 跳转不同页面
      // let targetPath = BIZ_CODE_ROUTE_MAP[bizItemCode] || "/home";
      let targetPath = "/home";
      // 跳转页面
      await router.replace(targetPath);
    } else {
      // 接口返回错误
      const errMsg = res.message || "OA鉴权失败，请重新登录";
      ElMessage.error(errMsg);
      throw new Error(errMsg);
    }
  } catch (err) {
    // 如果是组件卸载的错误，直接返回
    if (err instanceof Error && err.message === "COMPONENT_UNMOUNTED") {
      return;
    }

    // 重置处理标志
    isProcessing = false;

    // 显示错误消息
    if (!isUnmounted) {
      const msg = err instanceof Error ? err.message : "OA鉴权失败，请重新登录";
      errorMessage.value = msg;
      ElMessage.error(msg);
    }
  }
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
    const requestId = getQueryParam(query.requestId);
    const oaUserId = getQueryParam(query.oaUserId);
    const timestamp = getQueryParam(query.timestamp);
    const signature = getQueryParam(query.signature);

    console.log("OA鉴权参数:", {
      requestId,
      oaUserId,
      timestamp,
      signature,
    });

    // 验证必要参数是否存在
    if (!requestId || !oaUserId || !timestamp || !signature) {
      const missingParams = [];
      if (!requestId) missingParams.push("requestId");
      if (!oaUserId) missingParams.push("oaUserId");
      if (!timestamp) missingParams.push("timestamp");
      if (!signature) missingParams.push("signature");

      errorMessage.value = `缺少必要参数: ${missingParams.join(", ")}`;
      ElMessage.error(errorMessage.value);
      loading.value = false;
      isProcessing = false;
      return;
    }

    // 执行OA鉴权
    await handleOALogin(requestId, oaUserId, timestamp, signature);
  } catch (err) {
    // 如果是"组件已卸载"错误，不处理
    if (err instanceof Error && err.message === "COMPONENT_UNMOUNTED") {
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

// 重试
const handleRetry = () => {
  if (isUnmounted) return;
  // 清除错误信息并重新处理
  errorMessage.value = "";
  handleRouteParams();
};

onMounted(() => {
  handleRouteParams();
});

onUnmounted(() => {
  // 标记组件已卸载
  isUnmounted = true;

  // 清理状态
  errorMessage.value = "";
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
      margin-bottom: 0.5rem;
      max-width: 350px;
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
