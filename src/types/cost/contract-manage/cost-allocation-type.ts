// =========================== 成本分摊模块 类型定义 =================================

/** 基础实体类型 */
export interface BaseEntity {
  /** 主键ID */
  id?: number;
  /** 删除标识：false-未删除 true-已删除 */
  isDel?: boolean;
  /** 创建人ID */
  createId?: number;
  /** 创建时间 */
  createDate?: string;
  /** 更新人ID */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
}
/** 成本分摊主表实体 */
export interface CostAllocationMain extends BaseEntity {
  /** 主键ID */
  id?: number;
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
}

/** 成本分摊明细表实体 */
export interface CostAllocationDetail extends BaseEntity {
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

/**
 * 保存项目成本分摊（主从表）
 */
export interface SaveCostAllocationDTO {
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
  /** 明细 */
  detailList: CostAllocationDetailDTO[];
}

/**
 * 非合同成本分摊-自动分摊 参数
 */
export interface NconAutoAllocDTO {
  /** 项目ID */
  projId: number;
  subList: {
    /** 科目ID */
    subId: number;
    /** 分摊金额（含税） */
    allocAmt: number;
    /** 分摊金额（不含税） */
    allocExclAmt: number;
  }[];
  /** 产品数据 */
  prodList: {
    /** 产品ID */
    id?: number;
    pid?: number;
    /** 产品编码 */
    prodCode: string;
    /** 产品名称 */
    prodName: string;
    /** 产品类型 */
    prodType: number;
    /** 产品层级 */
    prodLevel: number;
    /** 产品描述 */
    prodDesc: string;
    /** 是否启用 */
    isEnabled: boolean;
  }[];
}