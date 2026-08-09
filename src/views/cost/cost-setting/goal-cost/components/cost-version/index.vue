<!-- 版本列表 -->
<template>
  <div class="version-list-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="版本号" prop="versionNo">
        <el-input
          v-model="queryParams.versionNo"
          placeholder="请输入版本号"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="版本类型" prop="versionType">
        <el-select
          v-model="queryParams.versionType"
          placeholder="请选择版本类型"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="item in verTypeOptions"
            :key="item.dicCode"
            :label="item.dicLabel"
            :value="item.dicCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">
          搜索
        </el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增版本</el-button>
      </el-form-item>
    </el-form>

    <base-table
      :columns="tableColumns"
      :tableData="tableData"
      :loading="tableLoading"
      :rowKey="'id'"
      :pagination="false"
    >
      <template #isEnabled="{ row }">
        <el-tag
          size="small"
          :type="row.isEnabled ? 'success' : 'info'"
        >
          {{ row.isEnabled ? "是" : "否" }}
        </el-tag>
      </template>
      <template #status="{ row }">
        <el-tag
          size="small"
          :type="getEnumType(costBillStatusEnum, row?.status || 0) as 'primary' | 'success' | 'warning' | 'info' | 'danger'"
        >
          {{ getEnumLabel(costBillStatusEnum, row?.status || 0) }}
        </el-tag>
      </template>
      <template #actions="{ row }">
        <el-button
          type="primary"
          link
          @click="handleEdit(row)"
          :disabled="row.status != 0"
          >编辑</el-button
        >
        <el-button
          type="primary"
          link
          @click="handleDetail(row)"
          :disabled="row.status != 0"
        >
          明细
        </el-button>
        <el-button
          type="primary"
          link
          @click="handleApprove(row)"
          :disabled="row.status != 0"
        >
          提交审批
        </el-button>
        <el-button
          type="primary"
          link
          @click="handleCancel(row)"
          :disabled="row.status != 0"
        >
          作废
        </el-button>
        <el-button
          type="danger"
          link
          @click="handleDelete(row)"
          :disabled="row.status != 0"
        >
          删除
        </el-button>
        <el-button type="primary" link @click="handleViewProcess(row)">
          查看流程
        </el-button>
      </template>
    </base-table>

    <!-- 新增/编辑弹窗 -->
    <add-edit-version-dialog
      v-model="dialogVisible"
      :edit-data="currentEditData"
      :verTypeOptions="verTypeOptions"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import type { HCstProjectCostM } from "@/types/cost/cost-setting/goal-cost-type.ts";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api.ts";
import AddEditVersionDialog from "./add-edit-version-dialog.vue";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { useRouter } from "vue-router";
import { getEnumLabel, getEnumType } from "@/utils/enum.ts";
import { costBillStatusEnum } from "@/constants/cost/enums.ts";
import { commonApi } from "@/api/cost/common-api.ts";

defineOptions({ name: "cost-version" });

// Props
const props = defineProps<{
  selectedData: any;
}>();

const router = useRouter();

const verTypeOptions = ref([]); // 目标成本版本类型
// 数据字典
const { getDictList, loadDicts } = useDict(
  [
    dictMapping.goalCostVersionType, // 目标成本版本类型
  ],
  {
    treeDictCodes: [],
  },
);

// 查询参数
const queryParams = ref({
  versionNo: "",
  versionType: "",
});

// 表格相关
const tableLoading = ref(false);
const tableData = ref<HCstProjectCostM[]>([]);

// 弹窗相关
const dialogVisible = ref(false);
const currentEditData = ref<HCstProjectCostM | null>(null);

// 表格列配置
const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: "60" },
  { prop: "areaVerMTitle", label: "标题", width: 200 },
  { prop: "projName", label: "项目名称", width: 150 },
  { prop: "versionNo", label: "版本号", minWidth: 200 },
  { prop: "versionTypeName", label: "版本类型", width: 120 },
  { prop: "segName", label: "业务板块", width: 120 },
  { slot: "isEnabled", label: "当前使用", width: 90 },
  { prop: "remark", label: "备注", minWidth: 200 },
  { slot: "status", label: "审批状态", width: 100 },
  { label: "操作", width: 320, slot: "actions", fixed: "right" },
];

// 获取数据列表
const getDataList = async () => {
  try {
    tableLoading.value = true;
    const { orgId, dataType } = props.selectedData;
    const params = {
      projSegId: dataType === 4 ? orgId : undefined, // 板块
      projMguId: dataType === 3 ? orgId : undefined, // 公司
      projId: dataType === 1 ? orgId : undefined, // 项目
    };
    const query = { ...queryParams.value, ...params };
    const res = await goalCostApi.getProjectCostMList(query);
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取列表失败:", error);
    ElMessage.error("获取列表失败");
  } finally {
    tableLoading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  getDataList();
};

// 重置
const handleReset = () => {
  queryParams.value = {
    versionNo: "",
    versionType: "",
  };
  handleSearch();
};

// 新增
const handleAdd = () => {
  currentEditData.value = null;
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: HCstProjectCostM) => {
  currentEditData.value = row;
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row: HCstProjectCostM) => {
  try {
    await ElMessageBox.confirm(`确定删除版本"${row.versionNo}"吗？`, "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });

    const res = await goalCostApi.delProjectCostM({ id: row.id });
    if (res.code === 200) {
      ElMessage.success("删除成功");
      getDataList();
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
    }
  }
};
// 提交审批
const handleApprove = async (row: HCstProjectCostM) => {
  ElMessageBox.confirm("确定要提交审批吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await goalCostApi.saveCostMFlow({
        costMId: row.id,
      });
      if (res.code === 200 && res.data) {
        ElMessage.success("提交成功");
        getDataList();
        // 生成OA审批页面重定向地址
        generateRedirectUrl(res.data);
      }
    } catch (error) {
      console.error("操作失败:", error);
    }
  });
};
// 生成OA审批重定向地址
const generateRedirectUrl = async (oaRequestId: string) => {
  try {
    const res = await commonApi.generateRedirectUrl({
      oaRequestId,
    });
    if (res.code === 200 && res.data) {
      // 打开OA审批页面
      setTimeout(() => {
        window.open(res.data, "_blank");
      }, 800);
    }
  } catch (error) {
    console.error("生成OA审批重定向地址失败:", error);
  }
};
// 作废
const handleCancel = async (row: HCstProjectCostM) => {
  ElMessageBox.confirm("确定要作废当前数据吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await goalCostApi.voidProjectCostM({
        id: row.id,
      });
      if (res.code === 200) {
        ElMessage.success("提交成功");
        getDataList();
      }
    } catch (error) {
      console.error("操作失败:", error);
    }
  });
};
// 明细
const handleDetail = (row: HCstProjectCostM) => {
  router.push({
    path: "/cost/cost-detail",
    query: {
      mode: "add",
      projId: row.projId, // 项目ID
      costMid: row.id, // 成本版本ID
      areaVerMid: row.areaVerMid, // 面积版本ID
    },
  });
};
// 查看流程
const handleViewProcess = async (row: HCstProjectCostM) => {
  // 获取单据详情查看流程
  const detailRes = await goalCostApi.getCostBillInfo({
    costMId: row.id,
  });
  if (detailRes.code === 200 && detailRes.data) {
    const { flowList } = detailRes.data;
    if (flowList && flowList.wfFlowId) {
      try {
        const redirectRes = await commonApi.generateRedirectUrl({
          oaRequestId: flowList.wfFlowId,
        });
        if (redirectRes.code === 200 && redirectRes.data) {
          window.open(redirectRes.data, "_blank");
        }
      } catch (error) {
        console.error("查看流程失败:", error);
      }
    } else {
      ElMessage.warning("未找到审批流程");
    }
  }
};
// 操作成功
const handleSuccess = () => {
  getDataList();
};

// 初始化数据字典数据
const initDictData = async () => {
  await loadDicts();
  verTypeOptions.value = getDictList(dictMapping.goalCostVersionType); // 目标成本版本类型
};

watch(
  () => props.selectedData,
  async (newVal) => {
    if (newVal) {
      await initDictData();
      getDataList();
    }
  },
  { immediate: true },
);

onMounted(() => {});
</script>

<style lang="scss" scoped>
.version-list-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #fff;
}
</style>
