// ==================== 基础产品类型类型定义 ====================

/**
 * 基础产品类型信息 (h_md_product_base)
 */
export interface ProductBase {
  /** 主键，自增 */
  id: number;
  /** 父级ID */
  pid: number;
  /** 产品类型编号 */
  prodCode: string;
  /** 产品类型名称 */
  prodName: string;
  /** 产品类型层级 */
  prodLevel: number;
  /** 产品类型说明 */
  prodDesc: string | null;
  /** 是否启用：false-禁用，true-启用 */
  isEnabled: boolean;
  /** 排序号 */
  sort: number | null;
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
 * 基础产品类型树形节点
 */
export interface ProductBaseTreeNode extends ProductBase {
  /** 子节点列表 */
  children?: ProductBaseTreeNode[];
}

/**
 * 新增/修改基础产品类型请求参数
 */
export interface ProductBaseSaveParams {
  /** 主键ID（修改时必传） */
  id?: number;
  /** 父级ID */
  pid: number;
  /** 产品类型编号 */
  prodCode: string;
  /** 产品类型名称 */
  prodName: string;
  /** 产品类型层级 */
  prodLevel: number;
  /** 产品类型说明 */
  prodDesc?: string;
  /** 是否启用 */
  isEnabled?: boolean;
  /** 排序号 */
  sort?: number;
}

/**
 * 查询基础产品类型请求参数
 */
export interface ProductBaseQueryParams {
  /** 产品类型名称（模糊查询） */
  prodName?: string;
  /** 产品类型编号（模糊查询） */
  prodCode?: string;
}

/**
 * 删除基础产品类型请求参数
 */
export interface ProductBaseDeleteParams {
  /** 主键ID */
  id: number;
}

// ==================== 项目产品类型类型定义 ====================

/**
 * 项目产品类型信息 (h_md_product_proj)
 */
export interface ProductProj {
  /** 主键，自增 */
  id: number;
  /** 项目ID(外键) */
  projId: number;
  /** 产品类型ID(外键) */
  prodId: number;
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
 * 项目产品类型关联信息（含产品类型详情）
 */
export interface ProductProjDetail extends ProductProj {
  /** 产品类型编号 */
  prodCode?: string;
  /** 产品类型名称 */
  prodName?: string;
  /** 产品类型层级 */
  prodLevel?: number;
  /** 产品类型说明 */
  prodDesc?: string;
  /** 产品类型是否启用 */
  prodIsEnabled?: boolean;
}

/**
 * 新增/修改项目产品类型请求参数
 */
export interface ProductProjSaveParams {
  /** 项目ID */
  projId: number;
  /** 产品类型ID */
  prodId: number;
}

/**
 * 查询项目产品类型请求参数
 */
export interface ProductProjQueryParams {
  /** 项目ID */
  projId: number;
  /** 产品类型ID */
  prodId?: number;
  /** 是否包含产品类型详情 */
  withDetail?: boolean;
}
