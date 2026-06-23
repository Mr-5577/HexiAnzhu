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
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="activeCachePages">
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
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppHeader from "./app-header.vue";
import AppSidebar from "./app-sidebar.vue";
import TagsView from "./tags-view.vue";
import { useMenuStore } from "@/stores/menu-store";
import { getSidebarMenuByModule, extractModules } from "@/utils/menu-util";
import { useUserStore } from "@/stores/user-store";
import { userApi } from "@/api/user-api";
import { useTagsStore } from "@/stores/tags-store";

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const tagsStore = useTagsStore();

// 判断是否隐藏布局
const currentRoutePath = computed(() => route.path);
// 判断是否在大屏页面
const isInLargeScreen = computed(
  () => currentRoutePath.value === "/sales-analysis/large-screen",
);
// 判断是否隐藏布局
const shouldHideLayout = computed(
  () => isInLargeScreen.value && userStore.isFullScreen,
);

// 动态计算需要缓存的组件 --------- 基于当前打开的标签
const activeCachePages = computed(() => {
  const routes = router.getRoutes();
  const names: string[] = [];

  tagsStore.visitedViews.forEach((view) => {
    const routeRecord = routes.find((r) => r.path === view.path);
    if (routeRecord?.meta?.isKeepAlive && routeRecord.name) {
      names.push(routeRecord.name as string);
    }
  });

  return names;
});

// 模块相关
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

// 判断路由是否在菜单中
const isRouteInMenu = (path: string, menus: any[]): boolean => {
  for (const menu of menus) {
    if (menu.path === path) return true;
    if (menu.children && isRouteInMenu(path, menu.children)) return true;
  }
  return false;
};

// 确定激活的模块
const determineActiveModule = () => {
  const currentPath = route.path;
  const modules = extractModules(menuStore.menuData);

  for (const module of modules) {
    const moduleMenus = getSidebarMenuByModule(menuStore.menuData, module.id);
    if (isRouteInMenu(currentPath, moduleMenus)) {
      activeModuleId.value = module.id;
      return;
    }
  }
  // 如果没有找到匹配的模块，使用第一个模块
  if (modules.length > 0) {
    activeModuleId.value = modules[0].id;
  }
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

// 监听路由变化，添加到标签
watch(
  () => route.fullPath,
  () => {
    if (route.path && route.path !== "/") {
      tagsStore.addView(route);
    }
  },
  { immediate: true },
);

// 监听菜单数据变化
watch(
  () => menuStore.menuData,
  () => {
    if (menuStore.menuData.length > 0) {
      determineActiveModule();
    }
  },
  { immediate: true },
);

onMounted(() => {
  const token = localStorage.getItem("token");
  if (token) {
    getUserInfo();
    if (menuStore.menuData.length > 0) {
      determineActiveModule();
    }
  }
});
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
      min-height: 0;

      & > :first-child:not(router-view) {
        flex-shrink: 0;
      }

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
