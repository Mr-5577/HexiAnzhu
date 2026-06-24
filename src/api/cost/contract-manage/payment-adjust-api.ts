import { http } from "@/axios/service";
import { ContractDedParams, DedInfo } from "@/types/cost/contract-manage/payment-adjust-type";

/**
 * 款项调整(合同奖罚) 相关接口
 */
export const paymentAdjustApi = {
  /** 查询合同奖罚列表 */
  getDedList: (data: { conId: number }) => {
    return http.formPost("/con/ded/list", data);
  },
  /** 查询单个合同奖罚 */
  getDedDetail: (data: { id: number }) => {
    return http.formPost("/con/ded/get", data);
  },
  /** 新增合同奖罚 */
  addDed: (data: ContractDedParams) => {
    return http.post("/con/ded/add", data);
  },
  /** 编辑合同奖罚 */
  editDed: (data: DedInfo) => {
    return http.post("/con/ded/edit", data);
  },
  /** 删除合同奖罚 */
  delDed: (data: { id: number }) => {
    return http.formPost("/con/ded/del", data);
  },
};
