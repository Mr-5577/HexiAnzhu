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
          <el-icon>
            <List />
          </el-icon>
          报销明细
        </span>
        <div>
          <el-button type="primary" :loading="submitLoading" v-if="!props.isDialogMode && !isView"
            @click="handleSubmit">
            确认分摊
          </el-button>
        </div>
      </div>

      <base-table :columns="mainColumns" :tableData="mainTableData" :rowKey="'uuid'" :pagination="false"
        :show-toolbar="false" :auto-height="false" :height="'100%'" :border="true" :stripe="true" :isExpandAll="true">
        <!-- 展开行：显示明细子表格 -->
        <template #expand="{ row }">
          <div class="expand-table-wrapper">
            <div class="expand-title">拆分明细</div>
            <template v-if="!isView">
              <editable-table ref="getDedTableRef(row)" :row-key="'uuid'" v-model="row.finaDs" :columns="detailColumns"
                :pagination="false" :highlight-current-row="false" :show-summary="false" :compactEmpty="true"
                :editable="true" :on-save="handleSave" :max-height="'150px'">
                <template #actions="{ row: detailRow, $index }">
                  <el-button type="primary" link @click="handleSplitDetail(row, detailRow, $index)">
                    拆分
                  </el-button>
                  <!-- 必须保留一条数据并且regPayAmtSum已付金额大于0就不能删除 -->
                  <el-button type="danger" link :disabled="row.finaDs?.length <= 1 || detailRow?.regPayAmtSum > 0"
                    @click="handleDeleteDetail(row, $index)">
                    删除
                  </el-button>
                </template>
              </editable-table>
            </template>

            <template v-else>
              <base-table :columns="viewColumns" :tableData="row.finaDs || []" :rowKey="'uuid'" :pagination="false"
                :show-toolbar="false" :auto-height="false" :max-height="'150px'" :border="true" :stripe="true"
                :isExpandAll="true" :compactEmpty="true"></base-table>
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
import { buildTree } from "@/utils/tree";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { financeAllocationApi } from "@/api/cost/contract-manage/finance-allocation-api";
import { feePaymentApi } from "@/api/cost/non-contract-manage/fee-payment-api";
import { cstPaymentApi } from "@/api/cost/non-contract-manage/cst-payment-api";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { paymentRequestApi } from "@/api/cost/contract-manage/payment-application-api";

defineOptions({ name: "finance-allocation" });

interface Props {
  projId?: number; // 项目ID
  segId?: number; // 板块ID
  isDialogMode?: boolean; // 是否为弹窗模式
  payWayTable?: any[]; // 支付方式表格数据
  bizType?: string; // 业务类型，NCON_CST:非合同请款  NCON_FEE:非合同费用报销  CON_PAY:合同支付
}

const props = withDefaults(defineProps<Props>(), {
  projId: undefined,
  segId: undefined,
  isDialogMode: false, // 页面模式，默认非弹窗
  payWayTable: () => [],
  bizType: "NCON_CST", // 业务类型  NCON_CST:非合同请款  NCON_FEE:非合同费用报销  CON_PAY:合同支付
});

const router = useRouter();
const route = useRoute();

// 单据ID
const billId = route.query?.billId ? Number(route.query.billId) : undefined;
// 业务ID
const bizId = route.query?.bizId ? Number(route.query.bizId) : undefined;
// 业务类型，例：NCON_FEE
const bizType = route.query?.bizType ? route.query.bizType : "";

// 只要是erp页面弹窗打开就是查看模式，OA调用打开则根据参数mode控制
const isView = computed(() => {
  return route.query.mode == "view" || props.isDialogMode;
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
    // 有regPayAmtSum字段并且值大于0表示已支付，不可编辑
    disabled: (row: any) =>  row.regPayAmtSum,
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
    // 有regPayAmtSum字段并且值大于0表示已支付，不可编辑
    disabled: (row: any) =>  row.regPayAmtSum,
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
    // 有regPayAmtSum字段并且值大于0表示已支付，不可编辑
    disabled: (row: any) =>  row.regPayAmtSum,
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
  const isConPay = props.bizType === 'CON_PAY' || bizType === 'CON_PAY';
  const newDetail = {
    uuid: uuidv4(),
    id: undefined,
    payWayId: parentRow.payWayId,
    finaSubDesc: detailRow.finaSubDesc || "",
    finaOrgId: undefined,
    finaSubId: undefined,
    finaSubAmt: 0,
    pmWayId: detailRow.pmWayId,
    // 根据业务类型选择不同的账单ID字段
    ...(isConPay
      ? { conBillId: detailRow.conBillId || undefined }
      : { nconBillId: detailRow.nconBillId || undefined }
    ),
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
// 校验拆分明细是否已支付，有regPayAmtSum字段并且值大于0表示已支付
const validateDetails = (data: any[]) => {
  const errors: string[] = [];
  for (const item of data) {
    for (const detail of item.finaDs || []) {
      const { finaSubAmt, regPayAmtSum, finaSubDesc } = detail;
      // 只校验有 regPayAmtSum 字段且大于 0 的明细
      if (typeof regPayAmtSum === 'number' && regPayAmtSum > 0) {
        if (finaSubAmt <= 0) {
          errors.push(`金额必须大于0`);
        } else if (finaSubAmt > regPayAmtSum) {
          errors.push(`拆分明细“${finaSubDesc}”金额不能超过已付 ${regPayAmtSum}`);
        }
      }
    }
  }
  return { valid: !errors.length, msg: errors.join('；') };
};
// 提交确认支付
const handleSubmit = async () => {
  console.log("提交数据:", mainTableData.value);
  // 验拆分明细是否已支付，有regPayAmtSum字段并且值大于0表示已支付
  const { valid, msg } = validateDetails(mainTableData.value);
  if (!valid) {
    ElMessage.error(msg);
    return;
  }
  const allValid = validateData();
  if (!allValid) return

  if (allValid) {
    submitLoading.value = true;

    const detailList =
      mainTableData.value?.flatMap((item) => item.finaDs ?? []) ?? [];
    const newData = detailList.map((item) => ({
      ...item,
      allocStatus: 1, // 分摊状态,0-未分摊 1-已分摊 2-部分分摊
    }));

    try {
      let res;
      if (bizType === "CON_PAY") {
        // 合同支付财务分摊
        res = await financeAllocationApi.saveConAlloc(newData);
        if (res.code === 200) {
          res = await paymentRequestApi.saveConPayFlow({ billId: billId })
        }
      } else if (bizType === "NCON_CST") {
        // 非合同建安支付财务分摊
        res = await financeAllocationApi.saveNconAlloc(newData);
        if (res.code === 200) {
          // 分摊成功后更新流程
          res = await cstPaymentApi.saveNconCstPaymentFlow({
            id: bizId,
            allowEdit: true,
          });
        }
      } else if (bizType === "NCON_FEE") {
        // 非合同费用支付财务分摊
        res = await financeAllocationApi.saveNconAlloc(newData);
        if (res.code === 200) {
          // 分摊成功后更新流程
          res = await feePaymentApi.saveNconFeePaymentFlow({
            id: bizId,
            allowEdit: true,
          });
        }
      } else {
        throw new Error(`未知的业务类型: ${bizType}`);
      }

      if (res?.code === 200) {
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
// 处理合同支付财务分摊数据
const processConData = (list) => {
  console.log("处理合同支付分摊数据", list);
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
        if (!isView.value) {
          finaDs = [
            {
              uuid: uuidv4(),
              id: undefined,
              conBillId: item.conBillId,
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
// 处理非合同请款、费用报销财务分摊数据
const processNconData = (list) => {
  console.log("处理非合同财务分摊数据", list);
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
        if (!isView.value) {
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

// 获取轻量级财务分摊详情
const getAllocDetail = async () => {
  // 合同支付
  if (bizType === "CON_PAY") {
    getConAllocDetail();
  }
  // 非合同建安支付、费用报销
  if (bizType === "NCON_CST" || bizType === "NCON_FEE") {
    getNconAllocDetail();
  }
};
// 获取合同财务分摊详情
const getConAllocDetail = async () => {
  if (!billId) return;
  try {
    // 合同查询轻量级详情信息
    const res = await contractLedgerApi.getConInfoLite({ conBillId: billId });
    console.log("合同轻量级详情", res);
    if (res.code == 200 && res.data) {
      await getFinaOrgListBySegId(res.data?.segId); // 获取业务板块下的费用组织
      await getFinaSubjectListBySegId(res.data?.segId); // 获取业务板块下的费用科目
      getConFinanceAllocDetaiByBillId();
    }
  } catch (error) { }
}
// 获取非合同财务分摊详情
const getNconAllocDetail = async () => {
  if (!billId) return;
  try {
    // 非合同查询轻量级详情信息
    const res = await feePaymentApi.getNconInfoLite({ nconBillId: billId });
    console.log("非合同轻量级详情", res);
    if (res.code == 200 && res.data) {
      // 定义字段映射,非合同查看详情返回的字段名映射
      const fieldMapping = {
        NCON_CST: "payment", // 非合同建安支付
        NCON_FEE: "fee", // 费用报销
      };
      // 获取对应的字段名
      const dataKey = fieldMapping[bizType as string] || "";
      const detailData = dataKey ? res.data[dataKey] || null : null;
      if (detailData) {
        await getFinaOrgListBySegId(detailData?.segId); // 获取业务板块下的费用组织
        await getFinaSubjectListBySegId(detailData?.segId); // 获取业务板块下的费用科目
      }
      getNconFinanceAllocDetaiByBillId();
    }
  } catch (error) { }
}
// 通过传入的合同单据ID查询财务分摊数据进行分摊，查询分摊详情
const getConFinanceAllocDetaiByBillId = async () => {
  if (!billId) return;
  try {
    const res = await financeAllocationApi.getConAlloc({ conBillId: billId });
    console.log("合同分摊详情", res);
    if (res.code == 200) {
      const list = res.data || [];
      processConData(list);
    }
  } catch (error) { }
};
// 通过传入的非合同单据ID查询财务分摊数据进行分摊，查询分摊详情
const getNconFinanceAllocDetaiByBillId = async () => {
  if (!billId) return;
  try {
    const res = await financeAllocationApi.getNconAlloc({ nconBillId: billId });
    console.log("非合同分摊详情", res);
    if (res.code == 200) {
      const list = res.data || [];
      processNconData(list);
    }
  } catch (error) { }
};

onMounted(async () => {
  // 判断是不是弹窗模式
  if (props.isDialogMode) {
    console.log("弹窗模式");
    if (props?.segId) {
      await getFinaOrgListBySegId(props.segId); // 获取业务板块下的费用组织
      await getFinaSubjectListBySegId(props.segId); // 获取业务板块下的费用科目
    }
    if (props?.payWayTable && props?.payWayTable?.length > 0) {
      const list = props?.payWayTable || [];
      if (props.bizType === "CON_PAY") {
        processConData(list);
      } else {
        processNconData(list);
      }
    }
  } else {
    console.log("OA模式");
    await getAllocDetail();
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
