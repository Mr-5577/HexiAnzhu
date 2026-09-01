import { http } from "@/axios/service";

/**
 * 报表管理 相关接口
 */
export const reportManageApi = {
  /** 合同执行概览-列表表 */
  getExecutionReport: (data: any) => {
    return http.post("/con/executionReport", data);
  },
  /** 请款执行概览-主报表 */
  getReportMain: (data: any) => {
    return http.post("/pay/report/main", data);
  },
  /** 导出 请款执行概览-主报表 */
  exportReportMain: (data: any, filename: string = "请款执行概览.xlsx") => {
    return http.exportFile(
      "/pay/report/main",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },
  /** 请款执行概览-明细报表 */
  getReportSub: (data: any) => {
    return http.post("/pay/report/sub", data);
  },
  /** 导出 请款执行明细 */
  exportReportSub: (data: any, filename: string = "请款执行明细.xlsx") => {
    return http.exportFile(
      "/pay/report/sub",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },
  /** 产值申报概览报表 */
  getProdValReport: (data: any) => {
    return http.post("/con/prodValReport", data);
  },
  /** 导出 产值申报概览报表 */
  exportProdValReport: (data: any, filename: string = "产值申报概览.xlsx") => {
    return http.exportFile(
      "/con/prodValReport",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },
};
