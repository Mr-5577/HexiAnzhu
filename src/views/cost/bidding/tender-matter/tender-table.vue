<!-- 招标事项列表 -->
<template>
  <div class="tender-table-wrapper">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="业务板块" prop="segId">
        <el-select
          v-model="queryParams.segId"
          placeholder="请选择业务板块"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="item in segOptions"
            :key="item.id"
            :label="item.segName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="合同分类" prop="conTypeId">
        <el-cascader
          v-model="queryParams.conTypeId"
          :options="conTypeOptions"
          :show-all-levels="false"
          :props="{
            expandTrigger: 'hover',
            emitPath: false,
            checkStrictly: false,
            value: 'id',
            label: 'conTypeName',
            children: 'children',
          }"
          placeholder="请选择合同分类"
          style="width: 180px"
          clearable
        />
      </el-form-item>
      <el-form-item label="招标单号" prop="tenderNo">
        <el-input
          v-model="queryParams.tenderNo"
          placeholder="请输入招标单号"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="采购事项" prop="tenderName">
        <el-input
          v-model="queryParams.tenderName"
          placeholder="请输入采购事项"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleTender">新增事项</el-button>
      </el-form-item>
    </el-form>

    <base-table
      :columns="columns"
      :tableData="tableData"
      :loading="tableLoading"
      :rowKey="'id'"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :pagination="false"
      @pagination-change="handlePaginationChange"
    >
      <template #tenderStatus="{ row }">
        <span>{{ getTenderStatusText(row.tenderStatus) }}</span>
      </template>
      <template #actions="{ row }">
        <!-- <el-button type="primary" link @click="handleReview(row)">
          审核
        </el-button> -->
        <el-button type="primary" link @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
        <el-button type="primary" link @click="handleDetail(row)">
          招标详情
        </el-button>
      </template>
    </base-table>

    <!-- 新增/编辑 招标事项弹窗 -->
    <add-edit-tender-dialog
      v-model="tenderDialogVisible"
      :edit-data="editData"
      :project-id="projectId"
      :seg-options="segOptions"
      :conType-options="conTypeOptions"
      :project-options="projectOptions"
      :purchaseMethod-options="purchaseMethodOptions"
      :tenderMethod-options="tenderMethodOptions"
      :billMode-options="billModeOptions"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { useRouter } from "vue-router";
import AddEditTenderDialog from "./add-edit-tender-dialog.vue";
import type {
  BidTender,
  BidTenderQueryParams,
} from "@/types/cost/bidding/bidding-management-type.ts";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api.ts";
import { conTypeApi } from "@/api/cost/master-data/contract-category-api.ts";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api.ts";
import { largeScreenApi } from "@/api/large-screen-api";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";

defineOptions({ name: "tender-table" });

const props = defineProps<{
  projectId: number | null;
}>();

const emit = defineEmits<{
  (e: "select-project"): void;
}>();

const router = useRouter();

const tableLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref<BidTender[]>([]);
const tenderDialogVisible = ref(false);
const editData = ref<BidTender | null>(null);
const demandDialogVisible = ref(false);

const queryParams = ref<BidTenderQueryParams>({
  segId: undefined,
  conTypeId: undefined,
  tenderName: "",
  tenderNo: "",
});
// 业务板块
const segOptions = ref([]);
// 合同分类
const conTypeOptions = ref([]);
// 项目列表
const projectOptions = ref([]);
// 采购方式
const purchaseMethodOptions = ref([]);
// 招标方式
const tenderMethodOptions = ref([]);
// 清单模式
const billModeOptions = ref([]);
// 数据字典
const { getDictList, loadDicts } = useDict(
  [
    dictMapping.purchaseMethod, // 采购方式
    dictMapping.tenderMethod, // 招标方式
    dictMapping.billMode, // 清单模式
  ],
  {
    treeDictCodes: [],
  },
);

const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "segName", label: "业务板块", width: 120 },
  // { prop: "projectName", label: "项目名称", width: 200 },
  { prop: "tenderNo", label: "招标单号", width: 220 },
  { prop: "conTypeName", label: "合同分类", width: 120 },
  { prop: "tenderName", label: "采购事项", width: 150 },
  { prop: "purchaseMethodName", label: "采购方式", width: 120 },
  { prop: "tenderMethodName", label: "招标方式", width: 120 },
  { prop: "planAmount", label: "计划金额", width: 120 },
  { prop: "billModeName", label: "清单模式", width: 120 },
  { prop: "demandDate", label: "需求时间", width: 120 },
  { prop: "bidStartDate", label: "招采开始日期", width: 120 },
  { prop: "bidEndDate", label: "招采结束日期", width: 120 },
  { prop: "dutyMan", label: "招采负责人", width: 120 },
  { slot: "tenderStatus", label: "采购状态", width: 120 },
  {
    label: "操作",
    prop: "actions",
    width: 220,
    slot: "actions",
    fixed: "right",
  },
];
// 获取招标事项列表
const getDataList = async () => {
  if (!props.projectId) {
    return;
  }
  try {
    tableLoading.value = true;
    tableData.value = [];
    const params = {
      ...queryParams.value,
      projId: props.projectId,
    };
    const res = await biddingManageApi.getTenderList(params);
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取招标事项列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  getDataList();
};

const handleReset = () => {
  queryParams.value = {
    segId: undefined,
    conTypeId: undefined,
    tenderName: "",
    tenderNo: "",
  };
  currentPage.value = 1;
  getDataList();
};

const handlePaginationChange = (params: any) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
  getDataList();
};

const handleTender = () => {
  editData.value = null;
  tenderDialogVisible.value = true;
};

const handleEdit = (row: BidTender) => {
  editData.value = row;
  tenderDialogVisible.value = true;
};

const handleDetail = (row: BidTender) => {
  // 跳转到详情页面并传递事项ID参数
  router.push({ path: "/bidding/bidding-detail", query: { tenderId: row.id } });
};

const handleDelete = (row: BidTender) => {
  ElMessageBox.confirm("确定删除该招标事项吗？", "提示", { type: "warning" })
    .then(async () => {
      const res = await biddingManageApi.delTender({ id: row.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getDataList();
      }
    })
    .catch(() => {});
};
const handleReview = (row: BidTender) => {
  console.log("审核招标事项:", row);
};
const getTenderStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: "草稿",
    1: "已审批",
    2: "招标中",
    3: "已定标",
    4: "已签约",
  };
  return statusMap[status] || "未知";
};

const handleDialogSuccess = () => {
  getDataList();
};
// 获取合同分类
const getConTypeList = async () => {
  try {
    const res = await conTypeApi.getConTypeList();
    if (res.code === 200) {
      conTypeOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取合同分类失败:", error);
  }
};
// 获取业务板块列表
const getSegOptions = async () => {
  try {
    const res = await dictionaryApi.getsegmentList();
    if (res.code === 200) {
      segOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取业务板块列表失败:", error);
  }
};
// 获取项目列表
const getProjectOptions = async () => {
  try {
    const res = await largeScreenApi.getProjList();
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};
// 初始化数据字典数据
const initDictData = async () => {
  await loadDicts();
  purchaseMethodOptions.value = getDictList(dictMapping.purchaseMethod); // 采购方式
  tenderMethodOptions.value = getDictList(dictMapping.tenderMethod); // 招标方式
  billModeOptions.value = getDictList(dictMapping.billMode); // 清单模式
};

watch(
  () => props.projectId,
  (val) => {
    if (val) {
      getConTypeList();
      getSegOptions();
      getProjectOptions();
      initDictData();
      getDataList();
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.tender-table-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
