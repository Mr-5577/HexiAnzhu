import { http } from "@/axios/service";
import {
  ProductBaseQueryParams,
  ProductBaseSaveParams,
  ProductProjQueryParams,
  ProductProjSaveParams,
} from "@/types/cost/master-data/product-type";

/**
 * 产品类型 API
 * @description 提供基础产品类型和项目产品类型的增删改查功能
 */
export const productTypeApi = {
  // ==================== 基础产品类型 ====================
  /**
   * 查询基础产品类型列表
   * @param data - 查询参数
   * @param data.prodName - 产品类型名称（模糊查询）
   * @param data.prodCode - 产品类型编号（模糊查询）
   * @returns Promise 基础产品类型列表
   */
  getProductBaseList: (data: ProductBaseQueryParams) => {
    return http.formPost("/mainData/productBase/getList", data);
  },

  /**
   * 新增基础产品类型
   * @param data - 新增参数
   * @param data.pid - 父级ID（必填，根节点传 0）
   * @param data.prodCode - 产品类型编号（必填）
   * @param data.prodName - 产品类型名称（必填）
   * @param data.prodLevel - 产品类型层级（必填）
   * @param data.prodDesc - 产品类型说明
   * @param data.isEnabled - 是否启用，默认 true
   * @param data.sort - 排序号
   * @returns Promise
   */
  addProductBase: (data: ProductBaseSaveParams) => {
    return http.post("/mainData/productBase/add", data);
  },

  /**
   * 修改基础产品类型
   * @param data - 修改参数
   * @param data.id - 主键ID（必填）
   * @param data.pid - 父级ID（必填）
   * @param data.prodCode - 产品类型编号（必填）
   * @param data.prodName - 产品类型名称（必填）
   * @param data.prodLevel - 产品类型层级（必填）
   * @param data.prodDesc - 产品类型说明
   * @param data.isEnabled - 是否启用
   * @param data.sort - 排序号
   * @returns Promise
   */
  editProductBase: (data: ProductBaseSaveParams) => {
    return http.post("/mainData/productBase/edit", data);
  },

  /**
   * 删除基础产品类型
   * @param data - 删除参数
   * @param data.id - 主键ID（必填）
   * @returns Promise
   */
  delProductBase: (data: { id: number }) => {
    return http.formPost("/mainData/productBase/del", data);
  },

  // ==================== 项目产品类型 ====================

  /**
   * 查询项目产品类型列表
   * @param data - 查询参数
   * @param data.projId - 项目ID（必填）
   * @param data.prodId - 产品类型ID
   * @param data.withDetail - 是否包含产品类型详情，默认 false
   * @returns Promise 项目产品类型列表
   */
  getProductProjList: (data: ProductProjQueryParams) => {
    return http.formPost("/mainData/productProj/getList", data);
  },

  /**
   * 新增项目产品类型
   * @param data - 新增参数
   * @param data.projId - 项目ID（必填）
   * @param data.prodId - 产品类型ID（必填）
   * @returns Promise
   */
  addProductProj: (data: ProductProjSaveParams) => {
    return http.formPost("/mainData/productProj/add", data);
  },

  /**
   * 删除项目产品类型
   * @param data - 删除参数
   * @param data.projId - 项目ID（必填）
   * @param data.prodId - 产品类型ID（必填）
   * @returns Promise
   */
  delProductProj: (data: { projId: number; prodId: number }) => {
    return http.formPost("/mainData/productProj/del", data);
  },
};
