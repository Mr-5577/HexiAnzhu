<!-- 楼栋指标管理 -->
<template>
  <div class="building-metrics-page">
    <template v-if="currentView === 'list'">
      <div class="header-section">
        <div class="header-title">
          <span class="title">楼栋指标管理</span>
          <span class="subtitle">维护楼栋基础信息，录入各业态面积指标</span>
        </div>
        <div class="header-actions">
          <span class="building-count">共 {{ buildingCount }} 栋楼</span>
          <el-button type="primary" class="add-btn">
            <el-icon><Plus /></el-icon>
            新增楼栋
          </el-button>
        </div>
      </div>
      <div class="cards-container" v-loading="loading">
        <div class="building-card" v-for="item in listData" :key="item.id">
          <div class="card-header">
            <div class="building-name">
              <el-icon><OfficeBuilding /></el-icon>
              <span>{{ item.name }}</span>
            </div>
            <el-checkbox
              v-model="item.isBasement"
              label="地下室"
              true-value="Y"
              false-value="N"
            />
          </div>
          <div class="card-body">
            <div class="info-item">
              <el-icon><Grid /></el-icon>
              <span class="label">楼层：</span>
              <span class="value">{{ item.floorDesc }}</span>
            </div>
            <div class="info-item">
              <el-icon><Tickets /></el-icon>
              <span class="label">业态数量：</span>
              <span class="value">{{ item.businessCount }}个</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              type="primary"
              round
              size="small"
              @click="handleViewDetail(item)"
              style="width: 120px"
            >
              业态详情
            </el-button>
            <div class="card-actions">
              <el-button link type="primary" @click="handleEdit(item)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button link type="danger" @click="handleDelete(item)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- 业态详情 -->
    <business-detail v-else @back="currentView = 'list'" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  OfficeBuilding,
  Grid,
  Tickets,
  Edit,
  Delete,
} from "@element-plus/icons-vue";
import BusinessDetail from "./business-detail.vue";

defineOptions({ name: "building-metrics" });

// 定义 props
const props = defineProps<{
  projectId?: string | number;
}>();

// 类型定义
interface BuildingItem {
  id: number;
  name: string;
  floorCount: number;
  floorDesc: string;
  businessCount: number;
  isBasement: "Y" | "N";
}

// 数据
const loading = ref(false);
const listData = ref<BuildingItem[]>([]);
const currentView = ref<"list" | "detail">("list");

// 楼栋数量
const buildingCount = computed(() => listData.value.length);

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // TODO: 调用接口获取楼栋列表
    // const res = await getBuildingList({ projectId: props.projectId });
    // listData.value = res.data;

    // 模拟数据
    await new Promise((resolve) => setTimeout(resolve, 500));
    listData.value = [
      {
        id: 1,
        name: "1#",
        floorCount: 32,
        floorDesc: "32层",
        businessCount: 2,
        isBasement: "N",
      },
      {
        id: 2,
        name: "2#",
        floorCount: 18,
        floorDesc: "18层",
        businessCount: 1,
        isBasement: "N",
      },
      {
        id: 3,
        name: "地下室",
        floorCount: 2,
        floorDesc: "2层（地下）",
        businessCount: 2,
        isBasement: "Y",
      },
    ];
  } catch (error) {
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
};

// 查看业态详情
const handleViewDetail = (item: BuildingItem) => {
  ElMessage.info(`查看 ${item.name} 业态详情`);
  currentView.value = "detail";
};

// 编辑楼栋
const handleEdit = (item: BuildingItem) => {
  ElMessage.info(`编辑楼栋：${item.name}`);
};

// 删除楼栋
const handleDelete = (item: BuildingItem) => {
  ElMessageBox.confirm(`确定删除楼栋"${item.name}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        // TODO: 调用删除接口
        ElMessage.success("删除成功");
        await loadData();
      } catch (error) {
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {});
};

onMounted(() => {
  loadData();
});

// 暴露方法给父组件
defineExpose({
  refresh: loadData,
});
</script>

<style lang="scss" scoped>
.building-metrics-page {
  height: 100%;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid #e6e6e6;

  .header-section {
    margin-bottom: 10px;
    flex-shrink: 0; // 防止 header 被压缩
    .header-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 20px;
      .title {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }

      .subtitle {
        font-size: 14px;
        color: #909399;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;

      .building-count {
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .cards-container {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    overflow-y: auto;
    gap: 15px;

    .building-card {
      height: 190px;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      padding: 20px;
      background: #fff;
      display: flex;
      flex-direction: column;
      gap: 15px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .building-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 600;
          color: #303133;

          .el-icon {
            font-size: 20px;
            color: #67c23a;
          }
        }
      }

      .card-body {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;

          .el-icon {
            color: #909399;
            font-size: 16px;
          }

          .label {
            color: #606266;
          }

          .value {
            color: #303133;
            font-weight: 500;
          }
        }
      }

      .card-footer {
        margin-top: auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 40px;
        .card-actions {
          display: flex;
          gap: 12px;
        }
      }
    }
  }
}
</style>
