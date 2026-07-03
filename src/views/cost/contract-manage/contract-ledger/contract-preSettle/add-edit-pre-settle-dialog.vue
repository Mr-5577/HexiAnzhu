<!-- 新增/编辑 合同预结算弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="dialogTitle"
    width="700px"
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
        label-width="130px"
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
            <el-form-item prop="addAmt" label="补充合同金额" required>
              <el-input-number
                v-model="formData.addAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入补充合同金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item prop="sumChangeAmt" label="累计变更签证" required>
              <el-input-number
                v-model="formData.sumChangeAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入累计变更签证"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="preSettleAmt" label="预估合同金额" required>
              <el-input-number
                v-model="formData.preSettleAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入预估合同金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item prop="preSettleDesc" label="结算说明" required>
              <el-input
                v-model="formData.preSettleDesc"
                type="textarea"
                placeholder="请输入结算说明"
                :rows="4"
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
  ContractPreSettle,
  ContractPreSettleEditParams,
} from "@/types/cost/contract-manage/contract-preSettle-type";
import { contractPreSettleApi } from "@/api/cost/contract-manage/contract-preSettlement-api";

interface Props {
  modelValue: boolean;
  conId?: number;
  editData?: ContractPreSettle | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  conId: undefined,
  editData: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

// 表单数据
const formData = ref<ContractPreSettleEditParams>({
  id: undefined,
  conBillId: 0,
  status: 0, // 状态：0-草稿，5-审批中，10-已审批，30-已作废
  signAmt: 0, // 合同签约金额
  addAmt: 0, // 补充合同金额
  sumChangeAmt: 0, // 累计变更签证
  preSettleAmt: 0, // 预估合同金额
  preSettleDesc: "", // 调整说明
});

// 表单校验规则
const formRules: FormRules = {
  signAmt: [
    { required: true, message: "请输入合同签约金额", trigger: "change" },
    {
      type: "number",
      min: 0,
      message: "合同签约金额不能小于0",
      trigger: "change",
    },
  ],
  addAmt: [
    { required: true, message: "请输入补充合同金额", trigger: "change" },
    {
      type: "number",
      min: 0,
      message: "补充合同金额不能小于0",
      trigger: "change",
    },
  ],
  sumChangeAmt: [
    { required: true, message: "请输入累计变更签证", trigger: "change" },
    {
      type: "number",
      min: 0,
      message: "累计变更签证不能小于0",
      trigger: "change",
    },
  ],
  preSettleAmt: [
    { required: true, message: "请输入预估合同金额", trigger: "change" },
    {
      type: "number",
      min: 0,
      message: "预估合同金额不能小于0",
      trigger: "change",
    },
  ],
  preSettleDesc: [
    { required: true, message: "请输入结算说明", trigger: "blur" },
    { max: 500, message: "结算说明不能超过500个字符", trigger: "blur" },
  ],
};

// 是否为编辑模式
const isEditMode = computed(() => !!props.editData?.id);

// 弹窗标题
const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑合同预结算" : "新增合同预结算";
});

// 初始化表单数据
const initFormData = () => {
  if (isEditMode.value && props.editData) {
    formData.value = {
      id: props.editData.id,
      conBillId: props.editData.conBillId,
      status: props.editData.status ?? 0,
      signAmt: props.editData.signAmt ?? 0,
      addAmt: props.editData.addAmt ?? 0,
      sumChangeAmt: props.editData.sumChangeAmt ?? 0,
      preSettleAmt: props.editData.preSettleAmt ?? 0,
      preSettleDesc: props.editData.preSettleDesc ?? "",
    };
  } else {
    formData.value = {
      id: undefined,
      conBillId: undefined,
      status: 0,
      signAmt: 0,
      addAmt: 0,
      sumChangeAmt: 0,
      preSettleAmt: 0,
      preSettleDesc: "",
    };
    setTimeout(() => {
      formRef.value?.clearValidate();
    }, 0);
  }
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

    if (isEditMode.value) {
      const res = await contractPreSettleApi.editPreSettle(formData.value);
      if (res.code === 200) {
        ElMessage.success("修改成功");
        emit("success");
        handleClose();
      }
    } else {
      const params = {
        conId: props.conId,
        rec: formData.value,
      };
      const res = await contractPreSettleApi.addPreSettle(params);
      if (res.code === 200) {
        ElMessage.success("保存成功");
        emit("success");
        handleClose();
      }
    }
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

// 监听弹窗显示状态
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

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
