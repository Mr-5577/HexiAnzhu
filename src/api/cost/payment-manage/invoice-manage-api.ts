import { http } from "@/axios/service";

/**
 * 发票管理 相关接口
 */
export const invoiceManageApi = {
  /**
   * @name 查询发票台账
   * @param params.projId 项目ID
   * @param params.segId 板块ID
   * @returns
   */
  getInvoiceLedger: (params: { projId?: number; segId?: number }) => {
    return http.get("/inv/getInvoiceLedger", params);
  },
  /**
   * @name 查询发票明细
   * @param params.billId 单据id
   * @param params.srcType 来源类型：合同CON/非合同NCON
   * @returns
   */
  getInvoiceDetail: (params: { billId?: number; srcType?: string }) => {
    return http.get("/inv/getInvoiceLedgerDetail", params);
  },
};
