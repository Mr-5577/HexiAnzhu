import { formatNumber, formatNumberDisplay } from "@/utils/common";

// 销售年报表-表头
export const AnnualReportColumns: any = [
  { type: "index", label: "序号", width: 60, fixed: "left" },
  { prop: "projName", label: "项目", width: 220, align: "left", fixed: "left" },
  { prop: "productTypeName", label: "考核业态", width: 120 },
  {
    label: "年度累计数据(万元)",
    children: [
      {
        prop: "totalComeNum",
        label: "来访人数",
        width: 90,
        showSummary: true,
      },
      {
        prop: "totalOrderNum",
        label: "成交套数",
        width: 90,
        clickable: true, // 允许触发单元格事件
        clickEvent: "order-name-click", // 事件名称
        showSummary: true,
      },
      {
        prop: "totalOrderMoney",
        label: "成交金额",
        width: 100,
        clickable: true, // 允许触发单元格事件
        clickEvent: "order-name-click", // 事件名称
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.totalOrderMoney),
      },
      { prop: "totalPrice", label: "成交均价", width: 100 },
      {
        prop: "totalCheckoutNum",
        label: "退房挞定",
        width: 90,
        showSummary: true,
        clickable: true, // 允许触发单元格事件
        clickEvent: "totalCheckoutNum-click", // 事件名称
      },
      {
        prop: "totalSignNum",
        label: "签约套数",
        width: 90,
        clickable: true, // 允许触发单元格事件
        clickEvent: "sgin-name-click", // 事件名称
        showSummary: true,
      },
      {
        prop: "totalSignMoney",
        label: "签约金额",
        width: 100,
        clickable: true, // 允许触发单元格事件
        clickEvent: "sgin-name-click", // 事件名称
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.totalSignMoney),
      },
      {
        prop: "totalRecMoney",
        label: "回款金额",
        width: 100,
        clickable: true, // 允许触发单元格事件
        clickEvent: "payment-name-click", // 事件名称
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.totalRecMoney),
      },
      {
        prop: "totalPemMoney",
        label: "溢价金额",
        width: 100,
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.totalPemMoney),
        clickable: true, // 允许触发单元格事件
        clickEvent: "totalPemMoney-click", // 事件名称
      },
      {
        prop: "totalPemRate",
        label: "溢价率",
        width: 90,
        formatter: (row: any, column: any, index: number) => {
          const totalPemRate = row.totalPemRate || 0;
          if (!totalPemRate) {
            return "0%";
          }
          return `${(totalPemRate * 100).toFixed(2)}%`;
        },
      },
    ],
  },
  {
    label: "项目累计未回款（万元）",
    children: [
      {
        label: "未签约",
        children: [
          { prop: "notSignNum", label: "套数", width: 80, showSummary: true },
          {
            prop: "notSignOutstdMoney",
            label: "金额",
            width: 100,
            showSummary: true,
            formatter: (row: any) =>
              formatNumberDisplay(row.notSignOutstdMoney),
          },
        ],
      },
      {
        label: "已签约",
        children: [
          { prop: "signNum", label: "套数", width: 80, showSummary: true },
          {
            prop: "signOutstdMoney",
            label: "金额",
            width: 100,
            showSummary: true,
            formatter: (row: any) => formatNumberDisplay(row.signOutstdMoney),
          },
        ],
      },
      {
        label: "总计",
        children: [
          {
            prop: "totalOutstdNum",
            label: "套数",
            width: 80,
            showSummary: true,
            clickable: true, // 允许触发单元格事件
            clickEvent: "total-name-click", // 事件名称
          },
          {
            prop: "totalOutstdMoney",
            label: "金额",
            width: 100,
            clickable: true, // 允许触发单元格事件
            clickEvent: "total-name-click", // 事件名称
            showSummary: true,
            formatter: (row: any) => formatNumberDisplay(row.totalOutstdMoney),
          },
        ],
      },
      {
        label: "物业借款",
        children: [
          {
            prop: "loanNum",
            label: "套数",
            width: 80,
            showSummary: true,
          },
          {
            prop: "loanOutstdMoney",
            label: "金额",
            width: 100,
            showSummary: true,
            formatter: (row: any) => formatNumberDisplay(row.loanOutstdMoney),
          },
        ],
      },
    ],
  },
  {
    label: "年度目标任务(万元)",
    children: [
      { prop: "orderTask", label: "成交套数", width: 90, showSummary: true },
      { prop: "signTask", label: "签约套数", width: 90, showSummary: true },
      {
        prop: "collectTask",
        label: "回款金额",
        width: 90,
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.collectTask),
      },
    ],
  },
  {
    label: "年度实际完成(万元)",
    children: [
      {
        prop: "totalOrderNum",
        label: "成交套数",
        width: 90,
        showSummary: true,
        clickable: true, // 允许触发单元格事件
        clickEvent: "order-name-click", // 事件名称
      },
      {
        prop: "totalSignNum",
        label: "签约套数",
        width: 90,
        showSummary: true,
        clickable: true, // 允许触发单元格事件
        clickEvent: "sgin-name-click", // 事件名称
      },
      {
        prop: "totalRecMoney",
        label: "回款金额",
        width: 90,
        clickable: true, // 允许触发单元格事件
        clickEvent: "payment-name-click", // 事件名称
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.totalRecMoney),
      },
    ],
  },
  {
    label: "年度达成率",
    children: [
      {
        prop: "orderRate",
        label: "成交",
        width: 80,
        formatter: (row: any, column: any, index: number) => {
          const orderRate = row.orderRate || 0;
          if (!orderRate) {
            return "0%";
          }
          return `${(orderRate * 100).toFixed(2)}%`;
        },
      },
      {
        prop: "signRate",
        label: "签约",
        width: 80,
        formatter: (row: any, column: any, index: number) => {
          const signRate = row.signRate || 0;
          if (!signRate) {
            return "0%";
          }
          return `${(signRate * 100).toFixed(2)}%`;
        },
      },
      {
        prop: "collectRate",
        label: "回款",
        width: 80,
        formatter: (row: any, column: any, index: number) => {
          const collectRate = row.collectRate || 0;
          if (!collectRate) {
            return "0%";
          }
          return `${(collectRate * 100).toFixed(2)}%`;
        },
      },
      {
        prop: "totalRate",
        label: "综合",
        width: 80,
        formatter: (row: any, column: any, index: number) => {
          const totalRate = row.totalRate || 0;
          if (!totalRate) {
            return "0%";
          }
          return `${(totalRate * 100).toFixed(2)}%`;
        },
      },
    ],
  },
];

// 销售日报表-表头
export const dailylReportColumns: any = [
  { type: "index", label: "序号", width: 60, fixed: "left" },
  { prop: "projName", label: "项目", width: 220, align: "left", fixed: "left" },
  { prop: "productTypeName", label: "考核业态", width: 120 },
  {
    label: "当日销售数据(万元)",
    children: [
      {
        prop: "dayComeNum",
        label: "来访人数",
        width: 90,
        showSummary: true,
      },
      {
        prop: "dayOrderNum",
        label: "成交套数",
        width: 90,
        showSummary: true, // 允许合计
        clickable: true, // 允许触发单元格事件
        clickEvent: "order-name-click", // 事件名称
      },
      { prop: "dayPrice", label: "销售均价", width: 90 },
      {
        prop: "dayCheckoutNum",
        label: "退房挞定",
        width: 90,
        showSummary: true,
        clickable: true, // 允许触发单元格事件
        clickEvent: "dayCheckoutNum-click", // 事件名称
      },
      {
        prop: "daySignNum",
        label: "签约套数",
        width: 90,
        showSummary: true,
        clickable: true, // 允许触发单元格事件
        clickEvent: "sgin-name-click", // 事件名称
      },
      {
        prop: "dayRecMoney",
        label: "回款金额",
        width: 90,
        showSummary: true, // 运行合计
        formatter: (row: any) => formatNumberDisplay(row.dayRecMoney), // 千分位并保留2为小数
        clickable: true, // 允许触发单元格事件
        clickEvent: "payment-name-click", // 事件名称
      },
      {
        prop: "dayPemMoney",
        label: "溢价金额",
        width: 90,
        showSummary: true,
        clickable: true, // 允许触发单元格事件
        clickEvent: "dayPemMoney-click", // 事件名称
      },
      {
        prop: "dayPemRate",
        label: "溢价率",
        width: 90,
        formatter: (row: any, column: any, index: number) => {
          const dayPemRate = row.dayPemRate || 0;
          if (!dayPemRate) {
            return "0%";
          }
          return `${(dayPemRate * 100).toFixed(2)}%`;
        },
      },
    ],
  },
  {
    label: "当月累计数据(万元)",
    children: [
      {
        prop: "totalComeNum",
        label: "来访人数",
        width: 90,
        showSummary: true,
      },
      {
        prop: "totalOrderNum",
        label: "成交套数",
        width: 90,
        showSummary: true,
        clickable: true, // 允许触发单元格事件
        clickEvent: "totalOrderNum-click", // 事件名称
      },
      {
        prop: "totalOrderMoney",
        label: "成交金额",
        width: 90,
        clickable: true, // 允许触发单元格事件
        clickEvent: "totalOrderNum-click", // 事件名称
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.totalOrderMoney),
      },
      { prop: "totalPrice", label: "销售均价", width: 100 },
      {
        prop: "totalCheckoutNum",
        label: "退房挞定",
        width: 90,
        showSummary: true,
        clickable: true, // 允许触发单元格事件
        clickEvent: "totalCheckoutNum-click", // 事件名称
      },
      {
        prop: "totalSignNum",
        label: "签约套数",
        width: 90,
        showSummary: true,
        clickable: true, // 允许触发单元格事件
        clickEvent: "totalSignNum-click", // 事件名称
      },
      {
        prop: "totalSignMoney",
        label: "签约金额",
        width: 90,
        clickable: true, // 允许触发单元格事件
        clickEvent: "totalSignNum-click", // 事件名称
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.totalSignMoney),
      },
      {
        prop: "totalRecMoney",
        label: "回款金额",
        width: 90,
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.totalRecMoney),
        clickable: true, // 允许触发单元格事件
        clickEvent: "totalRecMoney-click", // 事件名称
      },
      {
        prop: "totalPemMoney",
        label: "溢价金额",
        width: 90,
        showSummary: true,
        clickable: true, // 允许触发单元格事件
        clickEvent: "totalPemMoney-click", // 事件名称
      },
      {
        prop: "totalPemRate",
        label: "溢价率",
        width: 90,
        formatter: (row: any, column: any, index: number) => {
          const totalPemRate = row.totalPemRate || 0;
          if (!totalPemRate) {
            return "0%";
          }
          return `${(totalPemRate * 100).toFixed(2)}%`;
        },
      },
    ],
  },
  {
    label: "项目累计未回款（万元）",
    children: [
      {
        label: "未签约",
        children: [
          { prop: "notSignNum", label: "套数", width: 80, showSummary: true },
          {
            prop: "notSignOutstdMoney",
            label: "金额",
            width: 100,
            showSummary: true,
            formatter: (row: any) =>
              formatNumberDisplay(row.notSignOutstdMoney),
          },
        ],
      },
      {
        label: "已签约",
        children: [
          { prop: "signNum", label: "套数", width: 80, showSummary: true },
          {
            prop: "signOutstdMoney",
            label: "金额",
            width: 100,
            showSummary: true,
            formatter: (row: any) => formatNumberDisplay(row.signOutstdMoney),
          },
        ],
      },
      {
        label: "总计",
        children: [
          {
            prop: "totalOutstdNum",
            label: "套数",
            width: 80,
            showSummary: true,
            clickable: true, // 允许触发单元格事件
            clickEvent: "total-name-click", // 事件名称
          },
          {
            prop: "totalOutstdMoney",
            label: "金额",
            width: 100,
            showSummary: true,
            formatter: (row: any) => formatNumberDisplay(row.totalOutstdMoney),
            clickable: true, // 允许触发单元格事件
            clickEvent: "total-name-click", // 事件名称
          },
        ],
      },
      {
        label: "物业借款",
        children: [
          {
            prop: "loanNum",
            label: "套数",
            width: 80,
            showSummary: true,
          },
          {
            prop: "loanOutstdMoney",
            label: "金额",
            width: 100,
            showSummary: true,
            formatter: (row: any) => formatNumberDisplay(row.loanOutstdMoney),
          },
        ],
      },
    ],
  },
  {
    label: "月度目标任务(万元)",
    children: [
      { prop: "orderTask", label: "成交套数", width: 90, showSummary: true },
      { prop: "signTask", label: "签约套数", width: 90, showSummary: true },
      {
        prop: "collectTask",
        label: "回款金额",
        width: 90,
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.collectTask),
      },
    ],
  },
  {
    label: "月度实际完成(万元)",
    children: [
      {
        prop: "totalOrderNum",
        label: "成交套数",
        width: 90,
        showSummary: true,
        clickable: true, // 允许触发单元格事件
        clickEvent: "totalOrderNum-click", // 事件名称
      },
      {
        prop: "totalSignNum",
        label: "签约套数",
        width: 90,
        showSummary: true,
        clickable: true, // 允许触发单元格事件
        clickEvent: "totalSignNum-click", // 事件名称
      },
      {
        prop: "totalRecMoney",
        label: "回款金额",
        width: 90,
        clickable: true, // 允许触发单元格事件
        clickEvent: "totalRecMoney-click", // 事件名称
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.totalRecMoney),
      },
    ],
  },
  {
    label: "月度达成率",
    children: [
      {
        prop: "orderRate",
        label: "成交",
        width: 80,
        formatter: (row: any, column: any, index: number) => {
          const orderRate = row.orderRate || 0;
          if (!orderRate) {
            return "0%";
          }
          return `${(orderRate * 100).toFixed(2)}%`;
        },
      },
      {
        prop: "signRate",
        label: "签约",
        width: 80,
        formatter: (row: any, column: any, index: number) => {
          const signRate = row.signRate || 0;
          if (!signRate) {
            return "0%";
          }
          return `${(signRate * 100).toFixed(2)}%`;
        },
      },
      {
        prop: "collectRate",
        label: "回款",
        width: 80,
        formatter: (row: any, column: any, index: number) => {
          const collectRate = row.collectRate || 0;
          if (!collectRate) {
            return "0%";
          }
          return `${(collectRate * 100).toFixed(2)}%`;
        },
      },
      {
        prop: "totalRate",
        label: "综合",
        width: 80,
        formatter: (row: any, column: any, index: number) => {
          const totalRate = row.totalRate || 0;
          if (!totalRate) {
            return "0%";
          }
          return `${(totalRate * 100).toFixed(2)}%`;
        },
      },
    ],
  },
];

// 认购业绩明细-表头
export const SubDetailColumns: any = [
  { type: "index", label: "序号", width: 60, fixed: "left" },
  { prop: "projName", label: "项目", width: 220, fixed: "left" },
  { prop: "bigProductTypeName", label: "业态", width: 90 },
  { prop: "roomNum", label: "房号", width: 150 },
  {
    prop: "forecastArea",
    label: "预测面积",
    width: 90,
    showSummary: true, // 标记需要合计
    // 存储时用 formatNumberDisplay (返回字符串)
    formatter: (row: any) => formatNumberDisplay(row.forecastArea),
  },
  { prop: "custName", label: "业主", width: 100 },
  { prop: "custTel", label: "联系电话", width: 120 },
  {
    prop: "floorMoney",
    label: "底价总价",
    width: 120,
    showSummary: true, // 标记需要合计
    // 存储时用 formatNumber(返回数字)
    // formatter: (row: any) => formatNumberDisplay(row.floorMoney),
    // 或者如果需要原始数值，可以这样：
    formatter: (row: any, column: any) => {
      // 存储数值
      const numValue = formatNumber(row.floorMoney);
      // 显示带千分位的字符串
      return formatNumberDisplay(numValue);
    },
  },
  {
    prop: "saleMoney",
    label: "销售总价",
    width: 120,
    showSummary: true, // 标记需要合计
    formatter: (row: any) => formatNumberDisplay(row.saleMoney),
  },
  {
    prop: "saleUnitPrice",
    label: "销售单价",
    width: 120,
    showSummary: true, // 标记需要合计
    formatter: (row: any) => formatNumberDisplay(row.saleUnitPrice),
  },
  { prop: "saleDate", label: "认购日期", width: 120 },
  { prop: "asstDate", label: "成交日期", width: 120 },
  { prop: "syearMonth", label: "业绩年月", width: 100 },
  { prop: "saleNum", label: "业绩套数", width: 90, showSummary: true },
  { prop: "signDate", label: "签约日期", width: 120 },
  { prop: "salerName", label: "置业顾问", width: 150 },
  { prop: "typeName", label: "业务类型", width: 100 },
];
// 签约业绩-表头
export const ContractDetailColumns: any = [
  { type: "index", label: "序号", width: 60, fixed: "left" },
  { prop: "projName", label: "项目", width: 220, fixed: "left" },
  { prop: "bigProductTypeName", label: "业态", width: 100 },
  { prop: "roomNum", label: "房号", width: 150 },
  { prop: "forecastArea", label: "预测面积", width: 100, showSummary: true },
  { prop: "custName", label: "业主", width: 100 },
  { prop: "custTel", label: "联系电话", width: 120 },
  {
    prop: "floorMoney",
    label: "底价总价",
    width: 120,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.floorMoney),
  },
  {
    prop: "saleMoney",
    label: "销售总价",
    width: 120,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.saleMoney),
  },
  {
    prop: "saleUnitPrice",
    label: "销售单价",
    width: 120,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.saleUnitPrice),
  },
  { prop: "saleDate", label: "认购日期", width: 120 },
  { prop: "signTime", label: "签约日期", width: 120 },
  { prop: "syearMonth", label: "业绩年月", width: 100 },
  { prop: "signNum", label: "业绩套数", width: 100, showSummary: true },
  {
    prop: "saleMoneyInc",
    label: "签约增量金额",
    width: 120,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.saleMoneyInc),
  },
  { prop: "salerName", label: "置业顾问", width: 150 },
  { prop: "typeName", label: "业务类型", width: 100 },
];
// 回款业绩-表头
export const CollectionDetailColumns: any = [
  { type: "index", label: "序号", width: 60, fixed: "left" },
  { prop: "projName", label: "项目", width: 220, fixed: "left" },
  { prop: "bigProductTypeName", label: "业态", width: 120 },
  { prop: "roomNum", label: "房号", width: 150 },
  { prop: "forecastArea", label: "预测面积", width: 100, showSummary: true },
  { prop: "custName", label: "业主", width: 100 },
  { prop: "custTel", label: "联系电话", width: 120 },
  {
    prop: "saleMoney",
    label: "销售总价",
    width: 120,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.saleMoney),
  },
  { prop: "saleDate", label: "认购日期", width: 120 },
  { prop: "collectDate", label: "回款日期", width: 120 },
  { prop: "syearMonth", label: "业绩年月", width: 100 },
  {
    prop: "collectMoney",
    label: "回款金额",
    width: 120,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.collectMoney),
  },
  { prop: "salerName", label: "置业顾问", width: 150 },
  { prop: "typeName", label: "业务类型", width: 100 },
];
// 认购达成统计-天-表头
export const SubscriptionStatisticsDayColumns = [
  { prop: "d1", label: "1日", showSummary: true },
  { prop: "d2", label: "2日", showSummary: true },
  { prop: "d3", label: "3日", showSummary: true },
  { prop: "d4", label: "4日", showSummary: true },
  { prop: "d5", label: "5日", showSummary: true },
  { prop: "d6", label: "6日", showSummary: true },
  { prop: "d7", label: "7日", showSummary: true },
  { prop: "d8", label: "8日", showSummary: true },
  { prop: "d9", label: "9日", showSummary: true },
  { prop: "d10", label: "10日", showSummary: true },
  { prop: "d11", label: "11日", showSummary: true },
  { prop: "d12", label: "12日", showSummary: true },
  { prop: "d13", label: "13日", showSummary: true },
  { prop: "d14", label: "14日", showSummary: true },
  { prop: "d15", label: "15日", showSummary: true },
  { prop: "d16", label: "16日", showSummary: true },
  { prop: "d17", label: "17日", showSummary: true },
  { prop: "d18", label: "18日", showSummary: true },
  { prop: "d19", label: "19日", showSummary: true },
  { prop: "d20", label: "20日", showSummary: true },
  { prop: "d21", label: "21日", showSummary: true },
  { prop: "d22", label: "22日", showSummary: true },
  { prop: "d23", label: "23日", showSummary: true },
  { prop: "d24", label: "24日", showSummary: true },
  { prop: "d25", label: "25日", showSummary: true },
  { prop: "d26", label: "26日", showSummary: true },
  { prop: "d27", label: "27日", showSummary: true },
  { prop: "d28", label: "28日", showSummary: true },
  { prop: "d29", label: "29日", showSummary: true },
  { prop: "d30", label: "30日", showSummary: true },
  { prop: "d31", label: "31日", showSummary: true },
];
// 认购达成统计-月-表头
export const SubscriptionStatisticsMonthColumns = [
  { prop: "projName", label: "项目", width: 240 },
  { prop: "total", label: "总计", showSummary: true },
  { prop: "m1", label: "1月", showSummary: true },
  { prop: "m2", label: "2月", showSummary: true },
  { prop: "m3", label: "3月", showSummary: true },
  { prop: "m4", label: "4月", showSummary: true },
  { prop: "m5", label: "5月", showSummary: true },
  { prop: "m6", label: "6月", showSummary: true },
  { prop: "m7", label: "7月", showSummary: true },
  { prop: "m8", label: "8月", showSummary: true },
  { prop: "m9", label: "9月", showSummary: true },
  { prop: "m10", label: "10月", showSummary: true },
  { prop: "m11", label: "11月", showSummary: true },
  { prop: "m12", label: "12月", showSummary: true },
];

// 置业顾问排名-表头
export const agentRankingColumns = [
  { prop: "sort", label: "集团排名", width: 90 },
  { prop: "sortProj", label: "项目排名", width: 90 },
  { prop: "salerName", label: "置业顾问" },
  { prop: "projName", label: "所属项目", width: 220 },
  { prop: "orderNum", label: "认购业绩套数" },
  {
    prop: "orderMoney",
    label: "认购业绩金额",
    formatter: (row: any) => formatNumberDisplay(row.orderMoney),
  },
  { prop: "signNum", label: "签约套数" },
  {
    prop: "signMoney",
    label: "签约金额",
    formatter: (row: any) => formatNumberDisplay(row.signMoney),
  },
  {
    prop: "payMoney",
    label: "回款金额",
    formatter: (row: any) => formatNumberDisplay(row.payMoney),
  },
  {
    prop: "premiumMoney",
    label: "溢价金额",
    formatter: (row: any) => formatNumberDisplay(row.premiumMoney),
  },
  {
    prop: "premiumRate",
    label: "溢价比例",
    formatter: (row: any, column: any, index: number) => {
      // 获取溢价金额和底价
      const premiumMoney = row.premiumMoney || 0;
      const floorMoney = row.floorMoney || 0;
      // 避免除以零
      if (!floorMoney || floorMoney <= 0) {
        return "0.00%";
      }
      // 计算溢价比例（溢价金额 / 底价 * 100%）
      const premiumRate = (premiumMoney / floorMoney) * 100;
      // 保留两位小数并添加百分号
      return `${premiumRate.toFixed(2)}%`;
    },
  },
];
