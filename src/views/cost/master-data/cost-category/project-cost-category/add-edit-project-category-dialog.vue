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
      <el-form-item prop="subId" label="选择成本科目" required>
        <el-cascader
          ref="cascaderRef"
          v-model="formData.subId"
          :options="productTreeData"
          :show-all-levels="false"
          :collapse-tags="true"
          :props="{
            expandTrigger: 'hover',
            emitPath: true,
            checkStrictly: false,
            value: 'id',
            label: 'subName',
            children: 'children',
            multiple: true,
          }"
          placeholder="请选择成本科目"
          style="width: 100%"
          @change="handleProductChange"
        />
      </el-form-item>
      <!-- <el-form-item prop="segId" label="业务板块" required>
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
      </el-form-item> -->
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
import { ref, watch, useTemplateRef } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import BaseModal from "@/components/base/base-modal.vue";
import type { CostCategoryBaseNode } from "@/types/cost/master-data/cost-category-type";
import { costCategoryApi } from "@/api/cost/master-data/cost-category-api";
import { buildTree } from "@/utils/tree";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";

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

const cascaderRef = useTemplateRef("cascaderRef");
const dialogVisible = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const baseFlatList = ref([]);
const productTreeData = ref<CostCategoryBaseNode[]>([]);
const productTreeLoading = ref(false);
const segOptions = ref([]);

// 表单数据
const formData = ref({
  projId: props.projectId,
  subId: [] as number[][],
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
      // 保存基础扁平数据结构
      baseFlatList.value = res.data || [];
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
const handleProductChange = (val: number) => {
  console.log("handleProductChange", val);
};

// 关闭
const handleClose = () => {
  formRef.value?.clearValidate();
  dialogVisible.value = false;
};

// 扁平化并去重
const flatAndUnique = (paths) => {
  const ids = new Set();
  paths.forEach((path) => {
    path.forEach((id) => {
      ids.add(id);
    });
  });
  return Array.from(ids);
};

// 提交
const handleSubmit = async () => {
  console.log("handleSubmit", cascaderRef.value?.getCheckedNodes());
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    // 扁平化并去重获取所有科目ID
    const paths = formData.value.subId || [];
    if (paths.length === 0) {
      ElMessage.warning("请至少选择一个成本科目");
      return;
    }
    submitLoading.value = true;
    const uniqueIds = flatAndUnique(paths);
    // 得到选中的科目数据
    const newData = baseFlatList.value.filter((item) => uniqueIds.includes(item.id));
    // 使用 Promise.allSettled 支持部分成功
    const savePromises = newData.map((item) => {
      const params = {
        projId: formData.value.projId as number,
        subId: item.id as number,
        segId: item.busiSegId as number,
        allocRule: item.allocRule,
        remark: formData.value.remark,
      };
      return costCategoryApi.addCostSubjectProj(params);
    });
    const results = await Promise.allSettled(savePromises);
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failCount = results.filter((r) => r.status === "rejected").length;
    if (successCount > 0) {
      ElMessage.success(`新增成功！`);
      emit("success");
      handleClose();
    }
  } catch {
  } finally {
    submitLoading.value = false;
  }
};

// 监听弹窗
watch(
  () => props.modelValue,
  async (val) => {
    dialogVisible.value = val;
    if (val) {
      // 重置表单
      formData.value = {
        projId: props.projectId,
        subId: [],
        segId: null,
        remark: "",
      };
      formRef.value?.clearValidate();
      // 获取基础成本科目列表
      getBaseProductList();
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
});
</script>

<style lang="scss" scoped>
:deep(.el-tree-select) {
  width: 100%;
}
</style>
