<!-- 新增/编辑 联系方式弹窗 -->
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
      label-width="110px"
      label-position="right"
    >
      <el-form-item prop="contactPerson" label="联系人" required>
        <el-input
          v-model="formData.contactPerson"
          placeholder="请输入联系人"
          clearable
        />
      </el-form-item>

      <el-form-item prop="contactPhone" label="联系电话" required>
        <el-input
          v-model="formData.contactPhone"
          placeholder="请输入联系电话"
          clearable
        />
      </el-form-item>

      <el-form-item prop="contactCardNo" label="身份证号" required>
        <el-input
          v-model="formData.contactCardNo"
          placeholder="请输入联系人身份证号"
          clearable
        />
      </el-form-item>

      <el-form-item prop="jobTitle" label="联系人职务" required>
        <el-input
          v-model="formData.jobTitle"
          placeholder="请输入职务"
          clearable
        />
      </el-form-item>

      <el-form-item prop="isMain" label="主要联系人">
        <el-radio-group v-model="formData.isMain">
          <el-radio :value="true">是</el-radio>
          <el-radio :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item prop="isEnable" label="是否启用">
        <el-radio-group v-model="formData.isEnable">
          <el-radio :value="true">启用</el-radio>
          <el-radio :value="false">停用</el-radio>
        </el-radio-group>
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
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import {
  SupplierContact,
  SupplierContactSaveParams,
} from "@/types/cost/supplier/supplier-ledger-type";
import { idCardRegex, phoneRegex } from "@/utils/regex";

// Props
interface Props {
  modelValue: boolean;
  editData?: SupplierContact | null;
  supId: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  editData: null,
  supId: null,
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
  return isEditMode.value ? "编辑联系方式" : "新增联系方式";
});

// 表单数据
const formData = ref<SupplierContactSaveParams>({
  supId: props.supId,
  contactPerson: "",
  contactPhone: "",
  contactCardNo: "",
  jobTitle: "",
  isMain: false,
  isEnable: true,
  remark: "",
});

// 表单验证规则
const formRules: FormRules = {
  contactPerson: [{ required: true, message: "请输入联系人", trigger: "blur" }],
  contactPhone: [
    { required: true, message: "请输入联系电话", trigger: "blur" },
    { pattern: phoneRegex, message: "请输入正确的手机号码", trigger: "change" },
  ],
  contactCardNo: [
    { required: true, message: "请输入身份证号", trigger: "blur" },
    {
      pattern: idCardRegex,
      message: "请输入正确的身份证号",
      trigger: "change",
    },
  ],
  jobTitle: [{ required: true, message: "请输入职务", trigger: "blur" }],
};

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
      ? supplierApi.editContact
      : supplierApi.addContact;
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
          contactPerson: props.editData.contactPerson || "",
          contactPhone: props.editData.contactPhone || "",
          contactCardNo: props.editData.contactCardNo || "",
          jobTitle: props.editData.jobTitle || "",
          isMain: props.editData.isMain ?? false,
          isEnable: props.editData.isEnable ?? true,
          remark: props.editData.remark || "",
        };
      } else {
        // 新增：重置表单
        formData.value = {
          supId: props.supId,
          contactPerson: "",
          contactPhone: "",
          contactCardNo: "",
          jobTitle: "",
          isMain: false,
          isEnable: true,
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
</script>

<style lang="scss" scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}
:deep(.el-textarea__inner) {
  resize: none;
}
</style>
