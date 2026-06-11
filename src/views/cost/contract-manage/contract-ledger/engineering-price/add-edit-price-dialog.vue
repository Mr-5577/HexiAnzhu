<!-- 新增/编辑 工程核价弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="dialogTitle"
    width="800px"
    :confirm-loading="submitLoading"
    @confirm="handleSubmit"
    @cancel="handleClose"
    @close="handleClose"
  >
    <div style="padding-right: 8px; box-sizing: border-box">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        label-position="right"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="signAmt" label="合同签约金额" required>
              <el-input-number
                v-model="formData.signAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入合同签约金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="applyAmt" label="申报金额" required>
              <el-input-number
                v-model="formData.applyAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入申报金额"
                style="width: 100%"
                @change="calcCostingCutAmt"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="applyDesc" label="申报事项说明">
              <el-input
                v-model="formData.applyDesc"
                type="textarea"
                placeholder="请输入申报事项说明"
                :rows="3"
                maxlength="500"
                show-word-limit
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item prop="costingReviewAmt" label="成本审核金额" required>
              <el-input-number
                v-model="formData.costingReviewAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入成本审核金额"
                style="width: 100%"
                @change="calcCostingCutAmt"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="costingCutAmt" label="成本审减金额" required>
              <el-input-number
                v-model="formData.costingCutAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="自动计算"
                disabled
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="costingOpinion" label="成本审核意见">
              <el-input
                v-model="formData.costingOpinion"
                type="textarea"
                placeholder="请输入成本审核意见"
                :rows="3"
                maxlength="500"
                show-word-limit
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item prop="auditReviewAmt" label="审计审核金额" required>
              <el-input-number
                v-model="formData.auditReviewAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入审计审核金额"
                style="width: 100%"
                @change="calcAuditCutAmt"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="auditCutAmt" label="审计审减金额" required>
              <el-input-number
                v-model="formData.auditCutAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="自动计算"
                disabled
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="auditOpinion" label="审计审核意见">
              <el-input
                v-model="formData.auditOpinion"
                type="textarea"
                placeholder="请输入审计审核意见"
                :rows="3"
                maxlength="500"
                show-word-limit
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import {
  ContractAuditPrice,
  ContractAuditPriceFormData,
} from "@/types/cost/contract-manage/engineering-price-type";
import { engineeringPriceApi } from "@/api/cost/contract-manage/engineering-price-api";

interface Props {
  modelValue: boolean;
  editData?: ContractAuditPrice | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  editData: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const formData = ref<ContractAuditPriceFormData>({
  id: null,
  conBillId: null,
  signAmt: null,
  applyAmt: null,
  applyDesc: "",
  costingReviewAmt: null,
  costingCutAmt: null,
  costingOpinion: "",
  auditReviewAmt: null,
  auditCutAmt: null,
  auditOpinion: "",
});

// 计算成本审减金额 = 成本审核金额 - 申报金额
const calcCostingCutAmt = () => {
  const reviewAmt = formData.value.costingReviewAmt || 0;
  const applyAmt = formData.value.applyAmt || 0;
  const cutAmt = reviewAmt - applyAmt;
  formData.value.costingCutAmt = cutAmt >= 0 ? cutAmt : 0;
};

// 计算审计审减金额 = 审计审核金额 - 成本审核金额
const calcAuditCutAmt = () => {
  const auditAmt = formData.value.auditReviewAmt || 0;
  const reviewAmt = formData.value.costingReviewAmt || 0;
  const cutAmt = auditAmt - reviewAmt;
  formData.value.auditCutAmt = cutAmt >= 0 ? cutAmt : 0;
};

const formRules: FormRules = {
  signAmt: [
    { required: true, message: "请输入合同签约金额", trigger: "change" },
  ],
  applyAmt: [{ required: true, message: "请输入申报金额", trigger: "change" }],
  costingReviewAmt: [
    { required: true, message: "请输入成本审核金额", trigger: "change" },
  ],
  costingCutAmt: [
    { required: true, message: "请输入成本审减金额", trigger: "blur" },
  ],
  auditReviewAmt: [
    { required: true, message: "请输入审计审核金额", trigger: "change" },
  ],
  auditCutAmt: [
    { required: true, message: "请输入审计审减金额", trigger: "change" },
  ],
};

const isEditMode = computed(() => !!props.editData?.id);

const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑工程核价" : "新增工程核价";
});

const initFormData = () => {
  if (isEditMode.value && props.editData) {
    formData.value = {
      id: props.editData.id,
      conBillId: props.editData.conBillId,
      signAmt: props.editData.signAmt,
      applyAmt: props.editData.applyAmt,
      applyDesc: props.editData.applyDesc,
      costingReviewAmt: props.editData.costingReviewAmt,
      costingCutAmt: props.editData.costingCutAmt,
      costingOpinion: props.editData.costingOpinion,
      auditReviewAmt: props.editData.auditReviewAmt,
      auditCutAmt: props.editData.auditCutAmt,
      auditOpinion: props.editData.auditOpinion,
    };
  } else {
    formData.value = {
      id: null,
      conBillId: null,
      signAmt: null,
      applyAmt: null,
      applyDesc: "",
      costingReviewAmt: null,
      costingCutAmt: null,
      costingOpinion: "",
      auditReviewAmt: null,
      auditCutAmt: null,
      auditOpinion: "",
    };
    setTimeout(() => {
      formRef.value?.clearValidate();
    }, 0);
  }
};

const handleClose = () => {
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
  dialogVisible.value = false;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;
    const interfaceApi = isEditMode.value
      ? engineeringPriceApi.editAuditPrice
      : engineeringPriceApi.addAuditPrice;
    const res = await interfaceApi(formData.value);
    if (res.code === 200) {
      ElMessage.success(isEditMode.value ? "修改成功" : "新增成功");
      emit("success");
      handleClose();
    }
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      initFormData();
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
</script>

<style lang="scss" scoped>
:deep(.el-textarea__inner) {
  resize: none;
}
</style>
