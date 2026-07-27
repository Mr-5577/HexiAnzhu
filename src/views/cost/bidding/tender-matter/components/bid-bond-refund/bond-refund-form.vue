<!-- 投标保证金退还 -- 新增/编辑/详情 -->
<template>
  <div class="basic-form-content">
    <div class="form-header">
      <div class="header-title">投标保证金退还</div>
      <div class="header-btn">
        <el-button
          type="primary"
          icon="DocumentAdd"
          :loading="submitLoading"
          @click="handleSave"
          :disabled="isDetail || !!billData.status"
        >
          保存
        </el-button>
        <el-button
          type="success"
          plain
          icon="Promotion"
          :loading="submitLoading"
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
          @click="handleViewProcess"
          :disabled="isAdd"
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

        <!-- 投标保证金退还列表 -->
        <div class="item-card">
          <div class="section-title">投标保证金退还列表</div>
          <template v-if="isDetail">
            <base-table
              :columns="detailColumns"
              :tableData="tableData"
              :rowKey="'id'"
              :height="'200px'"
              :pagination="false"
            >
              <!-- 缴纳凭证附件列 -->
              <template #refundAnnexId="{ row }">
                <div class="annex-cell">
                  <el-link
                    type="primary"
                    :underline="'hover'"
                    @click="handleViewAnnex(row)"
                  >
                    {{ row.refundAnnexName || "" }}
                  </el-link>
                </div>
              </template>
            </base-table>
          </template>
          <template v-else>
            <!-- 可编辑表格 -->
            <editable-table
              ref="detailtableRef"
              :row-key="'uuid'"
              :height="'200px'"
              v-model="tableData"
              :columns="dynamicColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :on-save="handleTableSave"
              @editable-cell-click="handleEditableCellClick"
            >
              <template #actionBar>
                <div class="actionBar-buttons">
                  <el-button
                    type="primary"
                    size="small"
                    @click="handleAddRefund"
                  >
                    新增
                  </el-button>
                </div>
              </template>
              <!-- 退还凭证附件列 -->
              <template #refundAnnexName="{ row }">
                <div class="annex-cell">
                  <el-link
                    v-if="row.refundAnnexId"
                    type="primary"
                    :underline="'hover'"
                    @click="handleViewAnnex(row)"
                  >
                    {{ row.refundAnnexName || "查看附件" }}
                  </el-link>
                  <span v-else style="color: #999; font-size: 12px">-</span>
                </div>
              </template>
              <template #actions="{ row }">
                <div class="actions-btn">
                  <el-button link type="primary" @click="openUploadForRow(row)">
                    上传凭证
                  </el-button>
                  <el-button
                    link
                    type="danger"
                    @click="handleDeleteRefund(row)"
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </editable-table>
          </template>
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

    <!-- 选择供应商弹窗 -->
    <choose-supplier-dialog
      ref="supplierDialogRef"
      v-model="supplierDialogVisible"
      @select="handleSupplierSelect"
    />

    <!-- 选择合同弹窗 -->
    <choose-contract-dialog
      ref="contractDialogRef"
      v-model="contractDialogVisible"
      @select="handleContractSelect"
    />

    <!-- 隐藏的上传组件 -->
    <Teleport to="body">
      <div style="display: none" @click.stop @mousedown.stop>
        <base-upload
          ref="annexUploadRef"
          key="refundAnnex"
          v-model:file-list="tempFileList"
          :limit="1"
          :multiple="false"
          :showIcon="true"
          :showTip="false"
          :maxSize="20"
          button-text="选择文件"
          size="default"
          button-type="primary"
          @success="handleUploadSuccess"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef, nextTick } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { useTagsStore } from "@/stores/tags-store";
import BaseUpload from "@/components/base/base-upload.vue";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { largeScreenApi } from "@/api/sales/large-screen-api";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api";
import { commonApi } from "@/api/cost/common-api";
import BasicInfo from "../basic-info.vue";
import { dateUtil } from "@/utils/date-util";
import ChooseSupplierDialog from "@/components/business/choose-supplier-dialog.vue";
import ChooseContractDialog from "@/components/business/choose-contract-dialog.vue";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { buildFileUrl } from "@/utils/file-path-util";
import { getEnumLabel, getEnumType } from "@/utils/enum.ts";
import { purchaseBillStatusEnum } from "@/constants/bidding/enums.ts";

defineOptions({ name: "bid-bond-refund-form" });

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

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");

const annexUploadRef = useTemplateRef("annexUploadRef");

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
  bizItemCode: "ZB_BZJTH",
}); // 招标保证金退还单据数据
const flowBasData = ref(null); // 流程基础数据
const flowListData = ref({
  bizItemCode: "", // 业务编码
  wfFlowId: null, // 流程ID
  wfStatus: 0, // 审批状态；0=草稿，10=审批中，40=已审批，80=作废，99=其他
  wfTitle: "", // 流程标题
}); // 流程数据
const tableData = ref([]);
const tableLoading = ref(false);
const bondRecvTable = ref([]); // 事项下的保证金缴纳列表

// 供应商弹窗相关
const supplierDialogVisible = ref(false);
const currentRowData = ref(null);
const supplierDialogRef = useTemplateRef("supplierDialogRef");

// 合同弹窗相关
const contractDialogVisible = ref(false);
const contractDialogRef = useTemplateRef("contractDialogRef");

// 附件上传相关
const tempFileList = ref([]);
const currentUploadRow = ref(null);

// 数据字典
const { getDictList, loadDicts } = useDict([
  dictMapping.payMethod, // 缴纳方式
  dictMapping.refundMethod, // 退还方式
]);
const payMethodOptions = ref([]);
const refundMethodOptions = ref([]);

const formRules: FormRules = {
  bizTitle: [{ required: true, message: "请输入标题", trigger: "change" }],
};

const dynamicColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60 },
  {
    // 不可编辑
    prop: "tenderItemName",
    label: "招标明细事项",
    minWidth: 150,
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "tenderItemName",
    optionValueField: "tenderItemId",
    options: bondRecvTable.value || [],
  },
  {
    // 不可编辑
    prop: "bldNames",
    label: "楼栋范围",
    width: 150,
    editable: false,
  },
  {
    // 不可编辑
    prop: "supName",
    label: "供应商名称",
    minWidth: 150,
    editable: false,
    // clickable: true, // 可点击
    showOverflowTooltip: false,
  },
  {
    // 不可编辑
    prop: "recvAmount",
    label: "实交保证金金额",
    width: 130,
    editable: false,
  },
  {
    // 不可编辑
    prop: "recvMethodName",
    label: "缴纳方式",
    width: 130,
    editable: false,
  },
  {
    prop: "refundType",
    label: "退还方式",
    width: 130,
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    placeholder: "请选择退还方式",
    optionLabelField: "dicLabel",
    optionValueField: "id",
    options: refundMethodOptions.value || [],
  },
  {
    // 不可编辑并且和实缴保证金一样
    prop: "refundAmount",
    label: "退还金额",
    width: 130,
    editable: false,
  },
  {
    slot: "refundAnnexName",
    label: "退还凭证附件",
    minWidth: 150,
    showOverflowTooltip: false,
  },
  {
    prop: "conName",
    label: "合同",
    editable: true,
    placeholder: "请选择",
    minWidth: 150,
    clickable: true, // 可点击
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    width: 160,
    slot: "actions",
    fixed: "right",
  },
]);

const detailColumns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "tenderItemName", label: "招标明细事项" },
  { prop: "bldNames", label: "楼栋范围", width: 150 },
  { prop: "supName", label: "供应商名称" },
  { prop: "recvAmount", label: "实交保证金金额", width: 130 },
  { prop: "recvMethodName", label: "缴纳方式", width: 130 },
  { prop: "refundTypeName", label: "退还方式", width: 130 },
  { prop: "refundAmount", label: "退还金额", width: 130 },
  { slot: "refundAnnexId", label: "退还凭证附件" },
  { prop: "conName", label: "合同" },
];

const updateRow = (rowIndex: number, data: any) => {
  const newData = [...tableData.value];
  newData[rowIndex] = { ...tableData.value[rowIndex], ...data };
  tableData.value = newData;
};

const handleTableSave = async (data) => {
  const { row, column, newValue, oldValue, rowIndex } = data;
  if (newValue === oldValue) return;
  // 选择保证金缴纳明细事项
  if (column === "tenderItemName") {
    const bondRecv = bondRecvTable.value.find(
      (option: any) => option.tenderItemId === newValue,
    );
    const newData = {
      tenderId: bondRecv.tenderId,
      tenderItemId: bondRecv.tenderItemId,
      tenderItemName: bondRecv.tenderItemName,
      bldIds: bondRecv.bldIds,
      bldNames: bondRecv.bldNames,
      supId: bondRecv.supId,
      supName: bondRecv.supName,
      recvAmount: bondRecv.recvAmount, // 实交保证金金额
      recvMethod: bondRecv.recvMethod, // 缴纳方式id
      recvMethodName: bondRecv.recvMethodName, // 缴纳方式name
      refundAmount: bondRecv.recvAmount, // 退还金额，和实缴一致
    };
    updateRow(rowIndex, { ...newData });
    return;
  }
  // 退还方式变更时，同步更新退还方式名称
  if (column === "refundType") {
    const selectedOption = refundMethodOptions.value.find(
      (option: any) => option.id === newValue,
    );
    const refundTypeName = selectedOption ? selectedOption.dicLabel : "";
    updateRow(rowIndex, { refundType: newValue, refundTypeName });
    return;
  }
  updateRow(rowIndex, { [column]: newValue });
};

const handleEditableCellClick = ({ row, column, rowIndex }) => {
  // 供应商单元格点击
  if (column.prop === "supName") {
    currentRowData.value = row;
    supplierDialogVisible.value = true;
  }
  // 合同单元格点击
  if (column.prop === "conName") {
    currentRowData.value = row;
    contractDialogVisible.value = true;
  }
};
// 供应商选择
const handleSupplierSelect = (data: any) => {
  if (data && data.length > 0) {
    const supplier = data[0];
    const rowIndex = tableData.value.findIndex(
      (item) => item.uuid === currentRowData.value.uuid,
    );
    if (rowIndex !== -1) {
      updateRow(rowIndex, {
        supId: supplier.id,
        supName: supplier.supName,
      });
    }
  }
};
// 合同选择
const handleContractSelect = (data: any) => {
  if (data && data.length > 0) {
    const contract = data[0];
    const rowIndex = tableData.value.findIndex(
      (item) => item.uuid === currentRowData.value.uuid,
    );
    if (rowIndex !== -1) {
      updateRow(rowIndex, {
        conId: contract.id,
        conName: contract.supName,
      });
    }
  }
};

// 打开上传
const openUploadForRow = (row: any) => {
  currentUploadRow.value = row;
  tempFileList.value = [];
  nextTick(() => {
    annexUploadRef.value?.triggerFileSelect();
  });
};

// 上传成功回调
const handleUploadSuccess = (file: any) => {
  if (currentUploadRow.value) {
    const annexId = file.id;
    const annexName = file.annexName || file.name;

    const rowIndex = tableData.value.findIndex(
      (item) => item.uuid === currentUploadRow.value.uuid,
    );
    if (rowIndex !== -1) {
      updateRow(rowIndex, {
        refundAnnexId: annexId,
        refundAnnexName: annexName,
      });
    }
    currentUploadRow.value = null;
  }
};

// 查看附件
const handleViewAnnex = async (row: any) => {
  if (!row.refundAnnexId) {
    ElMessage.warning("该附件不存在");
    return;
  }
  try {
    const res = await commonApi.getFileList({ annexId: row.refundAnnexId });
    if (res.code === 200 && res.data && res.data.length > 0) {
      const file = res.data[0];
      const fileUrl = file.annexPath;
      if (fileUrl) {
        const url = buildFileUrl(fileUrl);
        window.open(url, "_blank");
      } else {
        ElMessage.error("无法获取附件地址");
      }
    } else {
      ElMessage.error("附件不存在");
    }
  } catch (error) {
    ElMessage.error("查看附件失败，请稍后重试");
  }
};

const handleAddRefund = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: undefined,
    tenderId: undefined, // 事项ID
    tenderItemId: undefined, // 事项明细ID
    tenderItemName: "", // 招标明细事项
    bldIds: "",
    bldNames: "",
    supId: undefined,
    supName: "",
    recvAmount: 0, // 实交保证金金额
    recvMethod: undefined,
    recvMethodName: "",
    refundType: undefined,
    refundTypeName: "",
    refundAmount: 0, // 退还金额
    refundAnnexId: undefined,
    refundAnnexName: "",
    conId: "", // 合同ID
    conName: "", // 合同名称
  };
  tableData.value = [...tableData.value, newRowData];
};

const handleDeleteRefund = (row: any) => {
  tableData.value = tableData.value.filter((item) => item.uuid !== row.uuid);
  // ElMessageBox.confirm(`确定要删除该行数据吗？`, "提示", {
  //   confirmButtonText: "确定",
  //   cancelButtonText: "取消",
  //   type: "warning",
  // })
  //   .then(() => {
  //     tableData.value = tableData.value.filter(
  //       (item) => item.uuid !== row.uuid,
  //     );
  //   })
  //   .catch(() => {});
};

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

const handleAnnexSuccess = (fileList: any) => {
  console.log("文件上传成功", fileList);
};
// 通过事项ID获取保证金缴纳明细列表
const getBondRecvTableByTenderId = async (tenderId: number) => {
  if (!tenderId) return;
  try {
    const res = await biddingManageApi.getBondRecvList({
      tenderId: tenderId,
    });
    if (res.code === 200 && res.data) {
      const list = res.data || [];
      // 把事项ID加入到列表里面提供给后面使用
      bondRecvTable.value = list.map((item: any) => ({
        ...item,
        tenderId: tenderId,
      }));
    }
  } catch (error) {}
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
      uuid: uuidv4(),
      id: item.id,
      tenderItemId: item.id, // 事项明细ID
      tenderId: item.tenderId, // 事项ID
      tenderItemName: item.tenderItemName, // 事项名称
      bldIds: item.bldIds,
      bldNames: item.bldNames,
      supId: undefined,
      supName: "",
      recvAmount: 0,
      recvMethod: undefined,
      recvMethodName: "",
      refundType: undefined,
      refundAmount: 0,
      refundAnnexId: undefined,
      refundAnnexName: "",
      conId: "", // 合同ID
      conName: "", // 合同名称
    }));
    tableData.value = initialTableList;
  } else {
    tableData.value = [];
  }
};

// 编辑/详情时获取单据数据
const getBillDetail = async () => {
  if (!props.billId) return;

  try {
    const res = await biddingManageApi.getBillInfo({ billId: props.billId });
    if (res.code === 200 && res.data) {
      const { annexList, bill, flowBase, bondRefunds, tenderId, flowList } =
        res.data;
      // 通过事项ID获取基本信息
      await getTenderInfo(tenderId);
      // 保证金缴纳退还明细使用保证金缴纳明细列表
      await getBondRecvTableByTenderId(props.tenderId);

      billData.value = { ...billData.value, ...bill };
      flowBasData.value = { ...flowBasData.value, ...flowBase };
      flowListData.value = { ...flowListData.value, ...flowList };

      formData.value.bizTitle = bill.bizTitle || "";
      formData.value.deptName = flowBase.deptName || "";
      formData.value.mguName = flowBase.mguName || "";
      formData.value.userName = bill.createName || "";
      formData.value.createDate = bill.createDate || "";

      if (bondRefunds && bondRefunds.length > 0) {
        const initTableList = bondRefunds.map((item) => ({
          ...item,
          uuid: uuidv4(),
          tenderId: tenderId, // 事项ID
        }));
        tableData.value = initTableList;
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
// 返回操作
const goBack = () => {
  if (isAdd.value) {
    tagsStore.closeTagByPath("/bidding/bid-bond-refund/add");
  }
  if (isEdit.value) {
    tagsStore.closeTagByPath("/bidding/bid-bond-refund/edit");
  }
  router.go(-1); // 返回上个页面
};

// 验证表单数据
const validateForm = () => {
  if (!formData.value.bizTitle) {
    ElMessage.error("请填写标题！");
    return false;
  }
  if (tableData.value.some((item) => !item.refundType)) {
    ElMessage.error("请选择列表中的退还方式");
    return false;
  }
  // 验证：退还方式为"转履约保证金"(2040)时，必须选择合同
  const invalidContractRows = tableData.value.filter(
    (item) => item.refundType == 2040 && !item.conId,
  );
  if (invalidContractRows.length > 0) {
    ElMessage.error(`退还方式为"转履约保证金"时，请选择合同`);
    return false;
  }

  // 验证：通过 tenderItemId 判断是否有重复数据
  const ids = tableData.value.map((item) => item.tenderItemId).filter(Boolean);
  if (new Set(ids).size !== ids.length) {
    ElMessage.error("存在重复的招标明细事项，请检查");
    return false;
  }

  return true;
};

// 保存
const handleSave = async () => {
  // 调用验证
  if (!validateForm()) return;
  try {
    submitLoading.value = true;
    const dataList = tableData.value.map((item) => ({
      id: isAdd.value ? undefined : item.id, // 新增时不需要传id
      tenderId: item.tenderId, // 事项ID
      tenderItemId: item.tenderItemId, // 事项明细ID
      tenderItemName: item.tenderItemName || "", // 事项明细名称
      bldIds: item.bldIds,
      bldNames: item.bldNames,
      supId: item.supId,
      supName: item.supName || "",
      recvAmount: item.recvAmount ?? 0,
      recvMethod: item.recvMethod || "",
      recvMethodName: item.recvMethodName || "",
      refundType: item.refundType || "",
      refundTypeName: item.refundTypeName || "",
      refundAmount: item.refundAmount ?? 0,
      refundAnnexId: item.refundAnnexId || "",
      refundAnnexName: item.refundAnnexName || "",
      conId: item.conId || "",
      conName: item.conName || "",
    }));

    const params = {
      bizItemCode: "ZB_BZJTH", // 招标保证金退还
      bill: {
        id: billData.value.id || undefined,
        tenderId: props.tenderId, // 事项ID
        bizItemCode: "ZB_BZJTH", // 招标保证金退还
        bizTitle: formData.value.bizTitle, // 流程标题
      },
      tenderId: props.tenderId, // 事项ID
      bondRefunds: dataList, //  招标保证金退还
      annexList: annexFileList.value, // 附件列表
    };
    debugger;
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
  // 调用验证
  if (!validateForm()) return;
  try {
    submitLoading.value = true;
    const dataList = tableData.value.map((item) => ({
      id: isAdd.value ? undefined : item.id, // 新增时不需要传id
      tenderId: item.tenderId, // 事项ID
      tenderItemId: item.tenderItemId, // 事项明细ID
      tenderItemName: item.tenderItemName || "", // 事项明细名称
      bldIds: item.bldIds,
      bldNames: item.bldNames,
      supId: item.supId,
      supName: item.supName || "",
      recvAmount: item.recvAmount ?? 0,
      recvMethod: item.recvMethod || "",
      recvMethodName: item.recvMethodName || "",
      refundType: item.refundType || "",
      refundAmount: item.refundAmount ?? 0,
      refundAnnexId: item.refundAnnexId || "",
      refundAnnexName: item.refundAnnexName || "",
      conId: item.conId || "",
      conName: item.conName || "",
    }));

    const params = {
      bizItemCode: "ZB_BZJTH", // 招标保证金退还
      bill: {
        id: billData.value.id || undefined,
        tenderId: props.tenderId, // 事项ID
        bizItemCode: "ZB_BZJTH", // 招标保证金退还
        bizTitle: formData.value.bizTitle, // 流程标题
      },
      tenderId: props.tenderId, // 事项ID
      bondRefunds: dataList, //  招标保证金退还
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
        bizItemCode: "ZB_BZJTH", // 招标保证金退还
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
    ElMessage.error("暂无流程信息");
  }
};

// 初始化数据字典数据
const initDictData = async () => {
  await loadDicts();
  payMethodOptions.value = getDictList(dictMapping.payMethod);
  refundMethodOptions.value = getDictList(dictMapping.refundMethod);
};

// 初始化
const initData = async () => {
  await initDictData();
  await getProjectOptions();
  formData.value.userName = userStore.userInfo?.empName || "";
  formData.value.createDate = dateUtil().format("YYYY-MM-DD");

  if (isAdd.value) {
    // 1.先获取详情信息
    await getTenderInfo(props.tenderId);
    // 2.使用详情信息初始化表格数据
    // await initAddTableData();
    // 保证金缴纳退还明细使用保证金缴纳明细列表
    await getBondRecvTableByTenderId(props.tenderId);
  } else {
    await getBillDetail();
  }
};

onMounted(async () => {
  await initData();
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

.annex-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
