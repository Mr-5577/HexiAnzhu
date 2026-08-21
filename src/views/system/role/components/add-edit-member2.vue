<template>
  <base-modal v-model="modalVisible" :title="modalTitle" width="500px" :top="'20vh'" :confirm-loading="confirmLoading"
    @confirm="handleSubmit" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right"
      class="role-form">
      <el-form-item label="成员类型" prop="memberType">
        <el-select v-model="formData.memberType" placeholder="请选择成员类型" style="width: 240px" @change="handleTypeChange">
          <el-option v-for="item in typeOptions" :key="item.dataType" :label="item.dataTypeName"
            :value="item.dataType" />
        </el-select>
      </el-form-item>

      <el-form-item label="成员名称" prop="memberId">
        <!-- 板块下拉选择 -->
        <el-select v-if="formData.memberType === 4" v-model="formData.memberId" placeholder="请选择板块" style="width: 240px"
          @change="handleSegChange">
          <el-option v-for="item in segOptions" :key="item.id" :label="item.segName" :value="item.id" />
        </el-select>

        <!-- 公司级联选择 -->
        <el-cascader v-if="formData.memberType === 3" ref="unitCascaderRef" v-model="formData.memberId"
          :options="unitOptions" :props="unitProps" placeholder="请选择公司" :show-all-levels="false" clearable filterable
          style="width: 240px" @change="handleUnitChange" />

        <!-- 部门级联选择 -->
        <el-cascader v-if="formData.memberType === 2" ref="deptCascaderRef" v-model="formData.memberId"
          :options="deptOptions" :props="deptProps" placeholder="请选择部门" :show-all-levels="false" clearable filterable
          style="width: 240px" @change="handleDeptChange" />

        <!-- 人员级联选择 -->
        <el-cascader v-if="formData.memberType === 0" ref="memberCascaderRef" v-model="formData.memberId"
          :options="treeData" :props="memberProps" placeholder="请选择人员" :show-all-levels="false" clearable filterable
          style="width: 240px" @change="handleMemberChange" />
      </el-form-item>
    </el-form>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElForm, ElMessage, type FormRules } from "element-plus";
import BaseModal from "@/components/base/base-modal.vue";
import type { RoleMemberItem, RoleMemberAdd } from "@/types/system/role-type";
import { roleApi } from "@/api/system/role-api";
import { useRoleStore } from "@/stores/role-store";
import { dictionaryApi } from "@/api/cost/master-data/dictionary-api";
import { manageunitApi } from "@/api/cost/master-data/management-unit-api";

const roleStore = useRoleStore();

interface Props {
  modelValue: boolean;
  roleId: number | string;
  editData?: RoleMemberItem | null;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 级联选择器配置
const unitProps = {
  value: "treeId",
  label: "orgName",
  children: "children",
  checkStrictly: false,
  emitPath: false,
  expandTrigger: 'hover',
  disabled: (node) => {
    // 如果最后节点 dataType 不是 3，则禁用
    const isLeaf = !node.children || node.children.length === 0;
    return isLeaf && node.dataType !== 3;
  }
};

const deptProps = {
  value: "treeId",
  label: "orgName",
  children: "children",
  checkStrictly: false,
  emitPath: false,
  expandTrigger: 'hover',
  disabled: (node) => {
    // 如果最后节点 dataType 不是 2，则禁用
    const isLeaf = !node.children || node.children.length === 0;
    return isLeaf && node.dataType !== 2;
  }
};

const memberProps = {
  value: "treeId",
  label: "orgName",
  children: "children",
  checkStrictly: false,
  emitPath: false,
  expandTrigger: 'hover',
  disabled: (node) => {
    // 如果最后节点 dataType 不是 0，则禁用
    const isLeaf = !node.children || node.children.length === 0;
    return isLeaf && node.dataType !== 0;
  }
};

// Refs
const formRef = ref<InstanceType<typeof ElForm>>();
const confirmLoading = ref(false);
const modalVisible = ref(props.modelValue);

// 数据
const segOptions = ref([]);
const unitOptions = ref([]);
const deptOptions = ref([]);
const treeData = ref([]);

// 表单数据
const formData = ref<RoleMemberAdd>({
  roleId: props.roleId,
  memberName: "",
  memberId: null,
  // 默认为人员 0:人员 1:项目 2:部门 3:公司 4:板块
  memberType: 0,
});

// 表单验证规则
const formRules: FormRules<RoleMemberAdd> = {
  memberType: [{ required: true, message: "请选择成员类型", trigger: "change" }],
  memberId: [{ required: true, message: "请选择", trigger: "blur" }],
};

const typeOptions = computed(() => {
  // console.log(roleStore.dataTypeList);
  // 0:人员 1:项目 2:部门 3:公司 4:板块
  // 过滤掉项目类型
  const list = roleStore.dataTypeList || [];
  return list.filter(item => item.dataType !== 1);
});
const modalTitle = computed(() => props.editData ? "编辑成员" : "新增成员");

// 重置表单
const resetForm = () => {
  Object.assign(formData.value, {
    roleId: props.roleId,
    memberName: "",
    memberId: null,
    memberType: 0,
  });
  formRef.value?.clearValidate();
};

// ========== 各类Change事件（保持独立，逻辑清晰） ==========
const handleTypeChange = (val: number) => {
  formData.value.memberId = null;
  formData.value.memberName = '';
};
// 选择板块
const handleSegChange = (val: number) => {
  if (val) {
    const target = segOptions.value.find(item => item.id === val);
    formData.value.memberName = target?.segName || '';
  } else {
    formData.value.memberName = '';
  }
};
// 选择公司
const handleUnitChange = (val: number) => { };
// 选择部门
const handleDeptChange = (val: number) => { };
// 选择人员
const handleMemberChange = (val: number) => { };

// ========== 工具函数 ==========
// 从树中查找节点
const findNodeInTree = (nodes: any[], targetId: string, idKey: string): any => {
  for (const node of nodes) {
    if (node[idKey] === targetId) return node;
    if (node.children?.length) {
      const found = findNodeInTree(node.children, targetId, idKey);
      if (found) return found;
    }
  }
  return null;
};

// 查找匹配的树节点
const findTreeNodeByMember = (treeData: any[], memberData: any): any => {
  const { memberId, memberType } = memberData;
  // 参数检查
  if (memberId === undefined || memberType === undefined) {
    console.warn("缺少必要的匹配字段");
    return null;
  }
  // 递归查找
  const search = (nodes: any[]): any => {
    for (const node of nodes) {
      // 精确匹配：dataType 和 orgId 都必须相等
      if (node.dataType === memberType && node.orgId === memberId) {
        return node;
      }
      // 深度优先搜索子节点
      if (node.children && node.children.length > 0) {
        const result = search(node.children);
        if (result) return result;
      }
    }
    return null;
  };
  return search(treeData);
};

// ========== 提交 ==========
const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate();
    if (!valid) return;

    confirmLoading.value = true;

    const submitData: any = {
      ...formData.value,
      roleId: props.roleId,
    };

    // 人员类型需要特殊处理：用orgId替换memberId
    if (formData.value.memberType === 0 && formData.value.memberId) {
      const node = findNodeInTree(treeData.value, formData.value.memberId, 'treeId');
      if (node) {
        submitData.memberId = node.orgId;
        submitData.memberName = node.orgName;
      }
    }
    // 部门特殊处理：用orgId替换memberId
    if (formData.value.memberType === 2 && formData.value.memberId) {
      const node = findNodeInTree(deptOptions.value, formData.value.memberId, 'treeId');
      if (node) {
        submitData.memberId = node.orgId;
        submitData.memberName = node.orgName;
      }
    }
    // 公司特殊处理：用orgId替换memberId
    if (formData.value.memberType === 3 && formData.value.memberId) {
      const node = findNodeInTree(unitOptions.value, formData.value.memberId, 'treeId');
      if (node) {
        submitData.memberId = node.orgId;
        submitData.memberName = node.orgName;
      }
    }

    if (props.editData?.id) {
      submitData.id = props.editData.id;
    }
    console.log('参数', submitData);
    const apiMethod = props.editData ? roleApi.editRoleMember : roleApi.addRoleMember;
    const res = await apiMethod(submitData);

    if (res.code === 200) {
      ElMessage.success(props.editData ? "编辑成功" : "新增成功");
      resetForm();
      emit("success");
      modalVisible.value = false;
    }
  } catch (error) {
    console.error("提交失败:", error);
  } finally {
    confirmLoading.value = false;
  }
};

const handleClose = () => {
  resetForm();
  modalVisible.value = false;
};

// 获取板块列表-扁平结构
const getSegOptions = async () => {
  try {
    const res = await dictionaryApi.getsegmentList({ isAuth: false });
    if (res.code === 200) segOptions.value = res.data || [];
  } catch (error) {
    console.error("获取板块列表失败:", error);
  }
};
// 获取公司数据-树形结构
const getUnitList = async () => {
  try {
    const res = await manageunitApi.getManageunitList();
    if (res.code === 200) {
      unitOptions.value = res.data || []
    }
  } catch (error) {
    console.error("获取公司列表失败:", error);
  }
};
// 获取部门数据-树形结构
const getDeptData = async () => {
  try {
    const res = await manageunitApi.getDeptList();
    if (res.code === 200) {
      deptOptions.value = res.data || []
    }
  } catch (error) {
    console.error("获取部门列表失败:", error);
  }
};
// 获取人员树形数据
const getEmpTreeData = async () => {
  const res = await roleApi.getEmpTree({ empName: "", isIncludeLeave: false });
  // console.log("获取人员列表", res);
  if (res.code === 200) {
    treeData.value = res.data || [];
  }
};

const initData = async () => {
  await getSegOptions();
  await getUnitList();
  await getDeptData();
  await getEmpTreeData();
  if (props.editData) {
    let treeId = null
    if (props.editData.memberType === 0) {
      const targetVal = findTreeNodeByMember(treeData.value, props.editData);
      // console.log('人员目标值', targetVal);
      treeId = targetVal?.treeId || null
    }
    if (props.editData.memberType === 2) {
      const targetVal = findTreeNodeByMember(deptOptions.value, props.editData);
      // console.log('部门目标值', targetVal);
      treeId = targetVal?.treeId || null
    }
    if (props.editData.memberType === 3) {
      const targetVal = findTreeNodeByMember(unitOptions.value, props.editData);
      // console.log('公司目标值', targetVal);
      treeId = targetVal?.treeId || null
    }
    Object.assign(formData.value, {
      roleId: props.roleId,
      memberName: props.editData.memberName,
      memberId: treeId || props.editData.memberId,
      memberType: props.editData.memberType,
    });
  }
};

watch(
  () => props.modelValue,
  (val) => {
    modalVisible.value = val;
    if (val) {
      initData()
    };
  }
);

watch(modalVisible, (val) => {
  emit("update:modelValue", val);
});

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
  height: 130px;

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

  :deep(.el-input-number .el-input__wrapper) {
    padding-left: 11px;
    padding-right: 11px;
  }
}
</style>