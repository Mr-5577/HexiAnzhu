<!-- 定标审批 -- 新增/编辑/详情 -->
<template>
  <div class="award-approval-form-page">
    <!-- 基本信息 -->
    <basic-info
      :data="detailData"
      :project-options="projectOptions"
    ></basic-info>

    <div class="form-section">
      <h3 class="section-title">审批列表</h3>
      <template v-if="isDetail">
        <base-table
          :columns="detailColumns"
          :tableData="tableData"
          :rowKey="'id'"
          :pagination="false"
        >
          <!-- 是否中标 -->
          <template #status="{ row }">
            {{ row.isWinner ? "是" : "否" }}
          </template>
        </base-table>
      </template>
      <template v-else>
        <!-- 可编辑表格 -->
        <editable-table
          ref="detailtableRef"
          :row-key="'id'"
          :table-data="tableData"
          :columns="dynamicColumns"
          :loading="tableLoading"
          :pagination="false"
          :highlight-current-row="false"
          :show-summary="false"
          :on-save="handleSave"
          @data-change="handleDataChange"
          @update:table-data="handleDataUpdate"
          @editable-cell-click="handleEditableCellClick"
        >
          <!-- 列表外操作栏 -->
          <template #actionBar>
            <div class="actionBar-buttons">
              <el-button
                type="primary"
                icon="DocumentAdd"
                :loading="saveLoading"
                @click="handleBatchSave"
              >
                保存
              </el-button>
            </div>
          </template>
        </editable-table>
      </template>
    </div>
    <!-- 选择供应商弹窗 -->
    <choose-supplier-dialog
      ref="supplierDialogRef"
      v-model="supplierDialogVisible"
      @select="handleSupplierSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import BasicInfo from "../basic-info.vue";
import { BidTenderFormParams } from "@/types/cost/bidding-management-type";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { projectAreaApi } from "@/api/cost/project-area-api";
import { biddingManageApi } from "@/api/cost/bidding-management-api";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import { largeScreenApi } from "@/api/large-screen-api";
import { debounce } from "@/utils/common";
import ChooseSupplierDialog from "../choose-supplier-dialog.vue";

defineOptions({ name: "award-approval-form" });

type TenderDetailData = {
  tender: BidTenderFormParams;
  items: any[];
  projIds: number[];
};

const route = useRoute();
// 页面模式：add-新增，edit-编辑，detail-详情
const mode = ref<"add" | "edit" | "detail">("add");
const tenderId = ref<number | null>(null); // 事项ID，新增使用
const billId = ref<number | null>(null); // 单据ID，编辑使用
const detailData = ref<TenderDetailData | null>(null); // 详情数据
const projectOptions = ref([]); // 项目列表
const billData = ref(null); // 单据数据
const isDetail = computed(() => mode.value === "detail");
const dynamicColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60 },
  {
    prop: "projId",
    label: "项目",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "projName",
    optionValueField: "id",
    options: optionalProjList.value || [],
    placeholder: "请选择项目",
    minWidth: 180,
  },
  {
    prop: "bldIds",
    label: "楼栋",
    width: 150,
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "bldName",
    optionValueField: "id",
    multiple: true,
    collapseTags: true,
    getOptions: (row: any) => row.buildingOptions || [],
    placeholder: "请选择项目后选择楼栋",
  },
  {
    prop: "supName",
    label: "供应商名称",
    width: 150,
    editable: true,
    clickable: true, // 设置为可点击，打开弹窗
    showOverflowTooltip: false,
  },
  {
    prop: "bidAmount",
    label: "中标金额(不含税)",
    width: 130,
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    placeholder: "请输入中标金额",
  },
  {
    prop: "referAmount",
    label: "参考价金额(不含税)",
    width: 130,
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    placeholder: "请输入参考价金额",
  },
  {
    prop: "priceVariance",
    label: "价格偏差(不含税)",
    width: 130,
    editable: false,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "taxRate",
    label: "税率(%)",
    width: 120,
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    placeholder: "请输入税率",
  },
  {
    prop: "isWinner",
    label: "是否中标",
    width: 100,
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    options: [
      { label: "是", value: true },
      { label: "否", value: false },
    ],
  },
  {
    prop: "bidExplain",
    label: "评定说明",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    placeholder: "请输入评定说明",
    minWidth: 180,
  },
]);

const detailColumns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目" },
  { prop: "bldNames", label: "楼栋" },
  { prop: "supName", label: "供应商名称" },
  { prop: "bidAmount", label: "中标金额(不含税)" },
  { prop: "referAmount", label: "参考价金额(不含税)" },
  { prop: "priceVariance", label: "价格偏差(不含税)" },
  { prop: "taxRate", label: "税率(%)" },
  { slot: "status", label: "是否中标" },
  { prop: "bidExplain", label: "评定说明" },
];

// 明细表
const tableData = ref([]);
const tableLoading = ref(false);
const saveLoading = ref(false);
const supplierDialogVisible = ref(false);
const currentRowData = ref(null); // 当前点击的审批行数据

// 筛选详情里面选中的项目数据
const optionalProjList = computed(() => {
  const selectedProjectIds = detailData.value?.projIds || [];
  if (selectedProjectIds.length === 0) {
    return [];
  }
  // 从 projectOptions 中过滤出选中的项目
  return projectOptions.value.filter((project) =>
    selectedProjectIds.includes(project.id),
  );
});
// 计算价格偏差
const calculatePriceVariance = (
  bidAmount: number | null,
  referAmount: number | null,
): number => {
  if (
    bidAmount !== null &&
    referAmount !== null &&
    bidAmount !== undefined &&
    referAmount !== undefined
  ) {
    return Number((bidAmount - referAmount).toFixed(2));
  }
  return 0;
};

const updateRow = (rowIndex: number, data: any) => {
  const newData = [...tableData.value];
  newData[rowIndex] = { ...tableData.value[rowIndex], ...data };
  tableData.value = newData;
};

const debouncedMap = new Map(); // 存储每行的防抖函数

const getDebouncedFetch = (rowIndex: number) => {
  if (!debouncedMap.has(rowIndex)) {
    debouncedMap.set(
      rowIndex,
      debounce(async (projId: number, idx: number) => {
        try {
          const res = await projectAreaApi.getBuildingList({ projId });
          if (res.code === 200 && tableData.value[idx]?.projId === projId) {
            updateRow(idx, { buildingOptions: res.data || [] });
          }
        } catch (error) {
          ElMessage.error("获取楼栋列表失败");
        }
      }, 500),
    );
  }
  return debouncedMap.get(rowIndex);
};

const handleSave = async ({ row, column, newValue, oldValue, rowIndex }) => {
  // console.log("保存:", row, column, newValue, oldValue, rowIndex);
  if (newValue === oldValue) return;
  // 项目变更时，清空楼栋并加载新的楼栋列表
  if (column === "projId") {
    if (!newValue) {
      updateRow(rowIndex, {
        projId: null,
        buildingOptions: [],
        bldIds: [],
        bldNames: "",
      });
    } else {
      updateRow(rowIndex, { projId: newValue, bldIds: [], bldNames: "" });
      getDebouncedFetch(rowIndex)(newValue, rowIndex);
    }
    return;
  }
  // 楼栋变更时，同步更新楼栋名称
  if (column === "bldIds") {
    const bldNames = newValue?.length
      ? row.buildingOptions
          .filter((item: any) => newValue.includes(item.id))
          .map((item: any) => item.bldName)
          .join(",")
      : "";
    updateRow(rowIndex, { bldIds: newValue || [], bldNames });
    return;
  }
  // 中标金额变更时，重新计算价格偏差
  if (column === "bidAmount") {
    const referAmount = row.referAmount;
    const priceVariance = calculatePriceVariance(newValue, referAmount);
    updateRow(rowIndex, {
      bidAmount: newValue,
      priceVariance,
    });
    return;
  }
  // 参考价变更时，重新计算价格偏差
  if (column === "referAmount") {
    const bidAmount = row.bidAmount;
    const priceVariance = calculatePriceVariance(bidAmount, newValue);
    updateRow(rowIndex, {
      referAmount: newValue,
      priceVariance,
    });
    return;
  }

  updateRow(rowIndex, { [column]: newValue });
};

const handleDataChange = (data) => {
  // console.log("表格数据变化:", data);
};

const handleDataUpdate = (newData) => {
  tableData.value = newData;
};
const handleEditableCellClick = ({ row, column, rowIndex }) => {
  //   console.log("可编辑单元格点击:", row, column, rowIndex);
  // 供应商单元格点击
  if (column.prop === "supName") {
    supplierDialogVisible.value = true;
    currentRowData.value = row; // 保存数据，供选择供应商后使用
  }
};
// 确认选择供应商后回调
const handleSupplierSelect = (data) => {
  console.log("选择的供应商数据:", data);
  if (data && data.length > 0) {
    const supplier = data[0];
    const updatedRow = {
      ...currentRowData.value,
      supId: supplier.id,
      supName: supplier.supName,
    };
    const rowIndex = tableData.value.findIndex(
      (item) => item.id === currentRowData.value.id,
    );
    if (rowIndex !== -1) {
      updateRow(rowIndex, updatedRow);
    }
  }
};
// 保存
const handleBatchSave = async () => {
  if (tableData.value.length === 0) {
    ElMessage.warning("暂无数据保存");
    return;
  }
  if (tableData.value.some((item) => !item.projId)) {
    ElMessage.error("请为列表中的每一项选择一个项目");
    return;
  }
  if (
    tableData.value.some((item) => !item.bldIds || item.bldIds.length === 0)
  ) {
    ElMessage.error("请选择列表中的楼栋");
    return;
  }
  if (tableData.value.some((item) => !item.bidAmount)) {
    ElMessage.error("请填写列表中的中标金额");
    return;
  }
  if (tableData.value.some((item) => !item.referAmount)) {
    ElMessage.error("请填写列表中的参考价金额");
    return;
  }
  if (tableData.value.some((item) => !item.taxRate)) {
    ElMessage.error("请填写列表中的税率");
    return;
  }
  try {
    saveLoading.value = true;
    if (mode.value === "add") {
      const dataList = tableData.value.map((item) => {
        const bldIds = Array.isArray(item.bldIds) ? item.bldIds : [];
        return {
          tenderId: item.tenderId, // 事项ID
          tenderItemId: item.id, // 事项明细ID
          projId: item.projId,
          bldIds: bldIds.join(","),
          bldNames: item.bldNames || "",
          supId: item.supId,
          supName: item.supName || "",
          bidAmount: item.bidAmount ?? 0,
          referAmount: item.referAmount ?? 0,
          priceVariance: item.priceVariance ?? 0,
          taxRate: item.taxRate ?? 0,
          bidExplain: item.bidExplain || "",
          isWinner: item.isWinner ?? false,
        };
      });
      const params = {
        bizItemCode: "ZB_DB",
        tenderId: tenderId.value, // 事项ID
        childData: dataList,
      };
      const res = await biddingManageApi.addBill(params);
      if (res.code === 200) {
        ElMessage.success("保存成功");
      } else {
        ElMessage.error("保存失败");
      }
    }
    if (mode.value === "edit") {
      const dataList = tableData.value.map((item) => {
        const bldIds = Array.isArray(item.bldIds) ? item.bldIds : [];
        return {
          ...item,
          bldIds: bldIds.join(","),
        };
      });
      const params = {
        bizItemCode: "ZB_DB",
        tenderId: billData.value.tenderId, // 事项ID
        id: billData.value.id, // 单据ID
        childData: dataList,
      };
      const res = await biddingManageApi.editBill(params);
      if (res.code === 200) {
        ElMessage.success("保存成功");
      } else {
        ElMessage.error("保存失败");
      }
    }
  } catch (error) {
    ElMessage.error("保存失败");
  } finally {
    saveLoading.value = false;
  }
};
// 编辑/详情时获取定标审批列表通过ID进行过滤
const initEditTableData = async () => {
  try {
    const params = {
      tenderId: tenderId.value,
      bizItemCode: "ZB_DB", // 定标审批
    };
    const res = await biddingManageApi.getBillList(params);
    if (res.code === 200) {
      const listData = res.data || [];
      const targetData = listData.find((item) => item.bill.id === billId.value);
      if (targetData) {
        billData.value = targetData.bill || null;
        detailData.value = {
          tender: targetData.bill || null,
          projIds:
            targetData.bill && targetData.bill.projIds
              ? targetData.bill.projIds.split(",").map(Number)
              : [],
          items: [],
        };
        const list = targetData.awards || [];
        if (mode.value === "edit") {
          if (list && list.length > 0) {
            const initialTableList = list.map((item) => ({
              ...item,
              bldIds: item.bldIds ? item.bldIds.split(",").map(Number) : [],
              buildingOptions: [],
            }));
            // 并行加载所有楼栋数据
            const buildingPromises = initialTableList.map(
              async (item, index) => {
                if (item.projId) {
                  try {
                    const buildingRes = await projectAreaApi.getBuildingList({
                      projId: item.projId,
                    });
                    if (buildingRes.code === 200) {
                      initialTableList[index].buildingOptions =
                        buildingRes.data || [];
                    }
                  } catch (error) {}
                }
                return initialTableList[index];
              },
            );
            tableData.value = await Promise.all(buildingPromises);
          } else {
            tableData.value = [];
          }
        } else {
          tableData.value = list;
        }
      }
    }
  } catch (error) {}
};
// 新增时获取详情中的items列表并初始化表格数据
const initAddTableData = async () => {
  if (!detailData.value) {
    tableData.value = [];
    return;
  }
  const { items } = detailData.value;
  if (items && items.length > 0) {
    const initialTableList = items.map((item) => ({
      id: item.id,
      projId: item.projId,
      bldIds: item.bldIds ? item.bldIds.split(",").map(Number) : [],
      bldNames: item.bldNames || "",
      supId: item.supId || null,
      supName: item.supName || "",
      bidAmount: item.bidAmount ?? 0,
      referAmount: item.referAmount ?? 0,
      priceVariance: item.priceVariance ?? 0,
      taxRate: item.taxRate ?? 0,
      bidExplain: item.bidExplain || "",
      isWinner: null,
      buildingOptions: [],
    }));
    // 并行加载所有楼栋数据
    const buildingPromises = initialTableList.map(async (item, index) => {
      if (item.projId) {
        try {
          const buildingRes = await projectAreaApi.getBuildingList({
            projId: item.projId,
          });
          if (buildingRes.code === 200) {
            const buildingList = buildingRes.data || [];
            initialTableList[index].buildingOptions = buildingList;
          }
        } catch (error) {
          console.error("获取楼栋列表失败:", error);
        }
      }
      return initialTableList[index];
    });
    tableData.value = await Promise.all(buildingPromises);
  } else {
    tableData.value = [];
  }
};
// 获取详情数据
const getDetailData = async () => {
  try {
    const res = await biddingManageApi.getTenderInfo({
      tenderId: tenderId.value,
    });
    if (res.code === 200 && res.data) {
      detailData.value = res.data;
      // 使用详情信息初始化表格数据
      await initAddTableData();
    } else {
      ElMessage.error(res.message || "获取详情失败");
    }
  } catch (error) {
    console.error("获取详情失败:", error);
  }
};
// 获取项目列表
const getProjectOptions = async () => {
  try {
    const res = await largeScreenApi.getProjList();
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};

// 初始化页面
const initPage = async () => {
  const queryMode = route.query.mode as string; // 保存模式到状态中
  const queryTenderId = route.query.tenderId; // 保存事项ID到状态中
  const queryBillId = route.query.id; // 保存单据ID到状态中

  tenderId.value = queryTenderId ? Number(queryTenderId) : null; // 保存事项ID到状态中
  billId.value = queryBillId ? Number(queryBillId) : null; // 保存单据ID到状态中
  mode.value = ["add", "edit", "detail"].includes(queryMode)
    ? (queryMode as "add" | "edit" | "detail")
    : "add"; // 保存模式到状态中

  // 获取项目列表数据
  await getProjectOptions();

  if (mode.value === "add") {
    // 新增模式：获取详情数据（用于基本信息），表格初始为详情内的items
    await getDetailData();
  } else {
    // 编辑或详情模式
    await initEditTableData();
  }
};

onMounted(() => {
  initPage();
});
</script>

<style scoped lang="scss">
.award-approval-form-page {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  padding: 20px 20px;
  box-sizing: border-box;
  overflow: hidden;

  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 0;
    color: #333;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }
  .actionBar-buttons {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
