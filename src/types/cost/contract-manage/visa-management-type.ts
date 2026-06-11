// ==================== 签证管理 类型定义 ====================
/**
 * 合同签证单信息 对应数据库表: h_con_visa
 */
export interface ContractVisa {
  /** 主键ID */
  id: number;
  /** 单据ID */
  conBillId?: number;
  /** 状态：0-草稿 5-审批中 10-已审批 30-已作废 */
  status: number;
  /** 状态名称（前端展示用） */
  statusName?: string;
  /** 变更ID */
  changeId: string;
  /** 变更信息（前端关联展示） */
  changeInfo?: {
    changeName: string;
    changeType: number;
    changeAmt: number;
  };
  /** 签证类型：1-签证 2-反签证 */
  visaType: number;
  /** 签证类型名称 */
  visaTypeName?: string;
  /** 签证申报金额 */
  visaApplyAmt: string;
  /** 签证申报说明 */
  visaApplyDesc: string;
  /** 成本审核金额 */
  costingReviewAmt?: number;
  /** 成本审减金额 */
  costingCutAmt?: number;
  /** 成本审核意见 */
  costingOpinion?: string;
  /** 无效成本金额 */
  wasteCostAmt?: number;
  /** 无效成本原因ID（数据字典） */
  wasteCostReasonId: number;
  /** 无效成本原因名称 */
  wasteCostReasonName?: string;
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
 * 新增/编辑合同签证 - 表单数据 
 */
export interface ContractVisaFormData {
  /** 签证ID（编辑时存在） */
  id?: number;
  /** 单据ID */
  conBillId?: number;
  /** 状态：0-草稿 5-审批中 10-已审批 30-已作废 */
  status: number;
  /** 变更单ID（关联选择） */
  changeId?: string;
  /** 签证类型：1-签证 2-反签证 */
  visaType: number;
  /** 签证申报金额 */
  visaApplyAmt: number | string;
  /** 签证申报说明 */
  visaApplyDesc: string;
  /** 成本审核金额 */
  costingReviewAmt?: number;
  /** 成本审减金额 */
  costingCutAmt?: number;
  /** 成本审核意见 */
  costingOpinion?: string;
  /** 无效成本金额 */
  wasteCostAmt?: number;
  /** 无效成本原因ID */
  wasteCostReasonId?: number;
  /** 审计审核金额 */
  auditReviewAmt?: number;
  /** 审计审减金额 */
  auditCutAmt?: number;
  /** 审计审核意见 */
  auditOpinion?: string;
}
