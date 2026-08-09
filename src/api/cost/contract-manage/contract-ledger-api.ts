import { http } from "@/axios/service";
import { HConMainQuery, HConMainSave } from "@/types/cost/contract-manage/contract-ledger-type";

/**
 * 合同台账相关接口
 */
export const contractLedgerApi = {
  /** 查询合同台账列表 */
  getContractLedgerList: (data: HConMainQuery) => {
    return http.formPost("/con/main/list", data);
  },
  /** 编辑/查看合同 */
  getContractLedgerById: (data: { id: number,isWithFlow?:boolean }) => {
    return http.formPost("/con/main/get", data);
  },
  /** 录入合同 */
  saveContractLedger: (data: HConMainSave) => {
    return http.post("/con/main/save", data);
  },
  /** 提交合同 */
  submitContractLedger: (data: HConMainSave) => {
    return http.post("/con/main/submit", data);
  },
  /** 删除合同 */
  delContractLedger: (data: { id: number }) => {
    return http.formPost("/con/main/del", data);
  },
  /** 作废合同 */
  voidContractLedger: (id: number ) => {
    return http.post("/con/main/void?id="+ id);
  },
};
