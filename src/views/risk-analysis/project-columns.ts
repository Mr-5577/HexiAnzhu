// 认购转签约统计-表头
export const createConversionStatsColumns = (
  clickHandler?: (row: any, column: any, index: number) => void
): any[] => {
  return [
    { type: "index", label: "序号", width: 60 },
    {
      prop: "projName",
      label: "项目名称",
      clickable: !!clickHandler, // 如果有处理函数才设置为可点击
      clickHandler,
    },
    { prop: "signNum", label: "签约套数" },
    { prop: "avgSignDays", label: "认转签周期(天)" },
    { prop: "minSignDays", label: "最小周期(天)" },
    { prop: "maxSignDays", label: "最大周期(天)" },
  ];
};

// 认购转签约明细-表头
export const conversionDetailColumns: any = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目", width: 240 },
  { prop: "bigProductTypeName", label: "业态" },
  { prop: "roomNum", label: "房号" },
  { prop: "saleArea", label: "预测面积" },
  { prop: "custName", label: "业主" },
  { prop: "custTel", label: "联系电话" },
  { prop: "floorMoney", label: "底价总价" },
  { prop: "saleMoney", label: "销售总价" },
  { prop: "saleDate", label: "认购日期" },
  { prop: "signDate", label: "签约日期" },
  { prop: "signDays", label: "签约周期(天)" },
];

// 认购未签约统计-表头
export const pendingStatsColumns: any = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目" },
  { prop: "orderNum", label: "认购套数" },
  { prop: "orderArea", label: "销售面积" },
  { prop: "orderMoney", label: "销售总金额(万元)" },
  { prop: "notsignNum", label: "未签约套数" },
  { prop: "notsignMoney", label: "未签约金额(万元)" },
  { prop: "maxNotsignDays", label: "最大周期(天)" },
  { prop: "notsignDays", label: "平均周期(天)" },
];

// 认购未签约明细-表头
export const pendingDetailColumns: any = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目", width: 240 },
  { prop: "bigProductTypeName", label: "业态" },
  { prop: "roomNum", label: "房号" },
  { prop: "saleArea", label: "预测面积" },
  { prop: "custName", label: "业主" },
  { prop: "custTel", label: "联系电话" },
  { prop: "saleDate", label: "认购日期" },
  { prop: "floorMoney", label: "底价总价" },
  { prop: "saleMoney", label: "销售总价" },
  { prop: "signDays", label: "未签约天数" },
];

// 溢价统计-表头
export const premiumStatsColumns: any = [
  { prop: "projName", label: "项目", width: 240, fixed: "left" },
  { prop: "allNum", label: "认购套数", width: 100 },
  { prop: "saleArea", label: "销售面积", width: 120 },
  { prop: "floorMoney", label: "底价总金额(万)", width: 150 },
  { prop: "floorUnitPrice", label: "底价平均单价", width: 150 },
  { prop: "saleMoney", label: "销售总金额(万)", width: 150 },
  { prop: "allSalePrice", label: "销售平均单价", width: 150 },
  { prop: "premiumMoney", label: "销售溢价金额", width: 150 },
  { prop: "incMoneyRm", label: "补贴金额(万)", width: 150 },
  { prop: "incMoneyPj", label: "活动补贴金额(万)", width: 150 },
  { prop: "aaaaaaa", label: "溢价金额(万)", width: 150 }, // 字段调整
  {
    prop: "premiumRate",
    label: "溢价比例",
    width: 100,
    formatter: (row: any, column: any, index: number) => {
      const premiumRate = row.premiumRate || 0;
      if (!premiumRate) {
        return "0%";
      }
      return `${(premiumRate * 100).toFixed(2)}%`;
    },
  },
];

// 溢价明细-表头
export const premiumDetailColumns: any = [
  { type: "index", label: "序号", width: 60, fixed: "left" },
  { prop: "projName", label: "项目", width: 240, fixed: "left" },
  { prop: "bigProductTypeName", label: "业态", width: 100 },
  { prop: "roomNum", label: "房号", width: 100 },
  { prop: "buildArea", label: "预测面积", width: 120 },
  { prop: "custName", label: "业主", width: 120 },
  { prop: "custTel", label: "联系电话", width: 150 },
  { prop: "saleDate", label: "认购日期", width: 150 },
  { prop: "floorMoney", label: "底价总价", width: 120 },
  { prop: "saleMoney", label: "销售总价", width: 120 },
  { prop: "aaqqqq", label: "补贴金额", width: 150 }, // 字段调整
  { prop: "saleMoneyAll", label: "实际成交金额", width: 150 },
  { prop: "premiumStatus", label: "溢价状态", width: 120 },
  { prop: "premiumMoney", label: "溢价金额", width: 120 },
  { prop: "name", label: "溢价比例", width: 120 }, // 字段调整
  { prop: "sallerName", label: "置业顾问", width: 120 },
  { prop: "incMoneyMemo", label: "更改总价说明", width: 150, lineClamp: 3 },
  { prop: "name", label: "备注详情", width: 150 }, // 字段调整
];
// 应收统计-表头
export const receivablesColumns1: any = [
  { prop: "proj_name", label: "项目", width: 260, fixed: "left" },
  {
    label: "应收合计",
    children: [
      { prop: "totalCollectNum", label: "总户数", width: 90 },
      { prop: "totalCollectMoney", label: "总金额", width: 100 },
      {
        label: "预计回款",
        children: [
          { prop: "totalSldCollectNum", label: "总户数", width: 90 },
          { prop: "totalSldCollectMoney", label: "总金额", width: 100 },
        ],
      },
    ],
  },
  {
    label: "逾期未回款",
    children: [
      { prop: "outstdCollectNum", label: "总户数", width: 90 },
      { prop: "outstdCollectMoney", label: "总金额", width: 100 },
    ],
  },
  {
    label: "认购未签",
    children: [
      {
        label: "工程抵款",
        children: [
          { prop: "rwqGcdkCollectNum", label: "总户数", width: 90 },
          { prop: "rwqGcdkCollectMoney", label: "总金额", width: 100 },
          {
            prop: "name",
            label: "预计回款",
            children: [
              { prop: "rwqGcdkSldCollectNum", label: "总户数", width: 90 },
              { prop: "rwqGcdkSldCollectMoney", label: "总金额", width: 100 },
            ],
          },
        ],
      },
      {
        label: "其他",
        children: [
          { prop: "rwqQtCollectNum", label: "总户数", width: 90 },
          { prop: "rwqQtCollectMoney", label: "总金额", width: 100 },
          {
            label: "预计回款",
            children: [
              { prop: "rwqQtSldCollectNum", label: "总户数", width: 90 },
              { prop: "rwqQtSldCollectMoney", label: "总金额", width: 100 },
            ],
          },
        ],
      },
    ],
  },
];
export const receivablesColumns2: any = [
  {
    label: "工程抵款",
    children: [
      { prop: "qwhGcdkCollectNum", label: "总户数", width: 90 },
      { prop: "qwhGcdkCollectMoney", label: "总金额", width: 100 },
      {
        label: "预计回款",
        children: [
          { prop: "qwhGcdkSldCollectNum", label: "总户数", width: 90 },
          { prop: "qwhGcdkSldCollectMoney", label: "总金额", width: 100 },
        ],
      },
    ],
  },
  {
    label: "房票",
    children: [
      { prop: "qwhFpCollectNum", label: "总户数", width: 90 },
      { prop: "qwhFpCollectMoney", label: "总金额", width: 100 },
      {
        label: "预计回款",
        children: [
          { prop: "qwhFpSldCollectNum", label: "总户数", width: 90 },
          { prop: "qwhFpSldCollectMoney", label: "总金额", width: 100 },
        ],
      },
    ],
  },
];
// 应收明细-表头
export const receivablesDetailColumns: any = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目", width: 240 },
  { prop: "bigProductTypeName", label: "业态", width: 100 },
  { prop: "roomNum", label: "房号", width: 100 },
  { prop: "buildArea", label: "预测面积", width: 120 },
  { prop: "custName", label: "业主" },
  { prop: "custTel", label: "联系电话" },
  { prop: "saleDate", label: "认购日期" },
  { prop: "saleMoney", label: "认购金额" },
  { prop: "salerName", label: "置业顾问" },
  { prop: "recMoney", label: "应收金额" },
  { prop: "minRecDate", label: "最近应收日期" },
  { prop: "yqMoney", label: "逾期未收金额" },
  { prop: "maxYqDays", label: "最大逾期天数" },
];
// 退房挞定统计-表头
export const forfeitureStatslColumns = [
  { prop: "projName", label: "项目" },
  { prop: "tfNum", label: "退房套数" },
  { prop: "tfMoney", label: "退房金额" },
  { prop: "tdNum", label: "挞定套数" },
  { prop: "tdMoney", label: "挞定金额" },
];
// 退房挞定明细-表头
export const forfeitureDetailColumns: any = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目", width: 240 },
  { prop: "bigProductTypeName", label: "业态" },
  { prop: "roomNum", label: "房号" },
  { prop: "buildArea", label: "建筑面积" },
  { prop: "custName", label: "业主" },
  { prop: "custTel", label: "联系电话" },
  { prop: "saleDate", label: "认购日期" },
  { prop: "floorMoney", label: "底价金额" },
  { prop: "saleMoney", label: "认购金额" },
  { prop: "checkOutTypeName", label: "类型" },
  { prop: "checkOutDate", label: "退定日期" },
];
