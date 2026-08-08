<!-- 签证管理 -->
<template>
  <div class="basic-form-content">
    <!-- ============ 顶部操作栏 ============ -->
    <BillHeader
      :title="'签证审批'"
      :contract-no="billData.bizNo || ''"
      :submitter="formData.userName || ''"
      :submit-time="formData.createDate || ''"
      :status="billData.status || 0"
      :show-status="true"
      :button-loading="submitLoading"
      :save-disabled="isReadonly"
      :submit-disabled="isReadonly"
      :delete-disabled="isDetail || isAdd || !!billData.status"
      :void-disabled="isDetail || isAdd || !!billData.status"
      :view-disabled="isAdd"
      @save="handleFormDataSave"
      @submit="handleFormDataSubmit"
      @delete="handleDelete"
      @void="handleCancel"
      @viewFlow="handleViewProcess"
    />

    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :disabled="isReadonly"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="adapt-form"
      >
        <!-- ====== 卡片1：单据信息 ====== -->
        <BillInfo
          v-model="formData"
          :status="billData?.status || 0"
          :disabled="isReadonly"
          :project-options="projectOptions"
          @project-change="changeProject"
        />

        <!-- ====== 卡片2：变更信息 ====== -->
        <FormCard
          id="card-change"
          icon="📄"
          title="变更信息"
          v-model:collapsed="collapsedCards.basic"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="合同名称" prop="conId" required>
                <PickInput
                  v-model="formData.conName"
                  placeholder="请选择主合同"
                  :readonly="isReadonly"
                  v-model:model-value-id="formData.conId"
                  @pick="openMainConDialog"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="单位名称" prop="supName">
                <el-input
                  v-model="formData.supName"
                  placeholder="单位名称"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同分类" prop="conTypeName" required>
                <el-input
                  v-model="formData.conTypeName"
                  placeholder="合同分类"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="变更事项名称" prop="changeId" required>
                <PickInput
                  v-model="formData.changeName"
                  placeholder="请选择变更事项"
                  :readonly="isReadonly"
                  v-model:model-value-id="formData.changeId"
                  @pick="openChangeDialog"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="changeType" label="变更类型">
                <el-select
                  v-model="formData.changeType"
                  placeholder=""
                  style="width: 100%"
                  disabled
                >
                  <el-option
                    v-for="item in ChangeTypeEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="changeReasonId" label="变更原因">
                <el-select
                  v-model="formData.changeReasonId"
                  placeholder=""
                  style="width: 100%"
                  disabled
                >
                  <el-option
                    v-for="item in changeReasonOptions"
                    :key="item.id"
                    :label="item.dicLabel"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="changeAmt" label="预估变更金额">
                <el-input-number
                  v-model="formData.changeAmt"
                  :precision="2"
                  :controls="false"
                  placeholder=""
                  style="width: 100%"
                  :formatter="value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/¥\s?|(,*)/g, '')"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="changeWastAmt" label="无效成本金额">
                <el-input-number
                  v-model="formData.changeWastAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder=""
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item
                prop="changeWastReasonID"
                label="无效成本原因"
                disabled
              >
                <el-select
                  v-model="formData.changeWastReasonID"
                  placeholder=""
                  style="width: 100%"
                  clearable
                  disabled
                >
                  <el-option
                    v-for="item in wasteCostReasonOptions"
                    :key="item.id"
                    :label="item.dicLabel"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col> 
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="24">
              <el-form-item prop="changeConent" label="变更内容">
                <el-input
                  v-model="formData.changeConent"
                  type="textarea"
                  placeholder=""
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- ====== 卡片3：签证信息 ====== -->
        <FormCard
          id="card-visa"
          icon="📄"
          title="签证信息"
          v-model:collapsed="collapsedCards.basic"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="visaType" label="签证类型">
                <el-select
                  v-model="formData.visaType"
                  placeholder="请选择签证类型"
                  style="width: 100%"
                  disabled
                >
                  <el-option
                    v-for="item in VisaTypeEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="visaApplyAmt" label="签证申报金额" required>
                <el-input-number
                  v-model="formData.visaApplyAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="请输入签证申报金额"
                  style="width: 100%"
                  :disabled="isDetail"
                  @change="handleCostingCutAmtChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="visaApplyDesc" label="签证申报说明" required>
                <el-input
                  v-model="formData.visaApplyDesc"
                  type="textarea"
                  placeholder=""
                  :rows="2"
                  maxlength="500"
                  show-word-limit
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item
                prop="costingReviewAmt"
                label="成本审核金额"
              >
                <el-input-number
                  v-model="formData.costingReviewAmt"
                  :precision="2"
                  :controls="false"
                  placeholder=""
                  style="width: 100%"
                  disabled
                  @change="handleCostingCutAmtChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="costingCutAmt" label="成本审减金额">
                <el-input-number
                  v-model="formData.costingCutAmt"
                  :precision="2"
                  :controls="false"
                  placeholder=""
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="wasteCostAmt" label="无效成本金额">
                <el-input-number
                  v-model="formData.wasteCostAmt"
                  :precision="2"
                  :controls="false"
                  placeholder=""
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item
                prop="wasteCostReasonId"
                label="无效成本原因"
              >
                <el-select
                  v-model="formData.wasteCostReasonId"
                  placeholder=""
                  style="width: 100%"
                  clearable
                  :disabled="isDetail"
                >
                  <el-option
                    v-for="item in wasteCostReasonOptions"
                    :key="item.id"
                    :label="item.dicLabel"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="costingOpinion" label="成本审核意见">
                <el-input
                  v-model="formData.costingOpinion"
                  type="textarea"
                  placeholder=""
                  :rows="2"
                  maxlength="500"
                  show-word-limit
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="auditReviewAmt" label="审计审核金额">
                <el-input-number
                  v-model="formData.auditReviewAmt"
                  :precision="2"
                  :controls="false"
                  placeholder=""
                  style="width: 100%"
                  disabled
                  @change="handleAuditCutAmtChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="auditCutAmt" label="审计审减金额">
                <el-input-number
                  v-model="formData.auditCutAmt"
                  :precision="2"
                  :controls="false"
                  placeholder=""
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="auditOpinion" label="审计审核意见">
                <el-input
                  v-model="formData.auditOpinion"
                  type="textarea"
                  placeholder=""
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- ====== 卡片4：成本分摊 ====== -->
        <!-- 成本分摊：创建时不展示成本分摊模块，编辑时获取成本分摊数据进行展示查看详情 -->
        <FormCard
          id="card-alloc"
          v-show="isReadonly"
          icon="📄"
          title="成本分摊"
          v-model:collapsed="collapsedCards.basic"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <el-form-item label="分摊状态：" label-width="90px">
                <el-tag
                  size="small"
                  :type="getEnumType(allocStatusEnum, formData.cstAllocStatus || 0)"
                >
                  {{ getEnumLabel(allocStatusEnum, formData.cstAllocStatus || 0) }}
                </el-tag>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <el-form-item label="预警状态：" label-width="90px">
                <el-tag
                  size="small"
                  :type="getEnumType(allocWarnEnum, formData.cstWarningStatus || 0)"
                >
                  {{ getEnumLabel(allocWarnEnum, formData.cstWarningStatus || 0) }}
                </el-tag>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <el-form-item label="分摊：" label-width="90px">
                <el-button type="primary" @click="handleAllocationDetail">
                  分摊详情
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- ====== 卡片5：相关附件 ====== -->
        <FormCard
          id="card-annex"
          icon="📎"
          title="相关附件"
          v-model:collapsed="collapsedCards.annex"
        >
          <el-form-item label="相关附件">
            <base-upload
              v-model:file-list="tempFileList"
              :limit="9"
              :multiple="false"
              :showIcon="true"
              :showTip="true"
              :maxSize="20"
              :unrestricted="true"
              :accept="''"
              button-text="选择文件"
              size="default"
              :disabled="isReadonly"
              @success="handleUploadSuccess"
            />
          </el-form-item>
        </FormCard>
      </el-form>
    </div>
  </div>

  <!-- ============ 选择主合同弹窗 ============ -->
  <choose-contract-dialog
    ref="contractDialogRef"
    v-model="mainConDialogVisible"
    :selectionMode="'single'"
    :projId = formData.projId
    @select="handleMainConSelect"
  />

  <!-- 选择变更弹窗 （已归档、需签证、未转签证）-->
  <choose-change-dialog
    ref="changeDialogRef"
    v-model="changeDialogVisible"
    :selectionMode="'single'"
    :conId = formData.conId
    :isToVisa="false"
    :needVisa="true"
    :status="40"  
    @select="handleChangeSelect"
  />
</template>

<script setup lang="ts">
// ==================== 模块导入 ====================
import { ref, computed, onMounted, useTemplateRef, nextTick } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { useRouter, useRoute } from "vue-router";
import FormCard from "@/components/base/base-form-card.vue";
import { useUserStore } from "@/stores/user-store";
import ChooseChangeDialog from "@/components/business/choose-cost-change-dialog.vue";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";
import { visaManagementApi } from "@/api/cost/contract-manage/visa-management-api";
import { changeOrderApi } from "@/api/cost/contract-manage/change-order-api";
import BaseUpload from "@/components/base/base-upload.vue";
import { allocStatusEnum, allocWarnEnum, VisaTypeEnum } from "@/constants/contract-manage/enums";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { formType } from "@/types/form/form-types";
import { dateUtil } from "@/utils/date-util";
import { useFormLayout } from "@/composables/use-form-layout.ts";
import { NAV_CARDS } from "./visa-manage-config.ts";
import { ChangeTypeEnum } from "@/constants/contract-manage/enums";
import { useTagsStore } from "@/stores/tags-store";
import PickInput from "@/components/base/base-pick-input.vue";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api.ts";
import { requiredInputRule, requiredRule } from "@/utils/form-rule-validate.ts";
import { getEnumLabel, getEnumType } from "@/utils/enum.ts";
const { collapsedCards, toggleCard, formatMoney } = useFormLayout(NAV_CARDS);

defineOptions({ name: "visa-management-form" });

// ==================== Props & Emits ====================
interface Props {
  mode: "add" | "edit" | "detail";
  conId: number;
  visaId?: number;
  projId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  visaId: undefined,
  conId: undefined,
  projId: undefined,
});

const emit = defineEmits<{
  (e: "success", data: any): void;
  (e: "cancel"): void;
}>();

// ==================== 路由 / Store ====================
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const tagsStore = useTagsStore();

const flowListData = ref<any>(null);
const flowBaseData = ref<any>(null);

const mode = ref<"add" | "edit" | "detail">(props.mode);
const visaId = ref(props.visaId);
const conId = ref(props.conId);
const projId = ref(props.projId);

const isReadonly = computed(
  () => isDetail.value || !!billData.value.status,
);

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");

// ==================== 表单相关 ====================
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

// ==================== 选项数据 ====================
const segOptions = ref([]);
const projectOptions = ref([]);
const changeOrderOptions = ref([]);
const wasteCostReasonOptions = ref([]);

const changeReasonOptions = ref([]);
const tempFileList = ref([]);

// ==================== 单据 / 流程状态 ====================
const billData = ref({
  id: undefined,
  bizTitle: "",
  bizNo: "",
  status: 0,
  bizItemCode: formType.CON_VISA,
  flowId: null,
  conId: null,
  createName:"",
  createDate:"",
});

// ==================== 数据字典 ====================
const { getDictList, loadDicts } = useDict(
  [
    dictMapping.invalidCostReason,
    dictMapping.changeReason, // 变更原因
  ], {
  treeDictCodes: [],
});

// ==================== 表单数据 ====================
const initFormData = () => ({
  id: null,
  conBillId: null, // 单据ID
  flowId:null,
  bizTitle: "",
  bizNo:"",
  segId: undefined,
  segCode: "",
  segNo : "",
  segName: "",
  projId: undefined,
  userName: userStore.userInfo?.empName,
  createDate: dateUtil().format("YYYY-MM-DD"),
  deptName: userStore.userInfo?.deptName,
  mguName: userStore.userInfo?.mguName,
  compId : null,
  compName:"",
  status: 0, // 状态 0 草稿，5 审批中，10 已审批，30 已作废

  //变更
  changeId: null, // 变更ID
  changeName:"",
  changeNo:"",
  changeAmt:"",//预估变更金额
  changeType:null,  
  changeReasonId:null,
  changeRemark:null,
  changeReasonDesc:"",
  changeConent: "",
  changeWastAmt :null,
  changeWastReasonID:null,

  //签证
  visaType: null, // 签证类型
  visaApplyAmt: 0, // 签证申报金额
  visaApplyDesc: "", // 签证申报说明
  costingReviewAmt: 0, // 成本审核金额
  costingCutAmt: 0, // 成本审减金额
  costingOpinion: "", // 成本审核意见
  wasteCostAmt: 0, // 无效成本金额
  wasteCostReasonId: null, // 无效成本原因
  auditReviewAmt: 0, // 审计审核金额
  auditCutAmt: 0, // 审计审减金额
  auditOpinion: "", // 审计审核意见

  //合同
  conId:null,
  conName:null,
  supId:null,
  supName:"",
  conTypeId:null,
  conTypeName:"",

  //分摊
  cstAllocStatus: null,
  cstWarningStatus: null,
});

const formData = ref(initFormData());

// ==================== 表单校验规则 ====================
const formRules: FormRules = {
  bizTitle: requiredInputRule("标题"),
  projId: requiredInputRule("项目"),
  conId: requiredInputRule("合同名称"),
  conTypeName: requiredInputRule("合同分类"),
  changeId: requiredInputRule("变更事项名称"),
  visaApplyAmt:requiredInputRule("签证申报金额"),
  visaApplyDesc:requiredInputRule("签证申报说明"),
};

// ==================== 金额计算 ====================
// 计算成本审减金额
const calculateCostingCutAmt = () => {
  const visaApplyAmt = Number(formData.value.visaApplyAmt || 0);
  const costingReviewAmt = Number(formData.value.costingReviewAmt || 0);
  const costingCutAmt = visaApplyAmt - costingReviewAmt;
  formData.value.costingCutAmt = costingCutAmt < 0 ? 0 : costingCutAmt;
};

// 计算审计审减金额
const calculateAuditCutAmt = () => {
  const costingReviewAmt = Number(formData.value.costingReviewAmt || 0);
  const auditReviewAmt = Number(formData.value.auditReviewAmt || 0);
  const auditCutAmt = costingReviewAmt - auditReviewAmt;
  formData.value.auditCutAmt = auditCutAmt < 0 ? 0 : auditCutAmt;
};

// 处理成本相关金额变化
const handleCostingCutAmtChange = () => {
  if (Number(formData.value.visaApplyAmt || 0) >= 0 )
    formData.value.visaType = 1
  else formData.value.visaType = 2;

  //calculateCostingCutAmt();
 // calculateAuditCutAmt();
};

// 处理审计相关金额变化
const handleAuditCutAmtChange = () => {
  calculateAuditCutAmt();
};

// ==================== 选项初始化方法 ====================
// 获取业务板块列表
const getSegOptions = async () => {
  try {
    const res = await dictionaryApi.getsegmentList();
    if (res.code === 200) {
      segOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取业务板块列表失败:", error);
  }
};

// ---- 主合同选择 ----
const mainConDialogVisible = ref(false);
const openMainConDialog = () => {
  if (isDetail.value) return;
  if (!formData.value.projId) {
    ElMessage.warning(`请先选择项目！`);
    return;
  }
  mainConDialogVisible.value = true;
};
const handleMainConSelect = (data) => {
  if (data && data.length > 0) {
    let newData = data || [];
    if (formData.value.conId != newData[0].id) {
      conId.value = newData[0].id;
      formData.value.conId = newData[0].id;
      formData.value.conName = newData[0].conName;
      formData.value.supId = newData[0].supID;
      formData.value.supName = newData[0].supName;
      formData.value.conTypeId = newData[0].conTypeId;
      formData.value.conTypeName = newData[0].conTypeName;
      formData.value.changeId = null;
      formData.value.changeName = "";
    }
  }
};

// 选择变更
const changeDialogVisible = ref(false);
const openChangeDialog = async () => {
  if (isDetail.value) return;
  if (!formData.value.conId) {
    ElMessage.warning(`请先选择合同！`);
    return;
  }
  changeDialogVisible.value = true;
}
const handleChangeSelect = (data) => {
  if (data && data.length > 0) {
    let newData = data || [];
    const selected = newData[0];
      formData.value.changeId = selected.changeConId;
      formData.value.changeName = selected.changeName;
      formData.value.changeType = selected.changeType;
      formData.value.changeReasonId = selected.changeReasonId;
      formData.value.changeReasonDesc = selected.changeReasonDesc;
      formData.value.changeConent = selected.changeConent;
      formData.value.changeAmt = selected.changeAmt;
      formData.value.changeRemark = selected.remark;
      formData.value.changeWastAmt = selected.wasteCostAmt;
      formData.value.changeWastReasonID = selected.wasteCostReasonId;
  }
};

// 获取合同信息
const getConMainData = async (conId) => {
  if (!conId) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: conId,
    });
    if (res.code === 200 && res.data) {
      const {
        conMain,
      } = res.data;
      formData.value.conId = conMain.id;
      formData.value.conName = conMain.conName;
      formData.value.supId = conMain.supID;
      formData.value.supName = conMain.supName;
      formData.value.conTypeId = conMain.conTypeId;
      formData.value.conTypeName = conMain.conTypeName;
      formData.value.changeId = null;
      formData.value.changeName = "";
    }
  } catch (error) {
    console.error("获取合同信息失败:", error);
  }
};

// 获取项目列表
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

// 初始化数据字典
const initDictData = async () => {
  await loadDicts();
  debugger
  wasteCostReasonOptions.value = getDictList(dictMapping.invalidCostReason); // 无效成本原因
  changeReasonOptions.value = getDictList(dictMapping.changeReason); // 变更原因列表
};

// 获取变更合同列表
const getChangeOrderList = async () => {
  if (!conId.value) {
    changeOrderOptions.value = [];
    return;
  }
  try {
    const res = await changeOrderApi.getChangeConList({
      conId: conId.value,
    });
    if (res.code === 200) {
      changeOrderOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取变更合同列表失败:", error);
  }
};

// 生成单号
const generateVisaNo = async () => {
  try {
    const res = await commonApi.getBillNo({ bizType: formType.CON_VISA });
    if (res.code === 200) {
      formData.value.bizNo = res.data;
    }
  } catch (error) {
    console.error("生成签证单号失败:", error);
  }
};

// ==================== 项目联动 ====================
const changeProject = async (value: number) => {
  if (value) {
    const res = await projectAreaApi.getInfoByProjId({ id: value });
    if (res.code === 200 && res.data) {
      projId.value = value;
      const { compName, compId, segId, segName,segNo } = res.data;
      formData.value.segId = segId || "";
      formData.value.segNo = segNo || "";
      formData.value.segName = segName || "";
      formData.value.compId = compId || null;
      formData.value.compName = compName || "";
      formData.value.conId = null,
      formData.value.conName = "",
      formData.value.supId = null,
      formData.value.supName = "",
      formData.value.changeId = "",
      formData.value.changeName = "",
      // 程序化重置了若干字段，清除误报的必填红
      await nextTick();
      formRef.value?.clearValidate();
    }
  }
};


// ==================== 附件上传 ====================
const handleUploadSuccess = (fileList: any) => {
  tempFileList.value.push(fileList);
};

// ==================== 详情加载 ====================
const loadDetail = async () => {
  if (!visaId.value) return;
  try {
    const res = await visaManagementApi.getVisaDetail({
      id: Number(visaId.value),
      isWithFlow:true,
    });
    if (res.code === 200) {
      const { change, changeCon,visa, conMain,flowList, flowBase,bill,annexList = [] } = res.data;
      billData.value = { ...billData.value, ...bill };
      flowListData.value = { ...flowListData.value, ...flowList };
      flowBaseData.value = { ...flowBaseData.value, ...flowBase };

      formData.value = {
        ...formData.value,
        id: visa.id,    
        conBillId: visa.conBillId,    
        flowId:billData.value.flowId,
        segId: flowBaseData.value.segId,
        segNo: flowBaseData.value.segNo,
        segName:flowBaseData.value.segName,
        deptName: flowBaseData.value.deptName,
        mguName: flowBaseData.value.mguName,
        compId : flowBaseData.value.compId,
        compName: flowBaseData.value.compName,
        userName:flowBaseData.value.userName || "",
        createDate:billData.value.createDate || "",
        projId: flowBaseData.value.projId,
        bizNo: billData.value.bizNo || "",
        bizTitle: billData.value.bizTitle || "",
        status: visa.status ?? 0,

        visaType: visa.visaType ?? undefined,
        visaApplyAmt: visa.visaApplyAmt ?? 0,
        visaApplyDesc: visa.visaApplyDesc || "",
        costingReviewAmt: visa.costingReviewAmt ?? 0,
        costingCutAmt: visa.costingCutAmt ?? 0,
        costingOpinion: visa.costingOpinion || "",
        wasteCostAmt: visa.wasteCostAmt ?? 0,
        wasteCostReasonId: visa.wasteCostReasonId ?? undefined,
        auditReviewAmt: visa.auditReviewAmt ?? 0,
        auditCutAmt: visa.auditCutAmt ?? 0,
        auditOpinion: visa.auditOpinion || "",

        //合同相关
        conId: conMain.id,
        conName: conMain.conName || "",
        supId:conMain.supId,
        supName:conMain.supName,
        conTypeId:conMain.conTypeId,
        conTypeName:conMain.conTypeName,

        //变更相关        
        changeId: visa.changeId,
        changeName: change.changeName,
        changeNo: change.changeNo,
        changeAmt: changeCon.estChangeAmt ?? 0,
        changeConent: change.changeConent || "",
        changeType: change.changeType,
        changeReasonId: change.changeReasonId,
        changeRemark: change.changeConent,
        changeReasonDesc: change.changeReasonDesc,
        changeWastAmt : changeCon.wasteCostAmt,
        changeWastReasonID:changeCon.wasteCostReasonId,

        cstAllocStatus: bill.cstAllocStatus || "",
        cstWarningStatus: bill.cstAllocWarn || "",
      };
      if (annexList && annexList.length > 0) {
        tempFileList.value = annexList.map((item: any) => ({
          ...item,
          name: item.annexName,
          url: item.annexPath,
        }));
      }
    }
  } catch (error) {
    console.error("加载签证详情失败:", error);
  }
};

// ==================== 提交参数构建 ====================
const buildSubmitParams = () => {
  return {
    bill: {
        ...billData.value,
        id: billData.value.id || undefined,
        bizTitle: formData.value.bizTitle,
        bizItemCode: formType.CON_VISA,
        segId: formData.value.segId,
        segName: formData.value.segName,
        segNo: formData.value.segNo,
        projId: formData.value.projId,
        compId: formData.value.compId,
        compName: formData.value.compName,
        flowId:formData.value.flowId,
        conId: formData.value.conId,
      },
    visa: {
      id: formData.value.id,
      conBillId: formData.value.conBillId,
      status: formData.value.status,
      changeId: formData.value.changeId,
      visaType: formData.value.visaType,
      visaApplyAmt: formData.value.visaApplyAmt,
      visaApplyDesc: formData.value.visaApplyDesc,
      costingReviewAmt: formData.value.costingReviewAmt,
      costingCutAmt: formData.value.costingCutAmt,
      costingOpinion: formData.value.costingOpinion,
      wasteCostAmt: formData.value.wasteCostAmt,
      wasteCostReasonId: formData.value.wasteCostReasonId,
      auditReviewAmt: formData.value.auditReviewAmt,
      auditCutAmt: formData.value.auditCutAmt,
      auditOpinion: formData.value.auditOpinion,
    },
    annexList: tempFileList.value || [],
  };
};

// ==================== 顶部操作栏方法 ====================
const handleCancel = async () => {
  ElMessageBox.confirm("确定要作废吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await visaManagementApi.voidVisa({
        id: formData.value.id,
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

const handleDelete = async () => {
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await visaManagementApi.delVisa(formData.value.id);
      if (res.code === 200) {
        ElMessage.success("删除成功");
        goBack();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  });
};

const handleFormDataSave = async () => {
  submitLoading.value = true;
  try {
    debugger;
    await formRef.value.validateField(["bizTitle", "projId","conId"]);

    const params = buildSubmitParams();
    const res = await visaManagementApi.editVisa(params);
    if (res.code === 200 && res.data) {
      formData.value.id = res.data;
      visaId.value =formData.value.id;
      ElMessage.success("保存成功");
      await loadDetail();
    }
  } catch (error) {
    focusFirstError(error as Record<string, any>);
  } finally {
    submitLoading.value = false;
  }
};

const handleFormDataSubmit = async () => {
  submitLoading.value = true;
  try {
    await formRef.value.validate();

    const params = buildSubmitParams();
    let res;
    if (formData.value.id) {
      res = await visaManagementApi.submitVisa(params);
    } else {
      res = await visaManagementApi.submitVisa(params);
    }
    if (res.code === 200) {
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
    focusFirstError(error as Record<string, any>);
  } finally {
    submitLoading.value = false;
  }
};

// ---- 校验失败后：滚动到第一个错误项并聚焦对应控件 ----
const focusFirstError = (invalidFields?: Record<string, any>) => {
  const firstProp = Object.keys(invalidFields ?? {})[0];
  if (!firstProp) return;
  const formInst = formRef.value as any;
  const field = formInst?.fields?.find((f: any) => f.prop === firstProp);
  const el = field?.$el as HTMLElement | undefined;
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  nextTick(() => {
    const focusable = el.querySelector<HTMLElement>(
      'input:not([type="hidden"]), textarea, .el-select__wrapper, .el-date-editor input, [tabindex]',
    );
    focusable?.focus({ preventScroll: true });
  });
};

// ==================== 成本分摊 ====================
const handleAllocationDetail = () => {};

// ==================== 页面导航 ====================
const goBack = () => {
  if (isAdd.value) {
    tagsStore.closeTagByPath("/con/change-order/add");
  }
  if (isEdit.value) {
    tagsStore.closeTagByPath("/con/change-order/edit");
  }
  router.go(-1); // 返回上个页面
};

// ==================== 初始化与生命周期 ====================
const initData = async () => {
  await getSegOptions();
  await getProjectOptions();
  await initDictData();

  if (isAdd.value) {
    formData.value = initFormData();
    await generateVisaNo(); // 生成单号
    formData.value.projId = projId.value;
    if (formData.value.projId) {
      await changeProject(formData.value.projId);
    }
    if (props.conId) {
      await getConMainData(props.conId)
    }
    nextTick(() => {
      formRef.value?.clearValidate();
    });
  } else if (isEdit.value || isDetail.value) {
    await loadDetail();
  }
};

onMounted(() => {
  initData();
});

// 暴露方法给父组件
defineExpose({
  initData,
  formData,
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
    padding: 4px 0;

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

:deep(.el-textarea__inner) {
  resize: none;
}
</style>
