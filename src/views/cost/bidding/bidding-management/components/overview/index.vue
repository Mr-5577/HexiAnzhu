<!-- 招标总览 -->
<template>
  <div class="overview-form-page">
    <!-- 基本信息 -->
    <basic-info></basic-info>

    <div class="form-section">
      <h3 class="section-title">二、定标详情</h3>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12">
          <el-form-item
            label="中标单位"
            label-width="100px"
            label-position="right"
          >
            <el-input v-model="form.winUnit" placeholder="请输入中标单位" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item
            label="中标金额"
            label-width="100px"
            label-position="right"
          >
            <el-input v-model="form.winPrice" placeholder="请输入中标金额" />
          </el-form-item>
        </el-col>
      </el-row>
      <base-table
        :columns="columns"
        :tableData="tableData"
        :loading="loading"
        :rowKey="'treeId'"
        :pagination="false"
        :auto-height="false"
        :height="'220px'"
        :show-toolbar="false"
      />
    </div>

    <div class="form-footer">
      <el-button @click="reset">重置</el-button>
      <el-button type="primary" @click="submit">提交</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import BasicInfo from "../basic-info.vue";

defineOptions({ name: "overview" });

const loading = ref(false);
const form = ref({
  remark: "",
  winUnit: "",
  winPrice: "",
});

const columns = [
  { type: "index", label: "序号", width: 60 },
  { prop: "unit", label: "投标单位", width: 260 },
  { prop: "price", label: "投标金额", width: 140 },
  { prop: "tax", label: "税率", width: 140 },
  { prop: "desc", label: "综合评定说明" },
  {
    prop: "isWin",
    label: "是否中标",
    width: 140,
  },
];
// 投标表格
const tableData = ref([
  { unit: "1", price: "2", tax: "3", desc: "4", isWin: "0" },
  { unit: "1", price: "2", tax: "3", desc: "4", isWin: "0" },
  { unit: "1", price: "2", tax: "3", desc: "4", isWin: "0" },
]);

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
.overview-form-page {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  overflow-y: auto;
  padding: 30px 30px;
  box-sizing: border-box;
  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
  }
  .form-footer {
    display: flex;
    justify-content: center;
    gap: 15px;
    padding-top: 20px;
  }
}
</style>
