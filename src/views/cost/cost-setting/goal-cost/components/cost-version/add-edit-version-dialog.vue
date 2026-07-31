<!-- 目标成本版本 新增/编辑弹窗 -->
<template>
  <base-modal
    v-model="visible"
    :title="dialogTitle"
    width="860px"
    :confirm-loading="submitLoading"
    @confirm="handleSubmit"
    @cancel="handleClose"
  >
    <div class="form-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="160px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
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
                :disabled="isEditMode"
                @change="changeProject"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="segId" label="业务板块" required>
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
        </el-row>

        <!-- <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="costAmt" label="目标成本总额(含税)" required>
              <el-input-number
                v-model="formData.costAmt"
                :precision="2"
                :min="0"
                placeholder="请输入目标成本总额(含税)"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              prop="costExclAmt"
              label="目标成本总额(不含税)"
              required
            >
              <el-input-number
                v-model="formData.costExclAmt"
                :precision="2"
                :min="0"
                placeholder="请输入目标成本总额(不含税)"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="costDynAmt" label="动态成本总额(含税)" required>
              <el-input-number
                v-model="formData.costDynAmt"
                :precision="2"
                :min="0"
                placeholder="请输入动态成本总额(含税)"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              prop="costDynExclAmt"
              label="动态成本总额(不含税)"
              required
            >
              <el-input-number
                v-model="formData.costDynExclAmt"
                :precision="2"
                :min="0"
                placeholder="请输入动态成本总额(不含税)"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row> -->

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="versionType" label="版本类型" required>
              <el-select
                v-model="formData.versionType"
                placeholder="请选择版本类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in props.verTypeOptions"
                  :key="item.dicCode"
                  :label="item.dicLabel"
                  :value="item.dicCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="areaVerMid" label="面积版本" required>
              <el-select
                v-model="formData.areaVerMid"
                placeholder="请选择面积版本"
                style="width: 100%"
              >
                <el-option
                  v-for="item in areaVersionOptions"
                  :key="item.id"
                  :label="item.verTitle"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="isEnabled" label="是否当前使用版本" required>
              <el-radio-group v-model="formData.isEnabled">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item prop="remark" label="备注">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="4"
                placeholder="请输入备注"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, useTemplateRef } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import type {
  HCstProjectCostM,
  HCstProjectCostMAddEditParams,
} from "@/types/cost/cost-setting/goal-cost-type";
import { goalCostApi } from "@/api/cost/cost-setting/goal-cost-api";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";
import { commonApi } from "@/api/cost/common-api";

const props = defineProps<{
  modelValue: boolean;
  editData?: HCstProjectCostM | null;
  verTypeOptions: any[] | []; // 版本类型选项
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const visible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const projectOptions = ref([]); // 项目下拉选项
const segOptions = ref([]); // 业务版块下拉选项
const areaVersionOptions = ref([]); // 面积版本选项

const isEditMode = computed(() => !!props.editData?.id);
const dialogTitle = computed(() =>
  isEditMode.value ? "编辑目标成本版本" : "新增目标成本版本",
);

// 使用 useTemplateRef 获取模板引用
const projCascaderRef = useTemplateRef("projCascaderRef");

const formData = ref<HCstProjectCostMAddEditParams>({
  segId: null,
  projId: undefined,
  versionNo: "",
  versionType: "",
  costAmt: 0,
  costExclAmt: 0,
  costDynAmt: 0,
  costDynExclAmt: 0,
  areaVerMid: null,
  isEnabled: false,
  remark: "",
});

// 表单验证规则
const formRules: FormRules = {
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  segId: [{ required: true, message: "请选择业务版块", trigger: "change" }],
  versionType: [
    { required: true, message: "请选择版本类型", trigger: "change" },
  ],
  areaVerMid: [
    { required: true, message: "请选择面积版本", trigger: "change" },
  ],
};

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const submitData = { ...formData.value };

    if (isEditMode.value && props.editData) {
      submitData.id = props.editData.id;
    } else {
      delete submitData.id;
    }

    let res;
    if (isEditMode.value) {
      res = await goalCostApi.editProjectCostM(submitData);
    } else {
      // MBCB:目标成本版本前缀
      const billNoRes = await commonApi.getBillNo({ bizType: "MBCB" });
      if (billNoRes.code === 200) {
        submitData.versionNo = billNoRes.data;
      }
      res = await goalCostApi.addProjectCostM(submitData);
    }

    if (res.code === 200) {
      ElMessage.success(dialogTitle.value + "成功");
      visible.value = false;
      emit("success");
    } else {
      ElMessage.error(res.message || dialogTitle.value + "失败");
    }
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitLoading.value = false;
  }
};
// 初始化表单
const initForm = () => {
  // 编辑模式：回填数据
  if (isEditMode.value && props.editData) {
    formData.value = {
      id: props.editData.id,
      segId: props.editData.segId,
      projId: props.editData.projId,
      versionNo: props.editData.versionNo,
      versionType: props.editData.versionType,
      costAmt: props.editData.costAmt,
      costExclAmt: props.editData.costExclAmt,
      costDynAmt: props.editData.costDynAmt,
      costDynExclAmt: props.editData.costDynExclAmt,
      areaVerMid: props.editData.areaVerMid,
      isEnabled: props.editData.isEnabled,
      remark: props.editData.remark || "",
    };
    getAreaVersion(props.editData.projId);
  } else {
    // 新增模式：重置表单
    areaVersionOptions.value = [];
    formData.value = {
      projId: undefined,
      segId: null,
      versionNo: "",
      versionType: "",
      costAmt: 0,
      costExclAmt: 0,
      costDynAmt: 0,
      costDynExclAmt: 0,
      areaVerMid: null,
      isEnabled: false,
      remark: "",
    };
    formRef.value?.resetFields();
  }
};

// 选择项目
const changeProject = (value: number) => {
  if (value) {
    getAreaVersion(value);
    // 通过模板引用获取节点数据
    const checkedNodes = projCascaderRef.value?.getCheckedNodes();
    if (checkedNodes && checkedNodes.length > 0) {
      console.log("选中的项目数据:", checkedNodes);
    }
  }
};
// 获取项目列表
const getProjectOptions = async () => {
  try {
    // const res = await largeScreenApi.getProjList();
    const res = await projectAreaApi.getMguProjList();
    if (res.code === 200) {
      projectOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
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
// 查询面积版本
const getAreaVersion = async (projId?: number) => {
  try {
    const res = await projectAreaApi.getAreaVerMList({
      projId: projId,
    });
    if (res.code === 200) {
      const list = res.data || [];
      areaVersionOptions.value = list;
    }
  } catch (error) {}
};

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val;
    if (val) {
      await getProjectOptions();
      await getSegOptions();
      // await getAreaVersion();
      initForm();
    }
  },
);

// 同步 visible 到父组件
watch(visible, (val) => emit("update:modelValue", val));
</script>

<style lang="scss" scoped>
.form-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
