<!-- 成本科目 新增/编辑弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :confirm-loading="submitLoading"
    @confirm="handleSubmit"
    @cancel="handleClose"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <!-- 所属父级 -->
      <el-form-item prop="pid" label="所属父级">
        <template v-if="isParentSelectDisabled">
          <el-input v-model="parentLabel" disabled style="width: 100%" />
          <input type="hidden" :value="formData.pid" />
        </template>
        <template v-else>
          <el-tree-select
            v-model="formData.pid"
            :data="parentOptions"
            :props="treeSelectProps"
            :check-strictly="true"
            placeholder="请选择父级成本科目"
            :clearable="false"
            style="width: 100%"
          />
        </template>
      </el-form-item>

      <!-- 编号 -->
      <el-form-item prop="subCode" label="科目编号" required>
        <el-input
          v-model="formData.subCode"
          placeholder="请输入科目编号"
          clearable
          maxlength="50"
          show-word-limit
        />
        <div class="form-tip">只能输入英文、数字和下划线_，如：CODE_001</div>
      </el-form-item>

      <!-- 名称 -->
      <el-form-item prop="subName" label="科目名称" required>
        <el-input
          v-model="formData.subName"
          placeholder="请输入科目名称"
          clearable
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <!-- 层级 -->
      <el-form-item prop="subLevel" label="层级" required>
        <el-input-number
          v-model="formData.subLevel"
          :min="1"
          :max="10"
          controls-position="right"
          placeholder="请输入层级"
          style="width: 100%"
        />
      </el-form-item>
      <!-- 管控方式 -->
      <el-form-item prop="subLevel" label="管控方式" required>
        <el-select
          v-model="formData.ctrlMode"
          placeholder="请选择管控方式"
          style="width: 100%"
        >
          <el-option
            v-for="item in modeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 说明 -->
      <el-form-item prop="remark" label="说明">
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入说明"
          :rows="3"
          maxlength="500"
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
import BaseModal from "@/components/base/base-modal.vue";
import type {
  CostCategoryBase,
  CostCategoryBaseSaveParams,
  CostCategoryBaseNode,
} from "@/types/cost/master-data/cost-category-type";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";

// Props
interface Props {
  modelValue: boolean;
  editData?: CostCategoryBase | null;
  parentId?: number | null;
  treeData?: CostCategoryBaseNode[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  editData: null,
  parentId: null,
  treeData: () => [],
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
  label: "subName",
  value: "id",
};

const modeOptions = [
  { value: 1, label: "强控" },
  { value: 2, label: "弱控" },
  { value: 3, label: "不控" },
];

// 是否为编辑模式
const isEditMode = computed(() => !!props.editData?.id);

const isParentSelectDisabled = computed(() => !isEditMode.value);

// 弹窗标题
const dialogTitle = computed(() => {
  if (isEditMode.value) return "编辑基础成本科目";
  if (props.parentId && props.parentId > 0) return "新增下级成本科目";
  return "新增基础成本科目";
});

// 表单数据
const formData = ref<CostCategoryBaseSaveParams>({
  pid: 0,
  subCode: "",
  subName: "",
  subLevel: 1,
  ctrlMode: null,
  remark: "",
  isEnabled: true,
});

// 父级显示文本
const parentLabel = computed(() => {
  if (formData.value.pid === 0) return "顶级";
  const parent = findNodeById(props.treeData, formData.value.pid);
  return parent ? `${parent.subName}` : "顶级";
});

// 父级选项（编辑时排除自身）
const parentOptions = computed(() => {
  const rootOption: CostCategoryBaseNode = {
    id: 0,
    pid: 0,
    subCode: "",
    subName: "顶级",
    subLevel: 0,
    remark: null,
    ctrlMode: null,
    isEnabled: true,
    createId: 0,
    createDate: "",
    operId: null,
    operDate: null,
    isDel: false,
    children: props.treeData,
  };

  if (isEditMode.value && formData.value.id) {
    const filteredTree = filterExcludeNode(props.treeData, formData.value.id);
    return [{ ...rootOption, children: filteredTree }];
    // return filteredTree;
  }
  return [rootOption];
});

// 递归过滤排除指定节点
const filterExcludeNode = (
  tree: CostCategoryBaseNode[],
  excludeId: number,
): CostCategoryBaseNode[] => {
  if (!Array.isArray(tree)) return [];
  return tree
    .filter((node) => node.id !== excludeId)
    .map((node) => ({
      ...node,
      children: node.children
        ? filterExcludeNode(node.children, excludeId)
        : [],
    }));
};

// 查找节点
const findNodeById = (
  tree: CostCategoryBaseNode[],
  id: number,
): CostCategoryBaseNode | null => {
  if (!Array.isArray(tree)) return null;
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// 查找父级层级
const findParentLevel = (
  tree: CostCategoryBaseNode[],
  targetId: number,
): number => {
  for (const node of tree) {
    if (node.id === targetId) return node.subLevel;
    if (node.children?.length) {
      const level = findParentLevel(node.children, targetId);
      if (level > 0) return level;
    }
  }
  return 0;
};

// 验证产品编号格式
const validateProdCode = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error("请输入产品编号"));
  } else if (!/^[A-Za-z0-9_]+$/i.test(value)) {
    callback(new Error("产品编号只能包含字母、数字和下划线"));
  } else if (value.length < 2) {
    callback(new Error("产品编号至少2个字符"));
  } else {
    callback();
  }
};

// 表单验证规则
const formRules: FormRules<CostCategoryBaseSaveParams> = {
  subCode: [
    { required: true, message: "请输入产品编号", trigger: "blur" },
    { validator: validateProdCode, trigger: ["blur", "change"] },
  ],
  subName: [
    { required: true, message: "请输入产品名称", trigger: "blur" },
    { min: 2, max: 100, message: "长度在 2 到 100 个字符", trigger: "blur" },
  ],
  subLevel: [
    { required: true, message: "请输入产品层级", trigger: "blur" },
    {
      type: "number",
      min: 1,
      max: 10,
      message: "层级范围 1-10",
      trigger: "blur",
    },
  ],
  ctrlMode: [{ required: true, message: "请选择控制模式", trigger: "blur" }],
};

// 监听弹窗
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      if (isEditMode.value && props.editData) {
        // 编辑回填数据
        formData.value = {
          id: props.editData.id,
          pid: props.editData.pid,
          subCode: props.editData.subCode,
          subName: props.editData.subName,
          subLevel: props.editData.subLevel,
          ctrlMode: props.editData.ctrlMode,
          remark: props.editData.remark || "",
          isEnabled: props.editData.isEnabled,
        };
      } else {
        // 新增
        const pid = props.parentId ?? 0;
        let subLevel = 1;
        if (pid > 0 && props.treeData?.length) {
          const parentLevel = findParentLevel(props.treeData, pid);
          subLevel = parentLevel + 1;
        }
        formData.value = {
          id: undefined,
          pid,
          subCode: "",
          subName: "",
          subLevel,
          ctrlMode: null,
          remark: "",
          isEnabled: true,
        };
        formRef.value?.clearValidate();
      }
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});

// 关闭
const handleClose = () => {
  formRef.value?.clearValidate();
  dialogVisible.value = false;
};

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  // 层级上限验证
  if (formData.value.subLevel > 10) {
    ElMessage.warning("产品层级不能超过10级");
    return;
  }

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const submitData = { ...formData.value };
    let res;
    if (isEditMode.value) {
      res = await costCategoryApi.editCostSubjectBase(submitData);
    } else {
      res = await costCategoryApi.addCostSubjectBase(submitData);
    }
    if (res.code === 200) {
      ElMessage.success(isEditMode.value ? "修改成功" : "新增成功");
      emit("success");
      handleClose();
    } else {
      ElMessage.error(res.msg || "操作失败");
    }
  } catch (error) {
    console.log("表单验证失败", error);
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

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-textarea__inner) {
  resize: none;
}
</style>
