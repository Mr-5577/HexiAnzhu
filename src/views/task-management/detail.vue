<template>
  <div class="page-content">年度任务下达-详情页面</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// 从查询参数中获取任务信息
const queryParams = computed(() => route.query);
const taskId = computed(() => queryParams.value.id as string);


// 生命周期
onMounted(() => {
  nextTick(() => {
    console.log('taskId',taskId)
  });
});

// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.page-content {
  width: 100%;
  height: 100%;
}
</style>
