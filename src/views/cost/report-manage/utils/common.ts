import {
  toBig,
  bigSumNum,
  roundToTwo,
  formatThousandWithPlaces,
} from "@/utils/big-number";

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
 * @returns 四个统计卡片数据（金额已千分位格式化，保留 2 位小数）
 */
export function getSummaryData(treeData: any[]) {
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
            existing.total = roundToTwo(toBig(existing.total).plus(total));
          } else {
            expenseDetailMap.set(OTHER_CODE, {
              sub_name: OTHER_NAME,
              sub_code: OTHER_CODE,
              total: roundToTwo(total),
            });
          }
        } else {
          expenseDetailMap.set(code, {
            sub_name: node.sub_name,
            sub_code: node.sub_code,
            total: roundToTwo(total),
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
      total: formatThousandWithPlaces(item.total, 2),
    }));

  const land = roundToTwo(bigSumNum(landList));
  const engineering = roundToTwo(bigSumNum(engineeringList));
  const expense = roundToTwo(bigSumNum(expenseList));
  const all = roundToTwo(toBig(land).plus(engineering).plus(expense));

  return {
    all: formatThousandWithPlaces(all, 2), // 全部金额（土地 + 工程 + 费用）
    land: formatThousandWithPlaces(land, 2), // 土地类
    engineering: formatThousandWithPlaces(engineering, 2), // 工程类
    expense: formatThousandWithPlaces(expense, 2), // 费用类
    expenseDetails, // 费用类明细（209/211 已合并到 210，金额已格式化）
  };
}
