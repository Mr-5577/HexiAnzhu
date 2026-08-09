<!-- 付款申请 列表 -->
 <!-- 补充合同 列表（样式优化版 · 合并真实逻辑） -->
<template>
  <div class="payment-application-wrapper">
    <!-- <div class="pa-card">  -->
      <!-- 顶部工具栏：标题 + 数量 + 刷新 -->
      <div class="pa-toolbar">
        <div class="pa-toolbar__title">
          <span class="pa-toolbar__name">付款申请</span>
          <el-tag size="small" type="info" effect="plain" round>
            {{ tableData.length }} 个
          </el-tag>
        </div>
      </div>

      <!-- 筛选区域 -->
      <div class="pa-filter">
        <el-form :model="queryParams" ref="queryRef" :inline="true">
          <el-form-item label="请款说明" prop="paymentName">
            <el-input
              v-model="queryParams.paymentName"
              placeholder="请输入名称"
              clearable
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="审批状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择审批状态"
              style="width: 100px"
              clearable
            >
              <el-option
                v-for="item in approvalStatusEnum"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              class="refresh-btn"
              :class="{ 'is-refreshing': refreshing }"
              :disabled="refreshing"
              @click="handleRefresh"
            >
              <el-icon class="refresh-icon"><Refresh /></el-icon>
              <span>{{ refreshing ? "搜索中" : "搜索" }}</span>
            </el-button>
            <!-- <el-button type="primary" @click="handleSearch"> 搜索 </el-button> -->
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" class="add-btn" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              <span>新增</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <base-table
        :columns="tableColumns"
        :tableData="tableData"
        :loading="tableLoading"
        :rowKey="'id'"
        :pagination="false"
      >
        <template #status="{ row }">
          <el-tag
            size="small"
            :type="getEnumType(approvalStatusEnum, row?.conStatus || 0)"
          >
            {{ getEnumLabel(approvalStatusEnum, row?.conStatus || 0) }}
          </el-tag>
        </template>
        <template #actions="{ row }">
          <el-button type="primary" link class="row-link" @click="handleEdit(row)" :disabled="row.status !== 0 && row.createId === userStore.userInfo.id">
            编辑
          </el-button>
          <el-button type="primary" link class="row-link" @click="handleDetail(row)">
            详情
          </el-button> 
          <!-- <el-button type="primary" link class="row-link" @click="handleApprove(row)">
            审批
          </el-button> -->
          <el-button type="danger" link class="row-link" @click="handleDelete(row)" :disabled="row.status !== 0 && row.createId === userStore.userInfo.id">
            删除
          </el-button>
        </template>
      </base-table>
    </div>
  <!-- </div>  -->
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { useRouter } from "vue-router";
import { paymentRequestApi } from "@/api/cost/contract-manage/payment-application-api";
import { HConPayment } from "@/types/cost/contract-manage/payment-application-type";
import { approvalStatusEnum } from "@/constants/bidding/enums";
import { getEnumLabel, getEnumType } from "@/utils/enum";
import { useUserStore } from "@/stores/user-store";

defineOptions({ name: "payment-application" });

const props = defineProps<{
  projId: number | null;
  conId: number | null;
}>();

const router = useRouter();
const tableLoading = ref(false);
const refreshing = ref(false); // 驱动刷新按钮旋转动画
const tableData = ref([]);
const userStore = useUserStore();


const queryParams = ref({
  conId:props.conId,
  paymentName:"",
  status : null,
});

const handleReset = () => {
  queryParams.value.paymentName = "";
  queryParams.value.status = null;
  getDataList();
};

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  {
    prop: "reqDesc",
    label: "付款申请说明",
    minWidth: 150,
    showOverflowTooltip: true,
  },
  {
    prop: "reqType",
    label: "付款类型",
    width: 120,
    formatter: (row: HConPayment) => (row.reqType === 0 ? "请款" : "来票冲账"),
  },
  {
    prop: "payRule",
    label: "付款规则",
    width: 140,
    formatter: (row: HConPayment) =>
      row.payRule === 0 ? "正常请款" : "来票冲账",
  },
  {
    prop: "reqAmt",
    label: "请款总金额",
    width: 140,
    formatter: (row: HConPayment) => row.reqAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "factReqAmt",
    label: "实际请款金额",
    width: 140,
    formatter: (row: HConPayment) => row.factReqAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "signAmt",
    label: "合同签约金额",
    width: 140,
    formatter: (row: HConPayment) => row.signAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "addAmt",
    label: "补充合同金额",
    width: 140,
    formatter: (row: HConPayment) => row.addAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "sumChangeAmt",
    label: "累计变更签证",
    width: 140,
    formatter: (row: HConPayment) => row.sumChangeAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "preSettleAmt",
    label: "预结算合同金额",
    width: 150,
    formatter: (row: HConPayment) => row.preSettleAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "sumProdVal",
    label: "累计产值",
    width: 140,
    formatter: (row: HConPayment) => row.sumProdVal?.toFixed(2) || "0.00",
  },
  {
    prop: "sumPayAmt",
    label: "累计应付",
    width: 140,
    formatter: (row: HConPayment) => row.sumPayAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "sumAppyAmt",
    label: "累计请款",
    width: 140,
    formatter: (row: HConPayment) => row.sumAppyAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "sumPaidAmt",
    label: "累计实付",
    width: 140,
    formatter: (row: HConPayment) => row.sumPaidAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "sumOwedAmt",
    label: "累计欠款",
    width: 140,
    formatter: (row: HConPayment) => row.sumOwedAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "leavePayAmt",
    label: "剩余应付金额",
    width: 140,
    formatter: (row: HConPayment) => row.leavePayAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "payOutRate",
    label: "应付占产值比(%)",
    width: 150,
    formatter: (row: HConPayment) => row.payOutRate?.toFixed(2) || "0.00",
  },
  {
    prop: "paidPayRate",
    label: "实付占应付比(%)",
    width: 150,
    formatter: (row: HConPayment) => row.paidPayRate?.toFixed(2) || "0.00",
  },
  {
    prop: "paidOutRate",
    label: "实付占产值比(%)",
    width: 150,
    formatter: (row: HConPayment) => row.paidOutRate?.toFixed(2) || "0.00",
  },
  {
    prop: "pbAmount",
    label: "转履约保证金",
    width: 140,
    formatter: (row: HConPayment) => row.pbAmount?.toFixed(2) || "0.00",
  },
  {
    prop: "changeAmt",
    label: "奖罚总金额(扣款)",
    width: 160,
    formatter: (row: HConPayment) => row.changeAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "invRecAmt",
    label: "应收发票金额",
    width: 140,
    formatter: (row: HConPayment) => row.invRecAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "invRcvdAmt",
    label: "已收发票",
    width: 140,
    formatter: (row: HConPayment) => row.invRcvdAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "invOweAmt",
    label: "欠票金额",
    width: 140,
    formatter: (row: HConPayment) => row.invOweAmt?.toFixed(2) || "0.00",
  },
  {
    prop: "isModifyAcc",
    label: "修改收款账号",
    width: 130,
    formatter: (row: HConPayment) => (row.isModifyAcc === 1 ? "是" : "否"),
  },
  {
    prop: "bankName",
    label: "收款开户行",
    width: 150,
    showOverflowTooltip: true,
  },
  {
    prop: "accountName",
    label: "收款账户名",
    width: 150,
    showOverflowTooltip: true,
  },
  {
    prop: "bankAccount",
    label: "收款账号",
    width: 160,
    showOverflowTooltip: true,
  },
  {
    prop: "modifyAccAnnex",
    label: "修改凭证附件",
    width: 130,
  },
  {
    label: "操作",
    width: 140,
    slot: "actions",
    fixed: "right",
  },
];
// 获取列表数据
const getDataList = async () => {
  if (!props.conId) {
    return;
  }
  try {
    tableLoading.value = true;
    const res = await paymentRequestApi.getPayList({ conId: props.conId });
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

// 刷新
const handleRefresh = () => {
  getDataList();
};

// 新增
const handleAdd = () => {
  router.push({ 
    path: "/con/payment-application/add",
    query: {
      projId: props.projId, // 项目ID
      conId: props.conId, // 合同ID
    },
  });
};
// 编辑
const handleEdit = async ({ id }) => {
  router.push({
    path: "/con/payment-application/edit",
    query: {
      projId: props.projId, // 项目ID
      conId: props.conId, // 合同ID
      paymentId: id, // 付款申请ID
    },
  });
};

// 详情
const handleDetail = ({id}) => {
  router.push({
    path: "/con/payment-application/detail",
    query: {
      paymentId: id, // 付款申请ID
      conId: props.conId, // 合同台账ID（合同单据ID）
      projId: props.projId,
    },
  });
};

// 删除
const handleDelete = ({ id }) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        const res = await paymentRequestApi.delPay({ id });
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

// 监听合同ID变化，自动刷新列表
// watch(
//   () => props.conId,
//   async (val) => {
//     if (val) {
//       getDataList();
//     } else {
//       tableData.value = [];
//     }
//   },
//   { immediate: true },
// );
onMounted(() => {
  getDataList();
});
</script>

<style lang="scss" scoped>
.payment-application-wrapper {
  border-radius: 12px;
  width: 100%;
  height: 100%;
  padding: 3px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
}

/* 卡片容器 */
.pa-card {
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  // overflow: hidden;
  transition: box-shadow 0.25s ease;
  &:hover {
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.09);
  }

  // 表格样式
  table {
    width: 100%;
    min-width: 800px; // 设置最小宽度，确保内容不会挤在一起
    border-collapse: collapse;
  }
}

/* 工具栏：左标题 / 右操作 */
.pa-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid #f0f2f5;
  background: linear-gradient(180deg, #fafcff 0%, #ffffff 100%);
}
.pa-toolbar__title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pa-toolbar__name {
  position: relative;
  padding-left: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    border-radius: 2px;
    background: #409eff;
  }
}
.pa-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 筛选区域 */
.pa-filter {
  padding: 12px 14px 0;
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

/* —— 刷新按钮：重点优化 —— */
.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  .refresh-icon {
    transition: transform 0.3s ease;
  }
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.35);
  }
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
  }
  &.is-refreshing .refresh-icon {
    animation: pa-spin 0.8s linear infinite;
  }
}
@keyframes pa-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 新增按钮：与刷新按钮一致的悬浮反馈 */
.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  }
  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

/* 行内操作链接：悬浮微提示 */
.row-link {
  font-weight: 500;
  transition: opacity 0.15s ease;
  &:hover {
    opacity: 0.85;
  }
}
</style>
