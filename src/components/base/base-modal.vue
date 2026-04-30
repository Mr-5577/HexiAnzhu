<template>
  <el-dialog
    v-model="modalVisible"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="false"
    :append-to-body="true"
    destroy-on-close
    @close="handleClose"
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
    <div class="modal-body">
      <slot></slot>
    </div>

    <!-- 底部 -->
    <template #footer>
      <div class="modal-footer">
        <el-button @click="handleCancel">
          {{ cancelText }}
        </el-button>
        <el-button
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
import { ref, watch } from "vue";
import { ElDialog, ElButton, ElIcon } from "element-plus";
import { Close } from "@element-plus/icons-vue";

interface Props {
  modelValue: boolean;
  title?: string;
  width?: string;
  closeOnClickModal?: boolean;
  closeOnPressEscape?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "提示",
  width: "600px",
  closeOnClickModal: false,
  closeOnPressEscape: false,
  confirmText: "确定",
  cancelText: "取消",
  confirmLoading: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
  cancel: [];
  close: [];
}>();

const modalVisible = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    modalVisible.value = val;
  }
);

watch(modalVisible, (val) => {
  emit("update:modelValue", val);
});

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  modalVisible.value = false;
  emit("cancel");
};

const handleClose = () => {
  emit("close");
};

// 暴露方法
defineExpose({
  open: () => {
    modalVisible.value = true;
  },
  close: () => {
    modalVisible.value = false;
  },
});
</script>

<style lang="scss" scoped>
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 20px;
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

.modal-body {
  // padding: 20px;
  // box-sizing: border-box;
  max-height: 60vh;
  overflow-y: auto;

  &:deep(*) {
    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 20px 20px;
}
</style>
