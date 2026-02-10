<template>
  <div class="reset-pass-page">
    <div class="reset-password-container">
      <div class="reset-card">
        <div class="header">
          <h2>重置密码</h2>
          <p class="subtitle">您的密码已过期，请设置新密码</p>
        </div>

        <div class="form-container">
          <!-- 使用你的表单组件 -->
          <el-form
            ref="pwdFormRef"
            :model="formData"
            :rules="rules"
            label-width="90px"
          >
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input
                v-model="formData.oldPassword"
                placeholder="请输入旧密码"
                type="password"
                show-password
                size="large"
                @keyup.enter="handleSubmit"
              />
            </el-form-item>

            <el-form-item label="新密码" prop="password">
              <el-input
                v-model="formData.password"
                placeholder="请输入新密码"
                type="password"
                show-password
                size="large"
                @keyup.enter="handleSubmit"
              />
              <div class="password-tips">
                密码长度6-20位,英文字母、数字和 !@$.+-*
              </div>
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="formData.confirmPassword"
                placeholder="请确认新密码"
                type="password"
                show-password
                size="large"
                @keyup.enter="handleSubmit"
              />
            </el-form-item>

            <el-form-item>
              <el-button class="cancel-btn" @click="handleCancel">
                取消
              </el-button>
              <el-button
                class="submit-btn"
                type="primary"
                :loading="saveLoading"
                @click="handleSubmit"
              >
                确认重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user-store";
import { md5 } from "@/utils/crypto";
import { userApi } from "@/api/user-api";

const router = useRouter();
const userStore = useUserStore();

// 获取用户名
const username = computed(() => {
  return userStore?.empNo || "";
});

interface PwdForm {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

const pwdFormRef = ref<FormInstance>();
const saveLoading = ref(false);
const formData = ref<PwdForm>({
  oldPassword: "",
  password: "",
  confirmPassword: "",
});

// 自定义验证规则
const validateConfirmPassword = (
  rule: any,
  value: string,
  callback: Function,
) => {
  if (value !== formData.value.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const validatePassword = (rule: any, value: string, callback: Function) => {
  const illegalChars = /^[A-Za-z0-9!@$.+\-*]+$/;
  if (!illegalChars.test(value)) {
    callback(new Error("密码只能包含英文字母、数字和 !@$.+-*"));
  } else if (value === formData.value.oldPassword) {
    callback(new Error("新密码不能和旧密码一样"));
  } else {
    callback();
  }
};

const rules = reactive<FormRules<PwdForm>>({
  oldPassword: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
  password: [
    { required: true, message: "新密码不能为空", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" },
    { validator: validatePassword, trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "确认密码不能为空", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" },
  ],
});

// 提交修改密码
const handleSubmit = async () => {
  if (!pwdFormRef.value) return;
  const valid = await pwdFormRef.value.validate();
  if (!valid) return;

  try {
    saveLoading.value = true;
    const params = {
      username: username.value,
      oldPassword: md5(formData.value.oldPassword),
      password: md5(formData.value.password),
    };
    const res = await userApi.resetPassword(params);
    if (res.code === 200) {
      ElMessage.success("修改成功，请重新登录！");
      // 清除全部缓存重新登录
      localStorage.clear();
      sessionStorage.clear();
      // 重置成功后跳转到登录页
      setTimeout(() => {
        // 跳转到登录页并刷新
        router.replace("/login").then(() => {
          window.location.reload();
        });
      }, 1500);
    }
  } catch (error) {
    console.error("重置密码失败:", error);
  } finally {
    saveLoading.value = false;
  }
};

// 取消重置，返回登录页
const handleCancel = () => {
  router.replace("/login");
};

onMounted(() => {});
</script>

<style lang="scss" scoped>
.reset-pass-page {
  position: relative;
  height: 100vh;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("@/assets/imgs/loginImg/login_bg.png"); // 背景图片路径
    background-size: cover;
    background-position: center center;
    background-size: cover;
    // opacity: 0.6;
    z-index: 0;
  }
}
.reset-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  //   justify-content: center;
  padding: 20px 20px 20px 30%;
  position: relative;
}

.reset-card {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  padding: 40px;

  .header {
    text-align: center;
    margin-bottom: 40px;

    h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 24px;
      font-weight: 600;
    }

    .subtitle {
      margin-top: 8px;
      color: #666;
      font-size: 14px;
    }
  }

  .form-container {
    .el-form {
      .el-form-item {
        margin-bottom: 24px;

        :deep(.el-form-item__label) {
          font-weight: 500;
          color: #333;
        }

        .password-tips {
          font-size: 12px;
          color: #999;
        }
      }

      .el-button {
        width: 100%;
        height: 44px;
        font-size: 16px;
        margin-top: 10px;
        width: 120px;
        &.submit-btn {
          //   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background: linear-gradient(
            135deg,
            #409eff 0%,
            #66b1ff 100%
          ) !important;
          border: none;

          &:hover {
            opacity: 0.9;
          }
        }

        &.cancel-btn {
          background: #f5f7fa;
          color: #666;
          border: 1px solid #dcdfe6;

          &:hover {
            background: #ebeef5;
          }
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .reset-card {
    padding: 30px 20px;
    width: 90%;

    .header {
      margin-bottom: 30px;

      h2 {
        font-size: 20px;
      }
    }

    .form-container .el-form .el-button {
      height: 40px;
      font-size: 14px;
    }
  }
}
</style>
