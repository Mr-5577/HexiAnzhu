<!-- 款项调整/合同奖罚 列表 -->
<template>
  <div class="payment-adjust-wrapper">
    <!-- 使用建设占位组件 -->
    <BuildingPlaceholder v-if="true" />
    <base-table v-else :columns="tableColumns" :tableData="tableData" :loading="tableLoading" :rowKey="'id'"
      :pagination="false">
      <!-- 列表外操作栏 -->
      <template #actionBar>
        <div class="actionBar-buttons">
          <el-button type="primary" icon="Refresh" @click="getDataList">
            刷新列表
          </el-button>
          <el-button type="primary" @click="handleAdd"> 新增 </el-button>
        </div>
      </template>

      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="primary" link @click="handleDetail(row)">
          详情
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
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { paymentAdjustApi } from "@/api/cost/contract-manage/payment-adjust-api.ts";
import { dedTypeEnum } from "@/constants/contract-manage/enums";
import { ContractDed } from "@/types/cost/contract-manage/payment-adjust-type.ts";

defineOptions({ name: "payment-adjust" });

const props = defineProps<{
  conId?: number | null;
}>();

const route = useRoute();
const router = useRouter();

const tableLoading = ref(false);
const tableData = ref([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "ww", label: "大类" },
  { prop: "ww", label: "小类" },
  { prop: "dedDesc", label: "事项说明", width: 200 },
  { prop: "ww", label: "金额" },
  { prop: "ww", label: "是否兑现" },
  { prop: "ww", label: "兑现金额" },
  { slot: "status", label: "审批状态" },
  { prop: "ww", label: "申请人" },
  { prop: "ww", label: "申请日期" },
  {
    label: "操作",
    width: 180,
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
    tableData.value = [];
    const res = await paymentAdjustApi.getDedList({ conId: props.conId });
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

// 新增
const handleAdd = () => {
  router.push({
    path: "/con/payment-adjust/add",
    query: {
      conId: props.conId, // 合同ID
      t: Date.now(),
    },
  });
};
// 详情
const handleDetail = ({ id }) => {
  router.push({
    path: "/con/payment-adjust/detail",
    query: {
      conId: props.conId, // 合同ID
      dedId: id, // 奖罚/款项调整ID
    },
  });
};
// 编辑
const handleEdit = ({ id }) => {
  router.push({
    path: "/con/payment-adjust/edit",
    query: {
      conId: props.conId, // 合同ID
      dedId: id, // 奖罚/款项调整ID
    },
  });
};
// 删除
const handleDelete = (row: ContractDed) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        const res = await paymentAdjustApi.delDed({ id: row.id });
        if (res.code === 200) {
          ElMessage.success("删除成功");
          getDataList();
        }
      } catch (error) {
        console.error("删除失败:", error);
      }
    })
    .catch(() => { });
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
.payment-adjust-wrapper {
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
