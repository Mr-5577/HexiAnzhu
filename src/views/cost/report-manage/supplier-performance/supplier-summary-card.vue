<template>
    <div class="stat-cards-wrapper">
        <div v-for="item in stats" :key="item.key" class="stat-card-item" :class="item.className">
            <div class="item-icon">
                <el-icon>
                    <component :is="item.icon" />
                </el-icon>
            </div>
            <div class="item-content">
                <div class="item-label" :title="item.label">{{ item.label }}</div>
                <div class="item-value-wrapper">
                    <span class="item-value" :title="item.value">{{ item.value }}</span>
                    <span class="item-unit">{{ unit }}</span>
                </div>
                <div class="item-desc">{{ item.desc }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { Search, Refresh, Download, Tickets, TrendCharts, Money, Wallet, CreditCard, Warning, BellFilled } from '@element-plus/icons-vue'

// ---------- 类型 ----------
export interface StatItem {
    /** 唯一 key */
    key: string
    /** 显示标签 */
    label: string
    /** 已格式化的数值（字符串） */
    value: string
    /** 图标组件 */
    icon: Component
    /** 附加样式类（用于配色） */
    className?: string
    /** 描述 */
    desc?: string
}

// ---------- Props ----------
withDefaults(defineProps<{
    stats: StatItem[]
    unit?: string
}>(), {
    stats: () => [],
    unit: '万元',
})
</script>

<style lang="scss" scoped>
// ========================================
// 容器：强制单行不换行
// ========================================
.stat-cards-wrapper {
    display: flex;
    flex-wrap: nowrap; // 关键：一行展示
    align-items: stretch;
    gap: 10px;
    margin-bottom: 12px;
    width: 100%;
    overflow-x: auto; // 极端窄屏时允许横向滚动，而不是换行

    // 隐藏滚动条
    &::-webkit-scrollbar {
        height: 0;
    }
}

// ========================================
// 卡片基础
// ========================================
.stat-card-item {
    flex: 1 1 0;
    min-width: 0; // 关键：允许压缩，内容不撑开
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 10px;
    background: #ffffff;
    border-radius: 10px;
    border: 1px solid transparent;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    transition: box-shadow 0.2s ease, transform 0.2s ease;

    &:hover {
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
    }

    .item-icon {
        width: 34px;
        height: 34px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: #eef3fe;

        .el-icon {
            font-size: 16px;
            color: #4a7cf7;
        }
    }

    .item-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;

        .item-label {
            font-size: 12px;
            font-weight: 500;
            color: #6a6f7a;
            letter-spacing: 0.2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
        }

        .item-value-wrapper {
            display: flex;
            align-items: baseline;
            gap: 3px;
            min-width: 0;

            .item-value {
                font-size: 16px;
                font-weight: 600;
                // color: #0f172a;
                line-height: 1.2;
                font-variant-numeric: tabular-nums;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .item-unit {
                font-size: 11px;
                font-weight: 400;
                color: #a0abb8;
                flex-shrink: 0;
            }
        }

        .item-desc {
            margin-top: 3px;
            font-size: 12px;
            font-weight: 400;
            color: #b0c0ce;
            line-height: 1.3;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}

// ========================================
// 配色主题（8 种，按需使用）
// ========================================
// 1. 签约金额（蓝）
.theme-blue {
    .item-icon {
        background: #eef3fe;

        .el-icon {
            color: #4a7cf7;
        }
    }

    .item-value {
        color: #1e3a6f;
    }
}

// 2. 产值（紫）
.theme-purple {
    .item-icon {
        background: #f3effe;

        .el-icon {
            color: #7c5cf7;
        }
    }

    .item-value {
        color: #4c3a8f;
    }
}

// 3. 应付（靛蓝）
.theme-indigo {
    .item-icon {
        background: #eef2ff;

        .el-icon {
            color: #6366f1;
        }
    }

    .item-value {
        color: #3730a3;
    }
}

// 4. 实际请款（青）
.theme-cyan {
    .item-icon {
        background: #e6f7fb;

        .el-icon {
            color: #06b6d4;
        }
    }

    .item-value {
        color: #0e6b80;
    }
}

// 5. 已支付（绿）
.theme-green {
    .item-icon {
        background: #e8f8f0;

        .el-icon {
            color: #34b07a;
        }
    }

    .item-value {
        color: #1a6e4a;
    }
}

// 6. 已开票（橙）
.theme-orange {
    .item-icon {
        background: #fcf3e7;

        .el-icon {
            color: #d4872a;
        }
    }

    .item-value {
        color: #b87333;
    }
}

// 7. 产值欠票（红）
.theme-red {
    .item-icon {
        background: #feecec;

        .el-icon {
            color: #ef4444;
        }
    }

    .item-value {
        color: #991b1b;
    }
}

// 8. 请款欠票（深红）
.theme-rose {
    .item-icon {
        background: #fde8ec;

        .el-icon {
            color: #dc2626;
        }
    }

    .item-value {
        color: #7f1d1d;
    }
}

// ========================================
// 响应式：逐级压缩，绝不换行
// ========================================
@media (max-width: 1440px) {
    .stat-cards-wrapper {
        gap: 8px;
    }

    .stat-card-item {
        padding: 8px 10px;
        gap: 6px;

        .item-icon {
            width: 30px;
            height: 30px;

            .el-icon {
                font-size: 14px;
            }
        }

        .item-content {
            .item-label {
                font-size: 11px;
            }

            .item-value-wrapper .item-value {
                font-size: 14px;
            }
        }
    }
}

@media (max-width: 1200px) {
    .stat-card-item {
        padding: 6px 8px;
        gap: 4px;

        .item-icon {
            width: 26px;
            height: 26px;
            border-radius: 7px;

            .el-icon {
                font-size: 12px;
            }
        }

        .item-content {
            .item-label {
                font-size: 10px;
            }

            .item-value-wrapper {
                .item-value {
                    font-size: 13px;
                }

                .item-unit {
                    font-size: 10px;
                }
            }
        }
    }
}
</style>