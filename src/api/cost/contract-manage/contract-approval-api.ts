import { http } from "@/axios/service";

/** 流程回调参数 */
interface FlowCallbackChangeParams {
  /** 流程ID */
  flowId: number;
  /** 工作流状态 */
  wfStatus: string;
  /** 工作流标题 */
  wfTitle: string;
  /** 项目ID */
  projId: number;
  /** 业务板块ID */
  segId: number;
}
/**
 * 合同审批 相关接口
 */
export const contractApprovalApi = {
  /** 创建普通/战略合同审批流程 conId:合同ID */
  createConMainFlow: (data: { conId: number }) => {
    return http.formPost("/con/flow/createConMainFlow", data);
  },
  /** 创建订单合同审批流程 conId:合同ID */
  createConOrdFlow: (data: { conId: number }) => {
    return http.formPost("/con/flow/createConOrdFlow", data);
  },
  /** 创建采购订单审批流程 conId:合同ID */
  createConBillFlow: (data: { conId: number }) => {
    return http.formPost("/con/flow/createConBillFlow", data);
  },
  /** 创建补充合同审批流程 conAddId:补充合同ID */
  createConAddFlow: (data: { conAddId: number }) => {
    return http.formPost("/con/flow/createConAddFlow", data);
  },
  /** 普通/战略合同流程回调 */
  flowCallbackConMain: (data: FlowCallbackChangeParams) => {
    return http.post("/con/flow/flowCallbackConMain", data);
  },
  /** 订单合同流程回调 */
  flowCallbackConOrd: (data: FlowCallbackChangeParams) => {
    return http.post("/con/flow/flowCallbackConOrd", data);
  },
  /** 补充合同流程回调 */
  flowCallbackConBill: (data: FlowCallbackChangeParams) => {
    return http.post("/con/flow/flowCallbackConBill", data);
  },
  /** 工程核价流程回调 */
  flowCallbackConAdd: (data: FlowCallbackChangeParams) => {
    return http.post("/con/flow/flowCallbackConAdd", data);
  },
};
