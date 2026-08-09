<!-- 招标参考价--单据信息 -->
<template>
  <div class="basic-form-content">
    <div class="form-header">
      <div class="header-title">定标参考价</div>
      <div class="header-btn">
        <el-button
          type="primary"
          icon="DocumentAdd"
          :loading="submitLoading"
          :disabled="isDetail || !!billData.status"
          @click="handleSave"
        >
          保存
        </el-button>
        <el-button
          type="success"
          plain
          icon="Promotion"
          @click="handleSubmit"
          :disabled="isDetail || !!billData.status"
        >
          提交
        </el-button>
        <el-button
          type="danger"
          plain
          icon="Delete"
          @click="handleDelete"
          :disabled="isDetail || isAdd || !!billData.status"
        >
          删除
        </el-button>
        <el-button
          type="warning"
          plain
          icon="Remove"
          @click="handleCancel"
          :disabled="isDetail || isAdd || !!billData.status"
        >
          作废
        </el-button>
        <el-button
          type="info"
          plain
          icon="View"
          :disabled="isAdd"
          @click="handleViewProcess"
        >
          查看流程
        </el-button>
      </div>
    </div>

    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="adapt-form"
      >
        <!-- 单据信息 -->
        <div class="item-card">
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="18" :xl="18">
              <el-form-item label="标题" prop="bizTitle" required>
                <el-input
                  v-model="formData.bizTitle"
                  clearable
                  :disabled="isDetail || !!billData.status"
                  placeholder="标题"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="审批状态" prop="approvalStatus">
                <el-tag
                  :type="
                    getEnumType(purchaseBillStatusEnum, billData?.status || 0)
                  "
                >
                  {{
                    getEnumLabel(purchaseBillStatusEnum, billData?.status || 0)
                  }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="部门" prop="deptName">
                <el-input
                  v-model="formData.deptName"
                  disabled
                  placeholder="部门"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="分部" prop="mguName">
                <el-input
                  v-model="formData.mguName"
                  disabled
                  placeholder="分部"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="提交人" prop="userName">
                <el-input
                  v-model="formData.userName"
                  disabled
                  placeholder="提交人"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="提交时间" prop="createDate">
                <el-input
                  v-model="formData.createDate"
                  disabled
                  placeholder="提交时间"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 基本信息 -->
        <div class="item-card">
          <div class="section-title">基本信息</div>
          <basic-info
            :data="detailData"
            :project-options="projectOptions"
          ></basic-info>
        </div>

        <!-- 参考价详情 -->
        <div class="item-card">
          <div class="section-title">参考价详情</div>
          <editable-table
            ref="detailtableRef"
            :row-key="'id'"
            :height="'200px'"
            v-model="tableData"
            :columns="dynamicColumns"
            :pagination="false"
            :highlight-current-row="false"
            :show-summary="false"
            :compactEmpty="true"
            :on-save="handleTableSave"
          >
            <template #actions="{ row }">
              <el-button link type="primary" @click="handleAmount(row)">
                组价明细
              </el-button>
            </template>
          </editable-table>
        </div>

        <!-- 合同附件 -->
        <div class="item-card">
          <div class="section-title">相关附件</div>
          <el-form-item label="上传附件" label-width="90px">
            <base-upload
              v-model:file-list="annexFileList"
              :limit="9"
              :multiple="false"
              :showIcon="true"
              :showTip="true"
              :maxSize="20"
              :unrestricted="true"
              :accept="''"
              button-text="选择文件"
              size="default"
              :disabled="isDetail || !!billData.status"
              @success="handleAnnexSuccess"
            ></base-upload>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <!-- 组价明细弹窗 -->
    <amount-dialog
      v-model="amountDialogVisible"
      :disabled="isDetail || !!billData.status"
      :currentRowData="currentRowData"
      @confirm="amountConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { useTagsStore } from "@/stores/tags-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import BaseUpload from "@/components/base/base-upload.vue";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { debounce, formatNumberDisplay } from "@/utils/common";
import { largeScreenApi } from "@/api/sales/large-screen-api";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api";
import BasicInfo from "../basic-info.vue";
import { dateUtil } from "@/utils/date-util";
import AmountDialog from "./amount-dialog.vue";
import { getEnumLabel, getEnumType } from "@/utils/enum.ts";
import { purchaseBillStatusEnum } from "@/constants/bidding/enums.ts";
import { commonApi } from "@/api/cost/common-api.ts";

defineOptions({ name: "reference-price-form" });

interface Props {
  mode: "add" | "edit" | "detail";
  tenderId: number | undefined;
  billId?: number | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  tenderId: undefined,
  billId: undefined,
});

const emit = defineEmits<{
  (e: "success", data: any): void;
  (e: "cancel"): void;
}>();

const router = useRouter();
const userStore = useUserStore();
const tagsStore = useTagsStore();

const mode = ref<"add" | "edit" | "detail">(props.mode);
const tenderId = ref<number | undefined>(props.tenderId);
const billId = ref<number | undefined>(props.billId);

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");

const initFormData = () => ({
  bizTitle: "",
  deptName: "",
  mguName: "",
  userName: "",
  createDate: "",
});

const formData = ref(initFormData());
const submitLoading = ref(false);
const projectOptions = ref([]);
const annexFileList = ref([]);
const detailData = ref(null);
const billData = ref({
  id: undefined,
  bizTitle: "",
  status: 0,
  bizItemCode: "ZB_CK",
}); // 招标需求单据数据
const flowBasData = ref(null); // 流程基础数据
const flowListData = ref({
  bizItemCode: "", // 业务编码
  wfFlowId: null, // 流程ID
  wfStatus: 0, // 审批状态；0=草稿，10=审批中，40=已审批，80=作废，99=其他
  wfTitle: "", // 流程标题
}); // 流程数据

const tableData = ref([]);

// 组价明细相关
const currentRowData = ref(null);
const amountDialogVisible = ref(false);

const formRules: FormRules = {
  bizTitle: [{ required: true, message: "请输入标题", trigger: "change" }],
};

const dynamicColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60 },
  {
    prop: "projName",
    label: "项目",
    editable: false,
    width: 200,
  },
  {
    prop: "tenderItemName",
    label: "招标明细",
    editable: false,
  },
  {
    prop: "bldNames",
    label: "楼栋",
    editable: false,
  },
  {
    // 此处金额为组价明细里面的汇总金额并且不可编辑，不能为0
    prop: "referAmount",
    label: "不含税参考价",
    width: 150,
    showSummary: true,
    editable: false,
    formatter: (row) => formatNumberDisplay(row.referAmount),
  },
  {
    // 0-红灯（超预算），1-绿灯（未超预算）
    prop: "costAlert",
    label: "成本预警",
    width: 150,
    editable: false,
    formatter: (row) => {
      return row.costAlert == 0 ? "超预算" : "未超预算";
    },
  },
  {
    prop: "referRemark",
    label: "参考说明",
    editable: isDetail.value ? false : true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    width: 180,
    slot: "actions",
    fixed: "right",
  },
]);

// ==================== 方法 ====================
const updateRow = (rowIndex: number, data: any) => {
  const newData = [...tableData.value];
  newData[rowIndex] = { ...tableData.value[rowIndex], ...data };
  tableData.value = newData;
};

const handleTableSave = async (data) => {
  const { row, column, newValue, oldValue, rowIndex } = data;
  if (newValue === oldValue) return;
  updateRow(rowIndex, { [column]: newValue });
};

const handleAmount = (row: any) => {
  currentRowData.value = row;
  amountDialogVisible.value = true;
};

const amountConfirm = (amounts: any) => {
  console.log("amounts", amounts);
  if (currentRowData.value) {
    const rowIndex = tableData.value.findIndex(
      (item) => item.id === currentRowData.value.id,
    );
    if (rowIndex !== -1) {
      // 组价明细的不含税参考价 合计
      const totalSubAmount = amounts.reduce(
        (sum, item) => sum + (item.subAmount || 0),
        0,
      );
      // 组价明细的 目标成本总额(不含税) 合计
      const totalCostExclAmt = amounts.reduce(
        (sum, item) => sum + (item.costExclAmt || 0),
        0,
      );
      let costAlert = 0; // 0-红灯（超预算），1-绿灯（未超预算）
      if (totalSubAmount <= totalCostExclAmt) {
        costAlert = 1;
      } else {
        costAlert = 0;
      }
      updateRow(rowIndex, {
        referAmount: totalSubAmount,
        costAlert: costAlert,
        amounts: amounts || [],
      });
    }
  }
};

const handleAnnexSuccess = (file: any) => {
  console.log("文件上传成功", file);
  annexFileList.value.push(file);
};

// 获取事项详情数据（新增时使用）
const getTenderInfo = async (tenderId: number) => {
  if (!tenderId) return;
  try {
    const res = await biddingManageApi.getTenderInfo({
      tenderId: tenderId,
    });
    if (res.code === 200 && res.data) {
      detailData.value = res.data;
    } else {
      ElMessage.error(res.message || "获取详情失败");
    }
  } catch (error) {
    console.error("获取详情失败:", error);
  }
};

// 新增时初始化表格数据
const initAddTableData = async () => {
  if (!detailData.value) {
    tableData.value = [];
    return;
  }
  const { items } = detailData.value;
  if (items && items.length > 0) {
    const initialTableList = items.map((item: any) => ({
      id: item.id,
      tenderItemId: item.id, // 事项明细ID
      projId: item.projId,
      projName: item.projName,
      tenderId: item.tenderId,
      tenderItemName: item.tenderItemName || "",
      referAmount: item.referAmount || 0,
      perfBondAmount: item.perfBondAmount || 0,
      bidBondAmount: item.bidBondAmount || 0,
      referRemark: "", // 参考说明
      costAlert: null, // 0-红灯（超预算），1-绿灯（未超预算）
      bldIds: item.bldIds ? item.bldIds.split(",").map(Number) : [],
      bldNames: item.bldNames || "",
      buildingOptions: [],
      amounts: [],
    }));
    const buildingPromises = initialTableList.map(async (item, index) => {
      if (item.projId) {
        try {
          const buildingRes = await projectAreaApi.getBuildingList({
            projId: item.projId,
          });
          if (buildingRes.code === 200) {
            initialTableList[index].buildingOptions = buildingRes.data || [];
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

// 编辑/详情时获取单据数据
const getBillDetail = async () => {
  if (!props.billId) return;
  try {
    const res = await biddingManageApi.getBillInfo({
      billId: props.billId,
      isWithFlow: true,
    });
    if (res.code === 200 && res.data) {
      const {
        annexList,
        bill,
        flowBase,
        refers,
        tenderAnnexList,
        tenderId,
        flowList,
      } = res.data;
      // 通过事项ID获取基本信息
      await getTenderInfo(tenderId);

      billData.value = { ...billData.value, ...bill };
      flowBasData.value = { ...flowBasData.value, ...flowBase };
      flowListData.value = { ...flowListData.value, ...flowList };

      formData.value.bizTitle = bill.bizTitle || "";
      formData.value.deptName = flowBase?.deptName || "";
      formData.value.mguName = flowBase?.mguName || "";
      formData.value.userName = bill.createName || "";
      formData.value.createDate = bill.createDate || "";

      if (refers && refers.length > 0) {
        tableData.value = refers || [];
      }

      annexFileList.value = (annexList || [])?.map((item) => {
        return {
          ...item,
          url: item.annexPath,
          name: item.annexName,
        };
      });
    }
  } catch (error) {}
};

const handleSave = async () => {
  if (!formData.value.bizTitle) {
    ElMessage.error("请填写标题！");
    return false;
  }
  if (tableData.value.length === 0) {
    ElMessage.warning("暂无数据保存");
    return;
  }
  if (
    tableData.value.some((item) => !item.referAmount && item.referAmount !== 0)
  ) {
    ElMessage.error("不含税参考价不能为0");
    return;
  }
  if (
    tableData.value.some((item) => !item.amounts || item.amounts.length === 0)
  ) {
    ElMessage.error("请为列表中的每一项添加组价明细");
    return;
  }

  try {
    submitLoading.value = true;
    const dataList = tableData.value.map((item) => {
      const bldIds = Array.isArray(item.bldIds) ? item.bldIds : [];
      return {
        ...item,
        id: isAdd.value ? undefined : item.id,
        tenderId: props.tenderId,
        bldIds: bldIds.join(","),
        referRemark: item.referRemark || "",
        costAlert: item.costAlert,
        amounts: item.amounts || [],
        buildingOptions: [],
      };
    });
    const params = {
      bizItemCode: "ZB_CK", // 招标参考价
      bill: {
        id: billData.value.id || undefined,
        tenderId: props.tenderId, // 事项ID
        bizItemCode: "ZB_CK", // 招标参考价
        bizTitle: formData.value.bizTitle, // 流程标题
      },
      tenderId: props.tenderId, // 事项ID
      refers: dataList, // 招标参考价
      annexList: annexFileList.value, // 附件列表
    };
    const res = await biddingManageApi.saveBill(params);
    if (res.code === 200 && res.data) {
      billData.value.id = res.data || undefined; // 保存单据id
      ElMessage.success("保存成功");
    }
  } catch (error) {
    ElMessage.error("保存失败");
  } finally {
    submitLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formData.value.bizTitle) {
    ElMessage.error("请填写标题！");
    return false;
  }
  if (tableData.value.length === 0) {
    ElMessage.warning("暂无数据保存");
    return;
  }
  if (
    tableData.value.some((item) => !item.referAmount && item.referAmount !== 0)
  ) {
    ElMessage.error("不含税参考价不能为0");
    return;
  }
  if (
    tableData.value.some((item) => !item.amounts || item.amounts.length === 0)
  ) {
    ElMessage.error("请为列表中的每一项添加组价明细");
    return;
  }
  try {
    submitLoading.value = true;
    const dataList = tableData.value.map((item) => {
      const bldIds = Array.isArray(item.bldIds) ? item.bldIds : [];
      return {
        ...item,
        id: isAdd.value ? undefined : item.id,
        tenderId: props.tenderId,
        bldIds: bldIds.join(","),
        referRemark: item.referRemark || "",
        costAlert: item.costAlert,
        amounts: item.amounts || [],
        buildingOptions: [],
      };
    });
    const params = {
      bizItemCode: "ZB_CK", // 招标参考价
      bill: {
        id: billData.value.id || undefined,
        tenderId: props.tenderId, // 事项ID
        bizItemCode: "ZB_CK", // 招标参考价
        bizTitle: formData.value.bizTitle, // 流程标题
      },
      tenderId: props.tenderId, // 事项ID
      refers: dataList, // 招标参考价
      annexList: annexFileList.value, // 附件列表
    };

    const res = await biddingManageApi.submitBill(params);
    if (res.code === 200 && res.data) {
      ElMessage.success("提交成功,已发起审批！");
      // 生成OA审批页面重定向地址
      const redirectRes = await commonApi.generateRedirectUrl({
        oaRequestId: res.data,
      });
      // 提交成功后，关闭当前页面，跳转到单据列表页面
      goBack();

      if (redirectRes.code === 200 && redirectRes.data) {
        // 打开OA审批页面
        setTimeout(() => {
          window.open(redirectRes.data, "_blank");
        }, 800);
      }
    }
  } catch (error) {
  } finally {
    submitLoading.value = false;
  }
};
// 删除
const handleDelete = () => {
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await biddingManageApi.delBill({
        billId: billData.value.id,
        bizItemCode: "ZB_CK", // 招标参考价
      });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        goBack();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  });
};
// 作废
const handleCancel = () => {
  ElMessageBox.confirm("确定要作废吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await biddingManageApi.voidBill({
        billId: billData.value.id,
      });
      if (res.code === 200) {
        ElMessage.success("作废成功");
        goBack();
      }
    } catch (error) {
      console.error("作废失败:", error);
    }
  });
};
// 查看流程
const handleViewProcess = async () => {
  if (flowListData.value && flowListData.value?.wfFlowId) {
    try {
      const redirectRes = await commonApi.generateRedirectUrl({
        oaRequestId: flowListData.value.wfFlowId,
      });
      if (redirectRes.code === 200 && redirectRes.data) {
        window.open(redirectRes.data, "_blank");
      }
    } catch (error) {
      console.error("查看流程失败:", error);
    }
  } else {
    ElMessage.warning("暂无流程信息");
  }
};
// 返回操作
const goBack = () => {
  if (isAdd.value) {
    tagsStore.closeTagByPath("/bidding/reference-price/add");
  }
  if (isEdit.value) {
    tagsStore.closeTagByPath("/bidding/reference-price/edit");
  }
  router.go(-1); // 返回上个页面
};
// 获取项目扁平数据
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

// 初始化
const initData = async () => {
  await getProjectOptions();
  formData.value.userName = userStore.userInfo?.empName ?? "";
  formData.value.createDate = dateUtil().format("YYYY-MM-DD");

  if (isAdd.value) {
    // 1.先获取详情信息
    await getTenderInfo(props.tenderId);
    // 2.使用详情信息初始化表格数据
    await initAddTableData();
  } else {
    await getBillDetail();
  }
};

onMounted(() => {
  initData();
});
</script>

<style scoped lang="scss">
.basic-form-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
  padding: 0;
}

.form-header {
  width: 100%;
  background: #ffffff;
  padding: 16px 24px 12px 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
  border-bottom: 1px solid #e4e7ed;

  .header-title {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 0;
    box-sizing: border-box;
    font-size: 20px;
    font-weight: 700;
    color: #1d2129;
    letter-spacing: 0.5px;
  }

  .header-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;

    .el-button {
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }

      &:active {
        transform: translateY(0px);
      }
    }
  }
}

.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 15px 15px 30px;
  box-sizing: border-box;
}

.adapt-form {
  width: 100%;
  margin: 0 auto;

  .item-card {
    background: #ffffff;
    border-radius: 8px;
    padding: 15px 15px;
    margin-bottom: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    transition:
      box-shadow 0.3s ease,
      transform 0.2s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  padding: 0 0 12px 14px;
  position: relative;

  &::before {
    content: "";
    width: 4px;
    height: 18px;
    background: linear-gradient(180deg, #409eff, #66b1ff);
    border-radius: 2px;
    position: absolute;
    left: 0;
    top: 4px;
  }
}

.actionBar-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
