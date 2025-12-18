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
  getRoomStockGroupProjExcel: (
    data: StatisticsInterface,
    filename?: string
  ) => {
    return http.exportFile(
      "/sale/getRoomStockGroupProjExcel",
      data,
      filename || "数据列表.xlsx",
      "post"
    );
  },
  // 获取库存明细
  getRoomStockList: (data: StatisticsInterface) => {
    return http.post("/sale/getRoomStockList", data);
  },
  // 来访统计-按天
  getCustomerComeMonthCount: (data: any) => {
    return http.post("/sale/getCustomerComeMonthCount", data);
  },
  // 来访统计-按月
  getCustomerComeYearCount: (data: any) => {
    return http.post("/sale/getCustomerComeYearCount", data);
  },
  // 来访渠道统计
  getComePathWayProjCount: (data: any) => {
    return http.post("/sale/getComePathWayProjCount", data);
  },
  // 成交渠道统计
  getOrderPathWayProjCount: (data: any) => {
    return http.post("/sale/getOrderPathWayProjCount", data);
  },
  // 获取来访数量（项目）== 转化率统计
  getCustomerComeZhl: (data: any) => {
    return http.post("/sale/getCustomerComeZhl", data);
  },
  // 销售日报表
  getSaleDailyReport: (data: any) => {
    return http.post("/sale/getSaleDailyReport", data);
  },
  // 销售年报表
  getSaleYearReport: (data: any) => {
    return http.post("/sale/getSaleYearReport", data);
  },
  // 认购统计表（月度）
  getOrderNumMonthCount: (data: any) => {
    return http.post("/sale/getOrderNumMonthCount", data);
  },
  // 认购统计表（年度）
  getOrderNumYearCount: (data: any) => {
    return http.post("/sale/getOrderNumYearCount", data);
  },
  // 认购转签约统计
  getOrderToSignPeriodProj: (data: any) => {
    return http.post("/sale/getOrderToSignPeriodProj", data);
  },
  // 认购转签约明细
  getOrderToSignPeriodRoom: (data: any) => {
    return http.post("/sale/getOrderToSignPeriodRoom", data);
  },
  // 认购未签约统计
  getOrderNotSignInfoProj: (data: any) => {
    return http.post("/sale/getOrderNotSignInfoProj", data);
  },
  // 认购未签约明细
  getOrderNotSignInfoRoom: (data: any) => {
    return http.post("/sale/getOrderNotSignInfoRoom", data);
  },
  // 溢价统计（项目）
  getPremiumCountProj: (data: any) => {
    return http.post("/sale/getPremiumCountProj", data);
  },
  // 溢价明细（房间）
  getPremiumCountRoom: (data: any) => {
    return http.post("/sale/getPremiumCountRoom", data);
  },
  // 退房、挞定统计-项目
  getCheckOutInfoProj: (data: any) => {
    return http.post("/sale/getCheckOutInfoProj", data);
  },
  // 退房、挞定明细-房间
  getCheckOutInfoRoom: (data: any) => {
    return http.post("/sale/getCheckOutInfoRoom", data);
  },
};
