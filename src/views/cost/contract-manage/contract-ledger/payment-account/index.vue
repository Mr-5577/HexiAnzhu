<!-- 收款账号 列表（样式优化版 · 合并真实逻辑） -->
<template>
  <div class="payment-account-wrapper">
    <div class="pa-card">
      <base-table
        :columns="tableColumns"
        :tableData="tableData"
        :loading="tableLoading"
        :rowKey="'id'"
        :pagination="false"
      >
        <!-- 列表外操作栏 -->
        <template #actionBar>
          <div class="pa-toolbar">
            <div class="pa-toolbar__title">
              <span class="pa-toolbar__name">收款账号</span>
              <el-tag size="small" type="info" effect="plain" round>
                {{ tableData.length }} 个
              </el-tag>
            </div>
            <div class="pa-toolbar__actions">
              <!-- 刷新按钮：点击图标旋转 + 悬浮微浮起 + 刷新中禁用 -->
              <el-button
                type="primary"
                class="refresh-btn"
                :class="{ 'is-refreshing': refreshing }"
                :disabled="refreshing"
                @click="handleRefresh"
              >
                <el-icon class="refresh-icon"><Refresh /></el-icon>
                <span>{{ refreshing ? "刷新中" : "刷新列表" }}</span>
              </el-button>
              <!-- 如需新增按钮，取消注释即可（handleAdd 已就绪） -->
              <!-- <el-button class="add-btn" @click="handleAdd">＋ 新增</el-button> -->
            </div>
          </div>
        </template>
        <!-- 是否启用列 -->
        <template #isEnabled="{ row }">
          <el-tag :type="row.isEnabled ? 'success' : 'danger'" size="small" effect="light">
            {{ row.isEnabled ? "启用" : "禁用" }}
          </el-tag>
        </template>
        <template #actions="{ row }">
          <el-button type="primary" link class="row-link" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" link class="row-link" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </base-table>
    </div>

    <!-- 新增/编辑 收款账户弹窗 -->
    <add-edit-account-dialog
      v-model="dialogVisible"
      :conId="props.conId"
      :editData="editData"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { ContractBankAccount } from "@/types/cost/contract-manage/payment-account-type";
import { paymentAccountApi } from "@/api/cost/contract-manage/payment-account-api";
import AddEditAccountDialog from "./add-edit-account-dialog.vue";

defineOptions({ name: "payment-account" });

const props = defineProps<{
  conId: number | null;
}>();

const dialogVisible = ref(false);
const editData = ref<ContractBankAccount | null>(null);
const tableLoading = ref(false);
const refreshing = ref(false); // 驱动刷新按钮旋转动画
const tableData = ref<ContractBankAccount[]>([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "bankName", label: "开户银行" },
  { prop: "accountName", label: "银行户名" },
  { prop: "bankAccount", label: "银行账号" },
  { slot: "isEnabled", label: "是否启用", width: 100 },
  // 如需操作列，取消注释即可（#actions 插槽已就绪）
  // { label: "操作", width: 200, slot: "actions", fixed: "right" },
];

// 获取列表数据
const getDataList = async () => {
  if (!props.conId) {
    return;
  }
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await paymentAccountApi.getSupBankList({ conId: props.conId });
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取列表失败:", error);
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

// 新增
const handleAdd = () => {
  editData.value = null;
  dialogVisible.value = true;
};
// 编辑
const handleEdit = async (row: ContractBankAccount) => {
  editData.value = row;
  dialogVisible.value = true;
};
// 删除
const handleDelete = (row: ContractBankAccount) => {
  ElMessageBox.confirm(`确定删除"${row.bankName}"账户吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await paymentAccountApi.delSupBank({ id: row.id });
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

onMounted(() => {
  getDataList();
});
</script>

<style lang="scss" scoped>
.payment-account-wrapper {
  width: 100%;
  height: 100%;
  padding: 3px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 卡片容器 */
.pa-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: box-shadow 0.25s ease;
  &:hover {
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.09);
  }
}

/* 工具栏：左标题 / 右操作 */
.pa-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
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
  /* 刷新中：图标持续旋转 */
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

/* 新增按钮（如启用） */
.add-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
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
