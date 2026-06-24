// ==================== 合同奖惩 类型定义 ====================

/**
 * 合同奖惩 信息
 * @description 对应数据库表 h_con_ded
 */
export interface ContractDed {
  /** 主键ID */
  id: number;
  /** 单据ID */
  conBillId: number;
  /** 状态：0-草稿，5-审批中，10-已审批，30-已作废 */
  status: number;
  /** 扣款类型ID */
  dedTypeId: number;
  /** 奖罚金额 */
  dedAmt: number;
  /** 奖罚说明 */
  dedDesc: string;
  /** 创建人 */
  createId?: number;
  /** 创建时间 */
  createDate?: string;
  /** 更新人 */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识：false-未删除，true-已删除 */
  isDel?: boolean;
}

/**
 * 奖惩信息
 */
export interface DedInfo {
  /** 主键ID（编辑时必填） */
  id?: number;
  /** 状态：0-草稿，5-审批中，10-已审批，30-已作废 */
  status: number;
  /** 单据ID */
  conBillId: number;
  /** 扣款类型ID */
  dedTypeId: number;
  /** 奖罚金额 */
  dedAmt: number;
  /** 奖罚说明 */
  dedDesc?: string;
}
/**
 * 新增/编辑 合同奖惩参数
 */
export interface ContractDedParams {
  /** 主键ID（编辑时必填） */
  id?: number;
  /** 合同ID */
  conId: number;
  /** 奖惩信息 */
  rec: DedInfo;
}

/**
 * 合同奖惩审批参数
 */
export interface ContractDedApproveParams {
  /** 主键ID */
  id: number;
  /** 审批状态：5-审批中，10-已审批，30-已作废 */
  status: number;
  /** 审批意见 */
  approveOpinion?: string;
}

/**
 * 合同奖惩统计信息
 */
export interface ContractDedStatistics {
  /** 总奖罚金额 */
  totalDedAmt: number;
  /** 已审批金额 */
  approvedAmt: number;
  /** 审批中金额 */
  approvingAmt: number;
  /** 草稿金额 */
  draftAmt: number;
  /** 记录总数 */
  totalCount: number;
}
