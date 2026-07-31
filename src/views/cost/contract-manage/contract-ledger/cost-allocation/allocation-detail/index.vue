<!-- 成本分摊-明细 -->
<template>
  <div class="allocation-detail-wrapper">
    <div class="detail-header">
      <el-button type="primary" icon="ArrowLeft" link @click="handleBack">
        返回
      </el-button>
      <el-divider direction="vertical" />
      <span class="header-title">成本分摊明细</span>
    </div>
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="科目" prop="subId">
        <el-select
          v-model="queryParams.subId"
          placeholder="请选择科目"
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
      <el-form-item label="业态" prop="prodId">
        <el-select
          v-model="queryParams.prodId"
          placeholder="请选择业态"
          clearable
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
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd"> 新增 </el-button>
      </el-form-item>
    </el-form>
    <base-table
      :columns="tableColumns"
      :tableData="tableData"
      :loading="tableLoading"
      :rowKey="'id'"
      :pagination="false"
    >
      <template #allocWarn="{ row }">
        {{ getAllocWarnLabel(row.allocWarn) }}
      </template>
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </base-table>
    <!-- 新增/编辑 成本分摊明细弹窗 -->
    <add-edit-detail-dialog
      v-model:="addEditDialog"
      :editData="editData"
      :conId="props.conId"
      :projId="props.projId"
      :allocMid="props.allocMid"
      :allocWarnOptions="allocWarnOptions"
      :productOptions="productOptions"
      :subjectOptions="subjectOptions"
      @success="getDataList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { costAllocationApi } from "@/api/cost/contract-manage/cost-allocation-api";
import { TableColumnItem } from "@/components/base/base-table.vue";
import AddEditDetailDialog from "./add-edit-detail-dialog.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { productTypeApi } from "@/api/cost/master-data/product-type-api.ts";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api.ts";

defineOptions({ name: "allocation-detail" });

const props = defineProps<{
  conId: number | null;
  projId: number | null;
  allocMid: number | null;
}>();

const emit = defineEmits<{
  back: [];
}>();

const subjectOptions = ref([]); // 科目列表
const productOptions = ref([]); // 业态列表
// 分摊预警选项
const allocWarnOptions = ref([
  { label: "红色预警", value: 0 },
  { label: "黄色预警", value: 1 }, // 超95%
  { label: "绿色预警", value: 2 },
]);

const queryParams = ref({
  subId: undefined, // 科目ID
  prodId: undefined, // 业态ID
});
const addEditDialog = ref(false);
const editData = ref(null);
const tableLoading = ref(false);
const tableData = ref([]);
const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "subName", label: "科目名称" },
  { prop: "prodName", label: "业态名称" },
  { prop: "allocAmt", label: "分摊总额(含税)" },
  { prop: "allocExclAmt", label: "分摊总额(不含税)" },
  { slot: "allocWarn", label: "分摊预警" },
  {
    label: "操作",
    width: 150,
    slot: "actions",
    fixed: "right",
  },
];

/**
 * 获取目标成本科目列表
 */
const getCostSubjectProjList = async () => {
  if (!props.projId) {
    ElMessage.warning("请先选择项目");
    return;
  }
  try {
    const res = await costCategoryApi.getCostSubjectProjList({
      projId: props.projId,
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
  if (!props.projId) return;
  try {
    const res = await productTypeApi.getProductProjList({
      projId: props.projId,
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

const getAllocWarnLabel = (value: number) => {
  const option = allocWarnOptions.value.find((item) => item.value === value);
  return option?.label || "";
};
const getDataList = async () => {
  if (!props.allocMid) return;
  try {
    tableLoading.value = true;
    tableData.value = [];
    const params = {
      ...queryParams.value,
      allocMid: props.allocMid,
    };
    const res = await costAllocationApi.getProjectAllocDList(params);
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
  } finally {
    tableLoading.value = false;
  }
};

const handleReset = () => {
  queryParams.value = {
    subId: undefined, // 科目ID
    prodId: undefined, // 业态ID
  };
  getDataList();
};

const handleSearch = () => {
  getDataList();
};

const handleAdd = () => {
  editData.value = null;
  addEditDialog.value = true;
};

const handleEdit = (row: any) => {
  editData.value = row;
  addEditDialog.value = true;
};

const handleDelete = async (row: any) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        const res = await costAllocationApi.delProjectAllocD({ id: row.id });
        if (res.code === 200) {
          ElMessage.success("删除成功");
          getDataList();
        }
      } catch (error) {
        console.error("删除失败:", error);
      }
    })
    .catch(() => {});
};
const handleBack = () => {
  emit("back");
};
// watch(
//   () => props.allocMid,
//   async (newVal) => {
//     if (newVal) {
//       await getCostSubjectProjList();
//       await getProductList();
//       await getDataList();
//     }
//   },
//   { immediate: true },
// );
onMounted(async () => {
  await getCostSubjectProjList();
  await getProductList();
  await getDataList();
});
</script>

<style lang="scss" scoped>
.allocation-detail-wrapper {
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
  .detail-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    gap: 12px;

    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
}
</style>
