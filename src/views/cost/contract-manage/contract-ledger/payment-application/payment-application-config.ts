import { computed, ref, type ComputedRef, type Ref } from "vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import type { NavCard } from "@/composables/use-form-layout";
import { AddProcessSrcEnum, dedTypeEnum, invoiceStatusEnum } from "@/constants/contract-manage/enums";
import { getEnumLabel } from "@/utils/enum";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";

/** 是 / 否 下拉选项 */
export const BOOL_OPTIONS = [
  { value: true, label: "是" },
  { value: false, label: "否" },
];

/** 悬浮定位栏配置 */
  // —— 悬浮定位栏（仅用于界面风格，不影响逻辑）——
export const NAV_CARDS :NavCard[]= [
  { id: "card-base", icon: "📋", label: "基本信息" },
  { id: "card-pay", icon: "📋", label: "付款申请信息" },
  { id: "card-invoice", icon: "📋", label: "发票信息" },
  { id: "card-account", icon: "📋", label: "收款账号信息" },
  { id: "card-ded", icon: "📋", label: "扣款事项明细" },
  { id: "card-invoicereg", icon: "📋", label: "发票登记" },
  { id: "card-payway", icon: "📋", label: "付款方式" },
  { id: "card-finance", icon: "📋", label: "财务明细" },
];



// ==================== 发票登记 ====================
export const invoiceMDetailColumns = (): ComputedRef<EditableColumn[]> =>
  computed<EditableColumn[]>(() => [
//const invoiceMDetailColumns = [
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
]);

// export const invoiceMColumns = (): ComputedRef<EditableColumn[]> =>
//   computed<EditableColumn[]>(() => [
export const invoiceMColumns = computed<EditableColumn[]>(() => [
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
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "invDate",
    label: "开票日期",
    editable: false,
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "totalAmt",
    label: "发票总金额",
    editable: false,
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "notTaxAmt",
    label: "不含税金额",
    editable: false,
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "taxAmt",
    label: "税额",
    editable: false,
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "invType",
    label: "发票类型",
    editable: false,
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    slot: "annexName",
    label: "发票附件",
    editable: false,
    minWidth: 200,
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    slot: "actions",
    width: 260,
    fixed: "right",
  },
]);


// ==================== 扣款事项 ====================
export const dedDetailColumns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "dedName", label: "事项名称", minWidth: 120 },
  { prop: "dedTypeName", label: "调整类型", minWidth: 120 },
  { prop: "dedAmt", label: "金额", minWidth: 120 },
  { prop: "dedDesc", label: "说明", minWidth: 120 },
];


export const dedColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "dedName",
    label: "扣款事项",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "dedTypeId",
    label: "扣款类型",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "label",
    optionValueField: "value",
    options: dedTypeEnum as any,
  },
  {
    prop: "dedAmt",
    label: "应扣款金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "dedThisAmt",
    label: "本次扣款金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "dedAlreadyAmt",
    label: "已扣款金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "dedLeaveAmt",
    label: "未扣金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "dedDesc",
    label: "扣款说明",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 240,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);

// ==================== 付款方式 ====================
export const payWayDetailColumns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "payWayName", label: "付款方式", minWidth: 150 },
  { prop: "bankName", label: "收款开户行", minWidth: 150 },
  { prop: "accountName", label: "收款账户名", minWidth: 150 },
  { prop: "bankAccount", label: "收款账号", minWidth: 150 },
  { prop: "payAmt", label: "付款金额", minWidth: 120 },
  { prop: "dedRoomAmt", label: "其中抵房金额", minWidth: 120 },
  { prop: "payDesc", label: "事项说明", minWidth: 200 },
];


interface FinanceColumnOptions {
  projectOptions: Ref<any[]>;  // 项目选项（响应式）
  subjectOptions: Ref<any[]>;  // 科目选项（响应式）
}

export const createFinanceColumns = (options: FinanceColumnOptions) => {
  const { projectOptions, subjectOptions } = options;
  
  return computed<EditableColumn[]>(() => [
    { type: "index", label: "序号", width: 60, editable: false },
    {
      prop: "projId",
      label: "项目",
      editable: true,
      editType: "select",
      showOverflowTooltip: false,
      optionLabelField: "projName",
      optionValueField: "id",
      options: projectOptions.value,  // ✅ 使用传入的响应式数据
    },
    {
      prop: "acctProjId",
      label: "建筑核算项目",
      editable: true,
      editType: "select",
      showOverflowTooltip: false,
      optionLabelField: "label",
      optionValueField: "value",
      options: [
        { label: "核算项目1", value: 1 },
        { label: "核算项目2", value: 2 },
      ],
    },
    {
      prop: "subId",
      label: "科目",
      editable: true,
      editType: "select",
      showOverflowTooltip: false,
      optionLabelField: "subName",
      optionValueField: "id",
      options: subjectOptions.value,  // ✅ 使用传入的响应式数据
    },
    {
      prop: "subAmt",
      label: "金额",
      editable: true,
      editType: "number",
      showOverflowTooltip: false,
    },
    {
      label: "操作",
      slot: "actions",
      fixed: "right",
    },
  ]);
};

// const dedColumns = computed<EditableColumn[]>(() => [
//   { type: "index", label: "序号", width: 60, editable: false },
//   {
//     prop: "dedName",
//     label: "事项名称",
//     editable: true,
//     editType: "input",
//     showOverflowTooltip: false,
//   },
//   {
//     prop: "dedTypeId",
//     label: "调整类型",
//     editable: true,
//     editType: "cascader",
//     showOverflowTooltip: false,
//     optionLabelField: "dicLabel",
//     optionValueField: "id",
//    // options: dedTypeOptions.value || [],
//     showAllLevels: false,
//     cascaderProps: {
//       children: "children",
//       label: "dicLabel",
//       value: "id",
//       emitPath: false,
//       showAllLevels: false,
//       checkStrictly: false,
//     },
//   },
//   {
//     prop: "dedAmt",
//     label: "金额",
//     editable: true,
//     editType: "number",
//     showOverflowTooltip: false,
//     showSummary: true,
//     min: -999999999,
//     max: 999999999,
//   },
//   {
//     prop: "dedDesc",
//     label: "说明",
//     editable: true,
//     editType: "input",
//     showOverflowTooltip: false,
//   },
//   {
//     label: "操作",
//     width: 150,
//     slot: "actions",
//     fixed: "right",
//   },
// ]);

/** 创建补充事项明细列定义 */
export const createProcessColumns = (): ComputedRef<EditableColumn[]> =>
  computed<EditableColumn[]>(() => [
    { type: "index", label: "序号", width: 60, editable: false },
    {     
      prop: "srcType",
      label: "事项来源",
      editable: true,
      disabled: true,
      width:120,
      editType: "select",
      showOverflowTooltip: false,
      optionLabelField: "label",
      optionValueField: "value",
      options: AddProcessSrcEnum || [],
    },
    {
      prop: "processName",
      label: "事项名称",
      editable: true,
      disabled: (row: any) => row.srcType !== 2,
      editType: "input",
      showOverflowTooltip: false,
      width:350,
    },
    {
      prop: "processAmt",
      label: "事项金额(含税)",
      showSummary: true,
      editable: true,
      disabled: (row: any) => row.srcType !== 2,
      editType: "number",
      showOverflowTooltip: false,
      width:200,
    },
    {
      prop: "visaApplyDate",
      label: "业务日期",
      editable: true,
      editType: "date",
      disabled: (row: any) => row.srcType !== 2,
      showOverflowTooltip: false,
      width:120,
    },
    {
      prop: "remark",
      label: "其他说明",
      editable: true,
      editType: "input",
      showOverflowTooltip: false,
    },
    {
      label: "操作",
      width: 100,
      slot: "actions",
      fixed: "right",
    },
  ]);

/** 创建价税明细列定义 */
export const createPriceColumns = (): ComputedRef<EditableColumn[]> =>
  computed<EditableColumn[]>(() => [
    { type: "index", label: "序号", width: 60, editable: false },
    {
      prop: "itemName",
      label: "分项名称",
      editable: true,
      editType: "input",
      showOverflowTooltip: false,
      width:250,
    },
    {
      prop: "itemAmt",
      label: "分项含税总额",
      showSummary: true,
      editable: true,
      editType: "number",
      showOverflowTooltip: false,
      width:200,
    },
    {
      prop: "itemTaxRate",
      label: "税率(%)",
      showSummary: true,
      editable: true,
      editType: "number",
      showOverflowTooltip: false,
      width:100,
    },
    {
      prop: "itemExclAmt",
      label: "分项不含税额",
      showSummary: true,
      editable: false,
      editType: "number",
      showOverflowTooltip: false,
      width:200,
    },
    {
      prop: "itemTaxAmt",
      label: "分项税额",
      showSummary: true,
      editable: false,
      editType: "number",
      showOverflowTooltip: false,
      width:200,
    },
    {
      prop: "remark",
      label: "备注",
      editable: true,
      editType: "input",
      showOverflowTooltip: false,
    },
    {
      label: "操作",
      width: 100,
      slot: "actions",
      fixed: "right",
    },
  ]);