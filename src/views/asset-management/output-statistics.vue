<!-- 产值统计表（树） -->
<template>
  <div class="output-statistics-page">
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
          :disabled="!menuStore.hasExactPermission('output-statistics:export')"
        >
          导出
        </el-button>
      </el-form-item>
    </el-form>
    <base-table
      :rowKey="'treeId'"
      :columns="outputStatisticsColumns"
      :tableData="tableData"
      :loading="tableLoading"
      :pagination="false"
    ></base-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { outputStatisticsColumns } from "./project-columns";
import { useSalesData } from "@/composables/use-sales";
import { dateUtil } from "@/utils/date-util";
import { assetManagementApi } from "@/api/asset-management-api";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import { useMenuStore } from "@/stores/menu-store";
const menuStore = useMenuStore();
const route = useRoute();

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
const tableData = ref<any[]>([]);

const handleQuery = () => {
  getTableList();
};
const resetQuery = () => {
  initParams();
  getTableList();
};
const initParams = () => {
  // 如果有路由参数，使用路由参数
  if (route.query.data) {
    try {
      const routeData = JSON.parse(route.query.data as string);
      queryParams.value.projIds = routeData.projIds || [];
      queryParams.value.day = dateUtil(routeData.data || new Date()).format(
        "YYYY-MM-DD",
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
    productTypes: false, // 不需要业态数据
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
  };
};
// 获取列表
const getTableList = async () => {
  try {
    tableLoading.value = true;
    tableData.value = [];
    const params = getParams();
    const res = await assetManagementApi.getFinaAssetReport(params);
    if (res.code === 200) {
      tableData.value = res.data || [];
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
    const fileBlob = await assetManagementApi.exportFinaAssetReport(params);
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

// 生命周期
onMounted(() => {
  initPageData();
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.output-statistics-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
