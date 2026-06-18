<!-- 投标保证金缴纳 -- 新增/编辑/详情 -->
<template>
  <div class="bid-bond-pay-form-page">
    <!-- 基本信息 -->
    <basic-info
      :data="detailData"
      :project-options="projectOptions"
    ></basic-info>

    <div class="form-section">
      <h3 class="section-title">投标保证金缴纳列表</h3>
      <template v-if="isDetail">
        <base-table
          :columns="detailColumns"
          :tableData="tableData"
          :rowKey="'id'"
          :pagination="false"
        >
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
import { BidTenderFormParams } from "@/types/cost/bidding/bidding-management-type.ts";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api.ts";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api.ts";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import { largeScreenApi } from "@/api/large-screen-api";
import { debounce } from "@/utils/common";
import ChooseSupplierDialog from "../choose-supplier-dialog.vue";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";

defineOptions({ name: "bid-bond-pay-form" });

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
const payMethodOptions = ref([]); // 缴纳方式数据字典选项
// 数据字典
const { getDictList, loadDicts } = useDict(
  [
    dictMapping.payMethod, // 缴纳方式
  ],
  {
    treeDictCodes: [],
  },
);
const dynamicColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60 },
  {
    prop: "supName",
    label: "供应商名称",
    minWidth: 150,
    editable: true,
    clickable: true, // 设置为可点击，打开弹窗
    showOverflowTooltip: false,
  },
  {
    prop: "needAmount",
    label: "应交保证金金额",
    minWidth: 150,
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    placeholder: "请输入应交保证金金额",
  },
  {
    prop: "recvAmount",
    label: "实交保证金金额",
    minWidth: 150,
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    placeholder: "请输入实交保证金金额",
  },
  {
    prop: "recvMethod",
    label: "缴纳方式",
    minWidth: 130,
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    placeholder: "请输入缴纳方式",
    // 自定义键名
    optionLabelField: "dicLabel",
    optionValueField: "id",
    options: payMethodOptions.value || [],
  },
  {
    prop: "recvDate",
    label: "缴纳日期",
    minWidth: 150,
    showSummary: true,
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    placeholder: "请输入缴纳日期",
  },
  {
    prop: "recvAnnexId",
    label: "缴纳凭证附件",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    placeholder: "请输入缴纳凭证附件",
    minWidth: 150,
  },
]);

const detailColumns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "supName", label: "供应商名称" },
  { prop: "needAmount", label: "应交保证金金额" },
  { prop: "recvAmount", label: "实交保证金金额" },
  { prop: "recvMethod", label: "缴纳方式" },
  { prop: "recvDate", label: "缴纳日期" },
  { prop: "recvAnnexId", label: "缴纳凭证附件" },
];

// 明细表
const tableData = ref([]);
const tableLoading = ref(false);
const saveLoading = ref(false);
const supplierDialogVisible = ref(false);
const currentRowData = ref(null); // 当前点击的审批行数据

const updateRow = (rowIndex: number, data: any) => {
  const newData = [...tableData.value];
  newData[rowIndex] = { ...tableData.value[rowIndex], ...data };
  tableData.value = newData;
};

const handleSave = async ({ row, column, newValue, oldValue, rowIndex }) => {
  // console.log("保存:", row, column, newValue, oldValue, rowIndex);
  // 缴纳方式变更时，同步更新缴纳方式名称
  if (column === "recvMethod") {
    const selectedOption = payMethodOptions.value.find(
      (option) => option.id === newValue,
    );
    const recvMethodName = selectedOption ? selectedOption.dicLabel : "";
    updateRow(rowIndex, { recvMethod: newValue, recvMethodName });
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
  if (tableData.value.some((item) => !item.supId)) {
    ElMessage.error("请选择列表中的供应商");
    return;
  }
  if (tableData.value.some((item) => !item.needAmount)) {
    ElMessage.error("请填写列表中的应交保证金金额");
    return;
  }
  if (tableData.value.some((item) => !item.recvAmount)) {
    ElMessage.error("请填写列表中的实交保证金金额");
    return;
  }
  if (tableData.value.some((item) => !item.recvMethod)) {
    ElMessage.error("请填写列表中的缴纳方式");
    return;
  }
  if (tableData.value.some((item) => !item.recvDate)) {
    ElMessage.error("请填写列表中的缴纳日期");
    return;
  }
  try {
    saveLoading.value = true;
    if (mode.value === "add") {
      const dataList = tableData.value.map((item) => {
        return {
          tenderId: item.tenderId, // 事项ID
          tenderItemId: item.id, // 事项明细ID
          supId: item.supId,
          supName: item.supName || "",
          needAmount: item.needAmount ?? 0,
          recvAmount: item.recvAmount ?? 0,
          recvMethod: item.recvMethod || "",
          recvMethodName: item.recvMethodName || "",
          recvDate: item.recvDate || "",
          recvAnnexId: item.recvAnnexId || "",
        };
      });
      const params = {
        bizItemCode: "ZB_BZJ",
        tenderId: tenderId.value, // 事项ID
        childData: dataList,
      };
      debugger;
      const res = await biddingManageApi.addBill(params);
      if (res.code === 200) {
        ElMessage.success("保存成功");
      } else {
        ElMessage.error("保存失败");
      }
    }
    if (mode.value === "edit") {
      const params = {
        bizItemCode: "ZB_BZJ",
        tenderId: billData.value.tenderId, // 事项ID
        id: billData.value.id, // 单据ID
        childData: tableData.value,
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
      bizItemCode: "ZB_BZJ", // 定标审批
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
        tableData.value = targetData.bondRecvs || []; // 初始化表格数据
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
      supId: item.supId || null,
      supName: item.supName || "",
      needAmount: item.needAmount ?? 0,
      recvAmount: item.recvAmount ?? 0,
      recvMethod: item.recvMethod || "",
      recvMethodName: item.recvMethodName || "",
      recvDate: item.recvDate || "",
      recvAnnexId: item.recvAnnexId || "",
      buildingOptions: [],
    }));
    tableData.value = initialTableList;
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

// 初始化数据字典数据
const initDictData = async () => {
  await loadDicts();
  payMethodOptions.value = getDictList(dictMapping.payMethod); // 缴纳方式
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

onMounted(async () => {
  await initDictData();
  await initPage();
});
</script>

<style scoped lang="scss">
.bid-bond-pay-form-page {
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
