// ==================== 合同类别类型定义 ====================

/**
 * 合同类别信息 (h_md_con_type)
 */
export interface ContractType {
  /** 主键，自增 */
  id: number;
  /** 父级ID */
  pid: number;
  /** 类别编码 */
  conTypeCode: string;
  /** 合同类别名称 */
  conTypeName: string;
  /** 所属职能专业ID */
  majorId: number | null;
  /** 所属职能专业名称（前端关联展示用） */
  majorName?: string;
  /** 是否报产值：false-否，true-是 */
  isNeedOutValue: boolean;
  /** 是否启用：false-否，true-是 */
  isEnabled: boolean;
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
 * 合同类别树形节点
 */
export interface ContractTypeTreeNode extends ContractType {
  /** 子节点列表 */
  children?: ContractTypeTreeNode[];
  /** 节点层级 */
  level?: number;
  /** 是否展开 */
  expanded?: boolean;
  /** 是否选中 */
  checked?: boolean;
  /** 是否半选 */
  indeterminate?: boolean;
}

/**
 * 新增/修改合同类别请求参数
 */
export interface ContractTypeSaveParams {
  /** 主键ID（修改时必传） */
  id?: number;
  /** 父级ID */
  pid: number;
  /** 类别编码 */
  conTypeCode: string;
  /** 合同类别名称 */
  conTypeName: string;
  /** 所属职能专业ID */
  majorId?: number | null;
  /** 是否报产值：false-否，true-是 */
  isNeedOutValue?: boolean;
  /** 是否启用：false-禁用，true-启用 */
  isEnabled?: boolean;
  /** 备注 */
  remark?: string;
}

/**
 * 查询合同类别请求参数
 */
export interface ContractTypeQueryParams {
  /** 主键ID */
  id?: number;
  /** 父级ID */
  pid?: number;
  /** 类别编码（模糊查询） */
  conTypeCode?: string;
  /** 合同类别名称（模糊查询） */
  conTypeName?: string;
  /** 所属职能专业ID列表 */
  majorIds?: number[];
  /** 是否报产值 */
  isNeedOutValue?: boolean;
  /** 是否启用 */
  isEnabled?: boolean;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/**
 * 删除合同类别请求参数
 */
export interface ContractTypeDeleteParams {
  /** 主键ID */
  id: number;
}

/**
 * 移动合同类别请求参数
 */
export interface ContractTypeMoveParams {
  /** 要移动的节点ID */
  id: number;
  /** 目标父节点ID */
  targetPid: number;
  /** 新的排序位置 */
  newSort?: number;
}

/**
 * 合同类别状态常量
 */
export const ContractTypeStatus = {
  /** 产值上报状态 */
  NEED_OUT_VALUE: {
    YES: true, // 需要报产值
    NO: false, // 不需要报产值
  },
  /** 启用状态 */
  ENABLED: {
    YES: true, // 启用
    NO: false, // 禁用
  },
  /** 删除状态 */
  DEL: {
    NOT_DELETED: false, // 未删除
    DELETED: true, // 已删除
  },
} as const;
