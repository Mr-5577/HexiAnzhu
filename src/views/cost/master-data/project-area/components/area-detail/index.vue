<!-- 面积详情 -->
<template>
  <div class="version-management-page">
    <div class="table-header">
      <div class="header-title">
        <span class="title">楼栋业态面积详情</span>
        <span class="subtitle"> 查看楼栋业态面积指标汇总 </span>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="modalVisible = true">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button type="primary">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>
    <base-table
      ref="tableRef"
      :columns="tableColumns"
      :tableData="tableList"
      rowKey="uuid"
      :loading="tableLoading"
      :showSummary="true"
      :pagination="false"
    >
    </base-table>

    <!-- 导入 -->
    <import-indicator-dialog v-model="modalVisible"></import-indicator-dialog>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import { ref, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import ImportIndicatorDialog from "./import-indicator-dialog.vue";
import { TableColumnItem } from "@/components/base/base-table.vue";
import { projectAreaApi } from "@/api/cost/project-area-api";

defineOptions({ name: "area-detail" });

// 定义 props
const props = defineProps<{
  projectId?: number;
}>();

// 数据
const tableLoading = ref(false);
const tableList = ref([]);
const modalVisible = ref(false);

// 表格列配置
const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "bldName", label: "楼栋名称" },
  { prop: "prodName", label: "业态名称" },
  {
    label: "建筑面积(m²)",
    children: [
      { prop: "agBuildArea", label: "地上", showSummary: true },
      { prop: "ugBuildArea", label: "地下", showSummary: true },
    ],
  },
  {
    label: "可售面积(m²)",
    children: [
      { prop: "agSaleArea", label: "地上", showSummary: true },
      { prop: "ugSaleArea", label: "地下", showSummary: true },
    ],
  },
  { prop: "houseNum", label: "户数", showSummary: true },
  { prop: "elvNum", label: "电梯数" },
];

// 加载数据
const loadData = async () => {
  try {
    tableLoading.value = true;
    tableList.value = [];
    const params = {
      prodId: props.projectId,
    };
    const res = await projectAreaApi.getAreaVerDList(params);
    if (res.code === 200) {
      const list = res.data || [];
      const newData = list.map((item) => {
        return {
          ...item,
          uuid: uuidv4(),
        };
      });
      tableList.value = newData;
    }
  } catch (error) {
    ElMessage.error("加载数据失败");
  } finally {
    tableLoading.value = false;
  }
};
watch(
  () => props.projectId,
  async (newVal) => {
    if (newVal) {
      loadData();
    }
  },
  { immediate: true, deep: true },
);

onMounted(() => {});

// 暴露方法给父组件
defineExpose({
  refresh: loadData,
});
</script>

<style lang="scss" scoped>
.version-management-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  padding: 20px 20px;
  box-sizing: border-box;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  .table-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 20px;
    .header-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
      .title {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }

      .subtitle {
        font-size: 14px;
        color: #909399;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;

      .version-count {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}
</style>
