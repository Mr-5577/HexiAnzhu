<template>
  <div class="home-welcome">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-header">
      <div class="greeting">
        <h1 class="welcome-title">您好，{{ userStore?.userInfo?.empName }}</h1>
        <p class="welcome-subtitle">今天是 {{ currentDate }}，祝您工作愉快！</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="welcome-content">
      <!-- 快捷入口 -->
      <div class="quick-actions">
        <el-card class="action-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">🚀 快捷入口</span>
            </div>
          </template>

          <div class="action-grid">
            <!-- 展示所有顶层模块下的第一层子菜单 -->
            <div 
              v-for="(menu, index) in secondLevelMenus" 
              :key="menu.id" 
              class="action-item" 
              @click="goToMenu(menu)"
            >
              <div class="action-icon" :style="{ color: getColorByIndex(index) }">
                <el-icon>
                  <component :is="getIconComponent(menu.icon)" />
                </el-icon>
              </div>
              <span class="action-text">{{ menu.title }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import * as ElementPlusIcons from "@element-plus/icons-vue";
import { Folder } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/user-store";
import { useMenuStore } from "@/stores/menu-store";
import { getFirstRoutePath } from "@/utils/menu-util";

const userStore = useUserStore();
const menuStore = useMenuStore();
const router = useRouter();

defineOptions({ name: "home" });

// 当前日期
const currentDate = ref("");

// 颜色数组
const colorPalette = [
  "#409EFF", // 蓝色
  "#67C23A", // 绿色
  "#E6A23C", // 橙色
  "#F56C6C", // 红色
  "#8E44AD", // 紫色
  "#16A085", // 青色
  "#E74C3C", // 红色
  "#3498DB", // 蓝色
  "#2ECC71", // 绿色
  "#F39C12", // 黄色
  "#1ABC9C", // 青色
  "#9B59B6", // 紫色
];

/**
 * 获取所有顶层模块下的第一层子菜单（二级菜单）
 * 用于快捷入口展示
 */
const secondLevelMenus = computed(() => {
  const result: any[] = [];

  // 获取所有顶层模块（menuType === 0）
  const modules = menuStore.menuData.filter(
    (item) => item.menuType === 0
  );

  // 遍历每个顶层模块，收集其第一层子菜单
  modules.forEach((module) => {
    if (module.children && module.children.length > 0) {
      // 只取 menuType === 1 且可见的菜单
      const visibleChildren = module.children.filter(
        (child) => child.menuType === 1 && child.isVisible !== false
      );
      result.push(...visibleChildren);
    }
  });

  return result;
});

/**
 * 根据索引获取颜色
 */
const getColorByIndex = (index: number) => {
  return colorPalette[index % colorPalette.length];
};

/**
 * 获取图标组件
 */
const getIconComponent = (iconName: string | undefined) => {
  if (!iconName || iconName.trim() === "") {
    return Folder;
  }

  let componentName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  
  const iconComponent = ElementPlusIcons[componentName as keyof typeof ElementPlusIcons];
  if (iconComponent) {
    return iconComponent;
  }

  return Folder;
};

/**
 * 跳转到菜单项
 * 如果菜单有子菜单，跳转到第一个可见的子页面
 * 否则直接跳转到当前菜单
 */
const goToMenu = (menu: any) => {
  console.log("[首页] 点击菜单:", menu.title, "ID:", menu.id);

  // 检查菜单是否有可见的子菜单
  if (menu.children && menu.children.length > 0) {
    // 查找第一个可见的子菜单
    const firstVisibleChild = menu.children.find(
      (child: any) => child.menuType === 1 && child.isVisible !== false && child.path
    );
    
    if (firstVisibleChild) {
      const path = firstVisibleChild.path.startsWith("/") 
        ? firstVisibleChild.path 
        : `/${firstVisibleChild.path}`;
      console.log(`[首页] 跳转到子菜单: ${path}`);
      router.push(path);
      return;
    }
  }

  // 如果当前菜单有 path，直接跳转
  if (menu.path) {
    const path = menu.path.startsWith("/") ? menu.path : `/${menu.path}`;
    console.log(`[首页] 跳转到: ${path}`);
    router.push(path);
    return;
  }

  console.warn(`[首页] 菜单 "${menu.title}" 无法跳转`);
};

/**
 * 更新日期时间
 */
const updateDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const weekDay = weekDays[now.getDay()];
  currentDate.value = `${year}年${month}月${day}日 ${weekDay}`;
};

onMounted(() => {
  updateDateTime();
});
</script>

<style lang="scss" scoped>
.home-welcome {
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f8fafc 0%, #e6edfa 100%);
  min-height: calc(100vh - 64px);
  overflow-y: auto;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 24px 32px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    padding: 20px;
  }
}

.greeting {
  flex: 1;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
}

.welcome-subtitle {
  font-size: 15px;
  color: #909399;
  margin: 0;
}

.welcome-content {
  width: 100%;
  margin: 0 auto;
}

.quick-actions {
  width: 100%;
}

.action-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  :deep(.el-card__header) {
    border-bottom: 1px solid #f0f0f0;
    padding: 18px 24px;

    @media (max-width: 768px) {
      padding: 14px 16px;
    }
  }

  :deep(.el-card__body) {
    padding: 24px;

    @media (max-width: 768px) {
      padding: 16px;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;

    @media (max-width: 768px) {
      font-size: 16px;
    }
  }
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
  background: #fafafa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  border: 1px solid transparent;

  &:hover {
    background: #edf7fd;
    transform: translateY(-6px);
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
    // border-color: #409EFF;
  }

  &:active {
    transform: translateY(0px);
  }

  @media (max-width: 768px) {
    padding: 18px 8px;
    min-height: 100px;
  }

  @media (max-width: 480px) {
    padding: 14px 6px;
    min-height: 80px;
  }
}

.action-icon {
  font-size: 36px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;

  .action-item:hover & {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    font-size: 30px;
    margin-bottom: 8px;
  }

  @media (max-width: 480px) {
    font-size: 26px;
    margin-bottom: 6px;
  }
}

.action-text {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  text-align: center;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
}
</style>