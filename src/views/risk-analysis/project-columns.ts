// 认购转签约统计-表头
export const conversionStatsColumns = [
  { prop: "name", label: "项目" },
  { prop: "name", label: "签约套数" },
  { prop: "name", label: "认转签周期" },
  { prop: "name", label: "最小周期" },
  { prop: "name", label: "最大周期" },
];

// 认购转签约明细-表头
export const conversionDetailColumns = [
  { prop: "index", label: "序号", width: 60 },
  { prop: "name", label: "项目", width: 240 },
  { prop: "name", label: "业态" },
  { prop: "name", label: "房号" },
  { prop: "name", label: "建筑面积" },
  { prop: "name", label: "业主" },
  { prop: "name", label: "联系电话" },
  { prop: "name", label: "底价金额" },
  { prop: "name", label: "认购金额" },
  { prop: "name", label: "认购日期" },
  { prop: "name", label: "签约日期" },
  { prop: "name", label: "签约周期" },
];

// 认购未签约统计-表头
export const pendingStatsColumns = [
  { prop: "name", label: "项目" },
  { prop: "name", label: "认购套数" },
  { prop: "name", label: "成交面积" },
  { prop: "name", label: "成交总金额" },
  { prop: "name", label: "未签约套数" },
  { prop: "name", label: "未签约金额" },
  { prop: "name", label: "最大周期" },
  { prop: "name", label: "平均周期" },
];

// 认购未签约明细-表头
export const pendingDetailColumns = [
  { prop: "index", label: "序号", width: 60 },
  { prop: "name", label: "项目", width: 240 },
  { prop: "name", label: "业态" },
  { prop: "name", label: "房号" },
  { prop: "name", label: "建筑面积" },
  { prop: "name", label: "业主" },
  { prop: "name", label: "联系电话" },
  { prop: "name", label: "认购日期" },
  { prop: "name", label: "底价金额" },
  { prop: "name", label: "认购金额" },
  { prop: "name", label: "未签约天数" },
];

// 溢价统计-表头
export const premiumStatsColumns = [
  { prop: "name", label: "项目", width: 240 },
  { prop: "name", label: "认购套数" },
  { prop: "name", label: "成交面积" },
  { prop: "name", label: "系统底价" },
  { prop: "name", label: "系统底单价" },
  { prop: "name", label: "成交总价" },
  { prop: "name", label: "成交单价" },
  { prop: "name", label: "破底价溢价金额" },
  { prop: "name", label: "补贴" },
  { prop: "name", label: "项目政策" },
  { prop: "name", label: "实际破底价溢价金额", width: 100 },
  { prop: "name", label: "破底价溢价比例" },
];

// 溢价明细-表头
export const premiumDetailColumns = [
  { prop: "index", label: "序号", width: 60 },
  { prop: "name", label: "项目", width: 240 },
  { prop: "name", label: "业态", width: 100 },
  { prop: "name", label: "房号", width: 100 },
  { prop: "name", label: "建筑面积", width: 120 },
  { prop: "name", label: "业主", width: 120 },
  { prop: "name", label: "联系电话", width: 150 },
  { prop: "name", label: "认购日期", width: 150 },
  { prop: "name", label: "底价金额", width: 120 },
  { prop: "name", label: "认购金额", width: 120 },
  { prop: "name", label: "实际成交金额", width: 150 },
  { prop: "name", label: "溢价状态", width: 120 },
  { prop: "name", label: "溢价金额", width: 120 },
  { prop: "name", label: "溢价比例", width: 120 },
  { prop: "name", label: "置业顾问", width: 120 },
  { prop: "name", label: "更改总价说明", width: 150 },
  { prop: "name", label: "备注详情", width: 150 },
];
// 应收明细-表头
export const receivablesDetailColumns = [
  { prop: "index", label: "序号", width: 60 },
  { prop: "name", label: "项目", width: 240 },
  { prop: "name", label: "业态", width: 100 },
  { prop: "name", label: "房号", width: 100 },
  { prop: "name", label: "建筑面积", width: 120 },
  { prop: "name", label: "业主" },
  { prop: "name", label: "联系电话" },
  { prop: "name", label: "认购日期" },
  { prop: "name", label: "认购金额" },
  { prop: "name", label: "置业顾问" },
  { prop: "name", label: "应收金额" },
  { prop: "name", label: "最近应收日期" },
  { prop: "name", label: "逾期未收金额" },
  { prop: "name", label: "最大逾期天数" },
];
// 退房挞定统计-表头
export const forfeitureStatslColumns = [
  { prop: "name", label: "项目" },
  { prop: "name", label: "退房套数" },
  { prop: "name", label: "退房金额" },
  { prop: "name", label: "挞定套数" },
  { prop: "name", label: "挞定金额" },
];
// 退房挞定明细-表头
export const forfeitureDetailColumns = [
  { prop: "index", label: "序号", width: 60 },
  { prop: "name", label: "项目", width: 240 },
  { prop: "name", label: "业态" },
  { prop: "name", label: "房号" },
  { prop: "name", label: "建筑面积" },
  { prop: "name", label: "业主" },
  { prop: "name", label: "联系电话" },
  { prop: "name", label: "认购日期" },
  { prop: "name", label: "底价金额" },
  { prop: "name", label: "认购金额" },
  { prop: "name", label: "类型" },
  { prop: "name", label: "退房时间" },
  { prop: "name", label: "挞定时间" },
];
