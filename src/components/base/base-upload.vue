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
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :on-preview="handlePreview"
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
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import type { UploadFile, UploadProps } from "element-plus";
import { getApiBaseUrl } from "@/utils/config";

// 附件信息接口
interface AnnexInfo {
  id: number;
  annexName: string;
  annexSize?: number;
  annexPath?: string;
  annexExt?: string;
  [key: string]: any;
}

interface FileItem extends UploadFile {
  id?: number;
  annexName?: string;
  annexPath?: string;
  annexSize?: number;
}

const props = withDefaults(
  defineProps<{
    /** 附件完整信息列表 */
    fileList?: AnnexInfo[];
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
    fileList: () => [],
    multiple: false,
    limit: 9,
    accept: ".pdf,.jpg,.png,.doc,.docx,.xlsx,.xls",
    maxSize: 20,
    action: "/system/uploadFile",
    disabled: false,
    showTip: true,
    tipText: "",
    buttonText: "选择文件",
  },
);

const emit = defineEmits<{
  (e: "update:fileList", value: AnnexInfo[]): void;
  (e: "success", file: AnnexInfo): void;
  (e: "remove", file: AnnexInfo): void;
}>();

const uploadRef = ref();
const uploadingCount = ref(0);
const isUploading = computed(() => uploadingCount.value > 0);

// 请求头
const headers = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
}));

// 上传地址
const uploadUrl = computed(() => {
  const baseUrl = getApiBaseUrl() || "";
  return baseUrl + props.action;
});

// 提示文本
const tipTextComputed = computed(
  () =>
    props.tipText ||
    `支持 ${props.accept} 格式，单个文件不超过 ${props.maxSize}MB，最多上传 ${props.limit} 个文件`,
);

// 上传前校验
const handleBeforeUpload: UploadProps["beforeUpload"] = (file) => {
  // 检查数量限制
  const successFiles = props.fileList.filter((f) => f.id);
  if (successFiles.length >= props.limit) {
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
  const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
  if (!acceptTypes.includes(fileExt)) {
    ElMessage.error(`文件 ${file.name} 格式不支持，只支持 ${props.accept}`);
    return false;
  }

  uploadingCount.value++;
  return true;
};

// 上传成功
const handleSuccess: UploadProps["onSuccess"] = (res, file) => {
  uploadingCount.value--;
  // const res = {
  //   code: 200,
  //   message: "success",
  //   data: {
  //     id: 5,
  //     annexName: "附件1.xls",
  //     annexSize: 20992,
  //     annexMd5: "fe1cb77a59d6e88424d838313c3cd8ce",
  //     annexPath:
  //       "D:\\annex\\temporary\\20260707\\fe1cb77a59d6e88424d838313c3cd8ce.xls",
  //     annexExt: "xls",
  //     uploadStatus: 0,
  //     expireTime: "2026-07-22T15:38:30.1855396",
  //     createDate: "2026-07-07T15:38:30.185",
  //     createId: 15,
  //   },
  // };
  if (res.code === 200 && res.data) {
    const { data } = res;

    // 构建新的附件信息
    const newAnnex: AnnexInfo = {
      id: data.id,
      name: data.annexName || file.name,
      url: data.annexPath,
      annexName: data.annexName || file.name,
      annexPath: data.annexPath,
      annexSize: data.annexSize,
      annexExt: data.annexExt,
    };

    // 通知父组件更新列表
    const newFileList = [...props.fileList, newAnnex];
    emit("update:fileList", newFileList);
    emit("success", newAnnex);

    ElMessage.success(`${file.name} 上传成功`);
  } else {
    ElMessage.error(res.message || `${file.name} 上传失败`);
  }
};

// 上传失败
const handleError: UploadProps["onError"] = (_, file) => {
  uploadingCount.value--;
  ElMessage.error(`${file.name} 上传失败`);
};

// 移除文件
const handleRemove: UploadProps["onRemove"] = (file, fileData) => {
  console.log("handleRemove", file, fileData);
  const fileId = (file as FileItem).id;
  if (fileId) {
    const newFileList = props.fileList.filter((f) => f.id !== fileId);
    emit("update:fileList", newFileList);

    const removedFile = props.fileList.find((f) => f.id === fileId);
    if (removedFile) {
      emit("remove", removedFile);
    }
  }
};

// 预览文件
const handlePreview: UploadProps["onPreview"] = (file) => {
  if (file.url) {
    window.open(file.url, "_blank");
  }
};

// 超出数量限制
const handleExceed: UploadProps["onExceed"] = () => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`);
};

// 清空所有文件
const clearFiles = () => {
  emit("update:fileList", []);
};

// 暴露方法
defineExpose({
  clearFiles,
  submit: () => uploadRef.value?.submit(),
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
