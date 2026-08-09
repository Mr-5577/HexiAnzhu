<!-- ============ FormCard 表单卡片骨架 ============ -->
<!-- 统一封装卡片 header / 折叠 / body 结构，样式从原主文件迁移 -->
<template>
  <section class="item-card" :id="id" :class="{ collapsed }">
    <div class="card-header" @click="handleToggle">
      <div class="card-title">
        <span v-if="icon" class="icon">{{ icon }}</span>
        <span>{{ title }}</span>
      </div>
      <span class="card-toggle">▼</span>
    </div>
    <div class="card-body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  id: string;
  icon?: string;
  title?: string;
  collapsed?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  icon: "",
  title: "",
  collapsed: false,
});
const emit = defineEmits<{
  (e: "update:collapsed", val: boolean): void;
  (e: "toggle"): void;
}>();
const handleToggle = () => {
  emit("update:collapsed", !props.collapsed);
  emit("toggle");
};
</script>

<style scoped lang="scss">
.item-card {
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  scroll-margin-top: 76px;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &:last-child {
    margin-bottom: 0;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #ebeef5;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;

    &:hover {
      background: #fafbfc;
    }
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
    color: #1d2129;
    position: relative;
    padding-left: 12px;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      background: linear-gradient(180deg, #409eff, #66b1ff);
      border-radius: 2px;
    }

    .icon {
      font-size: 16px;
    }
  }

  .card-toggle {
    color: #86909c;
    font-size: 12px;
    transition: transform 0.2s;
  }

  .card-body {
    padding: 20px 20px 4px;
  }

  &.collapsed {
    .card-toggle {
      transform: rotate(-90deg);
    }

    .card-body {
      display: none;
    }

    .card-header {
      border-bottom: none;
    }
  }
}
</style>
