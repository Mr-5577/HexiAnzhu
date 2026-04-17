import { http } from "@/axios/service";

interface ParamsInterface {
  projIds: number[];
  productTypes: number[];
  saleStatus: number[];
}
interface StatisticsInterface {
  projIds: number[];
  productTypes: number[];
}
interface StatisticsInterface {
  projIds: number[];
  productTypes: number[];
}
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
  getRoomAccountBook: (data: ParamsInterface) => {
    return http.post("/sale/getRoomAccountBook", data);
  },
  // 导出房间台账
  exportRoomAccountBook: (
    data: ParamsInterface,
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
  getRoomStockGroupProj: (data: StatisticsInterface) => {
    return http.post("/sale/getRoomStockGroupProj", data);
  },
  /**
   * @name 项目库存统计-导出
   * @param data 导出参数
   * @param filename 导出文件名
   * @returns Excel文件数据流
   */
  exportRoomStockGroupProj: (
    data: StatisticsInterface,
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
  getRoomStockList: (data: StatisticsInterface) => {
    return http.post("/sale/getRoomStockList", data);
  },
  // 导出库存明细
  exportRoomStockList: (
    data: StatisticsInterface,
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
  getFinaAssetReport: (data: any) => {
    return http.post("/sale/getFinaAssetReport", data);
  },
  // 导出产值统计表
  exportFinaAssetReport: (data: any, filename: string = "产值统计表.xlsx") => {
    return http.exportFile(
      "/sale/getFinaAssetReport",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },
  // 来访统计-按天
  getCustomerComeMonthCount: (data: any) => {
    return http.post("/sale/getCustomerComeMonthCount", data);
  },
  // 导出 来访统计-按天
  exportCustomerComeMonthCount: (
    data: any,
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
  getCustomerComeYearCount: (data: any) => {
    return http.post("/sale/getCustomerComeYearCount", data);
  },
  // 导出 来访统计-按月
  exportCustomerComeYearCount: (
    data: any,
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
  getComePathWayProjCount: (data: any) => {
    return http.post("/sale/getComePathWayProjCount", data);
  },
  // 来访渠道统计-导出
  exportComePathWayProjCount: (
    data: any,
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
  getOrderPathWayProjCount: (data: any) => {
    return http.post("/sale/getOrderPathWayProjCount", data);
  },
  // 成交渠道统计-导出
  exportOrderPathWayProjCount: (
    data: any,
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
  getCustomerComeZhl: (data: any) => {
    return http.post("/sale/getCustomerComeZhl", data);
  },
  // 导出转化率统计
  exportCustomerComeZhl: (
    data: any,
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
  getVisitHis: (data: any) => {
    return http.post("/visit/getVisitHis", data);
  },
  // 获取项目列表,isAll 为true时获取所有项目，false时获取当前用户所属项目
  getProjList: (data: any) => {
    return http.post("/visit/getProjList", data);
  },
  // 获取来访方式
  getVisitType: () => {
    return http.post("/visit/getVisitType");
  },
  // 置业顾问列表
  getSalerList: (data: any) => {
    return http.post("/visit/getSalerList", data);
  },
  // 知晓途径数据
  getKnowWay: () => {
    return http.post("/visit/getKnowWay");
  },
  // 销售年报表
  getSaleYearReport: (data: any) => {
    return http.post("/sale/getSaleYearReport", data);
  },
  // 销售年报表-导出
  exportSaleYearReport: (data: any, filename: string = "销售年报表.xlsx") => {
    return http.exportFile(
      "/sale/getSaleYearReport",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },
  // 销售年报表(树)
  getSaleYearReportTree: (data: any) => {
    return http.post("/sale/getSaleYearReportTree", data);
  },
  // 销售年报表(树)-导出
  exportSaleYearReportTree: (
    data: any,
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
  getSaleDailyReport: (data: any) => {
    return http.post("/sale/getSaleDailyReport", data);
  },
  // 销售日报表-导出
  exportSaleDailyReport: (data: any, filename: string = "销售日报表.xlsx") => {
    return http.exportFile(
      "/sale/getSaleDailyReport",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },
  // 销售日报表(树)
  getSaleDailyReportTree: (data: any) => {
    return http.post("/sale/getSaleDailyReportTree", data);
  },
  // 销售日报表(树)-导出
  exportSaleDailyReportTree: (
    data: any,
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
  getSaleAsstListOrder: (data: any) => {
    return http.post("/sale/getSaleAsstListOrder", data);
  },
  // 认购业绩明细-导出
  exportSaleAsstListOrder: (
    data: any,
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
  getSaleAsstListSign: (data: any) => {
    return http.post("/sale/getSaleAsstListSign", data);
  },
  // 签约业绩明细-导出
  exportSaleAsstListSign: (
    data: any,
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
  getSaleAsstListPay: (data: any) => {
    return http.post("/sale/getSaleAsstListPay", data);
  },
  // 回款业绩明细-导出
  exportSaleAsstListPay: (
    data: any,
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
  getOrderNumMonthCount: (data: any) => {
    return http.post("/sale/getOrderNumMonthCount", data);
  },
  // 认购统计表（月度）-导出
  exportOrderNumMonthCount: (
    data: any,
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
  getOrderNumYearCount: (data: any) => {
    return http.post("/sale/getOrderNumYearCount", data);
  },
  // 认购统计表（年度）-导出
  exportOrderNumYearCount: (
    data: any,
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
  getOrderToSignPeriodProj: (data: any) => {
    return http.post("/sale/getOrderToSignPeriodProj", data);
  },
  // 认购转签约统计-导出
  exportOrderToSignPeriodProj: (
    data: any,
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
  getOrderToSignPeriodRoom: (data: any) => {
    return http.post("/sale/getOrderToSignPeriodRoom", data);
  },
  // 认购转签约明细-导出
  exportOrderToSignPeriodRoom: (
    data: any,
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
  getOrderNotSignInfoProj: (data: any) => {
    return http.post("/sale/getOrderNotSignInfoProj", data);
  },
  // 认购未签约统计-导出
  exportOrderNotSignInfoProj: (
    data: any,
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
  getOrderNotSignInfoRoom: (data: any) => {
    return http.post("/sale/getOrderNotSignInfoRoom", data);
  },
  // 认购未签约明细-导出
  exportOrderNotSignInfoRoom: (
    data: any,
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
  getPremiumCountProj: (data: any) => {
    return http.post("/sale/getPremiumCountProj", data);
  },
  // 溢价统计（项目）-导出
  exportPremiumCountProj: (data: any, filename: string = "溢价统计表.xlsx") => {
    return http.exportFile(
      "/sale/getPremiumCountProj",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },
  // 溢价明细（房间）
  getPremiumCountRoom: (data: any) => {
    return http.post("/sale/getPremiumCountRoom", data);
  },
  // 溢价明细（房间）-导出
  exportPremiumCountRoom: (data: any, filename: string = "溢价明细表.xlsx") => {
    return http.exportFile(
      "/sale/getPremiumCountRoom",
      data,
      filename || "数据列表.xlsx",
      "post",
    );
  },
  // 应收统计（项目汇总）
  getSaleOutStdFundsInfoYsProj: (data: any) => {
    return http.post("/sale/getSaleOutStdFundsInfoYsProj", data);
  },
  // 应收统计（项目汇总）-导出
  exportSaleOutStdFundsInfoYsProj: (
    data: any,
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
  getSaleOutStdFundsInfoYsRoom: (data: any) => {
    return http.post("/sale/getSaleOutStdFundsInfoYsRoom", data);
  },
  // 应收统计（房间明细）-导出
  exportSaleOutStdFundsInfoYsRoom: (
    data: any,
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
  getSaleOutStdFundsInfoYsAging: (data: any) => {
    return http.post("/sale/getSaleOutStdFundsInfoYsAging", data);
  },
  // 应收账龄明细（房间明细）-导出
  exportSaleOutStdFundsInfoYsAging: (
    data: any,
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
  getCheckOutInfoProj: (data: any) => {
    return http.post("/sale/getCheckOutInfoProj", data);
  },
  // 退房、挞定统计-项目-导出
  exportCheckOutInfoProj: (
    data: any,
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
  getCheckOutInfoRoom: (data: any) => {
    return http.post("/sale/getCheckOutInfoRoom", data);
  },
  // 退房、挞定明细-房间-导出
  exportCheckOutInfoRoom: (
    data: any,
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
  getSaleOutStdFundsInfoRoom: (data: any) => {
    return http.post("/sale/getSaleOutStdFundsInfoRoom", data);
  },
  // 逾期未回款明细-导出
  exportSaleOutStdFundsInfoRoom: (
    data: any,
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
