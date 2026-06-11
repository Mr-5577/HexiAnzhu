import { http } from "@/axios/service";
import {
  HCstProjectCostDAddEditParams,
  HCstProjectCostDQueryParams,
  HCstProjectCostMAddEditParams,
  HCstProjectCostMQueryParams,
} from "@/types/cost/cost-setting/goal-cost-type";

export const goalCostApi = {
  /** 查询目标成本版本 */
  getProjectCostMList: (data: HCstProjectCostMQueryParams) => {
    return http.formPost("/cost/projectCostM/getList", data);
  },
  /** 新增目标成本版本 */
  addProjectCostM: (data: HCstProjectCostMAddEditParams) => {
    return http.post("/cost/projectCostM/add", data);
  },
  /** 修改目标成本版本 */
  editProjectCostM: (data: HCstProjectCostMAddEditParams) => {
    return http.post("/cost/projectCostM/edit", data);
  },
  /** 删除目标成本版本 */
  delProjectCostM: (data: { id: number }) => {
    return http.formPost("/cost/projectCostM/del", data);
  },

  /** 查询目标成本明细 */
  getProjectCostDList: (data: HCstProjectCostDQueryParams) => {
    return http.formPost("/cost/projectCostD/getList", data);
  },
  /** 新增目标成本明细 */
  addProjectCostD: (data: HCstProjectCostDAddEditParams) => {
    return http.post("/cost/projectCostD/add", data);
  },
  /** 修改目标成本明细 */
  editProjectCostD: (data: HCstProjectCostDAddEditParams) => {
    return http.post("/cost/projectCostD/edit", data);
  },
  /** 删除目标成本明细 */
  delProjectCostD: (data: { id: number }) => {
    return http.formPost("/cost/projectCostD/del", data);
  },

  /** 批量保存目标成本明细 */
  batchSaveProjectCostD: (
    costMid: number,
    data: HCstProjectCostDAddEditParams[],
  ) => {
    return http.post(`/cost/projectCostD/batchSave?costMid=${costMid}`, data, {
      addQueryFast: false,
    });
  },
};
