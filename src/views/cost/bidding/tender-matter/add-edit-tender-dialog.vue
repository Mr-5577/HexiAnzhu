<!-- 新增/编辑 招标事项弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="dialogTitle"
    width="1000px"
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
          <el-col :span="8">
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
          <el-col :span="8">
            <el-form-item prop="projectId" label="项目" required>
              <el-select
                v-model="formData.projectId"
                placeholder="请选择项目"
                multiple
                collapse-tags
                style="width: 100%"
              >
                <el-option
                  v-for="item in projectOptions"
                  :key="item.id"
                  :label="item.projName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="conTypeId" label="合同分类" required>
              <el-select
                v-model="formData.conTypeId"
                placeholder="请选择合同分类"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in conTypeOptions"
                  :key="item.id"
                  :label="item.conTypeName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item prop="tenderName" label="采购事项" required>
              <el-input
                v-model="formData.tenderName"
                placeholder="请输入采购事项"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="purchaseMethodId" label="采购方式" required>
              <el-select
                v-model="formData.purchaseMethodId"
                placeholder="请选择采购方式"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in purchaseMethodOptions"
                  :key="item.id"
                  :label="item.dicLabel"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="tenderMethodId" label="招标方式" required>
              <el-select
                v-model="formData.tenderMethodId"
                placeholder="请选择招标方式"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in tenderMethodOptions"
                  :key="item.id"
                  :label="item.dicLabel"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item prop="billModeId" label="清单模式" required>
              <el-select
                v-model="formData.billModeId"
                placeholder="请选择清单模式"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in billModeOptions"
                  :key="item.id"
                  :label="item.dicLabel"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="planAmount" label="计划金额" required>
              <el-input-number
                v-model="formData.planAmount"
                placeholder="请输入计划金额"
                :precision="2"
                :min="0"
                :controls="false"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
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
          <el-col :span="8">
            <el-form-item prop="dutyMan" label="招采负责人" required>
              <el-select
                v-model="formData.dutyMan"
                placeholder="请选择招采负责人"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.id"
                  :label="item.userName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="bidStartDate" label="招采开始日期" required>
              <el-date-picker
                v-model="formData.bidStartDate"
                type="date"
                placeholder="请选择招采开始日期"
                value-format="YYYY-MM-DD"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="bidEndDate" label="招采结束日期" required>
              <el-date-picker
                v-model="formData.bidEndDate"
                type="date"
                placeholder="请选择招采结束日期"
                value-format="YYYY-MM-DD"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item prop="tenderRemark" label="事项说明">
              <el-input
                v-model="formData.tenderRemark"
                type="textarea"
                placeholder="请输入招采事项说明"
                :rows="3"
                maxlength="500"
                show-word-limit
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 明细表格区域 -->
      <div class="detail-table">
        <div class="header-content">
          <span class="header-title">招标明细</span>
          <el-button type="primary" size="small" plain @click="handleAddDetail">
            新增明细
          </el-button>
        </div>

        <editable-table
          ref="detailtableRef"
          :row-key="'uuid'"
          :height="'250px'"
          :table-data="tableList"
          :columns="dynamicColumns"
          :loading="tableLoading"
          :pagination="false"
          :highlight-current-row="false"
          :show-summary="false"
          :on-save="handleSave"
          @data-change="handleDataChange"
          @update:table-data="handleDataUpdate"
        >
          <template #actions="{ row }">
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </editable-table>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import type {
  BidTender,
  BidTenderFormParams,
  BidTenderSaveParams,
} from "@/types/cost/bidding/bidding-management-type";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";

// ==================== Props & Emits ====================
interface Props {
  modelValue: boolean;
  editData?: BidTender | null;
  projectId?: number | null;
  segOptions?: any[];
  conTypeOptions?: any[];
  projectOptions: any[];
  purchaseMethodOptions?: any[];
  tenderMethodOptions?: any[];
  billModeOptions?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  editData: null,
  projectId: null,
  segOptions: () => [],
  conTypeOptions: () => [],
  projectOptions: () => [],
  purchaseMethodOptions: () => [],
  tenderMethodOptions: () => [],
  billModeOptions: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

// ==================== Refs ====================
const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const tableLoading = ref(false);
const tableList = ref<any[]>([]);

const optionalProjList = computed(() => {
  const selectedProjectIds = formData.value.projectId || [];
  if (selectedProjectIds.length === 0) {
    return [];
  }
  // 从 props.projectOptions 中过滤出选中的项目
  return props.projectOptions.filter((project) =>
    selectedProjectIds.includes(project.id),
  );
});
// ==================== 表格配置 ====================
const dynamicColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "projId",
    label: "项目",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "projName",
    optionValueField: "id",
    options: optionalProjList.value,
  },
  {
    prop: "tenderItemName",
    label: "招标明细",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "bldIds",
    label: "楼栋",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "bldName",
    optionValueField: "id",
    multiple: true,
    collapseTags: true,
    getOptions: (row: any) => row.buildingOptions || [],
  },
  {
    prop: "bidBondAmount",
    label: "应交投标保证金",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "perfBondAmount",
    label: "应交履约保证金",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "referAmount",
    label: "不含税参考价",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);

const userOptions = ref([
  { id: 1, userName: "张三" },
  { id: 2, userName: "李四" },
  { id: 3, userName: "王五" },
]);

const formData = ref<BidTenderFormParams>({
  id: null,
  segId: null,
  projectId: [],
  conTypeId: null,
  tenderName: "",
  purchaseMethodId: null,
  tenderMethodId: null,
  billModeId: null,
  planAmount: null,
  demandDate: null,
  bidStartDate: null,
  bidEndDate: null,
  dutyMan: null,
  tenderRemark: "",
  tenderStatus: 0,
});

// ==================== 表单验证规则 ====================
const validatePlanAmount = (_rule: any, value: number, callback: any) => {
  if (value && value < 0) {
    callback(new Error("计划金额不能小于0"));
  } else {
    callback();
  }
};

const validateStartDateRange = (_rule: any, _value: any, callback: any) => {
  if (formData.value.bidStartDate && formData.value.bidEndDate) {
    if (formData.value.bidStartDate > formData.value.bidEndDate) {
      callback(new Error("招采开始日期不能晚于结束日期"));
    }
  }
  callback();
};

const validateEndDateRange = (_rule: any, _value: any, callback: any) => {
  if (formData.value.bidStartDate && formData.value.bidEndDate) {
    if (formData.value.bidStartDate > formData.value.bidEndDate) {
      callback(new Error("招采结束日期不能早于开始日期"));
    }
  }
  callback();
};

const formRules: FormRules = {
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projectId: [{ required: true, message: "请选择项目", trigger: "change" }],
  conTypeId: [{ required: true, message: "请选择合同分类", trigger: "change" }],
  tenderName: [{ required: true, message: "请输入采购事项", trigger: "blur" }],
  purchaseMethodId: [
    { required: true, message: "请选择采购方式", trigger: "change" },
  ],
  tenderMethodId: [
    { required: true, message: "请选择招标方式", trigger: "change" },
  ],
  billModeId: [
    { required: true, message: "请选择清单模式", trigger: "change" },
  ],
  planAmount: [
    { required: true, message: "请输入计划金额", trigger: "blur" },
    { validator: validatePlanAmount, trigger: "blur" },
  ],
  demandDate: [
    { required: true, message: "请选择需求日期", trigger: "change" },
  ],
  dutyMan: [{ required: true, message: "请选择招采负责人", trigger: "change" }],
  bidStartDate: [
    { required: true, message: "请选择招采开始日期", trigger: "change" },
    { validator: validateStartDateRange, trigger: "change" },
  ],
  bidEndDate: [
    { required: true, message: "请选择招采结束日期", trigger: "change" },
    { validator: validateEndDateRange, trigger: "change" },
  ],
};

// ==================== 计算属性 ====================
const isEditMode = computed(() => !!props.editData?.id);

const dialogTitle = computed(() => {
  return isEditMode.value ? "编辑招标事项" : "新增招标事项";
});

// ==================== 方法 ====================
// 获取详情
const getInfo = async () => {
  const res = await biddingManageApi.getTenderInfo({
    tenderId: props.editData.id,
  });
  if (res.code === 200 && res.data) {
    const { items, projIds, tender } = res.data;
    // 设置表单数据
    formData.value = {
      id: tender.id,
      segId: tender.segId,
      projectId: projIds || [],
      conTypeId: tender.conTypeId,
      tenderName: tender.tenderName,
      purchaseMethodId: tender.purchaseMethodId,
      tenderMethodId: tender.tenderMethodId,
      billModeId: tender.billModeId,
      planAmount: tender.planAmount,
      demandDate: tender.demandDate,
      bidStartDate: tender.bidStartDate,
      bidEndDate: tender.bidEndDate,
      dutyMan: tender.dutyMan,
      tenderRemark: tender.tenderRemark,
      tenderStatus: tender.tenderStatus,
    };
    // 设置明细数据
    if (items && items.length) {
      const initialTableList = items.map((item: any) => ({
        uuid: uuidv4(),
        id: item.id,
        projId: item.projId,
        tenderItemName: item.tenderItemName,
        bldIds: item.bldIds ? item.bldIds.split(",").map(Number) : [],
        bidBondAmount: item.bidBondAmount,
        perfBondAmount: item.perfBondAmount,
        referAmount: item.referAmount,
        awardId: 0,
        buildingOptions: [],
      }));

      // 并行加载所有楼栋数据
      const buildingPromises = initialTableList.map(async (item, index) => {
        if (item.projId) {
          try {
            const buildingRes = await projectAreaApi.getBuildingList({
              projId: item.projId,
            });
            if (buildingRes.code === 200) {
              initialTableList[index].buildingOptions = buildingRes.data || [];
            }
          } catch (error) {
            console.error("获取楼栋列表失败:", error);
          }
        }
        return initialTableList[index];
      });

      tableList.value = await Promise.all(buildingPromises);
    }
  }
};

const initFormData = async () => {
  if (isEditMode.value && props.editData) {
    getInfo();
  } else {
    formData.value = {
      id: null,
      segId: null,
      projectId: [],
      conTypeId: null,
      tenderName: "",
      purchaseMethodId: null,
      tenderMethodId: null,
      billModeId: null,
      planAmount: null,
      demandDate: null,
      bidStartDate: null,
      bidEndDate: null,
      dutyMan: null,
      tenderRemark: "",
      tenderStatus: 0,
    };
    setTimeout(() => {
      formRef.value?.clearValidate();
    }, 0);
  }
};

const handleAddDetail = () => {
  const newRow = {
    uuid: uuidv4(),
    projId: null,
    tenderItemName: "",
    bldIds: [],
    bidBondAmount: 0,
    perfBondAmount: 0,
    referAmount: 0,
    awardId: 0,
    buildingOptions: [],
  };
  tableList.value = [...tableList.value, newRow];
};

const handleSave = async ({
  row,
  column,
  newValue,
  oldValue,
  rowIndex,
}: any) => {
  // 当项目发生变化时，获取对应的楼栋数据
  if (column === "projId") {
    if (newValue) {
      try {
        const res = await projectAreaApi.getBuildingList({ projId: newValue });
        if (res.code === 200) {
          // 更新当前行的楼栋选项
          const newTableList = [...tableList.value];
          newTableList[rowIndex] = {
            ...row,
            buildingOptions: res.data || [],
            bldIds: [], // 清空已选的楼栋
            projId: newValue,
          };
          tableList.value = newTableList;
        }
      } catch (error) {
        console.error("获取楼栋列表失败:", error);
      }
    } else {
      // 如果清空了项目，也清空楼栋选项和已选楼栋
      const newTableList = [...tableList.value];
      newTableList[rowIndex] = {
        ...row,
        buildingOptions: [],
        bldIds: [],
        projId: null,
      };
      tableList.value = newTableList;
    }
  }
};

const handleDataChange = (data: any) => {
  // 数据变化回调
};

const handleDataUpdate = (newData: any) => {
  tableList.value = newData;
};

const handleDelete = (row: any) => {
  tableList.value = tableList.value.filter((item) => item.uuid !== row.uuid);
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
    if (!tableList.value.length) {
      ElMessage.error("请添加明细");
      return;
    }
    if (tableList.value.some((item) => !item.tenderItemName)) {
      ElMessage.error("请填写明细中的招标明细名称");
      return;
    }
    if (tableList.value.some((item) => !item.projId)) {
      ElMessage.error("请选择明细中的项目");
      return;
    }
    if (tableList.value.some((item) => !item.bldIds.length)) {
      ElMessage.error("请选择明细中的楼栋");
      return;
    }
    if (tableList.value.some((item) => !item.bidBondAmount)) {
      ElMessage.error("请填写明细中的投标保证金");
      return;
    }
    if (tableList.value.some((item) => !item.perfBondAmount)) {
      ElMessage.error("请填写明细中的履约保证金");
      return;
    }
    if (tableList.value.some((item) => !item.referAmount)) {
      ElMessage.error("请填写明细中的不含税参考价");
      return;
    }

    submitLoading.value = true;
    const saveParams: BidTenderSaveParams = {
      tender: formData.value,
      items: tableList.value.map((item) => {
        // 确保 bldIds 是数组
        const bldIds = Array.isArray(item.bldIds) ? item.bldIds : [];
        return {
          id: item.id,
          projId: item.projId,
          tenderItemName: item.tenderItemName || "",
          bldIds: bldIds.join(","),
          bldNames: item.buildingOptions?.length
            ? item.buildingOptions
                .filter((bld: any) => bldIds.includes(bld.id))
                .map((bld: any) => bld.bldName)
                .join(",")
            : "",
          bidBondAmount: item.bidBondAmount ?? 0,
          perfBondAmount: item.perfBondAmount ?? 0,
          referAmount: item.referAmount ?? 0,
        };
      }),
      projIds: formData.value.projectId || [],
    };

    const interfaceApi = isEditMode.value
      ? biddingManageApi.editTender
      : biddingManageApi.addTender;

    const res = await interfaceApi(saveParams);

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
      tableList.value = [];
      initFormData();
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
</script>

<style lang="scss" scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.detail-table {
  .header-content {
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-title {
      font-size: 15px;
      color: #333;
      font-weight: 600;
    }
  }
}

:deep(.el-textarea__inner) {
  resize: none;
}
</style>
