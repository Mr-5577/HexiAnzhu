<!-- 招标需求 信息 -->
<template>
  <div class="basic-form-content">
    <div class="form-header">
      <div class="header-title">招标需求审批</div>
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
          @click="handleViewProcess"
          :disabled="isAdd"
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
        label-width="120px"
        class="adapt-form"
      >
        <!-- 单据信息 -->
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
                  :type="getEnumType(approvalStatusEnum, billData?.status || 0)"
                >
                  {{ getEnumLabel(approvalStatusEnum, billData?.status || 0) }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="业务板块" prop="segId" required>
                <!-- <el-select
                  v-model="formData.segId"
                  placeholder="业务板块"
                  style="width: 100%"
                  disabled
                  @change="handleSeg"
                >
                  <el-option
                    v-for="item in segOptions"
                    :key="item.id"
                    :label="item.segName"
                    :value="item.id"
                  />
                </el-select> -->
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
                  disabled
                  placeholder="部门"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="分部" prop="mguName">
                <el-input
                  v-model="formData.mguName"
                  disabled
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
                  :disabled="isDetail || !!billData.status"
                  @change="changeProject"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="项目所属公司" prop="compName">
                <el-input
                  v-model="formData.compName"
                  clearable
                  placeholder="项目所属公司"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="提交人" prop="userName">
                <el-input
                  v-model="formData.userName"
                  disabled
                  placeholder="提交人"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="提交时间" prop="createDate">
                <el-input
                  v-model="formData.createDate"
                  disabled
                  placeholder="提交时间"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 需求信息 -->
        <div class="item-card">
          <div class="section-title">需求信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="需求事项" prop="tenderName" required>
                <el-input
                  v-model="formData.tenderName"
                  placeholder="请输入需求事项"
                  clearable
                  style="width: 100%"
                  :disabled="isDetail || !!billData.status"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="需求日期" prop="demandDate" required>
                <el-date-picker
                  v-model="formData.demandDate"
                  type="date"
                  placeholder="请选择需求日期"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  clearable
                  style="width: 100%"
                  :disabled="isDetail || !!billData.status"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="需求说明" prop="demandRemark">
                <el-input
                  v-model="formData.demandRemark"
                  type="textarea"
                  placeholder="请输入需求说明"
                  :rows="4"
                  maxlength="500"
                  show-word-limit
                  style="width: 100%"
                  :disabled="isDetail || !!billData.status"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 合同附件 -->
        <div class="item-card">
          <div class="section-title">相关附件</div>
          <el-form-item label="上传附件" label-width="90px">
            <base-upload
              v-model:file-list="tempFileList"
              :limit="9"
              :multiple="false"
              :showIcon="true"
              :showTip="true"
              button-text="选择文件"
              size="default"
              :unrestricted="true"
              :disabled="isDetail || !!billData.status"
              @success="handleUploadSuccess"
            ></base-upload>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef, watch } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";
import BaseUpload from "@/components/base/base-upload.vue";
import { biddingManageApi } from "@/api/cost/bidding/bidding-management-api";
import { useTagsStore } from "@/stores/tags-store";
import { dateUtil } from "@/utils/date-util";
import { getEnumLabel, getEnumType } from "@/utils/enum";
import { approvalStatusEnum } from "@/constants/bidding/enums";

defineOptions({ name: "bidding-demand-form" });

interface Props {
  mode: "add" | "edit" | "detail";
  billId?: number; // 招标需求单据ID
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  billId: undefined,
});

const emit = defineEmits<{
  (e: "success", data: any): void;
  (e: "cancel"): void;
}>();

const router = useRouter();
const userStore = useUserStore();
const tagsStore = useTagsStore();

const mode = ref<"add" | "edit" | "detail">(props.mode);
const billId = ref<number | undefined>(props.billId);

// 使用 useTemplateRef 获取模板引用
const projCascaderRef = useTemplateRef("projCascaderRef");

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");

const initFormData = () => ({
  // 单据信息
  id: undefined,
  segId: undefined,
  segName: "",
  projId: undefined,
  bizTitle: "",
  segNo: "",
  deptName: "",
  mguName: "",
  compName: "",
  compId: "",
  userName: "",
  createDate: "",
  // 需求信息
  demandDate: "",
  tenderName: "",
  demandRemark: "",
});

// 表单数据
const formData = ref(initFormData());
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const segOptions = ref([]);
const projectOptions = ref([]);
const tempFileList = ref([]); // 附件列表
const billData = ref({
  id: undefined,
  bizNo: "",
  bizTitle: "",
  status: 0,
  bizItemCode: "ZB_XQ",
}); // 招标需求单据数据
const demandData = ref(null); // 招标需求表单数据
const flowBasData = ref(null); // 流程基础数据
const flowListData = ref({
  bizItemCode: "", // 业务编码
  bizNo: "", // 业务单号
  deptId: null, // 部门ID
  segId: null, // 板块ID
  wfFlowId: null, // 流程ID
  wfStatus: 0, // 审批状态；0=草稿，10=审批中，40=已审批，80=作废，99=其他
  wfTitle: "", // 流程标题
}); // 流程数据

// 表单校验规则
const formRules: FormRules = {
  bizTitle: [{ required: true, message: "请输入标题", trigger: "change" }],
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  demandDate: [
    { required: true, message: "请选择需求日期", trigger: "change" },
  ],
  tenderName: [{ required: true, message: "请输入招标事项", trigger: "blur" }],
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

// 选择项目（单据信息中的项目）
const changeProject = async (value: number) => {
  if (value) {
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
      }
    }
  }
};

// 选择业务板块（单据信息）
const handleSeg = (value: number) => {
  if (value) {
    const target = segOptions.value.find((item: any) => item.id === value);
    formData.value.segNo = target?.segNo || "";
  }
};

// 附件上传成功
const handleUploadSuccess = (fileList: any) => {
  console.log("当前上传成功文件", fileList);
  console.log("文件列表", tempFileList.value);
};

// 保存
const handleSave = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const params = {
      bill: {
        ...billData.value,
        bizItemCode: "ZB_XQ", // 招标需求
        bizTitle: formData.value.bizTitle, // 流程标题
        segId: formData.value.segId, // 板块ID
        segName: formData.value.segName, // 板块ID
        segNo: formData.value.segNo, // 板块编号
        projId: formData.value.projId, // 项目ID
      },
      demand: {
        ...demandData.value,
        bizTitle: formData.value.bizTitle,
        segId: formData.value.segId,
        segName: formData.value.segName,
        projId: formData.value.projId,
        demandDate: formData.value.demandDate,
        tenderName: formData.value.tenderName,
        demandRemark: formData.value.demandRemark,
        companyId: formData.value.compId,
        companyName: formData.value.compName,
      },
      annexList: tempFileList.value,
    };
    const res = await biddingManageApi.demandSave(params);
    if (res.code === 200 && res.data) {
      billData.value.id = res.data || undefined; // 保存单据id
      ElMessage.success("保存成功");
    }
  } catch (error) {
    console.error("保存失败:", error);
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
        bizItemCode: "ZB_XQ", // 招标需求
        bizTitle: formData.value.bizTitle, // 流程标题
        segId: formData.value.segId, // 板块ID
        segName: formData.value.segName, // 板块ID
        segNo: formData.value.segNo, // 板块编号
        projId: formData.value.projId, // 项目ID
      },
      demand: {
        ...demandData.value,
        bizTitle: formData.value.bizTitle,
        segId: formData.value.segId,
        segName: formData.value.segName,
        projId: formData.value.projId,
        demandDate: formData.value.demandDate,
        tenderName: formData.value.tenderName,
        demandRemark: formData.value.demandRemark,
        companyId: formData.value.compId,
        companyName: formData.value.compName,
      },
      annexList: tempFileList.value,
    };
    const res = await biddingManageApi.demandSubmit(params);
    if (res.code === 200 && res.data) {
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
    console.error("提交失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

// 删除
const handleDelete = () => {
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await biddingManageApi.delDemand({
          billId: billData.value.id,
        });
        if (res.code === 200) {
          ElMessage.success("删除成功");
          goBack();
        }
      } catch (error) {
        console.error("删除失败:", error);
      }
    })
    .catch(() => {});
};

// 作废
const handleCancel = () => {
  ElMessageBox.confirm("确定要作废吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await biddingManageApi.voidDemand({
          billId: billData.value.id,
        });
        if (res.code === 200) {
          ElMessage.success("作废成功");
          goBack();
        }
      } catch (error) {
        console.error("作废失败:", error);
      }
    })
    .catch(() => {});
};
// 返回操作
const goBack = () => {
  if (isAdd.value) {
    tagsStore.closeTagByPath("/bidding/bidding-demand/add");
  }
  if (isEdit.value) {
    tagsStore.closeTagByPath("/bidding/bidding-demand/edit");
  }
  router.go(-1); // 返回上个页面
};

// 查看流程
const handleViewProcess = async () => {
  console.log("查看流程", flowListData.value);
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
  }
};

// 加载详情（编辑/详情模式）
const loadDetail = async () => {
  if (!billId.value) return;
  try {
    const res = await biddingManageApi.getDemandInfo({
      billId: billId.value,
    });
    if (res.code === 200 && res.data) {
      const { bill, demand, annexList, flowList, flowBase } = res.data;
      billData.value = { ...billData.value, ...bill };
      demandData.value = { ...demandData.value, ...demand };
      flowListData.value = { ...flowListData.value, ...flowList };
      flowBasData.value = { ...flowBasData.value, ...flowBase };

      formData.value.segId = demand.segId || "";
      formData.value.segName = demand.segName || "";
      formData.value.projId = demand.projId || "";
      formData.value.bizTitle = demand.bizTitle || "";
      formData.value.tenderName = demand.tenderName || "";
      formData.value.demandDate = demand.demandDate
        ? demand.demandDate + " 00:00:00"
        : "";
      formData.value.demandRemark = demand.demandRemark || "";

      formData.value.userName = demand.createName || "";
      formData.value.createDate = demand.createDate || "";

      formData.value.segNo = flowBase?.segNo || "";
      formData.value.deptName = flowBase?.deptName || "";
      formData.value.mguName = flowBase?.mguName || "";
      formData.value.compName = flowBase?.compName || "";
      formData.value.compId = flowBase?.compId || "";

      console.log("详情数据", formData.value);
      if (annexList) {
        const fileList = [];
        for (const item of annexList) {
          const fileRes = await commonApi.getFileList({ annexId: item.id });
          if (fileRes.code === 200 && fileRes.data) {
            const file = fileRes.data[0];
            fileList.push({
              ...file,
              url: file.annexPath,
              name: file.annexName,
            });
          }
        }
        tempFileList.value = fileList;
      }
    }
  } catch (error) {
    console.error("加载详情失败:", error);
  }
};

// 初始化
const initData = async () => {
  await initOptions();
  formData.value = initFormData();
  tempFileList.value = [];
  formData.value.userName = userStore.userInfo?.empName || "";
  formData.value.createDate = dateUtil().format("YYYY-MM-DD HH:mm:ss");

  if (isEdit.value || isDetail.value) {
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
