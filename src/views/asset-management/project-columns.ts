import { formatNumberDisplay } from "@/utils/common";

// 定义通用类型
type NumStr = number | string | null | undefined;

// 房间台账表-表头
export const roomLedgerColumns = [
  { prop: "projName", label: "项目", width: 220, fixed: "left" },
  { prop: "roomNum", label: "房号", width: 110 },
  { prop: "buildBatch", label: "楼栋分期", width: 90 },
  { prop: "forecastArea", label: "预测面积", width: 90 },
  { prop: "buildArea", label: "建筑面积", width: 90 },
  { prop: "bigProductTypeName", label: "业态", width: 70 },
  { prop: "smallProductTypeName", label: "二级业态", width: 120 },
  { prop: "saleStatusDesc", label: "状态", width: 80 },
  { prop: "payWayName", label: "付款方式", width: 90 },
  {
    prop: "listedPrice",
    label: "挂牌单价",
    width: 100,
    formatter: ({ listedPrice }: { listedPrice: NumStr }) =>
      formatNumberDisplay(listedPrice),
  },
  {
    prop: "listedMoney",
    label: "挂牌总价",
    width: 100,
    formatter: ({ listedMoney }: { listedMoney: NumStr }) =>
      formatNumberDisplay(listedMoney),
  },
  {
    prop: "price",
    label: "按揭单价",
    width: 100,
    formatter: ({ price }: { price: NumStr }) => formatNumberDisplay(price),
  },
  {
    prop: "floorMoney",
    label: "按揭底价",
    width: 100,
    formatter: ({ floorMoney }: { floorMoney: NumStr }) =>
      formatNumberDisplay(floorMoney),
  },
  {
    prop: "priceOffer",
    label: "全款单价",
    width: 100,
    formatter: ({ priceOffer }: { priceOffer: NumStr }) =>
      formatNumberDisplay(priceOffer),
  },
  {
    prop: "floorMoneyOffer",
    label: "全款底价",
    width: 100,
    formatter: ({ floorMoneyOffer }: { floorMoneyOffer: NumStr }) =>
      formatNumberDisplay(floorMoneyOffer),
  },
  { prop: "orderFloorMoney", label: "成交时系统底价", width: 140 },
  { prop: "saleDate", label: "认购日期", width: 120 },
  { prop: "asstDate", label: "成交日期", width: 120 },
  { prop: "signDate", label: "签约日期", width: 120 },
  { prop: "netDate", label: "网签日期", width: 120 },
  {
    prop: "saleMoney",
    label: "销售总价",
    width: 100,
    formatter: ({ saleMoney }: { saleMoney: NumStr }) =>
      formatNumberDisplay(saleMoney),
  },
  {
    prop: "unitPrice",
    label: "销售单价",
    width: 90,
    formatter: ({ unitPrice }: { unitPrice: NumStr }) =>
      formatNumberDisplay(unitPrice),
  },
  {
    prop: "surveyMoney",
    label: "实测总价",
    width: 100,
    formatter: ({ surveyMoney }: { surveyMoney: NumStr }) =>
      formatNumberDisplay(surveyMoney),
  },
  { prop: "custName", label: "客户姓名", width: 100 },
  { prop: "custTel", label: "联系电话", width: 120 },
  { prop: "custTels", label: "备用联系", width: 120 },
  {
    prop: "receivedMoney",
    label: "应收金额",
    width: 90,
    formatter: ({ receivedMoney }: { receivedMoney: NumStr }) =>
      formatNumberDisplay(receivedMoney),
  },
  {
    prop: "outstdMoney",
    label: "已收金额",
    width: 90,
    formatter: ({ outstdMoney }: { outstdMoney: NumStr }) =>
      formatNumberDisplay(outstdMoney),
  },
  {
    prop: "loanPayMoney",
    label: "银行放款",
    width: 100,
    formatter: ({ loanPayMoney }: { loanPayMoney: NumStr }) =>
      formatNumberDisplay(loanPayMoney),
  },
  { prop: "loanPayDate", label: "放款日期", width: 120 },
  {
    prop: "refundMoney",
    label: "退款金额",
    width: 90,
    formatter: ({ refundMoney }: { refundMoney: NumStr }) =>
      formatNumberDisplay(refundMoney),
  },
  { prop: "remark", label: "备注详情", width: 220 },
  { prop: "orderCreateDate", label: "创建日期", width: 120 },
];

// 库存统计表-表头
export const inventoryStatisticsColumns = [
  { type: "index", label: "序号", width: 80 },
  {
    prop: "projName",
    label: "项目名称",
    width: 220,
    clickable: true, // 允许触发单元格事件
    clickEvent: "projName-click", // 事件名称
  },
  { prop: "bigProductTypeName", label: "业态" },
  { prop: "totalRoomNum", label: "总套数" },
  { prop: "totalMoney", label: "总货值(亿)" },
  { prop: "stockRoomNum", label: "库存总套数" },
  { prop: "stockMoney", label: "库存总货值(亿)" },
  {
    prop: "costNum",
    label: "月均去化套数",
    // 方式一：使用配置方式增加表头提示，提示：近6个月的平均值
    headerTip: {
      icon: "QuestionFilled",
      content: "近6个月的平均值",
      placement: "top",
      width: "200px",
    },
  },
  {
    prop: "costMoney",
    label: "月均去化金额(万)",
    // 方式二：使用插槽方式，提示：近6个月的平均值
    headerSlot: "costMoneyHeader",
  },
  {
    prop: "saleMonths",
    label: "存销比",
    // 方式一：使用配置方式增加表头提示，提示：存销比=库存总套数÷月均去化套数
    headerTip: {
      icon: "QuestionFilled",
      content: "存销比=库存总套数÷月均去化套数",
      placement: "top",
      width: "200px",
    },
  },
];

// 库存明细表-表头
export const inventoryDetailColumns = [
  { type: "index", label: "序号", width: 80 },
  { prop: "projName", label: "项目名称", width: 220 },
  { prop: "bigProductTypeName", label: "业态" },
  { prop: "roomNum", label: "房号" },
  { prop: "forecastArea", label: "预测面积(㎡)" },
  {
    prop: "floorMoney",
    label: "底价总价(元)",
    formatter: ({ floorMoney }: { floorMoney: NumStr }) =>
      formatNumberDisplay(floorMoney),
  },
  { prop: "price", label: "底价单价(元/㎡)" },
  { prop: "monthType", label: "库存周期" },
  { prop: "areaType", label: "面积段" },
  { prop: "moneyType", label: "总价段" },
];

// 产值统计表-表头
export const outputStatisticsColumns = [
  {
    prop: "projName",
    label: "项目名称",
    width: 220,
    align: "left",
    fixed: "left",
  },
  { prop: "bigProductTypeName", label: "业态", width: 90, fixed: "left" },
  {
    label: "总产值",
    children: [
      { prop: "totalNum", label: "套数", width: 90 },
      {
        prop: "totalArea",
        label: "面积",
        width: 120,
        formatter: ({ totalArea }: { totalArea: NumStr }) =>
          formatNumberDisplay(totalArea),
      },
      { prop: "totalPrice", label: "单价", width: 100 },
      {
        prop: "totalMoney",
        label: "产值",
        width: 150,
        formatter: ({ totalMoney }: { totalMoney: NumStr }) =>
          formatNumberDisplay(totalMoney),
      },
    ],
  },
  {
    label: "年初销售数据",
    children: [
      {
        label: "认购销售数据",
        children: [
          { prop: "pYearNum", label: "认购套数", width: 90 },
          {
            prop: "pYearArea",
            label: "认购面积",
            width: 120,
            formatter: ({ pYearArea }: { pYearArea: NumStr }) =>
              formatNumberDisplay(pYearArea),
          },
          { prop: "pYearPrice", label: "认购均价", width: 100 },
          {
            prop: "pYearMoney",
            label: "认购金额",
            width: 150,
            formatter: ({ pYearMoney }: { pYearMoney: NumStr }) =>
              formatNumberDisplay(pYearMoney),
          },
          {
            prop: "pYearSkMoney",
            label: "已收款",
            width: 150,
            formatter: ({ pYearSkMoney }: { pYearSkMoney: NumStr }) =>
              formatNumberDisplay(pYearSkMoney),
          },
          {
            prop: "pYearSkMoneyUn",
            label: "未收款",
            width: 150,
            formatter: ({ pYearSkMoneyUn }: { pYearSkMoneyUn: NumStr }) =>
              formatNumberDisplay(pYearSkMoneyUn),
          },
        ],
      },
      {
        label: "网签销售数据",
        children: [
          { prop: "pYearNetNum", label: "网签套数", width: 100 },
          {
            prop: "pYearNetMoney",
            label: "网签金额",
            width: 150,
            formatter: ({ pYearNetMoney }: { pYearNetMoney: NumStr }) =>
              formatNumberDisplay(pYearNetMoney),
          },
        ],
      },
    ],
  },
  {
    label: "月初销售数据",
    children: [
      {
        label: "认购销售数据",
        children: [
          { prop: "pMonthNum", label: "认购套数", width: 90 },
          {
            prop: "pMonthArea",
            label: "认购面积",
            width: 120,
            formatter: ({ pMonthArea }: { pMonthArea: NumStr }) =>
              formatNumberDisplay(pMonthArea),
          },
          { prop: "pMonthPrice", label: "认购均价", width: 100 },
          {
            prop: "pMonthMoney",
            label: "认购金额",
            width: 150,
            formatter: ({ pMonthMoney }: { pMonthMoney: NumStr }) =>
              formatNumberDisplay(pMonthMoney),
          },
          {
            prop: "pMonthSkMoney",
            label: "已收款",
            width: 150,
            formatter: ({ pMonthSkMoney }: { pMonthSkMoney: NumStr }) =>
              formatNumberDisplay(pMonthSkMoney),
          },
          {
            prop: "pMonthSkMoneyUn",
            label: "未收款",
            width: 150,
            formatter: ({ pMonthSkMoneyUn }: { pMonthSkMoneyUn: NumStr }) =>
              formatNumberDisplay(pMonthSkMoneyUn),
          },
        ],
      },
      {
        label: "网签销售数据",
        children: [
          { prop: "pMonthNetNum", label: "网签套数", width: 90 },
          {
            prop: "pMonthNetMoney",
            label: "网签金额",
            width: 150,
            formatter: ({ pMonthNetMoney }: { pMonthNetMoney: NumStr }) =>
              formatNumberDisplay(pMonthNetMoney),
          },
        ],
      },
    ],
  },
  {
    label: "本月销售数据",
    children: [
      {
        label: "认购销售数据",
        children: [
          { prop: "cMonthNum", label: "认购套数", width: 90 },
          {
            prop: "cMonthArea",
            label: "认购面积",
            width: 120,
            formatter: ({ cMonthArea }: { cMonthArea: NumStr }) =>
              formatNumberDisplay(cMonthArea),
          },
          { prop: "cMonthPrice", label: "认购均价", width: 100 },
          {
            prop: "cMonthMoney",
            label: "认购金额",
            width: 150,
            formatter: ({ cMonthMoney }: { cMonthMoney: NumStr }) =>
              formatNumberDisplay(cMonthMoney),
          },
          {
            prop: "cMonthSkMoney",
            label: "已收款",
            width: 150,
            formatter: ({ cMonthSkMoney }: { cMonthSkMoney: NumStr }) =>
              formatNumberDisplay(cMonthSkMoney),
          },
          {
            prop: "cMonthSkMoneyUn",
            label: "未收款",
            width: 150,
            formatter: ({ cMonthSkMoneyUn }: { cMonthSkMoneyUn: NumStr }) =>
              formatNumberDisplay(cMonthSkMoneyUn),
          },
        ],
      },
      {
        label: "网签销售数据",
        children: [
          { prop: "cMonthNetNum", label: "网签套数", width: 90 },
          {
            prop: "cMonthNetMoney",
            label: "网签金额",
            width: 150,
            formatter: ({ cMonthNetMoney }: { cMonthNetMoney: NumStr }) =>
              formatNumberDisplay(cMonthNetMoney),
          },
        ],
      },
    ],
  },
  {
    label: "本年销售数据",
    children: [
      {
        label: "认购销售数据",
        children: [
          { prop: "cYearNum", label: "认购套数", width: 90 },
          {
            prop: "cYearArea",
            label: "认购面积",
            width: 120,
            formatter: ({ cYearArea }: { cYearArea: NumStr }) =>
              formatNumberDisplay(cYearArea),
          },
          { prop: "cYearPrice", label: "认购均价", width: 100 },
          {
            prop: "cYearMoney",
            label: "认购金额",
            width: 150,
            formatter: ({ cYearMoney }: { cYearMoney: NumStr }) =>
              formatNumberDisplay(cYearMoney),
          },
          {
            prop: "cYearSkMoney",
            label: "已收款",
            width: 150,
            formatter: ({ cYearSkMoney }: { cYearSkMoney: NumStr }) =>
              formatNumberDisplay(cYearSkMoney),
          },
          {
            prop: "cYearSkMoneyUn",
            label: "未收款",
            width: 150,
            formatter: ({ cYearSkMoneyUn }: { cYearSkMoneyUn: NumStr }) =>
              formatNumberDisplay(cYearSkMoneyUn),
          },
        ],
      },
      {
        label: "网签销售数据",
        children: [
          { prop: "cYearNetNum", label: "网签套数", width: 90 },
          {
            prop: "cYearNetMoney",
            label: "网签金额",
            width: 150,
            formatter: ({ cYearNetMoney }: { cYearNetMoney: NumStr }) =>
              formatNumberDisplay(cYearNetMoney),
          },
        ],
      },
    ],
  },
  {
    label: "累计销售数据",
    children: [
      {
        label: "认购销售数据",
        children: [
          { prop: "allNum", label: "认购套数", width: 90 },
          {
            prop: "allArea",
            label: "认购面积",
            width: 120,
            formatter: ({ allArea }: { allArea: NumStr }) =>
              formatNumberDisplay(allArea),
          },
          { prop: "allPrice", label: "认购均价", width: 100 },
          {
            prop: "allMoney",
            label: "认购金额",
            width: 150,
            formatter: ({ allMoney }: { allMoney: NumStr }) =>
              formatNumberDisplay(allMoney),
          },
          {
            prop: "allSkMoney",
            label: "已收款",
            width: 150,
            formatter: ({ allSkMoney }: { allSkMoney: NumStr }) =>
              formatNumberDisplay(allSkMoney),
          },
          {
            prop: "allSkMoneyUn",
            label: "未收款",
            width: 150,
            formatter: ({ allSkMoneyUn }: { allSkMoneyUn: NumStr }) =>
              formatNumberDisplay(allSkMoneyUn),
          },
        ],
      },
      {
        label: "网签销售数据",
        children: [
          { prop: "allNetNum", label: "网签套数", width: 90 },
          {
            prop: "allNetMoney",
            label: "网签金额",
            width: 150,
            formatter: ({ allNetMoney }: { allNetMoney: NumStr }) =>
              formatNumberDisplay(allNetMoney),
          },
        ],
      },
    ],
  },
  {
    label: "未售产值",
    children: [
      { prop: "notSaleNum", label: "套数", width: 90 },
      {
        prop: "notSaleArea",
        label: "面积",
        width: 120,
        formatter: ({ notSaleArea }: { notSaleArea: NumStr }) =>
          formatNumberDisplay(notSaleArea),
      },
      { prop: "notSalePrice", label: "均价", width: 100 },
      {
        prop: "notSaleMoney",
        label: "金额",
        width: 150,
        formatter: ({ notSaleMoney }: { notSaleMoney: NumStr }) =>
          formatNumberDisplay(notSaleMoney),
      },
    ],
  },
];
