<template>
    <div class="summary-card-wrapper">
        <!-- 1. 付款总额 -->
        <div class="summary-card-item summary-total" @click="handleCardClick('total')">
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
                    <span class="item-value">{{ formatNumber(data.total.value) }}</span>
                    <span class="item-unit">万元</span>
                </div>
                <div class="item-desc">含土地类、工程类、费用类三大项</div>
            </div>
        </div>

        <!-- 2. 土地类 -->
        <div class="summary-card-item category-land" @click="handleCardClick('land')">
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
                    <span class="item-value">{{ formatNumber(data.land.value) }}</span>
                    <span class="item-unit">万元</span>
                </div>
                <div class="item-desc">土地出让及配套</div>
            </div>
        </div>

        <!-- 3. 工程类 -->
        <div class="summary-card-item category-construction" @click="handleCardClick('construction')">
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
                    <span class="item-value">{{ formatNumber(data.construction.value) }}</span>
                    <span class="item-unit">万元</span>
                </div>
                <div class="item-desc">总包 + 其他工程款</div>
            </div>
        </div>

        <!-- 4. 费用类（子项固定两列） -->
        <div class="summary-card-item category-fee" @click="handleCardClick('fee')">
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
                    <span class="item-value">{{ formatNumber(data.fee.value) }}</span>
                    <span class="item-unit">万元</span>
                </div>
                <!-- <div class="item-desc">包含五项费用明细</div> -->
                <div class="fee-grid">
                    <div class="fee-item" v-for="item in data.fee.items" :key="item.label">
                        <span class="fee-label">{{ item.label }}</span>
                        <span class="fee-value">{{ formatNumber(item.value) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Money, Location, OfficeBuilding, Document } from '@element-plus/icons-vue'

// ---------- 类型定义 ----------
interface FeeItem {
    label: string
    value: number
}

interface CardData {
    total: {
        value: number
        // trend 和 paidRatio 已不再使用，但保留字段以兼容外部数据
        trend?: number
        paidRatio?: number
    }
    land: {
        value: number
        target?: number
        ratio?: number
    }
    construction: {
        value: number
        target?: number
        ratio?: number
    }
    fee: {
        value: number
        target?: number
        ratio?: number
        items: FeeItem[]
    }
}

// ---------- 组件事件 ----------
const emit = defineEmits<{
    (e: 'cardClick', type: string): void
}>()

// ---------- 模拟数据（实际可从父组件传入） ----------
const data = reactive<CardData>({
    total: {
        value: 42954.00,
        trend: 3.2,        // 保留但未使用
        paidRatio: 45.6
    },
    land: {
        value: 17850.00,
        target: 20000.00,
        ratio: 89.25
    },
    construction: {
        value: 19355.00,
        target: 22000.00,
        ratio: 87.98
    },
    fee: {
        value: 5749.00,
        target: 6500.00,
        ratio: 88.45,
        items: [
            { label: '销售费用', value: 1806.00 },
            { label: '管理费用', value: 1250.00 },
            { label: '财务费用', value: 546.00 },
            { label: '税费', value: 1226.00 },
            { label: '其他支出', value: 921.00 }
        ]
    }
})

// ---------- 工具函数 ----------
const formatNumber = (val: number): string => {
    if (val === undefined || val === null) return '0'
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ---------- 事件处理 ----------
const handleCardClick = (type: string) => {
    emit('cardClick', type)
}
</script>

<style lang="scss" scoped>
// ========================================
// 统计卡片容器
// ========================================
.summary-card-wrapper {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

// ========================================
// 每块卡片基础样式（均等分）
// ========================================
.summary-card-item {
    flex: 1;
    /* 均等分 */
    min-width: 160px;
    background: #ffffff;
    border-radius: 16px;
    padding: 10px 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    gap: 14px;
    min-height: 110px;
    transition: all 0.25s ease;
    cursor: pointer;
    border: 1px solid transparent;

    &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        transform: translateY(-3px);
        border-color: #e2e8f0;
    }

    .item-icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .el-icon {
            font-size: 22px;
        }
    }

    .item-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;

        .item-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;

            .item-label {
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 0.3px;
                color: #6a6f7a;
                white-space: nowrap;
            }
        }

        .item-value-wrapper {
            display: flex;
            align-items: baseline;
            gap: 4px;
            margin: 4px 0 2px;

            .item-value {
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 0.5px;
                line-height: 1.2;
                font-variant-numeric: tabular-nums;
            }

            .item-unit {
                font-size: 12px;
                font-weight: 400;
                color: #a0abb8;
                opacity: 0.8;
            }
        }

        .item-desc {
            font-size: 12px;
            font-weight: 400;
            color: #b0c0ce;
            line-height: 1.3;
            margin-top: 4px;
        }
    }
}

// ========================================
// 各卡片颜色差异化
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

// 4. 费用类
.category-fee {
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
        grid-template-columns: 1fr 1fr;
        gap: 2px 20px;

        .fee-item {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 12px;
            line-height: 1.8;
            white-space: nowrap;

            .fee-label {
                color: #9aabba;
                font-weight: 400;
                margin-right: 6px;
                flex-shrink: 0;
            }

            .fee-value {
                font-weight: 600;
                color: #3a4a5a;
                font-variant-numeric: tabular-nums;
            }
        }
    }
}

</style>