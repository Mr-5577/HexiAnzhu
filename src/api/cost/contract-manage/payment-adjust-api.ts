import { http } from "@/axios/service";

/**
 * 款项调整(合同奖罚) 相关接口
 */
export const paymentAdjustApi = {
  /** 查询合同奖罚列表-合同ID */
  getDedList: (data: { conId: number }) => {
    return http.formPost("/con/ded/list", data);
  },
  /** 查询单个合同奖罚 */
  getDedDetail: (id: number) => {
    return http.post(`/con/ded/get?id=${id}`);
  },
  /** 保存合同奖罚（新增/修改） */
  saveDed: (data: any) => {
    return http.post("/con/ded/save", data);
  },
  /** 保存并提交合同奖罚审批 */
  submitDed: (data: any) => {
    return http.post("/con/ded/submit", data);
  },
  /** 删除合同奖罚 */
  delDed: (data: { id: number }) => {
    return http.formPost("/con/ded/del", data);
  },
  /** 作废合同奖罚 */
  voidDed: (data: { id: number }) => {
    return http.formPost("/con/ded/void", data);
  },
};
