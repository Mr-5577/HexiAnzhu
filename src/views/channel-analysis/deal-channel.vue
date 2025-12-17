<!-- 成交渠道分析页面 -->
<template>
  <div class="deal-channel-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="项目" prop="projIds">
        <el-cascader
          class="custom-cascader"
          v-model="queryParams.projIds"
          placeholder="请选择"
          :options="projectOptions"
          :props="cascaderProps"
          collapse-tags
          collapse-tags-tooltip
          clearable
          :show-all-levels="false"
          :max-collapse-tags="1"
        ></el-cascader>
      </el-form-item>
      <el-form-item label="时间" prop="time">
        <el-date-picker
          v-model="queryParams.time"
          type="daterange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 220px"
          :clearable="false"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="Download" :loading="exportLoading">
          导出
        </el-button>
      </el-form-item>
    </el-form>
    <base-table
      :columns="dealChannelColumns"
      :tableData="paginatedData"
      :loading="tableLoading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @pagination-change="handlePaginationChange"
    ></base-table>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import BaseTable from "@/components/base-table.vue";
import { dealChannelColumns } from "./project-columns";
import { assetManagementApi } from "@/api/asset-management-api";
import type { DayTableInterface } from "@/types/channel-analysis-type";
import { useSalesData } from "@/composables/use-sales";
import { dateUtil } from "@/utils/date-util";

// 组件name，需要和菜单配置里面的name一致
defineOptions({
  name: "deal-channel",
});
// 使用共享的 data hook
const {
  projectOptions,
  // loading: dataLoading,
  // getLeafNodeIds,
  loadData,
  getAllLeafProjectIds,
} = useSalesData();

const cascaderProps = computed(() => ({
  value: "id",
  label: "projName",
  multiple: true,
  emitPath: false,
  checkStrictly: true, // 可选：是否严格选择模式
  expandTrigger: "hover", // 可选：展开方式
  // 关键：根据 projType 设置 disabled
  // disabled: (data: any, node: any) => {
  //   // projType !== 1 的项目禁用
  //   return data.projType !== 1;
  // },
}));

// ref
const queryParams = ref({
  projIds: [],
  time: [],
});
const tableLoading = ref<boolean>(false);
const exportLoading = ref<boolean>(false);
const currentPage = ref<number>(1);
const pageSize = ref<number>(20);
const total = ref<number>(0);
const tableData = ref<DayTableInterface[]>([]);
const allTableList = ref<DayTableInterface[]>([]);

const handlePaginationChange = (params: any) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
};

const handleQuery = () => {
  currentPage.value = 1;
  pageSize.value = 20;
  getTableList();
};
const resetQuery = () => {
  initTime();
  queryParams.value.projIds = getAllLeafProjectIds();
  currentPage.value = 1;
  pageSize.value = 20;
  getTableList();
};

// 初始化数据
const initPageData = async () => {
  await loadData({
    projects: true, // 项目数据
    productTypes: false, // 不需要业态数据
    saleStatus: false, // 不需要状态数据
  });

  // 设置查询参数默认值为全选
  queryParams.value.projIds = getAllLeafProjectIds();

  // 获取列表数据
  await getTableList();
};
// 获取列表
const getTableList = async () => {
  try {
    tableLoading.value = true;
    allTableList.value = [];
    const { projIds, time } = queryParams.value;
    const params = {
      projIds: projIds,
      type: 1,
      beginDate: time[0] + " 00:00:00",
      endDate: time[1] + " 00:00:00",
    };
    const res = await assetManagementApi.getOrderPathWayProjCount(params);
    if (res.code === 200) {
      allTableList.value = res.data || [];
      total.value = res.data?.length;
    }
  } catch (error) {
  } finally {
    tableLoading.value = false;
  }
};
const initTime = () => {
  const startTime = dateUtil().date(1).format("YYYY-MM-DD");
  const endTime = dateUtil().format("YYYY-MM-DD");
  queryParams.value.time = [startTime, endTime];
};
// 手动分页
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return allTableList.value.slice(start, end);
});
// 生命周期
onMounted(() => {
  initTime();
  initPageData();
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.deal-channel-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
