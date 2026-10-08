<template>
  <div class="content-layout">
    <!-- Header -->
    <app-header :active-module-id="activeModuleId" v-show="!shouldHideLayout" />

    <div class="content-body">
      <!-- 侧边栏 -->
      <app-sidebar :menu-data="sidebarMenu" v-show="!shouldHideLayout" />

      <!-- 主内容区域 -->
      <main class="content-main">
        <tags-view v-show="!shouldHideLayout" />

        <!-- 路由视图 -->
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="cachePagesArray">
            <component :is="Component" :key="route.fullPath" v-if="route.meta?.isKeepAlive" />
          </keep-alive>
          <component :is="Component" :key="route.fullPath" v-if="!route.meta?.isKeepAlive" />
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import AppHeader from "./app-header.vue";
import AppSidebar from "./app-sidebar.vue";
import TagsView from "./tags-view.vue";
import { useMenuStore } from "@/stores/menu-store";
import { useTagsStore } from "@/stores/tags-store";
import { useUserStore } from "@/stores/user-store";
import { getSidebarMenuByModule, extractModules } from "@/utils/menu-util";
import { userApi } from "@/api/system/user-api";

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const tagsStore = useTagsStore();
const userStore = useUserStore();

const { visitedViews } = storeToRefs(tagsStore);

// 判断是否在大屏页面
const isInLargeScreen = computed(() => route.path === "/sales-analysis/large-screen");
const shouldHideLayout = computed(() => isInLargeScreen.value && userStore.isFullScreen);

// 缓存页面列表
const cachePagesArray = computed(() => {
  const routes = router.getRoutes();
  const cacheNames: string[] = [];

  visitedViews.value.forEach(tag => {
    const routeRecord = routes.find(r => r.path === tag.path);
    if (routeRecord?.meta?.isKeepAlive) {
      const componentName = routeRecord.components?.default?.name;
      if (componentName && !cacheNames.includes(componentName)) {
        cacheNames.push(componentName);
      }
    }
  });

  return cacheNames;
});

// 模块 ID 存储
const STORAGE_KEY = "active-module-id";
const getStoredModuleId = (): number => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? parseInt(stored, 10) : 0;
};
const saveModuleId = (id: number) => {
  localStorage.setItem(STORAGE_KEY, id.toString());
};

const activeModuleId = ref<number>(getStoredModuleId());

// 侧边栏菜单（仅可见菜单）
const sidebarMenu = computed(() => {
  return getSidebarMenuByModule(menuStore.menuData, activeModuleId.value);
});

/**
 * 获取模块下的所有菜单项（包括 isVisible: false 的）
 * 用于路由匹配，确保新增/编辑/详情页面能正确匹配到所属模块
 */
const getAllMenusByModule = (moduleId: number): any[] => {
  const module = menuStore.menuData.find(
    (item) => item.id === moduleId && item.menuType === 0
  );
  if (!module || !module.children) return [];

  const result: any[] = [];

  const collect = (items: any[]) => {
    for (const item of items) {
      // 只收集菜单类型（menuType === 1），跳过按钮（menuType === 2）
      if (item.menuType === 1) {
        result.push(item);
      }
      if (item.children && item.children.length > 0) {
        collect(item.children);
      }
    }
  };

  collect(module.children);
  return result;
};

/**
 * 检查路径是否匹配菜单（支持父子路径匹配）
 * 例如：/master-data/dictionary/add 匹配 /master-data/dictionary
 */
const isRouteMatchMenu = (path: string, menuPath: string): boolean => {
  // 确保菜单路径以 / 开头
  const normalizedMenuPath = menuPath.startsWith("/") ? menuPath : `/${menuPath}`;
  
  // 完全匹配
  if (path === normalizedMenuPath) return true;
  
  // 子路径匹配：/xxx/add 匹配 /xxx
  if (path.startsWith(normalizedMenuPath + "/")) return true;
  
  return false;
};

/**
 * 自动匹配激活模块
 * 使用完整菜单数据（包含不可见菜单）进行匹配
 */
const determineActiveModule = () => {
  const currentPath = route.path;
  const modules = extractModules(menuStore.menuData);

  if (modules.length === 0) return;

  // 遍历所有模块，查找当前路由属于哪个模块
  for (const module of modules) {
    // 获取该模块下的所有菜单项（包括不可见的）
    const allMenus = getAllMenusByModule(module.id);
    
    // 检查当前路径是否匹配该模块下的任意菜单
    const matched = allMenus.some(menu => 
      menu.path && isRouteMatchMenu(currentPath, menu.path)
    );
    
    if (matched) {
      // 如果当前模块 ID 变化，更新并保存
      if (activeModuleId.value !== module.id) {
        activeModuleId.value = module.id;
        saveModuleId(module.id);
      }
      return;
    }
  }

  // 如果没有匹配到任何模块，使用第一个模块
  if (activeModuleId.value !== modules[0].id) {
    activeModuleId.value = modules[0].id;
    saveModuleId(modules[0].id);
  }
};

// 获取用户信息
const getUserInfo = async () => {
  const res = await userApi.getEmpInfo();
  if (res.code === 200) {
    userStore.setUserInfo(res.data || null);
  }
};

const getRoleList = async () => {
  try {
    const res = await userApi.getMyRoleList();
    if (res.code === 200) {
      userStore.setRoleList(res.data || []);
    }
  } catch (error) {
    console.error("获取角色列表失败:", error);
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
  { immediate: true }
);

onMounted(() => {
  const token = localStorage.getItem("token");
  if (token) {
    if (menuStore.menuData.length > 0) {
      determineActiveModule();
    }
    getUserInfo();
    getRoleList();
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
    }
  }
}
</style>