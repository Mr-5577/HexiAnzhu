import { computed, type ComputedRef, type Ref } from "vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import type { NavCard } from "@/composables/use-form-layout";
import { AddProcessSrcEnum } from "@/constants/contract-manage/enums";

/** 是 / 否 下拉选项 */
export const BOOL_OPTIONS = [
  { value: true, label: "是" },
  { value: false, label: "否" },
];

/** 悬浮定位栏配置 */
  export const NAV_CARDS: NavCard[] = [
    { id: "card-main", icon: "📋", label: "主合同信息" },
    { id: "card-add", icon: "📄", label: "补充合同信息" },
    { id: "card-sign", icon: "📑", label: "签约信息" },
    { id: "card-price", icon: "💰", label: "价款及税率" },
    { id: "card-process", icon: "📊", label: "事项明细" },
    { id: "card-annex", icon: "📎", label: "合同附件" },
  ];


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