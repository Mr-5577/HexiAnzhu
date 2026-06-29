<!-- 新增/编辑 退还弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="dialogTitle"
    width="500px"
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
        <el-form-item prop="refundTypeId" label="退还方式" required>
          <el-select
            v-model="formData.refundTypeId"
            placeholder="请选择退还方式"
            style="width: 100%"
          >
            <el-option
              v-for="item in refundTypeEnum"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="refundAmt" label="退还金额" required>
          <el-input-number
            v-model="formData.refundAmt"
            :min="0"
            :max="999999999"
            :precision="2"
            :controls="false"
            placeholder="请输入退还金额"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item prop="refundDate" label="退还日期" required>
          <el-date-picker
            v-model="formData.refundDate"
            type="date"
            placeholder="请选择退还日期"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item prop="annexId" label="附件凭证"> </el-form-item>
      </el-form>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { PerformanceBondReturnList } from "@/types/cost/contract-manage/performance-bond-type";
import { perfBondApi } from "@/api/cost/contract-manage/performance-bond-api";

interface Props {
  modelValue: boolean;
  conId?: number;
  editData?: PerformanceBondReturnList | null;
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

// 退还方式枚举（请根据实际业务调整）
const refundTypeEnum = [
  { value: 1, label: "银行转账" },
  { value: 2, label: "现金" },
  { value: 3, label: "支票" },
  { value: 4, label: "线上支付" },
];

// 表单数据
const formData = ref({
  id: null,
  conBillId: props.conId,
  refundTypeId: null,
  refundAmt: 0,
  refundDate: "",
  annexId: null,
  srcBillId: null,
});

// 表单校验规则
const formRules: FormRules = {
  refundTypeId: [
    { required: true, message: "请选择退还方式", trigger: "change" },
  ],
  refundAmt: [
    { required: true, message: "请输入退还金额", trigger: "blur" },
    {
      type: "number",
      message: "请输入有效的数字",
      trigger: "blur",
    },
    {
      validator: (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error("退还金额必须大于0"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  refundDate: [
    { required: true, message: "请选择退还日期", trigger: "change" },
  ],
  annexId: [
    {
      validator: (rule, value, callback) => {
        // 如果填写了附件ID，可以添加格式校验
        if (value && !/^\d+$/.test(value)) {
          callback(new Error("附件凭证ID必须为数字"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 是否为编辑模式
const isEditMode = computed(() => !!props.editData?.id);

// 弹窗标题
const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑退还信息" : "新增退还信息";
});

// 初始化表单数据
const initFormData = () => {
  if (isEditMode.value && props.editData) {
    formData.value = {
      id: props.editData.id,
      conBillId: props.editData.conBillId,
      refundTypeId: props.editData.refundTypeId,
      refundAmt: props.editData.refundAmt || 0,
      refundDate: props.editData.refundDate || "",
      annexId: props.editData.annexId,
      srcBillId: props.editData.srcBillId,
    };
  } else {
    formData.value = {
      id: null,
      conBillId: props.conId,
      refundTypeId: null,
      refundAmt: 0,
      refundDate: "",
      annexId: null,
      srcBillId: null,
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
      res = await perfBondApi.editLvRefu(formData.value);
    } else {
      const params = {
        conId: props.conId,
        refu: formData.value,
      };
      res = await perfBondApi.addLvRefu(params);
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
:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
