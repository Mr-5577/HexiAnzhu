<template>
  <div class="basic-info-section">
    <h3 class="basic-title">基本信息</h3>
    <el-descriptions :column="4" border :size="'default'">
      <el-descriptions-item label="项目" :span="2">
        {{ getProjectNames() }}
      </el-descriptions-item>
      <el-descriptions-item label="业务板块">
        {{ tenderData?.segName || "-" }}
      </el-descriptions-item>
      <!-- <el-descriptions-item label="公司">
        {{ tenderData?.company || "-" }}
      </el-descriptions-item> -->
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

      <el-descriptions-item label="计划金额">
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
        {{ tenderData?.dutyMan || "-" }}
      </el-descriptions-item>

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
    // 使用表格布局自动调整
    .el-descriptions__table {
      table-layout: auto !important;
    }
    .el-descriptions__label {
      background-color: #f5f7fa;
      font-weight: 500;
      width: 1%;  // 让label占用最小宽度
      white-space: nowrap;  // 防止文字换行
    }

    .el-descriptions__content {
      background-color: #fff;
    }
  }
}
</style>
