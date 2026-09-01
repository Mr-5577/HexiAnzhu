<template>
  <!-- 菜单项（无子菜单或子菜单全部不可见） -->
  <el-menu-item v-if="!hasVisibleChildren" :index="item.index" @click="handleClick">
    <template #title>
      <div class="menu-content">
        <span class="menu-title">{{ item.title }}</span>
      </div>
    </template>
  </el-menu-item>

  <!-- 子菜单（有可见的子菜单项） -->
  <el-sub-menu v-else :index="item.index">
    <template #title>
      <div class="menu-content">
        <span class="menu-title">{{ item.title }}</span>
      </div>
    </template>

    <sidebar-menu-item v-for="child in visibleChildren" :key="child.index" :item="child"
      @menu-click="emit('menu-click', $event)" />
  </el-sub-menu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SidebarMenuItem } from "@/types/system/menu-type";

interface Props {
  item: SidebarMenuItem;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "menu-click", item: SidebarMenuItem): void;
}>();

/**
 * 获取所有可见的子菜单项
 * 注意：新增、编辑、详情页面通常设置为 isVisible: false
 */
const visibleChildren = computed(() => {
  return props.item.children?.filter(child => child.isVisible !== false) || [];
});

/**
 * 判断是否有可见的子菜单项
 * 只有存在可见的子菜单时，才渲染为 el-sub-menu
 */
const hasVisibleChildren = computed(() => {
  return visibleChildren.value.length > 0;
});

const handleClick = () => {
  emit("menu-click", props.item);
};
</script>

<style scoped>
.menu-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  overflow: hidden;

  .menu-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>