<!-- 招标需求列表 -->
<template>
  <div class="demand-table-wrapper">
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
      <el-form-item label="公司" prop="companyId">
        <el-select
          v-model="queryParams.companyId"
          placeholder="请选择公司"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="item in projectOptions"
            :key="item.orgId"
            :label="item.orgName"
            :value="item.orgId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目" prop="projId">
        <el-cascader
          v-model="queryParams.projId"
          :options="projectOptions"
          :show-all-levels="false"
          :props="{
            expandTrigger: 'hover',
            emitPath: false,
            checkStrictly: false,
            value: 'orgId',
            label: 'orgName',
            children: 'children',
          }"
          placeholder="请选择项目"
          style="width: 180px"
          clearable
        />
      </el-form-item>
      <el-form-item label="招标事项" prop="tenderName">
        <el-input
          v-model="queryParams.tenderName"
          placeholder="请输入招标事项"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleDemand">新增需求</el-button>
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
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
        <!-- <el-button type="primary" link @click="handleDetail(row)">
          详情
        </el-button> -->
      </template>
    </base-table>

    <!-- 新增/编辑 招标需求弹窗 -->
    <add-edit-demand-dialog
      v-model="demandDialogVisible"
      :edit-data="editData"
      :seg-options="segOptions"
      :project-options="projectOptions"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { useRouter } from "vue-router";
import AddEditDemandDialog from "./add-edit-demand-dialog.vue";
import type {
  BidDemandQueryParams,
  BidDemand,
} from "@/types/cost/bidding/bidding-management-type.ts";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api.ts";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api.ts";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api.ts";
import { largeScreenApi } from "@/api/large-screen-api";

defineOptions({ name: "demand-table" });

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
const tableData = ref<BidDemand[]>([]);
const editData = ref<BidDemand | null>(null);
const demandDialogVisible = ref(false);

const queryParams = ref<BidDemandQueryParams>({
  segId: undefined,
  companyId: undefined,
  projId: undefined,
  tenderName: "",
});
// 业务板块
const segOptions = ref([]);
// 项目列表
const projectOptions = ref([]);

const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "segName", label: "业务板块", width: 120 },
  { prop: "projName", label: "项目名称", width: 200 },
  { prop: "companyName", label: "公司名称", width: 200 },
  { prop: "tenderName", label: "招标事项", minWidth: 200 },
  { prop: "demandDate", label: "需求时间", width: 150 },
  { prop: "demandRemark", label: "需求说明", minWidth: 200 },
  {
    label: "操作",
    prop: "actions",
    width: 200,
    slot: "actions",
    fixed: "right",
  },
];
// 获取招标需求列表
const getDataList = async () => {
  if (!props.projectId) {
    return;
  }
  try {
    tableLoading.value = true;
    tableData.value = [];
    const res = await biddingManageApi.getDemandList(queryParams.value);
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取招标需求列表失败:", error);
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
    companyId: undefined,
    projId: undefined,
    tenderName: "",
  };
  currentPage.value = 1;
  getDataList();
};

const handlePaginationChange = (params: any) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
  getDataList();
};

const handleDemand = () => {
  editData.value = null;
  demandDialogVisible.value = true;
};

const handleEdit = (row: BidDemand) => {
  editData.value = row;
  demandDialogVisible.value = true;
};

const handleDetail = (row: BidDemand) => {};

const handleDelete = (row: BidDemand) => {
  ElMessageBox.confirm("确定删除该招标需求吗？", "提示", { type: "warning" })
    .then(async () => {
      const res = await biddingManageApi.delDemand({ id: row.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getDataList();
      }
    })
    .catch(() => {});
};

const handleDialogSuccess = () => {
  getDataList();
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
    // const res = await largeScreenApi.getProjList(); // 扁平结构数据
    const res = await projectAreaApi.getMguProjList(); // 公司-项目树形结构数据
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};

watch(
  () => props.projectId,
  (val) => {
    if (val) {
      getSegOptions();
      getProjectOptions();
      getDataList();
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.demand-table-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
