<template>
  <base-modal
    v-model="modalVisible"
    :title="modalTitle"
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
      <el-form-item label="成员类型" prop="memberType">
        <el-select
          v-model="formData.memberType"
          placeholder="请选择成员类型"
          style="width: 240px"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="成员名称" prop="memberId">
        <el-tree-select
          v-model="formData.memberId"
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
import { ElForm, ElMessage, type FormRules, ElRow, ElCol } from "element-plus";
import BaseModal from "@/components/base-modal.vue";
import type { RoleMemberItem, RoleMemberAdd } from "@/types/role-type";
import { roleApi } from "@/api/role-api";

interface Props {
  modelValue: boolean;
  roleId: number | string;
  editData?: RoleMemberItem | null;
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
const options = [
  { value: 0, label: "人员" },
  { value: 1, label: "部门" },
  { value: 2, label: "公司" },
  { value: 3, label: "板块" },
];

// 弹窗显示控制
const modalVisible = ref(props.modelValue);

// 表单引用
const formRef = ref<InstanceType<typeof ElForm>>();

// 表单数据
const formData = reactive<RoleMemberAdd>({
  roleId: props.roleId,
  memberName: "",
  memberId: null,
  memberType: 0,
});

// 表单验证规则
const formRules: FormRules<RoleMemberAdd> = {
  memberId: [{ required: true, message: "请选择成员", trigger: "blur" }],
  memberType: [{ required: true, message: "请选择", trigger: "change" }],
};

// 弹窗标题
const modalTitle = computed(() => {
  return props.editData ? "编辑成员" : "新增成员";
});

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
      if (props.editData) {
        // 编辑模式下填充数据
        Object.assign(formData, {
          memberName: props.editData.memberName,
          memberId: props.editData.memberId,
          memberType: props.editData.memberType,
        });
      }
    }
  }
);

watch(modalVisible, (val) => {
  emit("update:modelValue", val);
});

// 获取选中的节点信息
const selectedEmployee = computed(() => {
  if (!formData.memberId) return null;
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
  return find(props.treeData, formData.memberId);
});

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    roleId: "",
    memberName: "",
    memberId: null,
    memberType: 0,
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
      ...formData,
      roleId: props.roleId,
    };
    if (selectedEmployee) {
      submitData.memberId = selectedEmployee.value.orgId
      submitData.memberName = selectedEmployee.value.orgName
    }
    // 如果是编辑模式，需要包含 id
    if (props.editData?.id) {
      submitData.id = props.editData.id;
    }
    // 调用API
    const apiMethod = props.editData
      ? roleApi.editRoleMember
      : roleApi.addRoleMember;
    console.log("参数", submitData);
    const res = await apiMethod(submitData);
    if (res.code == 200) {
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      ElMessage.success(props.editData ? "编辑成功" : "新增成功");
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
