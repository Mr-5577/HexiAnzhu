<!-- 产值申报 审批 -->
<template>
  <div class="basic-form-content">
    <BillHeader
      :title="'产值申报'"
      :contract-no="billData.bizNo || ''"
      :submitter="''"
      :submit-time="''"
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
        ref="formRef"
        :model="formData"
        :rules="formRules"
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
        <div class="item-card">
          <div class="section-title">合同信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="合同名称">
                <el-input
                  v-model="conMainData.conName"
                  disabled
                  placeholder="合同名称"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同编号">
                <el-input
                  v-model="conMainData.conPhyNo"
                  disabled
                  placeholder=" "
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="供应商名称" prop="supName">
                <el-input
                  v-model="conMainData.supName"
                  placeholder=" "
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同分类" prop="conTypeName">
                <el-input
                  v-model="conMainData.conTypeName"
                  placeholder=" "
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="生产专业" prop="productionMajor">
                <el-input
                  v-model="formData.productionMajor"
                  placeholder=" "
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="签约合同金额" prop="signAmt">
                <el-input-number
                  v-model="conMainData.signAmt"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="补充合同金额" prop="supplementAmount">
                <el-input-number
                  v-model="formData.supplementAmount"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="预结算合同金额" prop="preSettlementAmount">
                <el-input-number
                  v-model="formData.preSettlementAmount"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计变更签证" prop="totalChangeVisa">
                <el-input-number
                  v-model="formData.totalChangeVisa"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计产值" prop="totalOutputValue">
                <el-input-number
                  v-model="formData.totalOutputValue"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计应付" prop="totalPayable">
                <el-input-number
                  v-model="formData.totalPayable"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计请款" prop="totalRequest">
                <el-input-number
                  v-model="formData.totalRequest"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计实付" prop="totalPaid">
                <el-input-number
                  v-model="formData.totalPaid"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计欠款" prop="totalArrears">
                <el-input-number
                  v-model="formData.totalArrears"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
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
        </div>

        <!-- 产值信息 -->
        <div class="item-card">
          <div class="section-title">产值信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="产值申报方式">
                <el-select
                  v-model="conMainData.payMethod"
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
            </el-col>
          </el-row>
        </div>

        <!-- 材料合同产值 -->
        <div class="item-card">
          <div class="section-title">材料合同产值</div>

          <!-- 非甲供材 -->
          <div class="detail-table" v-if="conMainData.payMethod == 1">
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
              :editable="!isDetail && !billData.status"
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
          <div
            class="detail-table"
            v-if="formData.isSelfSupply == 1 && formData.selfSupplyType == 1"
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

          <!-- 产值明细 - 甲供材-零星 -->
          <div
            class="detail-table"
            v-if="formData.isSelfSupply == 1 && formData.selfSupplyType == 2"
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
              <template #actions="{ row }">
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
        </div>

        <!-- 本次申报后累计情况 -->
        <div class="item-card">
          <div class="section-title">本次申报后累计情况</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item
                label="累计产值(含本单)"
                prop="applyPayAmt"
                required
              >
                <el-input-number
                  v-model="formData.applyPayAmt"
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
              <el-form-item label="累计应付(含本单)" prop="costProdVal">
                <el-input-number
                  v-model="formData.costProdVal"
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
              <el-form-item label="累计未付(含本单)" prop="costPayAmt">
                <el-input-number
                  v-model="formData.costPayAmt"
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
        </div>

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
            />
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";
import BaseUpload from "@/components/base/base-upload.vue";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import BillHeader from "@/components/business/bill-components/bill-header.vue";
import BillInfo from "@/components/business/bill-components/bill-info.vue";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { PayTypeEnum } from "@/constants/contract-manage/enums";

defineOptions({ name: "output-value-approval-form" });

interface Props {
  mode?: "add" | "edit" | "detail";
  paymentId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  paymentId: undefined,
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

const mode = ref<"add" | "edit" | "detail">(props.mode);
const paymentId = ref<number | undefined>(props.paymentId);

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");

const segOptions = ref([]);
const projectOptions = ref([]);
const annexFileList = ref([]);

const conMainData = ref({
  conName: "", // 合同名称
  conPhyNo: "", // 合同编号
  supId: undefined,
  supName: "", // 供应商名称
  conTypeId: undefined,
  conTypeName: "", // 合同类别
  signAmt: 0, // 签约合同金额
  payMethod: undefined, // 产值确认方式
});

const billData = ref({
  id: undefined,
  bizTitle: "",
  bizNo: "",
  status: 0,
  bizItemCode: "NCON_PROC",
});

// ==================== 表单数据 ====================
const initFormData = () => ({
  id: undefined as number | undefined,
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

  conName: "",
  conNo: "",
  supplierName: "",
  productionMajor: "",
  conType: "",
  conAmount: 0,
  supplementAmount: 0,
  totalChangeVisa: 0,
  preSettlementAmount: 0,
  totalOutputValue: 0,
  totalPayable: 0,
  totalRequest: 0,
  totalPaid: 0,
  totalArrears: 0,
  payableOutputRatio: "",
  paidPayableRatio: "",
  paidOutputRatio: "",
  applyType: 1,
  applyNo: "",
  paymentType: "",
  planApplyAmount: 0,
  applyDesc: "",
  isSelfSupply: 0,
  selfSupplyType: undefined as number | undefined,
  declarationMode: undefined as number | undefined,
  applyProdVal: 0,
  applyPayAmt: 0,
  costProdVal: 0,
  costPayAmt: 0,
});

const formData = reactive<ReturnType<typeof initFormData>>(initFormData());

const formRules: FormRules = {
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  supplierName: [
    { required: true, message: "请输入供应商名称", trigger: "blur" },
  ],
  conType: [{ required: true, message: "请选择合同类别", trigger: "change" }],
  isSelfSupply: [
    { required: true, message: "请选择是否甲供材", trigger: "change" },
  ],
  declarationMode: [
    { required: true, message: "请选择产值申报方式", trigger: "change" },
  ],
  applyProdVal: [
    { required: true, message: "请输入本次申报产值", trigger: "blur" },
    { type: "number", min: 0, message: "申报产值不能小于0", trigger: "blur" },
  ],
  applyPayAmt: [
    { required: true, message: "请输入本次申报应付", trigger: "blur" },
    { type: "number", min: 0, message: "申报应付不能小于0", trigger: "blur" },
  ],
};

// ==================== 材料合同产值明细 - 甲供材-主材 ====================
const materialTable = ref<any[]>([]);
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
    label: "应付比例",
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
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "prodValPeriod",
    label: "产值期间",
    editable: true,
    editType: "number",
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
const materialMinorTable = ref<any[]>([]);
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
    label: "合同应付比例",
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
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "prodValPeriod",
    label: "产值期间",
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payDate",
    label: "计划付款期间",
    editable: true,
    editType: "date",
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
    prop: "annex",
    label: "接收明细附件",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    label: "操作",
    width: 100,
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
  };
  materialMinorTable.value = [...materialMinorTable.value, newRow];
};

const deleteMaterialMinor = (row: any) => {
  materialMinorTable.value = materialMinorTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

// ==================== 非甲供材 ====================
const nonSelfSupplyTable = ref<any[]>([]);
const nonSelfSupplyRef = ref();

const nonSelfSupplyColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "payType",
    label: "款项类型",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "dicLabel",
    optionValueField: "id",
    options: [],
    width: 120,
  },
  {
    prop: "payRate",
    label: "应付比例",
    editable: false,
    width: 120,
  },
  {
    prop: "isCtrl",
    label: "强控支付比例",
    editable: false,
    width: 120,
  },
  {
    prop: "payIntvl",
    label: "支付周期",
    editable: false,
    editType: "number",
    precision: 0,
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "applyProdVal",
    label: "本次申请产值",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "applyPayAmt",
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
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "prodValPeriod",
    label: "产值期间",
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payDate",
    label: "计划付款期间",
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

const addNonSelfSupply = () => {
  const newRow = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    payTypeId: undefined,
    payRate: 0,
    isCtrl: false,
    payIntvl: 0,
    applyProdVal: 0,
    payAmt: 0,
    buildPeriod: "",
    prodValPeriod: "",
    payDate: "",
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
    const res = await commonApi.getBillNo({ bizType: "QK" });
    if (res.code === 200 && res.data) {
      formData.applyNo = res.data;
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
      const { compName, compId, segId, segName } = res.data;
      formData.compId = compId || "";
      formData.compName = compName || "";
      formData.segId = segId || "";
      formData.segName = segName || "";
    }
  }
};

const calcRatios = () => {
  const { totalOutputValue, totalPayable, totalPaid } = formData;
  if (totalOutputValue > 0) {
    formData.payableOutputRatio = (
      (totalPayable / totalOutputValue) *
      100
    ).toFixed(2);
    formData.paidOutputRatio = ((totalPaid / totalOutputValue) * 100).toFixed(
      2,
    );
  } else {
    formData.payableOutputRatio = "0.00";
    formData.paidOutputRatio = "0.00";
  }
  if (totalPayable > 0) {
    formData.paidPayableRatio = ((totalPaid / totalPayable) * 100).toFixed(2);
  } else {
    formData.paidPayableRatio = "0.00";
  }
};

// 保存
const handleSave = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    calcRatios();

    await new Promise((resolve) => setTimeout(resolve, 800));
    ElMessage.success("保存成功");
    emit("success", formData);
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

    calcRatios();

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

const handleFileSuccess = (file: any) => {
  annexFileList.value.push(file);
};

// 加载付款申请详情
const loadDetail = async () => {
  if (!paymentId.value) return;
  try {
    // TODO: 调用详情接口
  } catch (error) {
    console.error("加载详情失败:", error);
  }
};
// 查询合同详情
const getConDetail = async () => {
  if (!conId) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: conId,
    });
    console.log("合同详情", res);
    if (res.code === 200 && res.data) {
      const { conMain, conMainExt } = res.data;
      conMainData.value.conName = conMain?.conName || "";
      conMainData.value.conPhyNo = conMain?.conPhyNo || "";
      conMainData.value.supId = conMain?.supId || "";
      conMainData.value.supName = conMain?.supName || "";
      conMainData.value.conTypeId = conMain?.conTypeId || "";
      conMainData.value.conTypeName = conMain?.conTypeName || "";
      conMainData.value.signAmt = conMain?.signAmt || "";
      conMainData.value.payMethod = conMain?.payMethod || "";
    }
  } catch (error) {}
};
const initData = async () => {
  await Promise.all([getSegOptions(), getProjectOptions()]);
  await getConDetail();
  formData.userName = userStore.userInfo?.empName || "";
  formData.createDate = new Date().toLocaleString();

  if (isAdd.value) {
    // await generateApplyNo();
  } else if (paymentId.value) {
    await loadDetail();
  }
};

watch(
  () => [formData.totalOutputValue, formData.totalPayable, formData.totalPaid],
  () => {
    calcRatios();
  },
  { deep: true },
);

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
</style>
