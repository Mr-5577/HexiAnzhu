<template>
  <div class="basic-form-content">
    <!-- ============ 顶部操作栏 ============ -->
    <BillHeader
      :title="'变更申请'"
      :contract-no="billData.bizNo || ''"
      :submitter="formData.userName || ''"
      :submit-time="formData.createDate || ''"
      :status="billData.status || 0"
      :show-status="true"
      :button-loading="submitLoading"
      :save-disabled="isReadonly"
      :submit-disabled="isReadonly"
      :delete-disabled="isDetail || isAdd || !!billData.status"
      :void-disabled="isDetail || isAdd || !!billData.status"
      :view-disabled="isAdd"
      @save="handleFormDataSave"
      @submit="handleFormDataSubmit"
      @delete="handleDelete"
      @void="handleCancel"
      @viewFlow="handleViewProcess"
    />

    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :disabled="isReadonly"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="adapt-form"
      >
        <!-- ====== 卡片1：单据信息 ====== -->
        <BillInfo
          v-model="formData"
          :status="billData?.status || 0"
          :disabled="isReadonly"
          :project-options="projectOptions"
          @project-change="changeProject"
        />

        <!-- ====== 卡片2：变更信息 ====== -->
        <FormCard
          id="card-main"
          icon="📄"
          title="变更信息"
          v-model:collapsed="collapsedCards.basic"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item prop="changeName" label="变更事项名称" required>
                <el-input
                  v-model="formData.changeName"
                  clearable
                  :disabled="isDetail"
                  placeholder="请录入变更事项名称"
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
              <el-form-item prop="changeNo" label="变更单号" required>
                <el-input
                  v-model="formData.changeNo"
                  placeholder=""
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="changeAmt" label="变更总金额" required>
                <el-input-number
                  v-model="formData.changeAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="变更总金额由变更明细事项汇总"
                  style="width: 100%"
                  :formatter="value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/¥\s?|(,*)/g, '')"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="changeBusiDate" label="变更发生日期" required>
                <el-date-picker
                  v-model="formData.changeBusiDate"
                  :disabled="isDetail"
                  type="date"
                  placeholder="请选择变更发生日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                  :disabled-date="(time: Date) => time.getTime() > Date.now() - 8.64e7"
                />
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
            <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="24">
              <el-form-item prop="changeReasonDesc" label="变更原因说明" required>
                <el-input
                  v-model="formData.changeReasonDesc"
                  type="textarea"
                  clearable
                  maxlength="500"
                  :disabled="isDetail"
                  placeholder="请录入变更原因说明"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="24" :xl="24">
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
        </FormCard>

        <!-- ====== 卡片3：相关合同 ====== -->
        <FormCard
          id="card-link-con"
          icon="📄"
          title="相关合同"
          v-model:collapsed="collapsedCards.process"
        >
          <DetailTableCard
            ref="detailtableRef"
            title="变更明细"
            :count="tableList.length"
            add-text=""
            v-model="tableList"
            :show-summary="true"
            :highlight-current-row="false"
            :height="'220px'"
            :disabled="isDetail"
            :loading="tableLoading"
            :columns="linkConColumns"
            :show-add="false"
            @add="addLinkCon"
          >
            <template #header-extra>
              <el-button type="primary" size="small" @click="handleLinkCon">🔗关联合同</el-button>
            </template>
            <template #actions="{ row }">
              <el-button link type="danger" @click="deleteLinkCon(row)">
                删除
              </el-button>
            </template>
          </DetailTableCard>
        </FormCard>

        <!-- ====== 卡片4：成本分摊（编辑时展示） ====== -->
        <!-- 成本分摊：创建时不展示成本分摊模块，编辑时获取成本分摊数据进行展示查看详情 -->
         <FormCard
          id="card-alloc"
          icon="📄"
          title="成本分摊"
          v-show="isReadonly"
          v-model:collapsed="collapsedCards.process"
        >
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
        </FormCard>

        <!-- ====== 卡片5：补充合同附件 ====== -->
        <FormCard
          id="card-annex"
          icon="📎"
          title="相关附件"
          v-model:collapsed="collapsedCards.annex"
        >
          <el-form-item label="相关附件">
            <base-upload
              v-model:file-list="tempFileList"
              :limit="9"
              :multiple="false"
              :showIcon="true"
              :showTip="true"
              :maxSize="20"
              :unrestricted="true"
              :accept="''"
              button-text="选择文件"
              size="default"
              :disabled="isReadonly"
              @success="handleUploadSuccess"
            />
          </el-form-item>
        </FormCard>
      </el-form>
    </div>

    <!-- ============ 选择合同 弹窗 ============ -->
    <choose-con-dialog
      ref="conDialogRef"
      v-model="conDialogVisible"
      :projId="props.projId"
      @select="handleConSelect"
    />
  </div>
</template>

<script setup lang="ts">
// ==================== 模块导入 ====================
import { ref, computed, onMounted, nextTick,watch  } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
} from "element-plus";
import { useRouter, useRoute } from "vue-router";
import { v4 as uuidv4 } from "uuid";

// —— 组件 ——
import BaseUpload from "@/components/base/base-upload.vue";
import FormCard from "@/components/base/base-form-card.vue";
import ChooseConDialog from "./choose-con-dialog.vue";
import DetailTableCard from "@/components/base/detail-table-card.vue";

// —— 常量 / 枚举 ——
import { ChangeTypeEnum } from "@/constants/contract-manage/enums";

// —— API ——
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";
import { changeOrderApi } from "@/api/cost/contract-manage/change-order-api";

// —— 工具 / Composables ——
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { useFormLayout } from "@/composables/use-form-layout.ts";
import { useTableEditor } from "@/composables/use-table-editor.ts";

// —— Store ——
import { useUserStore } from "@/stores/user-store";
import { useTagsStore } from "@/stores/tags-store";
import { useMDStore } from "@/stores/md-store.ts";

// —— 类型 / 配置 ——
import { formType } from "@/types/form/form-types.ts";
import { NAV_CARDS, createLinkConColumns } from "./change-order-config.ts";
import { requiredInputRule, requiredRule } from "@/utils/form-rule-validate.ts";
import { dateUtil } from "@/utils/date-util.ts";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api.ts";

defineOptions({ name: "change-order-form" });

// ==================== Props & Emits ====================
interface Props {
  mode?: "add" | "edit" | "detail";
  projId: number;
  conId: number;
  conName?: string;
  changeId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  projId: undefined,
  conId: undefined,
  conName: "",
  changeId: undefined,
});

const emit = defineEmits<{
  (e: "success", data?: any): void;
  (e: "cancel"): void;
}>();

  // conId：明细第一行的 conId，没有则回退 props.conId
const conId = computed<number | undefined>(() => {
  const first = tableList.value[0];
  return first?.conId || props.conId;
});

// ==================== 选项数据 ====================
const segOptions = ref([]);
const projectOptions = ref([]);
const changeReasonOptions = ref([]);
const invalidCostReasonOptions = ref<any[]>([]);
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

// ==================== 路由 / Store ====================
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const tagsStore = useTagsStore();

// ==================== 表单布局 ====================
const { collapsedCards, toggleCard, formatMoney } = useFormLayout(NAV_CARDS);

// ==================== 单据 / 流程状态 ====================
const billData = ref({
  id: undefined,
  bizTitle: "",
  bizNo: "",
  status: 0,
  bizItemCode: formType.CON_CHANGE,
  flowId: null,
  conId: null,
  createName:"",
  createDate:"",
});

const flowListData = ref<any>(null);
const flowBaseData = ref<any>(null);

const mode = ref<"add" | "edit" | "detail">(props.mode);
const changeId = ref(route.query.changeId);

const isAdd = computed(() => mode.value === "add");
const isEdit = computed(() => mode.value === "edit");
const isDetail = computed(() => mode.value === "detail");

const isReadonly = computed(
  () => isDetail.value || !!billData.value.status,
);

// ==================== 表单相关 ====================
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const initFormData = () => ({
  id: undefined,
  conBillId: undefined,
  flowId:null,
  status: 0,
  changeName: "",
  changeType: undefined,
  changeReasonId: undefined,
  changeReasonDesc: "",
  changeConent: "",
  changeAmt: undefined,
  changeNo: "",
  // 额外字段
  bizTitle: "",
  approvalStatus: "",
  segId: undefined,
  segNo: "",
  segName: "",
  branchName: "",
  projId: undefined,
  compId: null,
  compName:"",
  userName: userStore.userInfo?.empName,
  createDate: dateUtil().format("YYYY-MM-DD"),
  deptName: userStore.userInfo?.deptName,
  mguName: userStore.userInfo?.mguName,
  changeBusiDate:"",
});
const formData = ref(initFormData());

// ==================== 表单校验规则 ====================
const formRules = ref({
  bizTitle: requiredInputRule("标题"),
  projId: requiredInputRule("项目"),
  changeName: requiredInputRule("变更事项名称"),
  changeType: requiredRule("变更类型"),
  changeReasonId: requiredRule("变更原因"),
  changeBusiDate: requiredInputRule("变更发生日期"),
  changeReasonDesc: requiredInputRule("变更原因说明"),
  remark: requiredInputRule("变更内容"),
});

// ==================== 表格相关 ====================
const tableList = ref([]);
const tableLoading = ref(false);
const linkConColumns = createLinkConColumns(invalidCostReasonOptions);

const { addRow: addLinkCon, deleteRow: deleteLinkCon } = useTableEditor(
  tableList,
  () => ({
    id: null,
    conBillId: formData.value.conBillId,
    changeId:formData.value.id,
    conId:0,
    conName:"",
    conSysNo:"",
    supName:"",
    estChangeAmt:0,
  }),
);

// ==================== 监听相关 ====================
// 变更总金额 = 明细「预估变更金额」之和
const totalChangeAmt = computed(() =>
  tableList.value.reduce(
    (sum, item) => sum + (Number(item.estChangeAmt) || 0),
    0,
  ),
);
// 同步到 formData.changeAmt
watch(totalChangeAmt, (val) => {
  formData.value.changeAmt = val;
});

// ==================== 弹窗相关 ====================
const conDialogVisible = ref(false);
// 选择合同
const handleLinkCon = async () => {
  if (isDetail.value) return;
  conDialogVisible.value = true;
}
const handleConSelect = (data) => {
  if (!data || data.length === 0) return;
  const selected = data[0];
  // 去重：合同已存在于明细中则提示并跳过
  const exists = tableList.value.some((item) => item.conId === selected.id);
  if (exists) {
    ElMessage.warning(`合同「${selected.conName}」已在变更明细中，不可重复关联`);
    return;
  }
  addLinkCon();
  const last = tableList.value[tableList.value.length - 1];
  last.conId = selected.id;
  last.conName = selected.conName;
  last.supName = selected.supName;
  last.conSysNo = selected.conSysNo;
};

// ==================== 选项初始化方法 ====================
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
    const res = await projectAreaApi.getSegMguProjList();
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};

// 获取合同信息
const getConMainData = async (conId) => {
  if (!conId) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: conId,
    });
    if (res.code === 200 && res.data) {
      const {
        conMain,
      } = res.data;
      tableList.value[tableList.value.length-1].conId = conMain.id;
      tableList.value[tableList.value.length-1].conName = conMain.conName;
      tableList.value[tableList.value.length-1].supName = conMain.supName;
      tableList.value[tableList.value.length-1].conSysNo = conMain.conSysNo;
    }
  } catch (error) {
    console.error("获取合同信息失败:", error);
  }
};

// 初始化数据字典
const initDictData = async () => {
  await loadDicts();
  changeReasonOptions.value = getDictList(dictMapping.changeReason); // 变更原因列表
  invalidCostReasonOptions.value = getDictList(dictMapping.invalidCostReason); // 无效成本原因
};

// 初始化所有选项
const initOptions = async () => {
  await Promise.all([getSegOptions(), getProjectOptions(), initDictData()]);
};

// ==================== 单号生成 ====================
const generateChangeNo = async () => {
  try {
    const res = await commonApi.getBillNo({ bizType: formType.CON_CHANGE });
    if (res.code === 200) {
      formData.value.changeNo = res.data;
      billData.value.bizNo = formData.value.changeNo;
    }
  } catch (error) {
    console.error("生成单号失败:", error);
  }
};

// ==================== 项目联动 ====================
const changeProject = async (value: number) => {
  if (value) {
    const res = await projectAreaApi.getInfoByProjId({ id: value });
    if (res.code === 200 && res.data) {
      const { compName, compId, segId, segName,segNo } = res.data;
      formData.value.segId = segId || "";
      formData.value.segNo = segNo || "";
      formData.value.segName = segName || "";
      formData.value.compId = compId || null;
      formData.value.compName = compName || "";
      // formData.value.bldIds = [];
      // formData.value.bldNames = "";
      // formData.value.mainConId = null;
      // formData.value.mainConName = "";
      // if (value) {
      //   await getBuildingListByProjId(value);
      //   await getCompanyListByProjId(value);
      // }
      tableList.value = [];
      // 程序化重置了若干字段，清除误报的必填红
      await nextTick();
      formRef.value?.clearValidate();
    }
  }
};

// ==================== 附件上传 ====================
const handleUploadSuccess = (fileList: any) => {
  tempFileList.value.push(fileList);
};


// ==================== 详情加载 ====================
const loadDetail = async () => {
  if (!changeId.value) return;
  try {
    const res = await changeOrderApi.getChangeConDetail({
      id: Number(changeId.value),
      isWithFlow:true,
    });
    if (res.code === 200) {
      const { change, conlist, flowList, flowBase,bill,annexList = [] } = res.data;
      billData.value = { ...billData.value, ...bill };
      flowListData.value = { ...flowListData.value, ...flowList };
      flowBaseData.value = { ...flowBaseData.value, ...flowBase };
      // 映射变更信息
      debugger
      formData.value = {
        ...formData.value,
        id: change.id,
        flowId:billData.value.flowId,
        compName: flowBaseData.value.compName,
        segId: flowBaseData.value.segId,
        segNo: flowBaseData.value.segNo,
        segName:flowBaseData.value.segName,
        projId: flowBaseData.value.projId,
        conBillId: change.conBillId,
        deptName: flowBaseData.value.deptName,
        mguName: flowBaseData.value.mguName,
        status: change.status,
        changeName: change.changeName,
        changeType: change.changeType,
        changeReasonId: change.changeReasonId,
        changeReasonDesc: change.changeReasonDesc,
        changeConent: change.changeConent,
        changeAmt: change.changeAmt,
        changeNo: billData.value.bizNo || "",
        bizTitle: billData.value.bizTitle || "",
        userName: flowBaseData.value.userName || "",
        createDate:billData.value.createDate || "",
        changeBusiDate: change.busiDate,
      };
      // 映射合同列表
      // tableList.value = conlist.map((item: any) => ({
      //   uuid: uuidv4(),
      //   changeId: item.changeId,
      //   conBillId: item.conBillId,
      //   conId: item.conId,
      //   conName: item.conName,
      //   estChangeAmt: item.estChangeAmt,
      //   wasteCostAmt: item.wasteCostAmt,
      //   wasteCostReasonId: item.wasteCostReasonId,
      //   needVisa: item.needVisa,
      //   remark: item.remark,
      // }));
      tableList.value = conlist?.map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));
      if (annexList && annexList.length > 0) {
          tempFileList.value = annexList.map((item: any) => ({
            ...item,
            name: item.annexName,
            url: item.annexPath,
          }));
        }
    }
  } catch (error) {
    console.error("加载详情失败:", error);
  }
};

// ==================== 校验与聚焦 ====================
// ---- 校验失败后：滚动到第一个错误项并聚焦对应控件 ----
const focusFirstError = (invalidFields?: Record<string, any>) => {
  const firstProp = Object.keys(invalidFields ?? {})[0];
  if (!firstProp) return;
  const formInst = formRef.value as any;
  const field = formInst?.fields?.find((f: any) => f.prop === firstProp);
  const el = field?.$el as HTMLElement | undefined;
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  nextTick(() => {
    const focusable = el.querySelector<HTMLElement>(
      'input:not([type="hidden"]), textarea, .el-select__wrapper, .el-date-editor input, [tabindex]',
    );
    focusable?.focus({ preventScroll: true });
  });
};

const validateConListable = (submit:boolean) => {
  if (tableList.value.length === 0) {
    ElMessage.error("变更合同列表不能为空");
    return false;
  }
  for (let i = 0; i < tableList.value.length; i++) {
    const item = tableList.value[i];
    if (!item.conId && submit) {
      ElMessage.error(`变更合同列表第${i + 1}行：合同不能为空，请选择合同！`);
      return false;
    }
    if ((!item.estChangeAmt || item.estChangeAmt === 0) && submit) {
      ElMessage.error(`变更合同列表第${i + 1}行：预估变更金额不能为0！`);
      return false;
    }
    if (item.needVisa == null && submit) {
      ElMessage.error(`变更合同列表第${i + 1}行：是否需签证不能为空！`);
      return false;
    }
    if (!item.wasteCostAmt && item.wasteCostAmt > 0 && !item.wasteCostReasonId && submit) {
      ElMessage.error(
        `变更合同列表第${i + 1}行：无效成本不为0时，请填写无效成本原因！`,
      );
      return false;
    }
  }
  return true;
};

// ==================== 提交参数构建 ====================
const buildSubmitParams = () => {
  return {
    bill: {
        ...billData.value,
        id: billData.value.id || undefined,
        bizTitle: formData.value.bizTitle,
        bizItemCode: formType.CON_CHANGE,
        segId: formData.value.segId,
        segName: formData.value.segName,
        segNo: formData.value.segNo,
        projId: formData.value.projId,
        compId: formData.value.compId,
        compName: formData.value.compName,
        flowId:formData.value.flowId,
        conId: conId.value,
      },
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
      changeNo: formData.value.changeNo,
      busiDate: formData.value.changeBusiDate,
    },
    conlist: tableList.value,
    annexList: tempFileList.value || [],
  };
};

// ==================== 页面导航 ====================
// 返回操作
const goBack = () => {
  if (isAdd.value) {
    tagsStore.closeTagByPath("/con/change-order/add");
  }
  if (isEdit.value) {
    tagsStore.closeTagByPath("/con/change-order/edit");
  }
  router.go(-1); // 返回上个页面
};

// ==================== 顶部操作栏方法 ====================
const handleCancel = async () => {
  ElMessageBox.confirm("确定要作废吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await changeOrderApi.voidChangeConlist({
        id: formData.value.id,
      });
      if (res.code === 200) {
        ElMessage.success("作废成功");
        goBack();
      }
    } catch (error) {
      console.error("作废失败:", error);
    }
  });
};

const handleViewProcess = async () => {
  if (flowListData.value && flowListData.value?.wfFlowId) {
    try {
      const redirectRes = await commonApi.generateRedirectUrl({
        oaRequestId: flowListData.value.wfFlowId,
      });
      if (redirectRes.code === 200 && redirectRes.data) {
        window.open(redirectRes.data, "_blank");
      }
    } catch (error) {
      console.error("查看流程失败:", error);
    }
  } else {
    ElMessage.warning("暂无流程信息");
  }
};

const handleDelete = async () => {
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await changeOrderApi.delChangeConlist(formData.value.id);
      if (res.code === 200) {
        ElMessage.success("删除成功");
        goBack();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  });
};

const handleFormDataSave = async () => {
  submitLoading.value = true;
  try {
    debugger;
    await formRef.value.validateField(["bizTitle", "changeName"]);
    // 校验各个明细表
    if (!validateConListable(false)) return;

    const params = buildSubmitParams();
    const res = await changeOrderApi.editChangeCon(params);
    if (res.code === 200 && res.data) {
      formData.value.id = res.data;
      changeId.value =formData.value.id;
      ElMessage.success("保存成功");
      await loadDetail();
    }
  } catch (error) {
    focusFirstError(error as Record<string, any>);
  } finally {
    submitLoading.value = false;
  }
};

const handleFormDataSubmit = async () => {
  submitLoading.value = true;
  try {
    await formRef.value.validate();
    // 校验各个明细表
    if (!validateConListable(true)) return;

    const params = buildSubmitParams();
    let res;
    if (formData.value.id) {
      res = await changeOrderApi.submitChangeCon(params);
    } else {
      res = await changeOrderApi.submitChangeCon(params);
    }
    if (res.code === 200) {
      ElMessage.success("提交成功,已发起审批！");
      // 生成OA审批页面重定向地址
      const redirectRes = await commonApi.generateRedirectUrl({
        oaRequestId: res.data,
      });
      // 提交成功后，关闭当前页面，跳转到单据列表页面
      goBack();

      if (redirectRes.code === 200 && redirectRes.data) {
        // 打开OA审批页面
        setTimeout(() => {
          window.open(redirectRes.data, "_blank");
        }, 800);
      }
    }
  } catch (error) {
    focusFirstError(error as Record<string, any>);
  } finally {
    submitLoading.value = false;
  }
};

// ==================== 初始化与生命周期 ====================
const initData = async () => {
  await initOptions();
  debugger
  if (isAdd.value) {
    formData.value = initFormData();
    await generateChangeNo();
    formData.value.projId = props.projId;
    if (formData.value.projId) {
      await changeProject(formData.value.projId);
    }
    setTimeout(() => {
      formRef.value?.clearValidate();
    }, 0);
    addLinkCon();
    if (tableList.value.length > 0 && props.conId) {
      await getConMainData(props.conId)
    }
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
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

/* ============ 表单滚动区 ============ */
.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px 30px;
  box-sizing: border-box;
}

.adapt-form {
  width: 100%;
  margin: 0 auto;

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
    color: #4e5969;
    line-height: 32px;
    padding-right: 12px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner),
  :deep(.el-select__wrapper) {
    border-radius: 4px;
    transition: all 0.2s;
  }

  /* 金额字段 ¥ 前缀 */
  .is-money :deep(.el-input__wrapper) {
    padding-left: 24px;
    position: relative;

    &::before {
      content: "¥";
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #86909c;
      font-size: 13px;
      pointer-events: none;
      z-index: 1;
    }
  }
}

/* 滚动条美化 */
.form-scroll-area::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.form-scroll-area::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
}
.form-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #909399;
}
.form-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}
</style>
