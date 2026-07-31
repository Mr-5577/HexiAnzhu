<!-- 新增/编辑 成本分摊主表弹窗 -->
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
            <el-form-item label="项目名称" prop="projId" required>
              <el-cascader
                ref="projectRef"
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
                disabled
                placeholder="请选择项目"
                style="width: 100%"
                @change="changeProject"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="bizType" label="业务类型" required>
              <el-select
                v-model="formData.bizType"
                placeholder="请选择业务类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in props.bizTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item prop="allocAmt" label="分摊总额(含税)" required>
              <el-input-number
                v-model="formData.allocAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入分摊总额(含税)"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="allocExclAmt" label="分摊总额(不含税)" required>
              <el-input-number
                v-model="formData.allocExclAmt"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入分摊总额(不含税)"
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
          <el-col :span="12">
            <el-form-item prop="allocStatus" label="分摊状态" required>
              <el-select
                v-model="formData.allocStatus"
                placeholder="请选择分摊状态"
                style="width: 100%"
              >
                <el-option
                  v-for="item in props.allocStatusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item prop="remark" label="分摊说明">
              <el-input
                v-model="formData.remark"
                type="textarea"
                placeholder="请输入分摊说明"
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
import type { CostAllocationDTO } from "@/types/cost/contract-manage/cost-allocation-type";
import { costAllocationApi } from "@/api/cost/contract-manage/cost-allocation-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";

interface Props {
  modelValue: boolean;
  projId?: number;
  editData?: CostAllocationDTO | null;
  bizTypeOptions: any[];
  allocStatusOptions: any[];
  allocWarnOptions: any[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  projId: undefined,
  editData: null,
  bizTypeOptions: () => [], // 业务类型选项
  allocStatusOptions: () => [], // 分摊状态选项
  allocWarnOptions: () => [], // 分摊预警选项
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();
const projectRef = ref();
const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const projectOptions = ref([]); // 项目列表

// 表单数据
const formData = ref<CostAllocationDTO>({
  id: undefined,
  projId: props.projId, // 项目ID
  projName: "", // 项目名称
  bizType: undefined, // 业务类型
  bizBillId: 0, // 业务单据ID
  bizKeyId: 0, // 业务明细ID
  allocAmt: 0, // 分摊总额(含税)
  allocExclAmt: 0, // 分摊总额(不含税)
  allocStatus: 0, // 分摊状态,0-未分摊 1-已分摊 2-部分分摊 3-分摊异常
  allocWarn: undefined, // 分摊预警,0-红；1-黄【超95%】；2-绿
  remark: "", // 分摊说明
});
// 表单校验规则
const formRules: FormRules = {
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  bizType: [{ required: true, message: "请选择业务类型", trigger: "change" }],
  allocAmt: [
    { required: true, message: "请输入分摊总额(含税)", trigger: "change" },
    {
      type: "number",
      min: 0,
      message: "分摊总额不能小于0",
      trigger: "change",
    },
  ],
  allocExclAmt: [
    { required: true, message: "请输入分摊总额(不含税)", trigger: "change" },
    {
      type: "number",
      min: 0,
      message: "分摊总额不能小于0",
      trigger: "change",
    },
  ],
  allocWarn: [{ required: true, message: "请选择分摊预警", trigger: "change" }],
  allocStatus: [
    { required: true, message: "请选择分摊状态", trigger: "change" },
  ],
};

// 是否为编辑模式
const isEditMode = computed(() => !!props.editData?.id);

// 弹窗标题
const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑成本分摊" : "新增成本分摊";
});

// 获取项目列表
const getProjectOptions = async () => {
  try {
    // const res = await largeScreenApi.getProjList(); // 扁平结构数据
    const res = await projectAreaApi.getMguProjList(); // 公司-项目树形结构数据
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};
// 选择项目
const changeProject = (val: number) => {
  if (val && projectRef.value) {
    // 通过 getCheckedNodes 获取选中的节点
    const checkedNodes = projectRef.value.getCheckedNodes();
    if (checkedNodes && checkedNodes.length > 0) {
      const node = checkedNodes[0];
      formData.value.projName = node.label || node.data?.orgName || "";
    }
  } else {
    formData.value.projName = "";
  }
};
// 根据项目ID查找项目名称
const findProjectName = (projId: number): string => {
  if (!projId || !projectOptions.value.length) return "";
  // 递归查找树形数据
  const findName = (nodes: any[], targetId: number): string => {
    for (const node of nodes) {
      if (node.orgId === targetId) {
        return node.orgName || node.label || "";
      }
      if (node.children && node.children.length) {
        const result = findName(node.children, targetId);
        if (result) return result;
      }
    }
    return "";
  };
  return findName(projectOptions.value, projId);
};
// 初始化表单数据
const initFormData = async () => {
  // 获取项目数据
  await getProjectOptions();

  if (isEditMode.value && props.editData) {
    formData.value = {
      id: props.editData.id,
      projId: props.editData.projId,
      projName: props.editData.projName,
      bizType: props.editData.bizType,
      bizBillId: props.editData.bizBillId,
      bizKeyId: props.editData.bizKeyId,
      allocAmt: props.editData.allocAmt,
      allocExclAmt: props.editData.allocExclAmt,
      allocStatus: props.editData.allocStatus,
      allocWarn: props.editData.allocWarn,
      remark: props.editData.remark,
    };
  } else {
    // 根据传入的 projId 查找项目名称
    const projName = props.projId ? findProjectName(props.projId) : "";
    formData.value = {
      id: undefined,
      projId: props.projId,
      projName: projName,
      bizType: undefined,
      bizBillId: 0,
      bizKeyId: 0,
      allocAmt: 0,
      allocExclAmt: 0,
      allocStatus: 0,
      allocWarn: undefined,
      remark: "",
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

    let res;
    if (isEditMode.value) {
      res = await costAllocationApi.editProjectAllocM(formData.value);
    } else {
      res = await costAllocationApi.addProjectAllocM(formData.value);
    }

    if (res.code === 200) {
      ElMessage.success(isEditMode.value ? "修改成功" : "保存成功");
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
  async (val) => {
    dialogVisible.value = val;
    if (val) {
      await initFormData();
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

:deep(.el-input-number) {
  width: 100%;
}
</style>
