<!-- 合同台账基本信息 -->
<template>
  <div class="contract-basic-form">
    <!-- ============ 顶部操作栏 (sticky 左右结构) ============ -->
    <BillHeader
      :title="'合同审批'"
      :contract-no="billData.bizNo || ''"
      :submitter="formData.userName || ''"
      :submit-time="formData.createDate || ''"
      :status="billData.status"
      :show-status="true"
      :button-loading="submitLoading"
      :save-disabled="isDetailMode || !!billData.status"
      :submit-disabled="isDetailMode || !!billData.status"
      :delete-disabled="isDetailMode || isAddMode || !!billData.status"
      :void-disabled="isDetailMode || isAddMode || !!billData.status"
      :view-disabled="isAddMode"
      @save="handleSave"
      @submit="handleSubmit"
      @delete="handleDelete"
      @void="handleCancel"
      @viewFlow="handleViewProcess"
    >
    </BillHeader>

    <!-- ============ 表单滚动区 ============ -->
    <div class="form-scroll-area">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="left"
        label-width="120px"
        class="adapt-form"
      >
        <!-- ====== 卡片1：单据信息 ====== -->
        <section class="item-card" id="card-base" :class="{ collapsed: collapsedCards.base }">
          <div class="card-header" @click="toggleCard('base')">
            <div class="card-title"><span class="icon">📋</span>单据信息</div>
            <span class="card-toggle">▼</span>
          </div>
          <div class="card-body">
            <el-row :gutter="24">
              <el-col :xs="24" :sm="12" :md="12" :lg="18" :xl="18">
                <el-form-item label="标题" prop="bizTitle">
                  <el-input
                    v-model="formData.bizTitle"
                    clearable
                    placeholder="请输入标题"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
                <el-form-item label="审批状态" prop="approvalStatus">
                  <el-tag
                    :type="getEnumType(conBillStatusEnum, billData?.status || 0)"
                  >
                    {{ getEnumLabel(conBillStatusEnum, billData?.status || 0) }}
                  </el-tag>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
                <el-form-item label="业务板块" prop="segId" required>
                  <el-input
                    v-model="formData.segName"
                    disabled
                    placeholder="业务板块"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
                <el-form-item label="板块编码" prop="segNo">
                  <el-input
                    v-model="formData.segNo"
                    disabled
                    placeholder="板块编码"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
                <el-form-item label="部门" prop="deptName">
                  <el-input
                    v-model="formData.deptName"
                    disabled
                    placeholder="部门"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
                <el-form-item label="分部" prop="mguName">
                  <el-input
                    v-model="formData.mguName"
                    disabled
                    placeholder="分部"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
                <el-form-item label="所属项目" prop="projId" required>
                  <el-cascader
                    ref="projCascaderRef"
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
                    filterable
                    :disabled="isDetailMode || !!billData.status"
                    @change="changeProject"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
                <el-form-item label="项目所属公司" prop="compName">
                  <el-input
                    v-model="formData.compName"
                    placeholder="项目所属公司"
                    disabled
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
                <el-form-item label="提交人" prop="userName">
                  <el-input
                    v-model="formData.userName"
                    clearable
                    placeholder="提交人"
                    disabled
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
                <el-form-item label="提交时间" prop="createDate">
                  <el-date-picker
                    v-model="formData.createDate"
                    type="date"
                    placeholder="提交时间"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </section>

        <!-- ====== 卡片2：基本信息 ====== -->
        <section class="item-card" id="card-basic" :class="{ collapsed: collapsedCards.basic }">
          <div class="card-header" @click="toggleCard('basic')">
            <div class="card-title"><span class="icon">📄</span>基本信息</div>
            <span class="card-toggle">▼</span>
          </div>
          <div class="card-body">
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
                <el-form-item prop="conTypeId" label="合同分类" required>
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
                    filterable
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
                <el-form-item label="计划金额" prop="" class="is-money">
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
        </section>

        <!-- ====== 卡片3：合同信息 ====== -->
        <section
          class="item-card"
          id="card-contract"
          :class="{ collapsed: collapsedCards.contract }"
        >
          <div class="card-header" @click="toggleCard('contract')">
            <div class="card-title"><span class="icon">📑</span>合同信息</div>
            <span class="card-toggle">▼</span>
          </div>
          <div class="card-body">
            <el-row
              :gutter="24"
              v-show="formData.conProperty == 2 || formData.conProperty == 3"
            >
              <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                <el-form-item label="主合同" prop="mainConId" required>
                  <el-input
                    v-model="formData.mainConName"
                    placeholder="请选择主合同"
                    readonly
                    class="pick-input"
                    @click="openMainConDialog"
                  >
                    <template #append>
                      <span class="pick-icon" @click.stop="openMainConDialog">🔍</span>
                    </template>
                  </el-input>
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
              <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
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
                <el-form-item label="投标保证金额" prop="" required class="is-money">
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
                <el-form-item label="履约保证金额" prop="" required class="is-money">
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
        </section>

        <!-- ====== 卡片4：价款及税率 ====== -->
        <section class="item-card" id="card-price" :class="{ collapsed: collapsedCards.price }">
          <div class="card-header" @click="toggleCard('price')">
            <div class="card-title"><span class="icon">💰</span>价款及税率</div>
            <span class="card-toggle">▼</span>
          </div>
          <div class="card-body">
            <div class="summary-bar">
              <div class="summary-item">
                <span class="summary-label">合同总价(含税)</span>
                <span class="summary-value">
                  ¥ {{ formatMoney(priceTaxData.totalPriceTax) }}
                </span>
              </div>
              <div class="summary-item">
                <span class="summary-label">合同总价(不含税)</span>
                <span class="summary-value">
                  ¥ {{ formatMoney(priceTaxData.totalPrice) }}
                </span>
              </div>
              <div class="summary-item">
                <span class="summary-label">税额</span>
                <span class="summary-value tax">
                  ¥ {{ formatMoney(priceTaxData.taxAmount) }}
                </span>
              </div>
              <div class="summary-item">
                <span class="summary-label">综合税率</span>
                <span class="summary-value tax">
                  {{ priceTaxData.taxRate }}%
                </span>
              </div>
            </div>

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

            <div class="detail-table">
              <div class="header-content">
                <span class="header-title">
                  价税明细
                  <span class="count">{{ priceTable.length }}</span>
                </span>
                <el-button type="primary" size="small" @click="addPrice">
                  + 新增价税明细
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
        </section>

        <!-- ====== 卡片5：供方信息 ====== -->
        <section
          class="item-card"
          id="card-supplier"
          :class="{ collapsed: collapsedCards.supplier }"
        >
          <div class="card-header" @click="toggleCard('supplier')">
            <div class="card-title"><span class="icon">🏢</span>供方信息</div>
            <span class="card-toggle">▼</span>
          </div>
          <div class="card-body">
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
        </section>

        <!-- ====== 卡片6：支付比例 ====== -->
        <section
          class="item-card"
          id="card-payrate"
          :class="{ collapsed: collapsedCards.payrate }"
        >
          <div class="card-header" @click="toggleCard('payrate')">
            <div class="card-title"><span class="icon">📊</span>支付比例</div>
            <span class="card-toggle">▼</span>
          </div>
          <div class="card-body">
            <div class="detail-table">
              <div class="header-content">
                <span class="header-title">
                  支付比例明细
                  <span class="count">{{ payrateTable.length }}</span>
                </span>
                <el-button type="primary" size="small" @click="addPayrate">
                  + 新增支付明细
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
        </section>

        <!-- ====== 卡片7：合同附件 ====== -->
        <section class="item-card" id="card-annex" :class="{ collapsed: collapsedCards.annex }">
          <div class="card-header" @click="toggleCard('annex')">
            <div class="card-title"><span class="icon">📎</span>合同附件</div>
            <span class="card-toggle">▼</span>
          </div>
          <div class="card-body">
            <el-form-item label="上传合同附件" prop="attachment">
              <base-upload :multiple="true"></base-upload>
            </el-form-item>
          </div>
        </section>
      </el-form>
    </div>

    <!-- ============ 悬浮定位栏（图标+名称常显，可收起） ============ -->
    <nav class="float-nav" :class="{ 'nav-hidden': navCollapsed }">
      <button
        class="nav-expand-btn"
        title="展开定位栏"
        @click="navCollapsed = false"
      >
        🧭
      </button>
      <div class="float-nav-inner">
        <span
          class="nav-collapse-btn"
          title="收起"
          @click="navCollapsed = true"
        >
          ×
        </span>
        <div class="float-nav-title">
          <span class="nav-compass">🧭</span>
          <span class="nav-title-text">快速定位</span>
        </div>
        <ul class="float-nav-list">
          <li
            v-for="card in navCards"
            :key="card.id"
            class="float-nav-item"
            :class="{ active: activeCard === card.id }"
            @click="scrollToCard(card.id)"
          >
            <span class="nav-dot"></span>
            <span class="nav-icon">{{ card.icon }}</span>
            <span class="nav-label">{{ card.label }}</span>
          </li>
        </ul>
      </div>
    </nav>   
  </div>
  <!-- 选择合同弹窗 -->
    <choose-contract-dialog
      ref="contractDialogRef"
      v-model="mainConDialogVisible"
      @select="handleMainConSelect"
    />
</template>

<script setup lang="ts">
import {
  useContractForm,
  type ContractFormProps,
  type ContractFormEmits,
} from "./use-contract-form";
import BillHeader from "@/components/business/bill-components/bill-header.vue";
import EditableTable from "@/components/base/editable-table.vue";
import BaseUpload from "@/components/base/base-upload.vue";
import ChooseContractDialog from "@/components/business/choose-contract-dialog.vue";
import {
  ConPropertyEnum,
  PriceTypeEnum,
  ManageTypeEnum,
  PayTypeEnum,
  SealTypesEnum,
  conBillStatusEnum,
} from "@/constants/contract-manage/enums";
import { getEnumLabel, getEnumType } from "@/utils/enum";

defineOptions({ name: "contract-ledger-form" });

const props = withDefaults(defineProps<ContractFormProps>(), {
  mode: "add",
  conId: undefined,
  empTreeData: () => [],
  conTypeOptions: () => [],
});

const emit = defineEmits<ContractFormEmits>();

const {
  // 表单核心
  billData,
  formData,
  formRef,
  submitLoading,
  formRules,
  handleSubmit,
  handleSave,
  handleDelete,
  handleCancel,
  handleViewProcess,
  resetForm,
  initData,
  // 价款
  priceTaxData,
  formatMoney,
  priceTable,
  priceColumns,
  payrateTable,
  payrateColumns,
  addPrice,
  deletePrice,
  addPayrate,
  deletePayrate,
  // 下拉选项
  segOptions,
  companyOptions,
  buildingOptions,
  conTypeOptions,
  projectOptions,
  supplierOptions,
  proProfOptions,
  acctProjOptions,
  // 联动
  changeProject,
  handleBuildingChange,
  // UI：卡片折叠
  collapsedCards,
  toggleCard,
  // UI：悬浮定位栏
  navCards,
  activeCard,
  navCollapsed,
  scrollToCard,
  // 模式
  isDetailMode,
  isEditMode,
  isAddMode,
  // 主合同选择
  mainConDialogVisible,
  openMainConDialog,
  handleMainConSelect,
} = useContractForm(props, emit);

defineExpose({
  formData,
  billData,
  resetForm,
  initData,
});
</script>

<style scoped lang="scss">
.contract-basic-form {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

/* ============ 表单滚动区 ============ */
.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px 30px;
  box-sizing: border-box;
}

.adapt-form {
  width: 100%;
  margin: 0 auto;

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
    color: #4e5969;
    line-height: 32px;
    padding-right: 12px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner),
  :deep(.el-select__wrapper) {
    border-radius: 4px;
    transition: all 0.2s;
  }

  /* 金额字段 ¥ 前缀 */
  .is-money :deep(.el-input__wrapper) {
    padding-left: 24px;
    position: relative;

    &::before {
      content: "¥";
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #86909c;
      font-size: 13px;
      pointer-events: none;
      z-index: 1;
    }
  }
}

/* ============ 弹出选择式输入框（主合同） ============ */
.pick-input {
  cursor: pointer;

  :deep(.el-input__wrapper) {
    background: #f5f7fa;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      box-shadow: 0 0 0 1px #c0c4cc inset;
    }
  }

  :deep(.el-input__inner) {
    cursor: pointer;
  }

  :deep(.el-input-group__append) {
    padding: 0;
    background: linear-gradient(135deg, #409eff, #36a3f7);
    border: none;
    min-width: 44px;
    cursor: pointer;
    transition: all 0.25s;

    .pick-icon {
      width: 44px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #fff;
      cursor: pointer;
      line-height: 1;
    }

    &:hover {
      background: linear-gradient(135deg, #66b1ff, #4ba8f8);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.35);
    }
  }
}

/* ============ 卡片 ============ */
.item-card {
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  scroll-margin-top: 76px;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &:last-child {
    margin-bottom: 0;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #ebeef5;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;

    &:hover {
      background: #fafbfc;
    }
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
    color: #1d2129;
    position: relative;
    padding-left: 12px;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      background: linear-gradient(180deg, #409eff, #66b1ff);
      border-radius: 2px;
    }

    .icon {
      font-size: 16px;
    }
  }

  .card-toggle {
    color: #86909c;
    font-size: 12px;
    transition: transform 0.2s;
  }

  .card-body {
    padding: 20px 20px 4px;
  }

  &.collapsed {
    .card-toggle {
      transform: rotate(-90deg);
    }

    .card-body {
      display: none;
    }

    .card-header {
      border-bottom: none;
    }
  }
}

/* ============ 价款汇总条 ============ */
.summary-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  background: linear-gradient(135deg, #f0f7ff 0%, #f8fbff 100%);
  border: 1px solid #d6e4ff;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 18px;

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .summary-label {
    font-size: 12px;
    color: #86909c;
  }

  .summary-value {
    font-size: 18px;
    font-weight: 600;
    color: #409eff;
    font-variant-numeric: tabular-nums;

    &.tax {
      color: #e6a23c;
    }
  }
}

/* ============ 明细表格区 ============ */
.detail-table {
  margin-top: 8px;

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
      display: inline-flex;
      align-items: center;
      gap: 8px;

      .count {
        background: #ecf5ff;
        color: #409eff;
        padding: 1px 8px;
        border-radius: 10px;
        font-size: 12px;
      }
    }
  }
}

/* 滚动条美化 */
.form-scroll-area::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.form-scroll-area::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
}
.form-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #909399;
}
.form-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}

/* ============ 悬浮定位栏（图标+名称常显，可收起） ============ */
.float-nav {
  position: fixed;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 90;

  &.nav-hidden {
    .float-nav-inner {
      display: none;
    }
    .nav-expand-btn {
      display: flex;
    }
  }

  .nav-expand-btn {
    display: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(8px);
    border: 1px solid #e4e7ed;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
    font-size: 16px;
    transition: all 0.25s ease;

    &:hover {
      background: #409eff;
      color: #fff;
      border-color: #409eff;
      transform: scale(1.08);
    }
  }

  .float-nav-inner {
    position: relative;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(228, 231, 237, 0.6);
    border-radius: 12px;
    padding: 10px 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    width: 148px;
    overflow: hidden;
    opacity: 0.92;
    transition: opacity 0.3s;
  }

  &:hover .float-nav-inner {
    opacity: 1;
  }

  .nav-collapse-btn {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
    color: #86909c;
    opacity: 0.65;
    transition: all 0.2s;
    z-index: 2;
  }

  &:hover .nav-collapse-btn {
    opacity: 1;
  }

  .nav-collapse-btn:hover {
    color: #f56c6c;
    border-color: #f56c6c;
  }

  .float-nav-title {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 4px 8px;
    margin-bottom: 6px;
    border-bottom: 1px solid #ebeef5;
    font-size: 12px;
    color: #4e5969;
    font-weight: 600;
    white-space: nowrap;

    .nav-compass {
      font-size: 14px;
      flex-shrink: 0;
    }
  }

  .float-nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .float-nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    color: #86909c;
    transition: all 0.2s ease;
    position: relative;
    white-space: nowrap;

    .nav-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #d3d4d6;
      flex-shrink: 0;
      transition: all 0.25s ease;
    }

    .nav-icon {
      font-size: 14px;
      opacity: 0.75;
      flex-shrink: 0;
      transition: all 0.25s ease;
    }

    .nav-label {
      flex: 1;
    }

    &:hover {
      background: #ecf5ff;
      color: #409eff;

      .nav-dot {
        background: #409eff;
      }

      .nav-icon {
        opacity: 1;
        transform: scale(1.15);
      }
    }

    &.active {
      background: linear-gradient(
        90deg,
        #ecf5ff 0%,
        rgba(236, 245, 255, 0) 100%
      );
      color: #409eff;
      font-weight: 600;

      .nav-dot {
        background: #409eff;
        box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
        transform: scale(1.2);
      }

      .nav-icon {
        opacity: 1;
      }

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 16px;
        background: linear-gradient(180deg, #409eff, #66b1ff);
        border-radius: 2px;
      }
    }
  }
}

@media (max-width: 1280px) {
  .float-nav {
    display: none;
  }
}
</style>
