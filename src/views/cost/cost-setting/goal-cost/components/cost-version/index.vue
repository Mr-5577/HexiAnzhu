<!-- 版本列表 -->
<template>
  <div class="version-list-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="版本编号" prop="versionNo">
        <el-input
          v-model="queryParams.versionNo"
          placeholder="请输入版本编号"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="版本类型" prop="versionType">
        <el-select
          v-model="queryParams.versionType"
          placeholder="请选择版本类型"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="item in verTypeOptions"
            :key="item.dicCode"
            :label="item.dicLabel"
            :value="item.dicCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">
          搜索
        </el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增版本</el-button>
      </el-form-item>
    </el-form>

    <base-table
      :columns="tableColumns"
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
    <add-edit-version-dialog
      v-model="dialogVisible"
      :project-id="props.projectId"
      :edit-data="currentEditData"
      :verTypeOptions="verTypeOptions"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import type { HCstProjectCostM } from "@/types/cost/cost-setting/goal-cost-type.ts";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api.ts";
import AddEditVersionDialog from "./add-edit-version-dialog.vue";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";

defineOptions({ name: "cost-version" });

// Props
const props = defineProps<{
  projectId: number;
}>();

const verTypeOptions = ref([]); // 目标成本版本类型
// 数据字典
const { getDictList, loadDicts } = useDict(
  [
    dictMapping.goalCostVersionType, // 目标成本版本类型
  ],
  {
    treeDictCodes: [],
  },
);

// 查询参数
const queryParams = ref({
  projId: props.projectId,
  versionNo: "",
  versionType: "",
});

// 表格相关
const tableLoading = ref(false);
const tableData = ref<HCstProjectCostM[]>([]);

// 弹窗相关
const dialogVisible = ref(false);
const currentEditData = ref<HCstProjectCostM | null>(null);

// 表格列配置
const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: "60" },
  { prop: "versionNo", label: "版本号", minWidth: 200 },
  { prop: "versionTypeName", label: "版本类型", width: "120" },
  {
    prop: "costAmt",
    label: "目标成本总额(含税)",
    width: 150,
    formatter: (row: HCstProjectCostM) => {
      return row.costAmt?.toLocaleString() || "-";
    },
  },
  {
    prop: "costExclAmt",
    label: "目标成本总额(不含税)",
    width: 180,
    formatter: (row: HCstProjectCostM) => {
      return row.costExclAmt?.toLocaleString() || "-";
    },
  },
  {
    prop: "costDynAmt",
    label: "动态成本总额(含税)",
    width: 150,
    formatter: (row: HCstProjectCostM) => {
      return row.costDynAmt?.toLocaleString() || "-";
    },
  },
  {
    prop: "costDynExclAmt",
    label: "动态成本总额(不含税)",
    width: 180,
    formatter: (row: HCstProjectCostM) => {
      return row.costDynExclAmt?.toLocaleString() || "-";
    },
  },
  { prop: "segName", label: "业务板块", width: 120 },
  {
    prop: "isEnabled",
    label: "当前使用",
    width: "100",
    formatter: (row: HCstProjectCostM) => {
      return row.isEnabled ? "是" : "否";
    },
  },
  { prop: "remark", label: "备注", width: 200 },
  { label: "操作", width: 150, slot: "actions", fixed: "right" },
];

// 获取数据列表
const getDataList = async () => {
  try {
    tableLoading.value = true;
    const res = await goalCostApi.getProjectCostMList(queryParams.value);
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取列表失败:", error);
    ElMessage.error("获取列表失败");
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
    projId: props.projectId,
    versionNo: "",
    versionType: "",
  };
  handleSearch();
};

// 新增
const handleAdd = () => {
  currentEditData.value = null;
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: HCstProjectCostM) => {
  currentEditData.value = row;
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row: HCstProjectCostM) => {
  try {
    await ElMessageBox.confirm(`确定删除版本"${row.versionNo}"吗？`, "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });

    const res = await goalCostApi.delProjectCostM({ id: row.id });
    if (res.code === 200) {
      ElMessage.success("删除成功");
      getDataList();
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
  getDataList();
};

// 初始化数据字典数据
const initDictData = async () => {
  await loadDicts();
  verTypeOptions.value = getDictList(dictMapping.goalCostVersionType); // 目标成本版本类型
};

watch(
  () => props.projectId,
  async (newVal) => {
    if (newVal) {
      queryParams.value.projId = newVal;
      await initDictData();
      getDataList();
    }
  },
  { immediate: true },
);

onMounted(() => {});
</script>

<style lang="scss" scoped>
.version-list-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #fff;
}
</style>
