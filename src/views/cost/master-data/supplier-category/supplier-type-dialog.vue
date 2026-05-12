<template>
  <base-modal
    v-model="visible"
    :title="dialogTitle"
    width="500px"
    :confirm-loading="submitLoading"
    @confirm="handleSubmit"
    @cancel="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="supType-form"
    >
      <el-form-item prop="supTypeName" label="类别名称" required>
        <el-input
          v-model="formData.supTypeName"
          placeholder="请输入类别名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item prop="supTypeCode" label="类别编码" required>
        <el-input
          v-model="formData.supTypeCode"
          placeholder="请输入类别编码"
          maxlength="50"
          show-word-limit
        />
        <div class="form-tip">建议使用英文小写+下划线命名</div>
      </el-form-item>

      <el-form-item prop="isEnabled" label="是否启用">
        <el-radio-group v-model="formData.isEnabled">
          <el-radio :value="true">启用</el-radio>
          <el-radio :value="false">停用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item prop="remark" label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import type {
  SupplierType,
  SupplierTypeSaveParams,
} from "@/types/cost/supplier-category-type";
import { supTypeApi } from "@/api/cost/supplier-category-api";

const props = defineProps<{
  modelValue: boolean;
  editData?: SupplierType | null;
  parentId?: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const visible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const isEditMode = computed(() => !!props.editData?.id);
const dialogTitle = computed(() =>
  isEditMode.value ? "编辑供应商类别" : "新增供应商类别",
);

const formData = ref<SupplierTypeSaveParams>({
  pid: 0,
  supTypeCode: "",
  supTypeName: "",
  isEnabled: true,
  remark: "",
});
const validateDicCode = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error("请输入类别编码"));
  } else if (!/^[a-z][a-z0-9_]*$/i.test(value)) {
    callback(new Error("字典编码只能包含字母、数字和下划线，且必须以字母开头"));
  } else {
    callback();
  }
};
const formRules: FormRules = {
  supTypeName: [
    { required: true, message: "请输入类别名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
  supTypeCode: [
    { required: true, message: "请输入类别编码", trigger: "blur" },
    { validator: validateDicCode, trigger: ["blur", "change"] },
  ],
};

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val) {
      if (isEditMode.value && props.editData) {
        formData.value = {
          id: props.editData.id,
          pid: props.editData.pid,
          supTypeCode: props.editData.supTypeCode,
          supTypeName: props.editData.supTypeName,
          isEnabled: props.editData.isEnabled,
          remark: props.editData.remark || "",
        };
      } else {
        formData.value = {
          pid: props.parentId || 0,
          supTypeCode: "",
          supTypeName: "",
          isEnabled: true,
          remark: "",
        };
        formRef.value?.resetFields();
      }
    }
  },
);

watch(visible, (val) => emit("update:modelValue", val));

const handleClose = () => {
  visible.value = false;
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const submitData = { ...formData.value };
    if (!isEditMode.value) {
      delete submitData.id;
    }
    let res;
    if (isEditMode.value) {
      res = await supTypeApi.editSupType(submitData);
    } else {
      res = await supTypeApi.addSupType(submitData);
    }
    if (res.code === 200) {
      ElMessage.success(dialogTitle.value + "成功");
      visible.value = false;
      emit("success");
    }
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};
</script>
<style lang="scss" scoped>
.supType-form {
  padding: 0 20px;
  box-sizing: border-box;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 4px;
}
</style>
