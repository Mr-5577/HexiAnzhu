<template>
    <div class="summary-card-wrapper">
        <!-- 1. 付款总额 -->
        <div class="summary-card-item summary-total" @click="emit('cardClick', 'total')">
            <div class="item-icon">
                <el-icon>
                    <Money />
                </el-icon>
            </div>
            <div class="item-content">
                <div class="item-header">
                    <span class="item-label">付款总额</span>
                </div>
                <div class="item-value-wrapper">
                    <span class="item-value">{{ summary.all }}</span>
                    <span class="item-unit">{{ unit }}</span>
                </div>
                <div class="item-desc">含土地类、工程类、费用类三大项</div>
            </div>
        </div>

        <!-- 2. 土地类 -->
        <div class="summary-card-item category-land" @click="emit('cardClick', 'land')">
            <div class="item-icon">
                <el-icon>
                    <Location />
                </el-icon>
            </div>
            <div class="item-content">
                <div class="item-header">
                    <span class="item-label">土地类</span>
                </div>
                <div class="item-value-wrapper">
                    <span class="item-value">{{ summary.land }}</span>
                    <span class="item-unit">{{ unit }}</span>
                </div>
                <div class="item-desc">土地出让及配套</div>
            </div>
        </div>

        <!-- 3. 工程类 -->
        <div class="summary-card-item category-construction" @click="emit('cardClick', 'engineering')">
            <div class="item-icon">
                <el-icon>
                    <OfficeBuilding />
                </el-icon>
            </div>
            <div class="item-content">
                <div class="item-header">
                    <span class="item-label">工程类</span>
                </div>
                <div class="item-value-wrapper">
                    <span class="item-value">{{ summary.engineering }}</span>
                    <span class="item-unit">{{ unit }}</span>
                </div>
                <div class="item-desc">总包 + 其他工程款</div>
            </div>
        </div>

        <!-- 4. 费用类（子项紧凑双列） -->
        <div class="summary-card-item category-fee" @click="emit('cardClick', 'expense')">
            <div class="item-icon">
                <el-icon>
                    <Document />
                </el-icon>
            </div>
            <div class="item-content">
                <div class="item-header">
                    <span class="item-label">费用类</span>
                </div>
                <div class="item-value-wrapper">
                    <span class="item-value">{{ summary.expense }}</span>
                    <span class="item-unit">{{ unit }}</span>
                </div>
                <div class="fee-grid">
                    <div class="fee-item" v-for="item in summary.expenseDetails" :key="item.sub_code">
                        <span class="fee-label">{{ item.sub_name }}</span>
                        <span class="fee-value">{{ item.total }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Money, Location, OfficeBuilding, Document } from '@element-plus/icons-vue'
import { formatThousandWithPlaces } from '@/utils/big-number'

// ---------- 类型定义 ----------
interface ExpenseDetail {
    sub_name: string
    sub_code: string
    total: string
}

interface SummaryData {
    all: string
    land: string
    engineering: string
    expense: string
    expenseDetails: ExpenseDetail[]
}

// ---------- 组件 Props ----------
const props = withDefaults(defineProps<{
    summary: SummaryData
    unit?: string
}>(), {
    summary: () => ({
        all: '0',
        land: '0',
        engineering: '0',
        expense: '0',
        expenseDetails: [],
    }),
    unit: '万元'
})

// ---------- 组件事件 ----------
const emit = defineEmits<{
    (e: 'cardClick', type: string): void
}>()

// ---------- 工具函数 ----------
const formatNumber = (val: number): string => {
    return formatThousandWithPlaces(val ?? 0, 2)
}
</script>

<style lang="scss" scoped>
// ========================================
// 统计卡片容器
// ========================================
.summary-card-wrapper {
    display: flex;
    flex-wrap: nowrap; // 关键：强制单行不换行
    align-items: stretch; // 卡片等高
    gap: 12px;
    margin-bottom: 16px;
}

// ========================================
// 卡片基础样式
// ========================================
.summary-card-item {
    flex: 1 1 0; // 基准宽度为 0，按比例均分
    min-width: 0; // 关键：允许收缩，内容不会撑开卡片
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
        }

        .item-value-wrapper {
            display: flex;
            align-items: baseline;
            gap: 3px;
            margin-top: 2px;

            .item-value {
                font-size: 20px;
                font-weight: 700;
                letter-spacing: 0.3px;
                line-height: 1.15;
                font-variant-numeric: tabular-nums;
                white-space: nowrap;
            }

            .item-unit {
                font-size: 12px;
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
// 各卡片配色
// ========================================
// 1. 付款总额
.summary-total {
    .item-icon {
        background: #4f6ef7;

        .el-icon {
            color: #ffffff;
        }
    }

    .item-content .item-value {
        color: #0f172a;
    }
}

// 2. 土地类
.category-land {
    .item-icon {
        background: #eef3fe;

        .el-icon {
            color: #4a7cf7;
        }
    }

    .item-content .item-value {
        color: #1e3a6f;
    }
}

// 3. 工程类
.category-construction {
    .item-icon {
        background: #e8f8f0;

        .el-icon {
            color: #34b07a;
        }
    }

    .item-content .item-value {
        color: #1a6e4a;
    }
}

// 4. 费用类（需要容纳子项，分配更大宽度权重）
.category-fee {
    flex: 1.4 1 0; // 比其他卡片宽 40%

    .item-icon {
        background: #fcf3e7;

        .el-icon {
            color: #d4872a;
        }
    }

    .item-content .item-value {
        color: #b87333;
    }

    .fee-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        column-gap: 14px;
        margin-top: 4px;

        .fee-item {
            display: flex;
            align-items: baseline;
            // justify-content: space-between;
            gap: 6px;
            min-width: 0;
            font-size: 12px;
            line-height: 1.55;
            white-space: nowrap;

            .fee-label {
                color: #9aabba;
                font-weight: 400;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .fee-value {
                font-weight: 600;
                color: #3a4a5a;
                font-variant-numeric: tabular-nums;
                flex-shrink: 0;
            }
        }
    }
}

// ========================================
// 响应式：逐级压缩，绝不换行
// ========================================
// 中等屏幕：缩小图标与字号
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

        .item-content .item-value-wrapper .item-value {
            font-size: 18px;
        }
    }
}
</style>