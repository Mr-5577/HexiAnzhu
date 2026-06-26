<!-- 新增/编辑 银行账户弹窗 -->
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
      <el-form-item prop="accountName" label="银行户名" required>
        <el-input
          v-model="formData.accountName"
          placeholder="请输入银行户名"
          clearable
          maxlength="100"
          show-word-limit
        />
        <div class="form-tip">必须与银行账户开立名称完全一致</div>
      </el-form-item>

      <el-form-item prop="bankName" label="开户银行" required>
        <el-input
          v-model="formData.bankName"
          placeholder="请输入开户银行"
          clearable
          maxlength="100"
          show-word-limit
        />
        <div class="form-tip">例：中国银行杭州市钱江新城支行</div>
      </el-form-item>

      <el-form-item prop="bankAccount" label="银行账号" required>
        <el-input
          v-model="formData.bankAccount"
          placeholder="请输入银行账号"
          clearable
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item prop="isDefault" label="是否默认">
        <el-switch
          v-model="formData.isDefault"
          :active-value="true"
          :inactive-value="false"
        />
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
  SupplierBank,
  SupplierBankSaveParams,
} from "@/types/cost/supplier/supplier-ledger-type";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import { bankCardRegex } from "@/utils/regex";

// Props
interface Props {
  modelValue: boolean;
  editData?: SupplierBank | null;
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
  return isEditMode.value ? "编辑银行账户" : "新增银行账户";
});

// 表单数据
const formData = ref<SupplierBankSaveParams>({
  supId: props.supId,
  accountName: "",
  bankName: "",
  bankAccount: "",
  isDefault: false,
  isEnabled: true,
  remark: "",
});

// 表单验证规则
const formRules: FormRules = {
  accountName: [
    { required: true, message: "请输入银行账户名", trigger: "blur" },
    { min: 1, max: 100, message: "长度在 1 到 100 个字符", trigger: "blur" },
  ],
  bankName: [
    { required: true, message: "请输入开户银行", trigger: "blur" },
    { min: 1, max: 100, message: "长度在 1 到 100 个字符", trigger: "blur" },
  ],
  bankAccount: [
    { required: true, message: "请输入银行账号", trigger: "change" },
    {
      pattern: bankCardRegex,
      message: "请输入正确的银行账号",
      trigger: "blur",
    },
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
          supId: props.editData.supId,
          accountName: props.editData.accountName,
          bankName: props.editData.bankName,
          bankAccount: props.editData.bankAccount,
          isDefault: props.editData.isDefault ?? false,
          isEnabled: props.editData.isEnabled ?? true,
          remark: props.editData.remark || "",
        };
      } else {
        // 新增：重置表单
        formData.value = {
          supId: props.supId,
          accountName: "",
          bankName: "",
          bankAccount: "",
          isDefault: false,
          isEnabled: true,
          remark: "",
        };
        formRef.value?.clearValidate(); // 只清除验证，不清除数据
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
      ? supplierApi.editBank
      : supplierApi.addBank;
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
