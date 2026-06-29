// ==================== 履约保证金 类型定义 ====================

/** 基础实体字段 */
export interface BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 删除标识：0-未删除，1-已删除 */
  isDel?: boolean | string;
  /** 创建人ID */
  createId?: number;
  /** 创建时间 */
  createDate?: string;
  /** 更新人ID */
  operId?: number;
  /** 更新时间 */
  operDate?: string;
}

/**
 * 履约保证金缴纳 列表
 */
export interface PerformanceBondList extends BaseEntity {
  /** 主键 */
  id: number;
  /** 合同单据ID */
  conBillId: number;
  /** 缴纳方式ID */
  recvTypeId: number;
  /** 缴纳金额 */
  recvAmt: number;
  /** 缴纳日期 */
  recvDate: string;
  /** 附件凭证 */
  annexId: number;
  srcBillId: number;
}
/**
 * 新增履约保证金缴纳 参数
 */
export interface PerformanceBondParam {
  /** 合同ID */
  conId: number;
  recv: {
    /** 合同单据ID */
    conBillId: number;
    /** 缴纳方式ID */
    recvTypeId: number;
    /** 缴纳金额 */
    recvAmt: number;
    /** 缴纳日期 */
    recvDate: string;
    /** 附件凭证 */
    annexId: number;
    srcBillId?: number;
  };
}
/**
 * 编辑履约保证金缴纳 参数
 */
export interface PerformanceBondEditParam {
  /** 主键 */
  id: number;
  /** 合同单据ID */
  conBillId: number;
  /** 缴纳方式ID */
  recvTypeId: number;
  /** 缴纳金额 */
  recvAmt: number;
  /** 缴纳日期 */
  recvDate: string;
  /** 附件凭证 */
  annexId: number;
  srcBillId?: number;
}

/**
 * 履约保证金退还 列表信息
 */
export interface PerformanceBondReturnList extends BaseEntity {
  /** 主键 */
  id: number;
  /** 合同单据ID */
  conBillId: number;
  /** 退还方式ID */
  refundTypeId: number;
  /** 退还金额 */
  refundAmt: number;
  /** 退还日期 */
  refundDate: string;
  /** 附件凭证 */
  annexId: number;
  srcBillId: number;
}
/**
 * 新增履约保证金退还 参数
 */
export interface PerformanceBondReturnParam {
  /** 合同ID */
  conId: number;
  refu: {
    /** 合同单据ID */
    conBillId: number;
    /** 退还方式ID */
    refundTypeId: number;
    /** 退还金额 */
    refundAmt: number;
    /** 退还日期 */
    refundDate: string;
    /** 附件凭证 */
    annexId: number;
    srcBillId?: number;
  };
}
/**
 * 编辑履约保证金退还 参数
 */
export interface PerformanceBondReturnEditParam {
  /** 主键 */
  id: number;
  /** 合同单据ID */
  conBillId?: number;
  /** 退还方式ID */
  refundTypeId: number;
  /** 退还金额 */
  refundAmt: number;
  /** 退还日期 */
  refundDate: string;
  /** 附件凭证 */
  annexId: number;
  srcBillId?: number;
}
