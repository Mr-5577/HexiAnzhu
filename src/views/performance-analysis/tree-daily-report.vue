<!-- 销售日报表(树) -->
<template>
  <div class="tree-daily-report-page">
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
      <el-form-item label="日期" prop="day">
        <el-date-picker
          v-model="queryParams.day"
          type="date"
          placeholder="日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
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
          :disabled="!menuStore.hasExactPermission('tree-daily-report:export')"
        >
          导出
        </el-button>
      </el-form-item>
    </el-form>
    <base-table
      :rowKey="'treeId'"
      :showSummary="true"
      :columns="dailylReportColumns"
      :tableData="paginatedData"
      :loading="tableLoading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @pagination-change="handlePaginationChange"
      @cell-event="handleCellEventClick"
    ></base-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { dailylReportColumns } from "./project-columns";
import { useSalesData } from "@/composables/use-sales";
import { dateUtil } from "@/utils/date-util";
import { assetManagementApi } from "@/api/asset-management-api";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { findProjectIdsByXsProjIds } from "@/utils/project-helper";
import { useMenuStore } from "@/stores/menu-store";
const menuStore = useMenuStore();
const route = useRoute();
const router = useRouter();

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "tree-daily-report" });

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

const handleCellEventClick = (data: any) => {
  const { eventName, row } = data;
  // 校验：必须有项目ID才能跳转
  if (!row.projIds) return;

  // 查找项目ID映射
  const idArr = row.projIds.split(',').map(Number);
  const projectIdArr = findProjectIdsByXsProjIds(projectOptions.value, idArr);
  if (projectIdArr.length == 0) return;

  const timestamp = Date.now().toString(); // 防止路由缓存
  // 当日
  const day = queryParams.value.day || dateUtil().format("YYYY-MM-DD");
  const dayParams = {
    department: projectIdArr,
    time: [day, day],
  };
  // 当月累计跳转结束日期为选中的截止日期
  const monthTime = [
    dateUtil(day).startOf("month").format("YYYY-MM-DD"),
    // dateUtil(day).endOf("month").format("YYYY-MM-DD"),
    dateUtil(day).format("YYYY-MM-DD"),
  ];
  const monthParams = {
    department: projectIdArr,
    time: monthTime,
  };
  // 定义事件与路由的映射关系
  const eventRouteMap = {
    // 当日成交套数、金额 跳转到 认购业绩明细表
    "order-name-click": {
      path: "/performance-analysis/sub-detail",
      params: dayParams,
    },
    // 当日-退房挞定 跳转到 退房挞定明细
    "dayCheckoutNum-click": {
      path: "/risk-analysis/forfeiture-detail",
      params: {
        projIds: projectIdArr,
        time: [day, day],
      },
    },
    // 当日签约套数、金额 跳转到 认签约业绩明细表
    "sgin-name-click": {
      path: "/performance-analysis/contract-detail",
      params: dayParams,
    },
    // 当日回款金额 跳转到 回款业绩明细表
    "payment-name-click": {
      path: "/performance-analysis/collection-detail",
      params: dayParams,
    },
    // 总计套数、金额 跳转到 应收明细
    "total-name-click": {
      path: "/risk-analysis/receivable-detail",
      params: {
        department: projectIdArr,
      },
    },
    // 当日-溢价金额 跳转到 溢价明细明细
    "dayPemMoney-click": {
      path: "/risk-analysis/premium-detail",
      params: {
        projIds: projectIdArr,
        time: [day, day],
      },
    },
    // 当月累计-成交金额、套数 跳转到 认购业绩明细表
    "totalOrderNum-click": {
      path: "/performance-analysis/sub-detail",
      params: monthParams,
    },
    // 当月累计-退房挞定 跳转到 退房挞定明细
    "totalCheckoutNum-click": {
      path: "/risk-analysis/forfeiture-detail",
      params: {
        projIds: projectIdArr,
        time: monthTime,
      },
    },
    // 当月累计-签约套数、金额 跳转到 认签约业绩明细表
    "totalSignNum-click": {
      path: "/performance-analysis/contract-detail",
      params: monthParams,
    },
    // 当日累计-回款金额 跳转到 回款业绩明细表
    "totalRecMoney-click": {
      path: "/performance-analysis/collection-detail",
      params: monthParams,
    },
    // 当月-溢价金额 跳转到 溢价明细明细
    "totalPemMoney-click": {
      path: "/risk-analysis/premium-detail",
      params: {
        projIds: projectIdArr,
        time: monthTime,
      },
    },
  };
  // 获取对应事件的路由配置
  const routeConfig = eventRouteMap[eventName];
  if (!routeConfig) return;

  router.push({
    path: routeConfig.path,
    query: {
      data: JSON.stringify(routeConfig.params),
      _t: timestamp,
    },
  });
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
  initParams();
  currentPage.value = 1;
  pageSize.value = 20;
  getTableList();
};
const initParams = () => {
  // 如果有路由参数，使用路由参数
  if (route.query.data) {
    try {
      const routeData = JSON.parse(route.query.data as string);
      queryParams.value.projIds = routeData.department || [];
      queryParams.value.day = dateUtil(routeData.data || new Date()).format(
        "YYYY-MM-DD"
      );
    } catch (error) {
      console.error("解析路由参数失败，使用默认值", error);
      queryParams.value.projIds = getAllLeafProjectIds();
      queryParams.value.day = dateUtil().format("YYYY-MM-DD");
    }
  } else {
    // 没有路由参数，使用全选
    queryParams.value.projIds = getAllLeafProjectIds();
    queryParams.value.day = dateUtil().format("YYYY-MM-DD");
  }
};

// 初始化数据
const initPageData = async () => {
  await loadData({
    projects: true, // 项目数据
    productTypes: false, // 业态数据
    saleStatus: false, // 不需要状态数据
  });

  // 初始化查询参数
  initParams();

  // 获取列表数据
  await getTableList();
};
const getParams = () => {
  const { projIds, day } = queryParams.value;
  return {
    projIds: projIds,
    day: `${day} 00:00:00`,
    beginDate: `${day} 00:00:00`,
    endDate: `${day} 23:59:59`,
  };
};
// 获取列表
const getTableList = async () => {
  try {
    tableLoading.value = true;
    allTableList.value = [];
    const params = getParams();
    const res = await assetManagementApi.getSaleDailyReportTree(params);
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
    const fileBlob = await assetManagementApi.exportSaleDailyReportTree(params);
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
.tree-daily-report-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
