<!-- 无合同事项台账信息 -->
<template>
  <div class="basic-form-content">
    <div class="form-header">
      <div class="header-title">无合同事项审批</div>
      <div class="header-btn">
        <el-button
          type="primary"
          icon="DocumentAdd"
          :loading="submitLoading"
          @click="handleSave"
          :disabled="isDetail || !!billData.status"
        >
          保存
        </el-button>
        <el-button
          type="success"
          plain
          icon="Promotion"
          :loading="submitLoading"
          @click="handleSubmit"
          :disabled="isDetail || !!billData.status"
        >
          提交
        </el-button>
        <el-button
          type="danger"
          plain
          icon="Delete"
          @click="handleDelete"
          :disabled="isDetail || isAdd || !!billData.status"
        >
          删除
        </el-button>
        <el-button
          type="warning"
          plain
          icon="Remove"
          @click="handleCancel"
          :disabled="isDetail || isAdd || !!billData.status"
        >
          作废
        </el-button>
        <el-button
          type="info"
          plain
          icon="View"
          :disabled="isAdd"
          @click="handleViewProcess"
        >
          查看流程
        </el-button>
      </div>
    </div>
    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="110px"
        class="adapt-form"
      >
        <div class="item-card">
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="18" :xl="18">
              <el-form-item label="标题" prop="bizTitle" required>
                <el-input
                  v-model="formData.bizTitle"
                  clearable
                  :disabled="isDetail || !!billData.status"
                  placeholder="标题"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="审批状态" prop="approvalStatus">
                <el-tag
                  :type="getEnumType(conBillStatusEnum, billData?.status || 0)"
                >
                  {{ getEnumLabel(conBillStatusEnum, billData?.status || 0) }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="业务板块" prop="segId" required>
                <el-input
                  v-model="formData.segName"
                  disabled
                  placeholder="业务板块"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="板块编码" prop="segNo">
                <el-input
                  v-model="formData.segNo"
                  disabled
                  placeholder="板块编码"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="部门" prop="deptName">
                <el-input
                  v-model="formData.deptName"
                  placeholder="部门"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="分部" prop="mguName">
                <el-input
                  v-model="formData.mguName"
                  placeholder="分部"
                  disabled
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
                  filterable
                  :disabled="isDetail || !!billData.status"
                  @change="changeProject"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="项目所属公司" prop="compName">
                <el-input
                  v-model="formData.compName"
                  placeholder="项目所属公司"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="提交人" prop="userName">
                <el-input
                  v-model="formData.userName"
                  clearable
                  placeholder="提交人"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="提交时间" prop="createDate">
                <el-date-picker
                  v-model="formData.createDate"
                  type="date"
                  placeholder="提交时间"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="item-card">
          <div class="section-title">立项信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item prop="processName" label="事项名称" required>
                <el-input
                  v-model="formData.processName"
                  placeholder="请输入事项名称"
                  style="width: 100%"
                  :disabled="isDetail || !!billData.status"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="processAmt" label="事项计划金额" required>
                <el-input-number
                  v-model="formData.processAmt"
                  :min="0"
                  :max="999999999"
                  :precision="2"
                  :controls="false"
                  placeholder="请输入事项计划金额"
                  style="width: 100%"
                  :disabled="isDetail || !!billData.status"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="费用类型" prop="finaTypeId" required>
                <el-cascader
                  v-model="formData.finaTypeId"
                  :options="feeTypeOptions"
                  :show-all-levels="false"
                  :props="{
                    expandTrigger: 'hover',
                    emitPath: false,
                    checkStrictly: false,
                    value: 'id',
                    label: 'finaTypeName',
                    children: 'children',
                  }"
                  placeholder="请选择费用类型"
                  style="width: 100%"
                  filterable
                  :disabled="isDetail || !!billData.status"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="事项说明" prop="remark">
                <el-input
                  v-model="formData.remark"
                  type="textarea"
                  :rows="4"
                  maxlength="500"
                  show-word-limit
                  placeholder="请输入事项说明"
                  :disabled="isDetail || !!billData.status"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 成本分摊：创建时不展示成本分摊模块，编辑时获取成本分摊数据进行展示查看详情 -->
        <div class="item-card" v-if="isShowCostAllocation">
          <div class="section-title">成本分摊</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <el-form-item label="分摊状态：" label-width="90px">
                未分摊456
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <el-form-item label="预警状态：" label-width="90px">
                正常132
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

        <!-- 相关附件 -->
        <div class="item-card">
          <div class="section-title">相关附件</div>
          <el-form-item label="上传附件">
            <base-upload
              v-model:file-list="annexFileList"
              :limit="9"
              :multiple="false"
              :showIcon="true"
              :showTip="true"
              :maxSize="20"
              :unrestricted="true"
              :accept="''"
              button-text="选择文件"
              size="default"
              :disabled="isDetail || !!billData.status"
              @success="handleUploadSuccess"
            ></base-upload>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <!-- 成本分摊详情 -->
    <CostAllocationDetailDialog v-model="costAllocationDialogVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { useTagsStore } from "@/stores/tags-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";
import BaseUpload from "@/components/base/base-upload.vue";
import { cstProcessApi } from "@/api/cost/non-contract-manage/cst-process-api";
import { dateUtil } from "@/utils/date-util";
import { getEnumLabel, getEnumType } from "@/utils/enum";
import { conBillStatusEnum } from "@/constants/contract-manage/enums";
import { buildTree } from "@/utils/tree";
import CostAllocationDetailDialog from "@/views/cost/cost-allocation/cost-allocation-detail-dialog.vue";

defineOptions({ name: "cst-process-form" });

interface Props {
  mode: "add" | "edit" | "detail";
  cstProcessId?: number; // 非合同建安立项ID
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  cstProcessId: undefined,
});

const emit = defineEmits<{
  (e: "success", data: any): void;
  (e: "cancel"): void;
}>();

const router = useRouter();
const userStore = useUserStore();
const tagsStore = useTagsStore();

const mode = ref<"add" | "edit" | "detail">(props.mode);

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");

// 使用 useTemplateRef 获取模板引用
const projCascaderRef = useTemplateRef("projCascaderRef");

const initFormData = () => ({
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
  // ================================
  processName: "", // 事项名称
  processNo: "", // 事项编号
  processAmt: 0, // 事项计划金额
  finaTypeId: "", // 费用类型
  remark: "", // 事项说明
});
// 表单数据
const formData = ref(initFormData());
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const segOptions = ref([]);
const projectOptions = ref([]);
const feeTypeFlatOptions = ref([]);
const feeTypeOptions = ref([]);
const annexFileList = ref([]);
const billData = ref({
  id: undefined,
  bizTitle: "",
  status: 0,
  bizItemCode: "NCON_PROC",
});
const processData = ref({
  id: undefined,
  segId: undefined,
  projId: undefined,
  processNo: "",
  processName: "",
  processAmt: 0,
  remark: "",
  nconBillId: undefined,
  status: 0,
});
const finaDsList = ref([]);
const flowBaseData = ref(null);
const flowListData = ref({
  bizItemCode: "", // 业务编码
  wfFlowId: null, // 流程ID
  wfStatus: 0, // 审批状态；0=草稿，10=审批中，40=已审批，80=作废，99=其他
  wfTitle: "", // 流程标题
}); // 流程数据

const costAllocationDialogVisible = ref(false);

// 表单校验规则
const formRules: FormRules = {
  bizTitle: [{ required: true, message: "请输入标题", trigger: "change" }],
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  processName: [
    { required: true, message: "请输入事项名称", trigger: "change" },
  ],
  finaTypeId: [
    { required: true, message: "请选择费用类型", trigger: "change" },
  ],
  processAmt: [
    { required: true, message: "请输入事项计划金额", trigger: "change" },
    {
      type: "number",
      message: "请输入有效的数字",
      trigger: "change",
    },
    {
      validator: (_rule, value, callback) => {
        if (value < 0) {
          callback(new Error("事项计划金额不能小于0"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
  remark: [{ max: 500, message: "说明不能超过500个字符", trigger: "blur" }],
};

// 费用类型所属大类是不是建安类
const isShowCostAllocation = computed(() => {
  // 如果没有选择费用类型，直接返回 false
  if (!formData.value.finaTypeId) return false;
  // 找到选择的费用类型
  const targetData = feeTypeFlatOptions.value.find(
    (item) => item.id === formData.value.finaTypeId,
  );
  if (!targetData) return false;
  // 找到费用类型所属大类
  const largeData = feeTypeFlatOptions.value.find(
    (item) => item.id === targetData.pid,
  );

  // 如果大类存在且 finaTypeCode === '03'（建安类），则显示成本分摊
  return !!(largeData && largeData.finaTypeCode === "03");
});
// 分摊详情
const handleAllocationDetail = () => {
  costAllocationDialogVisible.value = true;
};
// 获取业务板块列表
const getSegOptions = async () => {
  try {
    const res = await dictionaryApi.getsegmentList({ isAuth: true });
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
    // const res = await projectAreaApi.getMguProjList();
    const res = await projectAreaApi.getSegMguProjList(); // 板块-公司-项目树形结构数据
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
const changeProject = async (value: number) => {
  console.log(value);
  if (value) {
    // 通过模板引用获取节点数据
    const checkedNodes = projCascaderRef.value?.getCheckedNodes();
    if (checkedNodes && checkedNodes.length > 0) {
      console.log("选中的项目数据:", checkedNodes);
      // const selectedNode = checkedNodes[0]; // 获取选中的项目ID
      // // 获取父级信息
      // const pathNodes = selectedNode.pathNodes || [];
      // if (pathNodes.length > 1) {
      //   console.log("直接父节点：", pathNodes[pathNodes.length - 2]?.data);
      //   console.log("根节点：", pathNodes[0]?.data);
      //   console.log(
      //     "所有父级：",
      //     pathNodes.slice(0, -1).map((n) => n.data),
      //   );
      //   const parent = pathNodes[pathNodes.length - 2]?.data;
      //   formData.value.compName = parent?.orgName || "";
      //   formData.value.compId = parent?.orgId || "";
      // }

      // 通过项目获取项目所属信息
      const res = await projectAreaApi.getInfoByProjId({ id: value });
      if (res.code === 200 && res.data) {
        const { compName, compId, segId, segName } = res.data;
        formData.value.compId = compId || "";
        formData.value.compName = compName || "";
        formData.value.segId = segId || "";
        formData.value.segName = segName || "";
        // 置空费用类型相关字段数据
        formData.value.finaTypeId = "";
        feeTypeFlatOptions.value = [];
        feeTypeOptions.value = [];
        // 根据业务板块查询费用类型
        getpayTypeOptions(segId);
      }
    }
  }
};
// 查询业务板块
const handleSeg = (value: number) => {
  console.log("选中的业务板块数据:", value);
  if (value) {
    const target = segOptions.value.find((item: any) => item.id === value);
    formData.value.segId = target?.id || "";
    formData.value.segName = target?.segName || "";
    formData.value.segNo = target?.segNo || "";
    // 置空费用类型相关字段数据
    formData.value.finaTypeId = "";
    feeTypeFlatOptions.value = [];
    feeTypeOptions.value = [];
    // 根据业务板块查询费用类型
    getpayTypeOptions(value);
  }
};
// 查询费用类型
const getpayTypeOptions = async (value: number) => {
  try {
    const res = await dictionaryApi.getCostTypeListBySegId({ segId: value });
    if (res.code === 200) {
      feeTypeFlatOptions.value = res.data || [];
      feeTypeOptions.value = buildTree(res.data || []);
    }
  } catch (error) {}
};
// 附件上传成功
const handleUploadSuccess = (file: any) => {
  console.log("当前上传成功文件", file);
  annexFileList.value.push(file);
  console.log("文件列表", annexFileList.value);
};

// 加载合同详情（编辑/详情模式）
const loadDetail = async () => {
  if (!props.cstProcessId) return;
  try {
    const res = await cstProcessApi.getCstProcessDetail({
      id: props.cstProcessId,
      isWithBill: true,
    });
    if (res.code === 200 && res.data) {
      const { bill, process, flowBase, finaDs, annexList, flowList } = res.data;
      billData.value = { ...billData.value, ...bill };
      processData.value = { ...processData.value, ...process };
      finaDsList.value = finaDs || [];
      flowBaseData.value = { ...flowBaseData.value, ...flowBase };
      flowListData.value = { ...flowListData.value, ...flowList };

      // 通过业务板块查询费用类型
      if (process.segId) {
        getpayTypeOptions(process.segId);
      }
      formData.value.bizTitle = bill.bizTitle || "";
      formData.value.segId = process.segId || undefined;
      formData.value.segNo = flowBase.segNo || undefined;
      formData.value.projId = flowBase.projId || undefined;
      formData.value.projName = flowBase.projName || "";
      formData.value.compId = flowBase.compId || undefined;
      formData.value.compName = flowBase.compName || "";
      formData.value.processName = process.processName || "";
      formData.value.processNo = process.processNo || "";
      formData.value.processAmt = process.processAmt || "";
      formData.value.finaTypeId = process.finaTypeId || undefined;
      formData.value.remark = process.remark || "";

      formData.value.deptName = flowBase.deptName || "";
      formData.value.mguName = flowBase.mguName || "";
      formData.value.userName = flowBase.userName || "";
      formData.value.createDate = bill.createDate || "";

      if (annexList && annexList.length > 0) {
        annexFileList.value = annexList.map((item: any) => ({
          ...item,
          name: item.annexName,
          url: item.annexPath,
        }));
      }
    }
  } catch (error) {}
};
// 返回操作
const goBack = () => {
  if (isAdd.value) {
    tagsStore.closeTagByPath("/ncon/cst-process/add");
  }
  if (isEdit.value) {
    tagsStore.closeTagByPath("/ncon/cst-process/edit");
  }
  router.go(-1); // 返回上个页面
};
// 保存
const handleSave = async () => {
  console.log("保存表单", formData.value);
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitLoading.value = true;
    const params = {
      bill: {
        ...billData.value,
        id: billData.value.id || undefined,
        bizTitle: formData.value.bizTitle, // 业务标题
        bizItemCode: "NCON_PROC", // 业务类型编码, NCON_PROC-非合同立项；NCON_CST-非合同建安支付； NCON_FEE-非合同费用支付
        segId: formData.value.segId, // 板块ID
        segName: formData.value.segName, // 板块名称
        segNo: formData.value.segNo, // 板块编号
        projId: formData.value.projId, // 项目ID
        projName: formData.value.projName, // 项目名称
        compId: formData.value.compId, // 公司ID
        compName: formData.value.compName, // 公司名称
      },
      process: {
        id: processData.value.id || undefined,
        bizTitle: formData.value.bizTitle, // 业务标题
        segId: formData.value.segId, // 板块ID
        projId: formData.value.projId, // 项目ID
        processNo: formData.value.processNo, // 事项编号
        processName: formData.value.processName, // 事项名称
        processAmt: formData.value.processAmt, // 事项计划金额
        finaTypeId: formData.value.finaTypeId, // 费用类型
        remark: formData.value.remark, // 事项说明
        status: 0,
        nconBillId: undefined,
      },
      annexList: annexFileList.value || [], // 附件列表
    };
    const res = await cstProcessApi.saveCstProcess(params);
    if (res.code === 200 && res.data) {
      // res.data返回的是业务ID
      processData.value.id = res.data;
      // billData.value.id = res.data;
      ElMessage.success("保存成功");
    }
  } catch (error) {
  } finally {
    submitLoading.value = false;
  }
};
// 提交
const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitLoading.value = true;
    const params = {
      bill: {
        ...billData.value,
        id: billData.value.id || undefined,
        bizTitle: formData.value.bizTitle, // 业务标题
        bizItemCode: "NCON_PROC", // 业务类型编码, NCON_PROC-非合同立项；NCON_CST-非合同建安支付； NCON_FEE-非合同费用支付
        segId: formData.value.segId, // 板块ID
        segName: formData.value.segName, // 板块名称
        segNo: formData.value.segNo, // 板块编号
        projId: formData.value.projId, // 项目ID
        projName: formData.value.projName, // 项目名称
        compId: formData.value.compId, // 公司ID
        compName: formData.value.compName, // 公司名称
      },
      process: {
        id: processData.value.id || undefined,
        bizTitle: formData.value.bizTitle, // 业务标题
        segId: formData.value.segId, // 板块ID
        projId: formData.value.projId, // 项目ID
        processNo: formData.value.processNo, // 事项编号
        processName: formData.value.processName, // 事项名称
        processAmt: formData.value.processAmt, // 事项计划金额
        finaTypeId: formData.value.finaTypeId, // 费用类型
        remark: formData.value.remark, // 事项说明
        status: processData.value.status || 0,
        nconBillId: processData.value.nconBillId || undefined,
      },
      annexList: annexFileList.value || [], // 附件列表
    };
    const submitRes = await cstProcessApi.submitCstProcess(params);
    if (submitRes.code === 200 && submitRes.data) {
      ElMessage.success("提交成功,已发起审批！");
      // 生成OA审批页面重定向地址
      const redirectRes = await commonApi.generateRedirectUrl({
        oaRequestId: submitRes.data,
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
  } finally {
    submitLoading.value = false;
  }
};
// 删除
const handleDelete = async () => {
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await cstProcessApi.delCstProcess({ id: props.cstProcessId });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        goBack();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  });
};
// 作废
const handleCancel = async () => {
  ElMessageBox.confirm("确定要作废吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await cstProcessApi.voidCstProcess({
        id: props.cstProcessId,
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
// 查看流程
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

const initData = async () => {
  await initOptions();
  formData.value.userName = userStore.userInfo?.empName || "";
  formData.value.createDate = dateUtil().format("YYYY-MM-DD");
  if (isAdd.value) {
    initFormData();
  } else {
    await loadDetail();
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
</style>
