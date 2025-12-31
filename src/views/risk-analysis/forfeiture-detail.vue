<!-- 退房挞定明细 -->
<template>
  <div class="forfeiture-detail-page">
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
        />
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
      <el-form-item label="类型" prop="checkOutType">
        <el-select
          v-model="queryParams.checkOutType"
          placeholder="业态"
          :clearable="false"
          style="width: 200px"
        >
          <el-option label="全部" :value="0" />
          <el-option label="退房" :value="1" />
          <el-option label="挞定" :value="2" />
        </el-select>
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
        <el-button
          type="primary"
          icon="Download"
          :loading="exportLoading"
          @click="handleExport"
          :disabled="!menuStore.hasExactPermission('forfeiture-detail:export')"
        >
          导出
        </el-button>
      </el-form-item>
    </el-form>
    <base-table
      :rowKey="'uuid'"
      :showSummary="true"
      :columns="forfeitureDetailColumns"
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
import { computed, onMounted, onUnmounted, ref } from "vue";
import BaseTable from "@/components/base-table.vue";
import { forfeitureDetailColumns } from "./project-columns";
import { useSalesData } from "@/composables/use-sales";
import { dateUtil } from "@/utils/date-util";
import { assetManagementApi } from "@/api/asset-management-api";
import { ForfeitureDetailInterface } from "@/types/risk-analysis-type";
import { ElMessage } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import { useRoute } from "vue-router";
import { useMenuStore } from "@/stores/menu-store";
const menuStore = useMenuStore();
const route = useRoute();

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "forfeiture-detail" });

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

// ref
const queryParams = ref({
  projIds: [],
  productTypes: [],
  time: [],
  checkOutType: 0,
});
const tableLoading = ref<boolean>(false);
const exportLoading = ref<boolean>(false);
const currentPage = ref<number>(1);
const pageSize = ref<number>(20);
const total = ref<number>(0);
const tableData = ref<ForfeitureDetailInterface[]>([]);
const allTableList = ref<ForfeitureDetailInterface[]>([]);

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
  initQueryParams();
  currentPage.value = 1;
  pageSize.value = 20;
  getTableList();
};
// 处理查询参数
const initQueryParams = () => {
  // 如果有路由参数，使用路由参数
  if (route.query.data) {
    try {
      const routeData = JSON.parse(route.query.data as string);
      queryParams.value.productTypes = getAllProductTypeIds();
      queryParams.value = { ...queryParams.value, ...routeData };
    } catch (error) {
      console.error("解析路由参数失败，使用默认值", error);
      initDefaultParams();
    }
  } else {
    // 没有路由参数，默认全选
    initDefaultParams();
  }
};
// 默认全选查询条件
const initDefaultParams = () => {
  queryParams.value.projIds = getAllLeafProjectIds();
  queryParams.value.productTypes = getAllProductTypeIds();
  initTime();
};
const initTime = () => {
  const startTime = dateUtil().date(1).format("YYYY-MM-DD");
  const endTime = dateUtil().format("YYYY-MM-DD");
  queryParams.value.time = [startTime, endTime];
};
// 初始化数据
const initPageData = async () => {
  await loadData({
    projects: true, // 项目数据
    productTypes: true, // 业态数据
    saleStatus: false, // 不需要状态数据
  });

  // 初始化查询参数
  initQueryParams();

  // 获取列表数据
  await getTableList();
};
const getParams = () => {
  const { projIds, time, productTypes, checkOutType } = queryParams.value;
  return {
    projIds,
    productTypes,
    checkOutType,
    type: 0,
    day: `${time[0]} 00:00:00`,
    beginDate: `${time[0]} 00:00:00`,
    endDate: `${time[1]} 23:59:59`,
  };
};
// 获取列表
const getTableList = async () => {
  try {
    tableLoading.value = true;
    allTableList.value = [];
    const { time } = queryParams.value;
    if (!time || time.length < 2) {
      allTableList.value = [];
      total.value = 0;
      return;
    }
    const params = getParams();
    const res = await assetManagementApi.getCheckOutInfoRoom(params);
    if (res.code === 200) {
      allTableList.value = res.data || [];
      total.value = res.data?.length || 0;
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    allTableList.value = [];
    total.value = 0;
  } finally {
    tableLoading.value = false;
  }
};
// 导出
const handleExport = async () => {
  try {
    exportLoading.value = true;
    const params = { ...getParams(), isExport: true };
    const fileBlob = await assetManagementApi.exportCheckOutInfoRoom(params);
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

// 生命周期
onMounted(() => {
  initPageData();
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.forfeiture-detail-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
