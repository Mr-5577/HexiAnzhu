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
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <!-- 上级菜单 -->
      <el-form-item label="上级菜单" prop="pid">
        <el-tree-select
          v-model="form.pid"
          :data="menuTreeOptions"
          :props="treeProps"
          check-strictly
          placeholder="请选择上级菜单"
          clearable
          style="width: 100%"
        />
      </el-form-item>

      <!-- 菜单类型 -->
      <el-form-item label="菜单类型" prop="menuType">
        <el-radio-group v-model="form.menuType" @change="handleMenuTypeChange">
          <el-radio :value="0">菜单</el-radio>
          <el-radio :value="1">按钮</el-radio>
          <el-radio :value="2">权限按钮</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-row style="margin-bottom: 18px;">
        <el-col :span="12">
          <!-- 图标 -->
          <el-form-item v-if="showIconField" label="菜单图标" prop="icon">
            <el-popover placement="bottom-start" width="500" trigger="click">
              <template #reference>
                <el-input
                  v-model="form.icon"
                  placeholder="请选择图标"
                  readonly
                  clearable
                >
                  <template #prepend>
                    <el-icon v-if="form.icon">
                      <component :is="form.icon" />
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
              v-model="form.sort"
              :min="1"
              :max="999"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 菜单名称 -->
      <el-form-item label="菜单名称" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入菜单显示名称"
          clearable
        />
      </el-form-item>

      <!-- 菜单标识 -->
      <el-form-item label="菜单标识" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入菜单唯一标识（英文）"
          clearable
        />
      </el-form-item>

      <!-- 组件路径 -->
      <el-form-item v-if="showComponentField" label="组件路径" prop="component">
        <el-input
          v-model="form.component"
          placeholder="请输入组件路径，如：home/index"
          clearable
        />
      </el-form-item>

      <!-- 路由路径 -->
      <el-form-item v-if="showPathField" label="路由路径" prop="path">
        <el-input v-model="form.path" placeholder="请输入路由路径" clearable />
      </el-form-item>

      <el-row style="margin-bottom: 18px;">
        <el-col :span="12">
          <!-- 菜单状态 -->
          <el-form-item
            v-if="showControlField"
            label="菜单状态"
            prop="isControl"
          >
            <el-switch
              v-model="form.isControl"
              active-text="启用"
              inactive-text="停用"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 可见性 -->
          <el-form-item
            v-if="showVisibleField"
            label="是否可见"
            prop="isVisible"
          >
            <el-switch
              v-model="form.isVisible"
              active-text="显示"
              inactive-text="隐藏"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <!-- 缓存 -->
          <el-form-item
            v-if="showKeepAliveField"
            label="页面缓存"
            prop="isKeepAlive"
          >
            <el-switch
              v-model="form.isKeepAlive"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 多开 -->
          <el-form-item
            v-if="showMuitlOpenField"
            label="支持多开"
            prop="isMuitlOpen"
          >
            <el-switch
              v-model="form.isMuitlOpen"
              active-text="开启"
              inactive-text="关闭"
            /> </el-form-item
        ></el-col>
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

// Props
interface Props {
  visible?: boolean;
  title?: string;
  formData: Partial<MenuForm>;
  menuTree: MenuItem[];
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
// 表单引用
const formRef = ref<FormInstance>();

// 表单数据
const form = reactive<MenuForm>({
  pid: 0,
  name: "",
  title: "",
  icon: "",
  menuType: 0,
  component: "",
  path: "",
  isKeepAlive: false,
  isMuitlOpen: false,
  isControl: true,
  isVisible: true,
  sort: 99,
});

// 计算属性
const dialogTitle = computed(() => {
  return props.formData.id ? "编辑菜单" : props.title;
});

const showIconField = computed(() => {
  return form.menuType !== 2; // 权限按钮不显示图标
});

const showComponentField = computed(() => {
  return form.menuType === 0 || form.menuType === 1; // 菜单和按钮显示组件路径
});

const showPathField = computed(() => {
  return form.menuType === 1; // 只有按钮需要路由路径
});

const showControlField = computed(() => {
  return form.menuType === 0 || form.menuType === 1; // 菜单和按钮显示权限控制
});

const showVisibleField = computed(() => {
  return form.menuType === 0 || form.menuType === 1; // 菜单和按钮显示可见性
});

const showKeepAliveField = computed(() => {
  return form.menuType === 1; // 只有按钮页面需要缓存
});

const showMuitlOpenField = computed(() => {
  return form.menuType === 1; // 只有按钮页面支持多开
});

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
    isKeepAlive: false,
    isMuitlOpen: false,
    isControl: true,
    isVisible: true,
    sort: 0,
    isDel: false,
    createId: 0,
  };
  return [rootNode, ...props.menuTree];
});

// 树形配置
const treeProps = {
  label: "title",
  value: "id",
  children: "children",
  disabled: (data: MenuItem) => {
    // 不能选择自己作为父级
    return data.id === form.id;
  },
};

// 表单验证规则
const rules = reactive<FormRules<MenuForm>>({
  pid: [{ required: true, message: "请选择上级菜单", trigger: "blur" }],
  menuType: [{ required: true, message: "请选择菜单类型", trigger: "blur" }],
  title: [
    { required: true, message: "请输入菜单名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  name: [
    { required: true, message: "请输入菜单标识", trigger: "blur" },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9-_:]*$/,
      message: "只能包含字母、数字、-、_、:",
      trigger: "blur",
    },
  ],
  icon: [
    { required: showIconField.value, message: "请选择图标", trigger: "blur" },
  ],
  component: [
    {
      required: showComponentField.value,
      message: "请输入组件路径",
      trigger: "blur",
    },
  ],
  path: [
    {
      required: showPathField.value,
      message: "请输入路由路径",
      trigger: "blur",
    },
  ],
  sort: [{ required: true, message: "请输入排序号", trigger: "blur" }],
});

const resetForm = () => {
  // 重置表单到初始状态
  Object.assign(form, {
    pid: 0,
    name: "",
    title: "",
    icon: "",
    menuType: 0,
    component: "",
    path: "",
    isKeepAlive: false,
    isMuitlOpen: false,
    isControl: true,
    isVisible: true,
    sort: 1,
  });
  // 清除验证状态
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

const initForm = () => {
  resetForm();

  // 如果有传入的formData，则使用传入的数据
  if (props.formData && Object.keys(props.formData).length > 0) {
    Object.assign(form, {
      pid: props.formData.pid || 0,
      name: props.formData.name || "",
      title: props.formData.title || "",
      icon: props.formData.icon || "",
      menuType: props.formData.menuType || 0,
      component: props.formData.component || "",
      path: props.formData.path || "",
      isKeepAlive: props.formData.isKeepAlive || false,
      isMuitlOpen: props.formData.isMuitlOpen || false,
      isControl:
        props.formData.isControl !== undefined
          ? props.formData.isControl
          : true,
      isVisible:
        props.formData.isVisible !== undefined
          ? props.formData.isVisible
          : true,
      sort: props.formData.sort || 1,
    });
  }
};

const handleClose = () => {
  resetForm();
  emit("update:visible", false);
  emit("close");
};

const handleSubmit = async () => {
  confirmLoading.value = true;
  try {
    const valid = await formRef.value?.validate();
    if (!valid) return;

    // 根据菜单类型处理字段
    const submitData: MenuForm = {
      ...form,
      // 权限按钮不需要图标、组件路径、路由路径等
      icon: form.menuType === 2 ? "" : form.icon,
      component: form.menuType === 2 ? "" : form.component,
      path: form.menuType === 2 ? "" : form.path,
      isKeepAlive: form.menuType === 1 ? form.isKeepAlive : false,
      isMuitlOpen: form.menuType === 1 ? form.isMuitlOpen : false,
      isVisible: form.menuType === 2 ? false : form.isVisible,
    };

    emit("submit", submitData);

    // 提交成功后关闭弹窗
    handleClose();
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    confirmLoading.value = false;
  }
};

const handleMenuTypeChange = (value: number) => {
  // 清空相关字段
  if (value === 2) {
    form.icon = "";
    form.component = "";
    form.path = "";
    form.isKeepAlive = false;
    form.isMuitlOpen = false;
    form.isVisible = false;
  }
};

const handleIconSelected = (iconName: string) => {
  form.icon = iconName;
};

// 监听visible变化，当显示时初始化表单
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      initForm();
    }
  }
);

// 监听formData变化，当有编辑数据时更新表单
watch(
  () => props.formData,
  (newVal) => {
    if (props.visible && newVal) {
      initForm();
    }
  },
  { deep: true }
);
</script>

<style scoped>
.el-form-item:last-child {
  margin-bottom: 0;
}
</style>
