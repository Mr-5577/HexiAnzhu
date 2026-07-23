<!-- 供应商入库审批 -->
<template>
  <div class="basic-form-content">
    <div class="form-header">
      <div class="header-title">供应商入库审批</div>
      <div class="header-btn">
        <el-button
          type="primary"
          icon="DocumentAdd"
          :loading="saveLoading"
          @click="handleSave"
        >
          保存
        </el-button>
        <!-- 提交是保存并提交 -->
        <el-button
          type="success"
          plain
          icon="Promotion"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          提交
        </el-button>
        <el-button
          type="danger"
          plain
          icon="Delete"
          @click="handleDelete"
          disabled
        >
          删除
        </el-button>
        <el-button
          type="warning"
          plain
          icon="Remove"
          @click="handleCancel"
          disabled
        >
          作废
        </el-button>
        <el-button
          type="info"
          plain
          icon="View"
          @click="handleViewProcess"
          disabled
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
        <div class="item-card">
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="18" :xl="18">
              <el-form-item label="标题" prop="wfTitle" required>
                <el-input
                  v-model="formData.wfTitle"
                  clearable
                  placeholder="标题"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="审批状态" prop="approvalStatus">
                <el-tag type="info"> 草稿 </el-tag>
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
                  @change="handleSeg"
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
                  clearable
                  placeholder="部门"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="分部" prop="mguName">
                <el-input
                  v-model="formData.mguName"
                  clearable
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
              <el-form-item label="提交人" prop="submitter">
                <el-input
                  v-model="formData.submitter"
                  clearable
                  placeholder="提交人"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="提交时间" prop="submiterTime">
                <el-date-picker
                  v-model="formData.submiterTime"
                  type="date"
                  placeholder="提交时间"
                  style="width: 100%"
                  clearable
                  value-format="YYYY-MM-DD"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="item-card">
          <div
            class="section-title"
            @click="
              () => {
                console.log(tableList, validateSupplierData());
              }
            "
          >
            准入单位名单
          </div>
          <div class=""></div>
          <editable-table
            ref="payWayTableRef"
            :row-key="'id'"
            :height="'300px'"
            v-model="tableList"
            :columns="tableColumns"
            :pagination="false"
            :highlight-current-row="false"
            :show-summary="false"
            :compactEmpty="true"
            :editable="true"
          >
            <template #actionBar>
              <div class="actionBar-buttons">
                <el-button type="primary" size="small" @click="chooseSupplier">
                  选择供应商
                </el-button>
              </div>
            </template>
            <!-- 自定义考察报告列 -->
            <template #inspectAnnexName="{ row, column, index, update }">
              <div class="inspect-cell">
                <!-- 有附件显示链接 -->
                <el-link
                  v-if="row.inspectAnnexId"
                  type="primary"
                  :underline="'hover'"
                  @click="handleViewAnnex(row)"
                >
                  {{ row.inspectAnnexName }}
                </el-link>
                <!-- 无附件显示占位 -->
                <span v-else style="color: #999; font-size: 12px"> - </span>
              </div>
            </template>
            <template #actions="{ row }">
              <div class="actions-btn">
                <el-button link type="primary" @click="openUploadForRow(row)">
                  上传考察报告
                </el-button>
              </div>
            </template>
          </editable-table>
          <!-- 放在表格外面的上传组件（隐藏） -->
          <Teleport to="body">
            <div style="display: none" @click.stop @mousedown.stop>
              <base-upload
                ref="reportUploadRef"
                key="invoice"
                v-model:file-list="tempFileList"
                :limit="1"
                :multiple="false"
                :showIcon="true"
                :showTip="false"
                button-text="选择文件"
                size="default"
                button-type="primary"
                @success="handleUploadSuccess"
              />
            </div>
          </Teleport>
        </div>
        <!-- 合同附件 -->
        <!-- <div class="item-card">
          <div class="section-title">相关附件</div>
          <el-form-item label="上传附件" label-width="90px">
            <base-upload
              v-model:file-list="annexFileList"
              :limit="1"
              :multiple="false"
              :showIcon="true"
              :showTip="true"
              :maxSize="100"
              :unrestricted="true"
              :accept="''"
              button-text="选择文件"
              size="default"
              @success="handleAnnexSuccess"
            ></base-upload>
          </el-form-item>
        </div> -->
      </el-form>
    </div>

    <!-- 选择供应商弹窗 -->
    <choose-supplier-dialog
      ref="supplierDialogRef"
      v-model="supplierDialogVisible"
      :selectionMode="'multiple'"
      @select="handleSupplierSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef, nextTick } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import BaseUpload from "@/components/base/base-upload.vue";
import EditableTable from "@/components/base/editable-table.vue";
import { EditableColumn } from "@/components/base/editable-table.vue";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import { dateUtil } from "@/utils/date-util";
import ChooseSupplierDialog from "@/components/business/choose-supplier-dialog.vue";
import { commonApi } from "@/api/cost/common-api";
import { useTagsStore } from "@/stores/tags-store";
import { supTypeApi } from "@/api/cost/master-data/supplier-category-api";
import { buildTree } from "@/utils/tree";
import { buildFileUrl } from "@/utils/file-path-util";

defineOptions({ name: "supplier-inspection-add" });

const emit = defineEmits<{
  (e: "success", data: any): void;
  (e: "cancel"): void;
}>();

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const tagsStore = useTagsStore();

// 使用 useTemplateRef 获取模板引用
const projCascaderRef = useTemplateRef("projCascaderRef");
const reportUploadRef = useTemplateRef("reportUploadRef");

const initFormData = () => ({
  id: undefined,
  wfTitle: "", // 流程标题
  wfNo: "", // 流程编号
  wfAnnex: "", // 流程附件

  segId: undefined, // 板块ID
  segName: "", // 板块名称
  oaSegId: undefined, // OA板块ID
  segNo: "", // 板块编码

  mguId: undefined, // 分部ID
  mguName: "", // 分部名称
  oaMguId: undefined, // OA分部ID

  deptId: undefined, // 部门ID
  deptName: "", // 部门名称
  oaDeptId: undefined, // OA部门ID

  projId: undefined, // 项目ID
  projName: "", // 项目名称
  oaProjId: undefined, // OA项目ID

  // 可选字段
  compId: undefined, // 公司ID
  compName: "", // 公司名称
  oaCompId: undefined, // OA公司ID

  submitter: "", // 提交人
  submiterTime: "", // 提交时间
  bizNo: "", // 业务编号（唯一）
});
// 表单数据
const formData = ref(initFormData());
const saveLoading = ref(false);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const segOptions = ref([]);
const projectOptions = ref([]);
const tempFileList = ref([]);
const currentUploadRow = ref(null);
const supplierDialogVisible = ref(false);
const supplierTypeList = ref([]);

// 表单校验规则
const formRules: FormRules = {
  wfTitle: [{ required: true, message: "请输入标题", trigger: "change" }],
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
};

const tableList = ref([]);
const tableColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "supName",
    label: "供应商名称",
    editable: false,
    width: 200,
  },
  {
    prop: "supTypeId",
    label: "主要服务类别",
    editable: true,
    editType: "cascader",
    showOverflowTooltip: false,
    width: 150,
    optionLabelField: "supTypeName",
    optionValueField: "id",
    options: supplierTypeList.value || [],
    showAllLevels: false,
    disabled: true,
    cascaderProps: {
      children: "children", // 指定子节点字段名
      label: "supTypeName", // 指定标签字段名
      value: "id", // 指定值字段名
      emitPath: false, // 只返回叶子节点的值
      showAllLevels: false, // 不显示所有层级
      checkStrictly: false,
    },
  },
  {
    prop: "registeredAmount",
    label: "注册资金",
    editable: false,
    width: 150,
  },
  {
    prop: "legalPerson",
    label: "联系人",
    editable: false,
    width: 150,
  },
  {
    prop: "legalPhone",
    label: "联系电话",
    editable: false,
    width: 150,
  },
  {
    prop: "isInspect",
    label: "是否考察",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "label",
    optionValueField: "value",
    width: 150,
    options: [
      { label: "是", value: true },
      { label: "否", value: false },
    ],
  },
  {
    slot: "inspectAnnexName",
    label: "考察报告",
    // editable: false,
    showOverflowTooltip: false,
  },
  {
    prop: "remark",
    label: "备注",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    width: 150,
    slot: "actions",
    fixed: "right",
  },
]);

const chooseSupplier = () => {
  supplierDialogVisible.value = true;
};

// 确认选择供应商后回调
const handleSupplierSelect = async (data) => {
  console.log("选择的供应商数据:", data);
  if (data && data.length > 0) {
    let newData = data || [];
    // 循环列表，获取附件信息
    for (const item of newData) {
      // 如果有附件ID，请求附件信息
      if (item.inspectAnnexId != null && item.inspectAnnexId !== 0) {
        try {
          const annexRes = await commonApi.getFileList({
            annexId: item.inspectAnnexId,
          });
          if (annexRes.code === 200 && annexRes.data) {
            // 将附件名称保存到当前数据中
            const file = annexRes.data[0];
            item.inspectAnnexName = file?.annexName || "";
          }
        } catch (error) {
          item.inspectAnnexName = ""; // 失败时置空
        }
      }
    }
    tableList.value = newData;
  }
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

// 选择项目
const changeProject = (value: number) => {
  if (value) {
    // 通过模板引用获取节点数据
    const checkedNodes = projCascaderRef.value?.getCheckedNodes();
    if (checkedNodes && checkedNodes.length > 0) {
      console.log("选中的项目数据:", checkedNodes);
      const selectedNode = checkedNodes[0]; // 获取选中的项目ID
      // 获取父级信息
      const pathNodes = selectedNode.pathNodes || [];
      if (pathNodes.length > 1) {
        console.log("直接父节点：", pathNodes[pathNodes.length - 2]?.data);
        console.log("根节点：", pathNodes[0]?.data);
        console.log(
          "所有父级：",
          pathNodes.slice(0, -1).map((n) => n.data),
        );
        const parent = pathNodes[pathNodes.length - 2]?.data;
        formData.value.compName = parent?.orgName || "";
        formData.value.compId = parent?.orgId || "";
      }
    }
  }
};
const handleSeg = (value: number) => {
  console.log("选中的业务板块数据:", value);
  if (value) {
    const target = segOptions.value.find((item: any) => item.id === value);
    formData.value.segId = target?.id || "";
    formData.value.segName = target?.segName || "";
    formData.value.segNo = target?.segNo || "";
  }
};
// 附件上传成功
const handleAnnexSuccess = (fileList: any) => {
  console.log("当前上传成功文件", fileList);
  console.log("文件列表", tempFileList.value);
};
// 生成业务编号
const generatebizNo = async () => {
  try {
    const res = await commonApi.getBillNo({ bizType: "SUP_RK" });
    if (res.code === 200) {
      formData.value.bizNo = res.data;
    }
  } catch (error) {
    console.error("生成单号失败:", error);
  }
};
// 校验列表、表单
const validateSupplierData = () => {
  if (!tableList.value.length) {
    ElMessage.error("请选择供应商");
    return false;
  }
  // 检查考察报告
  const invalidRows = tableList.value.filter(
    (row: any) => row.isInspect && !row.inspectAnnexName,
  );
  console.log("没有上传报告", invalidRows);
  if (invalidRows.length > 0) {
    const names = invalidRows.map((row: any) => row.supName).join("、");
    ElMessage.error(`以下供应商未上传考察报告：${names}`);
    return false;
  }
  return true;
};
// 供应商保存请求
const saveSuppliers = async () => {
  const savePromises = tableList.value.map((item) =>
    supplierApi.editSupplier({
      ...item,
      isInspect: item.isInspect ? 1 : 0,
      supBillId: formData.value.id, // 保存的时候需要把原单据ID替换为保存生成的新单据ID
    }),
  );
  await Promise.all(savePromises);
};

// 保存
const handleSave = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    if (!validateSupplierData()) return;
    saveLoading.value = true;
    // 保存单据
    const params = {
      bill: {
        bizItemCode: "SUP_RK", // 供应商入库
        bizTitle: formData.value.wfTitle, // 流程标题
        bizNo: formData.value.bizNo, // 业务编号（唯一）
        segId: formData.value.segId, // 板块ID
        projId: formData.value.projId, // 项目ID
        id: formData.value.id || undefined, // 这里初次保存时没有ID，保存成功后没有关闭页面需要把ID保存下来，后续保存只是更新
      },
      suppliers: tableList.value || [],
    };
    const billRes = await supplierApi.saveSupBill(params);
    formData.value.id = billRes?.data; // 保存单据id
    // 批量保存供应商，需要把单据ID替换为保存成功后生成的新ID
    await saveSuppliers();
    ElMessage.success("保存成功！");
  } catch (error) {
  } finally {
    saveLoading.value = false;
  }
};
// 提交表单
const handleSubmit = async () => {
  console.log("提交表单", formData.value);
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    if (!validateSupplierData()) return;
    submitLoading.value = true;
    // 批量保存供应商
    const savePromises = tableList.value.map((item) =>
      supplierApi.editSupplier({
        ...item,
        isInspect: item.isInspect ? 1 : 0,
        supBillId: null, // 提交改为null
      }),
    );
    await Promise.all(savePromises);

    // 保存并提交
    const params = {
      bill: {
        bizItemCode: "SUP_RK", // 供应商入库
        bizTitle: formData.value.wfTitle, // 流程标题
        bizNo: formData.value.bizNo, // 业务编号（唯一）
        segId: formData.value.segId, // 板块ID
        projId: formData.value.projId, // 项目ID
        id: formData.value.id || undefined,
      },
      suppliers: tableList.value || [],
    };
    const submitRes = await supplierApi.submitSupBill(params);
    if (submitRes.code === 200 && submitRes.data) {
      ElMessage.success("提交成功,审批已发起！");
      // 生成OA审批页面重定向地址
      const redirectRes = await commonApi.generateRedirectUrl({
        oaRequestId: submitRes.data,
      });
      // 提交成功后关闭指定的tab页，回到列表页面
      tagsStore.closeTagByPath("/supplier/inspection/add"); // 关闭供应商入库审批
      router.go(-1); // 返回上一页
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
const handleDelete = () => {
  console.log("删除单据");
};
// 作废
const handleCancel = () => {
  console.log("作废单据");
};
// 查看流程
const handleViewProcess = () => {
  console.log("查看流程");
};
// 查看附件 - 在新标签页打开
const handleViewAnnex = async (row: any) => {
  if (!row.inspectAnnexId) {
    ElMessage.warning("该附件不存在");
    return;
  }
  try {
    // 如果附件ID存在，通过接口获取附件URL
    const res = await commonApi.getFileList({ annexId: row.inspectAnnexId });
    if (res.code === 200 && res.data && res.data.length > 0) {
      const file = res.data[0];
      const fileUrl = file.annexPath;
      if (fileUrl) {
        const url = buildFileUrl(fileUrl);
        // 直接在新窗口打开
        window.open(url, "_blank");
      } else {
        ElMessage.error("无法获取附件地址");
      }
    } else {
      ElMessage.error("附件不存在");
    }
  } catch (error) {
    ElMessage.error("查看附件失败，请稍后重试");
  }
};
const openUploadForRow = (row: any) => {
  currentUploadRow.value = row;
  tempFileList.value = [];
  nextTick(() => {
    reportUploadRef.value?.triggerFileSelect();
  });
};
const updateRow = (rowIndex: number, data: any) => {
  Object.assign(tableList.value[rowIndex], data);
  tableList.value = [...tableList.value];
};

const handleUploadSuccess = (file: any) => {
  if (currentUploadRow.value) {
    const annexId = file.id;
    const annexName = file.annexName || file.name;

    currentUploadRow.value.inspectAnnexId = annexId;
    currentUploadRow.value.inspectAnnexName = annexName;

    const currIndex = tableList.value.findIndex(
      (item) => item.id == currentUploadRow.value.id,
    );
    if (currIndex === -1) {
      currentUploadRow.value = null;
      return;
    }
    updateRow(currIndex, {
      inspectAnnexId: annexId,
      inspectAnnexName: annexName,
    });
  }
};

// 初始化所有下拉选项
const initOptions = async () => {
  await Promise.all([
    getSegOptions(),
    getProjectOptions(),
    getSupplierTypeList(),
  ]);
};
// 获取供应商类别数据
const getSupplierTypeList = async () => {
  const res = await supTypeApi.getSupTypeList({ supTypeName: "" });
  if (res.code === 200) {
    supplierTypeList.value = buildTree(res.data || []);
  }
};
const initData = async () => {
  await initOptions();
  formData.value = initFormData();
  formData.value.submitter = userStore.userInfo?.empName;
  formData.value.submiterTime = dateUtil().format("YYYY-MM-DD");
};

onMounted(async () => {
  await initData();
  generatebizNo();
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
.actionBar-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
