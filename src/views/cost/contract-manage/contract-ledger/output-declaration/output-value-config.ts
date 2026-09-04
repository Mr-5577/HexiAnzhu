import { computed, type ComputedRef, type Ref } from "vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import type { NavCard } from "@/composables/use-form-layout";
import {
  AddProcessSrcEnum,
  invoiceStatusEnum,
} from "@/constants/contract-manage/enums";
import { getEnumLabel, getOptionsLabelById } from "@/utils/enum";
import { useUserStore } from "@/stores/user-store";
import { dateUtil } from "@/utils/date-util";

const userStore = useUserStore();
// 是否是超管角色
const isSuperAdmin = computed(() => {
  return userStore.roleList?.some((role: any) => role.isSuper);
});
/** 悬浮定位栏配置 */
// —— 悬浮定位栏（仅用于界面风格，不影响逻辑）——
export const NAV_CARDS: NavCard[] = [
  { id: "card-base", icon: "📋", label: "合同信息" },
  { id: "card-prod", icon: "📊", label: "产值信息" },
  { id: "card-con", icon: "🏗️", label: "合同产值" },
  { id: "card-sum", icon: "📈", label: "累计产值" },
  { id: "card-annex", icon: "📎", label: "相关附件" },
];

/** 日期显示：YYYY-MM-DD / YYYY-MM -> YYYY-MM；空值返回 "--" */
const formatYM = (val: any): string => {
  if (val === undefined || val === null || val === "") return "--";
  return String(val).slice(0, 7);
};

export const materialColumns: any = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "recvBillNo",
    label: "接收单号",
    editable: false,
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
    width: 80,
  },
  {
    prop: "mtBrand",
    label: "品牌",
    editable: false,
    width: 80,
  },
  {
    prop: "mtCz",
    label: "材质",
    editable: false,
    width: 120,
  },
  {
    prop: "recvNum",
    label: "接收数量",
    editable: false,
    editType: "number",
    // thousandSeparator: true,
    showOverflowTooltip: false,
    precision: 0,
    width: 100,
  },
  {
    prop: "mtUnit",
    label: "单位",
    editable: false,
    editType: "input",
    showOverflowTooltip: false,
    width: 60,
  },
  {
    prop: "recvPrice",
    label: "单价",
    editable: false,
    editType: "number",
    // thousandSeparator: true,
    showOverflowTooltip: false,
    formatType: "#,##0.00",
    width: 120,
  },
  {
    prop: "recvProdAmt",
    label: "接收产值",
    editable: false,
    editType: "number",
    // thousandSeparator: true,
    showOverflowTooltip: false,
    formatType: "#,##0.00",
    width: 150,
  },
  {
    prop: "fineAmt",
    label: "罚款",
    editable: false,
    editType: "number",
    // thousandSeparator: true,
    showOverflowTooltip: false,
    formatType: "#,##0.00",
    width: 100,
  },
  {
    prop: "prodVal",
    label: "本次申报产值",
    editable: true,
    editType: "number",
    // thousandSeparator: true,
    showOverflowTooltip: false,
    formatType: "#,##0.00",
    width: 140,
  },
  // {
  //   prop: "payRate",
  //   label: "应付比例(%)",
  //   editable: true,
  //   editType: "number",
  //   precision: 2,
  //   showOverflowTooltip: false,
  //   formatType:"d%",
  //   width: 120,
  // },
  {
    prop: "payAmt",
    label: "本次申报应付",
    editable: true,
    editType: "number",
    // thousandSeparator: true,
    showOverflowTooltip: false,
    formatType: "#,##0.00",
    width: 140,
  },
  {
    prop: "buildPeriod",
    label: "施工期间",
    editable: false,
    editType: "input",
    showOverflowTooltip: false,
    width: 100,
    formatter: (row: any) => formatYM(row.buildPeriod) || "--",
  },
  {
    prop: "prodValPeriod",
    label: "产值期间",
    editable: false,
    showOverflowTooltip: false,
    width: 100,
    formatter: (row: any) => formatYM(row.prodValPeriod) || "--",
  },
  {
    prop: "payDate",
    label: "计划付款期间",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 100,
    formatter: (row: any) => row.payDate || "--",
  },
  {
    prop: "costProdVal",
    label: "成本复核产值",
    editType: "number",
    editable: isSuperAdmin.value ? true : false, // 是否是超管角色
    // thousandSeparator: true,
    width: 150,
    // formatType:"#,##0.00",
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付",
    editType: "number",
    editable: isSuperAdmin.value ? true : false, // 是否是超管角色
    // thousandSeparator: true,
    width: 150,
    // formatType:"#,##0.00",
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);

export const materialMinorColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "recvBillNo",
    label: "接收单号",
    editable: false,
    editType: "input",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "mtName",
    label: "材料类别",
    editable: false,
    width: 250,
  },
  {
    prop: "recvProdAmt",
    label: "接收产值",
    editable: false,
    editType: "number",
    // thousandSeparator: true,
    showOverflowTooltip: false,
    formatType: "#,##0.00",
    width: 150,
  },
  // {
  //   prop: "fineAmt",
  //   label: "罚款",
  //   editable: false,
  //   editType: "number",
  //   thousandSeparator: true,
  //   showOverflowTooltip: false,
  //   formatType:"#,##0.00",
  //   width: 120,
  // },
  {
    prop: "prodVal",
    label: "本次申报产值",
    editable: true,
    editType: "number",
    // thousandSeparator: true,
    showOverflowTooltip: false,
    formatType: "#,##0.00",
    width: 150,
  },
  // {
  //   prop: "payRate",
  //   label: "合同应付比例(%)",
  //   editable: false,
  //   editType: "number",
  //   precision: 2,
  //   showOverflowTooltip: false,
  //   formatType:"d%",
  //   width: 120,
  // },
  {
    prop: "payAmt",
    label: "本次申报应付",
    editable: true,
    editType: "number",
    // thousandSeparator: true,
    showOverflowTooltip: false,
    formatType: "#,##0.00",
    width: 150,
  },
  {
    prop: "buildPeriod",
    label: "施工期间",
    editable: false,
    editType: "input",
    showOverflowTooltip: false,
    width: 90,
    formatter: (row: any) => formatYM(row.buildPeriod) || "--",
  },
  {
    prop: "prodValPeriod",
    label: "产值期间",
    editable: false,
    showOverflowTooltip: false,
    width: 90,
    formatter: (row: any) => formatYM(row.prodValPeriod) || "--",
  },
  {
    prop: "payDate",
    label: "计划付款期间",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 90,
    formatter: (row: any) => row.payDate || "--",
  },
  {
    prop: "costProdVal",
    label: "成本复核产值",
    editable: isSuperAdmin.value ? true : false, // 是否是超管角色
    editType: "number",
    // thousandSeparator: true,
    showOverflowTooltip: false,
    // formatType:"#,##0.00",
    width: 150,
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付",
    editable: isSuperAdmin.value ? true : false, // 是否是超管角色
    editType: "number",
    // thousandSeparator: true,
    showOverflowTooltip: false,
    // formatType:"#,##0.00",
    width: 150,
  },
  // {
  //   prop: "remark",
  //   label: "备注",
  //   editable: false,
  //   editType: "input",
  //   showOverflowTooltip: false,
  //   width: 150,
  // },
  // {
  //   slot: "annex", // 使用自定义插槽
  //   label: "接收明细附件",
  //   width: 180,
  // },
  {
    label: "操作",
    width: 140,
    slot: "actions",
    fixed: "right",
  },
]);

//非甲供材
interface ProdColumnOptions {
  paymentTypeOptions: Ref<any[]>; // 项目选项（响应式）
}

export const createProdColumns = (options: ProdColumnOptions) => {
  const { paymentTypeOptions } = options;

  return computed<EditableColumn[]>(() => [
    { type: "index", label: "序号", width: 60, editable: false },
    {
      prop: "payTypeId",
      label: "款项类型",
      editable: false,
      editType: "select",
      clearable: false,
      showOverflowTooltip: false,
      optionLabelField: "dicLabel",
      optionValueField: "id",
      options: paymentTypeOptions.value || [],
      width: 100,
      formatter: (row: any) =>
        getOptionsLabelById(paymentTypeOptions.value, row.payTypeId),
    },
    {
      prop: "payRate",
      label: "应付比例(%)",
      editable: false,
      width: 90,
      // formatType:"d%",
      // formatter: (row: any) => formatPercent(row.payRate),
    },
    {
      prop: "isCtrl",
      label: "强控支付",
      editable: false,
      width: 80,
      formatter: (row: any) => (row.isCtrl ? "是" : "否"),
    },
    {
      prop: "payIntvl",
      label: "支付周期(月)",
      editable: false,
      editType: "number",
      precision: 0, // 整数
      showOverflowTooltip: false,
      width: 90,
    },
    {
      prop: "prodVal",
      label: "本次申请产值",
      editable: true,
      editType: "number",
      // thousandSeparator: true,
      showOverflowTooltip: false,
      //formatType:"#,##0.00",
      width: 120,
      disabled: (row: any) => !row.hasVal,
    },
    {
      prop: "payAmt",
      label: "本次申报应付",
      editable: true,
      editType: "number",
      //thousandSeparator: true,
      showOverflowTooltip: false,
      width: 120,
      // formatType:"#,##0.00",
      disabled: (row: any) => row.hasVal && !!row.isCtrl, // 有产值且强控支付时，不可编辑
    },
    {
      prop: "buildPeriod",
      label: "施工期间",
      editable: true,
      editType: "input",
      showOverflowTooltip: false,
      width: 100,
      formatter: (row: any) => row.buildPeriod || "--",
    },
    {
      prop: "prodValPeriod",
      label: "产值期间",
      editable: false,
      showOverflowTooltip: false,
      width: 100,
      formatter: (row: any) => formatYM(row.prodValPeriod) || "--",
    },
    {
      prop: "payDate",
      label: "计划付款期间",
      editable: true,
      showOverflowTooltip: false,
      // thousandSeparator: true,
      width: 100,
      //formatter: (row: any) => row.payDate || "--",
      //disabled: (row: any) => !!row.isCtrl,
    },
    {
      prop: "costProdVal",
      label: "成本复核产值",
      editable: isSuperAdmin.value ? true : false,
      editType: isSuperAdmin.value ? "number" : "input",
      // thousandSeparator: true,
      width: 120,
      // formatType:"#,##0.00",
    },
    {
      prop: "costPayAmt",
      label: "成本复核应付",
      editable: isSuperAdmin.value ? true : false,
      editType: isSuperAdmin.value ? "number" : "input",
      // thousandSeparator: true,
      width: 120,
      // formatType:"#,##0.00",
    },
    // {
    //   label: "操作",
    //   width: 120,
    //   slot: "actions",
    //   fixed: "right",
    // },
  ]);
};

// ----- 增强日期解析 -----
export const parseDateInput = (input) => {
  if (input === undefined || input === null || input === "") return null;
  const str = String(input).trim();
  if (!str) return null;

  // 1. Excel 日期序列号（整数，约 1000~100000）
  const num = Number(str);
  if (!isNaN(num) && Number.isInteger(num) && num > 1000 && num < 100000) {
    const d = new Date((num - 25569) * 86400 * 1000);
    if (!isNaN(d.getTime())) {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
  }
  // 2. 先尝试标准化分隔符（将 / 替换为 -），统一为横杠处理
  let normalized = str.replace(/\//g, "-");

  // 2. 尝试多种常见格式
  const formats = [
    "YYYY-MM-DD",
    "YYYY-M-D",
    "YYYY/MM/DD",
    "YYYY/M/D",
    "YYYY年MM月DD日",
    "YYYY年M月D日",
  ];
  // 移除 formats 中重复项，保留首次出现
  const uniqueFormats = [...new Set(formats)];
  for (const fmt of uniqueFormats) {
    const d = dateUtil(normalized, fmt);
    if (d.isValid()) return d.format("YYYY-MM-DD");
  }

  // 3. 兜底：让 dateUtil 自动解析
  const d = dateUtil(str);
  if (d.isValid()) return d.format("YYYY-MM-DD");

  return null; // 无法解析
};
