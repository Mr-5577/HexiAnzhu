// 置业顾问排名-表头
export const agentRankingColumns = [
  { prop: "index", label: "序号", width: 60 },
  { prop: "name", label: "集团排名" },
  { prop: "name", label: "项目排名" },
  { prop: "name", label: "置业顾问" },
  { prop: "name", label: "所属项目" },
  { prop: "name", label: "认购" },
  { prop: "name", label: "认购金额" },
  { prop: "name", label: "签约" },
  { prop: "name", label: "签约金额" },
  { prop: "name", label: "回款金额" },
  { prop: "name", label: "溢价金额" },
  { prop: "name", label: "溢价比例" },
];

// 销售年报表-表头
export const annualReportColumns = [
  { prop: "index", label: "序号", width: 60 },
  { prop: "name", label: "项目", width: 220 },
  { prop: "name", label: "考核类型", width: 150 },
  {
    prop: "name",
    label: "年度累计数据",
    children: [
      { prop: "num", label: "认购套数", width: 90 },
      { prop: "price", label: "认购金额", width: 90 },
      { prop: "price", label: "成交均价", width: 90 },
      { prop: "price", label: "签约套数", width: 90 },
      { prop: "price", label: "签约金额", width: 90 },
      { prop: "price", label: "回款金额", width: 90 },
    ],
  },
  {
    prop: "name",
    label: "项目累计未回款（万元）",
    children: [
      {
        prop: "price",
        label: "未签约",
        children: [
          { prop: "price", label: "套数", width: 80 },
          { prop: "price", label: "金额", width: 80 },
        ],
      },
      {
        prop: "price",
        label: "已签约",
        children: [
          { prop: "price", label: "套数", width: 80 },
          { prop: "price", label: "金额", width: 80 },
        ],
      },
      {
        prop: "price",
        label: "总计",
        children: [
          { prop: "price", label: "套数", width: 80 },
          { prop: "price", label: "金额", width: 80 },
        ],
      },
    ],
  },
  {
    prop: "name",
    label: "年度目标任务",
    children: [
      { prop: "price", label: "销售数量(套)", width: 90 },
      { prop: "price", label: "签约数量(套)", width: 90 },
      { prop: "price", label: "回款金额(万元)", width: 90 },
    ],
  },
  {
    prop: "name",
    label: "年度实际完成",
    children: [
      { prop: "price", label: "销售数量(套)", width: 90 },
      { prop: "price", label: "签约数量(套)", width: 90 },
      { prop: "price", label: "回款金额(万元)", width: 90 },
    ],
  },
  {
    prop: "name",
    label: "年度达成率",
    children: [
      { prop: "price", label: "销售数量(套)", width: 90 },
      { prop: "price", label: "签约数量(套)", width: 90 },
      { prop: "price", label: "回款金额(万元)", width: 90 },
      { prop: "price", label: "综合达成率", width: 100 },
    ],
  },
];

// 销售日报表-表头
export const dailylReportColumns = [
  { prop: "index", label: "序号", width: 60 },
  { prop: "name", label: "项目", width: 220 },
  { prop: "name", label: "考核类型", width: 150 },
  {
    prop: "name",
    label: "当日销售数据",
    children: [
      { prop: "num", label: "认购套数", width: 90 },
      { prop: "price", label: "成交均价", width: 90 },
      { prop: "price", label: "退房挞定", width: 90 },
      { prop: "price", label: "签约套数", width: 90 },
      { prop: "price", label: "回款金额", width: 90 },
    ],
  },
  {
    prop: "name",
    label: "当月累计数据",
    children: [
      { prop: "num", label: "认购套数", width: 90 },
      { prop: "price", label: "认购金额", width: 90 },
      { prop: "price", label: "成交均价", width: 90 },
      { prop: "price", label: "签约套数", width: 90 },
      { prop: "price", label: "签约金额", width: 90 },
      { prop: "price", label: "回款金额", width: 90 },
    ],
  },
  {
    prop: "name",
    label: "项目累计未回款（万元）",
    children: [
      {
        prop: "price",
        label: "未签约",
        children: [
          { prop: "price", label: "套数", width: 80 },
          { prop: "price", label: "金额", width: 80 },
        ],
      },
      {
        prop: "price",
        label: "已签约",
        children: [
          { prop: "price", label: "套数", width: 80 },
          { prop: "price", label: "金额", width: 80 },
        ],
      },
      {
        prop: "price",
        label: "总计",
        children: [
          { prop: "price", label: "套数", width: 80 },
          { prop: "price", label: "金额", width: 80 },
        ],
      },
    ],
  },
  {
    prop: "name",
    label: "年度目标任务",
    children: [
      { prop: "price", label: "销售数量(套)", width: 90 },
      { prop: "price", label: "签约数量(套)", width: 90 },
      { prop: "price", label: "回款金额(万元)", width: 90 },
    ],
  },
  {
    prop: "name",
    label: "年度实际完成",
    children: [
      { prop: "price", label: "销售数量(套)", width: 90 },
      { prop: "price", label: "签约数量(套)", width: 90 },
      { prop: "price", label: "回款金额(万元)", width: 90 },
    ],
  },
  {
    prop: "name",
    label: "年度达成率",
    children: [
      { prop: "price", label: "销售数量(套)", width: 90 },
      { prop: "price", label: "签约数量(套)", width: 90 },
      { prop: "price", label: "回款金额(万元)", width: 90 },
      { prop: "price", label: "综合达成率", width: 100 },
    ],
  },
];
