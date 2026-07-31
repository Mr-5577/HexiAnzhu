// ==================== 合同预结算 类型定义 ====================

/**
 * 合同预结算 信息
 * @description 对应数据库表 h_con_pre_settle
 */
export interface ContractPreSettle {
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
  /** 预估合同金额 */
  preSettleAmt: number;
  /** 调整说明 */
  preSettleDesc: string;
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
 * 编辑预结算 参数
 */
export interface ContractPreSettleEditParams {
  /** 主键ID（编辑时必填） */
  id?: number;
  /** 单据ID */
  conBillId: number;
  /** 状态：0-草稿，5-审批中，10-已审批，30-已作废 */
  status: number;
  /** 合同签约金额 */
  signAmt: number;
  /** 补充合同金额 */
  addAmt: number;
  /** 累计变更签证 */
  sumChangeAmt: number;
  /** 预估合同金额 */
  preSettleAmt: number;
  /** 调整说明 */
  preSettleDesc: string;
}

/**
 * 新增 合同预结算参数
 */
export interface ContractPreSettleSaveParams {
  /** 合同ID */
  conId: number;
  rec: ContractPreSettleEditParams;
}
