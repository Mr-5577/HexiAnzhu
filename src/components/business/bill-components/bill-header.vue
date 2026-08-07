<!-- 单据 header -->
<template>
  <header class="contract-header">
    <div class="header-row">
      <div class="header-left">
        <div class="header-title-group">
          <span class="header-title">{{ title }}</span>
          <span v-if="showStatus" class="status-badge" :class="statusClass">
            <span class="dot"></span>
            {{ statusText }}
          </span>
        </div>
        <div class="header-meta">
          <slot name="meta">
            <span class="meta-item">
              编号：<strong>{{ contractNo || "—" }}</strong>
            </span>
            <span class="sep">|</span>
            <span class="meta-item">
              提交人：<strong>{{ submitter || "—" }}</strong>
            </span>
            <span class="sep">|</span>
            <span class="meta-item">
              提交时间：<strong>{{ submitTime || "—" }}</strong>
            </span>
          </slot>
        </div>
      </div>
      <div class="header-actions">
        <!-- 保存按钮 -->
        <el-button
          class="btn-save"
          type="primary"
          icon="DocumentAdd"
          :loading="buttonLoading"
          :disabled="saveDisabled"
          @click="handleSave"
        >
          保存
        </el-button>

        <!-- 提交按钮 -->
        <el-button
          class="btn-submit"
          type="success"
          plain
          icon="Promotion"
          :loading="buttonLoading"
          :disabled="submitDisabled"
          @click="handleSubmit"
        >
          提交
        </el-button>

        <!-- 删除按钮 -->
        <el-button
          class="btn-delete"
          type="danger"
          plain
          icon="Delete"
          :loading="buttonLoading"
          :disabled="deleteDisabled"
          @click="handleDelete"
        >
          删除
        </el-button>

        <!-- 作废按钮 -->
        <el-button
          class="btn-void"
          type="warning"
          plain
          icon="Remove"
          :loading="buttonLoading"
          :disabled="voidDisabled"
          @click="handleVoid"
        >
          作废
        </el-button>

        <!-- 查看流程 -->
        <el-button
          class="btn-flow"
          type="info"
          plain
          icon="View"
          :loading="buttonLoading"
          :disabled="viewDisabled"
          @click="handleViewFlow"
        >
          查看流程
        </el-button>

        <!-- 自定义操作插槽 -->
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { conBillStatusEnum } from "@/constants/contract-manage/enums";
import { getEnumItem, getEnumLabel } from "@/utils/enum";
import { computed } from "vue";

export interface ContractHeaderProps {
  /** 标题 */
  title?: string;
  /** 合同编号 */
  contractNo?: string;
  /** 提交人 */
  submitter?: string;
  /** 提交时间 */
  submitTime?: string;
  /** 合同状态：0-草稿，10-审批中，40-已审批，80-作废，99-其他 */
  status?: number;
  /** 是否显示状态标签 */
  showStatus?: boolean;
  /** 按钮加载状态 */
  buttonLoading?: boolean;
  /** 保存按钮禁用状态 */
  saveDisabled?: boolean;
  /** 提交按钮加载状态 */
  submitDisabled?: boolean;
  /** 删除按钮禁用状态 */
  deleteDisabled?: boolean;
  /** 作废按钮禁用状态 */
  voidDisabled?: boolean;
  /** 查看流程按钮禁用状态 */
  viewDisabled?: boolean;
}

const props = withDefaults(defineProps<ContractHeaderProps>(), {
  title: "合同审批",
  contractNo: "",
  submitter: "",
  submitTime: "",
  status: 0,
  showStatus: true,
  buttonLoading: false,
  saveDisabled: false,
  submitDisabled: false,
  deleteDisabled: false,
  voidDisabled: false,
  viewDisabled: false,
});

const emit = defineEmits<{
  /** 保存事件 */
  (e: "save"): void;
  /** 提交事件 */
  (e: "submit"): void;
  /** 删除事件 */
  (e: "delete"): void;
  /** 作废事件 */
  (e: "void"): void;
  /** 查看流程事件 */
  (e: "viewFlow"): void;
}>();

/** 状态文本 - 使用枚举工具函数获取 */
const statusText = computed(() => {
  return getEnumLabel(conBillStatusEnum, props.status ?? 0);
});

/** 状态类型 - 用于样式类名 */
const statusType = computed(() => {
  const item = getEnumItem(conBillStatusEnum, props.status ?? 0);
  return item?.type || "info";
});

/** 状态样式类 */
const statusClass = computed(() => {
  return `status-${statusType.value}`;
});

const handleSave = () => emit("save");
const handleSubmit = () => emit("submit");
const handleDelete = () => emit("delete");
const handleVoid = () => emit("void");
const handleViewFlow = () => emit("viewFlow");
</script>

<style scoped lang="scss">
/* ============ 顶部操作栏 (sticky 左右结构) ============ */
.contract-header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: #ffffff;
  padding: 14px 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
  }

  .header-left {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .header-title-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-title {
    font-size: 20px;
    font-weight: 700;
    color: #1d2129;
    letter-spacing: 0.5px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    // 状态颜色 - 对应 conBillStatusEnum 中的 type
    &.status-info {
      background: #f4f4f5;
      color: #909399;
      border: 1px solid #e9e9eb;

      .dot {
        background: #909399;
      }
    }

    &.status-primary {
      background: #ecf5ff;
      color: #409eff;
      border: 1px solid #d9ecff;

      .dot {
        background: #409eff;
      }
    }

    &.status-success {
      background: #f0f9eb;
      color: #67c23a;
      border: 1px solid #c2e7b0;

      .dot {
        background: #67c23a;
      }
    }

    &.status-warning {
      background: #fdf6ec;
      color: #e6a23c;
      border: 1px solid #f5dab1;

      .dot {
        background: #e6a23c;
      }
    }

    // 默认 fallback
    &.status-default {
      background: #f4f4f5;
      color: #909399;
      border: 1px solid #e9e9eb;

      .dot {
        background: #909399;
      }
    }
  }

  .header-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: #86909c;
    flex-wrap: wrap;

    .sep {
      color: #e4e7ed;
    }

    .meta-item strong {
      color: #4e5969;
      font-weight: 500;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    flex-shrink: 0;

    :deep(.el-button) {
      border-radius: 8px;
      font-weight: 500;
      padding: 8px 18px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      .el-icon {
        transition: transform 0.25s ease;
      }

      // 禁用状态样式
      &.is-disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;

        .el-icon {
          transform: none !important;
        }

        &:hover {
          transform: none !important;
          box-shadow: none !important;
        }
      }

      &:hover:not(.is-disabled) {
        transform: translateY(-2px);
      }

      &:active:not(.is-disabled) {
        transform: translateY(0);
      }
    }

    /* 保存 - 主操作，渐变蓝 + 强阴影 */
    :deep(.btn-save) {
      background: linear-gradient(135deg, #409eff 0%, #36a3f7 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.35);
      color: #fff;

      &:hover:not(.is-disabled) {
        background: linear-gradient(135deg, #66b1ff 0%, #4ba8f8 100%);
        box-shadow: 0 6px 18px rgba(64, 158, 255, 0.45);

        .el-icon {
          transform: scale(1.15) rotate(-6deg);
        }
      }
    }

    /* 提交 - 成功色渐变 */
    :deep(.btn-submit) {
      background: linear-gradient(135deg, #f0f9eb 0%, #e8f7e0 100%);
      border-color: #c2e7b0;
      color: #67c23a;

      &:hover:not(.is-disabled) {
        background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%);
        border-color: #67c23a;
        color: #fff;
        box-shadow: 0 6px 16px rgba(103, 194, 58, 0.35);

        .el-icon {
          transform: scale(1.15) rotate(-6deg);
        }
      }
    }

    /* 删除 - 危险色 */
    :deep(.btn-delete) {
      background: linear-gradient(135deg, #fef0f0 0%, #ffe9e9 100%);
      border-color: #fbc4c4;
      color: #f56c6c;

      &:hover:not(.is-disabled) {
        background: linear-gradient(135deg, #f56c6c 0%, #e9534f 100%);
        border-color: #f56c6c;
        color: #fff;
        box-shadow: 0 6px 16px rgba(245, 108, 108, 0.35);

        .el-icon {
          transform: scale(1.15);
        }
      }
    }

    /* 作废 - 警告色 */
    :deep(.btn-void) {
      background: linear-gradient(135deg, #fdf6ec 0%, #fcefd9 100%);
      border-color: #f5dab1;
      color: #e6a23c;

      &:hover:not(.is-disabled) {
        background: linear-gradient(135deg, #e6a23c 0%, #d4891a 100%);
        border-color: #e6a23c;
        color: #fff;
        box-shadow: 0 6px 16px rgba(230, 162, 60, 0.35);

        .el-icon {
          transform: rotate(90deg);
        }
      }
    }

    /* 查看流程 - 中性色 */
    :deep(.btn-flow) {
      background: linear-gradient(135deg, #f4f4f5 0%, #eceef0 100%);
      border-color: #d3d4d6;
      color: #606266;

      &:hover:not(.is-disabled) {
        background: linear-gradient(135deg, #909399 0%, #77808c 100%);
        border-color: #909399;
        color: #fff;
        box-shadow: 0 6px 16px rgba(144, 147, 153, 0.35);

        .el-icon {
          transform: scale(1.1);
        }
      }
    }
  }
}
</style>
