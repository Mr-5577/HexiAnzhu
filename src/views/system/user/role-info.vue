<template>
    <div class="role-display">
        <div class="role-tags">
            <el-tag v-for="role in userRoles" :key="role.id" size="default" effect="plain" class="role-tag"
                :style="{ color: getColor(role), borderColor: getColor(role), backgroundColor: getColor(role) + '15' }">
                {{ role.roleName }}
            </el-tag>
            <span v-if="!userRoles.length" class="no-role">暂无角色</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from "@/stores/user-store";
import { userApi } from '@/api/system/user-api';

const userStore = useUserStore();

const userRoles = computed(() => userStore.roleList);

const colors = [
  '#6B7B8D', // 灰蓝
  '#7F8C8D', // 灰绿
  '#6C8B8B', // 灰青
  '#9A8B7A', // 灰棕
];

const getColor = (role: any) => {
    if (role.isSuper) return '#F56C6C';
    return colors[role.id % colors.length];
};
// 后期角色列表
// const getRoleList = async () => {
//     try {
//         const res = await userApi.getMyRoleList();
//         if (res.code === 200) {
//             console.log(res.data,'用户角色');
//         }
//     } catch (error) {

//     }
// };

onMounted(() => {
});
</script>

<style scoped>
.role-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 16px 0;
}

.role-tag {
    cursor: default;
}

.no-role {
    color: #999;
    font-size: 14px;
}
</style>