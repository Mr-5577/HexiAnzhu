<!-- 文件上传组件 -->
<template>
  <div class="upload-file">
    <el-upload
      ref="uploadRef"
      :action="uploadUrl"
      :headers="headers"
      :file-list="fileList"
      :multiple="multiple"
      :limit="limit"
      :accept="accept"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :disabled="disabled"
    >
      <el-button :loading="isUploading" :disabled="disabled">
        <el-icon><Upload /></el-icon>
        {{ buttonText }}
      </el-button>
      <template #tip>
        <div v-if="showTip" class="el-upload__tip">
          {{ tipTextComputed }}
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import type { UploadFile, UploadProps } from "element-plus";

interface FileItem extends UploadFile {
  key?: string;
  fileId?: string;
}

const props = withDefaults(
  defineProps<{
    /** 已上传的文件key列表 */
    modelValue?: string[];
    /** 是否多选 */
    multiple?: boolean;
    /** 最大上传数量 */
    limit?: number;
    /** 接受的文件类型 */
    accept?: string;
    /** 最大文件大小(MB) */
    maxSize?: number;
    /** 上传地址 */
    action?: string;
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否显示提示 */
    showTip?: boolean;
    /** 自定义提示文本 */
    tipText?: string;
    /** 按钮文本 */
    buttonText?: string;
  }>(),
  {
    modelValue: () => [],
    multiple: false,
    limit: 3,
    accept: ".pdf,.jpg,.png,.dwg,.doc,.docx",
    maxSize: 10,
    action: "/system/bindAttachment",
    disabled: false,
    showTip: true,
    tipText: "",
    buttonText: "选择文件",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void;
  (e: "success", files: FileItem[]): void;
  (e: "remove", file: FileItem): void;
  (e: "error", error: Error): void;
}>();

const uploadRef = ref();

// 请求头
const headers = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
}));

// 上传地址
const uploadUrl = computed(() => props.action);

// 文件列表
const fileList = ref([]);

// 上传中的文件数量
const uploadingCount = ref(0);
const isUploading = computed(() => uploadingCount.value > 0);

// 格式化提示文本
const defaultTip = `支持 ${props.accept} 格式，单个文件不超过 ${props.maxSize}MB，最多上传 ${props.limit} 个文件`;
const tipTextComputed = computed(() => props.tipText || defaultTip);

// 根据 keys 获取文件信息
const fetchFileInfoByKeys = async (keys: string[]) => {
  if (!keys || keys.length === 0) return [];

  try {
    // TODO: 调用后端接口根据 keys 批量获取文件信息
    // const res = await api.getFilesByKeys({ keys })
    // return res.data

    // 模拟返回
    return keys.map((key, index) => ({
      uid: key,
      name: `文件_${key.slice(-8)}.pdf`,
      key: key,
      url: `/api/file/${key}`,
      status: "success",
    }));
  } catch (error) {
    console.error("获取文件信息失败", error);
    return [];
  }
};

// 监听外部传入的 keys 变化
watch(
  () => props.modelValue,
  async (newKeys, oldKeys) => {
    // 避免循环更新
    const currentKeys = fileList.value.map((f) => f.key).filter(Boolean);
    if (JSON.stringify(newKeys) === JSON.stringify(currentKeys)) {
      return;
    }

    // 初始化文件列表
    if (newKeys && newKeys.length > 0) {
      const files = await fetchFileInfoByKeys(newKeys);
      fileList.value = files;
    } else if (!newKeys?.length && fileList.value.length) {
      fileList.value = [];
    }
  },
  {
    immediate: true,
    // deep: true,
  },
);

// 上传前校验
const handleBeforeUpload: UploadProps["beforeUpload"] = (file) => {
  // 检查是否超出数量限制
  const successFiles = fileList.value.filter((f) => f.status === "success");
  if (successFiles.length >= props.limit && !props.multiple) {
    ElMessage.warning(`最多只能上传 ${props.limit} 个文件`);
    return false;
  }

  // 检查文件大小
  const isLtMax = file.size / 1024 / 1024 < props.maxSize;
  if (!isLtMax) {
    ElMessage.error(`文件 ${file.name} 大小不能超过 ${props.maxSize}MB！`);
    return false;
  }

  // 检查文件类型
  const acceptTypes = props.accept
    .split(",")
    .map((t) => t.trim().toLowerCase());
  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

  if (!acceptTypes.includes(fileExtension)) {
    ElMessage.error(`文件 ${file.name} 格式不支持，只支持 ${props.accept}`);
    return false;
  }

  uploadingCount.value++;
  return true;
};

// 上传进度
const handleProgress: UploadProps["onProgress"] = (evt, file) => {
  // 可选的进度处理，可以派发事件给父组件
  console.log(`${file.name} 上传进度: ${evt.percent}%`);
};

// 上传成功
const handleSuccess: UploadProps["onSuccess"] = (response, file) => {
  uploadingCount.value--;

  if (response.code === 200 || response.success) {
    // 保存后端返回的 key
    const targetFile = fileList.value.find((f) => f.uid === file.uid);
    if (targetFile) {
      targetFile.key = response.data?.key || response.data?.fileId;
      targetFile.fileId = response.data?.fileId;
      targetFile.url = response.data?.url;
    }

    // 更新 v-model
    const keys = fileList.value
      .filter((f) => f.status === "success" && f.key)
      .map((f) => f.key as string);

    emit("update:modelValue", keys);
    emit("success", fileList.value);

    ElMessage.success(`${file.name} 上传成功`);
  } else {
    ElMessage.error(response.message || `${file.name} 上传失败`);

    // 移除失败的文件
    const index = fileList.value.findIndex((f) => f.uid === file.uid);
    if (index !== -1) {
      fileList.value.splice(index, 1);
    }
  }
};

// 上传失败
const handleError: UploadProps["onError"] = (error, file) => {
  uploadingCount.value--;
  ElMessage.error(`${file.name} 上传失败`);

  // 移除失败的文件
  const index = fileList.value.findIndex((f) => f.uid === file.uid);
  if (index !== -1) {
    fileList.value.splice(index, 1);
  }

  emit("error", error as Error);
};

// 移除文件
const handleRemove: UploadProps["onRemove"] = (file, files) => {
  // 更新 keys
  const keys = fileList.value
    .filter((f) => f.status === "success" && f.key)
    .map((f) => f.key as string);

  emit("update:modelValue", keys);
  emit("remove", file as FileItem);

  // 可选：调用后端删除接口
  // if (file.key) {
  //   api.deleteFile({ key: file.key }).catch(console.error)
  // }
};

// 超出数量限制
const handleExceed: UploadProps["onExceed"] = () => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`);
};

// 清空所有文件
const clearFiles = () => {
  fileList.value = [];
  emit("update:modelValue", []);
};

// 手动上传
const submit = () => {
  uploadRef.value?.submit();
};

// 暴露方法给父组件
defineExpose({
  clearFiles,
  submit,
  getFileList: () => fileList.value,
  getFileKeys: () => fileList.value.filter((f) => f.key).map((f) => f.key),
});
</script>

<style lang="scss" scoped>
.upload-file {
  width: 100%;

  :deep(.el-upload) {
    display: block;
  }

  :deep(.el-upload-list) {
    margin-top: 12px;

    .el-upload-list__item {
      transition: all 0.3s;

      &:hover {
        background-color: #f5f7fa;
      }
    }
  }

  .el-upload__tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
  }
}
</style>
