<!-- 变更指令 列表 -->
<template>
  <div class="change-order-wrapper">
    <!-- 顶部工具栏：标题 + 数量 + 刷新 -->
    <div class="pa-toolbar">
      <div class="pa-toolbar__title">
        <span class="pa-toolbar__name">变更申请</span>
        <el-tag size="small" type="info" effect="plain" round>
          {{ tableData.length }} 个
        </el-tag>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="pa-filter">
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item label="变更事项名称" prop="changeName">
          <el-input
            v-model="queryParams.changeName"
            placeholder="请输入变更事项名称"
            clearable
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item label="变更类型" prop="changeType">
          <el-select
            v-model="queryParams.changeType"
            placeholder="请选择变更类型"
            style="width: 100px"
            clearable
          >
            <el-option
              v-for="item in ChangeTypeEnum"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
      <template #changeType="{ row }">
        {{ getChangeTypeText(row.changeType) }}
      </template>
      <template #status="{ row }">
        <el-tag
          size="small"
          :type="getEnumType(approvalStatusEnum, row?.status || 0)"
        >
          {{ getEnumLabel(approvalStatusEnum, row?.status || 0) }}
        </el-tag>
      </template>
      <template #changeReasonId="{ row }">
        {{ getReasonText(row.changeReasonId) }}
      </template>
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)" :disabled="row.status !== 0 && row.createId === userStore.userInfo.id">
          编辑
        </el-button>
        <el-button type="primary" link @click="handleDetail(row)">
          详情
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)" :disabled="row.status !== 0 && row.createId === userStore.userInfo.id">
          删除
        </el-button>
        <!-- <el-button type="primary" link @click="handleApproval(row)">
          审批
        </el-button> -->
      </template>
    </base-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { changeOrderApi } from "@/api/cost/contract-manage/change-order-api.ts";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { useRouter } from "vue-router";
import { ChangeTypeEnum } from "@/constants/contract-manage/enums.ts";
import { associatedApprovalApi } from "@/api/cost/contract-manage/associated-approval-api.ts";
import { getEnumLabel, getEnumType } from "@/utils/enum";
import { approvalStatusEnum } from "@/constants/bidding/enums";
import { useUserStore } from "@/stores/user-store";

defineOptions({ name: "change-order" });

const props = defineProps<{
  conId: number | null;
  projId: number | null;
  conName: string | "";
}>();

const router = useRouter();

const queryParams = ref({
  changeName: "",
  changeType: null,
  conId:props.conId,
  status:null,
});

const tableLoading = ref(false);
const tableData = ref([]);
const changeReasonOptions = ref([]); // 变更原因列表

const refreshing = ref(false); // 驱动刷新按钮旋转动画
const userStore = useUserStore();

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
  // { slot: "bizTitle", label: "标题" },
  { slot: "changeType", label: "变更类型" , width: 120},
  { prop: "changeName", label: "变更事项名称" , width: 300},
  { prop: "changeAmt", label: "预估变更金额" , width: 150,formatType:"#,##0.00"},
  // { slot: "ww", label: "执行状态" },
  { slot: "changeReasonId", label: "变更原因", width: 150 },
  // { prop: "changeReasonDesc", label: "变更原因说明", width: 200 },
  // { prop: "changeConent", label: "变更内容", width: 200 },
  { slot: "status", label: "审批状态" ,width: 90},
  { prop: "createName", label: "创建人", Width: 90 },
  { prop: "createDate", label: "创建时间", Width: 150 },
  {
    label: "操作",
    width: 160,
    slot: "actions",
    fixed: "right",
  },
];

const getChangeTypeText = (changeType: number) => {
  const option = ChangeTypeEnum.find((item) => item.value == changeType);
  return option ? option.label : "";
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
      conId: props.conId, ...queryParams.value,
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
const handleRefresh = async() => {
  refreshing.value = true;
  try {
    await getDataList();
  } finally {
    refreshing.value = false;
  }
};

const handleReset = () => {
  queryParams.value.changeName = "";
  queryParams.value.changeType = null;
  queryParams.value.status = null;
  getDataList();
};

// 发起流程
const handleAdd = () => {
  router.push({
    path: "/con/change-order/add",
    query: {
      projId: props.projId,
      conId: props.conId,
      conName: props.conName,
      t: Date.now(),
    },
  });
};
// 编辑
const handleEdit = async (row) => {
  router.push({
    path: "/con/change-order/edit",
    query: {
      projId: props.projId,
      conId: props.conId,
      conName: props.conName,
      changeId: row.id,
    },
  });
};

// 详情
const handleDetail = async (row) => {
  router.push({
    path: "/con/change-order/detail",
    query: {
      projId: props.projId,
      conId: props.conId,
      conName: props.conName,
      changeId: row.id,
    },
  });
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
  queryParams.value.conId = props.conId;
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
