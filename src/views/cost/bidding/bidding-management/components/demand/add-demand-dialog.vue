<template>
  <base-modal
    v-model="modalVisible"
    title="新增招标需求"
    width="1000px"
    :confirm-loading="confirmLoading"
    @confirm="handleSubmit"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <div class="demand-wrapper">
      <el-form :model="formData" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="标题">
              <el-input v-model="formData.remark" placeholder="请输入标题" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="流程状态">
              <el-input v-model="formData.businessPlate" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="流程编号">
              <el-input v-model="formData.project" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="紧急程度">
              <el-input v-model="formData.company" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="业务板块">
              <el-input v-model="formData.businessPlate" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="板块编码">
              <el-input v-model="formData.project" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="提交人">
              <el-input v-model="formData.company" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="部门">
              <el-input v-model="formData.businessPlate" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="分部">
              <el-input v-model="formData.project" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="提交时间">
              <el-date-picker
                v-model="formData.company"
                type="datetime"
                placeholder="请选择时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="项目">
              <el-input v-model="formData.businessPlate" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="8">
            <el-form-item label="项目所属公司">
              <el-input v-model="formData.project" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>

        <h4 class="basic-title">一、招标事项</h4>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="合同分类">
              <el-input v-model="formData.businessPlate" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="采购事项">
              <el-input v-model="formData.project" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="采购方式">
              <el-input v-model="formData.businessPlate" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="招标方式">
              <el-input v-model="formData.project" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="计划金额">
              <el-input v-model="formData.project" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="清单模式">
              <el-select
                v-model="formData.listMode"
                placeholder="请选择清单模式"
                style="width: 100%"
              >
                <el-option label="正式" value="正式" />
                <el-option label="模拟" value="模拟" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="需求时间">
              <el-date-picker
                v-model="formData.demandTime"
                type="datetime"
                placeholder="请选择时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="招采开始日期">
              <el-date-picker
                v-model="formData.bidStartDate"
                type="datetime"
                placeholder="请选择时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="招采结束日期">
              <el-date-picker
                v-model="formData.bidEndDate"
                type="datetime"
                placeholder="请选择时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="招采责任人">
              <el-input v-model="formData.bidUser" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="楼栋范围">
              <el-input v-model="formData.buildingRange" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="事项说明">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入事项说明"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <h4 class="basic-title">二、需求说明</h4>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="需求说明">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入需求说明"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="相关附件">
              <div>附件</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="相关流程">
              <div>流程</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "@/components/base/base-modal.vue";

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const confirmLoading = ref(false);
const formData = ref({
  remark: "",
  businessPlate: "",
  project: "",
  company: "",
  listMode: "",
  demandTime: "",
  bidStartDate: "",
  bidEndDate: "",
  bidUser: "",
  buildingRange: "",
});

const rules = ref({
  remark: [{ required: true, message: "请输入备注", trigger: "blur" }],
  businessPlate: [
    { required: true, message: "请输入业务板块", trigger: "blur" },
  ],
  project: [{ required: true, message: "请输入项目", trigger: "blur" }],
});

// 弹窗显示控制
const modalVisible = ref(props.modelValue);
// 取消
const handleCancel = () => {
  modalVisible.value = false;
};
// 关闭
const handleClose = () => {
  modalVisible.value = false;
};
const handleSubmit = () => {};
// 多选
const handleSelectionChange = (selection: any) => {
  console.log("选中的数据:", selection);
};
// 监听弹窗显示状态
watch(
  () => props.modelValue,
  (val) => {
    modalVisible.value = val;
  },
);

watch(modalVisible, (val) => {
  emit("update:modelValue", val);
});

// 暴露方法
defineExpose({});
</script>

<style lang="scss" scoped>
.demand-wrapper {
  padding: 10px 10px;
  box-sizing: border-box;
  overflow: hidden;
  .basic-title {
    font-size: 16px;
    margin-bottom: 15px;
    color: #333;
  }
}
</style>
