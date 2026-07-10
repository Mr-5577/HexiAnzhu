<!-- 合同台账基本信息 -->
<template>
  <div class="contract-basic-form">
    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="130px"
        class="adapt-form"
      >
        <!-- 基本信息 -->
        <BasicInfo
          v-model="formData"
          :company-options="companyOptions"
          :con-type-options="conTypeOptions"
          :project-options="projectOptions"
          :seg-options="segOptions"
          :supplier-options="supplierOptions"
          :pro-prof-options="proProfOptions"
          :acct-proj-options="acctProjOptions"
          :building-options="buildingOptions"
          @project-change="changeProject"
          @building-change="handleBuildingChange"
          @pay-method-change="handlePayMethodChange"
        />

        <!-- 拓展信息 -->
        <ExtendInfo v-model="formData" />

        <!-- 价款及税率 -->
        <PriceTaxSection v-model="priceTable" />

        <!-- 支付比例 -->
        <PayrateSection
          v-if="formData.payMethod == 1"
          v-model="payrateTable"
          :payment-type-options="paymentTypeOptions"
        />

        <!-- 材料产值 -->
        <MaterialSection
          v-if="formData.payMethod == 2"
          v-model="materialTable"
        />

        <!-- 支付节点 -->
        <PaynodeSection
          v-if="formData.payMethod == 3"
          v-model="paynodeTable"
          :payment-type-options="paymentTypeOptions"
        />
        <!-- 成本分摊 -->

        <!-- 合同附件 -->
        <div>
          <div class="section-title">合同附件</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="上传合同附件" prop="attachment">
                <base-upload
                  :showTip="false"
                  :file-list="formData.attachment"
                  @update:fileList="formData.attachment = $event"
                ></base-upload>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="成本分摊">
                <el-button type="primary" size="default">
                  设置成本分摊
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>

    <div class="btn-row">
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        保存
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { conTypeApi } from "@/api/cost/master-data/contract-category-api";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { commonApi } from "@/api/cost/common-api";
import { manageunitApi } from "@/api/cost/master-data/management-unit-api";
import { buildTree } from "@/utils/tree";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { bankCardRegex, idCardRegex, phoneRegex } from "@/utils/regex";
import { v4 as uuidv4 } from "uuid";

// 引入子组件
import BasicInfo from "./basic-info.vue";
import ExtendInfo from "./extend-info.vue";
import PriceTaxSection from "./price-tax-section.vue";
import PayrateSection from "./payrate-section.vue";
import MaterialSection from "./material-section.vue";
import PaynodeSection from "./paynode-section.vue";
import BaseUpload from "@/components/base/base-upload.vue";

defineOptions({ name: "contract-ledger-form" });

// Props
interface Props {
  mode?: "add" | "edit" | "detail";
  conId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  conId: undefined,
});

// Emits
const emit = defineEmits<{
  (e: "success", data: any): void;
  (e: "cancel"): void;
}>();

const userStore = useUserStore();

const mode = ref<"add" | "edit" | "detail">(props.mode);
const conId = ref<number | undefined>(props.conId);

const isDetailMode = computed(() => mode.value === "detail");
const isEditMode = computed(() => mode.value === "edit");
const isAddMode = computed(() => mode.value === "add");

// 表单数据定义
const initFormData = () => ({
  id: undefined,
  segId: undefined,
  projId: undefined,
  acctProjId: undefined,
  tenderItemId: undefined,
  companyId: undefined,
  conName: "",
  conSysNo: "",
  conPhyNo: "",
  conTypeId: undefined,
  conProperty: undefined,
  mainConId: undefined,
  supId: undefined,
  priceType: undefined,
  conStatus: 0,
  signAmt: undefined,
  signExclAmt: undefined,
  taxAmt: undefined,
  signDate: "",
  effectiveDate: "",
  expiryDate: "",
  daysNum: undefined,
  needSettle: true,
  settleAmt: undefined,
  flowId: undefined,
  agentId: undefined,
  proProf: undefined,
  bldIds: [],
  bldNames: "",
  pbAmount: undefined,
  manageType: undefined,
  payMethod: undefined,
  needSeal: false,
  sealTypes: [],
  signAddr: "",
  supCmanName: "",
  supCmanIdno: "",
  supCmanTel: "",
  supCmanJob: "",
  bankName: "",
  accountName: "",
  bankAccount: "",
  remark: "",
  attachment: [],
});

const formData = ref(initFormData());
const formRef = ref(null);
const submitLoading = ref(false);

// 下拉选项数据
const companyOptions = ref([]);
const buildingOptions = ref([]);
const segOptions = ref([]);
const conTypeOptions = ref([]);
const projectOptions = ref([]);
const supplierOptions = ref([]);
const proProfOptions = ref([]);
const acctProjOptions = ref([]);
const paymentTypeOptions = ref([]);

// 表格数据 - 父组件只负责存储，不负责增删改
const priceTable = ref([]);
const payrateTable = ref([]);
const materialTable = ref([]);
const paynodeTable = ref([]);

// 表单校验规则
const formRules = ref({
  conName: [{ required: true, message: "请输入合同名称", trigger: "blur" }],
  conTypeId: [{ required: true, message: "请选择合同分类", trigger: "change" }],
  conProperty: [
    { required: true, message: "请选择合同类型", trigger: "change" },
  ],
  companyId: [{ required: true, message: "请选择签约公司", trigger: "change" }],
  conSysNo: [
    { required: true, message: "请输入合同系统编号", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "合同系统编号只能包含英文大小写、数字和下划线",
      trigger: "blur",
    },
  ],
  conPhyNo: [
    { required: true, message: "请输入合同物理编号", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "合同物理编号只能包含英文大小写、数字和下划线",
      trigger: "blur",
    },
  ],
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  acctProjId: [
    { required: true, message: "请选择核算项目", trigger: "change" },
  ],
  supId: [{ required: true, message: "请选择供应商", trigger: "change" }],
  priceType: [{ required: true, message: "请选择计价方式", trigger: "change" }],
  manageType: [
    { required: true, message: "请选择管理类型", trigger: "change" },
  ],
  payMethod: [{ required: true, message: "请选择付款方式", trigger: "change" }],
  signAmt: [
    { required: true, message: "请输入签约金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
  ],
  signExclAmt: [
    { required: true, message: "请输入不含税金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
  ],
  taxAmt: [
    { required: true, message: "请输入税额", trigger: "blur" },
    { type: "number", min: 0, message: "税额不能小于0", trigger: "blur" },
  ],
  signDate: [{ required: true, message: "请选择签订日期", trigger: "change" }],
  effectiveDate: [
    { required: true, message: "请选择生效日期", trigger: "change" },
  ],
  expiryDate: [
    { required: true, message: "请选择到期日期", trigger: "change" },
  ],
  daysNum: [{ required: true, message: "请输入工期天数", trigger: "blur" }],
  pbAmount: [
    { required: true, message: "请输入履约保证金", trigger: "blur" },
    { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
  ],
  proProf: [{ required: true, message: "请选择生产专业", trigger: "change" }],
  bldIds: [{ required: true, message: "请选择楼栋", trigger: "change" }],
  settleAmt: [
    { required: true, message: "请输入结算金额", trigger: "blur" },
    { type: "number", min: 0, message: "结算金额不能小于0", trigger: "blur" },
  ],
  needSeal: [{ required: true, message: "请选择是否用印", trigger: "change" }],
  sealTypes: [{ required: true, message: "请选择印章类型", trigger: "change" }],
  signAddr: [{ required: true, message: "请输入签约地点", trigger: "blur" }],
  supCmanName: [
    { required: true, message: "请输入联系人姓名", trigger: "blur" },
  ],
  supCmanTel: [
    { required: true, message: "请输入联系人电话", trigger: "blur" },
    {
      pattern: phoneRegex,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
  supCmanIdno: [
    { required: true, message: "请输入联系人身份证", trigger: "blur" },
    {
      pattern: idCardRegex,
      message: "请输入正确的身份证号码",
      trigger: "blur",
    },
  ],
  supCmanJob: [
    { required: false, message: "请输入联系人职务", trigger: "blur" },
  ],
  bankName: [{ required: false, message: "请输入开户银行", trigger: "blur" }],
  accountName: [
    { required: false, message: "请输入银行户名", trigger: "blur" },
  ],
  bankAccount: [
    { required: false, message: "请输入银行账号", trigger: "blur" },
    {
      pattern: bankCardRegex,
      message: "请输入正确的银行卡号",
      trigger: "blur",
    },
  ],
});

// 获取签约公司列表
const getCompanyList = async () => {
  try {
    const res = await manageunitApi.getAuthMguList();
    if (res.code === 200) {
      companyOptions.value = buildTree(res.data || []);
    }
  } catch (error) {
    console.error("获取签约公司列表失败:", error);
  }
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

// 获取项目列表
const getProjectOptions = async () => {
  try {
    const res = await projectAreaApi.getMguProjList();
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};

// 获取供应商列表
const getSupplierList = async () => {
  try {
    const res = await supplierApi.getSupplierList({ supName: "" });
    if (res.code === 200) {
      supplierOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("加载供应商列表失败:", error);
  }
};

// 获取合同分类
const getConTypeList = async () => {
  try {
    const res = await conTypeApi.getConTypeList();
    if (res.code === 200) {
      conTypeOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取合同分类失败:", error);
  }
};

// 获取楼栋列表
const getBuildingListByProjId = async (projId: number) => {
  if (!projId) return;
  try {
    buildingOptions.value = [];
    const buildingRes = await projectAreaApi.getBuildingList({ projId });
    if (buildingRes.code === 200) {
      buildingOptions.value = buildingRes.data || [];
      if (formData.value.bldIds && formData.value.bldIds.length > 0) {
        const names = buildingOptions.value
          .filter((v: any) => formData.value.bldIds.includes(v.id))
          .map((v: any) => v.bldName);
        formData.value.bldNames = names.join(",");
      }
    }
  } catch (error) {
    console.error("获取楼栋列表失败:", error);
  }
};

// 初始化数据字典
const initDictData = async () => {
  await loadDicts();
  proProfOptions.value = getDictList(dictMapping.proProf);
  paymentTypeOptions.value = getDictList(dictMapping.paymentType);
};

// 数据字典
const { getDictList, loadDicts } = useDict(
  [dictMapping.proProf, dictMapping.paymentType],
  { treeDictCodes: [] },
);

// 生成合同编号
const createConNo = async () => {
  try {
    const conRes = await commonApi.getBillNo({ bizType: "HTBH" });
    if (conRes.code === 200) {
      formData.value.conSysNo = conRes.data;
      formData.value.conPhyNo = conRes.data;
    }
  } catch (error) {
    console.error("生成合同编号失败:", error);
  }
};

// 初始化所有下拉选项
const initOptions = async () => {
  await Promise.all([
    getCompanyList(),
    getSegOptions(),
    getProjectOptions(),
    getSupplierList(),
    getConTypeList(),
    initDictData(),
  ]);
};

// 选择项目
const changeProject = (id: number) => {
  formData.value.bldIds = [];
  formData.value.bldNames = "";
  if (id) {
    getBuildingListByProjId(id);
  }
};

// 楼栋选择变化
const handleBuildingChange = (ids: number[]) => {
  const names = buildingOptions.value
    .filter((v: any) => ids.includes(v.id))
    .map((v: any) => v.bldName);
  formData.value.bldNames = names.join(",");
};

// 切换付款方式
const handlePayMethodChange = (value: string) => {
  // payrateTable.value = [];
  // materialTable.value = [];
  // paynodeTable.value = [];
};

// 加载合同详情
const loadContractDetail = async () => {
  if (!conId.value) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: conId.value,
    });
    if (res.code === 200 && res.data) {
      const {
        conMain,
        conMainExt,
        billMaterials = [],
        billPaynodes = [],
        billPayrates = [],
        billPrices = [],
      } = res.data;
      formData.value = parseContractData(conMain, conMainExt);
      // 直接赋值给父组件的表格数据
      priceTable.value = billPrices.map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));
      payrateTable.value = billPayrates.map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));
      materialTable.value = billMaterials.map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));
      paynodeTable.value = billPaynodes.map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));
      if (conMain.projId) {
        await getBuildingListByProjId(conMain.projId);
      }
    }
  } catch (error) {
    console.error("获取合同信息失败:", error);
  }
};

// 解析回显数据
const parseContractData = (conMain: any, conMainExt: any) => {
  return {
    id: conMain.id,
    segId: conMain.segId,
    projId: conMain.projId,
    acctProjId: conMain.acctProjId,
    tenderItemId: conMain.tenderItemId,
    companyId: conMain.companyId,
    conName: conMain.conName,
    conSysNo: conMain.conSysNo,
    conPhyNo: conMain.conPhyNo,
    conTypeId: conMain.conTypeId,
    conProperty: conMain.conProperty,
    mainConId: conMain.mainConId,
    supId: conMain.supId,
    priceType: conMain.priceType,
    conStatus: conMain.conStatus,
    signAmt: conMain.signAmt,
    signExclAmt: conMain.signExclAmt,
    taxAmt: conMain.taxAmt,
    signDate: conMain.signDate,
    effectiveDate: conMain.effectiveDate,
    expiryDate: conMain.expiryDate,
    daysNum: conMain.daysNum,
    needSettle: conMain.needSettle,
    settleAmt: conMain.settleAmt,
    flowId: conMain.flowId,
    agentId: conMain.agentId,
    proProf: conMain.proProf,
    bldIds: conMain.bldIds ? conMain.bldIds.split(",").map(Number) : [],
    bldNames: conMain.bldNames || "",
    pbAmount: conMain.pbAmount,
    manageType: conMain.manageType,
    payMethod: conMain.payMethod,
    needSeal: conMainExt?.needSeal ?? false,
    sealTypes: conMainExt?.sealTypes ? conMainExt.sealTypes.split(",") : [],
    signAddr: conMainExt?.signAddr || "",
    supCmanName: conMainExt?.supCmanName || "",
    supCmanIdno: conMainExt?.supCmanIdno || "",
    supCmanTel: conMainExt?.supCmanTel || "",
    supCmanJob: conMainExt?.supCmanJob || "",
    bankName: conMainExt?.bankName || "",
    accountName: conMainExt?.accountName || "",
    bankAccount: conMainExt?.bankAccount || "",
    remark: conMainExt?.remark || "",
    attachment: [],
  };
};

// 构建提交参数
const buildSubmitParams = () => {
  return {
    conMain: {
      id: formData.value.id,
      segId: formData.value.segId,
      projId: formData.value.projId,
      acctProjId: formData.value.acctProjId,
      tenderItemId: formData.value.tenderItemId,
      companyId: formData.value.companyId,
      conName: formData.value.conName,
      conSysNo: formData.value.conSysNo,
      conPhyNo: formData.value.conPhyNo,
      conTypeId: formData.value.conTypeId,
      conProperty: formData.value.conProperty,
      mainConId: formData.value.mainConId,
      supId: formData.value.supId,
      priceType: formData.value.priceType,
      conStatus: formData.value.conStatus || 0,
      signAmt: formData.value.signAmt,
      signExclAmt: formData.value.signExclAmt,
      taxAmt: formData.value.taxAmt,
      signDate: formData.value.signDate,
      effectiveDate: formData.value.effectiveDate,
      expiryDate: formData.value.expiryDate,
      daysNum: formData.value.daysNum,
      needSettle: formData.value.needSettle,
      settleAmt: formData.value.settleAmt,
      flowId: formData.value.flowId,
      agentId: formData.value.agentId,
      proProf: formData.value.proProf,
      bldIds: formData.value.bldIds.join(","),
      bldNames: formData.value.bldNames,
      pbAmount: formData.value.pbAmount,
      manageType: formData.value.manageType,
      payMethod: formData.value.payMethod,
    },
    conMainExt: {
      id: formData.value.id,
      conId: formData.value.id,
      needSeal: formData.value.needSeal,
      sealTypes: formData.value.sealTypes.join(","),
      signAddr: formData.value.signAddr,
      supCmanName: formData.value.supCmanName,
      supCmanIdno: formData.value.supCmanIdno,
      supCmanTel: formData.value.supCmanTel,
      supCmanJob: formData.value.supCmanJob,
      bankName: formData.value.bankName,
      accountName: formData.value.accountName,
      bankAccount: formData.value.bankAccount,
      remark: formData.value.remark,
    },
    billPrices: priceTable.value,
    billPayrates: formData.value.payMethod == 1 ? payrateTable.value : [],
    billMaterials: formData.value.payMethod == 2 ? materialTable.value : [],
    billPaynodes: formData.value.payMethod == 3 ? paynodeTable.value : [],
    annexes: [],
  };
};

// 校验价税明细表
const validatePriceTable = () => {
  if (priceTable.value.length === 0) {
    ElMessage.error("价税明细列表不能为空");
    return false;
  }
  for (let i = 0; i < priceTable.value.length; i++) {
    const item = priceTable.value[i];
    if (!item.itemName || item.itemName.trim() === "") {
      ElMessage.error(`价税明细列表第${i + 1}行：分项名称不能为空`);
      return false;
    }
    if (!item.itemAmt || item.itemAmt <= 0) {
      ElMessage.error(`价税明细列表第${i + 1}行：分项含税总额必须大于0`);
      return false;
    }
    if (!item.itemTaxRate || item.itemTaxRate < 0) {
      ElMessage.error(`价税明细列表第${i + 1}行：税率不能为空且不能小于0`);
      return false;
    }
    if (!item.itemExclAmt || item.itemExclAmt <= 0) {
      ElMessage.error(`价税明细列表第${i + 1}行：分项不含税总额必须大于0`);
      return false;
    }
    if (!item.itemTaxAmt || item.itemTaxAmt < 0) {
      ElMessage.error(`价税明细列表第${i + 1}行：分项总额必须大于等于0`);
      return false;
    }
  }
  return true;
};

// 校验支付比例明细表
const validatePayrateTable = () => {
  if (payrateTable.value.length === 0) {
    ElMessage.error("支付比例明细列表不能为空");
    return false;
  }
  for (let i = 0; i < payrateTable.value.length; i++) {
    const item = payrateTable.value[i];
    if (!item.payTypeId) {
      ElMessage.error(`支付比例明细列表第${i + 1}行：请选择款项类型`);
      return false;
    }
    if (!item.payRate || item.payRate <= 0) {
      ElMessage.error(`支付比例明细列表第${i + 1}行：应付比例必须大于0`);
      return false;
    }
    if (!item.prodVal || item.prodVal <= 0) {
      ElMessage.error(
        `支付比例明细列表第${i + 1}行：本次申请产值金额必须大于0`,
      );
      return false;
    }
    if (!item.payAmt || item.payAmt <= 0) {
      ElMessage.error(
        `支付比例明细列表第${i + 1}行：本次申报应付金额必须大于0`,
      );
      return false;
    }
    if (!item.costProdVal || item.costProdVal <= 0) {
      ElMessage.error(
        `支付比例明细列表第${i + 1}行：成本复核产值金额必须大于0`,
      );
      return false;
    }
    if (!item.costPayAmt || item.costPayAmt <= 0) {
      ElMessage.error(
        `支付比例明细列表第${i + 1}行：成本复核应付金额必须大于0`,
      );
      return false;
    }
  }
  return true;
};

// 校验材料产值明细表
const validateMaterialTable = () => {
  if (materialTable.value.length === 0) {
    ElMessage.error("材料产值明细列表不能为空");
    return false;
  }
  for (let i = 0; i < materialTable.value.length; i++) {
    const item = materialTable.value[i];
    if (!item.mtModel || item.mtModel.trim() === "") {
      ElMessage.error(`材料产值明细列表第${i + 1}行：材料规格不能为空`);
      return false;
    }
    if (!item.payRate || item.payRate <= 0) {
      ElMessage.error(`材料产值明细列表第${i + 1}行：应付比例必须大于0`);
      return false;
    }
    if (!item.payAmt || item.payAmt <= 0) {
      ElMessage.error(
        `材料产值明细列表第${i + 1}行：本次申报应付金额必须大于0`,
      );
      return false;
    }
    if (!item.costProdVal || item.costProdVal <= 0) {
      ElMessage.error(
        `材料产值明细列表第${i + 1}行：成本复核产值金额必须大于0`,
      );
      return false;
    }
    if (!item.costPayAmt || item.costPayAmt <= 0) {
      ElMessage.error(
        `材料产值明细列表第${i + 1}行：成本复核应付金额必须大于0`,
      );
      return false;
    }
  }
  return true;
};

// 校验支付节点明细表
const validatePaynodeTable = () => {
  if (paynodeTable.value.length === 0) {
    ElMessage.error("支付节点明细列表不能为空");
    return false;
  }
  for (let i = 0; i < paynodeTable.value.length; i++) {
    const item = paynodeTable.value[i];
    if (!item.nodeName || item.nodeName.trim() === "") {
      ElMessage.error(`支付节点明细列表${i + 1}行：支付节点名称不能为空`);
      return false;
    }
    if (!item.payType) {
      ElMessage.error(`支付节点明细列表${i + 1}行：请选择款项类型`);
      return false;
    }
    if (!item.prodVal || item.prodVal <= 0) {
      ElMessage.error(`支付节点明细列表${i + 1}行：产值金额必须大于0`);
      return false;
    }
    if (!item.payRate || item.payRate <= 0) {
      ElMessage.error(`支付节点明细列表${i + 1}行：应付比例必须大于0`);
      return false;
    }
    if (!item.payAmt || item.payAmt <= 0) {
      ElMessage.error(`支付节点明细列表第${i + 1}行：应付金额必须大于0`);
      return false;
    }
    if (!item.costProdVal || item.costProdVal <= 0) {
      ElMessage.error(
        `支付节点明细列表第${i + 1}行：成本复核产值金额必须大于0`,
      );
      return false;
    }
    if (!item.costPayAmt || item.costPayAmt <= 0) {
      ElMessage.error(
        `支付节点明细列表第${i + 1}行：成本复核应付金额必须大于0`,
      );
      return false;
    }
  }
  return true;
};

// 提交表单
const handleSubmit = async () => {
  if (isDetailMode.value) return;
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    // if (!validatePriceTable()) return;
    // if (!validatePayrateTable()) return;
    // if (!validateMaterialTable()) return;
    // if (!validatePaynodeTable()) return;

    submitLoading.value = true;
    const params = buildSubmitParams();
    let res;
    if (formData.value.id) {
      res = await contractLedgerApi.editContractLedger(params);
    } else {
      res = await contractLedgerApi.addContractLedger(params);
    }
    if (res.code === 200) {
      ElMessage.success(formData.value.id ? "编辑成功" : "新增成功");
      emit("success", res.data);
    }
  } catch (error) {
    console.log(error);
  } finally {
    submitLoading.value = false;
  }
};

// 初始化
const initData = async () => {
  await initOptions();

  if (isAddMode.value) {
    formData.value.agentId = userStore.userInfo.id;
    await createConNo();
  } else if (isEditMode.value || isDetailMode.value) {
    if (conId.value) {
      await loadContractDetail();
    }
  }
};

onMounted(() => {
  initData();
});

// 暴露方法
defineExpose({
  formData,
  resetForm: () => {
    formData.value = initFormData();
    priceTable.value = [];
    payrateTable.value = [];
    materialTable.value = [];
    paynodeTable.value = [];
    if (formRef.value) {
      formRef.value.resetFields();
    }
  },
  initData,
});
</script>

<style scoped lang="scss">
.contract-basic-form {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 6px;
  overflow: hidden;
  padding: 0 10px;
}

.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 15px 15px 0;
  box-sizing: border-box;
}

.adapt-form {
  width: 100%;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 10px 0 10px 0;
  padding-left: 10px;
  position: relative;
  &::before {
    content: "";
    width: 4px;
    height: 16px;
    background: #409eff;
    border-radius: 2px;
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
  }
}

.btn-row {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 24px 30px;
  border-top: 1px solid #eef2f6;
  background: #ffffff;
  flex-shrink: 0;
  gap: 12px;

  .el-button {
    min-width: 88px;
  }
}
</style>
