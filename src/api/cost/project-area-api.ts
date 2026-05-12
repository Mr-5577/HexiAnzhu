import { http } from "@/axios/service";
import {
  ProjectBuildingQueryParams,
  ProjectBuildingSaveParams,
  ProjectBuildingDeleteParams,
  ProjectAreaVersionQueryParams,
  ProjectAreaVersionSaveParams,
  ProjectAreaDetailQueryParams,
  ProjectAreaDetail,
} from "@/types/cost/project-area-type";

export const projectAreaApi = {
  // 查询项目楼栋列表
  getBuildingList: (data: ProjectBuildingQueryParams) => {
    return http.formPost("/mainData/building/getList", data);
  },
  // 新增项目楼栋
  addBuilding: (data: ProjectBuildingSaveParams) => {
    return http.post("/mainData/building/add", data);
  },
  // 修改项目楼栋
  editBuilding: (data: ProjectBuildingSaveParams) => {
    return http.post("/mainData/building/edit", data);
  },
  // 删除项目楼栋
  delBuilding: (data: ProjectBuildingDeleteParams) => {
    return http.formPost("/mainData/building/del", data);
  },

  // 获取版本类型列表
  getAreaVerList: () => {
    return http.post("/mainData/getAreaVerList");
  },
  // 查询面积版本主表列表
  getAreaVerMList: (data: ProjectAreaVersionQueryParams) => {
    return http.formPost("/mainData/areaVerM/getList", data);
  },
  // 新增面积版本主表
  addAreaVerM: (data: ProjectAreaVersionSaveParams) => {
    return http.post("/mainData/areaVerM/add", data);
  },
  // 修改面积版本主表
  editAreaVerM: (data: ProjectAreaVersionSaveParams) => {
    return http.post("/mainData/areaVerM/edit", data);
  },
  // 删除面积版本主表
  delAreaVerM: (data: ProjectBuildingDeleteParams) => {
    return http.formPost("/mainData/areaVerM/del", data);
  },
  // 设置面积版本生效
  setAreaVerMEnable: (id: number | string) => {
    return http.post(`/mainData/areaVerM/setEnable?id=${id}`);
  },

  // 获取楼栋面积明细网状结构
  getNetByBldId: (data: ProjectAreaDetailQueryParams) => {
    return http.formPost("/mainData/areaVerD/getNetByBldId", data);
  },
  // 批量保存面积明细网状结构
  batchSaveNet: (data: ProjectAreaDetail[]) => {
    return http.formPost("/mainData/areaVerD/saveNet", data);
  },
  // 查询面积版本明细列表
  getAreaVerDList: (data: ProjectAreaDetailQueryParams) => {
    return http.formPost("/mainData/areaVerD/getList", data);
  },
};
