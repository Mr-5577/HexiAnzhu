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
            <el-form-item label="主合同付款方式" prop="payType" required>
              <el-select
                v-model="formData.payType"
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

        <!-- <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="经办人" prop="agentId">
                <el-input
                v-model="userName"
                :disabled="isDetail"
                readonly
                placeholder="经办人"
              />
            </el-form-item>
          </el-col>
        </el-row> -->

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
                :rows="5"
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
import { useRoute } from "vue-router";
import { conTypeApi } from "@/api/cost/contract-category-api";
import { supplierApi } from "@/api/cost/supplier-ledger-api";
import { projectAreaApi } from "@/api/cost/project-area-api";
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
import { supplementContractApi } from "@/api/cost/supplement-contract-api";
import { manageunitApi } from "@/api/cost/management-unit-api";
import { buildTree } from "@/utils/tree";
import { contractLedgerApi } from "@/api/cost/contract-ledger-api";
import { useUserStore } from "@/stores/user-store";

const userStore = useUserStore();

defineOptions({ name: "supplement-contract-form" });

const route = useRoute();

const conId = ref<number | null>(null); // 合同台账ID（合同单据ID）
const addId = ref<number | null>(null); // 补充合同ID
const mode = ref<"add" | "edit" | "detail">("add"); // add, edit, detail

const isDetail = computed(() => route.query.mode === "detail");
const userName = computed(() => {
  const name = userStore?.userInfo?.empName || "";
  return name ? name.replace(/\(.*\)/, "") : "-";
});

// 下拉选项数据
const companyOptions = ref([]); // 签约公司选项
const conTypeOptions = ref([]); // 合同分类选项
const supplierOptions = ref([]); // 供应商选项
const buildingOptions = ref([]); // 楼栋选项

// 生产专业列表
const proProfOptions = ref([]);
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
  payType: null, // 付款方式
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

// 表单引用
const formRef = ref<any>(null);
const submitLoading = ref(false);

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
  payType: [{ required: true, message: "请选择付款方式", trigger: "change" }],
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

// 初始化数据字典数据
const initDictData = async () => {
  await loadDicts();
  proProfOptions.value = getDictList(dictMapping.proProf); // 生产专业
};

// 初始化下拉框选项
const initOptions = async () => {
  await getCompanyList();
  await getConTypeList();
  await getSupplierList();
  await initDictData();
};

// 获取补充合同详情
const getSupplementContractDetail = async () => {
  if (!addId.value) return;
  try {
    const res = await supplementContractApi.getSupplementContractById({
      id: addId.value,
    });
    if (res.code === 200 && res.data) {
      const { conAdd, conAddExt } = res.data;
      // 回填主表数据
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
        payType: conAdd.payType,
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
    }
  } catch (error) {
    console.error("获取补充合同详情失败:", error);
  }
};
// 获取合同单据详情
const getContractDetail = async () => {
  if (!conId.value) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: conId.value,
    });
    if (res.code === 200 && res.data) {
      const { conMain, conMainExt } = res.data;
      getBuildingList(conMain.projId); // 获取楼栋数据
      if (mode.value === "add") {
        // 回填主表数据
        formData.value = {
          ...initFormData(),
          companyId: conMain.companyId,
          conTypeId: conMain.conTypeId,
          conProperty: conMain.conProperty,
          supId: conMain.supId,
          priceType: conMain.priceType,
          payType: conMain.payType,
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
  } catch (error) {}
};

// 提交表单
const handleSubmit = async () => {
  console.log("提交表单", formData.value);
  if (isDetail.value) return;
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitLoading.value = true;
    // 组装请求数据结构
    const params = {
      conAdd: {
        id: formData.value.id,
        conBillId: conId.value,
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
        bldIds: formData.value.bldIds?.join(",") || [],
        bldNames: formData.value.bldNames,
        payType: formData.value.payType,
        addAmt: formData.value.addAmt,
        addExclAmt: formData.value.addExclAmt,
        taxAmt: formData.value.taxAmt,
        signDate: formData.value.signDate,
        agentId: formData.value.agentId,
      },
      conAddExt: {
        id: formData.value.id,
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
    };

    console.log("提交参数:", params);
    // 根据是否有ID判断是新增还是编辑
    if (formData.value.id) {
      // 编辑
      const editRes =
        await supplementContractApi.editSupplementContract(params);
      if (editRes.code === 200) {
        ElMessage.success("提交成功");
        // 重置表单
        // formData.value = {
        //   ...initFormData(),
        // };
        // formRef.value.resetFields();
      }
    } else {
      // 新增
      const addRes = await supplementContractApi.addSupplementContract(params);
      if (addRes.code === 200) {
        ElMessage.success("提交成功");
      }
    }
  } catch (error) {
    console.log("表单验证失败：", error);
  } finally {
    submitLoading.value = false;
  }
};

// 同步路由状态
const syncRouteState = async () => {
  const queryMode = route.query.mode as string;
  mode.value =
    queryMode === "edit" || queryMode === "detail" ? queryMode : "add";
  addId.value = route.query.addId ? Number(route.query.addId) : null; // 补充合同ID
  conId.value = route.query.conId ? Number(route.query.conId) : null; // 合同台账ID

  await initOptions(); // 初始化下拉框选项

  await getContractDetail(); // 获取合同台账详情，相同数据回填
  // 编辑或详情
  if (mode.value === "edit" || mode.value === "detail") {
    await getSupplementContractDetail();
  } else if (mode.value === "add") {
    await createConNo();
  }
};
// 监听是否需要印章，清空印章类型
watch(
  () => formData.value.needSeal,
  (newVal) => {
    if (!newVal) {
      formData.value.sealTypes = [];
    }
  },
);

// 监听路由变化
// watch(
//   () => [route.query.mode, route.query.addId, route.query.conId],
//   async () => {
//     syncRouteState();
//   },
//   { immediate: true },
// );
onMounted(() => {
  syncRouteState();
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
  border-left: 4px solid #409eff;
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
