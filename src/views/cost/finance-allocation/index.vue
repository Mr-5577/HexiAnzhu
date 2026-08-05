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
          <!-- <el-button plain type="primary" @click="handleAddPay">
            新增
          </el-button> -->
          <el-button type="primary" @click="handleSubmit"> 确认分摊 </el-button>
        </div>
      </div>

      <base-table
        :columns="mainColumns"
        :tableData="tableData"
        :rowKey="'id'"
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
            <div class="expand-title">支付明细</div>
            <editable-table
              ref="getDedTableRef(row)"
              :row-key="'uuid'"
              :height="'200px'"
              v-model="row.detailList"
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
                  :disabled="row.detailList?.length <= 1"
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
                  {{ formatMoney(parseFloat(row.bidEndDate) || 0) }}
                </strong>
              </div>
              <div class="footer-divider"></div>
              <div class="footer-item total">
                <span>支付明细合计</span>
                <strong>
                  {{ formatMoney(getDetailTotal(row.detailList)) }}
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
import { ref, onMounted, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { List } from "@element-plus/icons-vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { largeScreenApi } from "@/api/sales/large-screen-api";
import { useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import EditableTable from "@/components/base/editable-table.vue";
import { EditableColumn } from "@/components/base/editable-table.vue";

defineOptions({ name: "finance-allocation" });

const router = useRouter();

// 项目列表
const projectOptions = ref([]);
const tableLoading = ref(false);

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
const tableData = ref([
  {
    id: 12,
    tenderNo: "T2024-001",
    tenderName: "银行转账",
    projNames: "中国银行",
    companyNames: "XX科技有限公司",
    bidStartDate: "6222 0200 **** 1234",
    bidEndDate: "100000.00",
    dutyMan: "2026-08-15",
    detailList: [
      {
        uuid: 1,
        projName: "项目A成本分摊",
        tenderItemName: "财务部",
        bldNames: "管理费用",
        bidBondAmount: 50000,
      },
      {
        uuid: 2,
        projName: "项目B材料采购",
        tenderItemName: "采购部",
        bldNames: "材料成本",
        bidBondAmount: 30000,
      },
    ],
  },
  {
    id: 1,
    tenderNo: "T2024-002",
    tenderName: "支票支付",
    projNames: "建设银行",
    companyNames: "YY工程有限公司",
    bidStartDate: "6222 0300 **** 5678",
    bidEndDate: "50000.00",
    dutyMan: "2026-08-20",
    detailList: [
      {
        uuid: 1,
        projName: "项目A成本分摊",
        tenderItemName: "财务部",
        bldNames: "管理费用",
        bidBondAmount: 50000,
      },
      {
        uuid: 2,
        projName: "项目B材料采购",
        tenderItemName: "采购部",
        bldNames: "材料成本",
        bidBondAmount: 30000,
      },
    ],
  },
]);

const mainColumns: TableColumnItem[] = [
  { type: "expand", width: "50", slot: "expand" },
  { type: "index", label: "序号", width: 60 },
  { prop: "tenderNo", label: "报销事项", minWidth: 120 },
  { prop: "tenderName", label: "支付方式", minWidth: 100 },
  { prop: "projNames", label: "收款方开户行", minWidth: 130 },
  { prop: "companyNames", label: "收款方开户名", minWidth: 130 },
  { prop: "bidStartDate", label: "收款方账号", minWidth: 150 },
  { prop: "bidEndDate", label: "支付金额", minWidth: 100 },
  { prop: "dutyMan", label: "计划支付日期", minWidth: 120 },
];

// 子表格列配置
const detailColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  {
    prop: "projName",
    label: "摘要",
    minWidth: 120,
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "tenderItemName",
    label: "所属组织",
    minWidth: 100,
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "bldNames",
    label: "科目名称",
    minWidth: 100,
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "bidBondAmount",
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
];

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
const getDetailTotal = (detailList: any[]): number => {
  if (!detailList || detailList.length === 0) return 0;
  return detailList.reduce((sum, item) => {
    const amount = parseFloat(item.bidBondAmount) || 0;
    return sum + amount;
  }, 0);
};

// 获取差额（主表金额 - 明细合计）
const getDiffAmount = (row: any): number => {
  const mainAmount = parseFloat(row.bidEndDate) || 0;
  const detailTotal = getDetailTotal(row.detailList);
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
  // 如果金额字段发生变化，会自动触发视图更新
};

// 拆分明细（新增一行）
const handleSplitDetail = (parentRow: any, detailRow: any, index: number) => {
  // 创建新行，复制当前行的数据
  const newDetail = {
    uuid: uuidv4(),
    projName: detailRow.projName || "",
    tenderItemName: detailRow.tenderItemName || "",
    bldNames: detailRow.bldNames || "",
    bidBondAmount: 0, // 金额默认为0
  };

  // 在当前行后面插入
  // parentRow.detailList.splice(index + 1, 0, newDetail);
  // 再最后面插入
  parentRow.detailList.push(newDetail);

  ElMessage.success("拆分成功");
};

// 删除明细
const handleDeleteDetail = async (parentRow: any, index: number) => {
  // 必须保留至少一行明细
  if (parentRow.detailList.length <= 1) {
    ElMessage.warning("至少保留一行明细，无法删除");
    return;
  }
  parentRow.detailList.splice(index, 1);
  ElMessage.success("删除成功");
};

// 新增主表
const handleAddPay = () => {
  // const newRow = {
  //   id: uuidv4(),
  //   tenderNo: "",
  //   tenderName: "",
  //   projNames: "",
  //   companyNames: "",
  //   bidStartDate: "",
  //   bidEndDate: "0.00",
  //   dutyMan: "",
  //   detailList: [],
  // };
  // tableData.value.push(newRow);
  // ElMessage.success("新增成功");
};

// 提交确认支付
const handleSubmit = () => {
  // 校验所有主表的差额是否为0
  let hasDiff = false;
  for (const row of tableData.value) {
    const diff = getDiffAmount(row);
    if (diff !== 0) {
      hasDiff = true;
      ElMessage.warning(
        `报销事项 "${row.tenderNo || "未命名"}" 存在差额，请检查明细金额`,
      );
      break;
    }
  }

  if (!hasDiff) {
    // 确认逻辑
    ElMessage.success("分摊确认提交成功！");
  }
};

// 获取项目列表
const getProjectOptions = async () => {
  try {
    const res = await largeScreenApi.getProjList();
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};

onMounted(() => {});
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
