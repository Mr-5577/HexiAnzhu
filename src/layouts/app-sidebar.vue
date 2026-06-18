<template>
  <aside class="content-sidebar">
    <el-menu
      active-text-color="#f7ffe5"
      background-color="#11496f"
      class="el-menu-vertical"
      :default-active="activeIndex"
      text-color="#78c6dc"
      :unique-opened="true"
      :collapse="false"
    >
      <sidebar-item
        v-for="item in menuData"
        :key="item.index"
        :item="item"
        @menu-click="handleMenuClick"
      />
    </el-menu>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { SidebarMenuItem } from "@/types/menu-type";
import SidebarItem from "./sidebar-menu-item.vue";
import { useTagsStore } from "@/stores/tags-store";
const tagsStore = useTagsStore();

interface Props {
  menuData: SidebarMenuItem[];
}

const props = defineProps<Props>();
const router = useRouter();
const route = useRoute();

const activeIndex = computed(() => {
  return findActiveIndex(route.path);
});

const findActiveIndex = (currentPath: string): string => {
  const findItem = (items: SidebarMenuItem[]): string | null => {
    for (const item of items) {
      if (item.path === currentPath) return item.index;
      if (item.children) {
        const found = findItem(item.children);
        if (found) return found;
      }
    }
    return null;
  };
  return findItem(props.menuData) || currentPath;
};

const handleMenuClick = (item: SidebarMenuItem) => {
  // console.log("菜单点击:", item);
  // console.log("tagsStore:", tagsStore);
  // if (item.path) router.push(item.path); // 直接跳转路由

  // 查找相同路径下，所有带参数的页签（fullPath 不等于 path 说明带了参数）
  const existingTabs = tagsStore.visitedViews.filter(
    (tab) => tab.path === item.path && tab.fullPath !== tab.path,
  );
  if (existingTabs.length > 0) {
    // 跳转到最后一个（最近使用的）带参数的页签
    const lastTab = existingTabs[existingTabs.length - 1];
    router.push(lastTab.fullPath);
  } else {
    // 没有，正常跳转
    router.push(item.path);
  }
};
</script>

<style lang="scss" scoped>
.content-sidebar {
  width: 220px;
  padding-top: 4px;
  box-sizing: border-box;
  color: white;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #032c46 0%, #041e2d 100%);
  border-right: 1px solid #0a4a75;
  @media (max-width: 1366px) {
    width: 200px;
  }
  .el-menu-vertical {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    border-right: none;
    background-color: transparent !important;

    // 修改菜单项样式
    :deep(.el-menu-item) {
      height: 40px;
      line-height: 40px;
      margin: 2px 8px;
      border-radius: 6px;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;

      span {
        color: #a0bcd0;
      }

      &:hover {
        background: linear-gradient(
          90deg,
          rgba(24, 144, 255, 0.2) 0%,
          transparent 100%
        ) !important;
        span {
          color: #ffffff;
        }
      }

      &.is-active {
        background: linear-gradient(
          90deg,
          rgba(24, 144, 255, 0.4) 0%,
          rgba(24, 144, 255, 0.05) 70%
        ) !important;
        border-left: 3px solid #1890ff; // 加粗并提高亮度
        // 增加微光效
        box-shadow: inset 1px 0 0 #1890ff;
        span {
          color: #ffffff;
          font-weight: 500;
        }
      }
    }

    // 修改子菜单样式
    :deep(.el-sub-menu) {
      .el-menu {
        background-color: transparent !important;
      }
      .el-sub-menu__title {
        height: 40px;
        line-height: 40px;
        margin: 2px 8px;
        border-radius: 6px;
        transition: all 0.3s ease;
        color: #a0bcd0;
        font-weight: 500;
        border-left: 3px solid transparent;
        &:hover {
          background: linear-gradient(
            90deg,
            rgba(24, 144, 255, 0.15) 0%,
            transparent 100%
          ) !important;
          color: #ffffff !important;
        }

        span {
          color: inherit;
        }
      }

      .el-menu-item {
        margin: 2px 8px 2px 16px;
        min-width: auto;
      }
    }

    // 滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(24, 144, 255, 0.6);
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(24, 144, 255, 0.8);
    }
  }
}
</style>
