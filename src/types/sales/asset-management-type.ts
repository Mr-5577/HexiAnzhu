// 项目接口
export interface ProjectInterface {
  isDel: boolean;
  id: number;
  pid: number;
  mguId: number;
  projType: number;
  projName: string;
  xsProjId: number;
  sort: number;
}
// 基础产品类型
export interface TypeInterface {
  id: number;
  productTypeName: string;
}

// 销售状态接口
export interface StatusInterface {
  id: number;
  saleStatusName: string;
}
// 销售状态接口
export interface tableInterface {
  id: number;
  saleStatusName: string;
}
// 房间台账列表
export interface RoomTableInterface {
  projId: number;
  projName: string;
  roomNum: string;
  buildBatch: string;
  forecastArea: number;
  bigProductTypeName: string;
  smallProductTypeName: string;
  saleStatus: number;
  saleStatusDesc: string;
  payWayId: number;
  payWayName: string;
  listedPrice: number;
  listedMoney: number;
  price: number;
  floorMoney: number;
  priceOffer: number;
  floorMoneyOffer: number;
  saleDate: string;
  orderCreateDate: string;
  netDate: string;
  saleMoney: number;
  surveyMoney: number;
  custName: string;
  custTel: string;
  custTels: string;
  loanPayMoney?: number;
  loanPayDate?: string;
  remark: string;
}
// 库存统计表
export interface InventoryStatisticsInterface {
  projId: number;
  projName: string;
  bigProductTypeId: number;
  bigProductTypeName: string;
  totalRoomNum: number;
  totalMoney: number;
  stockRoomNum: number;
  stockMoney: number;
  costNum: number;
  costMoney: number;
  saleMonths: number;
  months: number;
}
// 库存明细表
export interface InventoryDetailInterface {
  projId: number;
  projName: string;
  bigProductTypeId: number;
  bigProductTypeName: string;
  roomNum: string;
  forecastArea: number;
  buildArea: number;
  price: number;
  floorMoney: number;
  monthType: string;
  moneyType: string;
  areaType: string;
  preSaleDate: string;
}

// ==================== 具体接口参数类型 ====================
export interface RoomAccountBookParams {
  projIds: number[];
  productTypes: number[];
  saleStatus: number[];
}

export interface StatisticsParams {
  projIds: number[];
  productTypes: number[];
}

export interface FinanceReportParams {
  day: string;
  projIds: number[];
}

export interface FinanceReportExportParams extends FinanceReportParams {
  isExport: boolean;
}

export interface VisitCountParams {
  day: string;
  projIds: number[];
}

export interface VisitCountExportParams extends VisitCountParams {
  isExport: boolean;
}

export interface ChannelStatisticsParams {
  projIds: number[];
  type: number;
  beginDate: string;
  endDate: string;
}

export interface ChannelStatisticsExportParams extends ChannelStatisticsParams {
  isExport: boolean;
}

export interface VisitHistoryParams {
  projId: number | string;
  custName: string;
  custTel: string;
  visitTimeStart: string;
  visitTimeEnd: string;
}

export interface VisitProjListParams {
  isAll?: boolean;
}

export interface SalerListParams {
  projId: number | string;
}

export interface ReportParams {
  projIds: number[];
  day: string;
  beginDate: string;
  endDate: string;
}

export interface ReportExportParams extends ReportParams {
  isExport: boolean;
}

export interface PerformanceDetailParams {
  projIds: number[];
  productTypes: number[];
  type: number;
  day: string;
  beginDate: string;
  endDate: string;
  isShowTel: boolean;
}

export interface PerformanceDetailExportParams extends PerformanceDetailParams {
  isExport: boolean;
}

export interface OrderCountParams {
  projIds: number[];
  productTypes: number[];
  day: string;
}

export interface OrderCountExportParams extends OrderCountParams {
  isExport: boolean;
}

export interface OrderToSignParams {
  projIds: number[];
  productTypes: number[];
  type: number;
  day: string;
  beginDate: string;
  endDate: string;
}

export interface OrderToSignExportParams extends OrderToSignParams {
  isExport: boolean;
}

export interface OrderToSignRoomParams {
  projIds: number[];
  productTypes: number[];
  type: number;
  day: string;
  beginDate: string;
  endDate: string;
  isShowTel: boolean;
}

export interface OrderToSignRoomExportParams extends OrderToSignRoomParams {
  isExport: boolean;
}

export interface OrderNotSignParams {
  projIds: number[];
  productTypes: number[];
}

export interface OrderNotSignExportParams extends OrderNotSignParams {
  isExport: boolean;
}

export interface OrderNotSignRoomParams {
  projIds: number[];
  productTypes: number[];
  isShowTel: boolean;
}

export interface OrderNotSignRoomExportParams extends OrderNotSignRoomParams {
  isExport: boolean;
}

export interface PremiumParams {
  projIds: number[];
  productTypes: number[];
  type: number;
  day: string;
  beginDate: string;
  endDate: string;
}

export interface PremiumExportParams extends PremiumParams {
  isExport: boolean;
}

export interface PremiumRoomParams {
  projIds: number[];
  productTypes: number[];
  type: number;
  day: string;
  beginDate: string;
  endDate: string;
  isShowTel: boolean;
}

export interface PremiumRoomExportParams extends PremiumRoomParams {
  isExport: boolean;
}

export interface ReceivableProjParams {
  projIds: number[];
}

export interface ReceivableProjExportParams extends ReceivableProjParams {
  isExport: boolean;
}

export interface ReceivableRoomParams {
  projIds: number[];
  isShowTel: boolean;
}

export interface ReceivableRoomExportParams extends ReceivableRoomParams {
  isExport: boolean;
}

export interface CheckOutParams {
  projIds: number[];
  productTypes: number[];
  checkOutType: number;
  type: number;
  day: string;
  beginDate: string;
  endDate: string;
}

export interface CheckOutExportParams extends CheckOutParams {
  isExport: boolean;
}

export interface CheckOutRoomParams {
  projIds: number[];
  productTypes: number[];
  checkOutType: number;
  type: number;
  day: string;
  beginDate: string;
  endDate: string;
  isShowTel: boolean;
}

export interface CheckOutRoomExportParams extends CheckOutRoomParams {
  isExport: boolean;
}
