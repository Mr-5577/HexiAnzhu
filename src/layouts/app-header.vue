<template>
  <header class="content-header">
    <div class="logo-content">
      <img class="logo-img" src="@/assets/imgs/logo.png" alt="" />
    </div>
    <div class="right-section">
      <div class="main-nav">
        <div
          v-for="item in menuList"
          :key="item.id"
          :class="['nav-item', { active: activeNav == item.id }]"
          @click="handleNavClick(item)"
        >
          <el-icon class="nav-icon">
            <component :is="item.icon" />
          </el-icon>
          <span class="nav-text">{{ item.title }}</span>
        </div>
      </div>
      <div class="user-info">
        <div class="user-name">您好！张三</div>
        <el-popover title="" :teleported="false" placement="bottom-end">
          <template #reference>
            <el-avatar
              shape="circle"
              :size="30"
              src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
            />
          </template>
          <template #default>
            <div class="user-dropdown">
              <div class="dropdown-item" @click="handleProfile">
                <el-icon><User /></el-icon>
                <span>个人中心</span>
              </div>
              <div class="dropdown-item" @click="logout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </div>
            </div>
          </template>
        </el-popover>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { extractModules, getFirstRoutePath } from "@/utils/menu-util";
import { useMenuStore } from "@/stores/menu-store";
import { ElMessage, ElMessageBox } from "element-plus";
import { userApi } from "@/api/user-api";

const menuStore = useMenuStore();

interface Props {
  activeModuleId?: number;
}

interface Emits {
  (e: "moduleChange", module: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  activeModuleId: 0,
});

const emit = defineEmits<Emits>();

const router = useRouter();
const activeNav = ref<number>(0);

const menuList = computed(() => {
  const menu = menuStore.menuData;
  // console.log("extractModules(menu)", extractModules(menu));
  return extractModules(menu);
});

// 监听外部传入的activeModuleId
watch(
  () => props.activeModuleId,
  (newId) => {
    if (newId) {
      activeNav.value = newId;
    }
  },
  { immediate: true }
);

// 处理导航点击
const handleNavClick = (module: any) => {
  activeNav.value = module.id;
  emit("moduleChange", module);

  // 跳转到该模块下的第一个可访问页面
  const firstRoutePath = getFirstRoutePath(menuStore.menuData, module.id);
  // console.log("点击模块:", module.title, "跳转到:", firstRoutePath);

  if (firstRoutePath) {
    router.push(firstRoutePath);
  }
};
const handleProfile = () => {
  router.push("/system/user");
};

const logout = () => {
  ElMessageBox.confirm("确定现在退出系统吗?", "退出", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
    // 添加 beforeClose 钩子
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        // 设置按钮为加载状态
        instance.confirmButtonLoading = true;
        try {
          const res = await userApi.logout({ username: "00001" });
          if (res.code === 200) {
            localStorage.clear();
            sessionStorage.clear();
            // 关闭弹窗
            done();
            // 跳转到登录页并刷新
            router.push("/login").then(() => {
              window.location.reload();
            });
          } else {
            ElMessage.error("退出失败");
          }
        } catch (error) {
          // ElMessage.error("请求失败，请重试");
        } finally {
          instance.confirmButtonLoading = false;
        }
      } else {
        // 用户点击取消，直接关闭弹窗
        done();
      }
    },
  }).catch(() => {
    // 这里处理取消的情况，但已经通过 beforeClose 处理了
  });
};
</script>

<style lang="scss" scoped>
.content-header {
  width: 100%;
  height: 64px;
  padding: 0 24px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #0a4a75;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  color: #ffffff;
  background: linear-gradient(135deg, #032c46 0%, #05456e 100%);

  .logo-content {
    height: 64px;
    padding: 0px 19px;
    box-sizing: border-box;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    .logo-img {
      width: 70%;
      height: auto;
      display: block;
      cursor: pointer;
      filter: drop-shadow(0px 0px red);
    }
  }

  .right-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;

    .main-nav {
      display: flex;
      gap: 8px;

      .nav-item {
        padding: 8px 16px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.85);
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        white-space: nowrap;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        user-select: none;

        .nav-icon {
          font-size: 16px;
          transition: all 0.2s ease-in-out;
        }

        .nav-text {
          transition: all 0.2s ease-in-out;
        }

        /* 悬停状态 */
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.95);
          transform: translateY(-1px);

          .nav-icon {
            // color: #4fc3f7; // 悬停时图标变亮蓝色
            transform: scale(1.1);
          }
        }

        /* 激活状态 */
        &.active {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

          .nav-icon {
            color: #ffffff;
            transform: scale(1.1);
          }

          .nav-text {
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          }
        }
      }
    }
    .user-info {
      display: flex;
      align-items: center;
      .user-name {
        font-size: 14px;
        font-weight: 700;
        margin-right: 5px;
      }
      .el-avatar {
        cursor: pointer;
      }
      .user-dropdown {
        padding: 4px 0;
        min-width: 120px;
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          color: #606266;
          transition: all 0.2s;
          border-radius: 4px;
          &:hover {
            background-color: #f5f7fa;
            color: #085381;

            .el-icon {
              color: #085381;
            }
          }
          .el-icon {
            font-size: 16px;
            color: #909399;
          }
          &:last-child {
            margin-top: 4px;
            padding-top: 8px;
            border-top: 1px solid #ebeef5;
            color: #f56c6c;
            &:hover {
              background-color: #fef0f0;
              color: #f56c6c;
              .el-icon {
                color: #f56c6c;
              }
            }
            .el-icon {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }
}
</style>
