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
    >
      <el-form-item prop="verTypeId" label="版本类型" required>
        <el-select
          v-model="formData.verTypeId"
          placeholder="请选择版本类型"
          style="width: 100%"
        >
          <el-option
            v-for="item in props.verTypeList"
            :key="item.id"
            :label="item.dicLabel"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="verTitle" label="版本标题" required>
        <el-input
          v-model="formData.verTitle"
          placeholder="请输入版本标题"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item prop="remark" label="版本说明">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入版本说明"
          maxlength="200"
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
  ProjectAreaVersion,
  ProjectAreaVersionSaveParams,
  VersionTypeOption,
} from "@/types/cost/project-area-type";
import { projectAreaApi } from "@/api/cost/project-area-api";

const props = defineProps<{
  modelValue: boolean;
  projectId: number;
  editData?: ProjectAreaVersion | null;
  verTypeList: VersionTypeOption[];
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
  isEditMode.value ? "编辑版本" : "创建版本",
);

const formData = ref<ProjectAreaVersionSaveParams>({
  projId: props.projectId,
  verTypeId: null,
  verTitle: "",
  isEnabled: false,
  remark: "",
});

const formRules: FormRules = {
  verTypeId: [{ required: true, message: "请选择版本类型", trigger: "blur" }],
  verTitle: [
    { required: true, message: "请输入版本标题", trigger: "blur" },
    { min: 2, max: 100, message: "长度在 2 到 100 个字符", trigger: "blur" },
  ],
};

const handleClose = () => {
  visible.value = false;
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const submitData = { ...formData.value };
    
    if (!isEditMode.value) {
      delete submitData.id;
    }
    let res;
    if (isEditMode.value) {
      res = await projectAreaApi.editAreaVerM(submitData);
    } else {
      res = await projectAreaApi.addAreaVerM(submitData);
    }
    if (res.code === 200) {
      ElMessage.success(dialogTitle.value + "成功");
      visible.value = false;
      emit("success");
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
    visible.value = val;
    if (val) {
      // 编辑
      if (isEditMode.value && props.editData) {
        formData.value = {
          id: props.editData.id,
          projId: props.editData.projId,
          verTypeId: props.editData.verTypeId,
          verTitle: props.editData.verTitle,
          isEnabled: props.editData.isEnabled,
          remark: props.editData.remark || "",
        };
      } else {
        // 新增
        formData.value = {
          projId: props.projectId,
          verTypeId: null,
          verTitle: "",
          isEnabled: false,
          remark: "",
        };
        formRef.value?.resetFields();
      }
    }
  },
);

watch(visible, (val) => emit("update:modelValue", val));
</script>

<style lang="scss" scoped></style>
