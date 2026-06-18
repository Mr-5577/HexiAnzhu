<!-- 新增/编辑 数据字典项弹窗 -->
<template>
  <base-modal
    v-model="modalVisible"
    :title="dialogTitle"
    width="500px"
    :confirm-loading="confirmLoading"
    @confirm="handleSubmit"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="90px"
      label-position="right"
      class="dict-form"
    >
      <!-- 父级ID（隐藏字段） -->
      <el-form-item v-if="false" prop="pid" label="父级ID">
        <el-input v-model="formData.pid" type="hidden" />
      </el-form-item>

      <!-- 所属字典分组 -->
      <el-form-item prop="groupId" label="所属分组" required>
        <el-tree-select
          v-model="formData.groupId"
          :data="groupData"
          :props="treeSelectProps"
          node-key="id"
          :render-after-expand="false"
          :disabled="true"
        />
      </el-form-item>

      <!-- 字典编码 -->
      <el-form-item prop="dicCode" label="字典编码" required>
        <el-input
          v-model="formData.dicCode"
          placeholder="请输入字典编码，如：user_sex"
          clearable
          maxlength="50"
          show-word-limit
        />
        <div class="form-tip">建议使用英文小写+下划线命名</div>
      </el-form-item>

      <!-- 字典名称 -->
      <el-form-item prop="dicLabel" label="字典名称" required>
        <el-input
          v-model="formData.dicLabel"
          placeholder="请输入字典名称，如：用户性别"
          clearable
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <!-- 字典值 -->
      <el-form-item prop="dicValue" label="字典值" required>
        <el-input
          v-model="formData.dicValue"
          placeholder="请输入字典值"
          clearable
          maxlength="50"
          show-word-limit
        />
        <!-- <div class="form-tip">字典编码通常与字典值相同，用于系统识别</div> -->
      </el-form-item>

      <!-- 字典说明 -->
      <el-form-item prop="dicDesc" label="字典说明">
        <el-input
          v-model="formData.dicDesc"
          type="textarea"
          placeholder="请输入字典说明，用于描述该字典项的含义和用途"
          :rows="3"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 排序 -->
      <el-form-item prop="sort" label="排序">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="9999"
          controls-position="right"
          placeholder="数字越小越靠前"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 是否默认 -->
      <el-form-item prop="isDefault" label="是否默认">
        <el-radio-group v-model="formData.isDefault">
          <el-radio :value="true">是默认</el-radio>
          <el-radio :value="false">非默认</el-radio>
        </el-radio-group>
        <!-- <div class="form-tip">默认值会在下拉框中自动选中</div> -->
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
import { ElMessage, FormInstance, FormRules } from "element-plus";
import BaseModal from "@/components/base/base-modal.vue";
import type {
  DictItem,
  DictItemSaveParams,
  DictGroupTreeNode,
} from "@/types/cost/master-data/dict-type";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";

interface Props {
  /** 弹窗是否可见 */
  modelValue: boolean;
  /** 字典组ID */
  groupId: number | null;
  /** 编辑的数据（编辑时传入） */
  editData?: DictItem | null;
  /** 字典分组数据 */
  groupData?: DictGroupTreeNode[];
  parentId?: number;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void;
}

const treeSelectProps = {
  children: "children", // 子节点字段名
  label: "groupName", // 显示文本字段名（对应 groupName）
  value: "id", // 值字段名（对应 id）
};

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const modalVisible = ref(props.modelValue);
const confirmLoading = ref(false);
const testValue = ref(1002);
const formRef = ref<FormInstance>();

const formData = ref<DictItemSaveParams>({
  pid: 0,
  groupId: props.groupId,
  dicCode: "",
  dicLabel: "",
  dicValue: "",
  dicDesc: "",
  sort: 999,
  isDefault: false,
  isEnabled: true,
});
// 是否是编辑
const isEdit = computed(() => !!props.editData?.id);
// 弹窗标题
const dialogTitle = computed(() => {
  return isEdit.value ? "编辑字典项" : "新增字典项";
});
const validateDicCode = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error("请输入字典编码"));
  } else if (!/^[A-Za-z][A-Za-z0-9_]*$/i.test(value)) {
    callback(new Error("字典编码只能包含字母、数字和下划线，且必须以字母开头"));
  } else {
    callback();
  }
};

const validateDicValue = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error("请输入字典值"));
  } else if (!/^[A-Za-z][A-Za-z0-9_]*$/i.test(value)) {
    callback(new Error("字典值只能包含字母、数字和下划线，且必须以字母开头"));
  } else {
    callback();
  }
};

const formRules: FormRules<DictItemSaveParams> = {
  groupId: [{ required: true, message: "请选择字典分组", trigger: "change" }],
  dicCode: [
    { required: true, message: "请输入字典编码", trigger: "blur" },
    { validator: validateDicCode, trigger: ["blur", "change"] },
  ],
  dicLabel: [
    { required: true, message: "请输入字典名称", trigger: "blur" },
    { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" },
  ],
  dicValue: [
    { required: true, message: "请输入字典值", trigger: "blur" },
    // { validator: validateDicValue, trigger: ["blur", "change"] },
  ],
  sort: [
    {
      type: "number",
      min: 0,
      max: 9999,
      message: "排序范围 0-9999",
      trigger: "blur",
    },
  ],
  isDefault: [{ required: true, message: "请选择是否默认", trigger: "change" }],
};

/**
 * 初始化表单数据
 */
const initFormData = () => {
  console.log("初始化表单数据", props);
  // 编辑时，填充数据
  if (props.editData && props.editData.id) {
    formData.value = {
      id: props.editData.id,
      pid: props.editData.pid,
      groupId: props.editData.groupId,
      dicCode: props.editData.dicCode,
      dicLabel: props.editData.dicLabel,
      dicValue: props.editData.dicValue,
      dicDesc: props.editData.dicDesc || "",
      sort: props.editData.sort || 1,
      isDefault: props.editData.isDefault,
      isEnabled: props.editData.isEnabled,
    }
  } else {
    formData.value = {
      id: undefined,
      pid: props.parentId || 0,
      groupId: props.groupId,
      dicCode: "",
      dicLabel: "",
      dicValue: "",
      dicDesc: "",
      sort: 999,
      isDefault: false,
      isEnabled: true,
    };
  }
  formRef.value?.clearValidate();
};

// 取消
const handleCancel = () => {
  modalVisible.value = false;
};
// 关闭
const handleClose = () => {
  modalVisible.value = false;
};
const handleSubmit = () => {
  console.log("参数", formData.value);
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        confirmLoading.value = true;
        let res;
        if (isEdit.value) {
          res = await dictionaryApi.editDictD(formData.value);
        } else {
          res = await dictionaryApi.addDictD(formData.value);
        }
        if (res.code === 200) {
          ElMessage.success(isEdit.value ? "修改成功" : "新增成功");
          emit("success");
          handleClose();
        } else {
          ElMessage.error(res.msg || "操作失败");
        }
      } catch (error) {
      } finally {
        confirmLoading.value = false;
      }
    }
  });
};

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  (newVal) => {
    modalVisible.value = newVal;
    if (newVal) {
      initFormData();
    }
  },
);

watch(modalVisible, (val) => {
  emit("update:modelValue", val);
});

// 暴露方法
defineExpose({});
</script>

<style lang="scss" scoped>
.dict-form {
  padding: 0 20px;
  box-sizing: border-box;
  .form-tip {
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
    margin-top: 4px;
  }
}
</style>
