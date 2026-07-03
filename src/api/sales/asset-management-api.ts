import { http } from "@/axios/service";
import {
  ChannelStatisticsExportParams,
  ChannelStatisticsParams,
  CheckOutExportParams,
  CheckOutParams,
  CheckOutRoomExportParams,
  CheckOutRoomParams,
  FinanceReportExportParams,
  FinanceReportParams,
  OrderCountExportParams,
  OrderCountParams,
  OrderNotSignExportParams,
  OrderNotSignParams,
  OrderNotSignRoomExportParams,
  OrderNotSignRoomParams,
  OrderToSignExportParams,
  OrderToSignParams,
  OrderToSignRoomExportParams,
  OrderToSignRoomParams,
  PerformanceDetailExportParams,
  PerformanceDetailParams,
  PremiumExportParams,
  PremiumParams,
  PremiumRoomExportParams,
  PremiumRoomParams,
  ReceivableProjExportParams,
  ReceivableProjParams,
  ReceivableRoomExportParams,
  ReceivableRoomParams,
  ReportExportParams,
  ReportParams,
  RoomAccountBookParams,
  SalerListParams,
  StatisticsParams,
  VisitCountExportParams,
  VisitCountParams,
  VisitHistoryParams,
  VisitProjListParams,
} from "@/types/sales/asset-management-type";

// ==================== API 定义 ====================
export const assetManagementApi = {
  // 获取房间销售状态
  getSaleStatusList: () => {
    return http.post("/sale/getSaleStatusList");
  },

  // 获取房间业态
  getProductTypeList: () => {
    return http.post("/sale/getProductTypeList");
  },

  // 获取房间台账
  getRoomAccountBook: (data: RoomAccountBookParams) => {
    return http.post("/sale/getRoomAccountBook", data);
  },

  // 导出房间台账
  exportRoomAccountBook: (
    data: RoomAccountBookParams,
    filename: string = "房间台账表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getRoomAccountBook",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 获取项目库存统计
  getRoomStockGroupProj: (data: StatisticsParams) => {
    return http.post("/sale/getRoomStockGroupProj", data);
  },
  /**
   * @name 项目库存统计-导出
   * @param data 导出参数
   * @param filename 导出文件名
   * @returns Excel文件数据流
   */
  exportRoomStockGroupProj: (
    data: StatisticsParams,
    filename: string = "库存统计表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getRoomStockGroupProj",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 获取库存明细
  getRoomStockList: (data: StatisticsParams) => {
    return http.post("/sale/getRoomStockList", data);
  },

  // 导出库存明细
  exportRoomStockList: (
    data: StatisticsParams,
    filename: string = "库存明细表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getRoomStockList",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 产值统计表
  getFinaAssetReport: (data: FinanceReportParams) => {
    return http.post("/sale/getFinaAssetReport", data);
  },

  // 导出产值统计表
  exportFinaAssetReport: (
    data: FinanceReportExportParams,
    filename: string = "产值统计表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getFinaAssetReport",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 来访统计-按天
  getCustomerComeMonthCount: (data: VisitCountParams) => {
    return http.post("/sale/getCustomerComeMonthCount", data);
  },

  // 导出 来访统计-按天
  exportCustomerComeMonthCount: (
    data: VisitCountExportParams,
    filename: string = "来访统计-按天.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getCustomerComeMonthCount",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 来访统计-按月
  getCustomerComeYearCount: (data: VisitCountParams) => {
    return http.post("/sale/getCustomerComeYearCount", data);
  },

  // 导出 来访统计-按月
  exportCustomerComeYearCount: (
    data: VisitCountExportParams,
    filename: string = "来访统计-按月.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getCustomerComeYearCount",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 来访渠道统计
  getComePathWayProjCount: (data: ChannelStatisticsParams) => {
    return http.post("/sale/getComePathWayProjCount", data);
  },

  // 来访渠道统计-导出
  exportComePathWayProjCount: (
    data: ChannelStatisticsExportParams,
    filename: string = "来访渠道统计表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getComePathWayProjCount",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 成交渠道统计
  getOrderPathWayProjCount: (data: ChannelStatisticsParams) => {
    return http.post("/sale/getOrderPathWayProjCount", data);
  },

  // 成交渠道统计-导出
  exportOrderPathWayProjCount: (
    data: ChannelStatisticsExportParams,
    filename: string = "成交渠道统计表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getOrderPathWayProjCount",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 获取来访数量（项目）== 转化率统计
  getCustomerComeZhl: (data: ChannelStatisticsParams) => {
    return http.post("/sale/getCustomerComeZhl", data);
  },

  // 导出转化率统计
  exportCustomerComeZhl: (
    data: ChannelStatisticsExportParams,
    filename: string = "转化率统计表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getCustomerComeZhl",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 来访记录列表
  getVisitHis: (data: VisitHistoryParams) => {
    return http.post("/visit/getVisitHis", data);
  },

  // 导出来访记录 Excel
  exportVisitHis: (data: any, filename: string = "来访记录.xlsx") => {
    return http.exportFile(
      "/visit/getVisitHisExcel",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 获取项目列表,isAll 为true时获取所有项目，false时获取当前用户所属项目
  getVisitProjList: (data: VisitProjListParams) => {
    return http.post("/visit/getProjList", data);
  },

  // 获取来访方式
  getVisitType: () => {
    return http.post("/visit/getVisitType");
  },

  // 置业顾问列表
  getSalerList: (data: SalerListParams) => {
    return http.post("/visit/getSalerList", data);
  },

  // 知晓途径数据
  getKnowWay: () => {
    return http.post("/visit/getKnowWay");
  },

  // 销售年报表
  getSaleYearReport: (data: ReportParams) => {
    return http.post("/sale/getSaleYearReport", data);
  },

  // 销售年报表-导出
  exportSaleYearReport: (
    data: ReportExportParams,
    filename: string = "销售年报表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getSaleYearReport",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 销售年报表(树)
  getSaleYearReportTree: (data: ReportParams) => {
    return http.post("/sale/getSaleYearReportTree", data);
  },

  // 销售年报表(树)-导出
  exportSaleYearReportTree: (
    data: ReportExportParams,
    filename: string = "销售年报表(树).xlsx",
  ) => {
    return http.exportFile(
      "/sale/getSaleYearReportTree",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 销售日报表
  getSaleDailyReport: (data: ReportParams) => {
    return http.post("/sale/getSaleDailyReport", data);
  },

  // 销售日报表-导出
  exportSaleDailyReport: (
    data: ReportExportParams,
    filename: string = "销售日报表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getSaleDailyReport",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 销售日报表(树)
  getSaleDailyReportTree: (data: ReportParams) => {
    return http.post("/sale/getSaleDailyReportTree", data);
  },

  // 销售日报表(树)-导出
  exportSaleDailyReportTree: (
    data: ReportExportParams,
    filename: string = "销售日报表(树).xlsx",
  ) => {
    return http.exportFile(
      "/sale/getSaleDailyReportTree",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 认购业绩明细
  getSaleAsstListOrder: (data: PerformanceDetailParams) => {
    return http.post("/sale/getSaleAsstListOrder", data);
  },

  // 认购业绩明细-导出
  exportSaleAsstListOrder: (
    data: PerformanceDetailExportParams,
    filename: string = "认购业绩明细.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getSaleAsstListOrder",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 签约业绩明细
  getSaleAsstListSign: (data: PerformanceDetailParams) => {
    return http.post("/sale/getSaleAsstListSign", data);
  },

  // 签约业绩明细-导出
  exportSaleAsstListSign: (
    data: PerformanceDetailExportParams,
    filename: string = "签约业绩明细.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getSaleAsstListSign",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 回款业绩明细
  getSaleAsstListPay: (data: PerformanceDetailParams) => {
    return http.post("/sale/getSaleAsstListPay", data);
  },

  // 回款业绩明细-导出
  exportSaleAsstListPay: (
    data: PerformanceDetailExportParams,
    filename: string = "回款业绩明细.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getSaleAsstListPay",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 认购统计表（月度）
  getOrderNumMonthCount: (data: OrderCountParams) => {
    return http.post("/sale/getOrderNumMonthCount", data);
  },

  // 认购统计表（月度）-导出
  exportOrderNumMonthCount: (
    data: OrderCountExportParams,
    filename: string = "认购达成统计(按天).xlsx",
  ) => {
    return http.exportFile(
      "/sale/getOrderNumMonthCount",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 认购统计表（年度）
  getOrderNumYearCount: (data: OrderCountParams) => {
    return http.post("/sale/getOrderNumYearCount", data);
  },

  // 认购统计表（年度）-导出
  exportOrderNumYearCount: (
    data: OrderCountExportParams,
    filename: string = "认购达成统计(按月).xlsx",
  ) => {
    return http.exportFile(
      "/sale/getOrderNumYearCount",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 认购转签约统计
  getOrderToSignPeriodProj: (data: OrderToSignParams) => {
    return http.post("/sale/getOrderToSignPeriodProj", data);
  },

  // 认购转签约统计-导出
  exportOrderToSignPeriodProj: (
    data: OrderToSignExportParams,
    filename: string = "认购转签约统计.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getOrderToSignPeriodProj",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 认购转签约明细
  getOrderToSignPeriodRoom: (data: OrderToSignRoomParams) => {
    return http.post("/sale/getOrderToSignPeriodRoom", data);
  },

  // 认购转签约明细-导出
  exportOrderToSignPeriodRoom: (
    data: OrderToSignRoomExportParams,
    filename: string = "认购转签约明细.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getOrderToSignPeriodRoom",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 认购未签约统计
  getOrderNotSignInfoProj: (data: OrderNotSignParams) => {
    return http.post("/sale/getOrderNotSignInfoProj", data);
  },

  // 认购未签约统计-导出
  exportOrderNotSignInfoProj: (
    data: OrderNotSignExportParams,
    filename: string = "认购未签约统计.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getOrderNotSignInfoProj",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 认购未签约明细
  getOrderNotSignInfoRoom: (data: OrderNotSignRoomParams) => {
    return http.post("/sale/getOrderNotSignInfoRoom", data);
  },

  // 认购未签约明细-导出
  exportOrderNotSignInfoRoom: (
    data: OrderNotSignRoomExportParams,
    filename: string = "认购未签约明细.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getOrderNotSignInfoRoom",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 溢价统计（项目）
  getPremiumCountProj: (data: PremiumParams) => {
    return http.post("/sale/getPremiumCountProj", data);
  },

  // 溢价统计（项目）-导出
  exportPremiumCountProj: (
    data: PremiumExportParams,
    filename: string = "溢价统计表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getPremiumCountProj",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 溢价明细（房间）
  getPremiumCountRoom: (data: PremiumRoomParams) => {
    return http.post("/sale/getPremiumCountRoom", data);
  },

  // 溢价明细（房间）-导出
  exportPremiumCountRoom: (
    data: PremiumRoomExportParams,
    filename: string = "溢价明细表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getPremiumCountRoom",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 应收统计（项目汇总）
  getSaleOutStdFundsInfoYsProj: (data: ReceivableProjParams) => {
    return http.post("/sale/getSaleOutStdFundsInfoYsProj", data);
  },

  // 应收统计（项目汇总）-导出
  exportSaleOutStdFundsInfoYsProj: (
    data: ReceivableProjExportParams,
    filename: string = "应收统计表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getSaleOutStdFundsInfoYsProj",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 应收统计（房间明细）
  getSaleOutStdFundsInfoYsRoom: (data: ReceivableRoomParams) => {
    return http.post("/sale/getSaleOutStdFundsInfoYsRoom", data);
  },

  // 应收统计（房间明细）-导出
  exportSaleOutStdFundsInfoYsRoom: (
    data: ReceivableRoomExportParams,
    filename: string = "应收明细表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getSaleOutStdFundsInfoYsRoom",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 应收账龄明细（房间明细）
  getSaleOutStdFundsInfoYsAging: (data: ReceivableRoomParams) => {
    return http.post("/sale/getSaleOutStdFundsInfoYsAging", data);
  },

  // 应收账龄明细（房间明细）-导出
  exportSaleOutStdFundsInfoYsAging: (
    data: ReceivableRoomExportParams,
    filename: string = "应收账龄明细表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getSaleOutStdFundsInfoYsAging",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 退房、挞定统计-项目
  getCheckOutInfoProj: (data: CheckOutParams) => {
    return http.post("/sale/getCheckOutInfoProj", data);
  },

  // 退房、挞定统计-项目-导出
  exportCheckOutInfoProj: (
    data: CheckOutExportParams,
    filename: string = "退房挞定统计表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getCheckOutInfoProj",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 退房、挞定明细-房间
  getCheckOutInfoRoom: (data: CheckOutRoomParams) => {
    return http.post("/sale/getCheckOutInfoRoom", data);
  },

  // 退房、挞定明细-房间-导出
  exportCheckOutInfoRoom: (
    data: CheckOutRoomExportParams,
    filename: string = "退房挞定明细表.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getCheckOutInfoRoom",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },

  // 逾期未回款明细
  getSaleOutStdFundsInfoRoom: (data: ReceivableProjParams) => {
    return http.post("/sale/getSaleOutStdFundsInfoRoom", data);
  },

  // 逾期未回款明细-导出
  exportSaleOutStdFundsInfoRoom: (
    data: ReceivableProjExportParams,
    filename: string = "逾期未回款明细.xlsx",
  ) => {
    return http.exportFile(
      "/sale/getSaleOutStdFundsInfoRoom",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },
};
