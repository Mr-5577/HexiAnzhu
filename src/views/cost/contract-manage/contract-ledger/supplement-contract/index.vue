<!-- 补充合同 列表 -->
<template>
  <div class="supplement-contract-table">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="补充合同名称" prop="addName">
        <el-input
          v-model="queryParams.addName"
          placeholder="请输入名称"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>
    <base-table
      :columns="tableColumns"
      :tableData="tableData"
      :loading="tableLoading"
      :rowKey="'id'"
      :pagination="false"
    >
      <template #conProperty="{ row }">
        {{ getLabel(ConPropertyEnum, row.conProperty) }}
      </template>
      <template #priceType="{ row }">
        {{ getLabel(PriceTypeEnum, row.priceType) }}
      </template>
      <template #payType="{ row }">
        {{ getLabel(PayTypeEnum, row.payType) }}
      </template>
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
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
import { useRouter } from "vue-router";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { supplementContractApi } from "@/api/cost/contract-manage/supplement-contract-api";
import { SupplementContract } from "@/types/cost/contract-manage/supplement-contract-type";
import {
  ConPropertyEnum,
  PriceTypeEnum,
  PayTypeEnum,
  getLabel,
} from "@/constants/contract-manage/enums";

defineOptions({ name: "supplement-contract" });

const props = defineProps<{
  conId: number | null;
}>();

const router = useRouter();

const queryParams = ref({
  addName: "",
});
const tableLoading = ref(false);
const tableData = ref([]);

const tableColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "addName", label: "补充合同名称", width: 150 },
  { prop: "addSysNo", label: "补充合同编号", width: 220 },
  { prop: "addType", label: "补充合同类型", width: 150 },
  { prop: "companyName", label: "甲方签约公司", width: 180 },

  { prop: "supId", label: "供应商", width: 150 },
  { prop: "addAmt", label: "补充合同签约金额(含税)", width: 150 },
  { prop: "addExclAmt", label: "补充合同签约金额(不含税)", width: 150 },
  { prop: "taxAmt", label: "税额", width: 150 },
  { prop: "signDate", label: "签订日期", width: 150 },
  { slot: "conProperty", label: "主合同类型", width: 180 },
  { slot: "priceType", label: "主合同计价方式", width: 180 },
  { slot: "payType", label: "主合同付款方式", width: 180 },
  {
    label: "操作",
    width: 220,
    slot: "actions",
    fixed: "right",
  },
];
// 获取列表数据
const getDataList = async () => {
  if (!props.conId) {
    return;
  }
  try {
    tableLoading.value = true;
    const res = await supplementContractApi.getSupplementContractList({
      ...queryParams.value,
      conId: props.conId,
    });
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
  queryParams.value.addName = "";
  getDataList();
};
const handleAdd = () => {
  router.push({
    path: "/contract/supplement-contract/add",
    query: {
      mode: "add",
      conId: props.conId, // 合同台账ID（合同单据ID）
    },
  });
};
const handleEdit = (row: SupplementContract) => {
  router.push({
    path: "/contract/supplement-contract/edit",
    query: {
      mode: "edit",
      addId: row.id, // 补充合同ID
      conId: props.conId, // 合同台账ID（合同单据ID）
    },
  });
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除“${row.addName}”数据吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await supplementContractApi.delSupplementContract({
          id: row.id,
        });
        if (res.code === 200) {
          ElMessage.success("删除成功");
          getDataList();
        }
      } catch (error) {}
    })
    .catch(() => {});
};
const handleDetail = (row) => {};

watch(
  () => props.conId,
  (val) => {
    if (val) {
      getDataList();
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.supplement-contract-table {
  width: 100%;
  height: 100%;
  padding: 15px 15px;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
