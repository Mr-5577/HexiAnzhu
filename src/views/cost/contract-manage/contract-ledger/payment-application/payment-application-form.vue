<!-- 付款申请 表单（界面风格对齐变更申请/补充合同审批：BillHeader + FormCard + FloatNav，逻辑不变） -->
<template>
  <div class="payment-application-form">
    <!-- ============ 顶部操作栏 ============ -->
    <BillHeader :title="'付款申请'" :contract-no="formData.bizNo || ''" :submitter="formData.userName || ''"
      :submit-time="formData.createDate || ''" :status="billData.status || 0" :show-status="true"
      :button-loading="submitLoading" :save-disabled="isReadonly" :submit-disabled="isReadonly"
      :delete-disabled="isDetail || isAdd || !!billData.status" :void-disabled="isDetail || isAdd || !!billData.status"
      :view-disabled="isAdd" @save="handleFormDataSave" @submit="handleFormDataSubmit" @delete="handleDelete"
      @void="handleCancel" @viewFlow="handleViewProcess" />

    <div class="form-scroll-area">
      <el-form ref="formRef" :model="formData" :rules="formRules" :disabled="isReadonly || loadingForm"
        :validate-on-rule-change="false" label-width="134px" class="adapt-form">
        <!-- ====== 卡片1：单据信息 ====== -->
        <BillInfo v-model="formData" :status="billData?.status || 0" :disabled="isReadonly"
          :project-options="projectOptions" @project-change="changeProject" />

        <!-- ====== 卡片：基本信息 ====== -->
        <FormCard id="card-base" icon="📋" title="合同信息" v-model:collapsed="collapsedCards.base">
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="合同名称" prop="conId" required>
                <PickInput v-model="formData.conName" placeholder="请选择付款合同" :readonly="isReadonly || !formData.projId"
                  v-model:model-value-id="formData.conId" @pick="openMainConDialog" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="单位名称" prop="supName">
                <el-input v-model="formData.supName" placeholder="单位名称" style="width: 100%" disabled />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同分类" prop="conTypeName" required>
                <el-input v-model="formData.conTypeName" placeholder="合同分类" style="width: 100%" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同签约金额" prop="signAmt">
                <el-input-number v-model="formData.signAmt" :precision="2" :controls="false" style="width: 100%"
                  disabled>
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="合同首次签约时的合同金额" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="补充合同金额" prop="addAmt">
                <el-input-number v-model="formData.addAmt" :precision="2" :controls="false" style="width: 100%"
                  disabled>
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="所有生效和在途的补充合同金额之和" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" v-if="conTypeIsJianAn">
              <el-form-item label="累计变更签证" prop="sumChangeAmt">
                <el-input-number v-model="formData.sumChangeAmt" :precision="2" :controls="false" style="width: 100%"
                  disabled>
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="所有生效和在途的变更（不含已转签证或补充合同）、签证（不含已转补充合同）金额之和" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item :label="settleAmtLabel" :prop="settleAmtProp">
                <el-input-number :model-value="settleAmtValue" :precision="2" :controls="false" style="width: 100%"
                  disabled>
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="已结算则为合同结算金额，未结算则为最近一次生效的预结算金额" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <!-- </el-row> -->

            <!-- <el-row :gutter="24"> -->
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" v-if="conTypeIsJianAn">
              <el-form-item label="累计产值" prop="sumProdVal">
                <el-input-number v-model="formData.sumProdVal" :precision="2" :controls="false" style="width: 100%"
                  disabled>
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="所有生效和在途的产值确认金额（成本复核金额或产值申报金额）" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" v-if="conTypeIsJianAn">
              <el-form-item label="累计应付" prop="sumPayAmt">
                <el-input-number v-model="formData.sumPayAmt" :precision="2" :controls="false" style="width: 100%"
                  disabled>
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="所有生效和在途的应付确认金额（成本复核金额或产值申报金额）" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计请款" prop="sumAppyAmt">
                <el-input-number v-model="formData.sumAppyAmt" :precision="2" :controls="false" style="width: 100%"
                  disabled>
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="所有生效和在途的请款流程中的计划请款金额之和" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计奖罚" prop="sumDedAmt">
                <el-input-number v-model="formData.sumDedAmt" :precision="2" :controls="false" style="width: 100%"
                  disabled>
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="所有生效和在途的请款流程中的奖罚金额之和" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计实付" prop="sumPaidAmt">
                <el-input-number v-model="formData.sumPaidAmt" :precision="2" :controls="false" style="width: 100%"
                  disabled>
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="所有付款登记金额之和" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <!-- </el-row> -->

            <!-- <el-row :gutter="24"> -->
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计欠款" prop="sumOwedAmt">
                <el-input-number v-model="formData.sumOwedAmt" disabled :precision="2" :controls="false"
                  style="width: 100%">
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="请款 + 奖罚 - 实付" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" v-if="conTypeIsJianAn">
              <el-form-item label="应付占产值比" prop="payOutRate">
                <el-input-number v-model="formData.payOutRate" disabled :precision="2" :controls="false"
                  style="width: 100%" :formatter="value => `${value}%`" :parser="value => value.replace('%', '')">
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="累计应付 / 累计产值" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" v-if="conTypeIsJianAn">
              <el-form-item label="实付占应付比" prop="paidPayRate">
                <el-input-number v-model="formData.paidPayRate" disabled :precision="2" :controls="false"
                  style="width: 100%" :formatter="value => `${value}%`" :parser="value => value.replace('%', '')">
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="累计实付 / 累计应付" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" v-if="conTypeIsJianAn">
              <el-form-item label="实付占产值比" prop="paidOutRate">
                <el-input-number v-model="formData.paidOutRate" disabled :precision="2" :controls="false"
                  style="width: 100%" :formatter="value => `${value}%`" :parser="value => value.replace('%', '')">
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="累计实付 / 累计产值" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- ====== 卡片：付款申请信息 ====== -->
        <FormCard id="card-pay" icon="💰" title="付款申请" v-model:collapsed="collapsedCards.pay">
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="归属月份" prop="belongMonth" required>
                <el-date-picker v-model="formData.belongMonth" type="month" value-format="YYYY-MM-DD"
                  placeholder="请选择归属月份" :disabled="isReadonly"
                  :disabled-date="disabledBelongMonth" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="费用类型" prop="finaTypeId" required>
                <el-cascader v-model="formData.finaTypeId" :options="filteredFeeTypeOptions" :show-all-levels="false"
                  :props="{
                    expandTrigger: 'hover',
                    emitPath: false,
                    checkStrictly: false,
                    value: 'id',
                    label: 'finaTypeName',
                    children: 'children',
                  }" placeholder="请选择费用类型" style="width: 100%" filterable :disabled="isReadonly" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="款项类型" prop="payTypeId" required>
                <el-select v-model="formData.payTypeId" placeholder="请选择" style="width: 100%">
                  <el-option v-for="item in paymentTypeOptions" :key="item.id" :label="item.dicLabel"
                    :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="请款类型" prop="reqType" required>
                <el-select v-model="formData.reqType" placeholder="请选择" style="width: 100%">
                  <el-option v-for="item in ReqTypeEnum" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="计划请款金额" prop="reqAmt" required>
                <el-input-number v-model="formData.reqAmt" :min="0" :precision="2" :controls="false"
                  style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="是否提高支付比例" prop="isRise" required>
                <div style="width: 100%;display: flex;align-items: center;">
                  <el-select v-model="formData.isRise" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in YesOrNoStatusEnum" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>

                  <span style="pointer-events: auto; cursor: help;">
                    <el-tooltip effect="dark" content="当计划请款金额+累计已请款>已解锁应付总额时，系统将自动标记为'是'" placement="top"
                      :append-to-body="true">
                      <el-icon style="color: #909399;">
                        <QuestionFilled />
                      </el-icon>
                    </el-tooltip>
                  </span>
                </div>

              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" v-if="showLastPay">
              <el-form-item label="是否最后一笔支付" prop="isLastPay" required>
                <el-select v-model="formData.isLastPay" :disabled="isDetail" placeholder="请选择" style="width: 100%">
                  <el-option v-for="item in YesOrNoStatusEnum" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" v-if="conTypeIsJianAn">
              <el-form-item label="已解锁应付总额" prop="unlockAmt">
                <el-input-number v-model="formData.unlockAmt" disabled :precision="2" :controls="false"
                  style="width: 100%">
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="已到达设定支付周期的应付金额之和" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" v-if="conTypeIsJianAn">
              <el-form-item label="已解锁应付余额" prop="">
                <el-input-number :model-value="unlockLastAmt" disabled :precision="2" :controls="false"
                  style="width: 100%">
                  <template #suffix>
                    <span style="pointer-events: auto; cursor: help;">
                      <el-tooltip effect="dark" content="已解锁应付总额 - 累计请款金额" placement="top">
                        <el-icon style="color: #909399;">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <!-- <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="剩余应付金额" prop="leavePayAmt">
                <el-input-number
                  v-model="formData.leavePayAmt"
                  disabled
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col> -->
          </el-row>

          <!-- <el-row :gutter="24">
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
                  :model-value="actualReqAmt"
                  disabled
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row> -->
          <el-row :gutter="24">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item label="请款说明" prop="reqDesc">
                <el-input v-model="formData.reqDesc" type="textarea" :rows="3" maxlength="500" show-word-limit
                  placeholder="请输入" />
              </el-form-item>
            </el-col>
          </el-row>
        </FormCard>

        <!-- ====== 卡片：收款账号信息 ====== -->
        <FormCard id="card-account" v-show="!isOffsetByInvoice" icon="💳" title="收款账号"
          v-model:collapsed="collapsedCards.account">
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="修改收款账号" prop="isModifyAcc" required>
                <el-select v-model="formData.isModifyAcc" placeholder="请选择" style="width: 100%">
                  <el-option v-for="item in YesOrNoStatusEnum" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="收款开户行" prop="bankName">
                <el-input v-model="formData.bankName" placeholder=""
                  :disabled="isReadonly || formData.isModifyAcc !== true" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="收款账户名" prop="accountName">
                <el-input v-model="formData.accountName" placeholder=""
                  :disabled="isReadonly || formData.isModifyAcc !== true" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="收款账号" prop="bankAccount" required>
                <el-input v-model="formData.bankAccount" placeholder=""
                  :disabled="isReadonly || formData.isModifyAcc !== true" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24" v-show="showBankAnnex">
            <el-form-item label="修改凭证附件">
              <base-upload v-model:file-list="bankFileList" :limit="1" :multiple="false" :showIcon="true"
                :showTip="true" :maxSize="20" :unrestricted="true" :accept="''" button-text="选择文件"
                :disabled="isReadonly" @success="handleBankUploadSuccess" />
            </el-form-item>
            <!-- <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="修改凭证附件" prop="modifyAccAnnex">
                <el-input v-model="formData.modifyAccAnnex" placeholder="" :disabled="isReadonly || formData.isModifyAcc !== true" />
              </el-form-item>
            </el-col> -->
          </el-row>
        </FormCard>

        <!-- ====== 卡片：扣款事项 ====== -->
        <FormCard id="card-ded" v-show="!isOffsetByInvoice" icon="⚖️" title="奖罚调整"
          v-model:collapsed="collapsedCards.ded">
          <SummaryBar :items="summaryDedItems" />
          <template v-if="isReadonly">
            <base-table ref="dedTableRef" :columns="dedDetailColumns" :table-data="dedTable" :row-key="'id'"
              :pagination="false" :show-toolbar="false" :show-action-bar="false" :height="'200px'">
            </base-table>
          </template>
          <template v-else>
            <editable-table ref="dedTableRef" :row-key="'id'" :height="'200px'" v-model="dedTable" :columns="dedColumns"
              :pagination="false" :highlight-current-row="false" :show-summary="true" :compactEmpty="true"
              :editable="true" :on-save="handleDedSave">
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
            实际请款：<span>{{ formatDecimal(actualReqAmt) }}</span>
          </div>

        </FormCard>

        <!-- ====== 卡片：付款方式 ====== -->
        <FormCard id="card-payway" v-show="!isOffsetByInvoice" icon="📜" title="付款方式"
          v-model:collapsed="collapsedCards.payway">
          <div style="display: flex; justify-content: flex-end; margin-bottom: 8px">
            <el-button type="primary" size="small" :disabled="payWayTable.length == 0" @click="handleFinanceAlloc"
              v-if="!isAdd && menuStore.hasExactPermission('fina-alloc:con-pay')">
              财务分摊
            </el-button>
            <el-button type="primary" size="small" @click="addPayWay" v-if="!(isReadonly)">
              新增支付方式
            </el-button>
          </div>
          <template v-if="isReadonly">
            <base-table ref="payWayTableRef" :columns="payWayDetailColumns" :table-data="payWayTable" :row-key="'id'"
              :pagination="false" :show-toolbar="false" :show-action-bar="false" :height="'200px'">
            </base-table>
          </template>
          <template v-else>
            <editable-table ref="payWayTableRef" :row-key="'id'" :height="'200px'" v-model="payWayTable"
              :columns="payWayColumns" :pagination="false" :highlight-current-row="false" :show-summary="false"
              :compactEmpty="true" :editable="true" :on-save="handlePayWaySave">
              <template #actions="{ row }">
                <el-button link type="danger" @click="deletePayWay(row)">
                  删除
                </el-button>
              </template>
            </editable-table>
          </template>
          <div class="pay-summary">
            付款合计：<span>{{ formatDecimal(totalPayAmt) }}</span>
            <span v-if="!toBig(totalPayAmt).isEqualTo(toBig(actualReqAmt))" class="pay-error">
              （必须等于实际请款金额 {{ formatDecimal(actualReqAmt) }}）
            </span>
            <span v-else class="pay-success">（等于实际请款金额）</span>
          </div>
        </FormCard>

        <!-- ====== 卡片：发票信息 ====== -->
        <FormCard id="card-invoice" icon="🧾" title="发票信息" v-model:collapsed="collapsedCards.invoice">
          <SummaryBar :items="summaryItems" />

          <template v-if="isReadonly">
            <base-table ref="invoiceMTableRef" :columns="invoiceMColumns" :table-data="invoiceMTable" :row-key="'id'"
              :pagination="false" :show-toolbar="false" :show-action-bar="false" :height="'200px'">
              <template #annexName="{ row }">
                <div class="annex-cell">
                  <el-link v-if="row.annexId" type="primary" :underline="'hover'" @click="handleViewAnnex(row)">
                    {{ row.annexName || "查看附件" }}
                  </el-link>
                </div>
              </template>
              <template #actions="{ row }">
                <div class="actions-btn">
                  <el-button link type="primary" :disabled="!(row.annexId && row.invoiceDs?.length)"
                    @click="detailInvoiceM(row)">
                    发票明细
                  </el-button>
                </div>
              </template>
            </base-table>
          </template>
          <template v-else>
            <editable-table ref="invoiceMTableRef" :row-key="'id'" :height="'200px'" v-model="invoiceMTable"
              :columns="invcColumns" :pagination="false" :highlight-current-row="false" :show-summary="false"
              :compactEmpty="true" :editable="true">
              <template #actionBar>
                <div class="actionBar-buttons">
                  <el-button type="primary" size="small" @click="handleUploadInvoice">
                    上传发票
                  </el-button>
                </div>
              </template>

              <template #annexName="{ row }">
                <div class="annex-cell">
                  <el-link v-if="row.annexId" type="primary" :underline="'hover'" @click="handleViewAnnex(row)">
                    {{ row.annexName || "查看附件" }}
                  </el-link>
                </div>
              </template>

              <template #actions="{ row }">
                <div class="actions-btn">
                  <el-button link type="primary" :disabled="!row.annexId" @click="handleInspect(row)">
                    查验
                  </el-button>
                  <el-button link type="primary" :disabled="!(row.annexId && row.invoiceDs?.length)"
                    @click="detailInvoiceM(row)">
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

        <!-- ====== 卡片：财务明细（仅详情查看，只读） ====== -->
        <!-- <FormCard
          v-if="isDetail"
          id="card-finance"
          v-show="!isOffsetByInvoice"
          icon="📊"
          title="财务分摊"
          v-model:collapsed="collapsedCards.finance"
        >
          <base-table
            ref="financeTableRef"
            :row-key="'id'"
            :height="'200px'"
            :columns="financeColumns"
            :table-data="financeTable"
            :pagination="false"
            :show-toolbar="false"
            :show-action-bar="false"
          />
        </FormCard> -->

        <!-- ====== 卡片：相关附件 ====== -->
        <FormCard id="card-annex" icon="📎" title="相关附件" v-model:collapsed="collapsedCards.annex">
          <el-form-item label="相关附件">
            <base-upload v-model:file-list="baseFileList" :limit="9" :multiple="false" :showIcon="true" :showTip="true"
              :maxSize="20" :unrestricted="true" :accept="''" button-text="选择文件" size="default" :disabled="isReadonly"
              @success="handleUploadSuccess" />
          </el-form-item>
        </FormCard>

      </el-form>
    </div>

    <!-- ============ 悬浮定位栏 ============ -->
    <FloatNav :items="visibleNavCards" />
  </div>
  <!-- ============ 选择主合同弹窗 ============ -->
  <choose-contract-dialog ref="contractDialogRef" v-model="mainConDialogVisible" :selectionMode="'single'"
    :projId=formData.projId @select="handleMainConSelect" />
  <!-- 上传发票弹窗 -->
  <UploadInvoiceDialog v-model="uploadVisibleDialog" @success="getInvcData" />
  <!-- 发票明细 弹窗 -->
  <invoice-detail-dialog ref="invoiceDetailDialogRef" v-model="dialogVisible" :detailList="detailList"
    :disabled="isReadonly" @success="handleInvoiceDetailSuccess" />

  <!-- 财务分摊  -->
  <FinanceAllocationDialog ref="financeAllocationDialogRef" v-model="financeAllocVisible" :bizType="'CON_PAY'"
    :bizBillId="billData?.id" :bizId="paymentData?.id" @select="getFinaList" @updateData="updateData">
  </FinanceAllocationDialog>
</template>

<script setup lang="ts">
// ============================================================
// 编译器宏
// ============================================================
defineOptions({ name: "payment-application-form" });

interface Props {
  mode: "add" | "edit" | "detail";
  projId?: number;
  conId?: number;
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

// ============================================================
// 第三方 / UI 框架
// ============================================================
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import { ref, watch, onMounted, computed, nextTick } from "vue";
import { v4 as uuidv4 } from "uuid";

// ============================================================
// 业务组件
// ============================================================
import FormCard from "@/components/base/base-form-card.vue";
import FloatNav from "@/components/base/base-float-nav.vue";
import EditableTable from "@/components/base/editable-table.vue";
import PickInput from "@/components/base/base-pick-input.vue";
import BaseUpload from "@/components/base/base-upload.vue";
import ChooseContractDialog from "@/components/business/choose-contract-dialog.vue";
import InvoiceDetailDialog from "@/components/business/invoice-detail-dialog.vue";

// ============================================================
// API
// ============================================================
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { conTypeApi } from "@/api/cost/master-data/contract-category-api";
import { commonApi } from "@/api/cost/common-api";
import { paymentRequestApi } from "@/api/cost/contract-manage/payment-application-api.ts";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { paymentAccountApi } from "@/api/cost/contract-manage/payment-account-api";
import { cumulativeDataApi } from "@/api/cost/contract-manage/cumulative-data-api";

// ============================================================
// 常量 / 枚举 / 类型
// ============================================================
import { ADVANCE_PAY_TYPE, ReqTypeEnum } from "@/constants/contract-manage/enums";
import { YesOrNoStatusEnum } from "@/constants/master-data/enums";
import { formType } from "@/types/form/form-types";
import {
  HConBillInvoiceD,
  HConBillInvoiceM,
} from "@/types/cost/contract-manage/payment-application-type.ts";
import {
  NAV_CARDS,
  createInvcColumns,
  invoiceMColumns,
  dedDetailColumns,
  createPayWayColumns,
  createFinanceColumns,
  createDedColumns,
  payWayDetailColumns,
} from "./payment-application-config";

// ============================================================
// 工具函数 / 组合式
// ============================================================
import { useUserStore } from "@/stores/user-store";
import { useMDStore } from "@/stores/md-store.ts";
import { useTagsStore } from "@/stores/tags-store";
import { useRouter } from "vue-router";
import { dateUtil } from "@/utils/date-util";
import { useFormLayout } from "@/composables/use-form-layout.ts";
import { buildFileUrl } from "@/utils/file-path-util";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { isJianAnByConType } from "@/composables/use-contract";
import { isJianAnByFeeType } from "@/composables/use-fee";
import { getOptionsLabelById } from "@/utils/enum";
import { moneyRule, requiredInputRule, requiredRule } from "@/utils/form-rule-validate";
import { buildTree } from "@/utils/tree";
import FinanceAllocationDialog from "@/views/cost/finance-allocation/finance-allocation-dialog.vue";
import { invcRecognitionRefresh, useInvoiceRecognition } from "@/composables/use-Invc-verif";
import { useMenuStore } from "@/stores/menu-store";
import { toBig, formatDecimal, BigNumber } from "@/utils/big-number.ts";

// ============================================================
// 路由 / 状态仓库 实例化
// ============================================================
const router = useRouter();
const userStore = useUserStore();
const mdStore = useMDStore();
const tagsStore = useTagsStore();
const menuStore = useMenuStore();
// ============================================================
// 组合式实例化
// ============================================================
const { collapsedCards, toggleCard, formatMoney } = useFormLayout(NAV_CARDS);

// ============================================================
// 页面状态：加载 / 模式
// ============================================================
const formRef = ref();
const submitLoading = ref(false);
const loadingForm = ref(false); // 表单加载态
const isDetail = computed(() => props.mode === "detail");
const isEdit = computed(() => props.mode === "edit");
const isAdd = computed(() => props.mode === "add");
const isReadonly = computed(() => {
  // 超管保留编辑权限
  if (isSuperAdmin.value) return false;
  return isDetail.value || !!billData.value.status
});
// 是否是超管角色
const isSuperAdmin = computed(() => {
  return userStore.roleList?.some((role: any) => role.isSuper);
});

const conId = ref<number | undefined>(props.conId);
const paymentId = ref<number | undefined>(props.paymentId);
const uploadVisibleDialog = ref(false);
const financeAllocVisible = ref(false);

// ============================================================
// 单据 / 流程状态
// ============================================================
const billData = ref({
  id: undefined,
  bizTitle: "",
  bizNo: "",
  status: 0,
  bizItemCode: formType.CON_PAY,
  flowId: null,
  createDate: null,
});
const paymentData = ref(null)
const flowListData = ref<any>(null);
const flowBaseData = ref<any>(null);

// ============================================================
// 下拉选项
// ============================================================
const projectOptions = ref([]);
const subjectOptions = ref([]);
const conTypeOptions = ref<any[]>([]);
const paymentTypeOptions = ref<any[]>([]);
const dedTypeOptions = ref<any[]>([]);
const payWayOptions = ref<any[]>([]);
const feeTypeOptions = ref([]);
// 费用组织 / 费用科目（随项目变化刷新）
const finaOrgOptions = ref<any[]>([]);
const finaSubOptions = ref<any[]>([]);

// 合同分类是否属于建安
const conTypeIsJianAn = ref(false);
// 建安类：需报产值合同；非建安类：直接请款，不可超款项比例/合同金额

// ============================================================
// 子表数据
// ============================================================
const dedTable = ref([]);
const invoiceMTable = ref([]);
const payWayTable = ref([]);
const financeTable = ref([]);

// 附件列表
const baseFileList = ref([]);
const bankFileList = ref([]);
const tempFileList = ref([]);
const currentUploadRow = ref(null);
const hiddenUploadRef = ref();
const dialogVisible = ref(false);
const detailList = ref([]);

// ============================================================
// 主表单数据
// ============================================================
const formData = ref({
  id: undefined as number | undefined,
  conBillId: undefined as number | undefined,
  flowId: null,
  bizTitle: "",
  bizNo: "",
  segId: undefined,
  segCode: "",
  segNo: "",
  segName: "",
  projId: undefined,
  userName: userStore.userInfo?.empName,
  createDate: dateUtil().format("YYYY-MM-DD"),
  deptName: userStore.userInfo?.deptName,
  mguName: userStore.userInfo?.mguName,
  compId: null,
  compName: "",
  status: 0, // 状态 0 草稿，5 审批中，10 已审批，30 已作废

  conId: null,
  conName: "",
  supId: null,
  supName: "",
  conTypeId: null,
  conTypeName: "",
  conSysNo: "",
  conPhyNo: "",
  conStatus: null,

  payTypeId: null, // 款项类型
  payTypeIsCtrl: null, // 款项类型请款是否强控
  finaTypeId: null,
  belongMonth: null,
  needSettle: true,
  isLastPay: false, // 是否最后一次支付，需结算时，才显示该项
  signAmt: 0, // 合同签约金额
  addAmt: 0, // 补充合同金额
  sumChangeAmt: 0, // 累计变更签证
  preSettleAmt: 0, // 预结算合同金额
  settledAmt: null, // 结算金额
  sumProdVal: 0, // 累计产值
  sumPayAmt: 0, // 累计应付
  sumAppyAmt: 0, // 累计请款
  sumDedAmt: 0, //累计奖罚
  sumPaidAmt: 0, // 累计实付
  sumOwedAmt: 0, // 累计欠款
  payOutRate: 0, // 应付占产值比率
  paidPayRate: 0, // 实付占应付比率
  paidOutRate: 0, // 实付占产值比率
  reqType: 0, // 请款类型 0=请款、1=来票冲账
  payRule: 0, // 付款规则：0-正常请款 1-来票冲账
  isRise: false, // 是否提高支付比例
  isNeedOutValue: true, // 是否需要产值
  conProperty: null, // 合同属性
  leavePayAmt: 0, // 剩余应付金额
  sysCanPayAmt: 0, // 系统计算可请款金额
  reqAmt: 0, // 请款总金额
  pbAmount: 0, // 转履约保证金金额
  changeAmt: 0, // 奖罚总金额（扣款）
  factReqAmt: 0, // 实际请款金额
  reqDesc: "", // 请款说明
  invRecAmt: 0, // 应收发票金额
  invRcvdAmt: 0, // 已收发票
  invOweAmt: 0, // 欠票金额

  isModifyAcc: false, // 修改收款账号 0-否 1-是
  bankName: "", // 收款开户行
  accountName: "", // 收款账户名
  bankAccount: "", // 收款账号
  modifyAccAnnex: undefined, // 修改凭证附件

  unlockAmt: null, // 解锁金额
});

// ============================================================
// 列定义（工厂函数，依赖选项 ref）
// ============================================================
const financeColumns = createFinanceColumns({
  projectOptions,
  subjectOptions,
});
const payWayColumns = createPayWayColumns({
  payWayOptions,
});
const dedColumns = createDedColumns({
  dedTypeOptions,
});
const invcColumns = createInvcColumns();

// ============================================================
// 计算属性：导航 / 显隐
// ============================================================
const visibleNavCards = computed(() => {
  let cards = !isOffsetByInvoice.value
    ? NAV_CARDS
    : NAV_CARDS.filter(
      (card) =>
        card.id !== "card-account" &&
        card.id !== "card-ded" &&
        card.id !== "card-payway" &&
        card.id !== "card-finance",
    );
  // 财务明细仅在详情查看，导航也随之隐藏
  if (!isDetail.value) {
    cards = cards.filter((card) => card.id !== "card-finance");
  }
  return cards;
});

const showMaterial = computed(() => {
  return true;
});

const showBankAnnex = computed(() => {
  return formData.value.isModifyAcc === true;
});

const showLastPay = computed(() => {
  return !formData.value.needSettle;
});

// ============================================================
// 计算属性：结算金额标签
// ============================================================
/** 合同已结算（conStatus = 60） */
const isConSettled = computed(
  () => Number(formData.value.conStatus) === 60 || conTypeIsJianAn.value === false,
);
/** 标签跟着切 */
const settleAmtLabel = computed(() => (isConSettled.value ? "结算金额" : "预结算金额"));
const settleAmtProp = computed(() => (isConSettled.value ? "settledAmt" : "preSettleAmt"));
const settleAmtValue = computed(() =>
  isConSettled.value
    ? Number(formData.value.settledAmt || 0)
    : Number(formData.value.preSettleAmt || 0),
);

// 已解锁应付余额 = 已解锁应付总额 - 累计请款金额
const unlockLastAmt = computed(() => {
  const unlock = toBig(formData.value.unlockAmt ?? 0);
  const sumAppy = toBig(formData.value.sumAppyAmt ?? 0);
  return unlock.minus(sumAppy).decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
});

// ============================================================
// 计算属性：扣款 / 发票 汇总
// ============================================================
const dedSumData = computed(() => calculateDedData());

function calculateDedData() {
  const result = {
    totalAmt: new BigNumber(0),
    addAmt: new BigNumber(0),
    minAmt: new BigNumber(0),
    toLvAmt: new BigNumber(0),
  };

  if (!dedTable.value?.length) {
    return {
      totalAmt: 0,
      addAmt: 0,
      minAmt: 0,
      toLvAmt: 0,
    };
  }

  dedTable.value.forEach((item) => {
    const amt = toBig(item.dedThisAmt || 0);
    const isLvType = item.dedTypeId === 2102;

    result.totalAmt = result.totalAmt.plus(amt);

    if (amt.isGreaterThan(0)) {
      result.addAmt = result.addAmt.plus(amt);
    } else if (isLvType) {
      result.toLvAmt = result.toLvAmt.plus(amt);
    } else if (amt.isLessThan(0)) {
      result.minAmt = result.minAmt.plus(amt);
    }
  });

  return {
    totalAmt: result.totalAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber(),
    addAmt: result.addAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber(),
    minAmt: result.minAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber(),
    toLvAmt: result.toLvAmt.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber(),
  };
}
const invcSumData = computed(() => calculateInvcData());
function calculateInvcData() {
  if (!invoiceMTable.value || invoiceMTable.value.length === 0) {
    return { totalAmt: 0 };
  }
  let total = new BigNumber(0);
  invoiceMTable.value.forEach((item) => {
    total = total.plus(toBig(item.totalAmt || 0));
  });
  return {
    totalAmt: total.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber(),
  };
}

// 扣款汇总条数据
const summaryDedItems = computed(() => [
  { label: "奖罚总金额", value: `¥ ${formatMoney(dedSumData.value.totalAmt)}` },
  { label: "扣款合计", value: `¥ ${formatMoney(dedSumData.value.minAmt)}`, type: "tax" as const },
  { label: "奖励合计", value: `¥ ${formatMoney(dedSumData.value.addAmt)}` },
  {
    label: "转履约保证金合计",
    value: `¥ ${formatMoney(dedSumData.value.toLvAmt)}`,
    type: "tax" as const,
  },
]);

// 发票汇总条数据
const summaryItems = computed(() => {
  const sumAppyAmt = toBig(formData.value.sumAppyAmt ?? 0);
  const reqAmt = toBig(formData.value.reqAmt ?? 0);
  const invRcvdAmt = toBig(formData.value.invRcvdAmt ?? 0);
  const totalAmt = toBig(invcSumData.value.totalAmt ?? 0);

  const shouldReceive = sumAppyAmt.plus(reqAmt);
  const owedAmt = shouldReceive.minus(invRcvdAmt).minus(totalAmt);

  return [
    { label: "应收发票金额", value: `¥ ${formatMoney(shouldReceive.toNumber())}` },
    { label: "已收发票金额", value: `¥ ${formatMoney(invRcvdAmt.toNumber())}` },
    { label: "本次收票金额", value: `¥ ${formatMoney(totalAmt.toNumber())}` },
    {
      label: "欠票金额",
      value: `¥ ${formatMoney(owedAmt.toNumber())}`,
      type: owedAmt.isGreaterThan(0) ? ("error" as const) : ("primary" as const),
    },
  ];
});

// ============================================================
// 计算属性：派生金额
// ============================================================
// 1. 实际请款金额 = 请款总金额 + 扣款明细金额之和
const actualReqAmt = computed(() => {
  const reqAmt = toBig(formData.value.reqAmt || 0);
  let totalDedAmt = new BigNumber(0);
  dedTable.value.forEach((item) => {
    totalDedAmt = totalDedAmt.plus(toBig(item.dedThisAmt || 0));
  });
  return reqAmt.plus(totalDedAmt).decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
});

// 2. 已收发票金额 = 发票列表发票总金额汇总
const receivedInvoiceAmt = computed(() => {
  let total = new BigNumber(0);
  invoiceMTable.value.forEach((item) => {
    total = total.plus(toBig(item.totalAmt || 0));
  });
  return total.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
});

// 3. 应收发票金额 = 实际请款金额
const receivableInvoiceAmt = computed(() => {
  return actualReqAmt.value;
});

// 4. 欠票金额 = 应收发票金额 - 已收发票金额
const oweInvoiceAmt = computed(() => {
  const receivable = toBig(receivableInvoiceAmt.value);
  const received = toBig(receivedInvoiceAmt.value);
  return receivable.minus(received).decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
});

// 5. 付款方式付款金额合计
const totalPayAmt = computed(() => {
  let total = new BigNumber(0);
  payWayTable.value.forEach((item) => {
    total = total.plus(toBig(item.payAmt || 0));
  });
  return total.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
});

// ============================================================
// 计算属性：费用类型过滤 / 强制提高比例 / 来票冲账
// ============================================================
/** 建安类合同 → 仅保留顶级 code=03 的费用类型；非建安类 → 剔除 */
const filteredFeeTypeOptions = computed(() => {
  const tree: any[] = feeTypeOptions.value || [];
  if (!tree.length) return [];
  return conTypeIsJianAn.value
    ? tree.filter((n) => isJianAnByFeeType(feeTypeOptions, n.id))
    : tree.filter((n) => !isJianAnByFeeType(feeTypeOptions, n.id));
});

/** 收集一棵费用类型树里所有可选 id，用于校验当前选中值是否仍合法 */
function collectFeeTypeIds(nodes: any[], acc: any[] = []) {
  nodes.forEach((n) => {
    acc.push(n.id);
    if (n.children && n.children.length) collectFeeTypeIds(n.children, acc);
  });
  return acc;
}

const needForceRise = computed(() => {
  if (!conTypeIsJianAn.value) return false;
  const req = Number(formData.value.reqAmt) || 0;
  const payable = Number(formData.value.sumAppyAmt) || 0;
  const unlock = Number(formData.value.unlockAmt) || 0;
  return (req + payable > unlock) && formData.value.payTypeId !== ADVANCE_PAY_TYPE; // 建安类 且 请款总额+累计已请款 > 已解锁
});

/** 是否「来票冲账」：此时仅保留发票登记，其余明细/收款账号全部隐藏，校验一并放开 */
const isOffsetByInvoice = computed(() => formData.value.reqType != 0);

// ============================================================
// 工具函数
// ============================================================
// 归属月份只能选择当月及以前（禁止未来月份）
const disabledBelongMonth = (date: Date) => {
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth(); // 0-based
  const year = date.getFullYear();
  const month = date.getMonth();
  if (year > curYear) return true;
  if (year === curYear && month > curMonth) return true;
  return false;
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

// 通用：按 uuid 更新子表某一行
const updateInvcMRow = (rowIndex: number, data: any) => {
  Object.assign(invoiceMTable.value[rowIndex], data);
  invoiceMTable.value = [...invoiceMTable.value];
};

const updateDedRow = (rowIndex: number, data: any) => {
  const newData = [...dedTable.value];
  newData[rowIndex] = { ...dedTable.value[rowIndex], ...data };
  dedTable.value = newData;
};

// ============================================================
// 计算逻辑（只读态不计算）
// ============================================================
const calcFields = () => {
  if (isReadonly.value) return; // 详情只读不计算
  const d = formData.value;
  // 实际请款金额由 actualReqAmt 计算属性统一驱动（不在此处覆盖）
  // 剩余应付金额 = 累计应付 - 累计实付
  d.leavePayAmt = toBig(d.sumPayAmt || 0).minus(toBig(d.sumPaidAmt || 0))
    .decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
  // 欠票金额 = 应收发票金额 - 已收发票
  d.invOweAmt = toBig(d.invRecAmt || 0).minus(toBig(d.invRcvdAmt || 0))
    .decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();

  const sumProdVal = toBig(d.sumProdVal || 0);
  const sumPayAmt = toBig(d.sumPayAmt || 0);
  const sumPaidAmt = toBig(d.sumPaidAmt || 0);

  // 应付占产值比 = 累计应付 / 累计产值 × 100%
  d.payOutRate = sumProdVal.isGreaterThan(0)
    ? sumPayAmt.dividedBy(sumProdVal).times(100).decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber()
    : 0;

  // 实付占应付比 = 累计实付 / 累计应付 × 100%
  d.paidPayRate = sumPayAmt.isGreaterThan(0)
    ? sumPaidAmt.dividedBy(sumPayAmt).times(100).decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber()
    : 0;

  // 实付占产值比 = 累计实付 / 累计产值 × 100%
  d.paidOutRate = sumProdVal.isGreaterThan(0)
    ? sumPaidAmt.dividedBy(sumProdVal).times(100).decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber()
    : 0;
};

// ============================================================
// 事件处理：主合同选择
// ============================================================
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
    let newData = data || [];
    if (formData.value.conId != newData[0].id) {
      conId.value = newData[0].id;
      await getConMainData(newData[0].id);
      await getConSumData(newData[0].id);
      await getConDefaultBank();
    }
  }
};

// ============================================================
// 事件处理：扣款明细（奖罚调整）
// ============================================================
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

const handleDedSave = async ({ row, column, newValue, oldValue, rowIndex }) => {
  ;
  if (column === "dedTypeId") {
    const targetData = dedTypeOptions.value?.find((item) => item.id == newValue);
    if (targetData) {
      let amt = row.dedThisAmt;
      if (targetData.dicValue == "1") {
        if (amt < 0) {
          amt = -amt;
          updateDedRow(rowIndex, { dedTypeId: newValue, dedThisAmt: amt });
        }
      } else {
        if (amt > 0) {
          amt = -amt;
          updateDedRow(rowIndex, { dedTypeId: newValue, dedThisAmt: amt });
        }
      }
    } else updateDedRow(rowIndex, { dedTypeId: newValue, dedThisAmt: 0 });
    return;
  }
  if (column === "dedThisAmt") {
    const targetData = dedTypeOptions.value?.find((item) => item.id == row.dedTypeId);
    if (targetData) {
      if (targetData.dicValue == "1") {
        if (newValue <= 0) {
          ElMessage.error("调增金额必须为正数");
          updateDedRow(rowIndex, { dedThisAmt: -newValue });
          return;
        }
      } else {
        if (newValue >= 0) {
          ElMessage.error("扣款金额必须为负数");
          updateDedRow(rowIndex, { dedThisAmt: -newValue });
          return;
        }
      }
    }
  }
};

// ============================================================
// 事件处理：发票
// ============================================================
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


const invcRecognition = useInvoiceRecognition();
const getInvcData = async (fileList: any) => {
  // ① 识别前：按文件名粗筛（同文件重复上传通常同名），减少无效识别调用
  const existNames = new Set(
    invoiceMTable.value.filter((r) => r.success).map((r) => r.annexName)
  );
  const preFiltered = fileList.filter((f) => !existNames.has(f.annexName));
  if (preFiltered.length < fileList.length) {
    ElMessage.warning(`已按文件名跳过 ${fileList.length - preFiltered.length} 张重复文件`);
  }

  // ② 识别（只传未重复的）
  const rows = await invcRecognition(fileList, {
    conBillId: formData.value.conBillId,
    srcType: formType.CON_PAY,
    generateUuid: uuidv4,
  });

  if (!rows) return;

  // ③ 识别后：按发票号 invNo 精确去重（历史 + 本次批次内都拦）
  const norm = (v: any) => (v == null ? "" : String(v).trim());

  const seen = new Set(
    invoiceMTable.value.map((r) => norm(r.invNo)).filter(Boolean)
  );

  const uniqueRows = rows.filter((r) => {
    const no = norm(r.invNo);
    if (!no) return true;        // 无发票号（识别失败/未知）保留，便于重试
    if (seen.has(no)) return false;
    seen.add(no);                // 同时拦「历史重复」和「本次批次内重复」
    return true;
  });

  if (uniqueRows.length < rows.length) {
    ElMessage.warning(`已按发票号跳过 ${rows.length - uniqueRows.length} 张重复发票`);
  }
  if (uniqueRows.length > 0) invoiceMTable.value.push(...uniqueRows);
}

// // 获取上传的发票
// const getAnnexFileList = async (fileList: any) => {
//   console.log("上传的发票", fileList);
//   if (fileList && fileList.length > 0) {
//     const notify = ElNotification({
//       title: "发票识别中",
//       message: `正在识别 ${fileList.length} 张发票，请稍候...`,
//       type: "info",
//       duration: 0, // 不自动关闭
//       position: "top-right",
//     });
//     try {
//       await batchInvoiceRecognition(fileList);
//       notify.close();
//       ElNotification({
//         title: "识别完成",
//         message: `成功识别 ${fileList.length} 张发票！`,
//         type: "success",
//         duration: 3000,
//         position: "top-right",
//       });
//     } catch (error) {
//       ElMessage.error("发票识别失败");
//     } finally {
//       notify.close();
//     }
//   }
// };

// // 批量识别发票
// const batchInvoiceRecognition = async (invoiceDataList: any[]) => {
//   const recognitionPromises = invoiceDataList.map(async (item) => {
//     return await invoiceRecognition(item.id, item.annexName);
//   });

//   try {
//     const results: any = await Promise.allSettled(recognitionPromises);
//     console.log("识别结果List", results);

//     if (results && results.length > 0) {
//       const newData = results.map((result, index) => {
//         if (result.status === "fulfilled") {
//           return {
//             ...result.value,
//             uuid: uuidv4(),
//             id: undefined,
//             srcType: formType.CON_PAY,
//             conBillId: formData.value.conBillId,
//           };
//         } else {
//           const originalItem = invoiceDataList[index];
//           return {
//             annexId: originalItem.id,
//             annexName: originalItem.annexName,
//             uuid: uuidv4(),
//             id: undefined,
//             srcType: formType.CON_PAY,
//             conBillId: formData.value.conBillId,
//             invNo: undefined,
//             invDate: undefined,
//             totalAmt: 0,
//             notTaxAmt: 0,
//             taxAmt: 0,
//             invType: "",
//             invoiceDs: [],
//           };
//         }
//       });
//       invoiceMTable.value = [...invoiceMTable.value, ...newData];
//     }
//   } catch (error) {
//     console.error("批量识别发票失败:", error);
//   }
// };

// // 发票识别
// const invoiceRecognition = async (annexId: number, annexName: string) => {
//   try {
//     const res = await commonApi.recognizeAndCheckInvoice({ annexId: annexId });
//     console.log("识别结果", res);
//     if (res.code === 200 && res.data) {
//       const { finalData } = res.data;
//       if (finalData) {
//         let detailListData = [];
//         if (finalData.InvoiceProducts && finalData.InvoiceProducts.length > 0) {
//           finalData.InvoiceProducts.forEach((item: any) => {
//             detailListData.push({
//               itemName: item.Name,
//               size: item.SpecModel,
//               unit: item.MeasureUnit,
//               num: item.Qty,
//               price: item.Price,
//               totalAmt: item.Amount,
//               taxRate: item.TaxRate,
//               taxAmt: item.TaxPrice,
//             });
//           });
//         }
//         const newData = {
//           annexId: annexId,
//           annexName: annexName,
//           invNo: finalData.InvoiceNumber,
//           invDate: finalData.InvoiceDate,
//           totalAmt: finalData.Amount,
//           notTaxAmt: finalData.TotalPrice,
//           taxAmt: finalData.TotalTaxPrice,
//           invType: finalData.InvoiceCategoryName,
//           buyerCompany: finalData.BuyerCompany,
//           buyerTaxCode: finalData.BuyerTaxCode,
//           sellerCompany: finalData.InvoiceCompany,
//           sellerTaxCode: finalData.TaxpayerCode,
//           isValid: finalData.InvoiceValidate == 1 ? true : false,
//           validateMsg: finalData.ValidateMsg,
//           ocrRes: finalData.OCRRes || "",
//           validateRes: finalData.ValidateRes || "",
//           status:
//             finalData.InvoiceValidate == 1
//               ? 1
//               : finalData.InvoiceValidate == 0
//                 ? 2
//                 : 0,
//           invoiceDs: detailListData,
//         };
//         return newData;
//       } else {
//         return {
//           annexId: annexId,
//           annexName: annexName,
//           invoiceDs: [],
//         };
//       }
//     } else {
//       return {
//         annexId: annexId,
//         annexName: annexName,
//         invoiceDs: [],
//       };
//     }
//   } catch (error) {
//     return {
//       annexId: annexId,
//       annexName: annexName,
//       invoiceDs: [],
//     };
//   }
// };

// 查验
const handleInspect = async (row: any) => {
  if (!row.annexId) {
    ElMessage.warning("暂无发票！");
    return;
  }

  const invcData = await invcRecognitionRefresh(row);

  const recogniRowIndex = invoiceMTable.value.findIndex(
    (item) => item.uuid == row.uuid,
  );
  updateInvcMRow(recogniRowIndex, invcData);
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
      updateInvcMRow(recogniRowIndex, { invoiceDs: data });
    }
  }
};

const deleteInvoiceM = ({ uuid }) => {
  invoiceMTable.value = invoiceMTable.value.filter((item) => item.uuid !== uuid);
};

// 为某行打开上传
const openUploadForRow = (row: any) => {
  if (row.recogStatus === 3) {
    ElMessage.warning("发票正在识别中，请稍后再操作");
    return;
  }
  currentUploadRow.value = row;
  tempFileList.value = [];

  nextTick(() => {
    hiddenUploadRef.value?.triggerFileSelect();
  });
};

// 发票识别（uuid 用作识别成功后的数据匹配回填）
const recognizeInvoiceAsync = async (currUuid: string, annexId: number) => {
  console.log("发票识别", annexId, currUuid);
  try {
    const conBillId = formData.value.id || props.conId;
    const params = {
      annexId: annexId,
    };
    const res = await commonApi.recognizeInvoice(params);
    if (res.code === 200 && res.data) {
      const { mainInfo, detailList = [] } = res.data;
      const recogniRowIndex = invoiceMTable.value.findIndex(
        (item) => item.uuid == currUuid,
      );
      if (recogniRowIndex !== -1 && mainInfo) {
        const newData = {
          invNo: mainInfo.invNo,
          invDate: mainInfo.invDate,
          totalAmt: mainInfo.totalAmt,
          notTaxAmt: mainInfo.notTaxAmt,
          taxAmt: mainInfo.taxAmt,
          invType: mainInfo.invType,
          recogStatus: 1,
          detailList: detailList,
        };
        updateInvcMRow(recogniRowIndex, newData);
      }
    } else {
      const failIndex = invoiceMTable.value.findIndex((item) => item.uuid === currUuid);
      if (failIndex !== -1) {
        updateInvcMRow(failIndex, { recogStatus: 2 });
      }
    }
  } catch (error) { }
};

const addInvoiceM = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    invNo: undefined,
    invDate: undefined,
    totalAmt: 0,
    notTaxAmt: 0,
    taxAmt: 0,
    invType: "",
    annexId: undefined,
    recogStatus: undefined,
    detailList: [],
  };
  invoiceMTable.value = [...invoiceMTable.value, newRowData];
};

// 上传账号修改附件
const handleBankUploadSuccess = (file: any) => {
  bankFileList.value.push(file);
};

// 上传相关附件
const handleUploadSuccess = (file: any) => {
  baseFileList.value.push(file);
};

// ============================================================
// 事件处理：付款方式 / 财务分摊
// ============================================================
const getFinaList = (data) => {
  console.log("获取的财务分摊数据", data);
  payWayTable.value = data || [];
};
const updateData = () => {
  // 刷新页面
  loadDetail();
}
const handleFinanceAlloc = () => {
  if (!formData.value.segId) {
    ElMessage.error("请先选择项目");
    return;
  }
  if (payWayTable.value.length > 0) {
    financeAllocVisible.value = true;
  } else {
    ElMessage.error("请先添加付款方式");
  }
};
const addPayWay = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    payWayId: undefined, // 付款方式
    payAmt: 0, // 付款金额
    dedRoomAmt: 0, // 其中抵房金额
  };
  payWayTable.value = [...payWayTable.value, newRowData];
};
const deletePayWay = (row) => {
  payWayTable.value = payWayTable.value.filter((item) => item.uuid !== row.uuid);
};

// 付款方式编辑保存回调：付款方式非“转账”时清空抵房金额
const handlePayWaySave = ({ row, column }: { row: any; column: string }) => {
  if (column === "payWayId" && row.payWayId !== 2066) {
    row.dedRoomAmt = 0;
  }
};

const addFinance = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    projId: undefined,
    acctProjId: undefined,
    subId: undefined,
    subAmt: 0,
  };
  financeTable.value = [...financeTable.value, newRowData];
};
const deleteFinance = (row) => {
  financeTable.value = financeTable.value.filter((item) => item.uuid !== row.uuid);
};

// ============================================================
// 数据加载 / 字典
// ============================================================
// 初始化数据字典
const { getDictList, loadDicts } = useDict(
  [dictMapping.paymentType, dictMapping.dedType, dictMapping.payType],
  { treeDictCodes: [] },
);

const initDictData = async () => {
  await loadDicts();
  paymentTypeOptions.value = getDictList(dictMapping.paymentType); // 款项类型
  dedTypeOptions.value = getDictList(dictMapping.dedType);
  payWayOptions.value = getDictList(dictMapping.payType); // 支付方式
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

// 查询费用类型
const getPayTypeOptions = async (segId: number) => {
  try {
    const res = await dictionaryApi.getCostTypeListBySegId({ segId: segId });
    if (res.code === 200) {
      feeTypeOptions.value = buildTree(res.data || []);
    }
  } catch (error) { }
};

// 费用科目（依赖项目）
const getFinaSubOptions = async (projId: number, segId?: any) => {
  try {
    const res = await costCategoryApi.getCostSubjectProjList({ projId, withDetail: true });
    if (res.code === 200) {
      finaSubOptions.value = res.data || [];
      subjectOptions.value = res.data || []; // 同步财务明细表所用选项
    }
  } catch (error) {
    console.error("获取费用科目失败:", error);
  }
};

// 费用组织（依赖项目/组织）；接口待接入，先做存在性保护避免报错
const getFinaOrgOptions = async (projId: number, segId?: any) => {
  try {
    const api = costCategoryApi as any;
    if (typeof api.getCostOrgList !== "function") return;
    const res = await api.getCostOrgList({ projId, segId });
    if (res && res.code === 200) {
      finaOrgOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取费用组织失败:", error);
  }
};

/**
 * 查询合同默认收款账号
 */
const getConDefaultBank = async () => {
  if (!formData.value.conId) {
    return;
  }
  try {
    const res = await paymentAccountApi.getSupBankList({
      conId: formData.value.conId,
      isDefault: true,
    });
    ;
    if (res.code === 200) {
      const bank = (res.data && res.data[0]) || null;
      formData.value.bankName = bank?.bankName || "";
      formData.value.accountName = bank?.accountName || "";
      formData.value.bankAccount = bank?.bankAccount || "";
    } else {
      ElMessage.error(res.msg || "查询合同默认账号失败");
    }
  } catch (error) {
    console.error("查询合同默认账号失败:", error);
  }
};

/**
 * 查询合同款项类型信息
 */
const getConPayType = async () => {
  const { conId, payTypeId } = formData.value;
  if (!conId || !payTypeId) {
    return;
  }
  try {
    const res = await contractLedgerApi.getContractPayRateList({
      conId,
      payTypeId,
    });
    if (res.code === 200) {
      const data = (res.data && res.data[0]) || null;
      formData.value.payTypeIsCtrl = data?.isCtrl ?? null;
    } else {
      ElMessage.error(res.msg || "查询合同款项信息失败！");
    }
  } catch (error) {
    console.error("查询合同款项信息失败:", error);
  }
};

// 切换项目
const changeProject = async (value: number) => {
  if (value) {
    const res = await projectAreaApi.getInfoByProjId({ id: value });
    if (res.code === 200 && res.data) {
      const { compName, compId, segId, segName, segNo } = res.data;
      formData.value.segId = segId || "";
      formData.value.segName = segName || "";
      formData.value.segNo = segNo || "";

      // 清空原合同相关信息
      clearContractInfo();

      // 重新获取依赖项目的下拉数据
      feeTypeOptions.value = [];
      finaOrgOptions.value = [];
      finaSubOptions.value = [];
      getPayTypeOptions(segId);
      getFinaOrgOptions(value, segId);
      getFinaSubOptions(value, segId);
      // 程序化重置了若干字段，清除误报的必填红
      await nextTick();
      formRef.value?.clearValidate();
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
  f.compName = "";
  f.compId = null;
  f.conSysNo = "";
  f.conPhyNo = "";
  f.needSettle = true;
  f.finaTypeId = null; // 费用类型随项目变化，重置
  f.isModifyAcc = false; // 修改收款账号复位为“否”
  f.signAmt = 0;
  f.addAmt = 0;
  f.sumChangeAmt = 0;
  f.preSettleAmt = 0;
  f.settledAmt = null;
  f.sumProdVal = 0;
  f.sumPayAmt = 0;
  f.sumAppyAmt = 0;
  f.sumDedAmt = 0;
  f.sumPaidAmt = 0;
  f.sumOwedAmt = 0;
  f.payOutRate = 0;
  f.paidPayRate = 0;
  f.paidOutRate = 0;
  f.leavePayAmt = 0;
  f.factReqAmt = 0;
  f.unlockAmt = 0;
  f.payTypeIsCtrl = null;
  f.isLastPay = null;
};

// 获取合同累计金额信息 0=产值,1=应付,2=请款,3=已付,4=欠款,7=变更,8=签证,9=解锁应付,10=补充合同
const getConSumData = async (conId) => {
  try {
    const res = await cumulativeDataApi.getAccumData({
      conId: conId,
      typeList: [0, 1, 2, 3, 6, 7, 8, 9, 10, 11, 13],
    });

    if (res.code !== 200 || !res.data) {
      console.warn("获取合同累计金额信息失败:", res.message);
      return;
    }

    const dataMap = new Map();
    res.data?.forEach((item) => {
      const total = toBig(item.archAmt || 0).plus(toBig(item.inTransAmt || 0));
      dataMap.set(item.type, total);
    });

    const [
      sumProdVal, // 0
      sumPayAmt, // 1
      sumAppyAmt, // 2
      sumPaidAmt, // 3
      sumDedAmt, // 6 奖罚
      changeAmt, // 7 变更
      visaAmt, // 8 签证
      unlockAmt, // 9 解锁应付
      addAmt, // 10 补充合同金额
      sumOwedAmt, // 11 请款金额
      invRcvdAmt, // 12 已收发票
    ] = [0, 1, 2, 3, 6, 7, 8, 9, 10, 11, 13].map((type) => {
      const val = dataMap.get(type) || new BigNumber(0);
      return val.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();
    });

    const sumChangeAmt = toBig(changeAmt).plus(toBig(visaAmt))
      .decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber();

    const calcRate = (numerator: number, denominator: number) => {
      const num = toBig(numerator);
      const den = toBig(denominator);
      return den.isGreaterThan(0)
        ? num.dividedBy(den).times(100).decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber()
        : 0;
    };

    formData.value.addAmt = addAmt;
    formData.value.sumChangeAmt = sumChangeAmt;
    formData.value.sumProdVal = sumProdVal;
    formData.value.sumPayAmt = sumPayAmt;
    formData.value.sumAppyAmt = sumAppyAmt;
    formData.value.sumDedAmt = sumDedAmt;
    formData.value.sumPaidAmt = sumPaidAmt;
    formData.value.sumOwedAmt = sumOwedAmt;
    formData.value.unlockAmt = unlockAmt;
    formData.value.invRcvdAmt = invRcvdAmt;
    formData.value.payOutRate = calcRate(sumPayAmt, sumProdVal);
    formData.value.paidPayRate = calcRate(sumPaidAmt, sumPayAmt);
    formData.value.paidOutRate = calcRate(sumPaidAmt, sumProdVal);
  } catch (error) {
    console.error("获取合同信息失败:", error);
  }

  // 取结算金额
  try {
    const res = await cumulativeDataApi.getSettleData({
      conId: conId,
      typeList: [0, 1],
    });

    if (res.code !== 200 || !res.data) {
      console.warn("获取合同计算信息失败:", res.message);
      return;
    }

    const stMap = new Map();
    res.data.forEach((item) => {
      stMap.set(item.type, item.archivedAmt || 0);
    });

    const [preSettleAmt, settledAmt] = [0, 1].map((type) => stMap.get(type) || 0);

    formData.value.preSettleAmt = preSettleAmt;
    formData.value.settledAmt = settledAmt;
  } catch (error) {
    console.error("获取合同结算信息失败:", error);
  }
};

// 获取合同信息
const getConMainData = async (conId) => {
  if (!conId) return;
  if (conId === formData.value.conId) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: conId,
    });
    if (res.code === 200 && res.data) {
      const { conMain } = res.data;
      ;
      if (formData.value.projId != conMain.projId) {
        await changeProject(conMain.projId);
        ;
        formData.value.projId = conMain.projId;
      }

      formData.value.conId = conMain.id;
      formData.value.conName = conMain.conName;
      formData.value.supId = conMain.supID;
      formData.value.supName = conMain.supName;
      formData.value.conTypeId = conMain.conTypeId;
      formData.value.conTypeName = conMain.conTypeName;
      formData.value.conStatus = conMain.conStatus;
      formData.value.compName = conMain.companyName;
      formData.value.projId = conMain.projId;
      formData.value.compId = conMain.companyId;
      formData.value.conSysNo = conMain.conSysNo;
      formData.value.conPhyNo = conMain.conPhyNo;
      formData.value.needSettle = conMain.needSettle;

      formData.value.signAmt = conMain.signAmt;
      // formData.value.settledAmt = conMain.settledAmt;
      // formData.value.preSettleAmt = conMain.preSettleAmt;
      // formData.value.addAmt = conMain.addAmt;
      // formData.value.sumChangeAmt = conMain.sumChangeAmt;
      // formData.value.sumProdVal = conMain.sumProdVal;
      // formData.value.sumPayAmt = conMain.sumPayAmt;
      // formData.value.sumAppyAmt = conMain.sumAppyAmt;
      // formData.value.sumDedAmt = conMain.sumDedAmt;
      // formData.value.sumPaidAmt = conMain.sumPaidAmt;
      // formData.value.sumOwedAmt = conMain.sumOwedAmt;
      // formData.value.payOutRate = conMain.payOutRate;
      // formData.value.paidPayRate = conMain.paidPayRate;
      // formData.value.paidOutRate = conMain.paidOutRate;
      // formData.value.leavePayAmt = conMain.leavePayAmt;

      conTypeIsJianAn.value = isJianAnByConType(conTypeOptions, formData.value.conTypeId);
      ;
    }
  } catch (error) {
    console.error("获取合同信息失败:", error);
  }
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
  const { flowList, flowBase, bill, payment, payWays, paySubs, invoiceMs, invoiceDs, billDeds, annexList, bankAnnexList } = data;
  billData.value = { ...billData.value, ...bill };
  paymentData.value = { ...paymentData.value, ...payment };
  flowListData.value = { ...flowListData.value, ...flowList };
  flowBaseData.value = { ...flowBaseData.value, ...flowBase };

  Object.assign(formData.value, payment || {});
  if (payment?.conBillId) {
    formData.value.projId = flowBase.projId;
    await changeProject(formData.value.projId);
    formData.value.conBillId = payment.conBillId;
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

    formData.value.id = payment.id;
    formData.value.conId = payment.conId;
    formData.value.conName = payment.conName;
    formData.value.supId = payment.supId;
    formData.value.supName = payment.supName;
    formData.value.conTypeId = payment.conTypeId;
    formData.value.conTypeName = payment.conTypeName;
    formData.value.isNeedOutValue = payment.isNeedOutValue;
    formData.value.conProperty = payment.conProperty;
    formData.value.conStatus = payment.conStatus;

    formData.value.signAmt = payment.signAmt;
    formData.value.addAmt = payment.addAmt;
    formData.value.sumChangeAmt = payment.sumChangeAmt;
    formData.value.preSettleAmt = payment.preSettleAmt;
    formData.value.isLastPay = payment.isLastRec;
    formData.value.unlockAmt = payment.unlockAmt;
    formData.value.payTypeIsCtrl = payment.payTypeIsCtrl;

    formData.value.settledAmt = payment.settledAmt ?? null;
    formData.value.needSettle = payment.needSettle ?? formData.value.needSettle;

    formData.value.sumProdVal = payment.sumProdVal;
    formData.value.sumPayAmt = payment.sumPayAmt;
    formData.value.sumAppyAmt = payment.sumAppyAmt;
    formData.value.sumDedAmt = payment.sumDedAmt;
    formData.value.sumPaidAmt = payment.sumPaidAmt;
    formData.value.sumOwedAmt = payment.sumOwedAmt;
    formData.value.payOutRate = payment.payOutRate;
    formData.value.paidPayRate = payment.paidPayRate;
    formData.value.paidOutRate = payment.paidOutRate;
    formData.value.reqType = payment.reqType;
    formData.value.finaTypeId = payment.finaTypeId;
    formData.value.isRise = payment.isRise;
    formData.value.leavePayAmt = payment.leavePayAmt;
    formData.value.reqAmt = payment.reqAmt;
    formData.value.pbAmount = payment.pbAmount;
    formData.value.changeAmt = payment.changeAmt;
    formData.value.factReqAmt = payment.factReqAmt;
    formData.value.reqDesc = payment.reqDesc;
    formData.value.invRecAmt = payment.invRecAmt;
    formData.value.invRcvdAmt = payment.invRcvdAmt;
    formData.value.invOweAmt = payment.invOweAmt;
    formData.value.isModifyAcc = payment.isModifyAcc;
    formData.value.bankName = payment.bankName;
    formData.value.accountName = payment.accountName;
    formData.value.bankAccount = payment.bankAccount;
    formData.value.modifyAccAnnex = payment.modifyAccAnnex;
    formData.value.status = payment.status;
    formData.value.payRule = payment.payRule;
    formData.value.belongMonth = payment.belongMonth;
    formData.value.payTypeId = payment.payTypeId;

    conTypeIsJianAn.value = isJianAnByConType(conTypeOptions, formData.value.conTypeId);
    await nextTick();
    formRef.value?.clearValidate("finaTypeId");
  }

  payWayTable.value = payWays?.map((item) => ({ ...item, uuid: uuidv4() })) || [];
  financeTable.value = paySubs?.map((item) => ({ ...item, uuid: uuidv4() })) || [];
  dedTable.value = billDeds?.map((item) => ({ ...item, uuid: uuidv4() })) || [];
  invoiceMTable.value =
    invoiceMs?.map((item: HConBillInvoiceM) => {
      const details = invoiceDs?.filter((d: HConBillInvoiceD) => d.invMid === item.id) || [];
      return {
        ...item,
        uuid: uuidv4(),
        detailList: details,
      };
    }) || [];

  if (annexList && annexList.length > 0) {
    baseFileList.value = annexList.map((item: any) => ({
      ...item,
      name: item.annexName,
      url: item.annexPath,
    }));
  }

  if (formData.value.modifyAccAnnex) {
    const res = await commonApi.getFileList({ annexId: formData.value.modifyAccAnnex });
    if (res.code === 200 && res.data) {
      if (res.data.length > 0) {
        bankFileList.value = res.data.map((item: any) => ({
          ...item,
          name: item.annexName,
          url: item.annexPath,
        }));
      }
    }
  }
};

// 生成单据编号
const createBillNo = async () => {
  try {
    const conRes = await commonApi.getBillNo({ bizType: formType.CON_PAY });
    if (conRes.code === 200) {
      formData.value.bizNo = conRes.data;
    }
  } catch (error) {
    console.error("生成合同编号失败:", error);
  }
};

// ============================================================
// 保存 / 提交
// ============================================================
// 校验规则（动态）：来票冲账时放开“修改收款账号”
const formRules = computed(() => {
  const rules: Record<string, any> = {
    bizTitle: requiredInputRule("标题"),
    projId: requiredRule("项目名称"),
    conId: requiredRule("合同名称"),
    belongMonth: requiredRule("归属月份"),
    finaTypeId: requiredRule("费用类型"),
    payTypeId: requiredRule("款项类型"),
    reqType: requiredRule("请款类型"),
    reqAmt: moneyRule("请款总金额"),
    conTyeName: requiredRule("合同分类"),
    isRise: requiredRule("是否提高支付比例"),
    bankAccount: requiredInputRule("银行账号"),
  };
  if (!isOffsetByInvoice.value) {
    rules.isModifyAcc = requiredRule("是否修改支付账号");
  }
  return rules;
});

// 是否可请结算款或质保金：如合同需要结算，但是还未计算，则不允许请结算款
const canApplySettle = computed(() => {
  return formData.value.needSettle === true && formData.value.conStatus !== 60;
});

// 提交前校验：扣款明细 / 付款方式 / 收款账号 / 付款合计=实际请款
const validateDetailTables = (): boolean => {
  if (isOffsetByInvoice.value && invoiceMTable.value.length === 0) {
    ElMessage.error("请上传发票！");
    return false;
  }

  if (isOffsetByInvoice.value) return true;

  for (const row of dedTable.value) {
    const filled =
      row.dedName ||
      (row.dedThisAmt !== undefined && row.dedThisAmt !== null && row.dedThisAmt !== 0) ||
      row.dedTypeId;
    if (filled) {
      if (!row.dedName || !row.dedTypeId || !row.dedThisAmt) {
        ElMessage.error("扣款明细：已填写的行必须完整填写 事项名称、金额、类型");
        return false;
      }
    }
  }

  if (payWayTable.value.length === 0) {
    ElMessage.error("请至少添加一种付款方式");
    return false;
  }
  for (const row of payWayTable.value) {
    if (!row.payWayId || row.payAmt === undefined || row.payAmt === null || row.payAmt === 0) {
      ElMessage.error("付款方式：每一行必须填写 付款方式 与 付款金额");
      return false;
    }
    if (row.payWayId === 2066 && row.payAmt < row.dedRoomAmt) {
      ElMessage.error("付款方式：抵房金额不能大于付款金额！");
      return false;
    }
    row.payDesc = formData.value.conName + formData.value.belongMonth + getOptionsLabelById(payWayOptions.value, formData.value.payTypeId);
    row.bankName = formData.value.bankName;
    row.accountName = formData.value.accountName;
    row.bankAccount = formData.value.bankAccount;
  }

  const totalPay = toBig(totalPayAmt.value);
  const actualAmt = toBig(actualReqAmt.value);
  if (!totalPay.isEqualTo(actualAmt)) {
    ElMessage.error(
      `付款方式金额合计（${totalPay.decimalPlaces(2).toString()}）必须等于实际请款金额（${actualAmt.decimalPlaces(2).toString()}）`,
    );
    return false;
  }

  if (formData.value.isModifyAcc === true) {
    if (
      !formData.value.bankName ||
      !formData.value.accountName ||
      !formData.value.bankAccount ||
      bankFileList.value.length === 0
    ) {
      ElMessage.error("修改收款账号为“是”时，收款开户行、账户名、收款账号、修改凭证附件均为必填");
      return false;
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

const buildSubmitParams = () => {
  // 非建安类时，隐藏的 5 个字段提交置 0，避免带脏数据入库
  const jianAn = conTypeIsJianAn.value === true;
  const sumChangeAmt = jianAn ? formData.value.sumChangeAmt : 0;
  const preSettleAmt = jianAn ? formData.value.preSettleAmt : 0;
  const sumProdVal = jianAn ? formData.value.sumProdVal : 0;
  const sumPayAmt = jianAn ? formData.value.sumPayAmt : 0;
  const payOutRate = jianAn ? formData.value.payOutRate : 0;
  const paidOutRate = jianAn ? formData.value.paidOutRate : 0;
  return {
    bill: {
      ...billData.value,
      id: billData.value.id || undefined,
      bizTitle: formData.value.bizTitle,
      bizItemCode: formType.CON_PAY,
      segId: formData.value.segId,
      segName: formData.value.segName,
      segNo: formData.value.segNo,
      projId: formData.value.projId,
      compId: formData.value.compId,
      compName: formData.value.compName,
      flowId: formData.value.flowId,
      conId: formData.value.conId,
      bizNo: formData.value.bizNo,
    },
    payment: {
      id: formData.value.id,
      conBillId: formData.value.conBillId,
      conId: formData.value.conId,
      signAmt: formData.value.signAmt,
      addAmt: formData.value.addAmt,
      sumChangeAmt: sumChangeAmt,
      preSettleAmt: preSettleAmt,
      sumProdVal: sumProdVal,
      sumPayAmt: sumPayAmt,
      sumAppyAmt: formData.value.sumAppyAmt,
      sumDedAmt: formData.value.sumDedAmt,
      sumPaidAmt: formData.value.sumPaidAmt,
      sumOwedAmt: formData.value.sumOwedAmt,
      payOutRate: payOutRate,
      paidPayRate: formData.value.paidPayRate,
      paidOutRate: paidOutRate,
      reqType: formData.value.reqType,
      finaTypeId: formData.value.finaTypeId,
      isRise: formData.value.isRise,
      leavePayAmt: formData.value.leavePayAmt,
      reqAmt: formData.value.reqAmt,
      pbAmount: formData.value.pbAmount,
      changeAmt: dedSumData.value.totalAmt,
      factReqAmt: actualReqAmt.value,
      reqDesc: formData.value.reqDesc,
      invRecAmt: toBig(formData.value.sumAppyAmt ?? 0).plus(toBig(formData.value.reqAmt ?? 0))
        .decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber(),
      invRcvdAmt: formData.value.invRcvdAmt ?? 0,
      invOweAmt: toBig(formData.value.sumAppyAmt ?? 0)
        .plus(toBig(formData.value.reqAmt ?? 0))
        .minus(toBig(formData.value.invRcvdAmt ?? 0))
        .minus(toBig(invcSumData.value.totalAmt ?? 0))
        .decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber(),
      isModifyAcc: formData.value.isModifyAcc,
      bankName: formData.value.bankName,
      accountName: formData.value.accountName,
      bankAccount: formData.value.bankAccount,
      modifyAccAnnex: bankFileList.value[0]?.id,
      status: formData.value.status,
      payRule: formData.value.payRule,
      belongMonth: formData.value.belongMonth,
      payTypeId: formData.value.payTypeId,
      conStatus: formData.value.conStatus,
      isLastRec: formData.value.isLastPay,
      unlockAmt: formData.value.unlockAmt,
      payTypeIsCtrl: formData.value.payTypeIsCtrl,
      settledAmt: formData.value.settledAmt,
    },
    billDeds: !isOffsetByInvoice.value ? dedTable.value : [],
    invoiceMs: invoiceMTable.value,
    // invoiceDs: detailList.value,
    payWays: !isOffsetByInvoice.value ? payWayTable.value : [],
    paySubs: !isOffsetByInvoice.value ? financeTable.value : [],
    annexList: baseFileList.value || [],
  };
};

const handleFormDataSave = async () => {
  submitLoading.value = true;
  try {
    await formRef.value.validateField(["bizTitle", "projId", "conId", "belongMonth", "finaTypeId", "payTypeId"]);
    if (canApplySettle.value === false && (formData.value.payTypeId === 2064 || formData.value.payTypeId === 2065)) {
      ElMessage.error("该合同尚未结算，不可请结算款和质保金！");
      return;
    }
    const params = buildSubmitParams();
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
    await getConSumData(conId.value);
    if (canApplySettle.value === false && (formData.value.payTypeId === 2064 || formData.value.payTypeId === 2065)) {
      ElMessage.error("该合同尚未结算，不可请结算款和质保金！");
      return;
    }

    if (needForceRise.value && !formData.value.isRise) {
      ElMessage.error("建安类合同：请款总金额与累计已请款之和已超过可解锁请款金额，必须将【是否提高支付比例】设为'是'！");
      return;
    }
    if (!validateDetailTables()) {
      submitLoading.value = false;
      return;
    }
    if (!isOffsetByInvoice.value && formData.value.isModifyAcc && bankFileList.value.length === 0) {
      ElMessage.error("请上传修改收款银行账号的相关凭证附件！");
      return;
    }

    const params = buildSubmitParams();
    const res = await paymentRequestApi.submitPay(params);

    if (res.code === 200) {
      ElMessage.success("提交成功,已发起审批！");
      const redirectRes = await commonApi.generateRedirectUrl({
        oaRequestId: res.data,
      });
      goBack();

      if (redirectRes.code === 200 && redirectRes.data) {
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

const handleCancel = async () => {
  ElMessageBox.confirm("确定要作废吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await paymentRequestApi.voidPay({ id: formData.value.id });
      if (res.code === 200) {
        ElMessage.success("作废成功");
        goBack();
      }
    } catch (error) {
      console.error("作废失败:", error);
    }
  });
};

const handleDelete = async () => {
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const res = await paymentRequestApi.delPay({ id: formData.value.id });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        goBack();
      }
    } catch (error) {
      console.error("删除失败:", error);
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

// 返回操作
const goBack = () => {
  if (isAdd.value) {
    tagsStore.closeTagByPath("/con/payment-application/add");
  }
  if (isEdit.value) {
    tagsStore.closeTagByPath("/con/payment-application/edit");
  }
  router.go(-1);
};

// ============================================================
// 监听器
// ============================================================
// 监听 conId、payTypeId 变化 → 查合同款项信息
watch(
  () => [formData.value.conId, formData.value.payTypeId],
  ([newConId, newPayTypeId], [oldConId, oldPayTypeId]) => {
    if (isReadonly.value) return;
    if (oldConId == null && oldPayTypeId == null) return;
    if (
      newConId != null &&
      newPayTypeId != null &&
      (newConId !== oldConId || newPayTypeId !== oldPayTypeId)
    ) {
      getConPayType();
    }
  },
);

// 强制提高支付比例
watch(needForceRise, () => {
  if (isReadonly.value) return;
  if (needForceRise.value && !formData.value.isRise) {
    formData.value.isRise = true;
  }
});

// 监听变化自动计算（已锁/欠款/比率等）
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

// 实际请款金额变化：同步展示字段；付款方式仅一行时联动其付款金额
watch(actualReqAmt, (val) => {
  if (isReadonly.value) return;
  if (!isDetail.value) {
    formData.value.factReqAmt = val;
  }
  if (payWayTable.value.length === 1) {
    payWayTable.value[0].payAmt = val;
  }
});

// 修改收款账号切换为“否”时，回填合同收款信息
watch(
  () => formData.value.isModifyAcc,
  (val) => {
    if (isReadonly.value) return;
    if (val !== true) {
      getConDefaultBank();
      formData.value.modifyAccAnnex = undefined;
    }
  },
);

// 建安标记 / 费用类型选项变化后，若当前已选费用类型不在允许范围内则清空
watch([() => conTypeIsJianAn.value, filteredFeeTypeOptions], () => {
  if (isReadonly.value) return;
  const id = formData.value.finaTypeId;
  if (id == null) return;
  const allowIds = collectFeeTypeIds(filteredFeeTypeOptions.value || []);
  if (allowIds && allowIds.length > 0 && !allowIds.includes(id)) {
    formData.value.finaTypeId = null;
  }
});

// 切换请款类型时，清除残留的校验红字
watch(
  () => formData.value.reqType,
  async () => {
    if (isReadonly.value) return;
    await nextTick();
    formRef.value?.clearValidate();
  },
);

// ============================================================
// 初始化 / 生命周期
// ============================================================
const initData = async () => {
  loadingForm.value = true;
  try {
    await initDictData();
    await getProjectOptions();
    await getConTypeList();
    await getCostSubjectProjList();
    if (props.mode === "add") {
      await createBillNo();
      await getConMainData(conId.value);
      await getConSumData(conId.value);
      await getConDefaultBank();
      if (payWayTable.value.length === 0) {
        addPayWay();
      }
    } else if ((props.mode === "edit" || props.mode === "detail") && props.paymentId) {
      await loadDetail();
    }
  } finally {
    loadingForm.value = false;
  }
};

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
