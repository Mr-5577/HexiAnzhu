<!-- 项目成本科目 新增弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="新增项目成本科目"
    width="500px"
    :confirm-loading="submitLoading"
    @confirm="handleSubmit"
    @cancel="handleClose"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="110px"
      label-position="right"
    >
      <!-- <el-form-item prop="projId" label="选择项目" required>
        <el-tree-select
          v-model="formData.projId"
          :data="projectTreeData"
          :props="projectProps"
          :check-strictly="false"
          placeholder="请选择项目"
          filterable
          style="width: 100%"
        />
      </el-form-item> -->
      <el-form-item prop="subId" label="选择成本科目" required>
        <el-tree-select
          v-model="formData.subId"
          :data="productTreeData"
          :props="productProps"
          :check-strictly="false"
          placeholder="请选择成本科目"
          filterable
          style="width: 100%"
        />
      </el-form-item>
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
      <el-form-item prop="remark" label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
          :rows="3"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import BaseModal from "@/components/base/base-modal.vue";
import type { CostCategoryBaseNode } from "@/types/cost/cost-category-type";
import { costCategoryApi } from "@/api/cost/cost-category-api";
import { buildTree } from "@/utils/tree";
import { dictionaryApi } from "@/api/cost/dictionary-api";

// Props
interface Props {
  modelValue: boolean;
  projectId?: number | null;
  projectTreeData: any[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  projectId: null,
  projectTreeData: () => [],
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const productTreeData = ref<CostCategoryBaseNode[]>([]);
const productTreeLoading = ref(false);
const segOptions = ref([]);

// 树形选择器配置
const projectProps = {
  children: "children",
  label: "orgName",
  value: "orgId",
};
const productProps = {
  children: "children",
  label: "subName",
  value: "id",
  disabled: "isDisabled",
};

// 表单数据
const formData = ref({
  projId: props.projectId,
  subId: null as number | null,
  segId: null as number | null,
  remark: "",
});

// 表单验证规则
const formRules: FormRules = {
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  subId: [{ required: true, message: "请选择成本科目", trigger: "change" }],
  segId: [{ required: true, message: "请选择业务板块", trigger: "change" }],
};

/**
 * 获取基础成本科目
 */
const getBaseProductList = async () => {
  productTreeLoading.value = true;
  try {
    const res = await costCategoryApi.getCostSubjectBaseList({ subName: "" });
    if (res.code === 200) {
      // 构建树形数据
      productTreeData.value = buildTree(res.data || []);
    }
  } catch (error) {
    console.error("获取成本科目失败:", error);
  } finally {
    productTreeLoading.value = false;
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

// 监听弹窗
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      // 重置表单
      formData.value = {
        projId: props.projectId,
        subId: null,
        segId: null,
        remark: "",
      };
      formRef.value?.clearValidate();
      // 获取基础成本科目列表
      getBaseProductList();
      // 获取业务板块列表
      getSegOptions();
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});

// 关闭
const handleClose = () => {
  formRef.value?.clearValidate();
  dialogVisible.value = false;
};

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitLoading.value = true;
    const params = {
      projId: formData.value.projId,
      subId: formData.value.subId,
      segId: formData.value.segId,
      remark: formData.value.remark,
    };
    const res = await costCategoryApi.addCostSubjectProj(params);
    if (res.code === 200) {
      ElMessage.success("新增成功");
      emit("success");
      handleClose();
    } else {
      ElMessage.error(res.msg || "操作失败");
    }
  } catch {
    // 表单验证失败
  } finally {
    submitLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
:deep(.el-tree-select) {
  width: 100%;
}
</style>
