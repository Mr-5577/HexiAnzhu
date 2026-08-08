import { computed, ref, type ComputedRef, type Ref } from "vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import type { NavCard } from "@/composables/use-form-layout";

/** 是 / 否 下拉选项 */
export const BOOL_OPTIONS = [
  { value: true, label: "是" },
  { value: false, label: "否" },
];

/** 悬浮定位栏配置 */
  export const NAV_CARDS: NavCard[] = [
    { id: "card-main", icon: "📋", label: "变更信息" },
    { id: "card-link-con", icon: "📄", label: "相关合同" },
    { id: "card-annex", icon: "📎", label: "相关附件" },
  ];


/** 创建补充事项明细列定义 */
export const createLinkConColumns = (reasonOptions: Ref<any[]>,): ComputedRef<EditableColumn[]> =>
  computed<EditableColumn[]>(() => [
    { type: "index", label: "序号", width: 60, editable: false },
    {     
      prop: "conName",
      label: "合同名称",
      editable: false,
      disabled: true,
      width:300,
      editType: "input",
      showOverflowTooltip: false,
    },
    {     
      prop: "supName",
      label: "供应商名称",
      editable: false,
      disabled: true,
      width:200,
      editType: "input",
      showOverflowTooltip: false,
    },
    {     
      prop: "conSysNo",
      label: "合同编号",
      editable: false,
      disabled: true,
      width:150,
      editType: "input",
      showOverflowTooltip: false,
    },
    {
      prop: "estChangeAmt",
      label: "预估变更金额",
      editable: true,
      editType: "number",
      showSummary: true,
      showOverflowTooltip: false,
      width:120,
    },
    {
      prop: "needVisa",
      label: "是否需要签证",
      editType: "select",
      showOverflowTooltip: false,
      clearable: false,
      options: BOOL_OPTIONS,
      width: 120,
    },
    {
      prop: "wasteCostAmt",
      label: "无效成本金额",
      editable: true,
      editType: "number",
      showSummary: true,
      showOverflowTooltip: false,
      width:120,
    },
    {
      prop: "wasteCostReasonId",
      label: "无效成本原因",
      editable: true,
      editType: "select",
      showOverflowTooltip: false,
      optionLabelField: "dicLabel",
      optionValueField: "id",
      options: reasonOptions.value || [],
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

