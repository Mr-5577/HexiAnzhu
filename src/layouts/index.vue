<template>
  <div class="content-layout">
    <app-header
      :active-module-id="activeModuleId"
      @module-change="handleModuleChange"
      v-show="!shouldHideLayout"
    ></app-header>
    <div class="content-body">
      <app-sidebar
        :menu-data="sidebarMenu"
        v-show="!shouldHideLayout"
      ></app-sidebar>
      <main class="content-main">
        <tags-view v-show="!shouldHideLayout"></tags-view>
        <!-- <router-view /> -->
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="cachePagesArray">
            <component
              :is="Component"
              :key="route.fullPath"
              v-if="route.meta?.isKeepAlive"
            />
          </keep-alive>
          <component
            :is="Component"
            :key="route.fullPath"
            v-if="!route.meta?.isKeepAlive"
          />
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, provide } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppHeader from "./app-header.vue";
import AppSidebar from "./app-sidebar.vue";
import TagsView from "./tags-view.vue";
import { useMenuStore } from "@/stores/menu-store";
import { getSidebarMenuByModule, extractModules } from "@/utils/menu-util";
import { useUserStore } from "@/stores/user-store";

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();

const isFullScreen = computed(() => userStore.isFullScreen);
const currentRoutePath = computed(() => route.path);
// 判断是否在大屏页面
const isInLargeScreen = computed(() => {
  return currentRoutePath.value === '/sales-analysis/large-screen';
});
// 判断是否需要隐藏布局组件
const shouldHideLayout = computed(() => {
  // 如果不在大屏页面，就显示布局组件
  if (!isInLargeScreen.value) {
    return false;
  }
  // 如果在大屏页面，就用 isFullScreen 控制
  return userStore.isFullScreen;
});

// 缓存的页面组件名列表
const cachePages = ref<Set<string>>(new Set());
// 转换为数组供 KeepAlive 使用
const cachePagesArray = computed(() => {
  return Array.from(cachePages.value);
});
// 更新缓存页面列表
const updateCachePages = () => {
  const routes = router.getRoutes();
  cachePages.value.clear();
  routes.forEach((route) => {
    if (route.meta?.isKeepAlive && route.name) {
      cachePages.value.add(route.name as string);
    }
  });

  // console.log("📦 缓存页面列表:", Array.from(cachePages.value));
};

// 缓存KEY
const ACTIVE_MODULE_STORAGE_KEY = "active-module-id";
// 从 localStorage 读取保存的模块ID
const getStoredActiveModuleId = (): number => {
  const stored = localStorage.getItem(ACTIVE_MODULE_STORAGE_KEY);
  return stored ? parseInt(stored, 10) : 0;
};

// 保存到 localStorage
const saveActiveModuleId = (moduleId: number) => {
  localStorage.setItem(ACTIVE_MODULE_STORAGE_KEY, moduleId.toString());
};

// 当前激活的模块ID
const activeModuleId = ref<number>(getStoredActiveModuleId());

// 根据激活模块ID计算侧边栏菜单
const sidebarMenu = computed(() => {
  // if (!activeModuleId.value) return [];
  return getSidebarMenuByModule(menuStore.menuData, activeModuleId.value);
});

// 根据当前路由确定激活的模块
const determineActiveModule = () => {
  const currentPath = route.path;
  const modules = extractModules(menuStore.menuData);

  for (const module of modules) {
    const moduleMenus = getSidebarMenuByModule(menuStore.menuData, module.id);
    // console.log("333333", currentPath, moduleMenus);
    if (isRouteInMenu(currentPath, moduleMenus)) {
      // console.log("找到匹配的模块:", module.title);
      activeModuleId.value = module.id;
      return;
    }
  }

  // 如果没有找到匹配的模块，使用第一个模块
  if (modules.length > 0) {
    // console.log("未找到匹配模块，使用默认模块:", modules[0].title);
    activeModuleId.value = modules[0].id;
  }
};

// 检查路由是否在菜单中
const isRouteInMenu = (path: string, menus: any[]): boolean => {
  for (const menu of menus) {
    if (menu.path === path) {
      // console.log("找到匹配菜单:", menu.title, menu.path);
      return true;
    }
    if (menu.children && isRouteInMenu(path, menu.children)) {
      return true;
    }
  }
  return false;
};

// 处理模块切换
const handleModuleChange = (module: any) => {
  activeModuleId.value = module.id;
  saveActiveModuleId(module.id);
};

// 添加缓存清理方法
const clearPageCache = (componentName: string) => {
  if (cachePages.value.has(componentName)) {
    cachePages.value.delete(componentName);
    // console.log(`🗑️ 已从缓存中移除: ${componentName}`);
  }
};

// 通过 provide 提供给子组件使用
provide("clearPageCache", clearPageCache);

// 监听菜单数据变化
// 监听路由变化 - 修改为监听 fullPath，包含查询参数
watch(
  () => [route.fullPath, menuStore.menuData],
  () => {
    if (menuStore.menuData.length > 0) {
      determineActiveModule();
    }
  },
  { immediate: true }
  //  { deep: true }
);

// 监听路由配置变化，更新缓存
watch(
  () => router.getRoutes(),
  () => {
    updateCachePages();
  }
);

// 初始化
onMounted(() => {
  const token = localStorage.getItem("token");
  if (token && menuStore.menuData.length > 0) {
    determineActiveModule();
    updateCachePages();
  }
});
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.content-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .content-body {
    width: 100%;
    flex: 1;
    display: flex;
    overflow: hidden;
    background-color: #032b44;
    min-height: 0;
    .content-main {
      flex: 1;
      display: flex; /* 新增：启用 flex 布局 */
      flex-direction: column; /* 新增：垂直方向排列 */
      background: linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%);
      overflow: hidden;
      min-height: 0; /* 关键：防止内部内容溢出 */

      /* 如果 tags-view 高度固定 */
      & > :first-child:not(router-view) {
        flex-shrink: 0; /* 防止 tags-view 被压缩 */
      }

      /* 路由视图容器自适应 */
      router-view,
      :deep(> .keep-alive-container),
      :deep(> *:not(:first-child)) {
        flex: 1;
        overflow: auto;
        min-height: 0;
      }
    }
  }
}
</style>
