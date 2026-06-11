<template>
  <div class="goal-cost-page">
    <!-- 城市-项目 -->
    <urban-project-tree
      ref="urbanProjectTreeRef"
      @select="handleProjectSelect"
    />

    <div class="right-content" v-if="selectedProjectId">
      <div class="detail-tab">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="目标成本版本" name="version" style="height: 100%">
            <cost-version
              v-if="activeTab === 'version'"
              :project-id="selectedProjectId"
            />
          </el-tab-pane>
          <el-tab-pane label="目标成本明细" name="detail" style="height: 100%">
            <cost-detail
              v-if="activeTab === 'detail'"
              :project-id="selectedProjectId"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <div class="right-content empty" v-else>
      <el-empty description="请从左侧选择项目" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import UrbanProjectTree from "@/components/business/urban-project-tree.vue";
import CostVersion from "./components/cost-version/index.vue";
import CostDetail from "./components/cost-detail/index.vue";
import { ProjectTreeNode } from "@/types/cost/master-data/project-area-type.ts";

defineOptions({ name: "goal-cost" });

// ref
const urbanProjectTreeRef = ref();
const selectedProjectId = ref<number | null>(null);
const activeTab = ref("version");

// 处理选中的项目
const handleProjectSelect = (project: ProjectTreeNode) => {
  // console.log("选中的项目数据:", project);
  console.log("选中项目ID:", urbanProjectTreeRef.value?.selectedProjectId);
  if (project) {
    selectedProjectId.value = project.orgId;
  } else {
    // console.log("已清空选中项目");
    selectedProjectId.value = null;
  }
};
onMounted(() => {});
</script>

<style lang="scss" scoped>
.goal-cost-page {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  background: #f0f2f6;

  .right-content {
    width: 100%;
    height: 100%;
    flex: 1;
    background: #fff;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &.empty {
      justify-content: center;
      align-items: center;
    }

    .detail-tab {
      flex: 1;
      padding: 0 15px 15px;
      box-sizing: border-box;
      overflow: hidden;
      :deep(.el-tabs) {
        height: 100%;
        display: flex;
        flex-direction: column;
        .el-tabs__header {
          margin: 0 0 16px 0;
          .el-tabs__active-bar {
            background-color: #409eff;
          }

          .el-tabs__item {
            font-size: 14px;

            &:hover {
              color: #409eff;
            }

            &.is-active {
              color: #409eff;
            }
          }
        }

        .el-tabs__content {
          flex: 1;
          overflow: hidden;
        }
      }

      .tab-placeholder {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        color: #909399;
        background: #fafafa;
        border-radius: 8px;
        border: 1px dashed #dcdfe6;
      }
    }
  }
}
</style>
