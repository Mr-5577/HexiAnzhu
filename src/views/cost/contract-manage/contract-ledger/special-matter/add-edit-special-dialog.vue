<!-- 新增/编辑 特殊事项弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="dialogTitle"
    width="700px"
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
        label-width="130px"
        label-position="right"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="signAmt" label="合同签约金额" required>
              <el-input-number
                v-model="formData.signAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入合同签约金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="totalProdVal" label="合同总产值" required>
              <el-input-number
                v-model="formData.totalProdVal"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入合同总产值"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item prop="totalPayable" label="总应付金额" required>
              <el-input-number
                v-model="formData.totalPayable"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入总应付金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="totalPaid" label="总已付金额" required>
              <el-input-number
                v-model="formData.totalPaid"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入总已付金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item prop="totalOwed" label="总欠款金额" required>
              <el-input-number
                v-model="formData.totalOwed"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入总欠款金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="specialDesc" label="特殊说明" required>
              <el-input
                v-model="formData.specialDesc"
                type="textarea"
                placeholder="请输入特殊说明"
                :rows="4"
                maxlength="500"
                show-word-limit
                style="width: 100%"
              />
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
import {
  ContractSpecial,
  SpecialInfo,
} from "@/types/cost/contract-manage/special-matter-type";
import { specialMatterApi } from "@/api/cost/contract-manage/special-matter-api";

interface Props {
  modelValue: boolean;
  conId?: number;
  editData?: ContractSpecial | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  conId: undefined,
  editData: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

// 表单数据
const formData = ref<SpecialInfo>({
  id: undefined,
  conBillId: 0,
  status: 0, // 状态：0-草稿，5-审批中，10-已审批，30-已作废
  signAmt: 0, // 合同签约金额
  totalProdVal: 0, // 合同总产值
  totalPayable: 0, // 总应付
  totalPaid: 0, // 总已付
  totalOwed: 0, // 总欠款
  specialDesc: "", // 特殊情况说明
});

// 表单校验规则
const formRules: FormRules = {
  signAmt: [
    { required: true, message: "请输入合同签约金额", trigger: "change" },
    {
      type: "number",
      min: 0,
      message: "合同签约金额不能小于0",
      trigger: "change",
    },
  ],
  totalProdVal: [
    { required: true, message: "请输入合同总产值", trigger: "change" },
    {
      type: "number",
      min: 0,
      message: "合同总产值不能小于0",
      trigger: "change",
    },
  ],
  totalPayable: [
    { required: true, message: "请输入总应付", trigger: "change" },
    {
      type: "number",
      min: 0,
      message: "总应付不能小于0",
      trigger: "change",
    },
  ],
  totalPaid: [
    { required: true, message: "请输入总已付", trigger: "change" },
    {
      type: "number",
      min: 0,
      message: "累计变更签证不能小于0",
      trigger: "change",
    },
  ],
  totalOwed: [
    { required: true, message: "请输入总欠款金额", trigger: "change" },
    {
      type: "number",
      min: 0,
      message: "总欠款金额不能小于0",
      trigger: "change",
    },
  ],
  specialDesc: [
    { required: true, message: "请输入特殊说明", trigger: "blur" },
    { max: 500, message: "特殊说明不能超过500个字符", trigger: "blur" },
  ],
};

// 是否为编辑模式
const isEditMode = computed(() => !!props.editData?.id);

// 弹窗标题
const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑特殊事项" : "新增特殊事项";
});

// 初始化表单数据
const initFormData = () => {
  if (isEditMode.value && props.editData) {
    formData.value = {
      id: props.editData.id,
      conBillId: props.editData.conBillId,
      status: props.editData.status ?? 0,
      signAmt: props.editData.signAmt ?? 0,
      totalProdVal: props.editData.totalProdVal ?? 0,
      totalPayable: props.editData.totalPayable ?? 0,
      totalPaid: props.editData.totalPaid ?? 0,
      totalOwed: props.editData.totalOwed ?? 0,
      specialDesc: props.editData.specialDesc ?? "",
    };
  } else {
    formData.value = {
      id: undefined,
      conBillId: props.conId || null,
      status: 0, // 状态：0-草稿，5-审批中，10-已审批，30-已作废
      signAmt: 0, // 合同签约金额
      totalProdVal: 0, // 合同总产值
      totalPayable: 0, // 总应付
      totalPaid: 0, // 总已付
      totalOwed: 0, // 总欠款
      specialDesc: "", // 特殊情况说明
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
    submitLoading.value = true;

    if (isEditMode.value) {
      const res = await specialMatterApi.editSpecial(formData.value);
      if (res.code === 200) {
        ElMessage.success("修改成功");
        emit("success");
        handleClose();
      }
    } else {
      const params = {
        conId: props.conId,
        special: formData.value,
      };
      const res = await specialMatterApi.addSpecial(params);
      if (res.code === 200) {
        ElMessage.success("保存成功");
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

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      initFormData();
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

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
