<!-- 产值申报 审批 -->
<template>
  <div class="basic-form-content">
    <BillHeader
      :title="'产值申报'"
      :contract-no="billData.bizNo || ''"
      :submitter="formData.userName || ''"
      :submit-time="formData.createDate || ''"
      :status="billData.status || 0"
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
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :disabled="isReadonly || loadingForm"
        :validate-on-rule-change="false"
        label-width="130px"
        class="adapt-form"
      >
        <BillInfo
          v-model="formData"
          :status="billData?.status || 0"
          :disabled="isDetail || !!billData.status"
          :project-options="projectOptions"
          @project-change="changeProject"
        />

        <!-- 合同信息 -->
        <FormCard
          id="card-base"
          icon="📋"
          title="合同信息"
          v-model:collapsed="collapsedCards.base"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="合同名称" prop="conId" required>
                <PickInput
                  v-model="formData.conName"
                  placeholder="请选择付款合同"
                  :readonly="isReadonly || !formData.projId"
                  v-model:model-value-id="formData.conId"
                  @pick="openMainConDialog"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="供应商名称" prop="supName">
                <el-input
                  v-model="formData.supName"
                  placeholder=" "
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同分类" prop="conTypeName">
                <el-input
                  v-model="formData.conTypeName"
                  placeholder=" "
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="签约合同金额" prop="signAmt">
                <el-input-number
                  v-model="formData.signAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="补充合同金额" prop="addAmt">
                <el-input-number
                  v-model="formData.addAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计变更签证" prop="sumChangeAmt">
                <el-input-number
                  v-model="formData.sumChangeAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="预结算合同金额" prop="preSettleAmt">
                <el-input-number
                  v-model="formData.preSettleAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>  
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计产值" prop="sumProdVal">
                <el-input-number
                  v-model="formData.sumProdVal"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计应付" prop="sumPayAmt">
                <el-input-number
                  v-model="formData.sumPayAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="是否甲供材" prop="isSelfSupply">
                <el-select
                  v-model="formData.isSelfSupply"
                  placeholder="是否甲供材"
                  style="width: 100%"
                  :disabled="isDetail"
                >
                  <el-option label="否" :value="0" />
                  <el-option label="是" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="甲供材类型" prop="selfSupplyType">
                <!-- 是否甲供材为是时，可编辑选择，否则清空不可编辑 -->
                <el-select
                  v-model="formData.selfSupplyType"
                  placeholder="甲供材类型"
                  style="width: 100%"
                  :disabled="formData.isSelfSupply === 0"
                >
                  <el-option label="甲供材-主材" :value="1" />
                  <el-option label="甲供材-零星" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <!-- <el-row :gutter="24">    
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计请款" prop="sumAppyAmt">
                <el-input-number
                  v-model="formData.sumAppyAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计实付" prop="sumPaidAmt">
                <el-input-number
                  v-model="formData.sumPaidAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计欠款" prop="sumOwedAmt">
                <el-input-number
                  v-model="formData.sumOwedAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row> -->
        </FormCard>

        <!-- 产值信息 -->
        <FormCard
          id="card-prod"
          icon="📋"
          title="产值信息"
          v-model:collapsed="collapsedCards.base"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="产值申报方式">
                <el-select
                  v-model="formData.payMethod"
                  placeholder="请选择"
                  style="width: 100%"
                  
                >
                  <el-option
                    v-for="item in PayTypeEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="本次申报产值" prop="applyProdVal" required>
                <el-input-number
                  v-model="formData.applyProdVal"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="请输入申报产值"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="本次申报应付" prop="applyPayAmt" required>
                <el-input-number
                  v-model="formData.applyPayAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="请输入申报应付"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="本次成本复核产值" prop="costProdVal">
                <el-input-number
                  v-model="formData.costProdVal"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="成本复核产值"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="本次成本复核应付" prop="costPayAmt">
                <el-input-number
                  v-model="formData.costPayAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="成本复核应付"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="申报说明" prop="applyDesc">
                <el-input
                  v-model="formData.applyDesc"
                  type="textarea"
                  :rows="2"
                  maxlength="500"
                  show-word-limit
                  placeholder="请输入申报说明"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="申报附件">
                <base-upload
                  v-model:file-list="declaraFileList"
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
                  @success="declaraFileSuccess"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- 材料合同产值 -->
        <FormCard
          id="card-con"
          icon="📋"
          title="合同产值"
          v-model:collapsed="collapsedCards.base"
        >

          <!-- 非甲供材  产值申报方式：按进度确认 -> 显示非甲供材  -->
          <div class="detail-table" v-if="formData.payMethod == 1">
            <div class="header-content">
              <span class="header-title">产值明细（非甲供材）</span>
              <el-button
                type="primary"
                size="small"
                :disabled="isDetail || !!billData.status"
                @click="addNonSelfSupply"
              >
                新增明细
              </el-button>
            </div>
            <editable-table
              ref="nonSelfSupplyRef"
              :row-key="'uuid'"
              :height="'200px'"
              v-model="nonSelfSupplyTable"
              :columns="nonSelfSupplyColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :on-save="handleNonSelfSupplySave"
            >
              <template #actions="{ row }">
                <el-button
                  link
                  type="danger"
                  :disabled="isDetail || !!billData.status"
                  @click="deleteNonSelfSupply(row)"
                >
                  删除
                </el-button>
              </template>
            </editable-table>
          </div>

          <!-- 产值明细（甲供材-主材） -->
          <!-- 按材料到货确认 + 甲供材 + 主材类型 -> 甲供材-主材 -->
          <div
            class="detail-table"
            v-if="
              formData.payMethod == 2 &&
              formData.isSelfSupply == 1 &&
              formData.selfSupplyType == 1
            "
          >
            <div class="header-content">
              <span class="header-title">产值明细（甲供材-主材）</span>
              <el-button
                type="primary"
                size="small"
                :disabled="isDetail || !!billData.status"
                @click="addMaterial"
              >
                新增明细
              </el-button>
            </div>
            <editable-table
              ref="materialRef"
              :row-key="'uuid'"
              :height="'200px'"
              v-model="materialTable"
              :columns="materialColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :editable="!isDetail && !billData.status"
            >
              <template #actions="{ row }">
                <el-button
                  link
                  type="danger"
                  :disabled="isDetail || !!billData.status"
                  @click="deleteMaterial(row)"
                >
                  删除
                </el-button>
              </template>
            </editable-table>
          </div>

          <!-- 产值明细 - 甲供材-零星  -->
          <!-- 按材料到货确认 + 非甲供材 -> 甲供材-零星 -->
          <!-- 按材料到货确认 + 甲供材 + 零星类型 -> 甲供材-零星 -->
          <div
            class="detail-table"
            v-if="
              (formData.payMethod == 2 && formData.isSelfSupply == 0) ||
              (formData.payMethod == 2 &&
                formData.isSelfSupply == 1 &&
                formData.selfSupplyType == 2)
            "
          >
            <div class="header-content">
              <span class="header-title">产值明细（甲供材-零星）</span>
              <el-button
                type="primary"
                size="small"
                :disabled="isDetail || !!billData.status"
                @click="addMaterialMinor"
              >
                新增明细
              </el-button>
            </div>
            <editable-table
              ref="materialMinorRef"
              :row-key="'uuid'"
              :height="'200px'"
              v-model="materialMinorTable"
              :columns="materialMinorColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :editable="!isDetail && !billData.status"
            >
              <!-- 接收明细附件列 - 自定义上传按钮 -->
              <template #annex="{ row }">
                <div class="annex-cell">
                  <el-link
                    v-if="row.annexId"
                    type="primary"
                    :underline="'hover'"
                    @click="handleViewAnnex(row)"
                  >
                    {{ row.annexName || row.annex || "查看附件" }}
                  </el-link>
                </div>
              </template>
              <template #actions="{ row }">
                <el-button
                  link
                  type="primary"
                  :disabled="isDetail || !!billData.status"
                  @click="openUploadForRow(row)"
                >
                  上传附件
                </el-button>
                <el-button
                  link
                  type="danger"
                  :disabled="isDetail || !!billData.status"
                  @click="deleteMaterialMinor(row)"
                >
                  删除
                </el-button>
              </template>
            </editable-table>
          </div>
        </FormCard>

        <!-- 本次申报后累计情况 -->
        <FormCard
          id="card-sum"
          icon="📋"
          title="累计产值"
          v-model:collapsed="collapsedCards.base"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item
                label="累计产值(含本单)"
                prop="totalProdVal"
                required
              >
                <el-input-number
                  v-model="formData.totalProdVal"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="0"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计应付(含本单)" prop="totalPayVal">
                <el-input-number
                  v-model="formData.totalPayVal"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="0"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计未付(含本单)" prop="totalPayVal">
                <el-input-number
                  v-model="formData.totalOwedVal"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="0"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- 相关附件 -->
        <FormCard
          id="card-annex"
          icon="📋"
          title="相关附件"
          v-model:collapsed="collapsedCards.base"
        >
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
            />
          </el-form-item>
        </FormCard>
      </el-form>
    </div>

    <!-- 隐藏的上传组件 -->
    <Teleport to="body">
      <div style="display: none" @click.stop @mousedown.stop>
        <base-upload
          ref="annexUploadRef"
          key="minorAnnex"
          v-model:file-list="tempFileList"
          :limit="1"
          :maxSize="20"
          :multiple="false"
          :showIcon="true"
          :showTip="false"
          button-text="选择文件"
          size="default"
          button-type="primary"
          @success="handleUploadSuccess"
        />
      </div>
    </Teleport>
  </div>
  <!-- ============ 选择主合同弹窗 ============ -->
  <choose-contract-dialog
    ref="contractDialogRef"
    v-model="mainConDialogVisible"
    :selectionMode="'single'"
    :projId = formData.projId
    @select="handleMainConSelect"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, useTemplateRef } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";
import BaseUpload from "@/components/base/base-upload.vue";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import BillHeader from "@/components/business/bill-components/bill-header.vue";
import BillInfo from "@/components/business/bill-components/bill-info.vue";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { PayTypeEnum } from "@/constants/contract-manage/enums";
import { buildFileUrl } from "@/utils/file-path-util";
import { cumulativeDataApi } from "@/api/cost/contract-manage/cumulative-data-api";
import { formType } from "@/types/form/form-types";
import { dateUtil } from "@/utils/date-util";
import { outputDeclarationApi } from "@/api/cost/contract-manage/output-declaration-api";
import ChooseContractDialog from "@/components/business/choose-contract-dialog.vue";
import { NAV_CARDS } from "./output-value-config";
import { useFormLayout } from "@/composables/use-form-layout";
const { collapsedCards, toggleCard, formatMoney } = useFormLayout(NAV_CARDS);
import FormCard from "@/components/base/base-form-card.vue";
import PickInput from "@/components/base/base-pick-input.vue";
import FloatNav from "@/components/base/base-float-nav.vue";
import { moneyRule, requiredInputRule, requiredRule } from "@/utils/form-rule-validate";

defineOptions({ name: "output-value-approval-form" });

interface Props {
  mode?: "add" | "edit" | "detail";
  prodId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  prodId: undefined,
});

const emit = defineEmits<{
  (e: "success", data: any): void;
  (e: "cancel"): void;
}>();

const router = useRouter();
const userStore = useUserStore();
const route = useRoute();

const conId = Number(route.query.conId); // 合同ID

const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const loadingForm = ref(false); 

const mode = ref<"add" | "edit" | "detail">(props.mode);
const prodId = ref<number | undefined>(props.prodId);

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");
const isReadonly = computed(
  () => isDetail.value || !!billData.value.status,
);

const projectOptions = ref([]);
const declaraFileList = ref([]);
const annexFileList = ref([]);

// ==================== 附件上传相关 ====================
const annexUploadRef = useTemplateRef("annexUploadRef");
const tempFileList = ref([]);
const currentUploadRow = ref<any>(null);

const billData = ref({
  id: undefined,
  bizTitle: "",
  bizNo: "",
  status: 0,
  bizItemCode: "NCON_PROC",
});

const initFormData = () => ({
  // 单据信息
  id: undefined as number | undefined,
  bizTitle: "",
  segId: undefined,
  segName: "",
  segNo: "",
  projId: undefined,
  projName: "",
  compId: "",
  compName: "",
  conBillId: undefined as number | undefined,
  flowId:null,
  bizNo:"",
  userName: userStore.userInfo?.empName,
  createDate: dateUtil().format("YYYY-MM-DD"),
  deptName: userStore.userInfo?.deptName,
  mguName: userStore.userInfo?.mguName,

  // 合同信息
  conId: undefined,
  conName: "", // 合同名称
  conSysNo: "", // 合同编号
  conPhyNo: "", // 合同编号
  supId: undefined,
  supName: "", // 供应商名称
  conTypeId: undefined,
  conTypeName: "", // 合同分类
  productionMajor: "", // 生产专业
  signAmt: 0, // 签约合同金额
  addAmt: 0, // 补充合同金额
  preSettleAmt: 0, // 预结算合同金额
  sumChangeAmt: 0, // 累计变更签证
  sumProdVal: 0, // 累计产值
  sumPayAmt: 0, // 累计应付
  sumAppyAmt: 0, // 累计请款
  sumPaidAmt: 0, // 累计实付
  sumOwedAmt: 0, // 累计欠款
  isSelfSupply: 0, // 是否甲供材，0-否，1-是
  selfSupplyType: 1, // 甲供材类型，1-主材，2-零星

  // 产值信息
  payMethod: undefined, // 产值确认方式
  applyProdVal: 0, // 本次申报产值
  applyPayAmt: 0, // 本次申报应付
  costProdVal: 0, // 本次成本复核产值
  costPayAmt: 0, // 本次成本复核应付
  applyDesc: "", // 申报说明

  // 本次申报后累计情况
  totalProdVal: 0, // 累计产值
  totalPayVal: 0, // 累计应付
  totalOwedVal: 0, // 累计未付
});

const formData = ref(initFormData());

const formRules = computed(() => {
  const rules: Record<string, any> = {
    bizTitle: requiredInputRule("标题"),
    projId: requiredRule("项目名称"),
    conId: requiredRule("合同名称"),
    applyPayAmt: moneyRule("申请产值金额"),
    // finaTypeId: requiredRule("费用类型"),
    // payTypeId: requiredRule("款项类型"),
    // reqType: requiredRule("请款类型"),
    // reqAmt: moneyRule("请款总金额"),
    // conTyeName: requiredRule("合同分类"),
    // isRise: requiredRule("是否提高支付比例"),
  };

  return rules;
});


// ==================== 材料合同产值明细 - 甲供材-主材 ====================
const materialTable = ref([]);
const materialRef = ref();

const materialColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "recvBillNo",
    label: "接收单号",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "mtName",
    label: "材料名称",
    editable: false,
    width: 120,
  },
  {
    prop: "mtModel",
    label: "材料规格",
    editable: false,
    width: 120,
  },
  {
    prop: "mtBrand",
    label: "品牌",
    editable: false,
    width: 120,
  },
  {
    prop: "mtBrand",
    label: "材质",
    editable: false,
    width: 120,
  },
  {
    prop: "recvNum",
    label: "接收数量",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    precision: 0,
    width: 120,
  },
  {
    prop: "mtUnit",
    label: "单位",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 100,
  },
  {
    prop: "recvPrice",
    label: "单价",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "prodVal",
    label: "接收产值",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "fineAmt",
    label: "罚款",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "applyProdVal",
    label: "本次申报产值",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payRate",
    label: "应付比例(%)",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "payAmt",
    label: "本次申报应付",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "buildPeriod",
    label: "施工期间",
    editable: true,
    editType: "number",
    precision: 0, // 整数
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "prodValPeriod",
    label: "产值期间",
    editable: true,
    editType: "number",
    precision: 0, // 整数
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payDate",
    label: "计划付款日期",
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "costProdVal",
    label: "成本复核产值",
    editable: false,
    width: 150,
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付",
    editable: false,
    width: 150,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);

const addMaterial = () => {
  const newRow = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    mtId: undefined,
    mtName: "",
    mtModel: "",
    mtBrand: "",
    recvNum: 0,
    mtUnit: "",
    recvBillNo: "",
    recvPrice: 0,
    fineAmt: 0,
    prodVal: 0,
    payRate: 0,
    payAmt: 0,
    buildPeriod: "",
    prodValPeriod: "",
    payDate: "",
    costProdVal: 0,
    costPayAmt: 0,
  };
  materialTable.value = [...materialTable.value, newRow];
};

const deleteMaterial = (row: any) => {
  materialTable.value = materialTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

// ==================== 材料合同产值明细 - 甲供材-零星 ====================
const materialMinorTable = ref([]);
const materialMinorRef = ref();

const materialMinorColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "recvBillNo",
    label: "接收单号",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "mtCategory",
    label: "材料类别",
    editable: false,
    width: 120,
  },
  {
    prop: "prodVal",
    label: "接收产值",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "fineAmt",
    label: "罚款",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "applyProdVal",
    label: "本次申报产值",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payRate",
    label: "合同应付比例(%)",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "payAmt",
    label: "本次申报应付",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "buildPeriod",
    label: "施工期间",
    editable: true,
    editType: "number",
    precision: 0, // 整数
    // editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "prodValPeriod",
    label: "产值期间",
    editable: true,
    // editType: "date",
    editType: "number",
    precision: 0, // 整数
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payDate",
    label: "计划付款期间",
    editable: true,
    // editType: "date",
    editType: "number",
    precision: 0, // 整数
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "costProdVal",
    label: "成本复核产值",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "remark",
    label: "备注",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    slot: "annex", // 使用自定义插槽
    label: "接收明细附件",
    width: 180,
  },
  {
    label: "操作",
    width: 140,
    slot: "actions",
    fixed: "right",
  },
]);

const addMaterialMinor = () => {
  const newRow = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    recvBillNo: "",
    mtCategory: "",
    prodVal: 0,
    fineAmt: 0,
    applyProdVal: 0,
    payRate: 0,
    payAmt: 0,
    buildPeriod: "",
    prodValPeriod: "",
    payDate: "",
    costProdVal: 0,
    costPayAmt: 0,
    remark: "",
    annex: "",
    annexId: undefined,
    annexName: "",
  };
  materialMinorTable.value = [...materialMinorTable.value, newRow];
};

const deleteMaterialMinor = (row: any) => {
  materialMinorTable.value = materialMinorTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

/**
 * 打开文件上传对话框
 */
const openUploadForRow = (row: any) => {
  if (isDetail.value || !!billData.value.status) return;
  currentUploadRow.value = row;
  tempFileList.value = [];
  nextTick(() => {
    annexUploadRef.value?.triggerFileSelect();
  });
};

/**
 * 上传成功回调
 */
const handleUploadSuccess = (file: any) => {
  tempFileList.value = [file];
  if (currentUploadRow.value) {
    const annexId = file.id;
    const annexName = file.annexName || file.name;

    const rowIndex = materialMinorTable.value.findIndex(
      (item) => item.uuid === currentUploadRow.value.uuid,
    );
    if (rowIndex !== -1) {
      const newData = [...materialMinorTable.value];
      newData[rowIndex] = {
        ...newData[rowIndex],
        annexId: annexId,
        annexName: annexName,
      };
      materialMinorTable.value = newData;
    }
    currentUploadRow.value = null;
  }
};

/**
 * 查看附件
 */
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
const handleMainConSelect =async (data) => {
  if (data && data.length > 0) {
    let newData = data || [];
    if (formData.value.conId != newData[0].id) {
      await getConDetail(newData[0].id);
      await getConTotal(newData[0].id);
    }
  }
};

// ==================== 非甲供材 ====================
const nonSelfSupplyTable = ref([]);
const billPayratesList = ref([]);

const nonSelfSupplyColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "payTypeId",
    label: "款项类型",
    editable: true,
    editType: "select",
    clearable: false,
    showOverflowTooltip: false,
    optionLabelField: "payTypeId",
    optionValueField: "payTypeId",
    options: billPayratesList.value || [],
    minWidth: 120,
  },
  {
    prop: "payRate",
    label: "应付比例(%)",
    editable: false,
    minWidth: 100,
  },
  {
    prop: "isCtrl",
    label: "强控支付",
    editable: false,
    minWidth: 100,
    formatter: (row: any) => (row.isCtrl ? "是" : "否"),
  },
  {
    prop: "payIntvl",
    label: "支付周期(月)",
    editable: false,
    editType: "number",
    precision: 0, // 整数
    showOverflowTooltip: false,
    minWidth: 100,
  },
  {
    prop: "applyProdVal",
    label: "本次申请产值",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    minWidth: 120,
  },
  {
    prop: "applyPayAmt",
    label: "本次申报应付",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    minWidth: 120,
  },
  {
    prop: "buildPeriod",
    label: "施工期间",
    editable: true,
    // editType: "date",
    editType: "number",
    precision: 0, // 整数
    showOverflowTooltip: false,
    minWidth: 120,
  },
  {
    prop: "prodValPeriod",
    label: "产值期间",
    editable: true,
    // editType: "date",
    editType: "number",
    precision: 0, // 整数
    showOverflowTooltip: false,
    minWidth: 120,
  },
  {
    prop: "payDate",
    label: "计划付款期间",
    editable: true,
    // editType: "date",
    editType: "number",
    precision: 0, // 整数
    showOverflowTooltip: false,
    minWidth: 120,
  },
  {
    prop: "costProdVal",
    label: "成本复核产值",
    editable: false,
    minWidth: 120,
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付",
    editable: false,
    minWidth: 120,
  },
  {
    label: "操作",
    width: 120,
    slot: "actions",
    fixed: "right",
  },
]);

const addNonSelfSupply = () => {
  const newRow = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    payTypeId: undefined,
    payRate: undefined,
    isCtrl: false,
    payIntvl: 0,
    applyProdVal: 0,
    applyPayAmt: 0,
    buildPeriod: 0,
    prodValPeriod: 0,
    payDate: 0,
    costProdVal: 0,
    costPayAmt: 0,
  };
  nonSelfSupplyTable.value = [...nonSelfSupplyTable.value, newRow];
};

const deleteNonSelfSupply = (row: any) => {
  nonSelfSupplyTable.value = nonSelfSupplyTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};
const updateNonSelfSupplyRow = (rowIndex: number, data: any) => {
  const newData = [...nonSelfSupplyTable.value];
  newData[rowIndex] = { ...nonSelfSupplyTable.value[rowIndex], ...data };
  nonSelfSupplyTable.value = newData;
};

const handleNonSelfSupplySave = async (data) => {
  const { row, column, newValue, oldValue, rowIndex } = data;
  console.log("非甲供材保存", data);
  // 选择款项类型时回填应付比例、是否强控、支付周期
  if (column === "payTypeId") {
    const targetPayType = billPayratesList.value.find(
      (item) => item.payTypeId === newValue,
    );
    const { payRate, isCtrl, payIntvl } = targetPayType || {};
    updateNonSelfSupplyRow(rowIndex, { payRate, isCtrl, payIntvl });
    console.log(
      "选择款项类型时回填应付比例、是否强控、支付周期",
      nonSelfSupplyTable.value,
    );
    return;
  }
  updateNonSelfSupplyRow(rowIndex, { [column]: newValue });
};

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

// 生成业务流水号
const generateApplyNo = async () => {
  try {
    const res = await commonApi.getBillNo({ bizType: formType.CON_PROD });
    if (res.code === 200 && res.data) {
      billData.value.bizNo = res.data;
    }
  } catch (error) {
    console.error("生成请款单号失败:", error);
  }
};

// 选择项目
const changeProject = async (value: number) => {
  if (value) {
    const res = await projectAreaApi.getInfoByProjId({ id: value });
    if (res.code === 200 && res.data) {
      const { compName, compId, segId, segName,segNo } = res.data;
      formData.value.compId = compId || "";
      formData.value.compName = compName || "";
      formData.value.segId = segId || "";
      formData.value.segName = segName || "";
      formData.value.segNo = segNo || "";
      // 清空原合同相关信息
      clearContractInfo();
    }
  }
};


// 清空与合同相关的回填字段（切换项目时调用）
const clearContractInfo = () => {
  const f = formData.value;
  f.conId = null;
  f.conName = "";
  f.supId = null;
  f.supName = "";
  f.conTypeId = null;
  f.conTypeName = "";
  f.conSysNo = "";
  f.conPhyNo = "";
  f.signAmt = 0;
  f.addAmt = 0;
  f.sumChangeAmt = 0;
  f.preSettleAmt = 0;
  f.sumProdVal = 0;
  f.sumPayAmt = 0;
  f.sumAppyAmt = 0;
  f.sumPaidAmt = 0;
  f.sumOwedAmt = 0;
};

const buildSubmitParams = () => {
  // //非建安类时，隐藏的 5 个字段提交置 0，避免带脏数据入库
  // //（累计变更签证、预结算/结算金额、累计产值、累计应付、应付占产值比、实付占产值比）
  // const jianAn = conTypeIsJianAn.value === true;
  // const sumChangeAmt = jianAn ? formData.value.sumChangeAmt : 0;
  // const preSettleAmt = jianAn ? formData.value.preSettleAmt : 0;
  // // const settledAmt = jianAn ? formData.value.settledAmt : 0;
  // const sumProdVal = jianAn ? formData.value.sumProdVal : 0; 
  // const sumPayAmt = jianAn ? formData.value.sumPayAmt : 0;
  // const payOutRate = jianAn ? formData.value.payOutRate : 0;
  // const paidOutRate = jianAn ? formData.value.paidOutRate : 0;
  // return {
  //   bill: {
  //     ...billData.value,
  //     id: billData.value.id || undefined,
  //     bizTitle: formData.value.bizTitle,
  //     bizItemCode: formType.CON_PAY,
  //     segId: formData.value.segId,
  //     segName: formData.value.segName,
  //     segNo: formData.value.segNo,
  //     projId: formData.value.projId,
  //     compId: formData.value.compId,
  //     compName: formData.value.compName,
  //     flowId:formData.value.flowId,
  //     conId: formData.value.conId,
  //     bizNo: formData.value.bizNo,
  //   },
  //   payment: {
  //     id: formData.value.id,
  //     conBillId: formData.value.conBillId,
  //     conId: formData.value.conId,
  //     signAmt: formData.value.signAmt,
  //     addAmt: formData.value.addAmt,
  //     sumChangeAmt: sumChangeAmt,
  //     preSettleAmt: preSettleAmt,
  //     sumProdVal: sumProdVal,
  //     sumPayAmt: sumPayAmt,
  //     sumAppyAmt: formData.value.sumAppyAmt,
  //     sumPaidAmt: formData.value.sumPaidAmt,
  //     sumOwedAmt: formData.value.sumOwedAmt,
  //     payOutRate: payOutRate,
  //     paidPayRate: formData.value.paidPayRate,
  //     paidOutRate: paidOutRate,
  //     reqType: formData.value.reqType,
  //     finaTypeId: formData.value.finaTypeId,
  //     isRise: formData.value.isRise,
  //     leavePayAmt: formData.value.leavePayAmt,
  //     reqAmt: formData.value.reqAmt,
  //     pbAmount: formData.value.pbAmount,
  //     changeAmt: dedSumData.value.totalAmt,
  //     factReqAmt: actualReqAmt.value,
  //     reqDesc: formData.value.reqDesc,
  //     invRecAmt: (formData.value.sumAppyAmt ?? 0) + (formData.value.reqAmt ?? 0),
  //     invRcvdAmt: formData.value.invRcvdAmt ?? 0,
  //     invOweAmt: (formData.value.sumAppyAmt ?? 0) + (formData.value.reqAmt ?? 0) - (formData.value.invRcvdAmt ?? 0)-(invcSumData.value.totalAmt ?? 0),
  //     isModifyAcc: formData.value.isModifyAcc,
  //     bankName: formData.value.bankName,
  //     accountName: formData.value.accountName,
  //     bankAccount: formData.value.bankAccount,
  //     modifyAccAnnex :bankFileList.value[0]?.id,
  //     status: formData.value.status,
  //     payRule: formData.value.payRule,
  //     belongMonth: formData.value.belongMonth,
  //     payTypeId:formData.value.payTypeId,
  //     conStatus:formData.value.conStatus,
  //     isLastRec: formData.value.isLastPay,
  //     unlockAmt: formData.value.unlockAmt,
  //     payTypeIsCtrl: formData.value.payTypeIsCtrl,
  //     settledAmt: formData.value.settledAmt,
  //   },
  //   billDeds: !isOffsetByInvoice.value ? dedTable.value : [],
  //   invoiceMs: invoiceMTable.value ,
  //   invoiceDs: detailList.value ,
  //   payWays:!isOffsetByInvoice.value ? payWayTable.value : [],
  //   paySubs:!isOffsetByInvoice.value ? financeTable.value : [],
  // //  addProcesses: formData.value.addType == 1 ? tableList.value : [],
  //   annexList: baseFileList.value || [],
  // };
};

// 保存
const handleSave = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;
    const params = buildSubmitParams()
    const res = await outputDeclarationApi.saveProdVal(params);
    if (res.code === 200 && res.data) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      ElMessage.success("保存成功");
      emit("success", formData);
      formData.value.id = res.data;
      prodId.value = formData.value.id;
      await loadDetail();
    }
  } catch (error) {
    console.error("保存失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

// 提交
const handleSubmit = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    await new Promise((resolve) => setTimeout(resolve, 800));
    ElMessage.success("提交审批成功");
    emit("success", formData);
  } catch (error) {
    console.error("提交失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

const handleDelete = () => {
  if (isDetail.value) return;
  ElMessage.info("删除功能待实现");
};

const handleCancel = () => {
  if (isDetail.value) return;
  ElMessage.info("作废功能待实现");
};

const handleViewProcess = () => {
  ElMessage.info("查看流程待实现");
};

const declaraFileSuccess = (file: any) => {
  declaraFileList.value.push(file);
};
const handleFileSuccess = (file: any) => {
  annexFileList.value.push(file);
};

// 加载付款申请详情
const loadDetail = async () => {
  if (!prodId.value) return;
  try {
    // TODO: 调用详情接口
  } catch (error) {
    console.error("加载详情失败:", error);
  }
};
// 查询合同详情
const getConDetail = async (inputConId) => {
  if (!inputConId) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: inputConId,
    });
    console.log("合同详情", res);
    if (res.code === 200 && res.data) {
      const { conMain, conMainExt, billPayrates } = res.data;
      debugger
      if (formData.value.projId != conMain.projId) {
        await changeProject(conMain.projId);
        formData.value.projId = conMain.projId;
        //getBuildingListByProjId(conMain.projId);
      }
      billPayratesList.value = billPayrates || []; // 产值明细（非甲供材）的款项类型
      formData.value.conId = conMain?.id;
      formData.value.conName = conMain?.conName || "";
      formData.value.conPhyNo = conMain?.conPhyNo || "";
      formData.value.conSysNo = conMain?.conSysNo || "";
      formData.value.supId = conMain?.supId || "";
      formData.value.supName = conMain?.supName || "";
      formData.value.conTypeId = conMain?.conTypeId || "";
      formData.value.conTypeName = conMain?.conTypeName || "";
      formData.value.signAmt = conMain?.signAmt || "";
      formData.value.payMethod = conMain?.payMethod || "";
    }
  } catch (error) {}
};
// 查询合同累计数据
const getConTotal = async (inputConId) => {
  if (!inputConId) return;
  try {
    // 0=产值,1=应付,2=请款,3=已付,4=欠款,5=扣款,6=已扣,7=变更,8=签证
    const res = await cumulativeDataApi.getAccumData({
      conId: inputConId,
      typeList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    });
    console.log("合同累计数据", res);
    if (res.code === 200 && res.data) {
      const list = res.data || [];
      // 累加逻辑
      list.forEach((item) => {
        const total = item.archAmt + item.inTransAmt; // 归档 + 在途
        switch (item.type) {
          case 0: // 产值
            formData.value.sumProdVal += total;
            break;
          case 1: // 应付
            formData.value.sumPayAmt += total;
            break;
          case 2: // 请款
            formData.value.sumAppyAmt += total;
            break;
          case 3: // 已付
            formData.value.sumPaidAmt += total;
            break;
          case 4: // 欠款
            formData.value.sumOwedAmt += total;
            break;
          case 5: // 扣款
            formData.value.addAmt += total;
            break;
          case 6: // 已扣
            formData.value.preSettleAmt += total;
            break;
          case 7: // 变更
          case 8: // 签证
            formData.value.sumChangeAmt += total;
            break;
          default:
            break;
        }
      });
    }
  } catch (error) {}
};

const initData = async () => {
  loadingForm.value = true;
  try {
    await getProjectOptions(); // 获取项目数据

    if (isAdd.value) {
      await generateApplyNo();
      await getConDetail(conId); // 查询合同详情
      await getConTotal(conId); // 查询合同累计数据
    } else if (prodId.value) {
      await loadDetail();
    }
  }
  finally {
    loadingForm.value = false;
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

.detail-table {
  .header-content {
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;

    .header-title {
      font-size: 14px;
      color: #4e5969;
      font-weight: 500;
    }
  }
}

.annex-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;

  .el-link {
    font-size: 12px;
  }

  .el-button {
    font-size: 12px;
    padding: 0 4px;
  }
}
</style>
