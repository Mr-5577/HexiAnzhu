<!-- ============ 合同台账表单（重构版） ============ -->
<template>
  <div class="contract-basic-form">
    <!-- ============ 顶部操作栏 ============ -->
    <BillHeader
      :title="'合同审批'"
      :contract-no="formData.conSysNo || ''"
      :submitter="formData.userName || ''"
      :submit-time="formData.createDate || ''"
      :status="billData.status"
      :show-status="true"
      :button-loading="submitLoading"
      :save-disabled="isReadonly"
      :submit-disabled="isReadonly"
      :delete-disabled="isDetailMode || isAddMode || !!billData.status"
      :void-disabled="isDetailMode || isAddMode || !!billData.status"
      :view-disabled="isAddMode"
      @save="handleSave"
      @submit="handleSubmit"
      @delete="handleDelete"
      @void="handleCancel"
      @viewFlow="handleViewProcess"
    />

    <!-- ============ 表单滚动区 ============ -->
    <div class="form-scroll-area">
      <el-form
        :disabled="isReadonly"
        ref="formRef"
        :validate-on-rule-change="false"
        :model="formData"
        :rules="formRules"
        label-position="left"
        label-width="120px"
        class="adapt-form"
      >
        <!-- ====== 卡片1：单据信息 ====== -->
        <BillInfo
          v-model="formData"
          :status="billData?.status || 0"
          :disabled="isReadonly"
          :project-options="projectOptions"
          @project-change="changeProject"
        />

        <!-- ====== 卡片2：基本信息 ====== -->
        <FormCard
          id="card-basic"
          icon="📄"
          title="基本信息"
          v-model:collapsed="collapsedCards.basic"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同类型" prop="conProperty" required>
                <EnumSelect
                  v-model="formData.conProperty"
                  :options="ConPropertyEnum"
                  placeholder="请选择合同类型"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="招标明细事项" prop="tenderItemId">
                <PickInput
                  v-model="formData.tenderItemName"
                  placeholder="请关联招标明细事项"
                  :readonly="isReadonly"
                  v-model:model-value-id="formData.tenderItemId"
                  @pick="openAwardItemDialog"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="定标金额" prop="bidAmount" class="is-money">
                <el-input-number
                  v-model="formData.bidAmount"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="定标金额"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item prop="conTypeId" label="合同分类" required>
                <ConTypeSelector
                  v-model="formData.conTypeId"
                  :show-all-levels="false"
                  placeholder="请选择合同分类"
                  style="width: 100%"
                  :width="'100%'"
                  clearable
                  filterable
                />
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- ====== 卡片3：合同信息 ====== -->
        <FormCard
          id="card-contract"
          icon="📑"
          title="合同信息"
          v-model:collapsed="collapsedCards.contract"
        >
          <el-row
            :gutter="24"
            v-show="formData.conProperty == 2 || formData.conProperty == 3"
          >
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="主合同" prop="mainConId">
                <PickInput
                  v-model="formData.mainConName"
                  placeholder="请选择主合同"
                  :readonly="isReadonly"
                  v-model:model-value-id="formData.mainConId"
                  @pick="openMainConDialog"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="主合同截止日期" prop="mainConExpiryDate">
                <el-date-picker
                  v-model="formData.mainConExpiryDate"
                  type="date"
                  placeholder="主合同截止日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="合同名称" prop="conName" required>
                <el-input
                  v-model="formData.conName"
                  clearable
                  placeholder="请输入合同名称"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="管理类型" prop="manageType" required>
                <EnumSelect
                  v-model="formData.manageType"
                  :options="ManageTypeEnum"
                  placeholder="请选择管理类型"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="系统编号" prop="conSysNo">
                <el-input
                  v-model="formData.conSysNo"
                  placeholder="请输入合同系统编号"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col v-if="isJianAn" :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="楼栋范围" prop="bldNames" required>
                <SelectWithAll 
                  v-model="formData.bldIds"
                  v-model:labelText="formData.bldNames"
                  select-all
                  multiple
                  :options="buildingOptions.map((i) => ({ value: i.id, label: i.bldName }))"
                  placeholder="请选择楼栋"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in buildingOptions"
                    :key="item.id"
                    :label="item.bldName"
                    :value="item.id"
                  />
                </SelectWithAll>
              </el-form-item>
            </el-col>
            <el-col v-if="isJianAn" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="计价方式" prop="priceType" required>
                <EnumSelect
                  v-model="formData.priceType"
                  :options="PriceTypeEnum"
                  placeholder="请选择计价方式"
                />
              </el-form-item>
            </el-col>
            <el-col v-if="isJianAn" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="产值确认方式" prop="payMethod" required>
                <EnumSelect
                  v-model="formData.payMethod"
                  :options="PayTypeEnum"
                  placeholder="请选择产值确认方式"
                />
              </el-form-item>
            </el-col>            
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="甲方签约公司" prop="companyId" required>
                <el-cascader
                  v-model="formData.companyId"
                  :options="companyOptions"
                  :show-all-levels="false"
                  :props="{
                    expandTrigger: 'hover',
                    emitPath: false,
                    checkStrictly: false,
                    value: 'id',
                    label: 'compName',
                    children: 'children',
                  }"
                  placeholder="请选择签约公司"
                  style="width: 100%"
                  clearable
                  @change="changeCompany"
                />
              </el-form-item>
            </el-col>
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
              <el-form-item label="签约地点" prop="signAddr">
                <el-input
                  v-model="formData.signAddr"
                  clearable
                  placeholder="签约地点"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="甲方经办人" prop="agentId" required>
                <el-cascader
                  ref="projCascaderRef"
                  v-model="formData.agentId"
                  :options="empTreeOptions"
                  :show-all-levels="false"
                  :props="{
                    expandTrigger: 'click',
                    emitPath: false,
                    checkStrictly: false,
                    value: 'orgId',
                    label: 'orgName',
                    children: 'children',
                    leaf: (data) => data.dataType === 0,
                  }"
                  placeholder="请选择经办人"
                  style="width: 100%"
                  clearable
                  filterable
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
                  @change="changeConEffectDate"
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
                  @change="changeConEffectDate"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="日历工期(天)" prop="daysNum">
                <el-input-number
                  v-model="formData.daysNum"
                  :controls="false"
                  placeholder=""
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item
                label="应缴履约保证金"
                prop="pbAmount"
                required
                class="is-money"
              >
                <el-input-number
                  v-model="formData.pbAmount"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="应缴履约保证金额"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="是否需办理结算" prop="needSettle">
                <EnumSelect
                  v-model="formData.needSettle"
                  :options="BOOL_OPTIONS"
                  :clearable="false"
                  placeholder="请选择是否需办理结算"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="是否用印" prop="needSeal" required>
                <EnumSelect
                  v-model="formData.needSeal"
                  :options="BOOL_OPTIONS"
                  :clearable="false"
                  placeholder="请选择"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="印章类型" prop="sealTypes">
                <EnumSelect
                  v-model="formData.sealTypes"
                  :options="SealTypesEnum"
                  multiple
                  :disabled="!formData.needSeal"
                  placeholder="请选择印章类型"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="合同简述" prop="remark">
                <el-input
                  v-model="formData.remark"
                  type="textarea"
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  placeholder="其他需要补充说明的信息"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- ====== 卡片4：价款及税率 ====== -->
        <FormCard
          id="card-price"
          icon="💰"
          title="价款及税率"
          v-model:collapsed="collapsedCards.price"
        >
          <SummaryBar :items="summaryItems" />
          <DetailTableCard
            title="价税明细"
            :count="priceTable.length"
            add-text="新增价税明细"
            v-model="priceTable"
            :columns="priceColumns"
            @add="addPrice"
          >
            <template #actions="{ row }">
              <el-button link type="danger" @click="deletePrice(row)">
                删除
              </el-button>
            </template>
          </DetailTableCard>
        </FormCard>

        <!-- ====== 卡片5：供方信息 ====== -->
        <FormCard
          id="card-supplier"
          icon="🏢"
          title="供方信息"
          v-model:collapsed="collapsedCards.supplier"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="供应商名称" prop="supName" required>
                <PickInput v-model="formData.supName" placeholder="请选择供应商"
                  :readonly="isReadonly"
                  v-model:model-value-id="formData.supId"
                  @pick="openSupplierDialog" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="供应商联系人" prop="supCmanName" required>
                <el-input
                  v-model="formData.supCmanName"
                  placeholder="请输入联系人姓名"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="联系人电话" prop="supCmanTel" required>
                <el-input
                  v-model="formData.supCmanTel"
                  placeholder="请输入联系电话"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="开户银行" prop="bankName" required>
                <el-input
                  v-model="formData.bankName"
                  placeholder="请输入开户银行"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="银行户名" prop="accountName" required>
                <el-input
                  v-model="formData.accountName"
                  placeholder="请输入银行户名"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="银行账号" prop="bankAccount" required>
                <el-input
                  v-model="formData.bankAccount"
                  placeholder="请输入银行账号"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="联系人身份证" prop="supCmanIdno">
                <el-input
                  v-model="formData.supCmanIdno"
                  placeholder="请输入身份证号码"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="联系人职务" prop="supCmanJob">
                <el-input
                  v-model="formData.supCmanJob"
                  placeholder="请输入职务"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- ====== 卡片6：支付比例 ====== -->
        <FormCard
          v-show="showPayrate || isJianAn"
          id="card-payrate"
          icon="📊"
          title="支付比例"
          v-model:collapsed="collapsedCards.payrate"
        >
          <DetailTableCard
            title="支付比例明细"
            :count="payrateTable.length"
            add-text="新增支付明细"
            v-model="payrateTable"
            :columns="payrateColumns"
            @add="addPayrate"
          >
            <template #actions="{ row }">
              <el-button link type="danger" @click="deletePayrate(row)">
                删除
              </el-button>
            </template>
          </DetailTableCard>
        </FormCard>

        <!-- ====== 卡片7：合同附件 ====== -->
        <FormCard
          id="card-annex"
          icon="📎"
          title="合同附件"
          v-model:collapsed="collapsedCards.annex"
        >
          <el-form-item label="合同正文及附件" required>
            <base-upload
              v-model:file-list="annexContractFileList"
              :limit="9"
              :multiple="false"
              :showIcon="true"
              :showTip="true"
              :maxSize="20"
              :unrestricted="true"
              :accept="''"
              button-text="选择文件"
              size="default"
              :disabled="isReadonly"
              @success="handleUploadConSuccess"
            />
          </el-form-item>
          <el-form-item label="其他附件">
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
              :disabled="isReadonly"
              @success="handleUploadOtherSuccess"
            />
          </el-form-item>
        </FormCard>
      </el-form>
    </div>

    <!-- ============ 悬浮定位栏 ============ -->
    <FloatNav :items="navCards" />
  </div>

  <!-- 选择合同弹窗 -->
  <choose-contract-dialog
    ref="contractDialogRef"
    v-model="mainConDialogVisible"
    @select="handleMainConSelect"
  />

  <!-- 选择供应商弹窗 -->
  <choose-supplier-dialog
    ref="supplierDialogRef"
    v-model="supplierDialogVisible"
    :selectionMode="'single'"
    @select="handleSupplierSelect"
  />

  <!-- 选择定标事项弹窗 -->
  <ChooseAwardItemDialog
    v-model="awardItemDialogVisible"
    :selectionMode="'single'"
    :projId = formData.projId
    @select="handleAwardItemSelect"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  useContractForm,
  type ContractFormProps,
  type ContractFormEmits,
} from "./contract-ledger-form";
import BaseUpload from "@/components/base/base-upload.vue";
import FormCard from "@/components/base/base-form-card.vue";
import PickInput from "@/components/base/base-pick-input.vue";
import EnumSelect from "@/components/base/base-enum-select.vue";
import DetailTableCard from "@/components/base/detail-table-card.vue";
import FloatNav from "@/components/base/base-float-nav.vue";
import SummaryBar from "@/components/business/summary-bar.vue";
import ChooseContractDialog from "@/components/business/choose-contract-dialog.vue";
import ChooseSupplierDialog from "@/components/business/choose-supplier-dialog.vue";
import ChooseAwardItemDialog from "@/components/business/choose-bid-award-item-dialog.vue";
import BillHeader from "@/components/business/bill-components/bill-header.vue";
import {
  ConPropertyEnum,
  PriceTypeEnum,
  ManageTypeEnum,
  PayTypeEnum,
  SealTypesEnum,
} from "@/constants/contract-manage/enums";
import { BOOL_OPTIONS } from "./contract-form-config";

defineOptions({ name: "contract-ledger-form" });

const props = withDefaults(defineProps<ContractFormProps>(), {
  mode: "add",
  conId: undefined,
});

const emit = defineEmits<ContractFormEmits>();
const {
  // 表单核心
  billData,
  formData,
  formRef,
  submitLoading,
  formRules,
  isReadonly,
  handleSubmit,
  handleSave,
  handleDelete,
  handleCancel,
  handleViewProcess,
  resetForm,
  initData,
  // 价款
  priceTaxData,
  formatMoney,
  priceTable,
  priceColumns,
  payrateTable,
  payrateColumns,
  addPrice,
  deletePrice,
  addPayrate,
  deletePayrate,
  // 下拉选项
  companyOptions,
  empTreeOptions,
  buildingOptions,
  conTypeOptions,
  projectOptions,
  // 联动
  changeProject,
  handleBuildingChange,
  changeCompany,
  changeConEffectDate,
  // UI：卡片折叠
  collapsedCards,
  // UI：悬浮定位栏（navCards 传给 FloatNav 组件）
  navCards,
  // 需求7：支付比例显示控制
  showPayrate,
  // 模式
  isDetailMode,
  isAddMode,
  // 主合同选择
  mainConDialogVisible,
  openMainConDialog,
  handleMainConSelect,
  // 供应商选择（需求6）
  supplierDialogVisible,
  openSupplierDialog,
  handleSupplierSelect,
  //选择招标事项
  awardItemDialogVisible,
  openAwardItemDialog,
  handleAwardItemSelect,
  // 附件
  annexContractFileList,
  annexFileList,
  handleUploadOtherSuccess,
  handleUploadConSuccess,
  isJianAn,
} = useContractForm(props, emit);

// 价款汇总条数据
const summaryItems = computed(() => [
  { label: "合同总价(含税)", value: `¥ ${formatMoney(priceTaxData.value.totalPriceTax)}` },
  { label: "合同总价(不含税)", value: `¥ ${formatMoney(priceTaxData.value.totalPrice)}` },
  { label: "税额", value: `¥ ${formatMoney(priceTaxData.value.taxAmount)}`, type: "tax" as const },
  { label: "综合税率", value: `${priceTaxData.value.taxRate}%`, type: "tax" as const },
]);

defineExpose({
  formData,
  billData,
  resetForm,
  initData,
});
</script>

<style scoped lang="scss">
.contract-basic-form {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

/* ============ 表单滚动区 ============ */
.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px 30px;
  box-sizing: border-box;
}

.adapt-form {
  width: 100%;
  margin: 0 auto;

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
    color: #4e5969;
    line-height: 32px;
    padding-right: 12px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner),
  :deep(.el-select__wrapper) {
    border-radius: 4px;
    transition: all 0.2s;
  }

  /* 金额字段 ¥ 前缀 */
  .is-money :deep(.el-input__wrapper) {
    padding-left: 24px;
    position: relative;

    &::before {
      content: "¥";
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #86909c;
      font-size: 13px;
      pointer-events: none;
      z-index: 1;
    }
  }
}

/* 滚动条美化 */
.form-scroll-area::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.form-scroll-area::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
}
.form-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #909399;
}
.form-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}


</style>