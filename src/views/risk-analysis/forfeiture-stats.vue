<!-- 退房挞定统计 -->
<template>
  <div class="forfeiture-stats-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="项目" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="项目"
          clearable
          style="width: 200px"
        >
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="业态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="业态"
          clearable
          style="width: 200px"
        >
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间" prop="status">
        <el-date-picker
          v-model="queryParams.status"
          type="daterange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 220px"
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
      :columns="forfeitureStatslColumns"
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
import { forfeitureStatslColumns } from "./project-columns";

// 组件name，需要和菜单配置里面的name一致
defineOptions({
  name: "forfeiture-stats",
});

// 响应式数据
const queryParams = ref({
  menuName: "",
  status: "",
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
  queryParams.value = { menuName: "", status: "" };
};

// 生命周期
onMounted(() => {
  nextTick(() => {});
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.forfeiture-stats-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
