/**
 * 请款执行概览 列表项
 */
export interface PaymentOverviewVO {
  /** 业务板块名称 */
  segName: string;
  /** 业务板块 ID（用于跳转传参） */
  segId: number;
  /** 项目名称 */
  projName: string;
  /** 项目 ID（用于跳转传参） */
  projId: number;
  /** 请款单号 */
  reqNo: string;
  /** 请款标题 */
  reqTitle?: string;
  /** 申请人 */
  applyUser: string;
  /** 申请日期（yyyy-MM-dd） */
  applyDate: string;
  /** 费用所属月份（yyyy-MM） */
  belongMonth: string;
  /** 费用所属公司名称 */
  compName: string;
  /** 费用所属公司 ID（用于跳转传参） */
  compId: number;
  /** 摘要 */
  reqDesc?: string;
  /** 请款金额 */
  reqAmt: number;
  /** 其中抵房款 */
  dedAmt: number;
  /** 款项调整金额 */
  changeAmt: number;
  /** 实际请款金额 */
  factReqAmt: number;
  /** 合同/事项编号 */
  itemNo: string;
  /** 合同/事项名称 */
  itemName: string;
  /** 费用所属组织 */
  finaOrgName: string;
  /** 报账科目 */
  finaSubName: string;
  /** 收款方 */
  accountName: string;
  /** 已付金额（累计） */
  paidAmt: number;
  /** 统计月支付 */
  monthPaidAmt: number;
  /** 最近支付时间 */
  lastPayDate?: string;
  /** 未付金额 */
  unpaidAmt: number;
  /** 审核状态名称 */
  auditStatusName: string;
  /** 支付状态名称 */
  payStatusName: string;
  /** 入账状态名称 */
  confirmStatusName: string;

  // ========== 下列字段在 columns 中未直接展示，但可能用于扩展或跳转 ==========
  /** 款项类型名称（用于列 payTypeName） */
  payTypeName?: string;
  /** 支付公司名称（用于列 payCompName） */
  payCompName?: string;
  /** 银行名称 */
  bankName?: string;
  /** 银行账号 */
  bankAccount?: string;
  /** 支付方式名称 */
  payWayName?: string;
}

/**
 * 请款执行概览 查询参数
 */
export interface PaymentOverviewQueryParam {
  /** 业务板块ID列表（选择“全部”时传入所有板块ID，否则为单个ID数组） */
  segIds?: number[];
  /** 项目ID列表（多选） */
  projIds?: number[];
  /** 支付公司ID */
  payCompId?: number;
  /** 请款单号（模糊匹配） */
  reqNo?: string;
  /** 归属月份开始（yyyy-MM） */
  belongMonthStart?: string;
  /** 归属月份结束（yyyy-MM） */
  belongMonthEnd?: string;
  /** 收款方（模糊匹配） */
  payeeName?: string;
  /** 申请人ID */
  applyUserId?: number;
  /** 申请日期开始（yyyy-MM-dd） */
  reqDateStart?: string;
  /** 申请日期结束（yyyy-MM-dd） */
  reqDateEnd?: string;
  /** 审批状态数组（如 [40] 表示已审批） */
  wfStatus?: number[];
  /** 入账状态（true-已入账，false-未入账） */
  isLocked?: boolean;
  /** 支付状态（未支付/部分支付/全部支付） */
  payStatus?: string;
  /** 支付统计月（yyyy-MM） */
  statMonth?: string;
  /** 费用类型ID */
  finaTypeId?: number;
  /** 是否导出（true 时触发导出接口） */
  isExport?: boolean;
}
