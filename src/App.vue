<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { getEnvironmentName } from "@/utils/config";
// 应用根组件
console.log(getEnvironmentName(), import.meta.env.VITE_APP_TITLE);
console.log('config==>', import.meta.env);
</script>

<style lang="scss">
#app {
  width: 100%;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}
// 全局的cascader的class属性为fixed-height-cascader的样式
.fixed-height-cascader {
  /* 关键：使用 flex 布局实现完美垂直居中 */
  .el-input {
    height: 32px !important;

    /* 重置默认样式 */
    .el-input__wrapper {
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
      padding: 0 11px !important;
      display: flex;
      align-items: center;
      position: relative;
    }

    /* 输入框内容区域 */
    .el-input__inner {
      height: 32px !important;
      line-height: 32px !important;
      padding: 0 !important;
      flex: 1;
    }

    /* 多选标签容器 */
    .el-cascader__tags {
      position: absolute;
      left: 11px;
      right: 30px; /* 给右侧图标留空间 */
      top: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      overflow: hidden;

      .el-tag {
        height: 24px !important;
        line-height: 24px !important;
        margin: 4px 4px 4px 0 !important;
        display: inline-flex;
        align-items: center;
        .el-tag__content {
          display: flex;
          align-items: center;
          height: 100%;
        }
      }

      /* 当没有标签时显示占位符 */
      span:not(.el-tag) {
        line-height: 32px !important;
        height: 32px !important;
        display: inline-block;
      }
    }

    /* 占位符文本 */
    .el-input__inner::placeholder {
      line-height: 32px !important;
    }

    /* 后缀区域（清除按钮、下拉箭头） */
    .el-input__suffix {
      display: flex;
      align-items: center;
      height: 100%;
      right: 8px;

      .el-input__suffix-inner {
        display: flex;
        align-items: center;
        height: 100%;

        .el-icon {
          height: 32px !important;
          line-height: 32px !important;
          display: flex;
          align-items: center;
        }
      }

      .el-input__clear {
        height: 32px !important;
        line-height: 32px !important;
        display: flex;
        align-items: center;
      }
    }
  }
  .el-cascader__tags {
    flex-wrap: nowrap !important;
    .el-tag {
      padding: 0 2px !important;
    }
    .el-cascader__search-input {
      min-width: 30px;
    }
  }
}
</style>
