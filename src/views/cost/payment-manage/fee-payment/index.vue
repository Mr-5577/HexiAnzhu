<!-- 费用支付 列表 -->
<template>
  <div class="fee-payment-wrapper">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      label-width="90px"
    >
      <el-form-item label="业务板块" prop="segId">
        <el-select
          v-model="queryParams.segId"
          placeholder="请选择业务板块"
          style="width: 220px"
          clearable
        >
          <el-option
            v-for="item in segOptions"
            :key="item.id"
            :label="item.segName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
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
        />
      </el-form-item>

      <el-form-item label="审批状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          style="width: 220px"
        >
          <el-option
            v-for="item in conBillStatusEnum"
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
        <el-button type="primary" @click="handleAdd">新增</el-button>
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
          :type="getEnumType(conBillStatusEnum, row?.status || 0)"
        >
          {{ getEnumLabel(conBillStatusEnum, row?.status || 0) }}
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { largeScreenApi } from "@/api/sales/large-screen-api";
import { feePaymentApi } from "@/api/cost/non-contract-manage/fee-payment-api";
import { getEnumLabel, getEnumType } from "@/utils/enum";
import { conBillStatusEnum } from "@/constants/contract-manage/enums";
import { roleApi } from "@/api/system/role-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";

defineOptions({ name: "fee-payment" });

const router = useRouter();

const queryParams = ref({
  segId: undefined,
  projId: undefined,
  status: undefined,
  createId: undefined,
  time: [],
});
// 项目列表
const projectOptions = ref([]);
const tableLoading = ref(false);
const tableData = ref([]);
// 人员树形结构数据
const empTreeData = ref([]);
const segOptions = ref([]);

const columns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60, fixed: "left" },
  { prop: "segName", label: "业务板块", width: 120 },
  { prop: "bizTitle", label: "标题", width: 200 },
  { prop: "projName", label: "项目名称", width: 150 },
  // { prop: "feeTypeId", label: "费用类型", width: 150 },
  { prop: "reqAmt", label: "实际请款金额", width: 120 },
  { prop: "reqDesc", label: "请款说明", width: 200 },
  { slot: "status", label: "审批状态", width: 100 },
  { prop: "createName", label: "创建人", width: 100 },
  { prop: "createDate", label: "创建日期", width: 120 },
  {
    label: "操作",
    prop: "actions",
    width: 200,
    slot: "actions",
    fixed: "right",
  },
];
// 获取列表数据
const getDataList = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];
    const params = {
      projId: queryParams.value.projId,
      segId: queryParams.value.segId,
      status: queryParams.value.status,
      createId: queryParams.value.createId,
      createDateStart: queryParams.value.time?.[0] || "",
      createDateEnd: queryParams.value.time?.[1] || "",
    };
    const res = await feePaymentApi.getFeePaymentList(params);
    if (res.code === 200) {
      tableData.value = res.data || [];
    }
  } catch (error) {
    console.error("获取费用支付列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

const handleSearch = () => {
  getDataList();
};

const handleReset = () => {
  queryParams.value = {
    segId: undefined,
    projId: undefined,
    status: undefined,
    createId: undefined,
    time: [],
  };
  getDataList();
};
// 新增
const handleAdd = () => {
  router.push({
    path: "/ncon/fee-payment/add",
    query: {
      t: Date.now(),
    },
  });
};
// 编辑
const handleEdit = ({ id }) => {
  router.push({
    path: "/ncon/fee-payment/edit",
    query: {
      feePaymentId: id, // 费用支付ID
    },
  });
};
// 详情
const handleDetail = ({ id }) => {
  router.push({
    path: "/ncon/fee-payment/detail",
    query: {
      feePaymentId: id, // 费用支付ID
    },
  });
};
// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除这条数据吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      const res = await feePaymentApi.delFeePayment({ id: row.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getDataList();
      }
    })
    .catch(() => {});
};
// 获取项目列表
const getProjectOptions = async () => {
  try {
    // const res = await largeScreenApi.getProjList(); // 扁平结构数据
    const res = await projectAreaApi.getSegMguProjList(); // 板块-公司-项目树形结构数据
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
  if (res.code === 200) {
    empTreeData.value = res.data || [];
  }
};
// 获取业务板块列表
const getSegOptions = async () => {
  try {
    const res = await dictionaryApi.getsegmentList({ isAuth: true });
    if (res.code === 200) {
      segOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取业务板块列表失败:", error);
  }
};
onMounted(async () => {
  await Promise.all([getProjectOptions(), getEmpTreeData(), getSegOptions()]);
  getDataList();
});
</script>

<style lang="scss" scoped>
.fee-payment-wrapper {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
