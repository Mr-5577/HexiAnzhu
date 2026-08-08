import { http } from "@/axios/service";
import {
  ContractVisaFormData,
  ContractVisaFormEdit,
} from "@/types/cost/contract-manage/visa-management-type";

/**
 * 签证管理 相关接口
 */
export const visaManagementApi = {
  /** 查询签证管理列表 */
  getVisaList: (data: { visaName?:string,conId: number ,isNoUsed?: boolean}) => {
    return http.formPost("/con/visa/list", data);
  },
  /** 查询单个签证管理 */
  getVisaDetail: (data: { id: number ,isWithFlow?:boolean}) => {
    return http.formPost("/con/visa/get", data);
  },
  /** 新增签证管理 */
  addVisa: (data: ContractVisaFormData) => {
    return http.post("/con/visa/save", data);
  },
  /** 编辑签证管理 */
  editVisa: (data: any) => {
    return http.post("/con/visa/save", data);
  },
  /** 删除签证管理 */
  delVisa: (data: { id: number }) => {
    return http.formPost("/con/visa/del", data);
  },
  /** 提交签证单 */
  submitVisa: (data: any) => {
    return http.post("/con/visa/submit", data);
  },
  /** 作废签证单 */
  voidVisa: (data: { id: number }) => {
    return http.formPost("/con/change/void", data);
  },
};
