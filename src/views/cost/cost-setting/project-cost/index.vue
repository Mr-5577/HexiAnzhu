<!-- 项目成本业态 -->
<template>
  <div class="project-cost-page">
    <!-- 城市-项目 -->
    <urban-project-tree
      ref="urbanProjectTreeRef"
      @select="handleProjectSelect"
    />

    <div class="right-content" v-if="selectedProjectId">
      <base-table
        :columns="columns"
        :tableData="tableData"
        :loading="loading"
        :total="total"
        :rowKey="'treeId'"
        :current-page="currentPage"
        :page-size="pageSize"
        :pagination="false"
        @pagination-change="handlePaginationChange"
        :isExpandAll="isExpandAll"
      >
        <template #actionBar>
          <div class="actionBar-buttons">
            <el-button type="primary" plain @click="modalVisible = true">
              选择项目产品
            </el-button>
          </div>
        </template>
        <!-- 自定义插槽 ==> scope 包含：row, column, $index 等 -->
        <template #actions="{ row }">
          <el-button type="danger" link> 删除 </el-button>
        </template>
      </base-table>

      <product-selection-dialog
        v-model="modalVisible"
      ></product-selection-dialog>
    </div>

    <div class="right-content empty" v-else>
      <el-empty description="请从左侧选择项目" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import ProductSelectionDialog from "./product-selection-dialog.vue";
import { ProjectTreeNode } from "@/types/cost/master-data/project-area-type.ts";
import UrbanProjectTree from "@/components/business/urban-project-tree.vue";

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "project-cost" });

// 左侧树相关
const urbanProjectTreeRef = ref(null);
const selectedProjectId = ref<number | null>(null);

const modalVisible = ref(false);
const isExpandAll = ref(false);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);
const columns: TableColumnItem[] = [
  { prop: "orgName", label: "项目", align: "left" },
  { prop: "orgName1", label: "产品类别" },
  { prop: "orgName1", label: "产品名称" },
  { prop: "orgName1", label: "说明" },
  { label: "操作", prop: "actions", width: 180, slot: "actions" },
];

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

// 获取数据列表
const getDataList = async () => {
  try {
    loading.value = true;
    // TODO: 调用实际的API获取数据
    // const res = await yourApi.getList(queryParams.value);
    // tableData.value = res.data;
    // total.value = res.total;
  } finally {
    loading.value = false;
  }
};

// 分页变化
const handlePaginationChange = (params: any) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
  getDataList();
};

onMounted(() => {});
</script>

<style lang="scss" scoped>
.project-cost-page {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  background: #f0f2f6;

  .right-content {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 15px;
    box-sizing: border-box;
    &.empty {
      justify-content: center;
      align-items: center;
    }
    .actionBar-buttons {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    :deep(.base-table) {
      flex: 1;
      overflow: auto;
    }
  }
}
</style>
