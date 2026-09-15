<template>
  <div class="summary-card-wrapper" v-if="list.length">
    <div
      v-for="(item, index) in list"
      :key="item.subId ?? item.id ?? index"
      class="summary-card-item"
      :class="getThemeClass(index)"
      @click="emit('cardClick', item, index)"
    >
      <!-- 图标 -->
      <div class="item-icon">
        <el-icon>
          <component :is="getIcon(index)" />
        </el-icon>
      </div>

      <!-- 内容 -->
      <div class="item-content">
        <div class="item-header">
          <span class="item-label" :title="item.subName">{{ item.subName }}</span>
          <span v-if="showSubCode && item.subCode" class="item-code">{{ item.subCode }}</span>
        </div>

        <div class="item-value-wrapper">
          <div class="item-value">含税：{{ formatThousandWithPlaces(item.costAmt) }}</div>
          <div class="item-value">不含税：{{ formatThousandWithPlaces(item.costExclAmt) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatThousandWithPlaces } from '@/utils/big-number'
import {
  Money,
  Location,
  OfficeBuilding,
  Document,
  Coin,
  Wallet,
  Tickets,
  DataLine,
} from '@element-plus/icons-vue'
import { computed } from 'vue'

// ---------- 类型定义 ----------
interface CostItem {
  subCode?: string
  subName: string
  subId?: number | string
  subLevel?: number
  costAmt?: number | string | null
  costExclAmt?: number | string | null
  children?: any[]
  id?: string
  [key: string]: any
}

interface Props {
  /** 顶级科目数据（已汇总），直接传接口返回的数组 */
  data?: CostItem[]
  /** 金额单位后缀，不想显示可传 '' */
  unit?: string
  /** 是否显示科目编码 */
  showSubCode?: boolean
}

// ---------- Props ----------
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  unit: '元',
  showSubCode: false,
})

// ---------- Emits ----------
const emit = defineEmits<{
  (e: 'cardClick', item: CostItem, index: number): void
}>()

// ---------- 列表过滤（只展示顶级科目，过滤空项）----------
const list = computed<CostItem[]>(() =>
  (props.data || []).filter((item) => item && item.subName)
)

// ---------- 主题 / 图标循环 ----------
const THEME_CLASSES = [
  'theme-total',
  'theme-blue',
  'theme-green',
  'theme-orange',
  'theme-purple',
]
const ICONS = [Money, Location, OfficeBuilding, Document, Coin, Wallet, Tickets, DataLine]

const getThemeClass = (index: number) => THEME_CLASSES[index % THEME_CLASSES.length]
const getIcon = (index: number) => ICONS[index % ICONS.length]
</script>

<style lang="scss" scoped>
// ========================================
// 统计卡片容器
// ========================================
.summary-card-wrapper {
  display: flex;
  flex-wrap: wrap; // 动态科目数量较多时自动换行
  align-items: stretch;
  gap: 12px;
  margin-bottom: 10px;
}

// ========================================
// 卡片基础样式
// ========================================
.summary-card-item {
  flex: 1 1 260px; // 最小 260px，多卡片自动换行
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid transparent;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;

  &:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
    border-color: #e2e8f0;
  }

  .item-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .el-icon {
      font-size: 18px;
    }
  }

  .item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    .item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;

      .item-label {
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.2px;
        color: #6a6f7a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .item-code {
        flex: none;
        padding: 1px 6px;
        font-size: 11px;
        color: #909399;
        background: #f5f7fa;
        border-radius: 4px;
      }
    }

    .item-value-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 4px;
      min-width: 0;

      // 两个金额：含税为主，不含税为辅
      .item-value {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.2px;
        line-height: 1.25;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;

        // 含税：主数据，加大加粗
        &:first-child {
          font-size: 15px;
          font-weight: 500;
        }

        // 不含税：次要数据，缩小减淡
        &:last-child {
          font-size: 14px;
          font-weight: 400;
          color: #51658f;
        }
      }
    }
  }
}

// ========================================
// 主题配色（按索引循环）
// ========================================
// 0. 主色（实心蓝）
.theme-total {
  .item-icon {
    background: #4f6ef7;

    .el-icon {
      color: #ffffff;
    }
  }

  // 只给含税金额着色，不含税保持默认浅灰
  .item-content .item-value-wrapper .item-value:first-child {
    color: #0f172a;
  }
}

// 1. 浅蓝
.theme-blue {
  .item-icon {
    background: #eef3fe;

    .el-icon {
      color: #4a7cf7;
    }
  }

  .item-content .item-value-wrapper .item-value:first-child {
    color: #1e3a6f;
  }
}

// 2. 浅绿
.theme-green {
  .item-icon {
    background: #e8f8f0;

    .el-icon {
      color: #34b07a;
    }
  }

  .item-content .item-value-wrapper .item-value:first-child {
    color: #1a6e4a;
  }
}

// 3. 浅橙
.theme-orange {
  .item-icon {
    background: #fcf3e7;

    .el-icon {
      color: #d4872a;
    }
  }

  .item-content .item-value-wrapper .item-value:first-child {
    color: #b87333;
  }
}

// 4. 浅紫
.theme-purple {
  .item-icon {
    background: #f0edfe;

    .el-icon {
      color: #7c5cf0;
    }
  }

  .item-content .item-value-wrapper .item-value:first-child {
    color: #4a3a9a;
  }
}

// ========================================
// 响应式：缩小图标与字号
// ========================================
@media (max-width: 1440px) {
  .summary-card-wrapper {
    gap: 10px;
  }

  .summary-card-item {
    padding: 10px 12px;
    gap: 8px;

    .item-icon {
      width: 34px;
      height: 34px;

      .el-icon {
        font-size: 16px;
      }
    }

    .item-content .item-value-wrapper {
      .item-value:first-child {
        font-size: 14px;
      }

      .item-value:last-child {
        font-size: 12px;
      }
    }
  }
}
</style>