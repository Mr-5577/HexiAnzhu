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
  /** 目标成本版本类型 */
  goalCostVersionType: "CST_VER",
  /** 分摊规则 */
  allocationRule: "FTGZ",
  /** 业务归属 */
  businessSegment: "YWGS",
} as const;

// 导出类型，用于类型提示
export type DictType = keyof typeof dictMapping;
