<!-- 付款申请 表单（界面风格对齐变更申请/补充合同审批：BillHeader + FormCard + FloatNav，逻辑不变） -->
<template>
  <div class="payment-application-form">
    <!-- ============ 顶部操作栏 ============ -->
    <BillHeader
      :title="'付款申请'"
      :contract-no="formData.bizNo || ''"
      :submitter="formData.userName || ''"
      :submit-time="formData.createDate || ''"
      :status="billData.status || 0"
      :show-status="true"
      :button-loading="submitLoading"
      :save-disabled="isReadonly"
      :submit-disabled="isReadonly"
      :delete-disabled="isDetail || isAdd || !!billData.status"
      :void-disabled="isDetail || isAdd || !!billData.status"
      :view-disabled="isAdd"
      @save="handleFormDataSave"
      @submit="handleFormDataSubmit"
      @delete="handleDelete"
      @void="handleCancel"
      @viewFlow="handleViewProcess"
    />

    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :disabled="isReadonly"
        :validate-on-rule-change="false"
        label-width="134px"
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

        <!-- ====== 卡片：基本信息 ====== -->
        <FormCard
          id="card-base"
          icon="📋"
          title="基本信息"
          v-model:collapsed="collapsedCards.base"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="合同名称" prop="conId" required>
                <PickInput
                  v-model="formData.conName"
                  placeholder="请选择主合同"
                  :readonly="isReadonly"
                  v-model:model-value-id="formData.conId"
                  @pick="openMainConDialog"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="单位名称" prop="supName">
                <el-input
                  v-model="formData.supName"
                  placeholder="单位名称"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同分类" prop="conTypeName" required>
                <el-input
                  v-model="formData.conTypeName"
                  placeholder="合同分类"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同签约金额" prop="signAmt">
                <el-input-number
                  v-model="formData.signAmt"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="补充合同金额" prop="addAmt" required>
                <el-input-number
                  v-model="formData.addAmt"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计变更签证" prop="sumChangeAmt" required>
                <el-input-number
                  v-model="formData.sumChangeAmt"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="预结算合同金额" prop="preSettleAmt" required>
                <el-input-number
                  v-model="formData.preSettleAmt"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计产值" prop="sumProdVal" required>
                <el-input-number
                  v-model="formData.sumProdVal"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计应付" prop="sumPayAmt" required>
                <el-input-number
                  v-model="formData.sumPayAmt"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计请款" prop="sumAppyAmt" required>
                <el-input-number
                  v-model="formData.sumAppyAmt"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计实付" prop="sumPaidAmt" required>
                <el-input-number
                  v-model="formData.sumPaidAmt"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计欠款" prop="sumOwedAmt" required>
                <el-input-number
                  v-model="formData.sumOwedAmt"
                  disabled
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="应付占产值比" prop="payOutRate">
                <el-input-number
                  v-model="formData.payOutRate"
                  disabled
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="实付占应付比" prop="paidPayRate">
                <el-input-number
                  v-model="formData.paidPayRate"
                  disabled
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="实付占产值比" prop="paidOutRate">
                <el-input-number
                  v-model="formData.paidOutRate"
                  disabled
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- ====== 卡片：付款申请信息 ====== -->
        <FormCard
          id="card-pay"
          icon="📄"
          title="付款申请信息"
          v-model:collapsed="collapsedCards.pay"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="款项类型" prop="payTypeId" required>
                <el-select
                  v-model="formData.payTypeId"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in paymentTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="付款类型" prop="reqType" required>
                <el-select
                  v-model="formData.reqType"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="请款" :value="0" />
                  <el-option label="来票冲账" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="付款规则" prop="payRule" required>
                <el-select
                  v-model="formData.payRule"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="正常请款" :value="0" />
                  <el-option label="来票冲账" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="归属月份" prop="belongMonth" required>
                <el-date-picker
                  v-model="formData.belongMonth"
                  type="month"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择归属月份"
                  :disabled="isDetail || !!billData.status"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="剩余应付金额" prop="leavePayAmt">
                <el-input-number
                  v-model="formData.leavePayAmt"
                  disabled
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="请款总金额" prop="reqAmt" required>
                <el-input-number
                  v-model="formData.reqAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="是否最后一笔支付" prop="isLastPay" v-if="showLastPay" required>
                <el-select
                  v-model="formData.isLastPay"
                  :disabled="isDetail"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="是" :value="true" />
                  <el-option label="否" :value="false" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="转履约保证金" prop="pbAmount">
                <el-input-number
                  v-model="formData.pbAmount"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="奖罚总金额(扣款)" prop="changeAmt">
                <el-input-number
                  v-model="formData.changeAmt"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="实际请款金额" prop="factReqAmt">
                <el-input-number
                  v-model="formData.factReqAmt"
                  disabled
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="请款说明" prop="reqDesc">
                <el-input
                  v-model="formData.reqDesc"
                  type="textarea"
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  placeholder="请输入"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- ====== 卡片：发票信息 ====== -->
        <FormCard
          id="card-invoice"
          icon="🧾"
          title="发票信息"
          v-model:collapsed="collapsedCards.invoice"
        >
          <!-- <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="应收发票金额" prop="invRecAmt">
                <el-input-number
                  v-model="formData.invRecAmt"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="已收发票" prop="invRcvdAmt">
                <el-input-number
                  v-model="formData.invRcvdAmt"
                  disabled
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="欠票金额" prop="invOweAmt">
                <el-input-number
                  v-model="formData.invOweAmt"
                  disabled
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row> -->
          <SummaryBar :items="summaryItems" />

          <template v-if="isDetail || !!billData.status">
            <base-table
              ref="invoiceMTableRef"
              :columns="invoiceMDetailColumns"
              :table-data="invoiceMTable"
              :row-key="'uuid'"
              :pagination="false"
              :show-toolbar="false"
              :show-action-bar="false"
              :height="'200px'"
            >
              <template #annexName="{ row }">
                <div class="annex-cell">
                  <el-link
                    v-if="row.annexId"
                    type="primary"
                    :underline="'hover'"
                    @click="handleViewAnnex(row)"
                  >
                    {{ row.annexName || "查看附件" }}
                  </el-link>
                </div>
              </template>
              <template #actions="{ row }">
                <div class="actions-btn">
                  <el-button
                    link
                    type="primary"
                    :disabled="!(row.annexId && row.invoiceDs?.length)"
                    @click="detailInvoiceM(row)"
                  >
                    发票明细
                  </el-button>
                </div>
              </template>
            </base-table>
          </template>
          <template v-else>
            <editable-table
              ref="invoiceMTableRef"
              :row-key="'uuid'"
              :height="'200px'"
              v-model="invoiceMTable"
              :columns="invoiceMColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :editable="true"
            >
              <template #actionBar>
                <div class="actionBar-buttons">
                  <el-button
                    type="primary"
                    size="small"
                    @click="handleUploadInvoice"
                  >
                    上传发票
                  </el-button>
                </div>
              </template>

              <template #annexName="{ row }">
                <div class="annex-cell">
                  <el-link
                    v-if="row.annexId"
                    type="primary"
                    :underline="'hover'"
                    @click="handleViewAnnex(row)"
                  >
                    {{ row.annexName || "查看附件" }}
                  </el-link>
                </div>
              </template>

              <template #actions="{ row }">
                <div class="actions-btn">
                  <el-button
                    link
                    type="primary"
                    :disabled="!row.annexId"
                    @click="handleInspect(row)"
                  >
                    查验
                  </el-button>
                  <el-button
                    link
                    type="primary"
                    :disabled="!(row.annexId && row.invoiceDs?.length)"
                    @click="detailInvoiceM(row)"
                  >
                    发票明细
                  </el-button>
                  <el-button link type="danger" @click="deleteInvoiceM(row)">
                    删除
                  </el-button>
                </div>
              </template>
            </editable-table>
          </template>
        </FormCard>

        <!-- ====== 卡片：收款账号信息 ====== -->
        <FormCard
          id="card-account"
          icon="🏦"
          title="收款账号信息"
          v-model:collapsed="collapsedCards.account"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="修改收款账号" prop="isModifyAcc" required>
                <el-select
                  v-model="formData.isModifyAcc"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="否" :value="0" />
                  <el-option label="是" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="收款开户行" prop="bankName">
                <el-input v-model="formData.bankName" placeholder="请输入" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="收款账户名" prop="accountName">
                <el-input v-model="formData.accountName" placeholder="请输入" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="收款账号" prop="bankAccount">
                <el-input v-model="formData.bankAccount" placeholder="请输入" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="修改凭证附件" prop="modifyAccAnnex">
                <el-input v-model="formData.modifyAccAnnex" placeholder="" />
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- ====== 卡片：扣款事项明细 ====== -->
        <FormCard
          id="card-ded"
          icon="📑"
          title="扣款事项明细"
          v-model:collapsed="collapsedCards.ded"
        >
          <template v-if="isDetail || !!billData.status">
              <base-table
                ref="dedTableRef"
                :columns="dedDetailColumns"
                :table-data="dedTable"
                :row-key="'uuid'"
                :pagination="false"
                :show-toolbar="false"
                :show-action-bar="false"
                :height="'200px'"
              >
              </base-table>
            </template>
            <template v-else>
              <editable-table
                ref="dedTableRef"
                :row-key="'uuid'"
                :height="'200px'"
                v-model="dedTable"
                :columns="dedColumns"
                :pagination="false"
                :highlight-current-row="false"
                :show-summary="true"
                :compactEmpty="true"
                :editable="true"
                :on-save="handleDedSave"
              >
                <template #actionBar>
                  <div class="actionBar-buttons">
                    <el-button type="primary" size="small" @click="handleAddDed">
                      新增事项
                    </el-button>
                  </div>
                </template>
                <template #actions="{ row }">
                  <el-button link type="danger" @click="handleDeleteDed(row)">
                    删除
                  </el-button>
                </template>
              </editable-table>
            </template>
            <div class="deduction-summary">
              实际请款：<span>{{ actualReqAmt.toFixed(2) }}</span>
            </div>
            
        </FormCard>

        <!-- ====== 卡片：付款方式 ====== -->
        <FormCard
          id="card-payway"
          icon="💳"
          title="付款方式"
          v-model:collapsed="collapsedCards.payway"
        >
          <template v-if="isDetail || !!billData.status">
              <base-table
                ref="payWayTableRef"
                :columns="payWayDetailColumns"
                :table-data="payWayTable"
                :row-key="'uuid'"
                :pagination="false"
                :show-toolbar="false"
                :show-action-bar="false"
                :height="'200px'"
              >
              </base-table>
            </template>
            <template v-else>
              <editable-table
                ref="payWayTableRef"
                :row-key="'uuid'"
                :height="'200px'"
                v-model="payWayTable"
                :columns="payWayColumns"
                :pagination="false"
                :highlight-current-row="false"
                :show-summary="false"
                :compactEmpty="true"
                :editable="true"
              >
                <template #actionBar>
                  <div class="actionBar-buttons">
                    <el-button type="primary" size="small" @click="addPayWay">
                      新增支付方式
                    </el-button>
                  </div>
                </template>
                <template #actions="{ row }">
                  <el-button link type="danger" @click="deletePayWay(row)">
                    删除
                  </el-button>
                </template>
              </editable-table>
            </template>
            <div class="pay-summary">
              付款合计：<span>{{ totalPayAmt.toFixed(2) }}</span>
              <span
                v-if="Math.abs(totalPayAmt - actualReqAmt) > 0.01"
                class="pay-error"
              >
                （必须等于实际请款金额 {{ actualReqAmt.toFixed(2) }}）
              </span>
              <span v-else class="pay-success">（等于实际请款金额）</span>
            </div>
        </FormCard>

        <!-- ====== 卡片：财务明细 ====== -->
        <FormCard
          id="card-finance"
          icon="📊"
          title="财务明细"
          v-model:collapsed="collapsedCards.finance"
        >
          <editable-table
            ref="financeTableRef"
            :row-key="'uuid'"
            :height="'200px'"
            v-model="financeTable"
            :columns="financeColumns"
            :pagination="false"
            :highlight-current-row="false"
            :show-summary="false"
            :compactEmpty="true"
            :editable="true"
          >
            <template #actionBar>
              <div class="actionBar-buttons">
                <el-button type="primary" size="small" @click="addFinance">
                  新增财务明细
                </el-button>
              </div>
            </template>
            <template #actions="{ row }">
              <el-button link type="danger" @click="deleteFinance(row)">
                删除
              </el-button>
            </template>
          </editable-table>
        </FormCard>

        <!-- ====== 卡片：相关附件 ====== -->
        <FormCard
          id="card-annex"
          icon="📎"
          title="相关附件"
          v-model:collapsed="collapsedCards.annex"
        >
          <el-form-item label="相关附件">
            <base-upload
              v-model:file-list="tempFileList"
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
              @success="handleUploadSuccess"
            />
          </el-form-item>
        </FormCard>
      
      </el-form>
    </div>

    <!-- ============ 悬浮定位栏 ============ -->
    <FloatNav :items="visibleNavCards" />
  </div>
</template>

<script setup lang="ts">
import {
  ElMessageBox,ElNotification,
} from "element-plus";
import { ref, reactive, watch, onMounted, computed, nextTick } from "vue";
import { ElMessage } from "element-plus";
import FormCard from "@/components/base/base-form-card.vue";
import FloatNav from "@/components/base/base-float-nav.vue";
import EditableTable from "@/components/base/editable-table.vue";
import { EditableColumn } from "@/components/base/editable-table.vue";
import { v4 as uuidv4 } from "uuid";
import { dedTypeEnum } from "@/constants/contract-manage/enums";
import { largeScreenApi } from "@/api/sales/large-screen-api";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import BaseUpload from "@/components/base/base-upload.vue";
import { commonApi } from "@/api/cost/common-api";
import InvoiceDetailDialog from "@/components/business/invoice-detail-dialog.vue";
import {
  ConPaySaveParam,
  HConBillInvoiceD,
  HConBillInvoiceM,
  HConDedUsed,
  HConPayment,
  HConPaymentSub,
  HConPaymentWay,
} from "@/types/cost/contract-manage/payment-application-type.ts";
import { paymentRequestApi } from "@/api/cost/contract-manage/payment-application-api.ts";
import { NAV_CARDS ,invoiceMDetailColumns ,invoiceMColumns,dedDetailColumns, dedColumns,payWayDetailColumns, createFinanceColumns} from "./payment-application-config";
import { formType } from "@/types/form/form-types";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { useUserStore } from "@/stores/user-store";
import { useMDStore } from "@/stores/md-store.ts";
import { useTagsStore } from "@/stores/tags-store";
import { loadOptions } from "@/composables/use-options-loader.ts";
import { useRouter } from "vue-router";
import { dateUtil } from "@/utils/date-util";
import { useFormLayout } from "@/composables/use-form-layout.ts";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
const { collapsedCards, toggleCard, formatMoney } = useFormLayout(NAV_CARDS);
import { buildFileUrl } from "@/utils/file-path-util";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";

defineOptions({ name: "payment-application-form" });

interface Props {
  mode: "add" | "edit" | "detail";
  projId: number;
  conId: number;
  paymentId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  projId: undefined,
  conId: undefined,
  paymentId: undefined,
});

const emit = defineEmits<{
  (e: "success", data: any): void;
}>();

const formRef = ref();
const submitLoading = ref(false);
const isDetail = computed(() => props.mode === "detail");
const isEdit = computed(() => props.mode === "edit");
const isAdd = computed(() => props.mode === "add");
const isReadonly = computed(
  () => isDetail.value || !!billData.value.status,
);

const conId = ref<number | undefined>(props.conId);
const paymentId = ref<number | undefined>(props.conId);

const uploadVisibleDialog = ref(false);

// const collapsedMap = reactive({
//   base: false,
//   pay: false,
//   invoice: false,
//   account: false,
//   ded: false,
//   invoicereg: false,
//   payway: false,
//   finance: false,
//   annex: false,
// });


const visibleNavCards = computed(() =>
  showMaterial.value ? NAV_CARDS : NAV_CARDS.filter(card => card.id !== "card-payway")
);

const showMaterial = computed(() => {
  //const item = AddTypeEnum.find(item => item.value === formData.value.addType);
  //return !item || item.value === 1;
  return true;
});

const showLastPay = computed(() => {
  return !formData.value.needSettle;
});

// ===================== 单据 / 流程状态 =====================
const billData = ref({
  id: undefined,
  bizTitle: "",
  bizNo: "",
  status: 0,
  bizItemCode: formType.CON_PAY,
  flowId: null,
});

const flowListData = ref<any>(null);
const flowBaseData = ref<any>(null);

// ===================== 路由 / 状态仓库 =====================
const router = useRouter();
const userStore = useUserStore();
const mdStore = useMDStore();
const tagsStore = useTagsStore();

// ==================== 数据定义 ====================
const dedTable = ref([]);
const invoiceMTable = ref([]);
const payWayTable = ref([]);
const projectOptions = ref([]);
const subjectOptions = ref([]);
const paymentTypeOptions = ref<any[]>([]);


const financeColumns = createFinanceColumns({
  projectOptions,
  subjectOptions
});

// 仅 付款申请主表 字段
const formData = ref({
  id: undefined as number | undefined,
  conBillId: undefined as number | undefined,
  flowId:null,
  bizTitle: "",
  bizNo:"",
  segId: undefined,
  segCode: "",
  segNo : "",
  segName: "",
  projId: undefined,
  userName: userStore.userInfo?.empName,
  createDate: dateUtil().format("YYYY-MM-DD"),
  deptName: userStore.userInfo?.deptName,
  mguName: userStore.userInfo?.mguName,
  compId : null,
  compName:"",
  status: 0, // 状态 0 草稿，5 审批中，10 已审批，30 已作废

  conId:null,
  conName:"",
  supId:null,
  supName:"",
  conTypeId:null,
  conTypeName:"",
  conSysNo:"",
  conPhyNo:"",

  payTypeId:null,//款项类型
  belongMonth:null,
  needSettle:true,
  isLastPay:null,//是否最后一次支付，需结算时，才显示该项
  signAmt: 0, // 合同签约金额
  addAmt: 0, // 补充合同金额
  sumChangeAmt: 0, // 累计变更签证
  preSettleAmt: 0, // 预结算合同金额
  settledAmt:null,//结算金额
  sumProdVal: 0, // 累计产值
  sumPayAmt: 0, // 累计应付
  sumAppyAmt: 0, // 累计请款
  sumPaidAmt: 0, // 累计实付
  sumOwedAmt: 0, // 累计欠款
  payOutRate: 0, // 应付占产值比率
  paidPayRate: 0, // 实付占应付比率
  paidOutRate: 0, // 实付占产值比率
  reqType: 0 as 0 | 1, // 请款类型 0=请款、1=来票冲账
  payRule: 0 as 0 | 1, // 付款规则：0-正常请款 1-来票冲账
  leavePayAmt: 0, // 剩余应付金额
  reqAmt: 0, // 请款总金额
  pbAmount: 0, // 转履约保证金金额
  changeAmt: 0, // 奖罚总金额（扣款）
  factReqAmt: 0, // 实际请款金额
  reqDesc: "", // 请款说明
  invRecAmt: 0, // 应收发票金额
  invRcvdAmt: 0, // 已收发票
  invOweAmt: 0, // 欠票金额
  isModifyAcc: 0 as 0 | 1, // 修改收款账号 0-否 1-是
  bankName: "", // 收款开户行
  accountName: "", // 收款账户名
  bankAccount: "", // 收款账号
  modifyAccAnnex: undefined, // 修改凭证附件
});

// 价款汇总条数据
const summaryItems = computed(() => [
  { label: "应收发票金额", value: `¥ ${formatMoney(formData.value.invRecAmt)}` },
  { label: "已收发票金额", value: `¥ ${formatMoney(formData.value.invRcvdAmt)}` },
  { label: "本次收票金额", value: `¥ ${formatMoney(formData.value.invRcvdAmt)}` },
  { label: "欠票金额", value: `¥ ${formatMoney(formData.value.invOweAmt)}`, type: "tax" as const },
]);

const formRules = {
  addAmt: [{ required: true, message: "请输入补充合同金额", trigger: "blur" }],
  sumChangeAmt: [
    { required: true, message: "请输入累计变更签证", trigger: "blur" },
  ],
  preSettleAmt: [
    { required: true, message: "请输入预结算合同金额", trigger: "blur" },
  ],
  sumProdVal: [{ required: true, message: "请输入累计产值", trigger: "blur" }],
  sumPayAmt: [{ required: true, message: "请输入累计应付", trigger: "blur" }],
  sumAppyAmt: [{ required: true, message: "请输入累计请款", trigger: "blur" }],
  sumPaidAmt: [{ required: true, message: "请输入累计实付", trigger: "blur" }],
  reqType: [{ required: true, message: "请选择请款类型", trigger: "change" }],
  payRule: [{ required: true, message: "请选择付款规则", trigger: "change" }],
  reqAmt: [{ required: true, message: "请输入请款总金额", trigger: "blur" }],
  isModifyAcc: [
    { required: true, message: "请选择修改收款账号", trigger: "change" },
  ],
};

// 计算字段
const calcFields = () => {
  const d = formData.value;
  // 实际请款金额 = 请款总金额 - 转履约保证金 - 奖罚总金额
  const factAmt = (d.reqAmt || 0) - (d.pbAmount || 0) - (d.changeAmt || 0);
  d.factReqAmt = factAmt < 0 ? 0 : factAmt;
  // 剩余应付金额 = 累计应付 - 累计实付
  d.leavePayAmt = (d.sumPayAmt || 0) - (d.sumPaidAmt || 0);
  // 欠票金额 = 应收发票金额 - 已收发票
  d.invOweAmt = (d.invRecAmt || 0) - (d.invRcvdAmt || 0);
  // 应付占产值比 = 累计应付 / 累计产值 × 100%
  d.payOutRate =
    d.sumProdVal > 0
      ? Number(((d.sumPayAmt / d.sumProdVal) * 100).toFixed(2))
      : 0;
  // 实付占应付比 = 累计实付 / 累计应付 × 100%
  d.paidPayRate =
    d.sumPayAmt > 0
      ? Number(((d.sumPaidAmt / d.sumPayAmt) * 100).toFixed(2))
      : 0;
  // 实付占产值比 = 累计实付 / 累计产值 × 100%
  d.paidOutRate =
    d.sumProdVal > 0
      ? Number(((d.sumPaidAmt / d.sumProdVal) * 100).toFixed(2))
      : 0;
};

const handleAddDed = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    dedId: undefined, // 扣款事项ID
    dedName: "", // 扣款事项
    dedAmt: 0, // 应扣款金额
    dedTypeId: undefined, // 扣款类型ID
    dedThisAmt: 0, // 本次扣款金额
    dedAlreadyAmt: 0, // 已扣款金额
    dedLeaveAmt: 0, // 未扣金额
    dedDesc: "", // 扣款说明
  };
  dedTable.value = [...dedTable.value, newRowData];
};
const handleDeleteDed = (row) => {
  dedTable.value = dedTable.value.filter((item) => item.uuid !== row.uuid);
};



/**
 * 获取目标成本科目列表
 */
const getCostSubjectProjList = async () => {
  if (!props.projId) {
    ElMessage.warning("请先选择项目");
    return;
  }
  try {
    const res = await costCategoryApi.getCostSubjectProjList({
      projId: props.projId,
      withDetail: true,
    });
    if (res.code === 200) {
      subjectOptions.value = res.data || [];
    } else {
      ElMessage.error(res.msg || "getData失败");
    }
  } catch (error) {
    console.error("getData失败:", error);
  }
};

// 获取项目列表
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

// 初始化数据字典
const { getDictList, loadDicts } = useDict(
  [dictMapping.paymentType],
);

const initDictData = async () => {
  await loadDicts();
  paymentTypeOptions.value = getDictList(dictMapping.paymentType);
};


//////////////////////////////

// 查看附件
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
        const url = buildFileUrl(fileUrl);
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

// 上传发票
const handleUploadInvoice = async () => {
  uploadVisibleDialog.value = true;
};

// 获取上传的发票
const getAnnexFileList = async (fileList: any) => {
  console.log("上传的发票", fileList);
  if (fileList && fileList.length > 0) {
    // 使用通知提示
    const notify = ElNotification({
      title: "发票识别中",
      message: `正在识别 ${fileList.length} 张发票，请稍候...`,
      type: "info",
      duration: 0, // 不自动关闭
      position: "top-right",
    });
    try {
      await batchInvoiceRecognition(fileList);
      // 关闭通知并显示成功
      notify.close();
      ElNotification({
        title: "识别完成",
        message: `成功识别 ${fileList.length} 张发票！`,
        type: "success",
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      ElMessage.error("发票识别失败");
    } finally {
      notify.close();
    }
  }
};

// 批量识别发票
const batchInvoiceRecognition = async (invoiceDataList: any[]) => {
  const recognitionPromises = invoiceDataList.map(async (item) => {
    return await invoiceRecognition(item.id, item.annexName);
  });

  try {
    const results: any = await Promise.allSettled(recognitionPromises);
    console.log("识别结果List", results);

    if (results && results.length > 0) {
      const newData = results.map((result, index) => {
        if (result.status === "fulfilled") {
          return {
            ...result.value,
            uuid: uuidv4(),
            id: undefined,
            srcType: "NCON_FEE",
            nconBillId: undefined,
          };
        } else {
          const originalItem = invoiceDataList[index];
          return {
            annexId: originalItem.id,
            annexName: originalItem.annexName,
            uuid: uuidv4(),
            id: undefined,
            srcType: "NCON_FEE",
            nconBillId: undefined,
            invNo: undefined,
            invDate: undefined,
            totalAmt: 0,
            notTaxAmt: 0,
            taxAmt: 0,
            invType: "",
            invoiceDs: [],
          };
        }
      });
      invoiceMTable.value = [...invoiceMTable.value, ...newData];
    }
  } catch (error) {
    console.error("批量识别发票失败:", error);
  }
};

// 发票识别
const invoiceRecognition = async (annexId: number, annexName: string) => {
  try {
    const res = await commonApi.recognizeAndCheckInvoice({ annexId: annexId });
    console.log("识别结果", res);
    if (res.code === 200 && res.data) {
      const { finalData } = res.data;
      if (finalData) {
        let detailListData = [];
        if (finalData.InvoiceProducts && finalData.InvoiceProducts.length > 0) {
          finalData.InvoiceProducts.forEach((item: any) => {
            detailListData.push({
              itemName: item.Name,
              size: item.SpecModel,
              unit: item.MeasureUnit,
              num: item.Qty,
              price: item.Price,
              totalAmt: item.Amount,
              taxRate: item.TaxRate,
              taxAmt: item.TaxPrice,
            });
          });
        }
        const newData = {
          annexId: annexId,
          annexName: annexName,
          invNo: finalData.InvoiceNumber,
          invDate: finalData.InvoiceDate,
          totalAmt: finalData.Amount,
          notTaxAmt: finalData.TotalPrice,
          taxAmt: finalData.TotalTaxPrice,
          invType: finalData.InvoiceCategoryName,
          buyerCompany: finalData.BuyerCompany,
          buyerTaxCode: finalData.BuyerTaxCode,
          sellerCompany: finalData.InvoiceCompany,
          sellerTaxCode: finalData.TaxpayerCode,
          isValid: finalData.InvoiceValidate == 1 ? true : false,
          validateMsg: finalData.ValidateMsg,
          ocrRes: finalData.OCRRes || "",
          validateRes: finalData.ValidateRes || "",
          status:
            finalData.InvoiceValidate == 1
              ? 1
              : finalData.InvoiceValidate == 0
                ? 2
                : 0,
          invoiceDs: detailListData,
        };
        return newData;
      } else {
        return {
          annexId: annexId,
          annexName: annexName,
          invoiceDs: [],
        };
      }
    } else {
      return {
        annexId: annexId,
        annexName: annexName,
        invoiceDs: [],
      };
    }
  } catch (error) {
    return {
      annexId: annexId,
      annexName: annexName,
      invoiceDs: [],
    };
  }
};

// 查验
const handleInspect = async (row: any) => {
  if (!row.annexId) {
    ElMessage.warning("暂无发票！");
    return;
  }
  const notify = ElNotification({
    title: "发票查验中",
    message: "正在查验发票，请稍候...",
    type: "info",
    duration: 0,
    position: "top-right",
  });
  try {
    const res = await commonApi.recognizeAndCheckInvoice({
      annexId: row.annexId,
    });
    notify.close();
    console.log("识别查验结果", res);
    if (res.code === 200 && res.data) {
      const { checkData, finalData, recognizeData } = res.data;
      if (finalData) {
        const recogniRowIndex = invoiceMTable.value.findIndex(
          (item) => item.uuid == row.uuid,
        );
        let detailListData = [];
        if (finalData.InvoiceProducts && finalData.InvoiceProducts.length > 0) {
          finalData.InvoiceProducts.forEach((item: any) => {
            detailListData.push({
              itemName: item.Name,
              size: item.SpecModel,
              unit: item.MeasureUnit,
              num: item.Qty,
              price: item.Price,
              totalAmt: item.Amount,
              taxRate: item.TaxRate,
              taxAmt: item.TaxPrice,
            });
          });
        }
        const newData = {
          annexId: row.annexId,
          annexName: row.annexName,
          invNo: finalData.InvoiceNumber,
          invDate: finalData.InvoiceDate,
          totalAmt: finalData.Amount,
          notTaxAmt: finalData.TotalPrice,
          taxAmt: finalData.TotalTaxPrice,
          invType: finalData.InvoiceCategoryName,
          buyerCompany: finalData.BuyerCompany,
          buyerTaxCode: finalData.BuyerTaxCode,
          sellerCompany: finalData.InvoiceCompany,
          sellerTaxCode: finalData.TaxpayerCode,
          isValid: finalData.InvoiceValidate == 1 ? true : false,
          validateMsg: finalData.ValidateMsg,
          ocrRes: recognizeData ? JSON.stringify(recognizeData) : "",
          validateRes: checkData ? JSON.stringify(checkData) : "",
          status:
            finalData.InvoiceValidate == 1
              ? 1
              : finalData.InvoiceValidate == 0
                ? 2
                : 0,
          invoiceDs: detailListData,
        };
        updateRow(recogniRowIndex, newData);
        ElNotification({
          title: "查验成功",
          message: "已查验到发票相关信息",
          type: "success",
          duration: 3000,
          position: "top-right",
        });
      }
    }
  } catch (error) {
  } finally {
    notify.close();
  }
};

const updateRow = (rowIndex: number, data: any) => {
  Object.assign(invoiceMTable.value[rowIndex], data);
  invoiceMTable.value = [...invoiceMTable.value];
};

const detailInvoiceM = (row) => {
  detailList.value = row.invoiceDs || [];
  dialogVisible.value = true;
};

const handleInvoiceDetailSuccess = (data) => {
  if (data && data.length > 0) {
    const currInvoiceD = data[0];
    const recogniRowIndex = invoiceMTable.value.findIndex(
      (item) => item.id == currInvoiceD.invMid,
    );
    if (recogniRowIndex !== -1) {
      updateRow(recogniRowIndex, { invoiceDs: data });
    }
  }
};

const deleteInvoiceM = ({ uuid }) => {
  invoiceMTable.value = invoiceMTable.value.filter(
    (item) => item.uuid !== uuid,
  );
};

/////////////////////////

const changeProject = async (value: number) => {
  if (value) {
    debugger
    const res = await projectAreaApi.getInfoByProjId({ id: value });
    if (res.code === 200 && res.data) {
      const { compName, compId, segId, segName,segNo } = res.data;
      formData.value.segId = segId || "";
      formData.value.segName = segName || "";
      formData.value.segNo = segNo || "";
      // formData.value.companyId = null;
      // formData.value.compName = "";
      // formData.value.bldIds = [];
      // formData.value.bldNames = "";
      // formData.value.mainConId = null;
      // formData.value.mainConName = "";
      // tableList.value=[];
      // if (value) {
      //   await getBuildingListByProjId(value);
      //   await getCompanyListByProjId(value);
      // }

      // 程序化重置了若干字段，清除误报的必填红
      await nextTick();
      formRef.value?.clearValidate();
    }
  }
};

const getRecogStatusType = (status: number) => {
  switch (status) {
    case 0: // 未识别
      return "info";
    case 1: // 识别成功
      return "success";
    case 2: // 识别失败
      return "danger";
    case 3: // 识别中
      return "warning";
    default:
      return "info";
  }
};

const getRecogStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "未识别";
    case 1:
      return "识别成功";
    case 2:
      return "识别失败";
    case 3:
      return "识别中";
    default:
      return "未知";
  }
};
const addInvoiceM = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    invNo: undefined, // 发票号
    invDate: undefined, // 开票日期
    totalAmt: 0, // 发票总金额
    notTaxAmt: 0, // 不含税金额
    taxAmt: 0, // 税额
    invType: "", // 发票类型
    annexId: undefined, // 附件ID
    recogStatus: undefined, // 识别状态 0=未识别 1=识别成功 2=识别失败 3=识别中
    detailList: [], // 明细数据
  };
  invoiceMTable.value = [...invoiceMTable.value, newRowData];
};
const hiddenUploadRef = ref();
const tempFileList = ref([]);
const currentUploadRow = ref(null);
const dialogVisible = ref(false);
const detailList = ref([]);
// 为某行打开上传
const openUploadForRow = (row: any) => {
  if (row.recogStatus === 3) {
    ElMessage.warning("发票正在识别中，请稍后再操作");
    return;
  }
  currentUploadRow.value = row;
  tempFileList.value = [];

  // 触发上传组件的文件选择
  nextTick(() => {
    hiddenUploadRef.value?.triggerFileSelect();
  });
  // handleUploadSuccess({
  //   id: 11,
  //   annexName: "发票94996751.pdf",
  //   annexSize: 42535,
  //   annexMd5: "fd5ce710e9c20d54299f9e3f29554939",
  //   annexPath: "temporary\\20260709\\fd5ce710e9c20d54299f9e3f29554939.pdf",
  //   annexExt: "pdf",
  //   uploadStatus: 0,
  //   expireTime: "2026-07-24T13:48:22.2228291",
  //   createDate: "2026-07-09T13:48:22.225",
  //   createId: 15,
  // });
};

// 上传组件的成功回调
const handleUploadSuccess = (file: any) => {
  console.log("上传组件的成功回调", file);
  if (currentUploadRow.value) {
    const annexId = file.id; // 附件ID
    const annexName = file.annexName || file.name; // 附件名称
    const recogStatus = 3; // 识别状态,0=未识别 1=识别成功 2=识别失败 3=识别中
    // 更新行数据
    currentUploadRow.value.annexId = annexId; // 附件ID
    currentUploadRow.value.annexName = annexName; // 附件名称
    currentUploadRow.value.recogStatus = recogStatus;
    const currIndex = invoiceMTable.value.findIndex(
      (item) => item.uuid == currentUploadRow.value.uuid,
    );
    if (currIndex === -1) {
      // 没找到对应的行数据，直接返回
      currentUploadRow.value = null;
      return;
    }
    updateRow(currIndex, { annexId, annexName, recogStatus });

    console.log("更新行数据", currentUploadRow.value);
    ElMessage.success(`发票上传成功，正在识别...`);

    // 调用识别接口,传入文件ID和当前行数据的uuid，uuid用作识别成功后的数据匹配回填
    recognizeInvoiceAsync(currentUploadRow.value.uuid, annexId);
  }
};
// 发票识别,uuid用作识别成功后的数据匹配回填
const recognizeInvoiceAsync = async (currUuid: string, annexId: number) => {
  console.log("发票识别", annexId, currUuid);
  try {
    // 编辑时，优先使用申请单ID；新增时则取合同ID
    const conBillId = formData.value.id || props.conId;
    const params = {
      annexId: annexId,
      // conBillId: conBillId,
    };
    const res = await commonApi.recognizeInvoice(params);
    // const res = {
    //   code: 200,
    //   message: "success",
    //   data: {
    //     mainInfo: {
    //       isDel: false,
    //       invNo: "94996751",
    //       invDate: "2021-10-16",
    //       totalAmt: 10.53,
    //       notTaxAmt: 9.66,
    //       taxAmt: 0.87,
    //       invType: "",
    //     },
    //     detailList: [
    //       {
    //         isDel: false,
    //         createId: 15,
    //         createDate: "2026-07-09 13:48:23",
    //         operId: 15,
    //         operDate: "2026-07-09 13:48:23",
    //         id: 3,
    //         invMid: 2,
    //         itemName: "*经营租赁*通行费",
    //         size: "渝A653PF",
    //         unit: "客车",
    //         num: 998,
    //         price: 38.8,
    //         totalAmt: 9.66,
    //         taxRate: 0.09,
    //         taxAmt: 0.87,
    //       },
    //     ],
    //   },
    // };
    if (res.code === 200 && res.data) {
      const { mainInfo, detailList = [] } = res.data;
      const recogniRowIndex = invoiceMTable.value.findIndex(
        (item) => item.uuid == currUuid,
      );
      // 有匹配的数据并且识别成功
      if (recogniRowIndex !== -1 && mainInfo) {
        const newData = {
          invNo: mainInfo.invNo, // 发票号
          invDate: mainInfo.invDate, // 开票日期
          totalAmt: mainInfo.totalAmt, // 发票总金额
          notTaxAmt: mainInfo.notTaxAmt, // 不含税金额
          taxAmt: mainInfo.taxAmt, // 税额
          invType: mainInfo.invType, // 发票类型
          recogStatus: 1, // 识别状态,0=未识别 1=识别成功 2=识别失败
          detailList: detailList, // 明细数据
        };
        updateRow(recogniRowIndex, newData);
      }
    } else {
      // 识别失败
      const failIndex = invoiceMTable.value.findIndex(
        (item) => item.uuid === currUuid,
      );
      if (failIndex !== -1) {
        updateRow(failIndex, { recogStatus: 2 }); // 识别失败
      }
    }
  } catch (error) {}
};


const payWayColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "payWay",
    label: "付款方式",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "label",
    optionValueField: "value",
    options: [
      { label: "转账", value: "PW_ZZ" },
      { label: "账扣", value: "PW_ZK" },
      { label: "其他", value: "PW_QT" },
    ],
  },
  {
    prop: "payAmt",
    label: "付款金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "dedRoomAmt",
    label: "其中抵房金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    slot: "actions",
    fixed: "right",
  },
]);
const addPayWay = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    payWay: undefined, // 付款方式
    payAmt: 0, // 付款金额
    dedRoomAmt: 0, // 其中抵房金额
  };
  payWayTable.value = [...payWayTable.value, newRowData];
};
const deletePayWay = (row) => {
  payWayTable.value = payWayTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

const financeTable = ref([]);

const addFinance = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    projId: undefined, // 项目ID
    acctProjId: undefined, // 建筑核算项目ID
    subId: undefined, // 科目ID
    subAmt: 0, // 金额
  };
  financeTable.value = [...financeTable.value, newRowData];
};
const deleteFinance = (row) => {
  financeTable.value = financeTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

// 加载付款申请详情
const loadDetail = async () => {
  if (!paymentId.value) return;
  const res = await paymentRequestApi.getPayDetail({
    id: paymentId.value,
    isWithFlow: true,
  });
  if (res.code === 200 && res.data) {
    backfillData(res.data);
  }
};
// 数据回填
const backfillData = async (data) => {
  const { payment, payWays, paySubs, invoiceMs, invoiceDs, billDeds } = data;
  // 回填主表单
  Object.assign(formData.value, payment || {});
  // 确保 conBillId 被正确赋值
  if (payment?.conBillId) {
    formData.value.conBillId = payment.conBillId;
  }
  // 回填付款方式
  payWayTable.value =
    payWays?.map((item) => ({
      ...item,
      uuid: uuidv4(),
    })) || [];
  // 回填财务明细
  financeTable.value =
    paySubs?.map((item) => ({
      ...item,
      uuid: uuidv4(),
    })) || [];
  // 回填发票明细
  dedTable.value =
    billDeds?.map((item) => ({
      ...item,
      uuid: uuidv4(),
    })) || [];
  // 回填发票主表，并将子表数据挂载到对应的主表 detailList 字段
  invoiceMTable.value =
    invoiceMs?.map((item: HConBillInvoiceM) => {
      // 根据 invMid 匹配子表数据
      const details =
        invoiceDs?.filter((d: HConBillInvoiceD) => d.invMid === item.id) || [];
      return {
        ...item,
        uuid: uuidv4(),
        detailList: details, // 子表数据挂载到 detailList
      };
    }) || [];
};


// ==================== 计算逻辑 ====================

// 1. 实际请款金额 = 请款金额 + 扣款金额汇总
const actualReqAmt = computed(() => {
  const reqAmt = formData.value.reqAmt || 0;
  const totalDedAmt = dedTable.value.reduce((sum, item) => {
    return sum + (Number(item.dedAmt) || 0);
  }, 0);
  return totalDedAmt + reqAmt;
});

// 2. 已收发票金额 = 发票列表发票总金额汇总
const receivedInvoiceAmt = computed(() => {
  return invoiceMTable.value.reduce((sum, item) => {
    return sum + (Number(item.totalAmt) || 0);
  }, 0);
});

// 3. 应收发票金额 = 实际请款金额
const receivableInvoiceAmt = computed(() => {
  return actualReqAmt.value;
});

// 4. 欠票金额 = 应收发票金额 - 已收发票金额
const oweInvoiceAmt = computed(() => {
  return receivableInvoiceAmt.value - receivedInvoiceAmt.value;
});

// 5. 支付方式付款金额合计
const totalPayAmt = computed(() => {
  return payWayTable.value.reduce((sum, item) => {
    return sum + (Number(item.payAmt) || 0);
  }, 0);
});


const handleDedSave = async ({ row, column, newValue, oldValue, rowIndex }) => {
  if (column === "dedTypeId") {
   // updateDedRow(rowIndex, { dedTypeId: newValue, dedAmt: 0 });
    return;
  }
  if (column === "dedAmt") {
    // const targetData = dedTypeOptions.value?.find(
    //   (item) => item.id == row.dedTypeId,
    // );
    // if (targetData) {
    //   if (targetData.dicValue == "1") {
    //     if (newValue <= 0) {
    //       ElMessage.error("调增金额必须为正数");
    //      // updateDedRow(rowIndex, { dedAmt: 0 });
    //       return;
    //     }
    //   } else {
    //     if (newValue >= 0) {
    //       ElMessage.error("扣款金额必须为负数");
    //      // updateDedRow(rowIndex, { dedAmt: 0 });
    //       return;
    //     }
    //   }
    // }
  }
  //updateDedRow(rowIndex, { [column]: newValue });
};

// ===================== 校验失败辅助 =====================
// ---- 校验失败后：滚动到第一个错误项并聚焦对应控件 ----
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

// 构建保存参数
const buildSaveParams = (): ConPaySaveParam => {
  // 优先使用 formData 中的值（编辑时回填的），否则使用 props.conId
  const conBillId = formData.value.conBillId || props.conId;
  // 构建主表数据
  const payment: HConPayment = {
    conBillId: formData.value.conBillId,
    signAmt: formData.value.signAmt || 0,
    addAmt: formData.value.addAmt || 0,
    sumChangeAmt: formData.value.sumChangeAmt || 0,
    preSettleAmt: formData.value.preSettleAmt || 0,
    sumProdVal: formData.value.sumProdVal || 0,
    sumPayAmt: formData.value.sumPayAmt || 0,
    sumAppyAmt: formData.value.sumAppyAmt || 0,
    sumPaidAmt: formData.value.sumPaidAmt || 0,
    sumOwedAmt: formData.value.sumOwedAmt || 0,
    payOutRate: formData.value.payOutRate || 0,
    paidPayRate: formData.value.paidPayRate || 0,
    paidOutRate: formData.value.paidOutRate || 0,
    reqType: formData.value.reqType,
    payRule: formData.value.payRule,
    leavePayAmt: formData.value.leavePayAmt || 0,
    reqAmt: formData.value.reqAmt || 0,
    pbAmount: formData.value.pbAmount || 0,
    changeAmt: formData.value.changeAmt || 0,
    factReqAmt: formData.value.factReqAmt || 0,
    reqDesc: formData.value.reqDesc || "",
    invRecAmt: formData.value.invRecAmt || 0,
    invRcvdAmt: formData.value.invRcvdAmt || 0,
    invOweAmt: formData.value.invOweAmt || 0,
    isModifyAcc: formData.value.isModifyAcc,
    bankName: formData.value.bankName || "",
    accountName: formData.value.accountName || "",
    bankAccount: formData.value.bankAccount || "",
    modifyAccAnnex: formData.value.modifyAccAnnex,
  };

  // 构建扣款明细
  const billDeds: HConDedUsed[] = dedTable.value.map((item: HConDedUsed) => ({
    id: item.id,
    conBillId: item.conBillId,
    dedId: item.dedId,
    dedName: item.dedName || "",
    dedAmt: item.dedAmt || 0,
    dedTypeId: item.dedTypeId,
    dedThisAmt: item.dedThisAmt || 0,
    dedAlreadyAmt: item.dedAlreadyAmt || 0,
    dedLeaveAmt: item.dedLeaveAmt || 0,
    dedDesc: item.dedDesc || "",
  }));

  // 构建发票主表和子表
  const invoiceMs: HConBillInvoiceM[] = [];
  const invoiceDs: HConBillInvoiceD[] = [];

  invoiceMTable.value.forEach((item: HConBillInvoiceM) => {
    // 如果有附件，才保存（过滤空行）
    if (item.annexId) {
      const invM: HConBillInvoiceM = {
        id: item.id,
        conBillId: item.conBillId,
        invNo: item.invNo || "",
        invDate: item.invDate ? `${item.invDate} 00:00:00` : "",
        totalAmt: item.totalAmt || 0,
        notTaxAmt: item.notTaxAmt || 0,
        taxAmt: item.taxAmt || 0,
        invType: item.invType || "",
        annexId: item.annexId,
        recogStatus: item.recogStatus || 0,
      };
      invoiceMs.push(invM);

      // 构建发票子表（明细）
      if (item.detailList && item.detailList.length > 0) {
        item.detailList.forEach((detail: HConBillInvoiceD) => {
          const invD: HConBillInvoiceD = {
            id: detail.id,
            invMid: detail.invMid,
            itemName: detail.itemName || "",
            size: detail.size || "",
            unit: detail.unit || "",
            num: detail.num || 0,
            price: detail.price || 0,
            totalAmt: detail.totalAmt || 0,
            taxRate: detail.taxRate || 0,
            taxAmt: detail.taxAmt || 0,
          };
          invoiceDs.push(invD);
        });
      }
    }
  });

  // 构建付款方式
  const payWays: HConPaymentWay[] = payWayTable.value.map(
    (item: HConPaymentWay) => ({
      id: item.id,
      conBillId: item.conBillId,
      payWay: item.payWay || "",
      payAmt: item.payAmt || 0,
      dedRoomAmt: item.dedRoomAmt || 0,
    }),
  );

  // 构建财务明细
  const paySubs: HConPaymentSub[] = financeTable.value.map(
    (item: HConPaymentSub) => ({
      id: item.id,
      conBillId: item.conBillId,
      projId: item.projId,
      acctProjId: item.acctProjId,
      subId: item.subId,
      subAmt: item.subAmt || 0,
    }),
  );

  // 返回完整参数
  return {
    conId: props.conId,
    payment: payment,
    billDeds: billDeds.length > 0 ? billDeds : undefined,
    invoiceMs: invoiceMs.length > 0 ? invoiceMs : undefined,
    invoiceDs: invoiceDs.length > 0 ? invoiceDs : undefined,
    payWays: payWays.length > 0 ? payWays : undefined,
    paySubs: paySubs.length > 0 ? paySubs : undefined,
  };
};

const handleCancel = async () => {
  ElMessageBox.confirm("确定要作废吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await paymentRequestApi.voidPay({id:formData.value.id});
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

const handleDelete = async () => {
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await paymentRequestApi.delPay({id: formData.value.id});
      if (res.code === 200) {
        ElMessage.success("删除成功");
        goBack();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  });
};

const buildSubmitParams = () => {
    return {
      // conMain: {
      //   ...conMainData.value,
      //   id: formData.value.mainConId,
      // }, 
      // bill: {
      //   ...billData.value,
      //   id: billData.value.id || undefined,
      //   bizTitle: formData.value.bizTitle,
      //   bizItemCode: formType.CON_ADD,
      //   segId: formData.value.segId,
      //   segName: formData.value.segName,
      //   segNo: formData.value.segNo,
      //   projId: formData.value.projId,
      //   compId: formData.value.companyId,
      //   compName: formData.value.compName,
      //   flowId:formData.value.flowId,
      // },
      // conAdd: {
      //   id: formData.value.id,
      //   conBillId: props.conId,
      //   addName: formData.value.addName,
      //   companyId: formData.value.companyId,
      //   addSysNo: formData.value.addSysNo,
      //   addPhyNo: formData.value.addPhyNo,
      //   addType: formData.value.addType,
      //   conTypeId: formData.value.conTypeId,
      //   conProperty: formData.value.conProperty,
      //   supId: formData.value.supId,
      //   priceType: formData.value.priceType,
      //   bldIds: formData.value.bldIds?.join(",") || "",
      //   bldNames: formData.value.bldNames,
      //   payMethod: formData.value.payMethod,
      //   addAmt: priceTaxData.value.totalPriceTax,
      //   addExclAmt: priceTaxData.value.totalPrice,
      //   taxAmt: priceTaxData.value.taxAmount,
      //   signDate: formData.value.signDate,
      //   agentId: formData.value.agentId,
      //   taxRate: priceTaxData.value.taxRate,
      // },
      // conAddExt: {
      //   id: formData.value.id,
      //   conBillId: props.conId,
      //   addId: formData.value.id,
      //   needSeal: formData.value.needSeal,
      //   sealTypes: formData.value.sealTypes?.join(",") || "",
      //   signAddr: formData.value.signAddr || "",
      //   supCmanName: formData.value.supCmanName || "",
      //   supCmanIdno: formData.value.supCmanIdno || "",
      //   supCmanTel: formData.value.supCmanTel || "",
      //   supCmanJob: formData.value.supCmanJob || "",
      //   remark: formData.value.remark || "",
      // },
      // addProcesses: formData.value.addType == 1 ? tableList.value : [],
      // billPrices: priceTable.value,
      // annexContractList: annexContractFileList.value || [],
      // annexList: annexFileList.value || [],
    };
  };

const handleFormDataSave = async () => {
  submitLoading.value = true;
  try {
    await formRef.value.validateField(["bizTitle","addName"]); 

    const params = buildSubmitParams()
    const res = await paymentRequestApi.editPay(params);
    if (res.code === 200 && res.data) {
      formData.value.id = res.data;
      paymentId.value = formData.value.id;
      ElMessage.success("保存成功");
      await loadDetail();
    }
  } catch (error) {
    focusFirstError(error as Record<string, any>);
  } finally {
    submitLoading.value = false;
  }
};

const handleFormDataSubmit = async () => {
  submitLoading.value = true;
  try {
    await formRef.value.validate();
    // 校验各个明细表
    // if (!validatePriceTable()) return;
    // if (!validateProcessTable()) return;
    // if (!validateProcessAmountMatch()) return;   // ← 加这一行

    const params = buildSubmitParams()
    let res;
    res = await paymentRequestApi.submitPay(params);

    if (res.code === 200) {
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
    focusFirstError(error as Record<string, any>);
  } finally {
    submitLoading.value = false;
  }
};

// 返回操作
const goBack = () => {
  if (isAdd.value) {
    tagsStore.closeTagByPath("/con/supplement-contract/add");
  }
  if (isEdit.value) {
    tagsStore.closeTagByPath("/con/supplement-contract/edit");
  }
  router.go(-1); // 返回上个页面
};

// 提交
const handleSubmit = async () => {
  console.log("表单", formData.value);
  console.log("扣款明细", dedTable.value);
  console.log("发票登记", invoiceMTable.value);
  console.log("付款方式", payWayTable.value);
  console.log("财务明细", financeTable.value);
  if (isDetail.value) return;
  await formRef.value?.validate();
  submitLoading.value = true;
  // 构建参数
  const params = buildSaveParams();
  console.log("提交参数", params);
  try {
    let res;
    if (props.mode === "edit") {
      res = await paymentRequestApi.editPay(params);
    } else {
      res = await paymentRequestApi.addPay(params);
    }
    if (res.code === 200) {
      ElMessage.success("保存成功");
      emit("success", res.data);
    }
  } finally {
    submitLoading.value = false;
  }
};

const createBillNo = async () => {
  try {
    // BCBH:补充合同编号前缀
    const conRes = await commonApi.getBillNo({ bizType: formType.CON_ADD });
    if (conRes.code === 200) {
      formData.value.bizNo = conRes.data;
    }
  } catch (error) {
    console.error("生成合同编号失败:", error);
  }
};


// 获取主合同信息
const getConMainData = async (conId) => {
  if (!conId) return;
  if (conId === formData.value.conId) return
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: conId,
    });
    if (res.code === 200 && res.data) {
      const {
        conMain,
      } = res.data;

      if (formData.value.projId != conMain.projId) {
        formData.value.projId = conMain.projId;
        await changeProject(formData.value.projId);
        //getBuildingListByProjId(conMain.projId);
      }

      // formData.value.segId = conMain.segId;
      // formData.value.segName = conMain.segName;
      // formData.value.segNo = conMain.segNo;
      formData.value.compName = conMain.companyName;
      formData.value.projId = conMain.projId;
      formData.value.compId = conMain.companyId;
      formData.value.conName = conMain.conName;
      formData.value.conId = conMain.id;
      formData.value.supId = conMain.supId;
      formData.value.supName = conMain.supName;
      formData.value.conTypeId = conMain.conTypeId;
      formData.value.conTypeName = conMain.conTypeName;
      formData.value.conSysNo = conMain.conSysNo;
      formData.value.conPhyNo = conMain.conPhyNo;
      formData.value.needSettle = conMain.needSettle;

      formData.value.signAmt= conMain.signAmt; // 合同签约金额
      formData.value.addAmt= conMain.addAmt; // 补充合同金额
      formData.value.sumChangeAmt= conMain.sumChangeAmt; // 累计变更签证
      formData.value.preSettleAmt= conMain.preSettleAmt; // 预结算合同金额
      formData.value.settledAmt= conMain.settledAmt; //结算金额
      formData.value.sumProdVal= conMain.sumProdVal; // 累计产值
      formData.value.sumPayAmt= conMain.sumPayAmt;// 累计应付
      formData.value.sumAppyAmt= conMain.sumAppyAmt; // 累计请款
      formData.value.sumPaidAmt= conMain.sumPaidAmt; // 累计实付
      formData.value.sumOwedAmt= conMain.sumOwedAmt; // 累计欠款
      formData.value.payOutRate= conMain.payOutRate; // 应付占产值比率
      formData.value.paidPayRate= conMain.paidPayRate; // 实付占应付比率
      formData.value.paidOutRate= conMain.paidOutRate; // 实付占产值比率
      formData.value.leavePayAmt= conMain.leavePayAmt; // 剩余应付金额 

    }
  } catch (error) {
    console.error("获取合同信息失败:", error);
  }
};

// 监听变化自动计算
watch(
  () => [
    formData.value.reqAmt,
    formData.value.pbAmount,
    formData.value.changeAmt,
  ],
  () => calcFields(),
);
watch(
  () => [
    formData.value.sumPayAmt,
    formData.value.sumPaidAmt,
    formData.value.sumProdVal,
    formData.value.invRecAmt,
    formData.value.invRcvdAmt,
  ],
  () => calcFields(),
);

// ===================== 初始化 / 生命周期 =====================
// 初始化
const initData = async () => {
  await initDictData();
  await getProjectOptions();
  await getCostSubjectProjList();
  if (props.mode === "add") {
    await createBillNo();
    await getConMainData(conId.value);
  } else if (props.mode === "edit" && props.paymentId) {
    loadDetail();
  }
}

onMounted(() => {
  initData();
});

</script>

<style scoped lang="scss">
.payment-application-form {
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

.actions-btn {
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.deduction-summary {
  padding: 10px 15px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  background: #f5f7fa;
  border-radius: 4px;

  span {
    color: #f56c6c;
    font-size: 18px;
  }
}

.pay-summary {
  padding: 10px 15px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  background: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;

  span {
    color: #f56c6c;
    font-size: 18px;
  }

  .pay-error {
    color: #f56c6c;
    font-size: 14px;
    font-weight: normal;
  }

  .pay-success {
    color: #67c23a;
    font-size: 14px;
    font-weight: normal;
  }
}

.annex-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.actionBar-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.actions-btn {
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
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
