import { http } from "@/axios/service";
import type {
  BidDemandDeleteParams,
  BidDemandFormParams,
  BidDemandQueryParams,
  BidTenderBillFormDataAdd,
  BidTenderBillFormDataEdit,
  BidTenderBillQueryParams,
  BidTenderDeleteParams,
  BidTenderQueryParams,
  BidTenderSaveParams,
} from "@/types/cost/bidding/bidding-management-type";
/**
 * 招标管理API
 */
export const biddingManageApi = {
  /** 查询招标事项列表 */
  getTenderList: (data: BidTenderQueryParams) => {
    return http.formPost("/bid/tender/getList", data);
  },
  /** 新增招标事项 */
  addTender: (data: BidTenderSaveParams) => {
    return http.post("/bid/tender/add", data);
  },
  /** 编辑招标事项 */
  editTender: (data: BidTenderSaveParams) => {
    return http.post("/bid/tender/edit", data);
  },
  /** 删除招标事项 */
  delTender: (data: BidTenderDeleteParams) => {
    return http.post("/bid/tender/del", data);
  },
  /** 查询招标事项详情 */
  getTenderInfo: (data: { tenderId: number }) => {
    return http.formPost("/bid/tender/getInfo", data);
  },

  /** 查询招标需求列表 */
  getDemandList: (data: BidDemandQueryParams) => {
    return http.formPost("/bid/demand/getList", data);
  },
  /** 新增招标需求 */
  addDemand: (data: BidDemandFormParams) => {
    return http.post("/bid/demand/add", data);
  },
  /** 编辑招标需求 */
  editDemand: (data: BidDemandFormParams) => {
    return http.post("/bid/demand/edit", data);
  },
  /** 删除招标需求 */
  delDemand: (data: BidDemandDeleteParams) => {
    return http.formPost("/bid/demand/del", data);
  },
  /** 招标需求详情 */
  getDemandInfo: (data: { id: number }) => {
    return http.formPost("/bid/demand/getInfo", data);
  },

  /** 查询招标单据列表 */
  getBillList: (data: BidTenderBillQueryParams) => {
    return http.formPost("/bid/bill/getList", data);
  },
  /** 新增招标单据 */
  addBill: (data: BidTenderBillFormDataAdd) => {
    return http.post("/bid/bill/add", data);
  },
  /** 编辑招标单据 */
  editBill: (data: BidTenderBillFormDataEdit) => {
    return http.post("/bid/bill/edit", data);
  },
  /** 删除招标单据 */
  delBill: (data: { bizItemCode: string; billId: number }) => {
    return http.formPost("/bid/bill/del", data);
  },

  /** 发起招标流程 */
  createBillFlow: (data: { billId: number }) => {
    return http.formPost("/bid/bill/createFlow", data);
  },
  /** 招标流程回调 */
  billFlowCallback: (data) => {
    return http.post("/bid/bill/flowCallback", data);
  },
  /** 关联招标需求到招标事项 */
  linkDemandToTender: (data: { tenderId: number; demandId: number }) => {
    return http.formPost("/bid/tender/linkDemand", data);
  },
};
