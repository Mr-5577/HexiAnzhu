<!-- 目标成本明细 新增/编辑弹窗 -->
<template>
  <base-modal
    v-model="visible"
    :title="dialogTitle"
    width="900px"
    :confirm-loading="submitLoading"
    @confirm="handleSubmit"
    @cancel="handleClose"
  >
    <div class="form-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="160px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="costMid" label="目标成本版本" required>
              <el-select
                v-model="formData.costMid"
                placeholder="请选择目标成本版本"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="item in props.costVersionOptions"
                  :key="item.id"
                  :label="item.versionNo"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="subId" label="成本科目" required>
              <el-select
                v-model="formData.subId"
                placeholder="请选择成本科目"
                clearable
                style="width: 100%"
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
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="prodId" label="业态" required>
              <el-select
                v-model="formData.prodId"
                placeholder="请选择业态"
                style="width: 100%"
                filterable
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
          <el-col :span="12">
            <el-form-item prop="busiSegId" label="业务归属" required>
              <el-select
                v-model="formData.busiSegId"
                placeholder="请选择业务归属"
                style="width: 100%"
              >
                <el-option
                  v-for="item in busiSegOptions"
                  :key="item.id"
                  :label="item.dicLabel"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="allocRule" label="分摊规则" required>
              <el-select
                v-model="formData.allocRule"
                placeholder="请选择分摊规则"
                style="width: 100%"
              >
                <el-option
                  v-for="item in allocRuleOptions"
                  :key="item.dicCode"
                  :label="item.dicLabel"
                  :value="item.dicCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="costAmt" label="目标成本总额(含税)">
              <el-input-number
                v-model="formData.costAmt"
                :precision="2"
                :min="0"
                placeholder="请输入目标成本总额(含税)"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="costExclAmt" label="目标成本总额(不含税)">
              <el-input-number
                v-model="formData.costExclAmt"
                :precision="2"
                :min="0"
                placeholder="请输入目标成本总额(不含税)"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="costDynAmt" label="动态成本总额(含税)">
              <el-input-number
                v-model="formData.costDynAmt"
                :precision="2"
                :min="0"
                placeholder="请输入动态成本总额(含税)"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="costDynExclAmt" label="动态成本总额(不含税)">
              <el-input-number
                v-model="formData.costDynExclAmt"
                :precision="2"
                :min="0"
                placeholder="请输入动态成本总额(不含税)"
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
import type {
  HCstProjectCostDAddEditParams,
  HCstProjectCostM,
} from "@/types/cost/cost-setting/goal-cost-type";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";

const props = defineProps<{
  modelValue: boolean;
  projectId: number;
  editData?: HCstProjectCostDAddEditParams | null;
  costVersionOptions: HCstProjectCostM[]; // 目标成本版本选项
  subjectOptions: any[]; // 成本科目选项
  productOptions: any[]; // 业态选项
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const visible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

// 业务归属选项
const busiSegOptions = ref([]);
// 分摊规则选项
const allocRuleOptions = ref([]);
// 数据字典
const { getDictList, loadDicts } = useDict(
  [
    dictMapping.allocationRule, // 分摊规则
    dictMapping.businessSegment, // 业务归属
  ],
  {
    treeDictCodes: [],
  },
);

const isEditMode = computed(() => !!props.editData?.id);
const dialogTitle = computed(() =>
  isEditMode.value ? "编辑目标成本明细" : "新增目标成本明细",
);

const formData = ref<HCstProjectCostDAddEditParams>({
  costMid: undefined,
  subId: undefined,
  prodId: undefined,
  busiSegId: undefined,
  costAmt: 0,
  costExclAmt: 0,
  costDynAmt: 0,
  costDynExclAmt: 0,
  allocRule: "",
});

// 表单验证规则
const formRules: FormRules = {
  costMid: [
    { required: true, message: "请选择目标成本版本", trigger: "change" },
  ],
  subId: [{ required: true, message: "请选择科目", trigger: "change" }],
  prodId: [{ required: true, message: "请选择业态", trigger: "change" }],
  busiSegId: [{ required: true, message: "请选择业务归属", trigger: "change" }],
  allocRule: [{ required: true, message: "请选择分摊规则", trigger: "change" }],
  costAmt: [
    { required: true, message: "请输入目标成本总额", trigger: "blur" },
    {
      type: "number",
      min: 0,
      message: "目标成本总额不能小于0",
      trigger: "blur",
    },
  ],
  costExclAmt: [
    { required: true, message: "请输入目标成本总额(不含税)", trigger: "blur" },
    {
      type: "number",
      min: 0,
      message: "目标成本总额不能小于0",
      trigger: "blur",
    },
  ],
  costDynAmt: [
    { required: true, message: "请输入动态成本总额", trigger: "blur" },
    {
      type: "number",
      min: 0,
      message: "动态成本总额不能小于0",
      trigger: "blur",
    },
  ],
  costDynExclAmt: [
    { required: true, message: "请输入动态成本总额(不含税)", trigger: "blur" },
    {
      type: "number",
      min: 0,
      message: "动态成本总额不能小于0",
      trigger: "blur",
    },
  ],
};

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const submitData = { ...formData.value };

    let res;
    if (isEditMode.value && props.editData?.id) {
      submitData.id = props.editData.id;
      res = await goalCostApi.editProjectCostD(submitData);
    } else {
      res = await goalCostApi.addProjectCostD(submitData);
    }

    if (res.code === 200) {
      ElMessage.success(dialogTitle.value + "成功");
      visible.value = false;
      emit("success");
    } else {
      ElMessage.error(res.message || dialogTitle.value + "失败");
    }
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

// 初始化数据字典数据
const initDictData = async () => {
  await loadDicts();
  busiSegOptions.value = getDictList(dictMapping.businessSegment); // 业务归属
  allocRuleOptions.value = getDictList(dictMapping.allocationRule); // 分摊规则
};

// 初始化表单数据
const initForm = () => {
  if (isEditMode.value && props.editData) {
    formData.value = {
      id: props.editData.id,
      costMid: props.editData.costMid,
      subId: props.editData.subId,
      prodId: props.editData.prodId,
      busiSegId: props.editData.busiSegId,
      costAmt: props.editData.costAmt,
      costExclAmt: props.editData.costExclAmt,
      costDynAmt: props.editData.costDynAmt,
      costDynExclAmt: props.editData.costDynExclAmt,
      allocRule: props.editData.allocRule,
    };
  } else {
    // 新增模式：重置表单
    formData.value = {
      costMid: undefined,
      subId: undefined,
      prodId: undefined,
      busiSegId: undefined,
      costAmt: 0,
      costExclAmt: 0,
      costDynAmt: 0,
      costDynExclAmt: 0,
      allocRule: "",
    };
    setTimeout(() => {
      formRef.value?.resetFields();
      formRef.value?.clearValidate();
    }, 0);
  }
};

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val;
    if (val) {
      await initDictData();
      initForm();
    }
  },
);

// 同步 visible 到父组件
watch(visible, (val) => emit("update:modelValue", val));
</script>

<style lang="scss" scoped>
.form-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}
</style>
