<!-- 转换率统计页面 -->
<template>
  <div class="conversion-rate-page">
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
      <el-form-item label="时间" prop="day">
        <el-date-picker
          v-model="queryParams.day"
          type="month"
          placeholder="时间"
          :clearable="false"
          format="YYYY-MM"
          value-format="YYYY-MM"
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
      :columns="conversionRateColumns"
      :tableData="tableData"
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
import { conversionRateColumns } from "./project-columns";
import { useSalesData } from "@/composables/use-sales";
import { dateUtil } from "@/utils/date-util";
// 组件name，需要和菜单配置里面的name一致
defineOptions({
  name: "conversion-rate",
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
const queryParams = ref({
  projIds: [],
  day: dateUtil().format("YYYY-MM"),
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
};
const resetQuery = () => {
  queryParams.value = {
    projIds: getAllLeafProjectIds(),
    day: dateUtil().format("YYYY-MM"),
  };
  currentPage.value = 1;
  pageSize.value = 20;
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
  // await getTableList();
};

// 手动分页
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return allTableList.value.slice(start, end);
});

// 生命周期
onMounted(() => {
  initPageData();
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.conversion-rate-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
