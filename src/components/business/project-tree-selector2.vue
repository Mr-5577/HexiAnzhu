<!-- 自定义项目树形组件 -->
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
            @close="removeItem(index)"
            style="margin: 2px"
          >
            {{ item.projName }}
          </el-tag>
          <span v-show="selectedKeys.length > maxShowTags" class="more-count">
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
          />
          <div class="selection-info">
            <el-checkbox
              v-model="isSelectAll"
              @change="handleSelectAllChange"
              :indeterminate="isIndeterminate"
            >
              全选/全不选
            </el-checkbox>
            <span>已选择 {{ tempSelectedKeys.length }} 个项目</span>
            <!-- <el-button link type="primary" @click="clearAll">清空</el-button> -->
          </div>
        </div>

        <!-- 项目树 -->
        <div class="tree-container">
          <el-tree
            ref="treeRef"
            :data="props.projectList"
            :props="treeProps"
            node-key="id"
            show-checkbox
            :default-expand-all="true"
            :check-strictly="false"
            :filter-node-method="filterNode"
            :default-checked-keys="tempSelectedKeys"
            @check="handleCheck"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <span>{{ node.label }}</span>
                <!-- <el-tag
                  v-if="data.projType !== undefined"
                  size="small"
                  class="type-tag"
                >
                  {{ getProjectTypeText(data.projType) }}
                </el-tag> -->
              </span>
            </template>
          </el-tree>
        </div>

        <!-- 底部操作 -->
        <div class="dialog-footer">
          <div class="selected-preview">
            <span>已选项目：</span>
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
          <div class="footer-actions">
            <el-button @click="cancel">取消</el-button>
            <el-button type="primary" @click="confirm">确定</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, PropType } from "vue";
import { ElTree, ElMessage } from "element-plus";
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
    type: Array as PropType<number[]>,
    default: () => [],
  },
  // 项目数据
  projectList: {
    type: Array as PropType<ProjectData[]>,
    required: true,
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
  // 是否多选
  multiple: {
    type: Boolean,
    default: true,
  },
});

// 定义emits
const emit = defineEmits<{
  "update:modelValue": [value: number[]];
  change: [value: number[]];
}>();

// refs
const dialogVisible = ref(false);
const isSelectAll = ref(false);
const filterText = ref("");
// 原始选中的key（用于显示在选择框中）
const selectedKeys = ref<number[]>([]);
// 临时选中的key（用于弹窗中的操作）
const tempSelectedKeys = ref<number[]>([]);
const treeRef = ref<InstanceType<typeof ElTree>>();

// 计算属性
// const treeData = computed(() => {
//   return buildTree(props.projectList);
// });

// 已确认的选中项目（显示在选择框中）
const selectedItems = computed(() => {
  // return props.projectList.filter((item) =>
  // selectedKeys.value.includes(item.id)
  // );
  // 使用 Set 提高查找效率
  const selectedSet = new Set(selectedKeys.value);
  return props.projectList.filter((item) => selectedSet.has(item.id));
});

// 临时选中的项目（显示在弹窗中）
const tempSelectedItems = computed(() => {
  return props.projectList.filter((item) =>
    tempSelectedKeys.value.includes(item.id),
  );
});

// 选择框中可见的项目（限制显示数量）
const visibleSelectedItems = computed(() => {
  return selectedItems.value.slice(0, props.maxShowTags);
});

// 所有项目的ID（用于全选）
const allProjectIds = computed(() => {
  return props.projectList.map((item) => item.id);
});

// 是否为半选状态
const isIndeterminate = computed(() => {
  if (tempSelectedKeys.value.length === 0) return false;
  if (tempSelectedKeys.value.length === allProjectIds.value.length)
    return false;
  return tempSelectedKeys.value.length > 0;
});

const treeProps = {
  value: "id",
  label: "projName",
  children: "children",
};

// 监听props变化
watch(
  () => props.modelValue,
  (newVal) => {
    selectedKeys.value = [...newVal];
  },
  {
    immediate: true,
    // deep: true,
  },
);

// 监听项目列表变化
watch(
  () => props.projectList,
  (newList) => {
    if (newList.length > 0) {
      nextTick(() => {
        if (treeRef.value) {
          treeRef.value.setCheckedKeys(tempSelectedKeys.value);
        }
      });
    }
  },
  // { deep: true }
);

// 监听临时选中项变化，更新全选状态
watch(
  () => tempSelectedKeys.value,
  (newVal) => {
    // 更新全选复选框状态
    if (newVal.length === 0) {
      isSelectAll.value = false;
    } else if (newVal.length === allProjectIds.value.length) {
      isSelectAll.value = true;
    } else {
      isSelectAll.value = false;
    }
  },
  {
    immediate: true,
    // deep: true,
  },
);

// 方法
const buildTree = (list: ProjectData[]): ProjectData[] => {
  if (!list || list.length === 0) return [];

  const map = new Map<number, ProjectData>();
  const roots: ProjectData[] = [];

  // 创建映射
  list.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  // 构建树
  list.forEach((item) => {
    const node = map.get(item.id);
    if (!node) return;

    if (item.pid === 0) {
      roots.push(node);
    } else {
      const parent = map.get(item.pid);
      if (parent) {
        parent.children!.push(node);
      } else {
        // 如果父节点不存在，作为根节点
        roots.push(node);
      }
    }
  });

  return roots;
};

const openDialog = () => {
  if (props.disabled) return;

  // 打开弹窗时，将当前已确认的选择复制到临时选择中
  tempSelectedKeys.value = [...selectedKeys.value];
  dialogVisible.value = true;

  nextTick(() => {
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(tempSelectedKeys.value);
    }
  });
};

const handleCheck = (data: ProjectData, checked: any) => {
  tempSelectedKeys.value = checked.checkedKeys || [];
};

const filterNode = (value: string, data: ProjectData) => {
  if (!value) return true;
  return data.projName.toLowerCase().includes(value.toLowerCase());
};

const handleFilter = debounce(() => {
  if (treeRef.value) {
    treeRef.value.filter(filterText.value);
  }
}, 1000);

const getProjectTypeText = (type: number): string => {
  const typeMap: Record<number, string> = {
    0: "住宅",
    1: "商业",
    2: "办公",
    3: "其他",
  };
  return typeMap[type] || "未知";
};

// 处理全选/全不选
const handleSelectAllChange = (checked: boolean) => {
  if (checked) {
    // 全选
    tempSelectedKeys.value = [...allProjectIds.value];
  } else {
    // 全不选
    tempSelectedKeys.value = [];
  }

  // 更新树的选择状态
  nextTick(() => {
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(tempSelectedKeys.value);
    }
  });
};

const removeItem = (index: number) => {
  // 这里移除已确认的选中项目
  if (index >= 0 && index < visibleSelectedItems.value.length) {
    const item = visibleSelectedItems.value[index];
    const keyIndex = selectedKeys.value.indexOf(item.id);
    if (keyIndex > -1) {
      selectedKeys.value.splice(keyIndex, 1);
      updateValue();
    }
  }
};

const removeTempItem = (id: number) => {
  // 这里移除临时选中的项目
  const index = tempSelectedKeys.value.indexOf(id);
  if (index > -1) {
    tempSelectedKeys.value.splice(index, 1);
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(tempSelectedKeys.value);
    }
  }
};

const clearAll = () => {
  tempSelectedKeys.value = [];
  if (treeRef.value) {
    treeRef.value.setCheckedKeys([]);
  }
};

const cancel = () => {
  dialogVisible.value = false;
};

const confirm = () => {
  // 必选验证
  if (tempSelectedKeys.value.length === 0) {
    ElMessage.warning("请至少选择一个项目");
    return;
  }
  // 点击确定时，将临时选择应用到已确认选择
  selectedKeys.value = [...tempSelectedKeys.value];
  updateValue();
  dialogVisible.value = false;
};

const handleDialogClosed = () => {
  // 弹窗关闭时重置搜索和全选状态
  filterText.value = "";

  // 重置树组件的过滤
  if (treeRef.value) {
    treeRef.value.filter("");
  }

  // 重置全选复选框状态为当前临时选择的状态
  if (tempSelectedKeys.value.length === allProjectIds.value.length) {
    isSelectAll.value = true;
  } else {
    isSelectAll.value = false;
  }
};

const updateValue = () => {
  emit("update:modelValue", [...selectedKeys.value]);
  emit("change", [...selectedKeys.value]);
};

// 暴露给父组件的方法
defineExpose({
  getSelectedItems: () => selectedItems.value, // 返回已确认的选中项目
  getSelectedKeys: () => [...selectedKeys.value],
  setSelectedKeys: (keys: number[]) => {
    selectedKeys.value = [...keys];
    updateValue();
  },
  clear: () => {
    selectedKeys.value = [];
    tempSelectedKeys.value = [];
    updateValue();
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
    padding: 4px 30px 4px 4px;
    height: 32px;
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
        line-height: 22px;
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
      border-radius: 2px 2px;
      padding: 0 4px;
      box-sizing: border-box;
    }
  }
}

// 对话框样式
.dialog-content {
  display: flex;
  flex-direction: column;
  height: 500px;
  .dialog-header {
    margin-bottom: 8px;
    .selection-info {
      margin-top: 8px;
      color: var(--el-text-color-regular);
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
  .tree-container {
    flex: 1;
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
    overflow: auto;
    padding: 12px 12px 12px 0;
    :deep(.el-tree) {
      .tree-node {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex: 1;

        .type-tag {
          margin-left: 8px;
        }
      }
    }
  }
  .dialog-footer {
    margin-top: 16px;
    .selected-preview {
      margin-bottom: 16px;
      max-height: 120px;
      overflow-y: auto;
      padding: 8px;
      border: 1px solid var(--el-border-color-light);
      border-radius: var(--el-border-radius-base);
      background-color: var(--el-fill-color-lighter);
      & > span:first-child {
        display: block;
        //   margin-bottom: 8px;
        color: var(--el-text-color-regular);
        font-weight: 500;
      }
      .preview-tag {
        margin: 2px 4px 2px 0;
      }
    }
    .footer-actions {
      text-align: right;
    }
  }
}
// 滚动条样式
.tree-container,
.selected-preview {
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
