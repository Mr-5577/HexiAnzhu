/**
 * 供应商管理 相关常量定义
 */

/**
 * 内外部 枚举
 */
export const supLinkEnum = [
  { value: 1, label: "内部关联单位" },
  { value: 2, label: "外部单位" },
] as const;

/**
 * 供应商状态 枚举
 */
export const supStatusEnum = [
  { value: 0, label: "草稿", type: "info" },
  { value: 1, label: "已审批", type: "success" },
  { value: 2, label: "黑名单", type: "danger" },
  { value: 3, label: "作废", type: "warning" },
] as const;
/**
 * 供应商单据审批状态 枚举
 */
export const supApprovalStatusEnum = [
  { value: 0, label: "待入库", type: "info" }, // 待处理 - 灰色
  { value: 10, label: "审批中", type: "primary" }, // 进行中 - 蓝色
  { value: 40, label: "已审批", type: "success" }, // 已完成 - 绿色
  { value: 80, label: "作废", type: "danger" }, // 异常 - 红色
  { value: 99, label: "其他", type: "info" }, // 其他 - 灰色
] as const;

/**
 * 供应商业务代码 枚举
 */
export const supBizItemCodeEnum = [
  { value: "SUP_RK", label: "供应商入库" },
  { value: "SUP_XD", label: "供应商修订" },
  { value: "SUP_HMD", label: "供应商黑名单" },
];

// 辅助函数：根据value获取label
export const getLabel = <T extends { value: number | string; label: string }>(
  list: readonly T[],
  value: number | string,
) => {
  return list.find((item) => item.value == value)?.label || "";
};
// 辅助函数：根据value取type
export const getType = <T extends { value: number | string; type: string }>(
  list: readonly T[],
  value: number | string,
) => {
  return list.find((item) => item.value == value)?.type || "";
};
