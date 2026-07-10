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
  /** 创建合同奖罚（款项调整）审批流程 dedId:奖罚ID */
  createDedFlow: (data: { dedId: number }) => {
    return http.post("/con/flow/createDedFlow", data);
  },
  /** 创建合同产值审批流程 prodValId:产值ID */
  createProdValFlow: (data: { prodValId: number }) => {
    return http.post("/con/flow/createProdValFlow", data);
  },
  /** 创建合同作废审批流程 voidId:合同作废ID */
  createVoidFlow: (data: { voidId: number }) => {
    return http.post("/con/flow/createVoidFlow", data);
  },
  /** 创建合同预结算审批流程 preSettleId:预结算ID */
  createPreSettleFlow: (data: { preSettleId: number }) => {
    return http.post("/con/flow/createPreSettleFlow", data);
  },
  /** 创建合同结算审批流程 settleId:结算ID */
  createSettleFlow: (data: { settleId: number }) => {
    return http.post("/con/flow/createSettleFlow", data);
  },
  /** 合同奖罚流程回调 */
  flowCallbackDed: (data: FlowCallbackChangeParams) => {
    return http.post("/con/flow/flowCallbackDed", data);
  },
  /** 合同产值流程回调 */
  flowCallbackProdVal: (data: FlowCallbackChangeParams) => {
    return http.post("/con/flow/flowCallbackProdVal", data);
  },
  /** 合同作废流程回调 */
  flowCallbackVoid: (data: FlowCallbackChangeParams) => {
    return http.post("/con/flow/flowCallbackVoid", data);
  },
  /** 合同预结算流程回调 */
  flowCallbackPreSettle: (data: FlowCallbackChangeParams) => {
    return http.post("/con/flow/flowCallbackPreSettle", data);
  },
  /** 合同结算流程回调 */
  flowCallbackSettle: (data: FlowCallbackChangeParams) => {
    return http.post("/con/flow/flowCallbackSettle", data);
  },
  /** 发起合同支付流程 payReqId:付款申请ID */
  createConPayFlow: (data: { payReqId: number }) => {
    return http.post("/con/flow/createConPayFlow", data);
  },
  /** 发起履约保证金收取流程 recvId:收取ID */
  createConLvRecvFlow: (data: { recvId: number }) => {
    return http.post("/con/flow/createConLvRecvFlow", data);
  },
  /** 发起履约保证金退还流程 refuId:退还ID */
  createConLvRefuFlow: (data: { refuId: number }) => {
    return http.post("/con/flow/createConLvRefuFlow", data);
  },
};
