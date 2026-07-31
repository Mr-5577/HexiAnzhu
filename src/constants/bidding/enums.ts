/**
 * 招标管理 相关常量定义
 */

/**
 * 招标业务代码 枚举
 */
export const supBizItemCodeEnum = [
  { value: "ZB_XQ", label: "招标需求" },
  { value: "ZB_JH", label: "招标计划" },
  { value: "ZB_CK", label: "招标参考" },
  { value: "ZB_DB", label: "定标审批" },
  { value: "ZB_BZJ", label: "招标保证金" },
  { value: "ZB_BZJTH", label: "招标保证金退还" },
];

/**
 * 招标管理 - 招标需求 审批状态 枚举
 */
export const approvalStatusEnum = [
  { value: 0, label: "草稿", type: "info" }, // 待处理 - 灰色
  { value: 10, label: "审批中", type: "primary" }, // 进行中 - 蓝色
  { value: 40, label: "已审批", type: "success" }, // 已完成 - 绿色
  { value: 80, label: "作废", type: "warning" }, // 异常 - 橙色
  { value: 99, label: "其他", type: "info" }, // 其他 - 灰色
];

/**
 * 招标管理-招标事项 采购状态 枚举
 */
export const purchaseStatusEnum = [
  { value: 0, label: "草稿", type: "info" }, // 未提交 - 灰色
  { value: 1, label: "已审批", type: "success" }, // 已通过 - 绿色
  { value: 2, label: "招标中", type: "primary" }, // 进行中 - 蓝色
  { value: 3, label: "已定标", type: "warning" }, // 待签约 - 橙色（提醒签约）
  { value: 4, label: "已签约", type: "success" }, // 已完成 - 绿色
];

/**
 * 招标管理-招标事项 单据审批状态 枚举
 */
export const purchaseBillStatusEnum = [
  { value: 0, label: "草稿", type: "info" }, // 待处理 - 灰色
  { value: 10, label: "审批中", type: "primary" }, // 进行中 - 蓝色
  { value: 40, label: "已审批", type: "success" }, // 已完成 - 绿色
  { value: 80, label: "作废", type: "warning" }, // 异常 - 橙色
  { value: 99, label: "其他", type: "info" }, // 其他 - 灰色
];
