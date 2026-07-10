<!-- 付款申请 表单 -->
<template>
  <div class="payment-application-form">
    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="134px"
        class="adapt-form"
      >
        <div class="section-title">基本信息</div>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="合同签约金额" prop="signAmt">
              <el-input-number
                v-model="formData.signAmt"
                :precision="2"
                :controls="false"
                style="width: 100%"
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
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="累计欠款" prop="sumOwedAmt" required>
              <el-input-number
                v-model="formData.sumOwedAmt"
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

        <!-- <div class="section-title">付款申请信息</div> -->
        <el-row :gutter="24">
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
                <el-option label="提高支付比例请款" :value="1" />
              </el-select>
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

        <!-- <div class="section-title">发票信息</div> -->
        <el-row :gutter="24">
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
        </el-row>

        <!-- <div class="section-title">收款账号信息</div> -->
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
      </el-form>
      <!-- 扣款事项明细 -->
      <div>
        <div class="section-title">扣款事项明细</div>
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
          <template #actionBar>
            <div class="actionBar-buttons">
              <el-button type="primary" size="small" @click="handleAddDed">
                新增扣款事项
              </el-button>
            </div>
          </template>
          <template #actions="{ row }">
            <el-button link type="danger" @click="handleDeleteDed(row)">
              删除
            </el-button>
          </template>
        </editable-table>
      </div>
      <!-- 发票登记 -->
      <div>
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
              :type="getRecogStatusType(row.recogStatus)"
              disable-transitions
            >
              {{ getRecogStatusText(row.recogStatus) }}
            </el-tag>
          </template>

          <template #actions="{ row }">
            <div class="actions-btn">
              <!-- 用按钮触发上传，不直接放上传组件 -->
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
      <!-- 付款方式 -->
      <div>
        <div class="section-title">付款方式</div>
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
                新增付款方式
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
      <!-- 财务明细 -->
      <div>
        <div class="section-title">财务明细</div>
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
      </div>
    </div>

    <div class="btn-row">
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        保存
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from "vue";
import { ElMessage } from "element-plus";
import EditableTable from "@/components/base/editable-table.vue";
import { EditableColumn } from "@/components/base/editable-table.vue";
import { v4 as uuidv4 } from "uuid";
import { dedTypeEnum } from "@/constants/contract-manage/enums";
import { largeScreenApi } from "@/api/sales/large-screen-api";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import BaseUpload from "@/components/base/base-upload.vue";
import { commonApi } from "@/api/cost/common-api";
import InvoiceDetailDialog from "./invoice-detail-dialog.vue";
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
const isDetail = ref(props.mode === "detail");

// 仅 付款申请主表 字段
const formData = ref({
  id: undefined as number | undefined,
  conBillId: undefined as number | undefined,
  signAmt: 0, // 合同签约金额
  addAmt: 0, // 补充合同金额
  sumChangeAmt: 0, // 累计变更签证
  preSettleAmt: 0, // 预结算合同金额
  sumProdVal: 0, // 累计产值
  sumPayAmt: 0, // 累计应付
  sumAppyAmt: 0, // 累计请款
  sumPaidAmt: 0, // 累计实付
  sumOwedAmt: 0, // 累计欠款
  payOutRate: 0, // 应付占产值比率
  paidPayRate: 0, // 实付占应付比率
  paidOutRate: 0, // 实付占产值比率
  reqType: 0 as 0 | 1, // 请款类型 0=请款、1=来票冲账
  payRule: 0 as 0 | 1, // 付款规则：0-正常请款 1-提高支付比例请款
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

const dedTable = ref([]);
const dedColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "dedName",
    label: "扣款事项",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "dedTypeId",
    label: "扣款类型",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "label",
    optionValueField: "value",
    options: dedTypeEnum as any,
  },
  {
    prop: "dedAmt",
    label: "应扣款金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "dedThisAmt",
    label: "本次扣款金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "dedAlreadyAmt",
    label: "已扣款金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "dedLeaveAmt",
    label: "未扣金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "dedDesc",
    label: "扣款说明",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 240,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);
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
    dedLeaveAmt: 0, // 未扣款金额
    dedDesc: "", // 扣款说明
  };
  dedTable.value = [...dedTable.value, newRowData];
};
const handleDeleteDed = (row) => {
  dedTable.value = dedTable.value.filter((item) => item.uuid !== row.uuid);
};
const invoiceMTable = ref([]);
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
const updateRow = (rowIndex: number, data: any) => {
  // 直接修改对象属性，避免创建新对象
  Object.assign(invoiceMTable.value[rowIndex], data);
  // 触发响应式更新
  invoiceMTable.value = [...invoiceMTable.value];
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
const detailInvoiceM = (row) => {
  detailList.value = row.detailList || [];
  dialogVisible.value = true;
};
const deleteInvoiceM = ({ uuid }) => {
  invoiceMTable.value = invoiceMTable.value.filter(
    (item) => item.uuid !== uuid,
  );
};
const payWayTable = ref([]);
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
const projectOptions = ref([]);
const subjectOptions = ref([]);
const financeTable = ref([]);
const financeColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "projId",
    label: "项目",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "projName",
    optionValueField: "id",
    options: projectOptions.value,
  },
  {
    prop: "acctProjId",
    label: "建筑核算项目",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "label",
    optionValueField: "value",
    options: [
      { label: "核算项目1", value: 1 },
      { label: "核算项目2", value: 2 },
    ],
  },
  {
    prop: "subId",
    label: "科目",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "subName",
    optionValueField: "id",
    options: subjectOptions.value,
  },
  {
    prop: "subAmt",
    label: "金额",
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
// 获取项目列表
const getProjectOptions = async () => {
  try {
    const res = await largeScreenApi.getProjList();
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
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
      ElMessage.error(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取数据失败:", error);
  }
};
// 加载付款申请详情
const loadDetail = async () => {
  if (!props.paymentId) return;
  const res = await paymentRequestApi.getPayDetail({
    id: props.paymentId,
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

  // 如果是编辑模式，带上 id
  if (props.mode === "edit" && props.paymentId) {
    payment.id = props.paymentId;
  }

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

onMounted(() => {
  getProjectOptions();
  getCostSubjectProjList();
  if (props.mode === "edit" && props.paymentId) {
    loadDetail();
  }
});
</script>

<style scoped lang="scss">
.payment-application-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
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
  margin: 10px 0;
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
.btn-row {
  display: flex;
  justify-content: center;
  padding: 16px 24px 30px;
  border-top: 1px solid #eef2f6;
  flex-shrink: 0;
}
</style>
