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
// 溢价统计表
export interface PremiumStatsInterface {
  companyId: number;
  projId: number;
  projName: string;
  allNum: number;
  saleArea: number;
  floorMoney: number;
  floorUnitPrice: number;
  saleMoney: number;
  allSalePrice: number;
  incMoneyRm: number;
  incMoneyPj: number;
  premiumMoney: number;
  premiumRate: number;
  yjNum: number;
  yjMoney: number;
  pjNum: number;
  pjMoney: number;
}
// 溢价明细表
export interface PremiumDetailInterface {
  companyId: number;
  projId: number;
  projName: string;
  allNum: number;
  saleArea: number;
  floorMoney: number;
  floorUnitPrice: number;
  saleMoney: number;
  allSalePrice: number;
  incMoneyRm: number;
  incMoneyPj: number;
  premiumMoney: number;
  premiumRate: number;
  yjNum: number;
  yjMoney: number;
  pjNum: number;
  pjMoney: number;
}
// 退房挞定统计
export interface ForfeitureStatsInterface {
  projId: number;
  projName: string;
  tdMoney: number;
  tdNum: number;
  tfMoney: number;
  tfNum: number;
}
// 退房挞定明细
export interface ForfeitureDetailInterface {
  projId: number;
  projName: string;
  tdMoney: number;
  tdNum: number;
  tfMoney: number;
  tfNum: number;
}
