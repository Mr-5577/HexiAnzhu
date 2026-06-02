<!-- 招标需求 -->
<template>
  <div class="demand-form-page">
    <!-- 基本信息 -->
    <basic-info
      :data="props.detailData"
      :project-options="props.projectOptions"
    ></basic-info>

    <div class="form-section">
      <h3 class="section-title">需求明细</h3>
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
        <!-- 列表外操作栏 -->
        <template #actionBar>
          <div class="actionBar-buttons">
            <el-button
              type="primary"
              size="small"
              plain
              @click="handleDemandDialog"
            >
              关联需求
            </el-button>
          </div>
        </template>
      </base-table>
    </div>
    <!-- 招标需求选择弹窗 -->
    <association-demand-dialog
      v-model="dialogVisible"
      @success="handleDemandSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BasicInfo from "../basic-info.vue";
import {
  BidDemand,
  BidTenderFormParams,
} from "@/types/cost/bidding-management-type";
import { biddingManageApi } from "@/api/cost/bidding-management-api";
import AssociationDemandDialog from "./association-demand-dialog.vue";
import { ElMessage } from "element-plus";

defineOptions({ name: "demand" });

interface Props {
  tenderId: number;
  detailData?: {
    tender: BidTenderFormParams;
    items: any[];
    projIds: number[];
  };
  projectOptions: any[];
}
const props = withDefaults(defineProps<Props>(), {
  tenderId: null,
  detailData: null,
  projectOptions: () => [],
});

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
  { prop: "segName", label: "业务板块", width: 120 },
  { prop: "projName", label: "项目名称", width: 200 },
  { prop: "companyName", label: "公司名称" },
  { prop: "tenderName", label: "招标事项" },
  { prop: "demandDate", label: "需求时间", width: 120 },
  { prop: "demandRemark", label: "需求说明" },
];
// 投标表格
const tableData = ref([]);
const getDemandList = async () => {
  try {
    tableLoading.value = true;
    const res = await biddingManageApi.getBillList({ bizItemCode: "ZB_XQ" });
    if (res.code === 200) {
      const dataList = (res.data as any[]) || [];
      tableData.value = dataList.map((item) => item.demand);
    }
  } catch (error) {
    console.error("获取招标需求列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
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
  }
}
</style>
