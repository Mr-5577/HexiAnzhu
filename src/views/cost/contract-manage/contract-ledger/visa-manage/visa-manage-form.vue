<!-- 签证管理 -->
<template>
  <div class="basic-form-content">
    <div class="form-header">
      <div class="header-title">签证审批</div>
      <div class="header-btn">
        <el-button
          type="primary"
          icon="DocumentAdd"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          保存
        </el-button>
        <el-button type="success" plain icon="Promotion"> 提交 </el-button>
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

        <!-- 变更信息 -->
        <div class="item-card">
          <div class="section-title">变更信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="changeId" label="变更事项" required>
                <el-select
                  v-model="formData.changeId"
                  placeholder="请选择变更合同"
                  style="width: 100%"
                  :disabled="isDetail"
                >
                  <el-option
                    v-for="item in changeOrderOptions"
                    :key="item.id"
                    :label="item.changeName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="processNo" label="变更单号">
                <el-input
                  v-model="formData.processNo"
                  placeholder="变更单号"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同名称" prop="conName">
                <el-input
                  v-model="formData.conName"
                  placeholder="合同名称"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="单位名称" prop="companyName">
                <el-input
                  v-model="formData.companyName"
                  placeholder="单位名称"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同分类" prop="conType">
                <el-input
                  v-model="formData.conType"
                  placeholder="合同分类"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="预估变更金额" prop="estChangeAmt">
                <el-input-number
                  v-model="formData.estChangeAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="预估变更金额"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="变更内容" prop="changeConent">
                <el-input
                  v-model="formData.changeConent"
                  type="textarea"
                  :rows="2"
                  maxlength="500"
                  show-word-limit
                  placeholder="变更内容"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 签证审核 -->
        <div class="item-card">
          <div class="section-title">签证审核</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="visaType" label="签证类型" required>
                <el-select
                  v-model="formData.visaType"
                  placeholder="请选择签证类型"
                  style="width: 100%"
                  :disabled="isDetail"
                >
                  <el-option
                    v-for="item in VisaTypeEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="visaApplyAmt" label="签证申报金额" required>
                <el-input-number
                  v-model="formData.visaApplyAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="请输入签证申报金额"
                  style="width: 100%"
                  :disabled="isDetail"
                  @change="handleCostingCutAmtChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="visaApplyDesc" label="签证申报说明" required>
                <el-input
                  v-model="formData.visaApplyDesc"
                  type="textarea"
                  placeholder="请输入签证申报说明"
                  :rows="2"
                  maxlength="500"
                  show-word-limit
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item
                prop="costingReviewAmt"
                label="成本审核金额"
                required
              >
                <el-input-number
                  v-model="formData.costingReviewAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="请输入成本审核金额"
                  style="width: 100%"
                  :disabled="isDetail"
                  @change="handleCostingCutAmtChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="costingCutAmt" label="成本审减金额" required>
                <el-input-number
                  v-model="formData.costingCutAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="自动计算"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="wasteCostAmt" label="无效成本金额" required>
                <el-input-number
                  v-model="formData.wasteCostAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="请输入无效成本金额"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item
                prop="wasteCostReasonId"
                label="无效成本原因"
                required
              >
                <el-select
                  v-model="formData.wasteCostReasonId"
                  placeholder="请选择无效成本原因"
                  style="width: 100%"
                  clearable
                  :disabled="isDetail"
                >
                  <el-option
                    v-for="item in wasteCostReasonOptions"
                    :key="item.id"
                    :label="item.dicLabel"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="costingOpinion" label="成本审核意见" required>
                <el-input
                  v-model="formData.costingOpinion"
                  type="textarea"
                  placeholder="请输入成本审核意见"
                  :rows="2"
                  maxlength="500"
                  show-word-limit
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="auditReviewAmt" label="审计审核金额" required>
                <el-input-number
                  v-model="formData.auditReviewAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="请输入审计审核金额"
                  style="width: 100%"
                  :disabled="isDetail"
                  @change="handleAuditCutAmtChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="auditCutAmt" label="审计审减金额" required>
                <el-input-number
                  v-model="formData.auditCutAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="自动计算"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="auditOpinion" label="审计审核意见" required>
                <el-input
                  v-model="formData.auditOpinion"
                  type="textarea"
                  placeholder="请输入审计审核意见"
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

        <!-- 成本分摊：创建时不展示成本分摊模块，编辑时获取成本分摊数据进行展示查看详情 -->
        <div class="item-card" v-show="isEdit && !isAdd">
          <div class="section-title">成本分摊</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <el-form-item label="分摊状态：" label-width="90px">
                {{ formData.allocationStatus || "未分摊" }}
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <el-form-item label="预警状态：" label-width="90px">
                {{ formData.warningStatus || "正常" }}
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <el-form-item label="分摊：" label-width="90px">
                <el-button type="primary" @click="handleAllocationDetail">
                  分摊详情
                </el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef, nextTick } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";
import { visaManagementApi } from "@/api/cost/contract-manage/visa-management-api";
import { changeOrderApi } from "@/api/cost/contract-manage/change-order-api";
import BaseUpload from "@/components/base/base-upload.vue";
import { VisaTypeEnum } from "@/constants/contract-manage/enums";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";

defineOptions({ name: "visa-management-form" });

interface Props {
  mode: "add" | "edit" | "detail";
  conId: number;
  visaId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  visaId: undefined,
  conId: undefined,
});

const emit = defineEmits<{
  (e: "success", data: any): void;
  (e: "cancel"): void;
}>();

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const mode = ref<"add" | "edit" | "detail">(props.mode);
const visaId = ref(props.visaId);
const conId = ref(props.conId);

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");

const projCascaderRef = useTemplateRef("projCascaderRef");
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const segOptions = ref([]);
const projectOptions = ref([]);
const changeOrderOptions = ref([]);
const wasteCostReasonOptions = ref([]);
const tempFileList = ref([]);

// ==================== 数据字典 ====================
const { getDictList, loadDicts } = useDict([dictMapping.invalidCostReason], {
  treeDictCodes: [],
});

const initFormData = () => ({
  id: null,
  conBillId: null, // 单据ID
  status: 0, // 状态 0 草稿，5 审批中，10 已审批，30 已作废
  changeId: null, // 变更ID
  visaType: null, // 签证类型
  visaApplyAmt: 0, // 签证申报金额
  visaApplyDesc: "", // 签证申报说明
  costingReviewAmt: 0, // 成本审核金额
  costingCutAmt: 0, // 成本审减金额
  costingOpinion: "", // 成本审核意见
  wasteCostAmt: 0, // 无效成本金额
  wasteCostReasonId: null, // 无效成本原因
  auditReviewAmt: 0, // 审计审核金额
  auditCutAmt: 0, // 审计审减金额
  auditOpinion: "", // 审计审核意见
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
  // 变更信息展示字段
  processNo: "",
  conName: "",
  conType: "",
  estChangeAmt: 0,
  changeConent: "",
  // 成本分摊
  allocationStatus: "",
  warningStatus: "",
});

const formData = ref(initFormData());

// ==================== 表单校验规则 ====================
const formRules: FormRules = {
  changeId: [{ required: true, message: "请选择变更合同", trigger: "change" }],
  visaType: [{ required: true, message: "请选择签证类型", trigger: "change" }],
  visaApplyAmt: [
    { required: true, message: "请输入签证申报金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额必须大于等于0", trigger: "blur" },
  ],
  visaApplyDesc: [
    { required: true, message: "请输入签证申报说明", trigger: "change" },
    { max: 500, message: "签证申报说明不能超过500个字符", trigger: "blur" },
  ],
  costingReviewAmt: [
    { required: true, message: "请输入成本审核金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额必须大于等于0", trigger: "blur" },
  ],
  costingCutAmt: [
    { required: true, message: "请输入成本审减金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额必须大于等于0", trigger: "blur" },
  ],
  wasteCostAmt: [
    { required: true, message: "请输入无效成本金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额必须大于等于0", trigger: "blur" },
  ],
  wasteCostReasonId: [
    { required: true, message: "请选择无效成本原因", trigger: "change" },
  ],
  auditReviewAmt: [
    { required: true, message: "请输入审计审核金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额必须大于等于0", trigger: "blur" },
  ],
  auditCutAmt: [
    { required: true, message: "请输入审计审减金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额必须大于等于0", trigger: "blur" },
  ],
  costingOpinion: [
    { required: true, message: "请输入成本审核意见", trigger: "blur" },
    { max: 500, message: "成本审核意见不能超过500个字符", trigger: "blur" },
  ],
  auditOpinion: [
    { required: true, message: "请输入审计审核意见", trigger: "blur" },
    { max: 500, message: "审计审核意见不能超过500个字符", trigger: "blur" },
  ],
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择所属项目", trigger: "change" }],
};

// 计算成本审减金额
const calculateCostingCutAmt = () => {
  const visaApplyAmt = Number(formData.value.visaApplyAmt || 0);
  const costingReviewAmt = Number(formData.value.costingReviewAmt || 0);
  const costingCutAmt = visaApplyAmt - costingReviewAmt;
  formData.value.costingCutAmt = costingCutAmt < 0 ? 0 : costingCutAmt;
};

// 计算审计审减金额
const calculateAuditCutAmt = () => {
  const costingReviewAmt = Number(formData.value.costingReviewAmt || 0);
  const auditReviewAmt = Number(formData.value.auditReviewAmt || 0);
  const auditCutAmt = costingReviewAmt - auditReviewAmt;
  formData.value.auditCutAmt = auditCutAmt < 0 ? 0 : auditCutAmt;
};

// 处理成本相关金额变化
const handleCostingCutAmtChange = () => {
  calculateCostingCutAmt();
  calculateAuditCutAmt();
};

// 处理审计相关金额变化
const handleAuditCutAmtChange = () => {
  calculateAuditCutAmt();
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
  wasteCostReasonOptions.value = getDictList(dictMapping.invalidCostReason); // 无效成本原因
};

// 获取变更合同列表
const getChangeOrderList = async () => {
  if (!conId.value) {
    changeOrderOptions.value = [];
    return;
  }
  try {
    const res = await changeOrderApi.getChangeConList({
      conId: conId.value,
    });
    if (res.code === 200) {
      changeOrderOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取变更合同列表失败:", error);
  }
};

// 生成单号
const generateVisaNo = async () => {
  try {
    const res = await commonApi.getBillNo({ bizType: "VISA" });
    if (res.code === 200) {
      formData.value.processNo = res.data;
    }
  } catch (error) {
    console.error("生成签证单号失败:", error);
  }
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

const handleUploadSuccess = (fileList: any) => {
  console.log("文件上传成功", fileList);
};

const loadDetail = async () => {
  if (!visaId.value) return;
  try {
    const res = await visaManagementApi.getVisaDetail({
      id: Number(visaId.value),
    });
    if (res.code === 200) {
      const data = res.data;
      formData.value = {
        ...formData.value,
        id: data.id,
        conBillId: data.conBillId,
        status: data.status ?? 0,
        changeId: data.changeId ? Number(data.changeId) : undefined,
        visaType: data.visaType ?? undefined,
        visaApplyAmt: data.visaApplyAmt ?? 0,
        visaApplyDesc: data.visaApplyDesc || "",
        costingReviewAmt: data.costingReviewAmt ?? 0,
        costingCutAmt: data.costingCutAmt ?? 0,
        costingOpinion: data.costingOpinion || "",
        wasteCostAmt: data.wasteCostAmt ?? 0,
        wasteCostReasonId: data.wasteCostReasonId ?? undefined,
        auditReviewAmt: data.auditReviewAmt ?? 0,
        auditCutAmt: data.auditCutAmt ?? 0,
        auditOpinion: data.auditOpinion || "",

        segId: data.segId,
        projId: data.projId,
        processNo: data.processNo || "",
        conName: data.conName || "",
        conType: data.conType || "",
        estChangeAmt: data.estChangeAmt ?? 0,
        changeConent: data.changeConent || "",
        allocationStatus: data.allocationStatus || "",
        warningStatus: data.warningStatus || "",
      };
    }
  } catch (error) {
    console.error("加载签证详情失败:", error);
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
  try {
    submitLoading.value = true;

    const baseParams = {
      id: formData.value.id,
      conBillId: formData.value.conBillId,
      status: formData.value.status,
      changeId: formData.value.changeId,
      visaType: formData.value.visaType,
      visaApplyAmt: formData.value.visaApplyAmt,
      visaApplyDesc: formData.value.visaApplyDesc,
      costingReviewAmt: formData.value.costingReviewAmt,
      costingCutAmt: formData.value.costingCutAmt,
      costingOpinion: formData.value.costingOpinion,
      wasteCostAmt: formData.value.wasteCostAmt,
      wasteCostReasonId: formData.value.wasteCostReasonId,
      auditReviewAmt: formData.value.auditReviewAmt,
      auditCutAmt: formData.value.auditCutAmt,
      auditOpinion: formData.value.auditOpinion,
    };
    let res;
    if (isEdit.value) {
      res = await visaManagementApi.editVisa({
        ...baseParams,
        conId: conId.value,
      });
    } else {
      const addParams = {
        conId: conId.value,
        visa: baseParams,
      };
      res = await visaManagementApi.addVisa(addParams);
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

const handleAllocationDetail = () => {};

const initData = async () => {
  await getSegOptions();
  await getProjectOptions();
  await initDictData();

  // 获取变更合同列表
  if (conId.value) {
    await getChangeOrderList();
  }
  if (isAdd.value) {
    formData.value = initFormData();
    formData.value.submiterName = "";
    formData.value.submiterDate = new Date().toLocaleString();
    await generateVisaNo(); // 生成单号
    nextTick(() => {
      formRef.value?.clearValidate();
    });
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

:deep(.el-textarea__inner) {
  resize: none;
}
</style>
