// 只针对各个枚举值的label和value进行定义的基础方法

/**
 * 枚举项基础类型
 */
export interface EnumItem<V = number | string> {
  value: V;
  label: string;
  type?: string;
}

/**
 * 根据value获取label
 */
export const getEnumLabel = <T extends EnumItem>(
  list: readonly T[],
  value: T["value"],
): string => {
  return list.find((item) => item.value == value)?.label || "";
};

/**
 * 根据value获取type
 */
export const getEnumType = <T extends EnumItem>(
  list: readonly T[],
  value: T["value"],
): string => {
  return list.find((item) => item.value == value)?.type || "";
};

/**
 * 根据value获取完整枚举项
 */
export const getEnumItem = <T extends EnumItem>(
  list: readonly T[],
  value: T["value"],
): T | undefined => {
  return list.find((item) => item.value == value);
};
