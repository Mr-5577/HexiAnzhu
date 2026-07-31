/**
 * 成本管理 相关常量定义
 */

/**
 * 目标成本 单据审批状态 枚举
 */
export const costBillStatusEnum = [
  { value: 0, label: "草稿", type: "info" }, // 待处理 - 灰色
  { value: 10, label: "审批中", type: "primary" }, // 进行中 - 蓝色
  { value: 40, label: "已审批", type: "success" }, // 已完成 - 绿色
  { value: 80, label: "作废", type: "warning" }, // 异常 - 橙色
  { value: 99, label: "其他", type: "info" }, // 其他 - 灰色
];
