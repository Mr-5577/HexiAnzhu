import { http } from "@/axios/service";
import { ContractSettleSaveParams } from "@/types/cost/contract-manage/contract-settle-type";

/**
 * 合同结算 相关接口
 */
export const contractSettleApi = {
  /** 查询合同结算列表 */
  getSettleList: (data: { conId: number }) => {
    return http.formPost("/con/settle/list", data);
  },
  /** 查询合同结算（含扣款明细） */
  getSettleById: (data: { id: number }) => {
    return http.formPost("/con/settle/get", data);
  },
  /** 新增合同结算（含扣款明细） */
  addSettle: (data: ContractSettleSaveParams) => {
    return http.post("/con/settle/add", data);
  },
  /** 修改合同结算（含扣款明细） */
  editSettle: (data: ContractSettleSaveParams) => {
    return http.post("/con/settle/edit", data);
  },
  /** 删除合同结算 */
  delSettle: (data: { id: number }) => {
    return http.formPost("/con/settle/del", data);
  },
};
