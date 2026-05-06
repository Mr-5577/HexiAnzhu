<!-- 面积详情 -->
<template>
  <div class="version-management-page">
    <div class="table-header">
      <div class="header-title">
        <span class="title">楼栋业态面积详情</span>
        <span class="subtitle">
          查看楼栋业态面积指标汇总，点击楼栋展开查看明细
        </span>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="modalVisible = true">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button type="primary">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>
    <base-table
      ref="tableRef"
      :columns="tableColumns"
      :tableData="listData"
      rowKey="id"
      :loading="loading"
      :showSummary="true"
      :pagination="false"
    >
    </base-table>

    <!-- 导入 -->
    <import-indicator-dialog v-model="modalVisible"></import-indicator-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ImportIndicatorDialog from "./import-indicator-dialog.vue";

defineOptions({ name: "area-detail" });

// 定义 props
const props = defineProps<{
  projectId?: string | number;
}>();

// 数据
const loading = ref(false);
const listData = ref([]);
const modalVisible = ref(false);

// 表格列配置
const tableColumns = [
  { type: "index", label: "序号", width: 60, fixed: "left" },
  { prop: "projName", label: "项目", width: 220, align: "left", fixed: "left" },
  { prop: "productTypeName", label: "考核业态", width: 120 },
  {
    label: "建筑面积(m²)",
    children: [
      {
        prop: "totalOrderNum",
        label: "小计",
        showSummary: true,
      },
      {
        prop: "totalSignNum",
        label: "地上",
        showSummary: true,
      },
      {
        prop: "totalRecMoney",
        label: "地下",
        showSummary: true,
      },
    ],
  },
  {
    label: "可售面积(m²)",
    children: [
      {
        prop: "totalOrderNum",
        label: "小计",
        showSummary: true,
      },
      {
        prop: "totalSignNum",
        label: "地上",
        showSummary: true,
      },
      {
        prop: "totalRecMoney",
        label: "地下",
        showSummary: true,
      },
    ],
  },
  {
    prop: "creator",
    label: "户数",
    width: 120,
  },
  {
    prop: "createDate",
    label: "电梯数",
    width: 120,
  },
];

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // TODO: 调用接口获取版本列表
    // 模拟数据
    await new Promise((resolve) => setTimeout(resolve, 500));
    listData.value = [
      {
        projId: 1,
        projName: "商住别墅",
        productTypeName: "",
        dayComeNum: 0,
        dayOrderNum: "0.00",
        dayOrderMoney: "0.00",
        dayPrice: "",
        dayCheckoutNum: 0,
        dayCheckoutTfNum: 0,
        dayCheckoutTfMoney: "0.00",
        dayCheckoutTdNum: 0,
        dayCheckoutTdMoney: "0.00",
        daySignNum: "0.00",
        daySignMoney: "0.00",
        dayRecMoney: "0.00",
        dayPemMoney: "0.00",
        dayPemRate: "0.00",
        totalComeNum: 8,
        totalOrderNum: "4.00",
        totalOrderMoney: "230.80",
        totalPrice: "",
        totalCheckoutNum: 3,
        totalCheckoutTfNum: 3,
        totalCheckoutTfMoney: "148.69",
        totalCheckoutTdNum: 0,
        totalCheckoutTdMoney: "0.00",
        totalSignNum: "5.00",
        totalSignMoney: "290.30",
        totalRecMoney: "665.99",
        totalPemMoney: "-36.77",
        totalPemRate: "-0.14",
        notSignNum: 0,
        notSignOutstdMoney: "0.00",
        signNum: 9,
        signOutstdMoney: "317.00",
        totalOutstdNum: "9.00",
        totalOutstdMoney: "317.00",
        loanNum: "6.00",
        loanOutstdMoney: "25.70",
        orderTask: "8.00",
        signTask: "7.00",
        collectTask: "800.00",
        totalOrderNum2: "4.00",
        totalSignNum2: "5.00",
        totalRecMoney2: "665.99",
        orderRate: "0.5000",
        signRate: "0.7143",
        collectRate: "0.8325",
        totalRate: "0.6522",
        treeId: "ty-1",
        treePid: "0",
        groupType: "1",
        groupId: "0",
        projIds: "31",
        sort: "1",
        children: [
          {
            projId: 42,
            projName: "  邻水城市",
            productTypeName: "",
            dayComeNum: 0,
            dayOrderNum: "0.00",
            dayOrderMoney: "0.00",
            dayCheckoutNum: 0,
            dayCheckoutTfNum: 0,
            dayCheckoutTfMoney: "0.00",
            dayCheckoutTdNum: 0,
            dayCheckoutTdMoney: "0.00",
            daySignNum: "0.00",
            daySignMoney: "0.00",
            dayRecMoney: "0.00",
            dayPemMoney: "0.00",
            dayPemRate: "0.00",
            totalComeNum: 8,
            totalOrderNum: "4.00",
            totalOrderMoney: "230.80",
            totalPrice: "住宅:5343",
            totalCheckoutNum: 3,
            totalCheckoutTfNum: 3,
            totalCheckoutTfMoney: "148.69",
            totalCheckoutTdNum: 0,
            totalCheckoutTdMoney: "0.00",
            totalSignNum: "5.00",
            totalSignMoney: "290.30",
            totalRecMoney: "665.99",
            totalPemMoney: "-36.77",
            totalPemRate: "-0.14",
            notSignNum: 0,
            notSignOutstdMoney: "0.00",
            signNum: 9,
            signOutstdMoney: "317.00",
            totalOutstdNum: "9.00",
            totalOutstdMoney: "317.00",
            loanNum: "6.00",
            loanOutstdMoney: "25.70",
            orderTask: "8.00",
            signTask: "7.00",
            collectTask: "800.00",
            totalOrderNum2: "4.00",
            totalSignNum2: "5.00",
            totalRecMoney2: "665.99",
            orderRate: "0.5000",
            signRate: "0.7143",
            collectRate: "0.8325",
            totalRate: "0.6522",
            treeId: "gp-42",
            treePid: "ty-1",
            groupType: "1",
            groupId: "42",
            projIds: "31",
            sort: "1-5-0",
            children: [
              {
                projId: 43,
                projName: "  邻水域峰",
                productTypeName: "住宅,别墅,商业",
                dayComeNum: 0,
                dayOrderNum: "0.00",
                dayOrderMoney: "0.00",
                dayCheckoutNum: 0,
                dayCheckoutTfNum: 0,
                dayCheckoutTfMoney: "0.00",
                dayCheckoutTdNum: 0,
                dayCheckoutTdMoney: "0.00",
                daySignNum: "0.00",
                daySignMoney: "0.00",
                dayRecMoney: "0.00",
                dayPemMoney: "0.00",
                dayPemRate: "0.00",
                totalComeNum: 8,
                totalOrderNum: "4.00",
                totalOrderMoney: "230.80",
                totalPrice: "住宅:5343",
                totalCheckoutNum: 3,
                totalCheckoutTfNum: 3,
                totalCheckoutTfMoney: "148.69",
                totalCheckoutTdNum: 0,
                totalCheckoutTdMoney: "0.00",
                totalSignNum: "5.00",
                totalSignMoney: "290.30",
                totalRecMoney: "665.99",
                totalPemMoney: "-36.77",
                totalPemRate: "-0.14",
                notSignNum: 0,
                notSignOutstdMoney: "0.00",
                signNum: 9,
                signOutstdMoney: "317.00",
                totalOutstdNum: "9.00",
                totalOutstdMoney: "317.00",
                loanNum: "6.00",
                loanOutstdMoney: "25.70",
                orderTask: "8.00",
                signTask: "7.00",
                collectTask: "800.00",
                totalOrderNum2: "4.00",
                totalSignNum2: "5.00",
                totalRecMoney2: "665.99",
                orderRate: "0.5000",
                signRate: "0.7143",
                collectRate: "0.8325",
                totalRate: "0.6522",
                treeId: "gp-43",
                treePid: "gp-42",
                groupType: "1",
                groupId: "43",
                projIds: "31",
                sort: "1-6-0",
                children: [
                  {
                    projId: 31,
                    projName: "    和喜域峰",
                    productTypeName: "住宅,商业,别墅",
                    dayComeNum: 0,
                    dayOrderNum: "0.00",
                    dayOrderMoney: "0.00",
                    dayCheckoutNum: 0,
                    dayCheckoutTfNum: 0,
                    dayCheckoutTfMoney: "0.00",
                    dayCheckoutTdNum: 0,
                    dayCheckoutTdMoney: "0.00",
                    daySignNum: "0.00",
                    daySignMoney: "0.00",
                    dayRecMoney: "0.00",
                    dayPemMoney: "0.00",
                    dayPemRate: "0.00",
                    totalComeNum: 8,
                    totalOrderNum: "4.00",
                    totalOrderMoney: "230.80",
                    totalPrice: "住宅:5343",
                    totalCheckoutNum: 3,
                    totalCheckoutTfNum: 3,
                    totalCheckoutTfMoney: "148.69",
                    totalCheckoutTdNum: 0,
                    totalCheckoutTdMoney: "0.00",
                    totalSignNum: "5.00",
                    totalSignMoney: "290.30",
                    totalRecMoney: "665.99",
                    totalPemMoney: "-36.77",
                    totalPemRate: "-0.14",
                    notSignNum: 0,
                    notSignOutstdMoney: "0.00",
                    signNum: 9,
                    signOutstdMoney: "317.00",
                    totalOutstdNum: "9.00",
                    totalOutstdMoney: "317.00",
                    loanNum: "6.00",
                    loanOutstdMoney: "25.70",
                    orderTask: "8.00",
                    signTask: "7.00",
                    collectTask: "800.00",
                    totalOrderNum2: "4.00",
                    totalSignNum2: "5.00",
                    totalRecMoney2: "665.99",
                    orderRate: "0.5000",
                    signRate: "0.7143",
                    collectRate: "0.8325",
                    totalRate: "0.6522",
                    treeId: "prj-31-key-98",
                    treePid: "gp-43",
                    groupType: "1",
                    groupId: "43",
                    projIds: "31",
                    sort: "1-6-31",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        projId: 2,
        projName: "车位存量",
        productTypeName: "",
        dayComeNum: 0,
        dayOrderNum: "0.00",
        dayOrderMoney: "0.00",
        dayPrice: "",
        dayCheckoutNum: 0,
        dayCheckoutTfNum: 0,
        dayCheckoutTfMoney: "0.00",
        dayCheckoutTdNum: 0,
        dayCheckoutTdMoney: "0.00",
        daySignNum: "0.00",
        daySignMoney: "0.00",
        dayRecMoney: "0.00",
        dayPemMoney: "0.00",
        dayPemRate: "0.00",
        totalComeNum: 0,
        totalOrderNum: "9.00",
        totalOrderMoney: "21.22",
        totalPrice: "",
        totalCheckoutNum: 0,
        totalCheckoutTfNum: 0,
        totalCheckoutTfMoney: "0.00",
        totalCheckoutTdNum: 0,
        totalCheckoutTdMoney: "0.00",
        totalSignNum: "10.00",
        totalSignMoney: "23.50",
        totalRecMoney: "23.00",
        totalPemMoney: "0.00",
        totalPemRate: "0.00",
        notSignNum: 2,
        notSignOutstdMoney: "2.06",
        signNum: 0,
        signOutstdMoney: "0.00",
        totalOutstdNum: "2.00",
        totalOutstdMoney: "2.06",
        loanNum: "0.00",
        loanOutstdMoney: "0.00",
        orderTask: "0.00",
        signTask: "0.00",
        collectTask: "0.00",
        totalOrderNum2: "9.00",
        totalSignNum2: "10.00",
        totalRecMoney2: "23.00",
        totalRate: "0.0000",
        treeId: "ty-2",
        treePid: "0",
        groupType: "2",
        groupId: "0",
        projIds: "31",
        sort: "2",
        children: [
          {
            projId: 45,
            projName: "  邻水车位",
            productTypeName: "车位",
            dayComeNum: 0,
            dayOrderNum: "0.00",
            dayOrderMoney: "0.00",
            dayCheckoutNum: 0,
            dayCheckoutTfNum: 0,
            dayCheckoutTfMoney: "0.00",
            dayCheckoutTdNum: 0,
            dayCheckoutTdMoney: "0.00",
            daySignNum: "0.00",
            daySignMoney: "0.00",
            dayRecMoney: "0.00",
            dayPemMoney: "0.00",
            dayPemRate: "0.00",
            totalComeNum: 0,
            totalOrderNum: "9.00",
            totalOrderMoney: "21.22",
            totalPrice: "车位:23578",
            totalCheckoutNum: 0,
            totalCheckoutTfNum: 0,
            totalCheckoutTfMoney: "0.00",
            totalCheckoutTdNum: 0,
            totalCheckoutTdMoney: "0.00",
            totalSignNum: "10.00",
            totalSignMoney: "23.50",
            totalRecMoney: "23.00",
            totalPemMoney: "0.00",
            totalPemRate: "0.00",
            notSignNum: 2,
            notSignOutstdMoney: "2.06",
            signNum: 0,
            signOutstdMoney: "0.00",
            totalOutstdNum: "2.00",
            totalOutstdMoney: "2.06",
            loanNum: "0.00",
            loanOutstdMoney: "0.00",
            orderTask: "0.00",
            signTask: "0.00",
            collectTask: "0.00",
            totalOrderNum2: "9.00",
            totalSignNum2: "10.00",
            totalRecMoney2: "23.00",
            totalRate: "0.0000",
            treeId: "gp-45",
            treePid: "ty-2",
            groupType: "2",
            groupId: "45",
            projIds: "31",
            sort: "2-55-0",
            children: [
              {
                projId: 31,
                projName: "    和喜域峰",
                productTypeName: "车位",
                dayComeNum: 0,
                dayOrderNum: "0.00",
                dayOrderMoney: "0.00",
                dayCheckoutNum: 0,
                dayCheckoutTfNum: 0,
                dayCheckoutTfMoney: "0.00",
                dayCheckoutTdNum: 0,
                dayCheckoutTdMoney: "0.00",
                daySignNum: "0.00",
                daySignMoney: "0.00",
                dayRecMoney: "0.00",
                dayPemMoney: "0.00",
                dayPemRate: "0.00",
                totalComeNum: 0,
                totalOrderNum: "9.00",
                totalOrderMoney: "21.22",
                totalPrice: "车位:23578",
                totalCheckoutNum: 0,
                totalCheckoutTfNum: 0,
                totalCheckoutTfMoney: "0.00",
                totalCheckoutTdNum: 0,
                totalCheckoutTdMoney: "0.00",
                totalSignNum: "10.00",
                totalSignMoney: "23.50",
                totalRecMoney: "23.00",
                totalPemMoney: "0.00",
                totalPemRate: "0.00",
                notSignNum: 2,
                notSignOutstdMoney: "2.06",
                signNum: 0,
                signOutstdMoney: "0.00",
                totalOutstdNum: "2.00",
                totalOutstdMoney: "2.06",
                loanNum: "0.00",
                loanOutstdMoney: "0.00",
                orderTask: "0.00",
                signTask: "0.00",
                collectTask: "0.00",
                totalOrderNum2: "9.00",
                totalSignNum2: "10.00",
                totalRecMoney2: "23.00",
                totalRate: "0.0000",
                treeId: "prj-31-key-107",
                treePid: "gp-45",
                groupType: "2",
                groupId: "45",
                projIds: "31",
                sort: "2-55-31",
              },
            ],
          },
        ],
      },
    ];
  } catch (error) {
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

// 暴露方法给父组件
defineExpose({
  refresh: loadData,
});
</script>

<style lang="scss" scoped>
.version-management-page {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  padding: 20px 20px;
  box-sizing: border-box;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  .table-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 20px;
    .header-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
      .title {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }

      .subtitle {
        font-size: 14px;
        color: #909399;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;

      .version-count {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}
</style>
