import { formatNumberDisplay } from "@/utils/common";

// 认购转签约统计-表头
export const ConversionStatsColumns: any = [
  { type: "index", label: "序号", width: 60 },
  {
    prop: "projName",
    label: "项目名称",
    clickable: true, // 允许触发单元格事件
    clickEvent: "projName-click", // 事件名称
  },
  { prop: "signNum", label: "签约套数", showSummary: true },
  { prop: "avgSignDays", label: "认转签周期(天)" },
  { prop: "minSignDays", label: "最小周期(天)" },
  { prop: "maxSignDays", label: "最大周期(天)" },
];

// 认购转签约明细-表头
export const conversionDetailColumns: any = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目", width: 240 },
  { prop: "bigProductTypeName", label: "业态" },
  { prop: "roomNum", label: "房号" },
  { prop: "saleArea", label: "预测面积", showSummary: true },
  { prop: "custName", label: "业主" },
  // { prop: "custTel", label: "联系电话" },
  {
    prop: "floorMoney",
    label: "底价总价",
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.floorMoney),
  },
  {
    prop: "saleMoney",
    label: "销售总价",
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.saleMoney),
  },
  { prop: "saleDate", label: "认购日期" },
  { prop: "signDate", label: "签约日期" },
  { prop: "signDays", label: "签约周期(天)" },
];

// 认购未签约统计-表头
export const pendingStatsColumns: any = [
  { type: "index", label: "序号", width: 60 },
  {
    prop: "projName",
    label: "项目",
    clickable: true, // 允许触发单元格事件
    clickEvent: "projName-click", // 事件名称
  },
  { prop: "orderNum", label: "认购套数", showSummary: true },
  {
    prop: "orderArea",
    label: "销售面积",
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.orderArea),
  },
  {
    prop: "orderMoney",
    label: "销售总金额(万元)",
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.orderMoney),
  },
  { prop: "notsignNum", label: "未签约套数", showSummary: true },
  {
    prop: "notsignMoney",
    label: "未签约金额(万元)",
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.notsignMoney),
  },
  { prop: "maxNotsignDays", label: "最大周期(天)" },
  { prop: "notsignDays", label: "平均周期(天)" },
];

// 认购未签约明细-表头
export const pendingDetailColumns: any = [
  { type: "index", label: "序号", width: 60 },
  { prop: "projName", label: "项目", width: 240 },
  { prop: "bigProductTypeName", label: "业态" },
  { prop: "roomNum", label: "房号" },
  { prop: "saleArea", label: "预测面积", showSummary: true },
  { prop: "custName", label: "业主" },
  // { prop: "custTel", label: "联系电话" },
  { prop: "saleDate", label: "认购日期" },
  {
    prop: "floorMoney",
    label: "底价总价",
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.floorMoney),
  },
  {
    prop: "saleMoney",
    label: "销售总价",
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.saleMoney),
  },
  {
    prop: "signDays",
    label: "未签约天数",
    formatter: (row: any) => formatNumberDisplay(row.signDays),
  },
];

// 溢价统计-表头
export const premiumStatsColumns: any = [
  {
    prop: "projName",
    label: "项目",
    width: 240,
    fixed: "left",
    clickable: true, // 允许触发单元格事件
    clickEvent: "projName-click", // 事件名称
  },
  { prop: "allNum", label: "认购套数", width: 100, showSummary: true },
  {
    prop: "saleArea",
    label: "销售面积",
    width: 120,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.saleArea),
  },
  {
    prop: "floorMoney",
    label: "底价总金额(万)",
    width: 150,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.floorMoney),
  },
  {
    prop: "floorUnitPrice",
    label: "底价平均单价",
    width: 150,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.floorUnitPrice),
  },
  {
    prop: "saleMoney",
    label: "销售总金额(万)",
    width: 150,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.saleMoney),
  },
  {
    prop: "allSalePrice",
    label: "销售平均单价",
    width: 150,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.allSalePrice),
  },
  {
    prop: "premiumMoney",
    label: "销售溢价金额",
    width: 150,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.premiumMoney),
  },
  {
    prop: "incMoneyRm",
    label: "补贴金额(万)",
    width: 150,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.incMoneyRm),
  },
  {
    prop: "incMoneyPj",
    label: "活动补贴金额(万)",
    width: 150,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.incMoneyPj),
  },
  {
    prop: "aaaaaaa",
    label: "溢价金额(万)",
    width: 150,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.aaaaaaa),
  }, // 字段调整
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
  { prop: "forecastArea", label: "预测面积", width: 120, showSummary: true },
  { prop: "custName", label: "业主", width: 120 },
  // { prop: "custTel", label: "联系电话", width: 150 },
  { prop: "saleDate", label: "认购日期", width: 150 },
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
    prop: "aaqqqq",
    label: "补贴金额",
    width: 150,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.aaqqqq),
  }, // 字段调整
  {
    prop: "saleMoneyAll",
    label: "实际销售金额",
    width: 150,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.saleMoneyAll),
  },
  { prop: "premiumStatus", label: "溢价状态", width: 120 },
  {
    prop: "premiumMoney",
    label: "溢价金额",
    width: 120,
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.premiumMoney),
  },
  { prop: "name", label: "溢价比例", width: 120 }, // 字段调整
  { prop: "sallerName", label: "置业顾问", width: 120 },
  { prop: "incMoneyMemo", label: "更改总价说明", width: 150, lineClamp: 3 },
  { prop: "name", label: "备注详情", width: 150 }, // 字段调整
];
// 应收统计-表头
export const receivablesColumns1: any = [
  {
    prop: "proj_name",
    label: "项目",
    width: 260,
    fixed: "left",
    clickable: true, // 允许触发单元格事件
    clickEvent: "projName-click", // 事件名称
  },
  {
    label: "应收合计",
    children: [
      {
        prop: "totalCollectNum",
        label: "总套数",
        width: 90,
        showSummary: true,
      },
      {
        prop: "totalCollectMoney",
        label: "总金额",
        width: 100,
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.totalCollectMoney),
      },
      {
        label: "预计回款",
        children: [
          {
            prop: "totalSldCollectNum",
            label: "总套数",
            width: 90,
            showSummary: true,
          },
          {
            prop: "totalSldCollectMoney",
            label: "总金额",
            width: 100,
            showSummary: true,
            formatter: (row: any) =>
              formatNumberDisplay(row.totalSldCollectMoney),
          },
        ],
      },
    ],
  },
  {
    label: "逾期未回款",
    children: [
      {
        prop: "outstdCollectNum",
        label: "总套数",
        width: 90,
        showSummary: true,
      },
      {
        prop: "outstdCollectMoney",
        label: "总金额",
        width: 100,
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.outstdCollectMoney),
      },
    ],
  },
  {
    label: "认购未签",
    children: [
      {
        label: "工程抵款",
        children: [
          {
            prop: "rwqGcdkCollectNum",
            label: "总套数",
            width: 90,
            showSummary: true,
          },
          {
            prop: "rwqGcdkCollectMoney",
            label: "总金额",
            width: 100,
            showSummary: true,
            formatter: (row: any) =>
              formatNumberDisplay(row.rwqGcdkCollectMoney),
          },
          {
            prop: "name",
            label: "预计回款",
            children: [
              {
                prop: "rwqGcdkSldCollectNum",
                label: "总套数",
                width: 90,
                showSummary: true,
              },
              {
                prop: "rwqGcdkSldCollectMoney",
                label: "总金额",
                width: 100,
                showSummary: true,
                formatter: (row: any) =>
                  formatNumberDisplay(row.rwqGcdkSldCollectMoney),
              },
            ],
          },
        ],
      },
      {
        label: "其他",
        children: [
          {
            prop: "rwqQtCollectNum",
            label: "总套数",
            width: 90,
            showSummary: true,
          },
          {
            prop: "rwqQtCollectMoney",
            label: "总金额",
            width: 100,
            showSummary: true,
            formatter: (row: any) => formatNumberDisplay(row.rwqQtCollectMoney),
          },
          {
            label: "预计回款",
            children: [
              {
                prop: "rwqQtSldCollectNum",
                label: "总套数",
                width: 90,
                showSummary: true,
              },
              {
                prop: "rwqQtSldCollectMoney",
                label: "总金额",
                width: 100,
                showSummary: true,
                formatter: (row: any) =>
                  formatNumberDisplay(row.rwqQtSldCollectMoney),
              },
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
      {
        prop: "qwhGcdkCollectNum",
        label: "总套数",
        width: 90,
        showSummary: true,
      },
      {
        prop: "qwhGcdkCollectMoney",
        label: "总金额",
        width: 100,
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.qwhGcdkCollectMoney),
      },
      {
        label: "预计回款",
        children: [
          {
            prop: "qwhGcdkSldCollectNum",
            label: "总套数",
            width: 90,
            showSummary: true,
          },
          {
            prop: "qwhGcdkSldCollectMoney",
            label: "总金额",
            width: 100,
            showSummary: true,
            formatter: (row: any) =>
              formatNumberDisplay(row.qwhGcdkSldCollectMoney),
          },
        ],
      },
    ],
  },
  {
    label: "房票",
    children: [
      {
        prop: "qwhFpCollectNum",
        label: "总套数",
        width: 90,
        showSummary: true,
      },
      {
        prop: "qwhFpCollectMoney",
        label: "总金额",
        width: 100,
        showSummary: true,
        formatter: (row: any) => formatNumberDisplay(row.qwhFpCollectMoney),
      },
      {
        label: "预计回款",
        children: [
          {
            prop: "qwhFpSldCollectNum",
            label: "总套数",
            width: 90,
            showSummary: true,
          },
          {
            prop: "qwhFpSldCollectMoney",
            label: "总金额",
            width: 100,
            showSummary: true,
            formatter: (row: any) =>
              formatNumberDisplay(row.qwhFpSldCollectMoney),
          },
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
  // { prop: "custTel", label: "联系电话" },
  { prop: "saleDate", label: "认购日期" },
  {
    prop: "saleMoney",
    label: "认购金额",
    formatter: (row: any) => formatNumberDisplay(row.saleMoney),
  },
  { prop: "salerName", label: "置业顾问" },
  {
    prop: "recMoney",
    label: "应收金额",
    formatter: (row: any) => formatNumberDisplay(row.recMoney),
  },
  { prop: "minRecDate", label: "最近应收日期" },
  {
    prop: "yqMoney",
    label: "逾期未收金额",
    formatter: (row: any) => formatNumberDisplay(row.yqMoney),
  },
  { prop: "maxYqDays", label: "最大逾期天数" },
];
// 退房挞定统计-表头
export const forfeitureStatslColumns = [
  {
    prop: "projName",
    label: "项目",
    clickable: true, // 允许触发单元格事件
    clickEvent: "projName-click", // 事件名称
  },
  { prop: "tfNum", label: "退房套数", showSummary: true },
  {
    prop: "tfMoney",
    label: "退房金额",
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.tfMoney),
  },
  { prop: "tdNum", label: "挞定套数", showSummary: true },
  {
    prop: "tdMoney",
    label: "挞定金额",
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.tdMoney),
  },
];
// 退房挞定明细-表头
export const forfeitureDetailColumns: any = [
  { type: "index", label: "序号", width: 60 },
  {
    prop: "projName",
    label: "项目",
    width: 240,
  },
  { prop: "bigProductTypeName", label: "业态" },
  { prop: "roomNum", label: "房号" },
  { prop: "buildArea", label: "建筑面积", showSummary: true },
  { prop: "custName", label: "业主" },
  // { prop: "custTel", label: "联系电话" },
  { prop: "saleDate", label: "认购日期" },
  {
    prop: "floorMoney",
    label: "底价金额",
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.floorMoney),
  },
  {
    prop: "saleMoney",
    label: "认购金额",
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.saleMoney),
  },
  { prop: "checkOutTypeName", label: "类型" },
  { prop: "checkOutDate", label: "退定日期" },
];
// 逾期未回款明细-表头
export const overdueDetailColumns: any = [
  { type: "index", label: "序号", width: 60, fixed: "left" },
  { prop: "projName", label: "项目", width: 240, fixed: "left" },
  { prop: "bigProductTypeName", label: "业态", width: 100 },
  { prop: "roomNum", label: "房号", width: 100 },
  { prop: "buildArea", label: "建筑面积", showSummary: true, width: 100 },
  { prop: "custName", label: "业主", width: 100 },
  // { prop: "custTel", label: "联系电话", width: 120 },
  { prop: "saleDate", label: "认购日期", width: 120 },
  {
    prop: "saleMoney",
    label: "认购金额",
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.saleMoney),
    width: 120,
  },
  { prop: "salerName", label: "置业顾问", width: 120 },
  {
    prop: "recMoney",
    label: "应收总金额",
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.recMoney),
    width: 150,
  },
  { prop: "minRecDate", label: "最早回款日期", width: 150 },
  {
    prop: "yqMoney",
    label: "逾期金额",
    showSummary: true,
    formatter: (row: any) => formatNumberDisplay(row.yqMoney),
    width: 150,
  },
  { prop: "maxYqDays", label: "最大逾期天数", width: 150 },
];
