<!-- ============ FloatNav 悬浮定位栏 ============ -->
<!-- 通用组件：接收导航项配置，内部自管 IntersectionObserver 滚动监听 + 高亮 + 收起 -->
<template>
  <nav class="float-nav" :class="{ 'nav-hidden': navCollapsed }">
    <button
      class="nav-expand-btn"
      title="展开定位栏"
      @click="navCollapsed = false"
    >
      🧭
    </button>
    <div class="float-nav-inner">
      <span
        class="nav-collapse-btn"
        title="收起"
        @click="navCollapsed = true"
      >
        ×
      </span>
      <div class="float-nav-title">
        <span class="nav-compass">🧭</span>
        <span class="nav-title-text">快速定位</span>
      </div>
      <ul class="float-nav-list">
        <li
          v-for="item in items"
          :key="item.id"
          class="float-nav-item"
          :class="{ active: activeCard === item.id }"
          @click="scrollToCard(item.id)"
        >
          <span class="nav-dot"></span>
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

interface NavItem {
  id: string;
  icon: string;
  label: string;
}

interface Props {
  /** 导航项配置（id 需与页面卡片元素 id 一致） */
  items: NavItem[];
  /** 滚动容器 selector（IntersectionObserver 的 root） */
  scrollRoot?: string;
}

const props = withDefaults(defineProps<Props>(), {
  scrollRoot: ".form-scroll-area",
});

const activeCard = ref<string>(props.items[0]?.id ?? "");
const navCollapsed = ref(false);

const scrollToCard = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    activeCard.value = id;
  }
};

// ---- 滚动监听 ----
let scrollObserver: IntersectionObserver | null = null;

const initScrollSpy = () => {
  const scrollArea = document.querySelector(props.scrollRoot);
  if (!scrollArea) return;
  scrollObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length > 0) {
        activeCard.value = visible[0].target.id;
      }
    },
    {
      root: scrollArea as HTMLElement,
      threshold: 0.1,
      rootMargin: "-80px 0px -60% 0px",
    },
  );
  props.items.forEach((c) => {
    const el = document.getElementById(c.id);
    if (el && scrollObserver) scrollObserver.observe(el);
  });
};

const destroyScrollSpy = () => {
  scrollObserver?.disconnect();
  scrollObserver = null;
};

onMounted(() => {
  initScrollSpy();
});

onBeforeUnmount(() => {
  destroyScrollSpy();
});
</script>

<style scoped lang="scss">
.float-nav {
  position: fixed;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 90;

  &.nav-hidden {
    .float-nav-inner {
      display: none;
    }
    .nav-expand-btn {
      display: flex;
    }
  }

  .nav-expand-btn {
    display: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(8px);
    border: 1px solid #e4e7ed;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
    font-size: 16px;
    transition: all 0.25s ease;

    &:hover {
      background: #409eff;
      color: #fff;
      border-color: #409eff;
      transform: scale(1.08);
    }
  }

  .float-nav-inner {
    position: relative;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(228, 231, 237, 0.6);
    border-radius: 12px;
    padding: 10px 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    width: 148px;
    overflow: hidden;
    opacity: 0.92;
    transition: opacity 0.3s;
  }

  &:hover .float-nav-inner {
    opacity: 1;
  }

  .nav-collapse-btn {
    position: absolute;
    top: -9px;
    right: -9px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    color: #86909c;
    opacity: 0.8;
    transition: all 0.2s;
    z-index: 2;
  }

  &:hover .nav-collapse-btn {
    opacity: 1;
  }

  .nav-collapse-btn:hover {
    color: #fff;
    background: #f56c6c;
    border-color: #f56c6c;
    transform: scale(1.15);
  }

  .float-nav-title {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 4px 8px;
    margin-bottom: 6px;
    border-bottom: 1px solid #ebeef5;
    font-size: 12px;
    color: #4e5969;
    font-weight: 600;
    white-space: nowrap;

    .nav-compass {
      font-size: 14px;
      flex-shrink: 0;
    }
  }

  .float-nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .float-nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    color: #86909c;
    transition: all 0.2s ease;
    position: relative;
    white-space: nowrap;

    .nav-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #d3d4d6;
      flex-shrink: 0;
      transition: all 0.25s ease;
    }

    .nav-icon {
      font-size: 14px;
      opacity: 0.75;
      flex-shrink: 0;
      transition: all 0.25s ease;
    }

    .nav-label {
      flex: 1;
    }

    &:hover {
      background: #ecf5ff;
      color: #409eff;

      .nav-dot {
        background: #409eff;
      }

      .nav-icon {
        opacity: 1;
        transform: scale(1.15);
      }
    }

    &.active {
      background: linear-gradient(
        90deg,
        #ecf5ff 0%,
        rgba(236, 245, 255, 0) 100%
      );
      color: #409eff;
      font-weight: 600;

      .nav-dot {
        background: #409eff;
        box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
        transform: scale(1.2);
      }

      .nav-icon {
        opacity: 1;
      }

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 16px;
        background: linear-gradient(180deg, #409eff, #66b1ff);
        border-radius: 2px;
      }
    }
  }
}

@media (max-width: 1280px) {
  .float-nav {
    display: none;
  }
}
</style>
