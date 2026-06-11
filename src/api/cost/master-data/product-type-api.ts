import { http } from "@/axios/service";
import {
  ProductBaseQueryParams,
  ProductBaseSaveParams,
  ProductProjQueryParams,
  ProductProjSaveParams,
} from "@/types/cost/master-data/product-type";
/**
 * 产品类型API
 */
export const productTypeApi = {
  /** 查询基础产品类型列表 */
  getProductBaseList: (data: ProductBaseQueryParams) => {
    return http.formPost("/mainData/productBase/getList", data);
  },
  /** 新增基础产品类型 */
  addProductBase: (data: ProductBaseSaveParams) => {
    return http.post("/mainData/productBase/add", data);
  },
  /** 修改基础产品类型 */
  editProductBase: (data: ProductBaseSaveParams) => {
    return http.post("/mainData/productBase/edit", data);
  },
  /** 删除基础产品类型 */
  delProductBase: (data: { id: number }) => {
    return http.formPost("/mainData/productBase/del", data);
  },

  /** 查询项目产品类型列表 */
  getProductProjList: (data: ProductProjQueryParams) => {
    return http.formPost("/mainData/productProj/getList", data);
  },
  /** 新增项目产品类型 */
  addProductProj: (data: ProductProjSaveParams) => {
    return http.formPost("/mainData/productProj/add", data);
  },
  /** 删除项目产品类型 */
  delProductProj: (data: { projId: number; prodId: number }) => {
    return http.formPost("/mainData/productProj/del", data);
  },
};
