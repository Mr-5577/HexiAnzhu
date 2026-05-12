<!-- 供应商台账 -->
<template>
  <div class="supplier-ledger-page">
    <!-- 左侧树形结构 -->
    <div class="left-tree">
      <el-tree
        ref="treeRef"
        :data="treeData"
        node-key="id"
        :highlight-current="true"
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <span class="tree-node">
            <el-icon><Folder /></el-icon>
            <span>{{ node.label }}</span>
            <span v-if="data.supplierCount" class="node-count">
              ({{ data.supplierCount }})
            </span>
          </span>
        </template>
      </el-tree>
    </div>

    <!-- 右侧数据列表 -->
    <div class="right-content">
      <div class="list-header">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入供应商名称"
          clearable
          size="default"
          style="width: 300px"
        >
        </el-input>
        <el-button type="primary">查询</el-button>
        <el-button type="primary" @click="handleAdd">供应商登记</el-button>
      </div>

      <base-table
        :rowKey="'id'"
        :columns="tableColumns"
        :tableData="tableData"
        :loading="tableLoading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @pagination-change="handlePaginationChange"
      >
        <template #actions="{ row }">
          <el-button type="primary" link> 查看详情 </el-button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Folder } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
const router = useRouter();

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "supplier-ledger" });

// 类型定义
interface SupplierCategory {
  id: number;
  label: string;
  parentId: number | null;
  supplierCount?: number;
  children?: SupplierCategory[];
}

interface Supplier {
  id: number;
  name: string;
  categoryId: number;
  contact: string;
  phone: string;
}

// 树形数据
const treeData = ref<SupplierCategory[]>([
  {
    id: 1,
    label: "行政类",
    parentId: null,
    supplierCount: 5,
    children: [], // 空数组表示没有子节点，但仍然可以点击
  },
  {
    id: 2,
    label: "工程类",
    parentId: null,
    supplierCount: 12,
    children: [
      {
        id: 21,
        label: "土建工程",
        parentId: 2,
        supplierCount: 6,
        children: [],
      },
      {
        id: 22,
        label: "安装工程",
        parentId: 2,
        supplierCount: 4,
        children: [],
      },
    ],
  },
  {
    id: 3,
    label: "服务类",
    parentId: null,
    supplierCount: 8,
    children: [], // 叶子节点，有供应商数据
  },
]);

const treeRef = ref();
const loading = ref(false);
const supplierList = ref<Supplier[]>([]);
const currentCategoryId = ref<number>();
const searchKeyword = ref("");
const currentCategoryName = ref("");

const tableLoading = ref<boolean>(false);
const currentPage = ref<number>(1);
const pageSize = ref<number>(20);
const total = ref<number>(0);
const tableColumns = [
  {
    type: "selection",
    width: 60,
  },
  {
    label: "供应商名称",
    prop: "name",
    width: 180,
  },
  {
    label: "供应商类型",
    prop: "categoryName",
    width: 120,
  },
  {
    label: "内外部",
    prop: "categoryName",
    width: 100,
  },
  {
    label: "企业性质",
    prop: "categoryName",
    width: 100,
  },
  {
    label: "联系人",
    prop: "categoryName",
    width: 100,
  },
  {
    label: "联系电话",
    prop: "categoryName",
    width: 100,
  },
  {
    label: "公司法人",
    prop: "categoryName",
    width: 100,
  },
  {
    label: "公司地址",
    prop: "categoryName",
    width: 150,
  },
  {
    label: "银行账号",
    prop: "categoryName",
    width: 200,
  },
  {
    label: "合同数量",
    prop: "categoryName",
    width: 100,
  },
  {
    label: "信用编码",
    prop: "categoryName",
    width: 200,
  },
  {
    label: "入库状态",
    prop: "categoryName",
    width: 100,
  },
  {
    label: "审批流程",
    prop: "actions",
    width: 120,
    slot: "actions",
    fixed: "right",
  },
];
const tableData = ref([]);

// 分页改变
const handlePaginationChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
};

// 处理节点点击
const handleNodeClick = (data: SupplierCategory) => {
  // console.log("点击节点:", data);
  if (data.children && data.children.length > 0) return; // 如果有子节点，不加载数据
  // 更新当前选中的分类
  currentCategoryId.value = data.id;
  currentCategoryName.value = data.label;

  // 加载对应的供应商数据
  loadSupplierList(data.id);
};

// 加载供应商列表
const loadSupplierList = async (categoryId: number) => {
  loading.value = true;
  try {
    // TODO: 调用接口获取供应商数据

    // 模拟数据
    await new Promise((resolve) => setTimeout(resolve, 500));
    tableData.value = [
      {
        id: 1,
        name: `${currentCategoryName.value}供应商A`,
        categoryId: categoryId,
        contact: "张三",
        phone: "13800138001",
      },
      {
        id: 2,
        name: `${currentCategoryName.value}供应商B`,
        categoryId: categoryId,
        contact: "李四",
        phone: "13800138002",
      },
    ];
  } catch (error) {
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  router.push({ name: "supplier-register" });
};

onMounted(() => {
  // 默认选中第一个节点
  if (treeData.value.length > 0) {
    handleNodeClick(treeData.value[0]);
    // 设置树形控件的当前选中节点
    setTimeout(() => {
      treeRef.value?.setCurrentKey(treeData.value[0].id);
    }, 100);
  }
});
</script>

<style lang="scss" scoped>
.supplier-ledger-page {
  height: 100%;
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #f0f2f6;

  .left-tree {
    width: 248px;
    background: #fff;
    border-radius: 8px;
    padding: 10px;
    overflow: auto;

    :deep(.el-tree) {
      .tree-node {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;

        .node-count {
          margin-left: auto;
          font-size: 12px;
          color: #909399;
        }
      }

      .el-tree-node__content {
        height: 40px;

        &:hover {
          background-color: #ecf5ff;
        }
      }

      // 当前选中节点高亮
      .el-tree-node.is-current > .el-tree-node__content {
        background-color: #ecf5ff;
        color: #409eff;
        font-weight: 500;
      }
    }
  }

  .right-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #fff;
    border-radius: 8px;
    padding: 15px;
    box-sizing: border-box;
    overflow: auto;

    .list-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      gap: 15px;
    }
  }
}
</style>
