import { http } from "@/axios/service";

/**
 * 产值申报 相关接口
 */
export const outputDeclarationApi = {
  /** 查询合同产值列表 */
  getProdValList: (data: { conId: number }) => {
    return http.formPost("/con/prodVal/list", data);
  },
  /** 查询单个合同产值 */
  getProdValById: (data: { id: number }) => {
    return http.formPost("/con/prodVal/get", data);
  },
  /** 保存合同产值（新增/修改） */
  saveProdVal: (data: any) => {
    return http.post("/con/prodVal/save", data);
  },
  /** 保存并提交合同产值审批 */
  submitProdVal: (data: any) => {
    return http.post("/con/prodVal/submit", data);
  },
  /** 删除合同产值 */
  delProdVal: (data: { id: number }) => {
    return http.formPost("/con/prodVal/del", data);
  },
  /** 作废合同产值 */
  voidProdVal: (data: { id: number }) => {
    return http.formPost("/con/prodVal/void", data);
  },
};
