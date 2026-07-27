<!-- 文件上传组件 -->
<template>
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
    <template #trigger>
      <el-button
        :link="isLink"
        :size="size"
        :type="buttonType"
        :loading="isUploading"
        :disabled="disabled"
      >
        <el-icon v-if="showIcon"><Upload /></el-icon>
        {{ buttonText }}
      </el-button>
    </template>
    <template #tip>
      <div v-if="showTip" class="el-upload__tip">
        {{ tipTextComputed }}
      </div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import type { UploadFile, UploadProps } from "element-plus";
import { getApiBaseUrl } from "@/utils/config";
import { buildFileUrl } from "@/utils/file-path-util";

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
    /** 是否不限制文件格式 */
    unrestricted?: boolean;
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
    /** 是否显示上传图标 */
    showIcon?: boolean;
    /** 上传按钮尺寸 */
    size?: "small" | "default" | "large";
    /** 是否为链接样式 */
    isLink?: boolean;
    /** 按钮类型 */
    buttonType?:
      | "primary"
      | "success"
      | "warning"
      | "danger"
      | "info"
      | "default";
  }>(),
  {
    fileList: () => [],
    multiple: false,
    limit: 9,
    // accept: ".pdf,.jpg,.png,.JPEG,.doc,.docx,.xlsx,.xls",
    accept:
      ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt,.zip,.rar,.7z",
    unrestricted: false, // 默认不开启
    maxSize: 20,
    action: "/system/uploadFile",
    disabled: false,
    showTip: true,
    tipText: "",
    buttonText: "选择文件",
    showIcon: true,
    size: "default",
    isLink: false,
    buttonType: "default",
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
const tipTextComputed = computed(() => {
  if (props.tipText) return props.tipText;
  if (props.unrestricted) {
    return `单个文件不超过 ${props.maxSize}MB，最多上传 ${props.limit} 个文件`;
  }
  return `支持 ${props.accept} 格式，单个文件不超过 ${props.maxSize}MB，最多上传 ${props.limit} 个文件`;
});

// 上传前校验
const handleBeforeUpload: UploadProps["beforeUpload"] = (file) => {
  console.log("handleBeforeUpload", file);
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

  // 只有在非无限制模式下才检查文件类型
  if (!props.unrestricted) {
    const acceptTypes = props.accept
      .split(",")
      .map((t) => t.trim().toLowerCase());
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptTypes.includes(fileExt)) {
      ElMessage.error(`文件 ${file.name} 格式不支持，只支持 ${props.accept}`);
      return false;
    }
  }

  uploadingCount.value++;
  return true;
};

// 上传成功
const handleSuccess: UploadProps["onSuccess"] = (res, file) => {
  uploadingCount.value--;
  // 文件上传成功返回的结构数据
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
  //     uploadStatus: 0, // 文件状态，0-临时文件 1-正式文件
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
      name: data.annexName || file.name, // 文件名称
      url: data.annexPath, // 文件名称
      annexName: data.annexName || file.name, // 文件名称
      annexPath: data.annexPath, // 文件路径
      annexSize: data.annexSize, // 文件尺寸
      annexExt: data.annexExt, // 文件类型
      uploadStatus: data.uploadStatus, // 文件状态，0-临时文件 1-正式文件
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
  if (props.disabled) {
    ElMessage.warning("当前处于禁用状态，无法删除文件");
    return;
  }
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
const handlePreview: UploadProps["onPreview"] = (file: any) => {
  console.log("handlePreview", file);
  // if (file.url) {
  //   window.open(file.url, "_blank");
  // }
  if (file && file.annexPath) {
    const url = buildFileUrl(file.annexPath);
    // 直接在新窗口打开
    window.open(url, "_blank");
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

// 暴露触发文件选择的方法
const triggerFileSelect = () => {
  if (props.disabled) return;
  // 获取 el-upload 内部的 input 元素并触发点击
  const uploadInstance = uploadRef.value;
  if (uploadInstance) {
    // 方式1：通过 el-upload 的内部方法
    if (typeof uploadInstance.handleClick === "function") {
      uploadInstance.handleClick();
    } else {
      // 方式2：查找内部的 input 元素
      const input = uploadInstance.$el?.querySelector('input[type="file"]');
      if (input) {
        input.click();
      }
    }
  }
};

// 暴露方法
defineExpose({
  clearFiles,
  submit: () => uploadRef.value?.submit(),
  triggerFileSelect,
  uploadRef,
});
</script>

<style lang="scss" scoped>
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
// ✅ 禁用状态下隐藏删除按钮
:deep(.el-upload-list--disabled) {
  .el-upload-list__item {
    .el-upload-list__item-actions {
      .el-upload-list__item-delete {
        display: none !important;
      }
    }
  }
}
.el-upload__tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}
</style>
