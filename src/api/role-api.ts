import { http } from "@/axios/service";
import {
  RoleSearchForm,
  RoleDelete,
  RoleFormData,
  MemberSearch,
} from "@/types/role-type";

export const roleApi = {
  // 获取角色列表
  getRoleList: (data: RoleSearchForm) => {
    return http.post("/auth/getRoleList", data);
  },
  // 新增角色
  addRole: (data: RoleFormData) => {
    return http.post("/auth/addRole", data);
  },
  // 删除角色
  delRole: (data: RoleDelete) => {
    return http.post("/auth/delRole", data);
  },
  // 修改角色
  editRole: (data: any) => {
    return http.post("/auth/editRole", data);
  },

  // 获取角色对应的成员列表
  getRoleMemberList: (data: any) => {
    return http.post("/auth/getRoleMemberList", data);
  },
  // 修改角色成员
  editRoleMember: (data: any) => {
    return http.post("/auth/editRoleMember", data);
  },
  // 删除角色成员
  delRoleMember: (data: any) => {
    return http.post("/auth/delRoleMember", data);
  },
  // 添加角色成员
  addRoleMember: (data: any) => {
    return http.post("/auth/addRoleMember", data);
  },
  // 获取人员列表（树形结构）
  getEmpTree: (data: MemberSearch) => {
    return http.post("/emp/getEmpTree", data);
  },

  // 获取角色对应的菜单权限
  getRoleMenuPowerList: (data: any) => {
    return http.post("/auth/getRoleMenuPowerList", data);
  },
  // 保存角色对应的菜单权限
  editRoleMenuPowerList: (data: any) => {
    return http.post("/auth/editRoleMenuPowerList", data);
  },

  // 获取角色对应的组织权限
  getRoleDataPowerDeptList: (data: any) => {
    return http.post("/auth/getRoleDataPowerDeptList", data);
  },
  // 保存角色对应的组织权限
  editRoleDataPowerDeptList: (data: any) => {
    return http.post("/auth/editRoleDataPowerDeptList", data);
  },
  // 获取角色对应的项目权限
  getRoleDataPowerProjList: (data: any) => {
    return http.post("/auth/getRoleDataPowerProjList", data);
  },
  // 保存角色对应的项目权限
  editRoleDataPowerProjList: (data: any) => {
    return http.post("/auth/editRoleDataPowerProjList", data);
  },
  // 获取角色对应的专业权限
  getRoleDataPowerMajorList: (data: any) => {
    return http.post("/auth/getRoleDataPowerMajorList", data);
  },
  // 保存角色对应的专业权限
  editRoleDataPowerMajorList: (data: any) => {
    return http.post("/auth/editRoleDataPowerMajorList", data);
  },
  // 获取角色对应的人员权限
  getRoleDataPowerUserList: (data: any) => {
    return http.post("/auth/getRoleDataPowerUserList", data);
  },
  // 保存角色对应的人员权限
  editRoleDataPowerUserList: (data: any) => {
    return http.post("/auth/editRoleDataPowerUserList", data);
  },
};
