<template>
  <base-modal
    v-model="modalVisible"
    :title="'导入当前项目指标'"
    width="550px"
    :confirm-loading="confirmLoading"
    @confirm="handleSubmit"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <div class="import-content">
      <div class="download-tips">
        <div class="tips-text">首次导入请先下载模板，按照格式填写！</div>
        <el-button type="primary" size="small" plain class="download-btn">
          <!-- <el-icon><Download /></el-icon> -->
          下载模版
        </el-button>
      </div>
      <el-upload
        class="upload-demo"
        drag
        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
        multipl
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          <em>点击上传文件</em>
          <div>支持Excel文件，单次上传不超过5MB</div>
        </div>
        <!-- <template #tip>
        <div class="el-upload__tip">
          支持Excel文件，单次上传不超过5MB
        </div>
      </template> -->
      </el-upload>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "@/components/base/base-modal.vue";
interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const confirmLoading = ref(false);

// 弹窗显示控制
const modalVisible = ref(props.modelValue);
// 取消
const handleCancel = () => {
  modalVisible.value = false;
};
// 关闭
const handleClose = () => {
  modalVisible.value = false;
};
const handleSubmit = () => {};

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  (val) => {
    modalVisible.value = val;
  },
);

watch(modalVisible, (val) => {
  emit("update:modelValue", val);
});

// 暴露方法
defineExpose({});
</script>

<style lang="scss" scoped>
.import-content {
  padding: 15px 15px 0;
  box-sizing: border-box;
  .download-tips {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    .tips-text {
      font-size: 14px;
      color: #666666;
    }
  }
}
</style>
