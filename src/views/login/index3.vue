<template>
  <div class="login-container">
    <!-- 登录表单 -->
    <div class="loginPage">
      <div class="loginTitle">
        <h3>数据中心可视化平台</h3>
      </div>

      <div class="loginMain">
        <div class="loginMainInner">
          <div class="loginMainInnerTitle">您好，欢迎登录系统</div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="form"
            @submit.prevent="handleLogin"
          >
            <!-- 用户名输入 -->
            <div class="formItem">
              <div class="formItem1">
                <span>账号：</span>
              </div>
              <el-form-item prop="username" class="form-item-wrapper">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                  class="custom-input"
                  prefix-icon="User"
                />
              </el-form-item>
            </div>

            <!-- 密码输入 -->
            <div class="formItem">
              <div class="formItem1">
                <span>密码：</span>
              </div>
              <el-form-item prop="password" class="form-item-wrapper">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  show-password
                  class="custom-input"
                  prefix-icon="Lock"
                  @keyup.enter="handleLogin"
                />
              </el-form-item>
            </div>

            <!-- 记住密码和忘记密码 -->
            <div class="rememberPasswordBody">
              <div class="rememberPwd">
                <el-checkbox v-model="loginForm.rememberPassword">
                  记住密码
                </el-checkbox>
              </div>
              <div class="forget">
                <span @click="handleForgetPassword">忘记密码？</span>
              </div>
            </div>

            <!-- 登录按钮 -->
            <el-form-item class="login-button-wrapper">
              <div class="loginBut" @click="handleLogin">
                <span>登录</span>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();
// 表单引用
const loginFormRef = ref<FormInstance>();

// 登录表单数据
const loginForm = reactive({
  username: "",
  password: "",
  rememberPassword: false,
});

// 表单验证规则
const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    {
      min: 2,
      max: 20,
      message: "用户名长度在 2 到 20 个字符",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度至少 6 个字符", trigger: "blur" },
  ],
});

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  try {
    // 验证表单
    const valid = await loginFormRef.value.validate();
    if (!valid) return;

    // 这里可以添加实际的登录逻辑
    ElMessage.success("登录成功！");
    router.replace("/home");
  } catch (error) {
    ElMessage.error("请检查表单输入");
  }
};

// 忘记密码处理
const handleForgetPassword = () => {
  ElMessage.info("忘记密码功能待实现");
};
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: "Microsoft YaHei", sans-serif;
  background: url("@/assets/imgs/loginImg/bg-login.png") no-repeat center;
  background-size: cover;
}

/* 登录页面布局 */
.loginPage {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.loginTitle {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom: 30px;
}

.loginTitle h3 {
  font-size: 50px;
  font-weight: 700;
  color: #fff;
  line-height: 67px;
  margin: 0;
  text-shadow: 0 0 8px #1f7c93, 0 0 17px #1f7c93, 0 0 25px #1f7c93;
}

/* 登录表单样式 */
.loginMain {
  width: 518px;
  height: 426px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url("@/assets/imgs/loginImg/bgAnimate.png") no-repeat center;
  background-size: 100%;
}

.loginMainInner {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.loginMainInnerTitle {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin-top: 17px;
}

/* 表单样式 */
.form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 17px;
  width: 100%;
}

.formItem {
  width: 250px;
  display: flex;
  flex-direction: column;
  margin-top: 17px;
}

.formItem1 {
  width: 100%;
  display: flex;
  align-items: center;
  height: 37px;
}

.formItem1 span {
  font-size: 15px;
  color: #ccd9e5;
}

/* 表单项包装器 */
.form-item-wrapper {
  width: 100%;
  margin-bottom: 0;
}

/* 自定义输入框样式 */
:deep(.custom-input .el-input__wrapper) {
  background: rgba(26, 29, 50, 0.5) !important;
  border: 1px solid #4a4f64 !important;
  border-radius: 3px !important;
  box-shadow: none !important;
  height: 37px;
}

:deep(.custom-input .el-input__inner) {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 15px;
  height: 35px;
}

:deep(.custom-input .el-input__inner::placeholder) {
  color: #cfd9e5;
  font-size: 14px;
}

:deep(.custom-input .el-input__prefix) {
  color: #cfd9e5 !important;
}

/* 错误状态样式 */
:deep(.custom-input.is-error .el-input__wrapper) {
  border-color: #f56c6c !important;
}

:deep(.el-form-item__error) {
  color: #f56c6c;
  font-size: 12px;
  padding-top: 4px;
}

/* 记住密码区域 */
.rememberPasswordBody {
  width: 242px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

:deep(.rememberPwd .el-checkbox__label) {
  color: #ccd9e5;
  font-size: 13px;
}

:deep(
    .rememberPwd
      .el-checkbox.is-checked
      .el-checkbox__input.is-checked
      .el-checkbox__inner
  ) {
  background-color: #43cedf;
  border-color: #43cedf;
}

:deep(.rememberPwd .el-checkbox.is-checked .el-checkbox__label) {
  color: #43cfdf;
}

:deep(.rememberPwd .el-checkbox__inner) {
  border: 1px solid #4a4f64;
  background: rgba(26, 29, 50, 0);
}

.forget {
  font-size: 13px;
  color: #1acfeb;
  cursor: pointer;
}

.forget:hover {
  text-decoration: underline;
}

/* 登录按钮 */
.login-button-wrapper {
  margin-top: 20px;
  margin-bottom: 0;
}

.loginBut {
  background: transparent;
  border: 1px solid #6da5bc;
  width: 250px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 30px rgba(109, 165, 188, 0.5),
    0 6px 16px rgba(109, 165, 188, 0.3);
}

.loginBut:hover {
  transform: translateY(-1px);
}

.loginBut:active {
  box-shadow: inset 0 4px 12px rgba(109, 165, 188, 0.6),
    0 2px 8px rgba(109, 165, 188, 0.2);
  transform: translateY(0);
}

.loginBut span {
  font-size: 16px;
  color: #9ac9d9;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 0 8px rgba(109, 165, 188, 0.4);
  letter-spacing: 1px;
}
</style>
