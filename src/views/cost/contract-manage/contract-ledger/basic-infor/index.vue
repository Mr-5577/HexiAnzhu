<template>
  <div class="contract-basic">
    <!-- 价款及税率汇总 -->
    <section class="cb-header">
      <SummaryBar :items="summaryItems" />
    </section>

    <div class="form-scroll-area" ref="scrollAreaRef">
      <!-- 锚点导航：粘性吸顶，长表单快速跳转 -->
      <nav class="cb-anchor" v-if="sections.length">
        <button
          v-for="s in sections"
          :key="s.id"
          type="button"
          class="cb-anchor__item"
          :class="{ 'is-active': activeSection === s.id }"
          @click="scrollToSection(s.id)"
        >{{ s.title }}</button>
      </nav>

      <!-- 基本信息 -->
      <section class="cb-card" id="sec-basic">
        <h3 class="cb-card__title">基本信息</h3>
        <el-descriptions :column="4" border class="info-descriptions info-descriptions--grid">
          <el-descriptions-item
            v-for="item in basicFields"
            :key="item.label"
            :label="item.label"
            :span="item.span || 1"
          >
            <span :class="{ 'cb-money': item.money }">{{ item.value }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </section>

<!--  拓展信息  
      <section class="cb-card" id="sec-extend">
        <h3 class="cb-card__title">拓展信息</h3>
        <el-descriptions :column="4" border class="info-descriptions info-descriptions--grid">
          <el-descriptions-item
            v-for="item in extendFields"
            :key="item.label"
            :label="item.label"
            :span="item.span || 1"
          >
            <span :class="{ 'cb-money': item.money }">{{ item.value }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </section> -->

      <!-- 合同概况 -->
      <section class="cb-card" id="sec-overview">
        <h3 class="cb-card__title">合同概况</h3>
        <el-descriptions :column="1" border class="info-descriptions">
          <el-descriptions-item
            v-for="item in overviewFields"
            :key="item.label"
            :label="item.label"
            :span="item.span || 1"
          >
            <span :class="{ 'cb-money': item.money }">{{ item.value }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <!-- 表格区块 v-for：消除重复 -->
      <section
        v-for="t in tableSections"
        :key="t.id"
        class="cb-card"
        :id="t.id"
      >
        <h3 class="cb-card__title">{{ t.title }}</h3>
        <base-table
          :columns="t.columns"
          :tableData="t.data"
          row-key="uuid"
          height="200px"
          :pagination="false"
          :loading="loading"
          compact-empty
        />
      </section>
    </div>

    <!-- 回到顶部 -->
    <transition name="fade">
      <button
        v-show="showBackTop"
        type="button"
        class="cb-backtop"
        title="回到顶部"
        @click="backToTop"
      >↑</button>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { getEnumLabel, getEnumType } from "@/utils/enum";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
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
import { conBillStatusEnum } from "@/constants/contract-manage/enums";


// 数字格式化工具
const fmtNum = (val: number | string | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || val === "") return "-";
  const num = Number(val);
  if (Number.isNaN(num)) return "-";
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
// 金额：¥ + 千分位 + 2 位小数；空值返回 "-"
const fmtMoney = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === "") return "-";
  return "¥" + fmtNum(val);
};

// 价款汇总条数据
const summaryItems = computed(() => [
  { label: "合同总价(含税)", value: fmtMoney(priceTaxData.value.totalPriceTax) },
  { label: "合同总价(不含税)", value: fmtMoney(priceTaxData.value.totalPrice) },
  { label: "税额", value: fmtMoney(priceTaxData.value.taxAmount), type: "tax" as const },
  { label: "综合税率", value: `${priceTaxData.value.taxRate}%`, type: "tax" as const },
]);

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
  companyName: null,
  conName: "",
  conSysNo: "",
  conPhyNo: "",
  conTypeId: null,
  conTypeName: null,
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
const priceTable = ref([]);
const payrateTable = ref([]);
const materialTable = ref([]);
const paynodeTable = ref([]);

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
    formatter: (row: any) => fmtNum(row.itemAmt),
  },
  {
    prop: "itemTaxRate",
    label: "税率",
    minWidth: 100,
    formatter: (row: any) => `${row.itemTaxRate ?? "-"}%`,
  },
  {
    prop: "itemExclAmt",
    label: "分项不含税额",
    minWidth: 130,
    formatter: (row: any) => fmtNum(row.itemExclAmt),
  },
  {
    prop: "itemTaxAmt",
    label: "分项税额",
    minWidth: 120,
    formatter: (row: any) => fmtNum(row.itemTaxAmt),
  },
  { prop: "remark", label: "备注", minWidth: 120 },
]);

// ============ 支付比例列配置 ============
const payrateColumns = computed<TableColumnItem[]>(() => [
  { type: "index", label: "序号", width: 60 },
  // {
  //   prop: "payRateId",
  //   label: "支付比例",
  //   minWidth: 100,
  // },
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
    formatter: (row: any) => `${row.payRate ?? "-"}%`,
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
  // {
  //   prop: "prodVal",
  //   label: "本次申请产值金额",
  //   minWidth: 140,
  //   formatter: (row: any) => fmtNum(row.prodVal),
  // },
  // {
  //   prop: "payAmt",
  //   label: "本次申报应付金额",
  //   minWidth: 140,
  //   formatter: (row: any) => fmtNum(row.payAmt),
  // },
  // { prop: "buildPeriod", label: "施工期间", minWidth: 120 },
  // { prop: "prodValPeriod", label: "产值期间", minWidth: 120 },
  // { prop: "payDate", label: "计划付款日期", minWidth: 120 },
  // {
  //   prop: "costProdVal",
  //   label: "成本复核产值金额",
  //   minWidth: 150,
  //   formatter: (row: any) => fmtNum(row.costProdVal),
  // },
  // {
  //   prop: "costPayAmt",
  //   label: "成本复核应付金额",
  //   minWidth: 150,
  //   formatter: (row: any) => fmtNum(row.costPayAmt),
  // },
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
    formatter: (row: any) => fmtNum(row.recvPrice),
  },
  {
    prop: "fineAmt",
    label: "罚款",
    minWidth: 100,
    formatter: (row: any) => fmtNum(row.fineAmt),
  },
  {
    prop: "prodVal",
    label: "产值总金额",
    minWidth: 120,
    formatter: (row: any) => fmtNum(row.prodVal),
  },
  {
    prop: "payRate",
    label: "应付比例",
    minWidth: 100,
    formatter: (row: any) => `${row.payRate ?? "-"}%`,
  },
  {
    prop: "payAmt",
    label: "本次申报应付金额",
    minWidth: 150,
    formatter: (row: any) => fmtNum(row.payAmt),
  },
  { prop: "buildPeriod", label: "施工期间", minWidth: 120 },
  { prop: "prodValPeriod", label: "产值期间", minWidth: 120 },
  { prop: "payDate", label: "计划付款日期", minWidth: 120 },
  {
    prop: "costProdVal",
    label: "成本复核产值金额",
    minWidth: 150,
    formatter: (row: any) => fmtNum(row.costProdVal),
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付金额",
    minWidth: 150,
    formatter: (row: any) => fmtNum(row.costPayAmt),
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
    formatter: (row: any) => fmtNum(row.prodVal),
  },
  {
    prop: "payRate",
    label: "应付比例",
    minWidth: 100,
    formatter: (row: any) => `${row.payRate ?? "-"}%`,
  },
  {
    prop: "payAmt",
    label: "应付金额",
    minWidth: 120,
    formatter: (row: any) => fmtNum(row.payAmt),
  },
  { prop: "payDate", label: "计划付款日期", minWidth: 120 },
  {
    prop: "costProdVal",
    label: "成本复核产值金额",
    minWidth: 150,
    formatter: (row: any) => fmtNum(row.costProdVal),
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付金额",
    minWidth: 150,
    formatter: (row: any) => fmtNum(row.costPayAmt),
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

/* =====================================================================
 * 重构增强：字段配置化 + 锚点导航
 * 以下为本次重构新增，原 API / 解析 / 枚举逻辑保持不变。
 * ===================================================================== */

// —— 描述字段配置统一类型 ——
interface DescField {
  label: string;
  value: string;
  money?: boolean;
  span?: number;
}

// —— 显示归一化：所有查名称 / 取枚举 / 布尔转文字集中此处 ——
const display = computed(() => {
  const f = formData.value;
  const DASH = "-";
  return {
    segName: getSegName(f.segId) || DASH,
    projName: getProjectName(f.projId) || DASH,
    supName: getSupplierName(f.supId) || DASH,
    conPropertyLabel: getEnumLabel(ConPropertyEnum, f.conProperty) || DASH,
    priceTypeLabel: getEnumLabel(PriceTypeEnum, f.priceType) || DASH,
    manageTypeLabel: getEnumLabel(ManageTypeEnum, f.manageType) || DASH,
    payMethodLabel: getEnumLabel(PayTypeEnum, f.payMethod) || DASH,
    sealTypesText: getSealTypesText(f.sealTypes) || DASH,
    needSealText: f.needSeal ? "是" : "否",
    needSettleText: f.needSettle ? "是" : "否",
  };
});

// —— 合同状态：标签文案 + 配色 ——
const conStatusInfo = computed(() => {
  const val = formData.value.conStatus;
  return {
    label: getEnumLabel(conBillStatusEnum, val) || "-",
    type:  getEnumType(conBillStatusEnum, val)?? "info",
  };
});

// —— 基本信息字段配置（增删字段只改这里）——
const basicFields = computed<DescField[]>(() => {
  const f = formData.value;
  const d = display.value;
  return [
    { label: "业务板块：", value: d.segName },
    { label: "项目名称：", value: d.projName },
    { label: "合同分类：", value: f.conTypeName || "-" },
    { label: "合同类型：", value: d.conPropertyLabel },
    { label: "合同名称：", value: f.conName || "-" },
    { label: "合同状态：", value: conStatusInfo.value.label, tag: true, tagType: conStatusInfo.value.type },
    { label: "签约公司：", value: f.companyName || "-" },
    { label: "合同系统编号：", value: f.conSysNo || "-" },
    { label: "合同档案编号：", value: f.conPhyNo || "-" },
    { label: "供应商：", value: d.supName },
    { label: "楼栋范围：", value: f.bldNames || "-" },
    { label: "管理类型：", value: d.manageTypeLabel },
    { label: "计价方式：", value: d.priceTypeLabel },
    { label: "产值确认方式：", value: d.payMethodLabel },
    { label: "应收履约保证金：", value: fmtMoney(f.pbAmount), money: true },
    // { label: "签约金额(含税)：", value: fmtMoney(f.signAmt), money: true },
    // { label: "签约金额(不含税)：", value: fmtMoney(f.signExclAmt), money: true },
    // { label: "税额：", value: fmtMoney(f.taxAmt), money: true },
    { label: "签订日期：", value: f.signDate || "-" },
    { label: "生效日期：", value: f.effectiveDate || "-" },
    { label: "到期日期：", value: f.expiryDate || "-" },
    { label: "工期(天)：", value: f.daysNum ?? "-" },
    { label: "结算金额：", value: fmtMoney(f.settleAmt), money: true },
    { label: "是否用印：", value: d.needSealText },
    { label: "印章类型：", value: d.sealTypesText },
    { label: "是否需办理结算", value: d.needSettleText },
    { label: "签约地点：", value: f.signAddr || "-" },
    { label: "供应商联系人：", value: f.supCmanName || "-" },
    { label: "联系人电话：", value: f.supCmanTel || "-" },
    { label: "联系人身份证：", value: f.supCmanIdno || "-" },
    { label: "联系人职务：", value: f.supCmanJob || "-" },
  ];
});

// —— 拓展信息字段配置 ——
const extendFields = computed<DescField[]>(() => {
  const f = formData.value;
  const d = display.value;
  return [
    { label: "是否用印：", value: d.needSealText },
    { label: "印章类型：", value: d.sealTypesText },
    { label: "签约地点：", value: f.signAddr || "-" },
    { label: "供应商联系人：", value: f.supCmanName || "-" },
    { label: "联系人电话：", value: f.supCmanTel || "-" },
    { label: "联系人身份证：", value: f.supCmanIdno || "-" },
    { label: "联系人职务：", value: f.supCmanJob || "-" },
    // { label: "开户银行：", value: f.bankName || "-" },
    // { label: "银行户名：", value: f.accountName || "-" },
    // { label: "银行账号：", value: f.bankAccount || "-" },
  ];
});

// —— 合同概况（单列）——
const overviewFields = computed<DescField[]>(() => {
  const f = formData.value;
  return [{ label: "合同简述：", value: f.remark || "-", span: 1 }];
});

// —— 四个表格区块配置：消除重复模板 ——
const tableSections = computed(() => [
  { id: "sec-price", title: "价税明细", columns: priceColumns.value, data: priceTable.value },
  { id: "sec-payrate", title: "支付比例", columns: payrateColumns.value, data: payrateTable.value },
  //{ id: "sec-material", title: "材料合同产值", columns: materialColumns.value, data: materialTable.value },
 // { id: "sec-paynode", title: "支付节点", columns: paynodeColumns.value, data: paynodeTable.value },
]);

// —— 锚点导航数据源 ——
const sections = [
  { id: "sec-basic", title: "基本信息" },
  //{ id: "sec-extend", title: "拓展信息" },
  { id: "sec-overview", title: "合同概况" },
  { id: "sec-price", title: "价税明细" },
  { id: "sec-payrate", title: "支付比例" },
  // { id: "sec-material", title: "材料合同产值" },
  // { id: "sec-paynode", title: "支付节点" },
];

// —— 滚动容器与状态（修复：用滚动位置计算取代 IntersectionObserver）——
const scrollAreaRef = ref<HTMLElement | null>(null);
const activeSection = ref("");
const showBackTop = ref(false);
const loading = ref(false); // 表格加载态，预留给接口 loading 接入
let _onScroll: (() => void) | null = null;
let _clickLockId: string | null = null; // 点击锚点后锁定高亮，避免平滑滚动期间被滚动计算覆盖
let _scrollEndTimer: number | null = null; // 滚动停止判定定时器

const throttle = (fn: () => void, wait: number) => {
  let last = 0;
  return () => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn();
    }
  };
};

// 吸顶导航高度 + 余量：用于判定"区块是否已滚到导航下方"
const NAV_OFFSET = 70;

// 依据滚动位置确定性计算当前应高亮的区块
const computeActiveSection = () => {
  const area = scrollAreaRef.value;
  if (!area || !sections.length) return;
  // 1) 滚到底部：直接高亮最后一个区块（解决短区块进不了检测带的问题）
  if (area.scrollTop + area.clientHeight >= area.scrollHeight - 2) {
    activeSection.value = sections[sections.length - 1].id;
    return;
  }
  // 2) 取"顶部已越过 NAV_OFFSET 的最后一个区块"
  const rootTop = area.getBoundingClientRect().top;
  let current = sections[0].id;
  for (const s of sections) {
    const el = document.getElementById(s.id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top - rootTop; // 相对滚动容器顶部
    if (top - NAV_OFFSET <= 0) {
      current = s.id;
    } else {
      break;
    }
  }
  activeSection.value = current;
};

const handleScroll = () => {
  const area = scrollAreaRef.value;
  if (!area) return;
  showBackTop.value = area.scrollTop > 400;
  if (_clickLockId) {
    // 点击触发的滚动尚未结束：保持点击项高亮，并持续重置"停止"定时器
    if (_scrollEndTimer) clearTimeout(_scrollEndTimer);
    _scrollEndTimer = window.setTimeout(() => {
      _clickLockId = null;
    }, 400);
    return;
  }
  computeActiveSection();
};

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    _clickLockId = id; // 锁定为点击项，平滑滚动期间不被滚动计算覆盖
    activeSection.value = id; // 立即反馈
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // 兜底：若滚动事件未触发（极短内容），定时解锁
    if (_scrollEndTimer) clearTimeout(_scrollEndTimer);
    _scrollEndTimer = window.setTimeout(() => {
      _clickLockId = null;
    }, 500);
  }
};

const backToTop = () => {
  scrollAreaRef.value?.scrollTo({ top: 0, behavior: "smooth" });
};

const setupScrollSpy = () => {
  const area = scrollAreaRef.value;
  if (!area) return;
  _onScroll = throttle(handleScroll, 120);
  area.addEventListener("scroll", _onScroll, { passive: true });
  handleScroll(); // 初始化即高亮第一项
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
    companyName: conMain.companyName,
    conName: conMain.conName,
    conSysNo: conMain.conSysNo,
    conPhyNo: conMain.conPhyNo,
    conTypeId: conMain.conTypeId,
    conTypeName: conMain.conTypeName,
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
    attachmentCount: conMainExt?.attachmentCount ?? 0,
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
  setupScrollSpy();
});

onBeforeUnmount(() => {
  if (_onScroll && scrollAreaRef.value) {
    scrollAreaRef.value.removeEventListener("scroll", _onScroll);
  }
  if (_scrollEndTimer) clearTimeout(_scrollEndTimer);
  // 已移除 IntersectionObserver，无需 disconnect
});
</script>

<style scoped lang="scss">
.contract-basic {
  --cb-primary: #409eff;
  --cb-border: #ebeef5;
  --cb-bg: #f5f7fa;
  --cb-text: #303133;
  --cb-text-secondary: #909399;
  --cb-money: #d97706;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 6px;
  overflow: hidden;
}

.cb-header {
  padding: 16px 16px 4px;
  background: #fff;
  border-bottom: 1px solid var(--cb-border);
}

.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 24px;
  scroll-behavior: smooth;
}

/* 锚点导航：吸顶 */
.cb-anchor {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 4px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid var(--cb-border);
}
.cb-anchor__item {
  border: 1px solid transparent;
  background: var(--cb-bg);
  color: var(--cb-text-secondary);
  padding: 6px 14px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}
.cb-anchor__item:hover {
  color: var(--cb-primary);
  background: #ecf5ff;
}
.cb-anchor__item.is-active {
  color: #fff;
  background: var(--cb-primary);
  border-color: var(--cb-primary);
}

/* 卡片 */
.cb-card {
  background: #fff;
  border: 1px solid var(--cb-border);
  border-radius: 10px;
  padding: 16px 20px 20px;
  margin-bottom: 16px;
  scroll-margin-top: 56px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* 标题：左侧高亮条 */
.cb-card__title {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: var(--cb-text);
  margin: 0 0 14px;
  padding-left: 10px;
  position: relative;
  &::before {
    content: "";
    width: 4px;
    height: 16px;
    background: var(--cb-primary);
    border-radius: 2px;
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
  }
}

/* 描述列表 */
.info-descriptions {
  margin-bottom: 0;
  :deep(.el-descriptions__label) {
    width: 130px;
    background-color: #fafafa;
    font-weight: 500;
    color: var(--cb-text-secondary);
  }
  :deep(.el-descriptions__content) {
    color: var(--cb-text);
    word-break: break-all;
  }
}
/* 4 列等宽（仅作用于基本信息 / 拓展信息） */
.info-descriptions--grid {
  :deep(.el-descriptions__table) {
    table-layout: fixed;
  }
  :deep(.el-descriptions__table td) {
    width: 25%;
    word-break: break-all;
    white-space: normal;
  }
}

/* 金额高亮 */
.cb-money {
  color: var(--cb-money);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.2px;
}
.cb-attachment {
  font-weight: 600;
  color: var(--cb-primary);
}

/* 回到顶部 */
.cb-backtop {
  position: fixed;
  right: 28px;
  bottom: 36px;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: var(--cb-primary);
  color: #fff;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(64, 158, 255, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 30;
}
.cb-backtop:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(64, 158, 255, 0.5);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
