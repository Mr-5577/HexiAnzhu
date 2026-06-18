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
            <el-form-item prop="changeId" label="变更合同" required>
              <el-select
                v-model="formData.changeId"
                placeholder="请选择变更合同"
                style="width: 100%"
              >
                <el-option
                  v-for="item in changeOrderOptions"
                  :key="item.id"
                  :label="item.changeName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
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
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="visaApplyAmt" label="签证申报金额" required>
              <el-input-number
                v-model="formData.visaApplyAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入签证申报金额"
                style="width: 100%"
                @change="handleCostingCutAmtChange"
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
                @change="handleCostingCutAmtChange"
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
                style="width: 100%"
                :disabled="true"
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
                @change="handleAuditCutAmtChange"
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
                style="width: 100%"
                :disabled="true"
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
  ContractVisaInfo,
} from "@/types/cost/contract-manage/visa-management-type";
import { VisaTypeEnum } from "@/constants/contract-manage/enums";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { changeOrderApi } from "@/api/cost/contract-manage/change-order-api";

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
const wasteCostReasonOptions = ref([]); // 无效成本原因
const changeOrderOptions = ref([]); // 变更合同列表

const initForm = () => {
  return {
    id: null,
    conBillId: null, // 单据ID
    status: 0, // 状态 0 草稿，5 审批中，10 已审批，30 已作废
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
  };
};

const formData = ref<ContractVisaInfo>(initForm());

// 数据字典
const { getDictList, loadDicts } = useDict(
  [
    dictMapping.invalidCostReason, // 无效成本原因
  ],
  {
    treeDictCodes: [],
  },
);

// 计算成本审减金额
const calculateCostingCutAmt = () => {
  const visaApplyAmt: number = Number(formData.value.visaApplyAmt || 0);
  const costingReviewAmt: number = Number(formData.value.costingReviewAmt || 0);
  const costingCutAmt = costingReviewAmt - visaApplyAmt;
  // 如果计算结果为负数，则设为0（审减金额不能为负）
  formData.value.costingCutAmt = costingCutAmt < 0 ? 0 : costingCutAmt;
};

// 计算审计审减金额
const calculateAuditCutAmt = () => {
  const costingReviewAmt = formData.value.costingReviewAmt || 0;
  const auditReviewAmt = formData.value.auditReviewAmt || 0;
  const auditCutAmt = auditReviewAmt - costingReviewAmt;
  // 如果计算结果为负数，则设为0（审减金额不能为负）
  formData.value.auditCutAmt = auditCutAmt < 0 ? 0 : auditCutAmt;
};

// 处理成本相关金额变化
const handleCostingCutAmtChange = () => {
  calculateCostingCutAmt();
  // 成本审核金额变化后，需要重新计算审计审减金额
  calculateAuditCutAmt();
};

// 处理审计相关金额变化
const handleAuditCutAmtChange = () => {
  calculateAuditCutAmt();
};

const formRules: FormRules<ContractVisaInfo> = {
  changeId: [{ required: true, message: "请选择变更合同", trigger: "change" }],
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

// 获取当前签证详情
const getVisaDetailData = async () => {
  try {
    const res = await visaManagementApi.getVisaDetail({
      id: props.editData?.id,
    });
    if (res.code === 200) {
      formData.value = {
        id: res.data?.id,
        conBillId: res.data?.conBillId,
        status: res.data?.status ?? 0,
        changeId: res.data?.changeId ? Number(res.data?.changeId) : null,
        visaType: res.data?.visaType ?? null,
        visaApplyAmt: res.data?.visaApplyAmt ?? 0,
        visaApplyDesc: res.data?.visaApplyDesc || "",
        costingReviewAmt: res.data?.costingReviewAmt ?? 0,
        costingCutAmt: res.data?.costingCutAmt ?? 0,
        costingOpinion: res.data?.costingOpinion || "",
        wasteCostAmt: res.data?.wasteCostAmt ?? 0,
        wasteCostReasonId: res.data?.wasteCostReasonId ?? null,
        auditReviewAmt: res.data?.auditReviewAmt ?? 0,
        auditCutAmt: res.data?.auditCutAmt ?? 0,
        auditOpinion: res.data?.auditOpinion || "",
      };
    }
  } catch (error) {}
};
// 初始化表单数据
const initFormData = async () => {
  if (isEditMode.value && props.editData) {
    // 编辑模式：填充已有数据
    await getVisaDetailData();
  } else {
    // 新增模式：重置表单
    formData.value = initForm();
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
  console.log("formData.value", formData.value);
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    let res;
    if (isEditMode.value) {
      const editParams = {
        ...formData.value,
        conId: props.conId,
      };
      res = await visaManagementApi.editVisa(editParams);
    } else {
      const params = {
        conId: props.conId,
        visa: formData.value,
      };
      res = await visaManagementApi.addVisa(params);
    }
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

// 获取变更合同列表
const getChangeOrderList = async () => {
  if (!props.conId) {
    changeOrderOptions.value = [];
    return;
  }
  try {
    const res = await changeOrderApi.getChangeConList({
      conId: props.conId,
    });
    if (res.code === 200) {
      changeOrderOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取变更合同列表失败:", error);
  }
};

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  async (val) => {
    dialogVisible.value = val;
    if (val) {
      await initDictData();
      await getChangeOrderList();
      await initFormData();
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
