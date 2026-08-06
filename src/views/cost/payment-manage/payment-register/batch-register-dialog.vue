<!-- 付款登记 弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="'付款登记'"
    width="1000px"
    :confirmText="'提交登记'"
    :confirm-loading="submitLoading"
    @confirm="handleSubmit"
    @close="handleClose"
  >
    <div style="padding-right: 8px; box-sizing: border-box">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item prop="paymentDate" label="支付日期" required>
              <el-date-picker
                v-model="formData.paymentDate"
                type="date"
                placeholder="请选择支付日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="paymentMethod" label="支付方式" required>
              <el-select
                v-model="formData.paymentMethod"
                placeholder="请选择支付方式"
                style="width: 100%"
              >
                <el-option label="银行转账" value="bank_transfer" />
                <el-option label="支票" value="check" />
                <el-option label="现金" value="cash" />
                <el-option label="电汇" value="telegraphic_transfer" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="paymentAmount" label="支付金额" required>
              <el-input-number
                v-model="formData.paymentAmount"
                placeholder="请输入支付金额"
                :precision="2"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item prop="paymentAccount" label="支付账号">
              <el-input
                v-model="formData.paymentAccount"
                placeholder="请输入支付账号"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="paymentCompany" label="支付公司">
              <el-input
                v-model="formData.paymentCompany"
                placeholder="请输入支付公司"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="payeeName" label="收款方" required>
              <el-input
                v-model="formData.payeeName"
                placeholder="请输入收款方名称"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item prop="payeeBank" label="收款银行" required>
              <el-input
                v-model="formData.payeeBank"
                placeholder="请输入收款银行"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="payeeAccount" label="收款账号" required>
              <el-input
                v-model="formData.payeeAccount"
                placeholder="请输入收款账号"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="bankReceipt" label="银行回单号">
              <el-input
                v-model="formData.bankReceipt"
                placeholder="银行回单号"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="receiptPhotos" label="回单照片">
              <base-upload
                v-model:file-list="tempFileList"
                :limit="9"
                :multiple="false"
                :showIcon="true"
                :showTip="true"
                button-text="选择文件"
                size="default"
                @success="handleUploadSuccess"
              ></base-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="remark" label="备注">
              <el-input
                v-model="formData.remark"
                type="textarea"
                placeholder="请输入备注信息"
                :rows="2"
                maxlength="500"
                show-word-limit
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label-width="80px" label="登记人:">
              {{ formData.registrar || "张三" }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label-width="80px" label="登记日期:">
              {{ formData.registrarDate || "2026-07-20" }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label-width="80px" label="修改人:">
              {{ formData.modifier || "李思" }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label-width="80px" label="修改日期:">
              {{ formData.modifyDate || "2026-08-21" }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div>
        <div class="title">款项明细</div>
        <editable-table
          ref="tableRef"
          :row-key="'id'"
          :height="'200px'"
          v-model="tableData"
          :columns="tableColumns"
          :pagination="false"
          :highlight-current-row="false"
          :show-summary="false"
          :compactEmpty="true"
          :editable="true"
          @selection-change="handleSelectionChange"
        >
        </editable-table>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import EditableTable from "@/components/base/editable-table.vue";
import { EditableColumn } from "@/components/base/editable-table.vue";
import BaseUpload from "@/components/base/base-upload.vue";

interface Props {
  modelValue: boolean;
  editData?: any;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  editData: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const tempFileList = ref([]);
const selectedRows = ref([]);
// 表单数据
const formData = ref({
  id: undefined,
  segId: undefined,
  projId: undefined,
  // 支付信息
  paymentDate: "", // 支付日期
  paymentMethod: "", // 支付方式
  paymentAmount: 0, // 支付金额
  paymentAccount: "", // 支付账号
  paymentCompany: "", // 支付公司
  // 收款信息
  payeeName: "", // 收款方
  payeeBank: "", // 收款银行
  payeeAccount: "", // 收款账号
  // 附件
  bankReceipt: "", // 银行回单
  receiptPhotos: [], // 回单照片
  // 其他
  remark: "", // 备注
  // 登记信息
  registrar: "", // 登记人
  registrarDate: "", // 登记日期
  modifier: "", // 修改人
  modifyDate: "", // 修改日期
  // 流程相关
  nconBillId: undefined, // 本事项对应流程ID
  settledPaymentId: undefined, // 结算单据ID
  status: 0, // 状态 0-草稿 5-审批中 10-已审批 20-已结算 30-已作废
});

// 表格数据
const tableData = ref([
  {
    id: 1,
    itemType: "办公费",
    orgName: "财务部",
    expenseType: "办公用品",
    payeeBank: "中国银行",
    payeeAccountName: "XX公司",
    payeeAccount: "6222****1234",
    paymentMethod: "银行转账",
    subjectName: "管理费用",
    requestAmount: 10000,
    unpaidAmount: 10000,
    currentPaymentAmount: 0,
  },
  {
    id: 2,
    itemType: "办公费",
    orgName: "财务部",
    expenseType: "办公用品",
    payeeBank: "中国银行",
    payeeAccountName: "XX公司",
    payeeAccount: "6222****1234",
    paymentMethod: "银行转账",
    subjectName: "管理费用",
    requestAmount: 10000,
    unpaidAmount: 10000,
    currentPaymentAmount: 0,
  },
  {
    id: 3,
    itemType: "办公费",
    orgName: "财务部",
    expenseType: "办公用品",
    payeeBank: "中国银行",
    payeeAccountName: "XX公司",
    payeeAccount: "6222****1234",
    paymentMethod: "银行转账",
    subjectName: "管理费用",
    requestAmount: 10000,
    unpaidAmount: 10000,
    currentPaymentAmount: 0,
  },
]);

// 表格列配置
const tableColumns = computed<EditableColumn[]>(() => [
  { type: "selection", width: 50, fixed: "left" },
  { prop: "itemType", label: "款项类型/事项", editable: false, width: 120 },
  { prop: "orgName", label: "所属组织", editable: false, width: 100 },
  { prop: "expenseType", label: "费用类型", editable: false, width: 100 },
  { prop: "payeeBank", label: "收款方开户行", editable: false, width: 120 },
  {
    prop: "payeeAccountName",
    label: "收款方开户名",
    editable: false,
    width: 120,
  },
  { prop: "payeeAccount", label: "收款方账号", editable: false, width: 100 },
  { prop: "paymentMethod", label: "支付方式", editable: false, width: 100 },
  { prop: "subjectName", label: "科目名称", editable: false, width: 100 },
  { prop: "requestAmount", label: "请款金额", editable: false, width: 100 },
  { prop: "unpaidAmount", label: "未付金额", editable: false, width: 100 },
  {
    prop: "currentPaymentAmount",
    label: "本次支付金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
]);

// 表单校验规则
const formRules: FormRules = {
  paymentDate: [
    { required: true, message: "请选择支付日期", trigger: "change" },
  ],
  paymentMethod: [
    { required: true, message: "请选择支付方式", trigger: "change" },
  ],
  paymentAmount: [
    { required: true, message: "请输入支付金额", trigger: "blur" },
    {
      type: "number",
      min: 0.01,
      message: "支付金额必须大于0",
      trigger: "blur",
    },
  ],
  payeeName: [{ required: true, message: "请输入收款方名称", trigger: "blur" }],
  payeeBank: [{ required: true, message: "请输入收款银行", trigger: "blur" }],
  payeeAccount: [
    { required: true, message: "请输入收款账号", trigger: "blur" },
  ],
  bankReceipt: [{ type: "array", max: 5, message: "最多上传5个文件" }],
  receiptPhotos: [{ type: "array", max: 9, message: "最多上传9张照片" }],
  remark: [{ max: 500, message: "备注不能超过500个字符", trigger: "blur" }],
};

// 处理选择变更
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows;
  console.log(rows);
};

// 附件上传成功
const handleUploadSuccess = (file: any) => {
  console.log("当前上传成功文件", file);
  tempFileList.value.push(file);
  console.log("文件列表", tempFileList.value);
};

// 构建参数
const buildParams = () => {
  // 构建提交数据 - 将表单字段糅合到列表数据中
  const submitList = selectedRows.value.map((row) => ({
    // 明细数据
    id: row.id,
    itemType: row.itemType, // 款项类型/事项
    orgName: row.orgName, // 所属组织
    expenseType: row.expenseType, // 费用类型
    payeeBank: row.payeeBank, // 收款方开户行
    payeeAccountName: row.payeeAccountName, // 收款方开户名
    payeeAccount: row.payeeAccount, // 收款方账号
    paymentMethod: row.paymentMethod, // 支付方式
    subjectName: row.subjectName, // 科目名称
    requestAmount: row.requestAmount, // 请款金额
    unpaidAmount: row.unpaidAmount, // 未付金额
    currentPaymentAmount: row.currentPaymentAmount, // 本次支付金额
    // 表单数据 - 糅合到每条明细中
    paymentDate: formData.value.paymentDate, // 支付日期
    paymentMethodGlobal: formData.value.paymentMethod, // 支付方式（全局）
    paymentAmountGlobal: formData.value.paymentAmount, // 支付金额（全局）
    paymentAccount: formData.value.paymentAccount, // 支付账号
    paymentCompany: formData.value.paymentCompany, // 支付公司
    payeeName: formData.value.payeeName, // 收款方
    payeeBankGlobal: formData.value.payeeBank, // 收款银行（全局）
    payeeAccountGlobal: formData.value.payeeAccount, // 收款账号（全局）
    bankReceipt: formData.value.bankReceipt, // 银行回单
    receiptPhotos: formData.value.receiptPhotos, // 回单照片
    remark: formData.value.remark, // 备注
    // 登记信息
    registrar: formData.value.registrar || "张三",
    registrarDate:
      formData.value.registrarDate || new Date().toISOString().split("T")[0],
    // 流程信息
    nconBillId: formData.value.nconBillId,
    settledPaymentId: formData.value.settledPaymentId,
    status: formData.value.status,
  }));
  return submitList;
};
// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    // 验证表格数据
    const invalidRows = tableData.value.filter(
      (row) =>
        row.currentPaymentAmount > 0 &&
        row.currentPaymentAmount > row.unpaidAmount,
    );
    if (invalidRows.length > 0) {
      ElMessage.warning("本次支付金额不能超过未付金额");
      submitLoading.value = false;
      return;
    }

    // TODO: 调用提交接口
    console.log("提交数据:", {
      ...formData.value,
      details: buildParams(),
    });

    // ElMessage.success("提交成功");
    // emit("success");
    // handleClose();
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

// 关闭弹窗
const handleClose = () => {
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
  dialogVisible.value = false;
};

// 监听外部传入的显示状态
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val && props.editData) {
      // 编辑时回填数据
      Object.assign(formData.value, props.editData);
    }
  },
);

// 监听内部显示状态变化
watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
  if (!val) {
    // 关闭时重置编辑数据
    if (!props.modelValue) {
      formData.value = {
        id: undefined,
        segId: undefined,
        projId: undefined,
        paymentDate: "",
        paymentMethod: "",
        paymentAmount: 0,
        paymentAccount: "",
        paymentCompany: "",
        payeeName: "",
        payeeBank: "",
        payeeAccount: "",
        bankReceipt: "",
        receiptPhotos: [],
        remark: "",
        registrar: "",
        registrarDate: "",
        modifier: "",
        modifyDate: "",
        nconBillId: undefined,
        settledPaymentId: undefined,
        status: 0,
      };
    }
  }
});
</script>

<style lang="scss" scoped>
.title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  padding-left: 12px;
  box-sizing: border-box;
  position: relative;
  &::before {
    content: "";
    width: 4px;
    height: 16px;
    background: linear-gradient(180deg, #409eff, #66b1ff);
    border-radius: 2px;
    position: absolute;
    left: 0;
    top: 5px;
  }
}

:deep(.el-upload--picture-card) {
  width: 80px;
  height: 80px;
}
</style>
