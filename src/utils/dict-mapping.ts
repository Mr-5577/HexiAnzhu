import { ContractType } from "../types/cost/master-data/contract-category-type";
/**
 * 数据字典类型映射
 * 前端类型 => 后端参数类型
 */
export const dictMapping = {
  /** 企业性质 */
  enterpriseNature: "ENTERPRISE_NATURE",
  /** 纳税类型 */
  taxType: "TAX_TYPE",
  /** 供应商来源 */
  supplierSource: "SUPPLIER_SOURCE",
  /** 法人证件类型 */
  legalCardType: "LEGAL_CARD_TYPE",
  /** 面积版本 */
  areaVersion: "AREA_VER",
  /** 目标成本版本 */
  goalCostVersionType: "CST_VER",
  /** 采购方式 */
  purchaseMethod: "PURCHASE_METHOD",
  /** 招标方式 */
  tenderMethod: "TENDER_METHOD",
  /** 清单模式 */
  billMode: "BILL_MODE",
  /** 缴纳方式 */
  payMethod: "PAY_METHOD",
  /** 退还方式 */
  refundMethod: "REFUND_METHOD",
  /** 分摊规则 */
  allocationRule: "FTGZ",
  /** 业务归属 */
  businessSegment: "YWGS",
  /** 生产专业 */
  proProf: "PRO_PROF",
  /** 核算项目 */
  acctProj: "ACCT_PROJ",
  /** 附件类型 */
  annexType: "ANNEX_TYPE",
  /** 无效成本原因 */
  invalidCostReason: "INVALID_COST_REASON",
  /** 变更原因原因 */
  changeReason: "CHANGE_REASON",
} as const;

// 导出类型，用于类型提示
export type DictType = keyof typeof dictMapping;
