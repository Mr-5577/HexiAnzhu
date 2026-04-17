<!-- 应收明细表 -->
<template>
  <div class="receivable-detail-page">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="项目" prop="projIds">
        <!-- <el-cascader
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
        ></el-cascader> -->
        <project-tree-selector
          v-model="queryParams.projIds"
          :project-list="projectOptions"
          placeholder="请选择项目"
          width="220px"
        ></project-tree-selector>
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
          :disabled="!menuStore.hasExactPermission('receivable-detail:export')"
        >
          导出
        </el-button>
      </el-form-item>
    </el-form>
    <base-table
      :rowKey="'uuid'"
      :columns="receivablesDetailColumns"
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
import { receivablesDetailColumns } from "./project-columns";
import { assetManagementApi } from "@/api/asset-management-api";
import { useSalesData } from "@/composables/use-sales";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { useMenuStore } from "@/stores/menu-store";
const menuStore = useMenuStore();
const route = useRoute();

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "receivable-detail" });

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
  initQueryParams();
  currentPage.value = 1;
  pageSize.value = 20;
  getTableList();
};
const initQueryParams = () => {
  // 如果有路由参数，使用路由参数
  if (route.query.data) {
    try {
      const routeData = JSON.parse(route.query.data as string);
      queryParams.value.projIds = routeData.projIds || [];
    } catch (error) {
      console.error("解析路由参数失败，使用默认值", error);
      initDefaultParams();
    }
  } else {
    // 没有路由参数，使用全选
    initDefaultParams();
  }
};
const initDefaultParams = () => {
  queryParams.value.projIds = getAllLeafProjectIds();
};
// 初始化数据
const initPageData = async () => {
  await loadData({
    projects: true, // 项目数据
    productTypes: false, // 业态数据
    saleStatus: false, // 状态数据
  });

  // 初始化查询参数
  initQueryParams();

  // 获取列表数据
  await getTableList();
};
const getParams = () => ({
  ...queryParams.value,
  current: currentPage.value,
  isShowTel: menuStore.hasExactPermission("receivable-detail:showTel"),
});
// 获取列表
const getTableList = async () => {
  try {
    tableLoading.value = true;
    allTableList.value = [];
    const params = getParams();
    const res = await assetManagementApi.getSaleOutStdFundsInfoYsRoom(params);
    if (res.code === 200) {
      allTableList.value = res.data || [];
      total.value = res.data?.length || 0;
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
    const fileBlob = await assetManagementApi.exportSaleOutStdFundsInfoYsRoom(
      params
    );
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
.receivable-detail-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
