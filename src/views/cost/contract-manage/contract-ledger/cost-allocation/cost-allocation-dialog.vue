<!-- 新增/编辑 成本分摊主表弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="dialogTitle"
    width="1000px"
    :confirm-loading="submitLoading"
    :showCancelButton="false"
    :showConfirmButton="false"
    @close="handleClose"
  >
    <div style="padding-right: 8px; box-sizing: border-box">
      <div>
        <div class="header-title">基本信息</div>
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="140px"
          label-position="right"
        >
          <el-row>
            <el-col :span="8">
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
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="bizType" label="业务类型" required>
                <el-select
                  v-model="formData.bizType"
                  placeholder="请选择业务类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in bizTypeEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
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
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item
                prop="allocExclAmt"
                label="分摊总额(不含税)"
                required
              >
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
            <el-col :span="8">
              <el-form-item prop="allocWarn" label="分摊预警" required>
                <el-select
                  v-model="formData.allocWarn"
                  placeholder="请选择分摊预警"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in allocWarnEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="allocStatus" label="分摊状态" required>
                <el-select
                  v-model="formData.allocStatus"
                  placeholder="请选择分摊状态"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in allocStatusEnum"
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
      <div>
        <div class="header-title">分摊明细</div>
        <editable-table
          :row-key="'uuid'"
          :height="'240px'"
          v-model="detailTable"
          :columns="dynamicColumns"
          :loading="tableLoading"
          :pagination="false"
          :highlight-current-row="false"
          :show-summary="false"
          :compactEmpty="true"
        >
        </editable-table>
      </div>

      <!-- 底部按钮 -->
      <div class="bottom-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" v-show="!showSummary" @click="nextStep">
          下一步
        </el-button>
        <el-button
          type="primary"
          v-show="showSummary"
          @click="handleSubmit"
          :loading="submitLoading"
        >
          确定
        </el-button>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import type { CostAllocationDTO } from "@/types/cost/contract-manage/cost-allocation-type";
import { costAllocationApi } from "@/api/cost/contract-manage/cost-allocation-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import {
  allocStatusEnum,
  allocWarnEnum,
  bizTypeEnum,
} from "@/constants/contract-manage/enums";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import { productTypeApi } from "@/api/cost/master-data/product-type-api";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";

interface Props {
  modelValue: boolean;
  projId?: number;
  editData?: CostAllocationDTO | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  projId: undefined,
  editData: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const tableLoading = ref(false);
const detailTable = ref([]);
const showSummary = ref(false);

const projectOptions = ref([]); // 项目列表
const subjectOptions = ref([]); // 科目列表
const productOptions = ref([]); // 业态列表

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
  return isEditMode.value ? "编辑成本分摊" : "设置成本分摊";
});

// 动态列配置
const dynamicColumns = computed<EditableColumn[]>(() => {
  const columns: EditableColumn[] = [
    {
      type: "index",
      label: "序号",
      width: 60,
      editable: false,
    },
    {
      prop: "subName",
      label: "科目名称",
      editable: false,
    },
  ];

  // 分摊后显示成本金额列
  if (showSummary.value) {
    columns.push(
      {
        prop: "costAmt",
        label: "成本金额(含税)",
        editable: false,
      },
      {
        prop: "costExclAmt",
        label: "成本金额(不含税)",
        editable: false,
      },
    );
  }

  // 分摊金额列
  columns.push(
    {
      prop: "allocAmt",
      label: "分摊金额(含税)",
      editable: true,
      editType: "number",
      precision: 2,
      min: 0,
      showOverflowTooltip: false,
    },
    {
      prop: "allocExclAmt",
      label: "分摊金额(不含税)",
      editable: true,
      editType: "number",
      precision: 2,
      min: 0,
      showOverflowTooltip: false,
    },
  );

  // 分摊后显示预警状态列
  if (showSummary.value) {
    columns.push({
      prop: "allocWarn",
      label: "预警状态",
      editable: false,
      slot: "allocWarn",
    });
  }

  return columns;
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
/**
 * 获取目标成本科目列表
 */
const getCostSubjectProjList = async () => {
  if (!props.projId) {
    ElMessage.warning("请先选择项目");
    return;
  }
  try {
    const res = await costCategoryApi.getCostSubjectProjList({
      projId: props.projId,
      withDetail: true,
    });
    if (res.code === 200) {
      subjectOptions.value = res.data || [];
      renderSubjectOptions();
    } else {
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取数据失败:", error);
  }
};
// 渲染科目列表
const renderSubjectOptions = () => {
  detailTable.value = subjectOptions.value.map((subject) => ({
    uuid: uuidv4(),
    subId: subject.id,
    subName: subject.subName,
    costAmt: 0,
    costExclAmt: 0,
    allocAmt: 0,
    allocExclAmt: 0,
    allocWarn: 2, // 默认绿色预警
  }));
};
// 获取项目产品类型
const getProductList = async () => {
  if (!props.projId) return;
  try {
    const res = await productTypeApi.getProductProjList({
      projId: props.projId,
      withDetail: true,
    });
    if (res.code === 200) {
      productOptions.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取业态列表失败:", error);
  }
};
// 初始化表单数据
const initFormData = async () => {
  // 获取项目数据
  await getProjectOptions();
  await getCostSubjectProjList();
  await getProductList();

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
const nextStep = async () => {
  // 至少有一个科目有金额
  const hasAllocData = detailTable.value.some(
    (item) => (item.allocAmt || 0) > 0 || (item.allocExclAmt || 0) > 0,
  );
  if (!hasAllocData) {
    ElMessage.warning("请至少输入一个科目的分摊金额");
    return;
  }
  ElMessageBox.confirm(
    "确认按照当前所填分摊金额进行下一步，是否继续？",
    "提示",
    {
      confirmButtonText: "继续",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(async () => {
      await calculateAllocation();
    })
    .catch(() => {});
};
// 自动计算分摊
const calculateAllocation = async () => {
  const params = {
    conId: undefined,
    subList: detailTable.value.map((item) => ({
      subId: item.subId,
      allocAmt: item.allocAmt || 0,
      allocExclAmt: item.allocExclAmt || 0,
    })),
  };
  const res = await costAllocationApi.autoAllocateCost(params);
  if (res.code === 200 && res.data) {
    showSummary.value = true;
    const result = res.data;
    // 更新表格数据
    if (result.allocList && result.allocList.length > 0) {
      detailTable.value = detailTable.value.map((item) => {
        const resultItem = result.allocList.find(
          (r: any) => r.subId === item.subId,
        );
        if (resultItem) {
          return {
            ...item,
            costAmt: resultItem.costAmt || 0,
            costExclAmt: resultItem.costExclAmt || 0,
            allocAmt: resultItem.allocAmt || 0,
            allocExclAmt: resultItem.allocExclAmt || 0,
            allocWarn: resultItem.allocWarn ?? 2,
          };
        }
        return item;
      });
    }
  }
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
.header-title {
  font-size: 15px;
  color: #333;
  font-weight: 600;
  margin-bottom: 10px;
  padding-left: 10px;
  box-sizing: border-box;
  position: relative;
  &::before {
    content: "";
    width: 4px;
    height: 16px;
    border-radius: 2px;
    background-color: #409eff;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }
}
.bottom-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 15px;
}
</style>
