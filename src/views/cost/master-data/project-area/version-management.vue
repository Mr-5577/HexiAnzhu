<!-- 版本管理 -->
<template>
  <div class="version-management-page">
    <div class="table-header">
      <div class="header-title">
        <span class="title">项目版本管理</span>
        <span class="subtitle">
          管理项目不同阶段的面积指标版本，支持提交审核流程
        </span>
      </div>
      <div class="header-actions">
        <span class="version-count">共 {{ versionCount }} 个版本</span>
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          创建版本
        </el-button>
      </div>
    </div>

    <base-table
      ref="tableRef"
      :columns="tableColumns"
      :tableData="listData"
      rowKey="id"
      :border="true"
      :loading="loading"
      :pagination="false"
    >
      <!-- 版本状态自定义渲染 -->
      <template #status="{ row }">
        <el-tag :type="getStatusType(row.status)" size="small">
          {{ getStatusText(row.status) }}
        </el-tag>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button
          link
          type="primary"
          v-if="row.status === 'draft'"
          @click="handleSubmitApproval(row)"
        >
          提交审批
        </el-button>
      </template>
    </base-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({ name: "version-management" });

// 定义 props
const props = defineProps<{
  projectId?: string | number;
}>();

// 类型定义
interface VersionItem {
  id: number;
  projectName: string;
  versionName: string;
  status: "draft" | "pending" | "approved" | "rejected";
  description: string;
  creator: string;
  createDate: string;
}

// 数据
const loading = ref(false);
const listData = ref<VersionItem[]>([]);

// 版本数量
const versionCount = computed(() => listData.value.length);

// 表格列配置
const tableColumns = [
  {
    type: "index",
    label: "序号",
    width: 60,
    align: "center",
  },
  {
    prop: "projectName",
    label: "项目名称",
    minWidth: 150,
  },
  {
    prop: "versionName",
    label: "版本名称",
    minWidth: 150,
  },
  {
    prop: "status",
    label: "版本状态",
    width: 100,
    align: "center",
    slot: "status",
  },
  {
    prop: "description",
    label: "说明",
    minWidth: 200,
  },
  {
    prop: "creator",
    label: "填制人",
    width: 120,
    align: "center",
  },
  {
    prop: "createDate",
    label: "填制日期",
    width: 120,
    align: "center",
  },
  {
    prop: "actions",
    label: "操作",
    width: 120,
    align: "center",
    slot: "actions",
    fixed: "right",
  },
];

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    draft: "info",
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };
  return types[status] || "info";
};

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: "草稿",
    pending: "审批中",
    approved: "已通过",
    rejected: "已驳回",
  };
  return texts[status] || "未知";
};

// 提交审批
const handleSubmitApproval = (row: VersionItem) => {
  ElMessageBox.confirm(`确定提交版本"${row.versionName}"的审批吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(async () => {
      try {
        // TODO: 调用提交审批接口
        ElMessage.success("提交审批成功");
      } catch (error) {
        ElMessage.error("提交审批失败");
      }
    })
    .catch(() => {});
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // TODO: 调用接口获取版本列表
    // const res = await getVersionList({ projectId: props.projectId });
    // listData.value = res.data;

    // 模拟数据
    await new Promise((resolve) => setTimeout(resolve, 500));
    listData.value = [
      {
        id: 1,
        projectName: "成都测试小区",
        versionName: "V1.0 初始版本",
        status: "approved",
        description: "项目初始面积指标版本",
        creator: "张三",
        createDate: "2024-01-15",
      },
      {
        id: 2,
        projectName: "成都测试小区",
        versionName: "V1.1 调整版本",
        status: "pending",
        description: "根据规划调整面积指标",
        creator: "李四",
        createDate: "2024-02-20",
      },
      {
        id: 3,
        projectName: "成都测试小区",
        versionName: "V1.2 最终版本",
        status: "draft",
        description: "最终确认的面积指标",
        creator: "王五",
        createDate: "2024-03-10",
      },
    ];
  } catch (error) {
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

// 暴露方法给父组件
defineExpose({
  refresh: loadData,
});
</script>

<style lang="scss" scoped>
.version-management-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  padding: 20px 20px;
  box-sizing: border-box;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  .table-header {
    margin-bottom: 10px;
    .header-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 20px;
      .title {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }

      .subtitle {
        font-size: 14px;
        color: #909399;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;

      .version-count {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}
</style>
