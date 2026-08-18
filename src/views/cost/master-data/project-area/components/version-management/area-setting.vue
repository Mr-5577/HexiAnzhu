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
            <el-icon>
              <ArrowLeft />
            </el-icon>
            <span>返回</span>
          </div>
          <div class="building-detail-info">
            <span class="label">楼栋</span>
            <el-select v-model="queryParams.bldId" placeholder="请选择楼栋" style="width: 200px"
              @change="handleBuildingChange">
              <el-option v-for="item in buildingList" :key="item.id" :label="item.bldName" :value="item.id" />
            </el-select>
          </div>
        </div>
        <div>
          <!-- 启用时不可操作 -->
          <el-button type="primary" :loading="saveLoading" @click="handleBatchSave"
            v-if="props.currentData.status == 0">
            批量保存
          </el-button>
        </div>
      </div>
    </div>
    <!-- 可编辑表格 -->
    <editable-table ref="businessDetailtableRef" :rowKey="'uuid'" v-model="tableList" :columns="tableColumns"
      :loading="tableLoading" :pagination="false" :highlight-current-row="false" :showSummary="true"
      :on-save="handleSave">
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

// 楼栋数据缓存：key 为楼栋ID，value 为对应的表格数据
const buildingDataCache = ref<Map<number, any[]>>(new Map());

const tableColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: props.currentData.status ? "prodName" : "prodId",
    label: "业态名称",
    editable: props.currentData.status ? false : true,
    showOverflowTooltip: false,
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

// 加载所有楼栋的面积数据
const getAllBuildingAreaData = async () => {
  if (!props.currentData?.id || !props.projectId) return;

  try {
    tableLoading.value = true;

    // 获取所有楼栋ID
    const bldIds = buildingList.value.map((item) => item.id);
    if (bldIds.length === 0) {
      tableList.value = [];
      return;
    }

    const params = {
      verMid: props.currentData?.id,
      prodId: props.projectId,
      bldIds: bldIds, // 传入所有楼栋ID
    };

    const res = await projectAreaApi.getNetByBldId(params);
    console.log('所有楼栋面积数据', res);

    if (res.code === 200 && res.data) {
      // 清空缓存
      buildingDataCache.value.clear();

      // 遍历接口返回的数据，按楼栋ID存入缓存
      for (const [bldId, list] of Object.entries(res.data)) {
        const bldIdNum = Number(bldId);
        const dataList = list as any[];
        let processedList = dataList;

        // 如果是未生效状态，需要回填上一版本数据
        if (props.currentData?.status === 0 && prevListData.value.length > 0) {
          // 获取当前楼栋的上一版数据
          const historyData = prevListData.value.filter(
            (item: any) => item.bldId === bldIdNum
          );

          if (historyData.length > 0) {
            // 将上一版本数据按 prodId 映射为对象
            const historyMap = historyData.reduce((map: any, item: any) => {
              map[item.prodId] = item;
              return map;
            }, {});

            // 判断当前列表是否为空数据（需要回填）
            const isEmpty = dataList.length === 0 || dataList.every(
              (item) =>
                !item.agBuildArea &&
                !item.ugBuildArea &&
                !item.agSaleArea &&
                !item.ugSaleArea &&
                !item.houseNum &&
                !item.elvNum
            );

            if (isEmpty) {
              // 使用历史数据填充
              processedList = dataList.map((item: any) => {
                const historyItem = historyMap[item.prodId];
                if (historyItem) {
                  return {
                    ...item,
                    uuid: uuidv4(),
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
            } else {
              // 有数据则直接添加uuid
              processedList = dataList.map((item: any) => ({
                ...item,
                uuid: uuidv4(),
              }));
            }
          } else {
            processedList = dataList.map((item: any) => ({
              ...item,
              uuid: uuidv4(),
            }));
          }
        } else {
          // 已生效状态，直接添加uuid
          processedList = dataList.map((item: any) => ({
            ...item,
            uuid: uuidv4(),
          }));
        }

        // 存入缓存
        buildingDataCache.value.set(bldIdNum, processedList);
      }

      // 默认选中第一个楼栋并显示
      if (buildingList.value.length > 0) {
        const firstBldId = buildingList.value[0].id;
        queryParams.value.bldId = firstBldId; // 设置第一个为默认楼栋
        loadBuildingData(firstBldId);
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error("加载数据失败");
  } finally {
    tableLoading.value = false;
  }
};
// 加载指定楼栋的数据到表格
const loadBuildingData = (bldId: number) => {
  const cachedData = buildingDataCache.value.get(bldId);
  if (cachedData) {
    queryParams.value.bldId = bldId;
    // 根据楼栋关联的业态过滤数据
    const filteredData = filterListByBuilding(cachedData, bldId);
    tableList.value = filteredData;
  } else {
    tableList.value = [];
  }
};

/**
 * 根据楼栋ID过滤数据列表
 * @param dataList - 需要过滤的数据列表
 * @param bldId - 楼栋ID
 * @returns 过滤后的数据列表
 */
const filterListByBuilding = (dataList: any[], bldId: number): any[] => {
  // 如果没有选中楼栋，返回全部数据
  if (bldId == null || bldId === undefined) {
    return dataList;
  }

  // 查找选中的楼栋
  const selectedBuilding = buildingList.value.find(
    (item) => item.id === bldId,
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

// 更新行数据，同时更新缓存
const updateRow = (rowIndex: number, data: any) => {
  const newData = [...tableList.value];
  newData[rowIndex] = { ...tableList.value[rowIndex], ...data };
  tableList.value = newData;

  // 同步更新楼栋缓存
  if (queryParams.value.bldId) {
    const fullData = buildingDataCache.value.get(queryParams.value.bldId) || [];
    // 找到对应行并更新
    const updatedFullData = fullData.map((item) => {
      if (item.uuid === newData[rowIndex].uuid) {
        return { ...item, ...data };
      }
      return item;
    });
    buildingDataCache.value.set(queryParams.value.bldId, updatedFullData);
  }
};

// 保存（单元格编辑时触发）
const handleSave = async ({ row, column, newValue, oldValue, rowIndex }) => {
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

// 批量保存
const handleBatchSave = async () => {
  // 防止重复提交
  if (saveLoading.value) return;
  // 1. 先确保当前显示的数据已同步到缓存
  if (queryParams.value.bldId && tableList.value.length > 0) {
    const fullData = buildingDataCache.value.get(queryParams.value.bldId) || [];
    // 用当前表格数据更新缓存中对应的行
    const updatedFullData = fullData.map((item) => {
      const currentRow = tableList.value.find((row) => row.uuid === item.uuid);
      if (currentRow) {
        return { ...item, ...currentRow };
      }
      return item;
    });
    buildingDataCache.value.set(queryParams.value.bldId, updatedFullData);
  }

  console.log('所有楼栋缓存数据:', buildingDataCache.value);
  debugger
  // 2. 收集所有楼栋的缓存数据
  const saveTasks: Promise<any>[] = [];
  for (const [bldId, data] of buildingDataCache.value) {
    if (data && data.length > 0) {
      // 保存时只保存楼栋关联的业态列表数据
      const filteredData = filterListByBuilding(data, bldId);
      // console.log('filteredData:', { bldId, filteredData, verMid: props.currentData?.id });
      if (filteredData.length > 0) {
        saveTasks.push(
          projectAreaApi.batchSaveNet(filteredData, bldId, props.currentData?.id)
        );
      }
    }
  }
  if (saveTasks.length === 0) {
    ElMessage.warning("暂无数据需要保存");
    return;
  }

  try {
    saveLoading.value = true;
    const results = await Promise.all(saveTasks);

    const hasError = results.some(res => res.code !== 200);
    if (hasError) {
      ElMessage.warning("部分楼栋保存失败，请检查数据");
    } else {
      ElMessage.success(`成功保存 ${saveTasks.length} 个楼栋的数据！`);

      // 保存成功后清空缓存，重新加载数据
      buildingDataCache.value.clear();
      await getAllBuildingAreaData();

      if (updateDetailByProjectId) {
        await updateDetailByProjectId();
      }
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error("保存失败，请重试");
  } finally {
    saveLoading.value = false;
  }
};

// 楼栋切换处理
const handleBuildingChange = (bldId: number) => {
  loadBuildingData(bldId);
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
const getBuildingOptions = async () => {
  if (!props.projectId) return;
  try {
    buildingList.value = [];
    const res = await projectAreaApi.getBuildingList({
      projId: props.projectId,
    });
    if (res.code === 200) {
      buildingList.value = res.data || [];
      if (buildingList.value.length > 0) {
        // 加载所有楼栋的面积数据
        await getAllBuildingAreaData();
      } else {
        ElMessage.warning("该项目下没有楼栋数据");
      }
    }
  } catch (error) {
    console.error('加载楼栋列表失败:', error);
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
      prevListData.value = res.data || [];
    }
  } catch (error) {
    ElMessage.error("加载数据失败");
  }
};

onMounted(async () => {
  await getProductProjList();
  if (props.currentData.status == 0) {
    await getPrevVersionDetail();
  }
  await getBuildingOptions();
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
