<!-- 单据基础信息 -->
<template>
  <div class="item-card">
    <el-row :gutter="24">
      <el-col :xs="24" :sm="12" :md="12" :lg="18" :xl="18">
        <el-form-item label="标题" prop="bizTitle" required>
          <el-input
            v-model="formData.bizTitle"
            clearable
            :disabled="disabled"
            placeholder="请输入标题"
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="审批状态">
          <el-tag :type="getEnumType(conBillStatusEnum, status || 0)">
            {{ getEnumLabel(conBillStatusEnum, status || 0) }}
          </el-tag>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="业务板块" prop="segId">
          <el-input
            v-model="formData.segName"
            disabled
            placeholder=""
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="板块编码" prop="segNo">
          <el-input v-model="formData.segNo" disabled placeholder="" />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="部门" prop="deptName">
          <el-input v-model="formData.deptName" placeholder="" disabled />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="分部" prop="mguName">
          <el-input v-model="formData.mguName" placeholder="" disabled />
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
            :props="cascaderProps"
            placeholder=""
            style="width: 100%"
            filterable
            :disabled="disabled"
            @change="handleProjectChange"
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="项目所属公司" prop="compName">
          <el-input
            v-model="formData.compName"
            placeholder=""
            disabled
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="提交人" prop="userName">
          <el-input
            v-model="formData.userName"
            clearable
            placeholder=""
            disabled
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-form-item label="提交时间" prop="createDate">
          <el-date-picker
            v-model="formData.createDate"
            type="date"
            placeholder=""
            style="width: 100%"
            value-format="YYYY-MM-DD"
            disabled
          />
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef } from "vue";
import { getEnumLabel, getEnumType } from "@/utils/enum";
import { conBillStatusEnum } from "@/constants/contract-manage/enums";
import { projectAreaApi } from "@/api/cost/master-data/project-area-api";

defineOptions({ name: "BasicInfoCard" });

interface Props {
  modelValue: {
    bizTitle?: string;
    segId?: number;
    segName?: string;
    segNo?: string;
    deptName?: string;
    mguName?: string;
    projId?: number;
    projName?: string;
    compId?: string;
    compName?: string;
    userName?: string;
    createDate?: string;
  };
  status?: number;
  disabled?: boolean;
  projectOptions?: any[];
  cascaderProps?: object;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  status: 0,
  disabled: false,
  projectOptions: () => [],
  cascaderProps: () => ({
    expandTrigger: "hover",
    emitPath: false,
    checkStrictly: false,
    value: "orgId",
    label: "orgName",
    children: "children",
  }),
});

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
  (e: "projectChange", value: number, nodeData?: any): void;
}>();

const projCascaderRef = useTemplateRef("projCascaderRef");

// 本地表单数据
const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 项目变更处理
const handleProjectChange = async (value: number) => {
  if (value) {
    try {
      const res = await projectAreaApi.getInfoByProjId({ id: value });
      if (res.code === 200 && res.data) {
        const { compName, compId, segId, segName,segNo } = res.data;
        // 更新表单数据
        const newData = {
          ...formData.value,
          compId: compId || "",
          compName: compName || "",
          segId: segId || "",
          segNo: segNo || "",
          segName: segName || "",
          projId: value,
        };
        emit("update:modelValue", newData);
      }
    } catch (error) {
      console.error("获取项目信息失败:", error);
    }
  }

  // 触发自定义事件
  const checkedNodes = projCascaderRef.value?.getCheckedNodes();
  const nodeData =
    checkedNodes && checkedNodes.length > 0 ? checkedNodes[0] : undefined;
  emit("projectChange", value, nodeData);
};

// 暴露方法给父组件
defineExpose({
  projCascaderRef,
  handleProjectChange,
});
</script>

<style scoped lang="scss">
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
</style>
