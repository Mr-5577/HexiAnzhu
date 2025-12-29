<template>
  <div class="login-container">
    <!-- 登录表单 -->
    <div class="form-wrapper">
      <div class="form-content">
        <h2 class="form-title">欢迎登录</h2>
        <div class="tab-container">
          <div class="tabs">
            <div
              class="tab-item"
              :class="{ active: activeTab === 'account' }"
              @click="handleTabSwitch('account')"
            >
              账号登录
            </div>
            <div
              class="tab-item"
              :class="{ active: activeTab === 'qr' }"
              @click="handleTabSwitch('qr')"
            >
              扫码登录
            </div>
          </div>

          <!-- 账号登录 -->
          <div v-if="activeTab === 'account'" class="account-login">
            <el-form
              :model="signInForm"
              :rules="signInRules"
              ref="signInFormRef"
              class="login-form"
            >
              <el-form-item prop="userName">
                <el-input
                  v-model="signInForm.userName"
                  placeholder="请输入账号"
                  prefix-icon="User"
                  class="custom-input"
                  size="large"
                />
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="signInForm.password"
                  type="password"
                  placeholder="请输入密码"
                  prefix-icon="Lock"
                  class="custom-input"
                  size="large"
                  show-password
                />
              </el-form-item>

              <div class="password-tips">密码包含字母、数字和 !@$.+-*</div>

              <el-button
                id="login-btn"
                type="primary"
                :loading="loading"
                @click="handleSignIn"
              >
                登录
              </el-button>
            </el-form>
          </div>

          <!-- 扫码登录 -->
          <div v-else class="qr-login">
            <div class="qr-container">
              <div class="qr-code">
                <div
                  class="qr-placeholder"
                  v-loading="qrLoading"
                  :element-loading-text="'二维码加载中...'"
                  :element-loading-background="'rgba(255, 255, 255, 0.9)'"
                >
                  <!-- <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://estate.example.com/login/token123"
                    alt="登录二维码"
                    class="qr-image"
                  /> -->
                  <img
                    v-if="qrCodeUrl"
                    :src="qrCodeUrl"
                    alt="二维码"
                    class="qr-image"
                  />
                  <div v-else class="placeholder-content">
                    {{ qrMessage }}
                  </div>
                </div>
              </div>
              <div class="qr-instructions">
                <h3>扫码登录</h3>
                <p>1. 打开企业微信扫一扫</p>
                <p>2. 扫描上方二维码进行登录</p>
              </div>
              <div class="refresh-qr">
                <el-button text @click="refreshQRCode">
                  <el-icon><Refresh /></el-icon>
                  刷新二维码
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- <div class="footer-links">
          <span class="register-link">
            还没有账号？
            <a href="#">立即注册</a>
          </span>
          <span class="forgot-link"><a href="#">忘记密码？</a></span>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useRouter } from "vue-router";
import { md5 } from "@/utils/crypto";
import { userApi } from "@/api/user-api";
import { Refresh } from "@element-plus/icons-vue";
import { v4 as uuidv4 } from "uuid";
import { useUserStore } from "@/stores/user-store";
import QRCode from "qrcode";

const router = useRouter();
const userStore = useUserStore();

// Tab切换
const activeTab = ref<"account" | "qr">("account");
// 登录表单数据
const signInFormRef = ref<FormInstance>();
const loading = ref(false);
const signInForm = reactive({
  userName: "00001",
  password: "666666",
});

// 扫码登录相关状态
const qrLoading = ref(false);
const qrCodeUrl = ref<string>("");
const qrMessage = ref<string>("二维码加载中...");
const pollingCount = ref(0); // 轮询次数计数器
const MAX_POLLING_COUNT = 24; // 2分钟轮询，每5秒一次，共24次
const POLLING_INTERVAL = 5000; // 5秒轮询一次

// 密码正则验证函数
const validatePassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error("请输入密码"));
    return;
  }

  const password = value.trim();
  const passwordRegex = /^[A-Za-z0-9!@$.+\-*]+$/;
  if (!passwordRegex.test(password)) {
    callback(new Error("密码包含字母、数字和 !@$.+-*"));
    return;
  }

  callback();
};

const signInRules: FormRules = {
  userName: [
    { required: true, message: "请输入账号", trigger: ["change", "blur"] },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: ["change", "blur"] },
    { validator: validatePassword, trigger: ["change", "blur"] },
  ],
};

// 处理登录
const handleSignIn = async () => {
  if (loading.value) return;
  if (!signInFormRef.value) return;

  const valid = await signInFormRef.value.validate();
  if (!valid) {
    ElMessage.error("请检查表单！");
    return;
  }

  try {
    loading.value = true;
    const encryptedPassword = md5(signInForm.password);
    const formData = new FormData();
    formData.append("username", signInForm.userName);
    formData.append("password", encryptedPassword);
    const response = await userApi.login(formData);
    const { code, data } = response;
    if (code === 200 && data) {
      ElMessage.success("登录成功！");
      localStorage.setItem("token", data);
      router.replace("/home");
    }
  } catch (error) {
    console.error("登录失败:", error);
    ElMessage.error("登录失败，请重试");
  } finally {
    loading.value = false;
  }
};

// 生成并获取二维码
const generateAndGetQRCode = async () => {
  try {
    qrLoading.value = true;
    qrMessage.value = "二维码加载中...";
    pollingCount.value = 0; // 重置轮询计数器

    // 生成新的stateTag
    const validState = uuidv4();
    userStore.setStateTag(validState);
    console.log("扫码生成新的stateTag:", validState);

    // 获取二维码路径地址
    const qrRes = await userApi.createQrCode({ state: validState });
    console.log("qrRes", qrRes);
    if (qrRes.code === 200 && qrRes.data) {
      // 生成二维码图片
      const url = await QRCode.toDataURL(qrRes.data, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      qrCodeUrl.value = url;

      // 开始轮询
      startPolling();
    } else {
      qrMessage.value = "二维码生成失败，请刷新";
      ElMessage.error("二维码生成失败，请重试");
    }
  } catch (error) {
    qrMessage.value = "二维码生成失败，请刷新";
    console.error("生成二维码失败:", error);
    ElMessage.error("二维码生成失败，请重试");
  } finally {
    qrLoading.value = false;
  }
};

// 检查扫码登录状态
const checkQRLoginStatus = async () => {
  if (!userStore.stateTag) {
    console.error("stateTag不存在，停止轮询");
    clearPolling();
    return;
  }

  try {
    const statusRes = await userApi.getTokenForAutoLogin({
      state: userStore.stateTag,
    });
    console.log("扫码状态检查结果:", statusRes);

    if (statusRes.code === 200 && statusRes.data) {
      // 扫码成功，获取到token
      handleQRLoginSuccess(statusRes.data);
    }
    // else if (statusRes.code === 400) {
    //   // 二维码已过期或被使用
    //   handleQRCodeExpired();
    // }
    // 其他状态码，继续轮询
  } catch (error) {
    console.error("检查扫码状态失败:", error);
    // 网络错误时不停止轮询，继续尝试
  }

  // 增加轮询次数并检查是否超时
  pollingCount.value++;
  if (pollingCount.value >= MAX_POLLING_COUNT) {
    handleQRLoginTimeout();
  }
};

// 处理扫码登录成功
const handleQRLoginSuccess = (token: string) => {
  // 清除定时器
  clearPolling();
  ElMessage.success("扫码登录成功！");
  localStorage.setItem("token", token);

  // 清理缓存的stateTag
  userStore.setStateTag("");

  // 跳转到首页
  router.replace("/home");
};

// 处理二维码过期
const handleQRCodeExpired = () => {
  clearPolling();
  qrCodeUrl.value = ""; // 清空二维码
  ElMessage.warning("二维码已过期，请刷新后重新扫码");

  // 清理缓存的stateTag
  userStore.setStateTag("");
};

// 处理扫码登录超时
const handleQRLoginTimeout = () => {
  clearPolling();
  qrCodeUrl.value = ""; // 清空二维码
  ElMessage.warning("扫码登录超时，请刷新后重新扫码");

  // 清理缓存的stateTag
  userStore.setStateTag("");
};

// 扫码登录轮询相关
let qrPolling: any = null;

// 开始轮询
const startPolling = () => {
  clearPolling(); // 先清理之前的轮询
  pollingCount.value = 0; // 重置计数器

  // 立即检查一次状态
  checkQRLoginStatus();

  // 开始定时轮询
  qrPolling = setInterval(() => {
    checkQRLoginStatus();
  }, POLLING_INTERVAL);
};

// 清理轮询
const clearPolling = () => {
  if (qrPolling) {
    clearInterval(qrPolling);
    qrPolling = null;
  }
  pollingCount.value = 0;
};

// 切换登录方式
const handleTabSwitch = async (type: "account" | "qr") => {
  activeTab.value = type;

  if (type === "qr") {
    // 切换到扫码登录
    await generateAndGetQRCode();
  } else {
    // 切换到账号登录，清理扫码登录相关状态
    clearPolling();
    qrCodeUrl.value = "";
  }
};

// 刷新二维码
const refreshQRCode = async () => {
  // 先清理旧的状态
  clearPolling();
  userStore.setStateTag("");

  // 生成新的二维码
  await generateAndGetQRCode();
  ElMessage.success("二维码已刷新，请重新扫码");
};

// 监听tab切换，清理状态
watch(activeTab, (newTab) => {
  if (newTab !== "qr") {
    // 如果不是扫码登录tab，清理扫码相关状态
    clearPolling();
    qrCodeUrl.value = "";
    userStore.setStateTag("");
  }
});

// 组件卸载时清理
onUnmounted(() => {
  clearPolling();
  userStore.setStateTag("");
});

// 组件挂载时清理可能存在的旧状态
onMounted(() => {
  userStore.setStateTag("");
});
</script>

<style lang="scss" scoped>
.login-container {
  background: linear-gradient(135deg, #e6f2ff 0%, #f0f8ff 100%);
  height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding-left: 21%;
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

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(
      to top,
      rgba(255, 255, 255, 0.8) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    z-index: 0;
  }
}

.form-wrapper {
  position: relative;
  z-index: 1;
  width: 420px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(32, 56, 85, 0.15);
  overflow: hidden;
  animation: slideUp 0.6s ease-out;

  .form-content {
    padding: 40px 50px;
  }

  .form-title {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 30px;
    font-size: 24px;
    font-weight: 600;
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  }
}

.tab-container {
  margin-bottom: 20px;

  .tabs {
    display: flex;
    margin-bottom: 30px;
    border-bottom: 1px solid #e8eaed;

    .tab-item {
      flex: 1;
      text-align: center;
      padding: 12px 0;
      font-size: 16px;
      color: #666;
      cursor: pointer;
      position: relative;
      transition: all 0.3s ease;
      font-family: "PingFang SC", "Microsoft YaHei", sans-serif;

      &:hover {
        color: #409eff;
      }

      &.active {
        color: #409eff;
        font-weight: 500;

        &::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
          border-radius: 2px 2px 0 0;
        }
      }
    }
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 24px;
  }

  .custom-input {
    :deep(.el-input__wrapper) {
      border-radius: 12px;
      border: 1px solid #dcdfe6;
      background: #fafbfc;
      transition: all 0.3s ease;
      padding: 0 15px;

      &.is-focus {
        border-color: #409eff;
        box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
        background: white;
      }
    }

    :deep(.el-input__inner) {
      height: 46px;
      color: #333;
      font-size: 14px;

      &::placeholder {
        color: #999;
      }
    }

    :deep(.el-input__prefix) {
      color: #409eff;
      margin-right: 10px;

      .el-icon {
        font-size: 18px;
      }
    }
  }

  .password-tips {
    font-size: 13px;
    color: #999;
    margin: -10px 0 20px 0;
  }

  #login-btn {
    width: 100%;
    height: 46px;
    border-radius: 12px;
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%) !important;
    border: none;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 2px;
    transition: all 0.3s ease;
    margin-top: 10px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(64, 158, 255, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.qr-login {
  .qr-container {
    text-align: center;

    .qr-code {
      background: #f8f9fa;
      border-radius: 12px;
      // padding: 20px;
      position: relative;

      .qr-placeholder {
        display: inline-block;
        position: relative;
        width: 200px;
        height: 200px;

        // 二维码过期提示样式
        &.expired {
          &::before {
            content: "二维码已过期";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 1;
          }

          .qr-image {
            opacity: 0.3;
          }
        }
        .placeholder-content {
          background: transparent;
          box-shadow: none;
          width: 200px;
          height: 200px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #495057;
          font-size: 15px;
        }
      }

      .qr-image {
        width: 200px;
        height: 200px;
        border-radius: 8px;
        display: block;
        margin: 0 auto;
      }

      // 轮询状态提示
      .polling-status {
        margin-top: 10px;
        font-size: 12px;
        color: #666;

        &.expiring {
          color: #e6a23c;
        }

        &.expired {
          color: #f56c6c;
        }
      }
    }

    .qr-instructions {
      text-align: left;
      background: #f0f7ff;
      padding: 15px;
      border-radius: 12px;
      margin: 20px 0;
      border: 1px solid #d9ecff;

      h3 {
        color: #409eff;
        margin-bottom: 10px;
        font-size: 16px;
        font-weight: 600;
      }

      p {
        margin: 8px 0;
        color: #666;
        font-size: 14px;
        line-height: 1.5;

        &:before {
          content: "•";
          color: #409eff;
          margin-right: 8px;
        }
      }
    }

    .refresh-qr {
      .el-button {
        color: #409eff;
        font-size: 14px;

        .el-icon {
          margin-right: 5px;
        }

        &:hover {
          color: #66b1ff;
        }

        &:disabled {
          color: #c0c4cc;
          cursor: not-allowed;
        }
      }
    }
  }
}

/* 添加二维码加载动画 */
@keyframes qr-loading {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

.qr-loading {
  animation: qr-loading 1.5s ease-in-out infinite;
}

.footer-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 14px;

  .register-link {
    color: #666;

    a {
      color: #409eff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .forgot-link {
    a {
      color: #999;
      text-decoration: none;

      &:hover {
        color: #409eff;
        text-decoration: underline;
      }
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .form-wrapper {
    width: 90%;
    margin: 0 20px;

    .form-content {
      padding: 30px 25px;
    }
  }
}
</style>
