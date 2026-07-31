<template>
  <div class="content-layout">
    <!-- Header -->
    <app-header
      :active-module-id="activeModuleId"
      @module-change="handleModuleChange"
      v-show="!shouldHideLayout"
    />
    <div class="content-body">
      <!-- 左侧侧边栏 -->
      <app-sidebar :menu-data="sidebarMenu" v-show="!shouldHideLayout" />
      <!-- 右侧内容区域 -->
      <main class="content-main">
        <!-- 页签 -->
        <tags-view v-show="!shouldHideLayout"></tags-view>
        <!-- 主内容 -->
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
import { storeToRefs } from "pinia";
import AppHeader from "./app-header.vue";
import AppSidebar from "./app-sidebar.vue";
import TagsView from "./tags-view.vue";
import { useMenuStore } from "@/stores/menu-store";
import { useTagsStore } from "@/stores/tags-store";
import { getSidebarMenuByModule, extractModules } from "@/utils/menu-util";
import { useUserStore } from "@/stores/user-store";
import { userApi } from "@/api/system/user-api.ts";

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const tagsStore = useTagsStore();

// 获取标签页列表
const { visitedViews } = storeToRefs(tagsStore);

const currentRoutePath = computed(() => route.path);
// 判断是否在大屏页面
const isInLargeScreen = computed(() => {
  return currentRoutePath.value === "/sales-analysis/large-screen";
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

// 基于当前打开的标签页动态计算需要缓存的组件列表
const cachePagesArray = computed(() => {
  const routes = router.getRoutes();
  const cacheNames: string[] = [];

  // 遍历当前打开的标签页
  visitedViews.value.forEach((tag) => {
    const routeRecord = routes.find((r) => r.path === tag.path);
    if (routeRecord?.meta?.isKeepAlive) {
      const componentName = routeRecord.components?.default?.name;
      if (componentName && !cacheNames.includes(componentName)) {
        cacheNames.push(componentName);
      }
    }
  });

  return cacheNames;
});

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

const getUserInfo = async () => {
  const res = await userApi.getEmpInfo();
  if (res.code === 200) {
    userStore.setUserInfo(res.data || null);
  }
};

// 监听路由变化
watch(
  () => [route.fullPath, menuStore.menuData],
  () => {
    if (menuStore.menuData.length > 0) {
      determineActiveModule();
    }
  },
  { immediate: true },
);

// 初始化
onMounted(() => {
  const token = localStorage.getItem("token");
  if (token && menuStore.menuData.length > 0) {
    determineActiveModule();
  }
  if (token) {
    getUserInfo();
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
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%);
      overflow: hidden;
      min-height: 0; /* 防止内部内容溢出 */

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
