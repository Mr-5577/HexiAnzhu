<template>
  <div class="user-container">
    <el-row :gutter="10">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <user-avatar />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <div class="pull-left">
                  <el-icon><User /></el-icon>
                  <span>用户名称</span>
                </div>
                <div class="pull-right">{{ userData.userName }}</div>
              </li>
              <li class="list-group-item">
                <div class="pull-left">
                  <el-icon><Iphone /></el-icon>
                  <span>手机号码</span>
                </div>
                <div class="pull-right">{{ userData.phonenumber }}</div>
              </li>
              <li class="list-group-item">
                <div class="pull-left">
                  <el-icon><Message /></el-icon>
                  <span>用户邮箱</span>
                </div>
                <div class="pull-right">{{ userData.email }}</div>
              </li>
              <li class="list-group-item">
                <div class="pull-left">
                  <el-icon><OfficeBuilding /></el-icon>
                  <span>所属部门</span>
                </div>
                <div class="pull-right">
                  {{ userData.dept?.deptName }} / {{ postGroup }}
                </div>
              </li>
              <li class="list-group-item">
                <div class="pull-left">
                  <el-icon><UserFilled /></el-icon>
                  <span>所属角色</span>
                </div>
                <div class="pull-right">{{ roleGroup }}</div>
              </li>
              <li class="list-group-item">
                <div class="pull-left">
                  <el-icon><Calendar /></el-icon>
                  <span>创建日期</span>
                </div>
                <div class="pull-right">{{ userData.createTime }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <template #header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="selectedTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <UserInfo :user="userData" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <ResetPwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import UserAvatar from "./user-avatar.vue";
import UserInfo from "./user-info.vue";
import ResetPwd from "./reset-pwd.vue";
import { useUserStore } from "@/stores/user-store";
const userStore = useUserStore();

const userInfo = computed(() => userStore.userInfo);

// 组件name，需要和菜单配置里面的name一致
defineOptions({ name: "user" });

interface UserInfo {
  userName: string;
  nickName: string;
  phonenumber: string;
  email: string;
  sex: string;
  avatar: string;
  createTime: string;
  dept?: {
    deptName: string;
  };
}

const route = useRoute();
const selectedTab = ref<string>("userinfo");

// 静态用户数据
const userData = reactive<UserInfo>({
  userName: "admin",
  nickName: "张三",
  phonenumber: "15888888888",
  email: "admin@example.com",
  sex: "0",
  avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
  createTime: "2023-01-01 12:00:00",
  dept: {
    deptName: "研发部门",
  },
});

const roleGroup = ref<string>("超级管理员");
const postGroup = ref<string>("研发岗位");

onMounted(() => {
  const activeTab = route.params?.activeTab as string;
  if (activeTab) {
    selectedTab.value = activeTab;
  }
});
</script>

<style lang="scss" scoped>
.user-container {
  padding: 20px;
  background-color: #fff;
  .box-card {
  }
  .text-center {
    text-align: center;
    margin-bottom: 20px;
  }
  .list-group {
    padding: 0;
    margin: 0;
    list-style: none;
    &-striped {
      .list-group-item {
        font-size: 14px;
        .pull-left {
          display: flex;
          align-items: center;
        }
      }
    }
    &-item {
      padding: 12px 0;
      border-bottom: 1px solid #ebeef5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &:last-child {
        border-bottom: none;
      }
      .el-icon {
        margin-right: 8px;
        color: #409eff;
      }
      .pull-right {
        color: #606266;
      }
    }
  }

  .clearfix {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    &:before,
    &:after {
      display: table;
      content: "";
    }
    &:after {
      clear: both;
    }
  }
}
</style>
