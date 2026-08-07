import { http } from "@/axios/service";
import { NconFeePaymentSaveParam } from "@/types/cost/non-contract-manage/fee-payment-type";

/**
 * 非合同 费用支付 相关接口
 */
export const feePaymentApi = {
  /**
   * @name 获取非合同费用支付列表
   * @param params.projId 项目id
   * @returns
   */
  getFeePaymentList: (params?: { projId?: number }) => {
    return http.get("/ncon/feePayment/list", params);
  },
  /**
   * @name 查询单个非合同费用支付
   * @param params.id 费用支付id
   * @returns
   */
  geFeePaymentDetail: (params: { id: number; isWithFlow?: boolean }) => {
    return http.get("/ncon/feePayment/get", params);
  },
  // 新增非合同费用支付
  addFeePayment: (data: NconFeePaymentSaveParam) => {
    return http.post("/ncon/feePayment/add", data);
  },
  // 编辑非合同费用支付
  editFeePayment: (data: NconFeePaymentSaveParam) => {
    return http.post("/ncon/feePayment/edit", data);
  },
  // 保存非合同费用支付
  saveFeePayment: (data: any) => {
    return http.post("/ncon/feePayment/save", data);
  },
  // 提交非合同费用支付
  submitFeePayment: (data: any) => {
    return http.post("/ncon/feePayment/submit", data);
  },
  // 作废非合同费用支付
  voidFeePayment: (data: { id: number }) => {
    return http.formPost("/ncon/feePayment/void", data);
  },
  /**
   * @name 删除非合同费用支付
   * @param data.id 非合同费用支付id
   * @returns
   */
  delFeePayment: (data: { id: number }) => {
    return http.formPost("/ncon/feePayment/del", data);
  },
  /**
   * @name 发起非合同费用支付审批流程
   * @param data.id 非合同费用支付id
   * @returns
   */
  createNconFeePaymentFlow: (data: { id: number }) => {
    return http.formPost("/ncon/flow/createNconFeePaymentFlow", data);
  },

  /**
   * @name 通过非合同单据ID获取业务主表信息-轻量级
   * @param params.nconBillId - 非合同单据ID
   */
  getNconInfoLite: (params: { nconBillId: number }) => {
    return http.get("/ncon/getNconInfoLite", params);
  },
};
