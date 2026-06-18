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
      label-width="110px"
      class="unit-form"
    >
      <el-form-item prop="mguName" label="管理单元名称" required>
        <el-input
          v-model="formData.mguName"
          placeholder="请输入管理单元名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item prop="mguShortname" label="管理单元简称" required>
        <el-input
          v-model="formData.mguShortname"
          placeholder="请输入管理单元简称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item prop="mguNo" label="组织编码" required>
        <el-input
          v-model="formData.mguNo"
          placeholder="请输入组织编码"
          maxlength="50"
          show-word-limit
        />
        <div class="form-tip">建议使用英文、数字、下划线命名</div>
      </el-form-item>

      <el-form-item prop="segId" label="业务板块" required>
        <el-select
          v-model="formData.segId"
          placeholder="请选择业务板块"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in props.segOptions"
            :key="item.id"
            :label="item.segName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item prop="sort" label="排序">
        <el-input-number
          v-model="formData.sort"
          :min="1"
          :max="999"
          controls-position="right"
          placeholder="数字越小越靠前"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item prop="memo" label="说明">
        <el-input
          v-model="formData.memo"
          type="textarea"
          :rows="3"
          placeholder="请输入说明"
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
import {
  ManageUnitFormData,
  ManageUnitTreeNode,
} from "@/types/cost/master-data/management-unit-type";
import { manageunitApi } from "@/api/cost/master-data/management-unit-api";

const props = defineProps<{
  modelValue: boolean;
  editData?: ManageUnitTreeNode | null;
  parentId?: number;
  segOptions?: any[];
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
  isEditMode.value ? "编辑管理单元" : "新增管理单元",
);

const formData = ref<ManageUnitFormData>({
  pid: 0,
  mguName: "",
  mguShortname: "",
  mguNo: "",
  segId: null,
  memo: "",
  sort: 999,
});
const validateCode = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error("请输入组织编码"));
  } else if (!/^[A-Za-z][A-Za-z0-9_]*$/i.test(value)) {
    callback(new Error("字典编码只能包含字母、数字和下划线，且必须以字母开头"));
  } else {
    callback();
  }
};
const formRules: FormRules = {
  mguName: [{ required: true, message: "请输入管理单元名称", trigger: "blur" }],
  segId: [{ required: true, message: "请选择业务板块", trigger: "blur" }],
  mguNo: [
    { required: true, message: "请输入组织编码", trigger: "blur" },
    { validator: validateCode, trigger: ["blur", "change"] },
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
      res = await manageunitApi.editManageunit(submitData);
    } else {
      res = await manageunitApi.addManageunit(submitData);
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
  async (val) => {
    visible.value = val;
    if (val) {
      if (isEditMode.value && props.editData) {
        formData.value = {
          id: props.editData.id,
          pid: props.editData.pid,
          mguName: props.editData.mguName,
          mguShortname: props.editData.mguShortname,
          mguNo: props.editData.mguNo,
          segId: props.editData.segId,
          memo: props.editData.memo,
          sort: props.editData.sort,
        };
      } else {
        formData.value = {
          pid: props.parentId || 0,
          mguName: "",
          mguShortname: "",
          mguNo: "",
          segId: null,
          memo: "",
          sort: 999,
        };
        formRef.value?.resetFields();
      }
    }
  },
);

watch(visible, (val) => emit("update:modelValue", val));
</script>
<style lang="scss" scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 4px;
}
</style>
