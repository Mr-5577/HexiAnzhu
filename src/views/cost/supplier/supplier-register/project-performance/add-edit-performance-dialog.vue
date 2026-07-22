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
          />
        </el-form-item>
        <el-form-item prop="companyName" label="合作单位" required>
          <el-input
            v-model="formData.companyName"
            placeholder="请输入合作单位"
            clearable
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
          <base-upload
            v-model:file-list="tempFileList"
            :limit="1"
            :multiple="false"
            :showIcon="true"
            :showTip="true"
            accept=".doc,.docx,.xls,.xlsx"
            button-text="选择文件"
            size="default"
            @remove="handleRemove"
            @success="uploadSuccess"
          />
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
} from "@/types/cost/supplier/supplier-ledger-type";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import { commonApi } from "@/api/cost/common-api";
import BaseUpload from "@/components/base/base-upload.vue";

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

const tempFileList = ref([]);
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

const formRules: FormRules = {
  projName: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  companyName: [{ required: true, message: "请输入合作单位", trigger: "blur" }],
  conAmount: [
    { required: true, message: "请输入合同金额", trigger: "blur" },
    {
      type: "number",
      min: 0,
      message: "合同金额必须大于等于0",
      trigger: "blur",
    },
  ],
  conDesc: [{ required: true, message: "请输入合同概述", trigger: "blur" }],
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
  annexId: [{ required: true, message: "请上传相关附件", trigger: "blur" }],
};

// 附件上传成功
const uploadSuccess = (file: any) => {
  console.log("文件上传成功", file);
  if (file && file.id) {
    formData.value.annexId = file.id;
  }
};
// 附件移除
const handleRemove = (file: any) => {
  console.log("文件移除", file);
  if (file) {
    formData.value.annexId = undefined;
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
  console.log("提交表单", tempFileList.value);
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;
    const interfaceApi = isEditMode.value
      ? supplierApi.editPerf
      : supplierApi.addPerf;
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
          projName: props.editData.projName,
          companyName: props.editData.companyName,
          conAmount: props.editData.conAmount,
          conDesc: props.editData.conDesc,
          startDate: props.editData.startDate || undefined,
          endDate: props.editData.endDate || undefined,
          annexId: props.editData.annexId || undefined,
        };
        // 获取附件信息回显附件
        getAttachmentInfo();
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
