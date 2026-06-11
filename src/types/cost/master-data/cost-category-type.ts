// ==================== 基础成本科目类型定义 ====================

/**
 * 基础成本科目信息
 */
export interface CostCategoryBase {
  /** 主键，自增 */
  id: number;
  /** 父级ID */
  pid: number;
  /** 成本科目编号 */
  subCode: string;
  /** 成本科目名称 */
  subName: string;
  /** 成本科目层级 */
  subLevel: number;
  /** 控制模式 */
  ctrlMode: number;
  /** 成本科目说明 */
  remark: string | null;
  /** 是否启用：false-禁用，true-启用 */
  isEnabled: boolean;
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
 * 基础成本科目树形节点
 */
export interface CostCategoryBaseNode extends CostCategoryBase {
  /** 子节点列表 */
  children?: CostCategoryBaseNode[];
}

/**
 * 新增/修改基础成本科目请求参数
 */
export interface CostCategoryBaseSaveParams {
  /** 主键ID（修改时必传） */
  id?: number;
  /** 父级ID */
  pid: number;
  /** 编号 */
  subCode: string;
  /** 名称 */
  subName: string;
  /** 控制模式 */
  ctrlMode: number;
  /** 层级 */
  subLevel: number;
  /** 说明 */
  remark?: string;
  /** 是否启用 */
  isEnabled?: boolean;
  /** 排序号 */
  sort?: number;
}

/**
 * 查询基础成本科目请求参数
 */
export interface CostCategoryBaseQueryParams {
  /** 名称（模糊查询） */
  subName?: string;
  /** 编号（模糊查询） */
  subCode?: string;
}

// ==================== 项目成本科目类型定义 ====================

/**
 * 项目成本科目信息
 */
export interface CostCategoryProj {
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
 * 项目成本科目关联信息
 */
export interface CostCategoryProjDetail extends CostCategoryProj {
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
 * 新增/修改项目成本科目请求参数
 */
export interface CostCategoryProjSaveParams {
  /** 项目ID */
  projId: number;
  /** 基础成本科目ID */
  subId: number;
  /** 业务板块ID */
  segId: number;
  /** 说明 */
  remark?: string;
}

/**
 * 查询项目成本科目请求参数
 */
export interface CostCategoryProjQueryParams {
  /** 项目ID */
  projId: number;
  /** 是否包含产品类型详情 */
  withDetail?: boolean;
}
