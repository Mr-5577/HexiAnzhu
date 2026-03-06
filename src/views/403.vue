<template>
  <div class="no-permission">
    <el-result
      icon="warning"
      title="403"
      sub-title="您暂时没有访问权限，请联系管理员分配权限"
    >
      <template #extra>
        <el-button type="primary" @click="goToLogin">重新登录</el-button>
        <el-button @click="tryGoHome">尝试返回首页</el-button>
        <el-button @click="contactAdmin">联系管理员</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
const router = useRouter();

const goToLogin = () => {
  localStorage.clear();
  sessionStorage.clear();
  setTimeout(() => {
    // 跳转到登录页并刷新
    router.push("/login").then(() => {
      window.location.reload();
    });
  }, 100);
};
const tryGoHome = () => {
  // 尝试返回首页，如果没权限会再次到404
  router.push("/home");
};

const contactAdmin = () => {
  // ElMessage.info("请联系数字发展部管理员");
  ElMessageBox.confirm("请联系数字发展部管理员！", "提示", {
    confirmButtonText: "OK",
    showCancelButton: false,
    showConfirmButton: false,
    cancelButtonText: "Cancel",
    type: "warning",
  })
    .then(() => {})
    .catch(() => {});
};
</script>

<style lang="scss" scoped>
.no-permission {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
