<template>
  <template v-if="!item.isVisible">
    <!-- 隐藏的菜单不渲染 -->
  </template>

  <el-menu-item
    v-else-if="!item.children || item.children.length === 0"
    :index="item.index"
    @click="handleClick"
  >
    <template #title>
      <div class="menu-content">
        <!-- <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon> -->
        <span class="menu-title">{{ item.title }}</span>
      </div>
    </template>
  </el-menu-item>

  <el-sub-menu v-else :index="item.index">
    <template #title>
      <div class="menu-content">
        <!-- <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon> -->
        <span class="menu-title">{{ item.title }}</span>
      </div>
    </template>

    <sidebar-menu-item
      v-for="child in item.children"
      :key="child.index"
      :item="child"
      @menu-click="emit('menu-click', $event)"
    />
  </el-sub-menu>
</template>

<script setup lang="ts">
import type { SidebarMenuItem } from "@/types/menu-type";

interface Props {
  item: SidebarMenuItem;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "menu-click", item: SidebarMenuItem): void;
}>();

const handleClick = () => {
  emit("menu-click", props.item);
};
</script>

<style scoped>
.menu-content {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .menu-title {
    flex: 1;
  }
}
</style>
