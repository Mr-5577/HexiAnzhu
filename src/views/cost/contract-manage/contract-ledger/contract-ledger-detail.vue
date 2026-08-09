<template>
  <div class="contract-ledger-detail">
    <el-container>
      <!-- 左侧菜单（可收缩展开） -->
      <el-aside :width="isCollapse ? '64px' : '180px'" class="tab-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">合同台账</span>
          <button
            type="button"
            class="collapse-btn"
            :title="isCollapse ? '展开菜单' : '收起菜单'"
            @click="toggleCollapse"
          >
            <el-icon><component :is="isCollapse ? Icons.Fold : Icons.Expand" /></el-icon>
          </button>
        </div>

        <div class="menu-scroll-wrapper">
          <div
            v-for="item in menuItems"
            :key="item.index"
            class="menu-item"
            :class="{ 'is-active': activeTab === item.index, 'is-collapsed': isCollapse }"
            :title="item.label"
            @click="handleTabChange(item.index)"
          >
            <el-icon class="menu-icon"><component :is="item.icon" /></el-icon>
            <span class="menu-label" v-show="!isCollapse">{{ item.label }}</span>
          </div>
        </div>
      </el-aside>

      <el-main class="content-area">
        <keep-alive>
          <component
            :is="currentComponent"
            :key="activeTab"
            :conId="conId"
            :projId="projId"
            :conName="conName"
          />
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
  onMounted,
  type Component,
  defineAsyncComponent,
} from "vue";
import { useRoute } from "vue-router";
import * as Icons from "@element-plus/icons-vue";

defineOptions({ name: "contract-ledger-detail" });

// 菜单收起状态（仅 UI 展示用，不影响任何业务逻辑）
const isCollapse = ref(false);
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 菜单配置
const menuItems = [
  {
    index: "basic",
    icon: markRaw(Icons.Document),
    label: "基本信息",
    component: () => import("./basic-infor/index.vue"),
  },
  {
    index: "attachment",
    icon: markRaw(Icons.Paperclip),
    label: "合同附件",
    component: () => import("./attachment/index.vue"),
  },
  {
    index: "paymentAccount",
    icon: markRaw(Icons.CreditCard),
    label: "收款账号",
    component: () => import("./payment-account/index.vue"),
  },
  {
    index: "supplementContract",
    icon: markRaw(Icons.Calendar),
    label: "补充合同",
    component: () => import("./supplement-contract/index.vue"),
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
    component: () => import("./visa-manage/index.vue"),
  },
  {
    index: "outputDeclaration",
    icon: markRaw(Icons.Upload),
    label: "产值申报",
    component: () => import("./output-declaration/index.vue"),
  },
  {
    index: "paymentAdjust",
    icon: markRaw(Icons.EditPen),
    label: "款项调整",
    component: () => import("./payment-adjust/index.vue"),
  },
  {
    index: "costAllocation",
    icon: markRaw(Icons.DataAnalysis),
    label: "成本分摊",
    component: () => import("./cost-allocation/index.vue"),
  },
  // {
  //   index: "disputeApproval",
  //   icon: markRaw(Icons.Warning),
  //   label: "争议审批",
  //   component: () => import("./disput-approval/index.vue"),
  // },
  {
    index: "specialMatter",
    icon: markRaw(Icons.WarningFilled),
    label: "特殊事项",
    component: () => import("./special-matter/index.vue"),
  },
  {
    index: "engineeringPrice",
    icon: markRaw(Icons.PriceTag),
    label: "工程核价",
    component: () => import("./engineering-price/index.vue"),
  },
  // {
  //   index: "documents",
  //   icon: markRaw(Icons.Message),
  //   label: "收文发文",
  //   component: () => import("./documents/index.vue"),
  // },
  {
    index: "paymentApplication",
    icon: markRaw(Icons.Money),
    label: "付款申请",
    component: () => import("./payment-application/index.vue"),
  },
  {
    index: "performanceBond",
    icon: markRaw(Icons.Coin),
    label: "履约保证金",
    component: () => import("./performance-bond/index.vue"),
  },
  {
    index: "contractPreSettle",
    icon: markRaw(Icons.Lock),
    label: "合同预结算",
    component: () => import("./contract-preSettle/index.vue"),
  },
  {
    index: "contractSettle",
    icon: markRaw(Icons.Finished),
    label: "合同结算",
    component: () => import("./contract-settle/index.vue"),
  },
  {
    index: "contractTermination",
    icon: markRaw(Icons.CircleClose),
    label: "合同解除",
    component: () => import("./contract-void/index.vue"),
  },
];

// 动态组件映射--懒加载
const componentMap = new Map<string, Component>();
menuItems.forEach((item) => {
  componentMap.set(item.index, defineAsyncComponent(item.component));
});

const route = useRoute();
const activeTab = ref(""); // 默认显示基本信息 basic
const conId = ref<number | null>(null); // 合同ID
const projId = ref<number | null>(null); // 项目ID
const conName = ref<string | null>(null); // 合同名称

const currentComponent = computed(() => componentMap.get(activeTab.value));

// 切换tab
const handleTabChange = (tab: string) => {
  activeTab.value = tab;

  // 更新 URL 但不触发路由更新（仅在不同的时候修改，避免无谓的 history.replaceState）
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("tab") !== tab) {
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  } catch (e) {}
};

// 获取初始tab
const getInitialTab = (): string => {
  // 先从路由query获取
  const tabFromQuery = route.query.tab as string;
  if (tabFromQuery && menuItems.some((item) => item.index === tabFromQuery)) {
    return tabFromQuery;
  }
  // 默认返回'basic'
  return "basic";
};

// 同步路由参数
const syncRouteState = () => {
  console.log("同步路由参数:", route.query);
  conId.value = route.query.conId ? Number(route.query.conId) : null;
  projId.value = route.query.projId ? Number(route.query.projId) : null;
  conName.value = route.query.conName ? String(route.query.conName) : null;

  activeTab.value = getInitialTab();
};

// watch(() => [route.query.conId, route.query.projId], syncRouteState, {
//   immediate: true,
// });

onMounted(() => {
  syncRouteState();
});
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
    display: flex;
    flex-direction: column;
    transition: width 0.25s ease;

    /* 顶部标题栏 + 收缩按钮 */
    .sidebar-header {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 54px;
      padding: 0 12px 0 20px;
      border-bottom: 1px solid #eef0f5;

      .sidebar-title {
        font-size: 15px;
        font-weight: 700;
        color: #1f2329;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .collapse-btn {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: #8a90a2;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: #eef3ff;
          color: #1e6fff;
        }
      }
    }

    .menu-scroll-wrapper {
      flex: 1;
      overflow-y: auto;
      padding: 10px 0;

      /* 美观滚动条 */
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: #d8dce6;
        border-radius: 3px;
      }
      &::-webkit-scrollbar-thumb:hover {
        background: #c0c6d4;
      }
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
      position: relative;

      .menu-icon {
        margin-right: 12px;
        font-size: 18px;
        flex-shrink: 0;
      }

      .menu-label {
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &:hover {
        background: #f0f2f6;
        color: #1e6fff;
        font-weight: 500;
      }

      &.is-active {
        background: #eef3ff;
        color: #1e6fff;
        font-weight: 600;

        /* 左侧高亮指示条 */
        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          border-radius: 2px;
          background: #1e6fff;
        }
      }

      /* 收起状态：仅显示图标并居中 */
      &.is-collapsed {
        justify-content: center;
        padding: 0;
        margin: 4px 8px;

        .menu-icon {
          margin-right: 0;
        }
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
    width: 64px !important;

    .sidebar-header {
      justify-content: center;
      padding: 0;

      .sidebar-title {
        display: none;
      }
    }

    .menu-item {
      justify-content: center;
      padding: 0 !important;

      .menu-label {
        display: none;
      }

      .menu-icon {
        margin-right: 0;
        font-size: 22px;
      }
    }
  }
}
</style>
