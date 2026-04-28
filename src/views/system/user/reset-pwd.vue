<template>
  <el-form ref="pwdFormRef" :model="formData" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input
        v-model="formData.oldPassword"
        placeholder="请输入旧密码"
        type="password"
        show-password
        @keyup.enter="handleSubmit"
      />
    </el-form-item>

    <el-form-item label="新密码" prop="password">
      <el-input
        v-model="formData.password"
        placeholder="请输入新密码"
        type="password"
        show-password
        @keyup.enter="handleSubmit"
      />
    </el-form-item>

    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input
        v-model="formData.confirmPassword"
        placeholder="请确认新密码"
        type="password"
        show-password
        @keyup.enter="handleSubmit"
      />
    </el-form-item>

    <el-form-item>
      <el-button
        class="save-btn"
        type="primary"
        size="default"
        :loading="saveLoading"
        @click="handleSubmit"
      >
        保 存
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user-store";
import { md5 } from "@/utils/crypto";
import { userApi } from "@/api/user-api";
const userStore = useUserStore();

const userInfo = computed(() => userStore.userInfo);

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

// 自定义验证规则：确认密码与新密码一致
const validateConfirmPassword = (
  rule: any,
  value: string,
  callback: Function
) => {
  if (value !== formData.value.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

// 密码不能包含的非法字符
const validatePassword = (rule: any, value: string, callback: Function) => {
  const illegalChars = /^[A-Za-z0-9!@$.+\-*]+$/;
  if (!illegalChars.test(value)) {
    callback(new Error("密码只能包含英文字母、数字和 !@$.+-*"));
  } else if (value === formData.value.oldPassword) {
    callback(new Error("新密码不能和旧密码一样！"));
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
      username: userInfo.value.empNo,
      oldPassword: md5(formData.value.oldPassword),
      password: md5(formData.value.password),
    };
    const res = await userApi.resetPassword(params);
    if (res.code === 200) {
      ElMessage.success("密码修改成功");
      // 重置表单
      pwdFormRef.value?.resetFields();
    }
  } catch (error) {
  } finally {
    saveLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.el-form {
  max-width: 500px;

  .el-button {
    margin-right: 10px;
  }
  .save-btn {
    margin-top: 22px;
  }
}
</style>
