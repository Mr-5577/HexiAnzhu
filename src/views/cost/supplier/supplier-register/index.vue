<template>
  <div class="supplier-register">
    <el-container>
      <!-- 左侧Tab导航 -->
      <el-aside width="200px" class="tab-sidebar">
        <el-menu
          :default-active="activeTab"
          @select="handleTabChange"
          class="vertical-tabs"
        >
          <el-menu-item index="basic">
            <el-icon><Document /></el-icon>
            <span>基本信息</span>
          </el-menu-item>
          <el-menu-item index="contact">
            <el-icon><Phone /></el-icon>
            <span>联系方式</span>
          </el-menu-item>
          <el-menu-item index="bank">
            <el-icon><CreditCard /></el-icon>
            <span>银行账户</span>
          </el-menu-item>
          <el-menu-item index="resource">
            <el-icon><Folder /></el-icon>
            <span>相关资源</span>
          </el-menu-item>
          <el-menu-item index="project" disabled>
            <el-icon><Trophy /></el-icon>
            <span>项目业绩</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧内容区 -->
      <el-main class="content-area">
        <keep-alive>
          <component :is="currentComponent" @update="handleDataUpdate" />
        </keep-alive>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import BasicInfo from "./basic-infor.vue";
import ContactWay from "./contact-way.vue";
import BankTable from "./bank-account.vue";
import RelateResource from "./relate-resource.vue";

const activeTab = ref("basic");

const tabComponents = {
  basic: BasicInfo,
  contact: ContactWay,
  bank: BankTable,
  resource: RelateResource,
};

const currentComponent = computed(() => tabComponents[activeTab.value]);

const handleTabChange = (tab) => {
  activeTab.value = tab;
};

const handleDataUpdate = ({ module, data }) => {
  // 更新store中对应模块的数据
  store[module] = data;
};
</script>

<style scoped lang="scss">
.supplier-register {
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

  //   // 内容区滚动条美化
  //   &::-webkit-scrollbar {
  //     width: 6px;
  //     height: 6px;
  //   }

  //   &::-webkit-scrollbar-track {
  //     background: #f0f2f6;
  //     border-radius: 3px;
  //   }

  //   &::-webkit-scrollbar-thumb {
  //     background: #c1c9d2;
  //     border-radius: 3px;

  //     &:hover {
  //       background: #a8b0b8;
  //     }
  //   }
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
