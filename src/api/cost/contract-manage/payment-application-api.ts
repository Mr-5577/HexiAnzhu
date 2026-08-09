import { http } from "@/axios/service";
import { ConPaySaveParam } from "@/types/cost/contract-manage/payment-application-type";

/**
 * 付款申请 相关接口
 */
export const paymentRequestApi = {
  /** 查询合同支付列表 */
  getPayList: (data: { conId: number }) => {
    return http.formPost("/con/pay/list", data);
  },
  /** 查询单个合同支付 */
  getPayDetail: (data: { id: number ,isWithFlow? : boolean}) => {
    return http.formPost("/con/pay/get", data);
  },
  /** 新增合同支付 ConPaySaveParam*/
  addPay: (data: any) => {
    return http.post("/con/pay/save", data);
  },
  /** 编辑合同支付 */
  editPay: (data: any) => {
    return http.post("/con/pay/save", data);
  },
  /** 删除合同支付 */
  delPay: (data: { id: number }) => {
    return http.formPost("/con/pay/del", data);
  },
  /** 提交合同支付 */
  submitPay: (data: any) => {
    return http.post("/con/pay/submit", data);
  },
  /** 作废合同支付 */
  voidPay: (data: { id: number }) => {
    return http.formPost("/con/pay/void", data);
  },
};
