<!-- 资产管理 库存统计表 -->
<template>
  <div class="inventory-statistics-page">
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
            !menuStore.hasExactPermission('inventory-statistics:export')
          "
        >
          导出
        </el-button>
      </el-form-item>
    </el-form>
    <base-table
      :rowKey="'uuid'"
      :columns="inventoryStatisticsColumns"
      :tableData="paginatedData"
      :loading="tableLoading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @pagination-change="handlePaginationChange"
      @cell-click="handleCellClick"
      @cell-event="handleCellEventClick"
    >
      <!-- 使用表头插槽方式增加表头提示 -->
      <template #costMoneyHeader="scope">
        <div class="custom-header">
          <span>月均去化金额(万)</span>
          <el-tooltip content="近6个月的平均值" placement="top">
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
    </base-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { inventoryStatisticsColumns } from "./project-columns";
import { assetManagementApi } from "@/api/asset-management-api";
import type { InventoryStatisticsInterface } from "@/types/asset-management-type";
import { useSalesData } from "@/composables/use-sales";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { findProjectIdByXsProjId } from "@/utils/project-helper";
import { useMenuStore } from "@/stores/menu-store";
const menuStore = useMenuStore();
const route = useRoute();
const router = useRouter();

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "inventory-statistics" });

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
});
const tableLoading = ref<boolean>(false);
const exportLoading = ref<boolean>(false);
const currentPage = ref<number>(1);
const pageSize = ref<number>(20);
const total = ref<number>(0);
const tableData = ref<InventoryStatisticsInterface[]>([]);
const allTableList = ref<InventoryStatisticsInterface[]>([]);

// 项目名称点击
const handleCellEventClick = (data: any) => {
  const { eventName, row } = data;
  // 校验：必须有项目ID才能跳转
  if (!row.projId) return;
  // 查找项目ID映射
  const projectId = findProjectIdByXsProjId(projectOptions.value, row.projId);
  if (!projectId) return;
  // 点击项目名称跳转到 库存明细表
  if (eventName === "projName-click") {
    const timestamp = new Date().getTime();
    const params = {
      projIds: [projectId],
      productTypes: queryParams.value.productTypes,
    };
    router.push({
      path: "/asset-management/inventory-detail",
      query: {
        data: JSON.stringify(params),
        _t: timestamp.toString(),
      },
    });
  }
};
const handleCellClick = (data: any) => {
  console.log("单元格点击事件", data);
};

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
      queryParams.value.projIds = routeData.department || [];
      queryParams.value.productTypes = getAllProductTypeIds();
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
const getParams = () => ({
  ...queryParams.value,
  current: currentPage.value,
});
// 获取列表
const getTableList = async () => {
  try {
    tableLoading.value = true;
    allTableList.value = [];
    const params = getParams();
    const res = await assetManagementApi.getRoomStockGroupProj(params);
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
    const fileBlob = await assetManagementApi.exportRoomStockGroupProj(params);
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
.inventory-statistics-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
