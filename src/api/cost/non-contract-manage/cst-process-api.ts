import { http } from "@/axios/service";
import { CstProcessSaveParam } from "@/types/cost/non-contract-manage/cst-process-type";

/**
 * 非合同建安立项 相关接口
 */
export const cstProcessApi = {
  /**
   * @name 获取非合同建安立项列表
   * @param params.projId 项目id
   * @returns
   */
  getCstProcessList: (params?: any) => {
    return http.get("/ncon/cstProcess/list", params);
  },
  /**
   * @name 查询单个非合同建安立项
   * @param params.id 非合同建安立项id
   * @returns
   */
  getCstProcessDetail: (params: { id: number; isWithFlow?: boolean }) => {
    return http.get("/ncon/cstProcess/get", params);
  },
  /**
   * 新增非合同建安立项
   * @param data.process 非合同建安立项信息
   * @param data.process.segId 业务板块ID
   * @param data.process.projId 项目ID
   * @param data.process.processNo 事项编号
   * @param data.process.processName 事项名称
   * @param data.process.processAmt 事项计划金额
   * @param data.process.nconBillId 本事项对应流程ID
   * @param data.process.settledPaymentId 结算单据ID
   * @param data.process.status 状态(0-草稿 5-审批中 10-已审批 20-已结算 30-已作废)
   * @param data.process.remark 事项说明
   * @returns
   */
  addCstProcess: (data: CstProcessSaveParam) => {
    return http.post("/ncon/cstProcess/add", data);
  },
  /**
   * @name 保存非合同建安立项
   * @param data
   */
  saveCstProcess: (data: any) => {
    return http.post("/ncon/cstProcess/save", data);
  },
  /**
   * @name 提交非合同建安立项
   * @param data
   */
  submitCstProcess: (data: any) => {
    return http.post("/ncon/cstProcess/submit", data);
  },
  /**
   * @name 作废非合同建安立项
   * @param data.id 非合同建安立项id
   */
  voidCstProcess: (data: { id: number }) => {
    return http.formPost("/ncon/cstProcess/void", data);
  },
  /**
   * 修改非合同建安立项
   * @param data.process 非合同建安立项信息
   * @param data.process.id 主键ID（必填）
   * @param data.process.segId 业务板块ID
   * @param data.process.projId 项目ID
   * @param data.process.processNo 事项编号
   * @param data.process.processName 事项名称
   * @param data.process.processAmt 事项计划金额
   * @param data.process.nconBillId 本事项对应流程ID
   * @param data.process.settledPaymentId 结算单据ID
   * @param data.process.status 状态(0-草稿 5-审批中 10-已审批 20-已结算 30-已作废)
   * @param data.process.remark 事项说明
   * @returns
   */
  editCstProcess: (data: CstProcessSaveParam) => {
    return http.post("/ncon/cstProcess/edit", data);
  },
  /**
   * @name 删除非合同建安立项
   * @param data.id 非合同建安立项id
   * @returns
   */
  delCstProcess: (data: { id: number }) => {
    return http.formPost("/ncon/cstProcess/del", data);
  },
  /**
   * @name 发起非合同建安立项审批流程
   * @param data.id 非合同建安立项id
   * @returns
   */
  createNconCstProcessFlow: (data: { id: number }) => {
    return http.formPost("/ncon/flow/createNconCstProcessFlow", data);
  },
  /**
   * @name 查询非合同单据详情
   * @param params.billId 单据id
   * @returns
   */
  getCstProcessBillInfo: (params: { billId: number }) => {
    return http.get("/ncon/bill/getInfo", params);
  },
};
