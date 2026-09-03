<!-- 目标成本对比分析 - 统计卡片组件（优化版） -->
<template>
    <div class="statistics-card">
        <!-- 左栏：基准版 + 目标版 -->
        <div class="stat-left">
            <!-- 基准版行 -->
            <div class="stat-row stat-row-base">
                <div class="stat-version">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span>基准版</span>
                </div>
                <div class="stat-items">
                    <div v-for="item in baseItems" :key="item.key" class="stat-item"
                        :class="{ 'stat-item-subtotal': item.isSubtotal }">
                        <div class="stat-icon">
                            <el-icon>
                                <component :is="item.icon" />
                            </el-icon>
                        </div>
                        <div class="stat-content">
                            <span class="stat-label">{{ item.label }}</span>
                            <span class="stat-value">{{ formatThousandWithPlaces(data[item.key]) }}</span>
                            <span class="stat-unit">万元</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 目标版行 -->
            <div class="stat-row stat-row-target">
                <div class="stat-version">
                    <el-icon>
                        <Edit />
                    </el-icon>
                    <span>目标版</span>
                </div>
                <div class="stat-items">
                    <div v-for="item in targetItems" :key="item.key" class="stat-item"
                        :class="{ 'stat-item-subtotal': item.isSubtotal }">
                        <div class="stat-icon">
                            <el-icon>
                                <component :is="item.icon" />
                            </el-icon>
                        </div>
                        <div class="stat-content">
                            <span class="stat-label">{{ item.label }}</span>
                            <span class="stat-value">{{ formatThousandWithPlaces(data[item.key]) }}</span>
                            <span class="stat-unit">万元</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 右栏：差额 -->
        <div class="stat-right">
            <div class="stat-version stat-version-diff">
                <el-icon>
                    <TrendCharts />
                </el-icon>
                <span>差额</span>
            </div>
            <div class="stat-items">
                <div v-for="item in diffItems" :key="item.key" class="stat-item stat-item-diff">
                    <div class="stat-icon">
                        <el-icon>
                            <component :is="item.icon" />
                        </el-icon>
                    </div>
                    <div class="stat-content">
                        <span class="stat-label">{{ item.label }}</span>
                        <span class="stat-value">{{ formatThousandWithPlaces(data[item.key]) }}</span>
                        <span class="stat-unit">万元</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    Document,
    Edit,
    TrendCharts,
    Money,
    HomeFilled,
    Wallet,
    DocumentAdd,
    DataAnalysis,
} from '@element-plus/icons-vue'
import { formatThousandWithPlaces } from '@/utils/big-number'
import { computed } from 'vue'

export interface TargetCostStatisticsData {
    baseJianAnCost: number
    baseShiFanCost: number
    baseYuLiuCost: number
    baseSubtotal: number
    targetJianAnCost: number
    targetShiFanCost: number
    targetYuLiuCost: number
    targetSubtotal: number
    diffJianAnCost: number
    diffPricePerSqm: number
}

const props = defineProps<{
    data: TargetCostStatisticsData
}>()

// 配置驱动渲染，便于后期维护和扩展
const baseItems = computed(() => [
    { key: 'baseJianAnCost', label: '建安', icon: Money, isSubtotal: false },
    { key: 'baseShiFanCost', label: '示范区', icon: HomeFilled, isSubtotal: false },
    { key: 'baseYuLiuCost', label: '预留', icon: Wallet, isSubtotal: false },
    { key: 'baseSubtotal', label: '小计', icon: DocumentAdd, isSubtotal: true },
])

const targetItems = computed(() => [
    { key: 'targetJianAnCost', label: '建安', icon: Money, isSubtotal: false },
    { key: 'targetShiFanCost', label: '示范区', icon: HomeFilled, isSubtotal: false },
    { key: 'targetYuLiuCost', label: '预留', icon: Wallet, isSubtotal: false },
    { key: 'targetSubtotal', label: '小计', icon: DocumentAdd, isSubtotal: true },
])

const diffItems = computed(() => [
    { key: 'diffJianAnCost', label: '成本差异', icon: TrendCharts },
    { key: 'diffPricePerSqm', label: '单方差异', icon: DataAnalysis },
])
</script>

<style lang="scss" scoped>
// 主题颜色变量
$color-base: #3b82f6;
$color-base-bg: #eff6ff;
$color-target: #10b981;
$color-target-bg: #ecfdf5;
$color-diff: #f59e0b;
$color-diff-bg: #fffbeb;
$border-color: #e2e8f0;
$text-secondary: #64748b;
$shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);

.statistics-card {
    display: flex;
    background: #ffffff;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 15px;
    box-shadow: $shadow-sm;
    border: 1px solid $border-color;
    gap: 32px;
    align-items: stretch;
    transition: box-shadow 0.2s ease;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
}

.stat-left {
    flex: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    padding: 4px 0;
}

.stat-row {
    display: flex;
    align-items: center;
    gap: 10px;

    .stat-version {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        white-space: nowrap;
        min-width: 80px;

        .el-icon {
            font-size: 18px;
        }
    }

    .stat-items {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 16px;
    }

    .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px 6px 10px;
        border-radius: 8px;
        background: #f8fafc;
        border: 1px solid transparent;
        transition: all 0.2s ease;
        cursor: default;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
            border-color: $border-color;
        }

        .stat-icon {
            display: flex;
            align-items: center;

            .el-icon {
                font-size: 16px;
            }
        }

        .stat-content {
            display: flex;
            align-items: baseline;
            gap: 4px;
        }

        .stat-label {
            font-size: 13px;
            color: $text-secondary;
            font-weight: 500;
        }

        .stat-value {
            font-weight: 700;
            font-size: 17px;
            font-variant-numeric: tabular-nums;
            letter-spacing: 0.5px;
        }

        .stat-unit {
            font-size: 12px;
            color: $text-secondary;
            margin-left: 2px;
            font-weight: 400;
        }

        // 小计特殊样式
        &.stat-item-subtotal {
            background: #f1f5f9;
            // border-color: #e2e8f0;

            .stat-value {
                font-size: 18px;
            }
        }
    }

    // 基准版配色
    &.stat-row-base {

        .stat-version .el-icon,
        .stat-icon .el-icon {
            color: $color-base;
        }

        .stat-value {
            color: $color-base;
        }

        .stat-item {
            background: $color-base-bg;
        }

        // .stat-item-subtotal {
        //     background: darken($color-base-bg, 5%);
        // }
    }

    // 目标版配色
    &.stat-row-target {

        .stat-version .el-icon,
        .stat-icon .el-icon {
            color: $color-target;
        }

        .stat-value {
            color: $color-target;
        }

        .stat-item {
            background: $color-target-bg;
        }

        // .stat-item-subtotal {
        //     background: darken($color-target-bg, 5%);
        // }
    }
}

.stat-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    padding: 4px 0 4px 32px;
    border-left: 1px solid $border-color;

    .stat-version {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: $color-diff;

        .el-icon {
            font-size: 18px;
            color: $color-diff;
        }
    }

    .stat-items {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 16px;
    }

    .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px 6px 10px;
        border-radius: 8px;
        background: $color-diff-bg;
        // border: 1px solid #fde68a;
        transition: all 0.2s ease;
        cursor: default;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(245, 158, 11, 0.15);
        }

        .stat-icon .el-icon {
            font-size: 16px;
            color: $color-diff;
        }

        .stat-content {
            display: flex;
            align-items: baseline;
            gap: 4px;
        }

        .stat-label {
            font-size: 13px;
            color: $text-secondary;
            font-weight: 500;
        }

        .stat-value {
            font-weight: 700;
            font-size: 17px;
            color: $color-diff;
            font-variant-numeric: tabular-nums;
            letter-spacing: 0.5px;
        }

        .stat-unit {
            font-size: 12px;
            color: $text-secondary;
            margin-left: 2px;
            font-weight: 400;
        }
    }
}

// 移动端适配：小屏幕下纵向堆叠
@media (max-width: 768px) {
    .statistics-card {
        flex-direction: column;
        gap: 16px;
        padding: 16px;
    }

    .stat-right {
        border-left: none;
        border-top: 1px solid $border-color;
        padding: 16px 0 0 0;
    }

    .stat-row {
        flex-wrap: wrap;

        .stat-version {
            min-width: 60px;
        }
    }
}
</style>