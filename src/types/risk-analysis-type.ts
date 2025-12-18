// 认购转签约统计
export interface ConversionStatsInterface {
  projId: number;
  projName: string;
  signNum: number;
  avgSignDays: number;
  maxSignDays: number;
  minSignDays: number;
}
// 认购转签约明细
export interface ConversionDetailInterface {
  projId: number;
  projName: string;
  roomId: number;
  bigProductTypeId: number;
  bigProductTypeName: string;
  roomNum: string;
  saleArea: number;
  custName: string;
  custTel: string;
  floorMoney: number;
  saleMoney: number;
  saleDate: string;
  saleOrderId: string;
  isSign: number;
  signDate: string;
  signDays: number;
}
// 认购未签约统计
export interface PendingStatsInterface {
  projId: number;
  projName: string;
  orderNum: number;
  orderArea: number;
  orderMoney: number;
  notsignNum: number;
  notsignArea: number;
  notsignMoney: number;
  notsignDays: number;
  maxNotsignDays: number;
}
// 认购未签约明细
export interface PendingDetailInterface {
  projId: number;
  projName: string;
  roomId: number;
  bigProductTypeId: number;
  bigProductTypeName: string;
  roomNum: string;
  saleArea: number;
  custName: string;
  custTel: string;
  floorMoney: number;
  saleMoney: number;
  saleDate: string;
  saleOrderId: string;
  isSign: number; // 0表示未签约
  signDays: number; // 未签约天数
}
