import { http } from "@/axios/service";
import {
  CostCategoryBaseQueryParams,
  CostCategoryBaseSaveParams,
  CostCategoryProjQueryParams,
  CostCategoryProjSaveParams,
} from "@/types/cost/master-data/cost-category-type";

/**
 * 成本科目 API
 * @description 提供基准成本科目和项目成本科目的增删改查功能
 * 基准成本科目：系统级统一维护的成本科目模板
 * 项目成本科目：项目关联基准成本科目的具体应用
 */
export const costCategoryApi = {
  // ==================== 基准成本科目 ====================
  /**
   * 查询基准成本科目列表
   * @param data - 查询参数
   * @param data.subName - 成本科目名称（模糊查询）
   * @param data.subCode - 成本科目编号（模糊查询）
   * @returns Promise 基准成本科目列表
   */
  getCostSubjectBaseList: (data: CostCategoryBaseQueryParams) => {
    return http.formPost("/mainData/costSubjectBase/getList", data);
  },

  /**
   * 新增基准成本科目
   * @param data - 新增参数
   * @param data.pid - 父级ID（必填，根节点传 0）
   * @param data.subCode - 成本科目编号（必填）
   * @param data.subName - 成本科目名称（必填）
   * @param data.subLevel - 成本科目层级（必填）
   * @param data.ctrlMode - 控制模式（必填）
   * @param data.remark - 成本科目说明
   * @param data.isEnabled - 是否启用，默认 true
   * @param data.sort - 排序号
   * @returns Promise
   */
  addCostSubjectBase: (data: CostCategoryBaseSaveParams) => {
    return http.post("/mainData/costSubjectBase/add", data);
  },

  /**
   * 修改基准成本科目
   * @param data - 修改参数
   * @param data.id - 主键ID（必填）
   * @param data.pid - 父级ID（必填）
   * @param data.subCode - 成本科目编号（必填）
   * @param data.subName - 成本科目名称（必填）
   * @param data.subLevel - 成本科目层级（必填）
   * @param data.ctrlMode - 控制模式（必填）
   * @param data.remark - 成本科目说明
   * @param data.isEnabled - 是否启用
   * @param data.sort - 排序号
   * @returns Promise
   */
  editCostSubjectBase: (data: CostCategoryBaseSaveParams) => {
    return http.post("/mainData/costSubjectBase/edit", data);
  },

  /**
   * 删除基准成本科目
   * @param data - 删除参数
   * @param data.id - 主键ID（必填）
   * @returns Promise
   * @description 注意：删除前请确保该科目未被项目引用
   */
  delCostSubjectBase: (data: { id: number }) => {
    return http.formPost("/mainData/costSubjectBase/del", data);
  },

  // ==================== 项目成本科目 ====================

  /**
   * 查询项目成本科目列表
   * @param data - 查询参数
   * @param data.projId - 项目ID（必填）
   * @param data.withDetail - 是否包含产品类型详情，默认 false
   * @returns Promise 项目成本科目列表
   */
  getCostSubjectProjList: (data: CostCategoryProjQueryParams) => {
    return http.formPost("/mainData/costSubjectProj/getList", data);
  },

  /**
   * 新增项目成本科目
   * @param data - 新增参数
   * @param data.projId - 项目ID（必填）
   * @param data.subId - 基础成本科目ID（必填）
   * @param data.segId - 业务板块ID（必填）
   * @param data.remark - 说明
   * @returns Promise
   * @description 将基准成本科目关联到具体项目，形成项目成本科目
   */
  addCostSubjectProj: (data: CostCategoryProjSaveParams) => {
    return http.post(`/mainData/costSubjectProj/add`, data);
  },

  /**
   * 删除项目成本科目
   * @param data - 删除参数
   * @param data.id - 主键ID（必填）
   * @returns Promise
   * @description 解除项目与基准成本科目的关联关系
   */
  delCostSubjectProj: (data: { id: number }) => {
    return http.formPost("/mainData/costSubjectProj/del", data, {
      addQueryFast: false,
    });
  },
};
