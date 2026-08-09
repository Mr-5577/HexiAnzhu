<!-- 付款申请审批 审批 -->
<template>
  <div class="basic-form-content">
    <BillHeader
      :title="'付款申请审批'"
      :contract-no="billData.bizNo || ''"
      :submitter="''"
      :submit-time="''"
      :status="billData.status"
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
        label-width="120px"
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
          </el-row>
        </div>

        <!-- 实际请款 -->
        <div class="item-card">
          <div class="section-title">实际请款</div>
          <el-row>
            <el-col :span="24">
              <el-form-item
                label="本单请款金额"
                prop="adjustRemark"
                label-width="120px"
              >
                <span>99999</span>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                label="请款说明"
                prop="adjustRemark"
                label-width="120px"
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
        </div>

        <!-- 支付方式 -->
        <div class="item-card">
          <div class="section-title">支付方式</div>
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
              :on-save="handlePayWaySave"
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
        </div>

        <!-- 收款信息 -->
        <div class="item-card">
          <div class="section-title">收款信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
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
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="账号修改凭证" prop="supplementAmount">
                <base-upload
                  v-model:file-list="updateFileList"
                  :limit="9"
                  :multiple="false"
                  :showIcon="true"
                  :showTip="true"
                  :maxSize="20"
                  :unrestricted="true"
                  :accept="''"
                  button-text="选择文件"
                  size="default"
                  @success="updateFileSuccess"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 相关附件 -->
        <div class="item-card">
          <div class="section-title">相关附件</div>
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
        </div>
      </el-form>
    </div>

    <!-- 上传发票弹窗 -->
    <UploadInvoiceDialog
      v-model="uploadVisibleDialog"
      @success="getAnnexFileList"
    />

    <!-- 发票明细 弹窗 -->
    <invoice-detail-dialog
      ref="invoiceDetailDialogRef"
      v-model="dialogVisible"
      :detailList="detailList"
      @success="handleInvoiceDetailSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch, nextTick } from "vue";
import {
  ElMessage,
  ElNotification,
  type FormInstance,
  type FormRules,
} from "element-plus";
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
import UploadInvoiceDialog from "@/components/business/upload-invoice-dialog.vue";
import { dedTypeEnum } from "@/constants/contract-manage/enums";
import { invoiceStatusEnum } from "@/constants/contract-manage/enums";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { getEnumLabel } from "@/utils/enum";
import { buildFileUrl } from "@/utils/file-path-util";
import BillHeader from "@/components/business/bill-components/bill-header.vue";
import BillInfo from "@/components/business/bill-components/bill-info.vue";

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

const router = useRouter();
const userStore = useUserStore();

const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const mode = ref<"add" | "edit" | "detail">(props.mode);
const paymentId = ref<number | undefined>(props.paymentId);

const isDetail = computed(() => mode.value === "detail");
const isEdit = computed(() => mode.value === "edit");
const isAdd = computed(() => mode.value === "add");

const segOptions = ref([]);
const projectOptions = ref([]);
const annexFileList = ref([]);
const updateFileList = ref([]);
const uploadVisibleDialog = ref(false);

const billData = ref({
  id: undefined,
  bizTitle: "",
  bizNo: "",
  status: 0,
  bizItemCode: "NCON_PROC",
});
const flowBaseData = ref(null);
const flowListData = ref({
  bizItemCode: "", // 业务编码
  wfFlowId: null, // 流程ID
  wfStatus: 0, // 审批状态；0=草稿，10=审批中，40=已审批，80=作废，99=其他
  wfTitle: "", // 流程标题
}); // 流程数据

// 数据字典
const { getDictList, loadDicts } = useDict([dictMapping.payType], {
  treeDictCodes: [],
});
// 付款方式
const payTypeOptions = computed(() => getDictList(dictMapping.payType));

// ==================== 发票登记相关 ====================
const invoiceMTable = ref([]);

// 详情模式列配置
const invoiceMDetailColumns = [
  { type: "index", label: "序号", width: 60 },
  {
    prop: "status",
    label: "发票状态",
    width: 120,
    formatter: (row) => {
      const target = getEnumLabel(invoiceStatusEnum, row?.status || 0);
      return target || "--";
    },
  },
  {
    prop: "isValid",
    label: "查验真假",
    width: 120,
    formatter: (row) => (row.isValid ? "真发票" : "假发票"),
  },
  {
    prop: "isRepeat",
    label: "是否重复",
    width: 90,
    formatter: (row) => (row.isRepeat ? "是" : "否"),
  },
  { prop: "validateMsg", label: "查验结果", minWidth: 120 },
  { prop: "invNo", label: "发票号", minWidth: 120 },
  { prop: "invDate", label: "开票日期", minWidth: 120 },
  { prop: "totalAmt", label: "发票总金额", minWidth: 120 },
  { prop: "notTaxAmt", label: "不含税金额", minWidth: 120 },
  { prop: "taxAmt", label: "税额", minWidth: 120 },
  { prop: "invType", label: "发票类型", minWidth: 120 },
  { slot: "annexName", label: "发票附件", minWidth: 200 },
  { label: "操作", slot: "actions", width: 180, fixed: "right" },
];

// 编辑模式列配置
const invoiceMColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "status",
    label: "发票状态",
    width: 120,
    editable: false,
    formatter: (row) => {
      const target = getEnumLabel(invoiceStatusEnum, row?.status || 0);
      return target || "--";
    },
  },
  {
    prop: "isValid",
    label: "查验真假",
    width: 120,
    editable: false,
    formatter: (row) => (row.isValid ? "真发票" : "假发票"),
  },
  {
    prop: "isRepeat",
    label: "是否重复",
    width: 90,
    editable: false,
    formatter: (row) => (row.isRepeat ? "是" : "否"),
  },
  {
    prop: "validateMsg",
    label: "查验结果",
    width: 120,
    editable: false,
  },
  {
    prop: "invNo",
    label: "发票号",
    editable: false,
    editType: "input",
    minWidth: 150,
    showOverflowTooltip: false,
  },
  {
    prop: "invDate",
    label: "开票日期",
    editable: false,
    editType: "date",
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "totalAmt",
    label: "发票总金额",
    editable: false,
    editType: "number",
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "notTaxAmt",
    label: "不含税金额",
    editable: false,
    editType: "number",
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "taxAmt",
    label: "税额",
    editable: false,
    editType: "number",
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "invType",
    label: "发票类型",
    editable: false,
    editType: "input",
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    slot: "annexName",
    label: "发票附件",
    editable: false,
    editType: "input",
    minWidth: 200,
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    slot: "actions",
    width: 240,
    fixed: "right",
  },
]);

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

const handleUploadInvoice = async () => {
  uploadVisibleDialog.value = true;
};

const getAnnexFileList = async (fileList: any) => {
  console.log("上传的发票", fileList);
  if (fileList && fileList.length > 0) {
    const notify = ElNotification({
      title: "发票识别中",
      message: `正在识别 ${fileList.length} 张发票，请稍候...`,
      type: "info",
      duration: 0,
      position: "top-right",
    });
    try {
      await batchInvoiceRecognition(fileList);
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
            srcType: "NCON_PROC",
            nconBillId: undefined,
          };
        } else {
          const originalItem = invoiceDataList[index];
          return {
            annexId: originalItem.id,
            annexName: originalItem.annexName,
            uuid: uuidv4(),
            id: undefined,
            srcType: "NCON_PROC",
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
    } else {
      const fallbackData = invoiceDataList.map((item) => ({
        annexId: item.id,
        annexName: item.annexName,
        uuid: uuidv4(),
        id: undefined,
        srcType: "NCON_PROC",
        nconBillId: undefined,
        invNo: undefined,
        invDate: undefined,
        totalAmt: 0,
        notTaxAmt: 0,
        taxAmt: 0,
        invType: "",
        invoiceDs: [],
      }));
      invoiceMTable.value = [...invoiceMTable.value, ...fallbackData];
    }
  } catch (error) {
    console.error("批量识别发票失败:", error);
    const fallbackData = invoiceDataList.map((item) => ({
      annexId: item.id,
      annexName: item.annexName,
      uuid: uuidv4(),
      id: undefined,
      srcType: "NCON_PROC",
      nconBillId: undefined,
      invNo: undefined,
      invDate: undefined,
      totalAmt: 0,
      notTaxAmt: 0,
      taxAmt: 0,
      invType: "",
      invoiceDs: [],
    }));
    invoiceMTable.value = [...invoiceMTable.value, ...fallbackData];
  }
};

const invoiceRecognition = async (annexId: number, annexName: string) => {
  try {
    const res = await commonApi.recognizeAndCheckInvoice({ annexId: annexId });
    console.log("识别查验结果", res);
    if (res.code === 200 && res.data) {
      const { checkData, finalData, recognizeData } = res.data;
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

const dialogVisible = ref(false);
const detailList = ref([]);

const updateRow = (rowIndex: number, data: any) => {
  Object.assign(invoiceMTable.value[rowIndex], data);
  invoiceMTable.value = [...invoiceMTable.value];
};

const detailInvoiceM = (row) => {
  detailList.value = row.invoiceDs || [];
  dialogVisible.value = true;
};

const handleInvoiceDetailSuccess = (data) => {
  console.log("发票明细数据", data);
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

// ==================== 支付方式相关 ====================
const payWayTable = ref([]);

// 详情模式列配置
const payWayDetailColumns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "payWayName", label: "付款方式", minWidth: 150 },
  { prop: "bankName", label: "收款开户行", minWidth: 150 },
  { prop: "accountName", label: "收款账户名", minWidth: 150 },
  { prop: "bankAccount", label: "收款账号", minWidth: 150 },
  { prop: "payAmt", label: "付款金额", minWidth: 120 },
  { prop: "dedRoomAmt", label: "其中抵房金额", minWidth: 120 },
  { prop: "payDesc", label: "事项说明", minWidth: 200 },
];

// 编辑模式列配置
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
    minWidth: 150,
    options: payTypeOptions.value || [],
  },
  {
    prop: "bankName",
    label: "收款开户行",
    editable: true,
    editType: "input",
    minWidth: 150,
    showOverflowTooltip: false,
  },
  {
    prop: "accountName",
    label: "收款账户名",
    editable: true,
    editType: "input",
    minWidth: 150,
    showOverflowTooltip: false,
  },
  {
    prop: "bankAccount",
    label: "收款账号",
    editable: true,
    editType: "input",
    minWidth: 150,
    showOverflowTooltip: false,
  },
  {
    prop: "payAmt",
    label: "付款金额",
    editable: true,
    editType: "number",
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "dedRoomAmt",
    label: "其中抵房金额",
    editable: true,
    editType: "number",
    minWidth: 120,
    showOverflowTooltip: false,
  },
  {
    prop: "payDesc",
    label: "事项说明",
    editable: true,
    editType: "input",
    minWidth: 200,
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
    srcType: "NCON_PROC",
    nconBillId: undefined,
    payWayId: 2066, // 默认为"转账"
    bankName: "",
    accountName: "",
    bankAccount: "",
    payAmt: 0,
    dedRoomAmt: 0,
    payDesc: "",
  };
  payWayTable.value = [...payWayTable.value, newRowData];
};

const deletePayWay = (row) => {
  payWayTable.value = payWayTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

const updatePayWayRow = (rowIndex: number, data: any) => {
  const newData = [...payWayTable.value];
  newData[rowIndex] = { ...payWayTable.value[rowIndex], ...data };
  payWayTable.value = newData;
};

const handlePayWaySave = async (data) => {
  const { row, column, newValue, oldValue, rowIndex } = data;
  // 修改"其中抵房金额"不能大于付款金额
  if (column === "dedRoomAmt") {
    if (newValue > row.payAmt) {
      ElMessage.error("其中抵房金额不能大于付款金额");
      updatePayWayRow(rowIndex, { dedRoomAmt: 0 });
      return;
    } else {
      updatePayWayRow(rowIndex, { [column]: newValue });
      return;
    }
  }
  updatePayWayRow(rowIndex, { [column]: newValue });
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
  bizTitle: "",
  segId: undefined,
  segName: "",
  segNo: "",
  deptName: "",
  mguName: "",
  projId: undefined,
  projName: "",
  compId: "",
  compName: "",
  userName: "",
  createDate: "",

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
    const res = await commonApi.getBillNo({ bizType: "QK" });
    if (res.code === 200 && res.data) {
      formData.applyNo = res.data;
    }
  } catch (error) {
    console.error("生成请款单号失败:", error);
  }
};

// 选择项目
const changeProject = async (value: number) => {
  if (value) {
    const res = await projectAreaApi.getInfoByProjId({ id: value });
    if (res.code === 200 && res.data) {
      const { compName, compId, segId, segName } = res.data;
      formData.compId = compId || "";
      formData.compName = compName || "";
      formData.segId = segId || "";
      formData.segName = segName || "";
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
const handleSave = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    calcAdjustTotal();
    calcRatios();

    await new Promise((resolve) => setTimeout(resolve, 800));
    ElMessage.success("保存成功");
    emit("success", formData);
  } catch (error) {
    console.error("保存失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    calcAdjustTotal();
    calcRatios();

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

const handleCancel = () => {
  if (isDetail.value) return;
  ElMessage.info("作废功能待实现");
};

const handleViewProcess = () => {
  ElMessage.info("查看流程待实现");
};

const handleFileSuccess = (file: any) => {
  annexFileList.value.push(file);
};
const updateFileSuccess = (file: any) => {
  updateFileList.value.push(file);
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

const initDictData = async () => {
  await loadDicts();
};

const initData = async () => {
  await initDictData();
  await Promise.all([getSegOptions(), getProjectOptions()]);

  formData.userName = userStore.userInfo?.empName || "";
  formData.createDate = new Date().toLocaleString();

  if (isAdd.value) {
    await generateApplyNo();
    // 默认添加一条支付方式
    addPayWay();
  } else if (paymentId.value) {
    await loadDetail();
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

.annex-cell {
  display: flex;
  align-items: center;
  height: 100%;
}
</style>
