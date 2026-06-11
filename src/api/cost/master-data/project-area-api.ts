import { http } from "@/axios/service";
import {
  ProjectBuildingQueryParams,
  ProjectBuildingSaveParams,
  ProjectBuildingDeleteParams,
  ProjectAreaVersionQueryParams,
  ProjectAreaVersionSaveParams,
  ProjectAreaDetailQueryParams,
  ProjectAreaDetail,
} from "@/types/cost/master-data/project-area-type";
/**
 * 项目面积
 */
export const projectAreaApi = {
  /** 获取公司-项目 树形结构 */
  getMguProjList: () => {
    return http.post("/mainData/project/getMguProjList");
  },

  /** 查询项目楼栋列表 */
  getBuildingList: (data: ProjectBuildingQueryParams) => {
    return http.formPost("/mainData/building/getList", data);
  },
  /** 新增项目楼栋 */
  addBuilding: (data: ProjectBuildingSaveParams) => {
    return http.post("/mainData/building/add", data);
  },
  /** 修改项目楼栋 */
  editBuilding: (data: ProjectBuildingSaveParams) => {
    return http.post("/mainData/building/edit", data);
  },
  /** 删除项目楼栋 */
  delBuilding: (data: ProjectBuildingDeleteParams) => {
    return http.formPost("/mainData/building/del", data);
  },

  /** 获取版本类型列表 */
  getAreaVerList: () => {
    return http.post("/mainData/getAreaVerList");
  },
  /** 查询面积版本主表列表 */
  getAreaVerMList: (data: ProjectAreaVersionQueryParams) => {
    return http.formPost("/mainData/areaVerM/getList", data);
  },
  /** 新增面积版本主表 */
  addAreaVerM: (data: ProjectAreaVersionSaveParams) => {
    return http.post("/mainData/areaVerM/add", data);
  },
  /** 修改面积版本主表 */
  editAreaVerM: (data: ProjectAreaVersionSaveParams) => {
    return http.post("/mainData/areaVerM/edit", data);
  },
  /** 删除面积版本主表 */
  delAreaVerM: (data: ProjectBuildingDeleteParams) => {
    return http.formPost("/mainData/areaVerM/del", data);
  },
  /** 设置面积版本生效 */
  setAreaVerMEnable: (data: { id: number | string }) => {
    return http.formPost(`/mainData/areaVerM/setEnable`, data);
  },

  /** 获取楼栋面积明细网状结构 */
  getNetByBldId: (data: ProjectAreaDetailQueryParams) => {
    return http.formPost("/mainData/areaVerD/getNetByBldId", data);
  },
  /** 批量保存面积明细网状结构 */
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
  /** 查询面积版本明细列表 */
  getAreaVerDList: (data: { verMid: number | string }) => {
    return http.formPost("/mainData/areaVerD/getList", data);
  },
};
