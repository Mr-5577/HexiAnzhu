// ==================== 合同解除（合同作废）类型定义 ====================

/**
 * 合同解除（合同作废）信息
 * @description 对应数据库表 h_con_void
 */
export interface ContractVoid {
  /** 主键ID */
  id: number;
  /** 单据ID */
  conBillId: number;
  /** 状态：0-草稿，5-审批中，10-已审批，30-已作废 */
  status: number;
  /** 合同签约金额 */
  signAmt: number;
  /** 累计产值 */
  sumProdVal: number;
  /** 累计请款 */
  sumAppyAmt: number;
  /** 经办人 */
  agentId: number;
  /** 作废日期 */
  voidDate: string;
  /** 作废说明 */
  voidDesc: string;
  /** 创建人 */
  createId: number;
  /** 创建时间 */
  createDate: string;
  /** 更新人 */
  operId: number | null;
  /** 更新时间 */
  operDate: string | null;
  /** 删除标识：false-未删除，true-已删除 */
  isDel: boolean;
}

/**
 * 新增/编辑 合同解除参数
 */
export interface ContractVoidParams {
  /** 主键ID（编辑时必填） */
  id?: number;
  /** 单据ID */
  conBillId: number;
  /** 状态 */
  status: number;
  /** 合同签约金额 */
  signAmt: number;
  /** 累计产值 */
  sumProdVal: number;
  /** 累计请款 */
  sumAppyAmt: number;
  /** 经办人 */
  agentId?: number;
  /** 作废日期 */
  voidDate: string;
  /** 作废说明 */
  voidDesc: string;
}

/**
 * 合同解除审批参数
 */
export interface ContractVoidApproveParams {
  /** 主键ID */
  id: number;
  /** 审批状态：5-审批中，10-已审批，30-已作废 */
  status: number;
  /** 审批意见 */
  approveOpinion?: string;
}
