// 销售年报表-表头
export const annualReportColumns: any = [
  { type: "index", label: "序号", width: 60, fixed: "left" },
  { prop: "projName", label: "项目", width: 220, fixed: "left" },
  { prop: "productTypeName", label: "考核类型", width: 150 },
  {
    label: "年度累计数据",
    children: [
      { prop: "totalOrderNum", label: "认购套数", width: 90 },
      { prop: "totalOrderMoney", label: "认购金额", width: 90 },
      { prop: "totalPrice", label: "成交均价", width: 90 },
      { prop: "totalSignNum", label: "签约套数", width: 90 },
      { prop: "totalSignMoney", label: "签约金额", width: 90 },
      { prop: "totalRecMoney", label: "回款金额", width: 90 },
    ],
  },
  {
    label: "项目累计未回款（万元）",
    children: [
      {
        label: "未签约",
        children: [
          { prop: "notSignNum", label: "套数", width: 80 },
          { prop: "notSignOutstdMoney", label: "金额", width: 100 },
        ],
      },
      {
        label: "已签约",
        children: [
          { prop: "signNum", label: "套数", width: 80 },
          { prop: "signOutstdMoney", label: "金额", width: 100 },
        ],
      },
      {
        label: "总计",
        children: [
          { prop: "totalOutstdNum", label: "套数", width: 80 },
          { prop: "totalOutstdMoney", label: "金额", width: 100 },
        ],
      },
    ],
  },
  {
    label: "年度目标任务",
    children: [
      { prop: "orderTask", label: "销售数量(套)", width: 90 },
      { prop: "signTask", label: "签约数量(套)", width: 90 },
      { prop: "collectTask", label: "回款金额(万元)", width: 90 },
    ],
  },
  {
    label: "年度实际完成",
    children: [
      { prop: "price", label: "销售数量(套)", width: 90 },
      { prop: "price", label: "签约数量(套)", width: 90 },
      { prop: "price", label: "回款金额(万元)", width: 90 },
    ],
  },
  {
    label: "年度达成率",
    children: [
      {
        prop: "orderRate",
        label: "销售数量",
        width: 100,
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
        label: "签约数量",
        width: 100,
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
        label: "回款金额",
        width: 100,
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
        label: "综合达成率",
        width: 100,
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
  { prop: "projName", label: "项目", width: 220, fixed: "left" },
  { prop: "productTypeName", label: "考核类型", width: 150 },
  {
    label: "当日销售数据",
    children: [
      { prop: "dayOrderNum", label: "认购套数", width: 90 },
      { prop: "dayPrice", label: "成交均价", width: 90 },
      { prop: "dayCheckoutNum", label: "退房挞定", width: 90 },
      { prop: "daySignNum", label: "签约套数", width: 90 },
      { prop: "dayRecMoney", label: "回款金额", width: 90 },
    ],
  },
  {
    label: "当月累计数据",
    children: [
      { prop: "totalOrderNum", label: "认购套数", width: 90 },
      { prop: "totalOrderMoney", label: "认购金额", width: 90 },
      { prop: "totalPrice", label: "成交均价", width: 90 },
      { prop: "totalSignNum", label: "签约套数", width: 90 },
      { prop: "totalSignMoney", label: "签约金额", width: 90 },
      { prop: "totalRecMoney", label: "回款金额", width: 90 },
    ],
  },
  {
    label: "项目累计未回款（万元）",
    children: [
      {
        label: "未签约",
        children: [
          { prop: "notSignNum", label: "套数", width: 80 },
          { prop: "notSignOutstdMoney", label: "金额", width: 100 },
        ],
      },
      {
        label: "已签约",
        children: [
          { prop: "signNum", label: "套数", width: 80 },
          { prop: "signOutstdMoney", label: "金额", width: 100 },
        ],
      },
      {
        label: "总计",
        children: [
          { prop: "totalOutstdNum", label: "套数", width: 80 },
          { prop: "totalOutstdMoney", label: "金额", width: 100 },
        ],
      },
    ],
  },
  {
    label: "月度目标任务",
    children: [
      { prop: "orderTask", label: "销售数量(套)", width: 90 },
      { prop: "signTask", label: "签约数量(套)", width: 90 },
      { prop: "collectTask", label: "回款金额(万元)", width: 90 },
    ],
  },
  {
    label: "月度实际完成",
    children: [
      { prop: "totalOrderNum", label: "销售数量(套)", width: 90 },
      { prop: "totalSignNum", label: "签约数量(套)", width: 90 },
      { prop: "totalRecMoney", label: "回款金额(万元)", width: 90 },
    ],
  },
  {
    label: "月度达成率",
    children: [
      {
        prop: "orderRate",
        label: "销售数量",
        width: 100,
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
        label: "签约数量",
        width: 100,
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
        label: "回款金额",
        width: 100,
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
        label: "综合达成率",
        width: 100,
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

// 认购达成统计-天-表头
export const SubscriptionStatisticsDayColumns = [
  { prop: "projName", label: "项目" },
  { prop: "d1", label: "1日" },
  { prop: "d2", label: "2日" },
  { prop: "d3", label: "3日" },
  { prop: "d4", label: "4日" },
  { prop: "d5", label: "5日" },
  { prop: "d6", label: "6日" },
  { prop: "d7", label: "7日" },
  { prop: "d8", label: "8日" },
  { prop: "d9", label: "9日" },
  { prop: "d10", label: "10日" },
  { prop: "d11", label: "11日" },
  { prop: "d12", label: "12日" },
  { prop: "d13", label: "13日" },
  { prop: "d14", label: "14日" },
  { prop: "d15", label: "15日" },
  { prop: "d16", label: "16日" },
  { prop: "d17", label: "17日" },
  { prop: "d18", label: "18日" },
  { prop: "d19", label: "19日" },
  { prop: "d20", label: "20日" },
  { prop: "d21", label: "21日" },
  { prop: "d22", label: "22日" },
  { prop: "d23", label: "23日" },
  { prop: "d24", label: "24日" },
  { prop: "d25", label: "25日" },
  { prop: "d26", label: "26日" },
  { prop: "d27", label: "27日" },
  { prop: "d28", label: "28日" },
  { prop: "d29", label: "29日" },
  { prop: "d30", label: "30日" },
  { prop: "d31", label: "31日" },
];
// 认购达成统计-月-表头
export const SubscriptionStatisticsMonthColumns = [
  { prop: "projName", label: "项目" },
  { prop: "m1", label: "1月" },
  { prop: "m2", label: "2月" },
  { prop: "m3", label: "3月" },
  { prop: "m4", label: "4月" },
  { prop: "m5", label: "5月" },
  { prop: "m6", label: "6月" },
  { prop: "m7", label: "7月" },
  { prop: "m8", label: "8月" },
  { prop: "m9", label: "9月" },
  { prop: "m10", label: "10月" },
  { prop: "m11", label: "11月" },
  { prop: "m12", label: "12月" },
];

// 置业顾问排名-表头
export const agentRankingColumns = [
  { prop: "sort", label: "集团排名" },
  { prop: "sortProj", label: "项目排名" },
  { prop: "salerName", label: "置业顾问" },
  { prop: "projName", label: "所属项目" },
  { prop: "orderNum", label: "认购" },
  { prop: "orderMoney", label: "认购金额" },
  { prop: "signNum", label: "签约" },
  { prop: "signMoney", label: "签约金额" },
  { prop: "payMoney", label: "回款金额" },
  { prop: "premiumMoney", label: "溢价金额" },
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
