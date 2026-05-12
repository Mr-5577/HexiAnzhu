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
          <el-menu-item index="approval">
            <el-icon><Checked /></el-icon>
            <span>招标审批</span>
          </el-menu-item>
          <el-menu-item index="reference-price">
            <el-icon><PriceTag /></el-icon>
            <span>定标参考价</span>
          </el-menu-item>
          <el-menu-item index="award-approval">
            <el-icon><Flag /></el-icon>
            <span>定标审批</span>
          </el-menu-item>
          <el-menu-item index="initiate-contract">
            <el-icon><DocumentChecked /></el-icon>
            <span>发起签约</span>
          </el-menu-item>
          <el-menu-item index="bid-bond">
            <el-icon><Lock /></el-icon>
            <span>投标保证金</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧内容区 -->
      <el-main class="content-area">
        <keep-alive>
          <component :is="currentComponent" />
        </keep-alive>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Overview from "./components/overview/index.vue";
import Demand from "./components/demand/index.vue";

defineOptions({ name: "bidding-detail" });

const activeTab = ref("overview");
const tabComponents = {
  overview: Overview,
  demand: Demand,
};

const currentComponent = computed(() => tabComponents[activeTab.value]);

const handleTabChange = (tab) => {
  activeTab.value = tab;
};
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
  //   overflow-y: auto;
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
