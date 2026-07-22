<!-- 供应商台账 -->
<template>
  <div class="supplier-ledger-page">
    <!-- 左侧树形结构 - 供应商类别 -->
    <div class="left-content">
      <div class="search-box">
        <el-input
          v-model="supTypeName"
          placeholder="搜索供应商类别"
          clearable
          size="default"
        >
          <template #append>
            <el-icon @click="handleSearch"><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="tree-wrapper">
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="treeProps"
          :current-node-key="currentNodeKey"
          node-key="id"
          :highlight-current="false"
          :default-expand-all="false"
          :accordion="false"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span
              class="tree-node"
              :class="{
                'category-active': currentNodeKey === data.id,
              }"
            >
              <el-icon><Folder /></el-icon>
              <span class="node-label">{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- 右侧数据列表 -->
    <div class="right-content">
      <template v-if="selectedCategory">
        <el-form :model="queryParams" ref="queryRef" :inline="true">
          <el-form-item label="供应商编码" prop="supCode">
            <el-input
              v-model="queryParams.supCode"
              placeholder="请输入供应商编码"
              clearable
              size="default"
              style="width: 200px"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="供应商名称" prop="supName">
            <el-input
              v-model="queryParams.supName"
              placeholder="请输入供应商名称"
              clearable
              size="default"
              style="width: 200px"
            >
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="handleReset">重置</el-button>
            <el-button type="primary" @click="handleRegister">
              供应商登记
            </el-button>
            <el-button type="primary" @click="batchApproval">
              批量审批
            </el-button>
          </el-form-item>
        </el-form>
        <base-table
          :rowKey="'id'"
          :columns="tableColumns"
          :tableData="tableData"
          :loading="tableLoading"
          :pagination="false"
          :total="total"
          :current-page="currentPage"
          :page-size="pageSize"
          @pagination-change="handlePaginationChange"
          @selection-change="handleSelectionChange"
        >
          <!-- 供应商状态 -->
          <template #supStatus="{ row }">
            <el-tag :type="getStatusType(row.supStatus)">
              {{ getStatusLabel(row.supStatus) }}
            </el-tag>
          </template>
          <!-- 审批流程 -->
          <template #apprProcess="{ row }">
            <!-- 审批后才有审批流程 -->
            <el-button
              link
              type="primary"
              @click="handleViewProcess(row)"
              v-if="row.supBillId"
            >
              查看流程
            </el-button>
          </template>
          <!-- supStatus 0=草稿；1=已审批；2=黑名单；3=作废，草稿状态可以编辑/删除 -->
          <template #actions="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="primary" link @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
            <el-button
              link
              type="primary"
              @click="handleViewProcess(row)"
              v-if="row.supBillId"
            >
              查看入库单据
            </el-button>
          </template>
        </base-table>
      </template>

      <el-empty v-else description="请从左侧选择供应商类别" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Folder } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { buildTree } from "@/utils/tree";
import { supTypeApi } from "@/api/cost/master-data/supplier-category-api";
import type {
  SupplierType,
  SupplierTypeTreeNode,
} from "@/types/cost/master-data/supplier-category-type";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import type {
  Supplier,
  SupplierQueryParams,
} from "@/types/cost/supplier/supplier-ledger-type";
import { supStatusEnum } from "@/constants/supplier/enums";
import { commonApi } from "@/api/cost/common-api";

const router = useRouter();

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "supplier-ledger" });

// 树形数据
const supTypeName = ref("");
const listData = ref<SupplierType[]>([]);
const treeData = ref([]);
const currentNodeKey = ref<string | number | null>(null);
const selectedCategory = ref<SupplierTypeTreeNode | null>(null);

// 树配置
const treeProps = {
  children: "children",
  label: "supTypeName",
  disabled: "disabled",
  isLeaf: "isLeaf",
};
const allType = [
  {
    id: 99999,
    isDel: false,
    isEnabled: true,
    pid: 99999,
    remark: "全部类型",
    supTypeCode: "ALL",
    supTypeName: "全部",
  },
];
// 查询参数
const queryParams = ref<SupplierQueryParams>({
  supCode: "", // 供应商编码
  supName: "", // 供应商名称
});
const tableLoading = ref<boolean>(false);
const currentPage = ref<number>(1);
const pageSize = ref<number>(20);
const total = ref<number>(0);
const tableData = ref<Supplier[]>([]);
const selectedRows = ref<Supplier[]>([]);
const tableColumns = [
  // {
  //   type: "selection",
  //   width: 55,
  //   // 使用 selectable 回调控制行可选,返回 true 表示可选，false 表示不可选
  //   selectable: (row: any, index: number) => {
  //     return row.supStatus == 0; // 只有草稿状态可以勾选
  //   },
  // },
  { type: "index", label: "序号", width: 60 },
  { label: "供应商名称", prop: "supName", width: 200 },
  { label: "供应商编码", prop: "supCode", width: 150 },
  { label: "供应商类型", prop: "supTypeName", width: 150 },
  { label: "内外部", prop: "supLinkTypeName", width: 150 },
  { label: "企业性质", prop: "supNatureName", width: 120 },
  { label: "纳税类型", prop: "taxTypeName", width: 120 },
  { label: "来源类型", prop: "sourceTypeName", width: 120 },
  { label: "法人代表", prop: "legalPerson", width: 120 },
  { label: "法人电话", prop: "legalPhone", width: 120 },
  { label: "信用编码", prop: "uscCardNo", width: 180 },
  { label: "供应商地址", prop: "address", width: 200 },
  { label: "供应商状态", slot: "supStatus", width: 120 },
  // { label: "审批流程", slot: "apprProcess", width: 120 },
  {
    slot: "actions",
    label: "操作",
    width: 240,
    fixed: "right",
  },
];

const getStatusLabel = (status: number) => {
  return supStatusEnum.find((item) => item.value === status)?.label || "未知";
};

const getStatusType = (status: number) => {
  return supStatusEnum.find((item) => item.value === status)?.type || "info";
};
// 搜索供应商类别
const handleSearch = () => {
  // 先清除之前选中的类别节点
  currentNodeKey.value = null;
  selectedCategory.value = null;
  getSupplierTypeList();
};

// 获取供应商类别数据
const getSupplierTypeList = async () => {
  try {
    const res = await supTypeApi.getSupTypeList({
      supTypeName: supTypeName.value,
    });
    if (res.code === 200 && res.data) {
      listData.value = res.data || [];
      const treeList = buildTree(res.data);
      treeData.value = [...allType, ...treeList];
    } else {
      ElMessage.error(res.message || "获取供应商类别失败");
    }
  } catch (error) {
    console.error("获取供应商类别失败:", error);
    ElMessage.error("获取供应商类别失败");
  }
};

// 点击节点
const handleNodeClick = (data: SupplierTypeTreeNode) => {
  if (currentNodeKey.value === data.id) return;
  // 只有最后一层节点才能选中
  // if (!data.children || data.children.length === 0) {
  //   // 设置当前选中的节点
  //   currentNodeKey.value = data.id;
  //   selectedCategory.value = data;
  //   // 加载对应类别的供应商列表
  //   getSupplierListData();
  // }
  // 设置当前选中的节点
  currentNodeKey.value = data.id;
  selectedCategory.value = data;
  // 加载对应类别的供应商列表
  getSupplierListData();
};

// 加载供应商列表
const getSupplierListData = async () => {
  try {
    tableLoading.value = true;
    selectedRows.value = [];
    tableData.value = [];
    const params: SupplierQueryParams = {
      ...queryParams.value,
      supTypeId:
        selectedCategory.value?.id === 99999
          ? undefined
          : selectedCategory.value?.id,
    };

    const res = await supplierApi.getSupplierList(params);
    if (res.code === 200) {
      tableData.value = res.data || [];
      total.value = res.data?.length || 0;
    } else {
      ElMessage.error(res.message || "加载供应商列表失败");
    }
  } catch (error) {
    ElMessage.error("加载供应商列表失败");
  } finally {
    tableLoading.value = false;
  }
};

// 查询
const handleQuery = () => {
  if (selectedCategory.value) {
    currentPage.value = 1;
    getSupplierListData();
  } else {
    ElMessage.warning("请先选择左侧供应商类别");
  }
};
// 重置
const handleReset = () => {
  queryParams.value.supCode = "";
  queryParams.value.supName = "";
  handleQuery();
};
// 分页改变
const handlePaginationChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  if (selectedCategory.value) {
    getSupplierListData();
  }
};

// 供应商登记
const handleRegister = () => {
  router.push({
    path: "/supplier/supplier-register/add",
    query: {
      mode: "add",
      t: Date.now(), // 添加时间戳，防止浏览器缓存
    },
  });
};
const handleSelectionChange = (rows: Supplier[]) => {
  selectedRows.value = rows;
};
const handleEdit = (row: Supplier) => {
  router.push({
    path: "/supplier/supplier-register/edit",
    query: { mode: "edit", supplierId: row.id },
  });
};
const handleDelete = (row: Supplier) => {
  ElMessageBox.confirm(`确定要删除供应商"${row.supName}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await supplierApi.delSupplier({ id: row.id });
        if (res.code === 200) {
          ElMessage.success("删除成功");
          getSupplierTypeList();
        }
      } catch (error) {
        console.error("删除失败", error);
      }
    })
    .catch(() => {});
};
const handleViewDetail = (row: Supplier) => {
  router.push({
    path: "/supplier/supplier-register/detail",
    query: { mode: "view", supplierId: row.id },
  });
};
const batchApproval = () => {
  router.push({
    path: "/supplier/inspection/add",
    query: { t: Date.now() },
  });
};
const handleViewProcess = (row: Supplier) => {
  router.push({
    path: "/supplier/inspection/edit",
    query: { supBillId: row.supBillId },
  });
};
onMounted(() => {
  getSupplierTypeList();
});
</script>

<style lang="scss" scoped>
.supplier-ledger-page {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  background: #f0f2f6;

  .left-content {
    width: 248px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .search-box {
      padding: 16px 10px;
      box-sizing: border-box;
      border-bottom: 1px solid #e4e7ed;
      :deep(.el-input-group__append) {
        padding: 0;
        background: linear-gradient(
          135deg,
          var(--harmony-primary-dark) 0%,
          var(--harmony-primary-light)
        );
        border-color: var(--harmony-primary-light);
        .el-icon {
          width: 50px;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
          cursor: pointer;
          font-size: 16px;
        }
      }
    }

    .tree-wrapper {
      flex: 1;
      overflow: auto;
      padding: 10px 10px;
      box-sizing: border-box;
      :deep(.el-tree) {
        .tree-node {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          width: 100%;
          min-width: 0; // 允许收缩

          .el-icon {
            color: #909399;
            flex-shrink: 0; // 图标不收缩
          }

          .node-label {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 0; // 允许文本收缩
          }

          &.category-active {
            color: #409eff;
            font-weight: 500;

            .el-icon {
              color: #409eff;
            }
          }
        }

        .el-tree-node__content {
          height: 40px;
          width: 100%;

          &:hover {
            background-color: #ecf5ff;
          }
        }

        .el-tree-node.is-current > .el-tree-node__content {
          background-color: #ecf5ff;
          color: #606266;
        }
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
  }
}
</style>
