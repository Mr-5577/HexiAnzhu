<!-- 招标计划--新增/编辑/详情 -->
<template>
  <div class="tender-plan-form-page">
    <!-- 基本信息 -->
    <basic-info
      :data="detailData"
      :project-options="projectOptions"
    ></basic-info>

    <div class="form-section">
      <h3 class="section-title">计划列表</h3>
      <template v-if="isDetail">
        <base-table
          :columns="detailColumns"
          :tableData="tableData"
          :rowKey="'id'"
          :pagination="false"
        />
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
              <el-button
                type="primary"
                icon="Promotion"
                @click="handleInitiateBidding"
              >
                发起
              </el-button>
            </div>
          </template>
        </editable-table>
      </template>
    </div>
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

defineOptions({ name: "tender-plan-form" });

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
  },
  {
    prop: "tenderItemName",
    label: "招标明细",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
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
  },
  {
    prop: "bidBondAmount",
    label: "应交投标保证金",
    width: 150,
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "perfBondAmount",
    label: "应交履约保证金",
    width: 150,
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "itemRemark",
    label: "说明",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
]);

const detailColumns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目" },
  { prop: "tenderItemName", label: "招标明细" },
  { prop: "bldNames", label: "楼栋" },
  { prop: "bidBondAmount", label: "应交投标保证金" },
  { prop: "perfBondAmount", label: "应交履约保证金" },
  { prop: "itemRemark", label: "说明" },
];

// 明细表
const tableData = ref([]);
const tableLoading = ref(false);
const saveLoading = ref(false);

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

  updateRow(rowIndex, { [column]: newValue });
};

const handleDataChange = (data) => {
  // console.log("表格数据变化:", data);
};

const handleDataUpdate = (newData) => {
  tableData.value = newData;
};
// 发起招标
const handleInitiateBidding = async () => {
  console.log("发起招标:", tableData.value);
  // if (tableData.value.length === 0) {
  //   ElMessage.warning("暂无数据发起招标");
  //   return;
  // }
  // try {
  //   const res = await biddingManageApi.createBillFlow({
  //     billId: null, // 单据ID
  //   });
  // } catch (error) {}
};
// 先保存，保存成功后再发起招标流程
const handleBatchSave = async () => {
  if (tableData.value.length === 0) {
    ElMessage.warning("暂无数据保存");
    return;
  }
  if (tableData.value.some((item) => !item.tenderItemName)) {
    ElMessage.error("请填写列表中的招标明细名称");
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
  if (tableData.value.some((item) => !item.bidBondAmount)) {
    ElMessage.error("请填写列表中的应交投标保证金");
    return;
  }
  if (tableData.value.some((item) => !item.perfBondAmount)) {
    ElMessage.error("请填写列表中的应交履约保证金");
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
          tenderItemName: item.tenderItemName || "",
          itemRemark: item.itemRemark || "",
          bldIds: bldIds.join(","),
          bldNames: item.bldNames || "",
          bidBondAmount: item.bidBondAmount ?? 0,
          perfBondAmount: item.perfBondAmount ?? 0,
        };
      });
      const params = {
        bizItemCode: "ZB_JH",
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
        bizItemCode: "ZB_JH",
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
// 编辑/详情时获取招标计划列表通过ID进行过滤
const initEditTableData = async () => {
  try {
    const params = {
      tenderId: tenderId.value,
      bizItemCode: "ZB_JH", // 招标计划
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
        const list = targetData.plans || [];
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
      tenderItemName: item.tenderItemName,
      itemRemark: item.itemRemark,
      bldIds: item.bldIds ? item.bldIds.split(",").map(Number) : [],
      bldNames: item.bldNames,
      bidBondAmount: item.bidBondAmount,
      perfBondAmount: item.perfBondAmount,
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
.tender-plan-form-page {
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
