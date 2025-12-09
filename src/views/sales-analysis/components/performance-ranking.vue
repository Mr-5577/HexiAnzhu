<!-- 业绩排名列表-组件 -->
<template>
  <div class="ranking-page">
    <ChartBox title="业绩排名统计">
      <template #content>
        <div class="rankingContent">
          <div class="chart-controls">
            <el-button
              text
              size="default"
              :class="['chart-btn', { active: chartType === '1' }]"
              @click="switchChartType('1')"
            >
              项目月度业绩排名
            </el-button>
            <el-button
              text
              size="default"
              :class="['chart-btn', { active: chartType === '2' }]"
              @click="switchChartType('2')"
            >
              个人月度业绩排名
            </el-button>
          </div>
          <div class="table-list">
            <base-table
              :pagination="false"
              :columns="columns"
              :tableData="tableData"
              :loading="loading"
              :total="total"
              :current-page="currentPage"
              :page-size="pageSize"
              :dictData="dictData"
              :size="'small'"
              @pagination-change="handlePaginationChange"
              @refresh="handleRefresh"
              @selection-change="handleSelectionChange"
            ></base-table>
          </div>
        </div>
      </template>
    </ChartBox>
  </div>
</template>

<script setup lang="ts">
import ChartBox from "@/components/chart-box.vue";
import BaseTable from "@/components/base-table.vue";
import { ref, onMounted, onUnmounted, nextTick } from "vue";

// 响应式数据
const chartType = ref("1");
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
// 字典数据
const dictData = {
  gender: [
    { value: 1, label: "男" },
    { value: 2, label: "女" },
  ],
};
const columns = ref([
  {
    type: "index",
    label: "序号",
    width: "60",
  },
  {
    prop: "name",
    label: "姓名",
  },
  {
    prop: "age",
    label: "年龄",
  },
  {
    prop: "gender",
    label: "性别",
    dict: "gender",
  },
]);
const tableData = ref([
  { id: 1, name: "zs", age: "18", gender: 1 },
  { id: 2, name: "zs", age: "18", gender: 2 },
  { id: 3, name: "zs", age: "18", gender: 1 },
  { id: 4, name: "zs", age: "18", gender: 1 },
  { id: 5, name: "zs", age: "18", gender: 1 },
  { id: 6, name: "zs", age: "18", gender: 1 },
  { id: 7, name: "zs", age: "18", gender: 1 },
]);

// 切换图表类型
const switchChartType = (type: string) => {
  chartType.value = type;
};

// 分页变化
const handlePaginationChange = (params: any) => {
  currentPage.value = params.currentPage;
  pageSize.value = params.pageSize;
};

// 刷新
const handleRefresh = () => {};

// 多选
const handleSelectionChange = (selection: any) => {
  console.log("选中的数据:", selection);
};
// 生命周期
onMounted(() => {
  nextTick(() => {});
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.ranking-page {
  width: 100%;
  height: 33%;
  .rankingContent {
    width: 100%;
    flex: 1;
    display: flex;
    flex-wrap: nowrap;
    flex-direction: column;
    .chart-controls {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      .chart-btn {
        color: #fff;
        cursor: pointer;
        transition: all 0.3s;
        font-weight: 400;
        padding: 0;
      }
      .chart-btn:hover {
        background: none;
      }
      .chart-btn.active {
        color: #409eff;
        font-weight: 700;
      }
    }
    .table-list {
      width: 100%;
      flex: 1;
      // 确保表格容器正确显示滚动条
      :deep(.el-table) {
        // 表格背景色
        background-color: transparent !important;

        // 表头相关元素都设置透明
        .el-table__header-wrapper {
          background-color: transparent !important;
        }
        .el-table__header {
          background-color: transparent !important;
          thead {
            background-color: transparent !important;
            tr {
              background-color: transparent !important;
            }
          }

          th {
            background-color: transparent !important;
            color: #fff;
            font-size: 14px;
          }
        }

        // 表格主体 - 确保滚动条正常显示
        .el-table__body-wrapper {
          overflow-x: hidden;
          overflow-y: auto;

          .el-table__body {
            tr {
              background-color: transparent !important;
              color: #fff;
              font-size: 14px;
              // 斑马纹
              &.el-table__row--striped {
                background-color: #3bf004 !important;
              }

              // 鼠标悬停
              &:hover > td {
                background-color: transparent !important;
              }
            }
            td {
              background-color: inherit !important;
            }
          }
        }
      }
    }
  }
}
</style>
