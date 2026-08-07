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

// 业务类型与页面路径映射
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
    // ---------- 非合同费用 ----------
    case "NCON_FEE": {
      // 第二层：根据 subBizCode 分支
      switch (subBizCode) {
        case "COST":
          // 第三层：根据 mode 分支
          switch (mode) {
            case "view":
              // 只读页面 - 成本分摊查看
              return buildRoutePath("/cost/contract/non-contract/cost/view", {
                billId,
              });
            case "edit":
              // 编辑页面 - 成本分摊编辑
              return buildRoutePath("/cost/contract/non-contract/cost/edit", {
                billId,
              });
            case "add":
              // 新增页面 - 成本分摊新增
              return buildRoutePath("/cost/contract/non-contract/cost/add", {
                billId,
              });
            default:
              // 默认：编辑模式
              return buildRoutePath("/cost/contract/non-contract/cost/edit", {
                billId,
              });
          }

        case "FINA":
          // 第三层：根据 mode 分支
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/non-contract/fina/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/non-contract/fina/edit", {
                billId,
              });
            case "add":
              return buildRoutePath("/cost/contract/non-contract/fina/add", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/non-contract/fina/edit", {
                billId,
              });
          }

        default:
          // subBizCode 为空或未知，跳转到非合同默认页面
          return buildRoutePath("/cost/contract/non-contract", {
            billId,
          });
      }
    }

    // ---------- 合同审批 ----------
    case "CST_CON_MAIN": {
      switch (subBizCode) {
        case "COST":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/approval/cost/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/approval/cost/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/approval/cost/edit", {
                billId,
              });
          }
        case "FINA":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/approval/fina/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/approval/fina/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/approval/fina/edit", {
                billId,
              });
          }
        default:
          return buildRoutePath("/cost/contract/approval", {
            billId,
          });
      }
    }

    // ---------- 补充合同审批 ----------
    case "CST_CON_ADD": {
      switch (subBizCode) {
        case "COST":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/supplement/cost/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/supplement/cost/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/supplement/cost/edit", {
                billId,
              });
          }
        case "FINA":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/supplement/fina/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/supplement/fina/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/supplement/fina/edit", {
                billId,
              });
          }
        default:
          return buildRoutePath("/cost/contract/supplement", {
            billId,
          });
      }
    }

    // ---------- 订单合同 ----------
    case "CST_CON_ORD": {
      switch (subBizCode) {
        case "COST":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/order/cost/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/order/cost/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/order/cost/edit", {
                billId,
              });
          }
        case "FINA":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/order/fina/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/order/fina/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/order/fina/edit", {
                billId,
              });
          }
        default:
          return buildRoutePath("/cost/contract/order", {
            billId,
          });
      }
    }

    // ---------- 采购订单 ----------
    case "CST_CON_BILL": {
      switch (subBizCode) {
        case "COST":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/purchase/cost/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/purchase/cost/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/purchase/cost/edit", {
                billId,
              });
          }
        case "FINA":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/purchase/fina/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/purchase/fina/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/purchase/fina/edit", {
                billId,
              });
          }
        default:
          return buildRoutePath("/cost/contract/purchase", {
            billId,
          });
      }
    }

    // ---------- 合同变更 ----------
    case "CST_CON_BG": {
      switch (subBizCode) {
        case "COST":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/change/cost/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/change/cost/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/change/cost/edit", {
                billId,
              });
          }
        case "FINA":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/change/fina/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/change/fina/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/change/fina/edit", {
                billId,
              });
          }
        default:
          return buildRoutePath("/cost/contract/change", {
            billId,
          });
      }
    }

    // ---------- 合同签证 ----------
    case "CST_CON_QZ": {
      switch (subBizCode) {
        case "COST":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/visa/cost/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/visa/cost/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/visa/cost/edit", {
                billId,
              });
          }
        case "FINA":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/visa/fina/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/visa/fina/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/visa/fina/edit", {
                billId,
              });
          }
        default:
          return buildRoutePath("/cost/contract/visa", {
            billId,
          });
      }
    }

    // ---------- 合同产值 ----------
    case "CST_CON_PROD": {
      switch (subBizCode) {
        case "COST":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/production/cost/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/production/cost/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/production/cost/edit", {
                billId,
              });
          }
        case "FINA":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/production/fina/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/production/fina/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/production/fina/edit", {
                billId,
              });
          }
        default:
          return buildRoutePath("/cost/contract/production", {
            billId,
          });
      }
    }

    // ---------- 合同预结算 ----------
    case "CST_CON_PRE_SETTLE": {
      switch (subBizCode) {
        case "COST":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/pre-settle/cost/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/pre-settle/cost/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/pre-settle/cost/edit", {
                billId,
              });
          }
        case "FINA":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/pre-settle/fina/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/pre-settle/fina/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/pre-settle/fina/edit", {
                billId,
              });
          }
        default:
          return buildRoutePath("/cost/contract/pre-settle", {
            billId,
          });
      }
    }

    // ---------- 合同结算 ----------
    case "CST_CON_SETTLE": {
      switch (subBizCode) {
        case "COST":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/settle/cost/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/settle/cost/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/settle/cost/edit", {
                billId,
              });
          }
        case "FINA":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/settle/fina/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/settle/fina/edit", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/settle/fina/edit", {
                billId,
              });
          }
        default:
          return buildRoutePath("/cost/contract/settle", {
            billId,
          });
      }
    }

    // ---------- 非合同 ----------
    case "CST_NCON": {
      switch (subBizCode) {
        case "COST":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/non-contract/cost/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/non-contract/cost/edit", {
                billId,
              });
            case "add":
              return buildRoutePath("/cost/contract/non-contract/cost/add", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/non-contract/cost/edit", {
                billId,
              });
          }
        case "FINA":
          switch (mode) {
            case "view":
              return buildRoutePath("/cost/contract/non-contract/fina/view", {
                billId,
              });
            case "edit":
              return buildRoutePath("/cost/contract/non-contract/fina/edit", {
                billId,
              });
            case "add":
              return buildRoutePath("/cost/contract/non-contract/fina/add", {
                billId,
              });
            default:
              return buildRoutePath("/cost/contract/non-contract/fina/edit", {
                billId,
              });
          }
        default:
          return buildRoutePath("/cost/contract/non-contract", {
            billId,
          });
      }
    }

    // ---------- 招投标相关 ----------
    case "ZB_TND":
      return buildRoutePath("/bidding/bidding-detail", {
        tenderId: bizId,
      });

    case "ZB_XQ":
      return buildRoutePath("/bidding/bidding-demand/detail", {
        billId,
      });

    case "ZB_JH":
      return buildRoutePath("/bidding/tender-plan/detail", {
        billId,
        tenderId: bizId,
      });

    case "ZB_CK":
      return buildRoutePath("/bidding/reference-price/detail", {
        billId,
        tenderId: bizId,
      });

    case "ZB_DB":
      return buildRoutePath("/bidding/award-approval/detail", {
        billId,
        tenderId: bizId,
      });

    case "ZB_BZJ":
      return buildRoutePath("/bidding/bid-bond-pay/detail", {
        billId,
        tenderId: bizId,
      });

    case "ZB_BZJTH":
      return buildRoutePath("/bidding/bid-bond-refund/detail", {
        billId,
        tenderId: bizId,
      });

    // ---------- 供应商 ----------
    case "SUP_RK":
      return buildRoutePath("/supplier/inspection/edit", {
        supBillId: billId,
      });
    case "CST_COST_M": {
      const costMid = Number(bizId);
      if (!Number.isNaN(costMid)) {
        try {
          const res = await goalCostApi.getProjectCostMList({ id: costMid });
          const data = Array.isArray(res?.data) ? res.data[0] : res?.data;
          const projId = data?.projId ?? data?.proj_id;
          const areaVerMid = data?.areaVerMid ?? data?.area_ver_mid;

          return buildRoutePath("/cost/cost-detail/add", {
            mode: mode || "add",
            projId,
            costMid: bizId,
            areaVerMid,
          });
        } catch (error) {
          console.error("获取目标成本信息失败:", error);
        }
      }

      return buildRoutePath("/cost/cost-detail/add", {
        mode: mode || "add",
        projId: billId,
        costMid: bizId,
      });
    }

    // ---------- 默认 ----------
    default:
      return buildRoutePath(BIZ_CODE_ROUTE_MAP[bizItemCode] || "/home", {
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
) => {
  checkIfUnmounted();

  try {
    const res = await userApi.getOaAuthRedirectUrl({
      requestId,
      oaUserId,
      timestamp,
      signature,
    });

    checkIfUnmounted();

    if (res.code === 200 && res.data) {
      const accountNonExpired = res.data.accountNonExpired || false;
      const token = res.data.token || "";
      const bizItemCode = res.data.bizItemCode || "";
      const billId = res.data.billId || "";
      const bizId = res.data.bizId || "";
      const subBizCode =
        res.data.subBizCode || getQueryParam(route.query.subBizCode) || "";
      const mode = res.data.mode || getQueryParam(route.query.mode) || "";

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

    await handleOALogin(requestId, oaUserId, timestamp, signature);
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
