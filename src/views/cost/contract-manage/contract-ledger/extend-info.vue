<template>
  <div>
    <div class="section-title">拓展信息</div>
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
        <el-form-item label="印章类型" prop="sealTypes" required>
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
        <el-form-item label="签约地点" prop="signAddr" required>
          <el-input v-model="formData.signAddr" placeholder="请输入签约地点" />
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
        <el-form-item label="联系人电话" prop="supCmanTel" required>
          <el-input
            v-model="formData.supCmanTel"
            placeholder="请输入联系电话"
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
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="联系人职务" prop="supCmanJob">
          <el-input v-model="formData.supCmanJob" placeholder="请输入职务" />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="开户银行" prop="bankName">
          <el-input v-model="formData.bankName" placeholder="请输入开户银行" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="24">
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
</template>

<script setup lang="ts">
import { computed } from "vue";
import { SealTypesEnum } from "@/constants/contract-manage/enums";

const props = defineProps<{
  modelValue: any;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
}>();

const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>

<style scoped lang="scss">
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 10px 0 10px 0;
  padding-left: 10px;
  position: relative;
  &::before {
    content: "";
    width: 4px;
    height: 16px;
    background: #409eff;
    border-radius: 2px;
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
