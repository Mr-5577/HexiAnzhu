<!-- 特殊事项 列表 -->
<template>
  <div class="special-matter-wrapper">
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
      <template #status="{ row }">
        {{ getStatusText(row.status) }}
      </template>
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
        <el-button type="primary" link> 审批 </el-button>
      </template>
    </base-table>

    <!-- 新增/编辑 特殊事项弹窗 -->
    <add-edit-special-dialog
      v-model="dialogVisible"
      :conId="props.conId"
      :editData="editData"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import AddEditSpecialDialog from "./add-edit-special-dialog.vue";
import { ContractSpecial } from "@/types/cost/contract-manage/special-matter-type.ts";
import { specialMatterApi } from "@/api/cost/contract-manage/special-matter-api.ts";

defineOptions({ name: "special-matter" });

const props = defineProps<{
  conId: number | null;
}>();

const route = useRoute();
const router = useRouter();

const dialogVisible = ref(false);
const editData = ref<ContractSpecial | null>(null);
const tableLoading = ref(false);
const tableData = ref<ContractSpecial[]>([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  // { slot: "status", label: "状态", width: 100 },
  // { prop: "signAmt", label: "合同签约金额", width: 120 },
  // { prop: "totalProdVal", label: "合同总产值", width: 120 },
  // { prop: "totalPayable", label: "总应付", width: 120 },
  // { prop: "totalPaid", label: "总已付", width: 120 },
  // { prop: "totalOwed", label: "总欠款", width: 120 },
  // { prop: "specialDesc", label: "特殊说明", width: 200 },
  { prop: "ww", label: "审批单编号", width: 200 },
  { prop: "ww", label: "审批流程" },
  { slot: "status", label: "审批状态", width: 120 },
  { prop: "ww", label: "申请人" },
  { prop: "ww", label: "申请日期" },
  {
    label: "操作",
    width: 200,
    slot: "actions",
    fixed: "right",
  },
];
const getStatusText = (status: number) => {
  //  状态：0-草稿 5-审批中 10-已审批 30-已作废
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
      return "未知状态";
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
    const res = await specialMatterApi.getSpecialList({
      conId: props.conId,
    });
    if (res.code === 200) {
      tableData.value = res.data;
    }
  } catch (error) {
    console.error("获取工程核价列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

const handleDelete = (row) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        const res = await specialMatterApi.delSpecial({ id: row.id });
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
// 刷新按钮
const handleRefresh = () => {
  getDataList();
};

// 新增
const handleAdd = () => {
  router.push({
    path: "/con/special-matter/add",
    query: {
      t: Date.now(),
    },
  });
};
// 编辑
const handleEdit = ({ id }) => {
  router.push({
    path: "/con/special-matter/edit",
    query: {
      specialId: id, // 特殊事项ID
    },
  });
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
.special-matter-wrapper {
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
