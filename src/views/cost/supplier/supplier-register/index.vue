<!-- 供应商登记 -->
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
          <el-menu-item index="serve" :disabled="!supplierId">
            <el-icon><Briefcase /></el-icon>
            <span>服务板块</span>
          </el-menu-item>
          <!-- <el-menu-item index="contact" :disabled="!supplierId">
            <el-icon><Phone /></el-icon>
            <span>联系方式</span>
          </el-menu-item> -->
          <el-menu-item index="bank" :disabled="!supplierId">
            <el-icon><CreditCard /></el-icon>
            <span>银行账户</span>
          </el-menu-item>
          <el-menu-item index="qualification" :disabled="!supplierId">
            <el-icon><Folder /></el-icon>
            <span>相关资质</span>
          </el-menu-item>
          <el-menu-item index="performance" :disabled="!supplierId">
            <el-icon><Trophy /></el-icon>
            <span>项目业绩</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧内容区 -->
      <el-main class="content-area">
        <keep-alive>
          <component
            :is="currentComponent"
            :supplier-id="supplierId"
            :mode="mode"
            @save-success="handleSaveSuccess"
          />
        </keep-alive>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, Ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import BasicInfo from "./basic-infor.vue";
import SupplierServe from "./supplier-serve.vue";
import ContactWay from "./contact-way.vue";
import BankTable from "./bank-account.vue";
import RelateQualification from "./relate-qualification.vue";
import ProjectPerformance from "./project-performance.vue";

const route = useRoute();
const activeTab = ref("basic");
const supplierId = ref<number | null>(null);
const mode = ref<"add" | "edit" | "view">("add");

const tabComponents = {
  basic: BasicInfo,
  serve: SupplierServe,
  contact: ContactWay,
  bank: BankTable,
  qualification: RelateQualification,
  performance: ProjectPerformance,
};

const currentComponent = computed(() => tabComponents[activeTab.value]);

const syncRouteState = () => {
  const queryMode = route.query.mode as string;
  mode.value = queryMode === "edit" || queryMode === "view" ? queryMode : "add";
  const idValue = route.query.supplierId ? Number(route.query.supplierId) : null;
  supplierId.value = idValue || null;
  if (mode.value === "add") {
    activeTab.value = "basic";
  }
};

watch(
  () => [route.query.mode, route.query.supplierId],
  syncRouteState,
);

const handleTabChange = (tab) => {
  // 如果点击的是非基本信息菜单，且还没有供应商ID，则不允许切换
  if (tab !== "basic" && !supplierId.value) {
    ElMessage.warning("请先保存基本信息");
    return;
  }
  activeTab.value = tab;
};
// 新增供应商保存成功后的回调，只有先保存了供应商才能操作其他信息
const handleSaveSuccess = (id) => {
  supplierId.value = id;
  // 保存成功后跳转到下一个菜单
  activeTab.value = "serve";
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
