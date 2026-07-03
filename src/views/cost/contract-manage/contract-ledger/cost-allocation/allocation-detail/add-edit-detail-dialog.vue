<!-- 新增/编辑 成本分摊明细弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="dialogTitle"
    width="800px"
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
        label-width="140px"
        label-position="right"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="subId" label="成本科目" required>
              <el-select
                v-model="formData.subId"
                placeholder="请选择成本科目"
                style="width: 100%"
                filterable
                @change="changeSubject"
              >
                <el-option
                  v-for="item in props.subjectOptions"
                  :key="item.id"
                  :label="item.subName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="prodId" label="产品业态" required>
              <el-select
                v-model="formData.prodId"
                placeholder="请选择产品业态"
                style="width: 100%"
                filterable
                @change="changeProduct"
              >
                <el-option
                  v-for="item in props.productOptions"
                  :key="item.id"
                  :label="item.prodName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item prop="allocAmt" label="分摊金额(含税)" required>
              <el-input-number
                v-model="formData.allocAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入分摊金额(含税)"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="allocExclAmt" label="分摊金额(不含税)" required>
              <el-input-number
                v-model="formData.allocExclAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入分摊金额(不含税)"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item prop="allocWarn" label="分摊预警" required>
              <el-select
                v-model="formData.allocWarn"
                placeholder="请选择分摊预警"
                style="width: 100%"
              >
                <el-option
                  v-for="item in props.allocWarnOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { costAllocationApi } from "@/api/cost/contract-manage/cost-allocation-api";

interface Props {
  modelValue: boolean;
  projId?: number; // 项目ID，用于获取科目和业态数据
  allocMid?: number; // 主表ID，新增时从主表传入
  editData?: any | null; // 编辑时的明细数据
  allocWarnOptions: any[]; // 分摊预警选项
  subjectOptions: any[]; // 成本科目选项
  productOptions: any[]; // 产品业态选项
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  projId: undefined,
  allocMid: 0,
  editData: null,
  allocWarnOptions: () => [],
  subjectOptions: () => [],
  productOptions: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

// 表单数据
const formData = ref({
  id: undefined as number | undefined,
  allocMid: undefined, // 主表ID
  subId: undefined, // 成本科目ID
  prodId: undefined, // 产品业态ID
  allocAmt: 0, // 分摊金额(含税)
  allocExclAmt: 0, // 分摊金额(不含税)
  allocWarn: undefined as number | undefined, // 分摊预警
  subName: "", // 科目名称
  prodName: "", // 业态名称
});

// 表单校验规则
const formRules: FormRules = {
  subId: [{ required: true, message: "请选择成本科目", trigger: "change" }],
  prodId: [{ required: true, message: "请选择产品业态", trigger: "change" }],
  allocAmt: [
    { required: true, message: "请输入分摊金额(含税)", trigger: "change" },
    {
      type: "number",
      min: 0,
      message: "分摊金额不能小于0",
      trigger: "change",
    },
  ],
  allocExclAmt: [
    { required: true, message: "请输入分摊金额(不含税)", trigger: "change" },
    {
      type: "number",
      min: 0,
      message: "分摊金额不能小于0",
      trigger: "change",
    },
  ],
  allocWarn: [{ required: true, message: "请选择分摊预警", trigger: "change" }],
};

// 是否为编辑模式
const isEditMode = computed(() => !!props.editData?.id);

// 弹窗标题
const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑成本分摊明细" : "新增成本分摊明细";
});

// 选择成本科目
const changeSubject = (val: number) => {
  const selected = props.subjectOptions.find((item) => item.id === val);
  formData.value.subName = selected ? selected.subName : "";
};

// 选择产品业态
const changeProduct = (val: number) => {
  const selected = props.productOptions.find((item) => item.id === val);
  formData.value.prodName = selected ? selected.prodName : "";
};

// 初始化表单数据
const initFormData = async () => {
  if (isEditMode.value && props.editData) {
    // 编辑模式：回显数据
    formData.value = {
      id: props.editData.id,
      allocMid: props.editData.allocMid || props.allocMid || 0,
      subId: props.editData.subId || 0,
      subName: props.editData.subName || "",
      prodId: props.editData.prodId || 0,
      prodName: props.editData.prodName || "",
      allocAmt: props.editData.allocAmt || 0,
      allocExclAmt: props.editData.allocExclAmt || 0,
      allocWarn: props.editData.allocWarn,
    };
  } else {
    // 新增模式
    formData.value = {
      id: undefined,
      allocMid: props.allocMid || undefined,
      subId: undefined,
      subName: "",
      prodId: undefined,
      prodName: "",
      allocAmt: 0,
      allocExclAmt: 0,
      allocWarn: undefined,
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
    // submitLoading.value = true;

    // 准备提交数据
    const submitData = {
      id: formData.value.id,
      allocMid: formData.value.allocMid,
      subId: formData.value.subId,
      prodId: formData.value.prodId,
      allocAmt: formData.value.allocAmt,
      allocExclAmt: formData.value.allocExclAmt,
      allocWarn: formData.value.allocWarn,
      subName: formData.value.subName,
      prodName: formData.value.prodName,
    };
    let res;
    if (isEditMode.value) {
      res = await costAllocationApi.editProjectAllocD(submitData);
    } else {
      res = await costAllocationApi.addProjectAllocD(submitData);
    }
    if (res.code === 200) {
      ElMessage.success(isEditMode.value ? "修改成功" : "保存成功");
      emit("success");
      handleClose();
    } else {
      ElMessage.error(res.msg || "操作失败");
    }
  } catch (error) {
    console.error("提交失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  async (val) => {
    dialogVisible.value = val;
    if (val) {
      await initFormData();
    }
  },
  { immediate: true },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
</script>

<style lang="scss" scoped>
:deep(.el-textarea__inner) {
  resize: none;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
