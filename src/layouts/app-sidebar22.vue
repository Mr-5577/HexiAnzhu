<template>
  <aside class="content-sidebar">
    <el-menu
      active-text-color="#ffd04b"
      background-color="#11496f"
      class="el-menu-vertical"
      :default-active="activeIndex"
      text-color="#fff"
      :unique-opened="true"
    >
      <template v-for="item in menuData" :key="item.index">
        <menu-item-render :item="item" @menu-click="handleMenuClick" />
      </template>
    </el-menu>
  </aside>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { computed, h, resolveComponent } from "vue";
import type { SidebarMenuItem } from "@/types/menu-type";

// 定义props
interface Props {
  menuData: SidebarMenuItem[];
}

const props = defineProps<Props>();
const router = useRouter();
const route = useRoute();

// 渲染函数组件
const MenuItemRender = ({ item }: { item: SidebarMenuItem }, { emit }: any) => {
  // 检查是否隐藏
  if (!item.isVisible) {
    // 如果 isVisible 为 true，表示隐藏，不渲染
    return null;
  }

  const ElMenuItem = resolveComponent("el-menu-item");
  const ElSubMenu = resolveComponent("el-sub-menu");

  if (!item.children || item.children.length === 0) {
    return h(
      ElMenuItem,
      {
        index: item.index,
        onClick: () => emit("menu-click", item),
      },
      {
        default: () => h("span", item.title),
      }
    );
  } else {
    return h(
      ElSubMenu,
      {
        index: item.index,
      },
      {
        title: () => h("span", item.title),
        default: () =>
          item.children!.map((child: SidebarMenuItem) =>
            h(MenuItemRender, {
              item: child,
              onMenuClick: (childItem: any) => emit("menu-click", childItem),
            })
          ),
      }
    );
  }
};

// 根据当前路由查找对应的菜单index
const findActiveIndex = (currentPath: string): string => {
  const findItem = (items: SidebarMenuItem[]): string | null => {
    for (const item of items) {
      if (item.path === currentPath) {
        return item.index;
      }
      if (item.children) {
        const found = findItem(item.children);
        // console.log("found", found, item);
        if (found) return found;
      }
    }
    return null;
  };

  return findItem(props.menuData) || currentPath;
};

const activeIndex = computed(() => {
  // console.log('当前路由',route.path)
  return findActiveIndex(route.path);
});

const handleMenuClick = (item: SidebarMenuItem) => {
  if (item.path) {
    router.push(item.path);
  }
};
</script>

<style lang="scss" scoped>
.content-sidebar {
  width: 240px;
  color: white;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #032c46 0%, #041e2d 100%);
  border-right: 1px solid #0a4a75;

  .el-menu-vertical {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    border-right: none;
    background-color: transparent !important;

    // 修改菜单项样式
    :deep(.el-menu-item) {
      height: 45px;
      line-height: 45px;
      margin: 2px 8px;
      border-radius: 4px;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;

      span {
        color: #b8d4e6;
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
          rgba(24, 144, 255, 0.3) 0%,
          transparent 100%
        ) !important;
        border-left: 3px solid #1890ff;
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
        height: 45px;
        line-height: 45px;
        margin: 2px 8px;
        border-radius: 4px;
        transition: all 0.3s ease;
        color: #a0bcd0 !important;
        font-weight: 500;
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
