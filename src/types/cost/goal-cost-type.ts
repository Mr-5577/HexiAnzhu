// ==================== 目标成本类型定义 ====================

/**
 * 目标成本版本主表 (h_cst_project_cost_m)
 */
export interface HCstProjectCostM {
  /** 主键，自增 */
  id: number;
  /** 业务板块ID（业务板块表外键） */
  segId: number;
  /** 项目ID */
  projId: number;
  /** 版本号 */
  versionNo: string;
  /** 版本类型：投资版/考核版/执行版 */
  versionType: string;
  /** 目标成本总额(含税) */
  costAmt: number;
  /** 目标成本总额(不含税) */
  costExclAmt: number;
  /** 动态成本总额(含税) */
  costDynAmt?: number;
  /** 动态成本总额(不含税) */
  costDynExclAmt?: number;
  /** 审批流程ID */
  flowId?: string;
  /** 主数据面积版本ID */
  areaVerMid?: number;
  /** 是否当前使用版本 */
  isEnabled: boolean;
  /** 备注 */
  remark?: string;
  /** 创建人ID */
  createId: number;
  /** 创建人名称（前端关联展示用） */
  createName?: string;
  /** 创建时间 */
  createDate: string;
  /** 更新人ID */
  operId?: number;
  /** 更新人名称（前端关联展示用） */
  operName?: string;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识 */
  isDel: boolean;
}

/**
 * 新增/修改 目标成本版本请求参数
 */
export interface HCstProjectCostMAddEditParams {
  /** 主键ID */
  id?: number;
  /** 业务板块ID */
  segId: number;
  /** 项目ID */
  projId: number;
  /** 版本号 */
  versionNo: string;
  /** 版本类型 */
  versionType: string;
  /** 目标成本总额(含税) */
  costAmt: number;
  /** 目标成本总额(不含税) */
  costExclAmt: number;
  /** 动态成本总额(含税) */
  costDynAmt?: number;
  /** 动态成本总额(不含税) */
  costDynExclAmt?: number;
  /** 审批流程ID */
  flowId?: string;
  /** 主数据面积版本ID */
  areaVerMid?: number;
  /** 是否当前使用版本 */
  isEnabled?: boolean;
  /** 备注 */
  remark?: string;
}

/**
 * 删除目标成本版本请求参数
 */
export interface HCstProjectCostMDeleteParams {
  /** 主键ID */
  id: number;
}

/**
 * 查询目标成本版本请求参数
 */
export interface HCstProjectCostMQueryParams {
  /** 主键ID */
  id?: number;
  /** 业务板块ID */
  segId?: number;
  /** 项目ID */
  projId?: number;
  /** 版本号（模糊查询） */
  versionNo?: string;
  /** 版本类型列表 */
  versionTypes?: string[];
  /** 是否当前使用版本 */
  isEnabled?: boolean;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

// ==================== 目标成本明细表 ====================

/**
 * 目标成本明细表 (h_cst_project_cost_d)
 */
export interface HCstProjectCostD {
  /** 主键，自增 */
  id: number;
  /** 目标成本ID(外键) */
  costMid: number;
  /** 科目ID(外键) */
  subId: number;
  /** 科目名称（前端关联展示用） */
  subName?: string;
  /** 业态ID(外键) */
  prodId: number;
  /** 业态名称（前端关联展示用） */
  prodName?: string;
  /** 业务归属：1-地产 2-建筑 */
  busiSegId: number;
  /** 业务归属名称（前端关联展示用） */
  busiSegName?: string;
  /** 目标成本总额(含税) */
  costAmt: number;
  /** 目标成本总额(不含税) */
  costExclAmt: number;
  /** 动态成本总额(含税) */
  costDynAmt?: number;
  /** 动态成本总额(不含税) */
  costDynExclAmt?: number;
  /** 分摊规则（数据字典） */
  allocRule?: number;
  /** 分摊规则名称（前端关联展示用） */
  allocRuleName?: string;
  /** 创建人ID */
  createId: number;
  /** 创建人名称（前端关联展示用） */
  createName?: string;
  /** 创建时间 */
  createDate: string;
  /** 更新人ID */
  operId?: number;
  /** 更新人名称（前端关联展示用） */
  operName?: string;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识 */
  isDel: boolean;
}

/**
 * 新增/修改目标成本明细请求参数
 */
export interface HCstProjectCostDAddEditParams {
  /** 主键ID */
  id?: number;
  /** 目标成本ID */
  costMid?: number;
  /** 科目ID */
  subId?: number;
  /** 业态ID */
  prodId?: number;
  /** 业务归属 */
  busiSegId?: number;
  /** 目标成本总额(含税) */
  costAmt?: number;
  /** 目标成本总额(不含税) */
  costExclAmt?: number;
  /** 动态成本总额(含税) */
  costDynAmt?: number;
  /** 动态成本总额(不含税) */
  costDynExclAmt?: number;
  /** 分摊规则 */
  allocRule?: number;
}

/**
 * 删除目标成本明细请求参数
 */
export interface HCstProjectCostDDeleteParams {
  /** 主键ID */
  id: number;
}

/**
 * 查询目标成本明细请求参数
 */
export interface HCstProjectCostDQueryParams {
  /** 主键ID */
  id?: number;
  /** 目标成本ID */
  costMid?: number;
  /** 科目ID列表 */
  subIds?: number[];
  /** 业态ID列表 */
  prodIds?: number[];
  /** 业务归属列表 */
  busiSegIds?: number[];
}

// ==================== 项目成本分摊主表 ====================

/**
 * 项目成本分摊主表 (h_cst_project_alloc_m)
 */
export interface HCstProjectAllocM {
  /** 主键，自增 */
  id: number;
  /** 项目ID */
  projId: number;
  /** 项目名称（前端关联展示用） */
  projName?: string;
  /** 合同ID */
  conId: number;
  /** 合同名称（前端关联展示用） */
  conName?: string;
  /** 业务类型：1-合同 2-补充合同 3-变更 4-签证 5-结算 */
  busiType: number;
  /** 业务类型名称（前端关联展示用） */
  busiTypeName?: string;
  /** 业务单据ID */
  busiKeyId: number;
  /** 分摊总额(含税) */
  allocAmt: number;
  /** 分摊总额(不含税) */
  allocExclAmt: number;
  /** 分摊状态：0-未分摊 1-已分摊 2-分摊中 */
  allocStatus: number;
  /** 分摊状态名称（前端关联展示用） */
  allocStatusName?: string;
  /** 分摊说明 */
  remark?: string;
  /** 创建人ID */
  createId: number;
  /** 创建人名称（前端关联展示用） */
  createName?: string;
  /** 创建时间 */
  createDate: string;
  /** 更新人ID */
  operId?: number;
  /** 更新人名称（前端关联展示用） */
  operName?: string;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识 */
  isDel: boolean;
}

/**
 * 新增/修改项目成本分摊请求参数
 */
export interface HCstProjectAllocMAddEditParams {
  /** 主键ID */
  id?: number;
  /** 项目ID */
  projId?: number;
  /** 合同ID */
  conId?: number;
  /** 业务类型 */
  busiType?: number;
  /** 业务单据ID */
  busiKeyId?: number;
  /** 分摊总额(含税) */
  allocAmt?: number;
  /** 分摊总额(不含税) */
  allocExclAmt?: number;
  /** 分摊状态 */
  allocStatus?: number;
  /** 分摊说明 */
  remark?: string;
}

/**
 * 删除项目成本分摊请求参数
 */
export interface HCstProjectAllocMDeleteParams {
  /** 主键ID */
  id: number;
}

/**
 * 查询项目成本分摊请求参数
 */
export interface HCstProjectAllocMQueryParams {
  /** 主键ID */
  id?: number;
  /** 项目ID */
  projId?: number;
  /** 合同ID */
  conId?: number;
  /** 业务类型列表 */
  busiTypes?: number[];
  /** 分摊状态列表 */
  allocStatusList?: number[];
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

// ==================== 项目成本分摊子表 ====================

/**
 * 项目成本分摊子表 (h_cst_project_alloc_d)
 */
export interface HCstProjectAllocD {
  /** 主键，自增 */
  id: number;
  /** 主表ID */
  allocMid: number;
  /** 科目ID */
  subId: number;
  /** 科目名称（前端关联展示用） */
  subName?: string;
  /** 业态ID */
  prodId: number;
  /** 业态名称（前端关联展示用） */
  prodName?: string;
  /** 分摊金额(含税) */
  costAmt: number;
  /** 分摊金额(不含税) */
  costExclAmt: number;
  /** 创建人ID */
  createId: number;
  /** 创建人名称（前端关联展示用） */
  createName?: string;
  /** 创建时间 */
  createDate: string;
  /** 更新人ID */
  operId?: number;
  /** 更新人名称（前端关联展示用） */
  operName?: string;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识 */
  isDel: boolean;
}

/**
 * 新增/修改项目成本分摊子表请求参数
 */
export interface HCstProjectAllocDAddEditParams {
  /** 主键ID */
  id?: number;
  /** 主表ID */
  allocMid?: number;
  /** 科目ID */
  subId?: number;
  /** 业态ID */
  prodId?: number;
  /** 分摊金额(含税) */
  costAmt?: number;
  /** 分摊金额(不含税) */
  costExclAmt?: number;
}

/**
 * 删除项目成本分摊子表请求参数
 */
export interface HCstProjectAllocDDeleteParams {
  /** 主键ID */
  id: number;
}

/**
 * 查询项目成本分摊子表请求参数
 */
export interface HCstProjectAllocDQueryParams {
  /** 主键ID */
  id?: number;
  /** 主表ID */
  allocMid?: number;
  /** 科目ID列表 */
  subIds?: number[];
  /** 业态ID列表 */
  prodIds?: number[];
}

// ==================== 项目成本分摊产品表 ====================

/**
 * 项目成本分摊产品表 (h_cst_project_alloc_product)
 */
export interface HCstProjectAllocProduct {
  /** 主键，自增 */
  id: number;
  /** 主表ID */
  allocMid: number;
  /** 业态ID */
  prodId: number;
  /** 业态名称（前端关联展示用） */
  prodName?: string;
  /** 创建人ID */
  createId: number;
  /** 创建人名称（前端关联展示用） */
  createName?: string;
  /** 创建时间 */
  createDate: string;
  /** 更新人ID */
  operId?: number;
  /** 更新人名称（前端关联展示用） */
  operName?: string;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识 */
  isDel: boolean;
}

// ==================== 项目成本分摊科目表 ====================

/**
 * 项目成本分摊科目表 (h_cst_project_alloc_sub)
 */
export interface HCstProjectAllocSub {
  /** 主键，自增 */
  id: number;
  /** 主表ID */
  allocMid: number;
  /** 科目ID */
  subId: number;
  /** 科目名称（前端关联展示用） */
  subName?: string;
  /** 创建人ID */
  createId: number;
  /** 创建人名称（前端关联展示用） */
  createName?: string;
  /** 创建时间 */
  createDate: string;
  /** 更新人ID */
  operId?: number;
  /** 更新人名称（前端关联展示用） */
  operName?: string;
  /** 更新时间 */
  operDate?: string;
  /** 删除标识 */
  isDel: boolean;
}

// ==================== 枚举定义 ====================

/**
 * 业务类型枚举 (对应 busiType)
 */
export enum BusiTypeEnum {
  /** 合同 */
  CONTRACT = 1,
  /** 补充合同 */
  SUPPLY_CONTRACT = 2,
  /** 变更 */
  CHANGE = 3,
  /** 签证 */
  VISA = 4,
  /** 结算 */
  SETTLEMENT = 5,
}

/**
 * 分摊状态枚举 (对应 allocStatus)
 */
export enum AllocStatusEnum {
  /** 未分摊 */
  NOT_ALLOCATED = 0,
  /** 已分摊 */
  ALLOCATED = 1,
  /** 分摊中 */
  ALLOCATING = 2,
}

/**
 * 版本类型枚举 (对应 versionType)
 */
export enum VersionTypeEnum {
  /** 投资版 */
  INVESTMENT = "投资版",
  /** 考核版 */
  ASSESSMENT = "考核版",
  /** 执行版 */
  EXECUTION = "执行版",
}

/**
 * 业务归属枚举 (对应 busiSegId)
 */
export enum BusiSegEnum {
  /** 地产 */
  REAL_ESTATE = 1,
  /** 建筑 */
  CONSTRUCTION = 2,
}
