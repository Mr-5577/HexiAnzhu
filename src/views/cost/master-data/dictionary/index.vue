<!-- 数据字典列表 -->
<template>
  <div class="dictionary-list-container">
    <base-table
      ref="tableRef"
      :columns="tableColumns"
      :tableData="mockData"
      rowKey="id"
      :border="true"
      :loading="loading"
      :pagination="true"
      :total="total"
      :pageSize="pageSize"
      :currentPage="currentPage"
      :pageSizes="[10, 20, 50, 100]"
      :isExpandAll="isExpandAll"
      @pagination-change="handlePageChange"
    >
      <!-- 是否启用列 -->
      <template #status="{ row }">
        <el-switch
          v-model="row.enabled"
          active-value="1"
          inactive-value="0"
          active-text=""
          inactive-text=""
          size="small"
        />
      </template>
      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button link type="primary"> 编辑 </el-button>
        <el-button link type="danger"> 删除 </el-button>
      </template>
    </base-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "dictionary" });

// 表格数据
const tableData = ref([]);
// 是否默认展开所有
const isExpandAll = ref(false);

const tableColumns = [
  {
    prop: "name",
    label: "全部数据",
    align: "left",
  },
  {
    prop: "name",
    label: "名称",
    width: 200,
  },
  {
    prop: "description",
    label: "描述",
    width: 300,
  },
  {
    prop: "enabled",
    label: "是否启用",
    width: 150,
    slot: "status", // 自定义 Switch 组件
  },
  {
    label: "操作",
    width: 180,
    slot: "actions", // 操作按钮
    fixed: "right",
  },
];
const mockData = [
  {
    id: 1,
    dataType: "基础数据",
    name: "成本类型",
    description: "成本分类基础数据",
    enabled: true,
    hasChildren: true,
    children: [
      {
        id: 11,
        dataType: "基础数据",
        name: "直接成本",
        description: "可直接归集的成本",
        enabled: true,
        hasChildren: false,
      },
      {
        id: 12,
        dataType: "基础数据",
        name: "间接成本",
        description: "需分摊的成本",
        enabled: true,
        hasChildren: false,
      },
    ],
  },
  {
    id: 2,
    dataType: "业务数据",
    name: "费用科目",
    description: "各项费用科目",
    enabled: true,
    hasChildren: true,
    children: [
      {
        id: 21,
        dataType: "业务数据",
        name: "人工费",
        description: "人员工资、奖金等",
        enabled: true,
        hasChildren: false,
      },
      {
        id: 22,
        dataType: "业务数据",
        name: "材料费",
        description: "原材料、辅料等",
        enabled: false,
        hasChildren: false,
      },
      {
        id: 23,
        dataType: "业务数据",
        name: "制造费用",
        description: "车间管理费用",
        enabled: true,
        hasChildren: true,
        children: [
          {
            id: 231,
            dataType: "业务数据",
            name: "设备折旧",
            description: "生产设备折旧费",
            enabled: true,
            hasChildren: false,
          },
          {
            id: 232,
            dataType: "业务数据",
            name: "维修费",
            description: "设备维修保养费",
            enabled: false,
            hasChildren: false,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    dataType: "辅助数据",
    name: "计量单位",
    description: "各种计量单位",
    enabled: true,
    hasChildren: false,
  },
];

// 分页相关
const total = ref(0);
const pageSize = ref(10);
const currentPage = ref(1);
const loading = ref(false);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return tableData.value.slice(start, end);
});

// 分页事件处理
const handlePageChange = (val: { pageSize: number; currentPage: number }) => {
  currentPage.value = val.currentPage;
  pageSize.value = val.pageSize;
};

// 初始化
onMounted(() => {});
</script>

<style lang="scss" scoped>
.dictionary-list-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px 15px;
  box-sizing: border-box;
  background: #fff;
}
</style>
