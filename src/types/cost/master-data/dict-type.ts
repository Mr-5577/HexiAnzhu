// ==================== 数据字典主表（分组）类型定义 ====================

/**
 * 数据字典分组类型 (h_sys_dic_m)
 */
export interface DictGroup {
  /** 主键，自增 */
  id: number;
  /** 上级ID */
  pid: number | null;
  /** 分组名称 */
  groupName: string;
  /** 分组编码 */
  groupCode: string;
  /** 分组说明 */
  groupDesc: string | null;
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
 * 新增/修改数据字典分组请求参数
 */
export interface DictGroupSaveParams {
  /** 分组ID (修改时必传，新增时不传) */
  id?: number;
  /** 上级ID */
  pid?: number | null;
  /** 分组名称 */
  groupName: string;
  /** 分组编码 */
  groupCode: string;
  /** 分组说明 */
  groupDesc?: string;
  /** 是否启用 */
  isEnabled?: boolean;
}

/**
 * 查询数据字典分组请求参数
 */
export interface DictGroupQueryParams {
  /** 分组ID */
  id?: number;
  /** 分组编码 */
  groupCode?: string;
  /** 分组名称 */
  groupName?: string;
  /** 是否启用 */
  isEnabled?: boolean;
}

/**
 * 删除数据字典分组请求参数
 */
export interface DictGroupDeleteParams {
  /** 分组ID */
  id: number;
}

/**
 * 数据字典分组树形节点
 */
export interface DictGroupTreeNode extends DictGroup {
  /** 子节点列表 */
  children?: DictGroupTreeNode[];
}

// ==================== 数据字典明细表（字典项）类型定义 ====================

/**
 * 数据字典项类型 (h_sys_dic_d)
 */
export interface DictItem {
  /** 主键，自增 */
  id: number;
  /** 上级ID */
  pid: number | null;
  /** 字典ID */
  groupId: number;
  /** 字典编码 */
  dicCode: string;
  /** 字典显示值 */
  dicLabel: string;
  /** 字典系统值 */
  dicValue: string;
  /** 字典说明 */
  dicDesc: string | null;
  /** 排序号 */
  sort: number | null;
  /** 是否默认：false-否，true-是 */
  isDefault: boolean;
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
 * 新增/修改数据字典项请求参数
 */
export interface DictItemSaveParams {
  /** 字典项ID (修改时必传，新增时不传) */
  id?: number;
  /** 父级ID */
  pid?: number | null;
  /** 字典组ID */
  groupId: number;
  /** 字典项代码 */
  dicCode: string;
  /** 字典项名称 */
  dicLabel: string;
  /** 字典项值 */
  dicValue: string;
  /** 字典项描述 */
  dicDesc?: string;
  /** 排序 */
  sort?: number;
  /** 是否默认 */
  isDefault?: boolean;
  /** 是否启用 */
  isEnabled?: boolean;
}

/**
 * 查询数据字典项请求参数
 */
export interface DictItemQueryParams {
  /** 字典组ID */
  groupId?: number;
  /** 字典项代码 */
  dicCode?: string;
  /** 字典项名称 */
  dicLabel?: string;
  /** 字典项ID */
  id?: number;
  /** 是否启用 */
  isEnabled?: boolean;
}

/**
 * 删除数据字典项请求参数
 */
export interface DictItemDeleteParams {
  /** 字典项ID */
  id: number;
}

/**
 * 数据字典项 树形节点
 */
export interface DictItemTreeNode extends DictItem {
  /** 子节点列表 */
  children?: DictItemTreeNode[];
}

/**
 * 根据分组编码查询字典项请求参数
 */
export interface DictItemsByGroupCodeParams {
  /** 分组编码 */
  groupCode: string;
  /** 是否只返回启用的 */
  onlyEnabled?: boolean;
}
