<!-- 变更指令 -->
<template>
  <div class="basic-form-content">
    <div class="form-header">
      <div class="header-title">变更审批</div>
      <div class="header-btn">
        <el-button
          type="primary"
          icon="DocumentAdd"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          保存
        </el-button>
        <el-button type="success" plain icon="Promotion" @click="handleSubmit">
          提交
        </el-button>
        <el-button type="danger" plain icon="Delete"> 删除 </el-button>
        <el-button type="warning" plain icon="Remove"> 作废 </el-button>
        <el-button type="info" plain icon="View"> 查看流程 </el-button>
      </div>
    </div>
    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="adapt-form"
      >
        <!-- 基本信息卡片 -->
        <div class="item-card">
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="18" :xl="18">
              <el-form-item label="标题" prop="title">
                <el-input
                  v-model="formData.title"
                  clearable
                  :disabled="isDetail"
                  placeholder="标题"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="审批状态" prop="approvalStatus">
                <el-input
                  v-model="formData.approvalStatus"
                  clearable
                  :disabled="isDetail"
                  placeholder="审批状态"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="业务板块" prop="segId" required>
                <el-select
                  v-model="formData.segId"
                  placeholder="请选择业务板块"
                  style="width: 100%"
                  :disabled="isDetail"
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
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="板块编码" prop="segCode">
                <el-input
                  v-model="formData.segCode"
                  clearable
                  :disabled="isDetail"
                  placeholder="板块编码"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="部门" prop="departmentName">
                <el-input
                  v-model="formData.departmentName"
                  clearable
                  :disabled="isDetail"
                  placeholder="部门"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="分部" prop="branchName">
                <el-input
                  v-model="formData.branchName"
                  clearable
                  :disabled="isDetail"
                  placeholder="分部"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="所属项目" prop="projId" required>
                <el-cascader
                  ref="projCascaderRef"
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
                  :disabled="isDetail"
                  @change="changeProject"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="项目所属公司" prop="companyName">
                <el-input
                  v-model="formData.companyName"
                  clearable
                  placeholder="项目所属公司"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="提交人" prop="submiterName">
                <el-input
                  v-model="formData.submiterName"
                  clearable
                  :disabled="isDetail"
                  placeholder="提交人"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="提交时间" prop="submiterDate">
                <el-input
                  v-model="formData.submiterDate"
                  clearable
                  :disabled="isDetail"
                  placeholder="提交时间"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 变更主要信息 -->
        <div class="item-card">
          <div class="section-title">变更主要信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="changeName" label="变更事项" required>
                <el-input
                  v-model="formData.changeName"
                  clearable
                  :disabled="isDetail"
                  placeholder="变更事项"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="processNo" label="变更单号" required>
                <el-input
                  v-model="formData.processNo"
                  placeholder="变更单号"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="changeType" label="变更类型" required>
                <el-select
                  v-model="formData.changeType"
                  placeholder="请选择变更类型"
                  style="width: 100%"
                  :disabled="isDetail"
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
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="changeReasonId" label="变更原因" required>
                <el-select
                  v-model="formData.changeReasonId"
                  placeholder="请选择变更原因"
                  style="width: 100%"
                  :disabled="isDetail"
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
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item prop="changeReasonDesc" label="变更原因说明">
                <el-input
                  v-model="formData.changeReasonDesc"
                  type="input"
                  placeholder="请输入变更原因说明"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
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
              <el-form-item prop="changeConent" label="变更内容">
                <el-input
                  v-model="formData.changeConent"
                  type="textarea"
                  placeholder="请输入变更内容"
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 变更相关合同 -->
        <div class="item-card">
          <div class="section-title">变更相关合同</div>
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
            :disabled="isDetail"
            @editable-cell-click="handleEditableCellClick"
          >
            <template #actionBar>
              <div class="actionBar-buttons">
                <el-button
                  type="primary"
                  size="small"
                  :disabled="isDetail"
                  @click="handleAdd"
                >
                  新增
                </el-button>
              </div>
            </template>
            <template #actions="{ row }">
              <el-button
                link
                type="danger"
                :disabled="isDetail"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </editable-table>
        </div>

        <!-- 成本分摊：创建时不展示成本分摊模块，编辑时获取成本分摊数据进行展示查看详情 -->
        <div class="item-card" v-show="isEdit">
          <div class="section-title">成本分摊</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <el-form-item label="分摊状态：" label-width="90px">
                已分摊
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <el-form-item label="预警状态：" label-width="90px">
                已分摊
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <el-form-item label="分摊：" label-width="90px">
                <el-button type="primary"> 分摊详情 </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 合同附件 -->
        <div class="item-card">
          <div class="section-title">相关附件</div>
          <el-form-item label="上传附件">
            <base-upload
              :disabled="isDetail"
              v-model:file-list="tempFileList"
              :limit="9"
              :multiple="false"
              :showIcon="true"
              :showTip="true"
              button-text="选择文件"
              size="default"
              @success="handleUploadSuccess"
            />
          </el-form-item>
        </div>
      </el-form>
    </div>
    <!-- 选择合同 弹窗 -->
    <choose-con-dialog
      ref="conDialogRef"
      v-model="conDialogVisible"
      :projId="props.projId"
      @select="handleConSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { useRouter, useRoute } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { useUserStore } from "@/stores/user-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";
import { changeOrderApi } from "@/api/cost/contract-manage/change-order-api";
import BaseUpload from "@/components/base/base-upload.vue";
import { ChangeTypeEnum } from "@/constants/contract-manage/enums";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { EditableColumn } from "@/components/base/editable-table.vue";
import ChooseConDialog from "./choose-con-dialog.vue";

defineOptions({ name: "change-order-form" });

// ==================== Props & Emits ====================
interface Props {
  mode?: "add" | "edit" | "detail";
  projId: number;
  conId: number;
  changeId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  projId: undefined,
  conId: undefined,
  changeId: undefined,
});

const emit = defineEmits<{
  (e: "success", data?: any): void;
  (e: "cancel"): void;
}>();

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const formRef = ref<FormInstance>();
const projCascaderRef = ref();
const submitLoading = ref(false);
const tableLoading = ref(false);
const conDialogVisible = ref(false);
const currentRowData = ref<any>(null);

const mode = ref<"add" | "edit" | "detail">(props.mode);
const changeId = ref(route.query.changeId);

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");

const segOptions = ref([]);
const projectOptions = ref([]);
const changeReasonOptions = ref([]);
const wasteCostReasonOptions = ref([]);
const tempFileList = ref([]);

// ==================== 数据字典 ====================
const { getDictList, loadDicts } = useDict(
  [
    dictMapping.invalidCostReason, // 无效成本原因
    dictMapping.changeReason, // 变更原因
  ],
  {
    treeDictCodes: [],
  },
);

const initFormData = () => ({
  id: undefined,
  conBillId: undefined,
  status: 0,
  changeName: "",
  changeType: undefined,
  changeReasonId: undefined,
  changeReasonDesc: "",
  changeConent: "",
  changeAmt: undefined,
  processNo: "",
  // 额外字段
  title: "",
  approvalStatus: "",
  segId: undefined,
  segCode: "",
  departmentName: "",
  branchName: "",
  companyName: "",
  submiterName: "",
  submiterDate: "",
  projId: undefined,
});
const formData = ref(initFormData());

const tableList = ref([]);
const dynamicColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "conName",
    label: "合同名称",
    editable: !isDetail.value,
    clickable: true,
    showOverflowTooltip: false,
  },
  {
    prop: "estChangeAmt",
    label: "预估变更金额",
    showSummary: true,
    editable: !isDetail.value,
    editType: "number",
    showOverflowTooltip: false,
    width: 200,
  },
  {
    prop: "wasteCostAmt",
    label: "无效成本金额",
    showSummary: true,
    editable: !isDetail.value,
    editType: "number",
    showOverflowTooltip: false,
    width: 200,
  },
  {
    prop: "wasteCostReasonId",
    label: "无效成本原因",
    editable: !isDetail.value,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "dicLabel",
    optionValueField: "id",
    options: wasteCostReasonOptions.value,
    width: 200,
  },
  {
    prop: "needVisa",
    label: "是否需要签证",
    editable: !isDetail.value,
    editType: "select",
    showOverflowTooltip: false,
    clearable: false,
    options: [
      { value: true, label: "是" },
      { value: false, label: "否" },
    ],
    width: 200,
  },
  {
    prop: "remark",
    label: "说明",
    showSummary: true,
    editable: !isDetail.value,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);

// ==================== 表单校验规则 ====================
const formRules: FormRules = {
  changeName: [
    { required: true, message: "请输入变更事项", trigger: "change" },
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
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择所属项目", trigger: "change" }],
};

// 获取业务板块列表
const getSegOptions = async () => {
  try {
    const res = await dictionaryApi.getsegmentList();
    if (res.code === 200) {
      segOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取业务板块列表失败:", error);
  }
};

// 获取项目列表
const getProjectOptions = async () => {
  try {
    const res = await projectAreaApi.getMguProjList();
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};

// 初始化数据字典
const initDictData = async () => {
  await loadDicts();
  changeReasonOptions.value = getDictList(dictMapping.changeReason); // 变更原因列表
  wasteCostReasonOptions.value = getDictList(dictMapping.invalidCostReason); // 无效成本原因
};

// 生成单号
const generateProcessNo = async () => {
  try {
    const res = await commonApi.getBillNo({ bizType: "BG" });
    if (res.code === 200) {
      formData.value.processNo = res.data;
    }
  } catch (error) {
    console.error("生成单号失败:", error);
  }
};

// 初始化所有选项
const initOptions = async () => {
  await Promise.all([getSegOptions(), getProjectOptions(), initDictData()]);
};

// 选择项目
const changeProject = (value: number) => {
  if (value) {
    const checkedNodes = projCascaderRef.value?.getCheckedNodes();
    if (checkedNodes && checkedNodes.length > 0) {
      const node = checkedNodes[0];
      formData.value.companyName = node.data?.companyName || "";
    }
  } else {
    formData.value.companyName = "";
  }
};

// 附件上传成功
const handleUploadSuccess = (fileList: any) => {
  console.log("文件上传成功", fileList);
};

// 点击合同单元格
const handleEditableCellClick = ({ row, column }) => {
  if (column.prop === "conName" && !isDetail.value) {
    currentRowData.value = row;
    conDialogVisible.value = true;
  }
};
// 选中合同
const handleConSelect = (data: any[]) => {
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
  conDialogVisible.value = false;
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

const loadDetail = async () => {
  if (!changeId.value) return;
  try {
    const res = await changeOrderApi.getChangeConDetail({
      id: Number(changeId.value),
    });
    if (res.code === 200) {
      const { change, conlist = [] } = res.data;
      // 映射变更信息
      formData.value = {
        ...formData.value,
        id: change.id,
        conBillId: change.conBillId,
        status: change.status,
        changeName: change.changeName,
        changeType: change.changeType,
        changeReasonId: change.changeReasonId,
        changeReasonDesc: change.changeReasonDesc,
        changeConent: change.changeConent,
        changeAmt: change.changeAmt,
        processNo: change.processNo || "",
      };
      // 映射合同列表
      tableList.value = conlist.map((item: any) => ({
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
  } catch (error) {
    console.error("加载详情失败:", error);
  }
};

const handleSubmit = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch (error) {
    ElMessage.error("请完善表单信息");
    return;
  }
  if (tableList.value.length === 0) {
    ElMessage.error("暂无变更相关合同明细！");
    return;
  }
  const invalidItems = tableList.value.filter(
    (item) => !item.estChangeAmt || item.estChangeAmt <= 0,
  );
  if (invalidItems.length > 0) {
    ElMessage.error("请填写明细中的预估变更金额（必须大于0）");
    return;
  }
  if (
    tableList.value.some(
      (item) => !item.wasteCostAmt && item.wasteCostAmt !== 0,
    )
  ) {
    ElMessage.error("请填写明细中的无效成本金额");
    return;
  }

  if (tableList.value.some((item) => !item.wasteCostReasonId)) {
    ElMessage.error("请选择明细中的无效成本原因");
    return;
  }
  try {
    submitLoading.value = true;

    const params = {
      conId: props.conId,
      change: {
        id: formData.value.id,
        conBillId: formData.value.conBillId,
        status: formData.value.status,
        changeName: formData.value.changeName,
        changeType: formData.value.changeType,
        changeReasonId: formData.value.changeReasonId,
        changeReasonDesc: formData.value.changeReasonDesc,
        changeConent: formData.value.changeConent,
        changeAmt: formData.value.changeAmt,
        processNo: formData.value.processNo,
      },
      conlist: tableList.value.map((item) => ({
        conBillId: item.conBillId,
        conId: item.conId,
        conName: item.conName,
        estChangeAmt: item.estChangeAmt,
        wasteCostAmt: item.wasteCostAmt,
        wasteCostReasonId: item.wasteCostReasonId,
        needVisa: item.needVisa,
        remark: item.remark,
      })),
    };

    let res;
    if (isEdit.value) {
      res = await changeOrderApi.editChangeCon(params);
    } else {
      res = await changeOrderApi.addChangeCon(params);
    }

    if (res.code === 200) {
      ElMessage.success(isEdit.value ? "修改成功" : "保存成功");
      emit("success", res.data);
    }
  } catch (error) {
    console.error("提交失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

const initData = async () => {
  await initOptions();

  if (isAdd.value) {
    formData.value = initFormData();
    // 设置默认值
    formData.value.submiterName = "";
    formData.value.submiterDate = new Date().toLocaleString();
    await generateProcessNo();
    setTimeout(() => {
      formRef.value?.clearValidate();
    }, 0);
  } else if (isEdit.value || isDetail.value) {
    await loadDetail();
  }
};

onMounted(() => {
  initData();
});

// 暴露方法给父组件
defineExpose({
  initData,
  formData,
});
</script>

<style scoped lang="scss">
.basic-form-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
  padding: 0;
}

.form-header {
  width: 100%;
  background: #ffffff;
  padding: 16px 24px 12px 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
  border-bottom: 1px solid #e4e7ed;

  .header-title {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 0;
    box-sizing: border-box;
    font-size: 20px;
    font-weight: 700;
    color: #1d2129;
    letter-spacing: 0.5px;
  }

  .header-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
    padding: 4px 0;

    .el-button {
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }

      &:active {
        transform: translateY(0px);
      }
    }
  }
}

.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 15px 15px 30px;
  box-sizing: border-box;
}

.adapt-form {
  width: 100%;
  margin: 0 auto;

  .item-card {
    background: #ffffff;
    border-radius: 8px;
    padding: 15px 15px;
    margin-bottom: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    transition:
      box-shadow 0.3s ease,
      transform 0.2s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  padding: 0 0 12px 14px;
  position: relative;

  &::before {
    content: "";
    width: 4px;
    height: 18px;
    background: linear-gradient(180deg, #409eff, #66b1ff);
    border-radius: 2px;
    position: absolute;
    left: 0;
    top: 4px;
  }
}

.actionBar-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:deep(.el-textarea__inner) {
  resize: none;
}
</style>
