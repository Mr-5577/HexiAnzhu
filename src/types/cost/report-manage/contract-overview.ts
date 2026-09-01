// ==================== 合同执行概览 类型定义 ====================

/**
 * 合同执行概览 列表
 */
export interface ConExecutionReportVO {
  // ===== 合同基本信息 =====
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
  /** 合同类型（1-普通 2-战略 3-战略执行） */
  conProperty: string;
  /** 合同分类（末级） */
  conTypeName: string;
  /** 合同分类归属（1-2级拼接） */
  conTypeOwner: string;
  /** 产值确认方式（付款方式 1-按进度 2-按材料到货 3-按节点） */
  payMethod: string;
  /** 甲方签约公司 */
  companyName: string;
  /** 甲方经办人 */
  agentName: string;
  /** 签订日期（格式 yyyy-MM-dd） */
  signDate: string; // 后端返回字符串，符合 @JsonFormat

  // ===== 履约过程 =====

  /** 税率（百分比数值，如 13 表示 13%） */
  taxRate: number;
  /** 是否需办结算（是/否） */
  needSettle: string;
  /** 合同签约金额 */
  signAmt: number;
  /** 补充合同金额 */
  addAmt: number;
  /** 变更金额（剔除已转签证/补充协议） */
  changeAmt: number;
  /** 签证金额（剔除已转补充协议） */
  visaAmt: number;
  /** 系统预估合同金额（= 签约 + 补充合同 + 变更 + 签证） */
  estConAmt: number;
  /** 结算金额 */
  settleAmt: number;
  /** 产值金额 */
  prodAmt: number;
  /** 应付金额 */
  payAmt: number;

  // ===== 支付情况 =====

  /** 解锁应付金额（结果表按 pay_date 早于当前） */
  unlockPayAmt: number;
  /** 请款金额 */
  reqAmt: number;
  /** 其中预付款请款金额（款项类型=预付款 YFK） */
  prepayReqAmt: number;
  /** 款项调整金额（奖罚/扣款 h_con_ded_used.ded_this_amt） */
  dedAmt: number;
  /** 实际请款金额 */
  factReqAmt: number;
  /** 已付金额 */
  paidAmt: number;
  /** 请款欠款金额（请款 - 已付 + 款项调整） */
  reqOweAmt: number;
  /** 应付欠款金额（应付 - 已付 + 款项调整） */
  payOweAmt: number;

  // ===== 发票 =====

  /** 开票金额 */
  invcAmt: number;
  /** 请款欠票额（请款 - 开票） */
  reqInvOweAmt: number;
  /** 应付欠票额（应付 - 开票） */
  payInvOweAmt: number;
  /** 已付欠票额（已付 - 开票） */
  paidInvOweAmt: number;
}

/**
 * 合同执行概览 查询参数
 */
export interface ContractExecutionQueryParam {
  /** 业务板块ID列表（若选择“全部”则传入所有板块ID，否则传入选中单个ID的数组） */
  segIdList?: number[];
  /** 项目ID列表（多选） */
  projIdList?: number[];
  /** 签约开始日期（YYYY-MM-DD） */
  signDateStart?: string;
  /** 签约结束日期（YYYY-MM-DD） */
  signDateEnd?: string;
  /** 甲方签约公司ID */
  companyId?: number;
  /** 供应商名称（模糊匹配） */
  supName?: string;
  /** 合同类型（枚举值，如 '总包合同'、'分包合同' 等） */
  conProperty?: string;
  /** 合同分类ID列表（多选级联） */
  conTypeIdList?: number[];
  /** 产值确认方式（枚举值） */
  payMethod?: string;
  /** 是否导出（true 时触发导出接口） */
  isExport?: boolean;
}
