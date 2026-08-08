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
          <!-- 启用时不可操作 -->
          <el-button
            type="primary"
            :loading="saveLoading"
            @click="handleBatchSave"
            v-if="props.currentData.status == 0"
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
      v-model="tableList"
      :columns="tableColumns"
      :loading="tableLoading"
      :pagination="false"
      :highlight-current-row="false"
      :showSummary="true"
      :on-save="handleSave"
    >
    </editable-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, inject } from "vue";
import { ElMessage } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { ProjectAreaVersion } from "@/types/cost/master-data/project-area-type";
import { productTypeApi } from "@/api/cost/master-data/product-type-api";

defineOptions({ name: "area-setting" });

// 注入父组件提供的方法
const updateDetailByProjectId = inject<() => Promise<void>>(
  "updateDetailByProjectId",
);

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
const prevListData = ref([]); // 上一版面积版本明细
const productProjList = ref([]);
const buildingList = ref([]);
const saveLoading = ref(false);
const tableLoading = ref(false);
const tableList = ref([]);
const tableColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: props.currentData.status ? "prodName" : "prodId",
    label: "业态名称",
    editable: props.currentData.status ? false : true,
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
        editable: props.currentData.status ? false : true,
        editType: "number",
        showOverflowTooltip: false,
      },
      {
        prop: "ugBuildArea",
        label: "地下",
        showSummary: true,
        editable: props.currentData.status ? false : true,
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
        editable: props.currentData.status ? false : true,
        editType: "number",
        showOverflowTooltip: false,
      },
      {
        prop: "ugSaleArea",
        label: "地下",
        showSummary: true,
        editable: props.currentData.status ? false : true,
        editType: "number",
        showOverflowTooltip: false,
      },
    ],
  },
  {
    prop: "houseNum",
    label: "户数",
    showSummary: true,
    editable: props.currentData.status ? false : true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "elvNum",
    label: "电梯数",
    editable: props.currentData.status ? false : true,
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
  if (!queryParams.value.bldId) return;
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

      // 如果是未生效状态，并且返回的数据为空或所有数据都是空值，则回填上一版本数据
      if (props.currentData?.status === 0) {
        // 判断是否需要回填：列表为空 或 所有字段都没有值（新建状态）
        const isEmpty =
          list.length === 0 ||
          list.every(
            (item) =>
              !item.agBuildArea &&
              !item.ugBuildArea &&
              !item.agSaleArea &&
              !item.ugSaleArea &&
              !item.houseNum &&
              !item.elvNum,
          );
        if (isEmpty && prevListData.value.length > 0) {
          // 获取当前楼栋的上一版数据
          const historyData = prevListData.value.filter(
            (item: any) => item.bldId === queryParams.value.bldId,
          );
          if (historyData.length > 0) {
            // 将上一版本数据按 prodId 映射为对象，方便快速查找
            const historyMap = historyData.reduce((map: any, item: any) => {
              map[item.prodId] = item;
              return map;
            }, {});

            // 合并数据：用历史数据覆盖模板数据
            const newData = list.map((item: any) => {
              const historyItem = historyMap[item.prodId];
              if (historyItem) {
                return {
                  ...item,
                  uuid: uuidv4(),
                  // 用历史数据覆盖面积字段
                  agBuildArea: historyItem.agBuildArea || 0,
                  ugBuildArea: historyItem.ugBuildArea || 0,
                  agSaleArea: historyItem.agSaleArea || 0,
                  ugSaleArea: historyItem.ugSaleArea || 0,
                  houseNum: historyItem.houseNum || 0,
                  elvNum: historyItem.elvNum || 0,
                };
              }
              return {
                ...item,
                uuid: uuidv4(),
              };
            });
            tableList.value = filterListByBuilding(newData);
            return;
          }
        }
      }
      // 正常处理返回的数据
      const newData = list.map((item) => {
        return {
          ...item,
          uuid: uuidv4(),
        };
      });
      tableList.value = filterListByBuilding(newData);
      console.log("tableList", filterListByBuilding(newData));
    }
  } catch (error) {
    ElMessage.error("加载数据失败");
  } finally {
    tableLoading.value = false;
  }
};
/**
 * 根据楼栋ID过滤列表数据
 * @param dataList - 需要过滤的数据列表（包含prodId字段）
 * @returns 过滤后的数据列表
 */
const filterListByBuilding = (dataList: any[]): any[] => {
  // 如果没有选中楼栋，返回全部数据
  if (!queryParams.value.bldId) {
    return dataList;
  }

  // 查找选中的楼栋
  const selectedBuilding = buildingList.value.find(
    (item) => item.id === queryParams.value.bldId,
  );

  // 如果没找到楼栋或楼栋没有prodIds，返回空数组
  if (!selectedBuilding || !selectedBuilding.prodIds) {
    return [];
  }

  // 将楼栋的prodIds字符串转换为数组（支持逗号分隔）
  const buildingProdIds = selectedBuilding.prodIds
    .split(",")
    .map((id: string) => Number(id.trim()))
    .filter((id: number) => !isNaN(id));

  // 如果没有关联业态，返回空数组
  if (buildingProdIds.length === 0) {
    return [];
  }

  // 过滤数据列表，只保留prodId在楼栋关联业态中的项
  return dataList.filter((item) => {
    // 如果数据项没有prodId字段，跳过
    if (!item.prodId) return false;
    // 判断当前数据项的prodId是否在楼栋关联的业态列表中
    return buildingProdIds.includes(Number(item.prodId));
  });
};

// 批量保存
const handleBatchSave = async () => {
  if (!tableList.value.length) {
    ElMessage.warning("暂无保存的数据");
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
      if (updateDetailByProjectId) {
        updateDetailByProjectId();
      }
    }
  } catch (error) {
  } finally {
    saveLoading.value = false;
  }
};
const updateRow = (rowIndex: number, data: any) => {
  const newData = [...tableList.value];
  newData[rowIndex] = { ...tableList.value[rowIndex], ...data };
  tableList.value = newData;
};
// 保存
const handleSave = async ({ row, column, newValue, oldValue, rowIndex }) => {
  // console.log("保存:", { row, column, newValue, oldValue, rowIndex });
  if (column === "prodId") {
    const selectedOption = productProjList.value.find(
      (option) => option.id === newValue,
    );
    const prodName = selectedOption ? selectedOption?.prodName : "";
    updateRow(rowIndex, { prodId: newValue, prodName });
    return;
  }
  updateRow(rowIndex, { [column]: newValue });
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
// 获取上一版面积版本明细
const getPrevVersionDetail = async () => {
  if (!props.currentData?.id) return;
  try {
    prevListData.value = [];
    const res = await projectAreaApi.getPrevListByVerMid({
      verMid: props.currentData?.id,
    });
    if (res.code === 200) {
      console.log("上一版面积版本明细:", res.data);
      prevListData.value = res.data || [];
    }
  } catch (error) {
    ElMessage.error("加载数据失败");
  }
};
onMounted(async () => {
  await getProductProjList(); // 获取产品类型
  // 当未生效的版本面积设置时需要获取上一生效版本的面积版本明细，然后把对应楼栋的数据赋值上去显示
  if (props.currentData.status == 0) {
    await getPrevVersionDetail(); // 获取上一版面积版本明细
  }
  await getBuildingList(); // 先获取楼栋列表
  // await getTableData(); // 默认查询选中的第一个楼栋下的数据
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
          padding: 8px 10px;
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
