// ==================== 建安支付 类型定义 ====================

// 基础实体类型（包含通用字段）
interface BaseEntity {
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

// 建安支付 主表
export interface NconPayment extends BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 单据ID */
  nconBillId?: number;
  /** 业务板块ID */
  segId: number;
  /** 项目ID */
  projId: number;
  /** 归属月份 */
  belongMonth: string;
  /** 费用类型 */
  feeTypeId: number;
  /** 立项ID */
  processId: number;
  /** 事项金额 */
  processAmt: number;
  /** 累计已请款 */
  sumAppyAmt: number;
  /** 剩余可请款金额 */
  sumOwedAmt: number;
  /** 本次请款金额 */
  reqAmt: number;
  /** 实际请款金额 */
  factReqAmt: number;
  /** 请款说明 */
  reqDesc?: string;
  /** 应收发票金额 */
  invRecAmt: number;
  /** 已收发票金额 */
  invRcvdAmt: number;
  /** 欠票金额 */
  invOweAmt?: number;
}

// 扣款事项明细
export interface NconDedUsed extends BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 类型枚举，建安支付：NCON_CST   费用支付：NCON_FEE */
  srcType: string;
  /** 单据ID */
  paymentId?: number;
  /** 扣款事项名称 */
  dedName: string;
  /** 扣款金额 */
  dedAmt: number;
  /** 扣款类型，数据字典 */
  dedTypeId: number;
  /** 扣款说明 */
  dedDesc?: string;
}

// 发票主表
export interface NconBillInvoiceM extends BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 类型枚举，建安支付：NCON_CST   费用支付：NCON_FEE */
  srcType: string;
  /** 单据ID */
  paymentId?: number;
  /** 发票号 */
  invNo: string;
  /** 开票日期 */
  invDate: string;
  /** 发票总金额 */
  totalAmt: number;
  /** 不含税金额 */
  notTaxAmt: number;
  /** 税额 */
  taxAmt: number;
  /** 发票类型 */
  invType: string;
  /** 附件ID */
  annexId?: number;
  /** 是否有效/是否真发票 */
  isValid?: boolean;
  /** 是否重复 */
  isRepeat?: boolean;
  /**  查验结果说明 */
  validateMsg?: string;
  /**  OCR识别结果 */
  ocrRes?: string;
  /**  查验返回结果 */
  validateRes?: string;
  /** 发票状态（0=待查验 1=合格发票 2=待人工审核 3=人工通过 4=人工拒绝） */
  status?: number;
  /** 发票明细 */
  detailList?: NconBillInvoiceD[];
}

// 发票子表（发票明细）
export interface NconBillInvoiceD extends BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 主表ID */
  invMid?: number;
  /** 项目名称 */
  itemName: string;
  /** 规格 */
  size: string;
  /** 单位 */
  unit: string;
  /** 数量 */
  num: number;
  /** 单价 */
  price: number;
  /** 金额 */
  totalAmt: number;
  /** 税率 */
  taxRate: number;
  /** 税额 */
  taxAmt: number;
}

// 付款方式
export interface NconPaymentWay extends BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 类型枚举，建安支付：NCON_CST   费用支付：NCON_FEE */
  srcType: string;
  /** 单据ID */
  paymentId?: number;
  /** 事项说明 */
  payDesc: string;
  /** 收款开户行 */
  bankName: string;
  /** 收款账户名 */
  accountName: string;
  /** 收款账号 */
  bankAccount: number | string;
  /** 付款方式（对应数据字典Code），如PW_ZZ=转账，PW_ZK=划账 */
  payWayId: string;
  /** 付款金额 */
  payAmt: number;
  /** 其中抵房金额 */
  dedRoomAmt: number;
}

// 财务分摊
export interface NconPaymentSub extends BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 类型枚举，建安支付：NCON_CST   费用支付：NCON_FEE */
  srcType: string;
  /** 单据ID */
  paymentId?: number;
  /** 项目 */
  projId?: number;
  /** 建筑核算项目 */
  accProjId?: number;
  /** 科目 */
  subId: number;
  /** 金额 */
  subAmt?: number;
  /** 摘要 */
  subDesc?: string;
}

// 成本分摊主表
export interface NconAllocM extends BaseEntity {
  /** 主键ID */
  id?: number;
  /** 项目ID */
  projId: number;
  /** 项目名称 */
  projName: string;
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
  /** 分摊状态：0-未分摊 1-已分摊 2-部分分摊 */
  allocStatus: number;
  /** 预警状态（0-红；1-黄【超95%】；2-绿） */
  allocWarn: number;
  /** 分摊说明 */
  remark: string;
  /** 分摊明细 */
  detailList?: NconAllocD[];
}
// 成本分摊 明细表
export interface NconAllocD extends BaseEntity {
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

// 建安支付 保存参数（接口请求参数）
export interface NconPaymentSaveParam {
  /** 付款 主表 */
  payment: NconPayment;
  /** 扣款明细 */
  deds?: NconDedUsed[];
  /** 发票主表 */
  invoiceMs?: NconBillInvoiceM[];
  /** 发票子表 */
  invoiceDs?: NconBillInvoiceD[];
  /** 付款方式 */
  payWays?: NconPaymentWay[];
  /** 财务分摊 */
  payAllocs?: NconPaymentSub[];
  /** 成本分摊 */
  costAllocs?: NconAllocM[];
}
