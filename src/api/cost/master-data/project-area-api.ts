import { http } from "@/axios/service";
import {
  ProjectBuildingQueryParams,
  ProjectBuildingSaveParams,
  ProjectAreaVersionQueryParams,
  ProjectAreaVersionSaveParams,
  ProjectAreaDetailQueryParams,
  ProjectAreaDetail,
} from "@/types/cost/master-data/project-area-type";

/**
 * 项目面积 API
 * @description 提供项目楼栋、面积版本及面积明细的增删改查功能
 */
export const projectAreaApi = {
  /**
   * 获取公司-项目树形结构
   * @returns Promise 公司-项目的树形层级结构
   */
  getMguProjList: () => {
    return http.post("/mainData/project/getMguProjList");
  },
  /**
   * 获取板块-公司-项目列表树形结构
   * @returns Promise 板块-公司-项目的树形层级结构
   */
  getSegMguProjList: () => {
    return http.post("/mainData/project/getSegMguProjList");
  },
  /**
   * 通过项目查询项目所属信息
   * @param data - 查询参数
   * @param data.id - 项目ID（必填）
   */
  getInfoByProjId: (data: { id: number }) => {
    return http.formPost("/mainData/project/getList", data);
  },

  /**
   * 查询项目楼栋列表
   * @param data - 查询参数
   * @param data.projId - 项目ID（必填）
   * @param data.bldName - 楼栋名称
   * @param data.isUnderGround - 是否地下室：false-否，true-是
   * @returns Promise 楼栋列表
   */
  getBuildingList: (data: ProjectBuildingQueryParams) => {
    return http.formPost("/mainData/building/getList", data);
  },

  /**
   * 新增项目楼栋
   * @param data - 新增参数
   * @param data.projId - 项目ID（必填）
   * @param data.bldName - 楼栋名称（必填）
   * @param data.isUnderGround - 是否地下室，默认 false
   * @returns Promise
   */
  addBuilding: (data: ProjectBuildingSaveParams) => {
    return http.post("/mainData/building/add", data);
  },

  /**
   * 修改项目楼栋
   * @param data - 修改参数
   * @param data.id - 主键ID（必填）
   * @param data.projId - 项目ID（必填）
   * @param data.bldName - 楼栋名称（必填）
   * @param data.isUnderGround - 是否地下室
   * @returns Promise
   */
  editBuilding: (data: ProjectBuildingSaveParams) => {
    return http.post("/mainData/building/edit", data);
  },

  /**
   * 删除项目楼栋
   * @param data - 删除参数
   * @param data.id - 楼栋ID（必填）
   * @returns Promise
   */
  delBuilding: (data: { id: number }) => {
    return http.formPost("/mainData/building/del", data);
  },

  /**
   * 获取面积版本类型列表
   * @returns Promise 版本类型选项列表
   */
  getAreaVerList: () => {
    return http.post("/mainData/getAreaVerList");
  },

  /**
   * 查询面积版本主表列表
   * @param data - 查询参数
   * @param data.projId - 项目ID
   * @param data.verTypeId - 版本类型ID
   * @param data.verTitle - 版本标题（模糊查询）
   * @param data.isEnabled - 是否当前生效版本：false-否，true-是
   * @returns Promise 面积版本主表列表
   */
  getAreaVerMList: (data: ProjectAreaVersionQueryParams) => {
    return http.formPost("/mainData/areaVerM/getList", data);
  },

  /**
   * 新增面积版本主表
   * @param data - 新增参数
   * @param data.projId - 项目ID（必填）
   * @param data.verTitle - 版本标题（必填）
   * @param data.verTypeId - 版本类型ID
   * @param data.isEnabled - 是否当前生效版本，默认 false
   * @param data.remark - 版本说明
   * @returns Promise
   */
  addAreaVerM: (data: ProjectAreaVersionSaveParams) => {
    return http.post("/mainData/areaVerM/add", data);
  },

  /**
   * 修改面积版本主表
   * @param data - 修改参数
   * @param data.id - 主键ID（必填）
   * @param data.verTitle - 版本标题（必填）
   * @param data.verTypeId - 版本类型ID
   * @param data.isEnabled - 是否当前生效版本
   * @param data.remark - 版本说明
   * @returns Promise
   */
  editAreaVerM: (data: ProjectAreaVersionSaveParams) => {
    return http.post("/mainData/areaVerM/edit", data);
  },

  /**
   * 删除面积版本主表
   * @param data - 删除参数
   * @param data.id - 版本ID（必填）
   * @returns Promise
   */
  delAreaVerM: (data: { id: number }) => {
    return http.formPost("/mainData/areaVerM/del", data);
  },

  /**
   * 设置面积版本生效
   * @param data - 请求参数
   * @param data.id - 版本ID（必填）
   * @returns Promise
   * @description 将指定版本设置为当前生效版本，同一项目下只有一个版本可以生效
   */
  setAreaVerMEnable: (data: { id: number | string }) => {
    return http.formPost(`/mainData/areaVerM/setEnable`, data);
  },

  /**
   * 获取楼栋面积明细网状结构
   * @param data - 查询参数
   * @param data.bldId - 楼栋ID
   * @param data.prodId - 产品类型ID
   * @param data.verMid - 版本ID
   * @returns Promise 面积明细网状结构数据
   */
  getNetByBldId: (data: ProjectAreaDetailQueryParams) => {
    return http.formPost("/mainData/areaVerD/getNetByBldId", data);
  },

  /**
   * 批量保存面积明细网状结构
   * @param data - 面积明细列表
   * @param bldId - 楼栋ID
   * @param verMid - 版本ID
   * @returns Promise
   */
  batchSaveNet: (
    data: ProjectAreaDetail[], // 列表数据
    bldId: number | string, // 楼栋ID
    verMid: number | string, // 版本ID
  ) => {
    return http.post(
      `/mainData/areaVerD/saveNet?bldId=${bldId}&verMid=${verMid}`,
      data,
      { addQueryFast: false },
    );
  },

  /**
   * 查询面积版本明细列表
   * @param data - 查询参数
   * @param data.verMid - 版本ID（必填）
   * @returns Promise 面积版本明细列表
   * @description 查询指定版本下的所有面积明细数据
   */
  getAreaVerDList: (data: { verMid: number | string }) => {
    return http.formPost("/mainData/areaVerD/getList", data);
  },
  /**
   * 获取上一版面积版本明细
   * @param data - 查询参数
   * @param data.verMid - 版本ID（必填）
   */
  getPrevListByVerMid: (data: { verMid: number | string }) => {
    return http.formPost("/mainData/areaVerD/getPrevList", data);
  },
};
