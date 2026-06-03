<template>
  <base-modal
    v-model="modalVisible"
    :title="modalTitle"
    width="600px"
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
      <!-- 角色名称 -->
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="formData.roleName"
          placeholder="请输入角色名称"
          clearable
          :maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <!-- <el-row :gutter="20">
        <el-col :span="12"> </el-col>
        <el-col :span="12"> </el-col>
      </el-row> -->
      <el-form-item label="角色排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="999"
          placeholder="请输入"
          controls-position="right"
          style="width: 150px"
        />
      </el-form-item>

      <el-form-item label="角色状态" prop="isEnable">
        <el-radio-group v-model="formData.isEnable">
          <el-radio :value="true">启用</el-radio>
          <el-radio :value="false">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="是否超管" prop="isSuper">
        <el-radio-group v-model="formData.isSuper">
          <el-radio :value="true">是</el-radio>
          <el-radio :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="角色说明" prop="roleDesc">
        <el-input
          v-model="formData.roleDesc"
          type="textarea"
          :rows="5"
          placeholder="请输入角色说明"
          :maxlength="200"
          show-word-limit
          resize="none"
        />
      </el-form-item>
    </el-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElForm, ElMessage, type FormRules, ElRow, ElCol } from "element-plus";
import BaseModal from "@/components/base/base-modal.vue";
import type { RoleFormData, RoleItem } from "@/types/role-type";
import { roleApi } from "@/api/role-api";

interface Props {
  modelValue: boolean;
  editData?: RoleItem | null;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 弹窗显示控制
const modalVisible = ref(props.modelValue);

// 表单引用
const formRef = ref<InstanceType<typeof ElForm>>();

// 表单数据
const formData = reactive<RoleFormData>({
  roleName: "", // 角色名称
  sort: 999, // 角色排序
  isEnable: true, // 是否启用
  roleDesc: "", // 备注
  isSuper: false, // 是否超管
});

// 表单验证规则
const formRules: FormRules<RoleFormData> = {
  roleName: [
    { required: true, message: "请输入角色名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  sort: [
    { required: true, message: "请输入角色顺序", trigger: "blur" },
    {
      type: "number",
      min: 0,
      max: 999,
      message: "顺序范围在0-999之间",
      trigger: "blur",
    },
  ],
  isEnable: [{ required: true, message: "请选择状态", trigger: "change" }],
  isSuper: [{ required: true, message: "请选择", trigger: "change" }],
  roleDesc: [{ max: 200, message: "说明不能超过200个字符", trigger: "blur" }],
};

// 弹窗标题
const modalTitle = computed(() => {
  return props.editData ? "编辑角色" : "新增角色";
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
          roleName: props.editData.roleName,
          sort: props.editData.sort,
          isEnable: props.editData.isEnable,
          isSuper: props.editData.isSuper,
          roleDesc: props.editData.roleDesc || "",
        });
      }
    }
  }
);

watch(modalVisible, (val) => {
  emit("update:modelValue", val);
});

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    roleName: "",
    sort: 999,
    isEnable: true,
    roleDesc: "",
    isSuper: false,
  });

  // 清除验证状态
  formRef.value?.clearValidate();
};

// 表单提交
const handleSubmit = async () => {
  try {
    // 表单验证
    const valid = await formRef.value?.validate();
    if (!valid) return;

    // 开始提交
    confirmLoading.value = true;

    const submitData = {
      ...formData,
    };
    // 如果是编辑模式，需要包含 id
    if (props.editData?.id) {
      (submitData as RoleItem).id = props.editData.id;
    }
    // 调用API
    const apiMethod = props.editData ? roleApi.editRole : roleApi.addRole;
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
  padding: 0 20px;
  box-sizing: border-box;
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
