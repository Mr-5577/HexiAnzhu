<template>
  <div class="login-container">
    <!-- SVG背景 -->
    <div class="svg-top">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        height="1337"
        width="1337"
      >
        <defs>
          <path
            id="path-1"
            opacity="1"
            fill-rule="evenodd"
            d="M1337,668.5 C1337,1037.455193874239 1037.455193874239,1337 668.5,1337 C523.6725684305388,1337 337,1236 370.50000000000006,1094 C434.03835568300906,824.6732385973953 6.906089672974592e-14,892.6277623047779 0,668.5000000000001 C0,299.5448061257611 299.5448061257609,1.1368683772161603e-13 668.4999999999999,0 C1037.455193874239,0 1337,299.544806125761 1337,668.5Z"
          />
          <linearGradient
            id="linearGradient-2"
            x1="0.79"
            y1="0.62"
            x2="0.21"
            y2="0.86"
          >
            <stop offset="0" stop-color="rgb(88,62,213)" stop-opacity="1" />
            <stop offset="1" stop-color="rgb(23,215,250)" stop-opacity="1" />
          </linearGradient>
        </defs>
        <g opacity="1">
          <use
            xlink:href="#path-1"
            fill="url(#linearGradient-2)"
            fill-opacity="1"
          />
        </g>
      </svg>
    </div>
    <div class="svg-bottom">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        height="896"
        width="967.8852157128662"
      >
        <defs>
          <path
            id="path-2"
            opacity="1"
            fill-rule="evenodd"
            d="M896,448 C1142.6325445712241,465.5747656464056 695.2579309733121,896 448,896 C200.74206902668806,896 5.684341886080802e-14,695.2579309733121 0,448.0000000000001 C0,200.74206902668806 200.74206902668791,5.684341886080802e-14 447.99999999999994,0 C695.2579309733121,0 475,418 896,448Z"
          />
          <linearGradient id="linearGradient-3" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0" stop-color="rgb(40,175,240)" stop-opacity="1" />
            <stop offset="1" stop-color="rgb(18,15,196)" stop-opacity="1" />
          </linearGradient>
        </defs>
        <g opacity="1">
          <use
            xlink:href="#path-2"
            fill="url(#linearGradient-3)"
            fill-opacity="1"
          />
        </g>
      </svg>
    </div>

    <!-- 登录表单 -->
    <div class="container">
      <div class="wrapper">
        <header>
          <div class="logo">
            <span>Logo</span>
          </div>
          <h1>Welcome back!</h1>
          <p>User Login</p>
        </header>

        <section class="main-content">
          <el-form
            :model="loginForm"
            :rules="loginRules"
            ref="loginFormRef"
            @submit.prevent="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="Username"
                size="large"
                prefix-icon="User"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="Password"
                size="large"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                class="login-button"
                :loading="loading"
                @click="handleLogin"
              >
                Login
              </el-button>
            </el-form-item>
          </el-form>
        </section>

        <footer>
          <p>
            <a
              href="#"
              title="Forgot Password"
              @click.prevent="handleForgotPassword"
              >Forgot Password?</a
            >
          </p>
          <p>
            <a href="#" title="Register" @click.prevent="handleRegister"
              >Register</a
            >
          </p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";

// 响应式数据
const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
  username: "",
  password: "",
});

// 表单验证规则
const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: "Please input username", trigger: "blur" },
  ],
  password: [
    { required: true, message: "Please input password", trigger: "blur" },
    {
      min: 6,
      message: "Password must be at least 6 characters",
      trigger: ["blur", "change"],
    },
  ],
});

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    const valid = await loginFormRef.value.validate();
    if (!valid) return;

    loading.value = true;

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 这里可以调用实际的登录API
    ElMessage.success("Login successful!");

    // 登录成功后的操作，例如路由跳转
    // router.push('/dashboard')
  } catch (error) {
    ElMessage.error("Login failed. Please check your credentials.");
  } finally {
    loading.value = false;
  }
};

// 忘记密码处理
const handleForgotPassword = () => {
  ElMessage.info("Forgot password functionality would be implemented here.");
};

// 注册处理
const handleRegister = () => {
  ElMessage.info("Registration functionality would be implemented here.");
};
</script>

<style lang="scss" scoped>
.login-container {
  margin: 0;
  height: 100vh;
  overflow: hidden;
  background-color: #dbe0f9;
  font-family: "Roboto", sans-serif;
  position: relative;

  .svg-top {
    position: absolute;
    top: -900px;
    right: -300px;
  }

  .svg-bottom {
    position: absolute;
    bottom: -500px;
    left: -200px;
  }

  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .wrapper {
    padding: 40px;
    background-color: #fff;
    border-radius: 20px;
    width: 400px;
    z-index: 1;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  header {
    margin-bottom: 40px;
  }

  .logo {
    width: 70px;
    height: 70px;
    border-radius: 50px;
    background-color: #6065d9;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo span {
    font-size: 18px;
    color: #fff;
  }

  h1 {
    color: #6065d9;
    font-size: 35px;
    font-weight: 500;
    margin-bottom: 0;
    margin-top: 40px;
  }

  p {
    color: #6065d9;
    font-size: 18px;
    font-weight: 300;
    margin: 5px 0 0 0;
  }

  .main-content {
    margin-bottom: 20px;
  }

  /* :deep(.el-input) {
  margin-bottom: 15px;
} */

  :deep(.el-form-item) {
    margin-bottom: 30px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    border: none;
  }

  :deep(.el-input__inner) {
    color: #999;
    font-size: 16px;
  }

  :deep(.el-input__inner::placeholder) {
    color: #999;
    font-size: 16px;
    font-weight: 300;
  }

  .login-button {
    background: linear-gradient(to right, #6065d9, #17d7fa);
    border: none;
    border-radius: 50px;
    font-size: 18px;
    font-weight: 300;
    color: #fff;
    display: block;
    width: 100%;
    height: 40px;
    margin: 0 auto;
    outline: none;
    cursor: pointer;
  }

  .login-button:hover {
    opacity: 0.9;
  }

  footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 30px;
  }

  footer p {
    margin: 0;
    font-weight: 100;
  }

  footer a {
    color: #6065d9;
    text-decoration: none;
    font-size: 14px;
  }

  footer a:hover {
    text-decoration: underline;
  }
}

</style>
