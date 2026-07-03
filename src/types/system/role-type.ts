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
