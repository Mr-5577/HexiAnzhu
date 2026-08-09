// ============ 表单 UI 逻辑 Composable ============
// 抽离纯 UI 逻辑：卡片折叠、金额格式化
// 悬浮定位栏已封装为 FloatNav 组件，不再在此处管理

import { ref, reactive } from "vue";

export interface NavCard {
  id: string;
  icon: string;
  label: string;
}

export function useFormLayout(navCards: NavCard[]) {
  // ---- 卡片折叠状态 ----
  // key 为 navCard.id 去掉 "card-" 前缀（如 "card-basic" -> "basic"）
  const collapsedCards = reactive<Record<string, boolean>>(
    Object.fromEntries(navCards.map((c) => [c.id.replace("card-", ""), false])),
  );
  const toggleCard = (key: string) => {
    collapsedCards[key] = !collapsedCards[key];
  };

  // ---- 金额格式化（千分位，保留两位小数）----
  const formatMoney = (val: number | string) => {
    const num = Number(val) || 0;
    return num.toLocaleString("zh-CN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return {
    // 卡片折叠
    collapsedCards,
    toggleCard,
    // 格式化
    formatMoney,
  };
}
