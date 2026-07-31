<!-- 付款登记 弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="'付款登记'"
    width="1100px"
    :confirmText="'提交登记'"
    :confirm-loading="submitLoading"
    @confirm="handleSubmit"
    @close="handleClose"
  >
    <div style="padding-right: 8px; box-sizing: border-box">
      <div
        style="
          width: 100%;
          display: flex;
          flex-wrap: nowrap;
          margin-bottom: 10px;
        "
      >
        <div class="info-item">
          <span class="info-label">登记人：</span>
          <span class="info-value">{{ formData.registrar || "张三" }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">登记日期：</span>
          <span class="info-value">
            {{ formData.registrarDate || "2026-07-20" }}
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">修改人：</span>
          <span class="info-value">{{ formData.modifier || "李思" }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">修改日期：</span>
          <span class="info-value">
            {{ formData.modifyDate || "2026-08-21" }}
          </span>
        </div>
      </div>

      <div class="title">款项明细</div>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="0"
      >
        <editable-table
          ref="tableRef"
          :row-key="'id'"
          :height="'400px'"
          v-model="tableData"
          :columns="tableColumns"
          :pagination="false"
          :highlight-current-row="false"
          :show-summary="false"
          :compactEmpty="true"
          :editable="true"
          @selection-change="handleSelectionChange"
        >
          <!-- 回单照片列自定义渲染 -->
          <template #receiptPhotos="{ row }">
            <div class="photo-list">
              <template
                v-if="row.receiptPhotos && row.receiptPhotos.length > 0"
              >
                <div
                  v-for="(photo, index) in getDisplayPhotos(row.receiptPhotos)"
                  :key="photo.id || index"
                  class="photo-item-wrapper"
                  @click.stop="handlePreview(row.receiptPhotos, index)"
                >
                  <el-image
                    :src="photo.url || photo"
                    fit="cover"
                    class="photo-item"
                    :preview-teleported="true"
                  />
                </div>
                <span
                  v-if="row.receiptPhotos.length > 3"
                  class="photo-more"
                  @click.stop="handlePreview(row.receiptPhotos, 3)"
                >
                  +{{ row.receiptPhotos.length - 3 }}
                </span>
              </template>
              <span v-else style="color: #909399; font-size: 12px">
                暂无照片
              </span>
            </div>
          </template>

          <template #actions="{ row }">
            <div class="actions-btn">
              <el-button
                link
                type="primary"
                @click.stop="openUploadForRow(row)"
              >
                上传照片
              </el-button>
              <el-button
                v-if="row.receiptPhotos && row.receiptPhotos.length > 0"
                link
                type="danger"
                @click.stop="clearPhotos(row)"
              >
                清空照片
              </el-button>
            </div>
          </template>
        </editable-table>
      </el-form>
      <!-- 放在表格外面的上传组件（隐藏） -->
      <Teleport to="body">
        <div style="display: none" @click.stop @mousedown.stop>
          <base-upload
            ref="hiddenUploadRef"
            key="receipt-photo"
            v-model:file-list="tempFileList"
            :limit="1"
            :multiple="true"
            :showIcon="true"
            :showTip="false"
            :accept="'.jpg,.jpeg,.png'"
            button-text="选择文件"
            size="default"
            button-type="primary"
            @success="handleUploadSuccess"
          />
        </div>
      </Teleport>

      <!-- 图片预览组件 -->
      <el-image-viewer
        v-if="showViewer"
        :url-list="previewList"
        :initial-index="previewIndex"
        :teleported="true"
        @close="closePreview"
        @switch="handleSwitch"
      />
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { ElImageViewer } from "element-plus";
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
const selectedRows = ref([]);
const tempFileList = ref([]);
const hiddenUploadRef = ref();
const currentUploadRow = ref<any>(null);

// 预览相关
const showViewer = ref(false);
const previewList = ref<string[]>([]);
const previewIndex = ref(0);
const currentPreviewPhotos = ref<any[]>([]);

// 表单数据（仅保留全局信息）
const formData = ref({
  id: undefined,
  segId: undefined,
  projId: undefined,
  registrar: "",
  registrarDate: "",
  modifier: "",
  modifyDate: "",
  nconBillId: undefined,
  settledPaymentId: undefined,
  status: 0,
});

// 表格数据
const tableData = ref([
  {
    id: 1,
    itemType: "办公费",
    orgName: "财务部",
    expenseType: "办公用品",
    subjectName: "管理费用",
    requestAmount: 10000,
    unpaidAmount: 10000,
    paymentDate: "2026-07-17",
    paymentMethod: "bank_transfer",
    paymentAmount: 0,
    paymentAccount: "6222****1234",
    paymentCompany: "XX科技有限公司",
    payeeName: "XX公司",
    payeeBank: "中国银行",
    payeeAccount: "6222****1234",
    bankReceipt: "BK20260717001",
    receiptPhotos: [
      {
        id: 1,
        url: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
        name: "回单1.jpg",
      },
      {
        id: 2,
        url: "https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg",
        name: "回单2.jpg",
      },
    ],
    remark: "办公用品采购付款",
    payeeBankOld: "中国银行",
    payeeAccountNameOld: "XX公司",
    payeeAccountOld: "6222****1234",
    paymentMethodOld: "银行转账",
  },
  {
    id: 2,
    itemType: "差旅费",
    orgName: "市场部",
    expenseType: "交通费",
    subjectName: "销售费用",
    requestAmount: 5000,
    unpaidAmount: 5000,
    paymentDate: "2026-07-17",
    paymentMethod: "cash",
    paymentAmount: 0,
    paymentAccount: "",
    paymentCompany: "XX科技有限公司",
    payeeName: "李四",
    payeeBank: "建设银行",
    payeeAccount: "6222****5678",
    bankReceipt: "",
    receiptPhotos: [],
    remark: "",
    payeeBankOld: "建设银行",
    payeeAccountNameOld: "李四",
    payeeAccountOld: "6222****5678",
    paymentMethodOld: "现金",
  },
  {
    id: 3,
    itemType: "办公费",
    orgName: "行政部",
    expenseType: "办公用品",
    subjectName: "管理费用",
    requestAmount: 3000,
    unpaidAmount: 3000,
    paymentDate: "2026-07-17",
    paymentMethod: "check",
    paymentAmount: 0,
    paymentAccount: "CZ20260717001",
    paymentCompany: "XX科技有限公司",
    payeeName: "王五",
    payeeBank: "工商银行",
    payeeAccount: "6222****9012",
    bankReceipt: "BK20260717002",
    receiptPhotos: [],
    remark: "支票付款",
    payeeBankOld: "工商银行",
    payeeAccountNameOld: "王五",
    payeeAccountOld: "6222****9012",
    paymentMethodOld: "支票",
  },
]);

// 支付方式选项
const paymentMethodOptions = [
  { label: "银行转账", value: "bank_transfer" },
  { label: "支票", value: "check" },
  { label: "现金", value: "cash" },
  { label: "电汇", value: "telegraphic_transfer" },
];

// 表格列配置
const tableColumns = computed<EditableColumn[]>(() => [
  { type: "selection", width: 50, fixed: "left" },
  { prop: "itemType", label: "款项类型/事项", editable: false, width: 120 },
  { prop: "orgName", label: "所属组织", editable: false, width: 100 },
  { prop: "expenseType", label: "费用类型", editable: false, width: 100 },
  { prop: "subjectName", label: "科目名称", editable: false, width: 100 },
  {
    prop: "payeeBank",
    label: "收款银行",
    editable: true,
    editType: "input",
    width: 140,
  },
  {
    prop: "payeeName",
    label: "收款方",
    editable: true,
    editType: "input",
    width: 130,
  },
  {
    prop: "payeeAccount",
    label: "收款账号",
    editable: true,
    editType: "input",
    width: 150,
  },
  {
    prop: "paymentMethod",
    label: "支付方式",
    editable: true,
    editType: "select",
    width: 130,
    showOverflowTooltip: false,
    optionLabelField: "label",
    optionValueField: "value",
    options: paymentMethodOptions,
  },
  { prop: "requestAmount", label: "请款金额", editable: false, width: 100 },
  { prop: "unpaidAmount", label: "未付金额", editable: false, width: 100 },
  {
    prop: "paymentAmount",
    label: "支付金额",
    editable: true,
    editType: "number",
    width: 140,
  },
  {
    prop: "paymentDate",
    label: "支付日期",
    editable: true,
    editType: "date",
    width: 160,
  },
  {
    prop: "remark",
    label: "备注",
    editable: true,
    editType: "input",
    width: 150,
  },
  {
    prop: "paymentAccount",
    label: "支付账号",
    editable: true,
    editType: "input",
    width: 150,
  },
  {
    prop: "paymentCompany",
    label: "支付公司",
    editable: true,
    editType: "input",
    width: 140,
  },
  {
    prop: "bankReceipt",
    label: "银行回单号",
    editable: true,
    editType: "input",
    width: 140,
  },
  {
    prop: "receiptPhotos",
    label: "回单照片",
    editable: false,
    width: 160,
    slot: "receiptPhotos",
  },
  {
    label: "操作",
    width: 200,
    slot: "actions",
    fixed: "right",
  },
]);

// 表单校验规则
const formRules: FormRules = {};

// 处理选择变更
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows;
};

// 获取显示的照片（最多显示3张）
const getDisplayPhotos = (photos: any[]) => {
  if (!photos || photos.length === 0) return [];
  return photos.slice(0, 3);
};

// 处理预览
const handlePreview = (photos: any[], index: number) => {
  if (!photos || photos.length === 0) return;

  currentPreviewPhotos.value = photos;
  previewList.value = photos.map((photo) => photo.url || photo);
  previewIndex.value = Math.min(index, photos.length - 1);
  showViewer.value = true;
};

// 关闭预览
const closePreview = () => {
  showViewer.value = false;
  previewList.value = [];
  previewIndex.value = 0;
  currentPreviewPhotos.value = [];
};

// 切换图片
const handleSwitch = (index: number) => {
  previewIndex.value = index;
};

// 更新行数据
const updateRow = (rowIndex: number, data: any) => {
  Object.assign(tableData.value[rowIndex], data);
  tableData.value = [...tableData.value];
};

// 打开上传对话框
const openUploadForRow = (row: any) => {
  currentUploadRow.value = row;
  tempFileList.value = [];

  nextTick(() => {
    hiddenUploadRef.value?.triggerFileSelect();
  });
};

// 上传组件的成功回调
const handleUploadSuccess = (file: any) => {
  console.log("上传组件的成功回调", file);
  tempFileList.value = [file];
  if (currentUploadRow.value) {
    const currIndex = tableData.value.findIndex(
      (item) => item.id === currentUploadRow.value.id,
    );

    if (currIndex === -1) {
      currentUploadRow.value = null;
      return;
    }

    const photoItem = {
      id: file.id || Date.now(),
      url: file.url || file.annexPath,
      name: file.annexName || file.name,
      annexName: file.annexName || file.name,
      annexPath: file.annexPath || file.url,
    };

    const currentPhotos = tableData.value[currIndex].receiptPhotos || [];

    updateRow(currIndex, {
      receiptPhotos: [...currentPhotos, photoItem],
    });

    // ElMessage.success("照片上传成功");
    currentUploadRow.value = null;
  }
};

// 清空照片
const clearPhotos = (row: any) => {
  const currIndex = tableData.value.findIndex((item) => item.id === row.id);

  if (currIndex !== -1) {
    updateRow(currIndex, {
      receiptPhotos: [],
    });
    ElMessage.success("已清空照片");
  }
};

// 构建参数
const buildParams = () => {
  const submitList = selectedRows.value.map((row) => ({
    id: row.id,
    itemType: row.itemType,
    orgName: row.orgName,
    expenseType: row.expenseType,
    subjectName: row.subjectName,
    requestAmount: row.requestAmount,
    unpaidAmount: row.unpaidAmount,
    paymentDate: row.paymentDate,
    paymentMethod: row.paymentMethod,
    paymentAmount: row.paymentAmount,
    paymentAccount: row.paymentAccount,
    paymentCompany: row.paymentCompany,
    payeeName: row.payeeName,
    payeeBank: row.payeeBank,
    payeeAccount: row.payeeAccount,
    bankReceipt: row.bankReceipt,
    receiptPhotos: row.receiptPhotos || [],
    remark: row.remark,
    registrar: formData.value.registrar || "张三",
    registrarDate:
      formData.value.registrarDate || new Date().toISOString().split("T")[0],
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

    if (selectedRows.value.length === 0) {
      ElMessage.warning("请至少选择一条款项明细");
      submitLoading.value = false;
      return;
    }

    const invalidRows = selectedRows.value.filter((row) => {
      if (!row.paymentDate) {
        ElMessage.warning(`第${row.id}行：请选择支付日期`);
        return true;
      }
      if (!row.paymentMethod) {
        ElMessage.warning(`第${row.id}行：请选择支付方式`);
        return true;
      }
      if (!row.paymentAmount || row.paymentAmount <= 0) {
        ElMessage.warning(`第${row.id}行：请输入有效的支付金额`);
        return true;
      }
      if (row.paymentAmount > row.unpaidAmount) {
        ElMessage.warning(`第${row.id}行：本次支付金额不能超过未付金额`);
        return true;
      }
      if (!row.payeeName) {
        ElMessage.warning(`第${row.id}行：请输入收款方名称`);
        return true;
      }
      if (!row.payeeBank) {
        ElMessage.warning(`第${row.id}行：请输入收款银行`);
        return true;
      }
      if (!row.payeeAccount) {
        ElMessage.warning(`第${row.id}行：请输入收款账号`);
        return true;
      }
      return false;
    });

    if (invalidRows.length > 0) {
      submitLoading.value = false;
      return;
    }

    console.log("提交数据:", buildParams());

    ElMessage.success("提交成功");
    emit("success");
    handleClose();
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
  currentUploadRow.value = null;
  tempFileList.value = [];
  closePreview();
};

// 监听外部传入的显示状态
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val && props.editData) {
      Object.assign(formData.value, props.editData);
      if (props.editData.details) {
        tableData.value = props.editData.details;
      }
    }
  },
);

// 监听内部显示状态变化
watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
  if (!val) {
    if (!props.modelValue) {
      formData.value = {
        id: undefined,
        segId: undefined,
        projId: undefined,
        registrar: "",
        registrarDate: "",
        modifier: "",
        modifyDate: "",
        nconBillId: undefined,
        settledPaymentId: undefined,
        status: 0,
      };
      tableData.value.forEach((row) => {
        row.paymentAmount = 0;
      });
      selectedRows.value = [];
      currentUploadRow.value = null;
      tempFileList.value = [];
      closePreview();
    }
  }
});
</script>

<style lang="scss" scoped>
.title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
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

.info-item {
  width: 25%;
  display: flex;
  align-items: center;
  .info-label {
    color: #909399;
    font-size: 14px;
    min-width: 80px;
    display: flex;
    justify-content: flex-end;
  }

  .info-value {
    color: #303133;
    font-size: 14px;
    font-weight: 500;
  }
}

.actions-btn {
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.photo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;

  .photo-item-wrapper {
    position: relative;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #e4e7ed;
    transition: all 0.2s;

    &:hover {
      transform: scale(1.1);
      border-color: #409eff;
      z-index: 1;
    }

    .photo-item {
      width: 40px;
      height: 40px;
      display: block;
    }
  }

  .photo-more {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: #f5f7fa;
    color: #409eff;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: 1px dashed #d9d9d9;
    transition: all 0.2s;

    &:hover {
      background: #ecf5ff;
      border-color: #409eff;
    }
  }
}
</style>
