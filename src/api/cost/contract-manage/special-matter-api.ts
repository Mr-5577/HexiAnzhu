import { http } from "@/axios/service";

/**
 * 特殊事项 相关接口
 */
export const specialMatterApi = {
  /** 查询合同特殊事项申请列表 */
  getSpecialList: (data: { conId: number }) => {
    return http.formPost("/con/special/list", data);
  },
  /** 查询单个合同特殊事项-特殊事项ID */
  getSpecialDetail: (id: number) => {
    return http.post(`/con/special/get?id=${id}`);
  },
  /** 保存合同特殊事项申请（新增/修改） */
  saveSpecial: (data: any) => {
    return http.post("/con/special/save", data);
  },
  /** 提交合同特殊事项申请审批 */
  submitSpecial: (data: any) => {
    return http.post("/con/special/submit", data);
  },
  /** 删除合同特殊事项 */
  delSpecial: (id: number) => {
    return http.formPost(`/con/special/del?id=${id}`);
  },
  /** 作废合同特殊事项 */
  voidSpecial: (id: number) => {
    return http.formPost(`/con/special/void?id=${id}`);
  },
};
