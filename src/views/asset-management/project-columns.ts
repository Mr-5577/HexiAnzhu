import { formatNumberDisplay } from "@/utils/common";

// 房间台账表-表头
export const roomLedgerColumns: any = [
  { prop: "projName", label: "项目", width: 240, fixed: "left" },
  { prop: "roomNum", label: "房号", width: 120 },
  { prop: "buildBatch", label: "楼栋分期", width: 90 },
  { prop: "forecastArea", label: "预测面积", width: 100 },
  { prop: "buildArea", label: "建筑面积", width: 100 },
  { prop: "bigProductTypeName", label: "业态", width: 70 },
  { prop: "smallProductTypeName", label: "二级业态", width: 120 },
  { prop: "saleStatusDesc", label: "状态", width: 80 },
  { prop: "payWayName", label: "付款方式", width: 90 },
  {
    prop: "listedPrice",
    label: "挂牌单价",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.listedPrice),
  },
  {
    prop: "listedMoney",
    label: "挂牌总价",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.listedMoney),
  },
  {
    prop: "price",
    label: "按揭单价",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.price),
  },
  {
    prop: "floorMoney",
    label: "按揭底价",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.floorMoney),
  },
  {
    prop: "priceOffer",
    label: "全款单价",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.priceOffer),
  },
  {
    prop: "floorMoneyOffer",
    label: "全款底价",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.floorMoneyOffer),
  },
  { prop: "saleDate", label: "认购日期", width: 120 },
  { prop: "aa", label: "成交时系统底价", width: 160 }, // 字段调整
  { prop: "asstDate", label: "认购业绩日期", width: 120 },
  { prop: "signDate", label: "签约日期", width: 120 },
  { prop: "netDate", label: "网签日期", width: 120 },
  {
    prop: "saleMoney",
    label: "销售总价",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.saleMoney),
  },
  {
    prop: "saleUnitPrice",
    label: "销售单价",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.saleUnitPrice),
  },
  {
    prop: "surveyMoney",
    label: "实测总价",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.surveyMoney),
  },
  { prop: "custName", label: "客户名", width: 100 },
  { prop: "custTel", label: "联系电话", width: 120 },
  { prop: "custTels", label: "备用联系", width: 120 },
  {
    prop: "cc",
    label: "已付金额",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.cc),
  }, // 字段调整
  {
    prop: "cc",
    label: "未付金额",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.cc),
  }, // 字段调整
  {
    prop: "loanPayMoney",
    label: "银行放款",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.loanPayMoney),
  },
  { prop: "loanPayDate", label: "放款日期", width: 120 },
  {
    prop: "refundMoney",
    label: "退款金额",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.refundMoney),
  },
  { prop: "remark", label: "备注详情", width: 220 },
  { prop: "orderCreateDate", label: "创建日期", width: 120 },
];

// 库存统计表-表头
export const inventoryStatisticsColumns: any = [
  { type: "index", label: "序号", width: 80 },
  {
    prop: "projName",
    label: "项目名称",
    width: 150,
    clickable: true, // 允许触发单元格事件
    clickEvent: "projName-click", // 事件名称
  },
  { prop: "bigProductTypeName", label: "业态", width: 150 },
  { prop: "totalRoomNum", label: "总套数", width: 150 },
  { prop: "totalMoney", label: "总货值(亿)", width: 150 },
  { prop: "stockRoomNum", label: "库存套数", width: 150 },
  { prop: "stockMoney", label: "库存总货值(亿)", width: 150 },
  { prop: "costNum", label: "月均去化套数", width: 150 }, // 提示：近6个月的平均值
  { prop: "costMoney", label: "月均去化金额(万)", width: 150 }, // 提示：近6个月的平均值
  { prop: "saleMonths", label: "存销比", width: 150 }, // 提示：库存总套数÷月均去化套数
];

// 库存明细表-表头
export const inventoryDetailColumns: any = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目名称" },
  { prop: "bigProductTypeName", label: "业态", width: 150 },
  { prop: "roomNum", label: "房号", width: 150 },
  { prop: "forecastArea", label: "预测面积(㎡)", width: 150 },
  {
    prop: "floorMoney",
    label: "底价总价(元)",
    width: 150,
    formatter: (row: any) => formatNumberDisplay(row.floorMoney),
  },
  { prop: "price", label: "底价单价(元/㎡)", width: 150 }, // 提示：元/平米
  { prop: "monthType", label: "库存周期", width: 150 },
  { prop: "areaType", label: "面积段", width: 150 },
  { prop: "moneyType", label: "总价段", width: 150 },
];
