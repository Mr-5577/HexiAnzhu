<!-- 新增/编辑 供应商资质弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="dialogTitle"
    width="550px"
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
      <el-form-item prop="annexType" label="附件类型" required>
        <el-input
          v-model="formData.annexType"
          placeholder="请输入附件类型"
          clearable
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item prop="annexName" label="附件名称" required>
        <el-input
          v-model="formData.annexName"
          placeholder="请输入附件名称"
          clearable
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      <el-form-item prop="annexId" label="附件" required>
        <!-- 这里上传附件拿到附件ID -->
      </el-form-item>

      <el-form-item prop="remark" label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
          :rows="3"
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
  SupplierAnnex,
  SupplierAnnexSaveParams,
} from "@/types/cost/supplier/supplier-ledger-type";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";

// Props
interface Props {
  modelValue: boolean;
  editData?: SupplierAnnex | null;
  supId: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  editData: null,
  supId: 0,
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

// 是否为编辑模式
const isEditMode = computed(() => !!props.editData?.id);

// 弹窗标题
const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑供应商资质" : "新增供应商资质";
});

// 表单数据
const formData = ref<SupplierAnnexSaveParams>({
  supId: props.supId,
  annexId: null,
  annexType: "",
  annexName: "",
  remark: "",
});

// 表单验证规则
const formRules: FormRules = {
  annexType: [
    { required: true, message: "请输入附件类型", trigger: "blur" },
    { min: 1, max: 100, message: "长度在 1 到 100 个字符", trigger: "blur" },
  ],
  annexName: [{ required: true, message: "请输入附件名称", trigger: "blur" }],
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
          supId: props.editData.supId,
          annexType: props.editData.annexType,
          annexName: props.editData.annexName,
          remark: props.editData.remark || "",
          annexId: props.editData.annexId,
        };
      } else {
        // 新增：重置表单
        formData.value = {
          supId: props.supId,
          annexId: null,
          annexType: "",
          annexName: "",
          remark: "",
        };
        formRef.value?.clearValidate();
      }
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});

// 关闭弹窗
const handleClose = () => {
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
  dialogVisible.value = false;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;
    const interfaceApi = isEditMode.value
      ? supplierApi.editAnnex
      : supplierApi.addAnnex;
    const res = await interfaceApi(formData.value);
    if (res) {
      ElMessage.success(`${isEditMode.value ? "编辑" : "新增"}成功`);
      emit("success");
      handleClose();
    }
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
:deep(.el-textarea__inner) {
  resize: none;
}
</style>
