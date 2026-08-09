// ============ 下拉选项加载工具 ============
// 消除 6 个 getXxxList 函数中重复的 try-catch + code 判断 + 赋值模式

import type { Ref } from "vue";

interface ApiResult<T> {
  code: number;
  data?: T[];
}

/**
 * 通用下拉选项加载器
 * @param api     API 调用函数（返回 { code, data }）
 * @param target  接收数据的 ref
 * @param errMsg  错误日志前缀
 * @param mapper  可选的数据转换（如 buildTree）
 */
export async function loadOptions<T>(
  api: () => Promise<ApiResult<T>>,
  target: Ref<T[]>,
  errMsg: string,
  mapper?: (data: T[]) => T[],
): Promise<void> {
  try {
    const res = await api();
    if (res.code === 200) {
      const data = res.data || [];
      target.value = mapper ? mapper(data) : data;
    }
  } catch (error) {
    console.error(errMsg, error);
  }
}
