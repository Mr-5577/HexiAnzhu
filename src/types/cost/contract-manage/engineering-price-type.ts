// ==================== 工程核价 类型定义 ====================
/**
 * 合同工程核价审批信息 对应数据库表: h_con_audit_price
 */
export interface ContractAuditPrice {
  /** 主键ID */
  id: number;
  /** 单据ID */
  conBillId?: number;
  /** 状态：0-草稿 5-审批中 10-已审批 30-已作废 */
  status: number;
  /** 状态名称（前端展示用） */
  statusName?: string;
  /** 合同签约金额 */
  signAmt?: number;
  /** 申报事项说明 */
  applyDesc?: string;
  /** 申报金额 */
  applyAmt?: number;
  /** 成本审核金额 */
  costingReviewAmt?: number;
  /** 成本审减金额 */
  costingCutAmt?: number;
  /** 成本审核意见 */
  costingOpinion?: string;
  /** 审计审核金额 */
  auditReviewAmt?: number;
  /** 审计审减金额 */
  auditCutAmt?: number;
  /** 审计审核意见 */
  auditOpinion?: string;
  /** 创建人ID */
  createId: number;
  /** 创建人姓名 */
  createName?: string;
  /** 创建时间 */
  createDate: string; // datetime格式: 'YYYY-MM-DD HH:mm:ss'
  /** 更新人ID */
  operId?: number;
  /** 更新人姓名 */
  operName?: string;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识：false-未删除，true-已删除 */
  isDel?: boolean;
}

/**
 * 新增/编辑工程核价 - 表单数据
 */
export interface ContractAuditPriceFormData {
  /** 工程核价ID（编辑时存在） */
  id?: number;
  /** 单据ID */
  conBillId?: number;
  /** 合同ID（关联选择） */
  conId?: number;
  /** 合同签约金额（带出展示） */
  signAmt?: number;
  /** 申报事项说明 */
  applyDesc: string;
  /** 申报金额 */
  applyAmt: number;
  /** 成本审核金额 */
  costingReviewAmt?: number;
  /** 成本审减金额（自动计算） */
  costingCutAmt?: number;
  /** 成本审核意见 */
  costingOpinion?: string;
  /** 审计审核金额 */
  auditReviewAmt?: number;
  /** 审计审减金额（自动计算） */
  auditCutAmt?: number;
  /** 审计审核意见 */
  auditOpinion?: string;
}
