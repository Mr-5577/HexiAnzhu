import { http } from "@/axios/service";
import {
  ContractChangeDetailFormData,
  ContractChangeFormData,
} from "@/types/cost/contract-manage/change-order";

/**
 * 变更指令 相关接口
 */
export const changeOrderApi = {
  /** 查询合同变更明细列表 */
  getChangeConlistList: (data: { conId: number; changeId?: number }) => {
    return http.formPost("/con/changeConlist/list", data);
  },
  /** 查询单个合同变更明细 id：变更明细ID */
  getChangeConlistDetail: (data: { id: number }) => {
    return http.formPost("/con/changeConlist/get", data);
  },
  /** 新增合同变更明细 */
  addChangeConlist: (data: ContractChangeDetailFormData) => {
    return http.post("/con/changeConlist/add", data);
  },
  /** 修改合同变更明细 */
  editChangeConlist: (data: ContractChangeDetailFormData) => {
    return http.post("/con/changeConlist/edit", data);
  },
  /** 删除合同变更明细 id：变更明细ID */
  delChangeConlist: (data: { id: number }) => {
    return http.formPost("/con/changeConlist/del", data);
  },
  /** 作废合同变更明细 id：变更明细ID */
  voidChangeConlist: (data: { id: number }) => {
    return http.formPost("/con/change/void", data);
  },

  /** 查询合同变更列表 */
  getChangeConList: (data: { changeName?:string,changeType?:number,conId: number ,isNoUsed ?: boolean}) => {
    return http.formPost("/con/change/list", data);
  },
  /** 查询单个合同变更 id：变更ID */
  getChangeConDetail: (data: { id: number,isWithFlow? : boolean }) => {
    return http.formPost("/con/change/get", data);
  },
  /** 新增合同变更（含明细） */
  addChangeCon: (data: ContractChangeFormData) => {
    return http.post("/con/change/save", data);
  },
  /** 修改合同变更（含明细） */
  editChangeCon: (data: ContractChangeFormData) => {
    return http.post("/con/change/save", data);
  },
  /** 删除合同变更 id：变更ID */
  delChangeCon: (data: { id: number }) => {
    return http.formPost("/con/change/del", data);
  },
  /** 提交合同变更 */
  submitChangeCon: (data:ContractChangeFormData) => {
    return http.post("/con/change/submit", data);
  },
};
