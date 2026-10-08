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

        <!-- 级联选择（公司/部门/人员） -->
        <el-cascader v-else-if="isCascaderType" ref="cascaderRef" v-model="formData.memberId"
          :options="currentCascaderOptions" :props="currentCascaderProps" :placeholder="currentCascaderPlaceholder"
          :show-all-levels="false" clearable filterable style="width: 240px" @change="handleCascaderChange" />
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

// 成员类型常量
const MEMBER_TYPE = {
  PERSON: 0, // 人员
  PROJECT: 1, // 项目
  DEPT: 2, // 部门
  COMPANY: 3, // 公司
  SEGMENT: 4, // 板块
} as const;

// ========== 级联选择器配置工厂 ==========
// 创建级联选择器配置
const createCascaderProps = (targetType: number) => ({
  value: "treeId",
  label: "orgName",
  children: "children",
  checkStrictly: false,
  emitPath: false,
  expandTrigger: 'hover',
  disabled: (node: any) => {
    // 如果最后节点 dataType 不是目标类型，则禁用
    const isLeaf = !node.children || node.children.length === 0;
    return isLeaf && node.dataType !== targetType;
  }
});

// Refs
const formRef = ref<InstanceType<typeof ElForm>>();
const cascaderRef = ref();
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
  memberType: MEMBER_TYPE.PERSON,
});

// 表单验证规则
const formRules: FormRules<RoleMemberAdd> = {
  memberType: [{ required: true, message: "请选择成员类型", trigger: "change" }],
  memberId: [{ required: true, message: "请选择", trigger: "change" }],
};

const typeOptions = computed(() => {
  // console.log(roleStore.dataTypeList);
  // 0:人员 1:项目 2:部门 3:公司 4:板块
  // 过滤掉项目类型
  const list = roleStore.dataTypeList || [];
  return list.filter(item => item.dataType !== MEMBER_TYPE.PROJECT);
});

const modalTitle = computed(() => props.editData ? "编辑成员" : "新增成员");

// 判断是否为级联选择类型
const isCascaderType = computed(() => {
  const { memberType } = formData.value;
  return [MEMBER_TYPE.COMPANY, MEMBER_TYPE.DEPT, MEMBER_TYPE.PERSON].includes(memberType as 0 | 2 | 3);
});

// 当前级联选择器的选项数据
const currentCascaderOptions = computed(() => {
  const { memberType } = formData.value;
  switch (memberType) {
    case MEMBER_TYPE.COMPANY: return unitOptions.value;
    case MEMBER_TYPE.DEPT: return deptOptions.value;
    case MEMBER_TYPE.PERSON: return treeData.value;
    default: return [];
  }
});

// 当前级联选择器的配置
const currentCascaderProps = computed(() => {
  const { memberType } = formData.value;
  switch (memberType) {
    case MEMBER_TYPE.COMPANY: return createCascaderProps(MEMBER_TYPE.COMPANY);
    case MEMBER_TYPE.DEPT: return createCascaderProps(MEMBER_TYPE.DEPT);
    case MEMBER_TYPE.PERSON: return createCascaderProps(MEMBER_TYPE.PERSON);
    default: return {};
  }
});

// 当前级联选择器的占位符
const currentCascaderPlaceholder = computed(() => {
  const { memberType } = formData.value;
  switch (memberType) {
    case MEMBER_TYPE.COMPANY: return '请选择公司';
    case MEMBER_TYPE.DEPT: return '请选择部门';
    case MEMBER_TYPE.PERSON: return '请选择人员';
    default: return '请选择';
  }
});

// 重置表单
const resetForm = () => {
  Object.assign(formData.value, {
    roleId: props.roleId,
    memberName: "",
    memberId: null,
    memberType: MEMBER_TYPE.PERSON,
  });
  formRef.value?.clearValidate();
};

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
  formRef.value?.validateField('memberId');
};

// 统一的级联选择变更事件
const handleCascaderChange = (val: number) => {
  // 由级联选择器自动处理，如果需要额外逻辑可以在这里添加
};

// ========== 工具函数 ==========
// 从树中查找节点
const findNodeInTree = (nodes: any[], targetId: string | number, idKey: string): any => {
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

// 构建提交数据
const buildSubmitData = (): any => {
  const submitData: any = {
    ...formData.value,
    roleId: props.roleId,
  };

  const { memberType, memberId } = formData.value;

  if (memberId) {
    switch (memberType) {
      case MEMBER_TYPE.PERSON: {
        // 人员类型需要特殊处理：用orgId替换memberId
        const node = findNodeInTree(treeData.value, memberId, 'treeId');
        if (node) {
          submitData.memberId = node.orgId;
          submitData.memberName = node.orgName;
        }
        break;
      }
      case MEMBER_TYPE.DEPT: {
        // 部门特殊处理：用orgId替换memberId
        const node = findNodeInTree(deptOptions.value, memberId, 'treeId');
        if (node) {
          submitData.memberId = node.orgId;
          submitData.memberName = node.orgName;
        }
        break;
      }
      case MEMBER_TYPE.COMPANY: {
        // 公司特殊处理：用orgId替换memberId
        const node = findNodeInTree(unitOptions.value, memberId, 'treeId');
        if (node) {
          submitData.memberId = node.orgId;
          submitData.memberName = node.orgName;
        }
        break;
      }
      // 板块类型不需要特殊处理，memberId 直接使用
    }
  }

  if (props.editData?.id) {
    submitData.id = props.editData.id;
  }

  return submitData;
};

// ========== 提交 ==========
const handleSubmit = async () => {
  // 防重复提交检查
  if (confirmLoading.value) return;

  try {
    const valid = await formRef.value?.validate();
    if (!valid) return;

    confirmLoading.value = true;

    const submitData = buildSubmitData();

    console.log('参数', submitData);
    const apiMethod = props.editData ? roleApi.editRoleMember : roleApi.addRoleMember;
    const res = await apiMethod(submitData);

    if (res.code === 200) {
      ElMessage.success(props.editData ? "编辑成功" : "新增成功");
      resetForm();
      emit("success");
      modalVisible.value = false;
    }
  } catch (error: any) {
    console.error("提交失败:", error);
  } finally {
    confirmLoading.value = false;
  }
};

const handleClose = () => {
  resetForm();
  modalVisible.value = false;
};

// ========== 数据获取 ==========
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
      unitOptions.value = res.data || [];
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
      deptOptions.value = res.data || [];
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

// 初始化编辑数据
const initEditData = () => {
  if (!props.editData) return;

  let treeId = null;
  const { memberType, memberId } = props.editData;

  switch (memberType) {
    case MEMBER_TYPE.PERSON: {
      const targetVal = findTreeNodeByMember(treeData.value, props.editData);
      // console.log('人员目标值', targetVal);
      treeId = targetVal?.treeId || null;
      break;
    }
    case MEMBER_TYPE.DEPT: {
      const targetVal = findTreeNodeByMember(deptOptions.value, props.editData);
      // console.log('部门目标值', targetVal);
      treeId = targetVal?.treeId || null;
      break;
    }
    case MEMBER_TYPE.COMPANY: {
      const targetVal = findTreeNodeByMember(unitOptions.value, props.editData);
      // console.log('公司目标值', targetVal);
      treeId = targetVal?.treeId || null;
      break;
    }
  }

  Object.assign(formData.value, {
    roleId: props.roleId,
    memberName: props.editData.memberName,
    memberId: treeId || memberId,
    memberType: props.editData.memberType,
  });
};

let isInitializing = false;

const initData = async () => {
  await Promise.all([
    getSegOptions(),
    getUnitList(),
    getDeptData(),
    getEmpTreeData(),
  ]);
  initEditData();
};

watch(
  () => props.modelValue,
  async (val) => {
    modalVisible.value = val;
    if (val && !isInitializing) {
      isInitializing = true;
      try {
        await initData();
      } finally {
        isInitializing = false;
      }
    }
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