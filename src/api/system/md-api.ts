import { http } from "@/axios/service";

// mdApi 对象
export const mdApi = {
  /**
   * 获取指定业态下的公司列表（包含项目列表）
   * @param data segId 业态ID
   */
  getSegCompanyList: (data: { segId: number }) => {
    return http.post("/mainData/company/getList", data);
  },
  getProjCompanyList: (data: { projId: number }) => {
    return http.post("/mainData/company/getList", data);
  },
};

// 如果需要其他 API，可以继续添加
export default mdApi;