import { http } from "@/axios/service";
import { HConMainQuery, HConMainSave } from "@/types/cost/contract-ledger-type";

/**
 * 合同台账相关接口
 */
export const contractLedgerApi = {
  /** 查询合同台账列表 */
  getContractLedgerList: (data: HConMainQuery) => {
    return http.formPost("/con/main/list", data);
  },
  /** 查询单个合同台账 */
  getContractLedgerById: (data: { id: number }) => {
    return http.formPost("/con/main/get", data);
  },
  /** 新增合同台账 */
  addContractLedger: (data: HConMainSave) => {
    return http.post("/con/main/add", data);
  },
  /** 编辑合同台账 */
  editContractLedger: (data: HConMainSave) => {
    return http.post("/con/main/edit", data);
  },
  /** 删除合同台账 */
  delContractLedger: (data: { id: number }) => {
    return http.formPost("/con/main/del", data);
  },
};
