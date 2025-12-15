<!-- 销售年报表 -->
<template>
  <div class="annual-report-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="年份" prop="year">
        <el-date-picker
          v-model="queryParams.year"
          type="year"
          placeholder="年份"
          
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
      :columns="annualReportColumns"
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
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import BaseTable from "@/components/base-table.vue";
import { annualReportColumns } from "./project-columns";

// 组件name，需要和菜单配置里面的name一致
defineOptions({
  name: "annual-report",
});

// 响应式数据
const queryParams = ref({
  year: "",
});

const tableLoading = ref(false);
const exportLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);

const handlePaginationChange = (params: any) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
};

const handleQuery = () => {};
const resetQuery = () => {
  queryParams.value = { year: "" };
};

// 生命周期
onMounted(() => {
  nextTick(() => {});
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
