// ==================== 合同特殊事项 类型定义 ====================

/**
 * 合同特殊事项审批信息 对应数据库表: h_con_special
 */
export interface ContractSpecial {
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
  /** 合同总产值 */
  totalProdVal?: number;
  /** 总应付 */
  totalPayable?: number;
  /** 总已付 */
  totalPaid?: number;
  /** 总欠款 */
  totalOwed?: number;
  /** 特殊情况说明 */
  specialDesc?: string;
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
 * 特殊事项信息（表单数据）
 */
export interface SpecialInfo {
  /** 主键ID（编辑时存在） */
  id?: number;
  /** 单据ID */
  conBillId?: number;
  /** 状态：0-草稿 5-审批中 10-已审批 30-已作废 */
  status?: number;
  /** 合同签约金额（带出展示） */
  signAmt?: number;
  /** 合同总产值（带出展示） */
  totalProdVal?: number;
  /** 总应付（带出展示） */
  totalPayable?: number;
  /** 总已付（带出展示） */
  totalPaid?: number;
  /** 总欠款（带出展示） */
  totalOwed?: number;
  /** 特殊情况说明（必填） */
  specialDesc: string;
}

/**
 * 新增/编辑合同特殊事项 - 表单数据
 */
export interface ContractSpecialFormData {
  /** 合同ID */
  conId: number;
  /** 特殊事项信息 */
  special: SpecialInfo;
}

