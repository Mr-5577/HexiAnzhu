<template>
  <div>
    <div class="section-title">基本信息</div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="合同名称" prop="conName" required>
          <el-input
            v-model="formData.conName"
            clearable
            placeholder="请输入合同名称"
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="合同分类" prop="conTypeId" required>
          <el-cascader
            v-model="formData.conTypeId"
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
        <el-form-item label="签约公司" prop="companyId" required>
          <el-cascader
            v-model="formData.companyId"
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
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="合同类型" prop="conProperty" required>
          <el-select
            v-model="formData.conProperty"
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
    </el-row>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="合同系统编号" prop="conSysNo">
          <el-input
            v-model="formData.conSysNo"
            placeholder="请输入合同系统编号"
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="合同档案编号" prop="conPhyNo">
          <el-input
            v-model="formData.conPhyNo"
            placeholder="请输入合同档案编号"
          />
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
            @change="changeProject"
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="业务板块" prop="segId" required>
          <el-select
            v-model="formData.segId"
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
    </el-row>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="核算项目" prop="acctProjId" required>
          <el-cascader
            v-model="formData.acctProjId"
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
        <el-form-item label="付款方式" prop="payMethod" required>
          <el-select
            v-model="formData.payMethod"
            placeholder="请选择付款方式"
            style="width: 100%"
            @change="handlePayMethodChange"
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
            :min="0"
            :precision="2"
            :controls="false"
            placeholder="请输入结算金额"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  ConPropertyEnum,
  PriceTypeEnum,
  ManageTypeEnum,
  PayTypeEnum,
} from "@/constants/contract-manage/enums";

const props = defineProps<{
  modelValue: any;
  companyOptions: any[];
  conTypeOptions: any[];
  projectOptions: any[];
  segOptions: any[];
  supplierOptions: any[];
  proProfOptions: any[];
  acctProjOptions: any[];
  buildingOptions: any[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
  (e: "project-change", id: number): void;
  (e: "building-change", ids: number[]): void;
  (e: "pay-method-change", value: string): void;
}>();

const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const changeProject = (id: number) => {
  emit("project-change", id);
};

const handleBuildingChange = (ids: number[]) => {
  emit("building-change", ids);
};

const handlePayMethodChange = (value: string) => {
  emit("pay-method-change", value);
};
</script>

<style scoped lang="scss">
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
</style>
