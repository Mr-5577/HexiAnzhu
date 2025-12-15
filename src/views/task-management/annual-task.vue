<template>
  <div class="page-content">
    <el-button
      type="primary"
      size="small"
      @click="openTaskDetailInNewTab({ id: '111' })"
    >
      查看详情1
    </el-button>
    <el-button
      type="primary"
      size="small"
      @click="openTaskDetailInNewTab({ id: '222' })"
    >
      查看详情2
    </el-button>
    <BasicTable
      :columns="columns"
      :tableData="tableData"
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :dictData="dictData"
      @pagination-change="handlePaginationChange"
      @refresh="handleRefresh"
      @selection-change="handleSelectionChange"
    ></BasicTable>
  </div>
</template>

<script setup lang="ts">
import BasicTable from "@/components/base-table.vue";
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted, nextTick } from "vue";

const router = useRouter();

// 响应式数据
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
const columns: any = [
  {
    type: "index",
    label: "序号",
    width: "60",
  },
  {
    prop: "name",
    label: "项目",
  },
  {
    prop: "age",
    label: "认购",
    children: [
      {
        prop: "num",
        label: "套数",
      },
      {
        prop: "price",
        label: "金额",
      },
    ],
  },
  {
    prop: "age",
    label: "签约",
    children: [
      {
        prop: "num",
        label: "套数",
      },
      {
        prop: "price",
        label: "金额",
      },
    ],
  },
  {
    prop: "gender",
    label: "回款",
    dict: "gender",
  },
];
const tableData = ref([
  { id: 1, name: "zs", age: "18", gender: 1, num: 23, price: "18万" },
  { id: 2, name: "zs", age: "18", gender: 2, num: 23, price: "18万" },
  { id: 3, name: "zs", age: "18", gender: 1, num: 23, price: "18万" },
  { id: 4, name: "zs", age: "18", gender: 1, num: 23, price: "18万" },
  { id: 5, name: "zs", age: "18", gender: 1, num: 23, price: "18万" },
  { id: 6, name: "zs", age: "18", gender: 1, num: 23, price: "18万" },
  {
    id: 7,
    name: "zs",
    age: "18",
    gender: 1,
    num: 23,
    price: "18万",
    children: [
      {
        id: 31,
        age: "2016-05-01",
        name: "wangxiaohu",
      },
      {
        id: 32,
        date: "2016-05-01",
        name: "wangxiaohu",
        children: [
          {
            id: 56,
            age: "2016-05-01",
            name: "wangxiaohu",
          },
          {
            id: 57,
            date: "2016-05-01",
            name: "wangxiaohu",
          },
        ],
      },
    ],
  },
]);

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

const openTaskDetailInNewTab = (task: any) => {
  // 添加时间戳确保每次都是新标签页
  const timestamp = new Date().getTime();
  router.push({
    path: "/task-management/annual-task-detail",
    query: {
      id: task.id,
      // mode: "view",
      // 添加时间戳作为唯一标识的一部分
      // _t: timestamp.toString(),
      // 添加来源标识
      // from: "task-list",
    },
  });
};
// 生命周期
onMounted(() => {
  nextTick(() => {});
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.page-content {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
