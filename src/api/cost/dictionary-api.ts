import { http } from "@/axios/service";
import {
  DictGroupSaveParams,
  DictGroupQueryParams,
  DictGroupDeleteParams,
  DictItemQueryParams,
  DictItemDeleteParams,
  DictItemSaveParams,
  DictItemsByGroupCodeParams,
} from "@/types/cost/dict-type";

export const dictionaryApi = {
  /** 获取字典组数据 */
  getDicMList: (data: DictGroupQueryParams) => {
    return http.formPost("/mainData/dicM/getList", data);
  },
  /** 新增字典组数据 */
  addDictM: (data: DictGroupSaveParams) => {
    return http.post("/mainData/dicM/add", data);
  },
  /** 修改字典组数据 */
  editDictM: (data: DictGroupSaveParams) => {
    return http.post("/mainData/dicM/edit", data);
  },
  /** 删除字典组数据 */
  delDictM: (data: DictGroupDeleteParams) => {
    return http.formPost("/mainData/dicM/del", data);
  },
  /** 获取字典项数据 */
  getDictDList: (data: DictItemQueryParams) => {
    return http.formPost("/mainData/dicD/getList", data);
  },
  /** 新增字典项数据 */
  addDictD: (data: DictItemSaveParams) => {
    return http.post("/mainData/dicD/add", data);
  },
  /** 修改字典项数据 */
  editDictD: (data: DictItemSaveParams) => {
    return http.post("/mainData/dicD/edit", data);
  },
  /** 删除字典项数据 */
  delDictD: (data: DictItemDeleteParams) => {
    return http.formPost("/mainData/dicD/del", data);
  },

  /** 根据字典组编码获取字典项列表 */
  getDicItemByGroupCode: (data: DictItemsByGroupCodeParams) => {
    return http.formPost("/system/getDicItem", data);
  },

  /** 查询业务板块列表 */
  getsegmentList: () => {
    return http.formPost("/mainData/segment/getList");
  },
};
