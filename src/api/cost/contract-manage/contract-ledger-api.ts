import { http } from "@/axios/service";
import {
  HConMainQuery,
  HConMainSave,
} from "@/types/cost/contract-manage/contract-ledger-type";

/**
 * 合同台账相关接口
 */
export const contractLedgerApi = {
  /** 查询合同台账列表 */
  getContractLedgerList: (data: HConMainQuery) => {
    return http.formPost("/con/main/list", data);
  },
  /** 编辑/查看合同 */
  getContractLedgerById: (data: { id: number; isWithFlow?: boolean }) => {
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
  voidContractLedger: (id: number) => {
    return http.post("/con/main/void?id=" + id);
  },
  /** 取合同支付比例信息 */
  getContractPayRateList: (data: { conId: number; payTypeId?: number }) => {
    return http.formPost("/con/payrate/list", data);
  },  
  /** 取合同验收款信息0-累计验收 1-最大验收金额 */
  getContractYskAmt: (data: { conId: number;
    typeList: number[];}) => {
    return http.formPost("/con/yskAmt",data);
  }, 

  /** 取合同编号 */
  getContractNo: (data: { bizType: string;
    mainConId:number,
    projId:number,
    conTypeId:number,
    compId: number}) => {
    return http.formPost("/system/getConBillNo",data);
  }, 

  /** 查询合同台账主表（轻量级） */
  getConInfoLite: (data: { conId?: number; conBillId?: number }) => {
    return http.formPost("/con/main/getLite", data);
  },
  /** 查询主合同下的子项合同信息（轻量级） */
  getSubConLiteInfo: (data: { billId: number }) => {
    return http.formPost("/con/bill/subBizId", data);
  },
};
