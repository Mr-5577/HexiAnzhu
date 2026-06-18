import { http } from "@/axios/service";

/**
 * 业务板块+组织类型 相关接口
 */
export const segmentApi = {
  /** 查询业务板块列表 */
  getSegmentList: () => {
    return http.formPost("/mainData/segment/getList");
  },
  /** 获取组织类型列表 */
  getDataTypeList: () => {
    return http.formPost("/mainData/getDataTypeList");
  },
};
