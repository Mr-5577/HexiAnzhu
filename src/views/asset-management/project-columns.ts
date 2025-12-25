// 房间台账表-表头
export const roomLedgerColumns: any = [
  { prop: "projName", label: "项目", width: 240, fixed: "left" },
  { prop: "roomNum", label: "房号", width: 120 },
  { prop: "buildBatch", label: "楼栋分期", width: 90 },
  { prop: "forecastArea", label: "预测面积", width: 100 },
  { prop: "bigProductTypeName", label: "类型", width: 70 },
  { prop: "smallProductTypeName", label: "二级分类", width: 120 },
  { prop: "saleStatusDesc", label: "状态", width: 80 },
  { prop: "payWayName", label: "付款方式", width: 90 },
  { prop: "listedPrice", label: "挂牌单价", width: 90 },
  { prop: "listedMoney", label: "挂牌总价", width: 90 },
  { prop: "price", label: "按揭单价", width: 90 },
  { prop: "floorMoney", label: "按揭总价", width: 90 },
  { prop: "priceOffer", label: "全款单价", width: 90 },
  { prop: "floorMoneyOffer", label: "全款总价", width: 90 },
  { prop: "saleDate", label: "成交时间", width: 120 },
  { prop: "aa", label: "成交时系统按揭总价", width: 160 }, // 字段调整
  { prop: "bb", label: "成交时系统全款总价", width: 160 }, // 字段调整
  { prop: "orderCreateDate", label: "创建时间", width: 120 },
  { prop: "netDate", label: "签约时间", width: 120 },
  { prop: "saleMoney", label: "成交总价", width: 90 },
  { prop: "surveyMoney", label: "实测总价", width: 90 },
  { prop: "custName", label: "客户名", width: 100 },
  { prop: "custTel", label: "联系电话", width: 120 },
  { prop: "custTels", label: "备用联系", width: 120 },
  { prop: "cc", label: "已付金额", width: 90 }, // 字段调整
  { prop: "loanPayMoney", label: "银行放款", width: 90 },
  { prop: "loanPayDate", label: "放款时间", width: 120 },
  { prop: "refundMoney", label: "退款金额", width: 90 },
  { prop: "remark", label: "备注详情", width: 220 },
];

// 库存统计表-表头
export const inventoryStatisticsColumns: any = [
  { type: "index", label: "序号", width: 80 },
  { prop: "projName", label: "项目名称" },
  { prop: "bigProductTypeName", label: "业态", width: 150 },
  { prop: "totalRoomNum", label: "总套数", width: 150 },
  { prop: "totalMoney", label: "总货值(亿)", width: 150 },
  { prop: "stockRoomNum", label: "库存套数", width: 150 },
  { prop: "stockMoney", label: "库存总货值(亿)", width: 150 },
  { prop: "costNum", label: "月均去化套数", width: 150 },
  { prop: "costMoney", label: "月均去化金额(万)", width: 150 },
  { prop: "saleMonths", label: "存销比", width: 150 },
];
export const createInventoryStatisticsColumns = (
  clickHandler?: (row: any, column: any, index: number) => void
): any[] => {
  return [
    { type: "index", label: "序号", width: 80 },
    {
      prop: "projName",
      label: "项目名称",
      clickable: !!clickHandler, // 如果有处理函数才设置为可点击
      clickHandler,
      width: 150,
    },
    { prop: "bigProductTypeName", label: "业态", width: 150 },
    { prop: "totalRoomNum", label: "总套数", width: 150 },
    { prop: "totalMoney", label: "总货值(亿)", width: 150 },
    { prop: "stockRoomNum", label: "库存套数", width: 150 },
    { prop: "stockMoney", label: "库存总货值(亿)", width: 150 },
    { prop: "costNum", label: "月均去化套数", width: 150 },
    { prop: "costMoney", label: "月均去化金额(万)", width: 150 },
    { prop: "saleMonths", label: "存销比", width: 150 },
  ];
};

// 库存明细表-表头
export const inventoryDetailColumns: any = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目名称" },
  { prop: "bigProductTypeName", label: "业态", width: 150 },
  { prop: "roomNum", label: "房号", width: 150 },
  { prop: "forecastArea", label: "面积", width: 150 },
  { prop: "floorMoney", label: "面价", width: 150 },
  { prop: "price", label: "底价单价", width: 150 },
  { prop: "monthType", label: "库存周期(月)", width: 150 },
  { prop: "areaType", label: "面积段", width: 150 },
  { prop: "moneyType", label: "总价段", width: 150 },
];
