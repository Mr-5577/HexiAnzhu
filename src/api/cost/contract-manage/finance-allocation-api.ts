import { http } from "@/axios/service";

/**
 * 财务分摊 相关接口
 */
export const financeAllocationApi = {
  /**
   * @name 查询非合同财务分摊
   * @param params.nconBillId - 非合同单据ID
   */
  getNconAlloc: (params: { nconBillId: number }) => {
    return http.get("/pay/alloc/ncon/get", params);
  },
  /**
   * 保存非合同财务分摊
   */
  saveNconAlloc: (data: any) => {
    return http.post("/pay/alloc/ncon/save", data);
  },

  /**
   * @name 查询合同财务分摊
   * @param params.conBillId - 合同单据ID
   */
  getConAlloc: (params: { conBillId: number }) => {
    return http.get("/pay/alloc/con/get", params);
  },
  /**
   * 保存合同财务分摊
   */
  saveConAlloc: (data: any) => {
    return http.post("/pay/alloc/con/save", data);
  },
};
