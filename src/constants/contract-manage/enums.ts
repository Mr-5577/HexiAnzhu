/**
 * 合同管理模块 常量定义
 */
/** 合同类型 */
export const ConPropertyEnum = [
  { value: 1, label: "普通合同" },
  { value: 2, label: "战略合同" },
  { value: 3, label: "战略执行" },
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
  { value: 10, label: "审批中" },
  { value: 40, label: "已审批" },
  { value: 60, label: "已结算" },
  { value: 80, label: "已作废" },
] as const;

/** 管理类型 */
export const ManageTypeEnum = [
  { value: 1, label: "内部" },
  { value: 2, label: "外部" },
] as const;

/** 请款类型 */
export const ReqTypeEnum = [
  { value: 0, label: "请款" },
  { value: 1, label: "来票冲账" },
] as const;

/** 付款方式 */
export const PayTypeEnum = [
  { value: 1, label: "按进度确认" },
  { value: 2, label: "按材料到货确认" },
  // { value: 3, label: "按节点确认" },
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
  { value: 0, label: "审批流程" },
  { value: 1, label: "手工上传" },
] as const;

/** 合同类型 */
export const AnnexConTypeEnum = [
  { value: 'CON', label: "主合同" },
  { value: 'ADD', label: "补充合同" },
] as const;
/** 合同附件类型 */
export const AnnexTypeEnum = [
  { value: 0, label: "电子文档" },
  { value: 1, label: "签署文件" },
] as const;

/** 补充合同类型 */
export const AddTypeEnum = [
  { value: 1, label: "变更转补充" },
  { value: 2, label: "普通补充合同" },
] as const;

/** 补充合同事项明细来源类型 */
export const AddProcessSrcEnum = [
  { value: 0, label: "签证" },
  { value: 1, label: "变更" },
  { value: 2, label: "手工新增" },
];

/** 签证类型 */
export const VisaTypeEnum = [
  { value: 1, label: "签证" },
  { value: 2, label: "反签证" },
] as const;

/** 变更类型 */
export const ChangeTypeEnum = [
  { value: 1, label: "工程指令", type: "success" },
  { value: 2, label: "设计变更", type: "info" },
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
  { label: "合同", value: "CON_MAIN" },
  { label: "补充合同", value: "CON_ADD" },
  { label: "合同变更", value: "CON_BG" },
  { label: "合同签证", value: "CON_QZ" },
  { label: "合同产值", value: "CON_PROD" },
  { label: "合同预结算", value: "CON_PRE_SETTLE" },
  { label: "合同结算", value: "CON_SETTLE" },
  { label: "合同支付", value: "CON_PAY" },
  { label: "非合同立项", value: "NCON_PROC" },
  { label: "非合同请款", value: "NCON_CST" },
  { label: "费用报销", value: "NCON_FEE" },
];
/** 合同业务类型常量 */
export const bizTypeKey = {
  CON_MAIN: 'CON_MAIN', // 合同
  CON_ADD: 'CON_ADD', // 补充合同
  CON_BG: 'CON_BG', // 变更
  CON_QZ: 'CON_QZ', // 签证
  CON_PROD: 'CON_PROD', // 产值
  CON_PAY: 'CON_PAY', // 合同支付
  CON_PRE_SETTLE: 'CON_PRE_SETTLE', // 合同预结算
  CON_SETTLE: 'CON_SETTLE', // 合同结算
  NCON_PROC: 'NCON_PROC', // 非合同立项
  NCON_CST: 'NCON_CST', // 非合同请款
  NCON_FEE: 'NCON_FEE', // 费用报销
} as const;

/** 分摊状态选项 */
export const allocStatusEnum = [
  { label: "未分摊", value: 0, type: "info" },
  { label: "已分摊", value: 1, type: "success" },
  { label: "部分分摊", value: 2, type: "warning" },
];

/** 分摊预警选项 */
export const allocWarnEnum = [
  { label: "红色预警", value: 0, type: "danger", color: "#FF0000" },
  { label: "黄色预警", value: 1, type: "warning", color: "#E6A23C" },
  { label: "绿色预警", value: 2, type: "success", color: "#67C23A" },
];

/**
 * 合同管理 单据审批状态 枚举
 */
export const conBillStatusEnum = [
  { value: 0, label: "草稿", type: "info" }, // 待处理 - 灰色
  { value: 10, label: "审批中", type: "primary" }, // 进行中 - 蓝色
  { value: 40, label: "已审批", type: "success" }, // 已完成 - 绿色
  { value: 60, label: "已结算", type: "success" }, // 已结算 - 绿色
  { value: 80, label: "作废", type: "warning" }, // 异常 - 橙色
  { value: 99, label: "其他", type: "info" }, // 其他 - 灰色
];

/** 发票登记 发票状态 枚举 */
export const invoiceStatusEnum = [
  { value: 0, label: "待查验", type: "warning" }, // 警告色 - 需要用户操作
  { value: 1, label: "合格发票", type: "success" }, // 绿色 - 通过
  { value: 2, label: "待人工审核", type: "primary" }, // 蓝色 - 需要人工介入
  { value: 3, label: "人工通过", type: "success" }, // 绿色 - 通过
  { value: 4, label: "人工拒绝", type: "danger" }, // 红色 - 拒绝
];

// 辅助函数：根据value获取label
export const getLabel = <T extends { value: number | string; label: string }>(
  list: readonly T[],
  value: number | string,
) => {
  return list.find((item) => item.value == value)?.label || "";
};

// ============================================================
// 业务常量（款项类型，需与合同台账 payTypeId 保持一致）
// ============================================================
export const PROGRESS_PAY_TYPE = 2062; // 进度款
export const ACCEPT_PAY_TYPE = 2063; // 验收款
export const ADVANCE_PAY_TYPE = 2061; // 预付款
