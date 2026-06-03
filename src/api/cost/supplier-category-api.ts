import { http } from "@/axios/service";
import {
  SupplierTypeQueryParams,
  SupplierTypeSaveParams,
  SupplierTypeDeleteParams,
} from "@/types/cost/supplier-category-type";

/**
 * 供应商类别API
 */
export const supTypeApi = {
  /** 获取供应商类别列表 */
  getSupTypeList: (data?: SupplierTypeQueryParams) => {
    return http.formPost("/mainData/supType/getList", data);
  },
  /** 新增供应商类别 */
  addSupType: (data: SupplierTypeSaveParams) => {
    return http.post("/mainData/supType/add", data);
  },
  /** 修改供应商类别 */
  editSupType: (data: SupplierTypeSaveParams) => {
    return http.post("/mainData/supType/edit", data);
  },
  /** 删除供应商类别 */
  delSupType: (data: SupplierTypeDeleteParams) => {
    return http.formPost("/mainData/supType/del", data);
  },
};
