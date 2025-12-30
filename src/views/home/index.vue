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
      <el-card class="welcome-card" v-show="false">
        <template #header>
          <div class="card-header">
            <span class="card-title">📊 工作概览</span>
          </div>
        </template>

        <div class="quick-stats">
          <div class="stat-item">
            <div class="stat-icon" style="background: #e8f4ff">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">今日</div>
              <div class="stat-label">工作状态</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon" style="background: #f0f9eb">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">5</div>
              <div class="stat-label">待办事项</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon" style="background: #fef0f0">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">3</div>
              <div class="stat-label">新消息</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon" style="background: #fdf6ec">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">12</div>
              <div class="stat-label">系统访问</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 快捷入口 -->
      <div class="quick-actions">
        <el-card class="action-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">🚀 快捷入口</span>
            </div>
          </template>

          <div class="action-grid">
            <!-- 动态渲染所有第二层菜单 -->
            <div
              v-for="(menu, index) in secondLevelMenus"
              :key="menu.id"
              class="action-item"
              @click="goToMenu(menu)"
            >
              <div
                class="action-icon"
                :style="{ color: getColorByIndex(index) }"
              >
                <!-- 动态图标 -->
                <el-icon>
                  <component :is="getIconComponent(menu.meta?.icon)" />
                </el-icon>
              </div>
              <span class="action-text">{{
                menu.meta?.title || menu.name
              }}</span>
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
import {
  Calendar,
  Check,
  Bell,
  TrendCharts,
  Folder, // 默认图标
} from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/user-store";
import { useMenuStore } from "@/stores/menu-store";

const userStore = useUserStore();
const menuStore = useMenuStore();

const router = useRouter();

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "home" });

// 当前日期和时间
const currentDate = ref("");

// 颜色数组
const colorPalette = [
  "#409EFF", // 蓝色
  "#67C23A", // 绿色
  "#E6A23C", // 橙色
  "#F56C6C", // 红色
  "#909399", // 灰色
  "#8E44AD", // 紫色
  "#16A085", // 青色
  "#E74C3C", // 红色
  "#3498DB", // 蓝色
  "#2ECC71", // 绿色
  "#F39C12", // 黄色
  "#1ABC9C", // 青色
];

// 计算属性：获取所有第二层菜单
const secondLevelMenus = computed(() => {
  const secondLevel: any[] = [];

  // 过滤掉dashboard菜单
  const filteredMenus = menuStore.menuData.filter(
    (menu) => menu.name !== "dashboard"
  );

  // 遍历每个顶级菜单，收集其children
  filteredMenus.forEach((topMenu) => {
    if (topMenu.children && topMenu.children.length > 0) {
      topMenu.children.forEach((child) => {
        // 只添加type为'menu'的（排除按钮等）
        if (child.type === "menu") {
          secondLevel.push(child);
        }
      });
    }
  });

  return secondLevel;
});

// 根据索引获取颜色
const getColorByIndex = (index: number) => {
  return colorPalette[index % colorPalette.length];
};

// 获取图标组件
const getIconComponent = (iconName: string | undefined) => {
  // 如果iconName是空的，使用默认图标
  if (!iconName || iconName.trim() === "") {
    return Folder; // 返回默认图标组件
  }

  // 将iconName转换为驼峰命名
  let componentName = iconName;

  // 确保首字母大写
  componentName =
    componentName.charAt(0).toUpperCase() + componentName.slice(1);

  // 检查图标是否存在
  const iconComponent =
    ElementPlusIcons[componentName as keyof typeof ElementPlusIcons];
  if (iconComponent) {
    return iconComponent;
  }

  // 如果找不到对应的图标，使用默认图标
  return Folder;
};

// 生成正确的路径
const getValidPath = (path: string | undefined): string | null => {
  if (!path) return null;
  // 清理路径，确保格式正确
  let cleanPath = path.trim();
  // 移除开头的多个斜杠
  cleanPath = cleanPath.replace(/^\/+/, "/");
  // 如果路径为空，返回null
  if (!cleanPath) return null;
  // 确保以 / 开头
  if (!cleanPath.startsWith("/")) {
    cleanPath = "/" + cleanPath;
  }
  return cleanPath;
};

// 跳转到对应菜单
const goToMenu = (menu: any) => {
  console.log("跳转到菜单:", menu);

  try {
    // 如果菜单有子菜单，跳转到第一个有效的子菜单
    if (menu.children?.length > 0) {
      // 找到第一个有效的子菜单
      const validChild = menu.children.find((child: any) => {
        // 只找menu类型且有path的
        return child.type === "menu" && child.path;
      });

      if (validChild) {
        const path = getValidPath(validChild.path);
        if (path) {
          router.push(path);
          return;
        }
      }
    }

    // 跳转当前菜单
    const currentPath = getValidPath(menu.path);
    if (currentPath) {
      router.push(currentPath);
      return;
    }
    console.warn("无法跳转菜单:", menu);
  } catch (error) {
    console.error("跳转菜单失败:", error);
  }
};

// 更新日期时间
const updateDateTime = () => {
  const now = new Date();

  // 格式化日期
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const weekDays = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  const weekDay = weekDays[now.getDay()];

  currentDate.value = `${year}年${month}月${day}日 ${weekDay}`;
};

// 生命周期
onMounted(() => {
  updateDateTime();
});
</script>

<style lang="scss" scoped>
.home-welcome {
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 64px);
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
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
  font-size: 14px;
  color: #606266;
  margin: 0;
}

// .welcome-content {
//   display: grid;
//   grid-template-columns: 1fr;
//   gap: 24px;

//   @media (min-width: 1200px) {
//     grid-template-columns: 1fr 1fr;
//   }
// }

.welcome-card {
  height: 100%;
  border-radius: 12px;
  border: none;

  :deep(.el-card__header) {
    border-bottom: 1px solid #f0f0f0;
    padding: 18px 24px;
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

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.3s ease;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
}

.stat-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;

  .el-icon {
    font-size: 24px;
    color: #409eff;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    margin-right: 12px;

    .el-icon {
      font-size: 20px;
    }
  }
}

.stat-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
}

.stat-label {
  font-size: 14px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 13px;
  }
}

.action-card {
  height: 100%;
  border-radius: 12px;
  border: none;

  :deep(.el-card__header) {
    border-bottom: 1px solid #f0f0f0;
    padding: 18px 24px;
  }
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  background: #fafafa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background: #edf7fd;
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  }

  @media (max-width: 768px) {
    padding: 16px 8px;
  }
}

.action-icon {
  font-size: 32px;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 8px;
  }
}

.action-text {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 14px;
  }
}
</style>
