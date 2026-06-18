import { http } from "@/axios/service";
import { ContractAnnexFormData } from "@/types/cost/contract-manage/attachment-type";

/**
 * 合同附件相关接口
 */
export const attachmentApi = {
  /** 查询合同附件列表 */
  getAnnexList: (data: { conId: number }) => {
    return http.formPost("/con/annex/list", data);
  },
  /** 新增合同附件 */
  addAnnex: (data: ContractAnnexFormData) => {
    return http.post("/con/annex/add", data);
  },
  /** 删除合同附件 */
  delAnnex: (data: { id: number }) => {
    return http.formPost("/con/annex/del", data);
  },
};
