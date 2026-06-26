import { http } from "@/axios/service";
import {
  ContractPreSettleEditParams,
  ContractPreSettleSaveParams,
} from "@/types/cost/contract-manage/contract-preSettlement-type";

/**
 * 合同预结算 相关接口
 */
export const contractPreSettleApi = {
  /** 查询合同预结算列表 */
  getPreSettleList: (data: { conId: number }) => {
    return http.formPost("/con/preSettle/list", data);
  },
  /** 查询合同预结算 */
  getPreSettleById: (data: { id: number }) => {
    return http.formPost("/con/preSettle/get", data);
  },
  /** 新增合同预结算 */
  addPreSettle: (data: ContractPreSettleSaveParams) => {
    return http.post("/con/preSettle/add", data);
  },
  /** 修改合同预结算 */
  editPreSettle: (data: ContractPreSettleEditParams) => {
    return http.post("/con/preSettle/edit", data);
  },
  /** 删除合同预结算 */
  delPreSettle: (data: { id: number }) => {
    return http.formPost("/con/preSettle/del", data);
  },
};
