<!-- 基本信息 -->
<template>
  <div class="basic-infor-form">
    <div class="form-scroll-area">
      <el-form :model="form" label-width="110px" class="adapt-form">
        <!-- <div class="form-group-title">基本信息</div> -->
        <el-row :gutter="24">
          <el-col :xs="24" :sm="16" :md="16" :lg="16" :xl="16">
            <el-form-item label="供应商名称">
              <el-input
                v-model="form.supplierName"
                placeholder="请输入供应商名称"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="供应商类型">
              <el-select
                v-model="form.supplierType"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="企业" value="企业" />
                <el-option label="个体" value="个体" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="内外部">
              <el-select
                v-model="form.innerOuter"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="内部" value="内部" />
                <el-option label="外部" value="外部" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="企业性质">
              <el-select
                v-model="form.enterpriseNature"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="国企" value="国企" />
                <el-option label="民企" value="民企" />
                <el-option label="外企" value="外企" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="信用代码">
              <el-input
                v-model="form.creditCode"
                placeholder="请输入统一社会信用代码"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="成立日期">
              <el-date-picker
                v-model="form.establishDate"
                type="date"
                placeholder="请选择成立日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="注册资金(万元)">
              <el-input-number
                v-model="form.registeredCapital"
                :min="0"
                :precision="2"
                placeholder="请输入注册资金"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="纳税类型">
              <el-select
                v-model="form.taxType"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="小规模纳税人" value="小规模纳税人" />
                <el-option label="一般纳税人" value="一般纳税人" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="供应商来源">
              <el-select
                v-model="form.supplierSource"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="考察寻源" value="考察寻源" />
                <el-option label="公开招标" value="公开招标" />
                <el-option label="推荐引入" value="推荐引入" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="16" :md="16" :lg="16" :xl="16">
            <el-form-item label="注册地">
              <el-input
                v-model="form.registeredAddress"
                placeholder="请输入注册地址"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="单位地址">
              <el-input
                v-model="form.unitAddress"
                placeholder="请输入单位地址"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="法人代表">
              <el-input
                v-model="form.legalPerson"
                placeholder="请输入法人代表姓名"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="法人证件类型">
              <el-select
                v-model="form.idType"
                placeholder="请选择证件类型"
                style="width: 100%"
              >
                <el-option label="身份证" value="身份证" />
                <el-option label="护照" value="护照" />
                <el-option label="军官证" value="军官证" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="法人证件号码">
              <el-input v-model="form.idNumber" placeholder="请输入证件号码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="法人代表电话">
              <el-input
                v-model="form.legalPersonPhone"
                placeholder="请输入联系电话"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="16" :md="16" :lg="16" :xl="16">
            <el-form-item label="法人代表邮箱">
              <el-input
                v-model="form.legalPersonEmail"
                placeholder="请输入邮箱"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="实控人">
              <el-input
                v-model="form.actualController"
                placeholder="请输入实控人姓名"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
            <el-form-item label="实控人身份证">
              <el-input
                v-model="form.actualControllerId"
                placeholder="请输入身份证号码"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="企业主要资质">
              <el-input
                v-model="form.qualification"
                placeholder="请填写企业取得的主要资质，如ISO9001、高新技术企业等"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="经营范围">
              <el-input
                v-model="form.businessScope"
                type="textarea"
                :rows="4"
                placeholder="请填写营业执照上的经营范围"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="其他说明">
              <el-input
                v-model="form.otherRemark"
                type="textarea"
                :rows="3"
                placeholder="其他需要补充说明的信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 按钮区域 - 固定在底部 -->
    <div class="btn-row">
      <el-button @click="handleReset">重置</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineOptions({ name: "basic-infor" });

const form = ref({
  supplierName: "",
  supplierType: "企业",
  innerOuter: "内部",
  enterpriseNature: "国企",
  creditCode: "",
  establishDate: "",
  registeredCapital: null,
  taxType: "小规模纳税人",
  supplierSource: "考察寻源",
  registeredAddress: "",
  unitAddress: "",
  legalPerson: "",
  idType: "身份证",
  idNumber: "",
  legalPersonPhone: "",
  legalPersonEmail: "",
  actualController: "",
  actualControllerId: "",
  qualification: "",
  businessScope: "",
  otherRemark: "",
});

const handleSubmit = () => {
  console.log("表单数据：", form.value);
};

const handleReset = () => {
  form.value = {
    supplierName: "",
    supplierType: "企业",
    innerOuter: "内部",
    enterpriseNature: "国企",
    creditCode: "",
    establishDate: "",
    registeredCapital: null,
    taxType: "小规模纳税人",
    supplierSource: "考察寻源",
    registeredAddress: "",
    unitAddress: "",
    legalPerson: "",
    idType: "身份证",
    idNumber: "",
    legalPersonPhone: "",
    legalPersonEmail: "",
    actualController: "",
    actualControllerId: "",
    qualification: "",
    businessScope: "",
    otherRemark: "",
  };
};
</script>

<style scoped lang="scss">
.basic-infor-form {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
}

// 滚动区域
.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px 0 32px;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f7fa;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c9d2;
    border-radius: 4px;

    &:hover {
      background: #a8b0b8;
    }
  }
}

// 表单样式
.adapt-form {
  width: 100%;
  //   max-width: 1400px;
  //   margin: 0 auto;
}

.form-group-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
  line-height: 1.2;
}

// 按钮区域
.btn-row {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #eef2f6;
  background: #ffffff;
  flex-shrink: 0;
  gap: 12px;

  .el-button {
    min-width: 88px;
  }
}

// 响应式：超大屏 1920px+
// @media (min-width: 1920px) {
//   .form-scroll-area {
//     padding: 32px 48px 0 48px;
//   }

//   .adapt-form {
//     max-width: 1600px;
//   }

//   :deep(.el-form-item__label) {
//     width: 130px !important;
//   }

//   :deep(.el-input__inner),
//   :deep(.el-textarea__inner) {
//     font-size: 14px;
//   }
// }

// 标准屏 1440px - 1920px
// @media (min-width: 1440px) and (max-width: 1919px) {
//   .adapt-form {
//     max-width: 1200px;
//   }
// }

// 小屏适配
@media (max-width: 1200px) {
  .form-scroll-area {
    padding: 16px 20px 0 20px;
  }
}
</style>
