// ==================== 项目楼栋类型定义 ====================

/**
 * 项目楼栋信息 (h_md_proj_building)
 */
export interface ProjectBuilding {
  /** 主键，自增 */
  id: number;
  /** 项目ID */
  projId: number;
  /** 楼栋名称 */
  bldName: string;
  /** 是否地下室：false-否，true-是 */
  isUnderGround: boolean;
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
 * 新增/修改项目楼栋请求参数
 */
export interface ProjectBuildingSaveParams {
  /** 主键ID（修改时必传） */
  id?: number;
  /** 项目ID */
  projId: number;
  /** 楼栋名称 */
  bldName: string;
  /** 是否地下室 */
  isUnderGround?: boolean;
}

/**
 * 查询项目楼栋请求参数
 */
export interface ProjectBuildingQueryParams {
  /** 项目ID */
  projId: number;
  /** 楼栋名称 */
  bldName?: string;
  /** 是否地下室 */
  isUnderGround?: boolean;
}
/**
 * 删除项目楼栋请求参数
 */
export interface ProjectBuildingDeleteParams {
  /** 楼栋ID */
  id: number;
}

// ==================== 项目面积版本主表类型定义 ====================

/**
 * 版本类型选项（用于下拉框）
 */
export interface VersionTypeOption {
  /** 主键ID */
  id: number;
  /** 字典组ID */
  groupId: number;
  /** 字典编码 */
  dicCode: string;
  /** 字典显示值 */
  dicLabel: string;
  /** 字典系统值 */
  dicValue: string;
  /** 字典说明 */
  dicDesc: string | null;
  /** 排序 */
  sort: number;
  /** 是否默认 */
  isDefault: boolean;
  /** 是否启用 */
  isEnabled: boolean;
  /** 删除标识 */
  isDel: boolean;
}

/**
 * 项目面积版本主表 (h_md_proj_area_ver_m)
 */
export interface ProjectAreaVersion {
  /** 主键，自增 */
  id: number;
  /** 项目ID */
  projId: number;
  /** 版本类型ID */
  verTypeId: number;
  /** 版本标题 */
  verTitle: string;
  /** 系统流程ID */
  flowId: number | null;
  /** 是否当前生效版本：false-否，true-是 */
  isEnabled: boolean;
  /** 版本说明 */
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
 * 新增/修改项目面积版本请求参数
 */
export interface ProjectAreaVersionSaveParams {
  /** 主键ID（修改时必传） */
  id?: number;
  /** 项目ID */
  projId: number;
  /** 版本类型ID */
  verTypeId?: number;
  /** 版本标题 */
  verTitle: string;
  /** 是否当前生效版本 */
  isEnabled?: boolean;
  /** 版本说明 */
  remark?: string;
}

/**
 * 查询项目面积版本请求参数
 */
export interface ProjectAreaVersionQueryParams {
  /** 项目ID */
  projId?: number;
  /** 版本类型ID */
  verTypeId?: number;
  /** 版本标题 */
  verTitle?: string;
  /** 是否当前生效版本 */
  isEnabled?: boolean;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}
/**
 * 删除项目面积版本请求参数
 */
export interface ProjectBuildingDeleteParams {
  /** 版本ID */
  id: number;
}

/**
 * 查询项目面积版本响应
 */
export interface ProjectAreaVersionQueryResponse {
  /** 数据列表 */
  list: ProjectAreaVersion[];
  /** 总数 */
  total: number;
}

// ==================== 项目面积明细表类型定义 ====================

/**
 * 项目面积明细 (h_md_proj_area_ver_d)
 */
export interface ProjectAreaDetail {
  /** 主键，自增 */
  id: number;
  /** 版本ID */
  verMid: number | null;
  /** 楼栋ID */
  bldId: number;
  /** 楼栋名称（前端关联展示用） */
  bldName?: string;
  /** 产品类型ID */
  prodId: number;
  /** 产品类型名称（前端关联展示用） */
  prodName?: string;
  /** 地上建筑面积 */
  agBuildArea: number;
  /** 地下建筑面积 */
  ugBuildArea: number;
  /** 地上可售面积 */
  agSaleArea: number;
  /** 地下可售面积 */
  ugSaleArea: number | null;
  /** 户数 */
  houseNum: number | null;
  /** 电梯数 */
  elvNum: number | null;
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
 * 新增/修改项目面积明细请求参数
 */
export interface ProjectAreaDetailSaveParams {
  /** 主键ID（修改时必传） */
  id?: number;
  /** 版本ID */
  verMid?: number | null;
  /** 楼栋ID */
  bldId: number;
  /** 产品类型ID */
  prodId: number;
  /** 地上建筑面积 */
  agBuildArea?: number;
  /** 地下建筑面积 */
  ugBuildArea?: number;
  /** 地上可售面积 */
  agSaleArea?: number;
  /** 地下可售面积 */
  ugSaleArea?: number | null;
  /** 户数 */
  houseNum?: number | null;
  /** 电梯数 */
  elvNum?: number | null;
  /** 备注 */
  remark?: string;
}

/**
 * 查询项目面积明细请求参数
 */
export interface ProjectAreaDetailQueryParams {
  /** 版本ID */
  verMid?: number;
  /** 楼栋ID */
  bldId?: number;
  /** 产品类型ID */
  prodId?: number;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/**
 * 查询项目面积明细响应
 */
export interface ProjectAreaDetailQueryResponse {
  /** 数据列表 */
  list: ProjectAreaDetail[];
  /** 总数 */
  total: number;
}

// ==================== 项目面积完整版本类型 ====================

/**
 * 项目面积完整版本（包含明细）
 */
export interface ProjectAreaFullVersion extends ProjectAreaVersion {
  /** 面积明细列表 */
  details: ProjectAreaDetail[];
}

/**
 * 楼栋面积汇总
 */
export interface BuildingAreaSummary {
  /** 楼栋ID */
  bldId: number;
  /** 楼栋名称 */
  bldName: string;
  /** 地上建筑面积 */
  agBuildArea: number;
  /** 地下建筑面积 */
  ugBuildArea: number;
  /** 地上可售面积 */
  agSaleArea: number;
  /** 地下可售面积 */
  ugSaleArea: number;
  /** 总建筑面积 */
  totalBuildArea: number;
  /** 总可售面积 */
  totalSaleArea: number;
  /** 户数 */
  houseNum: number;
  /** 电梯数 */
  elvNum: number;
}

/**
 * 项目面积总汇总
 */
export interface ProjectAreaTotal {
  /** 地上建筑面积总和 */
  totalAgBuildArea: number;
  /** 地下建筑面积总和 */
  totalUgBuildArea: number;
  /** 地上可售面积总和 */
  totalAgSaleArea: number;
  /** 地下可售面积总和 */
  totalUgSaleArea: number;
  /** 总建筑面积 */
  totalBuildArea: number;
  /** 总可售面积 */
  totalSaleArea: number;
  /** 总户数 */
  totalHouseNum: number;
  /** 总电梯数 */
  totalElvNum: number;
}

// ==================== 项目面积版本状态常量 ====================

/**
 * 项目面积版本状态常量
 */
export const ProjectAreaVersionStatus = {
  /** 是否生效版本 */
  IS_ENABLED: {
    YES: true, // 生效版本
    NO: false, // 非生效版本
  },
  /** 删除状态 */
  DEL: {
    NOT_DELETED: false, // 未删除
    DELETED: true, // 已删除
  },
} as const;

/**
 * 是否地下室常量
 */
export const IsUnderGround = {
  YES: true, // 是地下室
  NO: false, // 非地下室
} as const;
