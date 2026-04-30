<!-- 业态详情 -->
<template>
  <div class="business-detail-page">
    <div class="detail-header">
      <div class="header-title">
        <div class="title-main">业态详情</div>
        <div class="title-sub">录入 1# 的各业态面积指标</div>
      </div>
      <div class="header-actions">
        <div class="building-info">
          <div class="go-back" @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            <span>返回</span>
          </div>
          <div class="building-detail-info">
            <div class="building-name">
              <el-icon><OfficeBuilding /></el-icon>
              <span>1#</span>
            </div>
            <div class="building-floor">
              <el-icon><Grid /></el-icon>
              <span>楼层：</span>
              <span>32层</span>
            </div>
          </div>
        </div>
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          添加业态
        </el-button>
      </div>
    </div>

    <div class="business-cards" v-loading="loading">
      <div class="card-content" v-for="item in listData" :key="item.id">
        <div class="area-info">
          <div class="area-label">{{ item.text }}</div>
          <div class="area-value">{{ item.totalArea }}</div>
        </div>
        <div class="area-detail" v-if="item.aboveArea">
          <span>地上{{ item.aboveArea }}</span>
          <span>/</span>
          <span>地下{{ item.underArea }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Plus, OfficeBuilding, Grid, ArrowLeft } from "@element-plus/icons-vue";

defineOptions({ name: "business-detail" });

// 定义 props
const props = defineProps<{
  projectId?: string | number;
}>();

// 定义 emits
const emit = defineEmits<{
  (e: "back"): void;
}>();

// 数据
const loading = ref(false);
const listData = ref([
  {
    id: 1,
    text: "建筑面积",
    totalArea: "15000 m²",
    aboveArea: 12000,
    underArea: 3000,
  },
  {
    id: 2,
    text: "可售面积",
    totalArea: "8000 m²",
    aboveArea: 6000,
    underArea: 2000,
  },
  {
    id: 3,
    text: "总户数",
    totalArea: 600,
  },
  {
    id: 4,
    text: "电梯数",
    totalArea: 20,
  },
]);

// 返回
const handleBack = () => {
  emit("back");
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // TODO: 调用接口获取业态列表
    await new Promise((resolve) => setTimeout(resolve, 300));
  } catch (error) {
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
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
.business-detail-page {
  height: 100%;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;

  .detail-header {
    flex-shrink: 0;
    margin-bottom: 20px;

    .header-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 20px;
      .title-main {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        margin-right: 12px;
      }

      .title-sub {
        font-size: 14px;
        color: #909399;
      }
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .building-info {
        display: flex;
        align-items: center;
        gap: 20px;

        .go-back {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          color: #606266;
          font-size: 14px;
          padding: 8px 0px;
          border-radius: 6px;
          transition: all 0.3s;

          &:hover {
            background-color: #f5f7fa;
            color: #409eff;
          }
        }

        .building-detail-info {
          display: flex;
          flex-direction: column;
          padding-left: 20px;
          border-left: 1px solid #e4e7ed;

          .building-name,
          .building-floor {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #606266;

            .el-icon {
              color: #909399;
            }
          }
        }
      }
    }
  }

  .business-cards {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    align-content: flex-start;

    .card-content {
      background: #fff;
      border: 1px solid #ebeef5;
      border-radius: 12px;
      padding: 16px;
      box-sizing: border-box;
      transition: all 0.3s;

      .area-info {
        text-align: center;
        margin-bottom: 6px;
        .area-label {
          font-size: 13px;
          color: #909399;
        }
        .area-value {
          font-size: 21px;
          font-weight: 600;
          color: #409eff;
        }
      }
      .area-detail {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #606266;
        background: #f5f7fa;
        padding: 6px 12px;
        border-radius: 8px;

        span:first-child {
          color: #67c23a;
        }

        span:last-child {
          color: #e6a23c;
        }
      }
    }
  }

  // 滚动条样式
  .business-cards::-webkit-scrollbar {
    width: 6px;
  }

  .business-cards::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 3px;
  }

  .business-cards::-webkit-scrollbar-track {
    background-color: #f5f7fa;
  }
}
</style>
