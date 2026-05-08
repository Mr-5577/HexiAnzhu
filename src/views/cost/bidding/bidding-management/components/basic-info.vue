<template>
  <div class="basic-info-section">
    <h3 class="basic-title">一、基本信息</h3>
    <el-form :model="basicForm" label-width="100px">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="业务板块">
            <el-input v-model="basicForm.businessPlate" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="项目">
            <el-input v-model="basicForm.project" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="公司">
            <el-input v-model="basicForm.company" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="合同分类">
            <el-input v-model="basicForm.contractType" placeholder="请输入" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="12" :lg="12">
          <el-form-item label="采购事项">
            <el-input v-model="basicForm.purchaseItem" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="采购方式">
            <el-select
              v-model="basicForm.purchaseMethod"
              placeholder="请选择采购方式"
              style="width: 100%"
            >
              <el-option label="战略协议" value="战略协议" />
              <el-option label="战略执行" value="战略执行" />
              <el-option label="单项采购" value="单项采购" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="招标方式">
            <el-select
              v-model="basicForm.bidMethod"
              placeholder="请选择招标方式"
              style="width: 100%"
            >
              <el-option label="邀请" value="邀请" />
              <el-option label="定向" value="定向" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="计划金额">
            <el-input v-model="basicForm.planAmount" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="清单模式">
            <el-select
              v-model="basicForm.listMode"
              placeholder="请选择清单模式"
              style="width: 100%"
            >
              <el-option label="正式" value="正式" />
              <el-option label="模拟" value="模拟" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="需求时间">
            <el-date-picker
              v-model="basicForm.demandTime"
              type="datetime"
              placeholder="请选择时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="招采开始日期">
            <el-date-picker
              v-model="basicForm.bidStartDate"
              type="datetime"
              placeholder="请选择时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="招采结束日期">
            <el-date-picker
              v-model="basicForm.bidEndDate"
              type="datetime"
              placeholder="请选择时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="招采责任人">
            <el-input v-model="basicForm.bidUser" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="楼栋范围">
            <el-input v-model="basicForm.buildingRange" placeholder="请输入" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="事项说明">
            <el-input
              v-model="basicForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入事项说明"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from "vue";

const basicForm = ref({
  businessPlate: "",
  project: "",
  company: "",
  contractType: "",
  purchaseItem: "",
  purchaseMethod: "",
  bidMethod: "",
  planAmount: "",
  listMode: "",
  demandTime: "",
  bidStartDate: "",
  bidEndDate: "",
  bidUser: "",
  buildingRange: "",
  remark: "",
});
</script>

<style scoped lang="scss">
.basic-info-section {
  .basic-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
  }
}
</style>
