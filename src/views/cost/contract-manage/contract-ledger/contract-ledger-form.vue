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
            <el-form-item label="付款方式" prop="payMethod" required>
              <el-select
                v-model="formData.payMethod"
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

        <div class="section-title">拓展信息</div>
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
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="开户银行" prop="bankName">
              <el-input
                v-model="formData.bankName"
                :disabled="isDetail"
                placeholder="请输入开户银行"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="银行户名" prop="accountName">
              <el-input
                v-model="formData.accountName"
                :disabled="isDetail"
                placeholder="请输入银行户名"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="银行账号" prop="bankAccount">
              <el-input
                v-model="formData.bankAccount"
                :disabled="isDetail"
                placeholder="请输入银行账号"
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
        <!-- 价款及税率 -->
        <div>
          <div class="section-title">价款及税率</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同总价(含税)" prop="totalPriceTax">
                <el-input
                  v-model="priceTaxData.totalPriceTax"
                  readonly
                  placeholder="自动计算"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同总价(不含税)" prop="totalPrice">
                <el-input
                  v-model="priceTaxData.totalPrice"
                  readonly
                  placeholder="自动计算"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="税额" prop="taxAmount">
                <el-input
                  v-model="priceTaxData.taxAmount"
                  readonly
                  placeholder="自动计算"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="税率" prop="taxRate">
                <el-input
                  v-model="priceTaxData.taxRate"
                  readonly
                  placeholder="自动计算"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 价税明细表格区域 -->
          <div class="detail-table">
            <div class="header-content">
              <span class="header-title">价税明细</span>
              <el-button
                type="primary"
                size="small"
                @click="addPrice"
                v-if="!isDetail"
              >
                新增价税明细
              </el-button>
            </div>
            <editable-table
              ref="pricesRef"
              :row-key="'uuid'"
              :height="'160px'"
              :table-data="priceTable"
              :columns="priceColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :on-save="handleSavePrice"
              @data-change="handleChangePrice"
              @update:table-data="handleUpdatePrice"
            >
              <template #actions="{ row }">
                <el-button link type="danger" @click="deletePrice(row)">
                  删除
                </el-button>
              </template>
            </editable-table>
          </div>
        </div>
        <!-- 合同支付比例明细 -->
        <div>
          <div class="section-title">支付比例</div>
          <div class="detail-table">
            <div class="header-content">
              <span class="header-title">支付比例明细</span>
              <el-button
                type="primary"
                size="small"
                @click="addPayrate"
                v-if="!isDetail"
              >
                新增支付明细
              </el-button>
            </div>
            <editable-table
              ref="payrateRef"
              :row-key="'uuid'"
              :height="'160px'"
              :table-data="payrateTable"
              :columns="payrateColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :on-save="handleSavePayrate"
              @data-change="handleChangePayrate"
              @update:table-data="handleUpdatePayrate"
            >
              <template #actions="{ row }">
                <el-button link type="danger" @click="deletePayrate(row)">
                  删除
                </el-button>
              </template>
            </editable-table>
          </div>
        </div>
        <!-- 材料合同产值 -->
        <div>
          <div class="section-title">材料合同产值</div>
          <div class="detail-table">
            <div class="header-content">
              <span class="header-title">材料合同产值明细</span>
              <el-button
                type="primary"
                size="small"
                @click="addMaterial"
                v-if="!isDetail"
              >
                新增合同产值明细
              </el-button>
            </div>
            <editable-table
              ref="materialRef"
              :row-key="'uuid'"
              :height="'160px'"
              :table-data="materialTable"
              :columns="materialColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :on-save="handleSaveMaterial"
              @data-change="handleChangeMaterial"
              @update:table-data="handleUpdateMaterial"
            >
              <template #actions="{ row }">
                <el-button link type="danger" @click="deleteMaterial(row)">
                  删除
                </el-button>
              </template>
            </editable-table>
          </div>
        </div>
        <!-- 支付节点 -->
        <div>
          <div class="section-title">支付节点</div>
          <div class="detail-table">
            <div class="header-content">
              <span class="header-title">支付节点明细</span>
              <el-button
                type="primary"
                size="small"
                @click="addPaynode"
                v-if="!isDetail"
              >
                新增支付节点明细
              </el-button>
            </div>
            <editable-table
              ref="paynodeRef"
              :row-key="'uuid'"
              :height="'160px'"
              :table-data="paynodeTable"
              :columns="paynodeColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :on-save="handleSavePaynode"
              @data-change="handleChangePaynode"
              @update:table-data="handleUpdatePaynode"
            >
              <template #actions="{ row }">
                <el-button link type="danger" @click="deletePaynode(row)">
                  删除
                </el-button>
              </template>
            </editable-table>
          </div>
        </div>
        <!-- 合同附件 -->
        <div>
          <div class="section-title">合同附件</div>
          <el-form-item label="上传合同附件" prop="attachment">
            <base-upload></base-upload>
          </el-form-item>
        </div>
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
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { conTypeApi } from "@/api/cost/master-data/contract-category-api";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { commonApi } from "@/api/cost/common-api";
import { manageunitApi } from "@/api/cost/master-data/management-unit-api";
import { buildTree } from "@/utils/tree";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import {
  ConPropertyEnum,
  PriceTypeEnum,
  ManageTypeEnum,
  PayTypeEnum,
  SealTypesEnum,
} from "@/constants/contract-manage/enums";
import { bankCardRegex, idCardRegex, phoneRegex } from "@/utils/regex";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { v4 as uuidv4 } from "uuid";
import BaseUpload from "@/components/base/base-upload.vue";

defineOptions({ name: "contract-ledger-form" });

// 路由与状态
const route = useRoute();
const userStore = useUserStore();

const conId = ref(null);
const mode = ref<"add" | "edit" | "detail">("add");
const isDetail = computed(() => route.query.mode === "detail");

// 创建响应式的价款数据，使用 computed 自动追踪 priceTable 变化
const priceTaxData = computed(() => calculatePriceTaxData());
// 表单数据定义
const initFormData = () => ({
  // 主表字段
  id: null,
  segId: null,
  projId: null,
  acctProjId: null,
  tenderItemId: null,
  companyId: null,
  conName: "",
  conSysNo: "",
  conPhyNo: "",
  conTypeId: null,
  conProperty: null,
  mainConId: null,
  supId: null,
  priceType: null,
  conStatus: 0,
  signAmt: null,
  signExclAmt: null,
  taxAmt: null,
  signDate: "",
  effectiveDate: "",
  expiryDate: "",
  daysNum: null,
  needSettle: true,
  settleAmt: null,
  flowId: null,
  agentId: null,
  proProf: null,
  bldIds: [],
  bldNames: "",
  pbAmount: null,
  manageType: null,
  payMethod: null,
  // 扩展字段
  needSeal: false,
  sealTypes: [],
  signAddr: "",
  supCmanName: "",
  supCmanIdno: "",
  supCmanTel: "",
  supCmanJob: "",
  bankName: "",
  accountName: "",
  bankAccount: "",
  remark: "",
});

const formData = ref(initFormData());
const formRef = ref(null);
const submitLoading = ref(false);

// 下拉选项数据
const companyOptions = ref([]);
const buildingOptions = ref([]);
const segOptions = ref([]);
const conTypeOptions = ref([]);
const projectOptions = ref([]);
const supplierOptions = ref([]);
const proProfOptions = ref([]);
const acctProjOptions = ref([]);
const paymentTypeOptions = ref([]);

const priceTable = ref<any[]>([]); // 合同价格明细
const priceColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "itemName",
    label: "分项名称",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "itemAmt",
    label: "分项含税总额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "itemTaxRate",
    label: "税率",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "itemExclAmt",
    label: "分项不含税额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "itemTaxAmt",
    label: "分项税额",
    showSummary: true,
    editable: true,
    editType: "number",
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
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);
// 计算价款及税率汇总数据
const calculatePriceTaxData = () => {
  // 累加各项金额
  const totalPriceTax = priceTable.value.reduce((sum, item) => {
    const amt = Number(item.itemAmt) || 0;
    return sum + amt;
  }, 0);

  const totalPrice = priceTable.value.reduce((sum, item) => {
    const exclAmt = Number(item.itemExclAmt) || 0;
    return sum + exclAmt;
  }, 0);

  const taxAmount = priceTable.value.reduce((sum, item) => {
    const tax = Number(item.itemTaxAmt) || 0;
    return sum + tax;
  }, 0);

  // 计算税率（不含税总额 > 0 时计算税率，否则为 0）
  let taxRate = 0;
  if (totalPrice > 0) {
    // 税率 = 税额 / 不含税总额 * 100
    taxRate = (taxAmount / totalPrice) * 100;
    // 保留两位小数
    taxRate = Math.round(taxRate * 100) / 100;
  }

  return {
    totalPriceTax,
    totalPrice,
    taxAmount,
    taxRate,
  };
};
const payrateTable = ref<any[]>([]); // 支付明细
const payrateColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "payRateId",
    label: "支付比例",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "name",
    optionValueField: "id",
    options: [
      { id: 1, name: "节点" },
      { id: 2, name: "比例" },
      { id: 3, name: "材料" },
    ],
    width: 120,
  },
  {
    prop: "payTypeId",
    label: "款项类型",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "dicLabel",
    optionValueField: "id",
    options: paymentTypeOptions.value || [],
    width: 120,
  },
  {
    prop: "payRate",
    label: "应付比例(%)",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "isCtrl",
    label: "是否强控",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    clearable: false,
    options: [
      { value: true, label: "是" },
      { value: false, label: "否" },
    ],
    width: 120,
  },
  {
    prop: "payIntvl",
    label: "支付周期(月)",
    showSummary: true,
    editable: true,
    editType: "number",
    precision: 0,
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "prodVal",
    label: "本次申请产值金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payAmt",
    label: "本次申报应付金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "buildPeriod",
    label: "施工期间",
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "prodValPeriod",
    label: "产值期间",
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payDate",
    label: "计划付款日期",
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "costProdVal",
    label: "成本复核产值金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);
const materialTable = ref<any[]>([]); // 材料合同产值明细
const materialColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "mtName",
    label: "材料名称",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "mtModel",
    label: "材料规格",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "mtBrand",
    label: "品牌",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "recvNum",
    label: "接收数量",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    precision: 0,
    width: 120,
  },
  {
    prop: "mtUnit",
    label: "计量单位",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "recvBillNo",
    label: "接收单号",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "recvPrice",
    label: "接收价格",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "fineAmt",
    label: "罚款",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "prodVal",
    label: "产值总金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payRate",
    label: "应付比例",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payAmt",
    label: "本次申报应付金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "buildPeriod",
    label: "施工期间",
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "prodValPeriod",
    label: "产值期间",
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payDate",
    label: "计划付款日期",
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "costProdVal",
    label: "成本复核产值金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);
const paynodeTable = ref<any[]>([]); // 支付节点明细
const paynodeColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "nodeName",
    label: "支付节点",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payType",
    label: "款项类型",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "dicLabel",
    optionValueField: "id",
    options: paymentTypeOptions.value || [],
    width: 120,
  },
  {
    prop: "prodVal",
    label: "产值金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payAmt",
    label: "应付金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payRate",
    label: "应付比例",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payDate",
    label: "计划付款日期",
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "costProdVal",
    label: "成本复核产值金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付金额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "remark",
    label: "备注",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);

// 数据字典
const { getDictList, loadDicts } = useDict(
  [dictMapping.proProf, dictMapping.acctProj, dictMapping.paymentType],
  { treeDictCodes: [] },
);

// 表单校验规则
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
  payMethod: [{ required: true, message: "请选择付款方式", trigger: "change" }],
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
    {
      pattern: phoneRegex,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
  supCmanIdno: [
    { required: true, message: "请输入联系人身份证", trigger: "blur" },
    {
      pattern: idCardRegex,
      message: "请输入正确的身份证号码",
      trigger: "blur",
    },
  ],
  supCmanJob: [
    { required: false, message: "请输入联系人职务", trigger: "blur" },
  ],
  bankName: [{ required: false, message: "请输入开户银行", trigger: "blur" }],
  accountName: [
    { required: false, message: "请输入银行户名", trigger: "blur" },
  ],
  bankAccount: [
    { required: false, message: "请输入银行账号", trigger: "blur" },
    {
      pattern: bankCardRegex,
      message: "请输入正确的银行卡号",
      trigger: "blur",
    },
  ],
});

// ==================== 数据获取方法 ====================
// 获取签约公司列表
const getCompanyList = async () => {
  try {
    const res = await manageunitApi.getAuthMguList();
    if (res.code === 200) {
      companyOptions.value = buildTree(res.data || []);
    }
  } catch (error) {
    console.error("获取签约公司列表失败:", error);
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

// 获取楼栋列表
const getBuildingList = async (projId: number) => {
  if (!projId) return;
  try {
    buildingOptions.value = [];
    const buildingRes = await projectAreaApi.getBuildingList({ projId });
    if (buildingRes.code === 200) {
      buildingOptions.value = buildingRes.data || [];
      // 编辑时回显楼栋名称
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

// 初始化数据字典
const initDictData = async () => {
  await loadDicts();
  proProfOptions.value = getDictList(dictMapping.proProf); // 生产专业
  acctProjOptions.value = getDictList(dictMapping.acctProj); // 核算项目
  paymentTypeOptions.value = getDictList(dictMapping.paymentType); // 款项类型
};

// 生成合同编号
const createConNo = async () => {
  try {
    const conRes = await commonApi.getBillNo({ bizType: "HTBH" });
    if (conRes.code === 200) {
      formData.value.conSysNo = conRes.data;
      formData.value.conPhyNo = conRes.data;
    }
  } catch (error) {
    console.error("生成合同编号失败:", error);
  }
};

// 初始化所有下拉选项
const initOptions = async () => {
  await Promise.all([
    getCompanyList(),
    getSegOptions(),
    getProjectOptions(),
    getSupplierList(),
    getConTypeList(),
    initDictData(),
  ]);
};

// ==================== 表单数据转换方法 ====================
// 构建提交参数（表单数据 -> 接口参数）
const buildSubmitParams = () => {
  return {
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
      conStatus: formData.value.conStatus || 0,
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
      bldIds: formData.value.bldIds.join(","),
      bldNames: formData.value.bldNames,
      pbAmount: formData.value.pbAmount,
      manageType: formData.value.manageType,
      payMethod: formData.value.payMethod,
    },
    conMainExt: {
      id: formData.value.id,
      conId: formData.value.id,
      needSeal: formData.value.needSeal,
      sealTypes: formData.value.sealTypes.join(","),
      signAddr: formData.value.signAddr,
      supCmanName: formData.value.supCmanName,
      supCmanIdno: formData.value.supCmanIdno,
      supCmanTel: formData.value.supCmanTel,
      supCmanJob: formData.value.supCmanJob,
      bankName: formData.value.bankName,
      accountName: formData.value.accountName,
      bankAccount: formData.value.bankAccount,
      remark: formData.value.remark,
    },
    billPrices: priceTable.value,
    billPayrates: payrateTable.value,
    billMaterials: materialTable.value,
    billPaynodes: paynodeTable.value,
    annexes: [],
  };
};

// 解析回显数据（接口数据 -> 表单数据）
const parseContractData = (conMain: any, conMainExt: any) => {
  return {
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
    bldIds: conMain.bldIds ? conMain.bldIds.split(",").map(Number) : [],
    bldNames: conMain.bldNames || "",
    pbAmount: conMain.pbAmount,
    manageType: conMain.manageType,
    payMethod: conMain.payMethod,
    // 扩展字段
    needSeal: conMainExt?.needSeal ?? false,
    sealTypes: conMainExt?.sealTypes ? conMainExt.sealTypes.split(",") : [],
    signAddr: conMainExt?.signAddr || "",
    supCmanName: conMainExt?.supCmanName || "",
    supCmanIdno: conMainExt?.supCmanIdno || "",
    supCmanTel: conMainExt?.supCmanTel || "",
    supCmanJob: conMainExt?.supCmanJob || "",
    bankName: conMainExt?.bankName || "",
    accountName: conMainExt?.accountName || "",
    bankAccount: conMainExt?.bankAccount || "",
    remark: conMainExt?.remark || "",
  };
};

// ==================== 业务操作方法 ====================
// 选择项目（联动加载楼栋）
const changeProject = (val: number) => {
  formData.value.bldIds = [];
  formData.value.bldNames = "";
  if (val) {
    getBuildingList(val);
  }
};

// 楼栋选择变化（更新楼栋名称）
const handleBuildingChange = (ids: number[]) => {
  const names = buildingOptions.value
    .filter((v: any) => ids.includes(v.id))
    .map((v: any) => v.bldName);
  formData.value.bldNames = names.join(",");
};

// 加载合同详情（编辑/详情模式）
const loadContractDetail = async () => {
  if (!conId.value) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: conId.value,
    });
    if (res.code === 200 && res.data) {
      const {
        conMain,
        conMainExt,
        billMaterials,
        billPaynodes,
        billPayrates,
        billPrices,
      } = res.data;
      formData.value = parseContractData(conMain, conMainExt);
      materialTable.value = billMaterials || [];
      paynodeTable.value = billPaynodes || [];
      payrateTable.value = billPayrates || [];
      priceTable.value = billPrices || [];
      // 加载楼栋列表
      if (conMain.projId) {
        await getBuildingList(conMain.projId);
      }
    }
  } catch (error) {
    console.error("获取合同信息失败:", error);
  }
};

const addPrice = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: null,
    conBillId: conId.value,
    itemName: "", // 分项名称
    itemAmt: 0, // 分项含税总额
    itemTaxRate: 0, // 税率
    itemExclAmt: 0, // 分项不含税总额
    itemTaxAmt: 0, // 分项税额
    remark: "", // 备注
  };
  priceTable.value = [...priceTable.value, newRowData];
};
const deletePrice = (row) => {
  priceTable.value = priceTable.value.filter((item) => item.uuid !== row.uuid);
};
const handleSavePrice = async (rowData: any) => {
  const { row, column, newValue, oldValue, rowIndex } = rowData;
};
const handleChangePrice = (data: any) => {};
const handleUpdatePrice = (newData: any) => {
  priceTable.value = newData;
};
const addPayrate = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: null,
    conBillId: conId.value,
    payRateId: null, // 支付比例表ID
    payTypeId: null, // 款项类型ID
    payRate: 0, // 应付比例
    isCtrl: false, // 是否强控
    payIntvl: 0, // 付周期（月）
    prodVal: 0, // 本次申请产值金额
    payAmt: 0, // 本次申报应付金额
    buildPeriod: "", // 施工期间
    prodValPeriod: "", // 产值期间
    payDate: "", // 计划付款日期
    costProdVal: 0, // 成本复核产值金额
    costPayAmt: 0, // 成本复核应付金额
  };
  payrateTable.value = [...payrateTable.value, newRowData];
};
const deletePayrate = (row) => {
  payrateTable.value = payrateTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};
const handleSavePayrate = async (rowData: any) => {
  const { row, column, newValue, oldValue, rowIndex } = rowData;
};
const handleChangePayrate = (data: any) => {};
const handleUpdatePayrate = (newData: any) => {
  payrateTable.value = newData;
};
const addMaterial = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: null,
    conBillId: conId.value,
    mtId: null, // 材料产值ID
    mtName: "", // 材料名称
    mtModel: "", // 材料规格
    mtBrand: "", // 材料品牌
    recvNum: 0, // 接收数量
    mtUnit: "", // 计量单位
    recvBillNo: "", // 接收单号
    recvPrice: 0, // 接收价格
    fineAmt: 0, // 罚款
    prodVal: 0, // 产值总金额
    payRate: 0, // 应付比例
    payAmt: 0, // 本次申报应付金额
    buildPeriod: "", // 施工期间
    prodValPeriod: "", // 产值期间
    payDate: "", // 计划付款日期
    costProdVal: 0, // 成本复核产值金额
    costPayAmt: 0, // 成本复核应付金额
  };
  materialTable.value = [...materialTable.value, newRowData];
};
const deleteMaterial = (row) => {
  materialTable.value = materialTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};
const handleSaveMaterial = async (rowData: any) => {
  const { row, column, newValue, oldValue, rowIndex } = rowData;
};
const handleChangeMaterial = (data: any) => {};
const handleUpdateMaterial = (newData: any) => {
  materialTable.value = newData;
};
const addPaynode = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: null,
    conBillId: conId.value,
    nodeId: null, // 支付节点ID
    nodeName: "", // 支付节点名称
    payType: null, // 款项类型
    prodVal: 0, // 产值金额
    payRate: 0, // 应付比例
    payAmt: 0, // 应付金额
    payDate: "", // 计划付款日期
    costProdVal: 0, // 成本复核产值金额
    costPayAmt: 0, // 成本复核应付金额
    remark: "", // 备注
  };
  paynodeTable.value = [...paynodeTable.value, newRowData];
};
const deletePaynode = (row) => {
  paynodeTable.value = paynodeTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};
const handleSavePaynode = async (rowData: any) => {
  const { row, column, newValue, oldValue, rowIndex } = rowData;
};
const handleChangePaynode = (data: any) => {};
const handleUpdatePaynode = (newData: any) => {
  paynodeTable.value = newData;
};
// 校验价税明细表
const validatePriceTable = () => {
  if (priceTable.value.length === 0) {
    ElMessage.error("价税明细列表不能为空");
    return false;
  }
  for (let i = 0; i < priceTable.value.length; i++) {
    const item = priceTable.value[i];
    if (!item.itemName || item.itemName.trim() === "") {
      ElMessage.error(`价税明细列表第${i + 1}行：分项名称不能为空`);
      return false;
    }
    if (!item.itemAmt || item.itemAmt <= 0) {
      ElMessage.error(`价税明细列表第${i + 1}行：分项含税总额必须大于0`);
      return false;
    }
    if (!item.itemTaxRate || item.itemTaxRate < 0) {
      ElMessage.error(`价税明细列表第${i + 1}行：税率不能为空且不能小于0`);
      return false;
    }
    if (!item.itemExclAmt || item.itemExclAmt <= 0) {
      ElMessage.error(`价税明细列表第${i + 1}行：分项不含税总额必须大于0`);
      return false;
    }
    if (!item.itemTaxAmt || item.itemTaxAmt < 0) {
      ElMessage.error(`价税明细列表第${i + 1}行：分项总额必须大于等于0`);
      return false;
    }
  }
  return true;
};
// 校验支付比例明细表
const validatePayrateTable = () => {
  if (payrateTable.value.length === 0) {
    ElMessage.error("支付比例明细列表不能为空");
    return false;
  }
  for (let i = 0; i < payrateTable.value.length; i++) {
    const item = payrateTable.value[i];
    if (!item.payTypeId) {
      ElMessage.error(`支付比例明细列表第${i + 1}行：请选择款项类型`);
      return false;
    }
    if (!item.payRate || item.payRate <= 0) {
      ElMessage.error(`支付比例明细列表第${i + 1}行：应付比例必须大于0`);
      return false;
    }
    if (!item.prodVal || item.prodVal <= 0) {
      ElMessage.error(
        `支付比例明细列表第${i + 1}行：本次申请产值金额必须大于0`,
      );
      return false;
    }
    if (!item.payAmt || item.payAmt <= 0) {
      ElMessage.error(
        `支付比例明细列表第${i + 1}行：本次申报应付金额必须大于0`,
      );
      return false;
    }
    if (!item.costProdVal || item.costProdVal <= 0) {
      ElMessage.error(
        `支付比例明细列表第${i + 1}行：成本复核产值金额必须大于0`,
      );
      return false;
    }
    if (!item.costPayAmt || item.costPayAmt <= 0) {
      ElMessage.error(
        `支付比例明细列表第${i + 1}行：成本复核应付金额必须大于0`,
      );
      return false;
    }
  }
  return true;
};

// 校验材料产值明细表
const validateMaterialTable = () => {
  if (materialTable.value.length === 0) {
    ElMessage.error("材料产值明细列表不能为空");
    return false;
  }
  for (let i = 0; i < materialTable.value.length; i++) {
    const item = materialTable.value[i];
    if (!item.mtModel || item.mtModel.trim() === "") {
      ElMessage.error(`材料产值明细列表第${i + 1}行：材料规格不能为空`);
      return false;
    }
    if (!item.payRate || item.payRate <= 0) {
      ElMessage.error(`材料产值明细列表第${i + 1}行：应付比例必须大于0`);
      return false;
    }
    if (!item.payAmt || item.payAmt <= 0) {
      ElMessage.error(
        `材料产值明细列表第${i + 1}行：本次申报应付金额必须大于0`,
      );
      return false;
    }
    if (!item.costProdVal || item.costProdVal <= 0) {
      ElMessage.error(
        `材料产值明细列表第${i + 1}行：成本复核产值金额必须大于0`,
      );
      return false;
    }
    if (!item.costPayAmt || item.costPayAmt <= 0) {
      ElMessage.error(
        `材料产值明细列表第${i + 1}行：成本复核应付金额必须大于0`,
      );
      return false;
    }
  }
  return true;
};

// 校验支付节点明细表
const validatePaynodeTable = () => {
  if (paynodeTable.value.length === 0) {
    ElMessage.error("支付节点明细列表不能为空");
    return false;
  }
  for (let i = 0; i < paynodeTable.value.length; i++) {
    const item = paynodeTable.value[i];
    if (!item.nodeName || item.nodeName.trim() === "") {
      ElMessage.error(`支付节点明细列表${i + 1}行：支付节点名称不能为空`);
      return false;
    }
    if (!item.payType) {
      ElMessage.error(`支付节点明细列表${i + 1}行：请选择款项类型`);
      return false;
    }
    if (!item.prodVal || item.prodVal <= 0) {
      ElMessage.error(`支付节点明细列表${i + 1}行：产值金额必须大于0`);
      return false;
    }
    if (!item.payRate || item.payRate <= 0) {
      ElMessage.error(`支付节点明细列表${i + 1}行：应付比例必须大于0`);
      return false;
    }
    if (!item.payAmt || item.payAmt <= 0) {
      ElMessage.error(`支付节点明细列表第${i + 1}行：应付金额必须大于0`);
      return false;
    }
    if (!item.costProdVal || item.costProdVal <= 0) {
      ElMessage.error(
        `支付节点明细列表第${i + 1}行：成本复核产值金额必须大于0`,
      );
      return false;
    }
    if (!item.costPayAmt || item.costPayAmt <= 0) {
      ElMessage.error(
        `支付节点明细列表第${i + 1}行：成本复核应付金额必须大于0`,
      );
      return false;
    }
  }
  return true;
};
// 提交表单
const handleSubmit = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    // 校验各个明细表
    if (!validatePriceTable()) return;
    if (!validatePayrateTable()) return;
    if (!validateMaterialTable()) return;
    if (!validatePaynodeTable()) return;

    submitLoading.value = true;
    const params = buildSubmitParams();
    debugger;
    if (formData.value.id) {
      const editRes = await contractLedgerApi.editContractLedger(params);
      if (editRes.code === 200) {
        ElMessage.success("提交成功");
      }
    } else {
      const addRes = await contractLedgerApi.addContractLedger(params);
      if (addRes.code === 200) {
        ElMessage.success("提交成功");
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    submitLoading.value = false;
  }
};

// ==================== 路由初始化 ====================
const syncRouteState = async () => {
  const queryMode = route.query.mode as string;
  mode.value =
    queryMode === "edit" || queryMode === "detail" ? queryMode : "add";
  const idValue = route.query.conId ? Number(route.query.conId) : null;
  conId.value = idValue || null;

  await initOptions();

  if (mode.value === "edit" || mode.value === "detail") {
    await loadContractDetail();
  } else if (mode.value === "add") {
    formData.value.agentId = userStore.userInfo.id;
    await createConNo();
  }
};

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
  padding: 0 10px;
}

.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 15px;
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
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-title {
      font-size: 15px;
      color: #5d5d5f;
      font-weight: 600;
    }
  }
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
