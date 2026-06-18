import { http } from "@/axios/service";
import { ContractBankAccountParams } from "@/types/cost/contract-manage/payment-account-type";

/**
 * 收款账号 相关接口
 */
export const paymentAccountApi = {
  /** 查询收款账号列表  conId:合同ID */
  getSupBankList: (data: { conId: number }) => {
    return http.formPost("/con/supBank/list", data);
  },
  /** 新增收款账号 */
  addSupBank: (data: ContractBankAccountParams) => {
    return http.post("/con/supBank/add", data);
  },
  /** 编辑收款账号 */
  editSupBank: (data: ContractBankAccountParams) => {
    return http.post("/con/supBank/edit", data);
  },
  /** 删除收款账号 */
  delSupBank: (data: { id: number }) => {
    return http.formPost("/con/supBank/del", data);
  },
};
