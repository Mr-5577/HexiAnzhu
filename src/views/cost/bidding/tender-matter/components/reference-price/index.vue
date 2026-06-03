<!-- 定标参考价 -->
<template>
  <div class="reference-price-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="招标名称" prop="tenderName">
        <el-input
          v-model="queryParams.tenderName"
          placeholder="请输入招标名称"
          clearable
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="项目" prop="projId">
        <el-select
          v-model="queryParams.projId"
          placeholder="请选择项目"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="item in projectOptions"
            :key="item.id"
            :label="item.projName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd"> 新增 </el-button>
      </el-form-item>
    </el-form>
    <base-table
      :columns="mainColumns"
      :tableData="tableData"
      :rowKey="'id'"
      :pagination="false"
      :show-toolbar="false"
    >
      <!-- 展开行：显示明细子表格 -->
      <template #expand="{ row }">
        <div class="expand-table-wrapper">
          <base-table
            :columns="detailColumns"
            :tableData="row.refers || []"
            :pagination="false"
            :show-toolbar="false"
            :border="true"
            :height="'auto'"
          />
          <div v-if="!row.refers?.length" class="empty-detail">
            暂无明细数据
          </div>
        </div>
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
import { ref, onMounted } from "vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { biddingManageApi } from "@/api/cost/bidding-management-api";
import { largeScreenApi } from "@/api/large-screen-api";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { BidAwardReferBill } from "@/types/cost/bidding-management-type";

defineOptions({ name: "reference-price" });

interface Props {
  tenderId?: number; // 事项ID
}
const props = withDefaults(defineProps<Props>(), {
  tenderId: null, // 事项ID
});

const router = useRouter();
const queryParams = ref({
  tenderName: "",
  projId: null,
});
// 项目列表
const projectOptions = ref([]);

// 主表列配置
const mainColumns: TableColumnItem[] = [
  { type: "expand", width: "50", slot: "expand" },
  { type: "index", label: "序号", width: 60 },
  { prop: "tenderNo", label: "招标编号", width: 220 },
  { prop: "tenderName", label: "招标名称", minWidth: 150 },
  { prop: "projNames", label: "项目", minWidth: 200 },
  { prop: "companyNames", label: "公司", width: 120 },
  { prop: "bidStartDate", label: "投标开始", width: 110, align: "center" },
  { prop: "bidEndDate", label: "投标结束", width: 110, align: "center" },
  { prop: "dutyMan", label: "负责人", width: 100, align: "center" },
  {
    label: "操作",
    width: 150,
    slot: "actions",
    fixed: "right",
  },
];

// 子表格列配置
const detailColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目", minWidth: 200 },
  { prop: "bldNames", label: "楼栋", minWidth: 200 },
  { prop: "referAmount", label: "不含税参考价", width: 200 },
  { prop: "costAlert", label: "成本预警", width: 200 },
  { prop: "referRemark", label: "参考价说明", minWidth: 200 },
];

const tableData = ref<BidAwardReferBill[]>([]);
const tableLoading = ref(false);

// 获取定标参考价列表
const getTableList = async () => {
  try {
    tableLoading.value = true;
    const params = {
      ...queryParams.value,
      tenderId: props.tenderId,
      bizItemCode: "ZB_CK", // 定标参考价
    };
    const res = await biddingManageApi.getBillList(params);
    if (res.code === 200 && res.data) {
      tableData.value = res.data.map((item: BidAwardReferBill) => ({
        ...item.bill,
        refers: item.refers || [],
      }));
    }
  } catch (error) {
    console.error("获取定标参考价列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};
const handleSearch = () => {
  getTableList();
};
const handleReset = () => {
  queryParams.value = {
    tenderName: "",
    projId: null,
  };
  getTableList();
};
// 新增
const handleAdd = () => {
  // 跳转到新增页面，传递事项ID
  router.push({
    path: "/bidding/reference-price/add",
    query: { tenderId: props.tenderId, mode: "add" },
  });
};
// 编辑
const handleEdit = (row) => {
  // 跳转到编辑页面，把当前点击的数据作为参数传递过去
  router.push({
    path: "/bidding/reference-price/edit",
    query: { tenderId: props.tenderId, id: row.id, mode: "edit" },
  });
};
// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("确定删除该数据？", "提示", { type: "warning" })
    .then(async () => {
      const res = await biddingManageApi.delBill({
        billId: row.id,
        bizItemCode: "ZB_CK",
      });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getTableList();
      }
    })
    .catch(() => {});
};
const handleDetail = (row) => {
  // 跳转到详情页面，把当前点击的数据作为参数传递过去
  router.push({
    path: "/bidding/reference-price/detail",
    query: { tenderId: props.tenderId, id: row.id, mode: "detail" },
  });
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
onMounted(() => {
  getTableList();
  getProjectOptions();
});
</script>

<style scoped lang="scss">
.reference-price-page {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;

  .expand-table-wrapper {
    height: 150px;

    .empty-detail {
      padding: 20px;
      text-align: center;
      color: #999;
      background: #fff;
      border-radius: 4px;
    }
  }
}
</style>
