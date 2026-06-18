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
      <el-form-item prop="bldName" label="楼栋名称" required>
        <el-input
          v-model="formData.bldName"
          placeholder="请输入楼栋名称，如：1#、2#、地下室"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item prop="isUnderGround" label="是否地下室">
        <el-radio-group v-model="formData.isUnderGround">
          <el-radio :value="false">否</el-radio>
          <el-radio :value="true">是</el-radio>
        </el-radio-group>
        <!-- <div class="form-tip">
          标识为地下室的楼栋，面积数据将计入地下面积统计
        </div> -->
      </el-form-item>
    </el-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import type {
  ProjectBuilding,
  ProjectBuildingSaveParams,
} from "@/types/cost/master-data/project-area-type";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";

const props = defineProps<{
  modelValue: boolean;
  projectId: number;
  editData?: ProjectBuilding | null;
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
  isEditMode.value ? "编辑楼栋" : "新增楼栋",
);

const formData = ref<ProjectBuildingSaveParams>({
  projId: props.projectId,
  bldName: "",
  isUnderGround: false,
});

const formRules: FormRules = {
  bldName: [
    { required: true, message: "请输入楼栋名称", trigger: "blur" },
    { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" },
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
          projId: props.editData.projId,
          bldName: props.editData.bldName,
          isUnderGround: props.editData.isUnderGround,
        };
      } else {
        // 新增
        formData.value = {
          projId: props.projectId,
          bldName: "",
          isUnderGround: false,
        };
        formRef.value?.resetFields();
      }
    }
  },
);

watch(visible, (val) => emit("update:modelValue", val));

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
      res = await projectAreaApi.editBuilding(submitData);
    } else {
      res = await projectAreaApi.addBuilding(submitData);
    }
    if (res.code === 200) {
      ElMessage.success(`${dialogTitle.value}成功！`);
      visible.value = false;
      emit("success");
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}
</style>
