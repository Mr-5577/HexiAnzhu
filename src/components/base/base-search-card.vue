<!-- src/components/base/base-search-card.vue -->
<template>
    <div class="search-card">
        <div class="search-form-wrapper" :class="{ 'is-collapsed': !isExpand }">
            <slot name="form" />
        </div>
        <div class="search-actions">
            <slot name="actions" />
            <el-button @click="toggleExpand" class="btn-toggle" type="primary" plain v-if="showExpandButton">
                {{ isExpand ? '收起' : '展开' }}
                <el-icon>
                    <ArrowDown v-if="!isExpand" />
                    <ArrowUp v-else />
                </el-icon>
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';

// Props
interface Props {
    showExpandButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    showExpandButton: true,
});

const isExpand = ref(false);
const toggleExpand = () => { isExpand.value = !isExpand.value; };

</script>

<style lang="scss" scoped>
.search-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 12px 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
    border: 1px solid #edf2f7;
    flex-shrink: 0;

    .search-form-wrapper {
        max-height: none;
        overflow: hidden;
        transition: max-height 0.3s ease;

        // 收起时显示一行（根据实际高度调整）
        &.is-collapsed {
            max-height: 40px;
        }

        // 为插槽内的 el-form 提供基础样式
        :deep(.el-form) {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 4px 0;

            .el-form-item {
                margin-bottom: 8px;
                margin-right: 16px;

                .el-form-item__label {
                    font-size: 13px;
                    color: #4a5568;
                    font-weight: 500;
                    padding-right: 8px;
                    display: flex;
                    justify-content: flex-start;
                }
            }

            // 统一输入框、下拉、级联、日期选择器样式
            .el-input__wrapper,
            .el-select .el-input__wrapper,
            .el-cascader .el-input__wrapper,
            .el-date-editor .el-input__wrapper {
                border-radius: 8px;
                box-shadow: 0 0 0 1px #e2e8f0 inset;
                transition: box-shadow 0.2s;

                &:hover {
                    box-shadow: 0 0 0 1px #b7c0d0 inset;
                }

                &.is-focus {
                    box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.25), 0 0 0 1px #4f6ef7 inset !important;
                }
            }

            // 特殊处理 EnumSelect（如果它内部也是 el-input）
            .enum-select .el-input__wrapper {
                border-radius: 8px;
                box-shadow: 0 0 0 1px #e2e8f0 inset;

                &:hover {
                    box-shadow: 0 0 0 1px #b7c0d0 inset;
                }

                &.is-focus {
                    box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.25), 0 0 0 1px #4f6ef7 inset !important;
                }
            }

            // 级联多选标签换行控制（保持单行）
            .el-cascader {
                .el-input__wrapper {
                    flex-wrap: nowrap !important;
                    overflow: hidden !important;
                    height: 32px !important;
                    min-height: 32px !important;
                    align-items: center !important;
                }

                .el-cascader__tags {
                    flex-wrap: nowrap !important;
                    overflow: hidden !important;
                    flex: 1 1 auto !important;
                    min-width: 0 !important;
                    height: 100% !important;
                    align-items: center !important;

                    .el-tag {
                        flex-shrink: 0 !important;
                        max-width: 100px;
                        height: 22px !important;
                        line-height: 22px !important;

                        .el-tag__content {
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }

                    .el-tag--info {
                        flex-shrink: 0 !important;
                    }
                }
            }
        }
    }

    .search-actions {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        justify-content: flex-end;
        gap: 12px;
        padding-top: 6px;
        padding-right: 26px;

        .btn-toggle {
            //   margin-left: auto;
            color: #4f6ef7;
            font-weight: 500;

            .el-icon {
                margin-left: 4px;
            }
        }
    }
}

// 响应式
@media screen and (max-width: 1200px) {
    .search-card .search-actions .btn-toggle {
        margin-left: 0;
        width: 100%;
        justify-content: flex-end;
    }
}
</style>