import { http } from "@/axios/service";
import {
  ContractTypeQueryParams,
  ContractTypeSaveParams,
} from "@/types/cost/master-data/contract-category-type";

/**
 * 合同类别 API
 * @description 提供合同类别的增删改查功能，支持树形结构管理
 */
export const conTypeApi = {
  /**
   * 获取合同类别列表
   * @param data - 查询参数（可选）
   * @param data.id - 主键ID（精确查询）
   * @param data.pid - 父级ID（查询指定父级下的子类别）
   * @param data.conTypeCode - 类别编码（模糊查询）
   * @param data.conTypeName - 合同类别名称（模糊查询）
   * @param data.majorIds - 所属职能专业ID列表（批量查询）
   * @param data.isNeedOutValue - 是否报产值：false-否，true-是
   * @param data.isEnabled - 是否启用：false-禁用，true-启用
   * @returns Promise 合同类别列表
   */
  getConTypeList: (data?: ContractTypeQueryParams) => {
    return http.formPost("/mainData/conType/getList", data);
  },

  /**
   * 新增合同类别
   * @param data - 新增参数
   * @param data.pid - 父级ID（必填，根节点传 0）
   * @param data.conTypeCode - 类别编码（必填）
   * @param data.conTypeName - 合同类别名称（必填）
   * @param data.majorId - 所属职能专业ID
   * @param data.isNeedOutValue - 是否报产值，默认 false
   * @param data.isEnabled - 是否启用，默认 true
   * @param data.remark - 备注
   * @returns Promise
   */
  addConType: (data: ContractTypeSaveParams) => {
    return http.post("/mainData/conType/add", data);
  },

  /**
   * 修改合同类别
   * @param data - 修改参数
   * @param data.id - 主键ID（必填）
   * @param data.pid - 父级ID（必填）
   * @param data.conTypeCode - 类别编码（必填）
   * @param data.conTypeName - 合同类别名称（必填）
   * @param data.majorId - 所属职能专业ID
   * @param data.isNeedOutValue - 是否报产值
   * @param data.isEnabled - 是否启用
   * @param data.remark - 备注
   * @returns Promise
   */
  editConType: (data: ContractTypeSaveParams) => {
    return http.post("/mainData/conType/edit", data);
  },

  /**
   * 删除合同类别
   * @param data - 删除参数
   * @param data.id - 主键ID（必填）
   * @returns Promise
   * @description 注意：删除类别前请确保没有子类别或关联数据
   */
  delConType: (data: { id: number }) => {
    return http.formPost("/mainData/conType/del", data);
  },
};
