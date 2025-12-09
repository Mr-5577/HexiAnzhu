<template>
  <base-modal
    v-model="modalVisible"
    :title="'新增人员'"
    width="500px"
    :confirm-loading="confirmLoading"
    @confirm="handleSubmit"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
      class="role-form"
    >
      <el-form-item label="人员名称" prop="dataId">
        <el-tree-select
          v-model="formData.dataId"
          node-key="treeId"
          :props="defaultProps"
          :data="props.treeData"
          filterable
          style="width: 240px"
        />
      </el-form-item>
    </el-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElForm, ElMessage, type FormRules } from "element-plus";
import BaseModal from "@/components/base-modal.vue";
import { roleApi } from "@/api/role-api";

interface Props {
  modelValue: boolean;
  roleId: number | null;
  isSuper: boolean | null;
  treeData: any;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const defaultProps = {
  value: "treeId",
  label: "orgName",
  children: "children",
  disabled: (data: any) => {
    // 禁用所有 dataType 不为 'emp' 的节点 ==== seg: '板块',mgu: '管理单元',dept: '部门',emp: '员工'
    return data.dataType !== 0;
  },
};

// 弹窗显示控制
const modalVisible = ref(props.modelValue);

// 表单引用
const formRef = ref<InstanceType<typeof ElForm>>();

// 表单数据
const formData = reactive<any>({
  roleId: props.roleId,
  dataId: "",
});

// 表单验证规则
const formRules: FormRules<any> = {
  dataId: [{ required: true, message: "请选择人员", trigger: "blur" }],
};

// 加载状态
const confirmLoading = ref(false);
// 监听弹窗显示状态
watch(
  () => props.modelValue,
  (val) => {
    modalVisible.value = val;
    if (val) {
      // 打开弹窗时初始化表单
      resetForm();
    }
  }
);

watch(modalVisible, (val) => {
  emit("update:modelValue", val);
});

// 获取选中的节点信息
const selectedEmployee = computed(() => {
  if (!formData.dataId) return null;
  // 简单查找函数
  const find = (nodes: any[], targetId: string): any => {
    for (const node of nodes) {
      if (node.treeId === targetId) return node;
      if (node.children && node.children.length > 0) {
        const found = find(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };
  return find(props.treeData, formData.dataId);
});

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    roleId: "",
    dataId: "",
  });
  // 清除验证状态
  formRef.value?.clearValidate();
};

// 表单提交
const handleSubmit = async () => {
  console.log("selectedEmployee", selectedEmployee);
  try {
    // 表单验证
    const valid = await formRef.value?.validate();
    if (!valid) return;

    // 开始提交
    confirmLoading.value = true;

    const submitData = {
      roleId: props.roleId,
      isSuper: props.isSuper,
      listUser: [
        {
          dataId: selectedEmployee.value.orgId,
          roleId: props.roleId,
          isPower: true,
        },
      ],
    };
    console.log("参数", submitData);
    const res = await roleApi.editRoleDataPowerUserList(submitData);
    if (res.code == 200) {
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      ElMessage.success("新增成功");
      emit("success");
      modalVisible.value = false;
    }
  } catch (error) {
    console.error("提交失败:", error);
  } finally {
    confirmLoading.value = false;
  }
};

// 取消
const handleCancel = () => {
  modalVisible.value = false;
};

// 关闭
const handleClose = () => {
  resetForm();
};

// 暴露方法
defineExpose({
  open: () => {
    modalVisible.value = true;
    resetForm();
  },
  close: () => {
    modalVisible.value = false;
    resetForm();
  },
});
</script>

<style lang="scss" scoped>
.role-form {
  .el-form-item {
    margin-bottom: 18px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .el-input,
  .el-textarea {
    width: 100%;
  }

  // 调整数字输入框样式
  :deep(.el-input-number) {
    .el-input__wrapper {
      padding-left: 11px;
      padding-right: 11px;
    }
  }
}
</style>
