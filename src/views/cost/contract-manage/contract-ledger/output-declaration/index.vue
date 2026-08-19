<!-- 产值申报 列表 -->
<template>
  <div class="output-application-wrapper">
    <!-- <div class="pa-card">  -->
    <!-- 顶部工具栏：标题 + 数量 + 刷新 -->
    <div class="pa-toolbar">
      <div class="pa-toolbar__title">
        <span class="pa-toolbar__name">产值申报</span>
        <el-tag size="small" type="info" effect="plain" round>
          {{ tableData.length }} 个
        </el-tag>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="pa-filter">
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item label="请款说明" prop="paymentName">
          <el-input v-model="queryParams.bizTitle" placeholder="请输入名称" clearable style="width: 300px" />
        </el-form-item>
        <el-form-item label="审批状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择审批状态" style="width: 100px" clearable>
            <el-option v-for="item in approvalStatusEnum" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="refresh-btn" :class="{ 'is-refreshing': refreshing }" :disabled="refreshing"
            @click="handleRefresh">
            <el-icon class="refresh-icon">
              <Refresh />
            </el-icon>
            <span>{{ refreshing ? "搜索中" : "搜索" }}</span>
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" class="add-btn" @click="handleAdd">
            <el-icon>
              <Plus />
            </el-icon>
            <span>新增</span>
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <base-table :columns="tableColumns" :tableData="paginatedData" :loading="tableLoading" :rowKey="'id'" :total="total"
      :current-page="currentPage" :page-size="pageSize" @pagination-change="handlePaginationChange">
      <template #status="{ row }">
        <el-tag size="small" :type="getEnumType(approvalStatusEnum, row?.status || 0)">
          {{ getEnumLabel(approvalStatusEnum, row?.status || 0) }}
        </el-tag>
      </template>

      <!-- <template #payTypeId="{ row }">
          <el-tag
            size="small"
            :type="getOptionsTypeById(paymentTypeOptions, row?.payTypeId || 0)"
          >
            {{ getOptionsLabelById(paymentTypeOptions, row?.payTypeId || 0) }}
          </el-tag>
        </template> -->

      <template #actions="{ row }">
        <el-button type="primary" link class="row-link" @click="handleEdit(row)"
          :disabled="row.status !== 0 || row.createId !== userStore.userInfo.id">
          编辑
        </el-button>
        <el-button type="primary" link class="row-link" @click="handleDetail(row)">
          详情
        </el-button>
        <!-- <el-button type="primary" link class="row-link" @click="handleApprove(row)">
            审批
          </el-button> -->
        <el-button type="danger" link class="row-link" @click="handleDelete(row)"
          :disabled="row.status !== 0 || row.createId !== userStore.userInfo.id">
          删除
        </el-button>
      </template>
    </base-table>
  </div>
  <!-- </div>  -->
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { outputDeclarationApi } from "@/api/cost/contract-manage/output-declaration-api";
import { useRouter } from "vue-router";
import { approvalStatusEnum } from "@/constants/bidding/enums";
import { getEnumLabel, getEnumType } from "@/utils/enum";
import { useUserStore } from "@/stores/user-store";

defineOptions({ name: "output-declaration" });

const props = defineProps<{
  conId: number | null;
  projId: number | null;
}>();

const router = useRouter();
const refreshing = ref(false);
const tableLoading = ref(false);
const currentPage = ref<number>(1);
const pageSize = ref<number>(20);
const total = ref<number>(0);
const tableData = ref([]);
const userStore = useUserStore();

const queryParams = ref({
  conId: props.conId,
  bizTitle: "",
  status: null,
});

const handleReset = () => {
  queryParams.value.bizTitle = "";
  queryParams.value.status = null;
  resetPagination();
  getDataList();
};

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "bizTitle", label: "产值申报说明", width: 250 },
  { prop: "prodValPeriod", label: "产值月份", width: 100 },
  { prop: "sumProdVal", label: "期初产值", width: 140 },
  { prop: "sumPayAmt", label: "期初应付", width: 140 },
  { prop: "applyProdVal", label: "本次申报产值", width: 140 },
  { prop: "applyPayAmt", label: "本次申报应付", width: 140 },
  { prop: "costProdVal", label: "成本复核产值", width: 140 },
  { prop: "costPayAmt", label: "成本复核应付", width: 140 },
  { prop: "totalProdVal", label: "期末总产值", width: 140 },
  { prop: "totalPayVal", label: "期末总应付", width: 140 },
  { slot: "status", label: "审批状态", minWidth: 90 },
  { prop: "applyDesc", label: "申报说明", width: 250 },
  { prop: "createName", label: "创建人", minWidth: 90 },
  { prop: "createDate", label: "创建时间", minWidth: 150 },
  {
    label: "操作",
    width: 150,
    slot: "actions",
    fixed: "right",
  },
];

// 手动分页
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return tableData.value.slice(start, end)
});
// 获取列表数据
const getDataList = async () => {
  if (!props.conId) return;
  try {
    tableLoading.value = true;
    const res = await outputDeclarationApi.getProdValList({
      conId: props.conId,
    });
    if (res.code === 200) {
      tableData.value = res.data || [];
      total.value = res.data?.length || 0;
    }
  } catch (error) {
    console.error("获取列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};
const handlePaginationChange = (params: any) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
};
// 刷新（包一层 refreshing 状态驱动图标旋转，原 tableLoading 逻辑不动）
const handleRefresh = async () => {
  refreshing.value = true;
  try {
    resetPagination();
    await getDataList();
  } finally {
    refreshing.value = false;
  }
};
const resetPagination = () => {
  currentPage.value = 1;
  pageSize.value = 20;
}
// 发起流程
const handleAdd = () => {
  router.push({
    path: "/con/output-declaration/add",
    query: {
      conId: props.conId, // 合同ID
      projId: props.projId,
    },
  });
};
// 编辑
const handleEdit = async (row: any) => {
  router.push({
    path: "/con/output-declaration/edit",
    query: {
      conId: props.conId, // 合同ID
      projId: props.projId,
      prodId: row.id, // 产值ID
    },
  });
};

// 详情
const handleDetail = (row: any) => {
  router.push({
    path: "/con/output-declaration/detail",
    query: {
      prodId: row.id, // 补充合同ID
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
        const res = await outputDeclarationApi.delProdVal({ id: id });
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
.output-application-wrapper {
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
