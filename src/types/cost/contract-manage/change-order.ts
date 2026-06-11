// ==================== 变更指令 类型定义 ====================
/**
 * 合同变更明细 对应数据库表: h_con_change_conlist
 */
export interface ContractChangeDetail {
  /** 主键ID */
  id: number;
  /** 单据ID */
  conBillId?: number;
  /** 变更单ID（外键） */
  changeId?: number;
  /** 合同ID */
  conId: string;
  /** 合同名称（前端展示用） */
  conName?: string;
  /** 合同系统编号（前端展示用） */
  conSysNo?: string;
  /** 预估变更金额 */
  estChangeAmt: number;
  /** 无效成本金额 */
  wasteCostAmt?: number;
  /** 无效成本原因ID（数据字典） */
  wasteCostReasonId: number;
  /** 无效成本原因名称 */
  wasteCostReasonName?: string;
  /** 是否需签证 */
  needVisa?: boolean;
  /** 说明 */
  remark: string;
  /** 创建人ID */
  createId?: number;
  /** 创建人姓名 */
  createName?: string;
  /** 创建时间 */
  createDate?: string;
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
 * 新增/编辑 合同变更明细
 */
export interface ContractChangeDetailFormData {
  /** 明细ID（编辑时存在） */
  id?: number;
  /** 单据ID */
  conBillId?: number;
  /** 变更单ID */
  changeId?: number;
  /** 合同ID */
  conId: string;
  /** 预估变更金额 */
  estChangeAmt: number;
  /** 无效成本金额 */
  wasteCostAmt?: number;
  /** 无效成本原因ID */
  wasteCostReasonId?: number;
  /** 是否需签证 */
  needVisa: boolean;
  /** 说明 */
  remark: string;
}

/**
 * 合同变更单 对应数据库表: h_con_change
 */
export interface ContractChange {
  /** 主键ID */
  id: number;
  /** 单据ID */
  conBillId?: number;
  /** 状态：0-草稿 5-审批中 10-已审批 30-已作废 */
  status: number;
  /** 状态名称（前端展示用） */
  statusName?: string;
  /** 变更名称 */
  changeName?: string;
  /** 变更类型：1-工程指令 2-设计变更 */
  changeType?: number;
  /** 变更类型名称 */
  changeTypeName?: string;
  /** 变更原因ID（数据字典） */
  changeReasonId?: number;
  /** 变更原因名称 */
  changeReasonName?: string;
  /** 变更原因说明 */
  changeReasonDesc?: string;
  /** 变更内容 */
  changeConent?: string;
  /** 变更总金额（明细汇总） */
  changeAmt?: number;
  /** 创建人ID */
  createId?: number;
  /** 创建人姓名 */
  createName?: string;
  /** 创建时间 */
  createDate?: string; // datetime格式: 'YYYY-MM-DD HH:mm:ss'
  /** 更新人ID */
  operId?: number;
  /** 更新人姓名 */
  operName?: string;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识：false-未删除，true-已删除 */
  isDel?: boolean;
}

/** 合同变更 */
export interface ContractChangeData {
  /** 主键 */
  id?: number;
  /** 单据ID */
  conBillId?: number;
  /** 状态 */
  status?: number;
  /** 变更名称 */
  changeName?: string;
  /** 变更类型：1-工程指令 2-设计变更 */
  changeType?: number;
  /** 变更原因ID */
  changeReasonId?: number;
  /** 变更原因说明 */
  changeReasonDesc?: string;
  /** 变更内容 */
  changeConent?: string;
  /** 变更总金额 */
  changeAmt?: number;
}

/** 新增/编辑 变更合同 */
export interface ContractChangeFormData {
  change: ContractChangeData;
  conlist: ContractChangeDetailFormData[];
}
