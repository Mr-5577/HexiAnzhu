import { http } from "@/axios/service";
import {
  DictGroupSaveParams,
  DictGroupQueryParams,
  DictItemQueryParams,
  DictItemSaveParams,
  DictItemsByGroupCodeParams,
} from "@/types/cost/master-data/dict-type";

/**
 * 数据字典 API
 * @description 提供数据字典分组和字典项的增删改查功能
 * 字典分组（DicM）：字典的类别分组，如"性别"、"合同状态"等
 * 字典项（DicD）：具体的数据字典值，如"男"、"女"等
 */
export const dictionaryApi = {
  // ==================== 字典分组管理 ====================

  /**
   * 获取字典分组列表
   * @param data - 查询参数
   * @param data.id - 分组ID（精确查询）
   * @param data.groupCode - 分组编码（精确查询）
   * @param data.groupName - 分组名称（模糊查询）
   * @param data.isEnabled - 是否启用：false-禁用，true-启用
   * @returns Promise 字典分组列表
   */
  getDicMList: (data: DictGroupQueryParams) => {
    return http.formPost("/mainData/dicM/getList", data);
  },

  /**
   * 新增字典分组
   * @param data - 新增参数
   * @param data.groupName - 分组名称（必填）
   * @param data.groupCode - 分组编码（必填，全局唯一）
   * @param data.pid - 上级ID（支持树形分组结构）
   * @param data.groupDesc - 分组说明
   * @param data.isEnabled - 是否启用，默认 true
   * @returns Promise
   */
  addDictM: (data: DictGroupSaveParams) => {
    return http.post("/mainData/dicM/add", data);
  },

  /**
   * 修改字典分组
   * @param data - 修改参数
   * @param data.id - 分组ID（必填）
   * @param data.groupName - 分组名称（必填）
   * @param data.groupCode - 分组编码（必填）
   * @param data.pid - 上级ID
   * @param data.groupDesc - 分组说明
   * @param data.isEnabled - 是否启用
   * @returns Promise
   */
  editDictM: (data: DictGroupSaveParams) => {
    return http.post("/mainData/dicM/edit", data);
  },

  /**
   * 删除字典分组
   * @param data - 删除参数
   * @param data.id - 分组ID（必填）
   * @returns Promise
   * @description 注意：删除分组前请确保该分组下没有字典项或子分组
   */
  delDictM: (data: { id: number }) => {
    return http.formPost("/mainData/dicM/del", data);
  },

  // ==================== 字典项管理 ====================

  /**
   * 获取字典项列表
   * @param data - 查询参数
   * @param data.groupId - 字典组ID
   * @param data.id - 字典项ID（精确查询）
   * @param data.dicCode - 字典项编码（精确查询）
   * @param data.dicLabel - 字典项名称（模糊查询）
   * @param data.isEnabled - 是否启用：false-禁用，true-启用
   * @returns Promise 字典项列表
   */
  getDictDList: (data: DictItemQueryParams) => {
    return http.formPost("/mainData/dicD/getList", data);
  },

  /**
   * 新增字典项
   * @param data - 新增参数
   * @param data.groupId - 字典组ID（必填）
   * @param data.dicCode - 字典项编码（必填，组内唯一）
   * @param data.dicLabel - 字典项显示名称（必填）
   * @param data.dicValue - 字典项系统值（必填）
   * @param data.pid - 上级ID（支持树形字典项结构）
   * @param data.dicDesc - 字典项描述
   * @param data.sort - 排序号
   * @param data.isDefault - 是否默认，默认 false
   * @param data.isEnabled - 是否启用，默认 true
   * @returns Promise
   */
  addDictD: (data: DictItemSaveParams) => {
    return http.post("/mainData/dicD/add", data);
  },

  /**
   * 修改字典项
   * @param data - 修改参数
   * @param data.id - 字典项ID（必填）
   * @param data.groupId - 字典组ID（必填）
   * @param data.dicCode - 字典项编码（必填）
   * @param data.dicLabel - 字典项显示名称（必填）
   * @param data.dicValue - 字典项系统值（必填）
   * @param data.pid - 上级ID
   * @param data.dicDesc - 字典项描述
   * @param data.sort - 排序号
   * @param data.isDefault - 是否默认
   * @param data.isEnabled - 是否启用
   * @returns Promise
   */
  editDictD: (data: DictItemSaveParams) => {
    return http.post("/mainData/dicD/edit", data);
  },

  /**
   * 删除字典项
   * @param data - 删除参数
   * @param data.id - 字典项ID（必填）
   * @returns Promise
   * @description 注意：删除前请确保该字典项未被业务数据引用
   */
  delDictD: (data: { id: number }) => {
    return http.formPost("/mainData/dicD/del", data);
  },

  /**
   * 根据字典分组编码获取字典项列表
   * @param data - 查询参数
   * @param data.groupCode - 分组编码（必填）
   * @param data.onlyEnabled - 是否只返回启用的字典项，默认 true
   * @returns Promise 字典项列表
   */
  getDicItemByGroupCode: (data: DictItemsByGroupCodeParams) => {
    return http.formPost("/system/getDicItem", data);
  },

  /**
   * 查询业务板块列表
   * @returns Promise 业务板块列表
   * @description 获取系统配置的所有业务板块
   */
  getsegmentList: () => {
    return http.formPost("/mainData/segment/getList");
  },

  /**
   * 获取组织类型列表
   * @returns Promise 组织类型列表
   * @description 获取系统配置的所有组织类型
   */
  getDataTypeList: () => {
    return http.formPost("/mainData/getDataTypeList");
  },
};
