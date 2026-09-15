import { http } from "@/axios/service";

/**
 * 工程核价 相关接口
 */
export const engineeringPriceApi = {
  /** 查询合同工程核价列表 */
  getAuditPriceList: (conId: number) => {
    return http.post(`/con/auditPrice/list?conId=${conId}`);
  },
  /** 查询单个合同工程核价-工程核价ID */
  getAuditPriceDetail: (id: number) => {
    return http.post(`/con/auditPrice/get?id=${id}`);
  },
  /** 保存合同工程核价（新增/修改） */
  saveAuditPrice: (data: any) => {
    return http.post("/con/auditPrice/save", data);
  },
  /** 提交合同工程核价审批 */
  submitAuditPrice: (data: any) => {
    return http.post("/con/auditPrice/submit", data);
  },
  /** 删除工程核价 */
  delAuditPrice: (data: { id: number }) => {
    return http.formPost("/con/auditPrice/del", data);
  },
  /** 作废工程核价 */
  voidAuditPrice: (data: { id: number }) => {
    return http.formPost("/con/auditPrice/void", data);
  },
};
