// ==================== 供应商台账主表类型定义 ====================

/**
 * 供应商台账信息 (h_sup_supplier_m)
 */
export interface Supplier {
  /** 主键，自增 */
  id: number;
  /** 供应商编码 */
  supCode: string;
  /** 供应商名称 */
  supName: string;
  /** 供应商内外部：1-内部关联单位，2-外部单位 */
  supLinkType: number | null;
  /** 供应商类别ID */
  supTypeId: number;
  /** 供应商类别名称 */
  supTypeName?: string;
  /** 企业性质ID */
  supNatureId: number | null;
  /** 企业性质名称 */
  supNatureName?: string;
  /** 纳税类型ID */
  taxTypeId: number | null;
  /** 纳税类型名称 */
  taxTypeName?: string;
  /** 来源类型ID */
  sourceTypeId: number | null;
  /** 来源类型名称 */
  sourceTypeName?: string;
  /** 统一社会信用代码 */
  uscCardNo: string | null;
  /** 法人代表 */
  legalPerson: string | null;
  /** 法人代表证件类型ID */
  legalCardTypeId: number;
  /** 法人代表证件类型名称 */
  legalCardTypeName?: string;
  /** 法人代表证件号码 */
  legalCardNo: string;
  /** 法人代表邮箱 */
  legalEmail: string | null;
  /** 法人代表电话 */
  legalPhone: string | null;
  /** 注册资本(万元) */
  registeredAmount: number | null;
  /** 企业主要资质及等级 */
  supQual: string | null;
  /** 供应商地址 */
  address: string | null;
  /** 供应商状态 */
  supStatus: number;
  /** 供应商状态名称 */
  supStatusName?: string;
  /** 经营范围 */
  bizDesc: string | null;
  /** 入库日期 */
  entryDate: string | null;
  /** 备注 */
  remark: string | null;
  /** 创建人 */
  createId: number;
  /** 创建人名称 */
  createName?: string;
  /** 创建时间 */
  createDate: string;
  /** 更新人 */
  operId: number | null;
  /** 更新人名称 */
  operName?: string;
  /** 更新时间 */
  operDate: string | null;
  /** 删除标识：false-未删除，true-已删除 */
  isDel: boolean;
}

/**
 * 新增/修改供应商台账请求参数
 */
export interface SupplierSaveParams {
  /** 主键ID（修改时必传） */
  id?: number;
  /** 供应商编码 */
  supCode?: string;
  /** 供应商名称 */
  supName: string;
  /** 供应商关联类型 */
  supLinkType?: number | string | null;
  /** 供应商主要服务类别ID */
  supTypeId: number | string | null;
  /** 企业性质ID */
  supNatureId?: number | string | null;
  /** 纳税类型ID */
  taxTypeId?: number | string | null;
  /** 来源类型ID */
  sourceTypeId?: number | string | null;
  /** 统一社会信用代码 */
  uscCardNo?: string | null;
  /** 法人代表 */
  legalPerson?: string | null;
  /** 法人代表证件类型ID */
  legalCardTypeId?: number | string | null;
  /** 法人代表证件号码 */
  legalCardNo?: string;
  /** 法人代表邮箱 */
  legalEmail?: string | null;
  /** 法人代表电话 */
  legalPhone?: string | null;
  /** 注册资本 */
  registeredAmount?: number | null;
  /** 企业主要资质及等级 */
  supQual?: string | null;
  /** 供应商地址 */
  address?: string | null;
  /** 供应商状态 */
  supStatus?: number;
  /** 经营范围 */
  bizDesc?: string | null;
  /** 入库日期 */
  entryDate?: string | null;
  /** 备注 */
  remark?: string | null;
  /** 服务板块ID列表 */
  segIds?: number[];
  /** 银行账户列表 */
  bankAccounts?: SupplierBankSaveParams[];
}

/**
 * 查询供应商台账请求参数
 */
export interface SupplierQueryParams {
  /** 主键ID */
  id?: number;
  /** 供应商编码（模糊查询） */
  supCode?: string;
  /** 供应商名称（模糊查询） */
  supName?: string;
  /** 供应商关联类型 */
  supLinkType?: number;
  /** 供应商主要服务类别ID */
  supTypeId?: number;
  /** 企业性质ID */
  supNatureId?: number;
  /** 纳税类型ID */
  taxTypeId?: number;
  /** 供应商状态 */
  supStatus?: number;
  /** 服务板块ID */
  segId?: number;
  /** 入库日期开始 */
  entryDateStart?: string;
  /** 入库日期结束 */
  entryDateEnd?: string;
}

/**
 * 删除供应商台账请求参数
 */
export interface SupplierDeleteParams {
  /** 供应商台账ID */
  id: number;
}

// ==================== 供应商银行账户类型定义 ====================

/**
 * 供应商银行账户信息 (h_sup_supplier_bank)
 */
export interface SupplierBank {
  /** 主键，自增 */
  id: number;
  /** 供应商ID */
  supId: number;
  /** 开户银行 */
  bankName: string;
  /** 银行户名 */
  accountName: string;
  /** 银行账号 */
  bankAccount: string;
  /** 是否默认账户：false-否，true-是 */
  isDefault: boolean;
  /** 是否启用：false-禁用，true-启用 */
  isEnabled: boolean;
  /** 备注 */
  remark: string | null;
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
 * 新增/修改供应商银行账户请求参数
 */
export interface SupplierBankSaveParams {
  /** 主键ID（修改时必传） */
  id?: number;
  /** 供应商ID */
  supId?: number;
  /** 开户银行 */
  bankName: string;
  /** 银行户名 */
  accountName: string;
  /** 银行账号 */
  bankAccount: string;
  /** 是否默认账户 */
  isDefault?: boolean;
  /** 是否启用 */
  isEnabled?: boolean;
  /** 备注 */
  remark?: string;
}

/**
 * 查询供应商银行账户请求参数
 */
export interface SupplierBankQueryParams {
  /** 供应商ID */
  supId?: number;
  /** 是否默认 */
  isDefault?: boolean;
  /** 是否启用 */
  isEnabled?: boolean;
}

/**
 * 删除供应商银行账户请求参数
 */
export interface SupplierBankDeleteParams {
  /** 供应商台账ID */
  id: number;
}

// ==================== 供应商服务板块类型定义 ====================

/**
 * 供应商服务板块 (h_sup_supplier_seg)
 */
export interface SupplierSegment {
  /** 主键，自增 */
  id: number;
  /** 供应商ID */
  supId: number;
  /** 板块ID */
  segId: number;
  /** 板块名称（前端关联展示用） */
  segName?: string;
  /** 备注 */
  remark: string | null;
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
 * 新增/修改供应商服务板块请求参数
 */
export interface SupplierSegmentSaveParams {
  /** 主键ID（修改时必传） */
  id?: number;
  /** 供应商ID */
  supId: number;
  /** 板块ID */
  segId: number;
  /** 备注 */
  remark?: string;
}

/**
 * 查询供应商服务板块请求参数
 */
export interface SupplierSegmentQueryParams {
  /** 主键ID */
  id?: number;
  /** 供应商ID */
  supId?: number;
  /** 板块ID */
  segId?: number;
  /** 板块ID列表（批量查询） */
  segIds?: number[];
  /** 供应商ID列表（批量查询） */
  supIds?: number[];
  /** 备注（模糊查询） */
  remark?: string;
}

/**
 * 删除供应商服务板块请求参数
 */
export interface SupplierSegmentDeleteParams {
  /** 主键ID */
  id: number;
}

// ==================== 供应商资质类型定义 ====================

/**
 * 供应商资质 (h_sup_supplier_annex)
 */
export interface SupplierAnnex {
  /** 主键，自增 */
  id: number;
  /** 供应商ID */
  supId: number;
  /** 附件类型 */
  annexType: string;
  /** 附件名称 */
  annexName: string;
  /** 附件ID */
  annexId: number;
  /** 备注 */
  remark: string | null;
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
 * 新增/修改供应商资质请求参数
 */
export interface SupplierAnnexSaveParams {
  /** 主键ID（修改时必传） */
  id?: number;
  /** 供应商ID */
  supId: number;
  /** 附件类型 */
  annexType: string;
  /** 附件名称 */
  annexName: string;
  /** 附件ID */
  annexId: number;
  /** 备注 */
  remark?: string;
}

/**
 * 查询供应商资质请求参数
 */
export interface SupplierAnnexQueryParams {
  /** 主键ID */
  id?: number;
  /** 供应商ID */
  supId?: number;
  /** 附件类型 */
  annexType?: string;
  /** 附件名称（模糊查询） */
  annexName?: string;
  /** 附件ID */
  annexId?: number;
  /** 备注（模糊查询） */
  remark?: string;
}

/**
 * 删除供应商资质请求参数
 */
export interface SupplierAnnexDeleteParams {
  /** 主键ID */
  id: number;
}

// ==================== 供应商项目业绩类型定义 ====================

/**
 * 供应商项目业绩 (h_sup_supplier_perf)
 */
export interface SupplierPerf {
  /** 主键，自增 */
  id: number;
  /** 供应商ID */
  supId: number;
  /** 项目名称 */
  projName: string;
  /** 合作单位 */
  companyName: string;
  /** 合同金额 */
  conAmount: number;
  /** 合同概述 */
  conDesc: string;
  /** 开始日期 */
  startDate: string | null;
  /** 结束日期 */
  endDate: string | null;
  /** 相关附件ID */
  annexId: number | null;
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
 * 新增/修改供应商项目业绩请求参数
 */
export interface SupplierPerfSaveParams {
  /** 主键ID（修改时必传） */
  id?: number;
  /** 供应商ID */
  supId: number;
  /** 项目名称 */
  projName: string;
  /** 合作单位 */
  companyName: string;
  /** 合同金额 */
  conAmount: number;
  /** 合同概述 */
  conDesc: string;
  /** 开始日期 */
  startDate?: string;
  /** 结束日期 */
  endDate?: string;
  /** 相关附件ID */
  annexId?: number;
}

/**
 * 查询供应商项目业绩请求参数
 */
export interface SupplierPerfQueryParams {
  /** 主键ID */
  id?: number;
  /** 供应商ID */
  supId?: number;
  /** 项目名称（模糊查询） */
  projName?: string;
  /** 合作单位（模糊查询） */
  companyName?: string;
  /** 合同金额最小值 */
  minConAmount?: number;
  /** 合同金额最大值 */
  maxConAmount?: number;
  /** 开始日期范围-起始 */
  startDateFrom?: string;
  /** 开始日期范围-结束 */
  startDateTo?: string;
  /** 结束日期范围-起始 */
  endDateFrom?: string;
  /** 结束日期范围-结束 */
  endDateTo?: string;
}

/**
 * 删除供应商项目业绩请求参数
 */
export interface SupplierPerfDeleteParams {
  /** 主键ID */
  id: number;
}
