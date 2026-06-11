<!-- 合同台账基本信息 -->
<template>
  <div class="contract-basic-form">
    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="130px"
        class="adapt-form"
      >
        <div class="section-title">基本信息</div>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="合同名称" prop="conName" required>
              <el-input
                v-model="formData.conName"
                :disabled="isDetail"
                clearable
                placeholder="请输入合同名称"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="合同分类" prop="conTypeId" required>
              <el-cascader
                v-model="formData.conTypeId"
                :disabled="isDetail"
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
                placeholder="请选择合同分类"
                style="width: 100%"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="合同类型" prop="conProperty" required>
              <el-select
                v-model="formData.conProperty"
                :disabled="isDetail"
                placeholder="请选择合同类型"
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
            <el-form-item label="签约公司" prop="companyId" required>
              <el-cascader
                v-model="formData.companyId"
                :disabled="isDetail"
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
                placeholder="请选择签约公司"
                style="width: 100%"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="合同系统编号" prop="conSysNo">
              <el-input
                v-model="formData.conSysNo"
                :disabled="isDetail"
                placeholder="请输入合同系统编号"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="合同档案编号" prop="conPhyNo">
              <el-input
                v-model="formData.conPhyNo"
                :disabled="isDetail"
                placeholder="请输入合同档案编号"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="业务板块" prop="segId" required>
              <el-select
                v-model="formData.segId"
                :disabled="isDetail"
                placeholder="请选择业务板块"
                style="width: 100%"
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
            <el-form-item label="项目名称" prop="projId" required>
              <el-cascader
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
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="核算项目" prop="acctProjId" required>
              <el-cascader
                v-model="formData.acctProjId"
                :disabled="isDetail"
                :options="acctProjOptions"
                :show-all-levels="false"
                :props="{
                  expandTrigger: 'hover',
                  emitPath: false,
                  checkStrictly: false,
                  value: 'id',
                  label: 'dicLabel',
                  children: 'children',
                }"
                placeholder="请选择核算项目"
                style="width: 100%"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="供应商" prop="supId" required>
              <el-select
                v-model="formData.supId"
                :disabled="isDetail"
                placeholder="请选择供应商"
                style="width: 100%"
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
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="计价方式" prop="priceType" required>
              <el-select
                v-model="formData.priceType"
                :disabled="isDetail"
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
            <el-form-item label="管理类型" prop="manageType" required>
              <el-select
                v-model="formData.manageType"
                :disabled="isDetail"
                placeholder="请选择管理类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in ManageTypeEnum"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="付款方式" prop="payType" required>
              <el-select
                v-model="formData.payType"
                :disabled="isDetail"
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
            <el-form-item label="签约金额(含税)" prop="signAmt" required>
              <el-input-number
                v-model="formData.signAmt"
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
            <el-form-item label="签约金额(不含税)" prop="signExclAmt" required>
              <el-input-number
                v-model="formData.signExclAmt"
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
        </el-row>
        <el-row :gutter="24">
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
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="生效日期" prop="effectiveDate" required>
              <el-date-picker
                v-model="formData.effectiveDate"
                :disabled="isDetail"
                type="date"
                placeholder="请选择生效日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="到期日期" prop="expiryDate" required>
              <el-date-picker
                v-model="formData.expiryDate"
                :disabled="isDetail"
                type="date"
                placeholder="请选择到期日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="工期(天)" prop="daysNum" required>
              <el-input-number
                v-model="formData.daysNum"
                :disabled="isDetail"
                :min="0"
                :controls="false"
                placeholder="请输入工期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="履约保证金" prop="pbAmount" required>
              <el-input-number
                v-model="formData.pbAmount"
                :disabled="isDetail"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入履约保证金"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="生产专业" prop="proProf" required>
              <el-cascader
                v-model="formData.proProf"
                :disabled="isDetail"
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
            <el-form-item label="楼栋范围" prop="bldIds" required>
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
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="结算金额" prop="settleAmt" required>
              <el-input-number
                v-model="formData.settleAmt"
                :disabled="isDetail"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入结算金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">明细信息</div>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="是否用印" prop="needSeal" required>
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
            <el-form-item label="印章类型" prop="sealTypes" required>
              <el-select
                v-model="formData.sealTypes"
                :disabled="isDetail"
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
            <el-form-item label="签约地点" prop="signAddr" required>
              <el-input
                v-model="formData.signAddr"
                :disabled="isDetail"
                placeholder="请输入签约地点"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="供应商联系人" prop="supCmanName" required>
              <el-input
                v-model="formData.supCmanName"
                :disabled="isDetail"
                placeholder="请输入联系人姓名"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="联系人电话" prop="supCmanTel" required>
              <el-input
                v-model="formData.supCmanTel"
                :disabled="isDetail"
                placeholder="请输入联系电话"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="联系人身份证" prop="supCmanIdno" required>
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
      </el-form>
    </div>

    <div class="btn-row" v-if="!isDetail">
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        提交
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { conTypeApi } from "@/api/cost/master-data/contract-category-api";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { useRoute } from "vue-router";
import {
  ConPropertyEnum,
  PriceTypeEnum,
  ManageTypeEnum,
  PayTypeEnum,
  SealTypesEnum,
} from "@/constants/contract-manage/enums";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { commonApi } from "@/api/cost/common-api";
import { manageunitApi } from "@/api/cost/master-data/management-unit-api";
import { buildTree } from "@/utils/tree";
import { useUserStore } from "@/stores/user-store";

defineOptions({ name: "contract-ledger-form" });

const userStore = useUserStore();
const route = useRoute();

const conId = ref(null); // 合同台账ID
const mode = ref<"add" | "edit" | "detail">("add"); // add, edit, detail

const isDetail = computed(() => route.query.mode === "detail");

// 签约公司选项
const companyOptions = ref([]);
// 楼栋列表
const buildingOptions = ref([]);
// 业务板块
const segOptions = ref([]);
// 合同分类
const conTypeOptions = ref([]);
// 项目列表
const projectOptions = ref([]);
// 供应商列表
const supplierOptions = ref([]);
// 生产专业列表
const proProfOptions = ref([]);
// 核算项目列表
const acctProjOptions = ref([]);
// 数据字典
const { getDictList, loadDicts } = useDict(
  [
    dictMapping.proProf, // 生产专业
    dictMapping.acctProj, // 核算项目
  ],
  {
    treeDictCodes: [],
  },
);

// 初始化表单数据（扁平结构）
const initFormData = () => ({
  // 主表字段
  id: null,
  segId: null, // 业务板块ID
  projId: null, // 项目ID
  acctProjId: null, // 核算项目ID
  tenderItemId: null, // 招采明细事项ID
  companyId: null, // 公司ID
  conName: "", // 合同名称
  conSysNo: "", // 合同系统编号
  conPhyNo: "", // 合同档案编号
  conTypeId: null, // 合同分类ID
  conProperty: null, // 合同类型
  mainConId: null, // 主合同ID
  supId: null, // 供应商ID
  priceType: null, // 计价方式
  conStatus: 0, // 合同状态（0-草稿 5-审批中 10-已审批 20-已结算 30-已作废）
  signAmt: null, // 签约金额
  signExclAmt: null, // 不含税签约金额
  taxAmt: null, // 税额
  signDate: "", // 签约日期
  effectiveDate: "", // 生效日期
  expiryDate: "", // 到期日期
  daysNum: null, // 合同天数，工期（天）
  needSettle: true, // 是否需要结算
  settleAmt: null, // 结算金额
  flowId: 0, // 流程ID
  agentId: null, // 经办人ID
  proProf: null, // 生产专业
  bldIds: [], // 楼栋ID数组
  bldNames: "", // 楼栋名称，多个用逗号分隔
  pbAmount: null, // 履约保证金金额
  manageType: null, // 管理类型（1-内部管理、2-外部管理）
  payType: null, // 付款方式

  // 扩展表字段
  needSeal: false, // 是否需要盖章
  sealTypes: [], // 盖章类型数组
  signAddr: "", // 签约地点
  supCmanName: "", // 供应商联系人
  supCmanIdno: "", // 供应商联系人身份证
  supCmanTel: "", // 供应商联系人电话
  supCmanJob: "", // 供应商联系人职务
  remark: "", // 备注
});

const formData = ref(initFormData());

// 表单引用
const formRef = ref(null);
const submitLoading = ref(false);

// 表单校验规则（扁平结构）
const formRules = ref({
  conName: [{ required: true, message: "请输入合同名称", trigger: "blur" }],
  conTypeId: [{ required: true, message: "请选择合同分类", trigger: "change" }],
  conProperty: [
    { required: true, message: "请选择合同类型", trigger: "change" },
  ],
  companyId: [{ required: true, message: "请选择签约公司", trigger: "change" }],
  conSysNo: [
    { required: true, message: "请输入合同系统编号", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "合同系统编号只能包含英文大小写、数字和下划线",
      trigger: "blur",
    },
  ],
  conPhyNo: [
    { required: true, message: "请输入合同物理编号", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "合同物理编号只能包含英文大小写、数字和下划线",
      trigger: "blur",
    },
  ],
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  acctProjId: [
    { required: true, message: "请选择核算项目", trigger: "change" },
  ],
  supId: [{ required: true, message: "请选择供应商", trigger: "change" }],
  priceType: [{ required: true, message: "请选择计价方式", trigger: "change" }],
  manageType: [
    { required: true, message: "请选择管理类型", trigger: "change" },
  ],
  payType: [{ required: true, message: "请选择付款方式", trigger: "change" }],
  signAmt: [
    { required: true, message: "请输入签约金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
  ],
  signExclAmt: [
    { required: true, message: "请输入不含税金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
  ],
  taxAmt: [
    { required: true, message: "请输入税额", trigger: "blur" },
    { type: "number", min: 0, message: "税额不能小于0", trigger: "blur" },
  ],
  signDate: [{ required: true, message: "请选择签订日期", trigger: "change" }],
  effectiveDate: [
    { required: true, message: "请选择生效日期", trigger: "change" },
  ],
  expiryDate: [
    { required: true, message: "请选择到期日期", trigger: "change" },
  ],
  daysNum: [{ required: true, message: "请输入工期天数", trigger: "blur" }],
  pbAmount: [
    { required: true, message: "请输入履约保证金", trigger: "blur" },
    { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
  ],
  proProf: [{ required: true, message: "请选择生产专业", trigger: "change" }],
  bldIds: [{ required: true, message: "请选择楼栋", trigger: "change" }],
  settleAmt: [
    { required: true, message: "请输入结算金额", trigger: "blur" },
    { type: "number", min: 0, message: "结算金额不能小于0", trigger: "blur" },
  ],
  needSeal: [{ required: true, message: "请选择是否用印", trigger: "change" }],
  sealTypes: [{ required: true, message: "请选择印章类型", trigger: "change" }],
  signAddr: [{ required: true, message: "请输入签约地点", trigger: "blur" }],
  supCmanName: [
    { required: true, message: "请输入联系人姓名", trigger: "blur" },
  ],
  supCmanTel: [
    { required: true, message: "请输入联系人电话", trigger: "blur" },
  ],
  supCmanIdno: [
    { required: true, message: "请输入联系人身份证", trigger: "blur" },
  ],
});

const handleSubmit = async () => {
  console.log("提交表单", formData.value);
  if (isDetail.value) return;
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitLoading.value = true;
    // 组装请求数据结构
    const params = {
      conMain: {
        id: formData.value.id,
        segId: formData.value.segId,
        projId: formData.value.projId,
        acctProjId: formData.value.acctProjId,
        tenderItemId: formData.value.tenderItemId,
        companyId: formData.value.companyId,
        conName: formData.value.conName,
        conSysNo: formData.value.conSysNo,
        conPhyNo: formData.value.conPhyNo,
        conTypeId: formData.value.conTypeId,
        conProperty: formData.value.conProperty,
        mainConId: formData.value.mainConId,
        supId: formData.value.supId,
        priceType: formData.value.priceType,
        conStatus: formData.value.conStatus || 0, // 草稿状态
        signAmt: formData.value.signAmt,
        signExclAmt: formData.value.signExclAmt,
        taxAmt: formData.value.taxAmt,
        signDate: formData.value.signDate,
        effectiveDate: formData.value.effectiveDate,
        expiryDate: formData.value.expiryDate,
        daysNum: formData.value.daysNum,
        needSettle: formData.value.needSettle,
        settleAmt: formData.value.settleAmt,
        flowId: formData.value.flowId,
        agentId: formData.value.agentId,
        proProf: formData.value.proProf,
        bldIds: formData.value.bldIds.join(","), // 转为逗号分隔字符串
        bldNames: formData.value.bldNames,
        pbAmount: formData.value.pbAmount,
        manageType: formData.value.manageType,
        payType: formData.value.payType,
      },
      conMainExt: {
        id: formData.value.id,
        conId: formData.value.id,
        needSeal: formData.value.needSeal,
        sealTypes: formData.value.sealTypes.join(","), // 转为逗号分隔字符串
        signAddr: formData.value.signAddr,
        supCmanName: formData.value.supCmanName,
        supCmanIdno: formData.value.supCmanIdno,
        supCmanTel: formData.value.supCmanTel,
        supCmanJob: formData.value.supCmanJob,
        remark: formData.value.remark,
      },
    };

    console.log("提交参数:", params);
    // 根据是否有ID判断是新增还是编辑
    if (formData.value.id) {
      // 编辑
      const editRes = await contractLedgerApi.editContractLedger(params);
      if (editRes.code === 200) {
        ElMessage.success("提交成功");
      }
    } else {
      // 新增
      const addRes = await contractLedgerApi.addContractLedger(params);
      if (addRes.code === 200) {
        ElMessage.success("提交成功");
        // 重置表单
        // formData.value = {
        //   ...initFormData(),
        // };
        // formRef.value.resetFields();
      }
    }
  } catch (error) {
    console.log("表单验证失败：", error);
  } finally {
    submitLoading.value = false;
  }
};

// 初始化数据
const initContractInfo = async () => {
  if (!conId.value) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: conId.value,
    });
    if (res.code === 200 && res.data) {
      const { conMain, conMainExt } = res.data;
      // 回填主表数据
      formData.value = {
        // 主表字段
        id: conMain.id,
        segId: conMain.segId,
        projId: conMain.projId,
        acctProjId: conMain.acctProjId,
        tenderItemId: conMain.tenderItemId,
        companyId: conMain.companyId,
        conName: conMain.conName,
        conSysNo: conMain.conSysNo,
        conPhyNo: conMain.conPhyNo,
        conTypeId: conMain.conTypeId,
        conProperty: conMain.conProperty,
        mainConId: conMain.mainConId,
        supId: conMain.supId,
        priceType: conMain.priceType,
        conStatus: conMain.conStatus,
        signAmt: conMain.signAmt,
        signExclAmt: conMain.signExclAmt,
        taxAmt: conMain.taxAmt,
        signDate: conMain.signDate,
        effectiveDate: conMain.effectiveDate,
        expiryDate: conMain.expiryDate,
        daysNum: conMain.daysNum,
        needSettle: conMain.needSettle,
        settleAmt: conMain.settleAmt,
        flowId: conMain.flowId,
        agentId: conMain.agentId,
        proProf: conMain.proProf,
        bldIds: conMain.bldIds ? conMain.bldIds.split(",").map(Number) : [], // 字符串转数组
        bldNames: conMain.bldNames || "",
        pbAmount: conMain.pbAmount,
        manageType: conMain.manageType,
        payType: conMain.payType,

        // 扩展表字段
        needSeal: conMainExt?.needSeal ?? false,
        sealTypes: conMainExt?.sealTypes ? conMainExt.sealTypes.split(",") : [], // 字符串转数组
        signAddr: conMainExt?.signAddr || "",
        supCmanName: conMainExt?.supCmanName || "",
        supCmanIdno: conMainExt?.supCmanIdno || "",
        supCmanTel: conMainExt?.supCmanTel || "",
        supCmanJob: conMainExt?.supCmanJob || "",
        remark: conMainExt?.remark || "",
      };

      // 有项目ID，加载对应的楼栋列表
      if (conMain.projId) {
        await getBuildingList(conMain.projId);
      }
    }
  } catch (error) {
    console.error("获取合同信息失败:", error);
  }
};
// 选择项目
const changeProject = (val: number) => {
  console.log("changeProject", val);
  // 清除选中的楼栋数据
  formData.value.bldIds = [];
  formData.value.bldNames = "";
  if (val) {
    getBuildingList(val);
  }
};

// 获取楼栋列表
const getBuildingList = async (projId: number) => {
  if (!projId) return;
  try {
    buildingOptions.value = [];
    const buildingRes = await projectAreaApi.getBuildingList({
      projId: projId,
    });
    if (buildingRes.code === 200) {
      buildingOptions.value = buildingRes.data || [];

      // 如果有选中的楼栋ID，重新计算楼栋名称（编辑时回显）
      if (formData.value.bldIds && formData.value.bldIds.length > 0) {
        const names = buildingOptions.value
          .filter((v: any) => formData.value.bldIds.includes(v.id))
          .map((v: any) => v.bldName);
        formData.value.bldNames = names.join(",");
      }
    }
  } catch (error) {
    console.error("获取楼栋列表失败:", error);
  }
};

// 楼栋选择变化处理
const handleBuildingChange = (ids: number[]) => {
  console.log("handleBuildingChange", ids);
  const names = buildingOptions.value
    .filter((v: any) => ids.includes(v.id))
    .map((v: any) => v.bldName);
  formData.value.bldNames = names.join(",");
};

// 获取合同分类
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
    const res = await projectAreaApi.getMguProjList(); // 公司-项目树形结构数据
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};

// 查询供应商列表
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
// 生成合同编号
const createConNo = async () => {
  try {
    // HTBH:合同编号前缀
    const conRes = await commonApi.getBillNo({ bizType: "HTBH" });
    if (conRes.code === 200) {
      formData.value.conSysNo = conRes.data;
      formData.value.conPhyNo = conRes.data;
    }
  } catch (error) {
    console.error("生成合同编号失败:", error);
  }
};

// 初始化数据字典数据
const initDictData = async () => {
  await loadDicts();
  proProfOptions.value = getDictList(dictMapping.proProf); // 生产专业
  acctProjOptions.value = getDictList(dictMapping.acctProj); // 核算项目
};

// 初始化下拉框选项
const initOptions = async () => {
  await getCompanyList();
  await getSegOptions();
  await getProjectOptions();
  await getSupplierList();
  await getConTypeList();
  await initDictData();
};
const syncRouteState = async () => {
  const queryMode = route.query.mode as string;
  mode.value =
    queryMode === "edit" || queryMode === "detail" ? queryMode : "add";
  const idValue = route.query.conId ? Number(route.query.conId) : null;
  conId.value = idValue || null;

  await initOptions(); // 初始化下拉框选项

  // 编辑
  if (mode.value === "edit" || mode.value === "detail") {
    await initContractInfo();
  } else if (mode.value === "add") {
    formData.value.agentId = userStore.userInfo.id; // 取当前登录人的ID
    await createConNo();
  }
};

// watch(
//   () => [route.query.mode, route.query.conId],
//   async () => {
//     if (route.path !== "/contract/contract-ledger/add") return; // 新增/编辑url才执行
//     syncRouteState();
//   },
//   { immediate: true },
// );
onMounted(() => {
  syncRouteState();
});
</script>

<style scoped lang="scss">
.contract-basic-form {
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
  border-left: 4px solid #409eff;
}

.btn-row {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 24px 30px;
  border-top: 1px solid #eef2f6;
  background: #ffffff;
  flex-shrink: 0;
  gap: 12px;

  .el-button {
    min-width: 88px;
  }
}
</style>
