<template>
    <div class="role-display">
        <div class="role-label">
            <!-- <span class="label">我的角色</span> -->
            <div class="role-tags">
                <el-tag v-for="role in userRoles" :key="role.id" :type="roleTagType(role)" size="default" effect="plain"
                    class="role-tag">
                    {{ role.roleName }}
                </el-tag>
                <span v-if="!userRoles.length" class="no-role">暂无角色</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const userRoles = ref([
    { id: 1, roleName: '系统管理员', level: 'admin' },
    { id: 2, roleName: '项目经理', level: 'manager' },
    { id: 3, roleName: '财务人员', level: 'finance' },
]);

// 根据角色级别或类型返回不同的标签颜色
const roleTagType = (role: any) => {
    const typeMap = {
        admin: 'danger',      // 红色
        manager: 'warning',   // 橙色
        finance: 'success',   // 绿色
        member: 'primary',    // 蓝色
        guest: 'info',        // 灰色
    };
    return typeMap[role.level] || 'primary';
};
</script>

<style scoped>
.role-display {
    padding: 16px 0;
}

.role-label {
    display: flex;
    align-items: center;
    gap: 12px;
}

.label {
    font-weight: 500;
    color: #333;
    white-space: nowrap;
    min-width: 70px;
}

.role-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.role-tag {
    cursor: default;
    font-weight: 500;
}

.no-role {
    color: #999;
    font-size: 14px;
}

/* 可选：根据角色类型添加图标 */
.role-tag[data-level="admin"]::before {
    content: '⭐ ';
}

.role-tag[data-level="manager"]::before {
    content: '👔 ';
}
</style>