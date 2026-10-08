<template>
  <el-dialog
    v-model="modalVisible"
    :title="title"
    :width="width"
    :top="top"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="false"
    :append-to-body="true"
    destroy-on-close
    @close="handleClose"
    class="base-modal-dialog"
  >
    <!-- 头部 -->
    <template #header>
      <div class="modal-header">
        <span class="modal-title">{{ title }}</span>
        <el-icon class="close-icon" @click="handleCancel">
          <Close />
        </el-icon>
      </div>
    </template>

    <!-- 内容区域 -->
    <slot></slot>

    <!-- 底部 -->
    <template #footer>
      <div style="margin-top: 10px">
        <el-button v-if="showCancelButton" @click="handleCancel">
          {{ cancelText }}
        </el-button>
        <el-button
          v-if="showConfirmButton"
          type="primary"
          :loading="confirmLoading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElDialog, ElButton, ElIcon } from "element-plus";
import { Close } from "@element-plus/icons-vue";

interface Props {
  modelValue: boolean;
  title?: string;
  width?: string;
  top?: string;
  closeOnClickModal?: boolean;
  closeOnPressEscape?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "提示",
  width: "600px",
  top: "8vh",
  closeOnClickModal: false,
  closeOnPressEscape: false,
  confirmText: "确定",
  cancelText: "取消",
  confirmLoading: false,
  showCancelButton: true,
  showConfirmButton: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
  cancel: [];
  close: [reason: "cancel" | "close" | "outside"];
}>();

// computed 简化双向绑定
const modalVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 统一关闭
const closeModal = (reason: "cancel" | "close" | "outside" = "close") => {
  // 只在弹窗打开时才执行关闭逻辑，避免重复触发
  if (!modalVisible.value) return;
  modalVisible.value = false;
  // 根据关闭原因触发不同事件
  if (reason === "cancel") {
    emit("cancel");
  }
  // 无论什么原因关闭，都触发 close 事件
  emit("close", reason);
};

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  closeModal("cancel");
};

const handleClose = () => {
  closeModal("outside");
};

// 暴露方法
defineExpose({
  open: () => {
    modalVisible.value = true;
  },
  close: () => {
    closeModal("close");
  },
});
</script>

<style lang="scss" scoped>
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-icon {
  cursor: pointer;
  font-size: 18px;
  color: #999;
  transition: color 0.3s ease;

  &:hover {
    color: #666;
  }
}
</style>
<style lang="scss">
// 不加 scoped，专门写 dialog 的样式
.base-modal-dialog .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
}
.base-modal-dialog .el-dialog__footer {
  padding: 0;
}
</style>
