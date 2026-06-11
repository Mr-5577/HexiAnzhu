<template>
  <div class="contract-ledger-detail">
    <el-container>
      <!-- 左侧菜单切换 -->
      <el-aside width="220px" class="tab-sidebar">
        <div class="menu-scroll-wrapper">
          <div
            v-for="item in menuItems"
            :key="item.index"
            class="menu-item"
            :class="{ 'is-active': activeTab === item.index }"
            @click="handleTabChange(item.index)"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </el-aside>

      <el-main class="content-area">
        <keep-alive>
          <component :is="currentComponent" :conId="conId" />
        </keep-alive>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  markRaw,
  type Component,
  defineAsyncComponent,
} from "vue";
import { useRoute } from "vue-router";
import * as Icons from "@element-plus/icons-vue";

// 菜单配置
const menuItems = [
  {
    index: "basic",
    icon: markRaw(Icons.Document),
    label: "基本信息",
    component: () => import("./contract-ledger-form.vue"),
  },
  {
    index: "attachment",
    icon: markRaw(Icons.Paperclip),
    label: "合同附件",
    component: () => import("./attachment/index.vue"),
  },
  {
    index: "supplementContract",
    icon: markRaw(Icons.Calendar),
    label: "补充合同",
    component: () => import("./supplement-contract/index.vue"),
  },
  {
    index: "payPlan",
    icon: markRaw(Icons.List),
    label: "应付计划",
    component: () => import("./pay-plan/index.vue"),
  },
  {
    index: "costAllocation",
    icon: markRaw(Icons.DataAnalysis),
    label: "成本分摊",
    component: () => import("./cost-allocation/index.vue"),
  },
  {
    index: "engineeringPrice",
    icon: markRaw(Icons.PriceTag),
    label: "工程核价",
    component: () => import("./engineering-price/index.vue"),
  },
  {
    index: "changeOrder",
    icon: markRaw(Icons.DocumentAdd),
    label: "变更指令",
    component: () => import("./change-order/index.vue"),
  },
  {
    index: "visaManagement",
    icon: markRaw(Icons.Postcard),
    label: "签证管理",
    component: () => import("./visa-management/index.vue"),
  },
  {
    index: "documents",
    icon: markRaw(Icons.Message),
    label: "收文发文",
    component: () => import("./documents/index.vue"),
  },
  {
    index: "disputeApproval",
    icon: markRaw(Icons.Warning),
    label: "争议审批",
    component: () => import("./disput-approval/index.vue"),
  },
  {
    index: "contractSettlement",
    icon: markRaw(Icons.Finished),
    label: "合同结算",
    component: () => import("./contract-settlement/index.vue"),
  },
  {
    index: "contractTermination",
    icon: markRaw(Icons.CircleClose),
    label: "合同解除",
    component: () => import("./contract-termination/index.vue"),
  },
  {
    index: "outputDeclaration",
    icon: markRaw(Icons.Upload),
    label: "产值申报",
    component: () => import("./output-declaration/index.vue"),
  },
  {
    index: "paymentAdjust",
    icon: markRaw(Icons.Coin),
    label: "款项调整",
    component: () => import("./payment-adjust/index.vue"),
  },
  {
    index: "paymentApplication",
    icon: markRaw(Icons.Money),
    label: "付款申请",
    component: () => import("./payment-application/index.vue"),
  },
  {
    index: "performanceBond",
    icon: markRaw(Icons.Lock),
    label: "履约保证金",
    component: () => import("./performance-bond/index.vue"),
  },
];

// 动态组件映射--懒加载
const componentMap = new Map<string, Component>();
menuItems.forEach((item) => {
  componentMap.set(item.index, defineAsyncComponent(item.component));
});

const route = useRoute();
const activeTab = ref("basic"); // 默认显示基本信息
const conId = ref<number | null>(null); // 合同ID

const currentComponent = computed(() => componentMap.get(activeTab.value));

const handleTabChange = (tab: string) => {
  activeTab.value = tab;
};

const syncRouteState = () => {
  conId.value = route.query.conId ? Number(route.query.conId) : null;
};

watch(() => route.query.conId, syncRouteState, { immediate: true });
</script>
<style scoped lang="scss">
.contract-ledger-detail {
  height: 100%;
  background: #f0f2f6;

  :deep(.el-container) {
    height: 100%;
  }

  .tab-sidebar {
    background: #ffffff;
    border-right: 1px solid #e6e9f0;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);
    overflow: hidden;

    .menu-scroll-wrapper {
      height: 100%;
      overflow-y: auto;
      padding: 10px 0;
    }

    .menu-item {
      display: flex;
      align-items: center;
      height: 46px;
      padding: 0 20px;
      margin: 4px 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #606266;

      .el-icon {
        margin-right: 12px;
        font-size: 18px;
      }

      span {
        font-size: 14px;
      }

      &:hover {
        background: #f0f2f6;
        color: #1e6fff;
      }

      &.is-active {
        background: #eef3ff;
        color: #1e6fff;
        font-weight: 500;
      }
    }
  }

  .content-area {
    height: 100%;
    background: #f0f2f6;
    padding: 10px;
    overflow-y: auto;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .tab-sidebar {
    width: 72px !important;

    .menu-item {
      justify-content: center;
      padding: 0 !important;

      span {
        display: none;
      }

      .el-icon {
        margin-right: 0;
        font-size: 22px;
      }
    }
  }
}
</style>
