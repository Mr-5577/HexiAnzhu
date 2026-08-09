<!-- 建安支付 表单 -->
<template>
  <div class="basic-form-content">
    <BillHeader
      :title="'非合同请款审批'"
      :contract-no="billData.bizNo || ''"
      :submitter="formData.userName || ''"
      :submit-time="formData.createDate || ''"
      :status="billData.status"
      :show-status="true"
      :button-loading="submitLoading"
      :save-disabled="isDetail || !!billData.status"
      :submit-disabled="isDetail || !!billData.status"
      :delete-disabled="isDetail || isAdd || !!billData.status"
      :void-disabled="isDetail || isAdd || !!billData.status"
      :view-disabled="isAdd"
      @save="handleSave"
      @submit="handleSubmit"
      @delete="handleDelete"
      @void="handleCancel"
      @viewFlow="handleViewProcess"
    >
    </BillHeader>

    <div class="form-scroll-area">
      <el-form
        ref="paymentFormRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="adapt-form"
      >
        <BillInfo
          v-model="formData"
          :status="billData?.status || 0"
          :disabled="isDetail || !!billData.status"
          :project-options="projectOptions"
          @project-change="changeProject"
        />

        <div class="item-card">
          <div class="section-title">立项信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="事项名称" required>
                <el-input
                  v-model="cstProcessData.processName"
                  placeholder=""
                  style="width: 100%"
                  readonly
                  disabled
                >
                  <template #append>
                    <el-button
                      @click="changeProcess"
                      plain
                      type="primary"
                      :disabled="isDetail || !!billData.status"
                    >
                      关联立项
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="事项计划金额">
                <el-input
                  v-model="cstProcessData.processAmt"
                  placeholder=""
                  style="width: 100%"
                  readonly
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="已请款金额">
                <el-input
                  v-model="cstProcessData.sumAppyAmt"
                  placeholder=""
                  style="width: 100%"
                  readonly
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="剩余金额">
                <el-input
                  v-model="cstProcessData.sumOwedAmt"
                  placeholder=""
                  style="width: 100%"
                  readonly
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="事项说明">
                <el-input
                  v-model="cstProcessData.remark"
                  type="textarea"
                  :rows="1"
                  placeholder=""
                  readonly
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="item-card">
          <div class="section-title">请款信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="归属月份" prop="belongMonth" required>
                <el-date-picker
                  v-model="formData.belongMonth"
                  type="month"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择归属月份"
                  style="width: 100%"
                  :disabled="isDetail || !!billData.status"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="费用类型" prop="finaTypeId" required>
                <el-cascader
                  v-model="formData.finaTypeId"
                  :options="feeTypeOptions"
                  :show-all-levels="false"
                  :props="{
                    expandTrigger: 'hover',
                    emitPath: false,
                    checkStrictly: false,
                    value: 'id',
                    label: 'finaTypeName',
                    children: 'children',
                  }"
                  placeholder="请选择费用类型"
                  style="width: 100%"
                  filterable
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="请款类型" prop="reqType" required>
                <el-select
                  v-model="formData.reqType"
                  placeholder="请选择"
                  style="width: 100%"
                  :disabled="isDetail || !!billData.status"
                >
                  <el-option label="正常请款" :value="0" />
                  <el-option label="来票冲账" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <!-- 请款类型为来票冲账时 置灰不可编辑 -->
              <el-form-item label="是否最后一笔" prop="isLastRec" required>
                <el-select
                  v-model="formData.isLastRec"
                  placeholder="请选择"
                  style="width: 100%"
                  :disabled="
                    isDetail || !!billData.status || formData.reqType == 1
                  "
                >
                  <el-option label="是" :value="1" />
                  <el-option label="否" :value="0" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="本次请款金额" prop="reqAmt" required>
                <el-input-number
                  v-model="formData.reqAmt"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  :disabled="isDetail || !!billData.status"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="实际请款金额" prop="factReqAmt" required>
                <el-input-number
                  v-model="formData.factReqAmt"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="应收发票金额" prop="invRecAmt" required>
                <el-input-number
                  v-model="formData.invRecAmt"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="已收发票金额" prop="invRcvdAmt" required>
                <el-input-number
                  v-model="formData.invRcvdAmt"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="欠票金额" prop="invOweAmt" required>
                <el-input-number
                  v-model="formData.invOweAmt"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="请款说明" prop="reqDesc">
                <el-input
                  v-model="formData.reqDesc"
                  type="textarea"
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  placeholder="请输入"
                  :disabled="isDetail || !!billData.status"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 扣款事项明细 -->
        <div class="item-card" v-if="showDeductionAndPayWay">
          <div class="section-title">款项调整</div>
          <template v-if="isDetail || !!billData.status">
            <base-table
              ref="dedTableRef"
              :columns="dedDetailColumns"
              :table-data="dedTable"
              :row-key="'uuid'"
              :pagination="false"
              :show-toolbar="false"
              :show-action-bar="false"
              :height="'200px'"
            >
            </base-table>
          </template>
          <template v-else>
            <editable-table
              ref="dedTableRef"
              :row-key="'uuid'"
              :height="'200px'"
              v-model="dedTable"
              :columns="dedColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="true"
              :compactEmpty="true"
              :editable="true"
              :on-save="handleDedSave"
            >
              <template #actionBar>
                <div class="actionBar-buttons">
                  <el-button type="primary" size="small" @click="handleAddDed">
                    新增事项
                  </el-button>
                </div>
              </template>
              <template #actions="{ row }">
                <el-button link type="danger" @click="handleDeleteDed(row)">
                  删除
                </el-button>
              </template>
            </editable-table>
          </template>
          <div class="deduction-summary">
            实际请款：<span>{{ actualReqAmt.toFixed(2) }}</span>
          </div>
        </div>

        <!-- 付款方式 -->
        <div class="item-card" v-if="showDeductionAndPayWay">
          <div class="section-title">支付方式</div>
          <div
            style="display: flex; justify-content: flex-end; margin-bottom: 8px"
          >
            <el-button
              type="primary"
              size="small"
              :disabled="payWayTable.length == 0"
              @click="handleFinanceAlloc"
            >
              财务分摊
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="addPayWay"
              v-if="!isDetail"
            >
              新增支付方式
            </el-button>
          </div>
          <template v-if="isDetail || !!billData.status">
            <base-table
              ref="tableRef"
              :columns="payWayDetailColumns"
              :table-data="payWayTable"
              :row-key="'uuid'"
              :pagination="false"
              :show-toolbar="false"
              :show-action-bar="false"
              :height="'200px'"
            >
            </base-table>
          </template>
          <template v-else>
            <editable-table
              ref="payWayTableRef"
              :row-key="'uuid'"
              :height="'200px'"
              v-model="payWayTable"
              :columns="payWayColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :editable="true"
              :on-save="handlePayWaySave"
            >
              <template #actions="{ row }">
                <el-button link type="danger" @click="deletePayWay(row)">
                  删除
                </el-button>
              </template>
            </editable-table>
          </template>
          <div class="pay-summary">
            付款合计：<span>{{ totalPayAmt.toFixed(2) }}</span>
            <span
              v-if="Math.abs(totalPayAmt - actualReqAmt) > 0.01"
              class="pay-error"
            >
              （必须等于实际请款金额 {{ actualReqAmt.toFixed(2) }}）
            </span>
            <span v-else class="pay-success">（等于实际请款金额）</span>
          </div>
        </div>

        <!-- 发票登记 -->
        <div class="item-card">
          <div class="section-title">发票登记</div>
          <template v-if="isDetail || !!billData.status">
            <base-table
              ref="tableRef"
              :columns="invoiceMDetailColumns"
              :table-data="invoiceMTable"
              :row-key="'uuid'"
              :pagination="false"
              :show-toolbar="false"
              :show-action-bar="false"
              :height="'200px'"
            >
              <template #annexName="{ row }">
                <div class="annex-cell">
                  <el-link
                    v-if="row.annexId"
                    type="primary"
                    :underline="'hover'"
                    @click="handleViewAnnex(row)"
                  >
                    {{ row.annexName || "查看附件" }}
                  </el-link>
                </div>
              </template>
              <template #actions="{ row }">
                <div class="actions-btn">
                  <el-button
                    link
                    type="primary"
                    :disabled="!(row.annexId && row.invoiceDs?.length)"
                    @click="detailInvoiceM(row)"
                  >
                    发票明细
                  </el-button>
                </div>
              </template>
            </base-table>
          </template>
          <template v-else>
            <editable-table
              ref="invoiceMTableRef"
              :row-key="'uuid'"
              :height="'200px'"
              v-model="invoiceMTable"
              :columns="invoiceMColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :editable="true"
            >
              <template #actionBar>
                <div class="actionBar-buttons">
                  <el-button
                    type="primary"
                    size="small"
                    @click="handleUploadInvoice"
                  >
                    上传发票
                  </el-button>
                </div>
              </template>

              <template #annexName="{ row }">
                <div class="annex-cell">
                  <el-link
                    v-if="row.annexId"
                    type="primary"
                    :underline="'hover'"
                    @click="handleViewAnnex(row)"
                  >
                    {{ row.annexName || "查看附件" }}
                  </el-link>
                </div>
              </template>

              <template #actions="{ row }">
                <div class="actions-btn">
                  <el-button
                    link
                    type="primary"
                    :disabled="!row.annexId"
                    @click="handleInspect(row)"
                  >
                    查验
                  </el-button>
                  <el-button
                    link
                    type="primary"
                    :disabled="!(row.annexId && row.invoiceDs?.length)"
                    @click="detailInvoiceM(row)"
                  >
                    发票明细
                  </el-button>
                  <el-button link type="danger" @click="deleteInvoiceM(row)">
                    删除
                  </el-button>
                </div>
              </template>
            </editable-table>
          </template>
        </div>

        <!-- 成本分摊 费用类型所属大类为建安类并且请款类型为正常请款0时显示  -->
        <CostAllocationCard
          :visible="isShowCostAllocation && formData.reqType == 0"
          :allocation-status="0"
          :warning-status="0"
          :bizType="'NCON_CST'"
          :projId="paymentData.projId"
          :bizBillId="paymentData.nconBillId"
        />

        <!-- 相关附件 -->
        <div class="item-card">
          <div class="section-title">相关附件</div>
          <el-form-item label="上传附件">
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
              @success="handleFileSuccess"
            ></base-upload>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <!-- 关联立项 弹窗 -->
    <CstProcessDialog
      v-model="processDialogVisible"
      :projId="formData.projId"
      :segId="formData.segId"
      @success="handleDemandSelect"
    />

    <!-- 成本分摊 弹窗 -->
    <CostAllocationDetailDialog v-model="costAllocationDialogVisible" />

    <!-- 上传发票弹窗 -->
    <UploadInvoiceDialog
      v-model="uploadVisibleDialog"
      @success="getAnnexFileList"
    />

    <!-- 发票明细 弹窗 -->
    <invoice-detail-dialog
      ref="invoiceDetailDialogRef"
      v-model="dialogVisible"
      :detailList="detailList"
      @success="handleInvoiceDetailSuccess"
    />

    <!-- 财务分摊 -->
    <FinanceAllocationDialog
      ref="financeAllocationDialogRef"
      v-model="financeAllocVisible"
      :payWayTable="payWayTable"
      :segId="formData.segId"
      :projId="formData.projId"
      :dialogMode="isDetail ? 'view' : 'edit'"
      @select="getFinaList"
    ></FinanceAllocationDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick, useTemplateRef } from "vue";
import {
  ElLoading,
  ElMessage,
  ElMessageBox,
  ElNotification,
} from "element-plus";
import EditableTable from "@/components/base/editable-table.vue";
import { EditableColumn } from "@/components/base/editable-table.vue";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { useTagsStore } from "@/stores/tags-store";
import { invoiceStatusEnum } from "@/constants/contract-manage/enums";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import BaseUpload from "@/components/base/base-upload.vue";
import InvoiceDetailDialog from "@/components/business/invoice-detail-dialog.vue";
import { commonApi } from "@/api/cost/common-api";
import { NconBillInvoiceM } from "@/types/cost/non-contract-manage/cst-payment-type.ts";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api.ts";
import { cstPaymentApi } from "@/api/cost/non-contract-manage/cst-payment-api.ts";
import CostAllocationDetailDialog from "@/views/cost/cost-allocation/cost-allocation-detail-dialog.vue";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api.ts";
import { useDict } from "@/composables/use-dict.ts";
import { dictMapping } from "@/utils/dict-mapping.ts";
import CstProcessDialog from "./cst-process-dialog.vue";
import { cstProcessApi } from "@/api/cost/non-contract-manage/cst-process-api.ts";
import { getEnumLabel, getEnumType } from "@/utils/enum.ts";
import { dateUtil } from "@/utils/date-util.ts";
import { buildFileUrl } from "@/utils/file-path-util.ts";
import UploadInvoiceDialog from "@/components/business/upload-invoice-dialog.vue";
import { buildTree } from "@/utils/tree.ts";
import BillHeader from "@/components/business/bill-components/bill-header.vue";
import BillInfo from "@/components/business/bill-components/bill-info.vue";
import CostAllocationCard from "@/views/cost/cost-allocation/cost-allocation-card.vue";
import FinanceAllocationDialog from "@/views/cost/finance-allocation/finance-allocation-dialog.vue";

defineOptions({ name: "cst-payment-form" });

interface Props {
  mode: "add" | "edit" | "detail";
  cstPaymentId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  cstPaymentId: undefined,
});

const emit = defineEmits<{
  (e: "success", data: any): void;
}>();

const router = useRouter();
const userStore = useUserStore();
const tagsStore = useTagsStore();

const mode = ref<"add" | "edit" | "detail">(props.mode);
const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");

const payTypeOptions = ref([]);
const dedTypeOptions = ref([]);
const cstProcessList = ref([]);
const paymentFormRef = ref();
const submitLoading = ref(false);
const segOptions = ref([]);
const feeTypeOptions = ref([]);
const feeTypeFlatOptions = ref([]);
const annexFileList = ref([]);
const uploadVisibleDialog = ref(false);
const financeAllocVisible = ref(false); // 财务分摊弹窗

const cstProcessData = ref({
  id: undefined,
  processName: undefined,
  processAmt: undefined,
  sumAppyAmt: undefined,
  sumOwedAmt: undefined,
  remark: undefined,
});
const billData = ref({
  id: undefined,
  bizTitle: "",
  bizNo: "",
  status: 0,
  bizItemCode: "NCON_CST", // 业务类型编码, NCON_PROC-非合同立项；NCON_CST-非合同建安支付； NCON_FEE-非合同费用支付
});
const paymentData = ref({
  id: undefined,
  segId: undefined,
  projId: undefined,
  nconBillId: undefined,
  status: 0,
  isLastRec: undefined,
});
const flowBaseData = ref(null);
const flowListData = ref({
  bizItemCode: "",
  wfFlowId: null,
  wfStatus: 0,
  wfTitle: "",
});

const initFormData = () => ({
  id: undefined,
  nconBillId: undefined,
  belongMonth: dateUtil().format("YYYY-MM"),
  finaTypeId: undefined,
  reqType: 0,
  isLastRec: 0,
  reqAmt: 0,
  factReqAmt: 0,
  reqDesc: "",
  invRecAmt: 0,
  invRcvdAmt: 0,
  invOweAmt: 0,
  bizTitle: "",
  segId: undefined,
  segName: "",
  segNo: "",
  deptName: "",
  mguName: "",
  projId: undefined,
  projName: "",
  compId: "",
  compName: "",
  userName: "",
  createDate: "",
});
const formData = ref(initFormData());

// 成本分摊相关
const costAllocationDialogVisible = ref(false);
const costAllocationData = ref(null);

// 费用类型所属大类是不是建安类
const isShowCostAllocation = computed(() => {
  // 如果没有选择费用类型，直接返回 false
  if (!formData.value.finaTypeId) return false;
  // 找到选择的费用类型
  const targetData = feeTypeFlatOptions.value.find(
    (item) => item.id === formData.value.finaTypeId,
  );
  if (!targetData) return false;
  // 找到费用类型所属大类
  const largeData = feeTypeFlatOptions.value.find(
    (item) => item.id === targetData.pid,
  );
  // 如果大类存在且 finaTypeCode === '03'（建安类），则显示成本分摊
  return !!(largeData && largeData.finaTypeCode === "03");
});

const { getDictList, getDictTree, loadDicts } = useDict(
  [dictMapping.payType, dictMapping.dedType],
  {
    treeDictCodes: [dictMapping.dedType],
  },
);

// 选择项目
const changeProject = async (value: number) => {
  // 清空关联立项信息（无论是否选择项目）,
  // 清空了关联立项信息也需要清除费用类型数据，建安支付的费用类型是通过关联立项带出的
  cstProcessData.value = {
    id: undefined,
    processName: undefined,
    processAmt: undefined,
    sumAppyAmt: undefined,
    sumOwedAmt: undefined,
    remark: undefined,
  };
  // 清除费用类型数据
  formData.value.finaTypeId = undefined;
  feeTypeOptions.value = [];
  feeTypeFlatOptions.value = [];

  if (value) {
    const res = await projectAreaApi.getInfoByProjId({ id: value });
    if (res.code === 200 && res.data) {
      const { compName, compId, segId, segName } = res.data;
      formData.value.compId = compId || "";
      formData.value.compName = compName || "";
      formData.value.segId = segId || "";
      formData.value.segName = segName || "";
      // formData.value.finaTypeId = undefined;
      // feeTypeOptions.value = [];
      // feeTypeFlatOptions.value = [];
      // getpayTypeOptions(segId);
    }
  } else {
    // 如果清空了项目选择，也清空相关字段
    formData.value.compId = "";
    formData.value.compName = "";
    formData.value.segId = "";
    formData.value.segName = "";
    // formData.value.finaTypeId = undefined;
    // feeTypeOptions.value = [];
    // feeTypeFlatOptions.value = [];
  }
};
// 获取费用类型
const getpayTypeOptions = async (segId: number) => {
  try {
    const res = await dictionaryApi.getCostTypeListBySegId({ segId: segId });
    if (res.code === 200) {
      feeTypeFlatOptions.value = res.data || [];
      feeTypeOptions.value = buildTree(res.data || []);
    }
  } catch (error) {}
};

const formRules = {
  bizTitle: [{ required: true, message: "请输入标题", trigger: "change" }],
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  finaTypeId: [
    { required: true, message: "请选择费用类型", trigger: "change" },
  ],
  belongMonth: [
    { required: true, message: "请选择所属月份", trigger: "change" },
  ],
  reqType: [{ required: true, message: "请选择请款类型", trigger: "change" }],
  reqAmt: [{ required: true, message: "请输入本次请款金额", trigger: "blur" }],
  factReqAmt: [
    { required: true, message: "请输入实际请款金额", trigger: "blur" },
  ],
  invRecAmt: [
    { required: true, message: "请输入应收发票金额", trigger: "blur" },
  ],
  invRcvdAmt: [
    { required: true, message: "请输入已收发票金额", trigger: "blur" },
  ],
  invOweAmt: [{ required: true, message: "请输入欠票金额", trigger: "blur" }],
};

const processDialogVisible = ref(false);
const changeProcess = () => {
  // 如果没有选择项目进行提示
  if (!formData.value.projId) {
    ElMessage.error("请先选择项目");
    return;
  }
  processDialogVisible.value = true;
};
// 立项选择
const handleDemandSelect = async (data) => {
  console.log("选择的立项数据", data);
  if (data && data.length > 0) {
    const [firstItem] = data;
    cstProcessData.value = firstItem;
    // 根据选择的立项数据，设置费用类型ID并且请求费率类型数据
    formData.value.finaTypeId = firstItem.finaTypeId;
    getpayTypeOptions(firstItem.segId);
    // 获取立项的累计请款金额、累计已请款金额、累计欠款金额
    try {
      const res = await cstPaymentApi.getAccumByProcessId({
        processId: cstProcessData.value.id,
      });
      if (res.code === 200 && res.data) {
        cstProcessData.value.processAmt = res.data.processAmt;
        cstProcessData.value.sumAppyAmt = res.data.sumAppyAmt;
        cstProcessData.value.sumOwedAmt = res.data.sumOwedAmt;
      }
    } catch (error) {}
    // 清空相关表格
    dedTable.value = [];
    payWayTable.value = [];
    invoiceMTable.value = [];
    formData.value.reqAmt = 0; // 清空本次请款金额
    // 默认添加一条支付方式
    addPayWay();
  }
};

const dedTable = ref([]);
const dedDetailColumns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "dedName", label: "事项名称", minWidth: 120 },
  { prop: "dedTypeName", label: "调整类型", minWidth: 120 },
  { prop: "dedAmt", label: "金额", minWidth: 120 },
  { prop: "dedDesc", label: "说明", minWidth: 120 },
];

const dedColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "dedName",
    label: "事项名称",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "dedTypeId",
    label: "调整类型",
    editable: true,
    editType: "cascader",
    showOverflowTooltip: false,
    optionLabelField: "dicLabel",
    optionValueField: "id",
    options: dedTypeOptions.value || [],
    showAllLevels: false,
    cascaderProps: {
      children: "children",
      label: "dicLabel",
      value: "id",
      emitPath: false,
      showAllLevels: false,
      checkStrictly: false,
    },
  },
  {
    prop: "dedAmt",
    label: "金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    showSummary: true,
    min: -999999999,
    max: 999999999,
  },
  {
    prop: "dedDesc",
    label: "说明",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    width: 150,
    slot: "actions",
    fixed: "right",
  },
]);

const handleAddDed = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: undefined,
    srcType: "NCON_CST",
    nconBillId: undefined,
    dedName: "",
    dedAmt: 0,
    dedTypeId: undefined,
    dedDesc: "",
  };
  dedTable.value = [...dedTable.value, newRowData];
};

const handleDeleteDed = (row) => {
  dedTable.value = dedTable.value.filter((item) => item.uuid !== row.uuid);
};

const updateDedRow = (rowIndex: number, data: any) => {
  const newData = [...dedTable.value];
  newData[rowIndex] = { ...dedTable.value[rowIndex], ...data };
  dedTable.value = newData;
};

const handleDedSave = async ({ row, column, newValue, oldValue, rowIndex }) => {
  if (column === "dedTypeId") {
    updateDedRow(rowIndex, { dedTypeId: newValue, dedAmt: 0 });
    return;
  }
  if (column === "dedAmt") {
    const targetData = dedTypeOptions.value?.find(
      (item) => item.id == row.dedTypeId,
    );
    if (targetData) {
      if (targetData.dicValue == "1") {
        if (newValue <= 0) {
          ElMessage.error("调增金额必须为正数");
          updateDedRow(rowIndex, { dedAmt: 0 });
          return;
        }
      } else {
        if (newValue >= 0) {
          ElMessage.error("扣款金额必须为负数");
          updateDedRow(rowIndex, { dedAmt: 0 });
          return;
        }
      }
    }
  }
  updateDedRow(rowIndex, { [column]: newValue });
};

const invoiceMTable = ref([]);
const invoiceMDetailColumns = [
  { type: "index", label: "序号", width: 60 },
  {
    // 发票状态（0=待查验 1=合格发票 2=待人工审核 3=人工通过 4=人工拒绝）
    prop: "status",
    label: "发票状态",
    width: 120,
    editable: false,
    formatter: (row) => {
      const target = getEnumLabel(invoiceStatusEnum, row?.status || 0);
      return target || "--";
    },
  },
  {
    prop: "isValid",
    label: "查验真假",
    width: 120,
    editable: false,
    formatter: (row) => (row.isValid ? "真发票" : "假发票"),
  },
  {
    prop: "isRepeat",
    label: "是否重复",
    width: 90,
    formatter: (row) => (row.isRepeat ? "是" : "否"),
  },
  { prop: "validateMsg", label: "查验结果", minWidth: 120 },

  { prop: "invNo", label: "发票号", minWidth: 120 },
  { prop: "invDate", label: "开票日期", minWidth: 120 },
  { prop: "totalAmt", label: "发票总金额", minWidth: 120 },
  { prop: "notTaxAmt", label: "不含税金额", minWidth: 120 },
  { prop: "taxAmt", label: "税额", minWidth: 120 },
  { prop: "invType", label: "发票类型", minWidth: 120 },
  { slot: "annexName", label: "发票附件", minWidth: 200 },
  { label: "操作", slot: "actions", width: 180, fixed: "right" },
];

const invoiceMColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    // 发票状态（0=待查验 1=合格发票 2=待人工审核 3=人工通过 4=人工拒绝）
    prop: "status",
    label: "发票状态",
    width: 120,
    editable: false,
    formatter: (row) => {
      const target = getEnumLabel(invoiceStatusEnum, row?.status || 0);
      return target || "--";
    },
  },
  {
    prop: "isValid",
    label: "查验真假",
    width: 120,
    editable: false,
    formatter: (row) => (row.isValid ? "真发票" : "假发票"),
  },
  {
    prop: "isRepeat",
    label: "是否重复",
    width: 90,
    editable: false,
    formatter: (row) => (row.isRepeat ? "是" : "否"),
  },
  {
    prop: "validateMsg",
    label: "查验结果",
    width: 120,
    editable: false,
  },

  {
    prop: "invNo",
    label: "发票号",
    editable: false,
    editType: "input",
    minWidth: 150,
    showOverflowTooltip: false,
  },
  {
    prop: "invDate",
    label: "开票日期",
    editable: false,
    editType: "date",
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "totalAmt",
    label: "发票总金额",
    editable: false,
    editType: "number",
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "notTaxAmt",
    label: "不含税金额",
    editable: false,
    editType: "number",
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "taxAmt",
    label: "税额",
    editable: false,
    editType: "number",
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "invType",
    label: "发票类型",
    editable: false,
    editType: "input",
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    slot: "annexName",
    label: "发票附件",
    editable: false,
    editType: "input",
    minWidth: 200,
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    slot: "actions",
    width: 240,
    fixed: "right",
  },
]);

const handleViewAnnex = async (row: any) => {
  if (!row.annexId) {
    ElMessage.warning("该附件不存在");
    return;
  }
  try {
    const res = await commonApi.getFileList({ annexId: row.annexId });
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

const handleUploadInvoice = async () => {
  uploadVisibleDialog.value = true;
};

const getAnnexFileList = async (fileList: any) => {
  console.log("上传的发票", fileList);
  if (fileList && fileList.length > 0) {
    // 使用通知提示
    const notify = ElNotification({
      title: "发票识别中",
      message: `正在识别 ${fileList.length} 张发票，请稍候...`,
      type: "info",
      duration: 0, // 不自动关闭
      position: "top-right",
    });
    try {
      await batchInvoiceRecognition(fileList);
      // 关闭通知并显示成功
      notify.close();
      ElNotification({
        title: "识别完成",
        message: `成功识别 ${fileList.length} 张发票！`,
        type: "success",
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      ElMessage.error("发票识别失败");
    } finally {
      notify.close();
    }
  }
};

const batchInvoiceRecognition = async (invoiceDataList: any[]) => {
  const recognitionPromises = invoiceDataList.map(async (item) => {
    return await invoiceRecognition(item.id, item.annexName);
  });

  try {
    const results: any = await Promise.allSettled(recognitionPromises);
    console.log("识别结果List", results);

    if (results && results.length > 0) {
      const newData = results.map((result, index) => {
        if (result.status === "fulfilled") {
          return {
            ...result.value,
            uuid: uuidv4(),
            id: undefined,
            srcType: "NCON_CST",
            nconBillId: undefined,
          };
        } else {
          const originalItem = invoiceDataList[index];
          return {
            annexId: originalItem.id,
            annexName: originalItem.annexName,
            uuid: uuidv4(),
            id: undefined,
            srcType: "NCON_CST",
            nconBillId: undefined,
            invNo: undefined,
            invDate: undefined,
            totalAmt: 0,
            notTaxAmt: 0,
            taxAmt: 0,
            invType: "",
            invoiceDs: [],
          };
        }
      });
      invoiceMTable.value = [...invoiceMTable.value, ...newData];
    } else {
      const fallbackData = invoiceDataList.map((item) => ({
        annexId: item.id,
        annexName: item.annexName,
        uuid: uuidv4(),
        id: undefined,
        srcType: "NCON_CST",
        nconBillId: undefined,
        invNo: undefined,
        invDate: undefined,
        totalAmt: 0,
        notTaxAmt: 0,
        taxAmt: 0,
        invType: "",
        invoiceDs: [],
      }));
      invoiceMTable.value = [...invoiceMTable.value, ...fallbackData];
    }
  } catch (error) {
    console.error("批量识别发票失败:", error);
    const fallbackData = invoiceDataList.map((item) => ({
      annexId: item.id,
      annexName: item.annexName,
      uuid: uuidv4(),
      id: undefined,
      srcType: "NCON_CST",
      nconBillId: undefined,
      invNo: undefined,
      invDate: undefined,
      totalAmt: 0,
      notTaxAmt: 0,
      taxAmt: 0,
      invType: "",
      invoiceDs: [],
    }));
    invoiceMTable.value = [...invoiceMTable.value, ...fallbackData];
  }
};

const invoiceRecognition = async (annexId: number, annexName: string) => {
  try {
    const res = await commonApi.recognizeAndCheckInvoice({ annexId: annexId });
    console.log("识别查验结果", res);
    if (res.code === 200 && res.data) {
      const { checkData, finalData, recognizeData } = res.data;
      if (finalData) {
        let detailListData = [];
        if (finalData.InvoiceProducts && finalData.InvoiceProducts.length > 0) {
          finalData.InvoiceProducts.forEach((item: any) => {
            detailListData.push({
              itemName: item.Name,
              size: item.SpecModel,
              unit: item.MeasureUnit,
              num: item.Qty,
              price: item.Price,
              totalAmt: item.Amount,
              taxRate: item.TaxRate,
              taxAmt: item.TaxPrice,
            });
          });
        }
        /**
         * finalData.InvoiceValidate == 1 为真发票，status为1
         * finalData.InvoiceValidate == 0 为假发票，status为0
         */
        const newData = {
          annexId: annexId,
          annexName: annexName,
          invNo: finalData.InvoiceNumber,
          invDate: finalData.InvoiceDate,
          totalAmt: finalData.Amount,
          notTaxAmt: finalData.TotalPrice,
          taxAmt: finalData.TotalTaxPrice,
          invType: finalData.InvoiceCategoryName,
          buyerCompany: finalData.BuyerCompany,
          buyerTaxCode: finalData.BuyerTaxCode,
          sellerCompany: finalData.InvoiceCompany,
          sellerTaxCode: finalData.TaxpayerCode,
          isValid: finalData.InvoiceValidate == 1 ? true : false,
          validateMsg: finalData.ValidateMsg,
          ocrRes: recognizeData ? JSON.stringify(recognizeData) : "",
          validateRes: checkData ? JSON.stringify(checkData) : "",
          status:
            finalData.InvoiceValidate == 1
              ? 1
              : finalData.InvoiceValidate == 0
                ? 2
                : 0,
          invoiceDs: detailListData,
        };
        return newData;
      } else {
        return {
          annexId: annexId,
          annexName: annexName,
          invoiceDs: [],
        };
      }
    } else {
      return {
        annexId: annexId,
        annexName: annexName,
        invoiceDs: [],
      };
    }
  } catch (error) {
    return {
      annexId: annexId,
      annexName: annexName,
      invoiceDs: [],
    };
  }
};
// 查验
const handleInspect = async (row: any) => {
  if (!row.annexId) {
    ElMessage.warning("暂无发票！");
    return;
  }
  const notify = ElNotification({
    title: "发票查验中",
    message: "正在查验发票，请稍候...",
    type: "info",
    duration: 0,
    position: "top-right",
  });
  try {
    const res = await commonApi.recognizeAndCheckInvoice({
      annexId: row.annexId,
    });
    notify.close();
    console.log("识别查验结果", res);
    if (res.code === 200 && res.data) {
      const { checkData, finalData, recognizeData } = res.data;
      if (finalData) {
        const recogniRowIndex = invoiceMTable.value.findIndex(
          (item) => item.uuid == row.uuid,
        );
        let detailListData = [];
        if (finalData.InvoiceProducts && finalData.InvoiceProducts.length > 0) {
          finalData.InvoiceProducts.forEach((item: any) => {
            detailListData.push({
              itemName: item.Name,
              size: item.SpecModel,
              unit: item.MeasureUnit,
              num: item.Qty,
              price: item.Price,
              totalAmt: item.Amount,
              taxRate: item.TaxRate,
              taxAmt: item.TaxPrice,
            });
          });
        }
        const newData = {
          annexId: row.annexId,
          annexName: row.annexName,
          invNo: finalData.InvoiceNumber,
          invDate: finalData.InvoiceDate,
          totalAmt: finalData.Amount,
          notTaxAmt: finalData.TotalPrice,
          taxAmt: finalData.TotalTaxPrice,
          invType: finalData.InvoiceCategoryName,
          buyerCompany: finalData.BuyerCompany,
          buyerTaxCode: finalData.BuyerTaxCode,
          sellerCompany: finalData.InvoiceCompany,
          sellerTaxCode: finalData.TaxpayerCode,
          isValid: finalData.InvoiceValidate == 1 ? true : false,
          validateMsg: finalData.ValidateMsg,
          ocrRes: recognizeData ? JSON.stringify(recognizeData) : "",
          validateRes: checkData ? JSON.stringify(checkData) : "",
          status:
            finalData.InvoiceValidate == 1
              ? 1
              : finalData.InvoiceValidate == 0
                ? 2
                : 0,
          invoiceDs: detailListData,
        };
        updateRow(recogniRowIndex, newData);

        ElNotification({
          title: "查验成功",
          message: "已查验到发票相关信息",
          type: "success",
          duration: 3000,
          position: "top-right",
        });
      }
    }
  } catch (error) {
  } finally {
    notify.close();
  }
};

const dialogVisible = ref(false);
const detailList = ref([]);

const updateRow = (rowIndex: number, data: any) => {
  Object.assign(invoiceMTable.value[rowIndex], data);
  invoiceMTable.value = [...invoiceMTable.value];
};

const detailInvoiceM = (row) => {
  detailList.value = row.invoiceDs || [];
  dialogVisible.value = true;
};

const handleInvoiceDetailSuccess = (data) => {
  console.log("发票明细数据", data);
  if (data && data.length > 0) {
    const currInvoiceD = data[0];
    const recogniRowIndex = invoiceMTable.value.findIndex(
      (item) => item.id == currInvoiceD.invMid,
    );
    if (recogniRowIndex !== -1) {
      updateRow(recogniRowIndex, { invoiceDs: data });
    }
  }
};

const deleteInvoiceM = ({ uuid }) => {
  invoiceMTable.value = invoiceMTable.value.filter(
    (item) => item.uuid !== uuid,
  );
};

const payWayTable = ref([]);
const payWayDetailColumns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "payDesc", label: "摘要", minWidth: 200 },
  { prop: "payWayName", label: "付款方式", minWidth: 150 },
  { prop: "bankName", label: "收款开户行", minWidth: 150 },
  { prop: "accountName", label: "收款账户名", minWidth: 150 },
  { prop: "bankAccount", label: "收款账号", minWidth: 150 },
  { prop: "payAmt", label: "付款金额", minWidth: 120 },
  { prop: "dedRoomAmt", label: "其中抵房金额", minWidth: 120 },
];

const payWayColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "payWayId",
    label: "付款方式",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "dicLabel",
    optionValueField: "id",
    minWidth: 150,
    options: payTypeOptions.value || [],
  },
  {
    prop: "bankName",
    label: "收款开户行",
    editable: true,
    editType: "input",
    minWidth: 150,
    showOverflowTooltip: false,
  },
  {
    prop: "accountName",
    label: "收款账户名",
    editable: true,
    editType: "input",
    minWidth: 150,
    showOverflowTooltip: false,
  },
  {
    prop: "bankAccount",
    label: "收款账号",
    editable: true,
    editType: "input",
    minWidth: 150,
    showOverflowTooltip: false,
  },
  {
    prop: "payAmt",
    label: "付款金额",
    editable: true,
    editType: "number",
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "dedRoomAmt",
    label: "其中抵房金额",
    editable: true,
    editType: "number",
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "payDesc",
    label: "事项说明",
    editable: true,
    editType: "input",
    minWidth: 200,
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    slot: "actions",
    fixed: "right",
    width: 100,
  },
]);
const getFinaList = (data) => {
  console.log("获取的财务分摊数据", data);
  payWayTable.value = data || [];
};
const handleFinanceAlloc = () => {
  if (!formData.value.segId) {
    ElMessage.error("请先选择项目");
    return;
  }
  if (payWayTable.value.length > 0) {
    financeAllocVisible.value = true;
  } else {
    ElMessage.error("请先添加付款方式");
  }
};
const addPayWay = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: undefined,
    srcType: "NCON_CST",
    nconBillId: undefined,
    payWayId: 2066, // 默认为“转账”
    bankName: "",
    accountName: "",
    bankAccount: "",
    payAmt: 0,
    dedRoomAmt: 0,
    payDesc: cstProcessData.value.processName || "",
  };
  payWayTable.value = [...payWayTable.value, newRowData];
};

const deletePayWay = (row) => {
  payWayTable.value = payWayTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

const updatePayWayRow = (rowIndex: number, data: any) => {
  const newData = [...payWayTable.value];
  newData[rowIndex] = { ...payWayTable.value[rowIndex], ...data };
  payWayTable.value = newData;
};

const handlePayWaySave = async (data) => {
  const { row, column, newValue, oldValue, rowIndex } = data;
  // 修改“其中抵房金额”不能大于付款金额
  if (column === "dedRoomAmt") {
    // 如果新值大于付款金额，提示错误并重置为0
    if (newValue > row.payAmt) {
      ElMessage.error("其中抵房金额不能大于付款金额");
      updatePayWayRow(rowIndex, { dedRoomAmt: 0 });
      return;
    } else {
      updatePayWayRow(rowIndex, { [column]: newValue });
      return;
    }
  }
  updatePayWayRow(rowIndex, { [column]: newValue });
};

const projectOptions = ref([]);
// 获取项目数据
const getProjectOptions = async () => {
  try {
    const res = await projectAreaApi.getSegMguProjList();
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};
// 获取业务板块数据
const getSegOptions = async () => {
  try {
    const res = await dictionaryApi.getsegmentList({ isAuth: true });
    if (res.code === 200) {
      segOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取业务板块列表失败:", error);
  }
};

// 加载成本分摊数据
const loadCostAllocation = async () => {
  if (!paymentData.value.id) return;
  try {
    // 获取成本分摊数据的接口
  } catch (error) {
    console.error("获取成本分摊数据失败:", error);
  }
};

const loadDetail = async () => {
  if (!props.cstPaymentId) return;
  const res = await cstPaymentApi.getCstPaymentDetail({
    id: props.cstPaymentId,
    isWithFlow: true,
  });
  if (res.code === 200 && res.data) {
    backfillData(res.data);
  }
};

const backfillData = async (data) => {
  const {
    payment,
    payWays,
    invoiceMs,
    deds,
    costAllocs,
    finaDs,
    annexList,
    flowBase,
    bill,
    flowList,
  } = data;

  if (payment) {
    Object.assign(formData.value, payment);
    if (payment.processId) {
      cstProcessData.value.id = payment.processId;
      cstProcessData.value.processAmt = payment.processAmt;
      const process = cstProcessList.value.find(
        (item) => item.id === payment.processId,
      );
      if (process) {
        cstProcessData.value.id = process.id;
        cstProcessData.value.processName = process.processName;
        cstProcessData.value.processAmt = payment.processAmt;
        cstProcessData.value.sumAppyAmt = payment.sumAppyAmt;
        cstProcessData.value.sumOwedAmt = payment.sumOwedAmt;
        cstProcessData.value.remark = process.remark;
      }
    }
  }

  if (annexList?.length) {
    annexFileList.value = annexList.map((item: any) => ({
      ...item,
      name: item.annexName,
      url: item.annexPath,
    }));
  }

  billData.value = { ...billData.value, ...bill };
  paymentData.value = { ...paymentData.value, ...payment };
  flowBaseData.value = { ...flowBaseData.value, ...flowBase };
  flowListData.value = { ...flowListData.value, ...flowList };

  if (payment.segId) {
    getpayTypeOptions(payment.segId);
  }

  formData.value.bizTitle = bill.bizTitle || "";
  formData.value.segId = flowBase.segId || undefined;
  formData.value.segName = flowBase.segName || undefined;
  formData.value.segNo = flowBase.segNo || undefined;
  formData.value.deptName = flowBase.deptName || undefined;
  formData.value.mguName = flowBase.mguName || undefined;
  formData.value.projId = flowBase.projId || undefined;
  formData.value.projName = flowBase.projName || undefined;
  formData.value.compId = flowBase.compId || undefined;
  formData.value.compName = flowBase.compName || undefined;
  formData.value.userName = flowBase.userName || undefined;
  formData.value.createDate = bill.createDate || "";
  formData.value.isLastRec = payment.isLastRec ? 1 : 0;

  const mapWithUuid = <T,>(items: T[] = []) =>
    items.map((item) => ({ ...item, uuid: uuidv4() }));

  payWayTable.value = mapWithUuid(payWays);
  dedTable.value = mapWithUuid(deds);

  // 回填成本分摊数据
  if (costAllocs && costAllocs.length > 0) {
    costAllocationData.value = costAllocs[0];
  }

  if (invoiceMs?.length) {
    invoiceMTable.value = invoiceMs.map((item: NconBillInvoiceM) => {
      return {
        ...item,
        uuid: uuidv4(),
      };
    });
  } else {
    invoiceMTable.value = [];
  }
};

const buildSaveParams = () => {
  const bill = {
    ...billData.value,
    id: billData.value.id || undefined,
    bizTitle: formData.value.bizTitle,
    bizItemCode: "NCON_CST", // 业务类型编码, NCON_PROC-非合同立项；NCON_CST-非合同建安支付； NCON_FEE-非合同费用支付
    segId: formData.value.segId,
    segName: formData.value.segName,
    segNo: formData.value.segNo,
    projId: formData.value.projId,
    projName: formData.value.projName,
    compId: formData.value.compId,
    compName: formData.value.compName,
  };

  const payment = {
    id: paymentData.value.id || undefined,
    nconBillId: formData.value.nconBillId,
    segId: formData.value.segId,
    projId: formData.value.projId,
    belongMonth: formData.value.belongMonth,
    finaTypeId: formData.value.finaTypeId,
    reqType: formData.value.reqType,
    reqAmt: formData.value.reqAmt,
    factReqAmt: formData.value.factReqAmt,
    reqDesc: formData.value.reqDesc,
    invRecAmt: formData.value.invRecAmt,
    invRcvdAmt: formData.value.invRcvdAmt,
    invOweAmt: formData.value.invOweAmt,
    isLastRec: formData.value.isLastRec,
    processId: cstProcessData.value.id,
    processAmt: cstProcessData.value.processAmt,
    sumAppyAmt: cstProcessData.value.sumAppyAmt,
    sumOwedAmt: cstProcessData.value.sumOwedAmt,
  };

  // 如果是来票冲账  deds 和 payWays 传空数组
  const isCreditInvoice = formData.value.reqType === 1;

  const deds = isCreditInvoice
    ? []
    : dedTable.value.map((item) => ({
        id: item.id,
        srcType: item.srcType,
        nconBillId: item.nconBillId,
        dedName: item.dedName || "",
        dedAmt: item.dedAmt || 0,
        dedTypeId: item.dedTypeId,
        dedDesc: item.dedDesc || "",
      }));

  const invoiceMs: NconBillInvoiceM[] = [];
  invoiceMTable.value.forEach((item) => {
    if (item.annexId) {
      const invM = {
        id: item.id,
        nconBillId: item.nconBillId,
        srcType: item.srcType,
        invNo: item.invNo || "",
        invDate: item.invDate ? `${item.invDate} 00:00:00` : "",
        totalAmt: item.totalAmt || 0,
        notTaxAmt: item.notTaxAmt || 0,
        taxAmt: item.taxAmt || 0,
        invType: item.invType || "",
        annexId: item.annexId,
        invoiceDs: item.invoiceDs || [],
        // ✅ 补充查验相关字段
        isValid: item.isValid ?? false,
        validateMsg: item.validateMsg || "",
        ocrRes: item.ocrRes || "",
        validateRes: item.validateRes || "",
        status: item.status ?? 0,
        buyerCompany: item.buyerCompany || "",
        buyerTaxCode: item.buyerTaxCode || "",
        sellerCompany: item.sellerCompany || "",
        sellerTaxCode: item.sellerTaxCode || "",
      };
      invoiceMs.push(invM);
    }
  });

  const payWays = isCreditInvoice
    ? []
    : payWayTable.value.map((item) => ({
        id: item.id,
        srcType: item.srcType,
        nconBillId: item.nconBillId,
        payWayId: item.payWayId || "",
        payAmt: item.payAmt || 0,
        dedRoomAmt: item.dedRoomAmt || 0,
        payDesc: item.payDesc || "",
        bankName: item.bankName || "",
        accountName: item.accountName || "",
        bankAccount: item.bankAccount || "",
      }));

  return {
    bill: bill,
    payment: payment,
    deds: deds.length > 0 ? deds : [],
    invoiceMs: invoiceMs.length > 0 ? invoiceMs : [],
    payWays: payWays.length > 0 ? payWays : [],
    finaDs: [], // 财务分摊
    costAllocs: [], // 成本分摊
    annexList: annexFileList.value || [],
  };
};

const goBack = () => {
  if (isAdd.value) {
    tagsStore.closeTagByPath("/ncon/cst-payment/add");
  }
  if (isEdit.value) {
    tagsStore.closeTagByPath("/ncon/cst-payment/edit");
  }
  router.go(-1);
};

const validateData = () => {
  // 如果是来票冲账，跳过款项调整和支付方式的校验，但是发票登记必填一条数据
  if (formData.value.reqType === 1) {
    if (!invoiceMTable.value || invoiceMTable.value.length === 0) {
      ElMessage.error("来票冲账必须填写至少一条发票登记信息");
      return false;
    }
    return true;
  }

  // 校验扣款事项明细
  if (dedTable.value && dedTable.value.length > 0) {
    for (const item of dedTable.value) {
      if (!item.dedName || item.dedName.trim() === "") {
        ElMessage.error("扣款事项名称为必填项，请完善后提交");
        return false;
      }
      if (!item.dedTypeId) {
        ElMessage.error("扣款类型为必填项，请完善后提交");
        return false;
      }
      if (!item.dedAmt || Number(item.dedAmt) === 0) {
        ElMessage.error("扣款金额不能为0，请完善后提交");
        return false;
      }
    }
  }

  // 校验支付方式金额合计必须等于实际请款金额
  const totalPay = totalPayAmt.value;
  const actualAmt = actualReqAmt.value;
  if (Math.abs(totalPay - actualAmt) > 0.01) {
    ElMessage.error(
      `支付方式付款金额合计(${totalPay.toFixed(2)})必须等于实际请款金额(${actualAmt.toFixed(2)})`,
    );
    return false;
  }

  // 校验支付方式
  for (const item of payWayTable.value) {
    if (!item.payDesc) {
      ElMessage.error("请填写支付摘要");
      return false;
    }
    if (!item.payWayId) {
      ElMessage.error("请选择付款方式");
      return false;
    }
    if (!item.payAmt || Number(item.payAmt) <= 0) {
      ElMessage.error("付款金额必须大于0");
      return false;
    }
    if (!item.bankName) {
      ElMessage.error("请填写收款开户行");
      return false;
    }
    if (!item.accountName) {
      ElMessage.error("请填写收款账户名");
      return false;
    }
    if (!item.bankAccount) {
      ElMessage.error("请填写收款账号");
      return false;
    }
  }

  // ========== 校验：本次请款金额 <= 剩余金额 ==========
  const reqAmt = formData.value.reqAmt || 0;
  const owedAmt = cstProcessData.value.sumOwedAmt || 0;

  // 只有当选择了关联立项且剩余金额存在时才校验
  if (cstProcessData.value.id && owedAmt > 0) {
    if (reqAmt > owedAmt) {
      ElMessage.error(`本次请款金额不能大于剩余金额，请调整请款金额！`);
      return false;
    }
  }

  return true;
};
// 保存时选择的关联立项对应的金额是否有变化
const getProcessData = async () => {
  if (!cstProcessData.value.id) return;
  try {
    const res = await cstPaymentApi.getAccumByProcessId({
      processId: cstProcessData.value.id,
    });
    if (res.code === 200 && res.data) {
      cstProcessData.value.processAmt = res.data.processAmt;
      cstProcessData.value.sumAppyAmt = res.data.sumAppyAmt;
      cstProcessData.value.sumOwedAmt = res.data.sumOwedAmt;
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

const handleSave = async () => {
  paymentFormRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      ElMessage.error("请检查表单！");
      return;
    }
    if (!cstProcessData.value.id) {
      ElMessage.error("请选择关联立项！");
      return;
    }
    // 获取选中的立项数据对应的金额信息
    const isDataLoaded = await getProcessData();
    if (!isDataLoaded) return;

    if (!validateData()) {
      return;
    }

    submitLoading.value = true;
    const params = buildSaveParams();
    console.log("保存参数", params);
    try {
      const res = await cstPaymentApi.saveCstPayment(params);
      if (res.code === 200 && res.data) {
        paymentData.value.id = res.data;
        // 保存成功后加载成本分摊数据
        await loadCostAllocation();
        ElMessage.success("保存成功");
      }
    } catch (error) {
    } finally {
      submitLoading.value = false;
    }
  });
};

const handleSubmit = async () => {
  paymentFormRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      ElMessage.error("请检查表单！");
      return;
    }
    if (!cstProcessData.value.id) {
      ElMessage.error("请选择关联立项！");
      return;
    }
    // 获取选中的立项数据对应的金额信息
    const isDataLoaded = await getProcessData();
    if (!isDataLoaded) return;

    if (!validateData()) {
      return;
    }

    const params = buildSaveParams();
    console.log("提交参数", params);
    try {
      submitLoading.value = true;
      const res = await cstPaymentApi.submitCstPayment(params);
      if (res.code === 200 && res.data) {
        ElMessage.success("提交成功,已发起审批！");
        const redirectRes = await commonApi.generateRedirectUrl({
          oaRequestId: res.data,
        });
        goBack();
        if (redirectRes.code === 200 && redirectRes.data) {
          setTimeout(() => {
            window.open(redirectRes.data, "_blank");
          }, 800);
        }
      }
    } catch (error) {
    } finally {
      submitLoading.value = false;
    }
  });
};

const handleDelete = async () => {
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await cstPaymentApi.delCstPayment({ id: props.cstPaymentId });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        goBack();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  });
};

const handleCancel = async () => {
  ElMessageBox.confirm("确定要作废吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await cstPaymentApi.voidCstPayment({
        id: props.cstPaymentId,
      });
      if (res.code === 200) {
        ElMessage.success("作废成功");
        goBack();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  });
};

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

const getCstProcessList = async () => {
  try {
    const res = await cstProcessApi.getCstProcessList();
    if (res.code === 200) {
      cstProcessList.value = res.data || [];
    }
  } catch (error) {}
};

const handleFileSuccess = (file: any) => {
  console.log("相关附件上传成功", file);
  annexFileList.value.push(file);
};

const initDictData = async () => {
  await loadDicts();
  payTypeOptions.value = getDictList(dictMapping.payType);
  dedTypeOptions.value = getDictList(dictMapping.dedType);
};

// 1. 实际请款金额 = 本次请款金额 + 扣款金额汇总
const actualReqAmt = computed(() => {
  const reqAmt = formData.value.reqAmt || 0;
  const totalDedAmt = dedTable.value.reduce((sum, item) => {
    return sum + (Number(item.dedAmt) || 0);
  }, 0);
  return totalDedAmt + reqAmt;
});

// 2. 已收发票金额 = 发票列表发票总金额汇总
const receivedInvoiceAmt = computed(() => {
  return invoiceMTable.value.reduce((sum, item) => {
    return sum + (Number(item.totalAmt) || 0);
  }, 0);
});

// 3. 应收发票金额 = 实际请款金额
const receivableInvoiceAmt = computed(() => {
  return actualReqAmt.value;
});

// 4. 欠票金额 = 应收发票金额 - 已收发票金额
const oweInvoiceAmt = computed(() => {
  return receivableInvoiceAmt.value - receivedInvoiceAmt.value;
});

// 5. 支付方式付款金额合计
const totalPayAmt = computed(() => {
  return payWayTable.value.reduce((sum, item) => {
    return sum + (Number(item.payAmt) || 0);
  }, 0);
});

// 判断是否显示款项调整和支付方式模块（来票冲账时不显示）
const showDeductionAndPayWay = computed(() => {
  return formData.value.reqType !== 1; // 1 为来票冲账
});

// 监听实际请款金额变化，更新表单字段
watch(
  actualReqAmt,
  (newVal) => {
    formData.value.factReqAmt = Number(newVal.toFixed(2));
    formData.value.invRecAmt = Number(newVal.toFixed(2));
    formData.value.invOweAmt = Number(oweInvoiceAmt.value.toFixed(2));
  },
  { immediate: true },
);

// 监听已收发票金额变化，更新欠票金额
watch(
  receivedInvoiceAmt,
  () => {
    formData.value.invRcvdAmt = Number(receivedInvoiceAmt.value.toFixed(2));
    formData.value.invOweAmt = Number(oweInvoiceAmt.value.toFixed(2));
  },
  { immediate: true },
);

// 监听实际请款金额变化，如果只有一条支付方式则自动更新付款金额，付款金额=实际请款金额
watch(
  actualReqAmt,
  (newVal) => {
    if (payWayTable.value.length === 1) {
      payWayTable.value[0].payAmt = newVal;
      payWayTable.value = [...payWayTable.value];
    }
  },
  { immediate: true },
);

// 监听请款类型变化
watch(
  () => formData.value.reqType,
  (newVal) => {
    if (newVal == 1) {
      // 选择来票冲账：清空款项调整和支付方式数据
      dedTable.value = [];
      payWayTable.value = [];
      if (isEdit.value) {
        // 编辑模式下，请款类型选择来票冲账时，是否最后一笔默认为上一次的值
        formData.value.isLastRec = paymentData.value.isLastRec ? 1 : 0;
      }
    } else {
      // 正常请款：如果没有支付方式，默认添加一条
      if (payWayTable.value.length === 0) {
        addPayWay();
      }
    }
  },
);

onMounted(async () => {
  await initDictData();
  await getCstProcessList();
  await getProjectOptions();
  await getSegOptions();
  formData.value.userName = userStore.userInfo?.empName || "";
  formData.value.createDate = dateUtil().format("YYYY-MM-DD");
  formData.value.belongMonth = dateUtil().format("YYYY-MM-DD");
  if (props.mode === "add") {
    initFormData();
    setTimeout(() => {
      addPayWay();
    });
  } else {
    await loadDetail();
    // 加载成本分摊数据
    await loadCostAllocation();
  }
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

.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 15px 15px 30px;
  box-sizing: border-box;
  .adapt-form {
    width: 100%;
    margin: 0 auto;
  }
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

.actions-btn {
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.deduction-summary {
  padding: 10px 15px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  background: #f5f7fa;
  border-radius: 4px;
  span {
    color: #f56c6c;
    font-size: 18px;
  }
}

.pay-summary {
  padding: 10px 15px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  background: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
  span {
    color: #f56c6c;
    font-size: 18px;
  }
  .pay-error {
    color: #f56c6c;
    font-size: 14px;
    font-weight: normal;
  }
  .pay-success {
    color: #67c23a;
    font-size: 14px;
    font-weight: normal;
  }
}
</style>
