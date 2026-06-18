import { http } from "@/axios/service";
import { ContractVoidParams } from "@/types/cost/contract-manage/contract-void-type";

/**
 * 合同解除（合同作废） 相关接口
 */
export const contractVoidApi = {
  /** 查询合同作废列表 */
  getVoidist: (data: { conId: number }) => {
    return http.formPost("/con/void/list", data);
  },
  /** 查询合同作废 */
  getVoidById: (data: { id: number }) => {
    return http.formPost("/con/Void/get", data);
  },
  /** 新增合同作废 */
  addVoid: (data: ContractVoidParams) => {
    return http.post("/con/Void/add", data);
  },
  /** 修改合同作废 */
  editVoid: (data: ContractVoidParams) => {
    return http.post("/con/Void/edit", data);
  },
  /** 删除合同作废 */
  delVoid: (data: { id: number }) => {
    return http.formPost("/con/Void/del", data);
  },
};
