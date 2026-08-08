// ============ 合同表单配置（静态数据 + 列定义工厂） ============

import { computed, type ComputedRef, type Ref } from "vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import type { NavCard } from "@/composables/use-form-layout";

/** 是 / 否 下拉选项 */
export const BOOL_OPTIONS = [
  { value: true, label: "是" },
  { value: false, label: "否" },
];

/** 悬浮定位栏配置 */
export const NAV_CARDS: NavCard[] = [
  { id: "card-base", icon: "📋", label: "基础信息" },
  { id: "card-basic", icon: "📄", label: "基本信息" },
  { id: "card-contract", icon: "📑", label: "合同信息" },
  { id: "card-price", icon: "💰", label: "价款及税率" },
  { id: "card-supplier", icon: "🏢", label: "供方信息" },
  { id: "card-payrate", icon: "📊", label: "支付比例" },
  { id: "card-annex", icon: "📎", label: "合同附件" },
];

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

/** 创建支付比例列定义（依赖 paymentTypeOptions 动态值） */
export const createPayrateColumns = (
  paymentTypeOptions: Ref<any[]>,
): ComputedRef<EditableColumn[]> =>
  computed<EditableColumn[]>(() => [
    { type: "index", label: "序号", width: 60, editable: false },
    {
      prop: "payTypeId",
      label: "款项类型",
      editable: true,
      editType: "select",
      showOverflowTooltip: false,
      optionLabelField: "dicLabel",
      optionValueField: "id",
      options: paymentTypeOptions.value || [],
    },
    {
      prop: "payRate",
      label: "应付比例(%)",
      showSummary: true,
      editable: true,
      editType: "number",
      showOverflowTooltip: false,
    },
    {
      prop: "isCtrl",
      label: "是否强控",
      editable: true,
      editType: "select",
      showOverflowTooltip: false,
      clearable: false,
      options: [
        { value: true, label: "是" },
        { value: false, label: "否" },
      ],
      width:100,
    },
    {
      prop: "payIntvl",
      label: "支付周期(月)",
      showSummary: true,
      editable: true,
      editType: "number",
      precision: 0,
      showOverflowTooltip: false,
    },
    {
      label: "操作",
      width: 100,
      slot: "actions",
      fixed: "right",
    },
  ]);
