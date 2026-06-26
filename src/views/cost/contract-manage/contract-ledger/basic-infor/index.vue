<!-- 合同台账基本信息 - 纯展示模式 -->
<template>
  <div class="contract-basic-form">
    <div class="form-scroll-area">
      <!-- 基本信息 -->
      <div class="section-title">基本信息</div>
      <el-descriptions :column="4" class="info-descriptions">
        <el-descriptions-item label="合同名称：" :span="1">
          {{ formData.conName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="合同分类：" :span="1">
          {{ formData.conTypeId || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="签约公司：" :span="1">
          {{ formData.companyId || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="合同类型：" :span="1">
          {{ formData.conProperty || "-" }}
        </el-descriptions-item>

        <el-descriptions-item label="合同系统编号：" :span="1">
          {{ formData.conSysNo || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="合同档案编号：" :span="1">
          {{ formData.conPhyNo || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="项目名称：" :span="1">
          {{ getProjectName(formData.projId) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="业务板块：" :span="1">
          {{ getSegName(formData.segId) || "-" }}
        </el-descriptions-item>

        <el-descriptions-item label="核算项目：" :span="1">
          {{ getAcctProjName(formData.acctProjId) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="供应商：" :span="1">
          {{ getSupplierName(formData.supId) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="计价方式：" :span="1">
          {{ formData.priceType || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="管理类型：" :span="1">
          {{ formData.manageType || "-" }}
        </el-descriptions-item>

        <el-descriptions-item label="付款方式：" :span="1">
          {{ formData.payMethod || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="签约金额(含税)：" :span="1">
          {{ formData.signAmt }}
        </el-descriptions-item>
        <el-descriptions-item label="签约金额(不含税)：" :span="1">
          {{ formData.signExclAmt }}
        </el-descriptions-item>
        <el-descriptions-item label="税额：" :span="1">
          {{ formData.taxAmt }}
        </el-descriptions-item>

        <el-descriptions-item label="签订日期：" :span="1">
          {{ formData.signDate || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="生效日期：" :span="1">
          {{ formData.effectiveDate || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="到期日期：" :span="1">
          {{ formData.expiryDate || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="工期(天)：" :span="1">
          {{ formData.daysNum ?? "-" }}
        </el-descriptions-item>

        <el-descriptions-item label="履约保证金：" :span="1">
          {{ formData.pbAmount }}
        </el-descriptions-item>
        <el-descriptions-item label="生产专业：" :span="1">
          {{ getProProfName(formData.proProf) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="楼栋范围：" :span="1">
          {{ formData.bldNames || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="结算金额：" :span="1">
          {{ formData.settleAmt }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 拓展信息 -->
      <div class="section-title">拓展信息</div>
      <el-descriptions :column="4" class="info-descriptions">
        <el-descriptions-item label="是否用印：" :span="1">
          {{ formData.needSeal ? "是" : "否" }}
        </el-descriptions-item>
        <el-descriptions-item label="印章类型：" :span="1">
          {{ getSealTypesText(formData.sealTypes) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="签约地点：" :span="1">
          {{ formData.signAddr || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="供应商联系人：" :span="1">
          {{ formData.supCmanName || "-" }}
        </el-descriptions-item>

        <el-descriptions-item label="联系人电话：" :span="1">
          {{ formData.supCmanTel || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="联系人身份证：" :span="1">
          {{ formData.supCmanIdno || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="联系人职务：" :span="1">
          {{ formData.supCmanJob || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="开户银行：" :span="1">
          {{ formData.bankName || "-" }}
        </el-descriptions-item>

        <el-descriptions-item label="银行户名：" :span="1">
          {{ formData.accountName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="银行账号：" :span="1">
          {{ formData.bankAccount || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ formData.remark || "-" }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 价款及税率 -->
      <div class="section-title">价款及税率</div>
      <el-descriptions :column="4" class="info-descriptions">
        <el-descriptions-item label="合同总价(含税)：" :span="1">
          {{ priceTaxData.totalPriceTax }}
        </el-descriptions-item>
        <el-descriptions-item label="合同总价(不含税)：" :span="1">
          {{ priceTaxData.totalPrice }}
        </el-descriptions-item>
        <el-descriptions-item label="税额：" :span="1">
          {{ priceTaxData.taxAmount }}
        </el-descriptions-item>
        <el-descriptions-item label="税率：" :span="1">
          {{ priceTaxData.taxRate ? priceTaxData.taxRate + "%" : "-" }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 价税明细 -->
      <div style="height: 200px">
        <div class="section-title">价税明细</div>
        <base-table
          :columns="priceColumns"
          :tableData="priceTable"
          :rowKey="'uuid'"
          :height="'160px'"
          :pagination="false"
          :loading="false"
        />
      </div>

      <!-- 支付比例 -->
      <div style="height: 200px">
        <div class="section-title">支付比例</div>
        <base-table
          :columns="payrateColumns"
          :tableData="payrateTable"
          :rowKey="'uuid'"
          :height="'160px'"
          :pagination="false"
          :loading="false"
        />
      </div>

      <!-- 材料合同产值 -->
      <div style="height: 200px">
        <div class="section-title">材料合同产值</div>
        <base-table
          :columns="materialColumns"
          :tableData="materialTable"
          :rowKey="'uuid'"
          :height="'160px'"
          :pagination="false"
          :loading="false"
        />
      </div>

      <!-- 支付节点 -->
      <div style="height: 200px">
        <div class="section-title">支付节点</div>
        <base-table
          :columns="paynodeColumns"
          :tableData="paynodeTable"
          :rowKey="'uuid'"
          :height="'160px'"
          :pagination="false"
          :loading="false"
        />
      </div>

      <!-- 合同附件 -->
      <div class="section-title">合同附件</div>
      <el-descriptions :column="1" class="info-descriptions">
        <el-descriptions-item label="合同附件："> 13213 </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { conTypeApi } from "@/api/cost/master-data/contract-category-api";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { manageunitApi } from "@/api/cost/master-data/management-unit-api";
import { buildTree } from "@/utils/tree";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import {
  ConPropertyEnum,
  PriceTypeEnum,
  ManageTypeEnum,
  PayTypeEnum,
  SealTypesEnum,
} from "@/constants/contract-manage/enums";
import BaseTable from "@/components/base/base-table.vue";
import type { TableColumnItem } from "@/components/base/base-table.vue";
import { v4 as uuidv4 } from "uuid";

defineOptions({ name: "contract-ledger-view" });

const route = useRoute();

const conId = ref(null);

// 表单数据定义
const initFormData = () => ({
  id: null,
  segId: null,
  projId: null,
  acctProjId: null,
  tenderItemId: null,
  companyId: null,
  conName: "",
  conSysNo: "",
  conPhyNo: "",
  conTypeId: null,
  conProperty: null,
  mainConId: null,
  supId: null,
  priceType: null,
  conStatus: 0,
  signAmt: null,
  signExclAmt: null,
  taxAmt: null,
  signDate: "",
  effectiveDate: "",
  expiryDate: "",
  daysNum: null,
  needSettle: true,
  settleAmt: null,
  flowId: null,
  agentId: null,
  proProf: null,
  bldIds: [],
  bldNames: "",
  pbAmount: null,
  manageType: null,
  payMethod: null,
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
});

const formData = ref(initFormData());

// 下拉选项数据（用于显示名称映射）
const companyOptions = ref([]);
const segOptions = ref([]);
const conTypeOptions = ref([]);
const projectOptions = ref([]);
const supplierOptions = ref([]);
const proProfOptions = ref([]);
const acctProjOptions = ref([]);
const paymentTypeOptions = ref([]);
const payRateOptions = ref([
  { id: 1, name: "节点" },
  { id: 2, name: "比例" },
  { id: 3, name: "材料" },
]);

// 明细表数据
const priceTable = ref<any[]>([]);
const payrateTable = ref<any[]>([]);
const materialTable = ref<any[]>([]);
const paynodeTable = ref<any[]>([]);

// 价款汇总计算
const priceTaxData = computed(() => {
  const totalPriceTax = priceTable.value.reduce(
    (sum, item) => sum + (Number(item.itemAmt) || 0),
    0,
  );
  const totalPrice = priceTable.value.reduce(
    (sum, item) => sum + (Number(item.itemExclAmt) || 0),
    0,
  );
  const taxAmount = priceTable.value.reduce(
    (sum, item) => sum + (Number(item.itemTaxAmt) || 0),
    0,
  );
  let taxRate = 0;
  if (totalPrice > 0) {
    taxRate = Math.round((taxAmount / totalPrice) * 100 * 100) / 100;
  }
  return { totalPriceTax, totalPrice, taxAmount, taxRate };
});

// ============ 价税明细列配置 ============
const priceColumns = computed<TableColumnItem[]>(() => [
  { type: "index", label: "序号", width: 60 },
  { prop: "itemName", label: "分项名称", minWidth: 120 },
  {
    prop: "itemAmt",
    label: "分项含税总额",
    minWidth: 130,
  },
  {
    prop: "itemTaxRate",
    label: "税率",
    minWidth: 100,
    formatter: (row: any) => row.itemTaxRate ?? "-" + "%",
  },
  {
    prop: "itemExclAmt",
    label: "分项不含税额",
    minWidth: 130,
  },
  {
    prop: "itemTaxAmt",
    label: "分项税额",
    minWidth: 120,
  },
  { prop: "remark", label: "备注", minWidth: 120 },
]);

// ============ 支付比例列配置 ============
const payrateColumns = computed<TableColumnItem[]>(() => [
  { type: "index", label: "序号", width: 60 },
  {
    prop: "payRateId",
    label: "支付比例",
    minWidth: 100,
  },
  {
    prop: "payTypeId",
    label: "款项类型",
    minWidth: 100,
    formatter: (row: any) => getPaymentTypeName(row.payTypeId) || "-",
  },
  {
    prop: "payRate",
    label: "应付比例(%)",
    minWidth: 110,
    formatter: (row: any) => row.payRate ?? "-",
  },
  {
    prop: "isCtrl",
    label: "是否强控",
    minWidth: 90,
    formatter: (row: any) => (row.isCtrl ? "是" : "否"),
  },
  {
    prop: "payIntvl",
    label: "支付周期(月)",
    minWidth: 110,
    formatter: (row: any) => row.payIntvl ?? "-",
  },
  {
    prop: "prodVal",
    label: "本次申请产值金额",
    minWidth: 140,
  },
  {
    prop: "payAmt",
    label: "本次申报应付金额",
    minWidth: 140,
  },
  { prop: "buildPeriod", label: "施工期间", minWidth: 120 },
  { prop: "prodValPeriod", label: "产值期间", minWidth: 120 },
  { prop: "payDate", label: "计划付款日期", minWidth: 120 },
  {
    prop: "costProdVal",
    label: "成本复核产值金额",
    minWidth: 150,
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付金额",
    minWidth: 150,
  },
]);

// ============ 材料合同产值列配置 ============
const materialColumns = computed<TableColumnItem[]>(() => [
  { type: "index", label: "序号", width: 60 },
  { prop: "mtName", label: "材料名称", minWidth: 120 },
  { prop: "mtModel", label: "材料规格", minWidth: 100 },
  { prop: "mtBrand", label: "品牌", minWidth: 100 },
  {
    prop: "recvNum",
    label: "接收数量",
    minWidth: 100,
    formatter: (row: any) => row.recvNum ?? "-",
  },
  { prop: "mtUnit", label: "计量单位", minWidth: 90 },
  { prop: "recvBillNo", label: "接收单号", minWidth: 120 },
  {
    prop: "recvPrice",
    label: "接收价格",
    minWidth: 110,
  },
  {
    prop: "fineAmt",
    label: "罚款",
    minWidth: 100,
  },
  {
    prop: "prodVal",
    label: "产值总金额",
    minWidth: 120,
  },
  {
    prop: "payRate",
    label: "应付比例",
    minWidth: 100,
    formatter: (row: any) => (row.payRate ?? "-") + "%",
  },
  {
    prop: "payAmt",
    label: "本次申报应付金额",
    minWidth: 150,
  },
  { prop: "buildPeriod", label: "施工期间", minWidth: 120 },
  { prop: "prodValPeriod", label: "产值期间", minWidth: 120 },
  { prop: "payDate", label: "计划付款日期", minWidth: 120 },
  {
    prop: "costProdVal",
    label: "成本复核产值金额",
    minWidth: 150,
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付金额",
    minWidth: 150,
  },
]);

// ============ 支付节点列配置 ============
const paynodeColumns = computed<TableColumnItem[]>(() => [
  { type: "index", label: "序号", width: 60 },
  { prop: "nodeName", label: "支付节点", minWidth: 120 },
  {
    prop: "payType",
    label: "款项类型",
    minWidth: 100,
    formatter: (row: any) => getPaymentTypeName(row.payType) || "-",
  },
  {
    prop: "prodVal",
    label: "产值金额",
    minWidth: 120,
  },
  {
    prop: "payRate",
    label: "应付比例",
    minWidth: 100,
    formatter: (row: any) => (row.payRate ?? "-") + "%",
  },
  {
    prop: "payAmt",
    label: "应付金额",
    minWidth: 120,
  },
  { prop: "payDate", label: "计划付款日期", minWidth: 120 },
  {
    prop: "costProdVal",
    label: "成本复核产值金额",
    minWidth: 150,
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付金额",
    minWidth: 150,
  },
  { prop: "remark", label: "备注", minWidth: 120 },
]);

// 数据字典
const { getDictList, loadDicts } = useDict(
  [dictMapping.proProf, dictMapping.paymentType],
  { treeDictCodes: [] },
);

// 获取名称映射方法
const getConTypeName = (id: number) => {
  const find = (list: any[], targetId: number): string => {
    for (const item of list) {
      if (item.id === targetId) return item.conTypeName;
      if (item.children) {
        const result = find(item.children, targetId);
        if (result) return result;
      }
    }
    return "";
  };
  return find(conTypeOptions.value, id);
};

const getCompanyName = (id: number) => {
  const find = (list: any[], targetId: number): string => {
    for (const item of list) {
      if (item.id === targetId) return item.mguName;
      if (item.children) {
        const result = find(item.children, targetId);
        if (result) return result;
      }
    }
    return "";
  };
  return find(companyOptions.value, id);
};

const getProjectName = (id: number) => {
  const find = (list: any[], targetId: number): string => {
    for (const item of list) {
      if (item.orgId === targetId) return item.orgName;
      if (item.children) {
        const result = find(item.children, targetId);
        if (result) return result;
      }
    }
    return "";
  };
  return find(projectOptions.value, id);
};

const getSegName = (id: number) => {
  const item = segOptions.value.find((v: any) => v.id === id);
  return item?.segName || "";
};

const getSupplierName = (id: number) => {
  const item = supplierOptions.value.find((v: any) => v.id === id);
  return item?.supName || "";
};

const getAcctProjName = (id: number) => {
  const item = acctProjOptions.value.find((v: any) => v.id === id);
  return item?.dicLabel || "";
};

const getProProfName = (id: number) => {
  const item = proProfOptions.value.find((v: any) => v.id === id);
  return item?.dicLabel || "";
};

const getPaymentTypeName = (id: number) => {
  const item = paymentTypeOptions.value.find((v: any) => v.id === id);
  return item?.dicLabel || "";
};

const getSealTypesText = (types: string[]) => {
  if (!types || types.length === 0) return "";
  return types
    .map((v: string) => {
      const item = SealTypesEnum.find((e: any) => e.value === v);
      return item?.label || v;
    })
    .join("、");
};

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

// 初始化数据字典
const initDictData = async () => {
  await loadDicts();
  proProfOptions.value = getDictList(dictMapping.proProf);
  paymentTypeOptions.value = getDictList(dictMapping.paymentType);
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
  };
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
      materialTable.value = billMaterials.map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));
      paynodeTable.value = billPaynodes.map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));
      payrateTable.value = billPayrates.map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));
      priceTable.value = billPrices.map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));
    }
  } catch (error) {
    console.error("获取合同信息失败:", error);
  }
};

// 初始化
const init = async () => {
  const idValue = route.query.conId ? Number(route.query.conId) : null;
  conId.value = idValue || null;

  await initOptions();
  await loadContractDetail();
};

onMounted(() => {
  init();
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
  padding: 0 15px 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 16px 0 12px 0;
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

:deep(.el-descriptions) {
  margin-bottom: 0;
}
.info-descriptions {
  :deep(.el-descriptions__label) {
    // width: 130px;          // 固定宽度
    // background-color: #fafafa;
    // font-weight: 500;
    margin-right: 2px;
  }
  :deep(.el-descriptions__content) {
    word-break: break-all;
  }
}
</style>
