<template>
  <el-form ref="pwdFormRef" :model="formData" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input
        v-model="formData.oldPassword"
        placeholder="请输入旧密码"
        type="password"
        show-password
      />
    </el-form-item>

    <el-form-item label="新密码" prop="newPassword">
      <el-input
        v-model="formData.newPassword"
        placeholder="请输入新密码"
        type="password"
        show-password
      />
    </el-form-item>

    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input
        v-model="formData.confirmPassword"
        placeholder="请确认新密码"
        type="password"
        show-password
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
      <el-button type="danger" @click="handleClose">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";

interface PwdForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const pwdFormRef = ref<FormInstance>();

const formData = reactive<PwdForm>({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 自定义验证规则：确认密码与新密码一致
const validateConfirmPassword = (
  rule: any,
  value: string,
  callback: Function
) => {
  if (value !== formData.newPassword) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

// 密码不能包含的非法字符
const validatePassword = (rule: any, value: string, callback: Function) => {
  const illegalChars = /[<>"'|\\]/;
  if (illegalChars.test(value)) {
    callback(new Error("不能包含非法字符：< > \" ' \\ |"));
  } else {
    callback();
  }
};

const rules = reactive<FormRules<PwdForm>>({
  oldPassword: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
  newPassword: [
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

  // 模拟API调用 - 使用静态数据
  setTimeout(() => {
    ElMessage.success("密码修改成功");
    // 重置表单
    pwdFormRef.value?.resetFields();
  }, 500);
};

// 关闭页面
const handleClose = () => {
  // 模拟关闭标签页
  console.log("关闭页面");
  // 在实际项目中可能需要路由跳转或关闭标签页
  window.history.back();
};
</script>

<style lang="scss" scoped>
.el-form {
  max-width: 500px;

  .el-button {
    margin-right: 10px;
  }
}
</style>
