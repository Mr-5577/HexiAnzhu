import { http } from "@/axios/service";
import type {
  BidDemandFormParams,
  BidDemandQueryParams,
  BidTenderBillFormDataAdd,
  BidTenderBillFormDataEdit,
  BidTenderBillQueryParams,
  BidTenderQueryParams,
  BidTenderSaveParams,
} from "@/types/cost/bidding/bidding-management-type";

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

/** 查询定标明细列表参数 */
interface AwardItemListQueryParams {
  /** 招标事项编号 */
  tenderNo?: string;
  /** 招标事项名称 */
  tenderName?: string;
  /** 合同分类 */
  conTypeId?: string;
  /** 项目ID */
  projId: number;
  /** 供应商名称 */
  supName?: string;
  /** 招标明细事项 */
  tenderItemName?: string;
}

/**
 * 招标管理 API
 * @description 提供招标事项、招标需求、招标单据的完整生命周期管理
 */
export const biddingManageApi = {
  // ==================== 招标需求 ====================
  /**
   * 新增招标需求
   * @param data - 新增参数
   * @param data.bill - 招标需求数据
   * @param data.demand - 招标需求表单数据
   * @param data.annexList - 附件列表
   * @returns Promise
   */
  demandSave: (data: any) => {
    return http.post("/bid/demand/save", data);
  },
  /**
   * 保存并提交招标需求
   * @param data - 新增参数
   * @param data.bill - 招标需求数据
   * @param data.demand - 招标需求表单数据
   * @param data.annexList - 附件列表
   * @returns Promise
   */
  demandSubmit: (data: any) => {
    return http.post("/bid/demand/submit", data);
  },
  // ==================== 招标事项管理 ====================
  /**
   * 查询招标事项列表
   * @param data - 查询参数
   * @param data.id - 主键ID（精确查询）
   * @param data.tenderNo - 招标单号（模糊查询）
   * @param data.tenderName - 采购事项（模糊查询）
   * @param data.segId - 业务板块ID
   * @param data.conTypeId - 合同分类ID
   * @param data.purchaseMethodId - 采购方式ID
   * @param data.tenderMethodId - 招标方式ID
   * @param data.tenderStatus - 招标状态：0-草稿，1-已审批，2-招标中，3-已定标，4-已签约
   * @param data.dutyMan - 责任人
   * @param data.demandDateStart - 需求日期开始
   * @param data.demandDateEnd - 需求日期结束
   * @returns Promise 招标事项列表
   */
  getTenderList: (data: BidTenderQueryParams) => {
    return http.formPost("/bid/tender/getList", data);
  },

  /**
   * 新增招标事项
   * @param data - 新增参数
   * @param data.tender - 招标事项表单数据
   * @param data.items - 明细列表数据
   * @param data.projIds - 项目ID列表
   * @returns Promise
   */
  addTender: (data: BidTenderSaveParams) => {
    return http.post("/bid/tender/add", data);
  },

  /**
   * 编辑招标事项
   * @param data - 修改参数
   * @param data.tender - 招标事项表单数据（包含 id）
   * @param data.items - 明细列表数据
   * @param data.projIds - 项目ID列表
   * @returns Promise
   */
  editTender: (data: BidTenderSaveParams) => {
    return http.post("/bid/tender/edit", data);
  },

  /**
   * 删除招标事项
   * @param data - 删除参数
   * @param data.id - 招标事项ID（必填）
   * @returns Promise
   * @description 注意：删除前请确保该事项未被招标单据引用
   */
  delTender: (data: { id: number }) => {
    return http.post("/bid/tender/del", data);
  },

  /**
   * 查询招标事项详情
   * @param data - 查询参数
   * @param data.tenderId - 招标事项ID（必填）
   * @returns Promise 招标事项完整信息
   */
  getTenderInfo: (data: { tenderId: number }) => {
    return http.formPost("/bid/tender/getInfo", data);
  },

  /**
   * 关联招标需求到招标事项
   * @param data - 关联参数
   * @param data.tenderId - 招标事项ID（必填）
   * @param data.demandId - 招标需求ID（必填）
   * @returns Promise
   */
  linkDemandToTender: (data: { tenderId: number; demandId: number }) => {
    return http.formPost("/bid/tender/linkDemand", data);
  },

  /**
   * 查询招标需求列表
   * @param data - 查询参数
   * @param data.tenderName - 招标事项（模糊查询）
   * @param data.segId - 业务板块ID
   * @param data.projId - 项目ID
   * @param data.companyId - 公司ID
   * @returns Promise 招标需求列表
   */
  getDemandList: (data: BidDemandQueryParams) => {
    return http.formPost("/bid/demand/getList", data);
  },

  /**
   * 新增招标需求
   * @param data - 新增参数
   * @param data.segId - 业务板块ID（必填）
   * @param data.projId - 项目ID（必填）
   * @param data.companyId - 公司ID（必填）
   * @param data.tenderName - 招标事项
   * @param data.demandDate - 需求日期
   * @param data.demandRemark - 需求说明
   * @returns Promise
   */
  addDemand: (data: BidDemandFormParams) => {
    return http.post("/bid/demand/add", data);
  },

  /**
   * 编辑招标需求
   * @param data - 修改参数
   * @param data.id - 主键ID（必填）
   * @param data.segId - 业务板块ID（必填）
   * @param data.projId - 项目ID（必填）
   * @param data.companyId - 公司ID（必填）
   * @param data.tenderName - 招标事项
   * @param data.demandDate - 需求日期
   * @param data.demandRemark - 需求说明
   * @returns Promise
   */
  editDemand: (data: BidDemandFormParams) => {
    return http.post("/bid/demand/edit", data);
  },

  /**
   * 删除招标需求
   * @param data - 删除参数
   * @param data.billId - 单据ID（必填）
   */
  delDemand: (data: { billId: number }) => {
    return http.formPost("/bid/demand/del", data);
  },
  /**
   * 作废招标需求
   * @param data - 删除参数
   * @param data.billId - 单据ID（必填）
   */
  voidDemand: (data: { billId: number }) => {
    return http.formPost("/bid/demand/void", data);
  },

  /**
   * 查询招标需求详情
   * @param data - 查询参数
   * @param data.billId - 单据ID（必填）
   * @returns Promise 招标需求详细信息
   */
  getDemandInfo: (data: { billId: number }) => {
    return http.formPost("/bid/demand/getInfo", data);
  },

  /**
   * 查询招标单据列表
   * @param data - 查询参数
   * @param data.bizNo - 招标业务编号（模糊查询）
   * @param data.bizItemCode - 业务类型代码（必填）
   * @param data.tenderId - 招标事项ID
   * @param data.tenderName - 招标事项名称（模糊查询）
   * @param data.projId - 项目ID
   * @param data.segId - 版块ID
   * @param data.conTypeId - 合同类型ID
   * @param data.dutyMan - 负责人ID
   * @param data.startDate - 开始时间
   * @param data.endDate - 结束时间
   * @returns Promise 招标单据列表
   */
  getBillList: (data: any) => {
    return http.formPost("/bid/bill/getList", data);
  },

  /**
   * 新增招标单据
   * @param data - 新增参数
   * @param data.bizItemCode - 业务代码（必填）
   * @param data.tenderId - 招标事项ID（必填）
   * @param data.planList - 招标计划列表
   * @param data.referList - 招标参考列表
   * @param data.awardList - 定标审批列表
   * @param data.bondRecvList - 招标保证金列表
   * @param data.bondRefundList - 招标保证金退还列表
   * @returns Promise
   */
  addBill: (data: BidTenderBillFormDataAdd) => {
    return http.post("/bid/bill/add", data);
  },
  /**
   * 保存招标单据（新增/修改）
   * @param data
   */
  saveBill: (data: BidTenderBillFormDataAdd) => {
    return http.post("/bid/bill/save", data);
  },
  /**
   * 保存并提交招标单据
   * @param data
   */
  submitBill: (data: BidTenderBillFormDataAdd) => {
    return http.post("/bid/bill/submit", data);
  },

  /**
   * 编辑招标单据
   * @param data - 修改参数
   * @param data.bizItemCode - 业务代码（必填）
   * @param data.id - 单据ID（必填）
   * @param data.childData - 招标明细事项列表
   * @returns Promise
   */
  editBill: (data: BidTenderBillFormDataEdit) => {
    return http.post("/bid/bill/edit", data);
  },

  /**
   * 删除招标单据
   * @param data - 删除参数
   * @param data.bizItemCode - 业务类型代码（必填）
   * @param data.billId - 单据ID（必填）
   */
  delBill: (data: { bizItemCode: string; billId: number }) => {
    return http.formPost("/bid/bill/del", data);
  },
  /**
   * 作废招标单据
   * @param data - 删除参数
   * @param data.billId - 单据ID（必填）
   */
  voidBill: (data: { billId: number }) => {
    return http.formPost("/bid/bill/void", data);
  },
  /**
   * 查询招标单据详情
   * @param data - 删除参数
   * @param data.billId - 单据ID（必填）
   */
  getBillInfo: (data: { billId: number; isWithFlow?: boolean }) => {
    return http.formPost("/bid/bill/getInfo", data);
  },
  /**
   * 查询招标保证金缴纳明细列表（在招标保证金退还里面使用）
   * @param data - 删除参数
   * @param data.tenderId - 事项ID（必填）
   * @param data.isNoRefund - 是否未退还的（必填）
   */
  getBondRecvList: (data: { tenderId: number; isNoRefund: boolean }) => {
    return http.formPost("/bid/bondRecv/listByTender", data);
  },

  /**
   * 发起招标流程
   * @param data - 发起参数
   * @param data.billId - 单据ID（必填）
   */
  createBillFlow: (data: { billId: number }) => {
    return http.formPost("/bid/bill/createFlow", data);
  },
  /**
   * 更新招标流程
   * @param data - 发起参数
   * @param data.billId - 单据ID（必填）
   */
  updateBillFlow: (data: { billId: number }) => {
    return http.formPost("/bid/bill/updateFlow", data);
  },

  /**
   * 招标流程回调
   * @param data - 回调数据
   * @returns Promise
   */
  billFlowCallback: (data: FlowCallbackChangeParams) => {
    return http.post("/bid/bill/flowCallback", data);
  },

  /**
   * 查询定标明细
   * @param data - 回调数据
   * @returns Promise
   */
  getAwardItemList: (data: AwardItemListQueryParams) => {
    return http.formPost("/bid/tender/getDetail", data);
  },
};
