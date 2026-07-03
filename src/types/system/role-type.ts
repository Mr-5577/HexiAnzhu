export interface RoleFormData {
  roleName: string;
  sort: number;
  isEnable: boolean;
  isSuper: boolean;
  isInner?: boolean;
  isDel?: boolean;
  roleDesc?: string;
}

export interface RoleItem {
  id: number;
  roleName: string;
  sort: number;
  isEnable: boolean;
  isSuper: boolean;
  isInner?: boolean;
  isDel?: boolean;
  roleDesc?: string;
  createId?: number;
  createDate?: string;
  operId?: number;
  operDate?: string;
}

export interface RoleSearchForm {
  roleName: string;
  isIncludeDisable: boolean;
}

export interface MemberSearch {
  empName: string;
  isIncludeLeave?: boolean;
}

export interface RoleDelete {
  id: number;
  isDel?: boolean;
}

export interface RoleMemberItem {
  id: number;
  memberId: number | null;
  isDel: boolean;
  isSuper: boolean;
  memberName: string;
  memberType: number;
  roleId: number;
}
export interface RoleMemberAdd {
  id?: number | string;
  roleId: number | string;
  memberType: number;
  memberName: string;
  memberId: any;
}
/**
 * 修改角色 参数
 */
export interface RoleUpdate {
  /** 角色ID */
  id?: number | string;
  /** 角色名称 */
  roleName?: string;
  /** 角色排序 */
  sort?: number;
  /** 是否启用 */
  isEnable?: boolean;
  /** 备注 */
  roleDesc?: string;
  /** 是否超管 */
  isSuper?: boolean;
}

/**
 * 角色成员基础信息
 */
export interface RoleMemberBase {
  /** 角色ID */
  roleId: number | string;
  /** 成员ID */
  memberId: string | null;
  /** 成员名称 */
  memberName: string;
  /** 成员类型: 0-员工, 1-部门, 2-管理单元, 3-板块 (具体根据接口返回) */
  memberType: number;
}

/**
 * 新增角色成员
 */
export interface RoleMemberAdd extends RoleMemberBase {
  // 新增时不需要 id
}

/**
 * 编辑角色成员
 */
export interface RoleMemberEdit extends RoleMemberBase {
  /** 成员记录ID (编辑时必传) */
  id?: number | string;
}
