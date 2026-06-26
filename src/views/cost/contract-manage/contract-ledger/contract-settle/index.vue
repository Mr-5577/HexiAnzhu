<!-- 合同结算 列表 -->
<template>
  <div class="contract-settle-wrapper">
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
          <el-button type="primary" @click="handleInitiate">
            发起流程
          </el-button>
        </div>
      </template>
      <template #status="{ row }">
        {{ getStatusName(row.status) }}
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
import { ref, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { useRouter } from "vue-router";
import { contractSettleApi } from "@/api/cost/contract-manage/contract-settlement-api";

defineOptions({ name: "contract-settle" });

const props = defineProps<{
  conId: number | null;
}>();
const router = useRouter();

const tableLoading = ref(false);
const tableData = ref<any[]>([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "conBillId", label: "单据编号", width: 120 },
  { prop: "status", label: "状态", width: 100, slot: "status" }, // 用slot显示状态标签
  { prop: "signAmt", label: "合同签约金额", width: 120 },
  { prop: "addAmt", label: "补充合同金额", width: 120 },
  { prop: "sumChangeAmt", label: "累计变更签证", width: 120 },
  { prop: "preSettleAmt", label: "预结算合同金额", width: 120 },
  { prop: "sumProdVal", label: "累计产值", width: 120 },
  { prop: "sumPayAmt", label: "累计应付", width: 120 },
  { prop: "sumAppyAmt", label: "累计请款", width: 120 },
  { prop: "sumPaidAmt", label: "累计实付", width: 120 },
  { prop: "sumOwedAmt", label: "累计欠款", width: 120 },
  { prop: "settleType", label: "结算类型", width: 120, slot: "settleType" }, // 0-部分结算，1-全部结算
  { prop: "applySettleAmt", label: "申报结算金额", width: 120 },
  { prop: "totalDedAmt", label: "扣款总金额", width: 120 },
  { prop: "sumDedAlreadyAmt", label: "累计已扣款", width: 120 },
  { prop: "finalSettleAmt", label: "最终合同结算金额", width: 120 },
  { prop: "finalPaymentAmt", label: "最终结算款金额", width: 120 },
  { prop: "finalWarrAmt", label: "最终质保金金额", width: 120 },
  { prop: "warrExpireDate", label: "质保到期日", width: 120 },
  { prop: "finalSettleSignDate", label: "最终结算签字日期", width: 120 },
  {
    label: "操作",
    width: 150,
    slot: "actions",
    fixed: "right",
  },
];

const getStatusName = (status: number) => {
  switch (status) {
    case 0:
      return "草稿";
    case 5:
      return "审批中";
    case 10:
      return "已审批";
    case 30:
      return "已作废";
    default:
      return "-";
  }
};

// 获取列表数据
const getDataList = async () => {
  if (!props.conId) {
    return;
  }
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await contractSettleApi.getSettleList({ conId: props.conId });
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

// 发起流程
const handleInitiate = () => {
  router.push({
    path: "/contract/contract-settle/add",
    query: {
      conId: props.conId, // 合同ID
    },
  });
};
// 编辑
const handleEdit = async ({ id }) => {
  router.push({
    path: "/contract/contract-settle/edit",
    query: {
      conId: props.conId, // 合同ID
      settleId: id, // 结算ID
    },
  });
};
// 删除
const handleDelete = ({ id }) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        const res = await contractSettleApi.delSettle({ id: id });
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
.contract-settle-wrapper {
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
