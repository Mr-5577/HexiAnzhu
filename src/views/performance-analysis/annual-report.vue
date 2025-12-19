<!-- 销售年报表 -->
<template>
  <div class="annual-report-page">
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
      <el-form-item label="年份" prop="day">
        <el-date-picker
          v-model="queryParams.day"
          type="year"
          placeholder="年份"
          format="YYYY"
          value-format="YYYY"
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
        >
          导出
        </el-button>
      </el-form-item>
    </el-form>
    <base-table
      :showSummary="true"
      :columns="annualReportColumns"
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
import { annualReportColumns } from "./project-columns";
import { useSalesData } from "@/composables/use-sales";
import { dateUtil } from "@/utils/date-util";
import { assetManagementApi } from "@/api/asset-management-api";
import { ElMessage } from "element-plus";

// 组件name，需要和菜单配置里面的name一致
defineOptions({
  name: "annual-report",
});

// 使用共享的 data hook
const { projectOptions, loadData, getAllLeafProjectIds } = useSalesData();
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
  day: "",
});
const tableLoading = ref<boolean>(false);
const exportLoading = ref<boolean>(false);
const currentPage = ref<number>(1);
const pageSize = ref<number>(20);
const total = ref<number>(0);
const tableData = ref<any[]>([]);
const allTableList = ref<any[]>([]);

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
    productTypes: false, // 业态数据
    saleStatus: false, // 不需要状态数据
  });

  // 设置查询参数默认值为全选
  queryParams.value.projIds = getAllLeafProjectIds();

  // 获取列表数据
  await getTableList();
};
const getParams = () => {
  const { projIds, day } = queryParams.value;
  return {
    projIds: projIds,
    day: `${day}-01-01 00:00:00`,
  };
};
// 获取列表
const getTableList = async () => {
  try {
    tableLoading.value = true;
    allTableList.value = [];
    const params = getParams();
    const res = await assetManagementApi.getSaleYearReport(params);
    if (res.code === 200) {
      allTableList.value = res.data || [];
      total.value = res.data?.length;
    }
  } catch (error) {
  } finally {
    tableLoading.value = false;
  }
};
// 导出
const handleExport = async () => {
  try {
    exportLoading.value = true;
    const params = { ...getParams(), isExport: true };
    const fileBlob = await assetManagementApi.exportSaleYearReport(params);
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
const initTime = () => {
  queryParams.value.day = dateUtil().format("YYYY");
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
.annual-report-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
