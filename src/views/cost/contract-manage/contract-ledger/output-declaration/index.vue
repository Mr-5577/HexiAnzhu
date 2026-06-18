<!-- 产值申报 列表 -->
<template>
  <div class="output-declaration-wrapper">
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
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { outputDeclarationApi } from "@/api/cost/contract-manage/output-declaration-api";
import { useRouter } from "vue-router";

defineOptions({ name: "output-declaration" });

const props = defineProps<{
  conId: number | null;
}>();

const router = useRouter();
const tableLoading = ref(false);
const tableData = ref<any[]>([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "signAmt", label: "合同签约金额", width: 140 },
  { prop: "addAmt", label: "补充合同金额", width: 140 },
  { prop: "sumChangeAmt", label: "累计变更签证", width: 140 },
  { prop: "preSettleAmt", label: "预结算合同金额", width: 140 },
  { prop: "sumProdVal", label: "累计产值", width: 140 },
  { prop: "sumPayAmt", label: "累计应付", width: 140 },
  { prop: "sumAppyAmt", label: "累计请款", width: 140 },
  { prop: "sumPaidAmt", label: "累计实付", width: 140 },
  { prop: "sumOwedAmt", label: "欠款", width: 140 },
  { prop: "conId", label: "合同名称", width: 140 },
  { prop: "conTypeId", label: "合同分类", width: 140 },
  { prop: "payMethod", label: "付款方式", width: 140 },
  { prop: "payTypeId", label: "款项类型", width: 140 },
  { prop: "payRate", label: "应付比例", width: 140 },
  { prop: "payIntvl", label: "支付周期(月)", width: 140 },
  { prop: "applyProdVal", label: "本次申报产值金额", width: 140 },
  { prop: "applyPayAmt", label: "本次申报应付金额", width: 140 },
  { prop: "applyDesc", label: "申报说明", width: 220 },
  { prop: "costProdVal", label: "成本复核产值金额", width: 140 },
  { prop: "costPayAmt", label: "成本复核应付金额", width: 140 },
  { prop: "totalProdVal", label: "截止总产值", width: 140 },
  { prop: "totalPayVal", label: "截止总应付", width: 140 },
    {
    label: "操作",
    width: 150,
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
    const res = await outputDeclarationApi.getProdValList({
      conId: props.conId,
    });
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
    path: "/contract/output-declaration/add",
    query: {
      mode: "add",
      conId: props.conId,
    },
  });
};
// 编辑
const handleEdit = async (row) => {
  router.push({
    path: "/contract/output-declaration/edit",
    query: {
      mode: "edit",
      conId: props.conId,
      outputId: row.id, // 产值ID
    },
  });
};
// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        const res = await outputDeclarationApi.delProdVal({ id: row.id });
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
watch(
  () => props.conId,
  async (val) => {
    if (val) {
      getDataList();
    } else {
      tableData.value = [];
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.output-declaration-wrapper {
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
