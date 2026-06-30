<!-- 补充合同基本信息 -->
<template>
  <div class="supplement-contract-form">
    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="130px"
        class="adapt-form"
      >
        <div>
          <div class="section-title">基本信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="补充合同名称" prop="addName" required>
                <el-input
                  v-model="formData.addName"
                  :disabled="isDetail"
                  clearable
                  placeholder="请输入补充合同名称"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="补充合同类型" prop="addType" required>
                <el-select
                  v-model="formData.addType"
                  :disabled="isDetail"
                  placeholder="请选择补充合同类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in AddTypeEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同系统编号" prop="addSysNo" required>
                <el-input
                  v-model="formData.addSysNo"
                  :disabled="isDetail"
                  placeholder="请输入合同系统编号"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同物理编号" prop="addPhyNo" required>
                <el-input
                  v-model="formData.addPhyNo"
                  :disabled="isDetail"
                  placeholder="请输入合同物理编号"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="主合同签约公司" prop="companyId" required>
                <el-cascader
                  v-model="formData.companyId"
                  :disabled="true"
                  :options="companyOptions"
                  :show-all-levels="false"
                  :props="{
                    expandTrigger: 'hover',
                    emitPath: false,
                    checkStrictly: false,
                    value: 'id',
                    label: 'mguName',
                    children: 'children',
                  }"
                  placeholder="请选择主合同签约公司"
                  style="width: 100%"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="主合同分类" prop="conTypeId" required>
                <el-cascader
                  v-model="formData.conTypeId"
                  :disabled="true"
                  :options="conTypeOptions"
                  :show-all-levels="false"
                  :props="{
                    expandTrigger: 'hover',
                    emitPath: false,
                    checkStrictly: false,
                    value: 'id',
                    label: 'conTypeName',
                    children: 'children',
                  }"
                  placeholder="请选择主合同分类"
                  style="width: 100%"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="主合同类型" prop="conProperty" required>
                <el-select
                  v-model="formData.conProperty"
                  :disabled="true"
                  placeholder="请选择主合同类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in ConPropertyEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="主合同供应商" prop="supId" required>
                <el-select
                  v-model="formData.supId"
                  :disabled="true"
                  placeholder="请选择主合同供应商"
                  style="width: 100%"
                  filterable
                >
                  <el-option
                    v-for="item in supplierOptions"
                    :key="item.id"
                    :label="item.supName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="主合同计价方式" prop="priceType" required>
                <el-select
                  v-model="formData.priceType"
                  :disabled="true"
                  placeholder="请选择计价方式"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in PriceTypeEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="主合同付款方式" prop="payMethod" required>
                <el-select
                  v-model="formData.payMethod"
                  :disabled="true"
                  placeholder="请选择付款方式"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in PayTypeEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="主合同生产专业" prop="proProf">
                <el-cascader
                  v-model="formData.proProf"
                  :disabled="true"
                  :options="proProfOptions"
                  :show-all-levels="false"
                  :props="{
                    expandTrigger: 'hover',
                    emitPath: false,
                    checkStrictly: false,
                    value: 'id',
                    label: 'dicLabel',
                    children: 'children',
                  }"
                  placeholder="请选择生产专业"
                  style="width: 100%"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="楼栋范围" prop="bldIds">
                <el-select
                  v-model="formData.bldIds"
                  :disabled="isDetail"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="请选择楼栋"
                  style="width: 100%"
                  @change="handleBuildingChange"
                >
                  <el-option
                    v-for="item in buildingOptions"
                    :key="item.id"
                    :label="item.bldName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="签约金额(含税)" prop="addAmt" required>
                <el-input-number
                  v-model="formData.addAmt"
                  :disabled="isDetail"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="请输入签约金额"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="签约金额(不含税)" prop="addExclAmt" required>
                <el-input-number
                  v-model="formData.addExclAmt"
                  :disabled="isDetail"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="请输入不含税金额"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="税额" prop="taxAmt" required>
                <el-input-number
                  v-model="formData.taxAmt"
                  :disabled="isDetail"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="请输入税额"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="签订日期" prop="signDate" required>
                <el-date-picker
                  v-model="formData.signDate"
                  :disabled="isDetail"
                  type="date"
                  placeholder="请选择签订日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div>
          <div class="section-title">扩展信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="是否需要用印" prop="needSeal">
                <el-select
                  v-model="formData.needSeal"
                  :disabled="isDetail"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="是" :value="true" />
                  <el-option label="否" :value="false" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="印章类型" prop="sealTypes">
                <el-select
                  v-model="formData.sealTypes"
                  :disabled="isDetail || !formData.needSeal"
                  multiple
                  collapse-tags
                  placeholder="请选择印章类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in SealTypesEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="签约地点" prop="signAddr">
                <el-input
                  v-model="formData.signAddr"
                  :disabled="isDetail"
                  placeholder="请输入签约地点"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="供应商联系人" prop="supCmanName">
                <el-input
                  v-model="formData.supCmanName"
                  :disabled="isDetail"
                  placeholder="请输入联系人姓名"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="联系人电话" prop="supCmanTel">
                <el-input
                  v-model="formData.supCmanTel"
                  :disabled="isDetail"
                  placeholder="请输入联系电话"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="联系人身份证" prop="supCmanIdno">
                <el-input
                  v-model="formData.supCmanIdno"
                  :disabled="isDetail"
                  placeholder="请输入身份证号码"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="联系人职务" prop="supCmanJob">
                <el-input
                  v-model="formData.supCmanJob"
                  :disabled="isDetail"
                  placeholder="请输入职务"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="formData.remark"
                  :disabled="isDetail"
                  type="textarea"
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  placeholder="其他需要补充说明的信息"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div>
          <div class="section-title">明细信息</div>
          <div class="detail-table">
            <div class="header-content">
              <span class="header-title">补充合同明细</span>
              <el-button type="primary" size="small" @click="handleAdd">
                新增明细
              </el-button>
            </div>
            <editable-table
              ref="detailtableRef"
              :row-key="'uuid'"
              :height="'200px'"
              :table-data="tableList"
              :columns="dynamicColumns"
              :loading="tableLoading"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
            >
              <template #actions="{ row }">
                <el-button link type="danger" @click="handleDelete(row)">
                  删除
                </el-button>
              </template>
            </editable-table>
          </div>
        </div>
      </el-form>
    </div>

    <div class="btn-row" v-if="!isDetail">
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        保存
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { conTypeApi } from "@/api/cost/master-data/contract-category-api";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";
import {
  ConPropertyEnum,
  PriceTypeEnum,
  PayTypeEnum,
  SealTypesEnum,
  AddTypeEnum,
} from "@/constants/contract-manage/enums";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { supplementContractApi } from "@/api/cost/contract-manage/supplement-contract-api";
import { manageunitApi } from "@/api/cost/master-data/management-unit-api";
import { buildTree } from "@/utils/tree";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { useUserStore } from "@/stores/user-store";
import { v4 as uuidv4 } from "uuid";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { visaManagementApi } from "@/api/cost/contract-manage/visa-management-api";

const props = defineProps<{
  mode: "add" | "edit" | "detail";
  conId: number; // 合同ID
  addId?: number; // 补充合同ID
}>();

const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

const userStore = useUserStore();

const isDetail = computed(() => props.mode === "detail");

const companyOptions = ref([]); // 签约公司选项
const conTypeOptions = ref([]); // 合同分类选项
const supplierOptions = ref([]); // 供应商选项
const buildingOptions = ref([]); // 楼栋选项
const proProfOptions = ref([]); // 生产专业列表
const visaList = ref([]); // 签证单据列表
// 数据字典
const { getDictList, loadDicts } = useDict([dictMapping.proProf], {
  treeDictCodes: [],
});

// 初始化表单数据
const initFormData = () => ({
  id: null,
  addName: "", // 补充合同名称
  companyId: null, // 主合同签约公司
  addSysNo: "", // 合同系统编号
  addPhyNo: "", // 合同物理编号
  addType: null, // 补充合同类型
  conTypeId: null, // 主合同分类
  conProperty: null, // 主合同类型
  supId: null, // 主合同供应商
  priceType: null, // 计价方式
  proProf: null, // 生产专业
  bldIds: [], // 楼栋ID列表
  bldNames: "", // 楼栋名称
  payMethod: null, // 付款方式
  addAmt: 0, // 签约金额
  addExclAmt: 0, // 不含税金额
  taxAmt: 0, // 税额
  signDate: "", // 签订日期
  agentId: null, // 经办人
  needSeal: false, // 是否盖章
  sealTypes: [], // 印章类型
  signAddr: "", // 签署地点
  supCmanName: "", // 联系人姓名
  supCmanIdno: "", // 联系人身份证
  supCmanTel: "", // 联系人电话
  supCmanJob: "", // 联系人职务
  remark: "", // 备注
});

const formData = ref(initFormData());

const formRef = ref<any>(null);
const submitLoading = ref(false);
const tableLoading = ref(false);
const tableList = ref([]);
const dynamicColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "visaId",
    label: "签证单据",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "visaApplyDesc",
    optionValueField: "id",
    options: visaList.value || [],
    width: 220,
  },
  {
    prop: "processName",
    label: "事项名称",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 220,
  },
  {
    prop: "processAmt",
    label: "事项含税金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 200,
  },
  {
    prop: "processExclAmt",
    label: "事项不含税金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 200,
  },
  // {
  //   prop: "visaApplyId",
  //   label: "签证申请人",
  //   editable: true,
  //   editType: "select",
  //   showOverflowTooltip: false,
  //   // 自定义键名
  //   optionLabelField: "dicLabel",
  //   optionValueField: "id",
  //   options: [],
  //   width: 150,
  // },
  {
    prop: "visaApplyDate",
    label: "签证申请日期",
    showSummary: true,
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    width: 200,
  },
  {
    prop: "remark",
    label: "备注",
    showSummary: true,
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  // {
  //   label: "操作",
  //   width: 100,
  //   slot: "actions",
  //   fixed: "right",
  // },
]);
// 表单校验规则
const formRules = ref({
  addName: [{ required: true, message: "请输入补充合同名称", trigger: "blur" }],
  addType: [
    { required: true, message: "请选择补充合同类型", trigger: "change" },
  ],
  addSysNo: [
    { required: true, message: "请输入合同系统编号", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "合同系统编号只能包含英文大小写、数字和下划线",
      trigger: "blur",
    },
  ],
  addPhyNo: [
    { required: true, message: "请输入合同物理编号", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "合同物理编号只能包含英文大小写、数字和下划线",
      trigger: "blur",
    },
  ],
  companyId: [
    { required: true, message: "请选择主合同签约公司", trigger: "change" },
  ],
  conTypeId: [
    { required: true, message: "请选择主合同分类", trigger: "change" },
  ],
  conProperty: [
    { required: true, message: "请选择主合同类型", trigger: "change" },
  ],
  supId: [{ required: true, message: "请选择主合同供应商", trigger: "change" }],
  priceType: [{ required: true, message: "请选择计价方式", trigger: "change" }],
  payMethod: [{ required: true, message: "请选择付款方式", trigger: "change" }],
  proProf: [{ required: true, message: "请选择生产专业", trigger: "change" }],
  addAmt: [
    { required: true, message: "请输入签约金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
  ],
  addExclAmt: [
    { required: true, message: "请输入不含税金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
  ],
  taxAmt: [
    { required: true, message: "请输入税额", trigger: "blur" },
    { type: "number", min: 0, message: "税额不能小于0", trigger: "blur" },
  ],
  signDate: [{ required: true, message: "请选择签订日期", trigger: "change" }],
  sealTypes: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (formData.value.needSeal && (!value || value.length === 0)) {
          callback(new Error("请选择印章类型"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
});

// 楼栋选择变化
const handleBuildingChange = (ids: number[]) => {
  if (ids && ids.length > 0 && buildingOptions.value.length > 0) {
    const names = buildingOptions.value
      .filter((v: any) => ids.includes(v.id))
      .map((v: any) => v.bldName);
    formData.value.bldNames = names.join(",");
  }
};

// 获取签约公司列表
const getCompanyList = async () => {
  try {
    const res = await manageunitApi.getAuthMguList(); // 获取权限内公司列表
    // const res = await manageunitApi.getSegMguList(); // 获取板块-公司树形结构
    if (res.code === 200) {
      companyOptions.value = buildTree(res.data || []);
    }
  } catch (error) {
    console.error("获取签约公司列表失败:", error);
  }
};

// 获取合同分类列表
const getConTypeList = async () => {
  try {
    const res = await conTypeApi.getConTypeList();
    if (res.code === 200) {
      conTypeOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取合同分类失败:", error);
  }
};

// 获取供应商列表
const getSupplierList = async () => {
  try {
    const res = await supplierApi.getSupplierList({ supName: "" });
    if (res.code === 200) {
      supplierOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("加载供应商列表失败:", error);
  }
};

// 获取楼栋列表（根据项目ID）
const getBuildingList = async (projId: number) => {
  try {
    buildingOptions.value = [];
    const buildingRes = await projectAreaApi.getBuildingList({
      projId: projId,
    });
    if (buildingRes.code === 200) {
      buildingOptions.value = buildingRes.data || [];
    }
  } catch (error) {
    console.error("获取楼栋列表失败:", error);
  }
};

// 获取签证单据列表
const getVisaData = async () => {
  try {
    const res = await visaManagementApi.getVisaList({
      conId: props.conId,
    });
    if (res.code === 200) {
      visaList.value = res.data || [];
    }
  } catch (error) {
    console.error("获取签证单据列表失败:", error);
  }
};
// 生成合同编号
const createConNo = async () => {
  try {
    // BCBH:补充合同编号前缀
    const conRes = await commonApi.getBillNo({ bizType: "BCBH" });
    if (conRes.code === 200) {
      formData.value.addSysNo = conRes.data;
      formData.value.addPhyNo = conRes.data;
    }
  } catch (error) {
    console.error("生成合同编号失败:", error);
  }
};

const handleAdd = () => {
  const newRow = {
    uuid: uuidv4(),
    conBillId: null,
    conId: props.conId,
    visaId: null,
    processName: "",
    processAmt: 0,
    processExclAmt: 0,
    visaApplyId: userStore?.userInfo?.id, // 当前登录人ID
    visaApplyDate: "",
    remark: "",
  };
  tableList.value = [...tableList.value, newRow];
};

const handleDelete = (row: any) => {
  tableList.value = tableList.value.filter(
    (item: any) => item.uuid !== row.uuid,
  );
};

// 初始化数据字典
const initDictData = async () => {
  await loadDicts();
  proProfOptions.value = getDictList(dictMapping.proProf); // 生产专业
};

// 初始化下拉选项
const initOptions = async () => {
  await getCompanyList();
  await getConTypeList();
  await getSupplierList();
  await initDictData();
};

// 获取补充合同详情
const getSupplementContractDetail = async () => {
  if (!props.addId) return;
  try {
    const res = await supplementContractApi.getSupplementContractById({
      id: props.addId,
    });
    if (res.code === 200 && res.data) {
      const { conAdd, conAddExt, addProcesses = [] } = res.data;
      formData.value = {
        id: conAdd.id,
        addName: conAdd.addName,
        companyId: conAdd.companyId,
        addSysNo: conAdd.addSysNo,
        addPhyNo: conAdd.addPhyNo,
        addType: conAdd.addType,
        conTypeId: conAdd.conTypeId,
        conProperty: conAdd.conProperty,
        supId: conAdd.supId,
        priceType: conAdd.priceType,
        proProf: conAdd.proProf,
        bldIds: conAdd.bldIds ? conAdd.bldIds.split(",").map(Number) : [],
        bldNames: conAdd.bldNames,
        payMethod: conAdd.payMethod,
        addAmt: conAdd.addAmt,
        addExclAmt: conAdd.addExclAmt,
        taxAmt: conAdd.taxAmt,
        signDate: conAdd.signDate,
        agentId: conAdd.agentId,
        needSeal: conAddExt?.needSeal ?? false,
        sealTypes: conAddExt?.sealTypes ? conAddExt.sealTypes.split(",") : [],
        signAddr: conAddExt?.signAddr || "",
        supCmanName: conAddExt?.supCmanName || "",
        supCmanIdno: conAddExt?.supCmanIdno || "",
        supCmanTel: conAddExt?.supCmanTel || "",
        supCmanJob: conAddExt?.supCmanJob || "",
        remark: conAddExt?.remark || "",
      };
      tableList.value = addProcesses?.map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));
    }
  } catch (error) {
    console.error("获取补充合同详情失败:", error);
  }
};

// 获取合同单据详情
const getContractDetail = async () => {
  if (!props.conId) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: props.conId,
    });
    if (res.code === 200 && res.data) {
      const { conMain, conMainExt } = res.data;

      getBuildingList(conMain.projId); // 获取楼栋数据

      if (props.mode === "add") {
        formData.value = {
          ...initFormData(),
          companyId: conMain.companyId,
          conTypeId: conMain.conTypeId,
          conProperty: conMain.conProperty,
          supId: conMain.supId,
          priceType: conMain.priceType,
          payMethod: conMain.payMethod,
          proProf: conMain.proProf,
          bldIds: conMain.bldIds ? conMain.bldIds.split(",").map(Number) : [],
          bldNames: conMain.bldNames,
          agentId: userStore.userInfo.id,
          needSeal: conMainExt?.needSeal ?? false,
          sealTypes: conMainExt?.sealTypes
            ? conMainExt.sealTypes.split(",")
            : [],
          signAddr: conMainExt?.signAddr || "",
          supCmanName: conMainExt?.supCmanName || "",
          supCmanIdno: conMainExt?.supCmanIdno || "",
          supCmanTel: conMainExt?.supCmanTel || "",
          supCmanJob: conMainExt?.supCmanJob || "",
          remark: conMainExt?.remark || "",
        };
      }
    }
  } catch (error) {
    console.error("获取合同详情失败:", error);
  }
};

// 提交表单
const handleSubmit = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const params = {
      conAdd: {
        id: formData.value.id,
        conBillId: props.conId,
        addName: formData.value.addName,
        companyId: formData.value.companyId,
        addSysNo: formData.value.addSysNo,
        addPhyNo: formData.value.addPhyNo,
        addType: formData.value.addType,
        conTypeId: formData.value.conTypeId,
        conProperty: formData.value.conProperty,
        supId: formData.value.supId,
        priceType: formData.value.priceType,
        proProf: formData.value.proProf,
        bldIds: formData.value.bldIds?.join(",") || "",
        bldNames: formData.value.bldNames,
        payMethod: formData.value.payMethod,
        addAmt: formData.value.addAmt,
        addExclAmt: formData.value.addExclAmt,
        taxAmt: formData.value.taxAmt,
        signDate: formData.value.signDate,
        agentId: formData.value.agentId,
      },
      conAddExt: {
        id: formData.value.id,
        conBillId: props.conId,
        addId: formData.value.id,
        needSeal: formData.value.needSeal,
        sealTypes: formData.value.sealTypes?.join(",") || "",
        signAddr: formData.value.signAddr || "",
        supCmanName: formData.value.supCmanName || "",
        supCmanIdno: formData.value.supCmanIdno || "",
        supCmanTel: formData.value.supCmanTel || "",
        supCmanJob: formData.value.supCmanJob || "",
        remark: formData.value.remark || "",
      },
      addProcesses: tableList.value,
    };

    if (props.mode === "edit") {
      const editRes =
        await supplementContractApi.editSupplementContract(params);
      if (editRes.code === 200) {
        ElMessage.success("编辑成功");
        emit("success");
      }
    } else {
      const addRes = await supplementContractApi.addSupplementContract(params);
      if (addRes.code === 200) {
        ElMessage.success("新增成功");
        emit("success");
      }
    }
  } catch (error) {
    console.log("表单验证失败：", error);
  } finally {
    submitLoading.value = false;
  }
};

// 初始化
const initData = async () => {
  await initOptions();
  await getContractDetail();
  await getVisaData();

  if (props.mode === "edit" || props.mode === "detail") {
    await getSupplementContractDetail();
  } else if (props.mode === "add") {
    await createConNo();
  }
};

watch(
  () => formData.value.needSeal,
  (newVal) => {
    if (!newVal) {
      formData.value.sealTypes = [];
    }
  },
);

onMounted(() => {
  initData();
});

// 暴露方法
defineExpose({
  formData,
  formRef,
  handleSubmit,
});
</script>

<style scoped lang="scss">
.supplement-contract-form {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 6px;
  overflow: hidden;
}

.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 20px 0 20px;
}

.adapt-form {
  width: 100%;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 10px 0 10px 0;
  padding-left: 10px;
  position: relative;
  &::before {
    content: "";
    width: 4px;
    height: 16px;
    background: #409eff;
    border-radius: 2px;
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
  }
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

.btn-row {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 24px 40px;
  border-top: 1px solid #eef2f6;
  background: #ffffff;
  flex-shrink: 0;
  gap: 12px;

  .el-button {
    min-width: 88px;
  }
}
</style>
