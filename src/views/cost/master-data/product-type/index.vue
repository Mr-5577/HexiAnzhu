<!-- 产品类型 -->
<template>
  <div class="product-type-page">
    <el-container>
      <!-- 左侧Tab导航 -->
      <el-aside width="220px" class="tab-sidebar">
        <el-menu
          :default-active="activeTab"
          @select="handleTabChange"
          class="vertical-tabs"
        >
          <el-menu-item index="basic-product-type">
            <el-icon><Folder /></el-icon>
            <span>基础产品类型</span>
          </el-menu-item>
          <el-menu-item
            index="project-product-type"
            :disabled="!hasProductBaseData"
          >
            <el-icon><Briefcase /></el-icon>
            <span>项目产品类型</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧内容区 -->
      <el-main class="content-area">
        <component
          :is="currentComponent"
          :has-product-base-data="hasProductBaseData"
          @data-changed="handleDataChanged"
        />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { Folder, Briefcase } from "@element-plus/icons-vue";
import BasicProductType from "./basic-product-type/index.vue";
import ProjectProductType from "./project-product-type/index.vue";

defineOptions({ name: "product-type" });

const hasProductBaseData = ref(false);

// ==================== Tab配置 ====================
const activeTab = ref("basic-product-type");
const tabComponents: Record<string, any> = {
  "basic-product-type": BasicProductType,
  "project-product-type": ProjectProductType,
};

const currentComponent = computed(() => tabComponents[activeTab.value]);

const handleTabChange = (tab: string) => {
  if (tab === "project-product-type" && !hasProductBaseData.value) {
    ElMessage.warning("请先新增基础产品类型后再配置项目产品类型");
    return;
  }
  activeTab.value = tab;
};

// 当基础产品类型数据发生变化时
const handleDataChanged = (isHasData: boolean) => {
  hasProductBaseData.value = isHasData;
};
</script>

<style scoped lang="scss">
.product-type-page {
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

    .el-menu-item {
      height: 46px;
      line-height: 46px;
      margin: 4px 12px;
      border-radius: 10px;
      transition: all 0.2s ease;

      &:hover:not(.is-disabled) {
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

      &.is-disabled {
        opacity: 0.45;
        cursor: not-allowed;

        &:hover {
          background: transparent;
          color: inherit;
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
  }
}

.content-area {
  height: 100%;
  background: #f0f2f6;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
