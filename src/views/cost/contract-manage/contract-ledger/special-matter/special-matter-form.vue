<!-- 特殊事项 -->
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

        <!-- 合同概要 -->
        <div class="item-card">
          <div class="section-title">合同概要</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="主合同名称" prop="mainConId">
                <PickInput v-model="formData.mainConName" placeholder="请选择主合同" :readonly="isReadonly"
                  v-model:model-value-id="formData.mainConId" @pick="openMainConDialog" @clear="clearMainCon" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同编号" prop="conSysNo">
                <el-input v-model="formData.conSysNo" placeholder="合同系统编号" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同金额" prop="conAmt">
                <el-input-number v-model="formData.conAmt" :min="0" :precision="2" :controls="false" placeholder="合同金额"
                  disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="供应商名称" prop="supName" required>
                <el-input v-model="formData.supName" clearable placeholder="" disabled />
              </el-form-item>
            </el-col>


            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="预结算合同金额" prop="conProperty">
                <el-input v-model="formData.conProperty" placeholder="履约金额" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计产值" prop="proProf">
                <el-input v-model="formData.proProf" placeholder="累计产值" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计应付" prop="conSignDate">
                <el-input v-model="formData.conSignDate" placeholder="累计应付" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计已付" prop="conEffectDate">
                <el-input v-model="formData.conEffectDate" placeholder="累计已付" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计欠款" prop="conEndDate">
                <el-input v-model="formData.conEndDate" placeholder="累计欠款" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="争议内容" prop="remark">
                <el-input v-model="formData.remark" type="textarea" :rows="4" maxlength="500" show-word-limit
                  placeholder="请输入争议内容" :disabled="isDetail" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 合同附件 -->
        <div class="item-card">
          <div class="section-title">相关附件</div>
          <el-form-item label="上传附件">
            <base-upload :disabled="isDetail" v-model:file-list="tempFileList" :limit="9" :multiple="false"
              :showIcon="true" :showTip="true" button-text="选择文件" size="default"
              @success="handleUploadSuccess"></base-upload>
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
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";
import BaseUpload from "@/components/base/base-upload.vue";
import BillHeader from "@/components/business/bill-components/bill-header.vue";
import BillInfo from "@/components/business/bill-components/bill-info.vue";
import PickInput from "@/components/base/base-pick-input.vue";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { dateUtil } from "@/utils/date-util";

defineOptions({ name: "special-matter-form" });

interface Props {
  mode: "add" | "edit" | "detail";
  specialId?: number; // 特殊事项ID
  conId?: number | undefined; // 合同ID
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  specialId: undefined,
  conId: undefined,
});

const emit = defineEmits<{
  (e: "success", data: any): void;
  (e: "cancel"): void;
}>();

const router = useRouter();
const userStore = useUserStore();

const mode = ref<"add" | "edit" | "detail">(props.mode);
const specialId = ref<number | undefined>(props.specialId);

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
  // =======================合同概要==========================
  mainConName: "", // 合同名称
  mainConId: "", // 合同ID
  conName: "", // 合同名称
  conTypeId: "", // 合同类型
  conSysNo: "", // 合同系统编号
  conPhyNo: "", // 合同档案编号
  supName: "", // 供应商名称
  proProf: "", // 生产专业
  conProperty: "", // 合同类别
  conAmt: 0, // 合同金额
  conSignDate: "", // 合同签订日期
  conEffectDate: "", // 合同生效日期
  conEndDate: "", // 合同终止日期
  // =======================其他==========================
  bizTitle: "",
  segId: undefined,
  segName: "",
  segNo: "",
  deptName: userStore.userInfo?.deptName,
  mguName: userStore.userInfo?.mguName,
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
const segOptions = ref([]);
const projectOptions = ref([]);
const tempFileList = ref([]);
const mainConDialogVisible = ref(false);

// 表单校验规则
const formRules: FormRules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  adjustType: [
    { required: true, message: "请选择调整大类", trigger: "change" },
  ],
  adjustSubType: [
    { required: true, message: "请选择调整小类", trigger: "change" },
  ],
  adjustAmt: [
    { required: true, message: "请输入调整金额", trigger: "change" },
    {
      type: "number",
      message: "请输入有效的数字",
      trigger: "change",
    },
    {
      validator: (_rule, value, callback) => {
        if (value < 0) {
          callback(new Error("调整金额不能小于0"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
  adjustDirection: [
    { required: true, message: "请选择调整方向", trigger: "change" },
  ],
  adjustDate: [
    { required: true, message: "请选择调整日期", trigger: "change" },
  ],
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

// 生成编号，HTJF：合同奖罚
const createConNo = async () => {
  try {
    const conRes = await commonApi.getBillNo({ bizType: "HTJF" });
  } catch (error) {
    console.error("生成合同编号失败:", error);
  }
};

// 初始化所有下拉选项
const initOptions = async () => {
  await Promise.all([getSegOptions(), getProjectOptions()]);
};

// 选择项目
const changeProject = async (value: number) => {
  if (value) {
    const res = await projectAreaApi.getInfoByProjId({ id: value });
    if (res.code === 200 && res.data) {
      const { compName, compId, segId, segName, segNo } = res.data;
      formData.value.compId = compId || "";
      formData.value.compName = compName || "";
      formData.value.segId = segId || "";
      formData.value.segName = segName || "";
      formData.value.segNo = segNo || "";
    }
  }
};
// 附件上传成功
const handleUploadSuccess = (fileList: any) => {
  console.log("当前上传成功文件", fileList);
  console.log("文件列表", tempFileList.value);
};
const openMainConDialog = () => {
  if (isDetail.value) return;
  if (!formData.value.projId) {
    ElMessage.warning(`请先选择项目！`);
    return;
  }
  mainConDialogVisible.value = true;
};
const handleMainConSelect = (data) => {
  console.log("选择合同", data);
  if (data && data.length > 0) {
    let newData = data || [];
    getConMainData(newData[0].id);
  }
};

// 获取主合同信息
const getConMainData = async (inConId) => {
  if (!inConId) return;
  if (inConId === formData.value.mainConId) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: inConId,
    });
    if (res.code === 200 && res.data) {
      const { conMain } = res.data;

      formData.value.segId = conMain.segId;
      formData.value.segName = conMain.segName;
      formData.value.segNo = conMain.segNo;
      formData.value.compName = conMain.companyName;
      formData.value.projId = conMain.projId;
      formData.value.mainConName = conMain.conName;
      formData.value.mainConId = conMain.id;

      formData.value.conTypeId = conMain.conTypeId;
      formData.value.conProperty = conMain.conProperty;
      formData.value.supName = conMain.supName;
    }
  } catch (error) {
    console.error("获取合同信息失败:", error);
  }
};
const clearMainCon = () => {
  formData.value.mainConName = undefined;
  formData.value.mainConId = undefined;
  formData.value.conTypeId = undefined;
  formData.value.conProperty = undefined;
  formData.value.supName = undefined;
}
// 加载详情（编辑/详情模式）
const loadDetail = async () => {
  if (!specialId.value) return;
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
  await initOptions();
  if (isAdd.value) {
    // await createConNo();
  } else {
    if (specialId.value) {
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
