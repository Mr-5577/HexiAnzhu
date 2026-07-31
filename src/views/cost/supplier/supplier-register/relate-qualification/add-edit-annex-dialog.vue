<!-- 新增/编辑 供应商资料弹窗 -->
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
      <el-form-item prop="annexType" label="附件类型" required>
        <el-select
          v-model="formData.annexType"
          placeholder="请选择附件类型"
          style="width: 100%"
        >
          <el-option
            v-for="item in props.annexTypeOptions"
            :key="item.id"
            :label="item.dicLabel"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item prop="annexName" label="附件名称" required>
        <el-input
          v-model="formData.annexName"
          placeholder="附件名称"
          disabled
        />
      </el-form-item>
      <el-form-item prop="annexId" label="附件" required>
        <base-upload
          v-model:file-list="tempFileList"
          :limit="1"
          :multiple="false"
          :showIcon="true"
          :showTip="true"
          :unrestricted="true"
          :accept="''"
          button-text="选择文件"
          size="default"
          @remove="handleRemove"
          @success="uploadSuccess"
        />
      </el-form-item>

      <el-form-item prop="remark" label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
          :rows="3"
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
  SupplierAnnex,
  SupplierAnnexSaveParams,
} from "@/types/cost/supplier/supplier-ledger-type";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import BaseUpload from "@/components/base/base-upload.vue";
import { commonApi } from "@/api/cost/common-api";

// Props
interface Props {
  modelValue: boolean;
  annexTypeOptions: any[];
  editData?: SupplierAnnex | null;
  supId: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  annexTypeOptions: () => [],
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
  return isEditMode.value ? "编辑供应商资料" : "新增供应商资料";
});

// 表单数据
const formData = ref<SupplierAnnexSaveParams>({
  supId: props.supId,
  annexId: null,
  annexType: null,
  annexName: "",
  remark: "",
});
const tempFileList = ref([]);

// 表单验证规则
const formRules: FormRules = {
  annexType: [{ required: true, message: "请输入附件类型", trigger: "blur" }],
  annexName: [{ required: true, message: "请输入附件名称", trigger: "blur" }],
  annexId: [{ required: true, message: "请上传相关附件", trigger: "blur" }],
};

// 附件上传成功
const uploadSuccess = (file: any) => {
  console.log("文件上传成功", file);
  tempFileList.value = [file];
  if (file) {
    formData.value.annexId = file.id;
    formData.value.annexName = file.annexName;
  }
};
// 附件移除
const handleRemove = (file: any) => {
  console.log("文件移除", file);
  tempFileList.value = [];
  if (file) {
    formData.value.annexId = undefined;
    formData.value.annexName = "";
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
    const interfaceApi = isEditMode.value
      ? supplierApi.editAnnex
      : supplierApi.addAnnex;
    const res = await interfaceApi(formData.value);
    if (res.code === 200) {
      if (formData.value.annexId > 0) {
        // 成功后再把临时文件转为正式文件
        const enableRes = await commonApi.enableFile({
          annexIds: [formData.value.annexId],
        });
        if (enableRes.code === 200) {
          ElMessage.success(`${isEditMode.value ? "编辑" : "新增"}成功`);
          emit("success");
          handleClose();
        }
      } else {
        ElMessage.success(`${isEditMode.value ? "编辑" : "新增"}成功`);
        emit("success");
        handleClose();
      }
    }
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};
// 获取附件信息回显附件
const getAttachmentInfo = async () => {
  if (props.editData?.annexId) {
    const res = await commonApi.getFileList({
      annexId: props.editData.annexId,
    });
    if (res.code === 200 && res.data) {
      const fileList = res.data || [];
      tempFileList.value = fileList.map((item) => ({
        ...item,
        name: item.annexName,
        url: item.annexPath,
      }));
    }
  }
};

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      tempFileList.value = [];
      if (isEditMode.value && props.editData) {
        // 编辑：回填数据
        formData.value = {
          id: props.editData.id,
          supId: props.editData.supId,
          annexType: Number(props.editData.annexType),
          annexName: props.editData.annexName,
          remark: props.editData.remark || "",
          annexId: props.editData.annexId || undefined,
        };
        getAttachmentInfo();
      } else {
        // 新增：重置表单
        formData.value = {
          supId: props.supId,
          annexId: null,
          annexType: null,
          annexName: "",
          remark: "",
        };
        formRef.value?.clearValidate();
      }
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
</style>
