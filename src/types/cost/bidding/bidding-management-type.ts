// ==================== 招标事项相关 ====================

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
/**
 * 招标事项表 (h_bid_tender)
 */
export interface BidTender extends BaseEntity {
  projectId?: number;
  /** 主键，自增 */
  id: number;
  /** 招标单号 */
  tenderNo: string;
  /** 业务板块ID */
  segId: number;
  /** 合同分类ID */
  conTypeId: number;
  /** 采购事项 */
  tenderName: string;
  /** 采购方式ID */
  purchaseMethodId: number | null;
  /** 招标方式ID */
  tenderMethodId: number | null;
  /** 清单模式ID */
  billModeId: number | null;
  /** 计划金额 */
  planAmount: number | null;
  /** 需求日期 */
  demandDate: string | null;
  /** 招采开始日期 */
  bidStartDate: string | null;
  /** 招采结束日期 */
  bidEndDate: string | null;
  /** 责任人 */
  dutyMan: number | null;
  /** 招采事项说明 */
  tenderRemark: string | null;
  /** 需求状态：0-草稿，1-已审批，2-招标中，3-已定标，4-已签约 */
  tenderStatus: number;
}

/**
 * 招标事项查询参数
 */
export interface BidTenderQueryParams {
  /** 主键ID */
  id?: number;
  /** 招标单号（模糊查询） */
  tenderNo?: string;
  /** 采购事项（模糊查询） */
  tenderName?: string;
  /** 业务板块ID */
  segId?: number;
  /** 合同分类ID */
  conTypeId?: number;
  /** 采购方式ID */
  purchaseMethodId?: number;
  /** 招标方式ID */
  tenderMethodId?: number;
  /** 招标状态 */
  tenderStatus?: number;
  /** 责任人 */
  dutyMan?: number;
  /** 需求日期开始 */
  demandDateStart?: string;
  /** 需求日期结束 */
  demandDateEnd?: string;
}
/**
 * 招标事项表单参数
 */
export interface BidTenderFormParams {
  /** 主键ID（修改时必传） */
  id?: number;
  /** 项目ID列表 */
  projectId?: number[] | null;
  /** 招标单号 */
  tenderNo?: string;
  /** 业务板块ID */
  segId?: number;
  /** 合同分类ID */
  conTypeId?: number;
  /** 采购事项 */
  tenderName?: string;
  /** 采购方式ID */
  purchaseMethodId?: number | null;
  /** 招标方式ID */
  tenderMethodId?: number | null;
  /** 清单模式ID */
  billModeId?: number | null;
  /** 计划金额 */
  planAmount?: number | null;
  /** 需求日期 */
  demandDate?: string | null;
  /** 招采开始日期 */
  bidStartDate?: string | null;
  /** 招采结束日期 */
  bidEndDate?: string | null;
  /** 责任人 */
  dutyMan?: number | null;
  /** 招采事项说明 */
  tenderRemark?: string | null;
  /** 招标状态 */
  tenderStatus?: number;
}

/**
 * 新增/修改招标事项请求参数
 */
export interface BidTenderSaveParams {
  /** 表单数据 */
  tender?: BidTenderFormParams;
  /** 明细列表数据 */
  items?: any[];
  /** 项目ID列表 */
  projIds?: number[];
}

// ==================== 招标单据相关相关 ====================
/**
 * 招标单据查询参数
 */
export interface BidTenderBillQueryParams {
  /** 招标业务编号 */
  bizNo?: string;
  /** 业务类型代码 */
  bizItemCode: string;
  /** 招标事项ID */
  tenderId?: number;
  /** 招标事项名称 */
  tenderName?: string;
  /** 项目ID */
  projId?: number;
  /** 版块ID */
  segId?: number;
  /** 合同类型ID */
  conTypeId?: number;
  /** 负责人ID */
  dutyMan?: number;
  /** 开始时间 */
  startDate?: string;
  /** 结束时间 */
  endDate?: string;
}

// ==================== 招标需求相关 ====================

/**
 * 招标需求表 (h_bid_demand)
 */
export interface BidDemand extends BaseEntity {
  /** 主键，自增 */
  id: number;
  /** 招标单据ID */
  tenderBillId?: number;
  /** 招标事项ID */
  tenderId: number | null;
  /** 业务板块ID */
  segId: number;
  /** 项目ID */
  projId: number;
  /** 公司ID */
  companyId: number;
  /** 招标事项 */
  tenderName: string;
  /** 需求日期 */
  demandDate: string;
  /** 需求说明 */
  demandRemark: string | null;
}
/**
 * 招标需求查询参数
 */
export interface BidDemandQueryParams {
  /** 招标事项 */
  tenderName?: string;
  /** 业务板块ID */
  segId?: number;
  /** 项目ID */
  projId?: number;
  /** 公司ID */
  companyId?: number;
}
/**
 * 新增/编辑 招标需求参数
 */
export interface BidDemandFormParams {
  /** 主键ID（修改时必传） */
  id?: number; // 主键ID
  /** 业务板块ID */
  segId: number;
  /** 项目ID */
  projId: number;
  /** 公司ID */
  companyId: number;
  /* 招标事项 */
  tenderName?: string;
  /** 需求日期 */
  demandDate?: string;
  /** 需求说明 */
  demandRemark?: string;
}

// ==================== 招标计划相关 ====================

/**
 * 招标计划表 (h_bid_tender_plan)
 */
export interface BidTenderPlan extends BaseEntity {
  /** 主键，自增 */
  id?: number;
  /** 招标单据ID */
  tenderBillId: number;
  /** 招标明细ID */
  tenderItemId: number | null;
  /** 招标明细事项 */
  tenderItemName: string | null;
  /** 项目ID */
  projId: number;
  /** 楼栋ID（逗号分隔） */
  bldIds: string | null;
  /** 楼栋名称（逗号分隔） */
  bldNames: string | null;
  /** 应交投标保证金金额 */
  bidBondAmount: number | null;
  /** 应交履约保证金金额 */
  perfBondAmount: number | null;
  /** 说明 */
  itemRemark: string | null;
}
/**
 * 新增 招标计划参数
 */
export interface BidTenderPlanSaveParams {
  /** 主键，自增 */
  id?: number;
  /** 事项ID */
  tenderId: number;
  /** 招标明细ID */
  tenderItemId: number | null;
  /** 招标明细事项 */
  tenderItemName?: string | null;
  /** 项目ID */
  projId: number;
  /** 楼栋ID（逗号分隔） */
  bldIds: string | null;
  /** 楼栋名称（逗号分隔） */
  bldNames: string | null;
  /** 应交投标保证金金额 */
  bidBondAmount: number | null;
  /** 应交履约保证金金额 */
  perfBondAmount: number | null;
  /** 说明 */
  itemRemark?: string | null;
}
/**
 * 招标计划单据列表
 */
export interface BidTenderPlanBill {
  bill: BidTender;
  plans: BidTenderPlan[];
}

// ==================== 定标参考价表 ====================
/**
 * 定标参考价表 (h_bid_award_refer)
 */
export interface BidAwardRefer extends BaseEntity {
  /** 主键，自增 */
  id: number;
  /** 招标单据ID */
  tenderBillId: number;
  /** 招标明细事项ID */
  tenderItemId: number;
  /** 楼栋ID（逗号分隔） */
  bldIds: string | null;
  /** 楼栋名称（逗号分隔） */
  bldNames: string | null;
  /** 不含税参考价金额 */
  referAmount: number | null;
  /** 参考价说明 */
  referRemark: string | null;
  /** 成本预警：1-红灯（超预算），2-绿灯（未超预算） */
  costAlert: number | null;
}
/**
 * 新增 定标参考价表参数
 */
export interface BidAwardReferSaveParams {
  /** 主键，自增 */
  id?: number;
  /** 事项ID */
  tenderId: number;
  /** 招标明细ID */
  tenderItemId: number | null;
  /** 招标明细事项 */
  tenderItemName?: string | null;
  /** 项目ID */
  projId: number;
  /** 楼栋ID（逗号分隔） */
  bldIds: string | null;
  /** 楼栋名称（逗号分隔） */
  bldNames: string | null;
  /** 不含税参考价金额 */
  referAmount: number | null;
  /** 参考价说明 */
  referRemark: string | null;
  /** 成本预警：1-红灯（超预算），2-绿灯（未超预算） */
  costAlert: number | null;
  /** 组价明细 */
  amounts: AmountItem[];
}
/**
 * 定标参考价表单据列表
 */
export interface BidAwardReferBill {
  bill: BidTender;
  refers: BidAwardRefer[];
}
/**
 * 组价明细项类型
 */
export interface AmountItem {
  /** 自定义uuid */
  uuid?: string;
  /** 主键，自增 */
  id?: number;
  /** 定标参考价表ID */
  referId: number;
  /** 目标成本科目ID */
  subId: number | null;
  /** 目标成本科目name */
  subName?: string;
  /** 不含税参考价金额 */
  subAmount: number;
  /** 参考价说明 */
  amountRemark?: string;
  /** 目标成本总额(不含税) */
  costExclAmt?: number;
}

// ==================== 定标审批表 ====================
/**
 * 定标审批表 (h_bid_award)
 */
export interface BidAward extends BaseEntity {
  /** 主键，自增 */
  id: number;
  /** 招标单据ID */
  tenderBillId: number;
  /** 招标明细事项ID */
  tenderItemId: number;
  /** 中标供应商ID */
  supId: number;
  /** 楼栋ID（逗号分隔） */
  bldIds: string | null;
  /** 楼栋名称（逗号分隔） */
  bldNames: string | null;
  /** 中标金额(不含税) */
  bidAmount: number | null;
  /** 参考价金额(不含税) */
  referAmount: number | null;
  /** 价格偏差(不含税) */
  priceVariance: number | null;
  /** 税率 */
  taxRate: number | null;
  /** 评定说明 */
  bidExplain: string | null;
  /** 是否中标：false-否，true-是 */
  isWinner: boolean | null;
}
/**
 * 新增 定标审批表参数
 */
export interface BidAwardSaveParams {
  /** 主键，自增 */
  id?: number;
  /** 事项ID */
  tenderId: number;
  /** 招标明细ID */
  tenderItemId: number | null;
  /** 招标明细事项 */
  tenderItemName?: string | null;
  /** 项目ID */
  projId: number;
  /** 楼栋ID（逗号分隔） */
  bldIds: string | null;
  /** 楼栋名称（逗号分隔） */
  bldNames: string | null;
  /** 中标供应商ID */
  supId: number;
  /** 中标供应商名称 */
  supName?: string;
  /** 中标金额(不含税) */
  bidAmount: number | null;
  /** 参考价金额(不含税) */
  referAmount: number | null;
  /** 价格偏差(不含税) */
  priceVariance: number | null;
  /** 税率 */
  taxRate: number | null;
  /** 评定说明 */
  bidExplain: string | null;
  /** 是否中标：false-否，true-是 */
  isWinner: boolean | null;
}
/**
 * 定标审批单据列表
 */
export interface BidAwardBill {
  bill: BidTender;
  awards: BidAward[];
}

// ==================== 投标保证金相关 ====================
/**
 * 投标保证金缴纳表 (h_bid_bond_recv)
 */
export interface BidBondRecv extends BaseEntity {
  /** 主键，自增 */
  id: number;
  /** 招标单据ID */
  tenderBillId: number;
  /** 招标明细事项ID */
  tenderItemId: number;
  /** 投标供应商ID */
  supId: number;
  /** 应交投标保证金金额 */
  needAmount: number | null;
  /** 实交投标保证金金额 */
  recvAmount: number | null;
  /** 缴纳方式数据字典 */
  recvMethod: number | null;
  /** 缴纳日期 */
  recvDate: string | null;
  /** 缴纳凭证附件 */
  recvAnnexId: number | null;
}
/**
 * 新增 投标保证金缴纳表参数
 */
export interface BidBondRecvSaveParams {
  /** 主键，自增 */
  id?: number;
  /** 事项ID */
  tenderId: number;
  /** 招标明细ID */
  tenderItemId: number | null;
  /** 供应商ID */
  supId: number;
  /** 供应商名称 */
  supName?: string;
  /** 应交保证金金额 */
  needAmount: number;
  /** 实交保证金金额 */
  recvAmount: number;
  /** 缴纳方式 */
  recvMethod?: string;
  /** 缴纳方式名称 */
  recvMethodName?: string;
  /** 缴纳日期 */
  recvDate?: string;
  /** 缴纳凭证附件 */
  recvAnnexId: number;
}
/**
 * 投标保证金缴纳单据列表
 */
export interface BidBondRecvBill {
  bill: BidTender;
  bondRecvs: BidBondRecv[];
}
// ==================== 投标保证金退还相关 ====================
/**
 * 投标保证金退还表 (h_bid_bond_refund)
 */
export interface BidBondRefund extends BaseEntity {
  /** 主键，自增 */
  id: number;
  /** 招标单据ID */
  tenderBillId: number;
  /** 招标明细事项ID */
  tenderItemId: number;
  /** 投标供应商ID */
  supId: number;
  /** 实交投标保证金金额 */
  recvAmount: number | null;
  /** 缴纳方式数据字典 */
  recvMethod: number | null;
  /** 退还方式数据字典 */
  refundType: number | null;
  /** 退还金额 */
  refundAmount: number | null;
  /** 退还凭证附件 */
  refundAnnexId: number | null;
  /** 合同ID */
  conId: number | null;
}
/**
 * 新增 投标保证金退还表参数
 */
export interface BidBondRefundSaveParams {
  /** 主键，自增 */
  id?: number;
  /** 事项ID */
  tenderId: number;
  /** 招标明细ID */
  tenderItemId: number | null;
  /** 供应商ID */
  supId: number;
  /** 供应商名称 */
  supName?: string;
  /** 实交保证金金额 */
  recvAmount: number;
  /** 缴纳方式 */
  recvMethod?: string;
  /** 缴纳方式名称 */
  recvMethodName?: string;
  /** 退还方式 */
  refundType: string;
  /** refundAmount */
  refundAmount: number;
  /** 退还凭证附件 */
  refundAnnexId: number;
  /** 合同ID */
  conId: number;
}
/**
 * 投标保证金退还单据列表
 */
export interface BidBondRefundBill {
  bill: BidTender;
  bondRefunds: BidBondRefund[];
}

/**
 * 新增招标单据表单数据
 */
export interface BidTenderBillFormDataAdd {
  /** 业务代码 */
  bizItemCode: string;
  /** 招标事项ID */
  tenderId: number;
  /** ZB_XQ：招标需求 */
  demandList?: BidDemandFormParams[];
  /** ZB_JH：招标计划 */
  planList?: BidTenderPlanSaveParams[];
  /** ZB_CK：招标参考 */
  referList?: BidAwardReferSaveParams[];
  /** ZB_DB：定标审批 */
  awardList?: BidAwardSaveParams[];
  /** ZB_BZJ：招标保证金 */
  bondRecvList?: BidBondRecvSaveParams[];
  /** ZB_BZJTH：招标保证金退还 */
  bondRefundList?: BidBondRefundSaveParams[];
}
/**
 * 编辑招标单据表单数据
 */
export interface BidTenderBillFormDataEdit {
  /** 业务代码 */
  bizItemCode: string;
  /** 单据ID */
  id: number;
  /** ZB_XQ：招标需求 */
  demandList?: BidDemandFormParams[];
  /** ZB_JH：招标计划 */
  planList?: BidTenderPlanSaveParams[];
  /** ZB_CK：招标参考 */
  referList?: BidAwardReferSaveParams[];
  /** ZB_DB：定标审批 */
  awardList?: BidAwardSaveParams[];
  /** ZB_BZJ：招标保证金 */
  bondRecvList?: BidBondRecvSaveParams[];
  /** ZB_BZJTH：招标保证金退还 */
  bondRefundList?: BidBondRefundSaveParams[];
}
