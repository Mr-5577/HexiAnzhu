<!-- 认购业绩明细 -->
<template>
  <div class="sub-detail-page">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      label-width="70px"
    >
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
        /> -->
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
          style="width: 220px"
        >
          <el-option
            v-for="item in productTypeList"
            :key="item.id"
            :label="item.productTypeName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="认购日期" prop="time">
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
      <el-form-item label="业主姓名" prop="custName">
        <el-input
          v-model="queryParams.custName"
          placeholder="业主姓名"
          clearable
          style="width: 220px"
        />
      </el-form-item>
      <el-form-item label="业主房号" prop="roomNum">
        <el-input
          v-model="queryParams.roomNum"
          placeholder="房号"
          clearable
          style="width: 220px"
        />
      </el-form-item>
      <el-form-item label="置业顾问" prop="salerName">
        <el-input
          v-model="queryParams.salerName"
          placeholder="置业顾问"
          clearable
          style="width: 220px"
        />
      </el-form-item>
      <el-form-item label="团队名称" prop="teamName">
        <el-input
          v-model="queryParams.teamName"
          placeholder="团队名称"
          clearable
          style="width: 220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="Search"
          @click="handleQuery"
          :loading="tableLoading"
        >
          搜索
        </el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button
          type="primary"
          icon="Download"
          :loading="exportLoading"
          @click="handleExport"
          :disabled="!menuStore.hasExactPermission('sub-detail:export')"
        >
          导出
        </el-button>
      </el-form-item>
    </el-form>
    <base-table
      :rowKey="'uuid'"
      :showSummary="true"
      :columns="SubDetailColumns"
      :tableData="paginatedData"
      :loading="tableLoading"
      :total="filteredTotal"
      :current-page="currentPage"
      :page-size="pageSize"
      @pagination-change="handlePaginationChange"
    ></base-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from "vue";
import { SubDetailColumns } from "./project-columns";
import { useSalesData } from "@/composables/use-sales";
import { dateUtil } from "@/utils/date-util";
import { assetManagementApi } from "@/api/asset-management-api";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { useMenuStore } from "@/stores/menu-store";
const menuStore = useMenuStore();
const route = useRoute();

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "sub-detail" });

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
  custName: "", // 业主姓名
  roomNum: "", // 房号
  salerName: "", // 置业顾问
  teamName: "", // 团队
});
const tableLoading = ref<boolean>(false);
const exportLoading = ref<boolean>(false);
const currentPage = ref<number>(1);
const pageSize = ref<number>(20);
const allTableList = shallowRef<any[]>([]);
const filteredData = ref<any[]>([]);

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
  if (tableLoading.value) return; // 防止重复请求
  queryParams.value.custName = "";
  queryParams.value.roomNum = "";
  queryParams.value.salerName = "";
  queryParams.value.teamName = "";
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
      queryParams.value.productTypes = getAllProductTypeIds();
      if (routeData.data) {
        // 从销售年报表跳转过来
        queryParams.value.time = routeData.data || [];
      } else {
        // 从大屏跳转过来
        initTimeRange(routeData);
      }
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
  queryParams.value.productTypes = getAllProductTypeIds();
  initTimeRange();
};

const initTimeRange = (option?: any) => {
  const { data, type } = option || {};
  const baseDate = data ? dateUtil(data) : dateUtil();
  if (data) {
    const dateTime = getNaturalDateRangeByType(baseDate, type);
    queryParams.value.time = [dateTime.startDate, dateTime.endDate];
  } else {
    const startTime = baseDate.date(1).format("YYYY-MM-DD");
    const endTime = dateUtil().format("YYYY-MM-DD");
    queryParams.value.time = [startTime, endTime];
  }
  // const baseDate = data ? dateUtil(data) : dateUtil();
  // const startTime = baseDate.date(1).format("YYYY-MM-DD");
  // const endTime = data
  //   ? baseDate.format("YYYY-MM-DD")
  //   : dateUtil().format("YYYY-MM-DD");
  // queryParams.value.time = [startTime, endTime];
};
// 根据时间类型获取自然时间范围
const getNaturalDateRangeByType = (date: any, type = "date") => {
  const baseDate = dateUtil(date);
  if (!baseDate.isValid()) {
    throw new Error("Invalid date");
  }
  switch (type.toLowerCase()) {
    // 年
    case "month":
      return {
        startDate: baseDate.startOf("year").format("YYYY-MM-DD"),
        endDate: baseDate.endOf("year").format("YYYY-MM-DD"),
      };
    // 月
    case "date":
      return {
        startDate: baseDate.startOf("month").format("YYYY-MM-DD"),
        endDate: baseDate.endOf("month").format("YYYY-MM-DD"),
      };
    // 周
    case "week":
      // 周一作为一周的开始，周日作为一周的结束
      const dayOfWeek = baseDate.day(); // 0=周日, 1=周一, ..., 6=周六
      // 计算距离周一的偏移量
      const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      return {
        startDate: baseDate.add(offsetToMonday, "day").format("YYYY-MM-DD"),
        endDate: baseDate.add(offsetToMonday + 6, "day").format("YYYY-MM-DD"),
      };
    case "day":
      return {
        startDate: baseDate.startOf("day").format("YYYY-MM-DD"),
        endDate: baseDate.endOf("day").format("YYYY-MM-DD"),
      };
    default:
      return {
        startDate: baseDate.startOf("month").format("YYYY-MM-DD"),
        endDate: baseDate.endOf("month").format("YYYY-MM-DD"),
      };
  }
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
  const { projIds, time, productTypes } = queryParams.value;
  return {
    projIds,
    productTypes,
    type: 1,
    day: `${time[0]} 00:00:00`,
    beginDate: `${time[0]} 00:00:00`,
    endDate: `${time[1]} 23:59:59`,
    isShowTel: menuStore.hasExactPermission("sub-detail:showTel"),
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
      filteredData.value = [];
      return;
    }
    const params = getParams();
    const res = await assetManagementApi.getSaleAsstListOrder(params);
    if (res.code === 200) {
      allTableList.value = res.data || [];
      filteredData.value = dataProcessing(); // 过滤数据处理
    } else {
      allTableList.value = [];
      filteredData.value = [];
    }
  } catch (error) {
    allTableList.value = [];
    filteredData.value = [];
  } finally {
    tableLoading.value = false;
  }
};
// 导出
const handleExport = async () => {
  try {
    exportLoading.value = true;
    const params = { ...getParams(), isExport: true };
    const fileBlob = await assetManagementApi.exportSaleAsstListOrder(params);
    console.log("fileBlob", fileBlob);
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
  return filteredData.value.slice(start, end).map((item) => ({
    ...item,
    uuid: uuidv4(), // 为当前页的每一行生成 UUID
  }));
});
// 计算总数（基于过滤后的数据）
const filteredTotal = computed(() => filteredData.value.length || 0);
// 手动过滤数据
const dataProcessing = () => {
  const data = allTableList.value || [];
  const { custName, roomNum, salerName, teamName } = queryParams.value;
  // 如果没有过滤条件，直接返回原数据
  if (!custName && !roomNum && !salerName && !teamName) {
    return data;
  }
  return data.filter((item) => {
    // 业主姓名过滤
    if (custName && !item.custName?.includes(custName)) {
      return false;
    }
    // 房号过滤
    if (roomNum && !item.roomNum?.includes(roomNum)) {
      return false;
    }
    // 置业顾问过滤
    if (salerName && !item.salerName?.includes(salerName)) {
      return false;
    }
    // 团队名称过滤
    if (teamName && !item.teamName?.includes(teamName)) {
      return false;
    }
    return true;
  });
};
// 生命周期
onMounted(() => {
  initPageData();
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.sub-detail-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
