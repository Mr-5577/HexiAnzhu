import { http } from "@/axios/service";
import {
  ManageUnitFormData,
  ManageUnitQueryParams,
} from "@/types/cost/master-data/management-unit-type";

/**
 * 管理单元API
 */
export const manageunitApi = {
  /** 获取管理单元列表 */
  getManageunitList: (data?: ManageUnitQueryParams) => {
    return http.formPost("/mainData/manageunit/getList", data);
  },
  /** 新增管理单元 */
  addManageunit: (data: ManageUnitFormData) => {
    return http.post("/mainData/manageunit/add", data);
  },
  /** 修改管理单元 */
  editManageunit: (data: ManageUnitFormData) => {
    return http.post("/mainData/manageunit/edit", data);
  },
  /** 删除管理单元 */
  delManageunit: (data: { id: number }) => {
    return http.formPost("/mainData/manageunit/del", data);
  },

  /** 获取权限内公司列表 */
  getAuthMguList: () => {
    return http.post("/mainData/manageunit/getAuthMguList");
  },
  /** 获取板块-公司树形结构 */
  getSegMguList: () => {
    return http.post("/mainData/manageunit/getSegMguList");
  },
};
