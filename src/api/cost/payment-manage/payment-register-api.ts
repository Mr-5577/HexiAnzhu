import { http } from "@/axios/service";

/**
 * 实付登记 相关接口
 */
export const payRegisterApi = {
  /**
   * @name 查询实付登记列表
   * @param params.paymentId 单据id
   * @param params.srcType 来源类型：   CON   建安支付：NCON_CST   费用支付：NCON_FEE
   * @returns
   */
  getPayRegisterList: (params?: { paymentId?: number; srcType?: string }) => {
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
  /** 新增实付登记 */
  addPayRegister: (data: any) => {
    return http.post("/pay/register/add", data);
  },
  /** 编辑实付登记 */
  editPayRegister: (data: any) => {
    return http.post("/pay/register/edit", data);
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
   * @name 按来源查询单个实付确认
   * @param params.srcType 来源类型：   CON   建安支付：NCON_CST   费用支付：NCON_FEE
   * @param params.paymentId 单据ID
   */
  getConfirmListBySrc: (params: { srcType: string; paymentId?: number }) => {
    return http.get("/pay/confirm/getBySrc", params);
  },
  /**
   * @name 查询单个实付确认
   * @param params.id 确认ID
   */
  getConfirmDetail: (params: { id: number }) => {
    return http.get("/pay/confirm/get", params);
  },
  /** 新增实付确认 */
  addPayConfirm: (data: any) => {
    return http.post("/pay/confirm/add", data);
  },
  /** 编辑实付确认 */
  editPayConfirm: (data: any) => {
    return http.post("/pay/confirm/edit", data);
  },
  /**
   * @name 删除实付确认
   * @param params.id 登记ID
   */
  delPayConfirm: (data: { id: number }) => {
    return http.formPost("/pay/confirm/del", data);
  },
  /**
   * @name 查询付款台账主记录
   */
  getPayLedgerMain: () => {
    return http.formPost("/pay/ledger/main");
  },
  /**
   * @name 查询付款台账子记录
   */
  getPayLedgerSub: () => {
    return http.formPost("/pay/ledger/sub");
  },
};
