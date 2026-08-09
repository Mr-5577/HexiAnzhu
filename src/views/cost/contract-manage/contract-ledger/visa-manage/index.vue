<!-- 签证管理 列表 -->
 <!-- 补充合同 列表（样式优化版 · 合并真实逻辑） -->
<template>
  <div class="supplement-contract-table">
    <!-- <div class="pa-card">  -->
      <!-- 顶部工具栏：标题 + 数量 + 刷新 -->
      <div class="pa-toolbar">
        <div class="pa-toolbar__title">
          <span class="pa-toolbar__name">签证审批</span>
          <el-tag size="small" type="info" effect="plain" round>
            {{ tableData.length }} 个
          </el-tag>
        </div>
      </div>

      <!-- 筛选区域 -->
      <div class="pa-filter">
        <el-form :model="queryParams" ref="queryRef" :inline="true">
          <el-form-item label="签证名称" prop="bizTitle">
            <el-input
              v-model="queryParams.bizTitle"
              placeholder=""
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
            :type="getEnumType(approvalStatusEnum, row?.status || 0)"
          >
            {{ getEnumLabel(approvalStatusEnum, row?.status || 0) }}
          </el-tag>
        </template>
        <template #visaType="{ row }">
          <el-tag
            size="small"
            :type="getEnumType(VisaTypeEnum, row?.visaType || null)"
          >
            {{ getEnumLabel(VisaTypeEnum, row?.visaType || null) }}
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
import { ref, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { ContractVisa } from "@/types/cost/contract-manage/visa-management-type.ts";
import { visaManagementApi } from "@/api/cost/contract-manage/visa-management-api.ts";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { approvalStatusEnum } from "@/constants/bidding/enums";
import { getEnumLabel, getEnumType } from "@/utils/enum";
import { AddTypeEnum, VisaTypeEnum } from "@/constants/contract-manage/enums";

defineOptions({ name: "visa-management" });

const props = defineProps<{
  conId: number | null;
  projId: number | null;
}>();

const queryParams = ref({
  bizTitle: "",
  status:null,
});

const router = useRouter();
const tableLoading = ref(false);
const refreshing = ref(false); // 驱动刷新按钮旋转动画
const tableData = ref<ContractVisa[]>([]);
const userStore = useUserStore();

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { slot: "visaType", label: "签证类型", width: 90 },
  { prop: "bizTitle", label: "签证名称" },
  // { prop: "changeType", label: "变更类型" },
  // { slot: "changeName", label: "变更事项" },
  { prop: "visaApplyAmt", label: "申请签证金额" , width: 120,formatType:"#,##0.00",},
  { prop: "auditReviewAmt", label: "审核签证金额", width: 120 ,formatType:"#,##0.00",},
  { slot: "status", label: "状态" , width: 90},
  { prop: "visaApplyDesc", label: "签证说明" },
  { prop: "createName", label: "创建人" , width: 90},
  { prop: "createDate", label: "创建日期" , width: 150},
  // { prop: "visaApplyDesc", label: "签证申报说明", width: 200 },
  // { prop: "costingReviewAmt", label: "成本审核金额", width: 120 },
  // { prop: "costingCutAmt", label: "成本审减金额", width: 120 },
  // { prop: "costingOpinion", label: "成本审核意见", width: 200 },
  // { prop: "wasteCostAmt", label: "无效成本金额", width: 120 },
  // { prop: "wasteCostReasonId", label: "无效成本原因", width: 120 },
  // { prop: "auditReviewAmt", label: "审计审核金额", width: 120 },
  // { prop: "auditCutAmt", label: "审计审减金额", width: 120 },
  // { prop: "auditOpinion", label: "审计审核意见", width: 200 },
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
    const res = await visaManagementApi.getVisaList({
      conId: props.conId, ...queryParams.value,
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
        const res = await visaManagementApi.delVisa({ id: row.id });
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
const handleRefresh = async() => {
  refreshing.value = true;
  try {
    await getDataList();
  } finally {
    refreshing.value = false;
  }
};

const handleReset = () => {
  queryParams.value.bizTitle = "";
  queryParams.value.status = null;
  getDataList();
};

// 新增
const handleAdd = () => {
  router.push({
    path: "/con/visa-manage/add",
    query: {
      conId: props.conId,
      projId: props.projId,
      t: Date.now(),
    },
  });
};

// 编辑
const handleEdit = async (row: ContractVisa) => {
  router.push({
    path: "/con/visa-manage/edit",
    query: {
      conId: props.conId,
      projId: props.projId,
      visaId: row.id,
    },
  });
};

// 详情
const handleDetail = (row: ContractVisa) => {
  router.push({
    path: "/con/visa-manage/detail",
    query: {
      conId: props.conId,
      projId: props.projId,
      visaId: row.id,
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
.supplement-contract-table {
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


