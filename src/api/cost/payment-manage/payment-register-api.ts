import { http } from "@/axios/service";

/**
 * 实付登记 相关接口
 */
export const payRegisterApi = {
  /**
   * @name 查询实付登记列表
   * @param params.bizBillId 单据id
   * @param params.bizType 来源类型：   CON   建安支付：NCON_CST   费用支付：NCON_FEE
   * @param params.finaAllocId
   */
  getPayRegisterList: (params?: {
    bizBillId?: number;
    bizType?: string;
    finaAllocId?: number;
  }) => {
    return http.get("/pay/register/list", params);
  },
  /**
   * @name 查询单个实付登记
   * @param params.id 登记ID
   * @returns
   */
  getPayRegisterDetail: (params: { id: number }) => {
    return http.get("/pay/register/get", params);
  },
  /** 保存实付登记 */
  savePayRegister: (data: any) => {
    return http.post("/pay/register/save", data);
  },
  /**
   * @name 删除实付登记
   * @param params.id 登记ID
   */
  delPayRegister: (data: { id: number }) => {
    return http.formPost("/pay/register/del", data);
  },
  /**
   * @name 按来源类型查询确认列表
   * @param params.srcType 来源类型：   CON   建安支付：NCON_CST   费用支付：NCON_FEE
   */
  getConfirmList: (params: { srcType: string }) => {
    return http.get("/pay/confirm/list", params);
  },
  /**
   * @name 查询单个实付确认
   * @param params.id 确认ID（优先）
   * @param params.bizType 业务类型（当 id 为空时必填）：CON_PAY / NCON_CST / NCON_FEE
   * @param params.bizBillId 业务单据ID（当 id 为空时必填）
   */
  getConfirmDetail: (params: { id?: number; bizType?: string; bizBillId?: number }) => {
    return http.get("/pay/confirm/get", params);
  },
  /** 
   * @name 保存实付确认
   */
  savePayConfirm: (data: any) => {
    return http.post("/pay/confirm/save", data);
  },
  /**
   * @name 删除实付确认
   * @param params.id 确认ID
   */
  delPayConfirm: (data: { id: number }) => {
    return http.formPost("/pay/confirm/del", data);
  },
  /**
   * @name 查询付款台账主记录
   * @param data.bizType 业务类型筛选：CON_PAY / NCON_CST / NCON_FEE
   * @param data.segId 板块ID
   * @param data.projId 项目ID
   * @param data.reqDateStart 支付日期起
   * @param data.reqDateEnd 支付日期止
   * @param data.wfStatus 流程状态筛选: 0=草稿, 10=审批中, 40=已审批, 80=作废, 99=其他
   * @param data.payStatus 支付状态
   * @param data.isLocked 是否已确认筛选
   */
  getPayLedgerMain: (data: {
    bizType?: string;
    segId?: number;
    projId?: number;
    reqDateStart?: string;
    reqDateEnd?: string;
    wfStatus?: number;
    isLocked?: boolean;
    payStatus?: string;
  }) => {
    return http.post("/pay/ledger/main", data);
  },
  /**
   * @name 查询付款台账子记录
   * @param data.bizType 业务类型筛选：CON_PAY / NCON_CST / NCON_FEE
   * @param data.segId 板块ID
   * @param data.projId 项目ID
   * @param data.reqDateStart 支付日期起
   * @param data.reqDateEnd 支付日期止
   * @param data.wfStatus 流程状态筛选: 0=草稿, 10=审批中, 40=已审批, 80=作废, 99=其他
   * @param data.isLocked 是否已确认筛选
   */
  getPayLedgerSub: (data: {
    bizType?: string;
    segId?: number;
    projId?: number;
    reqDateStart?: string;
    reqDateEnd?: string;
    wfStatus?: number;
    isLocked?: boolean;
  }) => {
    return http.post("/pay/ledger/sub", data);
  },
};
