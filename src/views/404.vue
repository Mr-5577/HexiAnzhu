<template>
  <div class="not-found">
    <el-result
      icon="warning"
      title="404"
      sub-title="抱歉，您访问的页面可能不存在，或者没有权限，请联系数字发展部！"
    >
      <template #extra>
        <el-button type="primary" @click="goBack">返回上一页</el-button>
        <el-button @click="goHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    // 如果没有历史记录，跳转到首页
    router.push("/home");
  }
};

// 返回首页
const goHome = () => {
  router.push("/home");
};
</script>

<style lang="scss" scoped>
.not-found {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
