<template>
  <div class="test-container">
    <h2>Test Page</h2>
    <div class="button-group">
      <el-button type="primary" @click="handlePrimaryClick">
        Test
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userApi } from "@/api/user-api";

// 按钮点击事件处理
const handlePrimaryClick = async () => {
  const res = await userApi.test();
  console.log("测试接口", res);
};
</script>

<style scoped>
.test-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  color: #409eff;
  margin-bottom: 30px;
  text-align: center;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  margin-bottom: 30px;
}

.button-group .el-button {
  min-width: 120px;
}
</style>
