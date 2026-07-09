<!-- 付款申请 列表 -->
<template>
  <div class="payment-application-wrapper">
    <base-table
      :columns="tableColumns"
      :tableData="tableData"
      :loading="tableLoading"
      :rowKey="'id'"
      :pagination="false"
    >
      <!-- 列表外操作栏 -->
      <template #actionBar>
        <div class="actionBar-buttons">
          <el-button type="primary" icon="Refresh" @click="handleRefresh">
            刷新列表
          </el-button>
          <el-button type="primary" @click="handleAdd"> 新增 </el-button>
        </div>
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { useRouter } from "vue-router";
import { paymentRequestApi } from "@/api/cost/contract-manage/payment-application-api";
import { HConPayment } from "@/types/cost/contract-manage/payment-application-type";

defineOptions({ name: "payment-application" });

const props = defineProps<{
  projId: number | null;
  conId: number | null;
}>();

const router = useRouter();
const tableLoading = ref(false);
const tableData = ref([]);

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
      row.payRule === 0 ? "正常请款" : "提高支付比例请款",
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
    formatter: (row: HConPayment) => (row.modifyAccAnnex ? "已上传" : "未上传"),
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
    path: "/contract/payment-application/add",
    query: {
      projId: props.projId, // 项目ID
      conId: props.conId, // 合同ID
    },
  });
};
// 编辑
const handleEdit = async ({ id }) => {
  router.push({
    path: "/contract/payment-application/edit",
    query: {
      projId: props.projId, // 项目ID
      conId: props.conId, // 合同ID
      paymentId: id, // 付款申请ID
    },
  });
};
// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        ElMessage.success("删除成功");
        getDataList();
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
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .actionBar-buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
