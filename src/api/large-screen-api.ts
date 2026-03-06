import { http } from "@/axios/service";
import { SaleParamsInterface } from "@/types/large-screen-type";

export const largeScreenApi = {
  // 获取销售业绩数据
  getSaleInfo: (data: SaleParamsInterface) => {
    return http.post("/sale/getSaleInfo", data);
  },
  // 获取溢价业绩数据
  getPremiumInfo: (data: SaleParamsInterface) => {
    return http.post("/sale/getPremiumInfo", data);
  },
  // 获取项目列表
  getProjList: () => {
    return http.post("/emp/getProjList");
  },
  // 获取项目列表(树)
  getProjTree: () => {
    return http.post("/emp/getProjTree");
  },
  // 获取销售业绩数据（项目月度）
  getSaleProjInfo: (data: SaleParamsInterface) => {
    return http.post("/sale/getSaleProjInfo", data);
  },
  // 获取销售业绩数据（个人月度）
  getSaleProjSalerInfo: (data: SaleParamsInterface) => {
    return http.post("/sale/getSaleProjSalerInfo", data);
  },
  // 导出-置业顾问排名
  exportSaleProjSalerInfo: (
    data: any,
    filename: string = "置业顾问排名.xlsx"
  ) => {
    return http.exportFile(
      "/sale/getSaleProjSalerInfo",
      data,
      filename || "数据列表.xlsx",
      "post"
    );
  },
  // 获取销售业绩数据（近一年）
  getSaleYearInfo: (data: SaleParamsInterface) => {
    return http.post("/sale/getSaleYearInfo", data);
  },
  // 获取销售业绩数据（近三十天）
  getCustomerCome30Day: (data: SaleParamsInterface) => {
    return http.post("/sale/getCustomerCome30Day", data);
  },
  // 获取库存数据
  getRoomStockInfo: (data: SaleParamsInterface) => {
    return http.post("/sale/getRoomStockInfo", data);
  },
  // 获取库存结构数据
  getRoomStockGroupInfo: (data: SaleParamsInterface) => {
    return http.post("/sale/getRoomStockGroupInfo", data);
  },
  // 获取销售总览
  getSaleGeneralInfo: (data: SaleParamsInterface) => {
    return http.post("/sale/getSaleGeneralInfo", data);
  },
  // 获取来访数据
  getCustomerComeInfo: (data: SaleParamsInterface) => {
    return http.post("/sale/getCustomerComeInfo", data);
  },
};
