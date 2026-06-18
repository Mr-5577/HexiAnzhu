import { http } from "@/axios/service";
import { ContractAuditPriceFormData } from "@/types/cost/contract-manage/engineering-price-type";

/**
 * 工程核价 相关接口
 */
export const engineeringPriceApi = {
  /** 查询合同工程核价列表 */
  getAuditPriceList: (data: { conId: number }) => {
    return http.formPost("/con/auditPrice/list", data);
  },
  /** 查询单个合同工程核价 */
  getAuditPriceDetail: (data: { id: number }) => {
    return http.formPost("/con/auditPrice/get", data);
  },
  /** 新增工程核价 */
  addAuditPrice: (data: ContractAuditPriceFormData) => {
    return http.post("/con/auditPrice/add", data);
  },
  /** 编辑工程核价 */
  editAuditPrice: (data: ContractAuditPriceFormData) => {
    return http.post("/con/auditPrice/edit", data);
  },
  /** 删除工程核价 */
  delAuditPrice: (data: { id: number }) => {
    return http.formPost("/con/auditPrice/del", data);
  },
};
