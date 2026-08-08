<!-- 补充合同 列表（样式优化版 · 合并真实逻辑） -->
<template>
  <div class="supplement-contract-table">
    <!-- <div class="pa-card">  -->
      <!-- 顶部工具栏：标题 + 数量 + 刷新 -->
      <div class="pa-toolbar">
        <div class="pa-toolbar__title">
          <span class="pa-toolbar__name">补充合同</span>
          <el-tag size="small" type="info" effect="plain" round>
            {{ tableData.length }} 个
          </el-tag>
        </div>
      </div>

      <!-- 筛选区域 -->
      <div class="pa-filter">
        <el-form :model="queryParams" ref="queryRef" :inline="true">
          <el-form-item label="补充合同名称" prop="addName">
            <el-input
              v-model="queryParams.addName"
              placeholder="请输入名称"
              clearable
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="审批状态" prop="status">
            <el-select
              v-model="queryParams.conStatus"
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
        <template #conStatus="{ row }">
          <el-tag
            size="small"
            :type="getEnumType(approvalStatusEnum, row?.conStatus || 0)"
          >
            {{ getEnumLabel(approvalStatusEnum, row?.conStatus || 0) }}
          </el-tag>
        </template>
        <template #addType="{ row }">
          <el-tag
            size="small"
            :type="getEnumType(AddTypeEnum, row?.addType || null)"
          >
            {{ getEnumLabel(AddTypeEnum, row?.addType || null) }}
          </el-tag>
        </template>
        <template #actions="{ row }">
          <el-button type="primary" link class="row-link" @click="handleEdit(row)" :disabled="row.conStatus !== 0 && row.createId === userStore.userInfo.id">
            编辑
          </el-button>
          <el-button type="primary" link class="row-link" @click="handleDetail(row)">
            详情
          </el-button> 
          <!-- <el-button type="primary" link class="row-link" @click="handleApprove(row)">
            审批
          </el-button> -->
          <el-button type="danger" link class="row-link" @click="handleDelete(row)" :disabled="row.conStatus !== 0 && row.createId === userStore.userInfo.id">
            删除
          </el-button>
        </template>
      </base-table>
    </div>
  <!-- </div>  -->
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { Refresh, Plus } from "@element-plus/icons-vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { supplementContractApi } from "@/api/cost/contract-manage/supplement-contract-api";
import { SupplementContract } from "@/types/cost/contract-manage/supplement-contract-type";
import { contractApprovalApi } from "@/api/cost/contract-manage/contract-approval-api";
import { getEnumLabel, getEnumType } from "@/utils/enum";
import { approvalStatusEnum } from "@/constants/bidding/enums";
import { AddTypeEnum } from "@/constants/contract-manage/enums";
import { useUserStore } from "@/stores/user-store";

defineOptions({ name: "supplement-contract" });

const props = defineProps<{
  projId:number | null;
  conId: number | null;
  conName: string | "";
}>();

const router = useRouter();

const queryParams = ref({
  conId:props.conId,
  addName: "",
  conStatus:null,
});
const tableLoading = ref(false);
const refreshing = ref(false); // 驱动刷新按钮旋转动画
const tableData = ref<SupplementContract[]>([]);
const userStore = useUserStore();

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  // { prop: "bizTitle", label: "标题", width: 200 },
  { prop: "addName", label: "补充合同名称", width: 200 },
  { prop: "addSysNo", label: "补充合同编号", width: 200 },
  { slot: "addType", label: "补充合同类型", width: 120 },
  { prop: "addAmt", label: "补充合同含税金额", width: 130 ,formatType:"#,##0.00"},
  { prop: "addExclAmt", label: "补充合同不含税额", width: 130,formatType:"#,##0.00" },
  { prop: "taxAmt", label: "税额", width: 100 ,formatType:"#,##0.00"},
  { prop: "taxRate", label: "税率", width: 90 ,formatType:"d%"},
  { prop: "signDate", label: "签订日期", width: 100 },
  { slot: "conStatus", label: "审批状态", minWidth: 90 },
  { prop: "agentName", label: "经办人", minWidth: 90 },
  { prop: "createName", label: "创建人", minWidth: 90 },
  { prop: "createDate", label: "创建时间", minWidth: 150 },
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
    const res = await supplementContractApi.getSupplementContractList({
      ...queryParams.value,
    });
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取招标需求列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

// 刷新（包一层 refreshing 状态驱动图标旋转，原 tableLoading 逻辑不动）
const handleRefresh = async () => {
  refreshing.value = true;
  try {
    await getDataList();
  } finally {
    refreshing.value = false;
  }
};

const handleSearch = () => {
  getDataList();
};
const handleReset = () => {
  queryParams.value.addName = "";
  queryParams.value.conStatus = null;
  getDataList();
};
const handleAdd = () => {
  router.push({
    path: "/con/supplement-contract/add",
    query: {
      projId:props.projId,
      conId: props.conId, // 合同台账ID（合同单据ID）
      conName:props.conName,
    },
  });
};
const handleEdit = (row: SupplementContract) => {
  router.push({
    path: "/con/supplement-contract/edit",
    query: {
      addId: row.id, // 补充合同ID
      conId: props.conId, // 合同台账ID（合同单据ID）
      projId: props.projId,
      conName:props.conName,
    },
  });
};

const handleDelete = (row: SupplementContract) => {
  ElMessageBox.confirm(`确定删除"${row.addName}"数据吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await supplementContractApi.delSupplementContract(row.id);
        if (res.code === 200) {
          ElMessage.success("删除成功");
          getDataList();
        }
      } catch (error) {}
    })
    .catch(() => {});
};
// 详情
const handleDetail = (row: SupplementContract) => {
  router.push({
    path: "/con/supplement-contract/detail",
    query: {
      addId: row.id, // 补充合同ID
      conId: props.conId, // 合同台账ID（合同单据ID）
      projId: props.projId,
    },
  });
};
// 审批
const handleApprove = (row: SupplementContract) => {
  return;
  ElMessageBox.confirm(`确定审批"${row.addName}"数据吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await contractApprovalApi.createConAddFlow({
          conAddId: row.id,
        });
        if (res.code === 200) {
          ElMessage.success("审批成功");
          getDataList();
        }
      } catch (error) {}
    })
    .catch(() => {});
};

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
