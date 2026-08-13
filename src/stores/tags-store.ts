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
    // 访问历史栈
    const historyStack = ref<string[]>([]);

    // 记录访问历史
    const addHistory = (fullPath: string) => {
      // 如果当前路径已经在历史中，先移除（实现"最近访问"逻辑）
      const index = historyStack.value.indexOf(fullPath);
      if (index > -1) {
        historyStack.value.splice(index, 1);
      }
      historyStack.value.push(fullPath);

      // 限制历史记录大小，防止内存泄漏（保留最近100条）
      if (historyStack.value.length > 100) {
        historyStack.value.shift();
      }
    };

    // 获取上一个访问的路径
    const getPreviousPath = (currentPath: string): string | null => {
      const index = historyStack.value.indexOf(currentPath);
      if (index > 0) {
        const prevPath = historyStack.value[index - 1];
        // 检查该路径是否还在标签列表中
        const exists = visitedViews.value.some((v) => v.fullPath === prevPath);
        return exists ? prevPath : null;
      }
      return null;
    };

    // 从历史中移除路径
    const removeFromHistory = (fullPath: string) => {
      const index = historyStack.value.indexOf(fullPath);
      if (index > -1) {
        historyStack.value.splice(index, 1);
      }
    };

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

      // 每次添加视图时记录历史
      addHistory(view.fullPath);
    };

    // 处理多开页面
    const handleMultiOpenView = (view: RouteLocationNormalized) => {
      const uniqueId = generateUniqueId(view);

      // 检查是否已存在相同唯一标识的标签
      const existingIndex = visitedViews.value.findIndex(
        (v) => v.uniqueId === uniqueId,
      );

      if (existingIndex > -1) {
        // 如果已存在，更新标题和路径
        const oldFullPath = visitedViews.value[existingIndex].fullPath;
        visitedViews.value[existingIndex] = {
          ...visitedViews.value[existingIndex],
          title: generateTagTitle(view),
          fullPath: view.fullPath,
        };
        // 如果 fullPath 变化，更新历史记录
        if (oldFullPath !== view.fullPath) {
          removeFromHistory(oldFullPath);
          addHistory(view.fullPath);
        }
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
        (v) => v.path === view.path,
      );

      if (existingIndex > -1) {
        // 更新现有标签页
        const oldFullPath = visitedViews.value[existingIndex].fullPath;
        visitedViews.value[existingIndex] = {
          ...visitedViews.value[existingIndex],
          title: generateTagTitle(view),
          fullPath: view.fullPath,
          uniqueId: generateUniqueId(view),
        };
        // 如果 fullPath 变化，更新历史记录
        if (oldFullPath !== view.fullPath) {
          removeFromHistory(oldFullPath);
          addHistory(view.fullPath);
        }
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
        (v) => v.uniqueId === view.uniqueId,
      );
      if (index > -1) {
        visitedViews.value.splice(index, 1);
        // 从历史中移除
        removeFromHistory(view.fullPath);
      }
    };

    // 删除其他标签页
    const delOtherViews = (view: TagView) => {
      // 获取要保留的标签列表
      const toKeep = visitedViews.value.filter(
        (v) => v.affix || v.uniqueId === view.uniqueId,
      );

      // 获取被删除的标签路径列表
      const deletedPaths = visitedViews.value
        .filter((v) => !toKeep.some((k) => k.uniqueId === v.uniqueId))
        .map((v) => v.fullPath);

      // 更新标签列表
      visitedViews.value = toKeep;

      // 从历史中移除被删除的标签
      deletedPaths.forEach((path) => removeFromHistory(path));

      setActiveTag(view.path, view.uniqueId);
    };

    // 删除所有标签页
    const delAllViews = () => {
      const affixViews = visitedViews.value.filter((v) => v.affix);

      // 获取被删除的标签路径列表
      const deletedPaths = visitedViews.value
        .filter((v) => !v.affix)
        .map((v) => v.fullPath);

      visitedViews.value = affixViews;

      // 从历史中移除所有非固定标签
      deletedPaths.forEach((path) => removeFromHistory(path));

      if (visitedViews.value.length > 0) {
        const lastView = visitedViews.value[visitedViews.value.length - 1];
        setActiveTag(lastView.path, lastView.uniqueId);
      }
    };

    // 删除右侧标签页
    const delRightViews = (view: TagView) => {
      const index = visitedViews.value.findIndex(
        (v) => v.uniqueId === view.uniqueId,
      );
      if (index > -1) {
        // 获取右侧标签列表
        const rightViews = visitedViews.value.slice(index + 1);
        const rightPaths = rightViews.map((v) => v.fullPath);

        visitedViews.value = visitedViews.value
          .slice(0, index + 1)
          .concat(visitedViews.value.filter((v) => v.affix));

        // 从历史中移除右侧标签
        rightPaths.forEach((path) => removeFromHistory(path));
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
      const { path, query, params, fullPath } = view;

      // 如果不支持多开，仅使用路径作为标识
      if (!view.meta?.isMultiOpen || Object.keys(query).length === 0) {
        return path;
      }

      // 对于多开页面，使用关键参数生成唯一标识
      const keyParams: string[] = [];

      // 从 params 提取
      const paramKeys = Object.keys(params);
      if (paramKeys.length > 0) {
        const sortedParams = paramKeys
          .sort()
          .map((key) => `${key}=${params[key]}`)
          .join("&");
        keyParams.push(sortedParams);
      }
      // 从 query 提取
      const queryKeys = Object.keys(query);
      if (queryKeys.length > 0) {
        const sortedQuery = queryKeys
          .sort()
          .map((key) => `${key}=${query[key]}`)
          .join("&");
        keyParams.push(sortedQuery);
      }
      // 没有任何参数：使用路径作为标识
      if (keyParams.length === 0) {
        return path;
      }
      return `${path}?${keyParams.join("&")}`;
    };

    // 辅助函数：生成标签标题
    const generateTagTitle = (view: RouteLocationNormalized): string => {
      const baseTitle = (view.meta?.title as string) || "未知页面";

      // const { query } = view;
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
      currentRoute: RouteLocationNormalized,
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

    // 关闭指定标签
    const closeTagByPath = (path: string): boolean => {
      // 查找要关闭的标签
      const index = visitedViews.value.findIndex((v) => v.path === path);
      if (index === -1) return false;

      const tag = visitedViews.value[index];
      // 固定标签不允许关闭
      if (tag.affix) return false;

      // 删除标签
      visitedViews.value.splice(index, 1);
      // 从历史中移除
      removeFromHistory(tag.fullPath);
      return true;
    };

    return {
      visitedViews, // 所有已访问的标签
      activeTag, // 当前激活的标签
      historyStack, // 导出历史栈
      addView, // 添加标签
      delView, // 删除标签
      delOtherViews, // 删除其他标签
      delAllViews, // 删除所有标签
      delRightViews, // 删除右侧标签
      setActiveTag, // 设置当前激活的标签
      initAffixTags, // 初始化固定标签
      closeTagByPath, // 关闭指定标签
      addHistory, //  添加历史记录
      getPreviousPath, // 获取上一个路径
      removeFromHistory, // 从历史中移除
      // 导出辅助函数
      generateUniqueId, // 生成唯一标识
      generateTagTitle, // 生成标签标题
      isTagActive, // 检查标签是否激活
      isMultiOpenPage, // 获取页面是否支持多开
      handleMultiOpenView, // 处理多开页面
      handleNormalView, // 处理普通页面
    };
  },
  {
    persist: {
      key: "tags-store",
      storage: sessionStorage,
    },
  },
);
