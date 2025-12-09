<template>
  <div class="login-container">
    <!-- 左侧图片 -->
    <div class="left-content">
      <img src="@/assets/imgs/loginImg/lou.png" alt="" />
    </div>
    <!-- 注册表单 -->
    <div class="form-wrapper" v-if="isSignUp">
      <h2>Sign Up</h2>
      <el-form :model="signUpForm" :rules="signUpRules" ref="signUpFormRef">
        <el-form-item prop="username">
          <el-input
            v-model="signUpForm.username"
            placeholder="username"
            prefix-icon="User"
            class="custom-input"
            @focus="handleFocus('username')"
            @blur="handleBlur('username')"
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="signUpForm.email"
            placeholder="email address"
            prefix-icon="Message"
            class="custom-input"
            @focus="handleFocus('email')"
            @blur="handleBlur('email')"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="signUpForm.password"
            type="password"
            placeholder="create password"
            prefix-icon="Lock"
            class="custom-input"
            @focus="handleFocus('password')"
            @blur="handleBlur('password')"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="signUpForm.confirmPassword"
            type="password"
            placeholder="confirm password"
            prefix-icon="Lock"
            class="custom-input"
            @focus="handleFocus('confirmPassword')"
            @blur="handleBlur('confirmPassword')"
            show-password
          />
        </el-form-item>

        <el-button class="process-btn" type="primary" @click="handleSignUp">
          Create Account
        </el-button>
      </el-form>

      <p>Already a member? <span @click="toggleForm">Log In</span></p>
    </div>

    <!-- 登录表单 -->
    <div class="form-wrapper" v-else>
      <h2>Sign In</h2>
      <el-form :model="signInForm" :rules="signInRules" ref="signInFormRef">
        <el-form-item prop="email">
          <el-input
            v-model="signInForm.email"
            placeholder="email address"
            prefix-icon="Message"
            class="custom-input"
            @focus="handleFocus('signInEmail')"
            @blur="handleBlur('signInEmail')"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="signInForm.password"
            type="password"
            placeholder="password"
            prefix-icon="Lock"
            class="custom-input"
            @focus="handleFocus('signInPassword')"
            @blur="handleBlur('signInPassword')"
            show-password
          />
        </el-form-item>

        <el-button class="process-btn" type="primary" @click="handleSignIn">
          Login
        </el-button>
      </el-form>

      <p>Not Registered? <span @click="toggleForm">Create an account</span></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();

// 表单切换状态
const isSignUp = ref(false);

// 注册表单数据
const signUpFormRef = ref<FormInstance>();
const signUpForm = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

// 登录表单数据
const signInFormRef = ref<FormInstance>();
const signInForm = reactive({
  email: "",
  password: "",
});

// 输入框激活状态
const activeInputs = ref<Set<string>>(new Set());

// 表单验证规则
const signUpRules: FormRules = {
  username: [
    { required: true, message: "Please input username", trigger: "blur" },
    { min: 3, max: 20, message: "Length should be 3 to 20", trigger: "blur" },
  ],
  email: [
    { required: true, message: "Please input email address", trigger: "blur" },
    {
      type: "email",
      message: "Please input correct email address",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "Please input password", trigger: "blur" },
    {
      min: 6,
      message: "Password must be at least 6 characters",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    { required: true, message: "Please confirm password", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== signUpForm.password) {
          callback(new Error("Two passwords do not match"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

const signInRules: FormRules = {
  email: [
    { required: true, message: "Please input email address", trigger: "blur" },
    {
      type: "email",
      message: "Please input correct email address",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "Please input password", trigger: "blur" },
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

// 切换表单
const toggleForm = () => {
  isSignUp.value = !isSignUp.value;
};

// 处理注册
const handleSignUp = async () => {
  if (!signUpFormRef.value) return;

  try {
    await signUpFormRef.value.validate();
    // 这里可以添加注册API调用
    ElMessage.success("Registration successful!");
  } catch (error) {
    ElMessage.error("Please check your input");
  }
};

// 处理登录
const handleSignIn = async () => {
  router.push("/home");
  if (!signInFormRef.value) return;

  try {
    // 验证表单
    const valid = await signInFormRef.value.validate();
    if (!valid) return;

    // 这里可以添加登录API调用
    ElMessage.success("Login successful!");
    router.replace("/home");
  } catch (error) {
    ElMessage.error("Please check your credentials");
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
    background-color: #4cd3d3;
    color: #223243;
    font-size: 15px;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    box-shadow: -4px -4px 10px #ffffff1a, 4px 4px 10px #0000002d;
    font-weight: bold;
  }

  .form-wrapper p {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;
    margin-top: 15px;
    color: #ffffff72;
    font-size: 14px;
  }

  .form-wrapper p span {
    color: white;
    cursor: pointer;
    position: relative;
  }

  .form-wrapper p span::after {
    content: "";
    width: 0%;
    height: 2px;
    display: block;
    background-color: white;
    position: absolute;
    bottom: -2px;
    left: 0px;
    transition: width 0.3s ease-in-out;
  }

  .form-wrapper p span:hover::after {
    width: 100%;
  }
}
</style>
