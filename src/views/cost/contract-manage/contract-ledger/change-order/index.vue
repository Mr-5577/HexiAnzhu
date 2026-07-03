<!-- 变更指令 列表 -->
<template>
  <div class="change-order-wrapper">
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

      <template #changeType="{ row }">
        {{ getChangeTypeText(row.changeType) }}
      </template>
      <template #status="{ row }">
        {{ getStatusText(row.status) }}
      </template>
      <template #changeReasonId="{ row }">
        {{ getReasonText(row.changeReasonId) }}
      </template>
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
        <el-button type="primary" link @click="handleApproval(row)">
          审批
        </el-button>
      </template>
    </base-table>

    <initiate-dialog
      v-model="dialogVisible"
      :changeReasonOptions="changeReasonOptions"
      :conId="props.conId"
      :projId="props.projId"
      :editData="editData"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { changeOrderApi } from "@/api/cost/contract-manage/change-order-api.ts";
import InitiateDialog from "./initiate-dialog.vue";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { ChangeTypeEnum } from "@/constants/contract-manage/enums.ts";
import { associatedApprovalApi } from "@/api/cost/contract-manage/associated-approval-api.ts";

defineOptions({ name: "change-order" });

const props = defineProps<{
  conId: number | null;
  projId: number | null;
}>();

const dialogVisible = ref(false);
const editData = ref(null);
const tableLoading = ref(false);
const tableData = ref([]);
const changeReasonOptions = ref([]); // 变更原因列表

// 数据字典
const { getDictList, loadDicts } = useDict(
  [
    dictMapping.changeReason, // 变更原因
  ],
  {
    treeDictCodes: [],
  },
);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { slot: "changeType", label: "变更类型", width: 150 },
  { prop: "changeName", label: "变更事项", width: 200 },
  { prop: "changeAmt", label: "变更预估金额", width: 150 },
  { slot: "status", label: "审批状态", width: 150 },
  { slot: "changeReasonId", label: "变更原因", width: 150 },
  { prop: "changeReasonDesc", label: "变更原因说明", width: 200 },
  { prop: "changeConent", label: "变更内容", width: 200 },
  {
    label: "操作",
    width: 200,
    slot: "actions",
    fixed: "right",
  },
];

const getChangeTypeText = (changeType: number) => {
  const option = ChangeTypeEnum.find((item) => item.value == changeType);
  return option ? option.label : "";
};
const getStatusText = (status: number) => {
  //  状态：0-草稿 5-审批中 10-已审批 30-已作废
  if (status == 0) {
    return "草稿";
  } else if (status == 5) {
    return "审批中";
  } else if (status == 10) {
    return "已审批";
  } else if (status == 30) {
    return "已作废";
  } else {
    return "-";
  }
};
const getReasonText = (id: number) => {
  const option = changeReasonOptions.value.find((item) => item.id === id);
  return option ? option.dicLabel : "";
};
// 获取列表数据
const getDataList = async () => {
  if (!props.conId) {
    return;
  }
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await changeOrderApi.getChangeConList({
      conId: props.conId,
    });
    if (res.code === 200) {
      tableData.value = res.data;
    }
  } catch (error) {
    console.error("获取变更合同列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

// 刷新
const handleRefresh = () => {
  getDataList();
};

// 发起流程
const handleAdd = () => {
  editData.value = null;
  dialogVisible.value = true;
};
// 编辑
const handleEdit = async (row) => {
  editData.value = row;
  dialogVisible.value = true;
};
// 审批
const handleApproval = async (row) => {
  console.log("审批", row);
  return;
  ElMessageBox.confirm("确定创建该合同变更审批流程？", "提示", {
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await associatedApprovalApi.createChangeFlow({
          changeId: row.id,
        });
        if (res.code === 200) {
          ElMessage.success("操作成功");
          getDataList();
        }
      } catch (error) {
        console.error("失败:", error);
      }
    })
    .catch(() => {});
};
// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("确定删除该数据吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        const res = await changeOrderApi.delChangeCon({ id: row.id });
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
// 初始化数据字典数据
const initDictData = async () => {
  await loadDicts();
  changeReasonOptions.value = getDictList(dictMapping.changeReason); // 变更原因列表
};

// 监听合同ID变化，自动刷新列表
// watch(
//   () => props.conId,
//   async (val) => {
//     if (val) {
//       await initDictData();
//       getDataList();
//     } else {
//       tableData.value = [];
//     }
//   },
//   { immediate: true },
// );
onMounted(async () => {
  await initDictData();
  getDataList();
});
</script>

<style lang="scss" scoped>
.change-order-wrapper {
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
