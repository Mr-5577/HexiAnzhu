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
        @contextmenu.prevent="showContextMenu($event, tag)"
      >
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

      <!-- 右键菜单 -->
      <div v-show="menuVisible" class="context-menu" :style="menuStyle">
        <div @click="closeCurrent">关闭当前</div>
        <div @click="closeOthers">关闭其他</div>
        <div @click="closeAll">关闭全部</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, inject } from "vue";
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

// 右键菜单相关
const menuVisible = ref(false);
const menuStyle = ref({ left: "0px", top: "0px" });
const currentTag = ref<TagView | null>(null);

// 显示右键菜单
const showContextMenu = (e: MouseEvent, tag: TagView) => {
  currentTag.value = tag;
  menuStyle.value = {
    left: e.pageX + "px",
    top: e.pageY + "px",
  };
  menuVisible.value = true;
};

// 关闭当前标签
const closeCurrent = () => {
  if (currentTag.value && !currentTag.value.affix) {
    closeSelectedTag(currentTag.value);
  }
  menuVisible.value = false;
};

// 关闭其他标签
const closeOthers = () => {
  if (currentTag.value) {
    tagsStore.delOtherViews(currentTag.value);
    // 跳转到当前标签
    router.push({
      path: currentTag.value.path,
      query: extractQueryParams(currentTag.value),
    });
  }
  menuVisible.value = false;
};
// 关闭全部标签
const closeAll = () => {
  tagsStore.delAllViews();
  // 如果有固定标签，跳转到最后一个固定标签
  const affixTags = visitedViews.value.filter((tag) => tag.affix);
  if (affixTags.length > 0) {
    const lastAffixTag = affixTags[affixTags.length - 1];
    router.push({
      path: lastAffixTag.path,
      query: extractQueryParams(lastAffixTag),
    });
  } else {
    router.push("/");
  }
  menuVisible.value = false;
};

// 点击其他地方关闭菜单
const closeMenu = () => {
  menuVisible.value = false;
};

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

// 添加事件监听
onMounted(() => {
  document.addEventListener("click", closeMenu);
});

onUnmounted(() => {
  document.removeEventListener("click", closeMenu);
});
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
    position: relative;

    /* 美化滚动条样式 - Webkit浏览器 (Chrome, Safari, Edge) */
    &::-webkit-scrollbar {
      height: 4px;
      background-color: transparent;
    }
    &::-webkit-scrollbar-track {
      background-color: transparent;
      border-radius: 2px;
      margin: 0 12px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.15);
      border-radius: 2px;
      transition: background-color 0.3s ease;
    }
    &::-webkit-scrollbar-thumb:hover {
      background-color: rgba(0, 0, 0, 0.2) !important;
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
        line-height: 1;
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

// 右键菜单样式
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 120px;

  div {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    color: #606266;
    transition: background-color 0.3s;

    &:hover {
      color: #054168;
      background-color: #f5f7fa;
    }

    &:not(:last-child) {
      border-bottom: 1px solid #ebeef5;
    }
  }
}

.dark-background {
  border: none;
  background: linear-gradient(135deg, #032c46 0%, #05456e 100%);

  .tags-view-wrapper::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .tags-view-wrapper::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  .tags-view-wrapper {
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
