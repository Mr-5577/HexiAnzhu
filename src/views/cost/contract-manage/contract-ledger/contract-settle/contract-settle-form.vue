<!-- 合同结算 表单 -->
<template>
  <div class="contract-settle-form">
    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="140px"
        class="adapt-form"
      >
        <!-- 基本信息 -->
        <div class="section-title">基本信息</div>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="合同名称" prop="conName">
              <el-input
                v-model="formData.conName"
                disabled
                placeholder="请选择合同"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="合同编号" prop="conSysNo">
              <el-input
                v-model="formData.conSysNo"
                disabled
                placeholder="合同编号"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="合同分类" prop="conTypeName">
              <el-input
                v-model="formData.conTypeName"
                disabled
                placeholder="合同分类"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="供应商" prop="supName">
              <el-input
                v-model="formData.supName"
                disabled
                placeholder="供应商"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="合同签约金额" prop="signAmt">
              <el-input-number
                v-model="formData.signAmt"
                disabled
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
        </el-row>

        <!-- 结算信息 -->
        <div class="section-title">结算信息</div>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="结算类型" prop="settleType" required>
              <el-select
                v-model="formData.settleType"
                :disabled="isDetail"
                placeholder="请选择结算类型"
                style="width: 100%"
              >
                <el-option label="部分结算" :value="0" />
                <el-option label="全部结算" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="申报结算金额" prop="applySettleAmt" required>
              <el-input-number
                v-model="formData.applySettleAmt"
                :disabled="isDetail"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入申报结算金额"
                style="width: 100%"
                @change="handleApplySettleAmtChange"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="扣款总金额" prop="totalDedAmt" required>
              <el-input-number
                v-model="formData.totalDedAmt"
                :disabled="isDetail"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入扣款总金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="累计已扣款" prop="sumDedAlreadyAmt" required>
              <el-input-number
                v-model="formData.sumDedAlreadyAmt"
                :disabled="isDetail"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入累计已扣款"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="收到资料日期" prop="recvDocDate">
              <el-date-picker
                v-model="formData.recvDocDate"
                :disabled="isDetail"
                type="date"
                placeholder="请选择收到资料日期"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="经办人签字日期" prop="operSignDate">
              <el-date-picker
                v-model="formData.operSignDate"
                :disabled="isDetail"
                type="date"
                placeholder="请选择经办人签字日期"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
            <el-form-item label="结算申报说明" prop="applyDesc">
              <el-input
                v-model="formData.applyDesc"
                :disabled="isDetail"
                type="textarea"
                :rows="2"
                maxlength="500"
                show-word-limit
                placeholder="请输入结算申报说明"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 成本审核 -->
        <div class="section-title">成本审核</div>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="成本一审金额" prop="costFirstAmt">
              <el-input-number
                v-model="formData.costFirstAmt"
                :disabled="isDetail"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入成本一审金额"
                style="width: 100%"
                @change="handleCostFirstAmtChange"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="成本一审审减金额" prop="costFirstDecAmt">
              <el-input-number
                v-model="formData.costFirstDecAmt"
                disabled
                :precision="2"
                :controls="false"
                style="width: 100%"
                @change="handleCostFirstDecAmtChange"
              />
              <!-- <div class="form-tip">
                成本一审审减金额 = 成本一审金额 - 申报结算金额
              </div> -->
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="成本一审签字日期" prop="costFirstDate">
              <el-date-picker
                v-model="formData.costFirstDate"
                :disabled="isDetail"
                type="date"
                placeholder="请选择成本一审签字日期"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="成本二审金额" prop="costSecondAmt">
              <el-input-number
                v-model="formData.costSecondAmt"
                :disabled="isDetail"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入成本二审金额"
                style="width: 100%"
                @change="handleCostSecondAmtChange"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="成本二审审减金额" prop="costSecondDecAmt">
              <el-input-number
                v-model="formData.costSecondDecAmt"
                disabled
                :precision="2"
                :controls="false"
                style="width: 100%"
              />
              <!-- <div class="form-tip">
                成本二审审减金额 = 成本二审金额 - 成本一审审减金额
              </div> -->
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="成本二审签字日期" prop="costSecondDate">
              <el-date-picker
                v-model="formData.costSecondDate"
                :disabled="isDetail"
                type="date"
                placeholder="请选择成本二审签字日期"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="成本负责人签字日期" prop="costSignDate">
              <el-date-picker
                v-model="formData.costSignDate"
                :disabled="isDetail"
                type="date"
                placeholder="请选择成本负责人签字日期"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 审计审核 -->
        <div class="section-title">审计审核</div>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="审计审核金额" prop="auditAmt">
              <el-input-number
                v-model="formData.auditAmt"
                :disabled="isDetail"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入审计审核金额"
                style="width: 100%"
                @change="handleAuditAmtChange"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="审计审减金额" prop="auditDecAmt">
              <el-input-number
                v-model="formData.auditDecAmt"
                disabled
                :precision="2"
                :controls="false"
                style="width: 100%"
              />
              <!-- <div class="form-tip">
                审计审减金额 = 审计审核金额 - 成本二审金额
              </div> -->
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="审计一审签字日期" prop="auditFirstSignDate">
              <el-date-picker
                v-model="formData.auditFirstSignDate"
                :disabled="isDetail"
                type="date"
                placeholder="请选择审计一审签字日期"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="审计二审签字日期" prop="auditSecondSignDate">
              <el-date-picker
                v-model="formData.auditSecondSignDate"
                :disabled="isDetail"
                type="date"
                placeholder="请选择审计二审签字日期"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 最终结算 -->
        <div class="section-title">最终结算</div>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="最终合同结算金额" prop="finalSettleAmt">
              <el-input-number
                v-model="formData.finalSettleAmt"
                :disabled="isDetail"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入最终合同结算金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="最终结算款金额" prop="finalPaymentAmt">
              <el-input-number
                v-model="formData.finalPaymentAmt"
                :disabled="isDetail"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入最终结算款金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="最终质保金金额" prop="finalWarrAmt">
              <el-input-number
                v-model="formData.finalWarrAmt"
                :disabled="isDetail"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入最终质保金金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="质保到期日" prop="warrExpireDate">
              <el-date-picker
                v-model="formData.warrExpireDate"
                :disabled="isDetail"
                type="date"
                placeholder="请选择质保到期日"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="最终结算签字日期" prop="finalSettleSignDate">
              <el-date-picker
                v-model="formData.finalSettleSignDate"
                :disabled="isDetail"
                type="date"
                placeholder="请选择最终结算签字日期"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
            <el-form-item label="最终结算说明" prop="settleDesc">
              <el-input
                v-model="formData.settleDesc"
                :disabled="isDetail"
                type="textarea"
                :rows="2"
                maxlength="500"
                show-word-limit
                placeholder="请输入最终结算说明"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div>
        <div class="section-title">结算明细</div>
        <editable-table
          ref="settleRef"
          :row-key="'uuid'"
          :height="'240px'"
          :table-data="tableData"
          :columns="editableColumns"
          :pagination="false"
          :highlight-current-row="false"
          :show-summary="false"
          :compactEmpty="true"
          :editable="true"
        >
          <template #actionBar>
            <div class="actionBar-buttons">
              <el-button type="primary" size="small" @click="handleAdd">
                新增扣款事项
              </el-button>
            </div>
          </template>
          <template #dedTypeId="{ row }">
            {{ getDedTypeName(row.dedTypeId) }}
          </template>
          <template #status="{ row }">
            {{ getStatusName(row.status) }}
          </template>
          <template #actions="{ row }">
            <el-button
              link
              type="danger"
              v-if="!row.disabled"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </editable-table>
      </div>
    </div>

    <div class="btn-row" v-if="!isDetail">
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        保存
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { dedTypeEnum } from "@/constants/contract-manage/enums";
import EditableTable from "@/components/base/editable-table.vue";
import { EditableColumn } from "@/components/base/editable-table.vue";
import { v4 as uuidv4 } from "uuid";
import { paymentAdjustApi } from "@/api/cost/contract-manage/payment-adjust-api.ts";
import { contractSettleApi } from "@/api/cost/contract-manage/contract-settlement-api.ts";

defineOptions({ name: "contract-settle-form" });

const props = defineProps<{
  mode: "add" | "edit" | "detail";
  conId: number; // 合同ID
  settleId?: number; // 结算ID
}>();

const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

const isAdd = computed(() => props.mode === "add");
const isEdit = computed(() => props.mode === "edit");
const isDetail = computed(() => props.mode === "detail");

const initFormData = () => ({
  id: undefined as number | undefined,
  conBillId: undefined as number | undefined,
  status: 0,
  signAmt: 0,
  addAmt: 0,
  sumChangeAmt: 0,
  preSettleAmt: 0,
  sumProdVal: 0,
  sumPayAmt: 0,
  sumAppyAmt: 0,
  sumPaidAmt: 0,
  sumOwedAmt: 0,
  settleType: 0,
  applySettleAmt: 0,
  totalDedAmt: 0,
  sumDedAlreadyAmt: 0,
  applyDesc: "",
  recvDocDate: "",
  operSignDate: "",
  costFirstAmt: 0,
  costFirstDecAmt: 0,
  costFirstDate: "",
  costSecondAmt: 0,
  costSecondDecAmt: 0,
  costSecondDate: "",
  costSignDate: "",
  auditAmt: 0,
  auditDecAmt: 0,
  auditFirstSignDate: "",
  auditSecondSignDate: "",
  finalSettleAmt: 0,
  finalPaymentAmt: 0,
  finalWarrAmt: 0,
  warrExpireDate: "",
  finalSettleSignDate: "",
  settleDesc: "",
  // 额外展示字段
  conName: "",
  conSysNo: "",
  conTypeName: "",
  supName: "",
});

const formData = ref(initFormData());
const formRef = ref(null);
const submitLoading = ref(false);
const tableData = ref([]);
const editableColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "dedName",
    label: "扣款事项",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    disabled: (row: any) => row.disabled,
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
    options: (dedTypeEnum as any) || [],
    disabled: (row: any) => row.disabled,
  },
  {
    prop: "dedAmt",
    label: "奖罚总金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    disabled: (row: any) => row.disabled,
  },
  {
    prop: "dedAlreadyAmt",
    label: "已扣金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    disabled: (row: any) => row.disabled,
  },
  {
    prop: "dedLastAmt",
    label: "未扣金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    disabled: (row: any) => row.disabled,
  },
  {
    prop: "dedDesc",
    label: "扣款说明",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 240,
    disabled: (row: any) => row.disabled,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);

const formRules = ref({
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
  settleType: [
    { required: true, message: "请选择结算类型", trigger: "change" },
  ],
  applySettleAmt: [
    { required: true, message: "请输入申报结算金额", trigger: "blur" },
    {
      type: "number",
      min: 0,
      message: "申报结算金额不能小于0",
      trigger: "blur",
    },
  ],
  totalDedAmt: [
    { required: true, message: "请输入扣款总金额", trigger: "blur" },
  ],
  sumDedAlreadyAmt: [
    { required: true, message: "请输入累计已扣款", trigger: "blur" },
  ],
});

/**
 * 计算成本一审审减金额 成本一审审减金额 = 成本一审金额 - 申报结算金额
 */
const calculateCostFirstDecAmt = () => {
  const costFirstAmt = Number(formData.value.costFirstAmt) || 0;
  const applySettleAmt = Number(formData.value.applySettleAmt) || 0;
  const result = costFirstAmt - applySettleAmt;
  formData.value.costFirstDecAmt = Math.max(0, result); // 审减金额不能为负数
};

/**
 * 计算成本二审审减金额 成本二审审减金额 = 成本二审金额 - 成本一审审减金额
 */
const calculateCostSecondDecAmt = () => {
  const costSecondAmt = Number(formData.value.costSecondAmt) || 0;
  const costFirstDecAmt = Number(formData.value.costFirstDecAmt) || 0;
  const result = costSecondAmt - costFirstDecAmt;
  formData.value.costSecondDecAmt = Math.max(0, result); // 审减金额不能为负数
};

/**
 * 计算审计审减金额 审计审减金额 = 审计审核金额 - 成本二审金额
 */
const calculateAuditDecAmt = () => {
  const auditAmt = Number(formData.value.auditAmt) || 0;
  const costSecondAmt = Number(formData.value.costSecondAmt) || 0;
  const result = auditAmt - costSecondAmt;
  formData.value.auditDecAmt = Math.max(0, result); // 审减金额不能为负数
};

/**
 * 申报结算金额变更 触发：成本一审审减金额重新计算
 */
const handleApplySettleAmtChange = () => {
  calculateCostFirstDecAmt();
  // 成本一审审减金额变化后，二审审减金额也需要重新计算
  calculateCostSecondDecAmt();
};

/**
 * 成本一审金额变更 触发：成本一审审减金额重新计算
 */
const handleCostFirstAmtChange = () => {
  calculateCostFirstDecAmt();
  // 成本一审审减金额变化后，二审审减金额也需要重新计算
  calculateCostSecondDecAmt();
};

/**
 * 成本一审审减金额变更 触发：成本二审审减金额重新计算
 */
const handleCostFirstDecAmtChange = () => {
  calculateCostSecondDecAmt();
};

/**
 * 成本二审金额变更 触发：成本二审审减金额重新计算，以及审计审减金额重新计算
 */
const handleCostSecondAmtChange = () => {
  calculateCostSecondDecAmt();
  // 成本二审金额变化后，审计审减金额也需要重新计算
  calculateAuditDecAmt();
};

/**
 * 审计审核金额变更 触发：审计审减金额重新计算
 */
const handleAuditAmtChange = () => {
  calculateAuditDecAmt();
};
const handleAdd = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: null,
    conBillId: props.conId,
    dedId: null, // 扣款事项ID
    dedName: "", // 扣款事项
    dedAmt: 0, // 扣款金额
    dedTypeId: null, // 扣款类型ID
    dedAlreadyAmt: 0, // 已扣款金额
    dedLastAmt: 0, // 未扣款金额
    dedDesc: "", // 扣款说明
    disabled: false,
  };
  tableData.value = [...tableData.value, newRowData];
};
const handleDelete = (row) => {
  tableData.value = tableData.value.filter((item) => item.uuid !== row.uuid);
};
// 获取扣款类型名称
const getDedTypeName = (dedTypeId: number) => {
  const dedType = dedTypeEnum.find((item) => item.value == dedTypeId);
  return dedType?.label || "";
};

// 获取状态名称
const getStatusName = (status: number) => {
  switch (status) {
    case 0:
      return "草稿";
    case 5:
      return "审批中";
    case 10:
      return "已审批";
    case 30:
      return "已作废";
    default:
      return "-";
  }
};

// 构建提交参数
const buildSubmitParams = () => {
  let data = { ...formData.value };
  // 移除额外展示字段
  // delete data.conName;
  // delete data.conSysNo;
  // delete data.conTypeName;
  // delete data.supName;
  return {
    settle: data,
    settleDeds: tableData.value?.map(({ uuid, disabled, ...rest }) => rest), // 去除uuid、disabled
    conId: props.conId,
  };
};

// 提交
const handleSubmit = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const params = buildSubmitParams();

    if (isEdit.value) {
      const editRes = await contractSettleApi.editSettle(params);
      if (editRes.code === 200) {
        ElMessage.success("更新成功");
      }
    } else {
      const addRes = await contractSettleApi.addSettle(params);
      if (addRes.code === 200) {
        ElMessage.success("保存成功");
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    submitLoading.value = false;
  }
};

// 加载合同结算详情
const loadSettleDetail = async () => {
  if (!props.settleId) return;
  try {
    const res = await contractSettleApi.getSettleById({ id: props.settleId });
    if (res.code === 200) {
      const { settle = {}, settleDeds = [] } = res.data;
      formData.value = {
        ...formData.value,
        ...settle,
      };
      tableData.value = settleDeds.map((item) => {
        return {
          id: item.id,
          conBillId: item.conBillId,
          dedName: item.dedName,
          dedTypeId: item.dedTypeId,
          dedAmt: item.dedAmt,
          dedDesc: item.dedDesc,
          dedId: item.dedId,
          dedAlreadyAmt: item.dedAlreadyAmt,
          dedLastAmt: item.dedLastAmt,
          uuid: uuidv4(),
          disabled: false,
        }
      });
      // 数据加载完成后，重新计算所有审减金额
      calculateCostFirstDecAmt();
      calculateCostSecondDecAmt();
      calculateAuditDecAmt();
    }
  } catch (error) {
    console.error(error);
  }
};

// 加载合同信息
const loadContractInfo = async () => {
  if (!props.conId) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: props.conId,
    });
    if (res.code === 200) {
      const { conMain } = res.data;
      formData.value.conName = conMain.conName;
      formData.value.conSysNo = conMain.conSysNo;
      formData.value.conTypeName = conMain.conTypeName;
      formData.value.supName = conMain.supName;
      formData.value.signAmt = conMain.signAmt;
      formData.value.conBillId = conMain.id;
    }
  } catch (error) {
    console.error(error);
  }
};
// 获取奖惩列表
const getDedDataList = async () => {
  try {
    const res = await paymentAdjustApi.getDedList({ conId: props.conId });
    if (res.code === 200) {
      const list = res.data || [];
      tableData.value = list.map((item) => {
        return {
          conBillId: item.conBillId,
          dedName: item.dedName,
          dedTypeId: item.dedTypeId,
          dedAmt: item.dedAmt,
          dedDesc: item.dedDesc,
          uuid: uuidv4(),
          dedId: item.id,
          dedAlreadyAmt: 0,
          dedLastAmt: 0,
          disabled: true, // 源数据不可编辑
        };
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const initData = async () => {
  if (isEdit.value || isDetail.value) {
    await loadSettleDetail(); // 加载合同结算详情
  } else {
    await loadContractInfo(); // 加载合同信息
    await getDedDataList(); // 加载扣款列表
  }
};

onMounted(() => {
  initData();
});
</script>

<style scoped lang="scss">
.contract-settle-form {
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
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
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
.actionBar-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
