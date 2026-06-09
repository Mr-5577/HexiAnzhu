import { http } from "@/axios/service";

/**
 * 补充合同 相关接口
 */
export const supplementContractApi = {
  /** 查询补充合同列表 */
  getSupplementContractList: (data: any) => {
    return http.formPost("/con/add/list", data);
  },
  /** 查询单个补充合同 */
  getSupplementContractById: (data: { id: number }) => {
    return http.formPost("/con/add/get", data);
  },
  /** 新增补充合同 */
  addSupplementContract: (data: any) => {
    return http.post("/con/add/add", data);
  },
  /** 修改补充合同 */
  editSupplementContract: (data: any) => {
    return http.post("/con/add/edit", data);
  },
  /** 删除补充合同 */
  delSupplementContract: (data: { id: number }) => {
    return http.formPost("/con/add/del", data);
  },

  /** 查询补充合同明细事项列表 */
  getAddProcessList: (data: { conBillId: number }) => {
    return http.formPost("/con/addProcess/list", data);
  },
  /** 新增补充合同明细事项 */
  addAddProcess: (data: any) => {
    return http.post("/con/addProcess/add", data);
  },
  /** 修改补充合同明细事项 */
  editAddProcess: (data: any) => {
    return http.post("/con/addProcess/edit", data);
  },
  /** 删除补充合同明细事项 */
  delAddProcess: (data: { id: number }) => {
    return http.formPost("/con/addProcess/del", data);
  },
};
