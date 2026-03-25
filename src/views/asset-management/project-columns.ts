import { formatNumberDisplay } from "@/utils/common";

// 房间台账表-表头
export const roomLedgerColumns: any = [
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
    formatter: (row: any) => formatNumberDisplay(row.listedPrice),
  },
  {
    prop: "listedMoney",
    label: "挂牌总价",
    width: 100,
    formatter: (row: any) => formatNumberDisplay(row.listedMoney),
  },
  {
    prop: "price",
    label: "按揭单价",
    width: 100,
    formatter: (row: any) => formatNumberDisplay(row.price),
  },
  {
    prop: "floorMoney",
    label: "按揭底价",
    width: 100,
    formatter: (row: any) => formatNumberDisplay(row.floorMoney),
  },
  {
    prop: "priceOffer",
    label: "全款单价",
    width: 100,
    formatter: (row: any) => formatNumberDisplay(row.priceOffer),
  },
  {
    prop: "floorMoneyOffer",
    label: "全款底价",
    width: 100,
    formatter: (row: any) => formatNumberDisplay(row.floorMoneyOffer),
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
    formatter: (row: any) => formatNumberDisplay(row.saleMoney),
  },
  {
    prop: "unitPrice",
    label: "销售单价",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.unitPrice),
  },
  {
    prop: "surveyMoney",
    label: "实测总价",
    width: 100,
    formatter: (row: any) => formatNumberDisplay(row.surveyMoney),
  },
  { prop: "custName", label: "客户姓名", width: 100 },
  { prop: "custTel", label: "联系电话", width: 120 },
  { prop: "custTels", label: "备用联系", width: 120 },
  {
    prop: "receivedMoney",
    label: "应收金额",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.receivedMoney),
  },
  {
    prop: "outstdMoney",
    label: "已收金额",
    width: 90,
    formatter: (row: any) => formatNumberDisplay(row.outstdMoney),
  },
  {
    prop: "loanPayMoney",
    label: "银行放款",
    width: 100,
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
export const inventoryDetailColumns: any = [
  { type: "index", label: "序号", width: 80 },
  { prop: "projName", label: "项目名称", width: 220 },
  { prop: "bigProductTypeName", label: "业态" },
  { prop: "roomNum", label: "房号" },
  { prop: "forecastArea", label: "预测面积(㎡)" },
  {
    prop: "floorMoney",
    label: "底价总价(元)",
    formatter: (row: any) => formatNumberDisplay(row.floorMoney),
  },
  { prop: "price", label: "底价单价(元/㎡)" },
  { prop: "monthType", label: "库存周期" },
  { prop: "areaType", label: "面积段" },
  { prop: "moneyType", label: "总价段" },
];

// 产值统计表-表头
export const outputStatisticsColumns: any = [
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
        formatter: (row: any) => formatNumberDisplay(row.totalArea),
      },
      { prop: "totalPrice", label: "单价", width: 100 },
      {
        prop: "totalMoney",
        label: "产值",
        width: 150,
        formatter: (row: any) => formatNumberDisplay(row.totalMoney),
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
            formatter: (row: any) => formatNumberDisplay(row.pYearArea),
          },
          { prop: "pYearPrice", label: "认购均价", width: 100 },
          {
            prop: "pYearMoney",
            label: "认购金额",
            width: 150,
            formatter: (row: any) => formatNumberDisplay(row.pYearMoney),
          },
          {
            prop: "pYearSkMoney",
            label: "已收款",
            width: 150,
            formatter: (row: any) => formatNumberDisplay(row.pYearSkMoney),
          },
          {
            prop: "pYearSkMoneyUn",
            label: "未收款",
            width: 150,
            formatter: (row: any) => formatNumberDisplay(row.pYearSkMoneyUn),
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
            formatter: (row: any) => formatNumberDisplay(row.pYearNetMoney),
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
            formatter: (row: any) => formatNumberDisplay(row.pMonthArea),
          },
          { prop: "pMonthPrice", label: "认购均价", width: 100 },
          {
            prop: "pMonthMoney",
            label: "认购金额",
            width: 150,
            formatter: (row: any) => formatNumberDisplay(row.pMonthMoney),
          },
          {
            prop: "pMonthSkMoney",
            label: "已收款",
            width: 150,
            formatter: (row: any) => formatNumberDisplay(row.pMonthSkMoney),
          },
          {
            prop: "pMonthSkMoneyUn",
            label: "未收款",
            width: 150,
            formatter: (row: any) => formatNumberDisplay(row.pMonthSkMoneyUn),
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
            formatter: (row: any) => formatNumberDisplay(row.pMonthNetMoney),
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
            formatter: (row: any) => formatNumberDisplay(row.cMonthArea),
          },
          { prop: "cMonthPrice", label: "认购均价", width: 100 },
          {
            prop: "cMonthMoney",
            label: "认购金额",
            width: 150,
            formatter: (row: any) => formatNumberDisplay(row.cMonthMoney),
          },
          {
            prop: "cMonthSkMoney",
            label: "已收款",
            width: 150,
            formatter: (row: any) => formatNumberDisplay(row.cMonthSkMoney),
          },
          {
            prop: "cMonthSkMoneyUn",
            label: "未收款",
            width: 150,
            formatter: (row: any) => formatNumberDisplay(row.cMonthSkMoneyUn),
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
            formatter: (row: any) => formatNumberDisplay(row.cMonthNetMoney),
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
            formatter: (row: any) => formatNumberDisplay(row.cYearArea),
          },
          { prop: "cYearPrice", label: "认购均价", width: 100 },
          {
            prop: "cYearMoney",
            label: "认购金额",
            width: 150,
            formatter: (row: any) => formatNumberDisplay(row.cYearMoney),
          },
          {
            prop: "cYearSkMoney",
            label: "已收款",
            width: 150,
            formatter: (row: any) => formatNumberDisplay(row.cYearSkMoney),
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
            formatter: (row: any) => formatNumberDisplay(row.cYearNetMoney),
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
            formatter: (row: any) => formatNumberDisplay(row.allArea),
          },
          { prop: "allPrice", label: "认购均价", width: 100 },
          {
            prop: "allMoney",
            label: "认购金额",
            width: 150,
            formatter: (row: any) => formatNumberDisplay(row.allMoney),
          },
          {
            prop: "allSkMoney",
            label: "已收款",
            width: 150,
            formatter: (row: any) => formatNumberDisplay(row.allSkMoney),
          },
          {
            prop: "allSkMoneyUn",
            label: "未收款",
            width: 150,
            formatter: (row: any) => formatNumberDisplay(row.allSkMoneyUn),
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
            formatter: (row: any) => formatNumberDisplay(row.allNetMoney),
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
        formatter: (row: any) => formatNumberDisplay(row.notSaleArea),
      },
      { prop: "notSalePrice", label: "均价", width: 100 },
      {
        prop: "notSaleMoney",
        label: "金额",
        width: 150,
        formatter: (row: any) => formatNumberDisplay(row.notSaleMoney),
      },
    ],
  },
];
