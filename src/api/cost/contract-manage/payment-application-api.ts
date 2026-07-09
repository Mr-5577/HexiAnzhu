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
  getPayDetail: (data: { id: number }) => {
    return http.formPost("/con/pay/get", data);
  },
  /** 新增合同支付 */
  addPay: (data: ConPaySaveParam) => {
    return http.post("/con/pay/add", data);
  },
  /** 编辑合同支付 */
  editPay: (data: ConPaySaveParam) => {
    return http.post("/con/pay/edit", data);
  },
  /** 删除合同支付 */
  delPay: (data: { id: number }) => {
    return http.formPost("/con/pay/del", data);
  },
};
