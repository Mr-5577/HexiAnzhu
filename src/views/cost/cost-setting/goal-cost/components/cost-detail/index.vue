<!-- 目标成本明细列表 -->
<template>
  <div class="cost-detail-page">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="目标成本版本" prop="costMid">
        <el-select
          v-model="queryParams.costMid"
          placeholder="请选择目标成本版本"
          clearable
          filterable
          style="width: 200px"
        >
          <el-option
            v-for="item in costVersionOptions"
            :key="item.id"
            :label="item.versionNo"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="成本科目" prop="subId">
        <el-select
          v-model="queryParams.subId"
          placeholder="请选择成本科目"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="item in subjectOptions"
            :key="item.id"
            :label="item.subName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="产品类型" prop="prodId">
        <el-select
          v-model="queryParams.prodId"
          placeholder="请选择产品类型"
          clearable
          filterable
          style="width: 200px"
        >
          <el-option
            v-for="item in productOptions"
            :key="item.id"
            :label="item.prodName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">
          搜索
        </el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd"> 新增明细 </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <base-table
      :columns="columns"
      :tableData="tableData"
      :loading="tableLoading"
      :rowKey="'id'"
      :pagination="false"
    >
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </base-table>

    <!-- 新增/编辑弹窗 -->
    <add-edit-detail-dialog
      v-model="dialogVisible"
      :project-id="projectId"
      :edit-data="currentEditData"
      :costVersionOptions="costVersionOptions"
      :subjectOptions="subjectOptions"
      :productOptions="productOptions"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import type {
  HCstProjectCostD,
  HCstProjectCostM,
} from "@/types/cost/goal-cost-type.ts";
import AddEditDetailDialog from "./add-edit-detail-dialog.vue";
import { goalCostApi } from "@/api/cost/goal-cost-api.ts";
import { costCategoryApi } from "@/api/cost/cost-category-api.ts";
import { productTypeApi } from "@/api/cost/product-type-api.ts";
import { formatNumberDisplay } from "@/utils/common.ts";

defineOptions({ name: "cost-detail" });

// Props
const props = defineProps<{
  projectId: number;
}>();

// 查询参数
const queryParams = ref({
  costMid: undefined as number | undefined,
  subId: undefined as number | undefined,
  prodId: undefined as number | undefined,
});

// 表格相关
const tableLoading = ref(false);
const tableData = ref<HCstProjectCostD[]>([]);

// 弹窗相关
const dialogVisible = ref(false);
const currentEditData = ref<HCstProjectCostD | null>(null);

// 下拉选项数据
const costVersionOptions = ref<HCstProjectCostM[]>([]); // 目标成本版本选项
const subjectOptions = ref<any[]>([]); // 科目选项
const productOptions = ref<any[]>([]); // 业态选项

// 表格列配置
const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: "60" },
  { prop: "subName", label: "科目名称", minWidth: "150" },
  { prop: "prodName", label: "产品名称", width: "120" },
  //   { prop: "busiSegName", label: "业务归属", width: "100" },
  {
    prop: "costAmt",
    label: "目标成本(含税)",
    width: "150",
    formatter: (row: HCstProjectCostD) => formatNumberDisplay(row.costAmt),
  },
  {
    prop: "costExclAmt",
    label: "目标成本(不含税)",
    width: "150",
    formatter: (row: HCstProjectCostD) => formatNumberDisplay(row.costExclAmt),
  },
  {
    prop: "costDynAmt",
    label: "动态成本(含税)",
    width: "150",
    formatter: (row: HCstProjectCostD) => formatNumberDisplay(row.costDynAmt),
  },
  {
    prop: "costDynExclAmt",
    label: "动态成本(不含税)",
    width: "150",
    formatter: (row: HCstProjectCostD) =>
      formatNumberDisplay(row.costDynExclAmt),
  },
  { prop: "allocRuleName", label: "分摊规则", width: "120" },
  { label: "操作", width: 150, slot: "actions", fixed: "right" },
];

// 获取数据列表
const getDataList = async () => {
  if (!props.projectId) return;
  try {
    tableLoading.value = true;
    const res = await goalCostApi.getProjectCostDList(queryParams.value);
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  getDataList();
};

// 重置
const handleReset = () => {
  queryParams.value = {
    costMid: undefined,
    subId: undefined,
    prodId: undefined,
  };
  handleSearch();
};

// 新增
const handleAdd = () => {
  currentEditData.value = null;
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: HCstProjectCostD) => {
  currentEditData.value = row;
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row: HCstProjectCostD) => {
  try {
    await ElMessageBox.confirm(`确定删除明细"${row.subName}"吗？`, "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });

    const res = await goalCostApi.delProjectCostD({ id: row.id });
    if (res.code === 200) {
      ElMessage.success("删除成功");
      getDataList();
    } else {
      ElMessage.error(res.message || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
    }
  }
};

// 操作成功回调
const handleSuccess = () => {
  dialogVisible.value = false;
  getDataList();
};

// 获取目标成本版本列表
const getCostVersionList = async () => {
  if (!props.projectId) return;
  try {
    const res = await goalCostApi.getProjectCostMList({
      projId: props.projectId,
    });
    if (res.code === 200) {
      costVersionOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取成本版本列表失败:", error);
  }
};
/**
 * 获取目标成本科目列表
 */
const getSubjectProjList = async () => {
  if (!props.projectId) return;
  try {
    const res = await costCategoryApi.getCostSubjectProjList({
      projId: props.projectId,
      withDetail: true,
    });
    if (res.code === 200) {
      subjectOptions.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取数据失败:", error);
  }
};
// 获取项目产品类型
const getProductList = async () => {
  if (!props.projectId) return;
  try {
    const res = await productTypeApi.getProductProjList({
      projId: props.projectId,
      withDetail: true,
    });
    if (res.code === 200) {
      productOptions.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取业态列表失败:", error);
  }
};

// 监听projectId变化
watch(
  () => props.projectId,
  async (newVal) => {
    if (newVal) {
      await Promise.all([
        getCostVersionList(),
        getSubjectProjList(),
        getProductList(),
      ]);
      getDataList();
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.cost-detail-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px;
  box-sizing: border-box;
  background: #fff;

  :deep(.el-form) {
    margin-bottom: 16px;
  }
}
</style>
