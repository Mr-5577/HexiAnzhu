// ==================== 招标事项相关 ====================

/**
 * 招标事项表 (h_bid_tender)
 */
export interface BidTender {
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
  /** 创建人 */
  createId: number;
  /** 创建时间 */
  createDate: string;
  /** 更新人 */
  operId: number | null;
  /** 更新时间 */
  operDate: string | null;
  /** 删除标识：false-未删除，true-已删除 */
  isDel: boolean;
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

/**
 * 删除招标事项请求参数
 */
export interface BidTenderDeleteParams {
  /** 主键ID */
  id?: number;
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
export interface BidDemand {
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
  /** 创建人 */
  createId?: number;
  /** 创建时间 */
  createDate?: string;
  /** 更新人 */
  operId?: number | null;
  /** 更新时间 */
  operDate?: string | null;
  /** 删除标识：false-未删除，true-已删除 */
  isDel?: boolean;
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
/**
 * 删除 招标需求参数
 */
export interface BidDemandDeleteParams {
  /** 主键ID */
  id: number;
}

// ==================== 招标计划相关 ====================

/**
 * 招标计划表 (h_bid_tender_plan)
 */
export interface BidTenderPlan {
  /** 主键，自增 */
  id: number;
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
  /** 创建人 */
  createId: number;
  /** 创建时间 */
  createDate: string;
  /** 更新人 */
  operId: number | null;
  /** 更新时间 */
  operDate: string | null;
  /** 删除标识：false-未删除，true-已删除 */
  isDel: boolean;
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
export interface BidAwardRefer {
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
  /** 创建人 */
  createId: number;
  /** 创建时间 */
  createDate: string;
  /** 更新人 */
  operId: number | null;
  /** 更新时间 */
  operDate: string | null;
  /** 删除标识：false-未删除，true-已删除 */
  isDel: boolean;
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
  uuid?: string;
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
export interface BidAward {
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
  /** 创建人 */
  createId: number;
  /** 创建时间 */
  createDate: string;
  /** 更新人 */
  operId: number | null;
  /** 更新时间 */
  operDate: string | null;
  /** 删除标识：false-未删除，true-已删除 */
  isDel: boolean;
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
export interface BidBondRecv {
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
  /** 创建人 */
  createId: number;
  /** 创建时间 */
  createDate: string;
  /** 更新人 */
  operId: number | null;
  /** 更新时间 */
  operDate: string | null;
  /** 删除标识：false-未删除，true-已删除 */
  isDel: boolean;
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
export interface BidBondRefund {
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
  /** 创建人 */
  createId: number;
  /** 创建时间 */
  createDate: string;
  /** 更新人 */
  operId: number | null;
  /** 更新时间 */
  operDate: string | null;
  /** 删除标识：false-未删除，true-已删除 */
  isDel: boolean;
}
/**
 * 投标保证金退还单据列表
 */
export interface BidBondRefundBill {
  bill: BidTender;
  bondRefunds: BidBondRefund[];
}

// ==================== 前端表单数据类型 ====================

/**
 * 新增招标单据表单数据
 */
export interface BidTenderBillFormDataAdd {
  /** 业务代码 */
  bizItemCode: string;
  /** 招标事项ID */
  tenderId: number;
  /** 招标明细事项列表 */
  childData: any[];
}
/**
 * 编辑招标单据表单数据
 */
export interface BidTenderBillFormDataEdit {
  /** 业务代码 */
  bizItemCode: string;
  /** 单据ID */
  id: number;
  /** 招标明细事项列表 */
  childData: any[];
}

// ==================== 常量定义 ====================

/**
 * 招标状态常量 (tender_status)
 */
export const TenderStatus = {
  /** 草稿 */
  DRAFT: 0,
  /** 已审批 */
  APPROVED: 1,
  /** 招标中 */
  BIDDING: 2,
  /** 已定标 */
  AWARDED: 3,
  /** 已签约 */
  SIGNED: 4,
} as const;

/**
 * 成本预警常量 (cost_alert)
 */
export const CostAlert = {
  /** 红灯（超预算） */
  RED: 1,
  /** 绿灯（未超预算） */
  GREEN: 2,
} as const;
