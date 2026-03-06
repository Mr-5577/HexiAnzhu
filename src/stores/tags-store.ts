import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { RouteLocationNormalized } from "vue-router";

export interface TagView {
  name: string;
  path: string;
  title: string;
  fullPath: string;
  affix?: boolean; // 是否固定标签（如首页）
  // 唯一标识，用于区分相同路由不同参数的页面
  uniqueId?: string;
}

export const useTagsStore = defineStore(
  "tags-store",
  () => {
    // 标签页列表
    const visitedViews = ref<TagView[]>([]);
    // 当前激活的标签
    const activeTag = ref<string>("");

    // 添加标签页 - 增强版，支持多开
    const addView = (view: RouteLocationNormalized) => {
      // 获取页面是否支持多开的配置
      const isMultiOpen = view.meta?.isMultiOpen || false;

      if (isMultiOpen) {
        // 多开页面：总是创建新标签页（除非参数完全相同）
        handleMultiOpenView(view);
      } else {
        // 普通页面：替换相同路由的标签页
        handleNormalView(view);
      }
    };

    // 处理多开页面
    const handleMultiOpenView = (view: RouteLocationNormalized) => {
      const uniqueId = generateUniqueId(view);

      // 检查是否已存在相同唯一标识的标签
      const existingIndex = visitedViews.value.findIndex(
        (v) => v.uniqueId === uniqueId
      );

      if (existingIndex > -1) {
        // 如果已存在，更新标题和路径
        visitedViews.value[existingIndex] = {
          ...visitedViews.value[existingIndex],
          title: generateTagTitle(view),
          fullPath: view.fullPath,
        };
      } else {
        // 创建新标签页
        visitedViews.value.push({
          name: view.name as string,
          path: view.path,
          title: generateTagTitle(view),
          fullPath: view.fullPath,
          affix: view.path === "/home" ? true : false,
          uniqueId: uniqueId,
        });
      }

      setActiveTag(view.path, uniqueId);
    };

    // 处理普通页面
    const handleNormalView = (view: RouteLocationNormalized) => {
      // 查找相同路径的标签页
      const existingIndex = visitedViews.value.findIndex(
        (v) => v.path === view.path
      );

      if (existingIndex > -1) {
        // 更新现有标签页
        visitedViews.value[existingIndex] = {
          ...visitedViews.value[existingIndex],
          title: generateTagTitle(view),
          fullPath: view.fullPath,
          uniqueId: generateUniqueId(view),
        };
      } else {
        // 创建新标签页
        visitedViews.value.push({
          name: view.name as string,
          path: view.path,
          title: generateTagTitle(view),
          fullPath: view.fullPath,
          affix: view.path === "/home" ? true : false,
          uniqueId: generateUniqueId(view),
        });
      }

      setActiveTag(view.path, generateUniqueId(view));
    };

    // 删除标签页
    const delView = (view: TagView) => {
      const index = visitedViews.value.findIndex(
        (v) => v.uniqueId === view.uniqueId
      );
      if (index > -1) {
        visitedViews.value.splice(index, 1);
      }
    };

    // 删除其他标签页
    const delOtherViews = (view: TagView) => {
      visitedViews.value = visitedViews.value.filter(
        (v) => v.affix || v.uniqueId === view.uniqueId
      );
      setActiveTag(view.path, view.uniqueId);
    };

    // 删除所有标签页
    const delAllViews = () => {
      visitedViews.value = visitedViews.value.filter((v) => v.affix);
      if (visitedViews.value.length > 0) {
        const lastView = visitedViews.value[visitedViews.value.length - 1];
        setActiveTag(lastView.path, lastView.uniqueId);
      }
    };

    // 删除右侧标签页
    const delRightViews = (view: TagView) => {
      const index = visitedViews.value.findIndex(
        (v) => v.uniqueId === view.uniqueId
      );
      if (index > -1) {
        visitedViews.value = visitedViews.value
          .slice(0, index + 1)
          .concat(visitedViews.value.filter((v) => v.affix));
      }
    };

    // 设置当前激活的标签
    const setActiveTag = (path: string, uniqueId?: string) => {
      activeTag.value = uniqueId || path;
    };

    // 初始化固定标签页
    const initAffixTags = (views: TagView[]) => {
      const affixTags = views.filter((tag) => tag.affix);
      visitedViews.value = affixTags.concat(visitedViews.value);
    };

    // 辅助函数：生成唯一标识
    const generateUniqueId = (view: RouteLocationNormalized): string => {
      const { path, query } = view;

      // 如果不支持多开，仅使用路径作为标识
      if (!view.meta?.isMultiOpen || Object.keys(query).length === 0) {
        return path;
      }

      // 对于多开页面，使用路径+关键参数生成唯一标识
      // 可以根据需要调整关键参数
      const keyParams: string[] = [];

      // 优先使用id作为标识
      if (query.id) {
        keyParams.push(`id=${query.id}`);
      }
      // 如果没有id，使用其他参数
      else {
        const sortedParams = Object.keys(query)
          .sort()
          .map((key) => `${key}=${query[key]}`)
          .join("&");
        keyParams.push(sortedParams);
      }

      return `${path}?${keyParams.join("&")}`;
    };

    // 辅助函数：生成标签标题
    const generateTagTitle = (view: RouteLocationNormalized): string => {
      const baseTitle = (view.meta?.title as string) || "未知页面";
      const { query } = view;

      // 如果是多开页面且有标识参数，显示在标题中
      // if (view.meta?.isMultiOpen) {
      //   if (query.taskName) {
      //     return `${baseTitle}: ${query.taskName}`;
      //   }
      //   if (query.id) {
      //     return `${baseTitle}: ${query.id}`;
      //   }
      //   if (query.name) {
      //     return `${baseTitle}: ${query.name}`;
      //   }
      // }

      return baseTitle;
    };

    // 检查标签是否激活
    const isTagActive = (
      tag: TagView,
      currentRoute: RouteLocationNormalized
    ): boolean => {
      const currentUniqueId = generateUniqueId(currentRoute);
      return tag.uniqueId === currentUniqueId;
    };

    // 获取页面是否支持多开
    const isMultiOpenPage = (path: string): boolean => {
      const view = visitedViews.value.find((v) => v.path === path);
      // 这里可以从路由元数据获取，但需要在其他地方设置
      return false;
    };

    return {
      visitedViews,
      activeTag,
      addView,
      delView,
      delOtherViews,
      delAllViews,
      delRightViews,
      setActiveTag,
      initAffixTags,
      // 导出辅助函数
      generateUniqueId,
      generateTagTitle,
      isTagActive,
      isMultiOpenPage,
      handleMultiOpenView,
      handleNormalView,
    };
  },
  {
    persist: {
      key: "tags-store",
      storage: sessionStorage,
    },
  }
);
