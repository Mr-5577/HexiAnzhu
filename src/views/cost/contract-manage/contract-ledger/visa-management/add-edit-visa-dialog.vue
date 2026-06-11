<!-- 新增/编辑 签证管理弹窗 -->
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
            <el-form-item prop="visaType" label="签证类型" required>
              <el-select
                v-model="formData.visaType"
                placeholder="请选择签证类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in VisaTypeEnum"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="visaApplyAmt" label="签证申报金额" required>
              <el-input-number
                v-model="formData.visaApplyAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入签证申报金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item prop="visaApplyDesc" label="签证申报说明" required>
              <el-input
                v-model="formData.visaApplyDesc"
                type="textarea"
                placeholder="请输入签证申报说明"
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
                placeholder="成本审减金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item prop="wasteCostAmt" label="无效成本金额" required>
              <el-input-number
                v-model="formData.wasteCostAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入无效成本金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              prop="wasteCostReasonId"
              label="无效成本原因"
              required
            >
              <el-select
                v-model="formData.wasteCostReasonId"
                placeholder="请选择无效成本原因"
                style="width: 100%"
                clearable
              >
                <el-option
                  v-for="item in wasteCostReasonOptions"
                  :key="item.id"
                  :label="item.dicLabel"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item prop="costingOpinion" label="成本审核意见" required>
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
                placeholder="审计审减金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item prop="auditOpinion" label="审计审核意见" required>
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
import { visaManagementApi } from "@/api/cost/contract-manage/visa-management-api";
import {
  ContractVisa,
  ContractVisaFormData,
} from "@/types/cost/contract-manage/visa-management-type";
import { VisaTypeEnum } from "@/constants/contract-manage/enums";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";

interface Props {
  modelValue: boolean;
  editData?: ContractVisa | null;
  conId?: number; // 合同ID
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  editData: null,
  conId: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
// 无效成本原因
const wasteCostReasonOptions = ref([]);

// 状态常量
const STATUS = {
  DRAFT: 0, // 草稿
  APPROVING: 5, // 审批中
  APPROVED: 10, // 已审批
  CANCELLED: 30, // 已作废
};

const formData = ref<ContractVisaFormData>({
  id: null,
  conBillId: null, // 合同ID
  status: STATUS.DRAFT, // 状态
  changeId: null, // 变更ID
  visaType: null, // 签证类型
  visaApplyAmt: 0, // 签证申报金额
  visaApplyDesc: "", // 签证申报说明
  costingReviewAmt: 0, // 成本审核金额
  costingCutAmt: 0, // 成本审减金额
  costingOpinion: "", // 成本审核意见
  wasteCostAmt: 0, // 无效成本金额
  wasteCostReasonId: null, // 无效成本原因
  auditReviewAmt: 0, // 审计审核金额
  auditCutAmt: 0, // 审计审减金额
  auditOpinion: "", // 审计审核意见
});

// 数据字典
const { getDictList, loadDicts } = useDict(
  [
    dictMapping.invalidCostReason, // 无效成本原因
  ],
  {
    treeDictCodes: [],
  },
);

const formRules: FormRules<ContractVisaFormData> = {
  visaType: [{ required: true, message: "请选择签证类型", trigger: "change" }],
  visaApplyAmt: [
    { required: true, message: "请输入签证申报金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额必须大于等于0", trigger: "blur" },
  ],
  visaApplyDesc: [
    { required: true, message: "请输入签证申报说明", trigger: "change" },
    { max: 500, message: "签证申报说明不能超过500个字符", trigger: "blur" },
  ],
  costingReviewAmt: [
    { required: true, message: "请输入成本审核金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额必须大于等于0", trigger: "blur" },
  ],
  costingCutAmt: [
    { required: true, message: "请输入成本审减金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额必须大于等于0", trigger: "blur" },
  ],
  wasteCostAmt: [
    { required: true, message: "请输入无效成本金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额必须大于等于0", trigger: "blur" },
  ],
  wasteCostReasonId: [
    { required: true, message: "请选择无效成本原因", trigger: "change" },
  ],
  auditReviewAmt: [
    { required: true, message: "请输入审计审核金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额必须大于等于0", trigger: "blur" },
  ],
  auditCutAmt: [
    { required: true, message: "请输入审计审减金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额必须大于等于0", trigger: "blur" },
  ],
  costingOpinion: [
    { required: true, message: "请输入成本审核意见", trigger: "blur" },
    { max: 500, message: "成本审核意见不能超过500个字符", trigger: "blur" },
  ],
  auditOpinion: [
    { required: true, message: "请输入审计审核意见", trigger: "blur" },
    { max: 500, message: "审计审核意见不能超过500个字符", trigger: "blur" },
  ],
};

const isEditMode = computed(() => !!props.editData?.id);

const dialogTitle = computed(() => {
  if (isEditMode.value) {
    return "编辑签证";
  } else {
    return "新增签证";
  }
});

// 初始化表单数据
const initFormData = () => {
  if (isEditMode.value && props.editData) {
    // 编辑模式：填充已有数据
    formData.value = {
      id: props.editData.id,
      conBillId: props.editData.conBillId,
      status: props.editData.status ?? STATUS.DRAFT,
      changeId: props.editData.changeId,
      visaType: props.editData.visaType ?? null,
      visaApplyAmt: props.editData.visaApplyAmt ?? 0,
      visaApplyDesc: props.editData.visaApplyDesc || "",
      costingReviewAmt: props.editData.costingReviewAmt ?? 0,
      costingCutAmt: props.editData.costingCutAmt ?? 0,
      costingOpinion: props.editData.costingOpinion || "",
      wasteCostAmt: props.editData.wasteCostAmt ?? 0,
      wasteCostReasonId: props.editData.wasteCostReasonId ?? null,
      auditReviewAmt: props.editData.auditReviewAmt ?? 0,
      auditCutAmt: props.editData.auditCutAmt ?? 0,
      auditOpinion: props.editData.auditOpinion || "",
    };
  } else {
    // 新增模式：重置表单
    formData.value = {
      id: null,
      conBillId: props.conId,
      status: STATUS.DRAFT,
      changeId: null,
      visaType: null,
      visaApplyAmt: 0,
      visaApplyDesc: "",
      costingReviewAmt: 0,
      costingCutAmt: 0,
      costingOpinion: "",
      wasteCostAmt: 0,
      wasteCostReasonId: null,
      auditReviewAmt: 0,
      auditCutAmt: 0,
      auditOpinion: "",
    };
  }

  // 清空验证
  setTimeout(() => {
    formRef.value?.clearValidate();
  }, 0);
};

const handleClose = () => {
  formRef.value?.resetFields();
  dialogVisible.value = false;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const interfaceApi = isEditMode.value
      ? visaManagementApi.editVisa
      : visaManagementApi.addVisa;

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

// 初始化数据字典数据
const initDictData = async () => {
  await loadDicts();
  wasteCostReasonOptions.value = getDictList(dictMapping.invalidCostReason); // 无效成本原因
};

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  async (val) => {
    dialogVisible.value = val;
    if (val) {
      await initDictData();
      initFormData();
    }
  },
);

// 监听弹窗关闭
watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
</script>

<style lang="scss" scoped>
:deep(.el-textarea__inner) {
  resize: none;
}
</style>
