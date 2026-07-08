<!-- 目标成本明细列表 -->
<template>
  <div class="cost-detail-page">
    <template v-if="!isDetail">
      <div class="toolbar">
        <el-button
          type="primary"
          :loading="saveLoading"
          @click="handleBatchSave"
        >
          批量保存
        </el-button>
      </div>
      <editable-table
        ref="detailtableRef"
        :row-key="'uuid'"
        v-model="tableData"
        :columns="dynamicColumns"
        :loading="tableLoading"
        :pagination="false"
        :highlight-current-row="false"
        :show-summary="false"
        :compactEmpty="true"
        :on-save="handleSave"
      >
      </editable-table>
    </template>
    <template v-else>
      <base-table
        :columns="columns"
        :tableData="tableList"
        :rowKey="'id'"
        :pagination="false"
      >
        <template #allocRule="{ row }">
          {{ getAllocRuleName(row.allocRule) }}
        </template>
      </base-table>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import type { HCstProjectCostD } from "@/types/cost/cost-setting/goal-cost-type.ts";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api.ts";
import { productTypeApi } from "@/api/cost/master-data/product-type-api.ts";
import { useRoute } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";

defineOptions({ name: "cost-detail-list" });

const route = useRoute();

const mode = ref<"add" | "edit" | "detail">("add");
const projId = ref(null);
const costMid = ref(null);

const isDetail = computed(() => route.query.mode === "detail");

const saveLoading = ref(false);
// 表格相关
const tableLoading = ref(false);
const tableData = ref<HCstProjectCostD[]>([]);

// 下拉选项数据
const subjectOptions = ref([]); // 科目选项
const productOptions = ref([]); // 业态选项
const busiSegOptions = ref([]); // 业务归属选项
// 分摊规则
const allocRuleOptions = ref([
  { value: "RL_ALL", label: "按产品面积分摊" },
  { value: "RL_UP", label: "按地上产品面积分摊" },
  { value: "RL_DOWN", label: "按地下产品面积分摊" },
  { value: "RL_RF", label: "按地下人防面积分摊" },
  { value: "RL_NRF", label: "按地下非人防面积分摊" },
  { value: "RL_HS", label: "按户数分摊" },
  { value: "RL_DTS", label: "按电梯数分摊" },
]);

const dynamicColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "prodName",
    label: "业态",
    editable: false,
    showOverflowTooltip: true,
    align: "center",
  },
  {
    prop: "subName",
    label: "成本科目",
    editable: false,
    showOverflowTooltip: true,
    align: "center",
  },
  {
    prop: "busiSegId",
    label: "业务归属",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "segName",
    optionValueField: "id",
    options: busiSegOptions.value,
  },
  {
    prop: "costAmt",
    label: "目标成本总额(含税)",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "costExclAmt",
    label: "目标成本总额(不含税)",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "allocRule",
    label: "分摊规则",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "label",
    optionValueField: "value",
    options: allocRuleOptions.value,
  },
]);

const tableList = ref([]);
const columns = [
  { type: "index", label: "序号", width: 60, editable: false },
  { prop: "prodName", label: "业态" },
  { prop: "subName", label: "成本科目" },
  { prop: "busiSegName", label: "业务归属" },
  { prop: "costAmt", label: "目标成本总额(含税)" },
  { prop: "costExclAmt", label: "目标成本总额(不含税)" },
  { slot: "allocRule", label: "分摊规则" },
];

const getAllocRuleName = (allocRule: string) => {
  const target = allocRuleOptions.value.find(
    (item) => item.value === allocRule,
  );
  return target ? target.label : "";
};
/**
 * 获取目标成本科目列表
 */
const getSubjectProjList = async () => {
  try {
    const res = await costCategoryApi.getCostSubjectProjList({
      projId: projId.value,
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
  try {
    const res = await productTypeApi.getProductProjList({
      projId: projId.value,
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
// 获取业务归属
const getBusiSegList = async () => {
  try {
    const res = await dictionaryApi.getsegmentList();
    if (res.code === 200) {
      busiSegOptions.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取业态列表失败:", error);
  }
};

// 生成所有科目和业态的组合并生产table列表
const generateCombinations = () => {
  let listData = [];
  productOptions.value.forEach((product) => {
    subjectOptions.value.forEach((subject) => {
      listData.push({
        uuid: uuidv4(),
        prodId: product.id,
        prodName: product.prodName,
        subId: subject.id,
        subName: subject.subName,
        busiSegId: null,
        busiSegName: "",
        costAmt: null,
        costExclAmt: null,
        allocRule: null,
        allocRuleName: "",
      });
    });
  });
  tableData.value = listData;
};

const handleSave = async (data: any) => {
  const { row, column, newValue, oldValue, rowIndex } = data;
  // 选择业务归属
  if (column === "busiSegId") {
    if (newValue) {
      const targetData = busiSegOptions.value.find(
        (item) => item.id == newValue,
      );
      const newTableList = [...tableData.value];
      if (targetData) {
        newTableList[rowIndex] = {
          ...row,
          busiSegName: targetData.segName,
        };
        tableData.value = newTableList;
      }
    } else {
      // 如果清空选项
      const newTableList = [...tableData.value];
      newTableList[rowIndex] = {
        ...row,
        busiSegName: "",
      };
      tableData.value = newTableList;
    }
  }
  // 选择分摊规则
  if (column === "allocRule") {
    if (newValue) {
      const targetData = allocRuleOptions.value.find(
        (item) => item.value == newValue,
      );
      const newTableList = [...tableData.value];
      if (targetData) {
        newTableList[rowIndex] = {
          ...row,
          allocRuleName: targetData.label,
        };
        tableData.value = newTableList;
      }
    } else {
      // 如果清空选项
      const newTableList = [...tableData.value];
      newTableList[rowIndex] = {
        ...row,
        allocRuleName: "",
      };
      tableData.value = newTableList;
    }
  }
};

// 校验价税明细表
const validateTable = () => {
  if (tableData.value.length === 0) {
    ElMessage.error("暂无保存的数据");
    return false;
  }
  for (let i = 0; i < tableData.value.length; i++) {
    const item = tableData.value[i];
    if (!item.costAmt || item.costAmt <= 0) {
      ElMessage.error(`第${i + 1}行：目标成本总额(含税)必须大于0`);
      return false;
    }
    if (!item.costExclAmt || item.costExclAmt <= 0) {
      ElMessage.error(`第${i + 1}行：目标成本总额(不含税)必须大于0`);
      return false;
    }
  }
  return true;
};

const handleBatchSave = async () => {
  console.log("保存", tableData.value);
  // 校验列表
  // if (!validateTable()) return;
  try {
    saveLoading.value = true;
    const res = await goalCostApi.batchSaveProjectCostD(
      costMid.value,
      tableData.value,
    );
    if (res.code === 200) {
      ElMessage.success("保存成功");
    }
  } catch (error) {
  } finally {
    saveLoading.value = false;
  }
};

const syncRouteState = async () => {
  const queryMode = route.query.mode as string;
  mode.value = queryMode === "detail" ? queryMode : "add";

  const projIdValue = route.query.projId ? Number(route.query.projId) : null;
  projId.value = projIdValue || null;

  const costMidValue = route.query.costMid ? Number(route.query.costMid) : null;
  costMid.value = costMidValue || null;

  if (mode.value === "detail") {
    try {
      tableList.value = [];
      const res = await goalCostApi.getProjectCostDList({
        costMid: costMid.value,
      });
      if (res.code === 200) {
        tableList.value = res.data || [];
      } else {
        ElMessage.error(res.msg || "获取数据失败");
      }
    } catch (error) {
      console.error("获取业态列表失败:", error);
    }
  } else {
    getBusiSegList(); // 获取业务归属
    try {
      // 并行获取科目和业态数据
      await Promise.all([getSubjectProjList(), getProductList()]);
      // 组合列表数据
      generateCombinations();
    } catch (error) {}
  }
};

onMounted(() => {
  syncRouteState();
});
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
  .toolbar {
    margin-bottom: 16px;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;

    .tip-text {
      color: #909399;
      font-size: 14px;
      margin-left: 20px;
    }
  }
}
</style>
