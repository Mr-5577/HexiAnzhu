<!-- 新增/编辑 招标需求弹窗 -->
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
        label-width="110px"
        label-position="right"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="segId" label="业务板块" required>
              <el-select
                v-model="formData.segId"
                placeholder="请选择业务板块"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in segOptions"
                  :key="item.id"
                  :label="item.segName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="projId" label="项目" required>
              <!-- <el-select
                v-model="formData.projId"
                placeholder="请选择项目"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in projectOptions"
                  :key="item.id"
                  :label="item.projName"
                  :value="item.id"
                />
              </el-select> -->
              <el-cascader
                v-model="formData.projId"
                :options="projectOptions"
                :show-all-levels="false"
                :props="{
                  expandTrigger: 'hover',
                  emitPath: false,
                  checkStrictly: false,
                  value: 'orgId',
                  label: 'orgName',
                  children: 'children',
                }"
                placeholder="请选择项目"
                style="width: 100%"
                clearable
                @change="handleProject"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item prop="companyId" label="公司" required>
              <el-select
                v-model="formData.companyId"
                placeholder="请选择公司"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in projectOptions"
                  :key="item.orgId"
                  :label="item.orgName"
                  :value="item.orgId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="demandDate" label="需求日期" required>
              <el-date-picker
                v-model="formData.demandDate"
                type="date"
                placeholder="请选择需求日期"
                value-format="YYYY-MM-DD"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item prop="tenderName" label="招标事项" required>
              <el-input
                v-model="formData.tenderName"
                placeholder="请输入招标事项"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item prop="demandRemark" label="需求说明">
              <el-input
                v-model="formData.demandRemark"
                type="textarea"
                placeholder="请输入需求说明"
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
import type { BidDemandFormParams } from "@/types/cost/bidding-management-type";
import { biddingManageApi } from "@/api/cost/bidding-management-api";

interface Props {
  modelValue: boolean;
  editData?: any | null;
  segOptions?: any[];
  projectOptions?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  editData: null,
  segOptions: () => [],
  projectOptions: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const formData = ref<BidDemandFormParams>({
  id: undefined,
  segId: undefined, // 业务板块ID
  projId: undefined, // 项目ID
  companyId: undefined, // 公司ID
  tenderName: "", // 招标事项
  demandDate: undefined, // 需求日期
  demandRemark: undefined, // 需求说明
});

const formRules: FormRules = {
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  companyId: [{ required: true, message: "请选择公司", trigger: "change" }],
  tenderName: [{ required: true, message: "请输入招标事项", trigger: "blur" }],
  demandDate: [
    { required: true, message: "请选择需求日期", trigger: "change" },
  ],
};

const isEditMode = computed(() => !!props.editData?.id);

const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑招标需求" : "新增招标需求";
});

// ==================== 方法 ====================
const initFormData = () => {
  if (isEditMode.value && props.editData) {
    formData.value = {
      id: props.editData.id,
      segId: props.editData.segId,
      projId: props.editData.projId,
      companyId: props.editData.companyId,
      tenderName: props.editData.tenderName,
      demandDate: props.editData.demandDate,
      demandRemark: props.editData.demandRemark,
    };
  } else {
    formData.value = {
      id: undefined,
      segId: undefined,
      projId: undefined,
      companyId: undefined,
      tenderName: "",
      demandDate: undefined,
      demandRemark: undefined,
    };
    setTimeout(() => {
      formRef.value?.clearValidate();
    }, 0);
  }
};
const handleProject = (orgId: number) => {
  const projectData = [...props.projectOptions];
  const parent = findParent(projectData, orgId);
  console.log("父级节点", parent);
  formData.value.companyId = parent ? parent.orgId : undefined;
};
// 查找选中节点的父级节点
const findParent = (
  data: any[],
  targetId: number,
  parent: any = null,
): any | null => {
  for (const item of data) {
    // 找到目标节点，返回父级
    if (item.orgId === targetId) {
      return parent;
    }
    // 递归查找子节点
    if (item.children && item.children.length) {
      const result = findParent(item.children, targetId, item);
      if (result) return result;
    }
  }
  return null;
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
    const interfaceApi = isEditMode.value
      ? biddingManageApi.editDemand
      : biddingManageApi.addDemand;
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
</style>
