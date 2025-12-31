<!-- 认购达成统计 -->
<template>
  <div class="subscription-statistics-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="项目" prop="projIds">
        <el-cascader
          class="fixed-height-cascader"
          :filterable="true"
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
      <el-form-item label="业态" prop="productTypes">
        <el-select
          v-model="queryParams.productTypes"
          placeholder="业态"
          clearable
          multiple
          collapse-tags
          style="width: 200px"
        >
          <el-option
            v-for="item in productTypeList"
            :key="item.id"
            :label="item.productTypeName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统计维度" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="统计维度"
          style="width: 200px"
        >
          <el-option label="按月统计" value="month" />
          <el-option label="按天统计" value="date" />
        </el-select>
      </el-form-item>
      <el-form-item
        :label="queryParams.type === 'month' ? '年月' : '认购日期'"
        prop="day"
      >
        <el-date-picker
          v-model="queryParams.day"
          :type="queryParams.type"
          placeholder="时间"
          :clearable="false"
          style="width: 200px"
          :format="queryParams.type == 'month' ? 'YYYY-MM' : 'YYYY-MM-DD'"
          :value-format="queryParams.type == 'month' ? 'YYYY-MM' : 'YYYY-MM-DD'"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button
          type="primary"
          icon="Download"
          :loading="exportLoading"
          @click="handleExport"
          :disabled="
            !menuStore.hasExactPermission('subscription-statistics:export')
          "
        >
          导出
        </el-button>
      </el-form-item>
    </el-form>
    <base-table
      :rowKey="'uuid'"
      :showSummary="true"
      :columns="tableColumns"
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
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import BaseTable from "@/components/base-table.vue";
import {
  SubscriptionStatisticsMonthColumns,
  SubscriptionStatisticsDayColumns,
} from "./project-columns";
import { assetManagementApi } from "@/api/asset-management-api";
import type {
  DayTableInterface,
  MonthTableInterface,
} from "@/types/subscription-statistics-type";
import { useSalesData } from "@/composables/use-sales";
import { dateUtil } from "@/utils/date-util";
import { ElMessage } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import { useMenuStore } from "@/stores/menu-store";
const menuStore = useMenuStore();
// 组件name，需要和菜单配置里面的name一致
defineOptions({
  name: "subscription-statistics",
});

// 使用共享的 data hook
const {
  projectOptions,
  productTypeList,
  // loading: dataLoading,
  // getLeafNodeIds,
  loadData,
  getAllLeafProjectIds,
  getAllProductTypeIds,
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

// 防止重复请求
let isRequesting = false;
// ref
const queryParams = ref({
  projIds: [],
  type: "month",
  productTypes: [],
  day: dateUtil().format("YYYY-MM"),
});
const tableLoading = ref<boolean>(false);
const exportLoading = ref<boolean>(false);
const currentPage = ref<number>(1);
const pageSize = ref<number>(20);
const total = ref<number>(0);
const tableData = ref<MonthTableInterface[] | DayTableInterface[]>([]);
const allTableList = ref<MonthTableInterface[] | DayTableInterface[]>([]);

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
  queryParams.value = {
    projIds: getAllLeafProjectIds(),
    type: "month",
    productTypes: getAllProductTypeIds(),
    day: dateUtil().format("YYYY-MM"),
  };
  currentPage.value = 1;
  pageSize.value = 20;
  getTableList();
};

// 初始化数据
const initPageData = async () => {
  await loadData({
    projects: true, // 项目数据
    productTypes: true, // 不需要业态数据
    saleStatus: false, // 不需要状态数据
  });

  // 设置查询参数默认值为全选
  queryParams.value.projIds = getAllLeafProjectIds();
  queryParams.value.productTypes = getAllProductTypeIds();

  // 获取列表数据
  await getTableList();
};
const getParams = () => ({
  projIds: queryParams.value.projIds,
  productTypes: queryParams.value.productTypes,
  day:
    queryParams.value.type === "month"
      ? `${queryParams.value.day}-01 00:00:00`
      : `${queryParams.value.day} 00:00:00`,
  current: currentPage.value,
});
// 获取列表
const getTableList = async () => {
  if (isRequesting) return;
  try {
    isRequesting = true;
    tableLoading.value = true;
    allTableList.value = [];
    const params = getParams();
    const interfaceApi =
      queryParams.value.type === "month"
        ? assetManagementApi.getOrderNumYearCount
        : assetManagementApi.getOrderNumMonthCount;
    const res = await interfaceApi(params);
    if (res.code === 200) {
      allTableList.value = res.data || [];
      total.value = res.data?.length;
    }
  } catch (error) {
  } finally {
    isRequesting = false;
    tableLoading.value = false;
  }
};
// 导出
const handleExport = async () => {
  try {
    exportLoading.value = true;
    const params = { ...getParams(), isExport: true };
    const interfaceExportApi =
      queryParams.value.type === "month"
        ? assetManagementApi.exportOrderNumYearCount
        : assetManagementApi.exportOrderNumMonthCount;
    const fileBlob = await interfaceExportApi(params);
    if (!fileBlob || fileBlob.size === 0) {
      ElMessage.warning("导出文件为空，请检查数据");
    } else {
      ElMessage.success("导出成功！");
    }
  } catch (error: any) {
    ElMessage.error(`导出失败：${error.message || "未知错误"}`);
  } finally {
    exportLoading.value = false;
  }
};
// 手动分页
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return allTableList.value.slice(start, end).map((item) => ({
    ...item,
    uuid: uuidv4(), // 为当前页的每一行生成 UUID
  }));
});
const tableColumns = computed(() => {
  if (queryParams.value.type === "month") {
    return SubscriptionStatisticsMonthColumns;
  } else {
    const currentLastDay = dateUtil(queryParams.value.day).daysInMonth();
    // 前1列是固定列（项目名），后面31列是日期列
    const fixedColumns = SubscriptionStatisticsDayColumns.slice(0, 1); // 固定列
    // 日期列
    const dateColumns = SubscriptionStatisticsDayColumns.slice(
      1,
      1 + currentLastDay
    );
    return [...fixedColumns, ...dateColumns];
  }
});
watch(
  () => queryParams.value.type,
  (newVal) => {
    queryParams.value.day = dateUtil().format(
      newVal === "month" ? "YYYY-MM" : "YYYY-MM-DD"
    );
    getTableList();
  }
  // { immediate: true }
);

// 生命周期
onMounted(() => {
  initPageData();
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.subscription-statistics-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
