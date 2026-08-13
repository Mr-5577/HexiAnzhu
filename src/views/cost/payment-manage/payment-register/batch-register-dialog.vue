<!-- 付款登记 弹窗 -->
<template>
  <base-modal v-model="dialogVisible" :title="'付款登记'" width="1400px" :confirmText="'提交登记'"
    :confirm-loading="submitLoading" @confirm="handleSubmit" @close="handleClose">
    <div style="padding-right: 8px; box-sizing: border-box">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" label-position="right">
        <el-row>
          <el-col :span="8">
            <el-form-item prop="payDate" label="支付日期" required>
              <el-date-picker v-model="formData.payDate" type="date" placeholder="请选择支付日期" value-format="YYYY-MM-DD"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="payWayId" label="支付方式" required>
              <el-select v-model="formData.payWayId" placeholder="请选择支付方式" style="width: 100%">
                <el-option v-for="item in payTypeOptions" :key="item.id" :label="item.dicLabel" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="payAmt" label="支付金额">
              <el-input-number v-model="formData.payAmt" placeholder="请输入支付金额" :precision="2" :min="0" :controls="false"
                style="width: 100%" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item prop="payCompId" label="支付公司" required>
              <el-select v-model="formData.payCompId" placeholder="请选择支付公司" style="width: 100%">
                <el-option v-for="item in payComOptions" :key="item.id" :label="item.compName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="payAccount" label="支付账号">
              <el-input v-model="formData.payAccount" placeholder="请输入支付账号" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="bankReceipt" label="银行回单号">
              <el-input v-model="formData.bankReceipt" placeholder="银行回单号" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="payDesc" label="备注">
              <el-input v-model="formData.payDesc" type="textarea" placeholder="请输入备注信息" :rows="3" maxlength="500"
                show-word-limit style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="回单照片">
              <base-upload v-model:file-list="tempFileList" :limit="1" :multiple="true" :showIcon="true" :showTip="true"
                :maxSize="20" :accept="'.pdf,.jpg,.jpeg,.png'" :tipText="'支持上传pdf、jpg、jpeg、png格式文件，单个文件不超过20M'"
                button-text="选择图片" size="default" @success="handleFileSuccess"></base-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label-width="80px" label="登记人:">
              {{ formData.registrar || "-" }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label-width="80px" label="登记日期:">
              {{ formData.registrarDate || "-" }}
            </el-form-item>
          </el-col>
          <!-- <el-col :span="6">
            <el-form-item label-width="80px" label="修改人:">
              {{ formData.modifier || "-" }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label-width="80px" label="修改日期:">
              {{ formData.modifyDate || "-" }}
            </el-form-item>
          </el-col> -->
        </el-row>
      </el-form>
      <div>
        <div class="title">款项明细</div>
        <editable-table ref="tableRef" :row-key="'uuid'" :height="'240px'" v-model="tableData" :columns="tableColumns"
          :pagination="false" :highlight-current-row="false" :show-summary="false" :compactEmpty="true" :editable="true"
          @selection-change="handleSelectionChange" :on-save="handleTableSave">
        </editable-table>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, nextTick } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import EditableTable from "@/components/base/editable-table.vue";
import { EditableColumn } from "@/components/base/editable-table.vue";
import BaseUpload from "@/components/base/base-upload.vue";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import { dateUtil } from "@/utils/date-util";
import { useUserStore } from "@/stores/user-store";
import { useMDStore } from "@/stores/md-store.ts";
import { v4 as uuidv4 } from "uuid";
import { payRegisterApi } from "@/api/cost/payment-manage/payment-register-api";

interface Props {
  modelValue: boolean;
  currentRow?: any;
  queryParams?: any;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  currentRow: null,
  queryParams: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const userStore = useUserStore();
const mdStore = useMDStore();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const tempFileList = ref([]);
const selectedRows = ref([]);
const payComOptions = ref([]);

const initFormData = () => ({
  id: undefined,
  segId: undefined,
  projId: undefined,
  // 支付信息
  payDate: dateUtil().format("YYYY-MM-DD"), // 支付日期
  payWayId: undefined, // 支付方式
  payAmt: 0, // 支付金额
  payAccount: "", // 支付账号
  payCompId: "", // 支付公司
  bankReceipt: "", // 银行回单
  payDesc: "", // 备注
  // 登记信息
  registrar: "", // 登记人
  registrarDate: "", // 登记日期
  modifier: "", // 修改人
  modifyDate: "", // 修改日期
});
// 表单数据
const formData = ref(initFormData());

// 表格数据
const tableData = ref([]);

// 表格列配置
const tableColumns = computed<EditableColumn[]>(() => [
  { type: "selection", width: 50, fixed: "left" },
  { prop: "finaSubDesc", label: "款项类型/事项", editable: false },
  { prop: "finaOrgName", label: "所属组织", editable: false },
  {
    prop: "pmBankName",
    label: "收款方开户名",
    editable: false,
  },
  { prop: "pmAccountName", label: "收款方账号", editable: false },
  { prop: "payWayName", label: "支付方式", editable: false, width: 100 },
  { prop: "finaSubName", label: "科目名称", editable: false },
  { prop: "finaSubAmt", label: "请款金额", editable: false, width: 90 },
  { prop: "unpaidAmt", label: "未付金额", editable: false, width: 90 },
  {
    prop: "currPayAmt",
    label: "本次支付金额",
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
    width: 120,
  },
]);

// 表单校验规则
const formRules: FormRules = {
  payDate: [{ required: true, message: "请选择支付日期", trigger: "change" }],
  payWayId: [{ required: true, message: "请选择支付方式", trigger: "change" }],
  payAmt: [{ required: true, message: "请输入支付金额", trigger: "change" }],
  payCompId: [{ required: true, message: "请选择支付公司", trigger: "change" }],
};
// 数据字典
const { getDictList, loadDicts } = useDict([dictMapping.payType], {
  treeDictCodes: [],
});
// 付款方式
const payTypeOptions = computed(() => getDictList(dictMapping.payType));

// 计算支付金额（所有行的本次支付金额累加）
const calcTotalPayAmt = () => {
  const total = tableData.value.reduce((sum, row) => {
    const amt = Number(row.currPayAmt) || 0;
    return sum + amt;
  }, 0);
  formData.value.payAmt = total;
  return total;
};

// 处理选择变更
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows;
};

// 处理单元格编辑（当本次支付金额变化时重新计算总金额）
const handleTableSave = ({ row, column, newValue, oldValue, rowIndex }) => {
  // 如果编辑的是本次支付金额字段
  if (column === "currPayAmt") {
    // 使用nextTick确保值已更新
    nextTick(() => {
      calcTotalPayAmt();
    });
  }
};

const handleFileSuccess = (file: any) => {
  // tempFileList.value.push(file);
  tempFileList.value = [file];
  console.log("文件列表", tempFileList.value);
};

// 构建参数
const buildParams = () => {
  // 构建提交数据 - 将表单字段糅合到列表数据中
  const submitList = selectedRows.value.map((row) => ({
    // 明细数据
    id: row.id,
    bizType: row.bizType,
    bizBillId: row.bizBillId,
    finaAllocId: row.finaAllocId,
    bankName: "",
    accountName: "",
    bankAccount: formData.value.payAccount,
    payWayId: formData.value.payWayId,
    payCompId: formData.value.payCompId,
    bankReceipt: formData.value.bankReceipt,
    payAmt: row.currPayAmt,
    payDate: formData.value.payDate,
    payDesc: formData.value.payDesc,
    annexId: tempFileList.value.length ? tempFileList.value[0]?.id : undefined,
  }));
  return submitList;
};
// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    if (tableData.value.length === 0) {
      ElMessage.warning("暂无款项明细数据！");
      submitLoading.value = false;
      return;
    }

    // 1. 验证是否勾选了列表数据
    if (selectedRows.value.length === 0) {
      ElMessage.warning("请先勾选款项明细！");
      submitLoading.value = false;
      return;
    }

    // 2. 验证勾选的数据的本次支付金额必须大于0
    const invalidRows = selectedRows.value.filter(
      (row) => !row.currPayAmt || Number(row.currPayAmt) <= 0,
    );
    if (invalidRows.length > 0) {
      ElMessage.warning("勾选的明细中，本次支付金额必须大于0");
      submitLoading.value = false;
      return;
    }

    // 3. 验证本次支付金额不能超过未付金额
    const exceedRows = selectedRows.value.filter(
      (row) => Number(row.currPayAmt) > Number(row.unpaidAmt),
    );
    if (exceedRows.length > 0) {
      ElMessage.warning("本次支付金额不能超过未付金额");
      submitLoading.value = false;
      return;
    }
    // 构建参数
    const paramList = buildParams();
    const res = await payRegisterApi.savePayRegister(paramList);
    if (res.code === 200) {
      ElMessage.success("提交成功");
      emit("success");
      handleClose();
    }
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
// 获取公司列表
const getCompanyListByProjId = async () => {
  const projId = props?.currentRow?.projId;
  if (!projId) {
    payComOptions.value = [];
    return;
  }
  try {
    payComOptions.value = [];
    const companies = await mdStore.getProjCompanyList(projId);
    payComOptions.value = companies || [];
  } catch (error) {
    console.error("获取公司列表失败:", error);
    payComOptions.value = [];
  }
};
// 获取明细数据
const getDetailList = async () => {
  console.log("查询参数", props.queryParams);
  if (!props.queryParams) return;
  const { applyDate, ...rest } = props.queryParams;
  try {
    const params = {
      ...rest,
      reqDateStart: rest.applyDate?.[0],
      reqDateEnd: rest.applyDate?.[1],
      bizBillId: props.currentRow.bizBillId,
      bizType: props.currentRow.bizType,
    };
    const res = await payRegisterApi.getPayLedgerSub(params);
    console.log("res", res);
    if (res.code === 200) {
      const list = res.data || [];
      tableData.value = list.map((item) => {
        // 计算未付金额 = 请款金额 - 已付金额
        const unpaidAmt =
          (Number(item.finaSubAmt) || 0) - (Number(item.regPayAmtSum) || 0);
        return {
          ...item,
          uuid: uuidv4(),
          currPayAmt: unpaidAmt, // 初始化本次支付金额为未付金额
          unpaidAmt: unpaidAmt, // 未付金额
        };
      });
      if (tableData.value.length > 0) {
        const firstData = tableData.value[0];
        formData.value.payWayId = firstData?.pmPayWayId ? Number(firstData?.pmPayWayId) : undefined;
      }
    }
  } catch (error) { }
};
const initData = async () => {
  await loadDicts();
  await getCompanyListByProjId();
  await getDetailList();
  // 清空选中的行
  selectedRows.value = [];
  // 重置支付金额
  formData.value.payAmt = 0;
};

// 监听外部传入的显示状态
watch(
  () => props.modelValue,
  async (val) => {
    dialogVisible.value = val;
    if (val) {
      formData.value = initFormData();
      formData.value.registrar = userStore.userInfo?.empName || "";
      formData.value.registrarDate = dateUtil().format("YYYY-MM-DD");
      formData.value.payCompId = props?.currentRow?.compId || undefined;
      await initData();
    }
  },
);

// 监听内部显示状态变化
watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
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
