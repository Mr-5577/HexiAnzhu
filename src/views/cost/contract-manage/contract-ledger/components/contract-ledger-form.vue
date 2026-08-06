<!-- 合同台账基本信息 -->
<template>
  <div class="contract-basic-form">
    <div class="contract-header">
      <div class="contract-title">合同审批</div>
      <div class="contract-btn">
        <el-button
          type="primary"
          icon="DocumentAdd"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          保存
        </el-button>
        <el-button type="success" plain icon="Promotion"> 提交 </el-button>
        <el-button type="danger" plain icon="Delete"> 删除 </el-button>
        <el-button type="warning" plain icon="Remove"> 作废 </el-button>
        <el-button type="info" plain icon="View"> 查看流程 </el-button>
      </div>
    </div>
    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="130px"
        class="adapt-form"
      >
        <div class="item-card">
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="18" :xl="18">
              <el-form-item label="标题" prop="conName">
                <el-input
                  v-model="formData.conName"
                  clearable
                  placeholder="标题"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="审批状态" prop="conName">
                <el-input
                  v-model="formData.conName"
                  clearable
                  placeholder="审批状态"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="业务板块" prop="segId" required>
                <el-select
                  v-model="formData.segId"
                  placeholder="请选择业务板块"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in segOptions"
                    :key="item.id"
                    :label="item.segName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="板块编码" prop="">
                <el-input
                  v-model="formData.conName"
                  clearable
                  placeholder="板块编码"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="部门" prop="">
                <el-input
                  v-model="formData.conName"
                  clearable
                  placeholder="部门"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="分部" prop="">
                <el-input
                  v-model="formData.conName"
                  clearable
                  placeholder="分部"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="所属项目" prop="projId" required>
                <el-cascader
                  v-model="formData.projId"
                  :options="projectOptions"
                  :show-all-levels="false"
                  :props="{
                    expandTrigger: 'hover',
                    emitPath: false,
                    checkStrictly: false,
                    value: 'orgId',
                    label: 'orgName',
                    children: 'children',
                  }"
                  placeholder="请选择项目"
                  style="width: 100%"
                  clearable
                  @change="changeProject"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="项目所属公司" prop="">
                <el-input
                  v-model="formData.conName"
                  clearable
                  placeholder="项目所属公司"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="提交人" prop="">
                <el-input
                  v-model="formData.conName"
                  clearable
                  placeholder="提交人"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="提交时间" prop="">
                <el-input
                  v-model="formData.conName"
                  clearable
                  placeholder="提交时间"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="item-card">
          <div class="section-title">基本信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同类型" prop="conProperty" required>
                <el-select
                  v-model="formData.conProperty"
                  placeholder="请选择合同类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in ConPropertyEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同分类" prop="conTypeId" required>
                <el-cascader
                  v-model="formData.conTypeId"
                  :options="conTypeOptions"
                  :show-all-levels="false"
                  :props="{
                    expandTrigger: 'hover',
                    emitPath: false,
                    checkStrictly: false,
                    value: 'id',
                    label: 'conTypeName',
                    children: 'children',
                  }"
                  placeholder="请选择合同分类"
                  style="width: 100%"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="生产专业" prop="proProf" required>
                <el-cascader
                  v-model="formData.proProf"
                  :options="proProfOptions"
                  :show-all-levels="false"
                  :props="{
                    expandTrigger: 'hover',
                    emitPath: false,
                    checkStrictly: false,
                    value: 'id',
                    label: 'dicLabel',
                    children: 'children',
                  }"
                  placeholder="请选择生产专业"
                  style="width: 100%"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="招标事项" prop="">
                <el-input v-model="formData.conName" placeholder="招标事项" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="计划金额" prop="">
                <el-input-number
                  v-model="formData.signExclAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="计划金额"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="核算项目" prop="acctProjId">
                <el-cascader
                  v-model="formData.acctProjId"
                  :options="acctProjOptions"
                  :show-all-levels="false"
                  :props="{
                    expandTrigger: 'hover',
                    emitPath: false,
                    checkStrictly: false,
                    value: 'id',
                    label: 'dicLabel',
                    children: 'children',
                  }"
                  placeholder="请选择核算项目"
                  style="width: 100%"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="item-card">
          <div class="section-title">合同信息</div>
          <el-row
            :gutter="24"
            v-show="formData.conProperty == 2 || formData.conProperty == 3"
          >
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="主合同" prop="">
                <el-input
                  v-model="formData.conName"
                  clearable
                  placeholder="主合同"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="主合同有效期" prop="">
                <el-date-picker
                  v-model="formData.effectiveDate"
                  type="date"
                  placeholder="主合同有效期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同名称" prop="conName" required>
                <el-input
                  v-model="formData.conName"
                  clearable
                  placeholder="请输入合同名称"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="楼栋范围" prop="bldIds" required>
                <el-select
                  v-model="formData.bldIds"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="请选择楼栋"
                  style="width: 100%"
                  @change="handleBuildingChange"
                >
                  <el-option
                    v-for="item in buildingOptions"
                    :key="item.id"
                    :label="item.bldName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="系统编号" prop="conSysNo">
                <el-input
                  v-model="formData.conSysNo"
                  placeholder="请输入合同系统编号"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="档案编号" prop="conPhyNo">
                <el-input
                  v-model="formData.conPhyNo"
                  placeholder="请输入合同档案编号"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="计价方式" prop="priceType" required>
                <el-select
                  v-model="formData.priceType"
                  placeholder="请选择计价方式"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in PriceTypeEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="投标保证金额" prop="" required>
                <el-input-number
                  v-model="formData.signAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="投标保证金金额"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="履约保证金额" prop="" required>
                <el-input-number
                  v-model="formData.signExclAmt"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="应交履约保证金额"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="管理类型" prop="manageType" required>
                <el-select
                  v-model="formData.manageType"
                  placeholder="请选择管理类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in ManageTypeEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="生效日期" prop="effectiveDate" required>
                <el-date-picker
                  v-model="formData.effectiveDate"
                  type="date"
                  placeholder="请选择生效日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="到期日期" prop="expiryDate" required>
                <el-date-picker
                  v-model="formData.expiryDate"
                  type="date"
                  placeholder="请选择到期日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="工期(天)" prop="daysNum" required>
                <el-input-number
                  v-model="formData.daysNum"
                  :min="0"
                  :controls="false"
                  placeholder="请输入工期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="甲方经办人" prop="" required>
                <el-input
                  v-model="formData.daysNum"
                  placeholder="甲方经办人"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="甲方签约公司" prop="companyId" required>
                <el-cascader
                  v-model="formData.companyId"
                  :options="companyOptions"
                  :show-all-levels="false"
                  :props="{
                    expandTrigger: 'hover',
                    emitPath: false,
                    checkStrictly: false,
                    value: 'id',
                    label: 'mguName',
                    children: 'children',
                  }"
                  placeholder="请选择签约公司"
                  style="width: 100%"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="签订日期" prop="signDate" required>
                <el-date-picker
                  v-model="formData.signDate"
                  type="date"
                  placeholder="请选择签订日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="签约地点" prop="signAddr">
                <el-input
                  v-model="formData.signAddr"
                  clearable
                  placeholder="签约地点"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="付款方式" prop="payMethod" required>
                <el-select
                  v-model="formData.payMethod"
                  placeholder="请选择付款方式"
                  style="width: 100%"
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
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="是否用印" prop="needSeal" required>
                <el-select
                  v-model="formData.needSeal"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="是" :value="true" />
                  <el-option label="否" :value="false" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="印章类型" prop="sealTypes">
                <el-select
                  v-model="formData.sealTypes"
                  multiple
                  collapse-tags
                  placeholder="请选择印章类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in SealTypesEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="是否办理结算" prop="">
                <el-select
                  v-model="formData.needSeal"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="是" :value="true" />
                  <el-option label="否" :value="false" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="formData.remark"
                  type="textarea"
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  placeholder="其他需要补充说明的信息"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <!-- 价款及税率 -->
        <div class="item-card">
          <div class="section-title">价款及税率</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同总价(含税)" prop="totalPriceTax">
                <el-input
                  v-model="priceTaxData.totalPriceTax"
                  disabled
                  placeholder="自动计算"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="合同总价(不含税)" prop="totalPrice">
                <el-input
                  v-model="priceTaxData.totalPrice"
                  disabled
                  placeholder="自动计算"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="税额" prop="taxAmount">
                <el-input
                  v-model="priceTaxData.taxAmount"
                  disabled
                  placeholder="自动计算"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="税率" prop="taxRate">
                <el-input
                  v-model="priceTaxData.taxRate"
                  disabled
                  placeholder="自动计算"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 价税明细表格区域 -->
          <div class="detail-table">
            <div class="header-content">
              <span class="header-title">价税明细</span>
              <el-button type="primary" size="small" @click="addPrice">
                新增价税明细
              </el-button>
            </div>
            <editable-table
              ref="pricesRef"
              :row-key="'uuid'"
              :height="'160px'"
              v-model="priceTable"
              :columns="priceColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :editable="true"
            >
              <template #actions="{ row }">
                <el-button link type="danger" @click="deletePrice(row)">
                  删除
                </el-button>
              </template>
            </editable-table>
          </div>
        </div>
        <div class="item-card">
          <div class="section-title">供方信息</div>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="18" :xl="18">
              <el-form-item label="供应商名称" prop="">
                <el-input
                  v-model="formData.conName"
                  clearable
                  placeholder="供应商名称"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="供应商联系人" prop="supCmanName" required>
                <el-input
                  v-model="formData.supCmanName"
                  placeholder="请输入联系人姓名"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="开户银行" prop="bankName">
                <el-input
                  v-model="formData.bankName"
                  placeholder="请输入开户银行"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="银行户名" prop="accountName">
                <el-input
                  v-model="formData.accountName"
                  placeholder="请输入银行户名"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="银行账号" prop="bankAccount">
                <el-input
                  v-model="formData.bankAccount"
                  placeholder="请输入银行账号"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="联系人身份证" prop="supCmanIdno" required>
                <el-input
                  v-model="formData.supCmanIdno"
                  placeholder="请输入身份证号码"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="联系人电话" prop="supCmanTel" required>
                <el-input
                  v-model="formData.supCmanTel"
                  placeholder="请输入联系电话"
                />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-form-item label="联系人职务" prop="supCmanJob">
                <el-input
                  v-model="formData.supCmanJob"
                  placeholder="请输入职务"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <!-- 合同支付比例明细 -->
        <div class="item-card">
          <div class="section-title">支付比例</div>
          <div class="detail-table">
            <div class="header-content">
              <span class="header-title">支付比例明细</span>
              <el-button type="primary" size="small" @click="addPayrate">
                新增支付明细
              </el-button>
            </div>
            <editable-table
              ref="payrateRef"
              :row-key="'uuid'"
              :height="'160px'"
              v-model="payrateTable"
              :columns="payrateColumns"
              :pagination="false"
              :highlight-current-row="false"
              :show-summary="false"
              :compactEmpty="true"
              :editable="true"
            >
              <template #actions="{ row }">
                <el-button link type="danger" @click="deletePayrate(row)">
                  删除
                </el-button>
              </template>
            </editable-table>
          </div>
        </div>

        <!-- 合同附件 -->
        <div class="item-card">
          <div class="section-title">合同附件</div>
          <el-form-item label="上传合同附件" prop="attachment">
            <base-upload :multiple="true"></base-upload>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { conTypeApi } from "@/api/cost/master-data/contract-category-api";
import { supplierApi } from "@/api/cost/supplier/supplier-ledger-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { contractLedgerApi } from "@/api/cost/contract-manage/contract-ledger-api";
import { commonApi } from "@/api/cost/common-api";
import { manageunitApi } from "@/api/cost/master-data/management-unit-api";
import { buildTree } from "@/utils/tree";
import { useDict } from "@/composables/use-dict";
import { dictMapping } from "@/utils/dict-mapping";
import {
  ConPropertyEnum,
  PriceTypeEnum,
  ManageTypeEnum,
  PayTypeEnum,
  SealTypesEnum,
} from "@/constants/contract-manage/enums";
import { bankCardRegex, idCardRegex, phoneRegex } from "@/utils/regex";
import EditableTable from "@/components/base/editable-table.vue";
import type { EditableColumn } from "@/components/base/editable-table.vue";
import { v4 as uuidv4 } from "uuid";
import BaseUpload from "@/components/base/base-upload.vue";

defineOptions({ name: "contract-ledger-form" });

interface Props {
  mode?: "add" | "edit" | "detail";
  conId?: number; // 合同ID
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  conId: undefined,
});

const emit = defineEmits<{
  (e: "success", data: any): void;
  (e: "cancel"): void;
}>();

// 路由与状态
const router = useRouter();
const userStore = useUserStore();

const mode = ref<"add" | "edit" | "detail">(props.mode);
const conId = ref<number | undefined>(props.conId);

const isDetailMode = computed(() => mode.value === "detail");
const isEditMode = computed(() => mode.value === "edit");
const isAddMode = computed(() => mode.value === "add");

// 创建响应式的价款数据，使用 computed 追踪 priceTable 变化
const priceTaxData = computed(() => calculatePriceTaxData());

// 表单数据定义
const initFormData = () => ({
  // 主表字段
  id: null,
  segId: null,
  projId: null,
  acctProjId: null,
  tenderItemId: null,
  companyId: null,
  conName: "",
  conSysNo: "",
  conPhyNo: "",
  conTypeId: null,
  conProperty: null,
  mainConId: null,
  supId: null,
  priceType: null,
  conStatus: 0,
  signAmt: null,
  signExclAmt: null,
  taxAmt: null,
  signDate: "",
  effectiveDate: "",
  expiryDate: "",
  daysNum: null,
  needSettle: true,
  settleAmt: null,
  flowId: null,
  agentId: null,
  proProf: null,
  bldIds: [],
  bldNames: "",
  pbAmount: null,
  manageType: null,
  payMethod: null,
  // 扩展字段
  needSeal: false,
  sealTypes: [],
  signAddr: "",
  supCmanName: "",
  supCmanIdno: "",
  supCmanTel: "",
  supCmanJob: "",
  bankName: "",
  accountName: "",
  bankAccount: "",
  remark: "",
});

const formData = ref(initFormData());
const formRef = ref(null);
const submitLoading = ref(false);

// 下拉选项数据
const companyOptions = ref([]);
const buildingOptions = ref([]);
const segOptions = ref([]);
const conTypeOptions = ref([]);
const projectOptions = ref([]);
const supplierOptions = ref([]);
const proProfOptions = ref([]);
const acctProjOptions = ref([
  { id: 1, dicLabel: "项目1" },
  { id: 2, dicLabel: "项目2" },
]);
const paymentTypeOptions = ref([]);

const priceTable = ref([]); // 合同价格明细
const priceColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "itemName",
    label: "分项名称",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    prop: "itemAmt",
    label: "分项含税总额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "itemTaxRate",
    label: "税率",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "itemExclAmt",
    label: "分项不含税额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "itemTaxAmt",
    label: "分项税额",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
  },
  {
    prop: "remark",
    label: "备注",
    editable: true,
    editType: "input",
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);
// 计算价款及税率汇总数据
const calculatePriceTaxData = () => {
  // 累加各项金额
  const totalPriceTax = priceTable.value.reduce((sum, item) => {
    const amt = Number(item.itemAmt) || 0;
    return sum + amt;
  }, 0);

  const totalPrice = priceTable.value.reduce((sum, item) => {
    const exclAmt = Number(item.itemExclAmt) || 0;
    return sum + exclAmt;
  }, 0);

  const taxAmount = priceTable.value.reduce((sum, item) => {
    const tax = Number(item.itemTaxAmt) || 0;
    return sum + tax;
  }, 0);

  // 计算税率（不含税总额 > 0 时计算税率，否则为 0）
  let taxRate = 0;
  if (totalPrice > 0) {
    // 税率 = 税额 / 不含税总额 * 100
    taxRate = (taxAmount / totalPrice) * 100;
    // 保留两位小数
    taxRate = Math.round(taxRate * 100) / 100;
  }

  return {
    totalPriceTax,
    totalPrice,
    taxAmount,
    taxRate,
  };
};
const payrateTable = ref([]); // 支付明细
const payrateColumns = computed<EditableColumn[]>(() => [
  { type: "index", label: "序号", width: 60, editable: false },
  {
    prop: "payTypeId",
    label: "款项类型",
    editable: true,
    editType: "select",
    showOverflowTooltip: false,
    // 自定义键名
    optionLabelField: "dicLabel",
    optionValueField: "id",
    options: paymentTypeOptions.value || [],
  },
  {
    prop: "payRate",
    label: "应付比例(%)",
    showSummary: true,
    editable: true,
    editType: "number",
    showOverflowTooltip: false,
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
  },
  {
    prop: "payIntvl",
    label: "支付周期(月)",
    showSummary: true,
    editable: true,
    editType: "number",
    precision: 0,
    showOverflowTooltip: false,
  },
  {
    label: "操作",
    width: 100,
    slot: "actions",
    fixed: "right",
  },
]);

// 数据字典
const { getDictList, loadDicts } = useDict(
  [dictMapping.proProf, dictMapping.paymentType],
  { treeDictCodes: [] },
);

// 表单校验规则
const formRules = ref({
  conName: [{ required: true, message: "请输入合同名称", trigger: "blur" }],
  conTypeId: [{ required: true, message: "请选择合同分类", trigger: "change" }],
  conProperty: [
    { required: true, message: "请选择合同类型", trigger: "change" },
  ],
  companyId: [{ required: true, message: "请选择签约公司", trigger: "change" }],
  conSysNo: [
    { required: true, message: "请输入合同系统编号", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "合同系统编号只能包含英文大小写、数字和下划线",
      trigger: "blur",
    },
  ],
  conPhyNo: [
    { required: true, message: "请输入合同物理编号", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "合同物理编号只能包含英文大小写、数字和下划线",
      trigger: "blur",
    },
  ],
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  acctProjId: [
    { required: true, message: "请选择核算项目", trigger: "change" },
  ],
  supId: [{ required: true, message: "请选择供应商", trigger: "change" }],
  priceType: [{ required: true, message: "请选择计价方式", trigger: "change" }],
  manageType: [
    { required: true, message: "请选择管理类型", trigger: "change" },
  ],
  payMethod: [{ required: true, message: "请选择付款方式", trigger: "change" }],
  signAmt: [
    { required: true, message: "请输入签约金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
  ],
  signExclAmt: [
    { required: true, message: "请输入不含税金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
  ],
  taxAmt: [
    { required: true, message: "请输入税额", trigger: "blur" },
    { type: "number", min: 0, message: "税额不能小于0", trigger: "blur" },
  ],
  signDate: [{ required: true, message: "请选择签订日期", trigger: "change" }],
  effectiveDate: [
    { required: true, message: "请选择生效日期", trigger: "change" },
  ],
  expiryDate: [
    { required: true, message: "请选择到期日期", trigger: "change" },
  ],
  daysNum: [{ required: true, message: "请输入工期天数", trigger: "blur" }],
  pbAmount: [
    { required: true, message: "请输入履约保证金", trigger: "blur" },
    { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
  ],
  proProf: [{ required: true, message: "请选择生产专业", trigger: "change" }],
  bldIds: [{ required: true, message: "请选择楼栋", trigger: "change" }],
  settleAmt: [
    { required: true, message: "请输入结算金额", trigger: "blur" },
    { type: "number", min: 0, message: "结算金额不能小于0", trigger: "blur" },
  ],
  needSeal: [{ required: true, message: "请选择是否用印", trigger: "change" }],
  sealTypes: [{ required: true, message: "请选择印章类型", trigger: "change" }],
  signAddr: [{ required: true, message: "请输入签约地点", trigger: "blur" }],
  supCmanName: [
    { required: true, message: "请输入联系人姓名", trigger: "blur" },
  ],
  supCmanTel: [
    { required: true, message: "请输入联系人电话", trigger: "blur" },
    {
      pattern: phoneRegex,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
  supCmanIdno: [
    { required: true, message: "请输入联系人身份证", trigger: "blur" },
    {
      pattern: idCardRegex,
      message: "请输入正确的身份证号码",
      trigger: "blur",
    },
  ],
  supCmanJob: [
    { required: false, message: "请输入联系人职务", trigger: "blur" },
  ],
  bankName: [{ required: false, message: "请输入开户银行", trigger: "blur" }],
  accountName: [
    { required: false, message: "请输入银行户名", trigger: "blur" },
  ],
  bankAccount: [
    { required: false, message: "请输入银行账号", trigger: "blur" },
    {
      pattern: bankCardRegex,
      message: "请输入正确的银行卡号",
      trigger: "blur",
    },
  ],
});

// 获取签约公司列表
const getCompanyList = async () => {
  try {
    const res = await manageunitApi.getAuthMguList();
    if (res.code === 200) {
      companyOptions.value = buildTree(res.data || []);
    }
  } catch (error) {
    console.error("获取签约公司列表失败:", error);
  }
};

// 获取业务板块列表
const getSegOptions = async () => {
  try {
    const res = await dictionaryApi.getsegmentList();
    if (res.code === 200) {
      segOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取业务板块列表失败:", error);
  }
};

// 获取项目列表
const getProjectOptions = async () => {
  try {
    const res = await projectAreaApi.getMguProjList();
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }
};

// 获取供应商列表
const getSupplierList = async () => {
  try {
    const res = await supplierApi.getSupplierList({ supName: "" });
    if (res.code === 200) {
      supplierOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("加载供应商列表失败:", error);
  }
};

// 获取合同分类
const getConTypeList = async () => {
  try {
    const res = await conTypeApi.getConTypeList();
    if (res.code === 200) {
      conTypeOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取合同分类失败:", error);
  }
};

// 获取楼栋列表
const getBuildingListByProjId = async (projId: number) => {
  if (!projId) return;
  try {
    buildingOptions.value = [];
    const buildingRes = await projectAreaApi.getBuildingList({ projId });
    if (buildingRes.code === 200) {
      buildingOptions.value = buildingRes.data || [];
      // 编辑时回显楼栋名称
      if (formData.value.bldIds && formData.value.bldIds.length > 0) {
        const names = buildingOptions.value
          .filter((v: any) => formData.value.bldIds.includes(v.id))
          .map((v: any) => v.bldName);
        formData.value.bldNames = names.join(",");
      }
    }
  } catch (error) {
    console.error("获取楼栋列表失败:", error);
  }
};

// 初始化数据字典
const initDictData = async () => {
  await loadDicts();
  proProfOptions.value = getDictList(dictMapping.proProf); // 生产专业
  paymentTypeOptions.value = getDictList(dictMapping.paymentType); // 款项类型
};

// 生成合同编号
const createConNo = async () => {
  try {
    const conRes = await commonApi.getBillNo({ bizType: "HTBH" });
    if (conRes.code === 200) {
      formData.value.conSysNo = conRes.data;
      formData.value.conPhyNo = conRes.data;
    }
  } catch (error) {
    console.error("生成合同编号失败:", error);
  }
};

// 初始化所有下拉选项
const initOptions = async () => {
  await Promise.all([
    getCompanyList(),
    getSegOptions(),
    getProjectOptions(),
    getSupplierList(),
    getConTypeList(),
    initDictData(),
  ]);
};

// 构建提交参数（表单数据 -> 接口参数）
const buildSubmitParams = () => {
  return {
    conMain: {
      id: formData.value.id,
      segId: formData.value.segId,
      projId: formData.value.projId,
      acctProjId: formData.value.acctProjId,
      tenderItemId: formData.value.tenderItemId,
      companyId: formData.value.companyId,
      conName: formData.value.conName,
      conSysNo: formData.value.conSysNo,
      conPhyNo: formData.value.conPhyNo,
      conTypeId: formData.value.conTypeId,
      conProperty: formData.value.conProperty,
      mainConId: formData.value.mainConId,
      supId: formData.value.supId,
      priceType: formData.value.priceType,
      conStatus: formData.value.conStatus || 0,
      signAmt: formData.value.signAmt,
      signExclAmt: formData.value.signExclAmt,
      taxAmt: formData.value.taxAmt,
      signDate: formData.value.signDate,
      effectiveDate: formData.value.effectiveDate,
      expiryDate: formData.value.expiryDate,
      daysNum: formData.value.daysNum,
      needSettle: formData.value.needSettle,
      settleAmt: formData.value.settleAmt,
      flowId: formData.value.flowId,
      agentId: formData.value.agentId,
      proProf: formData.value.proProf,
      bldIds: formData.value.bldIds.join(","),
      bldNames: formData.value.bldNames,
      pbAmount: formData.value.pbAmount,
      manageType: formData.value.manageType,
      payMethod: formData.value.payMethod,
    },
    conMainExt: {
      id: formData.value.id,
      conId: formData.value.id,
      needSeal: formData.value.needSeal,
      sealTypes: formData.value.sealTypes.join(","),
      signAddr: formData.value.signAddr,
      supCmanName: formData.value.supCmanName,
      supCmanIdno: formData.value.supCmanIdno,
      supCmanTel: formData.value.supCmanTel,
      supCmanJob: formData.value.supCmanJob,
      bankName: formData.value.bankName,
      accountName: formData.value.accountName,
      bankAccount: formData.value.bankAccount,
      remark: formData.value.remark,
    },
    billPrices: priceTable.value,
    billPayrates: formData.value.payMethod == 1 ? payrateTable.value : [],
    annexes: [],
  };
};

// 解析回显数据（接口数据 -> 表单数据）
const parseContractData = (conMain: any, conMainExt: any) => {
  return {
    // 主表字段
    id: conMain.id,
    segId: conMain.segId,
    projId: conMain.projId,
    acctProjId: conMain.acctProjId,
    tenderItemId: conMain.tenderItemId,
    companyId: conMain.companyId,
    conName: conMain.conName,
    conSysNo: conMain.conSysNo,
    conPhyNo: conMain.conPhyNo,
    conTypeId: conMain.conTypeId,
    conProperty: conMain.conProperty,
    mainConId: conMain.mainConId,
    supId: conMain.supId,
    priceType: conMain.priceType,
    conStatus: conMain.conStatus,
    signAmt: conMain.signAmt,
    signExclAmt: conMain.signExclAmt,
    taxAmt: conMain.taxAmt,
    signDate: conMain.signDate,
    effectiveDate: conMain.effectiveDate,
    expiryDate: conMain.expiryDate,
    daysNum: conMain.daysNum,
    needSettle: conMain.needSettle,
    settleAmt: conMain.settleAmt,
    flowId: conMain.flowId,
    agentId: conMain.agentId,
    proProf: conMain.proProf,
    bldIds: conMain.bldIds ? conMain.bldIds.split(",").map(Number) : [],
    bldNames: conMain.bldNames || "",
    pbAmount: conMain.pbAmount,
    manageType: conMain.manageType,
    payMethod: conMain.payMethod,
    // 扩展字段
    needSeal: conMainExt?.needSeal ?? false,
    sealTypes: conMainExt?.sealTypes ? conMainExt.sealTypes.split(",") : [],
    signAddr: conMainExt?.signAddr || "",
    supCmanName: conMainExt?.supCmanName || "",
    supCmanIdno: conMainExt?.supCmanIdno || "",
    supCmanTel: conMainExt?.supCmanTel || "",
    supCmanJob: conMainExt?.supCmanJob || "",
    bankName: conMainExt?.bankName || "",
    accountName: conMainExt?.accountName || "",
    bankAccount: conMainExt?.bankAccount || "",
    remark: conMainExt?.remark || "",
  };
};

// 选择项目（联动加载楼栋）
const changeProject = (id: number) => {
  formData.value.bldIds = [];
  formData.value.bldNames = "";
  if (id) {
    getBuildingListByProjId(id);
  }
};

// 楼栋选择变化（更新楼栋名称）
const handleBuildingChange = (ids: number[]) => {
  const names = buildingOptions.value
    .filter((v: any) => ids.includes(v.id))
    .map((v: any) => v.bldName);
  formData.value.bldNames = names.join(",");
};

// 加载合同详情（编辑/详情模式）
const loadContractDetail = async () => {
  if (!conId.value) return;
  try {
    const res = await contractLedgerApi.getContractLedgerById({
      id: conId.value,
    });
    if (res.code === 200 && res.data) {
      const {
        conMain,
        conMainExt,
        billPayrates = [],
        billPrices = [],
      } = res.data;
      formData.value = parseContractData(conMain, conMainExt);
      payrateTable.value = billPayrates.map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));
      priceTable.value = billPrices.map((item: any) => ({
        ...item,
        uuid: uuidv4(),
      }));
      // 加载楼栋列表
      if (conMain.projId) {
        await getBuildingListByProjId(conMain.projId);
      }
    }
  } catch (error) {
    console.error("获取合同信息失败:", error);
  }
};

const addPrice = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: null,
    conBillId: conId.value,
    itemName: "", // 分项名称
    itemAmt: 0, // 分项含税总额
    itemTaxRate: 0, // 税率
    itemExclAmt: 0, // 分项不含税总额
    itemTaxAmt: 0, // 分项税额
    remark: "", // 备注
  };
  priceTable.value = [...priceTable.value, newRowData];
};
const deletePrice = (row) => {
  priceTable.value = priceTable.value.filter((item) => item.uuid !== row.uuid);
};
const addPayrate = () => {
  const newRowData = {
    uuid: uuidv4(),
    id: null,
    conBillId: conId.value,
    payRateId: null, // 支付比例表ID
    payTypeId: null, // 款项类型ID
    payRate: 0, // 应付比例
    isCtrl: false, // 是否强控
    payIntvl: 0, // 付周期（月）
    prodVal: 0, // 本次申请产值金额
    payAmt: 0, // 本次申报应付金额
    buildPeriod: "", // 施工期间
    prodValPeriod: "", // 产值期间
    payDate: "", // 计划付款日期
    costProdVal: 0, // 成本复核产值金额
    costPayAmt: 0, // 成本复核应付金额
  };
  payrateTable.value = [...payrateTable.value, newRowData];
};
const deletePayrate = (row) => {
  payrateTable.value = payrateTable.value.filter(
    (item) => item.uuid !== row.uuid,
  );
};

// 校验价税明细表
const validatePriceTable = () => {
  if (priceTable.value.length === 0) {
    ElMessage.error("价税明细列表不能为空");
    return false;
  }
  for (let i = 0; i < priceTable.value.length; i++) {
    const item = priceTable.value[i];
    if (!item.itemName || item.itemName.trim() === "") {
      ElMessage.error(`价税明细列表第${i + 1}行：分项名称不能为空`);
      return false;
    }
    if (!item.itemAmt || item.itemAmt <= 0) {
      ElMessage.error(`价税明细列表第${i + 1}行：分项含税总额必须大于0`);
      return false;
    }
    if (!item.itemTaxRate || item.itemTaxRate < 0) {
      ElMessage.error(`价税明细列表第${i + 1}行：税率不能为空且不能小于0`);
      return false;
    }
    if (!item.itemExclAmt || item.itemExclAmt <= 0) {
      ElMessage.error(`价税明细列表第${i + 1}行：分项不含税总额必须大于0`);
      return false;
    }
    if (!item.itemTaxAmt || item.itemTaxAmt < 0) {
      ElMessage.error(`价税明细列表第${i + 1}行：分项总额必须大于等于0`);
      return false;
    }
  }
  return true;
};
// 校验支付比例明细表
const validatePayrateTable = () => {
  if (payrateTable.value.length === 0) {
    ElMessage.error("支付比例明细列表不能为空");
    return false;
  }
  for (let i = 0; i < payrateTable.value.length; i++) {
    const item = payrateTable.value[i];
    if (!item.payTypeId) {
      ElMessage.error(`支付比例明细列表第${i + 1}行：请选择款项类型`);
      return false;
    }
    if (!item.payRate || item.payRate <= 0) {
      ElMessage.error(`支付比例明细列表第${i + 1}行：应付比例必须大于0`);
      return false;
    }
    if (!item.prodVal || item.prodVal <= 0) {
      ElMessage.error(
        `支付比例明细列表第${i + 1}行：本次申请产值金额必须大于0`,
      );
      return false;
    }
    if (!item.payAmt || item.payAmt <= 0) {
      ElMessage.error(
        `支付比例明细列表第${i + 1}行：本次申报应付金额必须大于0`,
      );
      return false;
    }
    if (!item.costProdVal || item.costProdVal <= 0) {
      ElMessage.error(
        `支付比例明细列表第${i + 1}行：成本复核产值金额必须大于0`,
      );
      return false;
    }
    if (!item.costPayAmt || item.costPayAmt <= 0) {
      ElMessage.error(
        `支付比例明细列表第${i + 1}行：成本复核应付金额必须大于0`,
      );
      return false;
    }
  }
  return true;
};

// 提交表单
const handleSubmit = async () => {
  if (isDetailMode.value) return;
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    // 校验各个明细表
    // if (!validatePriceTable()) return;
    // if (!validatePayrateTable()) return;

    submitLoading.value = true;
    const params = buildSubmitParams();
    let res;
    if (formData.value.id) {
      res = await contractLedgerApi.editContractLedger(params);
    } else {
      res = await contractLedgerApi.addContractLedger(params);
    }
    if (res.code === 200) {
      ElMessage.success(formData.value.id ? "编辑成功" : "新增成功");
      emit("success", res.data);
    }
  } catch (error) {
    console.log(error);
  } finally {
    submitLoading.value = false;
  }
};

// 初始化
const initData = async () => {
  await initOptions();

  if (isAddMode.value) {
    formData.value.agentId = userStore.userInfo.id;
    await createConNo();
  } else if (isEditMode.value || isDetailMode.value) {
    if (conId.value) {
      await loadContractDetail();
    }
  }
};

onMounted(() => {
  initData();
});

// 暴露方法
defineExpose({
  formData,
  resetForm: () => {
    formData.value = initFormData();
    priceTable.value = [];
    payrateTable.value = [];
    if (formRef.value) {
      formRef.value.resetFields();
    }
  },
  initData,
});
</script>

<style scoped lang="scss">
.contract-basic-form {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
  padding: 0;
}

.contract-header {
  width: 100%;
  background: #ffffff;
  padding: 16px 24px 12px 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
  border-bottom: 1px solid #e4e7ed;

  .contract-title {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 0;
    box-sizing: border-box;
    font-size: 20px;
    font-weight: 700;
    color: #1d2129;
    letter-spacing: 0.5px;
  }

  .contract-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
    padding: 4px 0;

    .el-button {
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }

      &:active {
        transform: translateY(0px);
      }
    }
  }
}

.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 15px 15px 30px;
  box-sizing: border-box;
}

.adapt-form {
  width: 100%;
  margin: 0 auto;

  .item-card {
    background: #ffffff;
    border-radius: 8px;
    padding: 15px 15px;
    margin-bottom: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    transition:
      box-shadow 0.3s ease,
      transform 0.2s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  padding: 0 0 12px 14px;
  position: relative;

  &::before {
    content: "";
    width: 4px;
    height: 18px;
    background: linear-gradient(180deg, #409eff, #66b1ff);
    border-radius: 2px;
    position: absolute;
    left: 0;
    top: 4px;
  }

  // 在标题后添加装饰文字
  &::after {
    content: "";
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #e4e7ed);
  }
}

.detail-table {
  margin-top: 4px;

  .header-content {
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;

    .header-title {
      font-size: 14px;
      color: #4e5969;
      font-weight: 500;

      &::before {
        content: "📊";
        margin-right: 6px;
      }
    }
  }
}
</style>
