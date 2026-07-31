<template>
  <div class="basic-info-section">
    <el-descriptions :column="4" border :size="'default'" class="first-table">

      <el-descriptions-item label="项目" :span="2">
        {{ getProjectNames() }}
      </el-descriptions-item>
      <el-descriptions-item label="业务板块">
        {{ tenderData?.segName || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="合同分类">
        {{ tenderData?.conTypeName || "-" }}
      </el-descriptions-item>

      <el-descriptions-item label="采购事项" :span="2">
        {{ tenderData?.tenderName || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="采购方式">
        {{ tenderData?.purchaseMethodName || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="招标方式">
        {{ tenderData?.tenderMethodName || "-" }}
      </el-descriptions-item>

      <el-descriptions-item label="计划金额(元)">
        {{ tenderData?.planAmount || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="清单模式">
        {{ tenderData?.billModeName || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="需求时间">
        {{ tenderData?.demandDate || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="招采开始日期">
        {{ tenderData?.bidStartDate || "-" }}
      </el-descriptions-item>

      <el-descriptions-item label="招采结束日期">
        {{ tenderData?.bidEndDate || "-" }}
      </el-descriptions-item>
      <el-descriptions-item label="招采责任人">
        {{ tenderData?.createName || "-" }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 事项说明单独一个表格 -->
    <el-descriptions
      :column="4"
      border
      :size="'default'"
      style="margin-top: -1px"
      class="second-table"
    >
      <el-descriptions-item label="事项说明" :span="4">
        {{ tenderData?.tenderRemark || "-" }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Props - 接收完整的数据结构
const props = withDefaults(
  defineProps<{
    data?: any;
    projectOptions?: any[];
  }>(),
  {
    data: null,
    projectOptions: () => [],
  },
);

// 获取 tender 数据
const tenderData = computed(() => props.data?.tender || null);

// 获取所有项目名称
const getProjectNames = () => {
  if (!props.data?.projIds || props.data.projIds.length === 0) return "-";
  if (!props.projectOptions || props.projectOptions.length === 0) return "-";

  // 匹配项目名称
  const projectNames = props.data.projIds
    .map((projId: number) => {
      const project = props.projectOptions.find(
        (item: any) => item.id == projId,
      );
      return project?.projName || `项目ID:${projId}`;
    })
    .filter(Boolean);

  return projectNames.length > 0 ? projectNames.join("、") : "-";
};
</script>

<style scoped lang="scss">
.basic-info-section {
  margin-bottom: 20px;

  .basic-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
    margin-bottom: 10px;
  }

  :deep(.el-descriptions) {
    .el-descriptions__table {
      table-layout: auto !important;
    }

    .el-descriptions__label {
      background-color: #f5f7fa;
      font-weight: 500;
      width: 110px !important; // 设置固定宽度
      min-width: 110px !important;
      max-width: 110px !important;
      white-space: nowrap;
    }

    .el-descriptions__content {
      background-color: #fff;
    }
  }

  // 第二个表格去掉顶部边框，与第一个表格无缝连接
  :deep(.second-table) {
    .el-descriptions__table {
      // border-top: none !important;
    }

    // 去掉顶部边框线
    td:first-child,
    td:last-child {
      // border-top: none !important;
    }
  }
}
</style>
