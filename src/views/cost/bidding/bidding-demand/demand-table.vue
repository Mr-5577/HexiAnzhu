<!-- 招标需求列表 -->
<template>
  <div class="demand-table-wrapper">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="招标事项" prop="tenderName">
        <el-input
          v-model="queryParams.tenderName"
          placeholder="请输入招标事项"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="审批状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择审批状态"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="item in approvalStatusEnum"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建人" prop="createId">
        <el-cascader
          ref="projCascaderRef"
          v-model="queryParams.createId"
          :options="empTreeData"
          :show-all-levels="false"
          :props="{
            expandTrigger: 'click',
            emitPath: false,
            checkStrictly: false,
            value: 'orgId',
            label: 'orgName',
            children: 'children',
            // 通过 leaf 属性标识哪些是叶子节点（可选的）
            leaf: (data) => {
              // dataType: 0 表示人员，即叶子节点
              return data.dataType === 0;
            },
          }"
          placeholder="请选择"
          style="width: 180px"
          clearable
          filterable
        />
        <!-- <el-tree-select
          v-model="queryParams.createId"
          node-key="treeId"
          :props="defaultProps"
          :data="empTreeData"
          filterable
          style="width: 180px"
        /> -->
      </el-form-item>
      <el-form-item label="创建时间" prop="time">
        <el-date-picker
          v-model="queryParams.time"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 220px"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增需求</el-button>
      </el-form-item>
    </el-form>

    <base-table
      :columns="columns"
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

      <template #actions="{ row }">
        <el-button
          type="primary"
          link
          @click="handleEdit(row)"
          :disabled="row.status != 0"
        >
          编辑
        </el-button>
        <el-button
          type="danger"
          link
          @click="handleDelete(row)"
          :disabled="row.status != 0"
        >
          删除
        </el-button>
        <el-button type="primary" link @click="handleDetail(row)">
          详情
        </el-button>
      </template>
    </base-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { useRouter } from "vue-router";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api.ts";
import { approvalStatusEnum } from "@/constants/bidding/enums.ts";
import { roleApi } from "@/api/system/role-api.ts";
import { dateUtil } from "@/utils/date-util";
import { getEnumLabel, getEnumType } from "@/utils/enum";

defineOptions({ name: "demand-table" });

interface Props {
  selectedData: any;
}
const props = withDefaults(defineProps<Props>(), {
  selectedData: null,
});

const emit = defineEmits<{
  (e: "select-project"): void;
}>();

const router = useRouter();

const tableLoading = ref(false);
const tableData = ref([]);
// 人员树形结构数据
const empTreeData = ref([]);
const defaultProps = {
  value: "treeId",
  label: "orgName",
  children: "children",
  disabled: (data: any) => {
    // 禁用所有 dataType 不为 'emp' 的节点 ==== seg: '板块',mgu: '管理单元',dept: '部门',emp: '员工'
    return data.dataType !== 0;
  },
};

const queryParams = ref({
  tenderName: "",
  status: undefined,
  createId: undefined,
  time: [],
});

const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "bizTitle", label: "标题", width: 200 },
  { prop: "segName", label: "业务板块", width: 90 },
  { prop: "projName", label: "项目", width: 150 },
  { prop: "tenderName", label: "需求事项", minWidth: 200 },
  { prop: "demandDate", label: "需求时间", width: 100 },
  { slot: "status", label: "审批状态", width: 90 },
  { prop: "createName", label: "创建人", width: 90 },
  {
    prop: "createDate",
    label: "创建时间",
    width: 120,
    formatter: (row) => dateUtil(row.createDate).format("YYYY-MM-DD"),
  },
  {
    label: "操作",
    width: 180,
    slot: "actions",
    fixed: "right",
  },
];
// 获取招标需求列表
const getDataList = async () => {
  if (!props.selectedData) {
    return;
  }
  const { orgId, dataType } = props.selectedData;
  const params = {
    projSegId: dataType === 4 ? orgId : undefined, // 板块
    projMguId: dataType === 3 ? orgId : undefined, // 公司
    projId: dataType === 1 ? orgId : undefined, // 项目
  };
  try {
    tableLoading.value = true;
    tableData.value = [];
    const [startDate, endDate] = queryParams.value.time || [];
    const query = {
      tenderName: queryParams.value.tenderName,
      status: queryParams.value.status,
      createId: queryParams.value.createId,
      ...params,
      startDate: startDate,
      endDate: endDate,
    };
    const res = await biddingManageApi.getDemandList(query);
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
  getDataList();
};

const handleReset = () => {
  queryParams.value = {
    tenderName: "",
    status: undefined,
    createId: undefined,
    time: [],
  };
  getDataList();
};

// 新增
const handleAdd = () => {
  router.push({
    path: "/bidding/bidding-demand/add",
    query: { t: Date.now() },
  });
};

// 编辑
const handleEdit = (row) => {
  router.push({
    path: "/bidding/bidding-demand/edit",
    query: { billId: row.bidBillId },
  });
};

// 详情
const handleDetail = (row) => {
  router.push({
    path: "/bidding/bidding-demand/detail",
    query: {
      billId: row.bidBillId,
    },
  });
};

const handleDelete = ({ bidBillId }) => {
  ElMessageBox.confirm("确定删除该招标需求吗？", "提示", { type: "warning" })
    .then(async () => {
      const res = await biddingManageApi.delDemand({ billId: bidBillId });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getDataList();
      }
    })
    .catch(() => {});
};

// 获取人员树形数据
const getEmpTreeData = async () => {
  const res = await roleApi.getEmpTree({ empName: "", isIncludeLeave: false });
  // console.log("获取人员列表", res);
  if (res.code === 200) {
    empTreeData.value = res.data || [];
  }
};

watch(
  () => props.selectedData,
  (val) => {
    if (val) {
      getEmpTreeData();
      getDataList();
    }
  },
  { immediate: true, deep: true },
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
