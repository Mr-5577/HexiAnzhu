import { http } from "@/axios/service";
import { ContractProdValParams } from "@/types/cost/contract-manage/output-declaration-type";

/**
 * 产值申报 相关接口
 */
export const outputDeclarationApi = {
  /** 查询合同产值列表 */
  getProdValList: (data: { conId: number }) => {
    return http.formPost("/con/prodVal/list", data);
  },
  /** 查询合同产值（含子表） */
  getProdValById: (data: { id: number }) => {
    return http.formPost("/con/prodVal/get", data);
  },
  /** 新增补充合同 */
  addProdVal: (data: ContractProdValParams) => {
    return http.post("/con/prodVal/add", data);
  },
  /** 修改补充合同 */
  editProdVal: (data: ContractProdValParams) => {
    return http.post("/con/prodVal/edit", data);
  },
  /** 删除补充合同 */
  delProdVal: (data: { id: number }) => {
    return http.formPost("/con/prodVal/del", data);
  },
};
