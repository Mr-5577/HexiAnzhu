<!-- 新增/编辑 合同类型 -->
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
      class="conType-form"
    >
      <el-form-item prop="conTypeName" label="分类名称" required>
        <el-input
          v-model="formData.conTypeName"
          placeholder="请输入分类名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item prop="conTypeCode" label="分类编码" required>
        <el-input
          v-model="formData.conTypeCode"
          placeholder="请输入分类编码"
          maxlength="50"
          show-word-limit
        />
        <div class="form-tip">建议使用英文小写+下划线命名</div>
      </el-form-item>

      <!-- <el-form-item prop="majorId" label="所属职能专业">
        <el-select
          v-model="formData.majorId"
          placeholder="请选择"
          clearable
          style="width: 100%"
        >
          <el-option label="专业1" :value="1" />
          <el-option label="专业2" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item prop="isNeedOutValue" label="是否报产值">
        <el-radio-group v-model="formData.isNeedOutValue">
          <el-radio :value="true">是</el-radio>
          <el-radio :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item> -->

      <el-form-item prop="isEnabled" label="是否启用">
        <el-radio-group v-model="formData.isEnabled">
          <el-radio :value="true">启用</el-radio>
          <el-radio :value="false">停用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item prop="remark" label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import type {
  ContractType,
  ContractTypeSaveParams,
} from "@/types/cost/master-data/contract-category-type";
import { conTypeApi } from "@/api/cost/master-data/contract-category-api";

const props = defineProps<{
  modelValue: boolean;
  editData?: ContractType | null;
  parentId?: number;
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
  isEditMode.value ? "编辑合同类别" : "新增合同类别",
);

const formData = ref<ContractTypeSaveParams>({
  pid: 0,
  conTypeCode: "",
  conTypeName: "",
  majorId: null,
  isNeedOutValue: false,
  isEnabled: true,
  remark: "",
});
const validateCode = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error("请输入类别编码"));
  } else if (!/^[A-Za-z][A-Za-z0-9_]*$/i.test(value)) {
    callback(new Error("字典编码只能包含字母、数字和下划线，且必须以字母开头"));
  } else {
    callback();
  }
};

const formRules: FormRules = {
  conTypeName: [{ required: true, message: "请输入类别名称", trigger: "blur" }],
  conTypeCode: [
    { required: true, message: "请输入类别编码", trigger: "blur" },
    { validator: validateCode, trigger: ["blur", "change"] },
  ],
};

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val) {
      // 编辑
      if (isEditMode.value && props.editData) {
        formData.value = {
          id: props.editData.id,
          pid: props.editData.pid,
          conTypeCode: props.editData.conTypeCode,
          conTypeName: props.editData.conTypeName,
          majorId: props.editData.majorId,
          isNeedOutValue: props.editData.isNeedOutValue,
          isEnabled: props.editData.isEnabled,
          remark: props.editData.remark || "",
        };
      } else {
        // 新增
        formData.value = {
          pid: props.parentId || 0,
          conTypeCode: "",
          conTypeName: "",
          majorId: null,
          isNeedOutValue: false,
          isEnabled: true,
          remark: "",
        };
        formRef.value?.resetFields();
      }
    }
  },
);

watch(visible, (val) => emit("update:modelValue", val));

const handleClose = () => {
  visible.value = false;
};

const handleSubmit = async () => {
  await formRef.value?.validate();
  try {
    submitLoading.value = true;
    let res;
    if (isEditMode.value) {
      res = await conTypeApi.editConType(formData.value);
    } else {
      res = await conTypeApi.addConType(formData.value);
    }
    ElMessage.success(dialogTitle.value + "成功");
    visible.value = false;
    emit("success");
  } finally {
    submitLoading.value = false;
  }
};
</script>
<style lang="scss" scoped>
.conType-form {
  padding: 0 20px;
  box-sizing: border-box;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 4px;
}
</style>
