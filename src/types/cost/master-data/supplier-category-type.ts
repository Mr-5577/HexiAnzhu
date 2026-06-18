// ==================== 供应商类别类型定义 ====================

/**
 * 供应商类别信息 (h_md_sup_type)
 */
export interface SupplierType {
  /** 主键，自增 */
  id: number;
  /** 父级ID */
  pid: number;
  /** 类别编码 */
  supTypeCode: string;
  /** 类别名称 */
  supTypeName: string;
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
 * 供应商类别树形节点
 */
export interface SupplierTypeTreeNode extends SupplierType {
  /** 子节点列表 */
  children?: SupplierTypeTreeNode[];
  /** 节点层级 */
  level?: number;
  /** 是否展开 */
  expanded?: boolean;
  /** 是否选中 */
  checked?: boolean;
}

/**
 * 新增/修改供应商类别请求参数
 */
export interface SupplierTypeSaveParams {
  /** 主键ID（修改时必传） */
  id?: number;
  /** 父级ID */
  pid: number;
  /** 类别编码 */
  supTypeCode: string;
  /** 类别名称 */
  supTypeName: string;
  /** 是否启用 */
  isEnabled?: boolean;
  /** 备注 */
  remark?: string;
}

/**
 * 查询供应商类别请求参数
 */
export interface SupplierTypeQueryParams {
  /** 主键ID */
  id?: number;
  /** 父级ID */
  pid?: number;
  /** 类别编码（模糊查询） */
  supTypeCode?: string;
  /** 类别名称（模糊查询） */
  supTypeName?: string;
  /** 是否启用 */
  isEnabled?: boolean;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/**
 * 删除供应商类别请求参数
 */
export interface SupplierTypeDeleteParams {
  /** 主键ID */
  id: number;
}
