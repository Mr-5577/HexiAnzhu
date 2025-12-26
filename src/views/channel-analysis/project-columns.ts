// 来访统计-天-表头
export const VisitingStatisticsDayColumns = [
  { prop: "projName", label: "项目", width: 200, fixed: "left" },
  { prop: "total", label: "总计", showSummary: true }, // 新增
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
// 来访统计-月-表头
export const VisitingStatisticsMonthColumns = [
  { prop: "projName", label: "项目", width: 240 },
  { prop: "total", label: "总计", showSummary: true }, // 新增
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
// 转化率统计-表头
export const conversionRateColumns: any = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目名称", width: 200 },
  { prop: "dylfComeNum", label: "当月来访人数" },
  { prop: "dyrgNum", label: "当月认购套数" },
  { prop: "qqlfrgNum", label: "前期来访本月成交套数" },
  { prop: "dylfrgNum", label: "当月来访当月成交套数" },
  {
    prop: "dylfZhl",
    label: "当月来访认购转化率",
    formatter: (row: any, column: any, index: number) => {
      const dylfZhl = row.dylfZhl || 0;
      if (!dylfZhl) {
        return "0%";
      }
      return `${(dylfZhl * 100).toFixed(2)}%`;
    },
  },
  {
    prop: "sylfZhl",
    label: "上月来访认购转化率",
    formatter: (row: any, column: any, index: number) => {
      const sylfZhl = row.sylfZhl || 0;
      if (!sylfZhl) {
        return "0%";
      }
      return `${(sylfZhl * 100).toFixed(2)}%`;
    },
  },
  {
    prop: "dyztZhl",
    label: "当月整体转化率",
    formatter: (row: any, column: any, index: number) => {
      const dyztZhl = row.dyztZhl || 0;
      if (!dyztZhl) {
        return "0%";
      }
      return `${(dyztZhl * 100).toFixed(2)}%`;
    },
  },
  {
    prop: "syztZhl",
    label: "上月整体转化率",
    formatter: (row: any, column: any, index: number) => {
      const syztZhl = row.syztZhl || 0;
      if (!syztZhl) {
        return "0%";
      }
      return `${(syztZhl * 100).toFixed(2)}%`;
    },
  },
];
