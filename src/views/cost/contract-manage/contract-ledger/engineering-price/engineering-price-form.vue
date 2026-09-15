<!-- 工程核价 -->
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
              <el-form-item label="合同名称" prop="conName">
                <el-input v-model="formData.conName" placeholder="合同名称" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同编号" prop="conSysNo">
                <el-input v-model="formData.conSysNo" placeholder="合同系统编号" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="档案编号" prop="conPhyNo">
                <el-input v-model="formData.conPhyNo" placeholder="合同档案编号" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="供应商名称" prop="supName">
                <el-input v-model="formData.supName" placeholder="供应商名称" disabled style="width: 100%" />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同金额" prop="conAmt">
                <el-input-number v-model="formData.conAmt" :min="0" :precision="2" :controls="false" placeholder="合同金额"
                  disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="计价方式" prop="conProperty">
                <el-input v-model="formData.conProperty" placeholder="计价方式" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="生产专业" prop="proProf">
                <el-input v-model="formData.proProf" placeholder="生产专业" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同分类" prop="conSignDate">
                <el-input v-model="formData.conSignDate" placeholder="合同分类" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 申报内容 -->
        <div class="item-card">
          <div class="section-title">申报内容</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="申报金额" prop="applyAmt" required>
                <el-input-number v-model="formData.applyAmt" :min="0" :precision="2" :controls="false"
                  placeholder="请输入申报金额" :disabled="isDetail" style="width: 100%" @change="calcCostingCutAmt" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同签约金额" prop="signAmt" required>
                <el-input-number v-model="formData.signAmt" :min="0" :precision="2" :controls="false"
                  placeholder="请输入合同签约金额" :disabled="isDetail" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="申报事项说明" prop="applyDesc">
                <el-input v-model="formData.applyDesc" type="textarea" :rows="3" maxlength="500" show-word-limit
                  placeholder="请输入申报事项说明" :disabled="isDetail" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 成本审核 -->
        <div class="item-card">
          <div class="section-title">成本审核</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="成本审核金额" prop="costingReviewAmt" required>
                <el-input-number v-model="formData.costingReviewAmt" :min="0" :precision="2" :controls="false"
                  placeholder="请输入成本审核金额" :disabled="isDetail" style="width: 100%" @change="calcCostingCutAmt" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="成本审减金额" prop="costingCutAmt" required>
                <el-input-number v-model="formData.costingCutAmt" :min="0" :precision="2" :controls="false"
                  placeholder="自动计算" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="成本审核意见" prop="costingOpinion">
                <el-input v-model="formData.costingOpinion" type="textarea" :rows="3" maxlength="500" show-word-limit
                  placeholder="请输入成本审核意见" :disabled="isDetail" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 审计审核 -->
        <div class="item-card">
          <div class="section-title">审计审核</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="审计审核金额" prop="auditReviewAmt" required>
                <el-input-number v-model="formData.auditReviewAmt" :min="0" :precision="2" :controls="false"
                  placeholder="请输入审计审核金额" :disabled="isDetail" style="width: 100%" @change="calcAuditCutAmt" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="审计审减金额" prop="auditCutAmt" required>
                <el-input-number v-model="formData.auditCutAmt" :min="0" :precision="2" :controls="false"
                  placeholder="自动计算" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="审计审核意见" prop="auditOpinion">
                <el-input v-model="formData.auditOpinion" type="textarea" :rows="3" maxlength="500" show-word-limit
                  placeholder="请输入审计审核意见" :disabled="isDetail" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { engineeringPriceApi } from "@/api/cost/contract-manage/engineering-price-api";
import BaseUpload from "@/components/base/base-upload.vue";
import BillHeader from "@/components/business/bill-components/bill-header.vue";
import BillInfo from "@/components/business/bill-components/bill-info.vue";

defineOptions({ name: "special-matter-form" });

interface Props {
  mode: "add" | "edit" | "detail";
  auditPriceId?: number; // 工程核价ID
  conId?: number | null; // 合同ID
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  auditPriceId: undefined,
  conId: null,
});

const emit = defineEmits<{
  (e: "success", data: any): void;
  (e: "cancel"): void;
}>();

const router = useRouter();
const userStore = useUserStore();

const mode = ref<"add" | "edit" | "detail">(props.mode);
const auditPriceId = ref<number | undefined>(props.auditPriceId);

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


// 初始化表单数据
const getInitFormData = () => ({
  // 工程核价字段
  id: null as number | null,
  conBillId: null,
  signAmt: 0,
  applyAmt: 0,
  applyDesc: "",
  costingReviewAmt: 0,
  costingCutAmt: null as number | null,
  costingOpinion: "",
  auditReviewAmt: 0,
  auditCutAmt: null as number | null,
  auditOpinion: "",
  status: 0,
  // 合同概要字段
  conName: "",
  conSysNo: "",
  conPhyNo: "",
  supName: "",
  proProf: "",
  conProperty: "",
  conAmt: 0,
  conSignDate: "",
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

const formData = ref(getInitFormData());
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const segOptions = ref([]);
const projectOptions = ref([]);
const tempFileList = ref([]);

// 计算成本审减金额 = 成本审核金额 - 申报金额
const calcCostingCutAmt = () => {
  const reviewAmt = formData.value.costingReviewAmt || 0;
  const applyAmt = formData.value.applyAmt || 0;
  const cutAmt = reviewAmt - applyAmt;
  formData.value.costingCutAmt = cutAmt >= 0 ? cutAmt : 0;
};

// 计算审计审减金额 = 审计审核金额 - 成本审核金额
const calcAuditCutAmt = () => {
  const auditAmt = formData.value.auditReviewAmt || 0;
  const reviewAmt = formData.value.costingReviewAmt || 0;
  const cutAmt = auditAmt - reviewAmt;
  formData.value.auditCutAmt = cutAmt >= 0 ? cutAmt : 0;
};

// 表单校验规则
const formRules: FormRules = {
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  signAmt: [
    { required: true, message: "请输入合同签约金额", trigger: "change" },
  ],
  applyAmt: [{ required: true, message: "请输入申报金额", trigger: "change" }],
  costingReviewAmt: [
    { required: true, message: "请输入成本审核金额", trigger: "change" },
  ],
  costingCutAmt: [
    { required: true, message: "请输入成本审减金额", trigger: "blur" },
  ],
  auditReviewAmt: [
    { required: true, message: "请输入审计审核金额", trigger: "change" },
  ],
  auditCutAmt: [
    { required: true, message: "请输入审计审减金额", trigger: "change" },
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

// 初始化所有下拉选项
const initOptions = async () => {
  await Promise.all([getSegOptions(), getProjectOptions()]);
};

// 选择项目
const changeProject = (value: number) => {
  console.log(value);
};

// 附件上传成功
const handleUploadSuccess = (fileList: any) => {
  console.log("当前上传成功文件", fileList);
  console.log("文件列表", tempFileList.value);
};

// 加载详情（编辑/详情模式）
const loadDetail = async () => {
  if (!auditPriceId.value) return;
  try {
    const res = await engineeringPriceApi.getAuditPriceDetail({
      id: auditPriceId.value,
    });
    if (res.code === 200 && res.data) {
      const data = res.data;
      // 填充表单数据
      formData.value = {
        ...formData.value,
        id: data.id,
        conBillId: data.conBillId,
        signAmt: data.signAmt || 0,
        applyAmt: data.applyAmt || 0,
        applyDesc: data.applyDesc || "",
        costingReviewAmt: data.costingReviewAmt || 0,
        costingCutAmt: data.costingCutAmt,
        costingOpinion: data.costingOpinion || "",
        auditReviewAmt: data.auditReviewAmt || 0,
        auditCutAmt: data.auditCutAmt,
        auditOpinion: data.auditOpinion || "",
        status: data.status || 0,
        // 如果有合同概要数据也一并填充
        conName: data.conName || "",
        conSysNo: data.conSysNo || "",
        conPhyNo: data.conPhyNo || "",
        supName: data.supName || "",
        conAmt: data.conAmt || 0,
        segId: data.segId,
        projId: data.projId,
      };
    }
  } catch (error) {
    console.error("加载详情失败:", error);
    ElMessage.error("加载数据失败");
  }
};
const handleSave = async () => {
  console.log("保存");
}
// 提交表单
const handleSubmit = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch (error) {
    ElMessage.error("请检查表单！");
    return;
  }
  try {
    submitLoading.value = true;

    // 构建提交参数
    const params = {
      id: formData.value.id,
      conBillId: formData.value.conBillId,
      signAmt: formData.value.signAmt,
      applyAmt: formData.value.applyAmt,
      applyDesc: formData.value.applyDesc,
      costingReviewAmt: formData.value.costingReviewAmt,
      costingCutAmt: formData.value.costingCutAmt,
      costingOpinion: formData.value.costingOpinion,
      auditReviewAmt: formData.value.auditReviewAmt,
      auditCutAmt: formData.value.auditCutAmt,
      auditOpinion: formData.value.auditOpinion,
      status: formData.value.status,
      segId: formData.value.segId,
      projId: formData.value.projId,
    };

    let res;
    if (isEdit.value && formData.value.id) {
      res = await engineeringPriceApi.editAuditPrice(params);
    } else {
      const submitParams = {
        conId: props.conId,
        auditPrice: params,
      };
      res = await engineeringPriceApi.addAuditPrice(submitParams);
    }

    if (res.code === 200) {
      ElMessage.success(isEdit.value ? "修改成功" : "新增成功");
      emit("success", res.data);
    }
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

// 删除
const handleDelete = () => { };

// 作废
const handleCancel = () => { };

// 查看流程
const handleViewProcess = () => { };

// 初始化数据
const initData = async () => {
  await initOptions();
  if (isAdd.value) {
    formData.value = getInitFormData();
    // 设置默认提交人信息
    if (userStore.userInfo) {
      //   formData.value.submiterName = userStore.userInfo.userName || "";
    }
  } else {
    if (auditPriceId.value) {
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

:deep(.el-textarea__inner) {
  resize: none;
}
</style>
