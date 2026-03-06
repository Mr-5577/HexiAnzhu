<template>
  <div class="data-permissions-page">
    <el-radio-group v-model="category" size="small">
      <el-radio-button label="组织权限" value="1" />
      <el-radio-button label="项目权限" value="2" />
      <el-radio-button label="专业权限" value="3" />
      <el-radio-button label="人员权限" value="4" />
    </el-radio-group>
    <!-- 组织权限 -->
    <department-permissions
      v-if="category === '1'"
      :roleId="props?.roleId"
    ></department-permissions>
    <!-- 项目权限 -->
    <project-permissions
      v-if="category === '2'"
      :roleId="props?.roleId"
    ></project-permissions>
    <!-- 专业权限 -->
    <major-permissions
      v-if="category === '3'"
      :roleId="props?.roleId"
      :isSuper="props?.isSuper"
    ></major-permissions>
    <!-- 人员权限 -->
    <personnel-permissions
      v-if="category === '4'"
      :roleId="props?.roleId"
      :isSuper="props?.isSuper"
    ></personnel-permissions>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import ProjectPermissions from "./components/project-permissions.vue";
import DepartmentPermissions from "./components/department-permissions.vue";
import MajorPermissions from "./components/major-permissions.vue";
import PersonnelPermissions from "./components/personnel-permissions.vue";

const category = ref("1");

interface Props {
  roleId?: number | null;
  isSuper?: boolean | null;
}

const props = withDefaults(defineProps<Props>(), {
  roleId: null,
  isSuper: null,
});

// 生命周期
onMounted(() => {});
// 清理
onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.data-permissions-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>
