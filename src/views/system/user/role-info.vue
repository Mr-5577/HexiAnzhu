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
import { userApi } from '@/api/system/user-api';
import { onMounted, ref } from 'vue';

const userRoles = ref([]);

const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#9B59B6', '#1ABC9C', '#3498DB'];

const getColor = (role: any) => {
    if (role.isSuper) return '#F56C6C';
    return colors[role.id % colors.length];
};

const getRoleList = async () => {
    try {
        const res = await userApi.getMyRoleList();
        if (res.code === 200) {
            userRoles.value = res.data || [];
        }
    } catch (error) {

    }
};

onMounted(() => {
    getRoleList();
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