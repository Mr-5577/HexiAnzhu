<template>
  <div class="user-avatar-container">
    <!-- 头像显示区域 -->
    <div class="avatar-display" @click="handleAvatarClick">
      <img :src="avatarUrl" alt="用户头像" class="avatar-image" />
      <div class="avatar-overlay">
        <el-icon size="20"><Camera /></el-icon>
        <span>更换头像</span>
      </div>
    </div>

    <!-- 头像上传对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="上传头像"
      width="400px"
      @close="handleDialogClose"
    >
      <!-- 使用自定义header插槽 -->
      <template #header="{ titleId, titleClass }">
        <div class="dialog-header">
          <span :id="titleId" :class="titleClass">上传头像</span>
        </div>
      </template>
      <!-- 头像预览 -->
      <div class="avatar-preview-section">
        <div class="preview-container">
          <img
            :src="previewImageUrl || avatarUrl"
            alt="头像预览"
            class="preview-image"
          />
        </div>
        <div class="preview-tips">
          <el-text type="info" size="small"> 预览 </el-text>
        </div>
      </div>

      <!-- 上传控件 -->
      <div class="upload-section">
        <el-upload
          ref="uploadRef"
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeAvatarUpload"
          accept=".jpg,.jpeg,.png,.webp"
        >
          <template #trigger>
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择图片
            </el-button>
          </template>
        </el-upload>

        <div class="file-info" v-if="selectedFile">
          <el-text type="success" size="small">
            <el-icon><Check /></el-icon>
            已选择: {{ selectedFile.name }}
          </el-text>
          <el-text type="info" size="small">
            ({{ formatFileSize(selectedFile.size) }})
          </el-text>
        </div>
      </div>

      <!-- 上传提示 -->
      <div class="upload-tips">
        <el-alert title="上传要求" type="info" :closable="false" size="small">
          <template #default>
            <div class="tips-content">
              <div>• 支持 JPG、PNG、JPEG、WEBP 格式</div>
              <div>• 图片大小不超过 2MB</div>
              <div>• 建议尺寸：200×200 像素</div>
              <div>• 图片将自动裁剪为圆形</div>
            </div>
          </template>
        </el-alert>
      </div>

      <!-- 操作按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="uploadLoading"
            :disabled="!selectedFile"
            @click="handleUploadAvatar"
          >
            {{ uploadLoading ? "上传中..." : "上传头像" }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage, type UploadInstance } from "element-plus";
import { Camera, Upload, Check } from "@element-plus/icons-vue";

// 静态头像URL
const defaultAvatarUrl =
  "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
const avatarUrl = ref<string>(defaultAvatarUrl);

// 对话框控制
const dialogVisible = ref<boolean>(false);

// 上传相关
const uploadRef = ref<UploadInstance>();
const uploadLoading = ref<boolean>(false);
const selectedFile = ref<File | null>(null);
const previewImageUrl = ref<string>("");

// 点击头像
const handleAvatarClick = () => {
  dialogVisible.value = true;
};

// 关闭对话框
const handleDialogClose = () => {
  resetUpload();
};

// 文件选择变化
const handleFileChange = (uploadFile: any) => {
  const file = uploadFile.raw;
  if (!file) return;

  // 验证文件
  if (!beforeAvatarUpload(file)) {
    uploadRef.value?.clearFiles();
    return;
  }

  selectedFile.value = file;

  // 创建预览URL
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImageUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

// 文件上传前验证
const beforeAvatarUpload = (file: File): boolean => {
  // 检查文件类型
  const isImage = file.type.startsWith("image/");
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const isValidType = validTypes.includes(file.type.toLowerCase());

  if (!isImage || !isValidType) {
    ElMessage.error("只能上传 JPG、PNG、JPEG 或 WEBP 格式的图片！");
    return false;
  }

  // 检查文件大小（2MB）
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    ElMessage.error("图片大小不能超过 2MB！");
    return false;
  }

  return true;
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 上传头像
const handleUploadAvatar = async () => {
  if (!selectedFile.value) {
    ElMessage.warning("请先选择图片");
    return;
  }

  uploadLoading.value = true;

  try {
    // 模拟API调用 - 延迟1秒
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 创建对象URL用于预览（模拟上传成功）
    const newAvatarUrl = URL.createObjectURL(selectedFile.value);

    // 更新头像
    avatarUrl.value = newAvatarUrl;

    ElMessage.success({
      message: "头像上传成功",
      duration: 2000,
    });

    dialogVisible.value = false;

    // 在实际项目中，这里应该调用API上传头像
    // 示例：
    // const formData = new FormData()
    // formData.append('avatar', selectedFile.value)
    // const response = await uploadAvatarAPI(formData)
    // if (response.success) {
    //   avatarUrl.value = response.data.avatarUrl
    //   ElMessage.success('头像上传成功')
    //   dialogVisible.value = false
    // }
  } catch (error) {
    console.error("上传失败:", error);
    ElMessage.error("头像上传失败，请重试");
  } finally {
    uploadLoading.value = false;
    resetUpload();
  }
};

// 重置上传状态
const resetUpload = () => {
  selectedFile.value = null;
  previewImageUrl.value = "";
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

// 模拟从服务器获取头像
const fetchUserAvatar = () => {
  // 在实际项目中，这里应该调用API获取用户头像
  // 示例：
  // try {
  //   const response = await getUserAvatarAPI()
  //   if (response.success && response.data.avatarUrl) {
  //     avatarUrl.value = response.data.avatarUrl
  //   }
  // } catch (error) {
  //   console.error('获取头像失败:', error)
  // }

  // 使用静态数据
  avatarUrl.value = defaultAvatarUrl;
};

// 初始化获取头像
fetchUserAvatar();
</script>

<style lang="scss" scoped>
.user-avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.avatar-display {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid #f0f0f0;
  background-color: #f5f7fa;

  &:hover {
    border-color: #409eff;
    transform: scale(1.05);

    .avatar-overlay {
      opacity: 1;
      transform: translateY(0);
    }

    .avatar-image {
      transform: scale(1.1);
    }
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;

    .el-icon {
      margin-bottom: 6px;
      color: #ffffff;
    }

    span {
      font-size: 12px;
      font-weight: 500;
    }
  }
}

// 对话框样式
.dialog-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.avatar-preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;

  .preview-container {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #e4e7ed;
    background-color: #f8f9fa;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .preview-tips {
    text-align: center;
  }
}

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;

  .avatar-uploader {
    .el-button {
      padding: 10px 20px;
    }
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;

    .el-icon {
      margin-right: 4px;
    }
  }
}

.upload-tips {
  margin-bottom: 20px;
  .el-alert {
    display: flex;
    justify-content: center;
  }
  .tips-content {
    font-size: 12px;
    line-height: 1.6;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    div {
      margin-bottom: 2px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

// 响应式设计
@media (max-width: 768px) {
  .avatar-display {
    width: 100px;
    height: 100px;
  }

  .preview-container {
    width: 100px !important;
    height: 100px !important;
  }
}

@media (max-width: 480px) {
  .avatar-display {
    width: 80px;
    height: 80px;
  }

  .upload-section .el-button {
    padding: 8px 16px !important;
  }
}
</style>
