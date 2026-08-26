<!-- 款项调整 -->
<template>
  <div class="basic-form-content">
    <BillHeader :title="'款项调整审批'" :contract-no="billData.bizNo || ''" :submitter="formData.userName || ''"
      :submit-time="formData.createDate || ''" :status="billData.status || 0" :show-status="true"
      :button-loading="submitLoading" :save-disabled="isReadonly" :submit-disabled="isReadonly"
      :delete-disabled="isDetail || isAdd || !!billData.status" :void-disabled="isDetail || isAdd || !!billData.status"
      :view-disabled="isAdd" @save="handleSave" @submit="handleSubmit" @delete="handleDelete" @void="handleCancel"
      @viewFlow="handleViewProcess" />
    <div class="form-scroll-area">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="adapt-form">
        <BillInfo v-model="formData" :status="billData?.status || 0" :disabled="isDetail || !!billData.status"
          :project-options="projectOptions" @project-change="changeProject" />

        <!-- 合同信息 -->
        <div class="item-card">
          <div class="section-title">合同信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="主合同名称" prop="mainConId">
                <PickInput v-model="formData.mainConName" placeholder="请选择主合同" :readonly="isReadonly"
                  v-model:model-value-id="formData.mainConId" @pick="openMainConDialog" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同类型" prop="conProperty" required>
                <EnumSelect v-model="formData.conProperty" :options="ConPropertyEnum" placeholder="" disabled />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="conTypeId" label="合同分类" required>
                <ConTypeSelector v-model="formData.conTypeId" :show-all-levels="false" placeholder=""
                  style="width: 100%" :width="'100%'" clearable filterable disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="供应商名称" prop="supName" required>
                <el-input v-model="formData.supName" clearable placeholder="" disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 款项调整 -->
        <div class="item-card">
          <div class="section-title">款项调整</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="调整大类" prop="adjustType" required>
                <el-select v-model="formData.adjustType" placeholder="请选择调整大类" style="width: 100%" :disabled="isDetail">
                  <el-option label="合同奖罚" value="contract_reward_punish" />
                  <el-option label="合同扣款" value="contract_deduction" />
                  <el-option label="合同追加" value="contract_addition" />
                  <el-option label="合同调减" value="contract_reduction" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="调整小类" prop="adjustSubType" required>
                <el-select v-model="formData.adjustSubType" placeholder="请选择调整小类" style="width: 100%"
                  :disabled="isDetail">
                  <el-option label="质量奖罚" value="quality_reward_punish" />
                  <el-option label="工期奖罚" value="schedule_reward_punish" />
                  <el-option label="安全奖罚" value="safety_reward_punish" />
                  <el-option label="违约扣款" value="default_deduction" />
                  <el-option label="变更追加" value="change_addition" />
                  <el-option label="变更调减" value="change_reduction" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="扣/奖金额" prop="adjustAmt" required>
                <el-input-number v-model="formData.adjustAmt" :min="0" :precision="2" :controls="false"
                  placeholder="扣/奖金额" style="width: 100%" :disabled="isDetail" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="事项说明" prop="remark">
                <el-input v-model="formData.remark" type="textarea" :rows="4" maxlength="500" show-word-limit
                  placeholder="请输入事项说明" :disabled="isDetail" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 合同附件 -->
        <div class="item-card">
          <div class="section-title">相关附件</div>
          <el-form-item label="上传附件">
            <base-upload v-model:file-list="tempFileList" :limit="9" :multiple="false" :showIcon="true" :showTip="true"
              :maxSize="20" :unrestricted="true" :accept="''" button-text="选择文件" size="default"
              :disabled="isDetail || !!billData.status" @success="handleUploadSuccess"></base-upload>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <!-- 选择合同弹窗 -->
    <choose-contract-dialog ref="contractDialogRef" v-model="mainConDialogVisible" :selectionMode="'single'"
      :projId=formData.projId @select="handleMainConSelect" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { dateUtil } from "@/utils/date-util.ts";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";
import BaseUpload from "@/components/base/base-upload.vue";
import PickInput from "@/components/base/base-pick-input.vue";
import EnumSelect from "@/components/base/base-enum-select.vue";
import BillHeader from "@/components/business/bill-components/bill-header.vue";
import BillInfo from "@/components/business/bill-components/bill-info.vue";
import ChooseContractDialog from "@/components/business/choose-contract-dialog.vue";

defineOptions({ name: "payment-adjust-form" });

interface Props {
  mode: "add" | "edit" | "detail";
  dedId?: number | undefined; // 奖罚/款项调整ID
  conId?: number | undefined; // 合同ID
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  dedId: undefined,
  conId: undefined,
});

const emit = defineEmits<{
  (e: "success", data: any): void;
  (e: "cancel"): void;
}>();

const router = useRouter();
const userStore = useUserStore();

const mode = ref<"add" | "edit" | "detail">(props.mode);
const dedId = ref<number | undefined>(props.dedId);
const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");
const isReadonly = computed(
  () => isDetail.value || !!billData.value.status,
);

const billData = ref({
  id: undefined,
  bizTitle: "",
  bizNo: "",
  status: 0,
  bizItemCode: '',
  flowId: null,
  conId: null,
  createName: "",
  createDate: "",
});
const flowBaseData = ref(null);
const flowListData = ref({
  bizItemCode: "",
  wfFlowId: null,
  wfStatus: 0,
  wfTitle: "",
});
const initFormData = () => ({
  id: undefined,
  processNo: undefined,
  processName: "",
  processAmt: 0,
  remark: "",
  nconBillId: undefined,
  settledPaymentId: undefined,
  status: 0,
  // =======================合同信息==========================
  mainConName: "", // 合同名称
  mainConId: "", // 合同ID
  conTypeId: "", // 合同类型
  supName: "", // 供应商名称
  proProf: "", // 生产专业
  conProperty: "", // 合同类别
  conAmt: 0, // 合同金额
  conSignDate: "", // 合同签订日期
  conEffectDate: "", // 合同生效日期
  conEndDate: "", // 合同终止日期
  // =======================款项调整==========================
  adjustType: "", // 调整大类
  adjustSubType: "", // 调整小类
  adjustAmt: 0, // 调整金额
  // =======================其他==========================
  bizTitle: "",
  segId: undefined,
  segName: "",
  segNo: "",
  deptName: "",
  mguName: "",
  projId: undefined,
  projName: "",
  compId: "",
  compName: "",
  userName: "",
  createDate: "",
});
// 表单数据
const formData = ref(initFormData());
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const projectOptions = ref([]);
const tempFileList = ref([]);
const ConPropertyEnum = ref([]);
const mainConDialogVisible = ref(false);

// 表单校验规则
const formRules: FormRules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
};

// 选择项目
const changeProject = (value: number) => {
  console.log(value);
  if (value) {
  }
};
// 附件上传成功
const handleUploadSuccess = (fileList: any) => {
  console.log("当前上传成功文件", fileList);
  console.log("文件列表", tempFileList.value);
};
const openMainConDialog = () => {
  if (isDetail.value) return;
  mainConDialogVisible.value = true;
};
const handleMainConSelect = (data) => {
  console.log("选择合同", data);
};

// 加载详情（编辑/详情模式）
const loadDetail = async () => {
  if (!dedId.value) return;
  try {
  } catch (error) { }
};
const handleSave = async () => {
  console.log("保存");
}
// 提交表单
const handleSubmit = async () => {
  console.log("提交表单", formData.value);
  if (isDetail.value) return;
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch (error) {
  } finally {
    submitLoading.value = false;
  }
};
const handleDelete = async () => {
  console.log("删除");
}
const handleCancel = async () => {
  console.log("作废");
}
const handleViewProcess = async () => {
  console.log("查看流程");
}
const initData = async () => {
  formData.value.userName = userStore.userInfo?.empName || "";
  formData.value.createDate = dateUtil().format("YYYY-MM-DD");
  if (isAdd.value) {
    initFormData();
  } else {
    if (dedId.value) {
      await loadDetail();
    }
  }
};

onMounted(() => {
  initData();
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
</style>
