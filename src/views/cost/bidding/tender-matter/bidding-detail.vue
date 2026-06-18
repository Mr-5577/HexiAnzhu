<!-- 招标详情 -->
<template>
  <div class="bidding-detail-page">
    <el-container>
      <!-- 左侧Tab导航 -->
      <el-aside width="220px" class="tab-sidebar">
        <el-menu
          :default-active="activeTab"
          @select="handleTabChange"
          class="vertical-tabs"
        >
          <el-menu-item index="overview">
            <el-icon><DataAnalysis /></el-icon>
            <span>招标总览</span>
          </el-menu-item>
          <el-menu-item index="demand">
            <el-icon><List /></el-icon>
            <span>招标需求</span>
          </el-menu-item>
          <el-menu-item index="tender-plan">
            <el-icon><Checked /></el-icon>
            <span>招标计划</span>
          </el-menu-item>
          <el-menu-item index="reference-price">
            <el-icon><PriceTag /></el-icon>
            <span>定标参考价</span>
          </el-menu-item>
          <el-menu-item index="award-approval">
            <el-icon><Flag /></el-icon>
            <span>定标审批</span>
          </el-menu-item>
          <el-menu-item index="bid-bond-pay">
            <el-icon><CirclePlus /></el-icon>
            <span>投标保证金缴纳</span>
          </el-menu-item>
          <el-menu-item index="bid-bond-refund">
            <el-icon><Back /></el-icon>
            <span>投标保证金退还</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧内容区 -->
      <el-main class="content-area">
        <!-- <keep-alive> -->
        <component
          :is="currentComponent"
          :tender-id="tenderId"
          :detail-data="detailData"
          :project-options="projectOptions"
        />
        <!-- </keep-alive> -->
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import {
  DataAnalysis,
  List,
  Checked,
  PriceTag,
  Flag,
  CirclePlus,
  Back,
} from "@element-plus/icons-vue";
import Overview from "./components/overview/index.vue";
import Demand from "./components/demand/index.vue";
import TenderPlan from "./components/tender-plan/index.vue";
import ReferencePrice from "./components/reference-price/index.vue";
import AwardApproval from "./components/award-approval/index.vue";
import BidBondPay from "./components/bid-bond-pay/index.vue";
import BidBondRefund from "./components/bid-bond-refund/index.vue";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api.ts";
import { largeScreenApi } from "@/api/large-screen-api";
import { BidTenderFormParams } from "@/types/cost/bidding/bidding-management-type.ts";

defineOptions({ name: "bidding-detail" });
type TenderDetailData = {
  tender: BidTenderFormParams;
  items: any[];
  projIds: number[];
};

const route = useRoute();
const tenderId = ref<number | null>(); // 事项ID

const detailData = ref<TenderDetailData | null>(null); // 详情数据
const projectOptions = ref([]); // 项目列表

// ==================== Tab配置 ====================
const activeTab = ref("overview");
const tabComponents: Record<string, any> = {
  overview: Overview, // 招标总览
  demand: Demand, // 招标需求
  "tender-plan": TenderPlan, // 招标计划
  "reference-price": ReferencePrice, // 定标参考价
  "award-approval": AwardApproval, // 定标审批
  "bid-bond-pay": BidBondPay, // 投标保证金缴纳
  "bid-bond-refund": BidBondRefund, // 投标保证金退还
};

const currentComponent = computed(() => tabComponents[activeTab.value]);

// 获取详情数据
const getDetailData = async () => {
  if (!tenderId.value) return;
  try {
    const res = await biddingManageApi.getTenderInfo({
      tenderId: tenderId.value,
    });
    if (res.code === 200 && res.data) {
      detailData.value = res.data;
    } else {
      ElMessage.error(res.message || "获取详情失败");
    }
  } catch (error) {
    console.error("获取招标详情失败:", error);
  }
};

// 获取项目列表
const getProjectOptions = async () => {
  try {
    const res = await largeScreenApi.getProjList();
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};

const handleTabChange = (tab: string) => {
  activeTab.value = tab;
};

const initData = () => {
  // 从路由参数中获取 tenderId
  const queryTenderId = route.query.tenderId;
  if (queryTenderId) {
    // 保存事项ID到状态中
    tenderId.value = Number(queryTenderId);
    getDetailData();
    getProjectOptions();
  } else {
    ElMessage.error("缺少招标事项ID");
  }
};

watch(
  () => route.query.tenderId,
  (newId) => {
    if (newId) {
      initData();
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.bidding-detail-page {
  height: 100%;
  background: #f0f2f6;
  :deep(.el-container) {
    height: 100%;
    display: flex;
  }
}

.tab-sidebar {
  background: #ffffff;
  border-right: 1px solid #e6e9f0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  .vertical-tabs {
    height: 100%;
    border-right: none;
    background: transparent;
    overflow-y: auto;
    // 菜单项样式优化
    .el-menu-item {
      height: 46px;
      line-height: 46px;
      margin: 4px 12px;
      border-radius: 10px;
      transition: all 0.2s ease;

      &:hover {
        background: #f0f2f6;
        color: #1e6fff;
      }

      &.is-active {
        background: #eef3ff;
        color: #1e6fff;
        font-weight: 500;
        position: relative;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 12px;
          bottom: 12px;
          width: 3px;
          background: #1e6fff;
          border-radius: 0 2px 2px 0;
        }
      }

      .el-icon {
        margin-right: 12px;
        font-size: 18px;
      }

      span {
        font-size: 14px;
      }
    }
    // 不可点击时的透明度
    .el-menu-item.is-disabled {
      opacity: 0.45;
    }
  }
}

.content-area {
  height: 100%;
  background: #f0f2f6;
  padding: 10px;
  box-sizing: border-box;
}
</style>
