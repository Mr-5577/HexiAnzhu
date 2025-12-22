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
              @click="activeTab = 'account'"
            >
              账号登录
            </div>
            <div
              class="tab-item"
              :class="{ active: activeTab === 'qr' }"
              @click="activeTab = 'qr'"
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
                <div class="qr-placeholder">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://estate.example.com/login/token123"
                    alt="登录二维码"
                    class="qr-image"
                  />
                  <!-- <div class="qr-expire">有效期: 5分钟</div> -->
                </div>
              </div>
              <div class="qr-instructions">
                <h3>扫码登录</h3>
                <p>1. 打开企业微信扫一扫</p>
                <p>2. 扫描上方二维码</p>
                <p>3. 确认登录信息</p>
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
          <span class="register-link"
            >还没有账号？<a href="#">立即注册</a></span
          >
          <span class="forgot-link"><a href="#">忘记密码？</a></span>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useRouter } from "vue-router";
import { md5 } from "@/utils/crypto";
import { userApi } from "@/api/user-api";
import { Refresh } from "@element-plus/icons-vue";

const router = useRouter();

// Tab切换
const activeTab = ref<"account" | "qr">("account");

// 登录表单数据
const signInFormRef = ref<FormInstance>();
const loading = ref(false);
const signInForm = reactive({
  userName: "00001",
  password: "666666",
});

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

// 刷新二维码
const refreshQRCode = () => {
  ElMessage.info("二维码已刷新");
  // 这里可以调用API获取新的二维码
};

// 检查扫码登录状态
const checkQRLoginStatus = async () => {
  // 这里可以调用API检查扫码状态
  // 如果扫码成功，执行登录逻辑
  // const status = await userApi.checkQRStatus();
  // if (status.loggedIn) {
  //   localStorage.setItem("token", status.token);
  //   router.replace("/home");
  // }
};

// 清理轮询
const clearPolling = () => {
  if (qrPolling) {
    clearInterval(qrPolling);
    qrPolling = null;
  }
};

// 模拟扫码登录轮询
let qrPolling: any = null;
onMounted(() => {
  // 如果是扫码登录，开始轮询
  // qrPolling = setInterval(() => {
  //   if (activeTab.value === "qr") {
  //     checkQRLoginStatus();
  //   }
  // }, 3000);
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
    background-image: url("@/assets/imgs/loginImg/login_bg.png"); // 请替换为您的背景图片路径
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

      .qr-placeholder {
        display: inline-block;
        position: relative;

        .qr-image {
          width: 200px;
          height: 200px;
          border-radius: 8px;
        }

        .qr-expire {
          margin-top: 10px;
          font-size: 12px;
          color: #666;
        }
      }
    }

    .qr-instructions {
      text-align: left;
      background: #f0f7ff;
      padding: 15px;
      border-radius: 12px;
      margin-bottom: 20px;

      h3 {
        color: #409eff;
        margin-bottom: 10px;
        font-size: 16px;
      }

      p {
        margin: 5px 0;
        color: #666;
        font-size: 14px;
        line-height: 1.5;
      }
    }

    .refresh-qr {
      .el-button {
        color: #409eff;
        .el-icon {
          margin-right: 5px;
        }
        &:hover {
          color: #66b1ff;
        }
      }
    }
  }
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
