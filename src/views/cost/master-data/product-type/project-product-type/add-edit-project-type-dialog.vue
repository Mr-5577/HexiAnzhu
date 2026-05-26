<!-- 项目产品类型新增弹窗 -->
<template>
  <base-modal
    v-model="dialogVisible"
    title="新增项目产品类型"
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
      label-width="100px"
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
      <el-form-item prop="prodId" label="选择产品" required>
        <el-tree-select
          v-model="formData.prodId"
          :data="productTreeData"
          :props="productProps"
          :check-strictly="false"
          placeholder="请选择产品类型"
          filterable
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import BaseModal from "@/components/base/base-modal.vue";
import type { ProductBase } from "@/types/cost/product-type";
import { productTypeApi } from "@/api/cost/product-type-api";
import { buildTree } from "@/utils/tree";

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
const productTreeData = ref<ProductBase[]>([]);
const productTreeLoading = ref(false);

// 树形选择器配置
const projectProps = {
  children: "children",
  label: "orgName",
  value: "orgId",
};
const productProps = {
  children: "children",
  label: "prodName",
  value: "id",
  disabled: "isDisabled",
};

// 表单数据
const formData = ref({
  projId: props.projectId,
  prodId: null as number | null,
});

// 表单验证规则
const formRules: FormRules = {
  projId: [{ required: true, message: "请选择项目", trigger: "change" }],
  prodId: [{ required: true, message: "请选择产品类型", trigger: "change" }],
};

/**
 * 获取基础产品类型
 */
const getBaseProductList = async () => {
  productTreeLoading.value = true;
  try {
    const res = await productTypeApi.getProductBaseList({ prodName: "" });
    if (res.code === 200) {
      // 构建树形数据
      productTreeData.value = buildTree(res.data || []);
    }
  } catch (error) {
    console.error("获取产品类型失败:", error);
  } finally {
    productTreeLoading.value = false;
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
        prodId: null,
      };
      formRef.value?.clearValidate();
      // 获取基础产品类型列表
      getBaseProductList();
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
    const res = await productTypeApi.addProductProj({
      projId: formData.value.projId,
      prodId: formData.value.prodId,
    });
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
