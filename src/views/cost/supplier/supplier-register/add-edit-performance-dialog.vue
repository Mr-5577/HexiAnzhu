<!-- 新增/编辑 供应商项目业绩弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :confirm-loading="submitLoading"
    @confirm="handleSubmit"
    @cancel="handleClose"
    @close="handleClose"
  >
    <div class="form-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item prop="projName" label="项目名称" required>
          <el-input
            v-model="formData.projName"
            placeholder="请输入项目名称"
            clearable
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item prop="companyName" label="合作单位" required>
          <el-input
            v-model="formData.companyName"
            placeholder="请输入合作单位"
            clearable
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item prop="conAmount" label="合同金额" required>
          <el-input-number
            v-model="formData.conAmount"
            :precision="2"
            :min="0"
            :step="1000"
            placeholder="请输入合同金额"
            style="width: 100%"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="24"> </el-col>
        </el-row>
        <el-form-item prop="conDesc" label="合同概述" required>
          <el-input
            v-model="formData.conDesc"
            type="textarea"
            placeholder="请输入合同概述"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="startDate" label="开始日期" required>
              <el-date-picker
                v-model="formData.startDate"
                type="date"
                placeholder="请选择开始日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="endDate" label="结束日期" required>
              <el-date-picker
                v-model="formData.endDate"
                type="date"
                placeholder="请选择结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item prop="annexId" label="相关附件" required>
          <!-- 这里上传附件获取附件ID -->
        </el-form-item>
      </el-form>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import type {
  SupplierPerf,
  SupplierPerfSaveParams,
} from "@/types/cost/supplier-ledger-type";
import { supplierApi } from "@/api/cost/supplier-ledger-api";

// Props
interface Props {
  modelValue: boolean;
  editData?: SupplierPerf | null;
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
  return isEditMode.value ? "编辑项目业绩" : "新增项目业绩";
});

// 表单数据
const formData = ref<SupplierPerfSaveParams>({
  supId: props.supId,
  projName: "",
  companyName: "",
  conAmount: 0,
  conDesc: "",
  startDate: undefined,
  endDate: undefined,
  annexId: undefined,
});

// 表单验证规则（全部必填）
const formRules: FormRules = {
  projName: [
    { required: true, message: "请输入项目名称", trigger: "blur" },
    { min: 1, max: 100, message: "长度在 1 到 100 个字符", trigger: "blur" },
  ],
  companyName: [
    { required: true, message: "请输入合作单位", trigger: "blur" },
    { min: 1, max: 100, message: "长度在 1 到 100 个字符", trigger: "blur" },
  ],
  conAmount: [
    { required: true, message: "请输入合同金额", trigger: "blur" },
    {
      type: "number",
      min: 0,
      message: "合同金额必须大于等于0",
      trigger: "blur",
    },
  ],
  conDesc: [
    { required: true, message: "请输入合同概述", trigger: "blur" },
    { min: 1, max: 500, message: "长度在 1 到 500 个字符", trigger: "blur" },
  ],
  startDate: [
    { required: true, message: "请选择开始日期", trigger: "change" },
    {
      validator: (_rule, value, callback) => {
        if (formData.value.startDate && formData.value.endDate) {
          if (formData.value.startDate > formData.value.endDate) {
            callback(new Error("开始日期不能大于结束日期"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
  endDate: [
    { required: true, message: "请选择结束日期", trigger: "change" },
    {
      validator: (_rule, value, callback) => {
        if (formData.value.startDate && formData.value.endDate) {
          if (formData.value.startDate > formData.value.endDate) {
            callback(new Error("结束日期不能小于开始日期"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
  annexId: [
    { required: true, message: "请输入附件ID", trigger: "blur" },
    {
      type: "number",
      min: 1,
      message: "附件ID必须大于0",
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
          projName: props.editData.projName,
          companyName: props.editData.companyName,
          conAmount: props.editData.conAmount,
          conDesc: props.editData.conDesc,
          startDate: props.editData.startDate || undefined,
          endDate: props.editData.endDate || undefined,
          annexId: props.editData.annexId || undefined,
        };
      } else {
        // 新增：重置表单
        formData.value = {
          supId: props.supId,
          projName: "",
          companyName: "",
          conAmount: 0,
          conDesc: "",
          startDate: undefined,
          endDate: undefined,
          annexId: undefined,
        };
        formRef.value?.clearValidate();
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
      ? supplierApi.editPerf
      : supplierApi.addPerf;
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
.form-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
:deep(.el-textarea__inner) {
  resize: none;
}
</style>
