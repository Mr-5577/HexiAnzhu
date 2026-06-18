<template>
  <base-modal
    v-model="visible"
    :title="'新增合同附件'"
    width="550px"
    :confirm-loading="submitLoading"
    @confirm="handleSubmit"
    @cancel="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="add-attachment-dialog-form"
    >
      <el-form-item prop="annexType" label="附件类型" required>
        <el-select
          v-model="formData.annexType"
          placeholder="请选择附件类型"
          style="width: 100%"
        >
          <el-option
            v-for="item in annexTypeOptions"
            :key="item.id"
            :label="item.dicLabel"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="annexSrc" label="附件来源" required>
        <el-select
          v-model="formData.annexSrc"
          placeholder="请选择附件来源"
          style="width: 100%"
        >
          <el-option
            v-for="item in FileSourceEnum"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="annexId" label="上传附件" required>
        <base-upload></base-upload>
      </el-form-item>
    </el-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { FileSourceEnum } from "@/constants/contract-manage/enums";
import { attachmentApi } from "@/api/cost/contract-manage/attachment-api";
import BaseUpload from "@/components/base/base-upload.vue";

const props = defineProps<{
  modelValue: boolean;
  conId: number | null;
  annexTypeOptions: any[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const visible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const formData = ref({
  conId: null,
  annexType: null, // 附件类型
  annexId: null, // 已关联附件id
  annexSrc: null, // 附件来源
});
const formRules: FormRules = {
  annexType: [{ required: true, message: "请选择附件类型", trigger: "change" }],
  annexSrc: [{ required: true, message: "请选择附件来源", trigger: "change" }],
  annexId: [{ required: true, message: "请选择附件", trigger: "change" }],
};

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
  },
);

watch(visible, (val) => emit("update:modelValue", val));

const handleClose = () => {
  visible.value = false;
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
};

const handleSubmit = async () => {
  console.log("handleSubmit", { ...formData.value, conId: props.conId });
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitLoading.value = true;

    try {
      const params = { ...formData.value, conId: props.conId };
      const res = await attachmentApi.addAnnex(params);
      if (res.code === 200) {
        ElMessage.success("新增成功");
        visible.value = false;
        emit("success");
      }
    } catch (error) {}
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};
</script>
<style lang="scss" scoped>
.add-attachment-dialog-form {
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
