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
 * 合同关联审批 相关接口
 */
export const associatedApprovalApi = {
  /** 创建合同变更审批流程 changeId:变更ID */
  createChangeFlow: (data: { changeId: number }) => {
    return http.formPost("/con/flow/createChangeFlow", data);
  },
  /** 创建合同签证审批流程 visaId:签证ID */
  createVisaFlow: (data: { visaId: number }) => {
    return http.formPost("/con/flow/createVisaFlow", data);
  },
  /** 创建合同特殊事项申请审批流程 specialId:特殊事项ID */
  createSpecialFlow: (data: { specialId: number }) => {
    return http.formPost("/con/flow/createSpecialFlow", data);
  },
  /** 创建合同工程核价审批流程 auditPriceId:工程核价ID */
  createAuditPriceFlow: (data: { auditPriceId: number }) => {
    return http.formPost("/con/flow/createAuditPriceFlow", data);
  },
  /** 合同变更流程回调 */
  flowCallbackChange: (data: FlowCallbackChangeParams) => {
    return http.post("/con/flow/flowCallbackChange", data);
  },
  /** 合同签证流程回调 */
  flowCallbackVisa: (data: FlowCallbackChangeParams) => {
    return http.post("/con/flow/flowCallbackVisa", data);
  },
  /** 特殊事项流程回调 */
  flowCallbackSpecial: (data: FlowCallbackChangeParams) => {
    return http.post("/con/flow/flowCallbackSpecial", data);
  },
  /** 工程核价流程回调 */
  flowCallbackAuditPrice: (data: FlowCallbackChangeParams) => {
    return http.post("/con/flow/flowCallbackAuditPrice", data);
  },
};
