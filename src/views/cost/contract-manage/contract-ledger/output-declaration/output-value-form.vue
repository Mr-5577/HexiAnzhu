<!-- 产值申报 审批 -->
<template>
  <div class="basic-form-content">
    <BillHeader
      :title="'产值申报'"
      :contract-no="billData.bizNo || ''"
      :submitter="formData.userName || ''"
      :submit-time="formData.createDate || ''"
      :status="billData.status || 0"
      :show-status="true"
      :button-loading="submitLoading"
      :save-disabled="isDetail || !!billData.status"
      :submit-disabled="isDetail || !!billData.status"
      :delete-disabled="isDetail || isAdd || !!billData.status"
      :void-disabled="isDetail || isAdd || !!billData.status"
      :view-disabled="isAdd"
      @save="handleSave"
      @submit="handleSubmit"
      @delete="handleDelete"
      @void="handleCancel"
      @viewFlow="handleViewProcess"
    >
    </BillHeader>
    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :disabled="isReadonly || loadingForm"
        :validate-on-rule-change="false"
        label-width="130px"
        class="adapt-form"
      >
        <BillInfo
          v-model="formData"
          :status="billData?.status || 0"
          :disabled="isDetail || !!billData.status"
          :project-options="projectOptions"
          @project-change="changeProject"
        />

        <!-- 合同信息 -->
        <FormCard
          id="card-base"
          icon="📋"
          title="合同信息"
          v-model:collapsed="collapsedCards.base"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="合同名称" prop="conId" required>
                <PickInput
                  v-model="formData.conName"
                  placeholder="请选择付款合同"
                  :readonly="isReadonly || !formData.projId"
                  v-model:model-value-id="formData.conId"
                  @pick="openMainConDialog"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="供应商名称" prop="supName">
                <el-input
                  v-model="formData.supName"
                  placeholder=" "
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同分类" prop="conTypeName">
                <el-input
                  v-model="formData.conTypeName"
                  placeholder=" "
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="签约合同金额" prop="signAmt">
                <el-input-number
                  v-model="formData.signAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="补充合同金额" prop="addAmt">
                <el-input-number
                  v-model="formData.addAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计变更签证" prop="sumChangeAmt">
                <el-input-number
                  v-model="formData.sumChangeAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="预结算合同金额" prop="preSettleAmt">
                <el-input-number
                  v-model="formData.preSettleAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="期初产值金额" prop="sumProdVal">
                <el-input-number
                  v-model="formData.sumProdVal"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="期初应付金额" prop="sumPayAmt">
                <el-input-number
                  v-model="formData.sumPayAmt"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="是否甲供材" prop="isSelfSupply">
                <el-select
                  v-model="formData.isSelfSupply"
                  placeholder="是否甲供材"
                  style="width: 100%"
                  disabled
                >
                  <el-option label="否" :value="false" />
                  <el-option label="是" :value="true" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="甲供材类型" prop="selfSupplyType">
                <el-select
                  v-model="formData.selfSupplyType"
                  placeholder=""
                  style="width: 100%"
                  :disabled="formData.isSelfSupply === false"
                >
                  <el-option label="甲供材-主材" :value="1" />
                  <el-option label="甲供材-零星" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- 产值信息 -->
        <FormCard
          id="card-prod"
          icon="📋"
          title="产值信息"
          v-model:collapsed="collapsedCards.prod"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="产值申报方式">
                <el-select
                  v-model="formData.payMethod"
                  placeholder="请选择"
                  style="width: 100%"
                  disabled
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
              <el-form-item label="产值期间" prop="prodValPeriod">
                <el-date-picker
                  v-model="formData.prodValPeriod"
                  type="month"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择归属月份"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="本次申报产值" prop="applyProdVal" required>
                <el-input-number
                  v-model="formData.applyProdVal"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="请输入申报产值"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="本次申报应付" prop="applyPayAmt" required>
                <el-input-number
                  v-model="formData.applyPayAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="请输入申报应付"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="本次成本复核产值" prop="costProdVal">
                <el-input-number
                  v-model="formData.costProdVal"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="成本复核产值"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="本次成本复核应付" prop="costPayAmt">
                <el-input-number
                  v-model="formData.costPayAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="成本复核应付"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="申报说明" prop="applyDesc">
                <el-input
                  v-model="formData.applyDesc"
                  type="textarea"
                  :rows="2"
                  maxlength="500"
                  show-word-limit
                  placeholder="请输入申报说明"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <!-- <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="申报附件">
                <base-upload
                  v-model:file-list="declaraFileList"
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
                  @success="declaraFileSuccess"
                />
              </el-form-item>
            </el-col> -->
          </el-row>
        </FormCard>

        <!-- 材料合同产值 -->
        <FormCard
          id="card-con"
          icon="📋"
          title="合同产值"
          v-model:collapsed="collapsedCards.con"
        >
          <!-- 非甲供材  产值申报方式：按进度确认 -> 显示非甲供材  -->
          <div class="detail-table" v-if="formData.payMethod == 1">
            <!-- <div class="header-content">
              <span class="header-title">产值明细（非甲供材）</span>
              <el-button
                type="primary"
                size="small"
                :disabled="isDetail || !!billData.status"
                @click="addNonSelfSupply"
              >
                新增明细
              </el-button>
            </div> -->
            <editable-table
              ref="nonSelfSupplyRef"
              :row-key="'uuid'"
              :height="'200px'"
              v-model="nonSelfSupplyTable"
              :columns="prodColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="true"
              :summary-method="nonSelfSupplySummary"
              :compactEmpty="true"
              :on-save="handleNonSelfSupplySave"
            >
              <template #edit-buildPeriod="{ row, update }">
                <el-date-picker
                  v-model="row.buildPeriod"
                  type="month"
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM"
                  size="small"
                  style="width: 100%"
                  :disabled="isReadonly || !!billData.status"
                  :disabled-date="disabledBuildPeriod"
                  @change="row.buildPeriod = toMonthEnd(row.buildPeriod); update(row.buildPeriod)"
                />
              </template>
              <template #edit-payDate="{ row, update }">
                <el-date-picker
                  v-model="row.payDate"
                  type="month"
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM"
                  size="small"
                  style="width: 100%"
                  :disabled="isReadonly || !!billData.status || row.isCtrl"
                  @change="row.payDate = toMonthEnd(row.payDate); update(row.payDate)"
                />
              </template>
              <template #actions="{ row }">
                <el-button
                  link
                  type="danger"
                  :disabled="isDetail || !!billData.status"
                  @click="deleteNonSelfSupply(row)"
                >
                  删除
                </el-button>
              </template>
            </editable-table>
          </div>

          <!-- 产值明细（甲供材-主材） -->
          <div
            class="detail-table"
            v-if="
              formData.payMethod == 2 &&
              formData.isSelfSupply == true &&
              formData.selfSupplyType == 1
            "
          >
            <div class="header-content">
              <span class="header-title">产值明细（甲供材-主材）</span>
              <div>
                <el-button
                  type="primary"
                  size="small"
                  :disabled="isDetail || !!billData.status"
                  @click="openMaterialDialog"
                >
                  新增明细
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  :disabled="isDetail || !!billData.status"
                  @click="clearMaterialTable"
                >
                  清空
                </el-button>
              </div>
            </div>
            <editable-table
              ref="materialRef"
              :row-key="'uuid'"
              :height="'400px'"
              v-model="materialTable"
              :columns="materialColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="true"
              :summary-method="materialSummary"
              :compactEmpty="true"
              :editable="!isDetail && !billData.status"
              :on-save="handleMaterialSave"
            >
              <template #edit-buildPeriod="{ row, update }">
                <el-date-picker
                  v-model="row.buildPeriod"
                  type="month"
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM"
                  size="small"
                  style="width: 100%"
                  :disabled="isReadonly || !!billData.status"
                  :disabled-date="disabledBuildPeriod"
                  @change="row.buildPeriod = toMonthEnd(row.buildPeriod); update(row.buildPeriod)"
                />
              </template>
              <template #edit-payDate="{ row, update }">
                <el-date-picker
                  v-model="row.payDate"
                  type="month"
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM"
                  size="small"
                  style="width: 100%"
                  :disabled="isReadonly || !!billData.status || row.hasVal"
                  @change="row.payDate = toMonthEnd(row.payDate); update(row.payDate)"
                />
              </template>
              <template #edit-payRate="{ row, update }">
                <span v-if="isReadonly || billData.status" class="pct-text">{{ formatPercent(row.payRate) }}</span>
                <div v-else class="pct-edit">
                  <el-input-number
                    v-model="row.payRate"
                    :controls="false"
                    :precision="2"
                    size="small"
                    style="width: 100%"
                    @change="update(row.payRate)"
                  />
                  <span class="pct-suffix">%</span>
                </div>
              </template>
              <template #actions="{ row }">
                <el-button
                  link
                  type="danger"
                  :disabled="isDetail || !!billData.status"
                  @click="deleteMaterial(row)"
                >
                  删除
                </el-button>
              </template>
            </editable-table>
          </div>

          <!-- 产值明细 - 甲供材-零星  -->
          <div
            class="detail-table"
            v-if="
              (formData.payMethod == 2 && formData.isSelfSupply === false) ||
              (formData.payMethod == 2 &&
                formData.isSelfSupply === true &&
                formData.selfSupplyType == 2)
            "
          >
            <div class="header-content">
              <span class="header-title">产值明细（甲供材-零星）</span>
              <div>
                <el-button
                  type="primary"
                  size="small"
                  :disabled="isDetail || !!billData.status"
                  @click="openMaterialDialog"
                >
                  新增明细
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  :disabled="isDetail || !!billData.status"
                  @click="clearMaterialTableMinor"
                >
                  清空
                </el-button>
              </div>
            </div>
            <editable-table
              ref="materialMinorRef"
              :row-key="'uuid'"
              :height="'400px'"
              v-model="materialMinorTable"
              :columns="materialMinorColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="true"
              :summary-method="materialMinorSummary"
              :compactEmpty="true"
              :editable="!isDetail && !billData.status"
              :on-save="handleMaterialMinorSave"
            >
              <template #edit-buildPeriod="{ row, update }">
                <el-date-picker
                  v-model="row.buildPeriod"
                  type="month"
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM"
                  size="small"
                  style="width: 100%"
                  :disabled="isReadonly || !!billData.status"
                  :disabled-date="disabledBuildPeriod"
                  @change="row.buildPeriod = toMonthEnd(row.buildPeriod); update(row.buildPeriod)"
                />
              </template>
              <template #edit-payDate="{ row, update }">
                <el-date-picker
                  v-model="row.payDate"
                  type="month"
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM"
                  size="small"
                  style="width: 100%"
                  :disabled="isReadonly || !!billData.status || row.hasVal"
                  @change="row.payDate = toMonthEnd(row.payDate); update(row.payDate)"
                />
              </template>
              <template #edit-payRate="{ row, update }">
                <span v-if="isReadonly || billData.status" class="pct-text">{{ formatPercent(row.payRate) }}</span>
                <div v-else class="pct-edit">
                  <el-input-number
                    v-model="row.payRate"
                    :controls="false"
                    :precision="2"
                    size="small"
                    style="width: 100%"
                    @change="update(row.payRate)"
                  />
                  <span class="pct-suffix">%</span>
                </div>
              </template>
              <!-- 接收明细附件列 - 自定义上传按钮 -->
              <!-- <template #annex="{ row }">
                <div class="annex-cell">
                  <el-link
                    v-if="row.annexId"
                    type="primary"
                    :underline="'hover'"
                    @click="handleViewAnnex(row)"
                  >
                    {{ row.annexName || row.annex || "查看附件" }}
                  </el-link>
                </div>
              </template> -->
              <template #actions="{ row }">
                <!-- <el-button
                  link
                  type="primary"
                  :disabled="isDetail || !!billData.status"
                  @click="openUploadForRow(row)"
                >
                  上传附件
                </el-button> -->
                <el-button
                  link
                  type="danger"
                  :disabled="isDetail || !!billData.status"
                  @click="deleteMaterialMinor(row)"
                >
                  删除
                </el-button>
              </template>
            </editable-table>
          </div>
        </FormCard>

        <!-- 本次申报后累计情况 -->
        <FormCard
          id="card-sum"
          icon="📋"
          title="累计产值"
          v-model:collapsed="collapsedCards.sum"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item
                label="期末产值(含本单)"
                prop="totalProdVal"
                required
              >
                <el-input-number
                  v-model="formData.totalProdVal"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="0"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="期末应付(含本单)" prop="totalPayVal">
                <el-input-number
                  v-model="formData.totalPayVal"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="0"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <!-- <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计未付(含本单)" prop="totalOwedVal">
                <el-input-number
                  v-model="formData.totalOwedVal"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="0"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col> -->
          </el-row>
        </FormCard>

        <!-- 相关附件 -->
        <FormCard
          id="card-annex"
          icon="📋"
          title="相关附件"
          v-model:collapsed="collapsedCards.annex"
        >
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
              @success="handleFileSuccess"
            />
          </el-form-item>
        </FormCard>
      </el-form>

      <!-- 成本分摊  合同产值只有甲供材才有成本分摊 -->
      <ConCostAllocCard style="margin-top: 15px;" :visible="!isAdd && formData.isSelfSupply" :cstMData="cstMData"
        :allocation-status="cstMData.allocStatus" :warning-status="cstMData.allocWarn" :bizType="'CON_QZ'"
        :projId="formData.projId" :projName="formData?.projName" :displayName="formData.conName"
        :allocAmt="formData.applyProdVal" :bizBillId="billData.id" />
    </div>

    <!-- 隐藏的上传组件 -->
    <Teleport to="body">
      <div style="display: none" @click.stop @mousedown.stop>
        <base-upload
          ref="annexUploadRef"
          key="minorAnnex"
          v-model:file-list="tempFileList"
          :limit="1"
          :maxSize="20"
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
    <!-- ============ 悬浮定位栏 ============ -->
    <FloatNav :items="visibleNavCards" />
  </div>
  <!-- ============ 选择主合同弹窗 ============ -->
  <choose-contract-dialog
    ref="contractDialogRef"
    v-model="mainConDialogVisible"
    :selectionMode="'single'"
    :projId="formData.projId"
    @select="handleMainConSelect"
  />
  <choose-material-val-dialog
    ref="materialDialogRef"
    v-model="mtDialogVisible"
    :selectionMode="'multiple'"
    :conNo="formData.conSysNo"
    :cgType="formData.selfSupplyType"
    :is-uesd="false"
    @select="handleMaterialSelect"
  />
</template>

<script setup lang="ts">
// ============================================================
// 1. 依赖与类型导入
// ============================================================
import { ref, computed, onMounted, watch, nextTick, useTemplateRef } from "vue";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { useTagsStore } from "@/stores/tags-store";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";
import BaseUpload from "@/components/base/base-upload.vue";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import BillHeader from "@/components/business/bill-components/bill-header.vue";
import BillInfo from "@/components/business/bill-components/bill-info.vue";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { ACCEPT_PAY_TYPE, PayTypeEnum, PROGRESS_PAY_TYPE } from "@/constants/contract-manage/enums";
import { buildFileUrl } from "@/utils/file-path-util";
import { cumulativeDataApi } from "@/api/cost/contract-manage/cumulative-data-api";
import { formType } from "@/types/form/form-types";
import { dateUtil } from "@/utils/date-util";
import { outputDeclarationApi } from "@/api/cost/contract-manage/output-declaration-api";
import ChooseMaterialValDialog from "./choose-martrial-val-dialog.vue";
import { createProdColumns, materialColumns, materialMinorColumns, NAV_CARDS } from "./output-value-config";
import { useFormLayout } from "@/composables/use-form-layout";
import FormCard from "@/components/base/base-form-card.vue";
import PickInput from "@/components/base/base-pick-input.vue";
import FloatNav from "@/components/base/base-float-nav.vue";
import { moneyRule, requiredInputRule, requiredRule } from "@/utils/form-rule-validate";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import ConCostAllocCard from "@/views/cost/cost-allocation/con-cost-alloc/con-cost-alloc-card.vue";

defineOptions({ name: "output-value-approval-form" });

// ============================================================
// 3. Props / Emits
// ============================================================
interface Props {
  mode?: "add" | "edit" | "detail";
  prodId?: number;
}
const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  prodId: undefined,
});
const emit = defineEmits<{
  (e: "success", data: any): void;
  (e: "cancel"): void;
}>();

// ============================================================
// 4. 全局实例（store / route / router）
// ============================================================
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const tagsStore = useTagsStore();
const conId = Number(route.query.conId); // 合同ID
const { collapsedCards, toggleCard, formatMoney } = useFormLayout(NAV_CARDS);

// ============================================================
// 5. 业务枚举与字典
// ============================================================
const { getDictList, loadDicts } = useDict([dictMapping.paymentType]);
const paymentTypeOptions = ref<any[]>([]);
const initDictData = async () => {
  await loadDicts();
  paymentTypeOptions.value = getDictList(dictMapping.paymentType);
};

// ============================================================
// 6. 基础状态与页面模式
// ============================================================
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const loadingForm = ref(false);

// 单据主体
const billData = ref({
  id: undefined,
  bizTitle: "",
  bizNo: "",
  status: 0,
  bizItemCode: formType.CON_PROD,
  flowId: null,
  createDate: null,
});
// 成本分摊明细数据
const cstMData = ref({
  id: undefined,
  projId: undefined,
  bizType: "",
  bizBillId: undefined,
  bizKeyId: 0,
  allocAmt: "",
  allocExclAmt: "",
  allocStatus: undefined,
  allocWarn: undefined,
  allocDs: [], // 分摊明细
});
const flowListData = ref<any>(null);
const flowBaseData = ref<any>(null);

// 页面模式
const mode = ref<"add" | "edit" | "detail">(props.mode);
const prodId = ref<number | undefined>(props.prodId);

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");
const isReadonly = computed(() => isDetail.value || !!billData.value.status);

// 产值申报方式派生（payMethod：1=按进度确认/非甲供材，2=甲供材）
const notMaterial = computed(() => formData.value.payMethod === 1); // 非甲供材
const mainMaterial = computed(() => formData.value.payMethod === 2 && formData.value.selfSupplyType === 1); // 甲供材-主材
const miscMaterial = computed(() => formData.value.payMethod === 2 && formData.value.selfSupplyType === 2); // 甲供材-零星
const visibleNavCards = computed(() => NAV_CARDS);

// 选项 / 附件
const projectOptions = ref([]);
const declaraFileList = ref([]);
const annexFileList = ref([]);

// 行附件上传
const annexUploadRef = useTemplateRef("annexUploadRef");
const tempFileList = ref([]);
const currentUploadRow = ref<any>(null);

// 表单初始值
const initFormData = () => ({
  // 单据信息
  id: undefined as number | undefined,
  bizTitle: "",
  segId: undefined,
  segName: "",
  segNo: "",
  projId: undefined,
  projName: "",
  compId: "",
  compName: "",
  conBillId: undefined as number | undefined,
  flowId: null,
  bizNo: "",
  userName: userStore.userInfo?.empName,
  createDate: dateUtil().format("YYYY-MM-DD"),
  deptName: userStore.userInfo?.deptName,
  mguName: userStore.userInfo?.mguName,

  // 合同信息
  conId: undefined,
  conName: "", // 合同名称
  conSysNo: "", // 合同编号
  conPhyNo: "", // 合同编号
  supId: undefined,
  supName: "", // 供应商名称
  conTypeId: undefined,
  status: 0,
  conTypeName: "", // 合同分类
  productionMajor: "", // 生产专业
  signAmt: 0, // 签约合同金额
  addAmt: 0, // 补充合同金额
  preSettleAmt: 0, // 预结算合同金额
  sumChangeAmt: 0, // 累计变更签证
  sumProdVal: 0, // 累计产值
  sumPayAmt: 0, // 累计应付
  sumAppyAmt: 0, // 累计请款
  sumPaidAmt: 0, // 累计实付
  sumOwedAmt: 0, // 累计欠款
  isSelfSupply: false, // 是否甲供材，0-否，1-是
  selfSupplyType: null, // 甲供材类型，1-主材，2-零星

  // 产值信息
  payMethod: undefined, // 产值确认方式
  applyProdVal: 0, // 本次申报产值
  applyPayAmt: 0, // 本次申报应付
  costProdVal: 0, // 本次成本复核产值
  costPayAmt: 0, // 本次成本复核应付
  applyDesc: "", // 申报说明
  prodValPeriod: dateUtil().format("YYYY-MM-DD"), // 产值月份

  // 本次申报后累计情况
  totalProdVal: 0, // 累计产值
  totalPayVal: 0, // 累计应付
  totalOwedVal: 0, // 累计未付
});
const formData = ref(initFormData());

// 表单校验规则
const formRules = computed(() => {
  const rules: Record<string, any> = {
    bizTitle: requiredInputRule("标题"),
    projId: requiredRule("项目名称"),
    conId: requiredRule("合同名称"),
    applyPayAmt: moneyRule("申请产值金额"),
  };
  return rules;
});

// ============================================================
// 7. 公共工具（日期 / 格式化 / 合计）
// ============================================================
/** 当前月份（当月月末最后一天 YYYY-MM-DD，与数据库 DATE 类型对齐） */
const currentMonth = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const last = 1;//new Date(y, m, 0).getDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
};

/** YYYY-MM / YYYY-MM-DD 加上 n 个月，返回 YYYY-MM-DD（月末最后一天，完整日期，存储用） */
const addMonths = (yyyymm: string, n: number): string => {
  if (!yyyymm) return "";
  const ym = yyyymm.slice(0, 7); // 兼容 YYYY-MM 与 YYYY-MM-DD
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + (n || 0), 1); // 先取进位后的年月
  const ny = d.getFullYear();
  const nm = d.getMonth() + 1;
  const last = 1;//new Date(ny, nm, 0).getDate(); // 该月月末最后一天
  return `${ny}-${String(nm).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
};

/** 将任意 YYYY-MM / YYYY-MM-DD 规整为该月月末最后一天 YYYY-MM-DD（手动选月后用） */
const toMonthEnd = (val: string): string => {
  if (!val) return "";
  const ym = val.slice(0, 7); // 兼容 YYYY-MM 与 YYYY-MM-DD
  const [y, m] = ym.split("-").map(Number);
  const last = 1;//new Date(y, m, 0).getDate(); // 0 号 = 上月最后一天 = 本月月末
  return `${y}-${String(m).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
};

/** 日期显示：YYYY-MM-DD / YYYY-MM -> YYYY-MM；空值返回 "--" */
const formatYM = (val: any): string => {
  if (val === undefined || val === null || val === "") return "--";
  return String(val).slice(0, 7);
};

/** 施工期间禁用：只能选择上月及以前（禁用当月及以后） */
const disabledBuildPeriod = (time: Date): boolean => {
  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return time.getTime() >= firstOfThisMonth.getTime();
};

/** 金额千分位（2 位小数） */
const fmtMoney = (n: number): string =>
  (Number(n) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** 百分比显示：80 -> 80% */
const formatPercent = (val: any): string => {
  if (val === undefined || val === null || val === "") return "--";
  return `${Number(val)}%`;
};

/** 通用合计方法：仅对指定金额字段求和 */
const summaryBuilder = (columns: any[], data: any[], amountProps: string[]): string[] =>
  columns.map((col: any, index: number) => {
    if (index === 0) return "合计";
    const p = col.property || col.prop;
    if (amountProps.includes(p)) {
      const total = data.reduce((s: number, r: any) => s + (Number(r[p]) || 0), 0);
      return fmtMoney(total);
    }
    return "";
  });

// ============================================================
// 8. 明细表 - 非甲供材（按进度确认）
// ============================================================
const nonSelfSupplyTable = ref([]);
const nonSelfSupplyRef = ref();
const billPayratesList = ref([]);

// 非甲供材明细中是否存在「进度款」行：存在时产值只能填在进度款行，验收款不得填产值
const hasProgressRow = computed(() => nonSelfSupplyTable.value.some((r) => r.payTypeId === PROGRESS_PAY_TYPE));

const prodColumns = createProdColumns({ paymentTypeOptions });

const nonSelfSupplySummary = (param: any) =>
  summaryBuilder(param.columns, param.data, ["prodVal", "payAmt", "costProdVal", "costPayAmt"]);

const addNonSelfSupply = () => {
  const newRow = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    payTypeId: undefined,
    payRate: undefined,
    isCtrl: false,
    payIntvl: 0,
    prodVal: 0,
    payAmt: 0,
    buildPeriod: "",
    prodValPeriod: currentMonth(),
    payDate: "",
    costProdVal: 0,
    costPayAmt: 0,
  };
  nonSelfSupplyTable.value = [...nonSelfSupplyTable.value, newRow];
};

const deleteNonSelfSupply = (row: any) => {
  nonSelfSupplyTable.value = nonSelfSupplyTable.value.filter((item) => item.uuid !== row.uuid);
};

const recomputeNonSelfSupply = (row: any, column: string) => {
  // 选择款项类型时回填应付比例、是否强控、支付周期
  if (column === "payTypeId") {
    const target = billPayratesList.value.find((i) => i.payTypeId === row.payTypeId);
    const { payRate, isCtrl, payIntvl } = target || {};
    row.payRate = payRate;
    row.isCtrl = isCtrl;
    row.payIntvl = payIntvl;
  }
  const prodVal = Number(row.prodVal) || 0;
  const payRate = Number(row.payRate) || 0;
  // 本次应付 = 本次产值 × 应付比例（强控时锁定，不强控也给默认值，仍可手改）
  if (["prodVal", "payRate", "payTypeId", "isCtrl"].includes(column)) {
    row.payAmt = Number(((prodVal * payRate) / 100).toFixed(2));
  }
  // 付款期间 = 产值期间 + 支付周期(月)
  const payIntvl = Number(row.payIntvl) || 0;
  if (
    (column === "prodValPeriod" || column === "payTypeId" || column === "payIntvl") &&
    row.prodValPeriod
  ) {
    row.payDate = addMonths(row.prodValPeriod, payIntvl);
  }
  // 进度款/验收款互斥承载产值：存在进度款时，验收款行的产值强制为 0
  if (hasProgressRow.value && row.payTypeId === ACCEPT_PAY_TYPE) {
    row.prodVal = 0;
  }
};

const handleNonSelfSupplySave = async (data: any) => {
  const { row, column } = data;
  recomputeNonSelfSupply(row, column);
};

// ============================================================
// 9. 明细表 - 甲供材-主材
// ============================================================
const materialTable = ref([]);
const materialRef = ref();

// materialColumns 由 ./output-value-config 统一维护
const materialSummary = (param: any) =>
  summaryBuilder(param.columns, param.data, ["prodVal", "fineAmt", "prodVal", "payAmt", "costProdVal", "costPayAmt"]);

const addMaterial = () => {
  const newRow = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    mtId: undefined,
    mtName: "",
    mtModel: "",
    mtBrand: "",
    recvNum: 0,
    mtUnit: "",
    recvBillNo: "",
    recvPrice: 0,
    fineAmt: 0,
    prodVal: 0,
    payRate: 0,
    payAmt: 0,
    buildPeriod: "",
    prodValPeriod: currentMonth(),
    payDate: "",
    costProdVal: 0,
    costPayAmt: 0,
  };
  materialTable.value = [...materialTable.value, newRow];
};

const deleteMaterial = (row: any) => {
  materialTable.value = materialTable.value.filter((item) => item.uuid !== row.uuid);
};

// ============================================================
// 10. 明细表 - 甲供材-零星
// ============================================================
const materialMinorTable = ref([]);
const materialMinorRef = ref();

// materialMinorColumns 由 ./output-value-config 统一维护
const materialMinorSummary = (param: any) =>
  summaryBuilder(param.columns, param.data, ["prodVal", "fineAmt", "prodVal", "payAmt", "costProdVal", "costPayAmt"]);

const addMaterialMinor = () => {
  const newRow = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    recvBillNo: "",
    mtName: "",
    prodVal: 0,
    fineAmt: 0,
    payRate: 0,
    payAmt: 0,
    buildPeriod: "",
    prodValPeriod: currentMonth(),
    payDate: "",
    costProdVal: 0,
    costPayAmt: 0,
    remark: "",
    annex: "",
    annexId: undefined,
    annexName: "",
  };
  materialMinorTable.value = [...materialMinorTable.value, newRow];
};

const deleteMaterialMinor = (row: any) => {
  materialMinorTable.value = materialMinorTable.value.filter((item) => item.uuid !== row.uuid);
};

// ---- 行附件上传（功能暂未启用，模板中已注释触发按钮） ----
const openUploadForRow = (row: any) => {
  if (isDetail.value || !!billData.value.status) return;
  currentUploadRow.value = row;
  tempFileList.value = [];
  nextTick(() => {
    annexUploadRef.value?.triggerFileSelect();
  });
};
const handleUploadSuccess = (file: any) => {
  tempFileList.value = [file];
  if (currentUploadRow.value) {
    const annexId = file.id;
    const annexName = file.annexName || file.name;
    const rowIndex = materialMinorTable.value.findIndex((item) => item.uuid === currentUploadRow.value.uuid);
    if (rowIndex !== -1) {
      const newData = [...materialMinorTable.value];
      newData[rowIndex] = { ...newData[rowIndex], annexId, annexName };
      materialMinorTable.value = newData;
    }
    currentUploadRow.value = null;
  }
};
const handleViewAnnex = async (row: any) => {
  if (!row.annexId) {
    ElMessage.warning("该附件不存在");
    return;
  }
  try {
    const res = await commonApi.getFileList({ annexId: row.annexId });
    if (res.code === 200 && res.data && res.data.length > 0) {
      const file = res.data[0];
      const fileUrl = file.annexPath;
      if (fileUrl) {
        window.open(buildFileUrl(fileUrl), "_blank");
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

// ============================================================
// 11. 弹窗（合同选择 / 材料收货选择）
// ============================================================
// ---- 主合同选择 ----
const mainConDialogVisible = ref(false);
const openMainConDialog = () => {
  if (isDetail.value) return;
  if (!formData.value.projId) {
    ElMessage.warning(`请先选择项目！`);
    return;
  }
  mainConDialogVisible.value = true;
};
const handleMainConSelect = async (data) => {
  if (data && data.length > 0) {
    const newData = data || [];
    if (formData.value.conId != newData[0].id) {
      await getConDetail(newData[0].id);
      await getConTotal(newData[0].id);
      // 查询并带回款项类型数据
      await getConPayTypeData(newData[0].id);
    }
  }
};

// ---- 材料收货选择 ----
const mtDialogVisible = ref(false);
const openMaterialDialog = () => {
  if (isDetail.value) return;
  if (!formData.value.projId) {
    ElMessage.warning(`请先选择项目！`);
    return;
  }
  mtDialogVisible.value = true;
};
const handleMaterialSelect = async (data) => {
  if (data && data.length > 0) {
    const list = data || [];
    if (formData.value.selfSupplyType === 1) {
      list.forEach((item) => {
        const exists = materialTable.value.some((recd) => recd.srcKeyId === item.keyid);
        if (!exists) {
          addMaterial();
          const dataIndex = materialTable.value.length - 1;
          materialTable.value[dataIndex].srcKeyId = item.keyid;
          materialTable.value[dataIndex].recvBillNo = item.requestmark;
          materialTable.value[dataIndex].mtName = item.mtName;
          materialTable.value[dataIndex].mtModel = item.mtGg;
          materialTable.value[dataIndex].mtBrand = item.mtPp;
          materialTable.value[dataIndex].mtCz = item.mtCz;
          materialTable.value[dataIndex].mtUnit = item.mtUnit;
          materialTable.value[dataIndex].recvNum = item.recvNum;
          materialTable.value[dataIndex].recvPrice = item.recvPrice;
          materialTable.value[dataIndex].recvProdAmt = item.recvVal;
          materialTable.value[dataIndex].fineAmt = item.dedAmt;
          materialTable.value[dataIndex].prodVal = Number(item.recvVal ?? 0) - Number(item.dedAmt ?? 0);
          materialTable.value[dataIndex].payRate = 100;
          materialTable.value[dataIndex].payAmt = Number(item.recvVal ?? 0) - Number(item.dedAmt ?? 0);
          materialTable.value[dataIndex].buildPeriod = item.recvDate;
          materialTable.value[dataIndex].payIntvl = 1;
          materialTable.value[dataIndex].payDate = addMonths(currentMonth(), 1);
          materialTable.value[dataIndex].srcOaRequestId = item.oaRequestId;
        }
      });
    } else {
      list.forEach((item) => {
        const exists = materialMinorTable.value.some((recd) => recd.srcKeyId === item.keyid);
        if (!exists) {
          addMaterialMinor();
          const dataIndex = materialMinorTable.value.length - 1;
          materialMinorTable.value[dataIndex].srcKeyId = item.keyid;
          materialMinorTable.value[dataIndex].recvBillNo = item.requestmark;
          materialMinorTable.value[dataIndex].mtName = item.mtTypeName;
          materialMinorTable.value[dataIndex].recvNum = item.recvNum;
          materialMinorTable.value[dataIndex].recvPrice = item.recvPrice;
          materialMinorTable.value[dataIndex].recvProdAmt = item.recvVal;
          materialMinorTable.value[dataIndex].fineAmt = item.dedAmt;
          materialMinorTable.value[dataIndex].prodVal = Number(item.recvVal ?? 0) - Number(item.dedAmt ?? 0);
          materialMinorTable.value[dataIndex].payRate = 100;
          materialMinorTable.value[dataIndex].payAmt = Number(item.recvVal ?? 0) - Number(item.dedAmt ?? 0);
          materialMinorTable.value[dataIndex].buildPeriod = item.recvDate;
          materialMinorTable.value[dataIndex].payIntvl = 1;
          materialMinorTable.value[dataIndex].payDate = addMonths(currentMonth(), 1);
          materialMinorTable.value[dataIndex].srcOaRequestId = item.oaRequestId;
        }
      });
    }
  }
};
const clearMaterialTable = async (data) => {
  materialTable.value = [];
};
const clearMaterialTableMinor = async (data) => {
  materialMinorTable.value = [];
};

// ============================================================
// 12. 主表字段联动（watch）
// ============================================================
// 三张明细表互斥显示（由 payMethod / 甲供材类型决定显示哪张），
// 主表只汇总「当前实际显示的那张表」，不把隐藏表的脏数据也算进来。
const activeDetailTable = computed(() => {
  const f = formData.value;
  if (f.payMethod == 1) return nonSelfSupplyTable.value; // 非甲供材
  if (f.payMethod == 2 && f.isSelfSupply === true && f.selfSupplyType == 1)
    return materialTable.value; // 甲供材-主材
  if (
    (f.payMethod == 2 && f.isSelfSupply === false) ||
    (f.payMethod == 2 && f.isSelfSupply === true && f.selfSupplyType == 2)
  )
    return materialMinorTable.value; // 甲供材-零星
  return [];
});

/** 主表本次申报产值 = 当前显示明细表的本次产值之和 */
const detailApplyProdVal = computed(() =>
  activeDetailTable.value.reduce((s: number, r: any) => s + (Number(r.prodVal) || 0), 0),
);

/** 主表本次申报应付 = 当前显示明细表的本次应付之和（甲供材用 payAmt，非甲供材用 applyPayAmt） */
const detailApplyPayAmt = computed(() =>
  activeDetailTable.value.reduce((s: number, r: any) => s + (Number(r.payAmt ?? r.applyPayAmt) || 0), 0),
);

watch(
  [
    detailApplyProdVal,
    detailApplyPayAmt,
    () => formData.value.costProdVal,
    () => formData.value.costPayAmt,
    () => formData.value.sumProdVal,
    () => formData.value.sumPayAmt,
  ],
  () => {
    const f = formData.value;
    f.applyProdVal = detailApplyProdVal.value;
    f.applyPayAmt = detailApplyPayAmt.value;
    // 含本单累计产值 = 累计产值 + 本次申报产值（有成本复核产值则用成本复核值）
    f.totalProdVal =
      (Number(f.sumProdVal) || 0) +
      ((Number(f.costProdVal) || 0) !== 0 ? Number(f.costProdVal) : detailApplyProdVal.value);
    // 含本单累计应付 = 累计应付 + 本次申报应付（有成本复核应付则用成本复核值）
    f.totalPayVal =
      (Number(f.sumPayAmt) || 0) +
      ((Number(f.costPayAmt) || 0) !== 0 ? Number(f.costPayAmt) : detailApplyPayAmt.value);
  },
  { immediate: true },
);

// 非甲供材：存在进度款行时，自动清空所有验收款行的产值/应付，保证「产值只由进度款承载」
watch(
  nonSelfSupplyTable,
  () => {
    if (!hasProgressRow.value) return;
    let changed = false;
    const next = nonSelfSupplyTable.value.map((r: any) => {
      if (r.payTypeId === ACCEPT_PAY_TYPE && (Number(r.prodVal) || 0) !== 0) {
        changed = true;
        return { ...r, prodVal: 0, payAmt: 0 };
      }
      return r;
    });
    if (changed) nonSelfSupplyTable.value = next;
  },
  { deep: true },
);

// 产值申报方式切换：非甲供材(payMethod=1)时强制 isSelfSupply=false，否则为甲供材
watch(
  notMaterial,
  () => {
    if (notMaterial.value === true) {
      formData.value.isSelfSupply = false;
    } else formData.value.isSelfSupply = true;
  },
  { immediate: true },
);

// ============================================================
// 13. 数据加载
// ============================================================
// 获取项目数据
const getProjectOptions = async () => {
  try {
    const res = await projectAreaApi.getSegMguProjList();
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};

// 生成业务流水号
const generateApplyNo = async () => {
  try {
    const res = await commonApi.getBillNo({ bizType: formType.CON_PROD });
    if (res.code === 200 && res.data) {
      billData.value.bizNo = res.data;
    }
  } catch (error) {
    console.error("生成请款单号失败:", error);
  }
};

// 选择项目：回填公司/片区信息并清空原合同
const changeProject = async (value: number) => {
  if (value) {
    const res = await projectAreaApi.getInfoByProjId({ id: value });
    if (res.code === 200 && res.data) {
      const { compName, compId, segId, segName, segNo } = res.data;
      formData.value.compId = compId || "";
      formData.value.compName = compName || "";
      formData.value.segId = segId || "";
      formData.value.segName = segName || "";
      formData.value.segNo = segNo || "";
      // 清空原合同相关信息
      clearContractInfo();
    }
  }
};

// 清空与合同相关的回填字段（切换项目时调用）
const clearContractInfo = () => {
  const f = formData.value;
  f.conId = null;
  f.conName = "";
  f.supId = null;
  f.supName = "";
  f.conTypeId = null;
  f.conTypeName = "";
  f.conSysNo = "";
  f.conPhyNo = "";
  f.signAmt = 0;
  f.addAmt = 0;
  f.sumChangeAmt = 0;
  f.preSettleAmt = 0;
  f.sumProdVal = 0;
  f.sumPayAmt = 0;
  f.sumAppyAmt = 0;
  f.sumPaidAmt = 0;
  f.sumOwedAmt = 0;
};

// 查询合同详情
const getConDetail = async (inputConId) => {
  if (!inputConId) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({ id: inputConId });
    if (res.code === 200 && res.data) {
      const { conMain, billPayrates } = res.data;
      if (formData.value.projId != conMain.projId) {
        await changeProject(conMain.projId);
        formData.value.projId = conMain.projId;
      }
      billPayratesList.value = billPayrates || []; // 产值明细（非甲供材）的款项类型
      formData.value.conId = conMain?.id;
      formData.value.conName = conMain?.conName || "";
      formData.value.conPhyNo = conMain?.conPhyNo || "";
      formData.value.conSysNo = conMain?.conSysNo || "";
      formData.value.supId = conMain?.supId || "";
      formData.value.supName = conMain?.supName || "";
      formData.value.conTypeId = conMain?.conTypeId || "";
      formData.value.conTypeName = conMain?.conTypeName || "";
      formData.value.signAmt = conMain?.signAmt || "";
      formData.value.payMethod = conMain?.payMethod || "";
    }
  } catch (error) {
    console.error("查询合同详情失败:", error);
  }
};

// 查询合同累计数据
const getConTotal = async (inputConId) => {
  if (!inputConId) return;
  try {
    // 0=产值,1=应付,2=请款,3=已付,4=欠款,5=扣款,6=已扣,7=变更,8=签证，10=补充合同
    formData.value.sumProdVal = 0;
    formData.value.sumPayAmt = 0;
    formData.value.sumChangeAmt = 0;
    formData.value.addAmt = 0;
    const res = await cumulativeDataApi.getAccumData({
      conId: inputConId,
      typeList: [0, 1,  7, 8, 10],
    });
    if (res.code === 200 && res.data) {
      const list = res.data || [];
      list.forEach((item) => {
        const total = item.archAmt + item.inTransAmt; // 归档 + 在途
        switch (item.type) {
          case 0: // 产值
            formData.value.sumProdVal += total;
            break;
          case 1: // 应付
            formData.value.sumPayAmt += total;
            break;
          case 7: // 变更
            formData.value.sumChangeAmt += total;
            break;
          case 8: // 签证
            formData.value.sumChangeAmt += total;
            break;
          case 10: // 补充合同
            formData.value.addAmt += total;
            break;
          default:
            break;
        }
      });
    }
  } catch (error) {
    console.error("查询合同累计数据失败:", error);
  }

  // 取预结算金额
  try {
    const res = await cumulativeDataApi.getSettleData({
      conId: conId,
      typeList: [0,1],
    });

    if (res.code !== 200 || !res.data) {
      console.warn("获取合同结算信息失败:", res.message);
      return;
    } 

    const stMap = new Map();
    res.data.forEach((item) => {
      stMap.set(item.type, item.archivedAmt || 0);
    });

    const [preSettleAmt,settledAmt] = [0,1].map((type) => stMap.get(type) || 0);

    if ((settledAmt || 0) > 0) 
      formData.value.preSettleAmt = settledAmt;
    else formData.value.preSettleAmt = preSettleAmt;
  } catch (error) {
    console.error("获取合同结算信息失败:", error);
  }
};

// 查询合同款项类型数据，自动新增非甲供材明细行
const getConPayTypeData = async (inputConId) => {
  if (!inputConId) return;
  try {
    const res = await contractLedgerApi.getContractPayRateList({ conId: inputConId });
    if (res.code === 200 && res.data) {
      nonSelfSupplyTable.value = [];
      const hasItem = res.data.some((item) => item.payTypeId === PROGRESS_PAY_TYPE);
      res.data.forEach((item) => {
        if (item.payTypeId === PROGRESS_PAY_TYPE || item.payTypeId === ACCEPT_PAY_TYPE) {
          // 2062-进度 2063-验收
          addNonSelfSupply();
          const lastIndex = nonSelfSupplyTable.value.length - 1;
          nonSelfSupplyTable.value[lastIndex].payTypeId = item.payTypeId;
          nonSelfSupplyTable.value[lastIndex].payRate = item.payRate;
          nonSelfSupplyTable.value[lastIndex].isCtrl = item.isCtrl;
          nonSelfSupplyTable.value[lastIndex].payIntvl = item.payIntvl;
          nonSelfSupplyTable.value[lastIndex].payDate = addMonths(currentMonth(), item.payIntvl);
          if (item.payTypeId === PROGRESS_PAY_TYPE) {
            nonSelfSupplyTable.value[lastIndex].hasVal = true;
          } else if (item.payTypeId === ACCEPT_PAY_TYPE && !hasItem) {
            nonSelfSupplyTable.value[lastIndex].hasVal = true;
          }
        }
      });
    }
  } catch (error) {
    console.error("加载合同支付比例信息失败:", error);
  }
};

const getContractYskAmt = async (inputConId) => {
  if (!inputConId) return;
  try {
    // 1-应收款最大可填金额
    const res = await contractLedgerApi.getContractYskAmt({
      conId: inputConId,
      typeList: [0, 1],
    });
    let yskAmt = 0;
    let yskTotalAmt = 0;
    for (const item of res.data) {
      if (item.type === 1) {
        yskTotalAmt = item.amount ?? 0;
      } else if (item.type === 0) {
        yskAmt = item.amount ?? 0;
      }
    }
    return (yskTotalAmt ?? 0) - (yskAmt ?? 0);
  } catch (error) {
    console.error("查询合同验收数据失败:", error);
  }
};

// 加载产值申报详情
const loadDetail = async () => {
  if (!prodId.value) return;
  const res = await outputDeclarationApi.getProdValById({ id: prodId.value, isWithFlow: true });
  if (res.code === 200 && res.data) {
    const { flowList, flowBase, bill, prodVal, billPayrates, billMaterials, annexList,cstM } = res.data;
    billData.value = { ...billData.value, ...bill };
    flowListData.value = { ...flowListData.value, ...flowList };
    flowBaseData.value = { ...flowBaseData.value, ...flowBase };
    cstMData.value = { ...cstMData.value, ...cstM };

    formData.value.projId = flowBase.projId;
    formData.value.projName = flowBase.projName;
    await changeProject(formData.value.projId);
    formData.value.conBillId = prodVal.conBillId;
    formData.value.flowId = billData.value.flowId;
    formData.value.segId = flowBaseData.value.segId;
    formData.value.segNo = flowBaseData.value.segNo;
    formData.value.segName = flowBaseData.value.segName;
    formData.value.deptName = flowBaseData.value.deptName;
    formData.value.mguName = flowBaseData.value.mguName;
    formData.value.compId = flowBaseData.value.compId;
    formData.value.compName = flowBaseData.value.compName;
    formData.value.userName = flowBaseData.value.userName || "";
    formData.value.createDate = billData.value.createDate || "";
    formData.value.bizNo = billData.value.bizNo || "";
    formData.value.bizTitle = billData.value.bizTitle || "";

    formData.value.id = prodVal.id;
    formData.value.conId = bill.conId;
    formData.value.conName = prodVal.conName;
    formData.value.supId = prodVal.supId;
    formData.value.supName = prodVal.supName;
    formData.value.conTypeId = prodVal.conTypeId;
    formData.value.conTypeName = prodVal.conTypeName;
    formData.value.payMethod = prodVal.payMethod;

    formData.value.signAmt = prodVal.signAmt;
    formData.value.addAmt = prodVal.addAmt;
    formData.value.sumChangeAmt = prodVal.sumChangeAmt;
    formData.value.preSettleAmt = prodVal.preSettleAmt;

    formData.value.sumProdVal = prodVal.sumProdVal;
    formData.value.sumPayAmt = prodVal.sumPayAmt;
    formData.value.sumOwedAmt = prodVal.sumOwedAmt;
    formData.value.status = prodVal.status;

    formData.value.applyProdVal = prodVal.applyProdVal;
    formData.value.applyPayAmt = prodVal.applyPayAmt;
    formData.value.applyDesc = prodVal.applyDesc;
    formData.value.costProdVal = prodVal.costProdVal;
    formData.value.costPayAmt = prodVal.costPayAmt;
    formData.value.totalProdVal = prodVal.totalProdVal;
    formData.value.totalPayVal = prodVal.totalPayVal;
    formData.value.isSelfSupply = prodVal.isMaterial;
    formData.value.selfSupplyType = prodVal.materialType;

    nonSelfSupplyTable.value = billPayrates?.map((item) => ({ ...item, uuid: uuidv4() })) || [];
    if (formData.value.payMethod == 2 && formData.value.isSelfSupply === true && formData.value.selfSupplyType == 1) {
      materialTable.value = billMaterials?.map((item) => ({ ...item, uuid: uuidv4() })) || [];
    } else {
      materialMinorTable.value = billMaterials?.map((item) => ({ ...item, uuid: uuidv4() })) || [];
    }

    if (annexList && annexList.length > 0) {
      annexFileList.value = annexList.map((item: any) => ({
        ...item,
        name: item.annexName,
        url: item.annexPath,
      }));
    }
  }
};

// 初始化（新增/编辑/详情）
const initData = async () => {
  loadingForm.value = true;
  try {
    await getProjectOptions(); // 获取项目数据
    await initDictData();
    if (isAdd.value) {
      await generateApplyNo();
      await getConDetail(conId); // 查询合同详情
      await getConTotal(conId); // 查询合同累计数据
      await getConPayTypeData(conId); // 查询合同款项类型并自动新增明细行
    } else if (prodId.value) {
      await loadDetail();
      if (isEdit.value) formData.value.prodValPeriod = dateUtil().format("YYYY-MM-DD");
    }
  } finally {
    loadingForm.value = false;
  }
};

// ============================================================
// 14. 校验
// ============================================================
// 提交前校验明细表
const validateProdTables = async () => {
  const f = formData.value;

  if (f.payMethod == 1) {
    const rows = nonSelfSupplyTable.value || [];
    if (rows.length === 0) {
      ElMessage.error("请先添加产值明细！");
      return false;
    }
    // 通用：每行必须有款项类型
    for (const row of rows) {
      if (!row.payTypeId) {
        ElMessage.error("请选择款项类型！");
        return false;
      }
    }

    const progressRows = rows.filter((r) => r.payTypeId === PROGRESS_PAY_TYPE);
    const acceptRows = rows.filter((r) => r.payTypeId === ACCEPT_PAY_TYPE);

    let appYskAmt = 0;
    let yskRate = 0;
    if (progressRows.length > 0) {
      // 存在进度款：产值只能填在进度款行，验收款不得有产值
      for (const row of acceptRows) {
        if ((Number(row.prodVal) || 0) !== 0) {
          ElMessage.error("已存在进度款，验收款不得填写产值金额！");
          return false;
        }
      }
      for (const row of progressRows) {
        if (
          (!row.buildPeriod || !row.prodValPeriod || !row.payDate) &&
          ((row.prodVal ?? 0) !== 0 || (row.payAmt ?? 0) !== 0)
        ) {
          ElMessage.error("进度款行的施工期间、产值期间、计划付款期间均不能为空！");
          return false;
        }
        if (row.payDate < row.prodValPeriod && ((row.prodVal ?? 0) !== 0 || (row.payAmt ?? 0) !== 0)) {
          ElMessage.error("计划付款期间不能早于产值期间！");
          return false;
        }
        if (row.buildPeriod > row.prodValPeriod && ((row.prodVal ?? 0) !== 0 || (row.payAmt ?? 0) !== 0)) {
          ElMessage.error("产值期间不能早于施工期间！");
          return false;
        }
      }
    }

    if (acceptRows.length > 0) {
      // 无进度款：产值必须填在验收款行
      // if (acceptRows.length === 0 && progressRows.length === 0) {
      //   ElMessage.error("无进度款时，必须存在验收款明细并填写产值！");
      //   return false;
      // }
      for (const row of acceptRows) {
        if (
          (!row.buildPeriod || !row.prodValPeriod || !row.payDate) &&
          ((row.prodVal ?? 0) !== 0 || (row.payAmt ?? 0) !== 0)
        ) {
          ElMessage.error("验收款行的施工期间、产值期间、计划付款期间均不能为空！");
          return false;
        }
        if (row.payDate < row.prodValPeriod && ((row.prodVal ?? 0) !== 0 || (row.payAmt ?? 0) !== 0)) {
          ElMessage.error("计划付款期间不能早于产值期间！");
          return false;
        }
        if (row.buildPeriod > row.prodValPeriod && ((row.prodVal ?? 0) !== 0 || (row.payAmt ?? 0) !== 0)) {
          ElMessage.error("产值期间不能早于施工期间！");
          return false;
        }
        yskRate = row.payRate;
        appYskAmt = appYskAmt + row.payAmt;
      }

      if (progressRows.length > 0) {
        const yskAmt = await getContractYskAmt(formData.value.conId);

        const safeYskAmt = Number(yskAmt ?? 0);
        const safeApplyProdVal = Number(formData.value.applyProdVal ?? 0);
        const safeYskRate = Number(yskRate ?? 0);
        const safeAppYskAmt = Number(appYskAmt ?? 0);

        const yskOverAmt = safeYskAmt + (safeApplyProdVal * safeYskRate) / 100 - safeAppYskAmt;
        const yskCanAmt = safeYskAmt + (safeApplyProdVal * safeYskRate) / 100;
        if (yskOverAmt < 0) {
          ElMessage.error("验收款申报应付金额超产值！请大可申报验收款应付额度：" + yskCanAmt + "元。");
          return false;
        }
      }
    }
  } else if (f.payMethod == 2) {
    const matRows = activeDetailTable.value;
    if (!matRows || matRows.length === 0) {
      ElMessage.error("请先添加产值明细！");
      return false;
    }
    for (const row of matRows) {
      if ((Number(row.prodVal) || 0) === 0) {
        ElMessage.error("产值明细表中，本次申报产值金额不能为0！");
        return false;
      }
      if ((Number(row.payAmt) || 0) === 0) {
        ElMessage.error("产值明细表中，应付金额不能为0！");
        return false;
      }
      if ((Number(row.prodVal) || 0) > (Number(row.recvProdAmt) || 0)) {
        ElMessage.error("产值明细表中，本次申报产值不能大于接收产值！");
        return false;
      }
      if (!row.buildPeriod || !row.prodValPeriod || !row.payDate) {
        ElMessage.error("进产值明细表中，施工期间、产值期间、计划付款期间均不能为空！");
        return false;
      }
      if (row.payDate < row.prodValPeriod) {
        ElMessage.error("产值明细表中，计划付款期间不能早于产值期间！");
        return false;
      }
      if (row.buildPeriod > row.prodValPeriod) {
        ElMessage.error("产值明细表中，产值期间不能早于施工期间！");
        return false;
      }
    }
  }
  return true;
};

// 校验失败后：滚动到第一个错误项并聚焦对应控件
const focusFirstError = (invalidFields?: Record<string, any>) => {
  const firstProp = Object.keys(invalidFields ?? {})[0];
  if (!firstProp) return;
  const formInst = formRef.value as any;
  const field = formInst?.fields?.find((f: any) => f.prop === firstProp);
  const el = field?.$el as HTMLElement | undefined;
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  nextTick(() => {
    const focusable = el.querySelector<HTMLElement>(
      'input:not([type="hidden"]), textarea, .el-select__wrapper, .el-date-editor input, [tabindex]',
    );
    focusable?.focus({ preventScroll: true });
  });
};

// ============================================================
// 15. 提交 / 保存 / 删除 / 作废
// ============================================================
// 构建提交参数
const buildSubmitParams = () => {
  return {
    bill: {
      ...billData.value,
      id: billData.value.id || undefined,
      bizTitle: formData.value.bizTitle,
      bizItemCode: formType.CON_PROD,
      segId: formData.value.segId,
      segName: formData.value.segName,
      segNo: formData.value.segNo,
      projId: formData.value.projId,
      compId: formData.value.compId,
      compName: formData.value.compName,
      flowId: formData.value.flowId,
      conId: formData.value.conId,
      bizNo: billData.value.bizNo,
    },
    prodVal: {
      id: formData.value.id,
      conBillId: formData.value.conBillId,
      conId: formData.value.conId,
      status: formData.value.status,
      signAmt: formData.value.signAmt ?? "",
      addAmt: formData.value.addAmt ?? "",
      sumChangeAmt: formData.value.sumChangeAmt ?? "",
      preSettleAmt: formData.value.preSettleAmt ?? "",
      sumProdVal: formData.value.sumProdVal ?? "",
      sumPayAmt: formData.value.sumPayAmt ?? "",
      sumAppyAmt: formData.value.sumAppyAmt ?? "",
      sumPaidAmt: formData.value.sumPaidAmt ?? "",
      sumOwedAmt: formData.value.sumOwedAmt ?? "",
      conTypeId: formData.value.conTypeId ?? 0,
      payMethod: formData.value.payMethod ?? "",
      applyProdVal: formData.value.applyProdVal ?? "",
      applyPayAmt: formData.value.applyPayAmt ?? "",
      applyDesc: formData.value.applyDesc ?? "",
      costProdVal: formData.value.costProdVal ?? "",
      costPayAmt: formData.value.costPayAmt ?? "",
      totalProdVal: formData.value.totalProdVal ?? "",
      totalPayVal: formData.value.totalPayVal ?? "",
      isMaterial: formData.value.isSelfSupply,
      materialType: formData.value.selfSupplyType,
      prodValPeriod:formData.value.prodValPeriod,
    },
    billPayrates: formData.value.payMethod === 1 ? nonSelfSupplyTable.value : [],
    billMaterials:
      formData.value.payMethod == 2 && formData.value.isSelfSupply === true && formData.value.selfSupplyType == 1
        ? materialTable.value
        : materialMinorTable.value,
    annexList: annexFileList.value || [],
  };
};

// 同步产值期间到当前明细表
const syncProdValPeriod = async () => {
  if (notMaterial.value === true) {
    nonSelfSupplyTable.value.forEach((item) => {
      item.prodValPeriod = formData.value.prodValPeriod;
    });
  } else if (mainMaterial.value === true) {
    materialTable.value.forEach((item) => {
      item.prodValPeriod = formData.value.prodValPeriod;
    });
  } else if (miscMaterial.value === true) {
    materialMinorTable.value.forEach((item) => {
      item.prodValPeriod = formData.value.prodValPeriod;
    });
  }
};

// 返回
const goBack = () => {
  if (isAdd.value) {
    tagsStore.closeTagByPath("/con/output-declaration/add");
  }
  if (isEdit.value) {
    tagsStore.closeTagByPath("/con/output-declaration/edit");
  }
  router.go(-1);
};

// 保存
const handleSave = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;
  try {
    await formRef.value.validateField(["bizTitle", "projId", "conId"]);
    submitLoading.value = true;
    await syncProdValPeriod();
    const params = buildSubmitParams();
    const res = await outputDeclarationApi.saveProdVal(params);
    if (res.code === 200 && res.data) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      ElMessage.success("保存成功");
      emit("success", formData);
      formData.value.id = res.data;
      prodId.value = formData.value.id;
      await loadDetail();
    }
  } catch (error) {
    focusFirstError(error as Record<string, any>);
    console.error("保存失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

// 提交
const handleSubmit = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    if (formData.value.isSelfSupply === true && (formData.value.selfSupplyType === null || !formData.value.selfSupplyType)) {
      ElMessage.error("请选择甲供材类型！");
      return false;
    }
    if ((formData.value.applyProdVal ?? 0) === 0 && (formData.value.applyPayAmt ?? 0) === 0) {
      ElMessage.error("未填写产值或应付，请核对后提交！");
      return false;
    }

    await getConTotal(formData.value.conId);
    const isSuc = await validateProdTables();
    if (isSuc === false) {
      return false;
    }

    let ctrlAmt = 0;
    if (formData.value.preSettleAmt > 0) {
      ctrlAmt = formData.value.preSettleAmt;
    } else {
      ctrlAmt = (formData.value.signAmt || 0) + (formData.value.addAmt || 0);
    }
    if (ctrlAmt < formData.value.totalProdVal) {
      ElMessage.error("期末累计产值金额已超合同金额！不可提交！");
      return false;
    } 
    if (ctrlAmt < formData.value.totalPayVal) {
      ElMessage.error("期末累计应付金额已超合同金额！不可提交！");
      return false;
    }

    submitLoading.value = true;
    await syncProdValPeriod();
    const params = buildSubmitParams();
    const res = await outputDeclarationApi.submitProdVal(params);
    if (res.code === 200) {
      ElMessage.success("提交成功，已发起审批！");
      const redirectRes = await commonApi.generateRedirectUrl({ oaRequestId: res.data });
      goBack();
      if (redirectRes.code === 200 && redirectRes.data) {
        setTimeout(() => {
          window.open(redirectRes.data, "_blank");
        }, 800);
      }
    }
    emit("success", formData);
  } catch (error) {
    focusFirstError(error as Record<string, any>);
    console.error("提交失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

const handleDelete = () => {
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await outputDeclarationApi.delProdVal({ id: formData.value.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        goBack();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  });
};

const handleCancel = () => {
  ElMessageBox.confirm("确定要作废吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await outputDeclarationApi.voidProdVal({ id: formData.value.id });
      if (res.code === 200) {
        ElMessage.success("作废成功");
        goBack();
      }
    } catch (error) {
      console.error("作废失败:", error);
    }
  });
};

const handleViewProcess = async () => {
  if (flowListData.value && flowListData.value?.wfFlowId) {
    try {
      const redirectRes = await commonApi.generateRedirectUrl({ oaRequestId: flowListData.value.wfFlowId });
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

// ============================================================
// 16. 附件上传回调
// ============================================================
const declaraFileSuccess = (file: any) => {
  declaraFileList.value.push(file);
};
const handleFileSuccess = (file: any) => {
  annexFileList.value.push(file);
};

// ============================================================
// 17. 甲供材两张表：本次应付 = 本次产值 × 应付比例（可手改）
// ============================================================
const recomputeMaterialPayAmt = (row: any, column: string) => {
  if (column === "prodVal" || column === "payRate") {
    const v = Number(row.prodVal) || 0;
    const r = Number(row.payRate) || 0;
    row.payAmt = Number(((v * r) / 100).toFixed(2));
  }
};
const handleMaterialSave = async (data: any) => {
  const { row, column } = data;
  recomputeMaterialPayAmt(row, column);
};
const handleMaterialMinorSave = async (data: any) => {
  const { row, column } = data;
  recomputeMaterialPayAmt(row, column);
};

// ============================================================
// 18. 挂载
// ============================================================
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

.detail-table {
  .header-content {
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;

    .header-title {
      font-size: 14px;
      color: #4e5969;
      font-weight: 500;
    }
  }
}

.annex-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;

  .el-link {
    font-size: 12px;
  }

  .el-button {
    font-size: 12px;
    padding: 0 4px;
  }
}

.pct-edit {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;

  .el-input-number {
    flex: 1;
  }

  .pct-suffix {
    color: var(--el-text-color-regular);
    font-size: 12px;
    white-space: nowrap;
  }
}

.pct-text {
  font-size: 12px;
}
</style>
