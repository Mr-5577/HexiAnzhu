import { http } from "@/axios/service";
import {
  HCstProjectCostDAddEditParams,
  HCstProjectCostDQueryParams,
  HCstProjectCostMAddEditParams,
  HCstProjectCostMQueryParams,
} from "@/types/cost/cost-setting/goal-cost-type";

/**
 * 目标成本 API
 * @description 提供目标成本版本和明细的增删改查功能
 */
export const goalCostApi = {
  // ==================== 目标成本版本管理 ====================
  /**
   * 查询目标成本版本列表
   * @param data - 查询参数
   * @param data.id - 主键ID（精确查询）
   * @param data.segId - 业务板块ID
   * @param data.projId - 项目ID
   * @param data.versionNo - 版本号（模糊查询）
   * @param data.versionType - 版本类型：投资版/考核版/执行版
   * @param data.isEnabled - 是否当前使用版本：false-否，true-是
   * @returns Promise 目标成本版本列表
   */
  getProjectCostMList: (data: HCstProjectCostMQueryParams) => {
    return http.formPost("/cost/projectCostM/getList", data);
  },
  /**
   * 查询目标成本详情
   * @param data - 查询参数
   * @param data.id - 目标成本ID
   * @param data.projId - 项目ID
   */
  getProjectCostM: (data: { id?: number; projId?: number }) => {
    return http.formPost("/cost/projectCostM/get", data);
  },

  /**
   * 新增目标成本版本
   * @param data - 新增参数
   * @param data.projId - 项目ID（必填）
   * @param data.segId - 业务板块ID（必填）
   * @param data.versionType - 版本类型（必填）：投资版/考核版/执行版
   * @param data.costAmt - 目标成本总额含税（必填）
   * @param data.costExclAmt - 目标成本总额不含税（必填）
   * @param data.areaVerMid - 主数据面积版本ID（必填）
   * @param data.isEnabled - 是否当前使用版本（必填）
   * @param data.versionNo - 版本号（系统自动生成时可不传）
   * @param data.costDynAmt - 动态成本总额含税
   * @param data.costDynExclAmt - 动态成本总额不含税
   * @param data.flowId - 审批流程ID
   * @param data.remark - 备注
   * @returns Promise
   */
  addProjectCostM: (data: HCstProjectCostMAddEditParams) => {
    return http.post("/cost/projectCostM/add", data);
  },

  /**
   * 修改目标成本版本
   * @param data - 修改参数
   * @param data.id - 主键ID（必填）
   * @param data.projId - 项目ID（必填）
   * @param data.segId - 业务板块ID（必填）
   * @param data.versionType - 版本类型（必填）
   * @param data.costAmt - 目标成本总额含税（必填）
   * @param data.costExclAmt - 目标成本总额不含税（必填）
   * @param data.areaVerMid - 主数据面积版本ID（必填）
   * @param data.isEnabled - 是否当前使用版本（必填）
   * @param data.versionNo - 版本号
   * @param data.costDynAmt - 动态成本总额含税
   * @param data.costDynExclAmt - 动态成本总额不含税
   * @param data.flowId - 审批流程ID
   * @param data.remark - 备注
   * @returns Promise
   */
  editProjectCostM: (data: HCstProjectCostMAddEditParams) => {
    return http.post("/cost/projectCostM/edit", data);
  },

  /**
   * 删除目标成本版本
   * @param data - 删除参数
   * @param data.id - 主键ID（必填）
   * @returns Promise
   */
  delProjectCostM: (data: { id: number }) => {
    return http.formPost("/cost/projectCostM/del", data);
  },

  // ==================== 目标成本明细管理 ====================

  /**
   * 查询目标成本明细列表
   * @param data - 查询参数
   * @param data.costMid - 目标成本版本ID
   * @param data.projId - 项目ID
   * @param data.subId - 科目ID
   * @param data.prodId - 业态ID
   * @returns Promise 目标成本明细列表
   */
  getProjectCostDList: (data: HCstProjectCostDQueryParams) => {
    return http.formPost("/cost/projectCostD/getList", data);
  },

  /**
   * 新增目标成本明细
   * @param data - 新增参数
   * @param data.costMid - 目标成本ID（必填）
   * @param data.subId - 科目ID（必填）
   * @param data.prodId - 业态ID（必填）
   * @param data.costAmt - 目标成本总额含税（必填）
   * @param data.costExclAmt - 目标成本总额不含税（必填）
   * @param data.busiSegId - 业务归属ID：1-地产，2-建筑
   * @param data.allocRule - 分摊规则
   * @returns Promise
   */
  addProjectCostD: (data: HCstProjectCostDAddEditParams) => {
    return http.post("/cost/projectCostD/add", data);
  },

  /**
   * 修改目标成本明细
   * @param data - 修改参数
   * @param data.id - 主键ID（必填）
   * @param data.subId - 科目ID（必填）
   * @param data.prodId - 业态ID（必填）
   * @param data.costAmt - 目标成本总额含税（必填）
   * @param data.costExclAmt - 目标成本总额不含税（必填）
   * @param data.busiSegId - 业务归属ID
   * @param data.allocRule - 分摊规则
   * @returns Promise
   */
  editProjectCostD: (data: HCstProjectCostDAddEditParams) => {
    return http.post("/cost/projectCostD/edit", data);
  },

  /**
   * 删除目标成本明细
   * @param data - 删除参数
   * @param data.id - 主键ID（必填）
   * @returns Promise
   */
  delProjectCostD: (data: { id: number }) => {
    return http.formPost("/cost/projectCostD/del", data);
  },

  /**
   * 批量保存目标成本明细
   * @param costMid - 目标成本版本ID（必填）
   * @param data - 目标成本明细列表
   * @returns Promise
   */
  batchSaveProjectCostD: (
    costMid: number,
    data: HCstProjectCostDAddEditParams[],
  ) => {
    return http.post(`/cost/projectCostD/batchSave?costMid=${costMid}`, data, {
      addQueryFast: false,
    });
  },

  /**
   * @name 保存目标成本明细
   * @param data - 目标成本明细列表
   * @param data.costM - 目标成本
   * @param data.costDList - 明细列表
   * @param data.annexList - 附件列表
   */
  saveProjectCostD: (data: any) => {
    return http.post("/cost/projectCostD/save", data);
  },

  /**
   * @name 发起/更新目标成本审批流程
   * @param data - 流程参数
   * @param data.costMId - 目标成本版本ID（必填）
   */
  saveCostMFlow: (data: { costMId: number }) => {
    return http.formPost("/cost/bill/saveFlow", data);
  },
  /**
   * @name 作废目标成本
   * @param data - 流程参数
   * @param data.id - 目标成本版本ID（必填）
   */
  voidProjectCostM: (data: { id: number }) => {
    return http.formPost("/cost/projectCostM/void", data);
  },
  /**
   * @name 查询目标成本单据详情
   * @param data - 查询参数
   * @param data.costMId - 目标成本版本ID（必填）
   */
  getCostBillInfo: (params: { costMId: number }) => {
    return http.get("/cost/bill/getInfo", params);
  },
  /**
   * @name 查询上一版目标成本版本明细
   * @param data - 查询参数
   * @param data.costMid - 目标成本版本ID（必填）
   */
  getCostPrevList: (data: { costMid: number }) => {
    return http.post("/cost/projectCostD/getPrevList", data);
  },
};
