<template>
  <div class="login-container">
    <!-- 左侧图片 -->
    <div class="left-content">
      <img src="@/assets/imgs/loginImg/lou.png" alt="" />
    </div>
    <!-- 登录表单 -->
    <div class="form-wrapper">
      <h2>欢迎登录</h2>
      <el-form :model="signInForm" :rules="signInRules" ref="signInFormRef">
        <el-form-item prop="userName">
          <el-input
            v-model="signInForm.userName"
            placeholder="账号"
            prefix-icon="User"
            class="custom-input"
            @focus="handleFocus('signInUserName')"
            @blur="handleBlur('signInUserName')"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="signInForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            class="custom-input"
            @focus="handleFocus('signInPassword')"
            @blur="handleBlur('signInPassword')"
            show-password
          />
        </el-form-item>
        <div class="forgot-password">忘记密码</div>

        <el-button
          class="process-btn"
          type="primary"
          :loading="loading"
          @click="handleSignIn"
        >
          登 录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useRouter } from "vue-router";
import { md5 } from "@/utils/crypto";
import { userApi } from "@/api/user-api";

const router = useRouter();

// 登录表单数据
const signInFormRef = ref<FormInstance>();
const loading = ref(false);
const signInForm = reactive({
  userName: "00001",
  password: "666666",
});

// 输入框激活状态
const activeInputs = ref<Set<string>>(new Set());

// 密码正则验证函数
const validatePassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error("请输入密码"));
    return;
  }

  const password = value.trim();

  // 长度检查
  // if (password.length < 8) {
  //   callback(new Error("密码长度至少8位"));
  //   return;
  // }

  // 字符类型检查 - 只允许英文字母、数字、!@$.+-*
  const passwordRegex = /^[A-Za-z0-9!@$.+\-*]+$/;
  if (!passwordRegex.test(password)) {
    callback(new Error("密码包含字母、数字和 !@$.+-*"));
    return;
  }

  // 必须包含字母
  // if (!/[a-zA-Z]/.test(password)) {
  //   callback(new Error("密码必须包含字母"));
  //   return;
  // }

  // 必须包含数字
  // if (!/\d/.test(password)) {
  //   callback(new Error("密码必须包含数字"));
  //   return;
  // }

  // 检查是否全是相同字符
  // if (/^(.)\1+$/.test(password)) {
  //   callback(new Error("密码不能全是相同字符"));
  //   return;
  // }

  // 检查简单密码
  // const weakPasswords = [
  //   "12345678",
  //   "password",
  //   "admin123",
  //   "qwertyui",
  //   "abcdefgh",
  //   "11111111",
  //   "00000000",
  // ];
  // if (weakPasswords.includes(password.toLowerCase())) {
  //   callback(new Error("密码过于简单，请使用更复杂的密码"));
  //   return;
  // }

  callback();
};
const signInRules: FormRules = {
  userName: [
    { required: true, message: "请输入账号", trigger: ["change", "blur"] },
    // { min: 3, message: "账号长度至少3位", trigger: ["change",'blur'] },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: ["change", "blur"] },
    { validator: validatePassword, trigger: ["change", "blur"] },
  ],
};

// 处理输入框聚焦
const handleFocus = (inputName: string) => {
  activeInputs.value.add(inputName);
};

// 处理输入框失焦
const handleBlur = (inputName: string) => {
  activeInputs.value.delete(inputName);
};

// 处理登录
const handleSignIn = async () => {
  if (loading.value) return;
  if (!signInFormRef.value) return;
  // 验证表单
  const valid = await signInFormRef.value.validate();
  if (!valid) {
    ElMessage.error("请检查表单！");
    return;
  }
  try {
    loading.value = true;
    // 对密码进行MD5加密
    const encryptedPassword = md5(signInForm.password);
    // 转化登录参数类型为formData
    const formData = new FormData();
    formData.append("username", signInForm.userName);
    formData.append("password", encryptedPassword);
    const response = await userApi.login(formData);
    // const response = {code: 200,data: 'ksjdfhjksdfksh'};
    const { code, data } = response;
    if (code === 200 && data) {
      ElMessage.success("登录成功！");
      localStorage.setItem("token", data);
      router.replace("/home");
    }
  } catch (error) {
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  background-color: #223243;
  height: 100vh;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  .left-content {
    width: 55%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .form-wrapper {
    width: 330px;
    padding: 30px 10px;
    box-shadow: -5px -5px 15px #ffffff1a, 5px 5px 15px #00000059,
      inset -5px -5px 15px #ffffff1a, inset 5px 5px 15px #00000059;
    border-radius: 20px;
    border: 8px solid #223243;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgba(34, 50, 67, 0.4);
    .password-tips {
      font-size: 12px;
      color: #a0a3a9;
    }
  }

  .form-wrapper h2 {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;
    text-align: center;
    color: white;
    margin-bottom: 20px;
  }

  :deep(.custom-input) {
    width: 250px;
  }
  :deep(.el-form-item) {
    margin-bottom: 30px;
  }

  :deep(.custom-input .el-input__wrapper) {
    background: none;
    box-shadow: -5px -5px 15px #ffffff1a, 5px 5px 15px #00000038;
    border-radius: 20px;
    padding: 5px 15px;
    transition: all 0.2s ease-in-out;
  }

  :deep(.custom-input .el-input__wrapper.is-focus) {
    box-shadow: inset -5px -5px 15px #ffffff1a, inset 5px 5px 15px #00000038;
  }

  :deep(.custom-input .el-input__inner) {
    background: none;
    border: none;
    color: white;
    // font-family: cursive;
    font-size: 14px;
  }

  :deep(.custom-input .el-input__inner::placeholder) {
    color: rgba(255, 255, 255, 0.6);
  }

  :deep(.custom-input .el-input__prefix) {
    color: #6fe6e6;
    border-right: 2px solid #77dede;
    margin-right: 10px;
    height: 20px;
    .el-icon {
      font-size: 18px;
    }
  }

  .process-btn {
    margin-top: 20px;
    width: 250px;
    height: 35px;
    border-radius: 20px;
    border: none;
    background-color: #4fbbbb !important;
    color: #0a2a43 !important;
    font-size: 16px;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    box-shadow: -4px -4px 10px #ffffff1a, 4px 4px 10px #0000002d;
  }

  .forgot-password {
    width: 60px;
    font-size: 14px;
    color: white;
    cursor: pointer;
    position: relative;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;
    &::after {
      content: ""; // 重要：缺少content属性
      width: 0%;
      height: 2px;
      display: block;
      background-color: white;
      position: absolute;
      bottom: -2px;
      left: 0px;
      transition: width 0.3s ease-in-out;
    }

    &:hover::after {
      width: 100%;
    }
  }
}
.login-container .process-btn.el-button.el-button--primary {
  margin-top: 20px !important;
  width: 250px !important;
  height: 35px !important;
  min-height: 35px !important;
  border-radius: 20px !important;
  border: none !important;
  background: #4fbbbb !important;
  color: #0a2a43 !important;
  font-size: 16px !important;
  font-family: Verdana, Geneva, Tahoma, sans-serif !important;
  box-shadow: -4px -4px 10px #ffffff1a, 4px 4px 10px #0000002d !important;
  line-height: 1 !important;
}
/* 悬停时添加边框效果 */
.login-container .process-btn.el-button.el-button--primary:hover {
  background: #4fbbbb !important;
  border-color: rgba(10, 42, 67, 0.3) !important; /* 添加深色边框 */
  transform: translateY(-2px) !important;
  box-shadow: -4px -4px 12px #ffffff2a, 4px 4px 12px #0000003d !important;
}

/* 禁用状态样式 */
.login-container .process-btn.el-button.el-button--primary.is-disabled,
.login-container .process-btn.el-button.el-button--primary.is-disabled:hover {
  background: #a8d8d8 !important;
  color: #6d8a9e !important;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
  border-color: transparent !important;
}
</style>
