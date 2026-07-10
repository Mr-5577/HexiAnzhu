import { http } from "@/axios/service";
import {
  SupplierTypeQueryParams,
  SupplierTypeSaveParams,
  SupplierTypeDeleteParams,
} from "@/types/cost/master-data/supplier-category-type";

/**
 * 供应商类别 API
 * @description 提供供应商类别的增删改查功能，支持树形层级结构
 */
export const supTypeApi = {
  /**
   * 获取供应商类别列表
   * @param data - 查询参数（可选）
   * @param data.id - 主键ID（精确查询）
   * @param data.pid - 父级ID（查询指定父级下的子类别）
   * @param data.supTypeCode - 类别编码（模糊查询）
   * @param data.supTypeName - 类别名称（模糊查询）
   * @param data.isEnabled - 是否启用：false-禁用，true-启用
   * @returns Promise 供应商类别列表
   */
  getSupTypeList: (data?: SupplierTypeQueryParams) => {
    return http.formPost("/mainData/supType/getList", data);
  },

  /**
   * 新增供应商类别
   * @param data - 新增参数
   * @param data.pid - 父级ID（必填，根节点传 0）
   * @param data.supTypeCode - 类别编码（必填）
   * @param data.supTypeName - 类别名称（必填）
   * @param data.isEnabled - 是否启用，默认 true
   * @param data.remark - 备注
   */
  addSupType: (data: SupplierTypeSaveParams) => {
    return http.post("/mainData/supType/add", data);
  },

  /**
   * 修改供应商类别
   * @param data - 修改参数
   * @param data.id - 主键ID（必填）
   * @param data.pid - 父级ID（必填）
   * @param data.supTypeCode - 类别编码（必填）
   * @param data.supTypeName - 类别名称（必填）
   * @param data.isEnabled - 是否启用
   * @param data.remark - 备注
   * @returns Promise
   */
  editSupType: (data: SupplierTypeSaveParams) => {
    return http.post("/mainData/supType/edit", data);
  },

  /**
   * 删除供应商类别
   * @param data - 删除参数
   * @param data.id - 主键ID（必填）
   * @returns Promise
   */
  delSupType: (data: SupplierTypeDeleteParams) => {
    return http.formPost("/mainData/supType/del", data);
  },
};
