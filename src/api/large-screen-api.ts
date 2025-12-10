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
  // 获取销售业绩数据（近一年）
  getSaleYearInfo: (data: SaleParamsInterface) => {
    return http.post("/sale/getSaleYearInfo", data);
  },
};
