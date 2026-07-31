// ==================== 发票管理 类型定义 ====================

/**
 * 通用基础类型
 */
export interface BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 删除标识：false-未删除，true-已删除 */
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

/**
 * 发票管理列表
 */
export interface VoInvoiceLedger extends BaseEntity {
  /** 业务板块 */
  segName: string;
  /** 项目名称 */
  projName: string;
  /** 合同名称 */
  conName: string;
  /** 合同编号 */
  conSysNo: string;
  /** 供应商名称 */
  supName: string;
  /** 合同金额 / 请款金额(NCON) */
  signAmt: number;
  /** 结算状态 */
  settleStatus: string;
  /** 累计产值 */
  sumProdVal: number;
  /** 累计请款 */
  sumPayAmt: number;
  /** 发票金额 */
  sumInvoiceAmt: number;
  /** 欠票金额 */
  sumOwedInvoiceAmt: number;
  /** 发票数 */
  sumInvoiceCount: number;
  /** 单据ID */
  billId: number;
  /** 来源类型：CON / NCON */
  srcType: string;
}

/**
 * 发票明细
 */
export interface VoInvoiceDetail extends BaseEntity {
  /** 发票号 */
  invNo: string;
  /** 发票类型 */
  invType: string;
  /** 请款单号 */
  bizNo: string;
  /** 发票金额 */
  invAmt: number;
  /** 请款金额 */
  reqAmt: number;
  /** 合同名称 */
  conName: string;
  /** 供应商名称 */
  supName: string;
  /** 甲方公司 */
  compName: string;
  /** 请款日期 */
  reqDate: string | Date;
  /** 查验状态（0=待查验 1=合格发票 2=待人工审核 3=人工通过 4=人工拒绝） */
  status: number;
  /** 结果描述 */
  validateMsg: string;
  /** 发票ID */
  invId: number;
  /** 来源类型：CON / NCON */
  srcType: string;
}
