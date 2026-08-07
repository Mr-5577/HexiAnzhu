<!-- 招标需求 -->
<template>
  <div class="demand-form-page">
    <div class="form-section">
      <!-- <h3 class="section-title">需求明细</h3> -->
      <div class="actionBar-buttons">
        <el-button plain type="primary" @click="getDemandList">
          刷新列表
        </el-button>
        <el-button type="primary" @click="handleDemandDialog">
          关联需求
        </el-button>
      </div>
      <base-table
        :columns="columns"
        :tableData="tableData"
        :loading="tableLoading"
        :rowKey="'id'"
        :pagination="false"
        :auto-height="false"
        :height="'100%'"
        :show-toolbar="false"
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
          <el-button type="primary" link @click="handleDetail(row)">
            详情
          </el-button>
        </template>
      </base-table>
    </div>
    <!-- 招标需求选择弹窗 -->
    <association-demand-dialog
      v-model="dialogVisible"
      :proj-id="props.projId"
      @success="handleDemandSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  BidDemand,
  BidTenderFormParams,
} from "@/types/cost/bidding/bidding-management-type.ts";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api.ts";
import AssociationDemandDialog from "./association-demand-dialog.vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { dateUtil } from "@/utils/date-util.ts";
import { getEnumLabel, getEnumType } from "@/utils/enum.ts";
import { approvalStatusEnum } from "@/constants/bidding/enums.ts";

defineOptions({ name: "demand" });

interface Props {
  tenderId?: number; // 事项ID
  projId?: number; // 当前事项所属项目ID
}
const props = withDefaults(defineProps<Props>(), {
  tenderId: null, // 事项ID
  projId: undefined,
});

const router = useRouter();

const dialogVisible = ref(false);
const saveLoading = ref(false);

const handleDemandSelect = (selectedRows: BidDemand[]) => {
  if (selectedRows.length === 0) {
    ElMessage.warning("请选择要关联的招标需求");
    return;
  }
  const demandData = selectedRows[0];
  const params = {
    tenderId: props.tenderId,
    demandId: demandData.id,
  };
  try {
    saveLoading.value = true;
    biddingManageApi.linkDemandToTender(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success("关联成功");
        getDemandList();
      }
    });
  } catch (error) {
    console.error("关联失败:", error);
  } finally {
    saveLoading.value = false;
  }
};
const handleDemandDialog = () => {
  dialogVisible.value = true;
};

const tableLoading = ref(false);
const columns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "bizTitle", label: "标题", width: 200 },
  { prop: "segName", label: "业务板块", width: 100 },
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
    width: 120,
    slot: "actions",
    fixed: "right",
  },
];
// 投标表格
const tableData = ref([]);

const getDemandList = async () => {
  try {
    tableLoading.value = true;
    const res = await biddingManageApi.getBillList({
      tenderId: props.tenderId,
      bizItemCode: "ZB_XQ",
      projId: props.projId,
    });
    if (res.code === 200) {
      const dataList = res.data || [];
      let list = [];
      dataList.map((item) => {
        list = list.concat(item.demands || []);
      });
      tableData.value = list;
    }
  } catch (error) {
    console.error("获取招标需求列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
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

onMounted(() => {
  getDemandList();
});
</script>

<style scoped lang="scss">
.demand-form-page {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  padding: 20px 20px;
  box-sizing: border-box;
  .form-section {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    min-height: 0;
    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 0;
      color: #333;
    }
  }
  .actionBar-buttons {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
  }
}
</style>
