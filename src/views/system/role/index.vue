<template>
  <div class="role-management">
    <!-- 顶部搜索区域 -->
    <div class="search-card">
      <div class="search-form">
        <el-form :inline="true" :model="searchForm">
          <el-form-item>
            <el-input
              v-model="searchForm.roleName"
              placeholder="搜索角色名称"
              clearable
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="searchForm.isIncludeDisable">
              包含停用
            </el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :icon="Search"
              class="action-btn"
              @click="handleSearch"
            >
              搜索
            </el-button>
            <el-button
              :icon="Refresh"
              class="secondary-btn"
              @click="handleReset"
            >
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="content-section">
      <!-- 左侧角色列表 -->
      <div class="list-card">
        <div class="card-header">
          <span class="card-title">角色列表</span>
          <el-button :icon="Plus" type="primary" @click="handleAddRole">
            新增
          </el-button>
        </div>
        <el-empty description="暂无角色数据" v-if="roleList.length == 0" />
        <div class="role-content" v-else>
          <div
            v-for="role in roleList"
            :key="role.id"
            :class="['role-item', { active: activeRole?.id === role.id }]"
            @click="handleSelectRole(role)"
          >
            <div class="role-avatar">
              <el-icon><Avatar /></el-icon>
            </div>
            <div class="role-info">
              <div class="role-desc">
                <div class="role-name">{{ role.roleName }}</div>
                <div
                  class="role-status"
                  :class="{
                    enable: role.isEnable,
                  }"
                >
                  {{ role.isEnable ? "已启用" : "已停用" }}
                </div>
              </div>
              <div class="role-desc">
                {{ role.roleDesc || "暂无描述" }}
              </div>
            </div>

            <div class="role-operate" v-if="!role.isInner">
              <el-icon class="edit-btn" @click.stop="handleEditRole(role)">
                <Edit />
              </el-icon>
              <el-icon class="delete-btn" @click.stop="handleDeleteRole(role)">
                <Delete />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧角色详情 -->
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">角色详情</span>
        </div>
        <el-empty description="暂无角色详情" v-if="!activeRole" />
        <template v-else>
          <!-- 基础信息 -->
          <div class="basic-info">
            <div class="form-section">
              <div class="form-row">
                <div class="form-group">
                  <div class="form-label">角色名称：</div>
                  <div class="form-value">{{ roleForm.roleName || "-" }}</div>
                </div>
                <div class="form-group role-center">
                  <div class="form-label">角色序号：</div>
                  <div class="form-value">{{ roleForm.sort || "-" }}</div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group role-center">
                  <div class="form-label">是否超管：</div>
                  <el-tag
                    :type="roleForm.isSuper ? 'primary' : 'info'"
                    size="small"
                  >
                    {{ roleForm.isSuper ? "是" : "否" }}
                  </el-tag>
                </div>
                <div class="form-group role-center">
                  <div class="form-label">角色状态：</div>
                  <el-tag
                    :type="roleForm.isEnable ? 'success' : 'info'"
                    size="small"
                  >
                    {{ roleForm.isEnable ? "启用" : "停用" }}
                  </el-tag>
                </div>
              </div>
              <div class="form-group">
                <div class="form-label">角色说明：</div>
                <div class="form-value">
                  {{ roleForm.roleDesc || "暂无说明" }}
                </div>
              </div>
            </div>
          </div>
          <!-- 权限信息 -->
          <div class="permission-info">
            <el-tabs
              v-model="activeTab"
              class="demo-tabs"
              @tab-click="handleClick"
            >
              <el-tab-pane label="成员设置" name="first"> </el-tab-pane>
              <el-tab-pane label="菜单权限" name="second"></el-tab-pane>
              <el-tab-pane label="数据权限" name="third"> </el-tab-pane>
            </el-tabs>
            <!-- 成员设置 -->
            <member-setting
              v-if="activeTab === 'first'"
              :roleId="activeRole?.id"
            />
            <!-- 菜单权限 -->
            <menu-permissions
              v-if="activeTab === 'second'"
              :roleId="activeRole?.id"
            />
            <!-- 数据权限 -->
            <data-permissions
              v-if="activeTab === 'third'"
              :roleId="activeRole?.id"
              :isSuper="activeRole?.isSuper"
            ></data-permissions>
          </div>
        </template>
      </div>
    </div>
    <!-- 新增/编辑角色 -->
    <add-edit-role
      v-model="modalVisible"
      :edit-data="currentData"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import MemberSetting from "./member-setting.vue";
import MenuPermissions from "./menu-permissions.vue";
import DataPermissions from "./data-permissions.vue";
import { ref, reactive, onMounted } from "vue";
import AddEditRole from "./components/add-edit-role.vue";
import { roleApi } from "@/api/role-api";
import { RoleItem, RoleSearchForm } from "@/types/role-type";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Delete, Edit, Search, Refresh } from "@element-plus/icons-vue";

// 组件name，需要和菜单配置里面的name一致
defineOptions({
  name: "role",
});

// 搜索表单
const searchForm = ref<RoleSearchForm>({
  roleName: "",
  isIncludeDisable: false,
});

// 角色列表数据
const roleList = ref<RoleItem[]>([]);

// 当前选中的角色
const activeRole = ref<RoleItem | null>(null);
const roleForm = reactive({
  roleName: "",
  sort: 0,
  roleDesc: "",
  isSuper: false,
  isEnable: true,
});

// 新增编辑弹窗
const modalVisible = ref(false);
const currentData = ref<RoleItem | null>(null);
const handleSuccess = () => {
  getRoleList(); // 重新获取列表
};

// 获取角色列表
const getRoleList = async () => {
  try {
    const res = await roleApi.getRoleList(searchForm.value);
    console.log("角色列表数据", res);

    if (res.code === 200) {
      const data = res.data || [];
      roleList.value = data;

      if (data.length === 0) {
        // 没有数据：清空选中状态
        activeRole.value = null;
        return;
      }

      // 获取当前选中的角色ID
      const currentRoleId = activeRole.value?.id;

      // 查找当前选中角色是否在新数据中
      let roleToSelect = null;

      if (currentRoleId) {
        roleToSelect = data.find((item: RoleItem) => item.id === currentRoleId);
      }

      // 如果没有找到当前选中的角色，或者当前没有选中任何角色，选择第一个
      if (!roleToSelect) {
        roleToSelect = data[0];
      }

      // 选中角色
      handleSelectRole(roleToSelect);
    }
  } catch (error) {
    console.error("获取角色列表失败:", error);
  }
};

// 搜索逻辑
const handleSearch = () => {
  getRoleList();
};

const handleReset = () => {
  searchForm.value = {
    roleName: "",
    isIncludeDisable: false,
  };
  getRoleList();
};

const handleSelectRole = (role: RoleItem) => {
  activeRole.value = role;

  // 明确更新每个字段
  roleForm.roleName = role.roleName;
  roleForm.sort = role.sort;
  roleForm.roleDesc = role.roleDesc || "";
  roleForm.isSuper = role.isSuper || false;
  roleForm.isEnable = role.isEnable !== undefined ? role.isEnable : true;
};

// 新增角色逻辑
const handleAddRole = () => {
  currentData.value = null;
  modalVisible.value = true;
};

// 编辑角色逻辑
const handleEditRole = (role: RoleItem) => {
  currentData.value = role;
  modalVisible.value = true;
};

// 删除角色
const handleDeleteRole = async (role: RoleItem) => {
  try {
    ElMessageBox.confirm("确定删除选中的角色吗?", "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(async () => {
        const response = await roleApi.delRole({ id: role.id });
        if (response.code === 200) {
          ElMessage.success("删除成功");
          getRoleList();
        }
      })
      .catch(() => {});
  } catch (error) {
    console.error("删除失败:", error);
  }
};

const activeTab = ref("first");
const handleClick = (tab: any, event: Event) => {};

onMounted(() => {
  getRoleList();
});
</script>

<style lang="scss" scoped>
.role-management {
  height: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%);
  flex: 1;
  min-height: 0;
  .search-card {
    margin-bottom: 6px;
    background: white;
    border-radius: 12px;
    padding: 15px 15px 0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
    .search-form {
      .search-input {
        width: 280px;

        :deep(.el-input__wrapper) {
          border-radius: 8px;
          border: 1px solid #e1e8ed;
        }
      }
    }
  }

  .content-section {
    flex: 1;
    display: flex;
    flex-wrap: nowrap;
    gap: 6px;
    min-height: 0;
    flex-shrink: 0;
    .list-card {
      width: 360px;
      background: white;
      border-radius: 12px;
      padding: 15px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      display: flex; // 新增
      flex-direction: column; // 新增
      min-height: 0;
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
        margin-bottom: 10px;
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }
      }

      .role-content {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding-top: 2px;
        box-sizing: border-box;
        /* 自定义滚动条样式 */
        &::-webkit-scrollbar {
          width: 6px;
        }
        &::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        &::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;

          &:hover {
            background: #94a3b8;
          }
        }

        .role-item {
          display: flex;
          align-items: center;
          padding: 10px;
          border: 1px solid #e8ebed;
          border-radius: 10px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafbfc;
          &:hover {
            border-color: #3b82f6;
            background: white;
            box-shadow: 0 4px 12px rgba(74, 222, 128, 0.15);
            transform: translateY(-2px);
          }

          &.active {
            border-color: #3b82f6;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
          }

          .role-avatar {
            width: 30px;
            height: 30px;
            border-radius: 10px;
            background: linear-gradient(135deg, #99a7e9 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;

            .el-icon {
              font-size: 16px;
              color: white;
            }
          }

          .role-info {
            flex: 1;
            min-width: 0;
            margin-right: 8px;
            .role-desc {
              display: flex;
              flex-wrap: nowrap;
              .role-name {
                font-weight: 600;
                color: #2c3e50;
                font-size: 14px;
                max-width: 130px;
                /* 添加以下属性实现省略号效果 */
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .role-status {
                flex-shrink: 0;
                margin-right: 12px;
                font-size: 11px;
                font-weight: 500;
                padding: 0 6px 2px;
                border-radius: 4px;
                margin-left: 8px;
                &.enable {
                  color: #059669;
                  background: #ecfdf5;
                  border: 1px solid #cdedde;
                }

                &:not(.enable) {
                  color: #8f959e;
                  background: #f7f8fa;
                  border: 1px solid #e5e6eb;
                }
              }
            }

            .role-desc {
              margin-top: 2px;
              font-size: 12px;
              color: #64748b;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }

          .role-operate {
            flex-shrink: 0;
            display: flex;
            gap: 8px;
            .edit-btn,
            .delete-btn {
              width: 24px;
              height: 24px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              .el-icon {
                font-size: 14px;
              }
            }

            .edit-btn {
              color: #3b82f6;
              background-color: #d9e3f3;
            }

            .delete-btn {
              color: #ef4444;
              background-color: #ebe8e8;
            }
          }
        }
      }
    }

    .detail-card {
      flex: 1;
      min-width: 0;
      background: white;
      border-radius: 12px;
      padding: 15px;
      box-sizing: border-box;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      min-height: 0;
      display: flex;
      flex-direction: column;
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
        border-bottom: 1px solid #f1f5f9;
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }
      }
      .basic-info {
        .form-section {
          .form-row {
            display: flex;
            gap: 20px;
            .form-group {
              flex: 1;
            }
          }

          .form-group {
            margin-bottom: 8px;
            display: flex;
            // align-items: center;
            .form-label {
              width: 70px;
              min-width: 70px;
            }
            .form-label,
            .form-value {
              display: block;
              font-weight: 500;
              color: #475569;
              font-size: 14px;
            }
          }
          .role-center {
            display: flex;
            align-items: center;
          }
        }
      }
      .permission-info {
        display: flex;
        flex-direction: column;
        width: 100%;
        flex: 1;
        min-height: 0;
      }
    }
  }
}

.secondary-btn {
  border: 1px solid #e2e8f0;
  color: #64748b;
  //   &:hover {
  //     border-color: #cbd5e1;
  //     background: #f8fafc;
  //   }
}
</style>
