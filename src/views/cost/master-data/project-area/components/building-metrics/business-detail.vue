<!-- 业态详情 -->
<template>
  <div class="business-detail-page">
    <div class="detail-header">
      <div class="header-title">
        <div class="title-main">业态详情</div>
        <div class="title-sub">
          {{ props.selectedBuilding?.bldName || "--" }} 的各业态面积指标
        </div>
      </div>
      <div class="header-actions">
        <div class="building-info">
          <div class="go-back" @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            <span>返回</span>
          </div>
          <div class="building-detail-info">
            <div class="building-name">
              <el-icon><OfficeBuilding /></el-icon>
              <span>{{ props.selectedBuilding?.bldName || "" }}</span>
            </div>
            <!-- <div class="building-floor">
              <el-icon><Grid /></el-icon>
              <span>楼层：</span>
              <span>32层</span>
            </div> -->
          </div>
        </div>
        <div>
          <el-button type="primary" plain @click="handleAddBusiness">
            新增业态
          </el-button>
          <el-button
            type="primary"
            :loading="saveLoading"
            @click="handleBatchSave"
          >
            批量保存
          </el-button>
        </div>
      </div>
    </div>
    <!-- <base-table
      ref="businessDetailtableRef"
      :columns="tableColumns"
      :tableData="tableList"
      rowKey="uuid"
      :border="true"
      :loading="tableLoading"
      :pagination="false"
      :showSummary="true"
    ></base-table> -->
    <editable-table
      ref="businessDetailtableRef"
      :rowKey="'uuid'"
      :table-data="tableList"
      :columns="tableColumns"
      :loading="tableLoading"
      :pagination="false"
      :highlight-current-row="false"
      :showSummary="true"
      :on-save="handleSave"
      @data-change="handleDataChange"
      @update:table-data="handleDataUpdate"
    >
      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button link type="danger" @click="handleDelete(row)">
          删除
        </el-button>
      </template></editable-table
    >
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import { OfficeBuilding, ArrowLeft } from "@element-plus/icons-vue";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { projectAreaApi } from "@/api/cost/project-area-api";
import { ProjectBuilding } from "@/types/cost/project-area-type";

defineOptions({ name: "business-detail" });

// 定义 props
const props = defineProps<{
  selectedBuilding?: ProjectBuilding | null;
  projectId?: number;
}>();

// 定义 emits
const emit = defineEmits<{
  (e: "back"): void;
  (e: "saveSuccess"): void;
}>();

// 数据
const saveLoading = ref(false);
const tableLoading = ref(false);
const tableList = ref([]);
const tableColumns: EditableColumn[] = [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "prodName",
    label: "业态名称",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    label: "建筑面积(m²)",
    children: [
      {
        prop: "agBuildArea",
        label: "地上",
        showSummary: true,
        editable: true,
        editType: "number",
        showOverflowTooltip: false,
      },
      {
        prop: "ugBuildArea",
        label: "地下",
        showSummary: true,
        editable: true,
        editType: "number",
        showOverflowTooltip: false,
      },
    ],
  },
  {
    label: "可售面积(m²)",
    children: [
      {
        prop: "agSaleArea",
        label: "地上",
        showSummary: true,
        editable: true,
        editType: "number",
        showOverflowTooltip: false,
      },
      {
        prop: "ugSaleArea",
        label: "地下",
        showSummary: true,
        editable: true,
        editType: "number",
        showOverflowTooltip: false,
      },
    ],
  },
  {
    prop: "houseNum",
    label: "户数",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "elvNum",
    label: "电梯数",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
];

// 返回
const handleBack = () => {
  emit("back");
};

// 加载数据
const loadData = async () => {
  try {
    tableLoading.value = true;
    tableList.value = [];
    const params = {
      bldId: props.selectedBuilding?.id || 0,
      prodId: props.projectId,
    };
    const res = await projectAreaApi.getNetByBldId(params);
    if (res.code === 200) {
      const list = res.data || [];
      const newData = list.map((item) => {
        return {
          ...item,
          uuid: uuidv4(),
        };
      });
      tableList.value = newData;
    }
  } catch (error) {
    ElMessage.error("加载数据失败");
  } finally {
    tableLoading.value = false;
  }
};

// 生成空数据行
const createEmptyRow = () => {
  return {
    uuid: uuidv4(),
    prodName: "", // 业态名称
    agBuildArea: 0, // 地上建筑面积
    ugBuildArea: 0, // 地下建筑面积
    agSaleArea: 0, // 地上可售面积
    ugSaleArea: 0, // 地下可售面积
    houseNum: 0, // 户数
    elvNum: 0, // 电梯数
    isNew: true, // 标记为新增行
  };
};

// 新增业态
const handleAddBusiness = () => {
  // 检查是否已有空行未填写
  // const hasEmptyRow = tableList.value.some(
  //   (item) => item.prodName === "" && item.isNew,
  // );
  // if (hasEmptyRow) {
  //   ElMessage.warning("请先完成当前新增业态的填写");
  //   return;
  // }

  // 添加空行到表格底部
  const newRow = createEmptyRow();
  tableList.value = [...tableList.value, newRow];
};

// 批量保存
const handleBatchSave = async () => {
  console.log("tableList.value", tableList.value);
  try {
    saveLoading.value = true;
    const res = await projectAreaApi.batchSaveNet(tableList.value);
    if (res.code === 200) {
      ElMessage.success("保存成功");
      emit("saveSuccess");
    }
  } catch (error) {
  } finally {
    saveLoading.value = false;
  }
};

// 保存到服务器
const handleSave = async ({ row, column, newValue, oldValue, rowIndex }) => {
  // console.log("保存:", { row, column, newValue, oldValue, rowIndex });
};

// 数据变化回调
const handleDataChange = (data) => {
  // console.log("当前行数据更新", data);
};
// 数据更新回调
const handleDataUpdate = (newData) => {
  // console.log("table数据更新", newData);
  tableList.value = newData;
};

// 删除行
const handleDelete = (row) => {
  tableList.value = tableList.value.filter((item) => item.uuid !== row.uuid);
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
.business-detail-page {
  height: 100%;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;

  .detail-header {
    flex-shrink: 0;
    margin-bottom: 20px;

    .header-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 20px;
      .title-main {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        margin-right: 12px;
      }

      .title-sub {
        font-size: 14px;
        color: #909399;
      }
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .building-info {
        display: flex;
        align-items: center;
        gap: 20px;

        .go-back {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          color: #606266;
          font-weight: 600;
          font-size: 14px;
          padding: 8px 0px;
          border-radius: 6px;
          transition: all 0.3s;
          .el-icon {
            font-size: 16px;
            font-weight: 600;
          }
          &:hover {
            background-color: #f5f7fa;
            color: #409eff;
          }
        }

        .building-detail-info {
          display: flex;
          flex-direction: column;
          padding-left: 20px;
          border-left: 1px solid #e4e7ed;

          .building-name,
          .building-floor {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #606266;

            .el-icon {
              color: #606266;
              font-size: 18px;
            }
          }
        }
      }
    }
  }
}
</style>
