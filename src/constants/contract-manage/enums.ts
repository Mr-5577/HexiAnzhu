// 合同类型
export const ConPropertyEnum = [
  { value: 1, label: "普通合同" },
  { value: 2, label: "战略合同" },
  { value: 3, label: "订单合同" },
  { value: 4, label: "采购订单" },
] as const;

// 计价方式
export const PriceTypeEnum = [
  { value: 1, label: "总价包干" },
  { value: 2, label: "暂定总价" },
  { value: 3, label: "单价合同" },
] as const;

// 合同状态
export const ConStatusEnum = [
  { value: 0, label: "草稿" },
  { value: 5, label: "审批中" },
  { value: 10, label: "已审批" },
  { value: 20, label: "已结算" },
  { value: 30, label: "已作废" },
] as const;

// 管理类型
export const ManageTypeEnum = [
  { value: 1, label: "内部" },
  { value: 2, label: "外部" },
] as const;

// 付款方式
export const PayTypeEnum = [
  { value: 1, label: "按进度支付" },
  { value: 2, label: "按节点支付" },
] as const;

// 印章类型
export const SealTypesEnum = [
  { value: "公章", label: "公章" },
  { value: "法人章", label: "法人章" },
  { value: "合同专用章", label: "合同专用章" },
  { value: "财务专用章", label: "财务专用章" },
] as const;

// 附件来源
export const FileSourceEnum = [
  { value: 1, label: "审批流程" },
  { value: 2, label: "手工上传" },
] as const;
// 补充合同类型
export const AddTypeEnum = [
  { value: 1, label: "变更转补充" },
  { value: 2, label: "普通补充合同" },
] as const;

// 辅助函数：根据value获取label
export const getLabel = <T extends { value: number | string; label: string }>(
  list: readonly T[],
  value: number | string,
) => {
  return list.find((item) => item.value == value)?.label || "";
};
