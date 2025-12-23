// 来访统计-天-表头
export const VisitingStatisticsDayColumns = [
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
// 来访统计-月-表头
export const VisitingStatisticsMonthColumns = [
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
// 来访渠道分析-表头
export const visitingChannelColumns: any = [
  { type: "index", label: "序号", width: 80 },
  { prop: "projName", label: "项目" },
  { prop: "name", label: "自然" },
  { prop: "name", label: "内渠" },
  { prop: "name", label: "外渠" },
  { prop: "name", label: "全民" },
  { prop: "name", label: "内部员工推荐" },
  { prop: "name", label: "自拓" },
  { prop: "name", label: "工程抵款" },
  { prop: "name", label: "老带新" },
  { prop: "name", label: "房票" },
];
// 成交渠道分析-表头
export const dealChannelColumns: any = [
  { type: "index", label: "序号", width: 80, fixed: "left" },
  { prop: "projName", label: "项目", width: 240, fixed: "left" },
  { prop: "name", label: "成交合计", width: 100 },
  {
    label: "分销",
    children: [
      { prop: "num", label: "套数", width: 90 },
      { prop: "price", label: "占比", width: 90 },
    ],
  },
  {
    label: "内渠",
    children: [
      { prop: "num", label: "套数", width: 90 },
      { prop: "price", label: "占比", width: 90 },
    ],
  },
  {
    label: "全民经纪人",
    children: [
      { prop: "num", label: "套数", width: 90 },
      { prop: "price", label: "占比", width: 90 },
    ],
  },
  {
    label: "老带新",
    children: [
      { prop: "num", label: "套数", width: 90 },
      { prop: "price", label: "占比", width: 90 },
    ],
  },
  {
    label: "内部员工推荐",
    children: [
      { prop: "num", label: "套数", width: 90 },
      { prop: "price", label: "占比", width: 90 },
    ],
  },
  {
    label: "自然到访",
    children: [
      { prop: "num", label: "套数", width: 90 },
      { prop: "price", label: "占比", width: 90 },
    ],
  },
  {
    label: "员工自购",
    children: [
      { prop: "num", label: "套数", width: 90 },
      { prop: "price", label: "占比", width: 90 },
    ],
  },
  {
    label: "自拓",
    children: [
      { prop: "num", label: "套数", width: 90 },
      { prop: "price", label: "占比", width: 90 },
    ],
  },
  {
    label: "工抵",
    children: [
      { prop: "num", label: "套数", width: 90 },
      { prop: "price", label: "占比", width: 90 },
    ],
  },
  {
    label: "房票",
    children: [
      { prop: "num", label: "套数", width: 90 },
      { prop: "price", label: "占比", width: 90 },
    ],
  },
];
// 转化率统计-表头
export const conversionRateColumns: any = [
  { type: "index", label: "序号", width: 80 },
  { prop: "projName", label: "项目名称" },
  { prop: "dylfComeNum", label: "当月来访" },
  { prop: "dyrgNum", label: "当月认购" },
  { prop: "qqlfrgNum", label: "前期来访本月成交套数" },
  { prop: "dylfrgNum", label: "当月来访当月成交套数" },
  { prop: "dylfZhl", label: "当月来访认购转化率" },
  { prop: "sylfZhl", label: "上月来访认购转化率" },
  { prop: "dyztZhl", label: "当月整体转化率" },
  { prop: "syztZhl", label: "上月整体转化率" },
];
