<!-- 付款申请 审批 -->
<template>
  <div class="basic-form-content">
    <div class="form-header">
      <div class="header-title">付款申请审批</div>
      <div class="header-btn">
        <el-button
          type="primary"
          icon="DocumentAdd"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          保存
        </el-button>
        <el-button
          type="success"
          plain
          icon="Promotion"
          @click="handleSubmitAndApprove"
        >
          提交
        </el-button>
        <el-button type="danger" plain icon="Delete" @click="handleDelete">
          删除
        </el-button>
        <el-button type="warning" plain icon="Remove" @click="handleInvalid">
          作废
        </el-button>
        <el-button type="info" plain icon="View" @click="handleViewFlow">
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
        <!-- 基础信息 -->
        <div class="item-card">
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="18" :xl="18">
              <el-form-item label="标题" prop="title">
                <el-input
                  v-model="formData.title"
                  clearable
                  :disabled="isDetail"
                  placeholder="标题"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="审批状态" prop="approvalStatus">
                <el-tag
                  :type="statusTypeMap[formData.approvalStatus]?.type || 'info'"
                >
                  {{ statusTypeMap[formData.approvalStatus]?.label || "草稿" }}
                </el-tag>
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
                  :disabled="isDetail"
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
              <el-form-item label="板块编码" prop="segCode">
                <el-input
                  v-model="formData.segCode"
                  clearable
                  :disabled="true"
                  placeholder="板块编码"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="部门" prop="departmentName">
                <el-input
                  v-model="formData.departmentName"
                  clearable
                  :disabled="isDetail"
                  placeholder="部门"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="分部" prop="branchName">
                <el-input
                  v-model="formData.branchName"
                  clearable
                  :disabled="isDetail"
                  placeholder="分部"
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
                  clearable
                  :disabled="isDetail"
                  @change="changeProject"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="项目所属公司" prop="companyName">
                <el-input
                  v-model="formData.companyName"
                  clearable
                  placeholder="项目所属公司"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="提交人" prop="submiterName">
                <el-input
                  v-model="formData.submiterName"
                  clearable
                  :disabled="true"
                  placeholder="提交人"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="提交时间" prop="submiterDate">
                <el-input
                  v-model="formData.submiterDate"
                  clearable
                  :disabled="true"
                  placeholder="提交时间"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 合同信息 -->
        <div class="item-card">
          <div class="section-title">合同信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="合同名称" prop="conName">
                <el-input
                  v-model="formData.conName"
                  clearable
                  :disabled="isDetail"
                  placeholder="合同名称"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同编号" prop="conNo">
                <el-input
                  v-model="formData.conNo"
                  clearable
                  :disabled="isDetail"
                  placeholder="合同编号"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="供应商名称" prop="supplierName" required>
                <el-input
                  v-model="formData.supplierName"
                  placeholder="供应商名称"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="生产专业" prop="productionMajor">
                <el-input
                  v-model="formData.productionMajor"
                  placeholder="生产专业"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同类别" prop="conType" required>
                <el-select
                  v-model="formData.conType"
                  placeholder="合同类别"
                  style="width: 100%"
                  :disabled="isDetail"
                >
                  <el-option label="施工合同" value="1" />
                  <el-option label="采购合同" value="2" />
                  <el-option label="服务合同" value="3" />
                  <el-option label="劳务合同" value="4" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="签约合同金额" prop="conAmount">
                <el-input-number
                  v-model="formData.conAmount"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="补充合同金额" prop="supplementAmount">
                <el-input-number
                  v-model="formData.supplementAmount"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计变更签证" prop="totalChangeVisa">
                <el-input-number
                  v-model="formData.totalChangeVisa"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="预结算合同金额" prop="preSettlementAmount">
                <el-input-number
                  v-model="formData.preSettlementAmount"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计产值" prop="totalOutputValue">
                <el-input-number
                  v-model="formData.totalOutputValue"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计应付" prop="totalPayable">
                <el-input-number
                  v-model="formData.totalPayable"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计请款" prop="totalRequest">
                <el-input-number
                  v-model="formData.totalRequest"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计实付" prop="totalPaid">
                <el-input-number
                  v-model="formData.totalPaid"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="累计欠款" prop="totalArrears">
                <el-input-number
                  v-model="formData.totalArrears"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="应付占产值比" prop="payableOutputRatio">
                <el-input
                  v-model="formData.payableOutputRatio"
                  placeholder="应付占产值比"
                  style="width: 100%"
                  :disabled="true"
                >
                  <template #append>%</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="实付占应付比" prop="paidPayableRatio">
                <el-input
                  v-model="formData.paidPayableRatio"
                  placeholder="实付占应付比"
                  style="width: 100%"
                  :disabled="true"
                >
                  <template #append>%</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="实付占产值比" prop="paidOutputRatio">
                <el-input
                  v-model="formData.paidOutputRatio"
                  placeholder="实付占产值比"
                  style="width: 100%"
                  :disabled="true"
                >
                  <template #append>%</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 计划请款 -->
        <div class="item-card">
          <div class="section-title">计划请款</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="请款类型" prop="applyType">
                <el-select
                  v-model="formData.applyType"
                  placeholder="请款类型"
                  style="width: 100%"
                  :disabled="isDetail"
                >
                  <el-option label="正常请款" :value="1" />
                  <el-option label="来票冲账" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="请款单号" prop="applyNo">
                <el-input
                  v-model="formData.applyNo"
                  clearable
                  :disabled="true"
                  placeholder="请款单号"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="款项类型" prop="paymentType">
                <el-select
                  v-model="formData.paymentType"
                  placeholder="款项类型"
                  style="width: 100%"
                  :disabled="isDetail"
                >
                  <el-option label="工程款" value="1" />
                  <el-option label="材料款" value="2" />
                  <el-option label="服务费" value="3" />
                  <el-option label="保证金" value="4" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item
                label="计划请款全额"
                prop="planApplyAmount"
                required
              >
                <el-input-number
                  v-model="formData.planApplyAmount"
                  :precision="2"
                  :controls="false"
                  :min="0.01"
                  placeholder="0.00"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 调整情况 -->
        <div class="item-card">
          <div class="section-title">调整情况</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="调整小计" prop="adjustTotal">
                <el-input-number
                  v-model="formData.adjustTotal"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="其中扣款" prop="deductionAmount">
                <el-input-number
                  v-model="formData.deductionAmount"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="奖励" prop="bonusAmount">
                <el-input-number
                  v-model="formData.bonusAmount"
                  :precision="2"
                  :controls="false"
                  :min="0"
                  placeholder="0.00"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="转履约保证金" prop="toPerformanceBond">
                <el-input-number
                  v-model="formData.toPerformanceBond"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <div>
            <div class="header-content">
              <span class="header-title">扣款事项明细</span>
              <el-button type="primary" size="small" @click="handleAddDed">
                新增扣款事项
              </el-button>
            </div>
            <editable-table
              ref="dedTableRef"
              :row-key="'uuid'"
              :height="'200px'"
              v-model="dedTable"
              :columns="dedColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :editable="true"
            >
              <template #actions="{ row }">
                <el-button link type="danger" @click="handleDeleteDed(row)">
                  删除
                </el-button>
              </template>
            </editable-table>
          </div>
          <el-row>
            <el-col :span="8">
              <el-form-item
                label="是否涉及转履约保证金"
                prop="adjustRemark"
                label-width="180px"
              >
                <el-select
                  v-model="formData.needSeal"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="是" :value="true" />
                  <el-option label="否" :value="false" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                label="转入履约保证金金额"
                prop="adjustRemark"
                label-width="180px"
              >
                <el-input-number
                  v-model="formData.signAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="转入履约保证金金额"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                label="本单请款金额"
                prop="adjustRemark"
                label-width="180px"
              >
                <span>99999</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item
                label="调整说明"
                prop="adjustRemark"
                label-width="90px"
              >
                <el-input
                  v-model="formData.adjustRemark"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入调整说明"
                  :disabled="isDetail"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 发票登记 -->
        <div class="item-card">
          <div class="section-title">发票登记</div>
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
                <el-button type="primary" size="small" @click="addInvoiceM">
                  新增发票
                </el-button>
              </div>
            </template>
            <template #recogStatus="{ row }">
              <el-tag
                :type="getRecogStatus(row.recogStatus).type"
                disable-transitions
              >
                {{ getRecogStatus(row.recogStatus).text }}
              </el-tag>
            </template>
            <template #actions="{ row }">
              <div class="actions-btn">
                <el-button
                  link
                  type="primary"
                  @click.stop="openUploadForRow(row)"
                >
                  {{ row.annexId ? "重新上传" : "上传发票" }}
                </el-button>
                <el-button
                  link
                  type="primary"
                  :disabled="!(row.annexId && row.recogStatus == 1)"
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
          <!-- 放在表格外面的上传组件（隐藏） -->
          <Teleport to="body">
            <div style="display: none" @click.stop @mousedown.stop>
              <base-upload
                ref="hiddenUploadRef"
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
          <!-- 发票明细 弹窗 -->
          <invoice-detail-dialog
            ref="invoiceDetailDialogRef"
            v-model="dialogVisible"
            :detailList="detailList"
          />
        </div>

        <!-- 支付方式 -->
        <div class="item-card">
          <div class="section-title">支付方式</div>
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
        </div>

        <!-- 收款信息 -->
        <div class="item-card">
          <div class="section-title">收款信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="开户行" prop="conName">
                <el-input
                  v-model="formData.conName"
                  clearable
                  :disabled="isDetail"
                  placeholder="开户行"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="账户名" prop="conNo">
                <el-input
                  v-model="formData.conNo"
                  clearable
                  :disabled="isDetail"
                  placeholder="账户名"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="账号" prop="conType" required>
                <el-input
                  v-model="formData.conNo"
                  clearable
                  :disabled="isDetail"
                  placeholder="账户名"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="是否修改账号" prop="conAmount">
                <el-select
                  v-model="formData.needSeal"
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
              <el-form-item label="账号修改凭证" prop="supplementAmount">
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch, nextTick } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { useUserStore } from "@/stores/user-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";
import EditableTable from "@/components/base/editable-table.vue";
import { EditableColumn } from "@/components/base/editable-table.vue";
import BaseUpload from "@/components/base/base-upload.vue";
import InvoiceDetailDialog from "@/components/business/invoice-detail-dialog.vue";
import { dedTypeEnum } from "@/constants/contract-manage/enums";
import {
  NconBillInvoiceD,
  NconBillInvoiceM,
  NconPaymentWay,
} from "@/types/cost/non-contract-manage/cst-payment-type";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";

defineOptions({ name: "payment-approval-form" });

interface Props {
  mode?: "add" | "edit" | "detail";
  paymentId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  paymentId: undefined,
});

const emit = defineEmits<{
  (e: "success", data: any): void;
  (e: "cancel"): void;
}>();

// ==================== 状态映射 ====================
const statusTypeMap: Record<number, { label: string; type: string }> = {
  0: { label: "草稿", type: "info" },
  1: { label: "审批中", type: "warning" },
  2: { label: "已通过", type: "success" },
  3: { label: "已驳回", type: "danger" },
  4: { label: "已作废", type: "info" },
};

// 识别状态常量
const RECOG_STATUS_CONFIG = {
  0: { text: "未识别", type: "info" },
  1: { text: "识别成功", type: "success" },
  2: { text: "识别失败", type: "danger" },
  3: { text: "识别中", type: "warning" },
} as const;

const getRecogStatus = (status: number) => {
  return (
    RECOG_STATUS_CONFIG[status as keyof typeof RECOG_STATUS_CONFIG] ||
    RECOG_STATUS_CONFIG[0]
  );
};

const router = useRouter();
const userStore = useUserStore();

const formRef = ref<FormInstance>();
const projCascaderRef = ref();
const submitLoading = ref(false);

const mode = ref<"add" | "edit" | "detail">(props.mode);
const paymentId = ref<number | undefined>(props.paymentId);

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");

const segOptions = ref([]);
const projectOptions = ref([]);

const { getDictList, loadDicts } = useDict([dictMapping.payType], {
  treeDictCodes: [],
});
const payTypeOptions = ref([]);

// ==================== 发票登记相关 ====================
const invoiceMTable = ref<NconBillInvoiceM[]>([]);
const invoiceMColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "invNo",
    label: "发票号",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "invDate",
    label: "开票日期",
    editable: true,
    editType: "date",
    showOverflowTooltip: false,
  },
  {
    prop: "totalAmt",
    label: "发票总金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "notTaxAmt",
    label: "不含税金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "taxAmt",
    label: "税额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "invType",
    label: "发票类型",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "annexName",
    label: "附件",
    editable: false,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    slot: "recogStatus",
    label: "识别状态",
    editable: false,
  },
  {
    label: "操作",
    slot: "actions",
    width: 230,
    fixed: "right",
  },
]);

const hiddenUploadRef = ref();
const tempFileList = ref([]);
const currentUploadRow = ref(null);
const dialogVisible = ref(false);
const detailList = ref<NconBillInvoiceD[]>([]);

const addInvoiceM = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: undefined,
    srcType: "NCON_CST",
    paymentId: undefined,
    invNo: "",
    invDate: "",
    totalAmt: 0,
    notTaxAmt: 0,
    taxAmt: 0,
    invType: "",
    annexId: undefined,
    annexName: "",
    recogStatus: 0,
    detailList: [],
  };
  invoiceMTable.value = [...invoiceMTable.value, newRowData];
};

const updateRow = (rowIndex: number, data: any) => {
  Object.assign(invoiceMTable.value[rowIndex], data);
  invoiceMTable.value = [...invoiceMTable.value];
};

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

const handleUploadSuccess = (file: any) => {
  // tempFileList.value = [file];
  // if (currentUploadRow.value) {
  //   const annexId = file.id;
  //   const annexName = file.annexName || file.name;
  //   const recogStatus = 3;

  //   currentUploadRow.value.annexId = annexId;
  //   currentUploadRow.value.annexName = annexName;
  //   currentUploadRow.value.recogStatus = recogStatus;

  //   const currIndex = invoiceMTable.value.findIndex(
  //     (item) => item.uuid === currentUploadRow.value?.uuid,
  //   );
  //   if (currIndex === -1) {
  //     currentUploadRow.value = null;
  //     return;
  //   }
  //   updateRow(currIndex, { annexId, annexName, recogStatus });

  //   ElMessage.success("发票上传成功，正在识别...");
  //   recognizeInvoiceAsync(currentUploadRow.value.uuid, annexId);
  // }
};

const recognizeInvoiceAsync = async (currUuid: string, annexId: number) => {
  try {
    const res = await commonApi.recognizeInvoice({ annexId });
    if (res.code === 200 && res.data) {
      // const { mainInfo, detailList: details = [] } = res.data;
      // const recogniRowIndex = invoiceMTable.value.findIndex(
      //   (item) => item.uuid === currUuid,
      // );
      // if (recogniRowIndex !== -1 && mainInfo) {
      //   const newData = {
      //     invNo: mainInfo.invNo,
      //     invDate: mainInfo.invDate,
      //     totalAmt: mainInfo.totalAmt,
      //     notTaxAmt: mainInfo.notTaxAmt,
      //     taxAmt: mainInfo.taxAmt,
      //     invType: mainInfo.invType,
      //     recogStatus: 1,
      //     detailList: details,
      //   };
      //   updateRow(recogniRowIndex, newData);
      // }
    } else {
      // const failIndex = invoiceMTable.value.findIndex(
      //   (item) => item.uuid === currUuid,
      // );
      // if (failIndex !== -1) {
      //   updateRow(failIndex, { recogStatus: 2 });
      // }
    }
  } catch (error) {
    // const failIndex = invoiceMTable.value.findIndex(
    //   (item) => item.uuid === currUuid,
    // );
    // if (failIndex !== -1) {
    //   updateRow(failIndex, { recogStatus: 2 });
    // }
  }
};

const detailInvoiceM = (row: NconBillInvoiceM) => {
  detailList.value = row.detailList || [];
  dialogVisible.value = true;
};

const deleteInvoiceM = (row: NconBillInvoiceM) => {
  // invoiceMTable.value = invoiceMTable.value.filter(
  //   (item) => item.uuid !== row.uuid,
  // );
};

// ==================== 支付方式相关 ====================
const payWayTable = ref<NconPaymentWay[]>([]);
const payWayColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "payWayId",
    label: "付款方式",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "dicLabel",
    optionValueField: "id",
    options: payTypeOptions.value || [],
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
    prop: "dedRoomAmt",
    label: "财务确认金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    slot: "actions",
    fixed: "right",
    width: 100,
  },
]);

const addPayWay = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: undefined,
    srcType: "NCON_CST",
    paymentId: undefined,
    payWayId: undefined,
    bankName: "",
    accountName: "",
    bankAccount: "",
    payAmt: 0,
    dedRoomAmt: 0,
    payDesc: "",
  };
  payWayTable.value = [...payWayTable.value, newRowData];
};

const deletePayWay = (row: NconPaymentWay) => {
  // payWayTable.value = payWayTable.value.filter(
  //   (item) => item.uuid !== row.uuid,
  // );
};

// ==================== 扣款事项相关 ====================
const dedTable = ref([]);
const dedColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "dedTypeId",
    label: "调整大类",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "label",
    optionValueField: "value",
    options: dedTypeEnum as any,
  },
  {
    prop: "dedTypeId",
    label: "调整小类",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    optionLabelField: "label",
    optionValueField: "value",
    options: dedTypeEnum as any,
  },
  {
    prop: "dedAmt",
    label: "金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "dedDesc",
    label: "事项说明",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    width: 180,
    slot: "actions",
    fixed: "right",
  },
]);

const handleAddDed = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: undefined,
    dedId: undefined,
    dedName: "",
    dedAmt: 0,
    dedTypeId: undefined,
    dedThisAmt: 0,
    dedAlreadyAmt: 0,
    dedLeaveAmt: 0,
    dedDesc: "",
  };
  dedTable.value = [...dedTable.value, newRowData];
};

const handleDeleteDed = (row) => {
  dedTable.value = dedTable.value.filter((item) => item.uuid !== row.uuid);
};

// ==================== 表单数据 ====================
const initFormData = () => ({
  id: undefined as number | undefined,
  title: "",
  approvalStatus: 0,
  segId: undefined as number | undefined,
  segCode: "",
  departmentName: "",
  branchName: "",
  projId: undefined as number | undefined,
  companyName: "",
  submiterName: "",
  submiterDate: "",
  conName: "",
  conNo: "",
  supplierName: "",
  productionMajor: "",
  conType: "",
  conAmount: 0,
  supplementAmount: 0,
  totalChangeVisa: 0,
  preSettlementAmount: 0,
  totalOutputValue: 0,
  totalPayable: 0,
  totalRequest: 0,
  totalPaid: 0,
  totalArrears: 0,
  payableOutputRatio: "",
  paidPayableRatio: "",
  paidOutputRatio: "",
  applyType: 1,
  applyNo: "",
  paymentType: "",
  planApplyAmount: 0,
  adjustTotal: 0,
  deductionAmount: 0,
  bonusAmount: 0,
  toPerformanceBond: 0,
  adjustRemark: "",
  remark: "",
  needSeal: false,
  signAmt: 0,
});

const formData = reactive<ReturnType<typeof initFormData>>(initFormData());

const formRules: FormRules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  supplierName: [
    { required: true, message: "请输入供应商名称", trigger: "blur" },
  ],
  conType: [{ required: true, message: "请选择合同类别", trigger: "change" }],
  planApplyAmount: [
    { required: true, message: "请输入计划请款全额", trigger: "blur" },
    { type: "number", min: 0.01, message: "金额必须大于0", trigger: "blur" },
  ],
  remark: [{ max: 500, message: "备注不能超过500个字符", trigger: "blur" }],
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

// 获取项目数据
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
// 生成业务流水号
const generateApplyNo = async () => {
  try {
    const res = await commonApi.getBillNo({ bizType: "QK" });
    if (res.code === 200 && res.data) {
      formData.applyNo = res.data;
    }
  } catch (error) {
    console.error("生成请款单号失败:", error);
  }
};
// 选择项目
const changeProject = (value: number) => {
  if (value) {
    const checkedNodes = projCascaderRef.value?.getCheckedNodes();
    if (checkedNodes && checkedNodes.length > 0) {
      const node = checkedNodes[0];
      formData.companyName = node.data?.companyName || "";
    }
  }
};

const calcRatios = () => {
  const { totalOutputValue, totalPayable, totalPaid } = formData;
  if (totalOutputValue > 0) {
    formData.payableOutputRatio = (
      (totalPayable / totalOutputValue) *
      100
    ).toFixed(2);
    formData.paidOutputRatio = ((totalPaid / totalOutputValue) * 100).toFixed(
      2,
    );
  } else {
    formData.payableOutputRatio = "0.00";
    formData.paidOutputRatio = "0.00";
  }
  if (totalPayable > 0) {
    formData.paidPayableRatio = ((totalPaid / totalPayable) * 100).toFixed(2);
  } else {
    formData.paidPayableRatio = "0.00";
  }
};

const calcAdjustTotal = () => {
  const { deductionAmount, bonusAmount, toPerformanceBond } = formData;
  formData.adjustTotal =
    -(deductionAmount || 0) + (bonusAmount || 0) - (toPerformanceBond || 0);
};

// 提交
const handleSubmit = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    calcAdjustTotal();
    calcRatios();

    // TODO: 调用保存接口
    await new Promise((resolve) => setTimeout(resolve, 800));
    ElMessage.success("保存成功");
    emit("success", formData);
  } catch (error) {
    console.error("保存失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

const handleSubmitAndApprove = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    calcAdjustTotal();
    calcRatios();

    // TODO: 调用提交审批接口
    await new Promise((resolve) => setTimeout(resolve, 800));
    ElMessage.success("提交审批成功");
    emit("success", formData);
  } catch (error) {
    console.error("提交失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

const handleDelete = () => {
  if (isDetail.value) return;
  ElMessage.info("删除功能待实现");
};

const handleInvalid = () => {
  if (isDetail.value) return;
  ElMessage.info("作废功能待实现");
};

const handleViewFlow = () => {
  ElMessage.info("查看流程待实现");
};

const handleCancel = () => {
  emit("cancel");
};

// 加载付款申请详情
const loadDetail = async () => {
  if (!paymentId.value) return;
  try {
    // TODO: 调用详情接口
  } catch (error) {
    console.error("加载详情失败:", error);
  }
};

watch(
  () => [formData.totalOutputValue, formData.totalPayable, formData.totalPaid],
  () => {
    calcRatios();
  },
  { deep: true },
);

watch(
  () => [
    formData.deductionAmount,
    formData.bonusAmount,
    formData.toPerformanceBond,
  ],
  () => {
    calcAdjustTotal();
  },
  { deep: true },
);

const initData = async () => {
  await loadDicts();
  payTypeOptions.value = getDictList(dictMapping.payType);

  await Promise.all([getSegOptions(), getProjectOptions()]);

  formData.submiterName = "当前用户";
  formData.submiterDate = new Date().toLocaleString();

  if (isAdd.value) {
    await generateApplyNo();
  } else if (paymentId.value) {
    await loadDetail();
  }
};

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
    padding: 4px 0;

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

    &::before {
      content: "📊";
      margin-right: 6px;
    }
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
</style>
