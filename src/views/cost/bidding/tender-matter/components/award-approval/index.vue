<!-- 定标审批 -->
<template>
  <div class="award-approval-page">
    <div style="display: flex; justify-content: flex-end; margin-bottom: 10px">
      <el-button plain type="primary" @click="handleSearch">
        刷新列表
      </el-button>
      <el-button type="primary" @click="handleAdd"> 新增 </el-button>
    </div>
    <base-table
      :columns="mainColumns"
      :tableData="tableData"
      :rowKey="'id'"
      :pagination="false"
      :loading="tableLoading"
      :show-toolbar="false"
    >
      <template #status="{ row }">
        <el-tag
          size="small"
          :type="getEnumType(purchaseBillStatusEnum, row?.status || 0)"
        >
          {{ getEnumLabel(purchaseBillStatusEnum, row?.status || 0) }}
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
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { BidAwardBill } from "@/types/cost/bidding/bidding-management-type";
import { getEnumLabel, getEnumType } from "@/utils/enum";
import { purchaseBillStatusEnum } from "@/constants/bidding/enums";

defineOptions({ name: "award-approval" });

interface Props {
  tenderId?: number; // 事项ID
}
const props = withDefaults(defineProps<Props>(), {
  tenderId: null, // 事项ID
});

const router = useRouter();

// 主表列配置
const mainColumns: TableColumnItem[] = [
  { type: "index", label: "序号", width: 60 },
  { prop: "bizTitle", label: "标题", minWidth: 300 },
  { slot: "status", label: "审批状态", minWidth: 120 },
  { prop: "createName", label: "创建人", minWidth: 120 },
  { prop: "createDate", label: "创建时间", minWidth: 120 },
  {
    label: "操作",
    width: 180,
    slot: "actions",
    fixed: "right",
  },
];

const tableData = ref<BidAwardBill[]>([]);
const tableLoading = ref(false);

// 获取列表
const getTableList = async () => {
  try {
    tableLoading.value = true;
    const params = {
      tenderId: props.tenderId,
      bizItemCode: "ZB_DB", // 定标审批
    };
    const res = await biddingManageApi.getBillList(params);
    if (res.code === 200 && res.data) {
      tableData.value = res.data.map((item: BidAwardBill) => ({
        ...item.bill,
        awards: item.awards || [],
      }));
    }
  } catch (error) {
    console.error("获取定标审批列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};
const handleSearch = () => {
  getTableList();
};

// 新增
const handleAdd = () => {
  // 跳转到新增页面，传递事项ID
  router.push({
    path: "/bidding/award-approval/add",
    query: { t: Date.now(), tenderId: props.tenderId },
  });
};
// 编辑
const handleEdit = (row) => {
  // 跳转到编辑页面，把当前点击的数据作为参数传递过去
  router.push({
    path: "/bidding/award-approval/edit",
    query: { billId: row.id, tenderId: props.tenderId },
  });
};
// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("确定删除该数据？", "提示", { type: "warning" })
    .then(async () => {
      const res = await biddingManageApi.delBill({
        billId: row.id,
        bizItemCode: "ZB_DB",
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
    path: "/bidding/award-approval/detail",
    query: { billId: row.id, tenderId: props.tenderId },
  });
};

onMounted(() => {
  getTableList();
});
</script>

<style scoped lang="scss">
.award-approval-page {
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
