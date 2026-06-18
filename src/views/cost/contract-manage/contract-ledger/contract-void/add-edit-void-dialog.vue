<!-- 新增/编辑 合同解除弹窗 -->
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
        label-width="120px"
        label-position="right"
      >
        <!-- 第一行：合同签约金额 + 累计产值 -->
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
            <el-form-item prop="sumProdVal" label="累计产值" required>
              <el-input-number
                v-model="formData.sumProdVal"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入累计产值"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行：累计请款 + 经办人 -->
        <el-row>
          <el-col :span="12">
            <el-form-item prop="sumAppyAmt" label="累计请款" required>
              <el-input-number
                v-model="formData.sumAppyAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入累计请款"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="agentId" label="经办人">
              <el-select
                v-model="formData.agentId"
                placeholder="请选择经办人"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="item in agentOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行：作废日期 -->
        <el-row>
          <el-col :span="12">
            <el-form-item prop="voidDate" label="作废日期" required>
              <el-date-picker
                v-model="formData.voidDate"
                type="date"
                placeholder="请选择作废日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 状态字段（隐藏，由审批流程控制） -->
            <el-form-item prop="status" label="状态" v-if="false">
              <el-input v-model="formData.status" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行：作废说明 -->
        <el-row>
          <el-col :span="24">
            <el-form-item prop="voidDesc" label="作废说明" required>
              <el-input
                v-model="formData.voidDesc"
                type="textarea"
                placeholder="请输入作废说明"
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
import type { ContractVoidParams } from "@/types/cost/contract-manage/contract-void-type";
import { contractVoidApi } from "@/api/cost/contract-manage/contract-void-api";

interface Props {
  modelValue: boolean;
  conId?: number;
  editData?: ContractVoidParams | null;
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

// 经办人选项
const agentOptions = ref<Array<{ id: number; name: string }>>([
  { id: 1, name: "张三" },
  { id: 2, name: "李四" },
  { id: 3, name: "王五" },
]);

// 表单数据
const formData = ref<ContractVoidParams>({
  id: undefined,
  conBillId: null,
  status: 0,
  signAmt: 0,
  sumProdVal: 0,
  sumAppyAmt: 0,
  agentId: undefined,
  voidDate: "",
  voidDesc: "",
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
  sumProdVal: [
    { required: true, message: "请输入累计产值", trigger: "change" },
    { type: "number", min: 0, message: "累计产值不能小于0", trigger: "change" },
  ],
  sumAppyAmt: [
    { required: true, message: "请输入累计请款", trigger: "change" },
    { type: "number", min: 0, message: "累计请款不能小于0", trigger: "change" },
  ],
  voidDate: [{ required: true, message: "请选择作废日期", trigger: "change" }],
  voidDesc: [
    { required: true, message: "请输入作废说明", trigger: "blur" },
    { max: 500, message: "作废说明不能超过500个字符", trigger: "blur" },
  ],
};

// 是否为编辑模式
const isEditMode = computed(() => !!props.editData?.id);

// 弹窗标题
const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑合同解除" : "新增合同解除";
});

// 初始化表单数据
const initFormData = () => {
  if (isEditMode.value && props.editData) {
    formData.value = {
      id: props.editData.id,
      conBillId: props.editData.conBillId,
      status: props.editData.status || 0,
      signAmt: props.editData.signAmt || 0,
      sumProdVal: props.editData.sumProdVal || 0,
      sumAppyAmt: props.editData.sumAppyAmt || 0,
      agentId: props.editData.agentId,
      voidDate: props.editData.voidDate || "",
      voidDesc: props.editData.voidDesc || "",
    };
  } else {
    formData.value = {
      id: undefined,
      conBillId: props.conId,
      status: 0,
      signAmt: 0,
      sumProdVal: 0,
      sumAppyAmt: 0,
      agentId: undefined,
      voidDate: "",
      voidDesc: "",
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

    const interfaceApi = isEditMode.value
      ? contractVoidApi.editVoid
      : contractVoidApi.addVoid;

    const res = await interfaceApi(formData.value);

    if (res.code === 200) {
      ElMessage.success(isEditMode.value ? "修改成功" : "新增成功");
      emit("success");
      handleClose();
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
