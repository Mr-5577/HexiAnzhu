<template>
  <div class="room-ledger-page">
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
      <el-form-item label="状态" prop="saleStatus">
        <el-select
          v-model="queryParams.saleStatus"
          placeholder="状态"
          clearable
          multiple
          collapse-tags
          style="width: 200px"
        >
          <el-option
            v-for="item in saleStatusList"
            :key="item.id"
            :label="item.saleStatusName"
            :value="item.id"
          />
        </el-select>
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
      :columns="roomLedgerColumns"
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
import { roomLedgerColumns } from "./project-columns";
import { assetManagementApi } from "@/api/asset-management-api";
import type { RoomTableInterface } from "@/types/asset-management-type";
import { useSalesData } from "@/composables/use-sales";
import { ElMessage } from "element-plus";

// 组件name，需要和菜单配置里面的name一致
defineOptions({
  name: "room-ledger",
});

// 使用共享的 data hook
const {
  projectOptions,
  productTypeList,
  saleStatusList,
  // loading: dataLoading,
  // getLeafNodeIds,
  loadAllData,
  getAllLeafProjectIds,
  getAllProductTypeIds,
  getAllSaleStatusIds,
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
  saleStatus: [],
});
const tableLoading = ref<boolean>(false);
const exportLoading = ref<boolean>(false);
const currentPage = ref<number>(1);
const pageSize = ref<number>(20);
const total = ref<number>(0);
// const tableData = ref<RoomTableInterface[]>([]);
const allTableList = ref<RoomTableInterface[]>([]);
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
    productTypes: getAllProductTypeIds(),
    saleStatus: getAllSaleStatusIds(),
  };
  currentPage.value = 1;
  pageSize.value = 20;
  getTableList();
};

// 初始化数据
const initPageData = async () => {
  // 加载所有共享数据
  await loadAllData();

  // 设置查询参数默认值为全选
  queryParams.value = {
    projIds: getAllLeafProjectIds(),
    productTypes: getAllProductTypeIds(),
    saleStatus: getAllSaleStatusIds(),
  };

  // 获取列表数据
  await getTableList();
};
const getParams = () => ({
  ...queryParams.value,
  current: currentPage.value,
});
// 获取列表
const getTableList = async () => {
  try {
    tableLoading.value = true;
    const params = getParams();
    const res = await assetManagementApi.getRoomAccountBook(params);
    if (res.code === 200) {
      allTableList.value = res.data?.records || [];
      currentPage.value = res.data.current;
      total.value = res.data?.total || 0;
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
    const fileBlob = await assetManagementApi.exportRoomAccountBook(params);
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
.room-ledger-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
