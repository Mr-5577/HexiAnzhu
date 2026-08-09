// ============ 可编辑表格行增删工厂 ============
// 消除 addPrice/addPayrate/deletePrice/deletePayrate 的重复模式

import type { Ref } from "vue";
import { v4 as uuidv4 } from "uuid";

export interface TableRow {
  uuid: string;
}

/**
 * 表格行增删工厂
 * @param table             表格数据 ref
 * @param defaultRowFactory 新行默认值工厂（不含 uuid）
 */
export function useTableEditor<T extends TableRow>(
  table: Ref<T[]>,
  defaultRowFactory: () => Omit<T, "uuid">,
) {
  const addRow = () => {
    const newRow = { ...defaultRowFactory(), uuid: uuidv4() } as T;
    table.value = [...table.value, newRow];
  };

  const deleteRow = (row: T) => {
    table.value = table.value.filter((item) => item.uuid !== row.uuid);
  };

  return { addRow, deleteRow };
}
