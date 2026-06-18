/**
 * 管理单元/公司  对应数据库表: h_md_manageunit
 */
export interface ManageUnit {
  /** 主键ID */
  id: number;
  /** 上级管理单元ID */
  pid?: number;
  /** 上级管理单元名称（前端展示用） */
  parentName?: string;
  /** 所属业态/业务板块ID */
  segId?: number;
  /** 所属业态/业务板块名称 */
  segName?: string;
  /** 管理单元名称 */
  mguName?: string;
  /** 管理单元简称 */
  mguShortname?: string;
  /** 组织编码 */
  mguNo?: string;
  /** OA系统对应ID */
  oaMguId?: string;
  /** 其他说明 */
  memo?: string;
  /** 序号 */
  sort?: number;
  /** 删除标识：false-未删除，true-已删除 */
  isDel?: boolean;
  /** 创建人ID */
  createId?: number;
  /** 创建人姓名 */
  createName?: string;
  /** 创建时间 */
  createDate?: string; // datetime格式: 'YYYY-MM-DD HH:mm:ss'
  /** 操作人ID */
  operId?: number;
  /** 操作人姓名 */
  operName?: string;
  /** 操作时间 */
  operDate?: string;
}

/**
 * 管理单元树形节点
 */
export interface ManageUnitTreeNode extends ManageUnit {
  children?: ManageUnit[];
}

/**
 * 管理单元查询参数
 */
export interface ManageUnitQueryParams {
  /** 主键 */
  id?: number;
  /** 管理单元名称（模糊查询） */
  mguName?: string;
  /** 组织编码 */
  mguNo?: string;
  /** 所属业态ID */
  segId?: number;
}

/**
 * 管理单元列表项
 */
export interface ManageUnitListItem {
  /** 主键ID */
  id: number;
  /** 管理单元名称 */
  mguName: string;
  /** 管理单元简称 */
  mguShortname: string;
  /** 组织编码 */
  mguNo: string;
  /** 所属业态名称 */
  segName: string;
  /** 上级管理单元名称 */
  parentName: string;
  /** 序号 */
  sort: number;
  /** 创建时间 */
  createDate: string;
}

/**
 * 新增/编辑管理单元 - 表单数据
 */
export interface ManageUnitFormData {
  /** 管理单元ID（编辑时存在） */
  id?: number;
  /** 上级管理单元ID */
  pid?: number;
  /** 所属业态/业务板块ID */
  segId?: number;
  /** 管理单元名称 */
  mguName: string;
  /** 管理单元简称 */
  mguShortname?: string;
  /** 组织编码 */
  mguNo?: string;
  /** OA系统对应ID */
  oaMguId?: string;
  /** 其他说明 */
  memo?: string;
  /** 序号 */
  sort?: number;
}
