<template>
  <el-form
    ref="userFormRef"
    :model="formData"
    :rules="rules"
    label-width="80px"
  >
    <el-form-item label="用户昵称" prop="nickName">
      <el-input
        v-model="formData.nickName"
        placeholder="请输入用户昵称"
        maxlength="30"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="手机号码" prop="phonenumber">
      <el-input
        v-model="formData.phonenumber"
        placeholder="请输入手机号码"
        maxlength="11"
      />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="formData.email"
        placeholder="请输入邮箱"
        maxlength="50"
      />
    </el-form-item>

    <el-form-item label="性别">
      <el-radio-group v-model="formData.sex">
        <el-radio :value="'0'">男</el-radio>
        <el-radio :value="'1'">女</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
      <el-button type="danger" @click="handleClose">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";

interface User {
  nickName: string;
  phonenumber: string;
  email: string;
  sex: string;
}

interface Props {
  user: User;
}

const props = defineProps<Props>();

const userFormRef = ref<FormInstance>();

const formData = reactive<User>({
  nickName: "",
  phonenumber: "",
  email: "",
  sex: "0",
});

// 表单验证规则
const rules = reactive<FormRules<User>>({
  nickName: [
    { required: true, message: "用户昵称不能为空", trigger: "blur" },
    { min: 2, max: 30, message: "长度在 2 到 30 个字符", trigger: "blur" },
  ],
  email: [
    { required: true, message: "邮箱地址不能为空", trigger: "blur" },
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: ["blur", "change"],
    },
  ],
  phonenumber: [
    { required: true, message: "手机号码不能为空", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
});

// 监听props变化，更新表单数据
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      Object.assign(formData, {
        nickName: newUser.nickName || "",
        phonenumber: newUser.phonenumber || "",
        email: newUser.email || "",
        sex: newUser.sex || "0",
      });
    }
  },
  { immediate: true }
);

// 提交表单
const handleSubmit = async () => {
  if (!userFormRef.value) return;

  const valid = await userFormRef.value.validate();
  if (!valid) return;

  // 模拟API调用 - 使用静态数据
  setTimeout(() => {
    ElMessage.success("个人信息修改成功");

    // 在实际项目中，这里应该更新父组件的用户数据
    // updateUserProfile(formData).then(() => {
    //   ElMessage.success('个人信息修改成功')
    //   // 触发父组件更新
    //   emit('update:user', { ...props.user, ...formData })
    // })
  }, 500);
};

// 关闭页面
const handleClose = () => {
  console.log("关闭页面");
  window.history.back();
};
</script>

<style lang="scss" scoped>
.el-form {
  max-width: 500px;

  .el-button {
    margin-right: 10px;
  }

  .el-input {
    width: 100%;
  }
}
</style>
