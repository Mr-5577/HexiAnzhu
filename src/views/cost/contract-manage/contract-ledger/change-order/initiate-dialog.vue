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
                  v-for="item in props.changeReasonOptions"
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
      <!-- 表格区域 -->
      <div class="detail-table">
        <div class="header-content">
          <span class="header-title">变更相关合同</span>
          <el-button type="primary" size="small" plain @click="handleAdd">
            新增
          </el-button>
        </div>
        <editable-table
          ref="detailtableRef"
          :row-key="'uuid'"
          :height="'220px'"
          v-model="tableList"
          :columns="dynamicColumns"
          :loading="tableLoading"
          :pagination="false"
          :highlight-current-row="false"
          :show-summary="false"
          :compactEmpty="true"
          @editable-cell-click="handleEditableCellClick"
        >
          <template #actions="{ row }">
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </editable-table>
      </div>
    </div>
    <!-- 选择合同 弹窗 -->
    <choose-con-dialog
      ref="conDialogRef"
      v-model="conDialogVisible"
      :projId="props.projId"
      @select="handleConSelect"
    />
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
import { v4 as uuidv4 } from "uuid";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import ChooseConDialog from "./choose-con-dialog.vue";

interface Props {
  modelValue: boolean;
  conId: number;
  projId?: number;
  editData?: ContractChange | null;
  changeReasonOptions: any[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  editData: null,
  conId: null,
  projId: null,
  changeReasonOptions: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const wasteCostReasonOptions = ref([]); // 无效成本原因列表
const tableLoading = ref(false);
const tableList = ref([]);
const conDialogVisible = ref(false);
const currentRowData = ref(null); // 当前点击的合同名称行数据

// ==================== 表格配置 ====================
const dynamicColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "conName",
    label: "合同名称",
    editable: true,
    clickable: true, // 设置为可点击，打开弹窗
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "estChangeAmt",
    label: "预估变更金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "wasteCostAmt",
    label: "无效成本金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "wasteCostReasonId",
    label: "无效成本原因",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "dicLabel",
    optionValueField: "id",
    options: wasteCostReasonOptions.value,
    width: 150,
  },
  {
    prop: "needVisa",
    label: "是否需要签证",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    clearable: false,
    options: [
      { value: true, label: "是" },
      { value: false, label: "否" },
    ],
    width: 150,
  },
  {
    prop: "remark",
    label: "说明",
    showSummary: true,
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 200,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);

// 数据字典
const { getDictList, loadDicts } = useDict(
  [
    dictMapping.invalidCostReason, // 无效成本原因
  ],
  {
    treeDictCodes: [],
  },
);

const formData = ref<ContractChange>({
  id: null,
  conBillId: null, // 单据ID
  status: 0, // 状态,0-草稿 5-审批中 10-已审批 30-已作废
  changeName: "", // 变更名称
  changeType: null, // 变更类型
  changeReasonId: null, // 变更原因ID
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
  return isEditMode.value ? "编辑变更申请" : "新增变更申请";
});
const handleEditableCellClick = ({ row, column, rowIndex }) => {
  // console.log("可编辑单元格点击:", row, column, rowIndex);
  // 合同名称单元格点击
  if (column.prop === "conName") {
    currentRowData.value = row;
    conDialogVisible.value = true;
  }
};
// 确认选择合同后回调
const handleConSelect = (data) => {
  console.log("选择的合同数据:", data);
  if (data && data.length > 0) {
    const con = data[0];
    const updatedRow = {
      ...currentRowData.value,
      conId: con.id,
      conName: con.conName,
    };
    const rowIndex = tableList.value.findIndex(
      (item) => item.uuid === currentRowData.value.uuid,
    );
    if (rowIndex !== -1) {
      const newData = [...tableList.value];
      newData[rowIndex] = { ...tableList.value[rowIndex], ...updatedRow };
      tableList.value = newData;
    }
  }
};
const handleAdd = () => {
  const newRow = {
    uuid: uuidv4(),
    conBillId: null,
    conId: null,
    conName: "",
    estChangeAmt: 0,
    wasteCostAmt: 0,
    wasteCostReasonId: null,
    needVisa: false,
    remark: "",
  };
  tableList.value = [...tableList.value, newRow];
};
const handleDelete = (row: any) => {
  tableList.value = tableList.value.filter((item) => item.uuid !== row.uuid);
};
// 编辑时获取当前变更合同详情
const getConDetail = async () => {
  try {
    const res = await changeOrderApi.getChangeConDetail({
      id: props.editData.id,
    });
    if (res.code === 200) {
      const { change, conlist = [] } = res.data;
      formData.value = {
        id: change.id,
        conBillId: change.conBillId,
        status: change.status,
        changeName: change.changeName,
        changeType: change.changeType,
        changeReasonId: change.changeReasonId,
        changeReasonDesc: change.changeReasonDesc,
        changeConent: change.changeConent,
        changeAmt: change.changeAmt,
      };
      tableList.value = conlist?.map((item) => ({
        uuid: uuidv4(),
        changeId: item.changeId,
        conBillId: item.conBillId,
        conId: item.conId,
        conName: item.conName,
        estChangeAmt: item.estChangeAmt,
        wasteCostAmt: item.wasteCostAmt,
        wasteCostReasonId: item.wasteCostReasonId,
        needVisa: item.needVisa,
        remark: item.remark,
      }));
    }
  } catch (error) {}
};
const initFormData = async () => {
  if (isEditMode.value && props.editData) {
    tableList.value = [];
    await getConDetail();
  } else {
    formData.value = {
      id: null,
      conBillId: null,
      status: 0,
      changeName: "",
      changeType: null,
      changeReasonId: null,
      changeReasonDesc: "",
      changeConent: "",
      changeAmt: null,
    };
    tableList.value = [];
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
    if (tableList.value.length === 0) {
      ElMessage.error("暂无变更相关合同明细！");
      return;
    }
    if (tableList.value.some((item) => !item.estChangeAmt)) {
      ElMessage.error("请填写明细中的预计变更金额");
      return;
    }
    if (tableList.value.some((item) => !item.wasteCostAmt)) {
      ElMessage.error("请填写明细中的无效成本金额");
      return;
    }
    if (tableList.value.some((item) => !item.wasteCostReasonId)) {
      ElMessage.error("请选择明细中的无效成本原因");
      return;
    }
    submitLoading.value = true;
    const params = {
      conId: props.conId,
      change: formData.value,
      conlist: tableList.value,
    };
    let res;
    if (isEditMode.value) {
      res = await changeOrderApi.editChangeCon(params);
    } else {
      res = await changeOrderApi.addChangeCon(params);
    }
    if (res.code === 200) {
      ElMessage.success("操作成功");
      emit("success");
      handleClose();
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
  wasteCostReasonOptions.value = getDictList(dictMapping.invalidCostReason); // 无效成本原因列表
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
</style>
