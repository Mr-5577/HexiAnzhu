import { http } from "@/axios/service";
import {
  ContractSpecialFormData,
  SpecialInfo,
} from "@/types/cost/contract-manage/special-matter-type";

/**
 * 特殊事项 相关接口
 */
export const specialMatterApi = {
  /** 查询合同特殊事项列表 */
  getSpecialList: (data: { conId: number }) => {
    return http.formPost("/con/special/list", data);
  },
  /** 查询单个合同特殊事项 */
  getSpecialDetail: (data: { id: number }) => {
    return http.formPost("/con/special/get", data);
  },
  /** 新增合同特殊事项 */
  addSpecial: (data: ContractSpecialFormData) => {
    return http.post("/con/special/add", data);
  },
  /** 编辑合同特殊事项 */
  editSpecial: (data: SpecialInfo) => {
    return http.post("/con/special/edit", data);
  },
  /** 删除合同特殊事项 */
  delSpecial: (data: { id: number }) => {
    return http.formPost("/con/special/del", data);
  },
};
