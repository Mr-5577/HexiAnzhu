import { http } from "@/axios/service";
import {
  ContractTypeQueryParams,
  ContractTypeSaveParams,
  ContractTypeDeleteParams,
} from "@/types/cost/master-data/contract-category-type";

/** 
 * 合同类别相关接口
 */
export const conTypeApi = {
  /** 获取合同类别列表 */
  getConTypeList: (data?: ContractTypeQueryParams) => {
    return http.formPost("/mainData/conType/getList", data);
  },
  /** 新增合同类别 */
  addConType: (data: ContractTypeSaveParams) => {
    return http.post("/mainData/conType/add", data);
  },
  /** 修改合同类别 */
  editConType: (data: ContractTypeSaveParams) => {
    return http.post("/mainData/conType/edit", data);
  },
  /** 删除合同类别 */
  delConType: (data: ContractTypeDeleteParams) => {
    return http.formPost("/mainData/conType/del", data);
  },
};
