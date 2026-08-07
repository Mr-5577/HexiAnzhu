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
          <!-- <el-button plain type="primary"  @click="handleAddPay">
            新增
          </el-button> -->
          <el-button
            type="primary"
            v-if="!props.isDialogMode"
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
      >
        <!-- 展开行：显示明细子表格 -->
        <template #expand="{ row }">
          <div class="expand-table-wrapper">
            <div class="expand-title">拆分明细</div>
            <editable-table
              ref="getDedTableRef(row)"
              :row-key="'uuid'"
              :height="'200px'"
              v-model="row.finaDs"
              :columns="detailColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :editable="true"
              :on-save="handleSave"
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
            <!-- 明细底部统计 -->
            <div class="detail-footer">
              <div class="footer-item total">
                <span>支付金额</span>
                <strong>
                  {{ formatMoney(parseFloat(row.payAmt) || 0) }}
                </strong>
              </div>
              <div class="footer-divider"></div>
              <div class="footer-item total">
                <span>支付明细合计</span>
                <strong>
                  {{ formatMoney(getDetailTotal(row.finaDs)) }}
                </strong>
              </div>
              <div class="footer-divider"></div>
              <div
                class="footer-item diff"
                :class="getDiffClass(getDiffAmount(row))"
              >
                <span>差额</span>
                <strong>{{ formatMoney(getDiffAmount(row)) }}</strong>
              </div>
            </div>
          </div>
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
import { useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import EditableTable from "@/components/base/editable-table.vue";
import { EditableColumn } from "@/components/base/editable-table.vue";
import { costAllocationApi } from "@/api/cost/contract-manage/cost-allocation-api";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import { buildTree } from "@/utils/tree";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";

defineOptions({ name: "finance-allocation" });

interface Props {
  projId?: number; // 项目ID
  segId?: number; // 板块ID
  isDialogMode?: boolean; // 是否为弹窗模式
  payWayTable?: any[]; // 支付方式表格数据
}

const props = withDefaults(defineProps<Props>(), {
  projId: undefined,
  segId: undefined,
  isDialogMode: false, // 页面模式，默认非弹窗模式
  payWayTable: () => [],
});

const router = useRouter();

// 项目列表
const projectOptions = ref([]);
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

// 主表列配置
const mainTableData = ref([]);
const mainColumns: TableColumnItem[] = [
  { type: "expand", width: "50", slot: "expand" },
  { type: "index", label: "序号", width: 60 },
  { prop: "payDesc", label: "摘要", minWidth: 200 },
  { prop: "payWayName", label: "付款方式", minWidth: 150 },
  { prop: "bankName", label: "收款开户行", minWidth: 150 },
  { prop: "accountName", label: "收款账户名", minWidth: 150 },
  { prop: "bankAccount", label: "收款账号", minWidth: 150 },
  { prop: "payAmt", label: "付款金额", minWidth: 120 },
];

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

// 获取差额样式类
const getDiffClass = (diff: number): string => {
  if (diff === 0) return "diff-zero";
  if (diff > 0) return "diff-positive";
  return "diff-negative";
};

// 保存单元格数据
const handleSave = async ({ row, column, newValue, oldValue, rowIndex }) => {
  console.log("保存行数据:", row, column, newValue, oldValue, rowIndex);
};

// 拆分明细（新增一行）
const handleSplitDetail = (parentRow: any, detailRow: any, index: number) => {
  // console.log(parentRow, detailRow, index);
  // 创建新行，复制当前行的数据
  const newDetail = {
    uuid: uuidv4(),
    id: undefined,
    nconBillId: undefined,
    payWayId: detailRow.payWayId,
    finaSubDesc: detailRow.finaSubDesc || "",
    finaOrgId: undefined,
    finaSubId: undefined,
    finaSubAmt: 0, // 金额默认为0
  };

  // 在当前行后面插入
  // parentRow.finaDs.splice(index + 1, 0, newDetail);
  // 再最后面插入
  // parentRow.finaDs.push(newDetail);
  parentRow.finaDs = [...parentRow.finaDs, newDetail];
};

// 删除明细
const handleDeleteDetail = async (parentRow: any, index: number) => {
  // 必须保留至少一行明细
  if (parentRow.finaDs.length <= 1) {
    ElMessage.warning("至少保留一行明细，无法删除");
    return;
  }
  // parentRow.finaDs.splice(index, 1);
  parentRow.finaDs = parentRow.finaDs.filter(
    (_: any, i: number) => i !== index,
  );
  // ElMessage.success("删除成功");
};

// 新增主表
const handleAddPay = () => {
  // const newRow = {
  //   id: uuidv4(),
  //   tenderNo: "",
  //   tenderName: "",
  //   finaSubDesc: "",
  //   companyNames: "",
  //   bidStartDate: "",
  //   payAmt: "0.00",
  //   dutyMan: "",
  //   finaDs: [],
  // };
  // mainTableData.value.push(newRow);
  // ElMessage.success("新增成功");
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
const handleSubmit = () => {
  const allValid = validateData();
  if (allValid) {
    console.log("提交数据:", mainTableData.value);
  }
};

// 获取业务板块下的费用组织
const getFinaOrgListBySegId = async () => {
  if (!props.segId) return;
  try {
    const res = await dictionaryApi.getFinaOrgList({ segId: props.segId });
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
const getFinaSubjectListBySegId = async () => {
  if (!props.segId) return;
  try {
    const res = await dictionaryApi.getFinaSubjectList({ segId: props.segId });
    if (res.code === 200) {
      const list = res.data || [];
      const subTreeData: any = buildTree(list);
      subjectOptions.value = subTreeData || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};
const processData = () => {
  console.log("props.payWayTable", props.payWayTable);
  if (props.payWayTable && props.payWayTable.length > 0) {
    const data = props.payWayTable.map((item) => {
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
        finaDs = [
          {
            uuid: uuidv4(),
            id: undefined,
            nconBillId: undefined,
            payWayId: item.id,
            finaSubDesc: item.payDesc,
            finaOrgId: undefined,
            finaSubId: undefined,
            finaSubAmt: item.payAmt || 0,
          },
        ];
      }
      return {
        ...item,
        finaDs: finaDs,
      };
    });
    mainTableData.value = data; // 将处理后的数据赋值给 tableData
  }
};
/**
 * 从树形数据中过滤出指定ID的节点，并保留其父级路径
 * 返回的数据保持树形结构
 */
const filterTreeByIds = (treeData: any[], targetIds: number[]): any[] => {
  const targetSet = new Set(targetIds);

  function filterNodes(nodes: any[]): any[] {
    const result: any[] = [];

    for (const node of nodes) {
      const isTarget = targetSet.has(node.id);

      let filteredChildren: any[] = [];
      if (node.children && node.children.length > 0) {
        filteredChildren = filterNodes(node.children);
      }

      if (isTarget || filteredChildren.length > 0) {
        const newNode: any = {
          ...node,
          children: filteredChildren,
        };
        result.push(newNode);
      }
    }

    return result;
  }

  return filterNodes(treeData);
};
// 获取生效的目标成本版本
const getEffectiveCostVersion = async (projId: number) => {
  try {
    const res = await costAllocationApi.getProjectCostMEnabled({ projId });
    if (res.code === 200) {
      return res.data;
    }
    return null;
  } catch (error) {
    console.error("获取目标成本版本失败：", error);
    return null;
  }
};
// 获取科目数据
const getSubOptions = async () => {
  if (!props.projId) return;
  // 先获取当前可用的目标成本版本
  const data: any = await getEffectiveCostVersion(props.projId);
  if (!data) {
    ElMessage.warning("未找到生效的目标成本版本");
    return [];
  }
  // 获取目标成本明细列表
  const params = {
    projId: data.projId,
    costMid: data.id,
    isHasAlloc: false, // true表示查询动态成本总额
  };
  const res = await goalCostApi.getProjectCostDList(params);
  if (res.code === 200) {
    const listData = res.data || [];
    const subIds: any = new Set(listData.map((item: any) => item.subId));
    // 获取基础成本科目列表
    const costSubjectsRes = await costCategoryApi.getCostSubjectBase({
      isWithParent: true,
    });
    if (costSubjectsRes.code === 200) {
      // 构建树形数据
      const rawTreeData = costSubjectsRes.data || [];
      const subTreeData: any = buildTree(rawTreeData);
      // 使用 filterTreeByIds 过滤出包含目标 ID 的树
      const filteredTreeData = filterTreeByIds(subTreeData, Array.from(subIds));
      // console.log("过滤后的树形结构：", filteredTreeData);
      subjectOptions.value = markRaw(filteredTreeData);
    }
  }
};
onMounted(() => {
  // getSubOptions();
  getFinaOrgListBySegId(); // 获取业务板块下的费用组织
  getFinaSubjectListBySegId(); // 获取业务板块下的费用科目
  // 判断是不是弹窗模式
  if (props.isDialogMode) {
    processData();
  } else {
    console.log("OA模式");
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

    // 明细底部统计 - 优化版
    .detail-footer {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 16px;
      font-size: 16px;
      padding: 10px 15px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      background: #f5f7fa;

      .footer-item {
        display: flex;
        align-items: center;
        gap: 6px;

        span {
          color: #909399;
          font-size: 16px;
        }

        strong {
          font-weight: 600;
          font-size: 16px;
        }

        &.total strong {
          color: #303133;
        }

        &.diff {
          strong {
            transition: color 0.2s;
          }

          &.diff-zero strong {
            color: #67c23a;
          }

          &.diff-positive strong {
            color: #e6a23c;
          }

          &.diff-negative strong {
            color: #f56c6c;
          }
        }
      }

      .footer-divider {
        width: 1px;
        height: 18px;
        background: #dcdfe6;
      }
    }
  }
}
</style>
