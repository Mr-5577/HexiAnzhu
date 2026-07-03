// =========================== 成本分摊模块 类型定义 =================================

/** 成本分摊主表实体 */
export interface CostAllocationMain {
  /** 主键ID */
  id: number;
  /** 项目ID */
  projId: number;
  /** 业务类型：1-合同 2-补充合同 3-变更 4-签证 5-结算 6-非合同 */
  bizType: number;
  /** 业务单据ID */
  bizBillId: number;
  /** 业务明细ID（如变更明细表的主键ID） */
  bizKeyId: number;
  /** 分摊总额（含税） */
  allocAmt: number;
  /** 分摊总额（不含税） */
  allocExclAmt: number;
  /** 分摊状态：0-未分摊 1-已分摊 2-部分分摊 3-分摊异常 */
  allocStatus: number;
  /** 分摊预警 */
  allocWarn?: string;
  /** 分摊说明 */
  remark: string;
  /** 删除标识：false-未删除 true-已删除 */
  isDel: boolean;
  /** 创建人ID */
  createId: number;
  /** 创建时间 */
  createDate: string;
  /** 更新人ID */
  operId: number;
  /** 更新时间 */
  operDate: string;
}

/** 成本分摊明细表实体 */
export interface CostAllocationDetail {
  /** 主键ID */
  id: number;
  /** 主表ID */
  allocMid: number;
  /** 科目ID */
  subId: number;
  /** 科目名称 */
  subName: string;
  /** 业态ID */
  prodId: number;
  /** 业态名称 */
  prodName: string;
  /** 分摊金额（含税） */
  costAmt: number;
  /** 分摊金额（不含税） */
  costExclAmt: number;
  /** 分摊预警 */
  allocWarn?: string;
  /** 删除标识：false-未删除 true-已删除 */
  isDel: boolean;
  /** 创建人ID */
  createId: number;
  /** 创建时间 */
  createDate: string;
  /** 更新人ID */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
}

/** 成本分摊科目关联表 */
export interface CostAllocationSubject {
  id: number;
  allocMid: number;
  subId: number;
  isDel: boolean;
  createId: number;
  createDate: string;
  operId?: number;
  operDate?: string;
}

/** 成本分摊产品关联表 */
export interface CostAllocationProduct {
  id: number;
  allocMid: number;
  prodId: number;
  isDel: boolean;
  createId: number;
  createDate: string;
  operId?: number;
  operDate?: string;
}

/** 待分摊列表项VO */
export interface PendingAllocationItemVO {
  /** 分摊主表ID */
  allocId: number;
  /** 项目ID */
  projId: number;
  /** 项目名称 */
  projName: string;
  /** 业务类型：1-合同 2-补充合同 3-变更 4-签证 5-结算 6-非合同 */
  bizType: number;
  /** 业务类型名称 */
  bizTypeName: string;
  /** 业务编号 */
  bizNo: string;
  /** 业务名称 */
  bizName: string;
  /** 业务金额（含税） */
  bizAmount: number;
  /** 业务金额（不含税） */
  bizExclAmount?: number;
  /** 已分摊金额（含税） */
  allocatedAmount: number;
  /** 已分摊金额（不含税） */
  allocatedExclAmount?: number;
  /** 待分摊金额（含税） */
  remainingAmount: number;
  /** 待分摊金额（不含税） */
  remainingExclAmount?: number;
  /** 分摊状态：0-未分摊 1-已分摊 2-部分分摊 3-分摊异常 */
  allocStatus: number;
  /** 分摊状态名称 */
  allocStatusName: string;
  /** 分摊说明 */
  remark?: string;
  /** 创建时间 */
  createDate: string;
}

/** 分摊详情VO（含已分摊明细） */
export interface AllocationDetailVO {
  /** 主表ID */
  allocId: number;
  /** 项目ID */
  projId: number;
  /** 项目名称 */
  projName: string;
  /** 业务类型：1-合同 2-补充合同 3-变更 4-签证 5-结算 6-非合同 */
  bizType: number;
  /** 业务类型名称 */
  bizTypeName: string;
  /** 业务编号 */
  bizNo: string;
  /** 业务名称 */
  bizName: string;
  /** 业务金额（含税） */
  bizAmount: number;
  /** 业务金额（不含税） */
  bizExclAmount: number;
  /** 已分摊总金额（含税） */
  totalAllocated: number;
  /** 已分摊总金额（不含税） */
  totalAllocatedExcl: number;
  /** 待分摊金额（含税） */
  remainingAmount: number;
  /** 待分摊金额（不含税） */
  remainingExclAmount: number;
  /** 分摊状态：0-未分摊 1-已分摊 2-部分分摊 3-分摊异常 */
  allocStatus: number;
  /** 分摊状态名称 */
  allocStatusName: string;
  /** 分摊说明 */
  remark?: string;
  /** 已分摊明细列表 */
  details: AllocatedDetailVO[];
}

/** 已分摊明细VO */
export interface AllocatedDetailVO {
  /** 明细ID */
  id: number;
  /** 科目ID */
  subId: number;
  /** 科目名称 */
  subName: string;
  /** 科目编码 */
  subCode: string;
  /** 业态ID */
  prodId: number;
  /** 业态名称 */
  prodName: string;
  /** 业态编码 */
  prodCode: string;
  /** 分摊金额（含税） */
  costAmt: number;
  /** 分摊金额（不含税） */
  costExclAmt: number;
}

/** 业务信息VO（关联业务数据） */
export interface BizInfoVO {
  /** 业务ID */
  id: number;
  /** 业务编号 */
  bizNo: string;
  /** 业务名称 */
  bizName: string;
  /** 业务金额（含税） */
  bizAmount: number;
  /** 业务金额（不含税） */
  bizExclAmount?: number;
  /** 项目ID */
  projId: number;
  /** 项目名称 */
  projName?: string;
  /** 业务状态 */
  status?: number;
  /** 业务类型：1-合同 2-补充合同 3-变更 4-签证 5-结算 6-非合同 */
  bizType: number;
}

/** 查询分摊主表 参数 */
export interface CostAllocationQueryDTO {
  /** 项目ID（必填） */
  projId?: number;
  /** 主键ID */
  id?: number;
  /** 业务类型（可选） */
  bizType?: number;
  /** 业务单据ID（可选） */
  bizBillId?: number;
}
/**
 * 新增/编辑 成本分摊主表 参数
 */
export interface CostAllocationDTO {
  /** 主键ID */
  id?: number;
  /** 项目ID */
  projId: number;
  /** 项目名称 */
  projName?: string;
  /** 业务类型：1-合同 2-补充合同 3-变更 4-签证 5-结算 6-非合同 */
  bizType: number;
  /** 业务单据ID（合同：h_con_bill；非合同：h_ncon_bill） */
  bizBillId: number;
  /** 业务明细ID（如变更明细表的主键ID） */
  bizKeyId: number;
  /** 分摊总额（含税） */
  allocAmt: number;
  /** 分摊总额（不含税） */
  allocExclAmt: number;
  /** 分摊状态：0-未分摊 1-已分摊 2-部分分摊 3-分摊异常 */
  allocStatus: number;
  /** 分摊预警 */
  allocWarn: number;
  /** 分摊说明 */
  remark: string;
}

/** 查询分摊明细表 参数 */
export interface CostAllocationDetailQueryDTO {
  /** 主键ID */
  id?: number;
  /** 主表ID */
  allocMid?: number;
  /** 科目ID */
  subId?: number;
  /** 业态ID */
  prodId?: number;
}
/**
 * 新增/编辑 成本分摊明细表 参数
 */
export interface CostAllocationDetailDTO {
  /** 主键ID */
  id?: number;
  /** 主表ID */
  allocMid: number;
  /** 科目ID */
  subId: number;
  /** 科目名称 */
  subName: string;
  /** 业态ID */
  prodId: number;
  /** 业态名称 */
  prodName: string;
  /** 分摊金额（含税） */
  allocAmt: number;
  /** 分摊金额（不含税） */
  allocExclAmt: number;
  /** 分摊预警 */
  allocWarn: number;
}

/**
 * 动态成本自动分摊 参数
 */
export interface AutoAllocateCostDTO {
  /** 合同ID */
  conId: number;
  subList: {
    /** 科目ID */
    subId: number;
    /** 分摊金额（含税） */
    allocAmt: number;
    /** 分摊金额（不含税） */
    allocExclAmt: number;
  }[];
}
