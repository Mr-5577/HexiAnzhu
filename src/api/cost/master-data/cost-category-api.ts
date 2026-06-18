import { http } from "@/axios/service";
import {
  CostCategoryBaseQueryParams,
  CostCategoryBaseSaveParams,
  CostCategoryProjQueryParams,
  CostCategoryProjSaveParams,
} from "@/types/cost/master-data/cost-category-type";
/**
 * 成本科目API
 */
export const costCategoryApi = {
  /** 查询基准成本科目列表 */
  getCostSubjectBaseList: (data: CostCategoryBaseQueryParams) => {
    return http.formPost("/mainData/costSubjectBase/getList", data);
  },
  /** 新增基础成本科目 */
  addCostSubjectBase: (data: CostCategoryBaseSaveParams) => {
    return http.post("/mainData/costSubjectBase/add", data);
  },
  /** 修改基准成本科目 */
  editCostSubjectBase: (data: CostCategoryBaseSaveParams) => {
    return http.post("/mainData/costSubjectBase/edit", data);
  },
  /** 删除基准成本科目 */
  delCostSubjectBase: (data: { id: number }) => {
    return http.formPost("/mainData/costSubjectBase/del", data);
  },

  /** 查询项目成本科目列表 */
  getCostSubjectProjList: (data: CostCategoryProjQueryParams) => {
    return http.formPost("/mainData/costSubjectProj/getList", data);
  },
  /** 添加项目成本科目 */
  addCostSubjectProj: (data: CostCategoryProjSaveParams) => {
    return http.post(`/mainData/costSubjectProj/add`, data);
  },
  /** 删除项目成本科目 */
  delCostSubjectProj: (data: { id: number }) => {
    return http.formPost("/mainData/costSubjectProj/del", data, {
      addQueryFast: false,
    });
  },
};
