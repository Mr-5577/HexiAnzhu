import { http } from "@/axios/service";
import { NconPaymentSaveParam } from "@/types/cost/non-contract-manage/cst-payment-type";

/**
 * 非合同 建安支付 相关接口
 */
export const cstPaymentApi = {
  // ============================ 建安支付 ============================
  /**
   * @name 获取非合同建安支付列表
   * @param params.projId 项目id
   * @returns
   */
  getCstPaymentList: (params?: { projId?: number }) => {
    return http.get("/ncon/cstPayment/list", params);
  },
  /**
   * @name 查询单个非合同建安支付
   * @param params.id 非合同建安支付id
   * @param params.isWithBill 是否关联查询单据
   */
  getCstPaymentDetail: (params: { id: number,isWithBill?:boolean }) => {
    return http.get("/ncon/cstPayment/get", params);
  },
  // 新增非合同建安支付
  addCstPayment: (data: NconPaymentSaveParam) => {
    return http.post("/ncon/cstPayment/add", data);
  },
  // 编辑非合同建安支付
  editCstPayment: (data: NconPaymentSaveParam) => {
    return http.post("/ncon/cstPayment/edit", data);
  },
  // 保存非合同建安支付
  saveCstPayment: (data: any) => {
    return http.post("/ncon/cstPayment/save", data);
  },
  // 提交非合同建安支付
  submitCstPayment: (data: any) => {
    return http.post("/ncon/cstPayment/submit", data);
  },
  /**
   * @name 删除非合同建安支付
   * @param data.id 非合同建安支付id
   * @returns
   */
  delCstPayment: (data: { id: number }) => {
    return http.formPost("/ncon/cstPayment/del", data);
  },
    /**
   * @name 作废非合同建安支付
   * @param data.id 非合同建安支付id
   */
  voidCstPayment: (data: { id: number }) => {
    return http.formPost("/ncon/cstPayment/void", data);
  },
  /**
   * @name 发起非合同建安支付审批流程
   * @param data.id 非合同建安支付id
   * @returns
   */
  createNconCstPaymentFlow: (data: { id: number }) => {
    return http.formPost("/ncon/flow/createNconCstPaymentFlow", data);
  },
  /**
   * @name 通过事项ID查询累计数
   * @param data.id 非合同事项id
   * @returns
   */
  getAccumByProcessId: (params: { processId: number }) => {
    return http.get("/ncon/cstPayment/getAccum", params);
  },
};
