import { http } from "@/axios/service";
import {
  ManageUnitFormData,
  ManageUnitQueryParams,
} from "@/types/cost/master-data/management-unit-type";

/**
 * 管理单元 API
 * @description 提供管理单元（公司/组织）的增删改查功能
 * 管理单元是组织架构的基本单位，支持层级结构，包含板块、公司、部门等组织类型
 */
export const manageunitApi = {
  // ==================== 管理单元基础操作 ====================
  /**
   * 获取管理单元列表
   * @param data - 查询参数（可选）
   * @param data.id - 管理单元ID（精确查询）
   * @param data.pid - 父级ID（查询指定父级下的子节点）
   * @param data.mguName - 管理单元名称（模糊查询）
   * @param data.mguCode - 管理单元编码（模糊查询）
   * @param data.mguType - 管理单元类型：1-板块，2-公司，3-部门
   * @param data.segId - 所属板块ID
   * @param data.isVirtual - 是否虚拟单元：false-否，true-是
   * @param data.isEnabled - 是否启用：false-禁用，true-启用
   * @param data.remark - 备注（模糊查询）
   * @returns Promise 管理单元列表
   */
  getManageunitList: (data?: ManageUnitQueryParams) => {
    return http.formPost("/mainData/manageunit/getList", data);
  },

  /**
   * 新增管理单元
   * @param data - 新增参数
   * @param data.mguName - 管理单元名称（必填）
   * @param data.mguCode - 管理单元编码（必填，全局唯一）
   * @param data.mguType - 管理单元类型（必填）：1-板块，2-公司，3-部门
   * @param data.pid - 父级ID（根节点传 0）
   * @param data.segId - 所属板块ID
   * @param data.isVirtual - 是否虚拟单元，默认 false
   * @param data.sort - 排序号
   * @param data.isEnabled - 是否启用，默认 true
   * @param data.remark - 备注
   * @returns Promise
   */
  addManageunit: (data: ManageUnitFormData) => {
    return http.post("/mainData/manageunit/add", data);
  },

  /**
   * 修改管理单元
   * @param data - 修改参数
   * @param data.id - 管理单元ID（必填）
   * @param data.mguName - 管理单元名称（必填）
   * @param data.mguCode - 管理单元编码（必填）
   * @param data.mguType - 管理单元类型（必填）
   * @param data.pid - 父级ID
   * @param data.segId - 所属板块ID
   * @param data.isVirtual - 是否虚拟单元
   * @param data.sort - 排序号
   * @param data.isEnabled - 是否启用
   * @param data.remark - 备注
   * @returns Promise
   */
  editManageunit: (data: ManageUnitFormData) => {
    return http.post("/mainData/manageunit/edit", data);
  },

  /**
   * 删除管理单元
   * @param data - 删除参数
   * @param data.id - 管理单元ID（必填）
   * @returns Promise
   * @description 注意：删除前请确保该管理单元下没有子节点或关联数据
   */
  delManageunit: (data: { id: number }) => {
    return http.formPost("/mainData/manageunit/del", data);
  },

  /**
   * 获取权限内公司列表
   * @returns Promise 当前用户有权限查看的公司列表
   */
  getAuthMguList: () => {
    return http.post("/mainData/manageunit/getAuthMguList");
  },

  /**
   * 获取板块-公司树形结构
   * @returns Promise 板块和公司的树形层级结构
   */
  getSegMguList: () => {
    return http.post("/mainData/manageunit/getSegMguList");
  },
};
