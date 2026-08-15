// 只针对各个枚举值的label和value进行定义的基础方法

/**
 * 枚举项基础类型
 */
export interface EnumItem<V = number | string> {
  value: V;
  label: string;
  type?: string;
  color?: string;
}

/**
 * 根据value获取label
 */
export const getEnumLabel = <T extends EnumItem>(
  list: readonly T[],
  value: T["value"],
): string => {
  return list.find((item) => item.value == value)?.label || "-";
};

/**
 * 根据value获取type
 */
export const getEnumType = <T extends EnumItem>(
  list: readonly T[],
  value: T["value"],
): "primary" | "success" | "warning" | "danger" | "info" => {
  const type = list.find((item) => item.value == value)?.type || "info";
  // 确保返回的类型是有效的
  return type as "primary" | "success" | "warning" | "danger" | "info";
};

/**
 * 根据value获取颜色
 */
export const getEnumColor = <T extends EnumItem>(
  list: readonly T[],
  value: T["value"],
): string => {
  const item = list.find((item) => item.value == value);
  return item?.color || "#909399"; // 默认灰色
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


/**
 * 根据 id 获取字典标签
 * @param options 字典数组（如 payWayOptions.value）
 * @param id 当前选中的 id
 * @returns dicLabel 或空字符串
 */
export const getOptionsLabelById = (options: any[], id: string | number,idFieldName?: string,labelFieldName?:string): string => {
  if (id == null) return '';
  // 2. 默认值处理（兼容传空字符串的场景）
  const idKey = idFieldName?.trim() ? idFieldName : 'id';
  const labelKey = labelFieldName?.trim() ? labelFieldName : 'dicLabel';
  // 3. 校验options是数组
  if (!Array.isArray(options)) return '';

  const item = options.find(opt => opt[idKey] == id);
  return item?.[labelKey] ?? '';
};


/**
 * 根据 id 获取字典标签
 * @param options 字典数组（如 payWayOptions.value）
 * @param id 当前选中的 id
 * @returns type 或空字符串
 */
export const getOptionsTypeById = (options: any[], id: string | number,typeFieldName?: string
): "primary" | "success" | "warning" | "danger" | "info" => {
  if (!id && id !== 0) return 'primary';
  
  return "primary";
};