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
