export interface SaleParamsInterface {
  projIds: any[];
  type: number;
  day: string;
  beginDate?: string;
  endDate?: string;
}
// 销售数据接口
export interface SaleDataInterface {
  orderNum: number; // 订单数量
  signNum: number; // 签约数量
  collectMoney: number; // 付款金额
  orderTask: number; // 认购目标套数
  signTask: number; // 签约目标套数
  collectTask: number; // 回款目标金额
  orderRate: number; // 认购达成率
  signRate: number; // 签约达成率
  collectRate: number; // 回款达成率
  totalRate: number; // 综合达成率
}

// 溢价数据接口
export interface PremiumDataInterface {
  allNum: number; // 总记录数
  premiumMoney: number; // 总溢价金额
  premiumRate: number; // 总溢价率
  yjNum: number; // 溢价记录数
  yjMoney: number; // 溢价总金额
  pjNum: number; // 破价记录数
  pjMoney: number; // 破价总金额
  allSalePrice: number; // 整体均价
  zzSalePrice: number; // 住宅均价
  floorMoney: number; // 底价金额
  saleMoney: number; // 住宅销售金额
  saleArea: number; // 住宅销售面积
}
