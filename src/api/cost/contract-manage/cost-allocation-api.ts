import { http } from "@/axios/service";
import {
  AutoAllocateCostDTO,
  CostAllocationDetailDTO,
  CostAllocationDetailQueryDTO,
  CostAllocationDTO,
  CostAllocationQueryDTO,
  SaveCostAllocationDTO,
  NconAutoAllocDTO,
} from "@/types/cost/contract-manage/cost-allocation-type";

/**
 * 成本分摊 相关接口
 */
export const costAllocationApi = {
  /** 查询项目成本分摊主表 */
  getProjectAllocMList: (data: CostAllocationQueryDTO) => {
    return http.formPost("/cost/projectAllocM/getList", data);
  },
  /** 新增项目成本分摊主表 */
  addProjectAllocM: (data: CostAllocationDTO) => {
    return http.post("/cost/projectAllocM/add", data);
  },
  /** 修改项目成本分摊主表 */
  editProjectAllocM: (data: CostAllocationDTO) => {
    return http.post("/cost/projectAllocM/edit", data);
  },
  /** 删除项目成本分摊主表 */
  delProjectAllocM: (data: { id: number }) => {
    return http.formPost("/cost/projectAllocM/del", data);
  },

  /** 查询项目成本分摊子表 */
  getProjectAllocDList: (data: CostAllocationDetailQueryDTO) => {
    return http.formPost("/cost/projectAllocD/getList", data);
  },
  /** 新增项目成本分摊子表 */
  addProjectAllocD: (data: CostAllocationDetailDTO) => {
    return http.post("/cost/projectAllocD/add", data);
  },
  /** 修改项目成本分摊子表 */
  editProjectAllocD: (data: CostAllocationDetailDTO) => {
    return http.post("/cost/projectAllocD/edit", data);
  },
  /** 删除项目成本分摊子表 */
  delProjectAllocD: (data: { id: number }) => {
    return http.formPost("/cost/projectAllocD/del", data);
  },

  /** 获取合同综合税率 */
  getContractTaxRate: (data: { conId: number }) => {
    return http.formPost("/con/main/taxRate", data);
  },
  /** 动态成本自动分摊 */
  autoAllocateCost: (data: AutoAllocateCostDTO) => {
    return http.post("/con/main/autoAlloc", data);
  },
  /** 保存项目成本分摊（主从表） */
  saveProjectAlloc: (data: any) => {
    return http.post("/cost/projectAlloc/save", data);
  },
  /**
   * 删除项目成本分摊（主从表）
   * @param data - 删除参数
   * @param data.id - 成本分摊主表ID
   */
  delProjectAlloc: (data: { id: number }) => {
    return http.formPost("/cost/projectAlloc/del", data);
  },
  /**
   * 查询项目成本分摊（主从表）
   * @param data - 查询参数
   * @param data.id - 成本分摊主表ID
   * @param data.bizBillId - 单据ID
   * @param data.bizType - 业务类型
   * @param data.bizKeyId
   */
  getProjectAlloc: (data: {
    id?: number;
    bizBillId?: number | string;
    bizType?: string;
    bizKeyId?: number | string;
  }) => {
    return http.formPost("/cost/projectAlloc/getList", data);
  },
  /**
   * @name 获取生效的目标成本版本
   * @param data - 查询参数
   * @param data.projId - 项目ID
   */
  getProjectCostMEnabled: (data: { projId: number }) => {
    return http.formPost("/cost/projectCostM/getEnabled", data);
  },
  /**
   * @name 非合同成本分摊-自动分摊
   */
  getNconAutoAlloc: (data: NconAutoAllocDTO) => {
    return http.post("/ncon/autoAlloc", data);
  },
  /**
   * @name 计算单次分摊预警状态,根据项目ID、分摊主表ID和分摊子表列表，计算各科目的分摊预警状态
   * @param data - 请求参数
   * @param data.projId - 项目ID
   * @param data.allocMid - 分摊主表ID（可选，首次计算传null）
   * @param data.subAllocList - 分摊子表列表
   * @param data.subAllocList[].subId - 科目ID
   * @param data.subAllocList[].allocAmt - 分摊金额（含税）
   * @param data.subAllocList[].allocExclAmt - 分摊金额（不含税）
   * @returns 返回预警状态及更新后的分摊子表数据
   * @example
   * getWarnSubAlloc({
   *   projId: 31,
   *   allocMid: null,
   *   subAllocList: [
   *     { subId: 4, allocAmt: 700, allocExclAmt: 700 }
   *   ]
   * })
   */
  getWarnSubAlloc: (data: {
    projId: number;
    allocMid?: number;
    subAllocList: Array<{
      subId: number;
      allocAmt: number;
      allocExclAmt: number;
    }>;
  }) => {
    return http.post("/cost/subAlloc/getWarn", data);
  },
  /**
   * @name 查询合同动态成本分摊（主从表复合结构）,OA打开成本分摊时调用查询
   * @param data - 查询参数
   * @param data.conId - 合同ID
   * @param data.isWithCost - 是否附带目标成本数据，默认为false
   */
  getCostAllocDetail: (data: { conId: number; isWithCost?: boolean }) => {
    return http.post("/con/main/getAlloc", data);
  },
  /**
   * @name 保存普通/战略合同审批流程（新增/更新）
   * @param data.billId 单据ID
   */
  saveConMainFlow: (data: { billId: number; allowEdit?: boolean }) => {
    return http.formPost("/con/flow/saveConMainFlow", data);
  },
  /**
   * @name 保存补充合同审批流程（新增/更新）
   * @param data.billId 补充合同单据ID
   */
  saveConAddFlow: (data: { billId: number; allowEdit?: boolean }) => {
    return http.formPost("/con/flow/saveConAddFlow", data);
  },
  /**
   * @name 保存合同变更审批流程（新增/更新）
   * @param data.billId 变更单据ID
   */
  saveChangeFlow: (data: { billId: number; allowEdit?: boolean }) => {
    return http.formPost("/con/flow/saveChangeFlow", data);
  },
  /**
   * @name 保存合同签证审批流程（新增/更新）
   * @param data.billId 签证单据ID
   */
  saveVisaFlow: (data: { billId: number; allowEdit?: boolean }) => {
    return http.formPost("/con/flow/saveVisaFlow", data);
  },
  /**
   * @name 保存合同作废审批流程（新增/更新）
   * @param data.billId 合同作废单据ID
   */
  saveVoidFlow: (data: { billId: number; allowEdit?: boolean }) => {
    return http.formPost("/con/flow/saveVoidFlow", data);
  },
  /**
   * @name 保存合同预结算审批流程（新增/更新）
   * @param data.billId 合同预结算单据ID
   */
  savePreSettleFlow: (data: { billId: number; allowEdit?: boolean }) => {
    return http.formPost("/con/flow/savePreSettleFlow", data);
  },
  /**
   * @name 保存合同结算审批流程（新增/更新）
   * @param data.billId 合同结算单据ID
   */
  saveSettleFlow: (data: { billId: number; allowEdit?: boolean }) => {
    return http.formPost("/con/flow/saveSettleFlow", data);
  },
  /**
   * @name 保存合同产值审批流程（新增/更新）
   * @param data.billId 产值单据ID
   */
  saveProdValFlow: (data: { billId: number; allowEdit?: boolean }) => {
    return http.formPost("/con/flow/saveProdValFlow", data);
  },
  /**
   * @name 保存合同支付流程（新增/更新）
   * @param data.billId 单据ID
   */
  saveConPayFlow: (data: { billId: number }) => {
    return http.formPost("/con/flow/saveConPayFlow", data);
  },
  /**
   * @name 保存合同奖罚审批流程（新增/更新）
   * @param data.billId 单据ID
   */
  saveDedFlow: (data: { billId: number }) => {
    return http.formPost("/con/flow/saveDedFlow", data);
  },
  /**
   * @name 保存履约保证金收取流程（新增/更新）
   * @param data.billId 单据ID
   */
  saveConLvRecvFlow: (data: { billId: number }) => {
    return http.formPost("/con/flow/saveConLvRecvFlow", data);
  },
  /**
   * @name 保存履约保证金退还流程（新增/更新
   * @param data.billId 单据ID
   */
  saveConLvRefuFlow: (data: { billId: number }) => {
    return http.formPost("/con/flow/saveConLvRefuFlow", data);
  },
  /**
   * @name 保存合同特殊事项申请审批流程（新增/更新）
   * @param data.billId 单据ID
   */
  saveSpecialFlow: (data: { billId: number }) => {
    return http.formPost("/con/flow/saveSpecialFlow", data);
  },
  /**
   * @name 保存合同工程核价审批流程（新增/更新）
   * @param data.billId 单据ID
   */
  saveAuditPriceFlow: (data: { billId: number }) => {
    return http.formPost("/con/flow/saveAuditPriceFlow", data);
  },
};
