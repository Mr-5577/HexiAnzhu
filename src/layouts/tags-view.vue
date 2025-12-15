<template>
  <div
    class="tags-view-container"
    :class="
      route.path == '/sales-analysis/large-screen' ? 'dark-background' : ''
    "
  >
    <div class="tags-view-wrapper">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.uniqueId || tag.path"
        :to="{ path: tag.path, query: extractQueryParams(tag) }"
        :class="['tags-view-item', { active: isActive(tag) }]"
      >
        <!-- <span class="tag-title">{{ tag.title }}</span> -->
        <el-tooltip
          :content="tag.title"
          placement="bottom-end"
          effect="light"
          :disabled="tag.title.length <= 6"
        >
          <span class="tag-title">{{ tag.title }}</span>
        </el-tooltip>
        <el-icon
          v-if="!tag.affix"
          class="close-icon"
          @click.prevent.stop="closeSelectedTag(tag)"
        >
          <Close />
        </el-icon>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTagsStore } from "@/stores/tags-store";
import type { TagView } from "@/stores/tags-store";

// 添加inject注入，用于缓存清理
const clearPageCache =
  inject<(componentName: string) => void>("clearPageCache");

const route = useRoute();
const router = useRouter();
const tagsStore = useTagsStore();

const visitedViews = computed(() => tagsStore.visitedViews);

// 使用store中的方法检查标签是否激活
const isActive = (tag: TagView) => {
  return tagsStore.isTagActive(tag, route);
};

// 从完整路径中提取查询参数
const extractQueryParams = (tag: TagView) => {
  if (!tag.fullPath.includes("?")) return {};

  const queryStr = tag.fullPath.split("?")[1];
  const params = new URLSearchParams(queryStr);
  const query: Record<string, string> = {};

  params.forEach((value, key) => {
    query[key] = value;
  });

  return query;
};

// 关闭选中的标签，关闭标签时需要清除页面的缓存，等从路由重新进入时再次缓存
const closeSelectedTag = (tag: TagView) => {
  // 获取当前标签对应的组件名称（从路由配置中）
  const routeRecord = router.getRoutes().find((r) => r.path === tag.path);
  const componentName = routeRecord?.components?.default?.name as string;

  // 删除标签
  tagsStore.delView(tag);

  // 如果有关联的组件名称，清理缓存
  if (componentName && clearPageCache) {
    clearPageCache(componentName);
  }

  if (isActive(tag)) {
    const lastView = visitedViews.value[visitedViews.value.length - 1];
    if (lastView) {
      router.push({
        path: lastView.path,
        query: extractQueryParams(lastView),
      });
    } else {
      router.push("/");
    }
  }
};

// 监听路由变化，添加标签
// 使用 immediate: true 确保初始路由也被添加
watch(
  () => ({
    path: route.path,
    fullPath: route.fullPath,
    meta: route.meta,
  }),
  () => {
    if (route.path && route.path !== "/") {
      tagsStore.addView(route);
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 40px;
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;

  .tags-view-wrapper {
    height: 40px;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    flex-shrink: 0;
    overflow-x: auto;
    padding: 0 12px;
    box-sizing: border-box;

    /* 美化滚动条样式 - Webkit浏览器 (Chrome, Safari, Edge) */
    &::-webkit-scrollbar {
      height: 4px; /* 滚动条高度 */
      background-color: transparent; /* 滚动条背景透明 */
    }
    &::-webkit-scrollbar-track {
      background-color: transparent; /* 轨道背景透明 */
      border-radius: 2px;
      margin: 0 12px; /* 让滚动条与内容有间距 */
    }
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.15); /* 滑块颜色 */
      border-radius: 2px;
      transition: background-color 0.3s ease; /* 平滑过渡效果 */
    }
    &::-webkit-scrollbar-thumb:hover {
      background-color: rgba(0, 0, 0, 0.2) !important; /* 鼠标悬停时的颜色 */
    }

    .tags-view-item {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      height: 28px;
      color: #666666;
      background: transparent;
      padding: 0 8px;
      box-sizing: border-box;
      font-size: 13px;
      margin-right: 6px;
      border-radius: 4px;
      text-decoration: none;
      transition: all 0.2s ease;
      border: none;

      &:hover {
        background: #f5f5f5;
        color: #333333;
      }

      &.active {
        background: linear-gradient(135deg, #0a649c 0%, #063958 100%);
        color: #ffffff;

        .close-icon {
          color: rgba(255, 255, 255, 0.8);

          &:hover {
            background-color: rgba(255, 255, 255, 0.2);
            color: #ffffff;
          }
        }
      }

      .tag-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100px;
      }

      .close-icon {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        transition: all 0.2s ease;
        margin-left: 6px;
        color: #999999;
        font-size: 12px;

        &:hover {
          background-color: #e0e0e0;
          color: #666666;
        }
      }
    }
  }
}
.dark-background {
  border: none;
  background: linear-gradient(135deg, #032c46 0%, #05456e 100%);
  /* 深色背景下的滚动条样式 */
  .tags-view-wrapper::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2); /* 深色背景用浅色滑块 */
  }
  .tags-view-wrapper::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  .tags-view-wrapper {
    /* Firefox深色背景滚动条 */
    scrollbar-color: #095e92 transparent;
  }

  .tags-view-item {
    color: #fff !important;
    &:hover {
      background: linear-gradient(135deg, #0a649c 0%, #063958 100%) !important;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .tags-view-container {
    height: 36px;

    .tags-view-wrapper {
      :deep(.el-scrollbar__view) {
        padding: 0 8px;
      }

      .tags-view-item {
        height: 26px;
        padding: 0 10px;
        font-size: 12px;
        margin-right: 2px;

        .tag-title {
          max-width: 80px;
        }
      }
    }
  }
}
</style>
