/**
 * 主数据-成本 相关常量定义
 */

/**
 * 管控方式 枚举
 */
export const ctrlModeEnum = [
  { value: 1, label: "强控", type: "danger" },
  { value: 2, label: "弱控", type: "warning" },
  { value: 3, label: "不控", type: "info" },
] as const;

/**
 * 分摊规则 枚举
 */
export const allocRuleEnum = [
  { value: "RL_ALL", label: "按产品面积分摊" },
  { value: "RL_UP", label: "按地上产品面积分摊" },
  { value: "RL_DOWN", label: "按地下产品面积分摊" },
  { value: "RL_RF", label: "按地下人防面积分摊" },
  { value: "RL_NRF", label: "按地下非人防面积分摊" },
  { value: "RL_HS", label: "按户数分摊" },
  { value: "RL_DTS", label: "按电梯数分摊" },
] as const;

// 辅助函数：根据value获取label
export const getLabel = <T extends { value: number | string; label: string }>(
  list: readonly T[],
  value: number | string,
) => {
  return list.find((item) => item.value == value)?.label || "";
};
