<!-- 变更指令 发起流程 弹窗 -->
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
        label-width="120px"
        label-position="right"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="changeType" label="变更类型" required>
              <el-select
                v-model="formData.changeType"
                placeholder="请选择变更类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in ChangeTypeEnum"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="changeName" label="变更名称" required>
              <el-input
                v-model="formData.changeName"
                clearable
                placeholder="请选择变更名称"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="changeReasonId" label="变更原因" required>
              <el-select
                v-model="formData.changeReasonId"
                placeholder="请选择变更原因"
                style="width: 100%"
              >
                <el-option
                  v-for="item in changeReasonOptions"
                  :key="item.id"
                  :label="item.dicLabel"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="changeAmt" label="变更总金额" required>
              <el-input-number
                v-model="formData.changeAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入变更总金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="changeReasonDesc" label="变更原因说明">
              <el-input
                v-model="formData.changeReasonDesc"
                type="textarea"
                placeholder="请输入变更原因说明"
                :rows="3"
                maxlength="500"
                show-word-limit
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="changeConent" label="变更内容">
              <el-input
                v-model="formData.changeConent"
                type="textarea"
                placeholder="请输入变更内容"
                :rows="3"
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
import { ChangeTypeEnum } from "@/constants/contract-manage/enums";
import { ContractChange } from "@/types/cost/contract-manage/change-order";
import { changeOrderApi } from "@/api/cost/contract-manage/change-order-api";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";

interface Props {
  modelValue: boolean;
  editData?: ContractChange | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  editData: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
// 变更原因列表
const changeReasonOptions = ref([]);

// 数据字典
const { getDictList, loadDicts } = useDict([dictMapping.changeReason], {
  treeDictCodes: [],
});

const formData = ref<ContractChange>({
  id: null,
  conBillId: null, // 单据ID
  status: null, // 状态
  statusName: "", // 状态名称
  changeName: "", // 变更名称
  changeType: null, // 变更类型
  changeTypeName: "", // 变更类型名称
  changeReasonId: null, // 变更原因ID
  changeReasonName: "", // 变更原因名称
  changeReasonDesc: "", // 变更原因说明
  changeConent: "", // 变更内容
  changeAmt: null, // 变更总金额
});

const formRules: FormRules = {
  changeName: [
    { required: true, message: "请输入变更名称", trigger: "change" },
  ],
  changeType: [
    { required: true, message: "请选择变更类型", trigger: "change" },
  ],
  changeReasonId: [
    { required: true, message: "请选择变更原因", trigger: "change" },
  ],
  changeAmt: [
    { required: true, message: "请输入变更总金额", trigger: "change" },
  ],
};

const isEditMode = computed(() => !!props.editData?.id);

const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑变更申请" : "发起变更申请";
});

const initFormData = () => {
  if (isEditMode.value && props.editData) {
    formData.value = {
      id: props.editData.id,
      conBillId: props.editData.conBillId,
      status: props.editData.status,
      statusName: props.editData.statusName,
      changeName: props.editData.changeName,
      changeType: props.editData.changeType,
      changeTypeName: props.editData.changeTypeName,
      changeReasonId: props.editData.changeReasonId,
      changeReasonName: props.editData.changeReasonName,
      changeReasonDesc: props.editData.changeReasonDesc,
      changeConent: props.editData.changeConent,
      changeAmt: props.editData.changeAmt,
    };
  } else {
    formData.value = {
      id: null,
      conBillId: null,
      status: null,
      statusName: "",
      changeName: "",
      changeType: null,
      changeTypeName: "",
      changeReasonId: null,
      changeReasonName: "",
      changeReasonDesc: "",
      changeConent: "",
      changeAmt: null,
    };
    setTimeout(() => {
      formRef.value?.clearValidate();
    }, 0);
  }
};
const handleClose = () => {
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
  dialogVisible.value = false;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;
    // const res = await changeOrderApi.addChangeCon(formData.value);
    // if (res.code === 200) {
    //   ElMessage.success("操作成功");
    //   emit("success");
    //   handleClose();
    // }
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};
// 初始化数据字典数据
const initDictData = async () => {
  await loadDicts();
  changeReasonOptions.value = getDictList(dictMapping.changeReason); // 变更原因列表
};

watch(
  () => props.modelValue,
  async (val) => {
    dialogVisible.value = val;
    if (val) {
      await initDictData();
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
</style>
