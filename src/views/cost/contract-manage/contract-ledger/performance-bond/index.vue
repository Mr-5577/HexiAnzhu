<template>
  <div class="performance-bond-page">
    <div class="detail-tab">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="保证金缴纳" name="pay" style="height: 100%">
          <bond-pay :con-id="props.conId" />
        </el-tab-pane>
        <el-tab-pane label="保证金退还" name="refund" style="height: 100%">
          <bond-refund :con-id="props.conId" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BondPay from "./bond-pay/index.vue";
import BondRefund from "./bond-refund/index.vue";

const props = defineProps<{
  conId: number | null;
}>();

defineOptions({ name: "performance-bond" });

const activeTab = ref("pay");

onMounted(() => {});
</script>

<style lang="scss" scoped>
.performance-bond-page {
  width: 100%;
  height: 100%;
  display: flex;
  background: #fff;

  .detail-tab {
    flex: 1;
    padding: 0 15px 10px;
    box-sizing: border-box;
    overflow: hidden;
    :deep(.el-tabs) {
      height: 100%;
      display: flex;
      flex-direction: column;
      .el-tabs__header {
        margin: 0 0 16px 0;
        .el-tabs__active-bar {
          background-color: #409eff;
        }

        .el-tabs__item {
          font-size: 14px;

          &:hover {
            color: #409eff;
          }

          &.is-active {
            color: #409eff;
          }
        }
      }

      .el-tabs__content {
        flex: 1;
        overflow: hidden;
      }
    }
  }
}
</style>
