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
  /** 供应商关联类型：1-内部关联单位，2-外部单位 */
  supLinkType: number | null;
  /** 供应商主要服务类别ID */
  supTypeId: number;
  /** 供应商主要服务类别名称（前端关联展示用） */
  supTypeName?: string;
  /** 企业性质ID */
  supNatureId: number | null;
  /** 企业性质名称（前端关联展示用） */
  supNatureName?: string;
  /** 纳税类型ID */
  taxTypeId: number | null;
  /** 纳税类型名称（前端关联展示用） */
  taxTypeName?: string;
  /** 来源类型ID */
  sourceTypeId: number | null;
  /** 来源类型名称（前端关联展示用） */
  sourceTypeName?: string;
  /** 统一社会信用代码 */
  uscCardNo: string | null;
  /** 法人代表 */
  legalPerson: string | null;
  /** 法人代表证件类型ID */
  legalCardTypeId: number;
  /** 法人代表证件类型名称（前端关联展示用） */
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
  /** 供应商状态名称（前端关联展示用） */
  supStatusName?: string;
  /** 经营范围 */
  bizDesc: string | null;
  /** 入库日期 */
  entryDate: string | null;
  /** 备注 */
  remark: string | null;
  /** 创建人 */
  createId: number;
  /** 创建人名称（前端关联展示用） */
  createName?: string;
  /** 创建时间 */
  createDate: string;
  /** 更新人 */
  operId: number | null;
  /** 更新人名称（前端关联展示用） */
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
  supLinkType?: number | null;
  /** 供应商主要服务类别ID */
  supTypeId: number;
  /** 企业性质ID */
  supNatureId?: number | null;
  /** 纳税类型ID */
  taxTypeId?: number | null;
  /** 来源类型ID */
  sourceTypeId?: number | null;
  /** 统一社会信用代码 */
  uscCardNo?: string | null;
  /** 法人代表 */
  legalPerson?: string | null;
  /** 法人代表证件类型ID */
  legalCardTypeId?: number;
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
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/**
 * 删除供应商台账请求参数
 */
export interface SupplierDeleteParams {
  /** 供应商台账ID */
  ids: number;
}

/**
 * 查询供应商台账响应
 */
export interface SupplierQueryResponse {
  /** 数据列表 */
  list: Supplier[];
  /** 总数 */
  total: number;
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
  ids: number;
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
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/**
 * 删除供应商服务板块请求参数
 */
export interface SupplierSegmentDeleteParams {
  /** 供应商台账ID */
  ids: number;
}

// ==================== 供应商完整信息类型 ====================

/**
 * 供应商完整信息（包含银行账户和服务板块）
 */
export interface SupplierFullInfo extends Supplier {
  /** 银行账户列表 */
  bankAccounts: SupplierBank[];
  /** 服务板块列表 */
  segments: SupplierSegment[];
}

// ==================== 供应商状态常量 ====================

/**
 * 供应商关联类型常量
 */
export const SupplierLinkType = {
  INTERNAL: 1, // 内部关联单位
  EXTERNAL: 2, // 外部单位
} as const;

/**
 * 供应商状态常量
 */
export const SupplierStatus = {
  /** 潜在 */
  POTENTIAL: 0,
  /** 合格 */
  QUALIFIED: 1,
  /** 黑名单 */
  BLACKLIST: 2,
  /** 淘汰 */
  ELIMINATED: 3,
} as const;

/**
 * 是否默认账户常量
 */
export const IsDefault = {
  YES: true, // 是默认
  NO: false, // 非默认
} as const;

/**
 * 银行账户启用状态常量
 */
export const BankEnabledStatus = {
  ENABLED: true, // 启用
  DISABLED: false, // 禁用
} as const;
