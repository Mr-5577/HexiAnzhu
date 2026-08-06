<!-- 合同发票详情 弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    :title="'合同发票详情'"
    width="1000px"
    :showConfirmButton="false"
    :showCancelButton="false"
    @close="handleClose"
  >
    <div style="padding-right: 8px; box-sizing: border-box">
      <el-descriptions :column="4" class="info-descriptions">
        <el-descriptions-item label="合同名称：" :span="1">
          2424
        </el-descriptions-item>
        <el-descriptions-item label="供应商名称：" :span="1">
          242
        </el-descriptions-item>
        <el-descriptions-item label="合同金额：" :span="1">
          43243
        </el-descriptions-item>
        <el-descriptions-item label="结算状态：" :span="1">
          42324
        </el-descriptions-item>

        <el-descriptions-item label="预结算/结算金额：" :span="1">
          2423
        </el-descriptions-item>
        <el-descriptions-item label="合同产值：" :span="1">
          2442
        </el-descriptions-item>
        <el-descriptions-item label="应付款：" :span="1">
          4243
        </el-descriptions-item>
        <el-descriptions-item label="已开票金额：" :span="1">
          24423
        </el-descriptions-item>

        <el-descriptions-item label="欠费金额：" :span="1">
          32424
        </el-descriptions-item>
      </el-descriptions>
      <div>
        <div class="title">发票列表</div>
        <base-table
          :columns="invoiceColumns"
          :tableData="invoiceList"
          :rowKey="'id'"
          :height="'180px'"
          :pagination="false"
          :loading="false"
          :compactEmpty="true"
        />
      </div>
      <div>
        <div class="title">发票明细</div>
        <base-table
          :columns="detailColumns"
          :tableData="detailList"
          :rowKey="'id'"
          :height="'180px'"
          :pagination="false"
          :loading="false"
          :compactEmpty="true"
        />
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";

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
// 表单数据
const formData = ref({});
const invoiceList = ref([]);
const invoiceColumns = ref([
  { type: "index", label: "序号", width: 60 },
  { prop: "ww", label: "发票代码", width: 150 },
  { prop: "projId", label: "发票编号", width: 150 },
  { prop: "segId", label: "发票类型", width: 150 },
  { prop: "segId", label: "开票日期", width: 150 },
  { prop: "segId", label: "含税金额", width: 150 },
  { prop: "segId", label: "不含税金额", width: 150 },
  { prop: "segId", label: "税额", width: 120 },
  { prop: "segId", label: "发票附件", width: 150 },
  { prop: "segId", label: "查验结果", width: 150 },
  { prop: "segId", label: "查验结果描述", width: 200 },
]);
const detailList = ref([]);
const detailColumns = ref([
  { type: "index", label: "序号", width: 60 },
  { prop: "ww", label: "项目/服务名称", width: 150 },
  { prop: "projId", label: "规格", width: 150 },
  { prop: "segId", label: "单位", width: 150 },
  { prop: "segId", label: "数量", width: 150 },
  { prop: "segId", label: "单价", width: 150 },
  { prop: "segId", label: "含税金额", width: 150 },
  { prop: "segId", label: "税率", width: 120 },
  { prop: "segId", label: "税额", width: 120 },
]);

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
};
// 监听外部传入的显示状态
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val && props.editData) {
      // 回填数据
      Object.assign(formData.value, props.editData);
    }
  },
);
</script>

<style lang="scss" scoped>
.info-descriptions {
  :deep(.el-descriptions__label) {
    // width: 130px;          // 固定宽度
    // background-color: #fafafa;
    // font-weight: 500;
    margin-right: 0;
  }
  :deep(.el-descriptions__content) {
    // word-break: break-all;
  }
  :deep(.el-descriptions__body) {
    .el-descriptions__table {
      table-layout: fixed;
    }
    .el-descriptions__table td {
      width: 25%; /* 4列就是25% */
    }
  }
  /* 让所有列等宽 */
  .el-descriptions__body .el-descriptions__table {
    table-layout: fixed;
  }
  /* 每列平均分配宽度 */
  .el-descriptions__body .el-descriptions__table td {
    width: 25%; /* 4列就是25% */
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
  }
}
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
</style>
