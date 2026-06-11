<!-- 新增/编辑 数据字典组弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="dialogTitle"
    width="500px"
    :confirm-loading="submitLoading"
    @confirm="handleSubmit"
    @cancel="handleClose"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="90px"
      label-position="right"
    >
      <!-- 上级分组 -->
      <el-form-item prop="pid" label="上级分组">
        <template v-if="isParentSelectDisabled">
          <el-input v-model="parentGroupLabel" disabled style="width: 100%" />
          <input type="hidden" :value="formData.pid" />
        </template>
        <template v-else>
          <el-tree-select
            v-model="formData.pid"
            :data="parentGroupOptions"
            :props="treeSelectProps"
            :check-strictly="true"
            placeholder="请选择上级分组"
            :clearable="false"
            :filterable="false"
            style="width: 100%"
          />
        </template>
      </el-form-item>

      <!-- 分组编码 -->
      <el-form-item prop="groupCode" label="分组编码" required>
        <el-input
          v-model="formData.groupCode"
          placeholder="请输入分组编码，如：sys_user"
          clearable
          maxlength="50"
          show-word-limit
        />
        <div class="form-tip">建议使用英文小写+下划线命名</div>
      </el-form-item>

      <!-- 分组名称 -->
      <el-form-item prop="groupName" label="分组名称" required>
        <el-input
          v-model="formData.groupName"
          placeholder="请输入分组名称，如：系统用户"
          clearable
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <!-- 分组说明 -->
      <el-form-item prop="groupDesc" label="分组说明">
        <el-input
          v-model="formData.groupDesc"
          type="textarea"
          placeholder="请输入分组说明"
          :rows="3"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 是否启用 -->
      <el-form-item prop="isEnabled" label="是否启用">
        <el-radio-group v-model="formData.isEnabled">
          <el-radio :value="true">启用</el-radio>
          <el-radio :value="false">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import type { DictGroup, DictGroupTreeNode } from "@/types/cost/master-data/dict-type";

// Props
interface Props {
  modelValue: boolean;
  editData?: DictGroup | null;
  currentGroupId?: number | null;
  groupTreeData?: DictGroupTreeNode[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  editData: null,
  currentGroupId: null,
  groupTreeData: () => [],
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

// 树形选择器配置
const treeSelectProps = {
  children: "children",
  label: "groupName",
  value: "id",
};

// 是否为编辑模式
const isEditMode = computed(() => !!props.editData?.id);
// 新增时，新增顶级/新增子分组均禁用；编辑模式允许修改
const isParentSelectDisabled = computed(() => !isEditMode.value);
// 弹窗标题
const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑字典分组" : "新增字典分组";
});

// 表单数据
const formData = ref({
  id: undefined as number | undefined,
  pid: 0,
  groupCode: "",
  groupName: "",
  groupDesc: "",
  isEnabled: true,
});

// 上级分组显示文本
const parentGroupLabel = computed(() => {
  if (formData.value.pid === 0) {
    return "根目录";
  }
  const parent = findNodeById(props.groupTreeData, formData.value.pid);
  return parent ? `${parent.groupName}（${parent.id}）` : "根目录";
});

// 上级分组选项（编辑时排除自身）
const parentGroupOptions = computed(() => {
  let options = [];
  // 添加根目录选项
  const rootOption = {
    id: 0,
    groupName: "根目录",
    pid: 0,
    children: Array.isArray(props.groupTreeData) ? props.groupTreeData : [],
  };
  // 如果是编辑模式且存在当前ID
  if (isEditMode.value && formData.value.id) {
    const filteredTree = filterExcludeNode(
      Array.isArray(props.groupTreeData) ? props.groupTreeData : [],
      formData.value.id,
    );
    options = [{ ...rootOption, children: filteredTree }];
  } else {
    // 非编辑模式或没有当前ID
    options = [rootOption];
  }
  return options;
});
// 递归过滤掉指定节点
const filterExcludeNode = (tree: DictGroupTreeNode[], excludeId: number): DictGroupTreeNode[] => {
  // 确保 tree 是数组
  if (!Array.isArray(tree)) return [];
  
  return tree
    .filter(node => node && node.id !== excludeId)
    .map(node => ({
      ...node,
      children: node.children && Array.isArray(node.children) 
        ? filterExcludeNode(node.children, excludeId) 
        : []
    }));
};

// 查找节点（用于显示父级名称）
const findNodeById = (tree: DictGroupTreeNode[], id: number): DictGroupTreeNode | null => {
  if (!Array.isArray(tree)) return null;
  
  for (const node of tree) {
    if (node && node.id === id) {
      return node;
    }
    if (node.children && Array.isArray(node.children) && node.children.length) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};
const validateDicCode = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error("请输入分组编码"));
  } else if (!/^[A-Za-z][A-Za-z0-9_]*$/i.test(value)) {
    callback(new Error("分组编码只能包含字母、数字和下划线，且必须以字母开头"));
  } else {
    callback();
  }
};
// 表单验证规则
const formRules: FormRules = {
  groupCode: [
    { required: true, message: "请输入分组编码", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
    { validator: validateDicCode, trigger: ["blur", "change"] },
  ],
  groupName: [
    { required: true, message: "请输入分组名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
};

// 监听 modelValue
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      if (isEditMode.value && props.editData) {
        // 编辑：回填数据
        formData.value = {
          id: props.editData.id,
          pid: props.editData.pid || 0,
          groupCode: props.editData.groupCode || "",
          groupName: props.editData.groupName || "",
          groupDesc: props.editData.groupDesc || "",
          isEnabled: props.editData.isEnabled ?? true,
        };
      } else {
        // 新增：使用传入的父分组ID（新增顶级/新增子分组）
        formData.value = {
          id: undefined,
          pid: props.currentGroupId ?? 0,
          groupCode: "",
          groupName: "",
          groupDesc: "",
          isEnabled: true,
        };
        formRef.value?.resetFields();
      }
    }
  },
);
watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
// 关闭
const handleClose = () => {
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
  dialogVisible.value = false;
};

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const submitData = { ...formData.value };
    let res;

    if (isEditMode.value) {
      res = await dictionaryApi.editDictM(submitData);
    } else {
      res = await dictionaryApi.addDictM(submitData);
    }

    if (res.code === 200) {
      ElMessage.success(isEditMode.value ? "修改成功" : "新增成功");
      emit("success");
      handleClose();
    } else {
      ElMessage.error(res.msg || "操作失败");
    }
  } finally {
    submitLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}
:deep(.el-tree-select) {
  .el-input {
    width: 100%;
  }
}

:deep(.el-textarea__inner) {
  resize: none;
}
</style>
