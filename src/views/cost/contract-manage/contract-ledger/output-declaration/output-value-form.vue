<!-- 产值申报 表单 -->
<template>
  <div class="prod-val-form">
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

        <!-- 申报信息 -->
        <div class="section-title">申报信息</div>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="付款方式" prop="payMethod" required>
              <el-select
                v-model="formData.payMethod"
                :disabled="isDetail"
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
            <el-form-item label="款项类型" prop="payTypeId" required>
              <el-select
                v-model="formData.payTypeId"
                :disabled="isDetail"
                placeholder="请选择款项类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in paymentTypeOptions"
                  :key="item.id"
                  :label="item.dicLabel"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="应付比例(%)" prop="payRate" required>
              <el-input-number
                v-model="formData.payRate"
                :disabled="isDetail"
                :min="0"
                :max="100"
                :precision="2"
                :controls="false"
                placeholder="请输入应付比例"
                style="width: 100%"
                @change="handlePayRateChange"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="是否强控" prop="isCtrl" required>
              <el-select
                v-model="formData.isCtrl"
                :disabled="isDetail"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="是" :value="1" />
                <el-option label="否" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="支付周期(月)" prop="payIntvl">
              <el-input-number
                v-model="formData.payIntvl"
                :disabled="isDetail"
                :min="0"
                :precision="0"
                :controls="false"
                placeholder="请输入支付周期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="本次申报产值金额" prop="applyProdVal" required>
              <el-input-number
                v-model="formData.applyProdVal"
                :disabled="isDetail"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入申报产值"
                style="width: 100%"
                @change="handleApplyProdValChange"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="本次申报应付金额" prop="applyPayAmt" required>
              <el-input-number
                v-model="formData.applyPayAmt"
                disabled
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入申报应付"
                style="width: 100%"
                @change="handleApplyPayAmtChange"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="截止总产值" prop="totalProdVal">
              <el-input-number
                v-model="formData.totalProdVal"
                disabled
                :precision="2"
                :controls="false"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="截止总应付" prop="totalPayVal">
              <el-input-number
                v-model="formData.totalPayVal"
                disabled
                :precision="2"
                :controls="false"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
            <el-form-item label="申报说明" prop="applyDesc">
              <el-input
                v-model="formData.applyDesc"
                :disabled="isDetail"
                type="textarea"
                :rows="2"
                maxlength="500"
                show-word-limit
                placeholder="请输入申报说明"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 支付比例明细 -->
        <div v-if="formData.payMethod == 1">
          <div class="section-title">支付比例明细</div>
          <div class="detail-table">
            <div class="header-content">
              <span class="header-title">支付比例明细</span>
              <el-button
                type="primary"
                size="small"
                @click="addPayrate"
                v-if="!isDetail"
              >
                新增支付比例
              </el-button>
            </div>
            <editable-table
              ref="payrateRef"
              :row-key="'uuid'"
              :height="'200px'"
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
        <div v-if="formData.payMethod == 2">
          <div class="section-title">材料合同产值</div>
          <div class="detail-table">
            <div class="header-content">
              <span class="header-title">材料合同产值明细</span>
              <!-- <el-button
                type="primary"
                size="small"
                @click="addMaterial"
                v-if="!isDetail"
              >
                新增材料明细
              </el-button> -->
            </div>
            <editable-table
              ref="materialRef"
              :row-key="'uuid'"
              :height="'200px'"
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
              <!-- <template #actions="{ row }">
                <el-button link type="danger" @click="deleteMaterial(row)">
                  删除
                </el-button>
              </template> -->
            </editable-table>
          </div>
        </div>

        <!-- 支付节点 -->
        <div v-if="formData.payMethod == 3">
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
                新增支付节点
              </el-button>
            </div>
            <editable-table
              ref="paynodeRef"
              :row-key="'uuid'"
              :height="'200px'"
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

        <!-- 成本复核信息 -->
        <div class="section-title">成本复核信息</div>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="复核产值金额" prop="costProdVal">
              <el-input-number
                v-model="formData.costProdVal"
                :disabled="isDetail"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入复核产值"
                style="width: 100%"
                @change="handleCostProdValChange"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
            <el-form-item label="复核应付金额" prop="costPayAmt">
              <el-input-number
                v-model="formData.costPayAmt"
                :disabled="isDetail"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入复核应付"
                style="width: 100%"
                @change="handleCostPayAmtChange"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
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
import { useRoute } from "vue-router";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { v4 as uuidv4 } from "uuid";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import {
  ContractBillMaterial,
  ContractBillPayNode,
  ContractBillPayRate,
} from "@/types/cost/contract-manage/output-declaration-type";
import { PayTypeEnum } from "@/constants/contract-manage/enums";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { outputDeclarationApi } from "@/api/cost/contract-manage/output-declaration-api";

defineOptions({ name: "output-value-form" });

const route = useRoute();

const outputId = ref<number | null>(null);
const conId = ref<number | null>(null);
const mode = ref<"add" | "edit" | "detail">("add");
const isDetail = computed(() => route.query.mode === "detail");

const formData = ref({
  id: null,
  conId: null, // 合同id
  conBillId: null,
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
  conTypeId: 0,
  payMethod: null,
  payTypeId: null,
  payRate: 0,
  isCtrl: 0,
  payIntvl: 0,
  applyProdVal: 0,
  applyPayAmt: 0,
  applyDesc: "",
  costProdVal: 0,
  costPayAmt: 0,
  totalProdVal: 0,
  totalPayVal: 0,
  // 额外展示字段（非数据库字段）
  conName: "",
  conSysNo: "",
  conTypeName: "",
  supName: "",
});
const formRef = ref(null);
const submitLoading = ref(false);

// 支付比例明细
const payrateTable = ref<ContractBillPayRate[]>([]);
const payrateColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  // {
  //   prop: "payRateId",
  //   label: "支付比例",
  //   editable: true,
  //   editType: "select",
  //   showOverflowTooltip: false,
  //   optionLabelField: "name",
  //   optionValueField: "id",
  //   options: [],
  //   width: 120,
  // },
  {
    prop: "payTypeId",
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
    prop: "payRate",
    label: "应付比例(%)",
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
    width: 100,
  },
  {
    prop: "payIntvl",
    label: "支付周期(月)",
    editable: true,
    editType: "number",
    precision: 0,
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "prodVal",
    label: "本次申请产值金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payAmt",
    label: "本次申报应付金额",
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
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付金额",
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

// 材料合同产值明细
const materialTable = ref<ContractBillMaterial[]>([]);
const materialColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  // {
  //   prop: "mtId",
  //   label: "材料产值",
  //   editable: true,
  //   editType: "input",
  //   showOverflowTooltip: false,
  //   width: 120,
  // },
  {
    prop: "mtName",
    label: "材料名称",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
    width: 120,
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
    width: 100,
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
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "fineAmt",
    label: "罚款",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "prodVal",
    label: "产值总金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payRate",
    label: "应付比例",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "payAmt",
    label: "本次申报应付金额",
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
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  // {
  //   label: "操作",
  //   width: 100,
  //   slot: "actions",
  //   fixed: "right",
  // },
]);

// 支付节点明细
const paynodeTable = ref<ContractBillPayNode[]>([]);
const paynodeColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  // {
  //   prop: "nodeId",
  //   label: "支付节点",
  //   editable: true,
  //   editType: "input",
  //   showOverflowTooltip: false,
  //   width: 120,
  // },
  {
    prop: "nodeName",
    label: "支付节点名称",
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
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "payRate",
    label: "应付比例(%)",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
  {
    prop: "payAmt",
    label: "应付金额",
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
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 150,
  },
  {
    prop: "costPayAmt",
    label: "成本复核应付金额",
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
    width: 200,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);

const paymentTypeOptions = ref<any[]>([]);

const { getDictList, loadDicts } = useDict([dictMapping.paymentType], {
  treeDictCodes: [],
});

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
  payMethod: [{ required: true, message: "请选择付款方式", trigger: "change" }],
  payTypeId: [{ required: true, message: "请选择款项类型", trigger: "change" }],
  payRate: [
    { required: true, message: "请输入应付比例", trigger: "blur" },
    {
      type: "number",
      min: 0,
      max: 100,
      message: "应付比例必须在0-100之间",
      trigger: "blur",
    },
  ],
  isCtrl: [{ required: true, message: "请选择是否强控", trigger: "change" }],
  applyProdVal: [
    { required: true, message: "请输入本次申报产值金额", trigger: "blur" },
    { type: "number", min: 0, message: "申报产值不能小于0", trigger: "blur" },
  ],
  applyPayAmt: [
    { required: true, message: "请输入本次申报应付金额", trigger: "blur" },
    { type: "number", min: 0, message: "申报应付不能小于0", trigger: "blur" },
  ],
});

// 计算截止总产值 = 累计产值 + 本次申报产值
const calculateTotalProdVal = () => {
  const sumProdVal = Number(formData.value.sumProdVal) || 0;
  const applyProdVal = Number(formData.value.applyProdVal) || 0;
  formData.value.totalProdVal = sumProdVal + applyProdVal;
};

// 计算截止总应付 = 累计应付 + 本次申报应付
const calculateTotalPayVal = () => {
  const sumPayAmt = Number(formData.value.sumPayAmt) || 0;
  const applyPayAmt = Number(formData.value.applyPayAmt) || 0;
  formData.value.totalPayVal = sumPayAmt + applyPayAmt;
};

// 计算申报应付金额 = 申报产值 * 应付比例 / 100
const calculateApplyPayAmt = () => {
  const applyProdVal = Number(formData.value.applyProdVal) || 0;
  const payRate = Number(formData.value.payRate) || 0;
  formData.value.applyPayAmt = applyProdVal * (payRate / 100);
};

// 付款方式变更
const handlePayMethodChange = (val: number) => {
  payrateTable.value = [];
  materialTable.value = [];
  paynodeTable.value = [];
};

// 应付比例变更
const handlePayRateChange = () => {
  calculateApplyPayAmt();
  calculateTotalPayVal();
};

// 申报产值变更
const handleApplyProdValChange = () => {
  calculateTotalProdVal();
  calculateApplyPayAmt();
  calculateTotalPayVal();
};

// 申报应付变更
const handleApplyPayAmtChange = () => {
  calculateTotalPayVal();
};

// 复核产值变更
const handleCostProdValChange = () => {};

// 复核应付变更
const handleCostPayAmtChange = () => {};

// 支付比例明细
const addPayrate = () => {
  const newRow: ContractBillPayRate = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: conId.value,
    payRateId: undefined,
    payTypeId: undefined,
    payRate: 0,
    isCtrl: false,
    payIntvl: 0,
    prodVal: 0,
    payAmt: 0,
    buildPeriod: "",
    prodValPeriod: "",
    payDate: "",
    costProdVal: 0,
    costPayAmt: 0,
  };
  payrateTable.value = [...payrateTable.value, newRow];
};

const deletePayrate = (row: ContractBillPayRate) => {
  payrateTable.value = payrateTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

const handleSavePayrate = async (rowData: any) => {};

const handleChangePayrate = (data: any) => {};

const handleUpdatePayrate = (newData: any) => {
  payrateTable.value = newData;
};

// 材料明细
const addMaterial = () => {
  const newRow: ContractBillMaterial = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: conId.value,
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
    prodValPeriod: "",
    payDate: "",
    costProdVal: 0,
    costPayAmt: 0,
  };
  materialTable.value = [...materialTable.value, newRow];
};

const deleteMaterial = (row: ContractBillMaterial) => {
  materialTable.value = materialTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

const handleSaveMaterial = async (rowData: any) => {};

const handleChangeMaterial = (data: any) => {};

const handleUpdateMaterial = (newData: any) => {
  materialTable.value = newData;
};

// 支付节点明细
const addPaynode = () => {
  const newRow: ContractBillPayNode = {
    uuid: uuidv4(),
    id: undefined,
    conBillId: conId.value,
    nodeId: undefined,
    nodeName: "",
    payType: null,
    prodVal: 0,
    payRate: 0,
    payAmt: 0,
    payDate: "",
    costProdVal: 0,
    costPayAmt: 0,
    remark: "",
  };
  paynodeTable.value = [...paynodeTable.value, newRow];
};

const deletePaynode = (row: ContractBillPayNode) => {
  paynodeTable.value = paynodeTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

const handleSavePaynode = async (rowData: any) => {};

const handleChangePaynode = (data: any) => {};

const handleUpdatePaynode = (newData: any) => {
  paynodeTable.value = newData;
};

const validatePayrateTable = () => {
  if (payrateTable.value.length === 0) {
    ElMessage.error("支付比例明细列表不能为空");
    return false;
  }
  for (let i = 0; i < payrateTable.value.length; i++) {
    const item = payrateTable.value[i];
    if (!item.payTypeId) {
      ElMessage.error(`支付比例明细第${i + 1}行：请选择款项类型`);
      return false;
    }
    if ((item.payRate ?? 0) <= 0) {
      ElMessage.error(`支付比例明细第${i + 1}行：应付比例必须大于0`);
      return false;
    }
  }
  return true;
};

const validateMaterialTable = () => {
  if (materialTable.value.length === 0) {
    ElMessage.error("材料明细列表不能为空");
    return false;
  }
  for (let i = 0; i < materialTable.value.length; i++) {
    const item = materialTable.value[i];
    if (item.mtName && !item.mtModel) {
      ElMessage.error(`材料明细第${i + 1}行：材料规格不能为空`);
      return false;
    }
    if ((item.payAmt ?? 0) < 0) {
      ElMessage.error(`材料明细第${i + 1}行：申报应付金额不能小于0`);
      return false;
    }
  }
  return true;
};

const validatePaynodeTable = () => {
  if (paynodeTable.value.length === 0) {
    ElMessage.error("支付节点明细列表不能为空");
    return false;
  }
  for (let i = 0; i < paynodeTable.value.length; i++) {
    const item = paynodeTable.value[i];
    if (item.nodeName && !item.payType) {
      ElMessage.error(`支付节点第${i + 1}行：请选择款项类型`);
      return false;
    }
    if ((item.payAmt ?? 0) < 0) {
      ElMessage.error(`支付节点第${i + 1}行：应付金额不能小于0`);
      return false;
    }
  }
  return true;
};

// 构建提交参数
const buildSubmitParams = () => {
  return {
    conId: formData.value.conId,
    prodVal: {
      id: formData.value.id,
      conBillId: formData.value.conBillId,
      status: formData.value.status || 0,
      signAmt: formData.value.signAmt,
      addAmt: formData.value.addAmt,
      sumChangeAmt: formData.value.sumChangeAmt,
      preSettleAmt: formData.value.preSettleAmt,
      sumProdVal: formData.value.sumProdVal,
      sumPayAmt: formData.value.sumPayAmt,
      sumAppyAmt: formData.value.sumAppyAmt,
      sumPaidAmt: formData.value.sumPaidAmt,
      sumOwedAmt: formData.value.sumOwedAmt,
      conId: formData.value.conId,
      conTypeId: formData.value.conTypeId,
      payMethod: formData.value.payMethod,
      payTypeId: formData.value.payTypeId,
      payRate: formData.value.payRate,
      isCtrl: formData.value.isCtrl,
      payIntvl: formData.value.payIntvl,
      applyProdVal: formData.value.applyProdVal,
      applyPayAmt: formData.value.applyPayAmt,
      applyDesc: formData.value.applyDesc,
      costProdVal: formData.value.costProdVal,
      costPayAmt: formData.value.costPayAmt,
      totalProdVal: formData.value.totalProdVal,
      totalPayVal: formData.value.totalPayVal,
    },
    billPayrates: payrateTable.value,
    billMaterials: materialTable.value,
    billPaynodes: paynodeTable.value,
  };
};

// 提交
const handleSubmit = async () => {
  if (isDetail.value) return;
  if (!formRef.value) return;
  formRef.value.validate(async (viod: boolean) => {
    if (!viod) {
      ElMessage.error("请检查表单是否填写完整");
      return;
    }
    try {
      // if (!validatePayrateTable()) return;
      // if (!validateMaterialTable()) return;
      // if (!validatePaynodeTable()) return;

      submitLoading.value = true;
      const params = buildSubmitParams();
      console.log("提交参数", params);
      if (mode.value === "edit") {
        await outputDeclarationApi.editProdVal(params);
      } else {
        await outputDeclarationApi.addProdVal(params);
      }
      ElMessage.success("提交成功");
    } catch (error) {
      console.error(error);
    } finally {
      submitLoading.value = false;
    }
  });
};

// 加载产值申报详情
const loadProdValDetail = async () => {
  if (!outputId.value) return;
  try {
    const res = await outputDeclarationApi.getProdValById({
      id: outputId.value,
    });
    if (res.code === 200) {
      const { prodVal, billPayrates, billMaterials, billPaynodes } = res.data;
      formData.value = prodVal;
      payrateTable.value = billPayrates || [];
      materialTable.value = billMaterials || [];
      paynodeTable.value = billPaynodes || [];
    }
  } catch (error) {}
};

// 加载合同信息
const loadContractInfo = async () => {
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: conId.value,
    });
    if (res.code === 200) {
      const {
        conMain,
        billPaynodes = [],
        billPayrates = [],
        billMaterials = [],
      } = res.data;
      formData.value.conName = conMain.conName;
      formData.value.conSysNo = conMain.conSysNo;
      formData.value.conTypeId = conMain.conTypeId;
      formData.value.conTypeName = conMain.conTypeName;
      formData.value.supName = conMain.supName;
      formData.value.signAmt = conMain.signAmt;
      formData.value.conId = conMain.id;
      formData.value.payMethod = conMain.payMethod;
      // paynodeTable.value = billPaynodes.map((item) => {
      //   return {
      //     ...item,
      //     uuid: uuidv4(),
      //   };
      // });
      // payrateTable.value = billPayrates.map((item) => {
      //   return {
      //     ...item,
      //     uuid: uuidv4(),
      //   };
      // });
      // materialTable.value = billMaterials.map((item) => {
      //   return {
      //     ...item,
      //     uuid: uuidv4(),
      //   };
      // });
    }
  } catch (error) {}
};

// 初始化字典
const initDictData = async () => {
  await loadDicts();
  paymentTypeOptions.value = getDictList(dictMapping.paymentType); // 款项类型
};

const syncRouteState = async () => {
  const queryMode = route.query.mode as string;
  mode.value =
    queryMode === "edit" || queryMode === "detail" ? queryMode : "add";

  const outputIdValue = route.query.outputId
    ? Number(route.query.outputId)
    : null;
  outputId.value = outputIdValue || null;

  const conIdValue = route.query.conId ? Number(route.query.conId) : null;
  conId.value = conIdValue || null;

  await initDictData();

  if (mode.value === "edit" || mode.value === "detail") {
    await loadProdValDetail();
  } else {
    formData.value = {
      ...formData.value,
      conId: conId.value,
    };
    await loadContractInfo();
  }
};

onMounted(() => {
  syncRouteState();
});
</script>

<style scoped lang="scss">
.prod-val-form {
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

.field-tip {
  font-size: 12px;
  color: #909399;
  display: block;
  margin-top: 4px;
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
