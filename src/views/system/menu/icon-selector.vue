<template>
  <div class="icon-selector">
    <div class="search-box">
      <el-input
        v-model="searchText"
        placeholder="搜索图标"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="icon-list">
      <div
        v-for="icon in filteredIcons"
        :key="icon"
        class="icon-item"
        :class="{ 'is-selected': selectedIcon === icon }"
        @click="handleSelect(icon)"
      >
        <el-icon :size="20">
          <component :is="icon" />
        </el-icon>
        <div class="icon-name">{{ icon }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Search } from "@element-plus/icons-vue";

// 常用的Element Plus图标
const commonIcons = [
  "HomeFilled",
  "Monitor",
  "Setting",
  "DataBoard",
  "Document",
  "Folder",
  "FolderOpened",
  "Files",
  "Edit",
  "Delete",
  "Plus",
  "Minus",
  "Check",
  "Close",
  "Search",
  "Refresh",
  "Upload",
  "Download",
  "User",
  "Lock",
  "Unlock",
  "Message",
  "Notification",
  "Bell",
  "Star",
  "Heart",
  "Share",
  "Location",
  "MapLocation",
  "Phone",
  "MessageBox",
  "ChatLineRound",
  "Coin",
  "Wallet",
  "ShoppingCart",
  "Goods",
  "Present",
  "Flag",
  "Calendar",
  "Clock",
  "Histogram",
  "PieChart",
  "TrendCharts",
  "SetUp",
  "Tools",
  "Operation",
  "Cpu",
  "Connection",
  "Link",
  "Position",
  "Promotion",
  "Discount",
  "Management",
  "Menu",
  "Grid",
  "Help",
  "Warning",
  "CircleClose",
  "CircleCheck",
  "CirclePlus",
  "Remove",
  "View",
  "Hide",
  "Sort",
  "Filter",
  "ZoomIn",
  "ZoomOut",
];

const searchText = ref("");
const selectedIcon = ref("");

// 过滤后的图标
const filteredIcons = computed(() => {
  if (!searchText.value) return commonIcons;
  return commonIcons.filter((icon) =>
    icon.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

const emit = defineEmits<{
  (e: "selected", iconName: string): void;
}>();

const handleSearch = () => {
  // 搜索逻辑已通过computed实现
};

const handleSelect = (iconName: string) => {
  selectedIcon.value = iconName;
  emit("selected", iconName);
};
</script>

<style scoped>
.icon-selector {
  width: 100%;
}

.search-box {
  margin-bottom: 10px;
}

.icon-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-item:hover {
  background-color: #f5f7fa;
}

.icon-item.is-selected {
  background-color: #ecf5ff;
  color: #409eff;
  border: 1px solid #409eff;
}

.icon-name {
  font-size: 12px;
  margin-top: 5px;
  text-align: center;
  word-break: break-all;
}
</style>
