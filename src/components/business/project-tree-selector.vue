<!-- 自定义项目选择组件（扁平列表版） -->
<template>
  <div class="project-tree-selector" :style="{ width }">
    <!-- 自定义选择框 -->
    <div
      class="selector-wrapper"
      :class="{ 'is-disabled': disabled }"
      @click="openDialog"
    >
      <div
        class="selector-input"
        :class="{ 'is-placeholder': !selectedItems.length }"
      >
        <template v-if="selectedItems.length > 0">
          <el-tag
            v-for="(item, index) in visibleSelectedItems"
            :key="item.id"
            size="small"
            closable
            type="info"
            @close="removeItem(item.id)"
            style="margin: 2px"
          >
            {{ item.projName }}
          </el-tag>
          <span v-if="selectedKeys.length > maxShowTags" class="more-count">
            +{{ selectedKeys.length - maxShowTags }}
          </span>
        </template>
        <span v-else class="placeholder">{{ placeholder }}</span>
      </div>
      <el-icon class="selector-arrow"><ArrowDown /></el-icon>
    </div>

    <!-- 选择对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="选择项目"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
      @closed="handleDialogClosed"
    >
      <div class="dialog-content">
        <!-- 搜索栏 -->
        <div class="dialog-header">
          <el-input
            v-model="filterText"
            placeholder="输入项目名称搜索"
            clearable
            :prefix-icon="Search"
            @input="handleFilter"
            @clear="handleClearSearch"
          />
          <div class="selection-info">
            <div class="select-all-wrapper">
              <el-checkbox
                v-model="isFilteredAllSelected"
                :indeterminate="isIndeterminate"
                @change="handleSelectAllChange"
              >
                {{ isFilteredAllSelected ? "取消全选" : "全选" }}
                <span v-if="filterText" class="search-tip">(当前搜索结果)</span>
              </el-checkbox>
            </div>
            <span class="selected-count"
              >已选择 {{ tempSelectedKeys.length }} 个项目</span
            >
          </div>
        </div>

        <!-- 项目列表 -->
        <div class="list-container" ref="listContainerRef">
          <div
            v-for="item in filteredProjectList"
            :key="item.id"
            class="list-item"
            :class="{ 'is-checked': tempSelectedKeys.includes(item.id) }"
            @click="toggleItem(item)"
          >
            <el-checkbox
              :model-value="tempSelectedKeys.includes(item.id)"
              @click.stop
              @change="() => toggleItem(item)"
            />
            <span class="item-label">{{ item.projName }}</span>
            <!-- <span v-if="item.projType !== undefined" class="item-type">
              {{ getProjectTypeText(item.projType) }}
            </span> -->
          </div>

          <!-- 无数据提示 -->
          <el-empty
            v-if="filteredProjectList.length === 0"
            description="未找到相关项目"
            :image-size="100"
          />

          <!-- 加载更多（如果有分页需求） -->
          <div
            v-if="filteredProjectList.length > 0 && showLoadMore"
            class="load-more"
          >
            <span>已显示全部项目</span>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="dialog-footer">
          <div class="selected-preview" v-if="tempSelectedItems.length > 0">
            <span class="preview-label">已选项目：</span>
            <div class="preview-tags">
              <el-tag
                v-for="item in tempSelectedItems"
                :key="item.id"
                size="small"
                closable
                type="info"
                @close="removeTempItem(item.id)"
                class="preview-tag"
              >
                {{ item.projName }}
              </el-tag>
            </div>
          </div>
          <div class="footer-actions">
            <el-button @click="cancel">取消</el-button>
            <el-button
              type="primary"
              @click="confirm"
              :disabled="tempSelectedKeys.length === 0"
            >
              确定({{ tempSelectedKeys.length }})
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { ArrowDown, Search } from "@element-plus/icons-vue";
import { debounce } from "@/utils/common";

// 定义项目数据类型
interface ProjectData {
  id: number;
  pid: number;
  projName: string;
  projType?: number;
  isDel?: boolean;
  mguId?: number;
  xsProjId?: number;
  sort?: number;
  children?: ProjectData[];
}

// 定义props
const props = defineProps({
  // v-model绑定
  modelValue: {
    type: Array as () => number[],
    default: () => [],
  },
  // 项目数据
  projectList: {
    type: Array as () => ProjectData[],
    required: true,
    default: () => [],
  },
  // 占位符
  placeholder: {
    type: String,
    default: "请选择项目",
  },
  // 最大显示标签数
  maxShowTags: {
    type: Number,
    default: 1,
  },
  // 宽度
  width: {
    type: String,
    default: "100%",
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false,
  },
  // 是否显示加载更多提示
  showLoadMore: {
    type: Boolean,
    default: false,
  },
});

// 定义emits
const emit = defineEmits<{
  "update:modelValue": [value: number[]];
  change: [value: number[]];
  confirm: [value: number[]];
}>();

// 状态变量
const dialogVisible = ref(false);
const filterText = ref("");
const selectedKeys = ref<number[]>([]);
const tempSelectedKeys = ref<number[]>([]);
const listContainerRef = ref<HTMLElement>();

// 过滤后的项目列表
const filteredProjectList = computed(() => {
  if (!filterText.value.trim()) {
    return props.projectList;
  }

  const keyword = filterText.value.trim().toLowerCase();
  return props.projectList.filter((item) =>
    item.projName.toLowerCase().includes(keyword),
  );
});

// 已确认的选中项目
const selectedItems = computed(() => {
  return props.projectList.filter((item) =>
    selectedKeys.value.includes(item.id),
  );
});

// 临时选中的项目
const tempSelectedItems = computed(() => {
  return props.projectList.filter((item) =>
    tempSelectedKeys.value.includes(item.id),
  );
});

// 选择框中可见的项目
const visibleSelectedItems = computed(() => {
  return selectedItems.value.slice(0, props.maxShowTags);
});

// 搜索结果是否全选
const isFilteredAllSelected = computed({
  get: () => {
    if (filteredProjectList.value.length === 0) return false;
    return filteredProjectList.value.every((item) =>
      tempSelectedKeys.value.includes(item.id),
    );
  },
  set: (value: boolean) => {
    handleSelectAllChange(value);
  },
});

// 半选状态
const isIndeterminate = computed(() => {
  if (filteredProjectList.value.length === 0) return false;

  const visibleCheckedCount = filteredProjectList.value.filter((item) =>
    tempSelectedKeys.value.includes(item.id),
  ).length;

  return (
    visibleCheckedCount > 0 &&
    visibleCheckedCount < filteredProjectList.value.length
  );
});

// 监听props变化
watch(
  () => props.modelValue,
  (newVal) => {
    selectedKeys.value = [...(newVal || [])];
  },
  {
    immediate: true,
    deep: true,
  },
);

// 监听项目列表变化，确保选中的项目ID有效
watch(
  () => props.projectList,
  (newList) => {
    if (newList.length > 0 && selectedKeys.value.length > 0) {
      // 过滤掉已经不存在的项目ID
      const validIds = newList.map((item) => item.id);
      const filteredKeys = selectedKeys.value.filter((id) =>
        validIds.includes(id),
      );
      if (filteredKeys.length !== selectedKeys.value.length) {
        selectedKeys.value = filteredKeys;
        updateValue();
      }
    }
  },
  { deep: true },
);

// 方法
const openDialog = () => {
  if (props.disabled) return;

  // 打开弹窗前清空搜索
  filterText.value = "";
  // 将当前选中的ID复制到临时选中
  tempSelectedKeys.value = [...selectedKeys.value];
  dialogVisible.value = true;
};

const handleFilter = debounce(() => {
  // 搜索时滚动到顶部
  if (listContainerRef.value) {
    listContainerRef.value.scrollTop = 0;
  }
}, 300);

const handleClearSearch = () => {
  filterText.value = "";
  if (listContainerRef.value) {
    listContainerRef.value.scrollTop = 0;
  }
};

// 切换单个项目
const toggleItem = (item: ProjectData) => {
  const index = tempSelectedKeys.value.indexOf(item.id);
  if (index > -1) {
    tempSelectedKeys.value.splice(index, 1);
  } else {
    tempSelectedKeys.value.push(item.id);
  }
};

// 处理全选/取消全选
const handleSelectAllChange = (checked: boolean) => {
  const visibleIds = filteredProjectList.value.map((item) => item.id);

  if (checked) {
    // 全选：合并当前选中和可见项目
    const newChecked = [...new Set([...tempSelectedKeys.value, ...visibleIds])];
    tempSelectedKeys.value = newChecked;
  } else {
    // 取消全选：只移除可见项目
    const newChecked = tempSelectedKeys.value.filter(
      (id) => !visibleIds.includes(id),
    );
    tempSelectedKeys.value = newChecked;
  }
};

// 移除已选中的项目（从选择框中）
const removeItem = (id: number) => {
  const index = selectedKeys.value.indexOf(id);
  if (index > -1) {
    selectedKeys.value.splice(index, 1);
    updateValue();
  }
};

// 移除临时选中的项目（从预览区域）
const removeTempItem = (id: number) => {
  const index = tempSelectedKeys.value.indexOf(id);
  if (index > -1) {
    tempSelectedKeys.value.splice(index, 1);
  }
};

// 取消
const cancel = () => {
  dialogVisible.value = false;
};

// 确认
const confirm = () => {
  if (tempSelectedKeys.value.length === 0) {
    ElMessage.warning("至少选择一个项目");
    return;
  }

  selectedKeys.value = [...tempSelectedKeys.value];
  updateValue();
  emit("confirm", [...tempSelectedKeys.value]);
  dialogVisible.value = false;
};

// 弹窗关闭后的处理
const handleDialogClosed = () => {
  filterText.value = ""; // 清空搜索
  // 不需要重置tempSelectedKeys，因为下次打开时会重新赋值
};

// 更新父组件值
const updateValue = () => {
  const value = [...selectedKeys.value];
  emit("update:modelValue", value);
  emit("change", value);
};

// 获取项目类型文本
const getProjectTypeText = (type: number): string => {
  const typeMap: Record<number, string> = {
    0: "住宅",
    1: "商业",
    2: "办公",
    3: "其他",
  };
  return typeMap[type] || "未知";
};

// 暴露方法给父组件
defineExpose({
  // 获取已选中的项目列表
  getSelectedItems: () => selectedItems.value,
  // 获取已选中的ID列表
  getSelectedKeys: () => [...selectedKeys.value],
  // 设置选中的ID列表
  setSelectedKeys: (keys: number[]) => {
    selectedKeys.value = [...keys];
    updateValue();
  },
  // 清空所有选中
  clear: () => {
    selectedKeys.value = [];
    tempSelectedKeys.value = [];
    updateValue();
  },
  // 打开弹窗
  openDialog,
  // 关闭弹窗
  closeDialog: () => {
    dialogVisible.value = false;
  },
});
</script>

<style scoped lang="scss">
.project-tree-selector {
  width: v-bind(width);
  .selector-wrapper {
    position: relative;
    cursor: pointer;
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    padding: 2px 30px 2px 4px;
    min-height: 32px;
    background-color: var(--el-fill-color-blank);
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    transition: border-color 0.2s;
    box-sizing: border-box;
    &:hover:not(.is-disabled) {
      border-color: var(--el-border-color-hover);
    }
    &.is-disabled {
      cursor: not-allowed;
      background-color: var(--el-disabled-bg-color);
      border-color: var(--el-disabled-border-color);
    }
    .selector-input {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 2px;
      min-height: 28px;
      width: calc(100% - 20px);
      &.is-placeholder {
        color: var(--el-text-color-placeholder);
        line-height: 28px;
        padding-left: 4px;
      }
    }
    .placeholder {
      font-size: var(--el-font-size-base);
    }
    .selector-arrow {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--el-text-color-placeholder);
      font-size: 12px;
      transition: transform 0.3s;
    }
    .more-count {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      margin-left: 4px;
      background-color: #f0f2f5;
      border-radius: 2px;
      padding: 0 4px;
      line-height: 20px;
      height: 20px;
      display: inline-block;
    }
  }
}

// 对话框样式
:deep(.el-dialog) {
  .el-dialog__body {
    // padding: 16px 20px;
  }
}
.dialog-content {
  display: flex;
  flex-direction: column;
  height: 500px;
  .dialog-header {
    // margin-bottom: 8px;
    .selection-info {
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .select-all-wrapper {
        display: flex;
        align-items: center;
        .search-tip {
          font-size: 12px;
          color: #999;
          margin-left: 4px;
        }
      }
      .selected-count {
        font-size: 13px;
        color: var(--el-text-color-regular);
      }
    }
  }
  .list-container {
    flex: 1;
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
    overflow-y: auto;
    padding: 4px 0;
    .list-item {
      display: flex;
      align-items: center;
      padding: 0px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
      // border-bottom: 1px solid var(--el-border-color-light);
      &:last-child {
        border-bottom: none;
      }
      &:hover {
        background-color: var(--el-fill-color-light);
      }
      &.is-checked {
        // background-color: var(--el-color-primary-light-9);
      }
      .item-label {
        margin-left: 12px;
        flex: 1;
        font-size: 14px;
        color: var(--el-text-color-primary);
      }
      .item-type {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-left: 8px;
        padding: 2px 6px;
        background-color: var(--el-fill-color-light);
        border-radius: 4px;
      }
    }
    .load-more {
      text-align: center;
      padding: 16px 0;
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
  }
  .dialog-footer {
    margin-top: 16px;
    .selected-preview {
      margin-bottom: 16px;
      border: 1px solid var(--el-border-color-light);
      border-radius: var(--el-border-radius-base);
      background-color: var(--el-fill-color-lighter);
      .preview-label {
        display: block;
        padding: 8px 12px 0;
        font-size: 13px;
        color: var(--el-text-color-regular);
        font-weight: 500;
      }
      .preview-tags {
        padding: 8px 12px 12px;
        max-height: 100px;
        overflow-y: auto;

        .preview-tag {
          margin: 0 4px 4px 0;
        }
      }
    }
    .footer-actions {
      text-align: right;
      .el-button {
        min-width: 100px;
      }
    }
  }
}
// 滚动条样式
.list-container,
.preview-tags {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--el-fill-color-light);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-dark);
    border-radius: 3px;

    &:hover {
      background: var(--el-border-color-darker);
    }
  }
}
</style>
