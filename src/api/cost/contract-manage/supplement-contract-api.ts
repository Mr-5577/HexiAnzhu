import { http } from "@/axios/service";
import {
  SupplementContractRequest,
  SupplementProcessForm,
} from "@/types/cost/contract-manage/supplement-contract-type";

/**
 * 补充合同 相关接口
 */
export const supplementContractApi = {
  /** 查询补充合同列表 */
  getSupplementContractList: (data: {
    addName?: string;
    companyId?: number;
  }) => {
    return http.formPost("/con/add/list", data);
  },
  /** 查询单个补充合同 */
  getSupplementContractById: (id: number) => {
    debugger
    return http.post("/con/add/get?isWithFlow=true&id="+id);
  },
  /** 新增补充合同 */
  addSupplementContract: (data: SupplementContractRequest) => {
    return http.post("/con/add/save", data);
  },
  /** 修改补充合同 */
  editSupplementContract: (data: SupplementContractRequest) => {
    return http.post("/con/add/save", data);
  },
  /** 删除补充合同 */
  delSupplementContract: (id: number ) => {
    return http.post("/con/add/del?id="+ id);
  },
  /** 提交补充合同 */
  submitSupplementContract: (data: SupplementContractRequest) => {
    return http.post("/con/add/submit", data);
  },

  /** 作废合同 */
  voidSupplementContract: (id: number ) => {
    return http.post("/con/add/void?id="+ id);
  },

  /** 查询补充合同明细事项列表 */
  getAddProcessList: (data: { conBillId: number }) => {
    return http.formPost("/con/addProcess/list", data);
  },
  /** 新增补充合同明细事项 */
  addAddProcess: (data: SupplementProcessForm) => {
    return http.post("/con/addProcess/add", data);
  },
  /** 修改补充合同明细事项 */
  editAddProcess: (data: SupplementProcessForm) => {
    return http.post("/con/addProcess/edit", data);
  },
  /** 删除补充合同明细事项 */
  delAddProcess: (data: { id: number }) => {
    return http.formPost("/con/addProcess/del", data);
  },
};
