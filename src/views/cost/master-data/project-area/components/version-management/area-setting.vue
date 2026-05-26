<!-- 面积设置 -->
<template>
  <div class="business-detail-page">
    <div class="detail-header">
      <div class="header-title">
        <div class="title-main">面积设置</div>
        <div class="title-sub">
          {{ props.currentData?.verTitle || "--" }} 的各业态面积指标
        </div>
      </div>
      <div class="header-actions">
        <div class="building-info">
          <div class="go-back" @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            <span>返回</span>
          </div>
          <div class="building-detail-info">
            <span class="label">楼栋</span>
            <el-select
              v-model="queryParams.bldId"
              placeholder="请选择楼栋"
              style="width: 200px"
              @change="getTableData"
            >
              <el-option
                v-for="item in buildingList"
                :key="item.id"
                :label="item.bldName"
                :value="item.id"
              />
            </el-select>
          </div>
        </div>
        <div>
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
    <!-- 可编辑表格 -->
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
    </editable-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { projectAreaApi } from "@/api/cost/project-area-api";
import { ProjectAreaVersion } from "@/types/cost/project-area-type";
import { productTypeApi } from "@/api/cost/product-type-api";

defineOptions({ name: "area-setting" });

// 定义 props
const props = defineProps<{
  currentData?: ProjectAreaVersion | null;
  projectId?: number;
}>();

// 定义 emits
const emit = defineEmits<{
  (e: "back"): void;
  (e: "saveSuccess"): void;
}>();

// 数据
const queryParams = ref({
  bldId: null as number | null,
});
const productProjList = ref([]);
const buildingList = ref([]);
const saveLoading = ref(false);
const tableLoading = ref(false);
const tableList = ref([]);
const tableColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "prodId",
    label: "业态名称",
    editable: true,
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "prodName",
    optionValueField: "id",
    editType: "select",
    clearable: false,
    options: productProjList.value || [],
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
]);

// 返回
const handleBack = () => {
  emit("back");
};

// 加载数据
const getTableData = async () => {
  try {
    tableLoading.value = true;
    tableList.value = [];
    const params = {
      verMid: props.currentData?.id,
      bldId: queryParams.value.bldId,
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

// 批量保存
const handleBatchSave = async () => {
  if (!tableList.value.length) {
    ElMessage.warning("请先填写数据");
    return;
  }
  try {
    saveLoading.value = true;
    const res = await projectAreaApi.batchSaveNet(
      tableList.value,
      queryParams.value.bldId,
      props.currentData?.id,
    );
    if (res.code === 200) {
      ElMessage.success("保存成功");
      getTableData();
      // emit("saveSuccess");
    }
  } catch (error) {
  } finally {
    saveLoading.value = false;
  }
};

// 保存
const handleSave = async ({ row, column, newValue, oldValue, rowIndex }) => {
  // console.log("保存:", { row, column, newValue, oldValue, rowIndex });
  if (column === "prodId") {
    const selectedOption = productProjList.value.find(
      (option) => option.id === newValue,
    );
    row.prodName = selectedOption ? selectedOption.prodName : "";
  }
};

// 数据变化回调
const handleDataChange = (data: any) => {
  // console.log("当前行数据更新", data);
};
// 数据更新回调
const handleDataUpdate = (newData: any) => {
  // console.log("table数据更新", newData);
  tableList.value = newData;
};

// 获取项目产品类型
const getProductProjList = async () => {
  try {
    productProjList.value = [];
    const res = await productTypeApi.getProductProjList({
      projId: props.projectId,
      withDetail: true,
    });
    if (res.code === 200) {
      productProjList.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取数据失败:", error);
  }
};
// 获取楼栋列表
const getBuildingList = async () => {
  if (!props.projectId) return;
  try {
    buildingList.value = [];
    const res = await projectAreaApi.getBuildingList({
      projId: props.projectId,
    });
    if (res.code === 200) {
      buildingList.value = res.data || [];
      if (buildingList.value.length > 0) {
        queryParams.value.bldId = buildingList.value[0].id; // 默认选中第一个楼栋
        await getTableData(); // 获取默认选中楼栋的数据
      } else {
        ElMessage.warning("该项目下没有楼栋数据");
      }
    }
  } catch (error) {
    ElMessage.error("加载数据失败");
  }
};
onMounted(async () => {
  await getProductProjList(); // 获取产品类型
  await getBuildingList(); // 先获取楼栋列表
  // await getTableData(); // 默认查询选中的第一个楼栋下的数据
});

// 暴露方法给父组件
defineExpose({
  refresh: getTableData,
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
          align-items: center;
          padding-left: 20px;
          border-left: 1px solid #e4e7ed;
          .label {
            font-size: 14px;
            color: #606266;
            margin-right: 8px;
          }
        }
      }
    }
  }
}
</style>
