<!-- 招标需求 -->
<template>
  <div class="demand-form-page">
    <!-- 基本信息 -->
    <basic-info></basic-info>

    <div class="form-section">
      <h3 class="section-title">二、单据信息</h3>

      <base-table
        :columns="columns"
        :tableData="tableData"
        :loading="loading"
        :rowKey="'treeId'"
        :pagination="false"
        :auto-height="false"
        :height="'220px'"
        :show-toolbar="false"
      >
        <!-- 列表外操作栏 -->
        <template #actionBar>
          <div class="actionBar-buttons">
            <div class="text">单据列表</div>
            <el-button type="primary" @click="modalVisible = true">
              新增需求
            </el-button>
          </div>
        </template>
      </base-table>
    </div>

    <div class="form-footer">
      <el-button @click="reset">重置</el-button>
      <el-button type="primary" @click="submit">提交</el-button>
    </div>
    <add-demand-dialog
      v-model="modalVisible"
      @success="handleAddSuccess"
    ></add-demand-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import BasicInfo from "../basic-info.vue";
import AddDemandDialog from "./add-demand-dialog.vue";

defineOptions({ name: "demand" });

const modalVisible = ref(false);
const loading = ref(false);
const form = ref({
  remark: "",
  winUnit: "",
  winPrice: "",
});

const columns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "unit", label: "流程标题" },
  { prop: "price", label: "审批状态", width: 200 },
  { prop: "tax", label: "经办人", width: 200 },
  { prop: "desc", label: "经办日期", width: 200 },
];
// 投标表格
const tableData = ref([
  { unit: "1", price: "2", tax: "3", desc: "4", isWin: "0" },
  { unit: "1", price: "2", tax: "3", desc: "4", isWin: "0" },
  { unit: "1", price: "2", tax: "3", desc: "4", isWin: "0" },
]);

const handleAddSuccess = () => {};

// 提交
const submit = () => {
  console.log("基本信息", basicForm);
  console.log("表单", form);
  console.log("投标明细", tableData.value);
  ElMessage.success("提交成功");
};

// 重置
const reset = () => {
  Object.keys(basicForm).forEach((key) => (basicForm[key] = ""));
  form.remark = "";
  form.winUnit = "";
  form.winPrice = "";
  tableData.value = [{ unit: "", price: "", tax: "", desc: "", isWin: "0" }];
  ElMessage.info("已重置");
};
</script>

<style scoped lang="scss">
.demand-form-page {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  overflow-y: auto;
  padding: 30px 30px;
  box-sizing: border-box;
  .form-section {
    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #333;
    }
    .actionBar-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .text {
        font-size: 15px;
        font-weight: bold;
        color: #333;
      }
    }
  }
  .form-footer {
    display: flex;
    justify-content: center;
    gap: 15px;
    padding-top: 20px;
  }
}
</style>
