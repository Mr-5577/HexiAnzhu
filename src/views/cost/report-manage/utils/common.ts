import {
  toBig,
  bigSumNum,
  roundBy,
  formatThousandWithPlaces,
} from "@/utils/big-number";
import dayjs from "dayjs";

/**
 * 计算树形数据最大深度
 * @param data 树形数据（根节点数组）
 * @param depth 当前深度，默认为 0
 * @returns 树形数据最大深度
 */
export const calcMaxDepth = (data: any[], depth: number = 0): number => {
  if (!data || data.length === 0) return depth - 1;
  let max = depth;
  for (const node of data) {
    if (node.children && node.children.length > 0) {
      const childDepth = calcMaxDepth(node.children, depth + 1);
      max = Math.max(max, childDepth);
    }
  }
  return max;
};
/**
 * 层级映射
 */
export const levelMap: Record<number, string> = {
  1: "一级科目",
  2: "二级科目",
  3: "三级科目",
  4: "四级科目",
  5: "五级科目",
  6: "六级科目",
  7: "七级科目",
  8: "八级科目",
};

/** 报表管理-预警枚举 */
export const warnEnum = [
  { label: "红色预警", value: 0, type: "danger", color: "#FF0000" },
  { label: "黄色预警", value: 1, type: "warning", color: "#E6A23C" },
  { label: "绿色预警", value: 2, type: "success", color: "#67C23A" },
];

/** 报表管理-业务板块-枚举 */
export const segEnum = [
  { value: "ALL", label: "全部" },
  { value: "DC", label: "地产" },
  { value: "JZ", label: "建筑" },
];
/**
 * 汇总顶层金额分类
 * @param treeData 顶层节点数组
 * @param decimal 保留小数位数
 * @returns 四个统计卡片数据
 */
export function getSummaryData(treeData: any[], decimal: number = 2) {
  const landList: number[] = []; // 土地成本
  const engineeringList: number[] = []; // 工程成本
  const expenseList: number[] = []; // 费用成本

  // 需要合并到「210 其他支出」的编码
  const MERGE_TO_210 = ["209", "210", "211"];
  const OTHER_CODE = "210";
  const OTHER_NAME = "其他支出";

  // 费用类明细：用 Map 以 sub_code 去重合并
  const expenseDetailMap = new Map<
    string,
    { sub_name: string; sub_code: string; total: number }
  >();

  treeData.forEach((node) => {
    const code = String(node.sub_code);
    const total = toBig(node.total);

    switch (code) {
      case "102":
        // 102 房屋退款：跳过
        break;
      case "201":
        landList.push(total.toNumber());
        break;
      case "202":
        engineeringList.push(total.toNumber());
        break;
      // 203:销售费用 204:管理费用 205:税费 206:财务费用
      // 207:总公司咨询费 208:物业管理费 209:非正常支出 210:其他支出 211:外部往来
      case "203":
      case "204":
      case "205":
      case "206":
      case "207":
      case "208":
      case "209":
      case "210":
      case "211":
        // 全部计入费用类
        expenseList.push(total.toNumber());

        // 209/210/211 合并到「210 其他支出」
        if (MERGE_TO_210.includes(code)) {
          const existing = expenseDetailMap.get(OTHER_CODE);
          if (existing) {
            existing.total = roundBy(
              toBig(existing.total).plus(total),
              decimal,
            );
          } else {
            expenseDetailMap.set(OTHER_CODE, {
              sub_name: OTHER_NAME,
              sub_code: OTHER_CODE,
              total: roundBy(total, decimal),
            });
          }
        } else {
          expenseDetailMap.set(code, {
            sub_name: node.sub_name,
            sub_code: node.sub_code,
            total: roundBy(total, decimal),
          });
        }
        break;
    }
  });

  // 明细按 sub_code 升序排列
  const expenseDetails = Array.from(expenseDetailMap.values())
    .sort((a, b) => String(a.sub_code).localeCompare(String(b.sub_code)))
    .map((item) => ({
      sub_name: item.sub_name,
      sub_code: item.sub_code,
      // 明细金额也格式化
      total: formatThousandWithPlaces(item.total, decimal),
    }));

  const land = roundBy(bigSumNum(landList), decimal);
  const engineering = roundBy(bigSumNum(engineeringList), decimal);
  const expense = roundBy(bigSumNum(expenseList), decimal);
  const all = roundBy(toBig(land).plus(engineering).plus(expense), decimal);

  return {
    all: formatThousandWithPlaces(all, decimal), // 全部金额（土地 + 工程 + 费用）
    land: formatThousandWithPlaces(land, decimal), // 土地类
    engineering: formatThousandWithPlaces(engineering, decimal), // 工程类
    expense: formatThousandWithPlaces(expense, decimal), // 费用类
    expenseDetails, // 费用类明细（209/211 已合并到 210，金额已格式化）
  };
}


/**
 * 日期范围格式化辅助函数
 * @param dates 日期范围数组
 * @param type 类型（start: 起始日期，end: 结束日期）
 */
export const formatDateRange = (dates, type) => {
    if (!dates || !Array.isArray(dates) || dates.length < 2) return undefined;
    const [start, end] = dates;
    if (type === 'start') {
        return start ? dayjs(start).startOf('month').format('YYYY-MM-DD') : undefined;
    }
    if (type === 'end') {
        return end ? dayjs(end).endOf('month').format('YYYY-MM-DD') : undefined;
    }
    return undefined;
};