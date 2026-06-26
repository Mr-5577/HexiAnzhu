<!-- 新增/编辑 款项调整/款项调整弹窗 -->
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
        label-width="120px"
        label-position="right"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="dedTypeId" label="扣款类型" required>
              <el-select
                v-model="formData.dedTypeId"
                placeholder="请选择扣款类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in dedTypeEnum"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="dedAmt" label="款项金额" required>
              <el-input-number
                v-model="formData.dedAmt"
                :min="-999999999"
                :max="999999999"
                :precision="2"
                :controls="false"
                placeholder="请输入款项金额（正数奖励，负数扣款）"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item prop="dedDesc" label="说明">
              <el-input
                v-model="formData.dedDesc"
                type="textarea"
                placeholder="请输入说明"
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
  DedInfo,
  ContractDed,
} from "@/types/cost/contract-manage/payment-adjust-type";
import { paymentAdjustApi } from "@/api/cost/contract-manage/payment-adjust-api";
import { dedTypeEnum } from "@/constants/contract-manage/enums";

interface Props {
  modelValue: boolean;
  conId?: number;
  editData?: ContractDed | null;
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
const formData = ref<DedInfo>({
  id: undefined,
  status: 0,
  conBillId: 0,
  dedTypeId: 0,
  dedAmt: 0,
  dedDesc: "",
});

// 表单校验规则
const formRules: FormRules = {
  dedTypeId: [{ required: true, message: "请选择扣款类型", trigger: "change" }],
  dedAmt: [
    { required: true, message: "请输入款项金额", trigger: "change" },
    {
      type: "number",
      message: "请输入有效的数字",
      trigger: "change",
    },
  ],
  dedDesc: [{ max: 500, message: "说明不能超过500个字符", trigger: "blur" }],
};

// 是否为编辑模式
const isEditMode = computed(() => !!props.editData?.id);

// 弹窗标题
const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑款项调整" : "新增款项调整";
});

// 初始化表单数据
const initFormData = () => {
  if (isEditMode.value && props.editData) {
    formData.value = {
      id: props.editData.id,
      status: props.editData.status,
      conBillId: props.editData.conBillId,
      dedTypeId: props.editData.dedTypeId,
      dedAmt: props.editData.dedAmt || 0,
      dedDesc: props.editData.dedDesc || "",
    };
  } else {
    formData.value = {
      id: undefined,
      status: 0,
      conBillId: props.conId,
      dedTypeId: null,
      dedAmt: 0,
      dedDesc: "",
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

    let res;
    if (isEditMode.value) {
      res = await paymentAdjustApi.editDed(formData.value);
    } else {
      const params = {
        conId: props.conId,
        rec: formData.value,
      };
      res = await paymentAdjustApi.addDed(params);
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
