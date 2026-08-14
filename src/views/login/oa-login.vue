<!-- OA系统跳转过来 鉴权逻辑处理 -->
<template>
  <div class="auto-login-page">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>正在处理登录...</span>
    </div>
    <div v-else-if="errorMessage" class="error-container">
      <span class="error-message">{{ errorMessage }}</span>
      <button v-if="showRetry" class="retry-btn" @click="handleRetry">
        重试
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userApi } from "@/api/system/user-api";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { ElMessage } from "element-plus";

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const errorMessage = ref("");
const showRetry = ref(true);

// 防止重复处理标志
let isProcessing = false;
// 组件是否已卸载
let isUnmounted = false;

// 构建路由路径
const buildRoutePath = (
  basePath: string,
  params: Record<string, string | number | undefined>,
) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });
  return query.toString() ? `${basePath}?${query.toString()}` : basePath;

  // const query = new URLSearchParams();
  // let path = basePath;

  // // 👇 支持 mode 参数
  // if (params.mode === "edit") {
  //   path = `${basePath}/edit`;
  // } else if (params.mode === "view") {
  //   path = `${basePath}/detail`;
  // }

  // Object.entries(params).forEach(([key, value]) => {
  //   if (
  //     value !== undefined &&
  //     value !== null &&
  //     value !== "" &&
  //     key !== "mode"
  //   ) {
  //     query.append(key, String(value));
  //   }
  // });

  // return query.toString() ? `${path}?${query.toString()}` : path;
};

// COST 子业务路径映射（subBizCode = COST 时生效），成本分摊页面
const COST_ROUTE: Record<string, string> = {
  CON_MAIN: "/cost-allocation",
  CON_ADD: "/cost-allocation",
  CON_BG: "/cost-allocation",
  CON_QZ: "/cost-allocation",
  CON_PRE_SETTLE: "/cost-allocation",
  CON_SETTLE: "/cost-allocation",
  NCON_CST: "/oa/ncon/cost-alloc",
  NCON_PROC: "/oa/ncon/cost-alloc",
};

// FINA 子业务路径映射（subBizCode = FINA 时生效），财务分摊页面
const FINA_ROUTE: Record<string, string> = {
  NCON_FEE: "/finance-allocation",
  NCON_CST: "/finance-allocation",
  CON_PAY: "/finance-allocation",
};

// 默認路徑映射，对应业务的单据详情页
const DEFAULT_ROUTE: Record<string, string> = {
  CON_MAIN: "/oa/con/contract-ledger", // 主合同
  CON_ADD: "/oa/supplement-contract", // 补充合同
  CON_BG: "/oa/change-order", // 变更合同
  CON_QZ: "/oa/visa-manage", // 签证合同
  CON_PROD: "/oa/output-declaration", // 合同产值
  CON_PAY: "/oa/payment-application", // 合同支付
  CON_PRE_SETTLE: "/home", // 合同预结算
  CON_SETTLE: "/home", // 合同结算
  NCON_PROC: "/oa/ncon/cst-process", // 非合同立项
  NCON_CST: "/oa/ncon/cst-payment", // 非合同请款
  NCON_FEE: "/oa/ncon/fee-payment", // 费用报销
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

/**
 * 核心路由解析函数
 * 优先级: bizItemCode -> subBizCode -> mode
 */
const resolveBizRoute = async (
  bizItemCode: string,
  billId: string,
  bizId: string,
  subBizCode: string = "",
  mode: string = "",
) => {
  // ========================================
  // 第一层：根据 bizItemCode 分支
  // ========================================
  switch (bizItemCode) {
    // ========================================
    // subBizCode = COST 判断（仅 mode 生效）：合同审批 / 补充 / 变更 / 签证 / 预结算 / 结算
    // ========================================
    case "CON_MAIN":
    case "CON_ADD":
    case "CON_BG":
    case "CON_QZ":
    case "CON_PRE_SETTLE":
    case "CON_SETTLE":
    case "NCON_PROC": {
      if (subBizCode === "COST") {
        switch (mode) {
          case "edit":
            return buildRoutePath(COST_ROUTE[bizItemCode], {
              billId, // 单据ID
              bizId, // 业务ID
              bizType: bizItemCode, // 业务类型
              mode: "edit",
            });
          case "view":
          default:
            return buildRoutePath(COST_ROUTE[bizItemCode], {
              billId, // 单据ID
              bizId, // 业务ID
              bizType: bizItemCode, // 业务类型
              mode: "edit",
            });
        }
      }
      // 这里走单据详情页
      return buildRoutePath(DEFAULT_ROUTE[bizItemCode], {
        billId, // 单据ID
        bizId, // 业务ID
      });
    }

    // ========================================
    // subBizCode = FINA 判断（仅 mode 生效）：非合同费用 / 非合同建安支付 / 合同支付
    // ========================================
    case "NCON_FEE":
    case "NCON_CST":
    case "CON_PAY": {
      if (subBizCode === "FINA") {
        switch (mode) {
          case "edit":
            return buildRoutePath(`${FINA_ROUTE[bizItemCode]}`, {
              billId, // 单据ID
              bizId, // 业务ID
              bizType: bizItemCode, // 业务类型
              mode: "edit",
            });
          case "view":
          default:
            return buildRoutePath(`${FINA_ROUTE[bizItemCode]}`, {
              billId, // 单据ID
              bizId, // 业务ID
              bizType: bizItemCode, // 业务类型
              mode: "edit",
            });
        }
      }
      if (subBizCode === "COST") {
        switch (mode) {
          case "edit":
            return buildRoutePath(COST_ROUTE[bizItemCode], {
              billId, // 单据ID
              bizId, // 业务ID
              bizType: bizItemCode, // 业务类型
              mode: "edit",
            });
          case "view":
          default:
            return buildRoutePath(COST_ROUTE[bizItemCode], {
              billId, // 单据ID
              bizId, // 业务ID
              bizType: bizItemCode, // 业务类型
              mode: "edit",
            });
        }
      }
      // 这里走单据详情页
      return buildRoutePath(DEFAULT_ROUTE[bizItemCode], {
        billId, // 单据ID
        bizId, // 业务ID
      });
    }
    // ---------- 招投标相关（单路径） ----------
    case "ZB_TND":
      return buildRoutePath("/bidding/bidding-detail", {
        tenderId: bizId,
      });

    case "ZB_XQ":
      return buildRoutePath("/oa/bidding/bidding-demand/detail", {
        billId,
      });

    case "ZB_JH":
      return buildRoutePath("/oa/bidding/tender-plan/detail", {
        billId,
        tenderId: bizId,
      });

    case "ZB_CK":
      return buildRoutePath("/oa/bidding/reference-price/detail", {
        billId,
        tenderId: bizId,
      });

    case "ZB_DB":
      return buildRoutePath("/oa/bidding/award-approval/detail", {
        billId,
        tenderId: bizId,
      });

    case "ZB_BZJ":
      return buildRoutePath("/oa/bidding/bid-bond-pay/detail", {
        billId,
        tenderId: bizId,
      });

    case "ZB_BZJTH":
      return buildRoutePath("/oa/bidding/bid-bond-refund/detail", {
        billId,
        tenderId: bizId,
      });

    // ---------- 供应商（单路径） ----------
    case "SUP_RK":
      return buildRoutePath("/oa/supplier/inspection/edit", {
        supBillId: billId,
      });

    // ---------- 目标成本版本（mode 仍生效） ----------
    case "CST_COST_M": {
      const costMid = Number(bizId);
      if (!Number.isNaN(costMid)) {
        try {
          const res = await goalCostApi.getProjectCostMList({ id: costMid });
          const data = Array.isArray(res?.data) ? res.data[0] : res?.data;
          const projId = data?.projId ?? data?.proj_id;
          const areaVerMid = data?.areaVerMid ?? data?.area_ver_mid;

          return buildRoutePath("/cost/cost-detail", {
            mode: mode || "add",
            projId,
            costMid: bizId,
            areaVerMid,
          });
        } catch (error) {
          console.error("获取目标成本信息失败:", error);
        }
      }

      return buildRoutePath("/cost/cost-detail", {
        mode: mode || "add",
        projId: billId,
        costMid: bizId,
      });
    }

    // ---------- 以下业务为单路径占位，待补充真实路由 ----------
    case "CON_TSSX": // 合同特殊事项申请
    case "CON_GCHJ": // 合同工程核价
    case "CON_VOID": // 合同作废
    case "CON_DED": // 合同奖罚
    case "CON_LV_RECV": // 履约保证金收取
    case "CON_LV_REFU": // 履约保证金退还
      return buildRoutePath("/home", { billId });

    // ---------- 默认 ----------
    default:
      return buildRoutePath("/home", {
        billId,
        bizId,
      });
  }
};

// 模拟登录
const handleMockLogin = async () => {
  checkIfUnmounted();

  const existingToken =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const token = existingToken || "mock-token";
  const query = route.query;
  const bizItemCode = getQueryParam(query.bizItemCode) || "ZB_TND";
  const billId = getQueryParam(query.billId) || "1";
  const bizId = getQueryParam(query.bizId) || "1";
  const subBizCode = getQueryParam(query.subBizCode) || "";
  const mode = getQueryParam(query.mode) || "";

  if (!existingToken) {
    localStorage.setItem("token", token);
  }
  localStorage.setItem("accountNonExpired", "true");

  ElMessage.success(
    existingToken ? "MOCK 跳转中..." : "没有Token，请先登陆...",
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));

  checkIfUnmounted();
  const targetPath = await resolveBizRoute(
    bizItemCode,
    billId,
    bizId,
    subBizCode,
    mode,
  );
  await router.replace(targetPath);
};

// OA鉴权登录
const handleOALogin = async (
  requestId: string,
  oaUserId: string,
  timestamp: string,
  signature: string,
  subBizCode: string,
  mode: string,
) => {
  checkIfUnmounted();

  try {
    const res = await userApi.getOaAuthRedirectUrl({
      requestId,
      oaUserId,
      timestamp,
      signature,
    });
    console.log("OA鉴权响应:", res);
    checkIfUnmounted();

    if (res.code === 200 && res.data) {
      const accountNonExpired = res.data.accountNonExpired || false;
      const token = res.data.token || "";
      const bizItemCode = res.data.bizItemCode || "";
      const billId = res.data.billId || "";
      const bizId = res.data.bizId || "";

      localStorage.setItem("token", token);
      localStorage.setItem("accountNonExpired", String(accountNonExpired));

      ElMessage.success("登录成功，正在跳转...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      checkIfUnmounted();
      // 核心：根据 bizItemCode -> subBizCode -> mode 三级路由解析
      const targetPath = await resolveBizRoute(
        bizItemCode,
        billId,
        bizId,
        subBizCode,
        mode,
      );
      console.log("OA鉴权跳转路径:", targetPath);
      await router.replace(targetPath);
    } else {
      const errMsg = res.message || "OA鉴权失败，请重新登录";
      ElMessage.error(errMsg);
      throw new Error(errMsg);
    }
  } catch (err) {
    if (err instanceof Error && err.message === "COMPONENT_UNMOUNTED") {
      return;
    }
    isProcessing = false;
    if (!isUnmounted) {
      const msg = err instanceof Error ? err.message : "OA鉴权失败，请重新登录";
      errorMessage.value = msg;
      ElMessage.error(msg);
    }
  }
};

// 主处理逻辑
const handleRouteParams = async () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    checkIfUnmounted();
    loading.value = true;
    errorMessage.value = "";

    const query = route.query;
    const isMock = getQueryParam(query.isMock) === "true";
    const requestId = getQueryParam(query.requestId);
    const oaUserId = getQueryParam(query.oaUserId);
    const timestamp = getQueryParam(query.timestamp);
    const signature = getQueryParam(query.signature);
    // 获取新增参数
    const subBizCode = getQueryParam(query.subBizCode);
    const mode = getQueryParam(query.mode);

    console.log("OA鉴权参数:", {
      requestId,
      oaUserId,
      timestamp,
      signature,
      isMock,
      bizItemCode: getQueryParam(query.bizItemCode),
      billId: getQueryParam(query.billId),
      bizId: getQueryParam(query.bizId),
      subBizCode,
      mode,
    });

    if (isMock) {
      await handleMockLogin();
      return;
    }

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

    await handleOALogin(
      requestId,
      oaUserId,
      timestamp,
      signature,
      subBizCode,
      mode,
    );
  } catch (err) {
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

const handleRetry = () => {
  if (isUnmounted) return;
  errorMessage.value = "";
  handleRouteParams();
};

onMounted(() => {
  handleRouteParams();
});

onUnmounted(() => {
  isUnmounted = true;
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
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e0e0e0;
      border-top-color: #3498db;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    span {
      font-size: 16px;
      color: #333;
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
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
