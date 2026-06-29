<!-- 新增/编辑 缴纳弹窗 -->
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
        <el-form-item prop="recvTypeId" label="缴纳方式" required>
          <el-select
            v-model="formData.recvTypeId"
            placeholder="请选择缴纳方式"
            style="width: 100%"
          >
            <el-option
              v-for="item in recvTypeEnum"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="recvAmt" label="缴纳金额" required>
          <el-input-number
            v-model="formData.recvAmt"
            :min="0"
            :max="999999999"
            :precision="2"
            :controls="false"
            placeholder="请输入缴纳金额"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item prop="recvDate" label="缴纳日期" required>
          <el-date-picker
            v-model="formData.recvDate"
            type="date"
            placeholder="请选择缴纳日期"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item prop="annexId" label="附件凭证">
          <el-input
            v-model="formData.annexId"
            placeholder="请输入附件凭证ID"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { PerformanceBondList } from "@/types/cost/contract-manage/performance-bond-type";
import { perfBondApi } from "@/api/cost/contract-manage/performance-bond-api";

interface Props {
  modelValue: boolean;
  conId?: number;
  editData?: PerformanceBondList | null;
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

// 缴纳方式枚举
const recvTypeEnum = [
  { value: 1, label: "银行转账" },
  { value: 2, label: "现金" },
  { value: 3, label: "支票" },
  { value: 4, label: "线上支付" },
];

// 表单数据
const formData = ref({
  id: null,
  conBillId: props.conId,
  recvTypeId: null,
  recvAmt: 0,
  recvDate: "",
  annexId: null,
  srcBillId: null,
});

// 表单校验规则
const formRules: FormRules = {
  recvTypeId: [
    { required: true, message: "请选择缴纳方式", trigger: "change" },
  ],
  recvAmt: [
    { required: true, message: "请输入缴纳金额", trigger: "blur" },
    {
      type: "number",
      message: "请输入有效的数字",
      trigger: "blur",
    },
    {
      validator: (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error("缴纳金额必须大于0"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  recvDate: [{ required: true, message: "请选择缴纳日期", trigger: "change" }],
  //   annexId: [
  //     {
  //       validator: (rule, value, callback) => {
  //         // 如果填写了附件ID，可以添加格式校验
  //         if (value && !/^\d+$/.test(value)) {
  //           callback(new Error("附件凭证ID必须为数字"));
  //         } else {
  //           callback();
  //         }
  //       },
  //       trigger: "blur",
  //     },
  //   ],
};

// 是否为编辑模式
const isEditMode = computed(() => !!props.editData?.id);

// 弹窗标题
const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑缴纳信息" : "新增缴纳信息";
});

// 初始化表单数据
const initFormData = () => {
  if (isEditMode.value && props.editData) {
    formData.value = {
      id: props.editData.id,
      conBillId: props.editData.conBillId,
      recvTypeId: props.editData.recvTypeId,
      recvAmt: props.editData.recvAmt || 0,
      recvDate: props.editData.recvDate || "",
      annexId: props.editData.annexId || null,
      srcBillId: props.editData.srcBillId,
    };
  } else {
    formData.value = {
      id: null,
      conBillId: props.conId,
      recvTypeId: null,
      recvAmt: 0,
      recvDate: "",
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
      res = await perfBondApi.editLvRecv(formData.value);
    } else {
      const params = {
        conId: props.conId,
        recv: formData.value,
      };
      res = await perfBondApi.addLvRecv(params);
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
