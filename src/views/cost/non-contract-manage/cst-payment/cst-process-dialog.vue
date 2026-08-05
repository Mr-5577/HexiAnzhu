<!-- 建安立项数据 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="'关联立项'"
    width="1200px"
    @close="handleClose"
    @confirm="handleConfirm"
  >
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      label-width="90px"
    >
      <el-form-item label="项目名称" prop="projId">
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
          style="width: 220px"
          clearable
          disabled
        />
      </el-form-item>
      <el-form-item label="事项名称" prop="processName">
        <el-input
          v-model="queryParams.processName"
          placeholder="请输入事项名称"
          clearable
          style="width: 220px"
        />
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
          style="width: 220px"
          clearable
          filterable
        />
      </el-form-item>
      <el-form-item label="创建日期" prop="time">
        <el-date-picker
          v-model="queryParams.time"
          type="daterange"
          range-separator="至"
          value-format="YYYY-MM-DD"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 220px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    <base-table
      ref="tableRef"
      :columns="tableColumns"
      :table-data="tableData"
      :row-key="'id'"
      :pagination="false"
      :show-toolbar="false"
      :show-action-bar="false"
      :selectionMode="'single'"
      :height="'500px'"
      @selection-change="handleSelectionChange"
    >
      <template #status="{ row }">
        <el-tag
          size="small"
          :type="getEnumType(conBillStatusEnum, row?.status || 0)"
        >
          {{ getEnumLabel(conBillStatusEnum, row?.status || 0) }}
        </el-tag>
      </template>
    </base-table>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { TableColumnItem } from "@/components/base/base-table.vue";
import { cstProcessApi } from "@/api/cost/non-contract-manage/cst-process-api";
import { ElMessage } from "element-plus";
import { getEnumLabel, getEnumType } from "@/utils/enum";
import { conBillStatusEnum } from "@/constants/contract-manage/enums";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { roleApi } from "@/api/system/role-api";

const props = defineProps<{
  modelValue: boolean;
  projId: number | undefined;
  segId: number | undefined;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [selectedRows: any[]];
}>();

const dialogVisible = ref(props.modelValue);

const queryParams = ref({
  projId: props.projId,
  segId: props.segId,
  processName: "",
  status: undefined,
  createId: undefined,
  time: [],
});
// 项目列表
const projectOptions = ref([]);
// 人员树形结构数据
const empTreeData = ref([]);
const selectedRows = ref([]);
const tableData = ref([]);
const tableColumns: TableColumnItem[] = [
  { type: "selection", width: 50, fixed: "left" },
  { type: "index", label: "序号", width: 60 },
  { prop: "bizTitle", label: "标题", width: 200 },
  { prop: "projName", label: "项目名称", width: 140 },
  { prop: "processNo", label: "事项编号", width: 140 },
  { prop: "processName", label: "事项名称", width: 150 },
  { prop: "processAmt", label: "事项计划金额", width: 120 },
  { prop: "ww", label: "剩余金额", width: 120 },
  { prop: "createName", label: "创建人", width: 100 },
  { prop: "createDate", label: "创建日期", width: 120 },
  {
    slot: "status",
    label: "状态",
    width: 100,
  },
];
// 获取建安立项数据
const getCstProcessList = async () => {
  try {
    const params = {
      projId: queryParams.value.projId,
      segId: queryParams.value.segId,
      processName: queryParams.value.processName,
      status: 40, // 查询已审批的数据
      createId: queryParams.value.createId,
      createDateStart: queryParams.value.time?.[0] || "",
      createDateEnd: queryParams.value.time?.[1] || "",
    };
    const res = await cstProcessApi.getCstProcessList(params);
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {}
};
const handleSearch = () => {
  getCstProcessList();
};

const handleReset = () => {
  queryParams.value = {
    projId: undefined,
    segId: undefined,
    processName: "",
    status: undefined,
    createId: undefined,
    time: [],
  };
  getCstProcessList();
};
/**
 * 表格选择变化
 */
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};
/**
 * 确认选择
 */
const handleConfirm = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请选择一条数据");
    return;
  }
  emit("success", selectedRows.value);
  handleClose();
};
const handleClose = () => {
  selectedRows.value = [];
  dialogVisible.value = false;
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
// 获取人员树形数据
const getEmpTreeData = async () => {
  const res = await roleApi.getEmpTree({ empName: "", isIncludeLeave: false });
  // console.log("获取人员列表", res);
  if (res.code === 200) {
    empTreeData.value = res.data || [];
  }
};
watch(
  () => props.modelValue,
  async (val) => {
    dialogVisible.value = val;
    queryParams.value.projId = props.projId;
    queryParams.value.segId = props.segId;
    if (val) {
      await Promise.all([getProjectOptions(), getEmpTreeData()]);
      getCstProcessList();
    }
  },
);

watch(dialogVisible, (val) => emit("update:modelValue", val));
</script>
<style lang="scss" scoped></style>
