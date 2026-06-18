<!-- 新增/编辑 服务板块弹窗 -->
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
      <!-- 服务板块 -->
      <el-form-item prop="segId" label="服务板块" required>
        <el-select
          v-model="formData.segId"
          placeholder="请选择服务板块"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in segmentOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 备注 -->
      <el-form-item prop="remark" label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注信息"
          :rows="4"
          maxlength="500"
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
  SupplierSegment,
  SupplierSegmentSaveParams,
} from "@/types/cost/supplier/supplier-ledger-type";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";

// Props
interface Props {
  modelValue: boolean;
  editData?: SupplierSegment | null;
  supId: number | null;
  segmentOptions: Array<{ value: number; label: string }>;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  editData: null,
  supId: null,
  segmentOptions: () => [],
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
  return isEditMode.value ? "编辑服务板块" : "新增服务板块";
});

// 表单数据
const formData = ref<SupplierSegmentSaveParams>({
  supId: props.supId,
  segId: null,
  remark: "",
});

// 表单验证规则
const formRules: FormRules = {
  segId: [
    { required: true, message: "请选择服务板块", trigger: "change" },
    {
      validator: (_rule: any, value: number, callback: any) => {
        if (!value) {
          callback(new Error("请选择服务板块"));
        } else {
          callback();
        }
      },
      trigger: "change",
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
          segId: props.editData.segId,
          remark: props.editData.remark || "",
        };
      } else {
        // 新增：重置表单
        formData.value = {
          supId: props.supId,
          segId: null,
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
      ? supplierApi.editSeg
      : supplierApi.addSeg;
    const res = await interfaceApi(formData.value);
    if (res.code === 200) {
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
:deep(.el-textarea__inner) {
  resize: none;
}
</style>
