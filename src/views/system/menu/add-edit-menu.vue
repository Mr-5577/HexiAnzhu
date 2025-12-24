<template>
  <base-modal
    v-model="modalVisible"
    :title="dialogTitle"
    width="700px"
    :confirm-loading="confirmLoading"
    @confirm="handleSubmit"
    @cancel="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <!-- 上级菜单 - 根据对话框类型动态处理 -->
      <el-form-item v-if="!isAddChildType" label="上级菜单" prop="pid">
        <el-tree-select
          v-model="formData.pid"
          :data="menuTreeOptions"
          :props="treeProps"
          :filterable="true"
          check-strictly
          placeholder="请选择上级菜单"
          clearable
          style="width: 100%"
          :disabled="isRootLevel"
          :default-expanded-keys="defaultExpandedKeys"
        />
      </el-form-item>

      <!-- 新增子级时显示固定父级信息 -->
      <el-form-item v-else label="上级菜单">
        <el-tag type="info">{{ parentMenuTitle }}</el-tag>
      </el-form-item>

      <!-- 菜单类型 -->
      <el-form-item label="菜单类型" prop="menuType">
        <el-radio-group
          v-model="formData.menuType"
          @change="handleMenuTypeChange"
        >
          <el-radio
            :value="0"
            :disabled="(isEditing && formData.menuType !== 0) || isAddChildType"
          >
            模块
          </el-radio>
          <el-radio :value="1" :disabled="isEditing && formData.menuType !== 1">
            菜单
          </el-radio>
          <el-radio :value="2" :disabled="isEditing && formData.menuType !== 2">
            按钮
          </el-radio>
        </el-radio-group>
        <!-- <div v-if="isAddChildType" class="form-tip">
          根据父级菜单类型自动限制可选的子级类型
        </div> -->
      </el-form-item>

      <el-row style="margin-bottom: 18px">
        <el-col :span="12" v-if="showIconField">
          <!-- 图标 -->
          <el-form-item label="菜单图标" prop="icon">
            <el-popover placement="bottom-start" width="500" trigger="click">
              <template #reference>
                <el-input
                  v-model="formData.icon"
                  placeholder="请选择图标"
                  readonly
                  clearable
                >
                  <template #prepend>
                    <el-icon v-if="formData.icon">
                      <component :is="formData.icon" />
                    </el-icon>
                    <el-icon v-else>
                      <Search />
                    </el-icon>
                  </template>
                </el-input>
              </template>
              <IconSelector @selected="handleIconSelected" />
            </el-popover>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 排序 -->
          <el-form-item label="排序" prop="sort">
            <el-input-number
              v-model="formData.sort"
              :min="1"
              :max="999"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 菜单标题 -->
      <el-form-item label="菜单标题" prop="title">
        <el-input
          v-model="formData.title"
          :placeholder="titlePlaceholder"
          clearable
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <!-- 菜单标识 -->
      <el-form-item label="菜单标识" prop="name">
        <el-input
          v-model="formData.name"
          :placeholder="namePlaceholder"
          clearable
          :disabled="isEditing"
        />
        <!-- <div class="form-tip">{{ nameTip }}</div> -->
      </el-form-item>

      <!-- 组件路径 -->
      <el-form-item v-if="showComponentField" label="组件路径" prop="component">
        <el-input
          v-model="formData.component"
          :placeholder="componentPlaceholder"
          clearable
        />
        <!-- <div class="form-tip" v-if="formData.menuType === 1">
          相对于src/views目录，如：home/index 对应 src/views/home/index.vue
        </div> -->
      </el-form-item>

      <!-- 路由路径 -->
      <el-form-item v-if="showPathField" label="路由路径" prop="path">
        <el-input
          v-model="formData.path"
          placeholder="请输入路由路径"
          clearable
        />
        <!-- <div class="form-tip">
          用于页面访问的路由地址，建议使用小写字母和连字符
        </div> -->
      </el-form-item>

      <el-row v-if="showControlFields">
        <el-col :span="12">
          <!-- 是否受控 -->
          <el-form-item label="权限控制" prop="isControl">
            <el-switch
              v-model="formData.isControl"
              active-text=""
              inactive-text=""
              :active-value="true"
              :inactive-value="false"
            />
            <!-- <div class="form-tip">开启后需要权限才能访问</div> -->
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 是否可见 -->
          <el-form-item label="是否可见" prop="isVisible">
            <el-switch
              v-model="formData.isVisible"
              active-text=""
              inactive-text=""
              :active-value="true"
              :inactive-value="false"
            />
            <!-- <div class="form-tip">控制菜单是否显示</div> -->
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="showPageConfigFields">
        <el-col :span="12">
          <!-- 页面缓存 -->
          <el-form-item label="页面缓存" prop="isKeepAlive">
            <el-switch
              v-model="formData.isKeepAlive"
              active-text=""
              inactive-text=""
              :active-value="true"
              :inactive-value="false"
            />
            <!-- <div class="form-tip">开启后切换页面会保留状态</div> -->
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 支持多开 -->
          <el-form-item label="支持多开" prop="isMultiOpen">
            <el-switch
              v-model="formData.isMultiOpen"
              active-text=""
              inactive-text=""
              :active-value="true"
              :inactive-value="false"
            />
            <!-- <div class="form-tip">开启后可以打开多个标签页</div> -->
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, nextTick } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import IconSelector from "./icon-selector.vue";
import BaseModal from "@/components/base-modal.vue";
import type { MenuItem, MenuForm } from "@/types/menu-type";
import { menuApi } from "@/api/menu-api";

// Props
interface Props {
  visible?: boolean;
  title?: string;
  currentData: Partial<MenuForm>;
  menuTree: MenuItem[];
  dialogType?: "add-root" | "add-child" | "edit";
}
const props = defineProps<Props>();

// 弹窗显示控制
const modalVisible = ref(props.visible);
watch(modalVisible, (val) => {
  emit("update:visible", val);
});

// Emits
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "submit", value: MenuForm): void;
  (e: "close"): void;
}>();

const confirmLoading = ref(false);
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive<MenuForm>({
  pid: 0,
  name: "",
  title: "",
  icon: "",
  menuType: 0,
  component: "",
  path: "",
  isKeepAlive: false,
  isMultiOpen: false,
  isControl: true,
  isVisible: true,
  sort: 99,
});

// 当前编辑的菜单ID
const currentMenuId = ref<number>();
// 父级菜单信息（新增子级时使用）
const parentMenuInfo = ref<MenuItem | null>(null);

// 计算属性
const isEditing = computed(() => {
  return props.dialogType === "edit" || !!currentMenuId.value;
});
const isAddChildType = computed(() => {
  return props.dialogType === "add-child";
});
const isAddRootType = computed(() => {
  return props.dialogType === "add-root";
});
const dialogTitle = computed(() => {
  if (props.dialogType === "add-child") return "新增子菜单";
  return props.title || (isEditing.value ? "编辑菜单" : "新增菜单");
});
const parentMenuTitle = computed(() => {
  if (parentMenuInfo.value) {
    return parentMenuInfo.value.title;
  }
  return "";
});
const titlePlaceholder = computed(() => {
  switch (formData.menuType) {
    case 0:
      return "请输入模块名称，如：大屏分析";
    case 1:
      return "请输入菜单名称，如：首页";
    case 2:
      return "请输入按钮名称，如：新增";
    default:
      return "请输入名称";
  }
});
const namePlaceholder = computed(() => {
  switch (formData.menuType) {
    case 0:
      return "请输入模块标识，如：dashboard-analysis";
    case 1:
      return "请输入菜单标识，如：home";
    case 2:
      return "请输入按钮标识，如：menuList:add";
    default:
      return "请输入标识";
  }
});
const nameTip = computed(() => {
  switch (formData.menuType) {
    case 2:
      return "按钮标识格式为：功能:操作，如：menuList:add";
    default:
      return "系统内唯一标识，建议使用小写字母和连字符";
  }
});
const componentPlaceholder = computed(() => {
  return formData.menuType === 1 ? "请输入组件路径，如：home/index" : "";
});
// 根据菜单类型显示不同的字段
const showIconField = computed(() => {
  return formData.menuType !== 2; // 按钮不显示图标
});
const showComponentField = computed(() => {
  return formData.menuType === 1; // 只有菜单页面需要组件路径
});
const showPathField = computed(() => {
  return formData.menuType === 1; // 只有菜单页面需要路由路径
});
const showControlFields = computed(() => {
  return formData.menuType !== 2; // 按钮不需要权限控制和可见性设置
});
const showPageConfigFields = computed(() => {
  return formData.menuType === 1; // 只有菜单页面需要缓存和多开配置
});
// 判断是否为根级别（不能选择上级菜单）
const isRootLevel = computed(() => {
  if (isAddChildType.value) return true; // 新增子级时父级已固定
  return formData.menuType === 0; // 模块的父级只能是根目录
});
// 查找菜单
const findMenuById = (id: number, menus: MenuItem[]): MenuItem | null => {
  for (const menu of menus) {
    if (menu.id === id) return menu;
    if (menu.children && menu.children.length > 0) {
      const found = findMenuById(id, menu.children);
      if (found) return found;
    }
  }
  return null;
};
// 菜单树选项
const menuTreeOptions = computed(() => {
  const rootNode: MenuItem = {
    id: 0,
    pid: -1,
    name: "root",
    title: "根目录",
    icon: "",
    menuType: 0,
    component: "",
    path: "",
    isInner: false,
    isKeepAlive: false,
    isMultiOpen: false,
    isControl: true,
    isVisible: true,
    sort: 0,
    isDel: false,
    createId: 0,
  };
  // 创建一个新数组，只包含符合条件的节点
  const createFilteredTree = (
    menus: MenuItem[],
    excludeId?: number
  ): MenuItem[] => {
    const result: MenuItem[] = [];
    for (const menu of menus) {
      // 排除按钮（按钮不能作为父级）
      if (menu.menuType === 2) continue;

      // 排除自身（编辑时）
      // if (excludeId && menu.id === excludeId) continue;

      // 创建新节点对象
      const newNode: MenuItem = {
        id: menu.id,
        pid: menu.pid,
        name: menu.name,
        title: menu.title,
        icon: menu.icon,
        menuType: menu.menuType,
        component: menu.component,
        path: menu.path,
        isInner: menu.isInner,
        isKeepAlive: menu.isKeepAlive,
        isMultiOpen: menu.isMultiOpen,
        isControl: menu.isControl,
        isVisible: menu.isVisible,
        sort: menu.sort,
        isDel: menu.isDel,
        createId: menu.createId,
      };
      // 递归处理子节点
      if (menu.children && menu.children.length > 0) {
        newNode.children = createFilteredTree(menu.children, excludeId);
      }
      result.push(newNode);
    }
    return result;
  };
  return [rootNode, ...createFilteredTree(props.menuTree, currentMenuId.value)];
});

// 默认展开的节点
const defaultExpandedKeys = computed(() => {
  const keys: number[] = [];
  if (formData.pid && formData.pid !== 0) {
    keys.push(formData.pid);
  }
  return keys;
});

// 树形配置
const treeProps = {
  label: "title",
  value: "id",
  children: "children",
  disabled: (data: MenuItem) => {
    // 不能选择自己作为父级
    if (data.id === currentMenuId.value) return true;

    // 新增子级时禁用所有选择
    if (isAddChildType.value) return true;
    
    // 根据当前菜单类型限制父级选择
    if (formData.menuType === 0) {
      // 模块的父级只能是根目录
      return data.id !== 0;
    } else if (formData.menuType === 1) {
      // 菜单的父级只能是模块
      // return data.menuType !== 0;
    } else if (formData.menuType === 2) {
      // 按钮的父级只能是菜单
      return data.menuType !== 1;
    }

    return false;
  },
};

// 表单验证规则
const rules = reactive<FormRules<MenuForm>>({
  pid: [
    {
      required: !isAddChildType.value, // 新增子级时不验证pid
      message: "请选择上级菜单",
      trigger: "blur",
    },
    {
      validator: (rule, value, callback) => {
        // 模块的pid必须是0
        if (formData.menuType === 0 && value !== 0) {
          callback(new Error("模块的上级菜单必须是根目录"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  menuType: [
    {
      required: true,
      message: "请选择菜单类型",
      trigger: "blur",
    },
    {
      validator: (rule, value, callback) => {
        // 新增子级时验证菜单类型是否匹配父级
        if (isAddChildType.value && parentMenuInfo.value) {
          if (parentMenuInfo.value.menuType === 0 && value !== 1) {
            callback(new Error("模块的子级必须是菜单类型"));
            return;
          }
          // if (parentMenuInfo.value.menuType === 1 && value !== 2) {
          //   callback(new Error("菜单的子级必须是按钮类型"));
          //   return;
          // }
        }
        callback();
      },
      trigger: "change",
    },
  ],
  title: [
    {
      required: true,
      message: "请输入菜单标题",
      trigger: "blur",
    },
    {
      min: 2,
      max: 20,
      message: "长度在 2 到 20 个字符",
      trigger: "blur",
    },
  ],
  name: [
    {
      required: true,
      message: "请输入菜单标识",
      trigger: "blur",
    },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error("请输入菜单标识"));
          return;
        }

        // 根据菜单类型使用不同的正则表达式
        let pattern: RegExp;
        let errorMessage: string;

        if (formData.menuType === 2) {
          // 按钮标识：允许字母、数字、冒号、下划线
          pattern = /^[a-zA-Z][a-zA-Z0-9:_]*$/;
          errorMessage =
            "按钮标识格式为：功能:操作，只能包含字母、数字、冒号和下划线";
        } else {
          // 模块和菜单标识：允许小写字母、数字、连字符
          pattern = /^[a-z][a-z0-9-]*$/;
          errorMessage = "只能包含小写字母、数字和连字符(-)，且不能以数字开头";
        }

        if (!pattern.test(value)) {
          callback(new Error(errorMessage));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  component: [
    {
      validator: (rule, value, callback) => {
        if (formData.menuType === 1 && !value?.trim()) {
          callback(new Error("菜单必须填写组件路径"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  path: [
    {
      validator: (rule, value, callback) => {
        if (formData.menuType === 1 && !value?.trim()) {
          callback(new Error("菜单必须填写路由路径"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  sort: [
    {
      required: true,
      message: "请输入排序号",
      trigger: "blur",
    },
  ],
});

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    pid: 0,
    name: "",
    title: "",
    icon: "",
    menuType: 0,
    component: "",
    path: "",
    isKeepAlive: false,
    isMultiOpen: false,
    isControl: true,
    isVisible: true,
    sort: 99,
  });
  currentMenuId.value = undefined;
  parentMenuInfo.value = null;

  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

// 初始化表单
const initForm = () => {
  resetForm();

  if (props.currentData && Object.keys(props.currentData).length > 0) {
    const data = props.currentData;
    currentMenuId.value = data.id;

    // 赋值所有字段
    Object.assign(formData, {
      pid: data.pid || 0,
      name: data.name || "",
      title: data.title || "",
      icon: data.icon || "",
      menuType: data.menuType || 0,
      component: data.component || "",
      path: data.path || "",
      isKeepAlive: data.isKeepAlive || false,
      isMultiOpen: data.isMultiOpen || false,
      isControl: data.isControl !== undefined ? data.isControl : true,
      isVisible: data.isVisible !== undefined ? data.isVisible : true,
      sort: data.sort || 99,
    });

    // 如果是新增子级，查找父级信息
    if (isAddChildType.value && data.pid) {
      parentMenuInfo.value = findMenuById(data.pid, props.menuTree);
      // 根据父级类型设置子级的默认菜单类型
      if (parentMenuInfo.value) {
        if (parentMenuInfo.value.menuType === 0) {
          formData.menuType = 1; // 模块的子级是菜单
        } else if (parentMenuInfo.value.menuType === 1) {
          formData.menuType = 2; // 菜单的子级是按钮
        }
      }
    }
  } else {
    // 新增根级菜单
    if (isAddRootType.value) {
      formData.pid = 0;
      formData.menuType = 0;
      formData.isVisible = true;
      formData.isControl = true;
    }
  }
};

// 关闭弹窗
const handleClose = () => {
  resetForm();
  modalVisible.value = false;
  emit("close");
};

// 提交表单
const handleSubmit = async () => {
  confirmLoading.value = true;
  try {
    const valid = await formRef.value?.validate();
    if (!valid) return;

    // 根据菜单类型处理字段
    const submitData: MenuForm = {
      ...formData,
      // 清理不需要的字段
      icon: formData.menuType === 2 ? "" : formData.icon,
      component: formData.menuType === 1 ? formData.component : "",
      path: formData.menuType === 1 ? formData.path : "",
      isKeepAlive: formData.menuType === 1 ? formData.isKeepAlive : false,
      isMultiOpen: formData.menuType === 1 ? formData.isMultiOpen : false,
      isVisible: formData.menuType === 2 ? false : formData.isVisible,
      isControl: formData.menuType === 2 ? true : formData.isControl,
    };

    // 如果是编辑，保留ID
    if (currentMenuId.value) {
      (submitData as any).id = currentMenuId.value;
    }
    console.log("submitData", submitData);
    console.log("props.dialogType", props.dialogType);
    const interfaceApi =
      props.dialogType === "edit" ? menuApi.editMenu : menuApi.addMenu;
    const res = await interfaceApi(submitData);
    if (res.code === 200) {
      emit("submit", submitData);
      // 提交成功后关闭弹窗
      handleClose();
    }
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    confirmLoading.value = false;
  }
};

// 菜单类型改变时的处理
const handleMenuTypeChange = (value: number) => {

  // 根据菜单类型重置相关字段
  if (value === 0) {
    // 模块：清空组件和路径，父级只能是根目录
    formData.component = "";
    formData.path = "";
    formData.isKeepAlive = false;
    formData.isMultiOpen = false;
    if (!isAddChildType.value) {
      formData.pid = 0;
    }
    formData.isVisible = true;
    formData.isControl = true;
  } else if (value === 1) {
    // 菜单：设置默认可见性和控制
    formData.isVisible = true;
    formData.isControl = true;
    // 如果不是新增子级且当前pid是0，尝试选择一个模块作为父级
    if (
      !isAddChildType.value &&
      formData.pid === 0 &&
      props.menuTree.length > 0
    ) {
      const firstModule = props.menuTree.find((item) => item.menuType === 0);
      if (firstModule) {
        formData.pid = firstModule.id;
      }
    }
  } else if (value === 2) {
    // 按钮：清空图标、组件、路径等，不可见
    formData.icon = "";
    formData.component = "";
    formData.path = "";
    formData.isKeepAlive = false;
    formData.isMultiOpen = false;
    formData.isVisible = false;
    formData.isControl = true;
    // 如果不是新增子级且当前pid是0，尝试选择一个菜单作为父级
    if (
      !isAddChildType.value &&
      formData.pid === 0 &&
      props.menuTree.length > 0
    ) {
      const findFirstMenu = (menus: MenuItem[]): MenuItem | null => {
        for (const menu of menus) {
          if (menu.menuType === 1) return menu;
          if (menu.children && menu.children.length > 0) {
            const found = findFirstMenu(menu.children);
            if (found) return found;
          }
        }
        return null;
      };
      const firstMenu = findFirstMenu(props.menuTree);
      if (firstMenu) {
        formData.pid = firstMenu.id;
      }
    }
  }
  // 清除验证错误
  formRef.value?.clearValidate();
  // // 重新验证表单
  // setTimeout(() => {
  //   formRef.value?.validate();
  // }, 50);
};

// 图标选择
const handleIconSelected = (iconName: string) => {
  formData.icon = iconName;
};

// 监听visible变化
watch(
  () => props.visible,
  (newVal) => {
    modalVisible.value = newVal;
    if (newVal) {
      initForm();
    }
  },
  { immediate: true }
);

// 监听currentData变化
watch(
  () => props.currentData,
  (newVal) => {
    if (newVal) {
      initForm();
    }
  },
  { deep: true }
);

// 监听dialogType变化
watch(
  () => props.dialogType,
  () => {
    if (modalVisible.value) {
      initForm();
    }
  }
);
</script>

<style scoped>
.el-form-item:last-child {
  margin-bottom: 0;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.parent-info {
  padding: 8px 0;
}
</style>
