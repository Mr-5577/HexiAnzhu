/**
 * 合同关联模块的常量定义
 */
/** 合同类型 */
export const ConPropertyEnum = [
  { value: 1, label: "普通合同" },
  { value: 2, label: "战略合同" },
  { value: 3, label: "订单合同" },
  { value: 4, label: "采购订单" },
] as const;

/** 计价方式 */
export const PriceTypeEnum = [
  { value: 1, label: "总价包干" },
  { value: 2, label: "暂定总价" },
  { value: 3, label: "单价合同" },
] as const;

/** 合同状态 */
export const ConStatusEnum = [
  { value: 0, label: "草稿" },
  { value: 5, label: "审批中" },
  { value: 10, label: "已审批" },
  { value: 20, label: "已结算" },
  { value: 30, label: "已作废" },
] as const;

/** 管理类型 */
export const ManageTypeEnum = [
  { value: 1, label: "内部" },
  { value: 2, label: "外部" },
] as const;

/** 付款方式 */
export const PayTypeEnum = [
  { value: 1, label: "按进度支付" },
  { value: 2, label: "按材料到货支付" },
  { value: 3, label: "按节点支付" },
] as const;

/** 印章类型 */
export const SealTypesEnum = [
  { value: "公章", label: "公章" },
  { value: "法人章", label: "法人章" },
  { value: "合同专用章", label: "合同专用章" },
  { value: "财务专用章", label: "财务专用章" },
] as const;

/** 附件来源 */
export const FileSourceEnum = [
  { value: 1, label: "审批流程" },
  { value: 2, label: "手工上传" },
] as const;

/** 补充合同类型 */
export const AddTypeEnum = [
  { value: 1, label: "变更转补充" },
  { value: 2, label: "普通补充合同" },
] as const;

/** 签证类型 */
export const VisaTypeEnum = [
  { value: 1, label: "签证" },
  { value: 2, label: "反签证" },
] as const;

/** 变更类型 */
export const ChangeTypeEnum = [
  { value: 1, label: "工程指令" },
  { value: 2, label: "设计变更" },
] as const;

/** 扣款类型选项 */
export const dedTypeEnum = [
  { value: 1, label: "质量扣款" },
  { value: 2, label: "工期延误" },
  { value: 3, label: "安全违规" },
  { value: 4, label: "质量奖励" },
  { value: 5, label: "提前竣工奖励" },
  { value: 6, label: "其他扣款" },
] as const;

/** 业务类型选项 */
export const bizTypeEnum = [
  // { label: "合同", value: "CON_MAIN" },
  // { label: "补充合同", value: "CON_ADD" },
  // { label: "订单合同", value: "CON_ORD" },
  // { label: "采购订单", value: "CON_BILL" },
  // { label: "合同变更", value: "CON_BG" },
  // { label: "合同签证", value: "CON_QZ" },
  // { label: "合同产值", value: "CON_PROD" },
  // { label: "合同预结算", value: "CON_PRE_SETTLE" },
  // { label: "合同结算", value: "CON_SETTLE" },
  // { label: "非合同", value: "NCON" },
  { label: "合同", value: 1 },
  { label: "补充合同", value: 2 },
  { label: "合同变更", value: 3 },
  { label: "合同签证", value: 4 },
  { label: "合同结算", value: 5 },
  { label: "非合同", value: 6 },
] as const;

/** 分摊状态选项 */
export const allocStatusEnum = [
  { label: "未分摊", value: 0, type: "info" },
  { label: "已分摊", value: 1, type: "success" },
  { label: "部分分摊", value: 2, type: "warning" },
] as const;

/** 分摊预警选项 */
export const allocWarnEnum = [
  { label: "红色预警", value: 0, type: "danger" },
  { label: "黄色预警", value: 1, type: "warning" }, // 超95%
  { label: "绿色预警", value: 2, type: "success" },
] as const;

// 辅助函数：根据value获取label
export const getLabel = <T extends { value: number | string; label: string }>(
  list: readonly T[],
  value: number | string,
) => {
  return list.find((item) => item.value == value)?.label || "";
};
