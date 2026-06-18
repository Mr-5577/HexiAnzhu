// ==================== 合同结算 类型定义 ====================

/**
 * 合同结算 信息
 * @description 对应数据库表 h_con_settle
 */
export interface ContractSettle {
  /** 主键ID */
  id?: number;
  /** 单据ID */
  conBillId?: number;
  /** 状态：0-草稿，5-审批中，10-已审批，30-已作废 */
  status: number;
  /** 合同签约金额 */
  signAmt: number;
  /** 补充合同金额 */
  addAmt: number;
  /** 累计变更签证 */
  sumChangeAmt: number;
  /** 预结算合同金额 */
  preSettleAmt: number;
  /** 累计产值 */
  sumProdVal: number;
  /** 累计应付 */
  sumPayAmt: number;
  /** 累计请款 */
  sumAppyAmt: number;
  /** 累计实付 */
  sumPaidAmt: number;
  /** 累计欠款 */
  sumOwedAmt: number;
  /** 结算类型：0-部分结算，1-全部结算 */
  settleType: number;
  /** 申报结算金额 */
  applySettleAmt: number;
  /** 扣款总金额 */
  totalDedAmt: number;
  /** 累计已扣款 */
  sumDedAlreadyAmt: number;
  /** 结算申报说明 */
  applyDesc: string;
  /** 收到资料日期 */
  recvDocDate: string;
  /** 经办人签字日期 */
  operSignDate: string;
  /** 成本一审金额 */
  costFirstAmt: number;
  /** 成本一审审减金额 */
  costFirstDecAmt: number;
  /** 成本一审签字日期 */
  costFirstDate: string;
  /** 成本二审金额 */
  costSecondAmt: number;
  /** 成本二审审减金额 */
  costSecondDecAmt: number;
  /** 成本二审签字日期 */
  costSecondDate: string;
  /** 成本负责人签字日期 */
  costSignDate: string;
  /** 审计审核金额 */
  auditAmt: number;
  /** 审计审减金额 */
  auditDecAmt: number;
  /** 审计一审签字日期 */
  auditFirstSignDate: string;
  /** 审计二审签字日期 */
  auditSecondSignDate: string;
  /** 最终合同结算金额 */
  finalSettleAmt: number;
  /** 最终结算款金额（扣除质保金的未付尾款） */
  finalPaymentAmt: number;
  /** 最终质保金金额 */
  finalWarrAmt: number;
  /** 质保到期日 */
  warrExpireDate: string;
  /** 最终结算签字日期 */
  finalSettleSignDate: string;
  /** 最终结算说明 */
  settleDesc: string;
  /** 创建人 */
  createId?: number;
  /** 创建时间 */
  createDate?: string;
  /** 更新人 */
  operId?: number | null;
  /** 更新时间 */
  operDate?: string | null;
  /** 删除标识：false-未删除，true-已删除 */
  isDel?: boolean;
}

/**
 * 合同结算参数
 */
export interface ContractSettleParams {
  /** 主键ID（编辑时必填） */
  id?: number;
  /** 单据ID */
  conBillId: number;
  /** 结算类型：0-部分结算，1-全部结算 */
  settleType: number;
  /** 申报结算金额 */
  applySettleAmt: number;
  /** 结算申报说明 */
  applyDesc?: string;
  /** 收到资料日期 */
  recvDocDate?: string;
  /** 经办人签字日期 */
  operSignDate?: string;
}

/**
 * 新增/编辑 合同结算参数
 */
export interface ContractSettleSaveParams {
  settle: ContractSettle;
  settleDeds: ContractSettleDed[];
}

/**
 * 查询合同结算参数
 */
export interface ContractSettleQueryParams {
  /** 单据ID */
  conBillId?: number;
  /** 状态 */
  status?: number;
  /** 合同ID（通过关联查询） */
  conId?: number;
  /** 删除标识 */
  isDel?: boolean;
}

/**
 * 合同结算成本审核参数
 */
export interface ContractSettleCostingParams {
  /** 主键ID */
  id: number;
  /** 成本一审金额 */
  costFirstAmt?: number;
  /** 成本一审审减金额 */
  costFirstDecAmt?: number;
  /** 成本一审签字日期 */
  costFirstDate?: string;
  /** 成本二审金额 */
  costSecondAmt?: number;
  /** 成本二审审减金额 */
  costSecondDecAmt?: number;
  /** 成本二审签字日期 */
  costSecondDate?: string;
  /** 成本负责人签字日期 */
  costSignDate?: string;
}

/**
 * 合同结算审计审核参数
 */
export interface ContractSettleAuditParams {
  /** 主键ID */
  id: number;
  /** 审计审核金额 */
  auditAmt: number;
  /** 审计审减金额 */
  auditDecAmt: number;
  /** 审计一审签字日期 */
  auditFirstSignDate?: string;
  /** 审计二审签字日期 */
  auditSecondSignDate?: string;
}

/**
 * 合同结算最终确认参数
 */
export interface ContractSettleFinalParams {
  /** 主键ID */
  id: number;
  /** 最终合同结算金额 */
  finalSettleAmt: number;
  /** 最终结算款金额（扣除质保金的未付尾款） */
  finalPaymentAmt: number;
  /** 最终质保金金额 */
  finalWarrAmt: number;
  /** 质保到期日 */
  warrExpireDate: string;
  /** 最终结算签字日期 */
  finalSettleSignDate: string;
  /** 最终结算说明 */
  settleDesc?: string;
  /** 状态（设置为已审批） */
  status?: number;
}

/**
 * 合同结算审批参数
 */
export interface ContractSettleApproveParams {
  /** 主键ID */
  id: number;
  /** 审批状态 */
  status: number;
  /** 审批意见 */
  approveOpinion?: string;
}

// ==================== 合同结算-扣款明细 类型定义 ====================

/**
 * 合同结算-扣款明细 信息
 * @description 对应数据库表 h_con_settle_ded
 */
export interface ContractSettleDed {
  /** 主键ID */
  id?: number;
  /** 单据ID */
  conBillId: number;
  /** 扣款事项ID */
  dedId: number;
  /** 扣款事项 */
  dedName: string;
  /** 扣款金额 */
  dedAmt: number;
  /** 扣款类型ID */
  dedTypeId: number;
  /** 已扣款金额 */
  dedAlreadyAmt: number;
  /** 未扣款金额 */
  dedLastAmt: number;
  /** 扣款说明 */
  dedDesc: string;
  /** 创建人 */
  createId?: number;
  /** 创建时间 */
  createDate?: string;
  /** 更新人 */
  operId?: number | null;
  /** 更新时间 */
  operDate?: string | null;
  /** 删除标识 */
  isDel?: boolean;
}

/**
 * 新增/编辑 结算扣款明细参数
 */
export interface ContractSettleDedParams {
  /** 主键ID（编辑时必填） */
  id?: number;
  /** 单据ID */
  conBillId: number;
  /** 扣款事项 */
  dedName: string;
  /** 扣款金额 */
  dedAmt: number;
  /** 扣款类型ID */
  dedTypeId: number;
  /** 已扣款金额 */
  dedAlreadyAmt?: number;
  /** 未扣款金额 */
  dedLastAmt?: number;
  /** 扣款说明 */
  dedDesc?: string;
}
