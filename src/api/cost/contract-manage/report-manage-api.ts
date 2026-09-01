import { http } from "@/axios/service";
import { ContractExecutionQueryParam } from "@/types/cost/report-manage/contract-overview";
import { PaymentOverviewQueryParam } from "@/types/cost/report-manage/payment-overview";
import { ProjectOutputQueryParam } from "@/types/cost/report-manage/project-output";

/**
 * 报表管理 相关接口
 */
export const reportManageApi = {
  /** 合同执行概览-列表表 */
  getExecutionReport: (data: ContractExecutionQueryParam) => {
    return http.post("/con/executionReport", data);
  },
  /** 请款执行概览-主报表 */
  getReportMain: (data: PaymentOverviewQueryParam) => {
    return http.post("/pay/report/main", data);
  },
  /** 导出 请款执行概览-主报表 */
  exportReportMain: (
    data: PaymentOverviewQueryParam,
    filename: string = "请款执行概览.xlsx",
  ) => {
    return http.exportFile(
      "/pay/report/main",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },
  /** 请款执行概览-明细报表 */
  getReportSub: (data: PaymentOverviewQueryParam) => {
    return http.post("/pay/report/sub", data);
  },
  /** 导出 请款执行明细 */
  exportReportSub: (
    data: PaymentOverviewQueryParam,
    filename: string = "请款执行明细.xlsx",
  ) => {
    return http.exportFile(
      "/pay/report/sub",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },
  /** 产值申报概览报表 */
  getProdValReport: (data: ProjectOutputQueryParam) => {
    return http.post("/con/prodValReport", data);
  },
  /** 导出 产值申报概览报表 */
  exportProdValReport: (
    data: ProjectOutputQueryParam,
    filename: string = "产值申报概览.xlsx",
  ) => {
    return http.exportFile(
      "/con/prodValReport",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },
};
