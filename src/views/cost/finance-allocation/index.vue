<!-- 招标需求 -->
<template>
  <div class="finance-allocation-page">
    <!-- 支付明细 -->
    <el-card class="base-card" shadow="never">
      <div class="header-top">
        <h2>财务分摊</h2>
      </div>
      <div class="card-header">
        <span>
          <el-icon><List /></el-icon>
          报销明细
        </span>
        <div>
          <el-button
            type="primary"
            :loading="submitLoading"
            v-if="!props.isDialogMode && !isDetail"
            @click="handleSubmit"
          >
            确认分摊
          </el-button>
        </div>
      </div>

      <base-table
        :columns="mainColumns"
        :tableData="mainTableData"
        :rowKey="'uuid'"
        :pagination="false"
        :show-toolbar="false"
        :auto-height="false"
        :height="'100%'"
        :border="true"
        :stripe="true"
        :isExpandAll="true"
      >
        <!-- 展开行：显示明细子表格 -->
        <template #expand="{ row }">
          <div class="expand-table-wrapper">
            <div class="expand-title">拆分明细</div>
            <template v-if="!isDetail">
              <editable-table
                ref="getDedTableRef(row)"
                :row-key="'uuid'"
                v-model="row.finaDs"
                :columns="detailColumns"
                :pagination="false"
                :highlight-current-row="false"
                :show-summary="false"
                :compactEmpty="true"
                :editable="true"
                :on-save="handleSave"
                :max-height="'150px'"
              >
                <template #actions="{ row: detailRow, $index }">
                  <el-button
                    type="primary"
                    link
                    @click="handleSplitDetail(row, detailRow, $index)"
                  >
                    拆分
                  </el-button>
                  <el-button
                    type="danger"
                    link
                    :disabled="row.finaDs?.length <= 1"
                    @click="handleDeleteDetail(row, $index)"
                  >
                    删除
                  </el-button>
                </template>
              </editable-table>
            </template>

            <template v-else>
              <base-table
                :columns="viewColumns"
                :tableData="row.finaDs || []"
                :rowKey="'uuid'"
                :pagination="false"
                :show-toolbar="false"
                :auto-height="false"
                :max-height="'150px'"
                :border="true"
                :stripe="true"
                :isExpandAll="true"
                :compactEmpty="true"
              ></base-table>
            </template>
          </div>
        </template>

        <!-- 差额 -->
        <template #diffAmount="{ row }">
          <span :class="getDiffClass(getDiffAmount(row))">
            {{ formatMoney(getDiffAmount(row)) }}
          </span>
        </template>
      </base-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, shallowRef, computed, markRaw } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { List } from "@element-plus/icons-vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { largeScreenApi } from "@/api/sales/large-screen-api";
import { useRoute, useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import EditableTable from "@/components/base/editable-table.vue";
import { EditableColumn } from "@/components/base/editable-table.vue";
import { costAllocationApi } from "@/api/cost/contract-manage/cost-allocation-api";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import { buildTree } from "@/utils/tree";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { financeAllocationApi } from "@/api/cost/contract-manage/finance-allocation-api";
import { feePaymentApi } from "@/api/cost/non-contract-manage/fee-payment-api";

defineOptions({ name: "finance-allocation" });

interface Props {
  projId?: number; // 项目ID
  segId?: number; // 板块ID
  isDialogMode?: boolean; // 是否为弹窗模式
  dialogMode?: string; // 弹窗模式，edit  view
  payWayTable?: any[]; // 支付方式表格数据
}

const props = withDefaults(defineProps<Props>(), {
  projId: undefined,
  segId: undefined,
  isDialogMode: false, // 页面模式，默认非弹窗模式
  dialogMode: "edit", // 弹窗模式，edit  view
  payWayTable: () => [],
});

const router = useRouter();
const route = useRoute();

// 合同单据ID
const billId = route.query?.billId ? Number(route.query.billId) : undefined;
// 业务类型，例：NCON_FEE
const bizType = route.query?.bizType ? route.query.bizType : undefined;

const isEdit = computed(() => {
  return route.query.mode == "edit";
});
const isDetail = computed(() => {
  return route.query.mode == "view" || props.dialogMode == "view";
});

const lightweightDetail = ref({
  nconBillId: undefined,
  bizItemCode: "",
  bizItemName: "",
  bizNo: "",
  bizTitle: "",
  fee: {
    id: undefined,
    nconBillId: undefined,
    segId: undefined,
    projId: undefined,
  },
});

const submitLoading = ref(false);
// 科目列表
const subjectOptions = shallowRef([]);
// 组织列表
const orgOptions = shallowRef([]);

// 存储子表格ref的映射
const detailTableRefs = reactive<Record<string | number, any>>({});

// 获取子表格ref
const getDedTableRef = (row: any) => {
  return (el: any) => {
    if (el) {
      detailTableRefs[row.id] = el;
    }
  };
};
// 获取差额样式类（与之前保持一致）
const getDiffClass = (diff: number): string => {
  if (diff === 0) return "diff-zero";
  if (diff > 0) return "diff-positive";
  return "diff-negative";
};

// 获取明细合计
const getDetailTotal = (finaDs: any[]): number => {
  if (!finaDs || finaDs.length === 0) return 0;
  return finaDs.reduce((sum, item) => {
    const amount = parseFloat(item.finaSubAmt) || 0;
    return sum + amount;
  }, 0);
};

// 获取差额（主表金额 - 明细合计）
const getDiffAmount = (row: any): number => {
  const mainAmount = parseFloat(row.payAmt) || 0;
  const detailTotal = getDetailTotal(row.finaDs);
  return mainAmount - detailTotal;
};

// 格式化金额（保留两位小数，带千分位）
const formatMoney = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.00";
  }
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// 主表列配置
const mainColumns = computed<TableColumnItem[]>(() => [
  { type: "expand", width: "50", slot: "expand" },
  { type: "index", label: "序号", width: 60 },
  { prop: "payDesc", label: "摘要", minWidth: 200 },
  { prop: "payWayName", label: "付款方式", minWidth: 150 },
  { prop: "bankName", label: "收款开户行", minWidth: 150 },
  { prop: "accountName", label: "收款账户名", minWidth: 150 },
  { prop: "bankAccount", label: "收款账号", minWidth: 150 },
  { prop: "payAmt", label: "付款金额", minWidth: 120 },
  {
    slot: "diffAmount",
    label: "差额",
    minWidth: 120,
  },
]);

// 子表格列配置
const detailColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60 },
  {
    prop: "finaSubDesc",
    label: "摘要",
    minWidth: 120,
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "finaOrgId",
    label: "所属组织",
    minWidth: 100,
    editable: true,
    editType: "cascader",
    showOverflowTooltip: false,

    optionLabelField: "orgName",
    optionValueField: "id",
    options: orgOptions.value || [],
    showAllLevels: false,
    filterable: true, // 启用过滤
    cascaderProps: {
      children: "children", // 指定子节点字段名
      label: "orgName", // 指定标签字段名
      value: "id", // 指定值字段名
      emitPath: false, // 只返回叶子节点的值
      showAllLevels: false, // 不显示所有层级
      checkStrictly: false,
    },
  },
  {
    prop: "finaSubId",
    label: "科目名称",
    minWidth: 100,
    editable: true,
    editType: "cascader",
    showOverflowTooltip: false,

    optionLabelField: "subName",
    optionValueField: "id",
    options: subjectOptions.value || [],
    showAllLevels: false,
    cascaderProps: {
      children: "children", // 指定子节点字段名
      label: "subName", // 指定标签字段名
      value: "id", // 指定值字段名
      emitPath: false, // 只返回叶子节点的值
      showAllLevels: false, // 不显示所有层级
      checkStrictly: false,
      filterable: true, // 启用过滤
    },
  },
  {
    prop: "finaSubAmt",
    label: "金额",
    minWidth: 100,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    width: 180,
    slot: "actions",
    fixed: "right",
  },
]);
const viewColumns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "finaSubDesc", label: "摘要", minWidth: 120 },
  { prop: "finaOrgName", label: "所属组织", minWidth: 100 },
  { prop: "finaSubName", label: "科目名称", minWidth: 100 },
  { prop: "finaSubAmt", label: "金额", minWidth: 100 },
];

const mainTableData = ref([]);

// 保存单元格数据
const handleSave = async ({ row, column, newValue, oldValue, rowIndex }) => {
  console.log("保存行数据:", row, column, newValue, oldValue, rowIndex);
};

// 拆分明细（新增一行）
const handleSplitDetail = (parentRow: any, detailRow: any, index: number) => {
  // 创建新行，复制当前行的数据
  const newDetail = {
    uuid: uuidv4(),
    id: undefined,
    nconBillId: detailRow.nconBillId || undefined,
    payWayId: parentRow.payWayId,
    finaSubDesc: detailRow.finaSubDesc || "",
    finaOrgId: undefined,
    finaSubId: undefined,
    finaSubAmt: 0, // 金额默认为0
    pmWayId: detailRow.pmWayId,
  };

  parentRow.finaDs = [...parentRow.finaDs, newDetail];
};

// 删除明细
const handleDeleteDetail = async (parentRow: any, index: number) => {
  // 必须保留至少一行明细
  if (parentRow.finaDs.length <= 1) {
    ElMessage.warning("至少保留一行明细，无法删除");
    return;
  }
  parentRow.finaDs = parentRow.finaDs.filter(
    (_: any, i: number) => i !== index,
  );
};

// 校验单条明细是否完整
const validateDetailRow = (
  detailRow: any,
): { valid: boolean; message: string } => {
  // 定义必填字段列表
  const requiredFields = [
    { key: "finaSubDesc", label: "摘要" },
    { key: "finaOrgId", label: "所属组织" },
    { key: "finaSubId", label: "科目名称" },
    { key: "finaSubAmt", label: "金额" },
  ];

  for (const field of requiredFields) {
    const value = detailRow[field.key];
    // 检查是否为空：undefined、null、空字符串、NaN（对于数字）
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (typeof value === "number" && isNaN(value))
    ) {
      return {
        valid: false,
        message: `请填写 "${field.label}"`,
      };
    }
    // 金额特殊校验：必须大于0
    if (field.key === "finaSubAmt" && Number(value) <= 0) {
      return {
        valid: false,
        message: "金额必须大于 0",
      };
    }
  }

  return { valid: true, message: "" };
};

// 校验数据是否通过
const validateData = () => {
  // 先校验所有明细是否填写完整
  for (const row of mainTableData.value) {
    for (const detail of row.finaDs || []) {
      const { valid, message } = validateDetailRow(detail);
      if (!valid) {
        ElMessage.warning(message);
        return false; // ✅ 立即终止，不再继续执行
      }
    }
  }

  // 明细校验通过后，再校验差额
  for (const row of mainTableData.value) {
    const diff = getDiffAmount(row);
    if (diff !== 0) {
      ElMessage.warning(
        `报销事项 "${row.payDesc || row.tenderNo || "未命名"}" 存在差额，请检查明细金额`,
      );
      return false; // ✅ 立即终止
    }
  }

  return true;
};
// 提交确认支付
const handleSubmit = async () => {
  console.log("提交数据:", mainTableData.value);
  debugger;
  const allValid = validateData();
  if (allValid) {
    submitLoading.value = true;
    const detailList = mainTableData.value.flatMap((item) => item.finaDs || []);

    try {
      let res;
      // 根据业务类型选择接口
      if (bizType === "CON_PAY") {
        // 合同费用分摊保存
        res = await financeAllocationApi.saveConAlloc(detailList);
      } else if (bizType === "NCON_CST" || bizType === "NCON_FEE") {
        // 非合同费用分摊
        res = await financeAllocationApi.saveNconAlloc(detailList);
      } else {
        throw new Error(`未知的业务类型: ${bizType}`);
      }
      if (res.code === 200) {
        ElMessage.success("保存成功");
      }
    } catch (error) {
    } finally {
      submitLoading.value = false;
    }
  }
};

// 获取业务板块下的费用组织
const getFinaOrgListBySegId = async (segId: number) => {
  if (!segId) return;
  try {
    const res = await dictionaryApi.getFinaOrgList({ segId: segId });
    if (res.code === 200) {
      const list = res.data || [];
      const orgTreeData: any = buildTree(list);
      orgOptions.value = orgTreeData || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};
// 获取业务板块下的费用科目
const getFinaSubjectListBySegId = async (segId: number) => {
  if (!segId) return;
  try {
    const res = await dictionaryApi.getFinaSubjectList({ segId: segId });
    if (res.code === 200) {
      const list = res.data || [];
      const subTreeData: any = buildTree(list);
      subjectOptions.value = subTreeData || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};
const processData = (list) => {
  console.log("处理分摊数据", list);
  if (list && list.length > 0) {
    const data = list.map((item) => {
      // 判断 finaDs 是否有数据
      const hasFinaDs = item?.finaDs && item.finaDs.length > 0;
      let finaDs;
      if (hasFinaDs) {
        // 有数据：使用原有数据，记录补充 uuid
        finaDs = item.finaDs.map((fd: any) => ({
          ...fd,
          uuid: uuidv4(),
        }));
      } else {
        // 没有数据：添加一行默认数据
        if(!isDetail.value) {
          finaDs = [
            {
              uuid: uuidv4(),
              id: undefined,
              nconBillId: item.nconBillId,
              payWayId: undefined,
              pmWayId: props.isDialogMode ? undefined : item.id,
              finaSubDesc: item.payDesc,
              finaOrgId: undefined,
              finaSubId: undefined,
              finaSubAmt: item.payAmt || 0,
            },
          ];
        }
      }
      return {
        ...item,
        finaDs: finaDs,
      };
    });
    mainTableData.value = data; // 将处理后的数据赋值给 tableData
  }
};
// 获取轻量级的合同/非合同财务分摊详情
const getNconDetail = async () => {
  if (!billId) return;
  try {
    const res = await feePaymentApi.getNconInfoLite({ nconBillId: billId });
    console.log("详情", res);
    if (res.code == 200 && res.data) {
      const { fee } = res.data;
      lightweightDetail.value = { ...lightweightDetail.value, ...res.data };
      await getFinaOrgListBySegId(fee?.segId); // 获取业务板块下的费用组织
      await getFinaSubjectListBySegId(fee?.segId); // 获取业务板块下的费用科目
      // 根据业务类型获取对应详情
      switch (bizType) {
        case "NCON_CST": // 非合同建安支付
        case "NCON_FEE": // 非合同费用支付
          getNconFinanceAllocDetaiByBillId();
          break;
        case "CON_PAY": // 合同支付
          getConFinanceAllocDetaiByBillId();
          break;
        default:
          console.warn(`未知的业务类型: ${bizType}，请检查配置`);
          ElMessage.warning(
            `未知的业务类型: ${bizType},当前业务类型暂不支持查看详情`,
          );
          break;
      }
    }
  } catch (error) {}
};
// 通过传入的合同单据ID查询财务分摊数据进行分摊，查询分摊详情
const getConFinanceAllocDetaiByBillId = async () => {
  if (!billId) return;
  try {
    const res = await financeAllocationApi.getConAlloc({ conBillId: billId });
    console.log("合同分摊详情", res);
    if (res.code == 200) {
      const list = res.data || [];
      processData(list);
    }
  } catch (error) {}
};
// 通过传入的非合同单据ID查询财务分摊数据进行分摊，查询分摊详情
const getNconFinanceAllocDetaiByBillId = async () => {
  if (!billId) return;
  try {
    const res = await financeAllocationApi.getNconAlloc({ nconBillId: billId });
    console.log("非合同分摊详情", res);
    if (res.code == 200) {
      const list = res.data || [];
      processData(list);
    }
  } catch (error) {}
};

onMounted(async () => {
  // 判断是不是弹窗模式
  if (props.isDialogMode) {
    if (props?.segId) {
      await getFinaOrgListBySegId(props.segId); // 获取业务板块下的费用组织
      await getFinaSubjectListBySegId(props.segId); // 获取业务板块下的费用科目
    }
    if (props?.payWayTable && props?.payWayTable?.length > 0) {
      const list = props?.payWayTable || [];
      processData(list);
    }
  } else {
    console.log("OA模式");
    await getNconDetail();
  }
});

defineExpose({
  // 校验
  validateData: validateData,
  // 获取全部数据
  getData: () => mainTableData.value,
});
</script>

<style scoped lang="scss">
.finance-allocation-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
  background: #f3f4f6;
  font-size: 14px;
  height: 100vh;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .base-card {
    flex: 1;
    margin-bottom: 0;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 20px;
    }
  }

  .header-top {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    flex-shrink: 0;

    h2 {
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 15px;
    flex-shrink: 0;

    .el-icon {
      color: #2563eb;
      margin-right: 6px;
    }
  }

  .expand-table-wrapper {
    padding: 8px 0;

    .expand-title {
      font-size: 13px;
      font-weight: 500;
      color: #409eff;
      margin-bottom: 6px;
      padding-left: 8px;
      border-left: 3px solid #409eff;
    }
  }
}
// 差额颜色样式
.diff-zero {
  color: #67c23a; // 绿色
  font-weight: 600;
}

.diff-positive {
  color: #e6a23c; // 橙色（正差额）
  font-weight: 600;
}

.diff-negative {
  color: #f56c6c; // 红色（负差额）
  font-weight: 600;
}
</style>
