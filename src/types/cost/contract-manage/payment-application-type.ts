// ==================== 付款申请 类型定义 ====================

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

// 扣款事项明细
export interface HConDedUsed extends BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 单据ID */
  conBillId?: number;
  /** 扣款事项ID */
  dedId?: number;
  /** 扣款事项 */
  dedName?: string;
  /** 应扣款金额 */
  dedAmt?: number;
  /** 扣款类型，数据字典 */
  dedTypeId?: number;
  /** 本次扣款金额 */
  dedThisAmt?: number;
  /** 已扣款金额 */
  dedAlreadyAmt?: number;
  /** 未扣款金额 */
  dedLeaveAmt?: number;
  /** 扣款说明 */
  dedDesc?: string;
}

// 发票主表
export interface HConBillInvoiceM extends BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 单据ID */
  conBillId?: number;
  /** 发票号 */
  invNo?: string;
  /** 开票日期 */
  invDate?: string;
  /** 发票总金额 */
  totalAmt?: number;
  /** 不含税金额 */
  notTaxAmt?: number;
  /** 税额 */
  taxAmt?: number;
  /** 发票类型 */
  invType?: string;
  /** 附件ID */
  annexId?: number;
  /** 识别状态（0=未识别 1=识别成功 2=识别失败） */
  recogStatus?: number;
  /** 发票明细 */
  detailList?: HConBillInvoiceD[];
}

// 发票子表（发票明细）
export interface HConBillInvoiceD extends BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 主表ID */
  invMid?: number;
  /** 项目名称 */
  itemName?: string;
  /** 规格 */
  size?: string;
  /** 单位 */
  unit?: string;
  /** 数量 */
  num?: number;
  /** 单价 */
  price?: number;
  /** 金额 */
  totalAmt?: number;
  /** 税率 */
  taxRate?: number;
  /** 税额 */
  taxAmt?: number;
}

// 付款方式
export interface HConPaymentWay extends BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 单据ID */
  conBillId?: number;
  /** 付款方式（对应数据字典Code），如PW_ZZ=转账，PW_ZK=划账 */
  payWay?: string;
  /** 付款金额 */
  payAmt?: number;
  /** 其中抵房金额 */
  dedRoomAmt?: number;
}

// 财务分摊
export interface HConPaymentSub extends BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 单据ID */
  conBillId?: number;
  /** 项目 */
  projId?: number;
  /** 建筑核算项目 */
  acctProjId?: number;
  /** 科目 */
  subId?: number;
  /** 金额 */
  subAmt?: number;
}

// 付款申请主表
export interface HConPayment extends BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 单据ID */
  conBillId?: number;
  /** 合同签约金额 */
  signAmt?: number;
  /** 补充合同金额 */
  addAmt?: number;
  /** 累计变更签证 */
  sumChangeAmt?: number;
  /** 预结算合同金额 */
  preSettleAmt?: number;
  /** 累计产值 */
  sumProdVal?: number;
  /** 累计应付 */
  sumPayAmt?: number;
  /** 累计请款 */
  sumAppyAmt?: number;
  /** 累计实付 */
  sumPaidAmt?: number;
  /** 累计欠款 */
  sumOwedAmt?: number;
  /** 应付占产值比 */
  payOutRate?: number;
  /** 实付占应付比 */
  paidPayRate?: number;
  /** 实付占产值比 */
  paidOutRate?: number;
  /** 付款类型：0=请款、1=来票冲账 */
  reqType?: number;
  /** 付款规则：0-正常请款 1-来票冲账 */
  payRule?: number;
  /** 剩余应付金额 */
  leavePayAmt?: number;
  /** 请款总金额 */
  reqAmt?: number;
  /** 转履约保证金金额 */
  pbAmount?: number;
  /** 奖罚总金额（扣款） */
  changeAmt?: number;
  /** 实际请款金额 */
  factReqAmt?: number;
  /** 请款说明 */
  reqDesc?: string;
  /** 应收发票金额 */
  invRecAmt?: number;
  /** 已收发票 */
  invRcvdAmt?: number;
  /** 欠票金额 */
  invOweAmt?: number;
  /** 是否修改收款账号：0=否 1=是 */
  isModifyAcc?: number;
  /** 收款开户行 */
  bankName?: string;
  /** 收款账户名 */
  accountName?: string;
  /** 收款账号 */
  bankAccount?: string;
  /** 收款账号修改申请凭证附件 */
  modifyAccAnnex?: number;
}

// 付款申请保存参数（接口请求参数）
export interface ConPaySaveParam {
  /** 合同ID，用于创建 h_con_bill */
  conId: number;
  /** 付款申请主表 */
  payment: HConPayment;
  /** 扣款明细 */
  billDeds?: HConDedUsed[];
  /** 发票主表 */
  invoiceMs?: HConBillInvoiceM[];
  /** 发票子表 */
  invoiceDs?: HConBillInvoiceD[];
  /** 付款方式 */
  payWays?: HConPaymentWay[];
  /** 财务分摊 */
  paySubs?: HConPaymentSub[];
}
