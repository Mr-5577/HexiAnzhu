<!-- 上传发票 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="'上传发票'"
    width="700px"
    @close="handleClose"
    @confirm="handleConfirm"
  >
    <div class="file-box">
      <el-form-item label="上传发票">
        <base-upload
          v-model:file-list="annexFileList"
          :limit="99"
          :multiple="true"
          :showIcon="true"
          :showTip="true"
          :maxSize="20"
          :accept="'.pdf,.jpg,.jpeg,.png'"
          :tipText="'支持上传pdf、jpg、jpeg、png格式文件，单个文件不超过20M'"
          button-text="选择文件"
          size="default"
          @success="handleFileSuccess"
        ></base-upload>
      </el-form-item>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { ref, watch, computed } from "vue";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [annexFileList: any[]];
}>();

const dialogVisible = ref(props.modelValue);
const annexFileList = ref([]);

const handleFileSuccess = (file: any) => {
  annexFileList.value.push(file);
};

/**
 * 确认选择
 */
const handleConfirm = async () => {
  console.log("annexFileList.value", annexFileList.value);
  if (!annexFileList.value.length) {
    ElMessage.warning("暂无发票附件");
    return;
  }
  emit("success", annexFileList.value);
  handleClose();
};

const handleClose = () => {
  dialogVisible.value = false;
};

watch(
  () => props.modelValue,
  (val) => {
    annexFileList.value = [];
    dialogVisible.value = val;
  },
);

watch(dialogVisible, (val) => emit("update:modelValue", val));
</script>
<style lang="scss" scoped>
.file-box {
  height: 400px;
  overflow-y: auto;
}
</style>
