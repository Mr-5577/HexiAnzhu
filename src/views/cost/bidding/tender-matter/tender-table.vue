<!-- 招标事项列表 -->
<template>
  <div class="tender-table-wrapper">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
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
          filterable
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
      <el-form-item label="招采责任人" prop="createId">
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
      </el-form-item>
      <el-form-item label="采购状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择采购状态"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="item in purchaseStatusEnum"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增事项</el-button>
      </el-form-item>
    </el-form>

    <base-table
      :columns="columns"
      :tableData="tableData"
      :loading="tableLoading"
      :rowKey="'id'"
      :pagination="false"
    >
      <template #tenderStatus="{ row }">
        <el-tag
          size="small"
          :type="getEnumType(purchaseStatusEnum, row.tenderStatus || 0)"
        >
          {{ getEnumLabel(purchaseStatusEnum, row.tenderStatus || 0) }}
        </el-tag>
      </template>

      <template #actions="{ row }">
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
      :empTreeData="empTreeData"
      :conType-options="conTypeOptions"
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
import type { BidTender } from "@/types/cost/bidding/bidding-management-type.ts";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api.ts";
import { conTypeApi } from "@/api/cost/master-data/contract-category-api.ts";
import { buildTree } from "@/utils/tree.ts";
import { purchaseStatusEnum } from "@/constants/bidding/enums.ts";
import { roleApi } from "@/api/system/role-api.ts";
import { getEnumLabel, getEnumType } from "@/utils/enum.ts";

defineOptions({ name: "tender-table" });

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
const tableData = ref<BidTender[]>([]);
const tenderDialogVisible = ref(false);
const editData = ref<BidTender | null>(null);
// 合同分类
const conTypeOptions = ref([]);
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
  conTypeId: undefined,
  tenderName: undefined,
  createId: undefined,
  status: undefined,
});

const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "segName", label: "业务板块", width: 90 },
  // { prop: "projectName", label: "项目名称", width: 150 },
  { prop: "tenderName", label: "采购事项", width: 200 },
  { prop: "conTypeName", label: "合同分类", width: 120 },
  // 计划金额格式化为￥10.00
  {
    prop: "planAmount",
    label: "计划金额(元)",
    width: 90,
    formatter: (row: BidTender) => `￥${row.planAmount}`,
  },
  { prop: "createName", label: "招采责任人", width: 100 },
  { prop: "bidStartDate", label: "招采开始日期", width: 120 },
  { prop: "bidEndDate", label: "招采结束日期", width: 120 },
  { prop: "demandDate", label: "需求时间", width: 100 },
  { prop: "purchaseMethodName", label: "采购方式", width: 90 },
  { prop: "tenderMethodName", label: "招标方式", width: 90 },
  { prop: "billModeName", label: "清单模式", width: 90 },
  { slot: "tenderStatus", label: "采购状态", width: 90 },
  {
    label: "操作",
    prop: "actions",
    width: 200,
    slot: "actions",
    fixed: "right",
  },
];
// 获取招标事项列表
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
    const query = {
      ...queryParams.value,
      ...params,
    };
    const res = await biddingManageApi.getTenderList(query);
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
  getDataList();
};

const handleReset = () => {
  queryParams.value = {
    conTypeId: undefined,
    tenderName: undefined,
    createId: undefined,
    status: undefined,
  };
  getDataList();
};

const handleAdd = () => {
  editData.value = null;
  tenderDialogVisible.value = true;
};

const handleEdit = (row: BidTender) => {
  editData.value = row;
  tenderDialogVisible.value = true;
};

const handleDetail = (row: BidTender) => {
  // 跳转到详情页面并传递事项ID参数
  router.push({
    path: "/bidding/bidding-detail",
    query: { tenderId: row.id, tab: "overview" },
  });
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

const handleDialogSuccess = () => {
  getDataList();
};
// 获取合同分类
const getConTypeList = async () => {
  try {
    const res = await conTypeApi.getConTypeList();
    if (res.code === 200) {
      conTypeOptions.value = buildTree(res.data || []);
    }
  } catch (error) {
    console.error("获取合同分类失败:", error);
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
  () => props.selectedData,
  (val) => {
    if (val) {
      getConTypeList();
      getEmpTreeData();
      getDataList();
    }
  },
  { immediate: true, deep: true },
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
