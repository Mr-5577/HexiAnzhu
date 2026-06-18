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
    >
      <el-form-item prop="bankName" label="银行名称" required>
        <el-input v-model="formData.bankName" placeholder="请输入银行名称" />
      </el-form-item>

      <el-form-item prop="accountName" label="账户名称" required>
        <el-input v-model="formData.accountName" placeholder="请输入账户名称" />
        <div class="form-tip">银行账户的持有人名称</div>
      </el-form-item>

      <el-form-item prop="bankAccount" label="银行账号" required>
        <el-input v-model="formData.bankAccount" placeholder="请输入银行账号" />
      </el-form-item>

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
import { bankCardRegex } from "@/utils/regex";
import {
  ContractBankAccount,
  ContractBankAccountParams,
} from "@/types/cost/contract-manage/payment-account-type";
import { paymentAccountApi } from "@/api/cost/contract-manage/payment-account-api";

const props = defineProps<{
  modelValue: boolean;
  conId: number;
  editData?: ContractBankAccount | null;
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
  isEditMode.value ? "编辑收款账号" : "新增收款账号",
);

const formData = ref<ContractBankAccountParams>({
  id: null,
  conId: props.conId,
  bankName: "",
  accountName: "",
  bankAccount: "",
  isEnabled: true,
  isDefault: true,
});
const validateDicCode = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error("请输入银行账号"));
  } else if (!bankCardRegex.test(value)) {
    callback(new Error("请输入正确的银行账号"));
  } else {
    callback();
  }
};
const formRules: FormRules = {
  bankName: [{ required: true, message: "请输入银行名称", trigger: "blur" }],
  accountName: [{ required: true, message: "请输入账户名称", trigger: "blur" }],
  bankAccount: [
    { required: true, message: "请输入银行账号", trigger: "blur" },
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
          conId: props.conId,
          bankName: props.editData.bankName,
          accountName: props.editData.accountName,
          bankAccount: props.editData.bankAccount,
          isEnabled: props.editData.isEnabled,
          isDefault: props.editData.isDefault,
        };
      } else {
        formData.value = {
          id: null,
          conId: props.conId,
          bankName: "",
          accountName: "",
          bankAccount: "",
          isEnabled: true,
          isDefault: true,
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
      res = await paymentAccountApi.editSupBank(submitData);
    } else {
      res = await paymentAccountApi.addSupBank(submitData);
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
.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 4px;
}
</style>
