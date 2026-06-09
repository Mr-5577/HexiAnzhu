<!-- 合同详情 -->
<template>
  <div class="contract-ledger-detail">
    <el-container>
      <!-- 左侧Tab导航 -->
      <el-aside width="220px" class="tab-sidebar">
        <el-menu
          :default-active="activeTab"
          @select="handleTabChange"
          class="vertical-tabs"
        >
          <!-- <el-sub-menu index="basicInfo">
            <template #title>
              <span>基本信息</span>
            </template>
            <el-menu-item index="basic">
              <el-icon><Document /></el-icon>
              <span>基本信息</span>
            </el-menu-item>
            <el-menu-item index="attachment">
              <el-icon><Paperclip /></el-icon>
              <span>合同附件</span>
            </el-menu-item>
          </el-sub-menu> -->

          <el-menu-item index="basic">
            <el-icon><Document /></el-icon>
            <span>基本信息</span>
          </el-menu-item>
          <el-menu-item index="attachment">
            <el-icon><Paperclip /></el-icon>
            <span>合同附件</span>
          </el-menu-item>

          <!-- <el-menu-item index="contractApproval">
              <el-icon><Checked /></el-icon>
              <span>合同审批</span>
            </el-menu-item> -->
          <el-menu-item index="supplementContract">
            <el-icon><Calendar /></el-icon>
            <span>补充合同</span>
          </el-menu-item>

          <el-menu-item index="payPlan">
            <el-icon><Calendar /></el-icon>
            <span>应付计划</span>
          </el-menu-item>
          <el-menu-item index="costAllocation">
            <el-icon><DataAnalysis /></el-icon>
            <span>成本分摊</span>
          </el-menu-item>

          <el-menu-item index="disputeApproval">
            <el-icon><Warning /></el-icon>
            <span>争议审批</span>
          </el-menu-item>
          <el-menu-item index="engineeringPrice">
            <el-icon><PriceTag /></el-icon>
            <span>工程核价</span>
          </el-menu-item>
          <el-menu-item index="quantityAcceptance">
            <el-icon><ScaleToOriginal /></el-icon>
            <span>收方</span>
          </el-menu-item>

          <el-menu-item index="changeOrder">
            <el-icon><DocumentAdd /></el-icon>
            <span>变更指令</span>
          </el-menu-item>
          <el-menu-item index="visaManagement">
            <el-icon><Postcard /></el-icon>
            <span>签证管理</span>
          </el-menu-item>

          <el-menu-item index="documents">
            <el-icon><Message /></el-icon>
            <span>收文发文</span>
          </el-menu-item>

          <el-menu-item index="preSettlementAdjust">
            <el-icon><DataLine /></el-icon>
            <span>预结算调整</span>
          </el-menu-item>
          <el-menu-item index="contractSettlement">
            <el-icon><Finished /></el-icon>
            <span>合同结算</span>
          </el-menu-item>
          <el-menu-item index="contractTermination">
            <el-icon><CircleClose /></el-icon>
            <span>合同解除</span>
          </el-menu-item>

          <el-menu-item index="outputDeclaration">
            <el-icon><Upload /></el-icon>
            <span>产值申报</span>
          </el-menu-item>

          <el-menu-item index="paymentAdjust">
            <el-icon><Money /></el-icon>
            <span>款项调整</span>
          </el-menu-item>
          <el-menu-item index="performanceBond">
            <el-icon><Lock /></el-icon>
            <span>履约保证金</span>
          </el-menu-item>

          <el-menu-item index="paymentApplication">
            <el-icon><Money /></el-icon>
            <span>付款申请</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧内容区 -->
      <el-main class="content-area">
        <keep-alive>
          <component :is="currentComponent" :conId="conId" />
        </keep-alive>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import BasicInfo from "./contract-ledger-form.vue";
import Attachment from "./attachment/index.vue";
import ContractApproval from "./contract-approval/index.vue";
import SupplementContract from "./supplement-contract/index.vue";
import PayPlan from "./pay-plan/index.vue";

const route = useRoute();
const activeTab = ref("basic");
const conId = ref<number | null>(null); // 合同台账ID

const tabComponents = {
  basic: BasicInfo,
  attachment: Attachment, // 合同附件
  contractApproval: ContractApproval, // 合同审批
  supplementContract: SupplementContract, // 补充合同
  payPlan: PayPlan, // 应付计划
};

const currentComponent = computed(() => tabComponents[activeTab.value]);

const handleTabChange = (tab) => {
  activeTab.value = tab;
};

const syncRouteState = () => {
  const idValue = route.query.conId ? Number(route.query.conId) : null;
  conId.value = idValue || null;
};

watch(() => route.query.conId, syncRouteState, { immediate: true });
</script>

<style scoped lang="scss">
.contract-ledger-detail {
  height: 100%;
  background: #f0f2f6;
  :deep(.el-container) {
    height: 100%;
    display: flex;
  }

  .tab-sidebar {
    background: #ffffff;
    border-right: 1px solid #e6e9f0;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);
    overflow: hidden;
    padding: 10px 0;
    box-sizing: border-box;
    :deep(.vertical-tabs) {
      height: 100%;
      border-right: none;
      background: transparent;
      overflow-y: auto;
      // 菜单项样式优化
      .el-sub-menu {
        .el-sub-menu__title {
          height: 46px !important;
          line-height: 46px !important;
        }
      }
      .el-menu-item {
        height: 46px;
        line-height: 46px;
        // margin: 4px 12px;
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

          // &::before {
          //   content: "";
          //   position: absolute;
          //   left: 8px;
          //   top: 12px;
          //   bottom: 12px;
          //   width: 3px;
          //   background: #1e6fff;
          //   border-radius: 0 2px 2px 0;
          // }
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
    //   overflow-y: auto;
  }
}

// 响应式：窄屏时左侧菜单变窄
@media (max-width: 768px) {
  .tab-sidebar {
    width: 72px !important;

    .el-menu-item {
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
